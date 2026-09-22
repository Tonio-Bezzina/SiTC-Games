const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("passive viewer is navigation-only and cannot write progress", () => {
  const app = read("case-library/app.js");
  const styles = read("case-library/styles.css");
  assert.doesNotMatch(app, /localStorage|sitcGameProgressV2|completedCases/);
  assert.match(app, /touchstart/);
  assert.match(app, /touchend/);
  assert.match(app, /touchcancel/);
  assert.match(app, /Math\.abs\(horizontal\) <= Math\.abs\(vertical\)/);
  assert.match(app, /ArrowLeft/);
  assert.match(app, /ArrowRight/);
  assert.match(app, /previous\.disabled/);
  assert.match(app, /next\.disabled/);
  assert.match(styles, /object-fit:\s*contain/);
  assert.match(styles, /\.slide-stage\s*\{[^}]*overflow-y:\s*auto/s);
  assert.match(styles, /\.slide-stage img\s*\{[^}]*width:\s*auto[^}]*height:\s*auto[^}]*max-width:\s*100%[^}]*max-height:/s);
  assert.doesNotMatch(styles, /\.slide-stage\s*\{[^}]*overflow:\s*hidden/s);
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
  assert.equal(catalogue.laboratories.bacteriology[0].slideCount, 5);
  assert.deepEqual(catalogue.laboratories.histology.map(({ title, slideCount }) => ({ title, slideCount })), [
    { title: "Case 1", slideCount: 7 },
    { title: "Case 2 - Melanoma", slideCount: 5 }
  ]);
  for (const laboratory of ["chemistry", "haematology", "mycology"]) {
    assert.deepEqual(catalogue.laboratories[laboratory], []);
  }
});
