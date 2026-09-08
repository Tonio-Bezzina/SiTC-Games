const CHECKPOINT_KEY = "sitcChemistryMainCheckpointV1";
const LEVELS = {
    junior: { label: "Junior", ages: [7, 9] },
    explorer: { label: "Explorer", ages: [10, 12] },
    challenge: { label: "Challenge", ages: [13, 16] }
};
const SURNAMES = ["Borg", "Camilleri", "Galea", "Mifsud", "Vella", "Zammit"];
const screenHost = document.getElementById("screenHost");
const gameShell = document.getElementById("gameShell");
const guide = document.getElementById("guide");
const guideText = document.getElementById("guideText");
const chapterLabel = document.getElementById("chapterLabel");
const caseSummary = document.getElementById("caseSummary");
const gameBar = document.querySelector(".game-bar");
const levelLabel = document.getElementById("levelLabel");
const levelButton = document.getElementById("levelButton");
const levelDialog = document.getElementById("levelDialog");
const helpDialog = document.getElementById("helpDialog");
const soundButton = document.getElementById("soundButton");
const fullscreenButton = document.getElementById("fullscreenButton");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const portraitQuery = window.matchMedia("(orientation: portrait)");
const reducedMotionOverride = new URLSearchParams(window.location.search).get("reduced-motion") === "1";

let storageAvailable = true;
let phaseTimer = null;
let drag = null;
let lastFocus = null;

let state = {
    version: 1,
    level: null,
    caseData: null,
    scenario: null,
    stage: "opening",
    clueSeen: false,
    inspectionIndex: null,
    mismatchFields: [],
    acceptedIndex: null,
    bottleSelected: false,
    soundOn: true
};

function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function randomDigits(count) {
    return Array.from({ length: count }, () => Math.floor(Math.random() * 10)).join("");
}

function formatDate(date) {
    return [date.getDate(), date.getMonth() + 1, date.getFullYear()]
        .map((part, index) => index < 2 ? String(part).padStart(2, "0") : String(part))
        .join("/");
}

function createBirthday(level) {
    const now = new Date();
    const [minimum, maximum] = LEVELS[level].ages;
    const age = minimum + Math.floor(Math.random() * (maximum - minimum + 1));
    const month = Math.floor(Math.random() * 12);
    const day = 1 + Math.floor(Math.random() * 28);
    const birthdayPassed = month < now.getMonth() || (month === now.getMonth() && day <= now.getDate());
    return formatDate(new Date(now.getFullYear() - age - (birthdayPassed ? 0 : 1), month, day));
}

function createCase(level) {
    return {
        name: `Ian ${randomItem(SURNAMES)}`,
        id: `CH-${randomDigits(3)}-${randomDigits(3)}`,
        dob: createBirthday(level),
        test: "Glucose"
    };
}

function changeIdSubtly(id) {
    const characters = id.split("");
    const digitPositions = characters.map((character, index) => /\d/.test(character) ? index : -1).filter(index => index >= 0);
    const candidates = digitPositions.filter((position, index) => index < digitPositions.length - 1 && characters[position] !== characters[digitPositions[index + 1]]);
    if (candidates.length) {
        const first = randomItem(candidates);
        const next = digitPositions[digitPositions.indexOf(first) + 1];
        [characters[first], characters[next]] = [characters[next], characters[first]];
    } else {
        const position = randomItem(digitPositions);
        characters[position] = String((Number(characters[position]) + 1) % 10);
    }
    return characters.join("");
}

function createScenario(level, patient) {
    const correct = { ...patient, correct: true, mismatchFields: [] };
    let wrong;
    if (level === "junior") {
        wrong = {
            name: `Maya ${randomItem(SURNAMES.filter(name => !patient.name.endsWith(name)))}`,
            id: `CH-${randomDigits(3)}-${randomDigits(3)}`,
            dob: formatDate(new Date(2012, 2, 14)),
            test: "Glucose",
            correct: false,
            mismatchFields: ["name", "id", "dob"]
        };
    } else if (level === "explorer") {
        let differentId = `CH-${randomDigits(3)}-${randomDigits(3)}`;
        if (differentId === patient.id) differentId = "CH-804-271";
        wrong = { ...patient, id: differentId, correct: false, mismatchFields: ["id"] };
    } else {
        wrong = { ...patient, id: changeIdSubtly(patient.id), correct: false, mismatchFields: ["id"] };
    }
    return Math.random() < .5 ? [correct, wrong] : [wrong, correct];
}

