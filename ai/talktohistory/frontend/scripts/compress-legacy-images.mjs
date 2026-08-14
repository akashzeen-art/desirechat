/**
 * One-time: convert public/images PNG files to JPG (~80% quality, max 900px wide).
 * Run: node scripts/compress-legacy-images.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "../public/images");

async function walk(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(full)));
    else if (e.isFile() && /\.png$/i.test(e.name)) files.push(full);
  }
  return files;
}

const pngs = await walk(ROOT);
let saved = 0;

for (const png of pngs) {
  const jpg = png.replace(/\.png$/i, ".jpg");
  if (fs.existsSync(jpg)) continue;

  const before = fs.statSync(png).size;
  await sharp(png)
    .rotate()
    .resize({ width: 900, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(jpg);

  const after = fs.statSync(jpg).size;
  saved += before - after;
  console.log(`${path.relative(ROOT, jpg)} — ${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB`);
}

console.log(`\nDone. ${pngs.length} PNGs processed. Saved ~${Math.round(saved / 1024 / 1024)} MB.`);
