(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.BJLogic = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const LEVELS = {
    junior: { label: "7–9 years", min: 7, max: 9 },
    explorer: { label: "10–12 years", min: 10, max: 12 },
    challenge: { label: "13–16 years", min: 13, max: 16 }
  };

  const GRAM_STEPS = [
    { key: "violet", bottle: "violet", title: "Crystal violet", detail: "Apply crystal violet", seconds: 60, message: "Crystal violet is the first stain." },
    { key: "rinse1", bottle: "water", title: "Rinse", detail: "Rinse with water", seconds: 0, message: "Rinse the slide with water." },
    { key: "iodine", bottle: "iodine", title: "Lugol’s iodine", detail: "Apply Lugol’s iodine", seconds: 60, message: "Now we add iodine." },
    { key: "rinse2", bottle: "water", title: "Rinse", detail: "Rinse with water", seconds: 0, message: "Rinse the slide with water." },
    { key: "decolorizer", bottle: "decolorizer", title: "Decolorizer", detail: "Apply decolorizer", seconds: 30, message: "Now comes an important step — the decolorizer." },
    { key: "rinse3", bottle: "water", title: "Rinse", detail: "Rinse with water", seconds: 0, message: "Rinse the slide with water." },
    { key: "fuchsin", bottle: "fuchsin", title: "Carbol Fuchsin", detail: "Apply Carbol Fuchsin", seconds: 60, message: "Carbol Fuchsin is the final stain." },
    { key: "rinse4", bottle: "water", title: "Final rinse", detail: "Rinse with water", seconds: 0, message: "Give the slide its final water rinse." }
  ];

  function randomInteger(minimum, maximum, random = Math.random) {
    return Math.floor(random() * (maximum - minimum + 1)) + minimum;
  }

  function pad(value) { return String(value).padStart(2, "0"); }

  function createDob(level, referenceDate = new Date(), random = Math.random) {
    const config = LEVELS[level];
    const age = randomInteger(config.min, config.max, random);
    const month = randomInteger(1, 12, random);
    const day = randomInteger(1, 28, random);
    let year = referenceDate.getFullYear() - age;
    const birthdayPassed = month < referenceDate.getMonth() + 1 ||
      (month === referenceDate.getMonth() + 1 && day <= referenceDate.getDate());
    if (!birthdayPassed) year -= 1;
    return { day, month, year, display: `${pad(day)}/${pad(month)}/${year}` };
  }

  function createPatientId(dob, usedIds = new Set(), random = Math.random) {
    const suffix = String(dob.year).slice(-2);
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const length = randomInteger(4, 7, random);
      const prefixLength = length - 2;
      let prefix = String(randomInteger(1, 9, random));
      for (let i = 1; i < prefixLength; i += 1) prefix += String(randomInteger(0, 9, random));
      const id = `${prefix}${suffix}${random() < 0.5 ? "H" : "L"}`;
      if (!usedIds.has(id)) return id;
    }
    throw new Error("Could not create a unique patient ID no.");
  }

  function isPatientIdValid(id, dob) {
    return /^\d{4,7}[HL]$/.test(id) && id.slice(0, -1).endsWith(String(dob.year).slice(-2));
  }

  function identityMismatchFields(reference, candidate) {
    return ["name", "id", "dob"].filter(field => candidate[field] !== reference[field]);
  }

  function makeDifferentId(reference, subtle, random = Math.random) {
    const body = reference.id.slice(0, -1);
    const letter = reference.id.slice(-1);
    if (subtle) return `${body}${letter === "H" ? "L" : "H"}`;
    const prefixLength = body.length - 2;
    let prefix = "";
    for (let i = 0; i < prefixLength; i += 1) {
      const old = Number(body[i]);
      prefix += String(i === 0 ? ((old % 9) + 1) : ((old + 5) % 10));
    }
    return `${prefix}${body.slice(-2)}${letter}`;
  }

  function createCase(level, referenceDate = new Date(), random = Math.random) {
    const missionStartedAt = referenceDate.toISOString();
    const dobData = createDob(level, referenceDate, random);
    const reference = {
      name: "Amelia Galea",
      id: createPatientId(dobData, new Set(), random),
      dob: dobData.display,
      dobData,
      test: "Throat culture",
      specimen: "Throat swab"
    };
    let incorrect;
    if (level === "junior") {
      let otherDob = createDob(level, referenceDate, random);
      if (otherDob.display === reference.dob) {
        const nextDay = otherDob.day === 28 ? 1 : otherDob.day + 1;
        otherDob = { ...otherDob, day: nextDay, display: `${pad(nextDay)}/${pad(otherDob.month)}/${otherDob.year}` };
      }
      incorrect = { name: "Maya Borg", id: createPatientId(otherDob, new Set([reference.id]), random), dob: otherDob.display, dobData: otherDob, test: "Throat culture", specimen: "Throat swab" };
    } else {
      incorrect = { ...reference, id: makeDifferentId(reference, level === "challenge", random) };
    }
    const correct = { ...reference, correct: true, key: "set-a" };
    incorrect = { ...incorrect, correct: false, key: "set-b" };
    const candidates = random() < 0.5 ? [correct, incorrect] : [incorrect, correct];
    return { missionStartedAt, level, reference, candidates };
  }

  function initialState() {
    return {
      version: 1, age: null, mission: 0, completed: [], patientCase: null,
      feedback: "", ppe: [], selectedPpe: null, mission5: { step: 0 }, mission6: { step: 0 },
      mission7: { step: 0 }, gram: { mode: null, step: 0, paused: false, complete: false },
      mission9: { placed: false }, mission10: { step: 0 }, selectedAnswers: {},
      matching: { carrierOpen: false, clueSeen: false, expanded: null, mismatch: [], accepted: null, racked: false }
    };
  }

  function canEnterMission(state, mission) {
    if (mission <= state.mission) return true;
    return state.completed.includes(mission - 1);
  }

  return { LEVELS, GRAM_STEPS, randomInteger, createDob, createPatientId, isPatientIdValid, identityMismatchFields, createCase, initialState, canEnterMission };
});
