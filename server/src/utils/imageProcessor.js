const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const convertToWebP = async (inputPath) => {
  try {
    const outputPath = inputPath.replace(/\.(jpg|jpeg|png)$/i, ".webp");

    await sharp(inputPath)
      .resize({ width: 1600 })
      .webp({ quality: 80 })
      .toFile(outputPath);

    fs.unlinkSync(inputPath);

    return path.basename(outputPath);
  } catch (error) {
    console.error("Image conversion failed:", error);
    return null;
  }
};

module.exports = { convertToWebP };