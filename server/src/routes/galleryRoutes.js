const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

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

/* ================= HELPERS ================= */

// 🔥 ROOT uploads folder
const UPLOADS_PATH = path.join(__dirname, "../../uploads");

/* ================= GET IMAGES ================= */

const getImages = (folder) => {
  try {
    const dirPath = path.join(UPLOADS_PATH, folder);

    console.log("📂 Reading folder:", dirPath);

    if (!fs.existsSync(dirPath)) {
      console.log("❌ Folder not found:", folder);
      return [];
    }

    const files = fs.readdirSync(dirPath);

    console.log(`✅ ${files.length} files found in ${folder}`);

    return files.map((file) => ({
      url: `http://localhost:5000/uploads/${folder}/${file}`,
      public_id: file,
      tags: getTags(file),
    }));
  } catch (err) {
    console.error("❌ getImages error:", err);
    return [];
  }
};

/* ================= GET COVER ================= */

const getCover = (folder) => {
  try {
    const dirPath = path.join(UPLOADS_PATH, folder);

    if (!fs.existsSync(dirPath)) return null;

    const files = fs.readdirSync(dirPath);

    if (!files.length) return null;

    // 🔥 Prefer cover file
    const coverFile = files.find((f) =>
      f.toLowerCase().includes("cover")
    );

    const finalFile = coverFile || files[0];

    return `http://localhost:5000/uploads/${folder}/${finalFile}`;
  } catch (err) {
    console.error("❌ getCover error:", err);
    return null;
  }
};

/* ================= ROUTES ================= */

// 📦 GET ALL ALBUMS
router.get("/", (req, res) => {
  try {
    console.log("🚀 Fetching all albums");

    const data = albums.map((album) => ({
      id: album.id,
      title: album.title,
      cover: getCover(album.id),
    }));

    res.json(data);
  } catch (err) {
    console.error("❌ Gallery error:", err);
    res.status(500).json({ error: "Failed to fetch gallery" });
  }
});

// 📂 GET SINGLE ALBUM
router.get("/:id", (req, res) => {
  try {
    const album = albums.find((a) => a.id === req.params.id);

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    const images = getImages(album.id);
    const cover = getCover(album.id);

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

/* ================= ❤️ LIKE ================= */

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