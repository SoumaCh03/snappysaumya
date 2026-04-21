const express = require("express");
const router = express.Router();

const upload = require("../middleware/multer");
const cloudinary = require("../utils/cloudinary");

/* ================= LIKE STORE ================= */

let likesStore = {};

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
    const cover = await getCover(album.id);

    res.json({
      id: album.id,
      title: album.title,
      cover,
      images,
    });
  } catch (err) {
    console.error("❌ Album error:", err);
    res.status(500).json({ error: "Failed to fetch album" });
  }
});

/* ================= 🔥 UPLOAD ================= */

// Upload to specific album
router.post("/upload/:album", upload.single("image"), (req, res) => {
  try {
    res.status(200).json({
      message: "Image uploaded successfully",
      imageUrl: req.file.path,
      public_id: req.file.filename,
      album: req.params.album,
    });
  } catch (error) {
    res.status(500).json({
      message: "Upload failed",
      error: error.message,
    });
  }
});

/* ================= ❤️ LIKE SYSTEM ================= */

router.post("/like", (req, res) => {
  const { image } = req.body;
  const userIP = req.ip;

  if (!image) return res.status(400).json({ error: "Image required" });

  if (!likesStore[image]) {
    likesStore[image] = { count: 0, users: new Set() };
  }

  if (likesStore[image].users.has(userIP)) {
    return res.json({
      likes: likesStore[image].count,
      alreadyLiked: true,
    });
  }

  likesStore[image].users.add(userIP);
  likesStore[image].count++;

  res.json({
    likes: likesStore[image].count,
    alreadyLiked: false,
  });
});

// 📊 GET LIKES
router.get("/likes", (req, res) => {
  const clean = {};
  for (let key in likesStore) {
    clean[key] = likesStore[key].count;
  }
  res.json(clean);
});

module.exports = router;