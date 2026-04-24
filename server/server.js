const express = require("express");
require("dotenv").config();

const cors = require("cors");

// 🔥 IMPORT DB CONNECTOR
const connectDB = require("./src/config/db");

const app = express();

/* ================= CONNECT DATABASE ================= */

// 🔥 Connect to MongoDB
connectDB();

/* ================= MIDDLEWARE ================= */

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://snappysaumya.vercel.app"
    ],
    credentials: true,
  })
);

app.use(express.json());

/* ================= ROOT ================= */

app.get("/", (req, res) => {
  res.send("SnappySaumya API running 🚀");
});

/* ================= ROUTES ================= */

const galleryRoutes = require("./src/routes/galleryRoutes");
app.use("/api/gallery", galleryRoutes);

const albumRoutes = require("./src/routes/albumRoutes");
app.use("/api/albums", albumRoutes);

// ✅ FIXED: moved BEFORE app.listen
const authRoutes = require("./src/routes/authRoutes");
app.use("/api/auth", authRoutes);

/* ================= START SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});