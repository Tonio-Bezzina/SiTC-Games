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
    "styles.css?v=10",
    "logic.js?v=9",
    "game.js?v=13",
    "assets/mission-1/paper-request-blank.png?v=2",
    "assets/mission-2/histology-cassette-closed-loaded.png?v=2",
    "assets/mission-2/histology-cassette-open-empty.png?v=2",
    "assets/mission-2/histology-cassette-open-loaded.png?v=2",
    "assets/mission-5/cassette-m5-distractor.png?v=2"
  ].forEach((file) => assert.ok(files.includes(file), `Missing exact preload URL: ${file}`));
});

test("Histology uses a touch-only pointer drag path without replacing mouse drag and drop", () => {
  const game = fs.readFileSync(path.join(histologyRoot, "game.js"), "utf8");
  const styles = fs.readFileSync(path.join(histologyRoot, "styles.css"), "utf8");
  assert.match(game, /event\.pointerType !== "mouse"/);
  assert.match(game, /source\.setPointerCapture\(event\.pointerId\)/);
  assert.match(game, /document\.elementFromPoint\(x, y\)/);
  assert.match(game, /addEventListener\("pointermove"/);
  assert.match(game, /addEventListener\("pointercancel"/);
  assert.match(game, /addEventListener\("lostpointercapture"/);
  assert.match(game, /source\.draggable = false/);
  assert.match(game, /addEventListener\("dragstart"/);
  assert.match(game, /suppressClickUntil = Date\.now\(\) \+ 650/);
  assert.match(styles, /\.unstained-slide-source\[draggable="true"\][^{]*\{ touch-action: none; \}/s);
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
