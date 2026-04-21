const express = require("express");
require("dotenv").config();

const cors = require("cors");
const path = require("path");

const app = express();

/* ================= MIDDLEWARE ================= */

app.use(cors());
app.use(express.json());

/* ================= ROOT ================= */

app.get("/", (req, res) => {
  res.send("SnappySaumya API running 🚀");
});

/* ================= 🔥 SERVE LOCAL UPLOADS ================= */

// ✅ This is the IMPORTANT FIX
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================= GALLERY ROUTES ================= */

const galleryRoutes = require("./src/routes/galleryRoutes");
app.use("/api/gallery", galleryRoutes);

/* ================= START SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});