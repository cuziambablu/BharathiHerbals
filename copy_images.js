const fs = require('fs');
const path = require('path');

const srcDir = 'c:\\Users\\pc\\Downloads\\ezgif-1ef194831bccb101-jpg';
const destDir = 'c:\\Users\\pc\\OneDrive\\Desktop\\Bharathi Beauty Products\\public\\images\\sequence';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.jpg')).sort();

files.forEach((file, index) => {
  const srcPath = path.join(srcDir, file);
  const destName = `frame-${String(index + 1).padStart(3, '0')}.jpg`;
  const destPath = path.join(destDir, destName);
  fs.copyFileSync(srcPath, destPath);
});

console.log(`Copied ${files.length} frames.`);
