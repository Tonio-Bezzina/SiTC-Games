(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HistologyLogic = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const LEVELS = Object.freeze({
    junior: Object.freeze({ label: "Junior", guidance: "More guidance", minAge: 7, maxAge: 9 }),
    explorer: Object.freeze({ label: "Explorer", guidance: "Some guidance", minAge: 10, maxAge: 12 }),
    challenge: Object.freeze({ label: "Challenge", guidance: "Fewer clues", minAge: 13, maxAge: 16 })
  });

  const MISSION2_CORRECT_CHOICE = "cut-cassette";

  function createMission2State() {
    return {
      choice: null,
      step: "question",
      scalpelSelected: false,
      tissueSelected: false,
      complete: false
    };
  }

  function applyMission2Action(current, action, value) {
    const state = { ...createMission2State(), ...(current || {}) };
    if (action === "choose") {
      if (state.step !== "question") return state;
      if (value !== MISSION2_CORRECT_CHOICE) return { ...state, choice: value };
      return { ...state, choice: value, step: "cutting", scalpelSelected: false };
    }
    if (action === "select-scalpel" && state.step === "cutting") {
      return { ...state, scalpelSelected: !state.scalpelSelected };
    }
    if (action === "cut" && state.step === "cutting" && state.scalpelSelected) {
      return { ...state, step: "transfer", scalpelSelected: false };
    }
    if (action === "select-tissue" && state.step === "transfer") {
      return { ...state, tissueSelected: !state.tissueSelected };
    }
    if (action === "place-tissue" && state.step === "transfer" && (state.tissueSelected || value === "drop")) {
      return { ...state, step: "loaded", tissueSelected: false };
    }
    if (action === "close-cassette" && state.step === "loaded") {
      return { ...state, step: "complete", complete: true };
    }
    return state;
  }

  const MISSION3_CORRECT_CHOICE = "processor-embedding";

  function createMission3State() {
    return { choice: null, step: "question", blockCreated: false, complete: false };
  }

  function applyMission3Action(current, action, value) {
    const state = { ...createMission3State(), ...(current || {}) };
    if (action === "choose" && state.step === "question") {
      if (value !== MISSION3_CORRECT_CHOICE) return { ...state, choice: value };
      return { ...state, choice: value, step: "processing" };
    }
    if (action === "advance") {
      if (state.step === "processing") return { ...state, step: "embedding" };
      if (state.step === "embedding") return { ...state, step: "reveal", blockCreated: true, complete: true };
      if (state.step === "reveal") return { ...state, blockCreated: true, complete: true };
    }
    if (action === "resume-safe" && ["reveal", "complete"].includes(state.step)) {
      return { ...state, step: "reveal", blockCreated: true, complete: true };
    }
    return state;
  }

  const MISSION4_CORRECT_CHOICE = "microtome";

  function createMission4State() {
    return {
      choice: null,
      step: "question",
      blockLoaded: false,
      sectionCut: false,
      sectionRevealed: false,
      complete: false
    };
  }

  function applyMission4Action(current, action, value) {
    const state = { ...createMission4State(), ...(current || {}) };
    if (action === "choose" && state.step === "question") {
      if (value !== MISSION4_CORRECT_CHOICE) return { ...state, choice: value };
      return { ...state, choice: value, step: "microtome_selected" };
    }
    if (action === "advance") {
      if (state.step === "microtome_selected") return { ...state, step: "block_loaded", blockLoaded: true };
      if (state.step === "block_loaded") return { ...state, step: "section_cut", blockLoaded: true, sectionCut: true };
      if (state.step === "section_cut") return { ...state, step: "section_revealed", blockLoaded: true, sectionCut: true, sectionRevealed: true };
      if (state.step === "section_revealed") return { ...state, step: "complete", blockLoaded: true, sectionCut: true, sectionRevealed: true, complete: true };
    }
    if (action === "resume-safe") {
      if (state.step === "microtome_selected") return { ...state, step: "block_loaded", blockLoaded: true };
      if (state.step === "section_cut") return { ...state, step: "section_revealed", blockLoaded: true, sectionCut: true, sectionRevealed: true };
    }
    return state;
  }

  const MISSION5_CORRECT_CHOICE = "glass-slide";

  function createMission5State() {
    return {
      choice: null,
      step: "question",
      sectionSelected: false,
      sectionOnSlide: false,
      revealed: false,
      complete: false
    };
  }

  function applyMission5Action(current, action, value) {
    const state = { ...createMission5State(), ...(current || {}) };
    if (action === "choose" && state.step === "question") {
      if (value !== MISSION5_CORRECT_CHOICE) return { ...state, choice: value };
      return { ...state, choice: value, step: "transfer_ready" };
    }
    if (action === "select-section" && state.step === "transfer_ready") {
      return { ...state, sectionSelected: !state.sectionSelected };
    }
    if (action === "place-section" && state.step === "transfer_ready" && (state.sectionSelected || value === "drop")) {
      return { ...state, step: "section_on_slide", sectionSelected: false, sectionOnSlide: true };
    }
    if (action === "advance") {
      if (state.step === "section_on_slide") return { ...state, step: "unstained_slide_reveal", sectionOnSlide: true, revealed: true };
      if (state.step === "unstained_slide_reveal") return { ...state, step: "complete", sectionOnSlide: true, revealed: true, complete: true };
    }
    if (action === "resume-safe" && state.step === "section_on_slide") {
      return { ...state, step: "unstained_slide_reveal", sectionSelected: false, sectionOnSlide: true, revealed: true };
    }
    return state;
  }

  function createMission6State() {
    return {
      step: "transfer_ready",
      slideSelected: false,
      slideInMachine: false,
      machineStarted: false,
      stainingComplete: false,
      complete: false
    };
  }

  function applyMission6Action(current, action, value) {
    const state = { ...createMission6State(), ...(current || {}) };
    if (action === "select-slide" && state.step === "transfer_ready") {
      return { ...state, slideSelected: !state.slideSelected };
    }
    if (action === "place-slide" && state.step === "transfer_ready" && (state.slideSelected || value === "drop")) {
      return { ...state, step: "slide_in_machine", slideSelected: false, slideInMachine: true };
    }
    if (action === "advance") {
      if (state.step === "slide_in_machine") return { ...state, step: "staining", slideInMachine: true, machineStarted: true };
      if (state.step === "staining") return { ...state, step: "stained_slides_ready", slideInMachine: true, machineStarted: true, stainingComplete: true };
      if (state.step === "stained_slides_ready") return { ...state, step: "complete", slideInMachine: true, machineStarted: true, stainingComplete: true, complete: true };
    }
    if (action === "resume-safe" && ["slide_in_machine", "staining"].includes(state.step)) {
      return { ...state, step: "stained_slides_ready", slideSelected: false, slideInMachine: true, machineStarted: true, stainingComplete: true };
    }
    return state;
  }

  const MISSION7_CORRECT_CHOICE = "slide-b";

  function createMission7State() {
    return { selectedSlide: null, hintOpen: false, correctSelected: false, finalReached: false, hubAwarded: false };
  }

  function applyMission7Action(current, action, value) {
    const state = { ...createMission7State(), ...(current || {}) };
    if (action === "toggle-hint" && !state.correctSelected) return { ...state, hintOpen: !state.hintOpen };
    if (action === "choose" && !state.correctSelected) {
      return value === MISSION7_CORRECT_CHOICE
        ? { ...state, selectedSlide: value, correctSelected: true }
        : { ...state, selectedSlide: value };
    }
    if (action === "finish" && state.correctSelected) return { ...state, finalReached: true };
    if (action === "mark-awarded" && state.finalReached) return { ...state, hubAwarded: true };
    return state;
  }

  function journeyCanAward(completion) {
    return [1, 2, 3, 4, 5, 6, 7].every((number) => completion && completion[`mission${number}Complete`] === true);
  }

  function withHistologyHubCompletion(progress) {
    const safe = progress && typeof progress === "object" ? { ...progress } : {};
    const completedCases = safe.completedCases && typeof safe.completedCases === "object" ? { ...safe.completedCases } : {};
    const histology = Array.isArray(completedCases.histology) ? [...completedCases.histology] : [];
    if (!histology.includes("main")) histology.push("main");
    completedCases.histology = histology;
    return { ...safe, completedCases };
  }

  const FIRST_NAMES = Object.freeze([
    "Alex", "Amelia", "Daniel", "Elena", "Isaac", "Leah", "Maya", "Noah",
    "Rafael", "Sara", "Sofia", "Theo", "Yasmin", "Zachary"
  ]);
  const LAST_NAMES = Object.freeze([
    "Agius", "Borg", "Camilleri", "Galea", "Mifsud", "Muscat", "Sammut", "Vella", "Zammit"
  ]);

  function randomInteger(minimum, maximum, rng = Math.random) {
    return Math.floor(rng() * (maximum - minimum + 1)) + minimum;
  }

  function randomItem(items, rng = Math.random) {
    return items[randomInteger(0, items.length - 1, rng)];
  }

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function parseDisplayDate(dateOfBirth) {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(dateOfBirth));
    if (!match) return null;
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    if (month < 1 || month > 12 || day < 1 || day > 28 || year < 1900) return null;
    return { day, month, year };
  }

  function formatDisplayDate(day, month, year) {
    return `${pad2(day)}/${pad2(month)}/${year}`;
  }

  function ageOn(dateOfBirth, referenceDate) {
    const dob = parseDisplayDate(dateOfBirth);
    const ref = new Date(referenceDate);
    if (!dob || Number.isNaN(ref.getTime())) return NaN;
    let age = ref.getUTCFullYear() - dob.year;
    const refMonth = ref.getUTCMonth() + 1;
    const refDay = ref.getUTCDate();
    if (refMonth < dob.month || (refMonth === dob.month && refDay < dob.day)) age -= 1;
    return age;
  }

  function createDateOfBirth(level, missionStartedAt, rng = Math.random) {
    const config = LEVELS[level];
    if (!config) throw new Error(`Unknown level: ${level}`);
    const reference = new Date(missionStartedAt);
    if (Number.isNaN(reference.getTime())) throw new Error("Invalid mission reference date");
    const targetAge = randomInteger(config.minAge, config.maxAge, rng);
    const month = randomInteger(1, 12, rng);
    const day = randomInteger(1, 28, rng);
    const birthdayHasOccurred = month < reference.getUTCMonth() + 1
      || (month === reference.getUTCMonth() + 1 && day <= reference.getUTCDate());
    const year = reference.getUTCFullYear() - targetAge - (birthdayHasOccurred ? 0 : 1);
    return formatDisplayDate(day, month, year);
  }

  function createPatientId(dateOfBirth, usedIds = new Set(), rng = Math.random) {
    const parsed = parseDisplayDate(dateOfBirth);
    if (!parsed) throw new Error("A valid DD/MM/YYYY birthday is required before creating an ID no.");
    const yearSuffix = String(parsed.year).slice(-2);
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const numericLength = randomInteger(4, 7, rng);
      const prefixLength = numericLength - 2;
      let prefix = String(randomInteger(1, 9, rng));
      while (prefix.length < prefixLength) prefix += String(randomInteger(0, 9, rng));
      const id = `${prefix}${yearSuffix}${randomItem(["H", "L"], rng)}`;
      if (!usedIds.has(id)) return id;
    }
    throw new Error("Could not create a unique patient ID no.");
  }

  function isPatientIdValid(id, dateOfBirth) {
    const parsed = parseDisplayDate(dateOfBirth);
    if (!parsed || !/^\d{4,7}[HL]$/.test(String(id))) return false;
    return String(id).slice(0, -1).endsWith(String(parsed.year).slice(-2));
  }

  function createName(excluded = new Set(), rng = Math.random) {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const name = `${randomItem(FIRST_NAMES, rng)} ${randomItem(LAST_NAMES, rng)}`;
      if (!excluded.has(name)) return name;
    }
    throw new Error("Could not create a unique fictional patient name");
  }

  function createReferenceIdentity(level, missionStartedAt, rng = Math.random) {
    const dob = createDateOfBirth(level, missionStartedAt, rng);
    return {
      name: createName(new Set(), rng),
      id: createPatientId(dob, new Set(), rng),
      dob,
      specimen: "Skin",
      investigation: "Histology"
    };
  }

  function makeClearlyDifferentId(reference, usedIds, rng = Math.random) {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const candidate = createPatientId(reference.dob, usedIds, rng);
      if (candidate !== reference.id && candidate.slice(0, -3) !== reference.id.slice(0, -3)) return candidate;
    }
    throw new Error("Could not create a clearly different ID no.");
  }

  function makeSubtlyDifferentId(reference) {
    const finalLetter = reference.id.endsWith("H") ? "L" : "H";
    return `${reference.id.slice(0, -1)}${finalLetter}`;
  }

  function createIncorrectCandidate(reference, level, missionStartedAt, usedIds = new Set(), rng = Math.random) {
    const candidate = { specimen: reference.specimen, investigation: reference.investigation };
    if (level === "junior") {
      candidate.name = createName(new Set([reference.name]), rng);
      do {
        candidate.dob = createDateOfBirth(level, missionStartedAt, rng);
      } while (candidate.dob === reference.dob);
      candidate.id = createPatientId(candidate.dob, usedIds, rng);
    } else if (level === "explorer") {
      candidate.name = reference.name;
      candidate.dob = reference.dob;
      candidate.id = makeClearlyDifferentId(reference, usedIds, rng);
    } else if (level === "challenge") {
      candidate.name = reference.name;
      candidate.dob = reference.dob;
      candidate.id = makeSubtlyDifferentId(reference);
      if (usedIds.has(candidate.id)) throw new Error("Subtle ID no. is not unique");
    } else {
      throw new Error(`Unknown level: ${level}`);
    }
    return candidate;
  }

  function normalizeIdentity(identity) {
    return {
      name: String(identity.name || "").trim(),
      id: String(identity.id || "").trim(),
      dob: String(identity.dob || "").trim()
    };
  }

  function identityMismatchFields(reference, candidate) {
    const expected = normalizeIdentity(reference);
    const actual = normalizeIdentity(candidate);
    return ["name", "id", "dob"].filter((field) => actual[field] !== expected[field]);
  }

  function isCorrectCandidate(reference, candidate) {
    return identityMismatchFields(reference, candidate).length === 0;
  }

  function orderCandidates(correct, incorrect, rng = Math.random) {
    return rng() < 0.5 ? [correct, incorrect] : [incorrect, correct];
  }

  function createCase(level, missionStartedAt = new Date().toISOString(), rng = Math.random) {
    const reference = createReferenceIdentity(level, missionStartedAt, rng);
    const correct = { ...reference };
    const usedIds = new Set([reference.id]);
    const incorrect = createIncorrectCandidate(reference, level, missionStartedAt, usedIds, rng);
    return {
      missionStartedAt,
      level,
      reference,
      candidates: orderCandidates(correct, incorrect, rng),
      accession: `HIST-${String(randomInteger(100000, 999999, rng))}`
    };
  }

  function changeCaseLevel(existingCase, level, rng = Math.random) {
    if (!existingCase || !existingCase.reference) throw new Error("Existing case is required");
    const correct = { ...existingCase.reference };
    const usedIds = new Set([correct.id]);
    const incorrect = createIncorrectCandidate(
      existingCase.reference,
      level,
      existingCase.missionStartedAt,
      usedIds,
      rng
    );
    return {
      ...existingCase,
      level,
      candidates: orderCandidates(correct, incorrect, rng)
    };
  }

  return Object.freeze({
    LEVELS,
    MISSION2_CORRECT_CHOICE,
    MISSION3_CORRECT_CHOICE,
    MISSION4_CORRECT_CHOICE,
    MISSION5_CORRECT_CHOICE,
    MISSION7_CORRECT_CHOICE,
    applyMission2Action,
    applyMission3Action,
    applyMission4Action,
    applyMission5Action,
    applyMission6Action,
    applyMission7Action,
    ageOn,
    changeCaseLevel,
    createCase,
    createDateOfBirth,
    createIncorrectCandidate,
    createMission2State,
    createMission3State,
    createMission4State,
    createMission5State,
    createMission6State,
    createMission7State,
    createPatientId,
    formatDisplayDate,
    identityMismatchFields,
    journeyCanAward,
    orderCandidates,
    isCorrectCandidate,
    isPatientIdValid,
    parseDisplayDate,
    randomInteger,
    withHistologyHubCompletion
  });
});
