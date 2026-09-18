(function () {
  "use strict";

  const L = window.HistologyLogic;
  const app = document.getElementById("app");
  const announcer = document.getElementById("announcer");
  const orientationBlocker = document.getElementById("orientationBlocker");
  const STORAGE_KEY = "sitcHistologyMission1V1";
  const VERSION = 1;
  let pendingFocus = null;

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
      feedbackType: ""
    };
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved || saved.version !== VERSION || (saved.caseData && !validCase(saved.caseData))) return initialState();
      return { ...initialState(), ...saved, screen: "level", forceReplay: false };
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
  }

  function chooseLevel(level) {
    if (!L.LEVELS[level]) return;
    const needsNewCase = !state.caseData;
    const levelChanged = state.level && state.level !== level;
    if (needsNewCase) {
      state.caseData = L.createCase(level);
      resetActivity();
    } else if (levelChanged || state.forceReplay) {
      state.caseData = L.changeCaseLevel(state.caseData, level);
      resetActivity();
    }
    state.level = level;
    state.caseData.level = level;
    state.screen = state.mission1Complete && !state.forceReplay ? "complete" : "mission";
    state.forceReplay = false;
    state.feedback = state.clueSeen ? "Choose a complete sample set to inspect." : "";
    save();
    render();
  }

  function missionHeader() {
    return `
      <header class="game-bar">
        <a class="back-link" href="../">← All laboratories</a>
        <div class="game-heading">
          <span>Histology</span>
          <strong>The Histology Journey</strong>
        </div>
        <div class="mission-progress" aria-label="Mission 1 of 7">
          <span>Mission</span><strong>1 / 7</strong>
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
        <div class="pot-label" aria-label="Specimen container label">${identityFields(identity, mismatches, true)}</div>
      </div>`;
  }

  function requestPaper(identity, mismatches) {
    return `
      <div class="paper-request">
        <img src="assets/mission-1/paper-request-blank.png" alt="Histology paper request form">
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
      if (state.level === "junior") return "Check the name, ID no. and date of birth one line at a time on the monitor, container and paper request.";
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
            <div class="next-preview"><strong>Next: Prepare the Tissue</strong><span>The next mission will be added in a future release.</span></div>
            <div class="complete-actions">
              <button class="primary-button" type="button" data-action="review-mission">Review Mission</button>
              <button class="secondary-button" type="button" data-action="change-level">Choose Another Level</button>
              <button class="secondary-button" type="button" data-action="new-case">Start a New Case</button>
              <a class="secondary-button button-link" href="../">Return to Game Hub</a>
            </div>
          </div>
        </section>
      </main>`;
  }

  function render() {
    app.innerHTML = state.screen === "mission"
      ? missionScreen()
      : state.screen === "complete"
        ? completionScreen()
        : levelScreen();
    updateOrientation();
    if (pendingFocus) {
      const selector = pendingFocus;
      pendingFocus = null;
      requestAnimationFrame(() => app.querySelector(selector)?.focus());
    }
  }

  function setFeedback(message, type = "") {
    state.feedback = message;
    state.feedbackType = type;
    save();
    announce(message);
    render();
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
      state.feedback = "Compare the name, ID no. and date of birth on all three surfaces.";
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
          : "These patient details conflict. Compare the name, ID no. and date of birth on the reference, specimen label and paper request.";
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
      state.screen = "complete";
      save(); announce("Mission 1 complete."); render(); return;
    }
    if (action === "review-mission") {
      state.screen = "mission";
      save(); render(); return;
    }
    if (action === "change-level") {
      state.screen = "level";
      state.forceReplay = true;
      save(); render(); return;
    }
    if (action === "new-case") {
      if (!window.confirm("Start a new case? This will replace the current Histology patient and Mission 1 progress.")) return;
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
    if (event.target.closest('[data-drop="rack"]')) event.preventDefault();
  });

  app.addEventListener("drop", (event) => {
    const rack = event.target.closest('[data-drop="rack"]');
    if (!rack) return;
    event.preventDefault();
    document.documentElement.classList.remove("is-dragging");
    if (event.dataTransfer.getData("text/plain") === "accepted-histology-specimen") handleAction("rack-sample", "", "drop");
  });

  function updateOrientation() {
    const blocked = window.matchMedia("(orientation: portrait) and (max-width: 720px)").matches && state.screen === "mission";
    orientationBlocker.hidden = !blocked;
    app.inert = blocked;
    document.documentElement.classList.toggle("orientation-blocked", blocked);
  }

  window.addEventListener("resize", updateOrientation);
  window.addEventListener("orientationchange", updateOrientation);
  render();
})();