function isValidCheckpoint(value) {
    const stages = ["opening", "story", "clue", "arrival", "carrier", "carrier-open", "inspection", "transfer", "complete"];
    return value && value.version === 1 && LEVELS[value.level]
        && value.caseData && typeof value.caseData.name === "string"
        && typeof value.caseData.id === "string" && typeof value.caseData.dob === "string"
        && Array.isArray(value.scenario) && value.scenario.length === 2
        && value.scenario.filter(sample => sample && sample.correct === true).length === 1
        && stages.includes(value.stage);
}

function readCheckpoint() {
    try {
        const raw = localStorage.getItem(CHECKPOINT_KEY);
        if (!raw) return null;
        const value = JSON.parse(raw);
        return isValidCheckpoint(value) ? value : null;
    } catch (error) {
        storageAvailable = false;
        console.warn("Chemistry checkpoint is unavailable:", error);
        return null;
    }
}

function saveCheckpoint() {
    try {
        localStorage.setItem(CHECKPOINT_KEY, JSON.stringify(state));
        storageAvailable = true;
    } catch (error) {
        storageAvailable = false;
        console.warn("Chemistry checkpoint could not be saved:", error);
    }
}

function clearCheckpoint() {
    try {
        localStorage.removeItem(CHECKPOINT_KEY);
    } catch (error) {
        storageAvailable = false;
    }
}

function setGuide(message, callout = false) {
    guideText.textContent = message;
    guide.classList.toggle("clue-callout", callout);
}

function updateChrome() {
    levelLabel.textContent = state.level ? LEVELS[state.level].label : "Choose";
    chapterLabel.textContent = state.level ? "Chapter 1 · Check the sample" : "Opening";
    caseSummary.textContent = state.caseData ? "Ian · Glucose" : "";
    caseSummary.classList.toggle("hidden", !state.caseData);
    gameBar.classList.toggle("has-case", Boolean(state.caseData));
    soundButton.textContent = state.soundOn ? "🔊" : "🔇";
    soundButton.setAttribute("aria-pressed", String(state.soundOn));
    soundButton.setAttribute("aria-label", state.soundOn ? "Turn sound off" : "Turn sound on");
}

