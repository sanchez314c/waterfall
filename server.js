const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 7749;
const IMAGES_DIR = '/media/heathen-admin/RAID/Portfolio-Image';
const THUMBS_DIR = path.join(__dirname, 'thumbnails');
const VALID_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

// Cache the image list (refresh every 5 min)
let imageCache = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

function getImages() {
  const now = Date.now();
  if (imageCache && (now - cacheTime) < CACHE_TTL) return imageCache;

  const files = fs.readdirSync(IMAGES_DIR)
    .filter(f => !f.startsWith('._') && VALID_EXT.has(path.extname(f).toLowerCase()))
    .sort(() => Math.random() - 0.5); // shuffle for variety

  imageCache = files;
  cacheTime = now;
  return files;
}

// API: list all images
app.get('/api/images', (req, res) => {
  const images = getImages();
  res.json(images.map(name => {
    // Thumbnails are .webp regardless of original format
    const thumbName = path.parse(name).name + '.webp';
    return {
      thumb: `/thumbs/${encodeURIComponent(thumbName)}`,
      full: `/photos/${encodeURIComponent(name)}`,
      name
    };
  }));
});

// Serve thumbnails
app.use('/thumbs', express.static(THUMBS_DIR, {
  maxAge: '7d',
  immutable: true
}));

// Serve full-res originals
app.use('/photos', express.static(IMAGES_DIR, {
  maxAge: '7d',
  immutable: true
}));

// Serve the single HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Portfolio Photos running on http://0.0.0.0:${PORT}`);
});
