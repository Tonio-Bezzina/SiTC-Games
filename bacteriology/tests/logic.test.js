const test = require("node:test");
const assert = require("node:assert/strict");
const logic = require("../main/logic.js");

const target = { left: 100, right: 150, top: 100, bottom: 150 };
const dragVisual = { width: 100, height: 100 };
const swabTip = { x: 0.15, y: 0.86 };

test("Mission 5 accepts the pointer touching the inoculation target", () => {
  assert.equal(
    logic.dragTouchesRect({ x: 125, y: 125 }, target, dragVisual, swabTip),
    true
  );
});

test("Mission 5 accepts the swab tip touching when the pointer is outside", () => {
  assert.equal(
    logic.dragTouchesRect({ x: 170, y: 80 }, target, dragVisual, swabTip),
    true
  );
});

test("Mission 5 rejects a drop when neither pointer nor swab tip touches", () => {
  assert.equal(
    logic.dragTouchesRect({ x: 220, y: 40 }, target, dragVisual, swabTip),
    false
  );
});

test("Mission 10 starts with a clean MALDI-TOF workflow state", () => {
  assert.deepEqual(logic.initialState().mission10, {
    step: 0,
    selected: null,
    analysisStarted: false,
    analysisPhase: 0,
    complete: false
  });
});
