const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

async function removeBlackBackground() {
  const srcPath = 'C:\\Users\\pc\\.gemini\\antigravity\\brain\\147cec89-82c5-4f3a-bbca-7185fc9e92e9\\media__1778441457504.png';
  const outPath = path.join(__dirname, 'public', 'images', 'bharathi-oil.png');

  const img = await loadImage(srcPath);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const w = canvas.width;
  const h = canvas.height;

  const visited = new Uint8Array(w * h);
  const queue = [];

  function isDark(idx) {
    const r = data[idx * 4];
    const g = data[idx * 4 + 1];
    const b = data[idx * 4 + 2];
    return r < 40 && g < 40 && b < 40;
  }

  // Seed from all 4 edges
  for (let x = 0; x < w; x++) {
    const top = x;
    const bottom = (h - 1) * w + x;
    if (isDark(top)) { queue.push(top); visited[top] = 1; }
    if (isDark(bottom)) { queue.push(bottom); visited[bottom] = 1; }
  }
  for (let y = 0; y < h; y++) {
    const left = y * w;
    const right = y * w + (w - 1);
    if (isDark(left)) { queue.push(left); visited[left] = 1; }
    if (isDark(right)) { queue.push(right); visited[right] = 1; }
  }

  // BFS flood fill — remove connected dark pixels from edges
  while (queue.length > 0) {
    const idx = queue.shift();
    data[idx * 4 + 3] = 0; // Make transparent

    const x = idx % w;
    const y = Math.floor(idx / w);

    const neighbors = [];
    if (x > 0) neighbors.push(idx - 1);
    if (x < w - 1) neighbors.push(idx + 1);
    if (y > 0) neighbors.push(idx - w);
    if (y < h - 1) neighbors.push(idx + w);

    for (const nIdx of neighbors) {
      if (!visited[nIdx] && isDark(nIdx)) {
        visited[nIdx] = 1;
        queue.push(nIdx);
      }
    }
  }

  // Anti-alias: soften edges near transparency
  const alphaSnap = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) alphaSnap[i] = data[i * 4 + 3];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      if (alphaSnap[idx] > 0) {
        let tc = 0;
        if (alphaSnap[idx - 1] === 0) tc++;
        if (alphaSnap[idx + 1] === 0) tc++;
        if (alphaSnap[idx - w] === 0) tc++;
        if (alphaSnap[idx + w] === 0) tc++;
        if (tc > 0 && tc < 4) {
          data[idx * 4 + 3] = Math.round(data[idx * 4 + 3] * (1 - tc * 0.2));
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
  console.log('Black background removed! Bottle preserved.');
}

removeBlackBackground().catch(console.error);
