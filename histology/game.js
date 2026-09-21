(function () {
  "use strict";

  const L = window.HistologyLogic;
  const app = document.getElementById("app");
  const announcer = document.getElementById("announcer");
  const orientationBlocker = document.getElementById("orientationBlocker");
  const STORAGE_KEY = "sitcHistologyMission1V1";
  const HUB_STORAGE_KEY = "sitcGameProgressV2";
  const VERSION = 7;
  let pendingFocus = null;
  let cutStart = null;
  let sequenceTimer = null;
  let lastRenderedScreen = null;

  function initialState() {
    return {
      version: VERSION,
      screen: "level",
      level: null,
      caseData: null,
      expandedIndex: null,
      mismatchFields: [],
      acceptedIndex: null,
      selectedTransfer: false,
      racked: false,
      clueSeen: false,
      hintOpen: false,
      mission1Complete: false,
      forceReplay: false,
      feedback: "",
      feedbackType: "",
      currentMission: 1,
      mission2: L.createMission2State(),
      mission2Complete: false,
      mission3: L.createMission3State(),
      mission3Complete: false,
      mission4: L.createMission4State(),
      mission4Complete: false,
      mission5: L.createMission5State(),
      mission5Complete: false,
      mission6: L.createMission6State(),
      mission6Complete: false,
      mission7: L.createMission7State(),
      mission7Complete: false
    };
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved || (saved.caseData && !validCase(saved.caseData))) return initialState();
      if (![1, 2, 3, 4, 5, 6, VERSION].includes(saved.version)) return initialState();
      const mission3 = { ...L.createMission3State(), ...(saved.mission3 || {}) };
      const mission4 = { ...L.createMission4State(), ...(saved.mission4 || {}) };
      const mission5 = { ...L.createMission5State(), ...(saved.mission5 || {}) };
      const mission6 = { ...L.createMission6State(), ...(saved.mission6 || {}) };
      const mission7 = { ...L.createMission7State(), ...(saved.mission7 || {}) };
      return {
        ...initialState(),
        ...saved,
        version: VERSION,
        mission2: { ...L.createMission2State(), ...(saved.mission2 || {}) },
        mission3: L.applyMission3Action(mission3, "resume-safe"),
        mission4: L.applyMission4Action(mission4, "resume-safe"),
        mission5: L.applyMission5Action(mission5, "resume-safe"),
        mission6: L.applyMission6Action(mission6, "resume-safe"),
        mission7,
        screen: "level",
        forceReplay: false
      };
    } catch (_) {
      return initialState();
    }
  }

  function validCase(caseData) {
    if (!caseData || !caseData.reference || !Array.isArray(caseData.candidates) || caseData.candidates.length !== 2) return false;
    const people = [caseData.reference, ...caseData.candidates];
    return people.every((person) => person && person.name && L.parseDisplayDate(person.dob) && L.isPatientIdValid(person.id, person.dob));
  }

  let state = loadState();

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {
      announce("Your browser could not save this case, but you can continue playing.");
    }
  }

  function announce(message) {
    announcer.textContent = "";
    requestAnimationFrame(() => { announcer.textContent = message; });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[character]);
  }

  function levelConfig(level = state.level) {
    return L.LEVELS[level] || L.LEVELS.junior;
  }

  function resetActivity() {
    state.expandedIndex = null;
    state.mismatchFields = [];
    state.acceptedIndex = null;
    state.selectedTransfer = false;
    state.racked = false;
    state.clueSeen = false;
    state.hintOpen = false;
    state.mission1Complete = false;
    state.feedback = "";
    state.feedbackType = "";
    state.currentMission = 1;
    state.mission2 = L.createMission2State();
    state.mission2Complete = false;
    state.mission3 = L.createMission3State();
    state.mission3Complete = false;
    state.mission4 = L.createMission4State();
    state.mission4Complete = false;
    state.mission5 = L.createMission5State();
    state.mission5Complete = false;
    state.mission6 = L.createMission6State();
    state.mission6Complete = false;
    state.mission7 = L.createMission7State();
    state.mission7Complete = false;
  }

  function resumeScreen() {
    if (state.mission7Complete) return "journey-complete";
    if (state.currentMission === 7 && state.mission6Complete) return "mission7";
    if (state.mission6Complete) return "mission6-complete";
    if (state.currentMission === 6 && state.mission5Complete) return "mission6";
    if (state.mission5Complete) return "mission5-complete";
    if (state.currentMission === 5 && state.mission4Complete) return "mission5";
    if (state.mission4Complete) return "mission4-complete";
    if (state.currentMission === 4 && state.mission3Complete) return "mission4";
    if (state.mission3Complete) return "mission3-complete";
    if (state.currentMission === 3 && state.mission2Complete) return "mission3";
    if (state.mission2Complete) return "mission2-complete";
    if (state.currentMission === 2 && state.mission1Complete) return "mission2";
    if (state.mission1Complete) return "mission1-complete";
    return "mission1";
  }

  function chooseLevel(level) {
    if (!L.LEVELS[level]) return;
    const needsNewCase = !state.caseData;
    const levelChanged = state.level && state.level !== level;
    if (needsNewCase) {
      state.caseData = L.createCase(level);
      resetActivity();
    } else if (state.forceReplay) {
      state.caseData = L.changeCaseLevel(state.caseData, level);
      resetActivity();
    } else if (levelChanged && !state.mission1Complete) {
      state.caseData = L.changeCaseLevel(state.caseData, level);
      resetActivity();
    }
    state.level = level;
    state.caseData.level = level;
    state.screen = resumeScreen();
    state.forceReplay = false;
    if (state.screen === "mission1") state.feedback = state.clueSeen ? "Choose a complete sample set to inspect." : "";
    save();
    render();
  }

  function missionHeader(number = 1, title = "Check the Patient Details") {
    return `
      <header class="game-bar">
        <a class="back-link" href="../">← All laboratories</a>
        <div class="game-heading">
          <span>Histology</span>
          <strong>${escapeHtml(title)}</strong>
        </div>
        <div class="mission-progress" aria-label="Mission ${number} of 7">
          <span>Mission</span><strong>${number} / 7</strong>
        </div>
        <button class="level-control" type="button" data-action="show-levels">Level: ${escapeHtml(levelConfig().label)}</button>
      </header>`;
  }

  function levelScreen() {
    const saved = state.caseData && state.level;
    const cards = Object.entries(L.LEVELS).map(([key, config], index) => {
      const isSaved = saved && state.level === key && !state.forceReplay;
      return `
        <button class="level-card level-${key}" type="button" data-action="choose-level" data-value="${key}">
          <span class="level-dots" aria-hidden="true">${"●".repeat(index + 1)}</span>
          <strong>${config.label}</strong>
          <span>${config.guidance}</span>
          ${isSaved ? `<em>${state.mission1Complete ? "Completed case saved" : "Continue saved case"}</em>` : ""}
        </button>`;
    }).join("");
    return `
      <main class="level-screen" id="mainContent">
        <div class="level-backdrop" aria-hidden="true"></div>
        <a class="level-back-link" href="../">← All laboratories</a>
        <section class="level-copy" aria-labelledby="levelTitle">
          <p class="eyebrow">HISTOLOGY</p>
          <h1 id="levelTitle">The Histology Journey</h1>
          <p class="level-intro">Follow a skin sample through the laboratory, beginning with the most important first check: making sure it belongs to the right patient.</p>
          <div class="level-guide">
            <img src="assets/shared/scientist-guide-neutral.png" alt="Your laboratory scientist guide">
          </div>
        </section>
        <section class="level-picker" aria-labelledby="difficultyTitle">
          <p class="eyebrow">CHOOSE YOUR CHALLENGE</p>
          <h2 id="difficultyTitle">Choose a difficulty</h2>
          <p>Select how much guidance you would like. You can retry and ask for help at every level.</p>
          <div class="level-grid">${cards}</div>
          <p class="reassurance"><img src="assets/shared/hint-icon.svg" alt=""> Careful checking matters more than speed.</p>
        </section>
      </main>`;
  }

  function mismatchIcon(field, mismatches) {
    return mismatches.includes(field)
      ? `<img class="mismatch-icon" src="assets/mission-1/field-mismatch-marker.svg" alt="Does not match">`
      : "";
  }

  function identityFields(identity, mismatches = [], compact = false) {
    const rows = [
      ["name", "Patient name", identity.name],
      ["id", "ID no.", identity.id],
      ["dob", "Date of birth", identity.dob]
    ];
    if (!compact) {
      rows.push(["specimen", "Specimen", identity.specimen || "Skin"]);
      rows.push(["investigation", "Requested investigation", identity.investigation || "Histology"]);
    }
    return rows.map(([field, label, value]) => `
      <div class="identity-field ${mismatches.includes(field) ? "mismatch" : ""}" data-field="${field}">
        <span>${label}</span><strong>${escapeHtml(value)}</strong>${mismatchIcon(field, mismatches)}
      </div>`).join("");
  }

  function specimenLabelFields(identity, mismatches = []) {
    return [
      ["name", identity.name],
      ["id", identity.id]
    ].map(([field, value]) => `
      <div class="identity-field ${mismatches.includes(field) ? "mismatch" : ""}" data-field="${field}">
        <strong>${escapeHtml(value)}</strong>${mismatchIcon(field, mismatches)}
      </div>`).join("");
  }

  function referencePanel() {
    const mismatches = state.mismatchFields;
    return `
      <aside class="reference-panel" aria-labelledby="referenceTitle">
        <div class="reference-heading"><span>REFERENCE</span><h2 id="referenceTitle">Laboratory request</h2></div>
        <div class="monitor-wrap">
          <img src="assets/mission-1/request-monitor-frame.png" alt="Laboratory request monitor">
          <div class="monitor-screen">${identityFields(state.caseData.reference, mismatches)}</div>
        </div>
      </aside>`;
  }

  function specimenPot(identity, mismatches, rejected = false) {
    return `
      <div class="specimen-pot ${rejected ? "rejected" : ""}">
        <img class="pot-tissue" src="assets/mission-1/skin-specimen-sample.png" alt="">
        <img class="pot-shell" src="assets/mission-1/skin-specimen-container-closed.png" alt="Sealed skin-specimen container">
        <img class="pot-label-art" src="assets/mission-1/specimen-container-label-blank.svg" alt="">
        <div class="pot-label" aria-label="Specimen container label">${specimenLabelFields(identity, mismatches)}</div>
      </div>`;
  }

  function requestPaper(identity, mismatches) {
    return `
      <div class="paper-request">
        <img src="assets/mission-1/paper-request-blank.png?v=2" alt="Histology paper request form">
        <div class="paper-fields">${identityFields(identity, mismatches, true)}</div>
      </div>`;
  }

  function sampleStation(candidate, index) {
    const open = state.expandedIndex === index;
    const mismatches = open ? state.mismatchFields : [];
    return `
      <article class="sample-station ${open ? "expanded" : ""}">
        <img class="station-tray" src="assets/mission-1/sample-station-tray.png" alt="">
        <button class="inspect-set" type="button" data-action="inspect" data-value="${index}" aria-expanded="${open}" aria-controls="stationDetails${index}">
          <span class="station-name">Sample set ${index + 1}</span>
          <span class="station-summary">
            ${specimenPot(candidate, mismatches)}
            ${requestPaper(candidate, mismatches)}
          </span>
          <span class="inspect-prompt">${open ? "Reviewing complete set" : "Inspect container and request"}</span>
        </button>
        <div id="stationDetails${index}" class="station-actions" ${open ? "" : "hidden"}>
          <button class="primary-button" type="button" data-action="select-candidate" data-value="${index}">Select this sample</button>
          <button class="secondary-button" type="button" data-action="compare-other" data-value="${index}">Compare other sample</button>
        </div>
      </article>`;
  }

  function clueOverlay() {
    if (state.clueSeen) return "";
    return `
      <div class="clue-overlay" role="dialog" aria-modal="true" aria-labelledby="clueTitle">
        <div class="clue-card">
          <img class="clue-scientist" src="assets/shared/scientist-guide-pointing.png" alt="Scientist pointing toward the guide strip">
          <img class="clue-arrow" src="assets/shared/focus-arrow.svg" alt="">
          <div><p class="eyebrow">YOUR GUIDE</p><h2 id="clueTitle">Look here for clues</h2><p>Look here for clues to help you complete your mission.</p><button class="primary-button" type="button" data-action="dismiss-clue">Show the samples</button></div>
        </div>
      </div>`;
  }

  function guidanceText() {
    if (state.hintOpen) {
      if (state.level === "junior") return "Check the name and ID no. on all three surfaces, then check the date of birth on the monitor and paper request.";
      if (state.level === "explorer") return "The name may look right. Compare every digit of the ID no. as well as the birthday.";
      return "Read the ID no. character by character. A very small difference still means the sample must not be accepted.";
    }
    if (state.acceptedIndex !== null && !state.racked) return "The details match. Move the accepted container to the receiving and scanning rack.";
    if (state.racked) return "The matching specimen has been received safely. You may continue.";
    return "Compare the monitor with each container label and paper request before you select a sample.";
  }

  function guideStrip() {
    return `
      <footer class="guide-strip" aria-label="Scientist guide">
        <img src="assets/shared/guide-strip-avatar.png" alt="">
        <div><strong>Scientist guide</strong><p>${guidanceText()}</p></div>
        ${state.acceptedIndex === null ? `<button class="hint-button" type="button" data-action="toggle-hint" aria-pressed="${state.hintOpen}"><img src="assets/shared/hint-icon.svg" alt=""> ${state.hintOpen ? "Hide help" : "Need help?"}</button>` : ""}
      </footer>`;
  }

  function selectionWorkspace() {
    const stations = state.caseData.candidates.map(sampleStation).join("");
    return `
      <div class="mission-scene selection-scene">
        <img class="scene-background" src="assets/mission-1/reception-background.png" alt="Histology specimen reception laboratory">
        <div class="scene-shade" aria-hidden="true"></div>
        <div class="mission-title-card">
          <p class="eyebrow">SPECIMEN RECEPTION &amp; IDENTIFICATION</p>
          <h1>Check the Patient Details</h1>
          <p>“Do the patient details on the sample match the form?”</p>
        </div>
        <div class="comparison-workspace">
          ${referencePanel()}
          <section class="candidate-panel" aria-labelledby="candidateTitle">
            <div class="candidate-heading"><span>COMPARE</span><h2 id="candidateTitle">Choose the matching complete set</h2></div>
            <div class="station-grid">${stations}</div>
          </section>
        </div>
        ${state.feedback ? `<div class="feedback ${state.feedbackType}" role="status">${escapeHtml(state.feedback)}</div>` : ""}
      </div>`;
  }

  function transferWorkspace() {
    const accepted = state.caseData.candidates[state.acceptedIndex];
    const rejectedIndex = state.acceptedIndex === 0 ? 1 : 0;
    const rejected = state.caseData.candidates[rejectedIndex];
    return `
      <div class="mission-scene transfer-scene">
        <img class="scene-background" src="assets/mission-1/reception-background.png" alt="Histology specimen reception laboratory">
        <div class="scene-shade" aria-hidden="true"></div>
        <div class="mission-title-card transfer-title">
          <p class="eyebrow">PATIENT MATCHED</p>
          <h1>Matched! This sample belongs to ${escapeHtml(accepted.name)}.</h1>
          <p>Move the accepted specimen to the receiving and scanning rack.</p>
        </div>
        <div class="transfer-workspace">
          <aside class="rejected-card" aria-label="Rejected set remains at reception">
            <img src="assets/mission-1/rejected-set-marker.svg" alt="Rejected">
            <div><strong>Rejected set — remains at reception.</strong><span>Sample set ${rejectedIndex + 1}</span></div>
            ${specimenPot(rejected, [], true)}
          </aside>
          <button class="accepted-sample ${state.selectedTransfer ? "selected" : ""} ${state.racked ? "transferred" : ""}" type="button" data-action="toggle-transfer" draggable="${!state.racked}" aria-pressed="${state.selectedTransfer}" aria-label="Accepted specimen for ${escapeHtml(accepted.name)}. Select it, or drag it to the receiving rack.">
            ${specimenPot(accepted, [])}
            <span>${state.racked ? "Accepted specimen scanned" : state.selectedTransfer ? "Selected — now choose the rack" : "Select or drag accepted specimen"}</span>
          </button>
          <button class="receiving-rack ${state.selectedTransfer ? "ready" : ""} ${state.racked ? "complete" : ""}" type="button" data-action="rack-sample" data-drop="rack" aria-label="Receiving and scanning rack${state.racked ? ", accepted specimen scanned" : ". Select after choosing the accepted specimen, or drop it here."}">
            <img src="assets/mission-1/${state.racked ? "receiving-scanning-rack-accepted.png" : "receiving-scanning-rack-empty.png"}" alt="${state.racked ? "Rack holding the accepted specimen" : "Empty receiving and scanning rack"}">
            <img class="scan-light" src="assets/mission-1/barcode-scan-light.svg" alt="">
            <span>${state.racked ? "✓ Accepted specimen scanned" : "Receiving / scanning rack"}</span>
          </button>
        </div>
        ${state.feedback ? `<div class="feedback ${state.feedbackType}" role="status">${escapeHtml(state.feedback)}</div>` : ""}
        <div class="next-area"><button class="primary-button next-button" type="button" data-action="mission-next" ${state.racked ? "" : "disabled"}>NEXT →</button></div>
      </div>`;
  }

  function missionScreen() {
    return `
      ${missionHeader()}
      <main class="game-main" id="mainContent">
        ${state.acceptedIndex === null ? selectionWorkspace() : transferWorkspace()}
      </main>
      ${guideStrip()}
      ${clueOverlay()}`;
  }

  function caseIdentityChip() {
    const patient = state.caseData.reference;
    return `<div class="case-chip" aria-label="Current patient case"><strong>${escapeHtml(patient.name)}</strong><span>ID no. ${escapeHtml(patient.id)}</span><span>DOB ${escapeHtml(patient.dob)}</span><span>${escapeHtml(state.caseData.accession)}</span></div>`;
  }

  function mission2Feedback() {
    return state.feedback ? `<div class="feedback ${state.feedbackType}" role="status">${escapeHtml(state.feedback)}</div>` : "";
  }

  function mission2Choices() {
    const choices = [
      ["cut-cassette", "Cut a small piece and put it in a cassette"],
      ["staining", "Put the whole sample straight into the staining machine"],
      ["microscope", "Put the whole sample under the microscope"]
    ];
    return `<div class="choice-grid" aria-label="Choose the next laboratory step">${choices.map(([value, label]) => `
      <button class="choice-button ${state.mission2.choice === value ? "was-chosen" : ""}" type="button" data-action="mission2-choice" data-value="${value}">${label}</button>`).join("")}</div>`;
  }

  function mission2Bench() {
    const step = state.mission2.step;
    const cut = ["transfer", "loaded", "complete"].includes(step);
    const loaded = ["loaded", "complete"].includes(step);
    const complete = step === "complete";
    return `
      <div class="grossing-workspace">
        <section class="cutting-zone" data-cut-zone aria-label="Cutting board with the accepted skin specimen">
          <img class="cutting-board" src="assets/mission-2/cutting-board-clean.png" alt="Clean histology cutting board">
          <img class="board-tissue main-tissue" src="assets/mission-2/${cut ? "skin-tissue-cut-main.png" : "skin-tissue-whole.png"}" alt="${cut ? "Main piece of the cut skin specimen" : "Whole accepted skin specimen"}">
          ${step === "cutting" ? `<img class="cut-guide" src="assets/mission-2/cut-guide.svg" alt="Wide gold cutting guide. Swipe across it or use Cut along the guide.">` : ""}
          ${step === "transfer" ? `<button class="small-tissue ${state.mission2.tissueSelected ? "selected" : ""}" type="button" data-action="mission2-select-tissue" draggable="true" aria-pressed="${state.mission2.tissueSelected}" aria-label="Small cut tissue piece. Select or drag it into the cassette."><img src="assets/mission-2/skin-tissue-small-piece.png" alt=""><span>${state.mission2.tissueSelected ? "Selected" : "Small tissue piece"}</span></button>` : ""}
        </section>
        <div class="grossing-tools">
          <button class="scalpel-tool ${state.mission2.scalpelSelected ? "selected" : ""}" type="button" data-action="mission2-select-scalpel" aria-pressed="${state.mission2.scalpelSelected}" ${step === "cutting" ? "" : "disabled"}>
            <img src="assets/mission-2/virtual-scalpel.png" alt="Child-safe virtual scalpel"><span>${state.mission2.scalpelSelected ? "Scalpel selected" : "Select virtual scalpel"}</span>
          </button>
          <button class="cassette-target ${state.mission2.tissueSelected ? "ready" : ""} ${loaded ? "loaded" : ""}" type="button" data-action="mission2-place-tissue" data-drop="cassette" ${step === "transfer" ? "" : "disabled"} aria-label="${loaded ? "Histology cassette containing the tissue" : "Open empty histology cassette. Place the small tissue piece here."}">
            <img src="assets/mission-2/${complete ? "histology-cassette-closed-loaded.png" : loaded ? "histology-cassette-open-loaded.png" : "histology-cassette-open-empty.png"}" alt="${complete ? "Closed cassette containing the patient tissue" : loaded ? "Open cassette containing the patient tissue" : "Open empty histology cassette"}"><span>${complete ? "Cassette closed safely" : loaded ? "Tissue inside cassette" : "Histology cassette"}</span>
          </button>
        </div>
      </div>`;
  }

  function mission2GuideText() {
    const step = state.mission2.step;
    if (step === "question") return "Choose the step that prepares a small piece of tissue for processing.";
    if (step === "cutting") return "Select the virtual scalpel, then swipe across the broad guide or use the accessible cut button.";
    if (step === "transfer") return "Great! Now drag your tissue into the cassette.";
    if (step === "loaded") return "The small piece is safely in place. Close the cassette to protect it.";
    return "Perfect! The tissue is safely inside its cassette.";
  }

  function mission2Screen() {
    const step = state.mission2.step;
    return `
      ${missionHeader(2, "Prepare the Tissue")}
      <main class="game-main" id="mainContent">
        <div class="mission-scene mission2-scene">
          <img class="scene-background" src="assets/mission-2/grossing-bench-background.png" alt="Clean histology grossing bench">
          <div class="scene-shade" aria-hidden="true"></div>
          <div class="mission-title-card">
            <p class="eyebrow">SPECIMEN PREPARATION / GROSSING</p>
            <h1>Prepare the Tissue</h1>
            <p>“The skin sample is too big. What should we do next?”</p>
          </div>
          ${caseIdentityChip()}
          ${step === "question" ? mission2Choices() : ""}
          ${mission2Bench()}
          <div class="mission2-actions">
            ${step === "cutting" ? `<button class="primary-button" type="button" data-action="mission2-cut" ${state.mission2.scalpelSelected ? "" : "disabled"}>Cut along the guide</button>` : ""}
            ${step === "loaded" ? `<button class="primary-button" type="button" data-action="mission2-close">Close cassette</button>` : ""}
            <button class="primary-button next-button" type="button" data-action="mission2-next" ${state.mission2.complete ? "" : "disabled"}>NEXT →</button>
          </div>
          ${mission2Feedback()}
        </div>
      </main>
      <footer class="guide-strip" aria-label="Scientist guide"><img src="assets/shared/guide-strip-avatar.png" alt=""><div><strong>Scientist guide</strong><p>${mission2GuideText()}</p></div></footer>`;
  }

  function mission2CompleteScreen() {
    const name = state.caseData.reference.name;
    return `
      ${missionHeader(2, "Prepare the Tissue")}
      <main class="chapter-complete" id="mainContent">
        <div class="complete-background" aria-hidden="true"></div>
        <section class="complete-card" aria-labelledby="mission2CompleteTitle">
          <img class="complete-scientist" src="assets/shared/scientist-guide-success.png" alt="Scientist guide congratulating you">
          <div class="complete-copy">
            <img class="complete-mark" src="assets/shared/success-check-icon.svg" alt="Completed">
            <p class="eyebrow">MISSION 2 COMPLETE</p>
            <h1 id="mission2CompleteTitle">The tissue is safely inside its cassette.</h1>
            <p>${escapeHtml(name)}'s accepted skin specimen is ready for processing.</p>
            <div class="next-preview"><strong>Next: Make a Wax Block</strong><span>Continue with the same patient's loaded cassette.</span></div>
            <div class="complete-actions">
              <button class="primary-button" type="button" data-action="start-mission3">Continue to Mission 3</button>
              <button class="secondary-button" type="button" data-action="review-mission2">Review Mission 2</button>
              <button class="secondary-button" type="button" data-action="review-mission1">Review Mission 1</button>
              <button class="secondary-button" type="button" data-action="new-case">Start a New Case</button>
              <a class="secondary-button button-link" href="../">Return to Game Hub</a>
            </div>
          </div>
        </section>
      </main>`;
  }

  function mission3Choices() {
    return `<div class="equipment-grid" aria-label="Choose the correct laboratory equipment">
      <button class="equipment-choice" type="button" data-action="mission3-choice" data-value="processor-embedding">
        <span class="equipment-pair"><img src="assets/mission-3/tissue-processor-idle.png" alt="Tissue processor"><img src="assets/mission-3/embedding-centre-idle.png" alt="Embedding centre"></span><strong>Processor &amp; Embedding Centre</strong>
      </button>
      <button class="equipment-choice" type="button" data-action="mission3-choice" data-value="microtome"><img src="assets/mission-3/microtome-choice-idle.png" alt="Microtome"><strong>Microtome</strong></button>
      <button class="equipment-choice" type="button" data-action="mission3-choice" data-value="staining"><img src="assets/mission-3/staining-machine-choice-idle.png" alt="Staining machine"><strong>Staining Machine</strong></button>
    </div>`;
  }

  function mission3ProcessView() {
    const step = state.mission3.step;
    if (step === "question") {
      return `<div class="mission-input-object"><img src="assets/mission-2/histology-cassette-closed-loaded.png" alt="Labelled cassette containing the accepted patient's tissue"><strong>Loaded histology cassette</strong></div>${mission3Choices()}`;
    }
    if (step === "processing") {
      return `<div class="process-stage"><img src="assets/mission-3/tissue-processor-active.png" alt="Cassette inside the active tissue processor"><div><h2>1. Process the tissue</h2><p>The cassette enters the processor so the tissue can be prepared for wax embedding.</p></div></div>`;
    }
    if (step === "embedding") {
      return `<div class="mould-sequence" aria-label="Tissue embedding sequence">
        <figure><img src="assets/mission-3/embedding-mould-empty.png" alt="Empty embedding mould"><figcaption>Embedding mould</figcaption></figure>
        <figure><img src="assets/mission-3/embedding-mould-tissue.png" alt="Patient tissue positioned in the mould"><figcaption>Position the tissue</figcaption></figure>
        <figure><img src="assets/mission-3/embedding-mould-wax-filled.png" alt="Mould filled with paraffin wax"><figcaption>Fill with wax and let it set</figcaption></figure>
      </div>`;
    }
    return `<div class="wax-block-reveal">
      <img src="assets/mission-3/ffpe-block-complete.png" alt="Completed FFPE wax block containing the patient tissue">
      <div><p class="eyebrow">WAX BLOCK</p><h2>FFPE Block</h2><p><strong>Formalin-Fixed Paraffin-Embedded Tissue</strong></p><p>“Look! We've made a wax block!”</p></div>
    </div>`;
  }

  function mission3GuideText() {
    const step = state.mission3.step;
    if (step === "question") return "Choose the equipment that prepares the tissue and embeds it in wax.";
    if (step === "processing") return "The cassette is inside the tissue processor.";
    if (step === "embedding") return "The prepared tissue is positioned in a mould and surrounded with wax.";
    return "Look! We've made a wax block!";
  }

  function mission3Screen() {
    return `
      ${missionHeader(3, "Make a Wax Block")}
      <main class="game-main" id="mainContent">
        <div class="mission-scene mission3-scene">
          <img class="scene-background" src="assets/mission-3/processing-lab-background.png" alt="Histology tissue processing laboratory">
          <div class="scene-shade" aria-hidden="true"></div>
          <div class="mission-title-card"><p class="eyebrow">TISSUE PROCESSING &amp; PARAFFIN EMBEDDING</p><h1>Make a Wax Block</h1><p>“Our tissue is in its cassette. Where should it go next?”</p></div>
          ${caseIdentityChip()}
          <img class="processing-path" src="assets/mission-3/processing-path-diagram.svg" alt="Tissue in cassette, then processing and embedding, then FFPE wax block">
          ${mission3ProcessView()}
          <div class="mission2-actions"><button class="primary-button next-button" type="button" data-action="mission3-next" ${state.mission3.complete ? "" : "disabled"}>NEXT →</button></div>
          ${mission2Feedback()}
        </div>
      </main>
      <footer class="guide-strip" aria-label="Scientist guide"><img src="assets/shared/guide-strip-avatar.png" alt=""><div><strong>Scientist guide</strong><p>${mission3GuideText()}</p></div></footer>`;
  }

  function mission3CompleteScreen() {
    return `
      ${missionHeader(3, "Make a Wax Block")}
      <main class="chapter-complete" id="mainContent"><div class="complete-background" aria-hidden="true"></div>
        <section class="complete-card" aria-labelledby="mission3CompleteTitle"><img class="complete-scientist" src="assets/shared/scientist-guide-success.png" alt="Scientist guide congratulating you"><div class="complete-copy"><img class="complete-mark" src="assets/shared/success-check-icon.svg" alt="Completed"><p class="eyebrow">MISSION 3 COMPLETE</p><h1 id="mission3CompleteTitle">One FFPE wax block is ready.</h1><p>The accepted patient's tissue has been processed and embedded in wax.</p><div class="next-preview"><strong>Next: Cut Very Thin Sections</strong><span>Continue with the same patient's FFPE wax block.</span></div><div class="complete-actions"><button class="primary-button" type="button" data-action="start-mission4">Continue to Mission 4</button><button class="secondary-button" type="button" data-action="review-mission3">Review Mission 3</button><button class="secondary-button" type="button" data-action="review-mission2">Review Mission 2</button><button class="secondary-button" type="button" data-action="new-case">Start a New Case</button><a class="secondary-button button-link" href="../">Return to Game Hub</a></div></div></section>
      </main>`;
  }

  function mission4ProcessView() {
    const step = state.mission4.step;
    if (step === "question") {
      return `<div class="mission-input-object"><img src="assets/mission-3/ffpe-block-complete.png" alt="The accepted patient's completed FFPE wax block"><strong>FFPE wax block</strong></div>
        <div class="equipment-grid equipment-grid-two" aria-label="Choose the machine that cuts very thin tissue sections">
          <button class="equipment-choice" type="button" data-action="mission4-choice" data-value="microtome"><img src="assets/mission-4/microtome-empty.png" alt="Microtome with its cutting edge protected inside the housing"><strong>Microtome</strong></button>
          <button class="equipment-choice" type="button" data-action="mission4-choice" data-value="staining"><img src="assets/mission-4/staining-machine-m4-choice.png" alt="Staining machine"><strong>Staining Machine</strong></button>
        </div>`;
    }
    if (step === "microtome_selected") {
      return `<div class="microtomy-stage"><img src="assets/mission-4/microtome-empty.png" alt="Protected microtome ready to receive the wax block"><div><h2>Microtome selected</h2><p>The cutting edge stays guarded inside the machine.</p></div></div>`;
    }
    if (step === "block_loaded") {
      return `<div class="microtomy-stage"><img src="assets/mission-4/microtome-block-loaded.png" alt="FFPE wax block safely loaded in the protected microtome holder"><div><h2>FFPE block loaded</h2><p>The block is secured in the holder before a section is cut.</p></div></div>`;
    }
    if (step === "section_cut") {
      return `<div class="microtomy-stage"><img src="assets/mission-4/microtome-section-emerging.png" alt="A delicate tissue section emerging from the guarded microtome"><div><h2>Very thin section emerging</h2><p>The microtome advances the wax block and produces a delicate tissue section.</p><img class="section-preview" src="assets/mission-4/thin-section-single.png" alt="One very thin cream-pink tissue section against a contrasting blue surface"></div></div>`;
    }
    return `<div class="microtomy-result" aria-label="Microtomy before and after comparison">
      <img class="microtomy-diagram" src="assets/mission-4/microtomy-before-after.svg" alt="FFPE wax block becomes a very thin tissue section">
      <figure><img src="assets/mission-3/ffpe-block-complete.png" alt="FFPE wax block before microtomy"><figcaption>FFPE wax block</figcaption></figure>
      <span class="journey-arrow" aria-hidden="true">→</span>
      <figure><img src="assets/mission-4/thin-section-ribbon.png" alt="Short ribbon of very thin tissue sections visible against a blue surface"><figcaption>Very thin tissue section</figcaption></figure>
    </div>`;
  }

  function mission4GuideText() {
    const step = state.mission4.step;
    if (step === "question") return "Choose the machine that can cut a very thin tissue section.";
    if (step === "microtome_selected") return "The protected microtome is ready for the wax block.";
    if (step === "block_loaded") return "The FFPE block is safely held inside the machine.";
    if (step === "section_cut") return "A very thin section is emerging with the cutting edge still guarded.";
    return "The FFPE wax block has become a very thin tissue section.";
  }

  function mission4Screen() {
    return `
      ${missionHeader(4, "Cut Very Thin Sections")}
      <main class="game-main" id="mainContent"><div class="mission-scene mission4-scene">
        <img class="scene-background" src="assets/mission-4/microtomy-lab-background.png" alt="Histology microtomy laboratory">
        <div class="scene-shade" aria-hidden="true"></div>
        <div class="mission-title-card"><p class="eyebrow">MICROTOMY</p><h1>Cut Very Thin Sections</h1><p>“We need a very thin slice of our tissue. Which machine should we use?”</p></div>
        ${caseIdentityChip()}
        ${mission4ProcessView()}
        <div class="mission2-actions"><button class="primary-button next-button" type="button" data-action="mission4-next" ${state.mission4.complete ? "" : "disabled"}>NEXT →</button></div>
        ${mission2Feedback()}
      </div></main>
      <footer class="guide-strip" aria-label="Scientist guide"><img src="assets/shared/guide-strip-avatar.png" alt=""><div><strong>Scientist guide</strong><p>${mission4GuideText()}</p></div></footer>`;
  }

  function mission4CompleteScreen() {
    return `
      ${missionHeader(4, "Cut Very Thin Sections")}
      <main class="chapter-complete" id="mainContent"><div class="complete-background" aria-hidden="true"></div>
        <section class="complete-card" aria-labelledby="mission4CompleteTitle"><img class="complete-scientist" src="assets/shared/scientist-guide-success.png" alt="Scientist guide congratulating you"><div class="complete-copy"><img class="complete-mark" src="assets/shared/success-check-icon.svg" alt="Completed"><p class="eyebrow">MISSION 4 COMPLETE</p><h1 id="mission4CompleteTitle">One very thin tissue section is ready.</h1><p>The accepted patient's FFPE block has been cut safely by the protected microtome.</p><div class="next-preview"><strong>Next: Put the Section on a Glass Slide</strong><span>Continue with the same patient's very thin tissue section.</span></div><div class="complete-actions"><button class="primary-button" type="button" data-action="start-mission5">Continue to Mission 5</button><button class="secondary-button" type="button" data-action="review-mission4">Review Mission 4</button><button class="secondary-button" type="button" data-action="review-mission3">Review Mission 3</button><button class="secondary-button" type="button" data-action="new-case">Start a New Case</button><a class="secondary-button button-link" href="../">Return to Game Hub</a></div></div></section>
      </main>`;
  }

  function mission5Choices() {
    return `<div class="equipment-grid slide-choice-grid" aria-label="Choose where to put the thin tissue section">
      <button class="equipment-choice" type="button" data-action="mission5-choice" data-value="glass-slide"><img src="assets/mission-5/microscope-slide-blank.png" alt="Blank glass microscope slide with a frosted label end and clear viewing area"><strong>On a glass microscope slide</strong></button>
      <button class="equipment-choice" type="button" data-action="mission5-choice" data-value="cassette"><img src="assets/mission-5/cassette-m5-distractor.png" alt="Closed histology cassette"><strong>Back into the cassette</strong></button>
      <button class="equipment-choice" type="button" data-action="mission5-choice" data-value="bin"><img src="assets/mission-5/laboratory-bin.png" alt="Closed laboratory waste bin"><strong>Into the bin</strong></button>
    </div>`;
  }

  function mission5ProcessView() {
    const step = state.mission5.step;
    if (step === "question") {
      return `<div class="mission-input-object section-input"><img src="assets/mission-4/thin-section-ribbon.png" alt="The accepted patient's very thin tissue section"><strong>Very thin tissue section</strong></div>${mission5Choices()}`;
    }
    if (step === "transfer_ready") {
      return `<img class="processing-path" src="assets/mission-5/section-to-slide-diagram.svg" alt="Very thin tissue section moves onto a glass microscope slide">
        <div class="slide-transfer-workspace">
          <button class="transfer-section ${state.mission5.sectionSelected ? "selected" : ""}" type="button" draggable="true" data-action="mission5-select-section" aria-pressed="${state.mission5.sectionSelected}"><img src="assets/mission-4/thin-section-single.png" alt="Very thin tissue section ready to transfer"><strong>Select the tissue section</strong></button>
          <span class="journey-arrow" aria-hidden="true">→</span>
          <button class="slide-drop-target" type="button" data-action="mission5-place-section" data-drop="slide" aria-label="Place the selected tissue section in the glass slide viewing area"><img src="assets/mission-5/microscope-slide-blank.png" alt="Blank glass microscope slide"><strong>Glass slide viewing area</strong></button>
        </div>`;
    }
    return `<div class="unstained-reveal">
      <img src="assets/mission-5/microscope-slide-unstained.png" alt="Glass microscope slide with the patient's pale tissue section centred in its viewing area">
      <div><p class="eyebrow">UNSTAINED SLIDE</p><h2>UNSTAINED SLIDE</h2><p>“We have our microscope slide, but the tissue is difficult to see.”</p><p><strong>“It needs some colour!”</strong></p></div>
    </div>`;
  }

  function mission5GuideText() {
    const step = state.mission5.step;
    if (step === "question") return "Choose where the very thin tissue section should go.";
    if (step === "transfer_ready") return state.mission5.sectionSelected ? "Now choose the glass slide viewing area." : "Select or drag the tissue section onto the glass slide.";
    return step === "section_on_slide" ? "The section is centred safely on the slide." : "We have our microscope slide, but the tissue is difficult to see. It needs some colour!";
  }

  function mission5Screen() {
    return `
      ${missionHeader(5, "Put the Section on a Glass Slide")}
      <main class="game-main" id="mainContent"><div class="mission-scene mission5-scene">
        <img class="scene-background" src="assets/mission-5/slide-prep-bench-background.png" alt="Clean histology slide-preparation bench">
        <div class="scene-shade" aria-hidden="true"></div>
        <div class="mission-title-card"><p class="eyebrow">SLIDE PREPARATION</p><h1>Put the Section on a Glass Slide</h1><p>“We've cut a super-thin section. Where should we put it?”</p></div>
        ${caseIdentityChip()}
        ${mission5ProcessView()}
        <div class="mission2-actions"><button class="primary-button next-button" type="button" data-action="mission5-next" ${state.mission5.complete ? "" : "disabled"}>NEXT →</button></div>
        ${mission2Feedback()}
      </div></main>
      <footer class="guide-strip" aria-label="Scientist guide"><img src="assets/shared/guide-strip-avatar.png" alt=""><div><strong>Scientist guide</strong><p>${mission5GuideText()}</p></div></footer>`;
  }

  function mission5CompleteScreen() {
    return `
      ${missionHeader(5, "Put the Section on a Glass Slide")}
      <main class="chapter-complete" id="mainContent"><div class="complete-background" aria-hidden="true"></div>
        <section class="complete-card" aria-labelledby="mission5CompleteTitle"><img class="complete-scientist" src="assets/shared/scientist-guide-success.png" alt="Scientist guide congratulating you"><div class="complete-copy"><img class="complete-mark" src="assets/shared/success-check-icon.svg" alt="Completed"><p class="eyebrow">MISSION 5 COMPLETE</p><h1 id="mission5CompleteTitle">The unstained slide is ready.</h1><p>The accepted patient's intact tissue section is centred on its glass microscope slide.</p><div class="next-preview"><strong>Next: Add Colour to the Tissue</strong><span>Continue with the same patient's unstained slide.</span></div><div class="complete-actions"><button class="primary-button" type="button" data-action="start-mission6">Continue to Mission 6</button><button class="secondary-button" type="button" data-action="review-mission5">Review Mission 5</button><button class="secondary-button" type="button" data-action="review-mission4">Review Mission 4</button><button class="secondary-button" type="button" data-action="new-case">Start a New Case</button><a class="secondary-button button-link" href="../">Return to Game Hub</a></div></div></section>
      </main>`;
  }

  function mission6ProcessView() {
    const step = state.mission6.step;
    if (step === "transfer_ready") {
      return `<img class="processing-path" src="assets/mission-6/staining-process-diagram.svg" alt="Unstained slide goes inside the staining machine and becomes stained slides">
        <div class="staining-transfer-workspace">
          <button class="unstained-slide-source ${state.mission6.slideSelected ? "selected" : ""}" type="button" draggable="true" data-action="mission6-select-slide" aria-pressed="${state.mission6.slideSelected}"><img src="assets/mission-5/microscope-slide-unstained.png" alt="The accepted patient's unstained microscope slide"><strong>Select the unstained slide</strong></button>
          <span class="journey-arrow" aria-hidden="true">→</span>
          <button class="staining-machine-target" type="button" data-action="mission6-place-slide" data-drop="staining-machine" aria-label="Load the selected slide into the staining machine"><img src="assets/mission-6/staining-machine-empty.png" alt="Staining machine with one clear loading area"><span class="carrier-inset"><img src="assets/mission-6/slide-carrier-empty.png" alt="Empty slide carrier"></span><strong>Staining Machine loading area</strong></button>
        </div>`;
    }
    if (step === "slide_in_machine") {
      return `<div class="staining-stage"><div class="staining-machine-stack"><img src="assets/mission-6/staining-machine-slide-loaded.png" alt="Unstained slide locked safely inside the staining machine"><img class="carrier-overlay" src="assets/mission-6/slide-carrier-loaded.png" alt="Carrier holding the patient slide"></div><div><h2>Slide loaded</h2><p>The machine starts only after the slide is safely in place.</p></div></div>`;
    }
    if (step === "staining") {
      return `<div class="staining-stage active"><div class="staining-machine-stack"><img src="assets/mission-6/staining-machine-active.png" alt="Staining machine active with the patient slide inside"><img class="colour-streams" src="assets/mission-6/stain-colour-streams.png" alt="Gentle purple, pink, green, yellow, blue and violet colour streams inside the machine"></div><div><p class="process-word" aria-label="Whoosh">WHOOSH…</p><h2>Histological staining</h2><p>Colour is added so the different tissue parts can be seen more clearly.</p></div></div>`;
    }
    return `<div class="stained-ready"><img src="assets/mission-6/stained-slides-output-tray.png" alt="Output tray holding three stained slide choices"><div><p class="process-trail" aria-label="Staining sequence: Whoosh, then Ding"><span>WHOOSH…</span><span aria-hidden="true">→</span><strong>DING!</strong></p><h2>Stained slides ready</h2><p>“Great! Staining adds colour to the tissue so we can see its different parts more clearly.”</p><p><strong>“Your stained slides are ready!”</strong></p></div></div>`;
  }

  function mission6GuideText() {
    const step = state.mission6.step;
    if (step === "transfer_ready") return state.mission6.slideSelected ? "Now choose the Staining Machine loading area." : "Select or drag the unstained slide into the Staining Machine.";
    if (step === "slide_in_machine") return "The slide is safely loaded and the staining sequence is starting.";
    if (step === "staining") return "WHOOSH… Colour is moving through the staining machine.";
    return "Great! Staining adds colour to the tissue so we can see its different parts more clearly. Your stained slides are ready!";
  }

  function mission6Screen() {
    return `
      ${missionHeader(6, "Add Colour to the Tissue")}
      <main class="game-main" id="mainContent"><div class="mission-scene mission6-scene">
        <img class="scene-background" src="assets/mission-6/staining-lab-background.png" alt="Histological staining laboratory">
        <div class="scene-shade" aria-hidden="true"></div>
        <div class="mission-title-card"><p class="eyebrow">HISTOLOGICAL STAINING</p><h1>Add Colour to the Tissue</h1><p>“Our tissue is on the slide, but we need to add colour so we can see the cells more clearly.”</p><p>“Drag the slide into the Staining Machine!”</p></div>
        ${caseIdentityChip()}
        ${mission6ProcessView()}
        <div class="mission2-actions"><button class="primary-button next-button" type="button" data-action="mission6-next" ${state.mission6.complete ? "" : "disabled"}>NEXT: Can you find the H&amp;E slide?</button></div>
        ${mission2Feedback()}
      </div></main>
      <footer class="guide-strip" aria-label="Scientist guide"><img src="assets/shared/guide-strip-avatar.png" alt=""><div><strong>Scientist guide</strong><p>${mission6GuideText()}</p></div></footer>`;
  }

  function mission6CompleteScreen() {
    return `
      ${missionHeader(6, "Add Colour to the Tissue")}
      <main class="chapter-complete" id="mainContent"><div class="complete-background" aria-hidden="true"></div>
        <section class="complete-card" aria-labelledby="mission6CompleteTitle"><img class="complete-scientist" src="assets/shared/scientist-guide-success.png" alt="Scientist guide congratulating you"><div class="complete-copy"><img class="complete-mark" src="assets/shared/success-check-icon.svg" alt="Completed"><p class="eyebrow">MISSION 6 COMPLETE</p><h1 id="mission6CompleteTitle">The stained slides are ready.</h1><p>Staining has added visible colour to the accepted patient's tissue.</p><div class="next-preview"><strong>Next: Find the H&amp;E Slide</strong><span>Continue with the three stained slide choices.</span></div><div class="complete-actions"><button class="primary-button" type="button" data-action="start-mission7">Continue to Mission 7</button><button class="secondary-button" type="button" data-action="review-mission6">Review Mission 6</button><button class="secondary-button" type="button" data-action="review-mission5">Review Mission 5</button><button class="secondary-button" type="button" data-action="new-case">Start a New Case</button><a class="secondary-button button-link" href="../">Return to Game Hub</a></div></div></section>
      </main>`;
  }

  function mission7SlideCard(id, image, label, alt) {
    const selected = state.mission7.selectedSlide === id;
    const correct = state.mission7.correctSelected && id === L.MISSION7_CORRECT_CHOICE;
    const hint = state.mission7.hintOpen && id === "slide-b" && !state.mission7.correctSelected;
    return `<button class="he-slide-card ${correct ? "correct" : ""}" type="button" data-action="mission7-choice" data-value="${id}" ${state.mission7.correctSelected ? "disabled" : ""} aria-pressed="${selected}">
      <span class="he-image-wrap"><img class="he-tissue-image" src="assets/mission-7/${image}" alt="${alt}">${hint ? `<span class="he-callout nuclei"><img src="assets/mission-7/he-hint-nuclei-callout.svg" alt="Callout pointing to representative blue-purple nuclei"></span><span class="he-callout pink"><img src="assets/mission-7/he-hint-pink-tissue-callout.svg" alt="Callout pointing to representative pink surrounding tissue"></span>` : ""}</span>
      <strong>${label}</strong>${correct ? `<span class="correct-label">✓ Correct — H&amp;E</span>` : ""}
    </button>`;
  }

  function mission7Screen() {
    return `
      ${missionHeader(7, "Find the H&E Slide")}
      <main class="game-main" id="mainContent"><div class="mission-scene mission7-scene">
        <div class="scene-shade" aria-hidden="true"></div>
        <div class="mission-title-card"><p class="eyebrow">HAEMATOXYLIN &amp; EOSIN (H&amp;E) STAINING</p><h1>Find the H&amp;E Slide</h1><p>“Which one is the H&amp;E slide?”</p></div>
        ${caseIdentityChip()}
        <div class="he-toolbar"><button class="hint-button" type="button" data-action="mission7-hint" aria-expanded="${state.mission7.hintOpen}">${state.mission7.hintOpen ? "Hide Hint" : "Hint"}</button>${state.mission7.hintOpen ? `<p class="he-hint" role="note">H&amp;E usually makes the nuclei blue-purple and much of the surrounding tissue pink.</p>` : ""}</div>
        <div class="he-slide-grid" aria-label="Choose the H and E stained slide">
          ${mission7SlideCard("slide-a", "slide-a-green-yellow.png", "Slide A – Green + Yellow", "Green-dominant skin tissue with yellow structures")}
          ${mission7SlideCard("slide-b", "slide-b-he-purple-pink.png", "Slide B – Purple + Pink", "Skin tissue with blue-purple nuclei and abundant pink surrounding tissue")}
          ${mission7SlideCard("slide-c", "slide-c-blue-violet.png", "Slide C – Blue + Violet", "Blue and violet skin tissue with little pink")}
        </div>
        ${state.mission7.correctSelected ? `<div class="he-finished-preview"><img src="assets/mission-7/he-slide-finished.png" alt="Finished H and E glass slide"><strong>YES! You found the H&amp;E slide!</strong></div>` : ""}
        <div class="mission2-actions"><button class="primary-button next-button" type="button" data-action="mission7-finish" ${state.mission7.correctSelected ? "" : "disabled"}>FINISH</button></div>
        ${mission2Feedback()}
      </div></main>
      <footer class="guide-strip" aria-label="Scientist guide"><img src="assets/shared/guide-strip-avatar.png" alt=""><div><strong>Scientist guide</strong><p>${state.mission7.correctSelected ? "YES! You found the H&E slide!" : "Look for blue-purple nuclei and lots of pink surrounding tissue."}</p></div></footer>`;
  }

  function journeyStep(icon, label) {
    return `<li><img src="assets/completion/${icon}" alt=""><span>${label}</span></li>`;
  }

  function journeyCompleteScreen() {
    const steps = [
      ["journey-specimen-icon.svg", "Check the patient details"],
      ["journey-cassette-icon.svg", "Prepare the tissue"],
      ["journey-cassette-icon.svg", "Put it in a cassette"],
      ["journey-processor-icon.svg", "Process & embed the tissue"],
      ["journey-wax-block-icon.svg", "Make an FFPE wax block"],
      ["journey-microtome-icon.svg", "Cut very thin sections"],
      ["journey-slide-icon.svg", "Put the section on a slide"],
      ["journey-stain-icon.svg", "Stain the tissue"],
      ["journey-he-icon.svg", "Find the H&E slide!"]
    ];
    const journey = steps.map((step, index) => `${journeyStep(step[0], step[1])}${index < steps.length - 1 ? `<li class="journey-down" aria-hidden="true"><img src="assets/shared/journey-down-arrow.svg" alt=""></li>` : ""}`).join("");
    return `
      <main class="journey-complete" id="mainContent">
        <img class="completion-background" src="assets/completion/completion-lab-background.png" alt="Bright celebratory histology laboratory">
        <section class="journey-celebration" aria-labelledby="journeyCompleteTitle">
          <div class="celebration-heading"><img src="assets/completion/completion-badge.svg" alt="Completed"><p class="eyebrow">Mission Complete!</p><h1 id="journeyCompleteTitle">GREAT JOB, SCIENTIST!</h1><p>“You successfully prepared a histology sample!”</p></div>
          <div class="completion-hero"><img src="assets/shared/scientist-guide-success.png" alt="Scientist guide congratulating you"><div class="microscope-finale"><img src="assets/completion/compound-microscope.png" alt="Compound microscope"><img src="assets/completion/he-slide-beside-microscope.png" alt="Finished H and E slide beside the microscope"></div></div>
          <ol class="journey-list" aria-label="Your histology journey">${journey}</ol>
          <div class="final-message"><p>“Your H&amp;E slide is now ready to be looked at under the microscope!”</p><h2>WELL DONE, SCIENTIST!</h2></div>
          <div class="complete-actions final-actions"><button class="secondary-button" type="button" data-action="play-again">PLAY AGAIN</button><button class="primary-button" type="button" data-action="finish-to-hub">FINISH</button></div>
        </section>
      </main>`;
  }

  function completionScreen() {
    const name = state.caseData ? state.caseData.reference.name : "the patient";
    return `
      ${missionHeader()}
      <main class="chapter-complete" id="mainContent">
        <div class="complete-background" aria-hidden="true"></div>
        <section class="complete-card" aria-labelledby="completeTitle">
          <img class="complete-scientist" src="assets/shared/scientist-guide-success.png" alt="Scientist guide congratulating you">
          <div class="complete-copy">
            <img class="complete-mark" src="assets/shared/success-check-icon.svg" alt="Completed">
            <p class="eyebrow">MISSION 1 COMPLETE</p>
            <h1 id="completeTitle">The correct skin specimen was received safely.</h1>
            <p>You checked the name, ID no. and date of birth before accepting ${escapeHtml(name)}'s specimen.</p>
            <div class="next-preview"><strong>Next: Prepare the Tissue</strong><span>Continue with the same patient and accepted specimen.</span></div>
            <div class="complete-actions">
              <button class="primary-button" type="button" data-action="start-mission2">Continue to Mission 2</button>
              <button class="secondary-button" type="button" data-action="review-mission">Review Mission 1</button>
              <button class="secondary-button" type="button" data-action="change-level">Choose Another Level</button>
              <button class="secondary-button" type="button" data-action="new-case">Start a New Case</button>
              <a class="secondary-button button-link" href="../">Return to Game Hub</a>
            </div>
          </div>
        </section>
      </main>`;
  }

  function render() {
    if (sequenceTimer) {
      clearTimeout(sequenceTimer);
      sequenceTimer = null;
    }
    const screens = {
      mission1: missionScreen,
      "mission1-complete": completionScreen,
      mission2: mission2Screen,
      "mission2-complete": mission2CompleteScreen,
      mission3: mission3Screen,
      "mission3-complete": mission3CompleteScreen,
      mission4: mission4Screen,
      "mission4-complete": mission4CompleteScreen,
      mission5: mission5Screen,
      "mission5-complete": mission5CompleteScreen,
      mission6: mission6Screen,
      "mission6-complete": mission6CompleteScreen,
      mission7: mission7Screen,
      "journey-complete": journeyCompleteScreen,
      level: levelScreen
    };
    const screenChanged = lastRenderedScreen !== state.screen;
    lastRenderedScreen = state.screen;
    app.innerHTML = (screens[state.screen] || levelScreen)();
    if (screenChanged) requestAnimationFrame(() => window.scrollTo(0, 0));
    updateOrientation();
    if (pendingFocus) {
      const selector = pendingFocus;
      pendingFocus = null;
      requestAnimationFrame(() => app.querySelector(selector)?.focus());
    }
    scheduleMission3Sequence();
    scheduleMission4Sequence();
    scheduleMission5Sequence();
    scheduleMission6Sequence();
  }

  function scheduleMission3Sequence() {
    if (state.screen !== "mission3" || !["processing", "embedding", "reveal"].includes(state.mission3.step)) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    sequenceTimer = setTimeout(() => {
      state.mission3 = L.applyMission3Action(state.mission3, "advance");
      const messages = {
        embedding: "The tissue is prepared. Now it is positioned in an embedding mould and surrounded with wax.",
        reveal: "The wax has set and one FFPE block has been created.",
        complete: "Look! We've made a wax block!"
      };
      state.feedback = messages[state.mission3.step] || state.feedback;
      state.feedbackType = "good";
      save(); announce(state.feedback); render();
    }, reduced ? 40 : 850);
  }

  function scheduleMission4Sequence() {
    if (state.screen !== "mission4" || !["microtome_selected", "block_loaded", "section_cut", "section_revealed"].includes(state.mission4.step)) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    sequenceTimer = setTimeout(() => {
      state.mission4 = L.applyMission4Action(state.mission4, "advance");
      const messages = {
        block_loaded: "The FFPE wax block is safely loaded in the protected microtome holder.",
        section_cut: "The block advances and one very thin tissue section emerges.",
        section_revealed: "The very thin tissue section is now clearly visible.",
        complete: "That's right! A microtome cuts very thin sections of tissue."
      };
      state.feedback = messages[state.mission4.step] || state.feedback;
      state.feedbackType = "good";
      save(); announce(state.feedback); render();
    }, reduced ? 40 : 850);
  }

  function scheduleMission5Sequence() {
    if (state.screen !== "mission5" || !["section_on_slide", "unstained_slide_reveal"].includes(state.mission5.step)) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    sequenceTimer = setTimeout(() => {
      state.mission5 = L.applyMission5Action(state.mission5, "advance");
      state.feedback = state.mission5.step === "unstained_slide_reveal"
        ? "The tissue section is centred on the glass slide. It is still difficult to see."
        : "We have our microscope slide, but the tissue is difficult to see. It needs some colour!";
      state.feedbackType = "good";
      save(); announce(state.feedback); render();
    }, reduced ? 40 : 700);
  }

  function scheduleMission6Sequence() {
    if (state.screen !== "mission6" || !["slide_in_machine", "staining", "stained_slides_ready"].includes(state.mission6.step)) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    sequenceTimer = setTimeout(() => {
      state.mission6 = L.applyMission6Action(state.mission6, "advance");
      const messages = {
        staining: "WHOOSH… The slide is travelling through the staining machine.",
        stained_slides_ready: "DING! Great! Staining adds colour to the tissue so we can see its different parts more clearly.",
        complete: "Your stained slides are ready!"
      };
      state.feedback = messages[state.mission6.step] || state.feedback;
      state.feedbackType = "good";
      save(); announce(state.feedback); render();
    }, reduced ? 50 : 900);
  }

  function setFeedback(message, type = "") {
    state.feedback = message;
    state.feedbackType = type;
    save();
    announce(message);
    render();
  }

  function saveHubCompletion() {
    if (!state.mission7.finalReached || !L.journeyCanAward(state)) return false;
    let progress = { completedCases: {} };
    try {
      const saved = JSON.parse(localStorage.getItem(HUB_STORAGE_KEY));
      if (saved && typeof saved === "object") progress = saved;
    } catch (_) {
      progress = { completedCases: {} };
    }
    localStorage.setItem(HUB_STORAGE_KEY, JSON.stringify(L.withHistologyHubCompletion(progress)));
    state.mission7 = L.applyMission7Action(state.mission7, "mark-awarded");
    save();
    return true;
  }

  function handleAction(action, value, trigger) {
    if (action === "choose-level") {
      chooseLevel(value);
      return;
    }
    if (action === "show-levels") {
      state.screen = "level";
      state.forceReplay = false;
      save(); render(); return;
    }
    if (action === "dismiss-clue") {
      state.clueSeen = true;
      state.feedback = "Choose a complete sample set to inspect.";
      state.feedbackType = "info";
      pendingFocus = '[data-action="inspect"]';
      save(); render(); return;
    }
    if (action === "toggle-hint") {
      state.hintOpen = !state.hintOpen;
      save(); render();
      announce(guidanceText());
      return;
    }
    if (action === "inspect") {
      state.expandedIndex = Number(value);
      state.mismatchFields = [];
      state.feedback = "Compare the name and ID no. on all three surfaces, then compare the date of birth on the monitor and paper request.";
      state.feedbackType = "info";
      pendingFocus = `[data-action="select-candidate"][data-value="${value}"]`;
      save(); render(); return;
    }
    if (action === "compare-other") {
      const closed = Number(value);
      state.expandedIndex = null;
      state.mismatchFields = [];
      state.feedback = "Choose either complete set to inspect.";
      state.feedbackType = "info";
      pendingFocus = `[data-action="inspect"][data-value="${closed}"]`;
      save(); render(); return;
    }
    if (action === "select-candidate") {
      const index = Number(value);
      const candidate = state.caseData.candidates[index];
      const mismatches = L.identityMismatchFields(state.caseData.reference, candidate);
      if (mismatches.length) {
        state.expandedIndex = index;
        state.mismatchFields = mismatches;
        const message = mismatches.length === 1 && mismatches[0] === "id"
          ? "This ID no. is different. Compare these two numbers on the reference, specimen label and paper request."
          : "These patient details conflict. Compare the name and ID no. on all three surfaces, then compare the date of birth on the reference and paper request.";
        setFeedback(message, "try");
        return;
      }
      state.acceptedIndex = index;
      state.expandedIndex = null;
      state.mismatchFields = [];
      state.feedback = `Matched! This sample belongs to ${candidate.name}.`;
      state.feedbackType = "good";
      pendingFocus = '[data-action="toggle-transfer"]';
      save(); announce(state.feedback); render(); return;
    }
    if (action === "toggle-transfer") {
      if (state.racked) return;
      state.selectedTransfer = !state.selectedTransfer;
      state.feedback = state.selectedTransfer
        ? "Accepted specimen selected. Now choose the receiving and scanning rack."
        : "Select or drag the accepted specimen to move it safely.";
      state.feedbackType = "info";
      save(); render(); return;
    }
    if (action === "rack-sample") {
      if (state.racked) return;
      if (!state.selectedTransfer && trigger !== "drop") {
        setFeedback("Select the accepted specimen first, then choose the receiving and scanning rack.", "try");
        return;
      }
      state.racked = true;
      state.selectedTransfer = false;
      state.feedback = "Correct! The patient's details match and the specimen is ready for the next step.";
      state.feedbackType = "good";
      pendingFocus = '[data-action="mission-next"]';
      save(); announce(state.feedback); render(); return;
    }
    if (action === "mission-next" && state.racked) {
      state.mission1Complete = true;
      state.screen = "mission1-complete";
      save(); announce("Mission 1 complete."); render(); return;
    }
    if (action === "review-mission") {
      state.screen = "mission1";
      save(); render(); return;
    }
    if (action === "start-mission2") {
      state.currentMission = 2;
      state.screen = "mission2";
      state.feedback = "Choose how to prepare a small piece for processing.";
      state.feedbackType = "info";
      save(); announce("Mission 2. Prepare the Tissue."); render(); return;
    }
    if (action === "mission2-choice") {
      state.mission2 = L.applyMission2Action(state.mission2, "choose", value);
      if (value === L.MISSION2_CORRECT_CHOICE) {
        state.feedback = "Correct. Select the virtual scalpel and make one simple cut along the guide.";
        state.feedbackType = "good";
        pendingFocus = '[data-action="mission2-select-scalpel"]';
      } else {
        state.feedback = "Not yet. The sample is too large. Choose the step that prepares a small piece for processing.";
        state.feedbackType = "try";
      }
      save(); announce(state.feedback); render(); return;
    }
    if (action === "mission2-select-scalpel") {
      state.mission2 = L.applyMission2Action(state.mission2, "select-scalpel");
      state.feedback = state.mission2.scalpelSelected
        ? "Virtual scalpel selected. Swipe across the broad guide or use Cut along the guide."
        : "Select the virtual scalpel when you are ready.";
      state.feedbackType = "info";
      save(); render(); return;
    }
    if (action === "mission2-cut") {
      const next = L.applyMission2Action(state.mission2, "cut");
      if (next.step === state.mission2.step) return;
      state.mission2 = next;
      state.feedback = "Great! Now drag your tissue into the cassette.";
      state.feedbackType = "good";
      pendingFocus = '[data-action="mission2-select-tissue"]';
      save(); announce(state.feedback); render(); return;
    }
    if (action === "mission2-select-tissue") {
      state.mission2 = L.applyMission2Action(state.mission2, "select-tissue");
      state.feedback = state.mission2.tissueSelected
        ? "Small tissue piece selected. Now choose the open cassette."
        : "Select or drag the small tissue piece into the cassette.";
      state.feedbackType = "info";
      save(); render(); return;
    }
    if (action === "mission2-place-tissue") {
      const next = L.applyMission2Action(state.mission2, "place-tissue", trigger);
      if (next.step === state.mission2.step) {
        setFeedback("Select the small tissue piece first, then choose the open cassette.", "try");
        return;
      }
      state.mission2 = next;
      state.feedback = "The small tissue piece is safely in place. Close the cassette.";
      state.feedbackType = "good";
      pendingFocus = '[data-action="mission2-close"]';
      save(); announce(state.feedback); render(); return;
    }
    if (action === "mission2-close") {
      state.mission2 = L.applyMission2Action(state.mission2, "close-cassette");
      state.feedback = "Perfect! The tissue is safely inside its cassette.";
      state.feedbackType = "good";
      pendingFocus = '[data-action="mission2-next"]';
      save(); announce(state.feedback); render(); return;
    }
    if (action === "mission2-next" && state.mission2.complete) {
      state.mission2Complete = true;
      state.screen = "mission2-complete";
      save(); announce("Mission 2 complete."); render(); return;
    }
    if (action === "review-mission2") {
      state.currentMission = 2;
      state.screen = "mission2";
      save(); render(); return;
    }
    if (action === "start-mission3") {
      state.currentMission = 3;
      state.screen = "mission3";
      state.feedback = "Choose where the loaded tissue cassette should go next.";
      state.feedbackType = "info";
      save(); announce("Mission 3. Make a Wax Block."); render(); return;
    }
    if (action === "mission3-choice") {
      state.mission3 = L.applyMission3Action(state.mission3, "choose", value);
      if (value === L.MISSION3_CORRECT_CHOICE) {
        state.feedback = "Correct! The tissue needs to be processed and embedded in wax.";
        state.feedbackType = "good";
      } else {
        state.feedback = "Not yet! Our tissue isn't ready for that machine. Try again.";
        state.feedbackType = "try";
      }
      save(); announce(state.feedback); render(); return;
    }
    if (action === "mission3-next" && state.mission3.complete) {
      state.mission3Complete = true;
      state.screen = "mission3-complete";
      save(); announce("Mission 3 complete."); render(); return;
    }
    if (action === "review-mission3") {
      state.currentMission = 3;
      state.screen = "mission3";
      save(); render(); return;
    }
    if (action === "start-mission4") {
      state.currentMission = 4;
      state.screen = "mission4";
      state.feedback = "Choose the machine that can cut a very thin tissue section.";
      state.feedbackType = "info";
      save(); announce("Mission 4. Cut Very Thin Sections."); render(); return;
    }
    if (action === "mission4-choice") {
      state.mission4 = L.applyMission4Action(state.mission4, "choose", value);
      if (value === L.MISSION4_CORRECT_CHOICE) {
        state.feedback = "That's right! A microtome cuts very thin sections of tissue.";
        state.feedbackType = "good";
      } else {
        state.feedback = "Not yet! We need to cut the tissue before we can stain it. Try again.";
        state.feedbackType = "try";
      }
      save(); announce(state.feedback); render(); return;
    }
    if (action === "mission4-next" && state.mission4.complete) {
      state.mission4Complete = true;
      state.screen = "mission4-complete";
      save(); announce("Mission 4 complete."); render(); return;
    }
    if (action === "review-mission4") {
      state.currentMission = 4;
      state.screen = "mission4";
      save(); render(); return;
    }
    if (action === "start-mission5") {
      state.currentMission = 5;
      state.screen = "mission5";
      state.feedback = "Choose where the very thin tissue section should go.";
      state.feedbackType = "info";
      save(); announce("Mission 5. Put the Section on a Glass Slide."); render(); return;
    }
    if (action === "mission5-choice") {
      state.mission5 = L.applyMission5Action(state.mission5, "choose", value);
      if (value === L.MISSION5_CORRECT_CHOICE) {
        state.feedback = "Exactly! The thin tissue section goes onto a glass microscope slide.";
        state.feedbackType = "good";
        pendingFocus = '[data-action="mission5-select-section"]';
      } else {
        state.feedback = "We need to keep our thin tissue section so we can look at it under a microscope. Try again.";
        state.feedbackType = "try";
      }
      save(); announce(state.feedback); render(); return;
    }
    if (action === "mission5-select-section") {
      state.mission5 = L.applyMission5Action(state.mission5, "select-section");
      state.feedback = state.mission5.sectionSelected ? "Tissue section selected. Now choose the glass slide viewing area." : "Select or drag the tissue section onto the glass slide.";
      state.feedbackType = "info";
      pendingFocus = state.mission5.sectionSelected ? '[data-action="mission5-place-section"]' : '[data-action="mission5-select-section"]';
      save(); render(); return;
    }
    if (action === "mission5-place-section") {
      const next = L.applyMission5Action(state.mission5, "place-section", trigger);
      if (next.step === state.mission5.step) {
        setFeedback("Select the tissue section first, then choose the glass slide viewing area.", "info");
        return;
      }
      state.mission5 = next;
      state.feedback = "The tissue section is centred safely on the glass slide.";
      state.feedbackType = "good";
      save(); announce(state.feedback); render(); return;
    }
    if (action === "mission5-next" && state.mission5.complete) {
      state.mission5Complete = true;
      state.screen = "mission5-complete";
      save(); announce("Mission 5 complete."); render(); return;
    }
    if (action === "review-mission5") {
      state.currentMission = 5;
      state.screen = "mission5";
      save(); render(); return;
    }
    if (action === "start-mission6") {
      state.currentMission = 6;
      state.screen = "mission6";
      state.feedback = "Select or drag the unstained slide into the Staining Machine.";
      state.feedbackType = "info";
      save(); announce("Mission 6. Add Colour to the Tissue."); render(); return;
    }
    if (action === "mission6-select-slide") {
      state.mission6 = L.applyMission6Action(state.mission6, "select-slide");
      state.feedback = state.mission6.slideSelected ? "Unstained slide selected. Now choose the Staining Machine loading area." : "Select or drag the unstained slide into the Staining Machine.";
      state.feedbackType = "info";
      pendingFocus = state.mission6.slideSelected ? '[data-action="mission6-place-slide"]' : '[data-action="mission6-select-slide"]';
      save(); render(); return;
    }
    if (action === "mission6-place-slide") {
      const next = L.applyMission6Action(state.mission6, "place-slide", trigger);
      if (next.step === state.mission6.step) {
        setFeedback("Select the unstained slide first, then choose the Staining Machine loading area.", "info");
        return;
      }
      state.mission6 = next;
      state.feedback = "The unstained slide is safely loaded in the Staining Machine.";
      state.feedbackType = "good";
      save(); announce(state.feedback); render(); return;
    }
    if (action === "mission6-next" && state.mission6.complete) {
      state.mission6Complete = true;
      state.screen = "mission6-complete";
      save(); announce("Mission 6 complete."); render(); return;
    }
    if (action === "review-mission6") {
      state.currentMission = 6;
      state.screen = "mission6";
      save(); render(); return;
    }
    if (action === "start-mission7") {
      state.currentMission = 7;
      state.screen = "mission7";
      state.feedback = "Which one is the H&E slide?";
      state.feedbackType = "info";
      save(); announce("Mission 7. Find the H&E Slide."); render(); return;
    }
    if (action === "mission7-hint") {
      state.mission7 = L.applyMission7Action(state.mission7, "toggle-hint");
      state.feedback = "H&E usually makes the nuclei blue-purple and much of the surrounding tissue pink.";
      state.feedbackType = "info";
      save(); announce(state.feedback); render(); return;
    }
    if (action === "mission7-choice") {
      state.mission7 = L.applyMission7Action(state.mission7, "choose", value);
      if (value === "slide-a") state.feedback = "Not this one. H&E doesn't normally look green and yellow. Try again!";
      if (value === "slide-c") state.feedback = "Nearly! Look for the slide that also has lots of pink. Try again!";
      if (value === L.MISSION7_CORRECT_CHOICE) state.feedback = "YES! You found the H&E slide!";
      state.feedbackType = value === L.MISSION7_CORRECT_CHOICE ? "good" : "try";
      if (state.mission7.correctSelected) pendingFocus = '[data-action="mission7-finish"]';
      save(); announce(state.feedback); render(); return;
    }
    if (action === "mission7-finish" && state.mission7.correctSelected) {
      state.mission7 = L.applyMission7Action(state.mission7, "finish");
      state.mission7Complete = true;
      state.screen = "journey-complete";
      save(); announce("Mission complete. Great job, scientist!"); render(); return;
    }
    if (action === "play-again") {
      if (!window.confirm("Play again with a new patient case? This will reset the Histology journey.")) return;
      localStorage.removeItem(STORAGE_KEY);
      state = initialState();
      announce("Choose a difficulty to start a new Histology case."); render(); return;
    }
    if (action === "finish-to-hub") {
      if (!saveHubCompletion()) {
        announce("Complete all seven Histology missions before returning to the hub.");
        return;
      }
      window.location.href = "../";
      return;
    }
    if (action === "review-mission1") {
      state.screen = "mission1";
      save(); render(); return;
    }
    if (action === "change-level") {
      state.screen = "level";
      state.forceReplay = true;
      save(); render(); return;
    }
    if (action === "new-case") {
      if (!window.confirm("Start a new case? This will replace the current Histology patient and journey progress.")) return;
      localStorage.removeItem(STORAGE_KEY);
      state = initialState();
      announce("Choose a difficulty to start a new case.");
      render();
    }
  }

  app.addEventListener("click", (event) => {
    const control = event.target.closest("[data-action]");
    if (!control || control.disabled) return;
    handleAction(control.dataset.action, control.dataset.value, "click");
  });

  app.addEventListener("dragstart", (event) => {
    const tissue = event.target.closest('[data-action="mission2-select-tissue"]');
    if (tissue && state.mission2.step === "transfer") {
      state.mission2 = { ...state.mission2, tissueSelected: true };
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", "histology-small-tissue");
      document.documentElement.classList.add("is-dragging");
      save();
      return;
    }
    const section = event.target.closest('[data-action="mission5-select-section"]');
    if (section && state.mission5.step === "transfer_ready") {
      state.mission5 = { ...state.mission5, sectionSelected: true };
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", "histology-thin-section");
      document.documentElement.classList.add("is-dragging");
      save();
      return;
    }
    const slide = event.target.closest('[data-action="mission6-select-slide"]');
    if (slide && state.mission6.step === "transfer_ready") {
      state.mission6 = { ...state.mission6, slideSelected: true };
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", "histology-unstained-slide");
      document.documentElement.classList.add("is-dragging");
      save();
      return;
    }
    const accepted = event.target.closest('[data-action="toggle-transfer"]');
    if (!accepted || state.racked) {
      event.preventDefault();
      return;
    }
    state.selectedTransfer = true;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", "accepted-histology-specimen");
    document.documentElement.classList.add("is-dragging");
    save();
  });

  app.addEventListener("dragend", () => {
    document.documentElement.classList.remove("is-dragging");
  });

  app.addEventListener("dragover", (event) => {
    if (event.target.closest('[data-drop="rack"], [data-drop="cassette"], [data-drop="slide"], [data-drop="staining-machine"]')) event.preventDefault();
  });

  app.addEventListener("drop", (event) => {
    const rack = event.target.closest('[data-drop="rack"]');
    const cassette = event.target.closest('[data-drop="cassette"]');
    const slide = event.target.closest('[data-drop="slide"]');
    const stainingMachine = event.target.closest('[data-drop="staining-machine"]');
    if (!rack && !cassette && !slide && !stainingMachine) return;
    event.preventDefault();
    document.documentElement.classList.remove("is-dragging");
    const payload = event.dataTransfer.getData("text/plain");
    if (rack && payload === "accepted-histology-specimen") handleAction("rack-sample", "", "drop");
    if (cassette && payload === "histology-small-tissue") handleAction("mission2-place-tissue", "", "drop");
    if (slide && payload === "histology-thin-section") handleAction("mission5-place-section", "", "drop");
    if (stainingMachine && payload === "histology-unstained-slide") handleAction("mission6-place-slide", "", "drop");
  });

  app.addEventListener("pointerdown", (event) => {
    if (!event.target.closest("[data-cut-zone]") || state.mission2.step !== "cutting" || !state.mission2.scalpelSelected) return;
    cutStart = { x: event.clientX, y: event.clientY };
    document.documentElement.classList.add("is-dragging");
  });

  app.addEventListener("pointerup", (event) => {
    if (!cutStart) return;
    const distance = Math.hypot(event.clientX - cutStart.x, event.clientY - cutStart.y);
    cutStart = null;
    document.documentElement.classList.remove("is-dragging");
    if (distance >= 55) handleAction("mission2-cut", "", "swipe");
    else setFeedback("Try a longer swipe across the broad gold cutting guide, or use Cut along the guide.", "info");
  });

  function updateOrientation() {
    const blocked = window.matchMedia("(orientation: portrait) and (max-width: 720px)").matches && ["mission1", "mission2", "mission3", "mission4", "mission5", "mission6", "mission7"].includes(state.screen);
    orientationBlocker.hidden = !blocked;
    app.inert = blocked;
    document.documentElement.classList.toggle("orientation-blocked", blocked);
  }

  window.addEventListener("resize", updateOrientation);
  window.addEventListener("orientationchange", updateOrientation);
  render();
})();
