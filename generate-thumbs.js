const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = '/media/heathen-admin/RAID/Portfolio-Image';
const THUMBS_DIR = path.join(__dirname, 'thumbnails');
const THUMB_WIDTH = 800;
const VALID_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

async function generate() {
  if (!fs.existsSync(THUMBS_DIR)) fs.mkdirSync(THUMBS_DIR, { recursive: true });

  const files = fs.readdirSync(IMAGES_DIR)
    .filter(f => !f.startsWith('._') && VALID_EXT.has(path.extname(f).toLowerCase()));

  console.log(`Found ${files.length} images. Generating thumbnails...`);

  let done = 0;
  let skipped = 0;
  let failed = 0;

  // Process in batches of 10 for memory efficiency
  const BATCH = 10;
  for (let i = 0; i < files.length; i += BATCH) {
    const batch = files.slice(i, i + BATCH);
    await Promise.all(batch.map(async (file) => {
      const src = path.join(IMAGES_DIR, file);
      // Output as .webp for smaller size
      const baseName = path.parse(file).name + '.webp';
      const dest = path.join(THUMBS_DIR, baseName);

      if (fs.existsSync(dest)) {
        skipped++;
        return;
      }

      try {
        await sharp(src)
          .resize(THUMB_WIDTH, null, { withoutEnlargement: true })
          .webp({ quality: 82 })
          .toFile(dest);
        done++;
      } catch (err) {
        console.error(`  FAIL: ${file} — ${err.message}`);
        // Fallback: copy as-is if sharp can't process
        try {
          const jpgDest = path.join(THUMBS_DIR, file);
          await sharp(src).resize(THUMB_WIDTH, null, { withoutEnlargement: true }).toFile(jpgDest);
          done++;
        } catch {
          failed++;
        }
      }
    }));
    process.stdout.write(`\r  ${done + skipped}/${files.length} processed`);
  }

  console.log(`\nDone: ${done} generated, ${skipped} skipped, ${failed} failed`);
}

generate();
