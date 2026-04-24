const express = require("express");
const router = express.Router();

const upload = require("../middleware/multer");
const cloudinary = require("../utils/cloudinary");
const Image = require("../models/Image");
const Album = require("../models/Album");
const protect = require("../middleware/authMiddleware");

/* ================= TAG SYSTEM ================= */

const getTags = (name = "") => {
  const lower = name.toLowerCase();

  if (lower.includes("land")) return ["landscape", "nature"];
  if (lower.includes("journey")) return ["travel", "road"];
  if (lower.includes("portrait")) return ["portrait", "people"];

  return ["general"];
};

/* ================= CLOUDINARY HELPERS ================= */

const getImages = async (folder) => {
  try {
    const result = await cloudinary.search
      .expression(`folder:snappysaumya/${folder}`)
      .sort_by("created_at", "desc")
      .max_results(100)
      .execute();

    return result.resources.map((img) => ({
      url: img.secure_url,
      public_id: img.public_id,
      tags: getTags(img.public_id),
    }));
  } catch (err) {
    console.error("❌ Cloudinary getImages error:", err);
    return [];
  }
};

const getCover = async (folder) => {
  try {
    const images = await getImages(folder);
    return images.length ? images[0].url : null;
  } catch (err) {
    console.error("❌ getCover error:", err);
    return null;
  }
};

/* ================= ROUTES ================= */

// 📦 GET ALL ALBUMS (FROM DB)
router.get("/", async (req, res) => {
  try {
    const albums = await Album.find().sort({ order: 1 });

    const data = await Promise.all(
      albums.map(async (album) => ({
        id: album.slug,
        title: album.title,
        cover: await getCover(album.slug),
      }))
    );

    res.json(data);
  } catch (err) {
    console.error("❌ Gallery error:", err);
    res.status(500).json({ error: "Failed to fetch gallery" });
  }
});

// 📂 GET SINGLE ALBUM
router.get("/:slug", async (req, res) => {
  try {
    const album = await Album.findOne({ slug: req.params.slug });

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    const images = await getImages(album.slug);

    const urls = images.map((img) => img.url);
    const dbImages = await Image.find({ url: { $in: urls } });

    const likesMap = {};
    dbImages.forEach((img) => {
      likesMap[img.url] = img.likes;
    });

    const imagesWithLikes = images.map((img) => ({
      ...img,
      likes: likesMap[img.url] || 0,
    }));

    const cover = await getCover(album.slug);

    res.json({
      id: album.slug,
      title: album.title,
      cover,
      images: imagesWithLikes,
    });
  } catch (err) {
    console.error("❌ Album error:", err);
    res.status(500).json({ error: "Failed to fetch album" });
  }
});

/* ================= UPLOAD ================= */

router.post("/upload/:album", protect, (req, res) => {
  upload.single("image")(req, res, async (err) => {
    try {
      // 🔥 HANDLE MULTER / CLOUDINARY ERRORS
      if (err) {
        console.error("❌ Multer error:", err);

        if (err.message?.includes("File size too large")) {
          return res.status(400).json({
            message: "Image too large. Max allowed ~10MB",
          });
        }

        return res.status(500).json({
          message: err.message || "Upload failed",
        });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const imageUrl = req.file.path;

      const newImage = await Image.create({
        title: req.file.filename || "Untitled",
        url: imageUrl,
        album: req.params.album,
      });

      res.json({
        message: "Upload successful",
        image: newImage,
      });

    } catch (error) {
      console.error("🔥 Upload crash:", error);
      res.status(500).json({
        message: "Upload failed",
        error: error.message,
      });
    }
  });
});

/* ================= DELETE ================= */

router.delete("/delete", protect, async (req, res) => {
  try {
    console.log("🔥 NEW DELETE ROUTE HIT");

    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: "URL required" });
    }

    // ✅ Extract correct public_id from Cloudinary URL
    const parts = url.split("/");
    const uploadIndex = parts.findIndex((p) => p === "upload");

    const publicIdWithVersion = parts.slice(uploadIndex + 1).join("/");

    const publicId = publicIdWithVersion
      .replace(/^v\d+\//, "")
      .replace(/\.[^/.]+$/, "");

    console.log("🧠 Extracted public_id:", publicId);

    // ✅ Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("☁️ Cloudinary delete result:", result);

    // ✅ Delete from DB
    await Image.findOneAndDelete({ url });

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});



/* ================= LIKE ================= */

router.post("/like", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL required" });
    }

    let image = await Image.findOne({ url });

    if (!image) {
      image = await Image.create({
        title: "Untitled",
        url,
        album: "unknown",
      });
    }

    image.likes += 1;
    await image.save();

    res.json({ likes: image.likes });
  } catch (error) {
    console.error("❌ Like error:", error);
    res.status(500).json({ error: "Failed to like image" });
  }
});

module.exports = router;