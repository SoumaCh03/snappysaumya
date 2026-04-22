require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// 🔥 Import your Admin model
const Admin = require("./src/models/Admin"); // adjust path if needed

/* ================= DB CONNECT ================= */

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ DB Error:", err);
    process.exit(1);
  });

/* ================= CREATE ADMIN ================= */

const createAdmin = async () => {
  try {
    const username = "adminsa";
    const password = "12345678";

    // Check if already exists
    const existing = await Admin.findOne({ username });

    if (existing) {
      console.log("⚠️ Admin already exists");
      process.exit();
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await Admin.create({
      username,
      password: hashedPassword,
    });

    console.log("🔥 Admin created successfully");
    console.log("Username:", username);
    console.log("Password:", password);

    process.exit();
  } catch (err) {
    console.error("❌ Error creating admin:", err);
    process.exit(1);
  }
};

createAdmin();