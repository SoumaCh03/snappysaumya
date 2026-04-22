const express = require("express");
const router = express.Router();

const Album = require("../models/Album");
const Image = require("../models/Image");
const protect = require("../middleware/authMiddleware");

/* ================= GET ALL ================= */

router.get("/", async (req, res) => {
  try {
    const albums = await Album.find().sort({ order: 1 });
    res.json(albums);
  } catch (err) {
    console.error("Fetch albums error:", err);
    res.status(500).json({ message: "Failed to fetch albums" });
  }
});

/* ================= CREATE ================= */

router.post("/", protect, async (req, res) => {
  try {
    const { title, slug } = req.body;

    if (!title || !slug) {
      return res.status(400).json({ message: "Title & slug required" });
    }

    const exists = await Album.findOne({ slug });
    if (exists) {
      return res.status(400).json({ message: "Slug already exists" });
    }

    const album = await Album.create({
      title,
      slug,
      order: 0,
      cover: "",
    });

    res.json(album);
  } catch (err) {
    console.error("Create album error:", err);
    res.status(500).json({ message: "Create failed" });
  }
});

/* ================= 🔥 REORDER (MUST BE ABOVE :id) ================= */

router.put("/reorder", protect, async (req, res) => {
  try {
    const { order } = req.body;

    if (!order || !Array.isArray(order)) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    await Promise.all(
      order.map((item) =>
        Album.findByIdAndUpdate(item.id, { order: item.order })
      )
    );

    res.json({ message: "Albums reordered successfully" });
  } catch (err) {
    console.error("❌ Reorder error:", err);
    res.status(500).json({ message: "Reorder failed" });
  }
});

/* ================= UPDATE ================= */

router.put("/:id", protect, async (req, res) => {
  try {
    const { title, slug, cover } = req.body;

    const album = await Album.findById(req.params.id);

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    if (slug && slug !== album.slug) {
      const exists = await Album.findOne({ slug });
      if (exists) {
        return res.status(400).json({ message: "Slug already exists" });
      }
    }

    album.title = title || album.title;
    album.slug = slug || album.slug;
    album.cover = cover || album.cover;

    const updated = await album.save();

    res.json(updated);
  } catch (err) {
    console.error("Update album error:", err);
    res.status(500).json({ message: "Update failed" });
  }
});

/* ================= DELETE ================= */

router.delete("/:id", protect, async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    const images = await Image.find({ album: album.slug });

    if (images.length > 0) {
      return res.status(400).json({
        message: "Cannot delete album with images. Delete images first.",
      });
    }

    await album.deleteOne();

    res.json({ message: "Album deleted successfully" });
  } catch (err) {
    console.error("Delete album error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;