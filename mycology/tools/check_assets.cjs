"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..", "assets");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "asset-manifest.json"), "utf8"));
const errors = [];
const production = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (/\.(png|svg)$/i.test(entry.name) && !p.includes(`${path.sep}contact-sheets${path.sep}`)) production.push(path.relative(root, p).replace(/\\/g, "/"));
  }
}

async function main() {
  walk(root);
  const listed = manifest.assets.map((asset) => asset.file).sort();
  const actual = production.sort();
  if (JSON.stringify(listed) !== JSON.stringify(actual)) errors.push("Manifest/filesystem inventory mismatch");
  if (new Set(listed).size !== listed.length) errors.push("Duplicate manifest file");
  if (new Set(manifest.assets.map((a) => a.id)).size !== manifest.assets.length) errors.push("Duplicate asset id");

  for (const asset of manifest.assets) {
    if (!/^[a-z0-9/-]+\.(png|svg)$/.test(asset.file)) errors.push(`Invalid filename ${asset.file}`);
    const p = path.join(root, asset.file);
    if (!fs.existsSync(p)) { errors.push(`Missing ${asset.file}`); continue; }
    const buffer = fs.readFileSync(p);
    const meta = await sharp(p, { density: 130 }).metadata();
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");
    if (asset.width !== meta.width || asset.height !== meta.height) errors.push(`Dimension mismatch ${asset.file}`);
    if (asset.bytes !== buffer.length) errors.push(`Byte mismatch ${asset.file}`);
    if (asset.sha256 !== hash) errors.push(`Hash mismatch ${asset.file}`);
    if (asset.file.endsWith(".svg")) {
      const text = buffer.toString("utf8");
      if (!/viewBox="[^"]+"/.test(text)) errors.push(`Missing viewBox ${asset.file}`);
      if (!/<title[^>]*>[^<]+<\/title>/.test(text)) errors.push(`Missing title ${asset.file}`);
      if (/<script|(?:href|src)=["']https?:\/\//i.test(text)) errors.push(`External/script content ${asset.file}`);
    }
    if (asset.file.includes("dr-mira") && !meta.hasAlpha) errors.push(`Guide lacks alpha ${asset.file}`);
  }

  for (const sheet of ["shared-and-backgrounds.png", "mission-assets.png", "state-families.png"]) {
    if (!fs.existsSync(path.join(root, "contact-sheets", sheet))) errors.push(`Missing contact sheet ${sheet}`);
  }
  const guides = manifest.assets.filter((a) => a.registrationFamily === "dr-mira");
  if (guides.some((a) => a.width !== 1024 || a.height !== 1024 || a.anchor?.x !== 512 || a.anchor?.y !== 930)) errors.push("Guide registration mismatch");
  if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
  console.log(`PASS: ${manifest.assets.length} production assets, ${manifest.assets.filter(a=>a.type==="png").length} PNG, ${manifest.assets.filter(a=>a.type==="svg").length} SVG, 3 contact sheets`);
}

main().catch((error) => { console.error(error); process.exit(1); });
