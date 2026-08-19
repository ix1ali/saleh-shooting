/* Processes the supplied photography into the sizes the site actually uses.
   Run with: node _media.mjs   (safe to re-run; it overwrites) */
import fs from "node:fs";
import sharp from "sharp";

const SRC = "public/updated images";
const OUT = "public/media";

fs.mkdirSync(OUT, { recursive: true });

/* name, source file, output box, crop focus */
const PLAN = [
  { name: "pistol", src: "pistol.png", w: 1200, h: 1600, pos: "attention" },
  { name: "rifle", src: "rifle.png", w: 1200, h: 1600, pos: "attention" },
  { name: "shotgun", src: "shotgun.png", w: 1200, h: 1600, pos: "attention" },
  { name: "archery", src: "archery.png", w: 1200, h: 1600, pos: "attention" },
  { name: "range", src: "range.png", w: 1200, h: 1600, pos: "attention" },
  { name: "booths", src: "range2.png", w: 1200, h: 1600, pos: "attention" },
  /* The hero plate. A tall crop of the bench-rest frame: the rifle has to be
     unmistakable at the top of a phone screen, with the lane running away
     behind it. Cropped from the top so the scope and barrel stay in frame. */
  { name: "hero-rifle", src: "rifle.png", w: 1200, h: 2100, pos: "top" },
];

const report = [];

for (const item of PLAN) {
  const file = `${SRC}/${item.src}`;
  if (!fs.existsSync(file)) {
    report.push([item.name, "SOURCE MISSING"]);
    continue;
  }

  const meta = await sharp(file).metadata();

  const base = await sharp(file)
    .resize(item.w, item.h, { fit: "cover", position: item.pos, kernel: "lanczos3" })
    .toBuffer();

  await sharp(base).webp({ quality: 80, effort: 5 }).toFile(`${OUT}/${item.name}.webp`);
  await sharp(base).avif({ quality: 52, effort: 5 }).toFile(`${OUT}/${item.name}.avif`);

  const kb = (p) => (fs.statSync(p).size / 1024) | 0;
  report.push([
    item.name,
    `src ${meta.width}x${meta.height}`,
    `out ${item.w}x${item.h}`,
    `webp ${kb(`${OUT}/${item.name}.webp`)}KB`,
    `avif ${kb(`${OUT}/${item.name}.avif`)}KB`,
  ]);
}

console.table(report);
