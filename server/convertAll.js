const fs = require("fs");
const path = require("path");
const { convertToWebP } = require("./src/utils/imageProcessor");

const folder = "./uploads";

const run = async () => {
  const files = fs.readdirSync(folder);

  for (const file of files) {
    if (file.match(/\.(jpg|jpeg|png)$/i)) {
      const fullPath = path.join(folder, file);
      console.log("Converting:", file);

      await convertToWebP(fullPath);
    }
  }

  console.log("✅ All images converted to WebP");
};

run();