function playTone(kind = "success") {
    if (!state.soundOn) return;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    try {
        const context = new Audio();
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.type = kind === "arrival" ? "sine" : kind === "try" ? "triangle" : "sine";
        oscillator.frequency.setValueAtTime(kind === "arrival" ? 290 : kind === "try" ? 180 : 520, context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(kind === "try" ? 135 : 760, context.currentTime + .2);
        gain.gain.setValueAtTime(.07, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .24);
        oscillator.start();
        oscillator.stop(context.currentTime + .25);
    } catch (error) {
        // Audio is optional; visual feedback remains complete.
    }
}

function cancelPhaseTimer() {
    if (phaseTimer?.id) clearTimeout(phaseTimer.id);
    phaseTimer = null;
}

function startPhaseTimer() {
    if (!phaseTimer || portraitQuery.matches || phaseTimer.id) return;
    phaseTimer.started = performance.now();
    phaseTimer.id = window.setTimeout(() => {
        const callback = phaseTimer?.callback;
        phaseTimer = null;
        if (callback) callback();
    }, phaseTimer.remaining);
}

function schedulePhase(callback, delay) {
    cancelPhaseTimer();
    phaseTimer = { callback, remaining: delay, started: 0, id: null };
    startPhaseTimer();
}

function pausePhaseTimer() {
    if (!phaseTimer?.id) return;
    clearTimeout(phaseTimer.id);
    phaseTimer.remaining = Math.max(0, phaseTimer.remaining - (performance.now() - phaseTimer.started));
    phaseTimer.id = null;
}

function render() {
    cancelPhaseTimer();
    updateChrome();
    if (state.stage === "opening") renderOpening();
    if (state.stage === "story") renderStory();
    if (state.stage === "clue") renderClueIntro();
    if (state.stage === "arrival") renderArrival();
    if (state.stage === "carrier") renderCarrier(false);
    if (state.stage === "carrier-open") renderCarrier(true);
    if (state.stage === "inspection") renderInspection();
    if (state.stage === "transfer") renderTransfer();
    if (state.stage === "complete") renderComplete();
}

function renderOpening() {
    screenHost.innerHTML = `
        <section class="screen opening-screen" aria-labelledby="openingTitle">
            <div class="clinic-scene" role="img" aria-label="Ian sitting calmly on a chair in a clinic room">
                <div class="clinic-window" aria-hidden="true"><img src="assets/malta-window-townscape-v2.png" alt=""></div>
                <img class="ian-opening" src="assets/ian-seated-v2.png" alt="" draggable="false">
            </div>
            <div class="opening-panel">
                <p class="kicker">CLINICAL CHEMISTRY · MAIN MISSION</p>
                <h1 id="openingTitle">Help Ian's doctor find the clues.</h1>
                <p class="opening-lede">Choose how much guidance you would like during the mission.</p>
                <div class="level-grid" aria-label="Choose a mission level">
                    ${Object.entries(LEVELS).map(([id, level]) => `<button type="button" data-opening-level="${id}"><strong>${level.label}</strong><span>${id === "junior" ? "More guidance" : id === "explorer" ? "Some clues" : "Fewer clues"}</span></button>`).join("")}
                </div>
                <p class="same-badge">Every level will earn the same badge when the full mission is available.</p>
            </div>
        </section>`;
    setGuide("Choose Junior, Explorer or Challenge to start Ian's case.");
    document.querySelectorAll("[data-opening-level]").forEach(button => button.addEventListener("click", () => startFresh(button.dataset.openingLevel)));
}

function startFresh(level) {
    clearCheckpoint();
    state = {
        version: 1,
        level,
        caseData: createCase(level),
        scenario: null,
        stage: "story",
        clueSeen: false,
        inspectionIndex: null,
        mismatchFields: [],
        acceptedIndex: null,
        bottleSelected: false,
        soundOn: state.soundOn
    };
    state.scenario = createScenario(level, state.caseData);
    saveCheckpoint();
    render();
}

function renderStory() {
    screenHost.innerHTML = `
        <section class="screen opening-screen story-screen" aria-labelledby="storyTitle">
            <div class="clinic-scene" role="img" aria-label="Ian sitting calmly on a chair in a clinic room">
                <div class="clinic-window" aria-hidden="true"><img src="assets/malta-window-townscape-v2.png" alt=""></div>
                <img class="ian-opening" src="assets/ian-seated-v2.png" alt="" draggable="false">
            </div>
            <div class="opening-panel">
                <p class="kicker">IAN'S CASE</p>
                <h1 id="storyTitle">A blood test can help find the clues.</h1>
                <div class="story-copy">
                    <p><strong>Doctor:</strong> “Ian has been feeling tired. Please help the laboratory measure his glucose.”</p>
                    <p><strong>Scientist:</strong> “Glucose is a sugar our bodies use for energy. Let's follow Ian's sample!”</p>
                </div>
                <div class="topic-pills" aria-label="Chemistry can investigate"><span>Glucose & energy</span><span>Salts & fluid balance</span><span>Kidney clues</span></div>
                <button class="primary-button story-next" type="button">Follow Ian's sample →</button>
            </div>
        </section>`;
    setGuide("Ian's blood test is ready to travel to the laboratory.");
    document.querySelector(".story-next").addEventListener("click", () => {
        state.stage = "clue";
        saveCheckpoint();
        render();
    });
}

function renderClueIntro() {
    screenHost.innerHTML = `
        <section class="screen reception-screen" aria-label="Clinical chemistry reception">
            <img class="reception-bg" src="assets/reception-background-v1.png" alt="">
            <div class="scene-shade"></div>
            <div class="scene-heading"><h1>Welcome to sample reception</h1><p>The clue strip stays with you throughout the mission.</p></div>
        </section>`;
    setGuide("Look here for clues to help you complete your mission.", true);
    schedulePhase(() => {
        state.clueSeen = true;
        state.stage = "arrival";
        saveCheckpoint();
        render();
    }, reducedMotionEnabled() ? 950 : 1900);
}

function receiverMarkup(arriving = false) {
    return `<div class="receiver-wrap ${arriving ? "arriving" : ""}">
        <img class="receiver-art" src="assets/pts-receiver-clean-v3.png" alt="PTS receiving terminal">
        <span class="arrival-light ${arriving ? "on" : ""}" role="status" aria-label="${arriving ? "Carrier arrival light on" : "Carrier arrival light off"}"></span>
        ${arriving ? '<img class="vertical-carrier" src="assets/pts-carrier-closed-v1.png" alt="Carrier approaching the receiving station">' : ""}
    </div>`;
}

function renderArrival() {
    screenHost.innerHTML = `
        <section class="screen reception-screen" aria-labelledby="arrivalTitle">
            <img class="reception-bg" src="assets/reception-background-v1.png" alt="Clinical chemistry reception bench">
            <div class="scene-shade"></div>
            <div class="scene-heading"><h1 id="arrivalTitle">A sample is arriving</h1><p>The light and movement show the carrier entering the receiving station.</p></div>
            ${receiverMarkup(true)}
        </section>`;
    setGuide("Watch the PTS carrier arrive at the receiving station.");
    playTone("arrival");
    schedulePhase(() => {
        state.stage = "carrier";
        saveCheckpoint();
        render();
    }, reducedMotionEnabled() ? 500 : 1900);
}

function renderCarrier(open) {
    screenHost.innerHTML = `
        <section class="screen reception-screen" aria-labelledby="carrierTitle">
            <img class="reception-bg" src="assets/reception-background-v1.png" alt="Clinical chemistry reception bench">
            <div class="scene-shade"></div>
            <div class="scene-heading"><h1 id="carrierTitle">${open ? "The carrier is open" : "Ian's sample has arrived"}</h1><p>${open ? "The carrier moves to the horizontal bench view for inspection." : "It has settled safely in the receiving station."}</p></div>
            ${open ? `<img class="bench-carrier" src="assets/pts-carrier-open-v2.png" alt="Open carrier on the bench with two grey-top samples and paper requests">` : `${receiverMarkup(false)}<button class="carrier-button" type="button" aria-label="Open the settled PTS carrier"><img src="assets/pts-carrier-closed-v1.png" alt="Closed PTS carrier settled in the receiving station"></button>`}
        </section>`;
    setGuide(open ? "Two grey-top sample bottles and their requests are ready to compare." : "Ian's sample has arrived through the tube system. Tap the carrier to open it.");
    if (!open) {
        document.querySelector(".carrier-button").addEventListener("click", () => {
            state.stage = "carrier-open";
            saveCheckpoint();
            render();
        });
    } else {
        schedulePhase(() => {
            state.stage = "inspection";
            saveCheckpoint();
            render();
        }, reducedMotionEnabled() ? 450 : 850);
    }
}

function monitorField(label, value, field) {
    return `<div class="field" data-reference-field="${field}"><dt>${label}</dt><dd>${value}</dd></div>`;
}

function monitorMarkup() {
    const patient = state.caseData;
    return `<div class="reference-monitor" aria-label="Laboratory request monitor reference">
        <img src="assets/request-monitor-v1.png" alt="Laboratory request monitor">
        <div class="monitor-ui">
            <header>Clinical Chemistry Request</header>
            <dl>
                ${monitorField("Patient name", patient.name, "name")}
                ${monitorField("ID no.", patient.id, "id")}
                ${monitorField("Date of birth", patient.dob, "dob")}
            </dl>
            <div class="request-test">Requested test: <b>Glucose</b></div>
        </div>
    </div>`;
}

function tubeLabelMarkup(sample) {
    return `<span class="tube-label">
        <span data-sample-field="name"><b>${sample.name}</b></span>
        <span data-sample-field="id">ID no. ${sample.id}</span>
        <span data-sample-field="dob">${sample.dob}</span>
    </span>`;
}

function paperRow(label, value, field) {
    return `<span class="paper-row" data-sample-field="${field}"><b>${label}</b><span>${value}</span></span>`;
}

function paperMarkup(sample) {
    return `<span class="paper-copy">
        <strong>Clinical Chemistry Request</strong>
        <span class="paper-section"><em>Patient details</em>
            ${paperRow("Name", sample.name, "name")}
            ${paperRow("ID no.", sample.id, "id")}
            ${paperRow("Date of birth", sample.dob, "dob")}
        </span>
        <span class="paper-section"><em>Requested test</em>${paperRow("Test", "Glucose", "test")}</span>
    </span>`;
}

function stationMarkup(sample, index) {
    return `<article class="sample-station station-${index}" data-index="${index}" data-correct="${sample.correct}">
        <button class="station-inspect" type="button" aria-label="Inspect sample set ${index + 1}" aria-expanded="false">
            <span class="station-name">Sample set ${index + 1}</span>
            <span class="tube-wrap"><img src="assets/grey-bottle-v1.png" alt="Grey-top glucose sample bottle">${tubeLabelMarkup(sample)}</span>
            <span class="paper-wrap"><img src="assets/paper-request-v2.png" alt="Paper glucose request">${paperMarkup(sample)}</span>
            <span class="inspect-prompt">Tap to inspect</span>
        </button>
        <div class="station-actions">
            <button class="primary-button select-sample" type="button">Select this sample</button>
            <button class="secondary-button compare-sample" type="button">Compare other sample</button>
        </div>
    </article>`;
}

function renderInspection() {
    screenHost.innerHTML = `
        <section class="screen inspection-screen" aria-labelledby="inspectionTitle">
            <img class="inspection-bg" src="assets/reception-background-v1.png" alt="">
            <div class="scene-heading"><h1 id="inspectionTitle">Check whose sample it is</h1><p>Compare name, ID no. and date of birth on all three surfaces.</p></div>
            ${monitorMarkup()}
            <div class="sample-stations">${state.scenario.map(stationMarkup).join("")}</div>
            <div class="inline-feedback hidden" role="alert"></div>
        </section>`;
    setGuide(state.level === "challenge" ? "One ID no. has a subtle digit change. Inspect both complete sets carefully." : "Match name, ID no. and birth date on the monitor, bottle and request.");
    document.querySelectorAll(".sample-station").forEach(station => {
        const index = Number(station.dataset.index);
        station.querySelector(".station-inspect").addEventListener("click", () => openStation(index));
        station.querySelector(".compare-sample").addEventListener("click", () => closeStation(index));
        station.querySelector(".select-sample").addEventListener("click", () => chooseSample(index));
    });
    if (Number.isInteger(state.inspectionIndex)) openStation(state.inspectionIndex, false);
    if (state.mismatchFields.length) showMismatch(state.inspectionIndex, state.mismatchFields);
}

function openStation(index, moveFocus = true) {
    document.querySelectorAll(".sample-station.expanded").forEach(station => {
        station.classList.remove("expanded");
        station.querySelector(".station-inspect").setAttribute("aria-expanded", "false");
    });
    const station = document.querySelector(`.sample-station[data-index="${index}"]`);
    if (!station) return;
    station.classList.add("expanded");
    station.querySelector(".station-inspect").setAttribute("aria-expanded", "true");
    document.querySelector(".inspection-screen").classList.add("reviewing");
    state.inspectionIndex = index;
    saveCheckpoint();
    if (moveFocus) station.querySelector(".select-sample").focus();
}

function closeStation(index) {
    const station = document.querySelector(`.sample-station[data-index="${index}"]`);
    station?.classList.remove("expanded");
    station?.querySelector(".station-inspect")?.setAttribute("aria-expanded", "false");
    document.querySelector(".inspection-screen")?.classList.remove("reviewing");
    document.querySelectorAll(".mismatch").forEach(element => element.classList.remove("mismatch"));
    document.querySelector(".inline-feedback")?.classList.add("hidden");
    state.inspectionIndex = null;
    state.mismatchFields = [];
    saveCheckpoint();
    station?.querySelector(".station-inspect")?.focus();
}

function showMismatch(index, fields) {
    if (!Number.isInteger(index)) return;
    const station = document.querySelector(`.sample-station[data-index="${index}"]`);
    fields.forEach(field => {
        document.querySelector(`[data-reference-field="${field}"]`)?.classList.add("mismatch");
        station?.querySelectorAll(`[data-sample-field="${field}"]`).forEach(element => element.classList.add("mismatch"));
    });
    const feedback = document.querySelector(".inline-feedback");
    if (!feedback) return;
    feedback.textContent = fields.length > 1
        ? "These patient details conflict. Compare the name, ID no. and date of birth on the monitor, bottle and paper request."
        : "This ID no. is different. Compare these two numbers on the monitor, bottle and paper request.";
    feedback.classList.remove("hidden");
}

function chooseSample(index) {
    const sample = state.scenario[index];
    if (!sample.correct) {
        state.inspectionIndex = index;
        state.mismatchFields = [...sample.mismatchFields];
        showMismatch(index, state.mismatchFields);
        saveCheckpoint();
        playTone("try");
        return;
    }
    state.acceptedIndex = index;
    state.inspectionIndex = null;
    state.mismatchFields = [];
    state.stage = "transfer";
    state.bottleSelected = false;
    saveCheckpoint();
    playTone("success");
    render();
}

function renderTransfer() {
    const accepted = state.scenario[state.acceptedIndex];
    const rejected = state.scenario.find(sample => !sample.correct);
    screenHost.innerHTML = `
        <section class="screen transfer-screen" aria-labelledby="transferTitle">
            <img class="transfer-bg" src="assets/reception-background-v1.png" alt="Clinical chemistry reception bench">
            <div class="scene-heading"><h1 id="transferTitle">Matched! This sample belongs to Ian.</h1><p>Move the accepted bottle to the receiving/scanning rack.</p></div>
            <aside class="rejected-set" aria-label="Rejected sample set remains at reception"><h2>Rejected set</h2><p>Remains at reception</p><div class="mini-set"><img src="assets/grey-bottle-v1.png" alt="Grey-top rejected bottle"><img src="assets/paper-request-v2.png" alt="Rejected paper request"></div></aside>
            <div class="accepted-area">
                <button class="accepted-bottle ${state.bottleSelected ? "selected" : ""}" type="button" aria-pressed="${state.bottleSelected}" aria-label="Accepted bottle for ${accepted.name}. Drag it to the rack, or select it then select the rack.">
                    <img src="assets/grey-bottle-v1.png" alt="">${tubeLabelMarkup(accepted)}
                </button>
            </div>
            <button class="rack-zone ${state.bottleSelected ? "active" : ""}" type="button" aria-label="Receiving and scanning rack. Drop the accepted bottle here."><span>Receiving / scanning rack</span><img src="assets/sample-rack-clean-v3.png" alt="Four-position sample rack"></button>
        </section>`;
    setGuide("Drag Ian's accepted bottle to the highlighted rack. Or select the bottle, then select the rack.");
    const bottle = document.querySelector(".accepted-bottle");
    const rack = document.querySelector(".rack-zone");
    bottle.addEventListener("click", () => {
        if (Date.now() < (state.suppressClickUntil || 0)) return;
        state.bottleSelected = !state.bottleSelected;
        bottle.classList.toggle("selected", state.bottleSelected);
        bottle.setAttribute("aria-pressed", String(state.bottleSelected));
        rack.classList.toggle("active", state.bottleSelected);
        saveCheckpoint();
    });
    rack.addEventListener("click", () => {
        if (state.bottleSelected) completeTransfer();
        else {
            rack.classList.add("active");
            setGuide("Select Ian's accepted bottle first, then select this rack.");
            window.setTimeout(() => rack.classList.remove("active"), 700);
        }
    });
    bottle.addEventListener("pointerdown", beginBottleDrag);
}

function beginBottleDrag(event) {
    if (!event.isPrimary || event.button !== 0) return;
    const bottle = event.currentTarget;
    bottle.setPointerCapture(event.pointerId);
    drag = { pointerId:event.pointerId, bottle, startX:event.clientX, startY:event.clientY, moved:false };
    bottle.addEventListener("pointermove", moveBottleDrag);
    bottle.addEventListener("pointerup", endBottleDrag);
    bottle.addEventListener("pointercancel", cancelBottleDrag);
}

function moveBottleDrag(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < 7) return;
    drag.moved = true;
    event.preventDefault();
    drag.bottle.classList.add("dragging");
    drag.bottle.style.setProperty("--drag-x", `${dx}px`);
    drag.bottle.style.setProperty("--drag-y", `${dy}px`);
    const rack = document.querySelector(".rack-zone");
    const rect = rack.getBoundingClientRect();
    const inside = event.clientX >= rect.left - 28 && event.clientX <= rect.right + 28 && event.clientY >= rect.top - 28 && event.clientY <= rect.bottom + 28;
    rack.classList.toggle("drag-over", inside);
}

