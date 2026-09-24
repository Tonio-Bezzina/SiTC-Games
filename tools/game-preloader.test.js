const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const histologyRoot = path.join(root, "histology");
const manifest = JSON.parse(fs.readFileSync(path.join(histologyRoot, "preload-manifest.json"), "utf8"));
const files = manifest.groups.flatMap((group) => group.files);

test("Histology preload manifest uses the exact versioned game URLs", () => {
  assert.equal(manifest.version, 2);
  [
    "styles.css?v=9",
    "logic.js?v=9",
    "game.js?v=12",
    "assets/mission-1/paper-request-blank.png?v=2",
    "assets/mission-2/histology-cassette-closed-loaded.png?v=2",
    "assets/mission-2/histology-cassette-open-empty.png?v=2",
    "assets/mission-2/histology-cassette-open-loaded.png?v=2",
    "assets/mission-5/cassette-m5-distractor.png?v=2"
  ].forEach((file) => assert.ok(files.includes(file), `Missing exact preload URL: ${file}`));
});

test("Every Histology preload entry resolves to a project file", () => {
  files.forEach((file) => {
    const relativePath = file.split("?")[0];
    assert.equal(fs.existsSync(path.join(histologyRoot, relativePath)), true, `Missing preload file: ${relativePath}`);
  });
});

test("Shared preloader decodes images and blocks incomplete downloads", () => {
  const source = fs.readFileSync(path.join(root, "assets", "game-preloader.js"), "utf8");
  assert.match(source, /image\.decode\(\)/);
  assert.match(source, /if \(state\.failed\) throw new Error/);
  assert.match(source, /Retry download/);
});

test("Every laboratory hub requests the updated shared preloader", () => {
  ["bacteriology", "chemistry", "haematology", "histology", "mycology", "transfusion"].forEach((lab) => {
    const html = fs.readFileSync(path.join(root, lab, "index.html"), "utf8");
    assert.match(html, /game-preloader\.js\?v=20260924-image-decode/, `${lab} uses a stale preloader`);
  });
});
