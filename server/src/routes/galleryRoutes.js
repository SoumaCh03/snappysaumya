const express = require("express");
const router = express.Router();

const upload = require("../middleware/multer");
const cloudinary = require("../utils/cloudinary");
const Image = require("../models/Image"); // 🔥 NEW

/* ================= TAG SYSTEM ================= */

const getTags = (name) => {
  const lower = name.toLowerCase();

  if (lower.includes("land")) return ["landscape", "nature"];
  if (lower.includes("journey")) return ["travel", "road"];
  if (lower.includes("portrait")) return ["portrait", "people"];

  return ["general"];
};

/* ================= ALBUM CONFIG ================= */

const albums = [
  { id: "landscapes", title: "Landscapes" },
  { id: "journeys", title: "Journeys" },
  { id: "portraits", title: "Portraits" },
];

/* ================= CLOUDINARY HELPERS ================= */

// 📂 Fetch images from Cloudinary folder
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

// 🖼️ Get album cover (latest image)
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

// 📦 GET ALL ALBUMS
router.get("/", async (req, res) => {
  try {
    const data = await Promise.all(
      albums.map(async (album) => ({
        id: album.id,
        title: album.title,
        cover: await getCover(album.id),
      }))
    );

    res.json(data);
  } catch (err) {
    console.error("❌ Gallery error:", err);
    res.status(500).json({ error: "Failed to fetch gallery" });
  }
});

// 📂 GET SINGLE ALBUM
router.get("/:id", async (req, res) => {
  try {
    const album = albums.find((a) => a.id === req.params.id);

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    const images = await getImages(album.id);

    // 🔥 Attach likes from DB
    const imagesWithLikes = await Promise.all(
      images.map(async (img) => {
        const dbImage = await Image.findOne({ url: img.url });

        return {
          ...img,
          likes: dbImage ? dbImage.likes : 0,
        };
      })
    );

    const cover = await getCover(album.id);

    res.json({
      id: album.id,
      title: album.title,
      cover,
      images: imagesWithLikes,
    });
  } catch (err) {
    console.error("❌ Album error:", err);
    res.status(500).json({ error: "Failed to fetch album" });
  }
});

/* ================= 🔥 UPLOAD ================= */

router.post("/upload/:album", upload.single("image"), async (req, res) => {
  try {
    const imageUrl = req.file.path;

    // 🔥 Save to DB
    const newImage = await Image.create({
      title: req.file.filename,
      url: imageUrl,
      album: req.params.album,
    });

    res.status(200).json({
      message: "Image uploaded & saved to DB",
      image: newImage,
    });
  } catch (error) {
    res.status(500).json({
      message: "Upload failed",
      error: error.message,
    });
  }
});

/* ================= ❤️ LIKE SYSTEM (DB BASED) ================= */

// 🔥 LIKE IMAGE
router.post("/like", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "Image URL required" });
    }

    let image = await Image.findOne({ url });

    // If image not in DB yet → create it
    if (!image) {
      image = await Image.create({
        title: "Untitled",
        url,
        album: "unknown",
      });
    }

    image.likes += 1;
    await image.save();

    res.json({
      likes: image.likes,
    });
  } catch (error) {
    console.error("❌ Like error:", error);
    res.status(500).json({ error: "Failed to like image" });
  }
});

module.exports = router;