function endBottleDrag(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const current = drag;
    const rack = document.querySelector(".rack-zone");
    const rect = rack.getBoundingClientRect();
    const inside = current.moved && event.clientX >= rect.left - 28 && event.clientX <= rect.right + 28 && event.clientY >= rect.top - 28 && event.clientY <= rect.bottom + 28;
    cleanupDrag();
    if (current.moved) state.suppressClickUntil = Date.now() + 450;
    if (inside) completeTransfer();
    else if (current.moved) setGuide("The bottle returned safely. Try the highlighted rack again—missed drops are not scientific errors.");
}

function cancelBottleDrag() {
    if (!drag) return;
    cleanupDrag();
    setGuide("The bottle returned safely. Select it again when you are ready.");
}

function cleanupDrag() {
    if (!drag) return;
    const { bottle } = drag;
    bottle.classList.remove("dragging");
    bottle.style.removeProperty("--drag-x");
    bottle.style.removeProperty("--drag-y");
    bottle.removeEventListener("pointermove", moveBottleDrag);
    bottle.removeEventListener("pointerup", endBottleDrag);
    bottle.removeEventListener("pointercancel", cancelBottleDrag);
    document.querySelector(".rack-zone")?.classList.remove("drag-over");
    drag = null;
}

function completeTransfer() {
    cleanupDrag();
    state.stage = "complete";
    state.bottleSelected = false;
    saveCheckpoint();
    playTone("success");
    render();
}

