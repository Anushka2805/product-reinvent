const fs = require("fs");
const path = require("path");

const srcDir = __dirname;
const destDir = path.join(__dirname, "public");

// make public folder if not exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir);
}

// file extensions to move
const extensions = [".jpeg", ".jpg", ".png", ".mp4"];

fs.readdirSync(srcDir).forEach(file => {
  if (extensions.includes(path.extname(file))) {
    fs.renameSync(path.join(srcDir, file), path.join(destDir, file));
    console.log(`Moved: ${file}`);
  }
});

console.log("✅ All assets moved to public/");
