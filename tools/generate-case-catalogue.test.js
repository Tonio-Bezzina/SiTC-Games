const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { LABS, generateCatalogue, titleFromFolder } = require("./generate-case-catalogue");

test("folder names become useful display titles", () => {
  assert.equal(titleFromFolder("case-01"), "Case 01");
  assert.equal(titleFromFolder("03-haemolytic-reaction"), "Haemolytic Reaction");
  assert.equal(titleFromFolder("case_12_antibody-screen"), "Antibody Screen");
});

test("scanner sorts slides numerically and prefers an optional thumbnail", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "sitc-cases-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  const caseDirectory = path.join(root, "chemistry", "cases", "03-mystery-sample");
  fs.mkdirSync(caseDirectory, { recursive: true });
  for (const name of ["Image 10.png", "image_2.PNG", "image-1.jpg", "thumbnail.png", "notes.txt"]) {
    fs.writeFileSync(path.join(caseDirectory, name), "test");
  }

  const catalogue = generateCatalogue(root);
  const discovered = catalogue.laboratories.chemistry[0];

  assert.equal(discovered.title, "Mystery Sample");
  assert.equal(discovered.slideCount, 3);
  assert.deepEqual(discovered.slides.map((slide) => path.basename(slide)), [
    "image-1.jpg",
    "image_2.PNG",
    "Image 10.png"
  ]);
  assert.equal(path.basename(discovered.thumbnail), "thumbnail.png");
  assert.ok(!discovered.slides.some((slide) => slide.includes("thumbnail")));
});

test("all supported laboratories receive an empty catalogue entry", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "sitc-empty-cases-"));
  try {
    const catalogue = generateCatalogue(root);
    assert.deepEqual(Object.keys(catalogue.laboratories), LABS);
    for (const laboratory of LABS) assert.deepEqual(catalogue.laboratories[laboratory], []);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
