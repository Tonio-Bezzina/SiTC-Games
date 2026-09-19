const test = require("node:test");
const assert = require("node:assert/strict");
const logic = require("../logic.js");

const ranges = { junior: [7, 9], explorer: [10, 12], challenge: [13, 16] };

test("generated cases obey every difficulty's identity rules", () => {
  Object.entries(ranges).forEach(([level, [minimum, maximum]]) => {
    for (let index = 0; index < 400; index += 1) {
      const gameCase = logic.createCase(level);
      const correct = gameCase.candidates.find((candidate) => logic.isCorrectCandidate(gameCase.reference, candidate));
      const incorrect = gameCase.candidates.find((candidate) => !logic.isCorrectCandidate(gameCase.reference, candidate));
      const age = logic.ageOn(gameCase.reference.dob, new Date());
      assert.ok(age >= minimum && age <= maximum, `${level} age ${age}`);
      assert.equal(logic.isPatientIdValid(gameCase.reference.id, gameCase.reference.dob), true);
      assert.equal(logic.isPatientIdValid(incorrect.id, incorrect.dob), true);
      assert.notEqual(gameCase.reference.id, incorrect.id);
      assert.deepEqual(logic.identityMismatchFields(gameCase.reference, correct), []);
      assert.equal(logic.isCorrectCandidate(gameCase.reference, correct), true);
      assert.equal(logic.isCorrectCandidate(gameCase.reference, incorrect), false);

      if (level === "junior") {
        assert.deepEqual(logic.identityMismatchFields(gameCase.reference, incorrect).sort(), ["dob", "id", "name"]);
      } else if (level === "explorer") {
        assert.equal(gameCase.reference.name, incorrect.name);
        assert.equal(gameCase.reference.dob, incorrect.dob);
        assert.notEqual(gameCase.reference.id.slice(0, -3), incorrect.id.slice(0, -3));
        assert.equal(gameCase.reference.id.slice(-3, -1), incorrect.id.slice(-3, -1));
      } else {
        assert.equal(gameCase.reference.name, incorrect.name);
        assert.equal(gameCase.reference.dob, incorrect.dob);
        assert.equal(gameCase.reference.id.slice(0, -1), incorrect.id.slice(0, -1));
        assert.notEqual(gameCase.reference.id.slice(-1), incorrect.id.slice(-1));
      }
    }
  });
});

test("candidate order can place the correct set in either position", () => {
  const correct = { isCorrect: true };
  const incorrect = { isCorrect: false };
  assert.equal(logic.orderCandidates(correct, incorrect, () => .1)[0].isCorrect, true);
  assert.equal(logic.orderCandidates(correct, incorrect, () => .9)[1].isCorrect, true);
});

test("changing difficulty preserves the reference identity", () => {
  const original = logic.createCase("junior", () => .37);
  const changed = logic.changeCaseLevel(original, "challenge", () => .71);
  assert.deepEqual(changed.reference, original.reference);
  assert.equal(changed.level, "challenge");
  assert.equal(changed.candidates.filter((candidate) => logic.isCorrectCandidate(changed.reference, candidate)).length, 1);
  assert.deepEqual(
    logic.identityMismatchFields(
      changed.reference,
      changed.candidates.find((candidate) => !logic.isCorrectCandidate(changed.reference, candidate))
    ),
    ["id"]
  );
});

test("patient ID validation rejects malformed and mismatched IDs", () => {
  assert.equal(logic.isPatientIdValid("123412H", "01/01/2012"), true);
  assert.equal(logic.isPatientIdValid("112H", "01/01/2012"), false);
  assert.equal(logic.isPatientIdValid("123412X", "01/01/2012"), false);
  assert.equal(logic.isPatientIdValid("123411H", "01/01/2012"), false);
});

