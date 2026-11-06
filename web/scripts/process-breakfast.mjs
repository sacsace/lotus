import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC_DIR = path.resolve("tmp-breakfast");
const OUT_DIR = path.resolve("public/images/hotel/breakfast");

function isWood(r, g, b) {
  const isMetal = Math.abs(r - g) < 18 && Math.abs(g - b) < 18 && r > 115;
  return !isMetal && r > 48 && r < 180 && g > 28 && g < 135 && b < 95 && r > g + 6 && g >= b - 10;
}

function detectAngle(rgb, width, height) {
  const xs = [];
  const ys = [];
  const xStart = Math.round(width * 0.18);
  const xEnd = Math.round(width * 0.82);
  for (let x = xStart; x < xEnd; x += 2) {
    for (let y = 4; y < height * 0.45; y += 1) {
      const i = (y * width + x) * 3;
      if (isWood(rgb[i], rgb[i + 1], rgb[i + 2])) {
        xs.push(x);
        ys.push(y);
        break;
      }
    }
  }
  if (xs.length < 20) return 0;
  const n = xs.length;
  let sumX = 0;
  let sumY = 0;
  for (let i = 0; i < n; i++) {
    sumX += xs[i];
    sumY += ys[i];
  }
  const meanX = sumX / n;
  const meanY = sumY / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    num += dx * (ys[i] - meanY);
    den += dx * dx;
  }
  if (den === 0) return 0;
  const slope = num / den;
  const deg = (Math.atan(slope) * 180) / Math.PI;
  if (Math.abs(deg) > 3.6) return Math.sign(deg) * 3.6;
  return deg;
}

function trayBox(rgb, width, height) {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let count = 0;
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const i = (y * width + x) * 3;
      if (isWood(rgb[i], rgb[i + 1], rgb[i + 2])) {
        count += 1;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (count < 80) return null;
  const padX = Math.round((maxX - minX) * 0.015);
  const padY = Math.round((maxY - minY) * 0.015);
  return {
    left: Math.max(0, minX - padX),
    top: Math.max(0, minY - padY),
    width: Math.min(width - Math.max(0, minX - padX), maxX - minX + padX * 2 + 1),
    height: Math.min(height - Math.max(0, minY - padY), maxY - minY + padY * 2 + 1),
  };
}

const files = fs
  .readdirSync(SRC_DIR)
  .filter((f) => f.startsWith("src-") && f.endsWith(".png"))
  .sort();

fs.mkdirSync(OUT_DIR, { recursive: true });

const urls = [];
let index = 1;
for (const file of files) {
  const input = path.join(SRC_DIR, file);
  const sample = await sharp(input)
    .resize({ width: 720, withoutEnlargement: true })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const angle = detectAngle(sample.data, sample.info.width, sample.info.height);

  const rotated = await sharp(input).rotate(angle, { background: "#cfcfcf" }).toBuffer();
  const rotMeta = await sharp(rotated).metadata();
  const w = rotMeta.width ?? 1600;
  const h = rotMeta.height ?? 1200;

  const rotSample = await sharp(rotated)
    .resize({ width: 720, withoutEnlargement: true })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const box = trayBox(rotSample.data, rotSample.info.width, rotSample.info.height);
  const scale = w / rotSample.info.width;
  let extract = {
    left: Math.round(w * 0.02),
    top: Math.round(h * 0.02),
    width: Math.round(w * 0.96),
    height: Math.round(h * 0.96),
  };
  if (box && box.width > 90 && box.height > 90) {
    extract = {
      left: Math.max(0, Math.round(box.left * scale)),
      top: Math.max(0, Math.round(box.top * scale)),
      width: Math.min(w, Math.round(box.width * scale)),
      height: Math.min(h, Math.round(box.height * scale)),
    };
    if (extract.left + extract.width > w) extract.width = w - extract.left;
    if (extract.top + extract.height > h) extract.height = h - extract.top;
  }

  const name = `breakfast-${String(index).padStart(2, "0")}.jpg`;
  await sharp(rotated)
    .extract(extract)
    .resize({ width: 1600, withoutEnlargement: true })
    .sharpen({ sigma: 0.9, m1: 0.85, m2: 0.35 })
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(path.join(OUT_DIR, name));

  console.log(`${name}  angle=${angle.toFixed(2)}`);
  urls.push(`/images/hotel/breakfast/${name}`);
  index += 1;
}

fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(urls, null, 2));
console.log(`done ${urls.length} files`);
