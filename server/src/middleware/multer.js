const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    if (!req.params.album) {
      throw new Error("Album not provided");
    }

    return {
      folder: `snappysaumya/${req.params.album}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      format: "webp", // 🔥 force webp
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    };
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 🔥 50MB safe
  },
});

module.exports = upload;