function renderComplete() {
    screenHost.innerHTML = `
        <section class="screen complete-screen" aria-labelledby="completeTitle">
            <div class="complete-card">
                <div class="complete-icon" aria-hidden="true">✓</div>
                <p class="kicker">CHAPTER 1 COMPLETE</p>
                <h1 id="completeTitle">Sample checked!</h1>
                <p class="success-line">Sample checked! Ian's glucose sample is ready for preparation.</p>
                <p class="section-end"><strong>This is the end of the available first section.</strong><br>The centrifuge and later chapters are not included yet.</p>
                <div class="complete-actions">
                    <button class="primary-button" id="replayButton" type="button">Replay section</button>
                    <a class="secondary-button" href="../">Return to Chemistry Lab</a>
                </div>
                <p class="no-badge">No Chemistry badge has been awarded for this partial mission.${storageAvailable ? "" : " Progress could not be saved on this device."}</p>
            </div>
        </section>`;
    setGuide("First section complete. Replay it or return to the Clinical Chemistry Laboratory.");
    document.getElementById("replayButton").addEventListener("click", () => startFresh(state.level));
}

function changeLevel(level) {
    levelDialog.close();
    if (!state.caseData || state.stage === "opening" || state.stage === "complete") {
        startFresh(level);
        return;
    }
    cancelBottleDrag();
    state.level = level;
    state.scenario = createScenario(level, state.caseData);
    state.stage = state.stage === "story" ? "story" : state.clueSeen ? "arrival" : "clue";
    state.inspectionIndex = null;
    state.mismatchFields = [];
    state.acceptedIndex = null;
    state.bottleSelected = false;
    saveCheckpoint();
    render();
}

