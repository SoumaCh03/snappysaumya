const express = require("express");
require("dotenv").config();

const cors = require("cors");

const app = express();

/* ================= MIDDLEWARE ================= */

// ⚠️ Update this later with your Vercel URL
app.use(cors({
  origin: "*",
  credentials: true,
}));

app.use(express.json());

/* ================= ROOT ================= */

app.get("/", (req, res) => {
  res.send("SnappySaumya API running 🚀");
});

/* ================= ROUTES ================= */

const galleryRoutes = require("./src/routes/galleryRoutes");
app.use("/api/gallery", galleryRoutes);

/* ================= START SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});