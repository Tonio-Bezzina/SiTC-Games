#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const LABS = [
  "transfusion",
  "chemistry",
  "bacteriology",
  "haematology",
  "histology",
  "mycology"
];

const SLIDE_PATTERN = /^image[\s_-]*(\d+)\.(png|jpe?g|webp|gif|avif)$/i;
const THUMBNAIL_PATTERN = /^thumbnail\.(png|jpe?g|webp|gif|avif)$/i;

function naturalCompare(left, right) {
  return left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
}

function titleFromFolder(folderName) {
  let title = folderName
    .replace(/^case[\s_-]*\d+[\s_-]*/i, "")
    .replace(/^\d+[\s_-]*/, "")
    .replace(/[\s_-]+/g, " ")
    .trim();

  if (!title) {
    const number = folderName.match(/(?:^|[\s_-])(\d+)(?:$|[\s_-])/);
    return number ? `Case ${number[1].padStart(2, "0")}` : folderName;
  }

  return title.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function readOptionalTitle(caseDirectory) {
  for (const fileName of ["case.json", "metadata.json"]) {
    const metadataPath = path.join(caseDirectory, fileName);
    if (!fs.existsSync(metadataPath)) continue;

    try {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
      if (typeof metadata.title === "string" && metadata.title.trim()) {
        return metadata.title.trim();
      }
    } catch (error) {
      console.warn(`Ignoring invalid ${metadataPath}: ${error.message}`);
    }
  }
  return null;
}

function toWebPath(...parts) {
  return parts.join("/").replaceAll("\\", "/");
}

function scanCase(rootDirectory, laboratory, folderName) {
  const caseDirectory = path.join(rootDirectory, laboratory, "cases", folderName);
  const files = fs.readdirSync(caseDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);

  const slides = files
    .map((fileName) => {
      const match = fileName.match(SLIDE_PATTERN);
      return match ? { fileName, number: Number(match[1]) } : null;
    })
    .filter(Boolean)
    .sort((left, right) => left.number - right.number || naturalCompare(left.fileName, right.fileName))
    .map(({ fileName }) => toWebPath(laboratory, "cases", folderName, fileName));

  if (!slides.length) return null;

  const thumbnailFile = files.find((fileName) => THUMBNAIL_PATTERN.test(fileName));

  return {
    id: folderName,
    title: readOptionalTitle(caseDirectory) || titleFromFolder(folderName),
    thumbnail: thumbnailFile
      ? toWebPath(laboratory, "cases", folderName, thumbnailFile)
      : slides[0],
    slides,
    slideCount: slides.length
  };
}

function generateCatalogue(rootDirectory) {
  const catalogue = {
    laboratories: {}
  };

  for (const laboratory of LABS) {
    const casesDirectory = path.join(rootDirectory, laboratory, "cases");
    let cases = [];

    if (fs.existsSync(casesDirectory)) {
      cases = fs.readdirSync(casesDirectory, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => scanCase(rootDirectory, laboratory, entry.name))
        .filter(Boolean)
        .sort((left, right) => naturalCompare(left.id, right.id));
    }

    catalogue.laboratories[laboratory] = cases;
  }

  return catalogue;
}

function writeCatalogue(rootDirectory, outputPath) {
  const catalogue = generateCatalogue(rootDirectory);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(catalogue, null, 2)}\n`, "utf8");
  return catalogue;
}

if (require.main === module) {
  const rootDirectory = path.resolve(__dirname, "..");
  const outputPath = path.join(rootDirectory, "case-library", "catalogue.json");
  const catalogue = writeCatalogue(rootDirectory, outputPath);
  const totalCases = Object.values(catalogue.laboratories).flat().length;
  console.log(`Generated ${path.relative(rootDirectory, outputPath)} with ${totalCases} case(s).`);
}

module.exports = {
  LABS,
  SLIDE_PATTERN,
  generateCatalogue,
  scanCase,
  titleFromFolder,
  writeCatalogue
};
