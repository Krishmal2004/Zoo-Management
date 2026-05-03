/**
 * Re-write PNGs under assets/ (and root app icons) so Android AAPT2 accepts them.
 * Fixes common causes of: mergeReleaseResources / AAPT: error: file failed to compile
 * (CMYK, odd ICC, 16-bit, interlaced PNG, etc.)
 *
 * Run from frontend/: npm run normalize-pngs
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const ASSETS_DIR = path.join(ROOT, 'assets');

function walkPngs(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walkPngs(full, acc);
    else if (name.toLowerCase().endsWith('.png')) acc.push(full);
  }
  return acc;
}

async function main() {
  const files = new Set(walkPngs(ASSETS_DIR));
  for (const rel of ['assets/icon.png', 'assets/splash.png', 'assets/adaptive-icon.png']) {
    const full = path.join(ROOT, rel);
    if (fs.existsSync(full)) files.add(full);
  }

  const list = [...files];
  if (list.length === 0) {
    console.log('No PNG files found under assets/.');
    return;
  }

  console.log(`Rewriting ${list.length} PNG(s) for Android-safe encoding…`);
  for (const file of list) {
    const buf = await sharp(file)
      .rotate()
      .png({
        compressionLevel: 9,
        progressive: false,
        adaptiveFiltering: true,
        force: true,
      })
      .toBuffer();
    await fs.promises.writeFile(file, buf);
    console.log('  ok', path.relative(ROOT, file));
  }
  console.log('Done. Commit the updated PNGs, then run eas build again.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
