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
