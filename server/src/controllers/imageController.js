const Image = require("../models/Image");

/* ================= LIKE IMAGE ================= */

exports.likeImage = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await Image.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } }, // 🔥 increment likes
      { new: true }
    );

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    res.json({
      message: "Liked",
      likes: image.likes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};