function attemptFullscreen() {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
    }
    if (screen.orientation?.lock) screen.orientation.lock("landscape").catch(() => {});
}

function showDialog(dialog, invoker) {
    lastFocus = invoker || document.activeElement;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
}

function closeHelp() {
    helpDialog.close();
    lastFocus?.focus?.();
}

function updateOrientation() {
    const portrait = portraitQuery.matches;
    gameShell.inert = portrait;
    document.body.classList.toggle("game-paused", portrait);
    if (portrait) {
        pausePhaseTimer();
        cancelBottleDrag();
    } else {
        startPhaseTimer();
    }
}

function reducedMotionEnabled() {
    return reducedMotionOverride || prefersReducedMotion.matches;
}

function showResumeDialog(saved) {
    const dialog = document.createElement("dialog");
    dialog.setAttribute("aria-labelledby", "resumeTitle");
    dialog.innerHTML = `<div class="dialog-card"><p class="dialog-kicker">SAVED CASE FOUND</p><h2 id="resumeTitle">Continue Ian's sample check?</h2><p>Your ${LEVELS[saved.level].label} case will resume with the same name, ID no., birthday and sample positions.</p><div class="dialog-actions"><button class="primary-button" type="button" data-continue>Continue case</button><button class="secondary-button" type="button" data-restart>Start again</button></div></div>`;
    document.body.appendChild(dialog);
    dialog.querySelector("[data-continue]").addEventListener("click", () => {
        state = { ...state, ...saved, soundOn: saved.soundOn !== false };
        dialog.close();
        dialog.remove();
        render();
    });
    dialog.querySelector("[data-restart]").addEventListener("click", () => {
        dialog.close();
        dialog.remove();
        state.stage = "opening";
        state.level = null;
        state.caseData = null;
        state.scenario = null;
        clearCheckpoint();
        render();
    });
    showDialog(dialog);
}

