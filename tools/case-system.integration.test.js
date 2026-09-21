const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("passive viewer is navigation-only and cannot write progress", () => {
  const app = read("case-library/app.js");
  assert.doesNotMatch(app, /localStorage|sitcGameProgressV2|completedCases/);
  assert.match(app, /touchstart/);
  assert.match(app, /touchend/);
  assert.match(app, /ArrowLeft/);
  assert.match(app, /ArrowRight/);
  assert.match(app, /previous\.disabled/);
  assert.match(app, /next\.disabled/);
  assert.match(read("case-library/styles.css"), /object-fit:\s*contain/);
});

test("main progress excludes passive Transfusion folders and obsolete entries", () => {
  const hub = read("hub.js");
  const transfusionHub = read("transfusion/transfusion-hub.js");
  const nickyGame = read("transfusion/nicky/game.js");
  assert.doesNotMatch(hub, /Future Transfusion Case|"case-2"|"case-3"/);
  assert.match(transfusionHub, /PROGRESS_MISSIONS\s*=\s*\[MAIN_MISSION_ID\]/);
  assert.doesNotMatch(transfusionHub, /case-01|case-02/);
  assert.match(nickyGame, /CASE_ID\s*=\s*"nicky"/);
  assert.match(nickyGame, /localStorage\.setItem\(STORAGE_KEY/);
});

test("every laboratory is linked to the shared Cases system", () => {
  const hub = read("hub.js");
  for (const laboratory of ["transfusion", "chemistry", "bacteriology", "haematology", "histology", "mycology"]) {
    assert.match(hub, new RegExp(`case-library/\\?lab=${laboratory}`));
  }
});

test("generated catalogue contains expected live and empty libraries", () => {
  const catalogue = JSON.parse(read("case-library/catalogue.json"));
  assert.equal(catalogue.laboratories.transfusion[0].id, "case-01");
  assert.equal(catalogue.laboratories.transfusion[0].slideCount, 5);
  assert.equal(catalogue.laboratories.transfusion[1].id, "case-02");
  assert.equal(catalogue.laboratories.transfusion[1].slideCount, 4);
  for (const laboratory of ["chemistry", "bacteriology", "haematology", "histology", "mycology"]) {
    assert.deepEqual(catalogue.laboratories[laboratory], []);
  }
});