test("Mission 2 state machine gates cutting and cassette completion", () => {
  let state = logic.createMission2State();
  assert.deepEqual(state, {
    choice: null,
    step: "question",
    scalpelSelected: false,
    tissueSelected: false,
    complete: false
  });

  state = logic.applyMission2Action(state, "choose", "microscope");
  assert.equal(state.step, "question");
  assert.equal(state.choice, "microscope");

  state = logic.applyMission2Action(state, "choose", logic.MISSION2_CORRECT_CHOICE);
  assert.equal(state.step, "cutting");
  assert.equal(logic.applyMission2Action(state, "cut").step, "cutting");

  state = logic.applyMission2Action(state, "select-scalpel");
  state = logic.applyMission2Action(state, "cut");
  assert.equal(state.step, "transfer");
  assert.equal(logic.applyMission2Action(state, "place-tissue").step, "transfer");

  state = logic.applyMission2Action(state, "select-tissue");
  state = logic.applyMission2Action(state, "place-tissue");
  assert.equal(state.step, "loaded");
  assert.equal(state.complete, false);

  state = logic.applyMission2Action(state, "close-cassette");
  assert.equal(state.step, "complete");
  assert.equal(state.complete, true);
});

test("Mission 2 drag placement accepts only the small cut tissue", () => {
  let state = logic.createMission2State();
  state = logic.applyMission2Action(state, "choose", logic.MISSION2_CORRECT_CHOICE);
  state = logic.applyMission2Action(state, "select-scalpel");
  state = logic.applyMission2Action(state, "cut");
  state = logic.applyMission2Action(state, "place-tissue", "drop");
  assert.equal(state.step, "loaded");
});

test("Mission 3 accepts only the processor and embedding centre", () => {
  let state = logic.createMission3State();
  state = logic.applyMission3Action(state, "choose", "microtome");
  assert.equal(state.step, "question");
  state = logic.applyMission3Action(state, "choose", "staining");
  assert.equal(state.step, "question");
  state = logic.applyMission3Action(state, "choose", logic.MISSION3_CORRECT_CHOICE);
  assert.equal(state.step, "processing");
  state = logic.applyMission3Action(state, "advance");
  assert.equal(state.step, "embedding");
  state = logic.applyMission3Action(state, "advance");
  assert.equal(state.step, "reveal");
  assert.equal(state.blockCreated, true);
  state = logic.applyMission3Action(state, "advance");
  assert.equal(state.step, "complete");
  assert.equal(state.complete, true);
});

test("Mission 3 interrupted processing resumes at one safe wax-block reveal", () => {
  const processing = { ...logic.createMission3State(), choice: logic.MISSION3_CORRECT_CHOICE, step: "processing" };
  const resumed = logic.applyMission3Action(processing, "resume-safe");
  assert.equal(resumed.step, "reveal");
  assert.equal(resumed.blockCreated, true);
  assert.equal(resumed.complete, false);
});

test("Mission 4 accepts only the microtome and reveals a section in order", () => {
  let state = logic.createMission4State();
  state = logic.applyMission4Action(state, "choose", "staining");
  assert.equal(state.step, "question");
  assert.equal(state.choice, "staining");
  state = logic.applyMission4Action(state, "choose", logic.MISSION4_CORRECT_CHOICE);
  assert.equal(state.step, "microtome_selected");
  assert.equal(state.blockLoaded, false);
  state = logic.applyMission4Action(state, "advance");
  assert.equal(state.step, "block_loaded");
  assert.equal(state.blockLoaded, true);
  assert.equal(state.sectionCut, false);
  state = logic.applyMission4Action(state, "advance");
  assert.equal(state.step, "section_cut");
  assert.equal(state.sectionCut, true);
  assert.equal(state.sectionRevealed, false);
  state = logic.applyMission4Action(state, "advance");
  assert.equal(state.step, "section_revealed");
  assert.equal(state.sectionRevealed, true);
  assert.equal(state.complete, false);
  state = logic.applyMission4Action(state, "advance");
  assert.equal(state.step, "complete");
  assert.equal(state.complete, true);
});

test("Mission 4 interrupted cutting resumes at a safe, non-duplicated state", () => {
  const selected = { ...logic.createMission4State(), choice: logic.MISSION4_CORRECT_CHOICE, step: "microtome_selected" };
  const loaded = logic.applyMission4Action(selected, "resume-safe");
  assert.equal(loaded.step, "block_loaded");
  assert.equal(loaded.blockLoaded, true);
  assert.equal(loaded.sectionRevealed, false);

  const cutting = { ...loaded, step: "section_cut", sectionCut: true };
  const revealed = logic.applyMission4Action(cutting, "resume-safe");
  assert.equal(revealed.step, "section_revealed");
  assert.equal(revealed.sectionCut, true);
  assert.equal(revealed.sectionRevealed, true);
  assert.equal(revealed.complete, false);
});