levelButton.addEventListener("click", () => showDialog(levelDialog, levelButton));
document.querySelectorAll("[data-level]").forEach(button => button.addEventListener("click", () => changeLevel(button.dataset.level)));
document.getElementById("helpButton").addEventListener("click", event => showDialog(helpDialog, event.currentTarget));
document.querySelectorAll("[data-close-help]").forEach(button => button.addEventListener("click", closeHelp));
soundButton.addEventListener("click", () => {
    state.soundOn = !state.soundOn;
    updateChrome();
    if (state.level) saveCheckpoint();
});
fullscreenButton.addEventListener("click", attemptFullscreen);
document.addEventListener("fullscreenchange", () => {
    fullscreenButton.textContent = document.fullscreenElement ? "×" : "⛶";
    fullscreenButton.setAttribute("aria-label", document.fullscreenElement ? "Exit full screen" : "Enter full screen");
});
portraitQuery.addEventListener?.("change", updateOrientation);
window.addEventListener("resize", updateOrientation);
window.addEventListener("blur", () => { if (drag) cancelBottleDrag(); });

updateOrientation();
document.body.classList.toggle("reduced-motion", reducedMotionEnabled());
render();
const savedCheckpoint = readCheckpoint();
if (savedCheckpoint) showResumeDialog(savedCheckpoint);

// Read-only hooks make browser verification possible without changing passport progress.
window.__chemistryGame = {
    getState: () => JSON.parse(JSON.stringify(state)),
    hasCheckpoint: () => Boolean(readCheckpoint())
};
