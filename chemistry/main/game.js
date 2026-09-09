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
let centrifugeDrag = null;
let lastFocus = null;

let state = {
    version: 2,
    level: null,
    caseData: null,
    scenario: null,
    stage: "opening",
    clueSeen: false,
    inspectionIndex: null,
    mismatchFields: [],
    acceptedIndex: null,
    bottleSelected: false,
    chapter1Complete: false,
    centrifuge: null,
    soundOn: true
};

function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function randomDigits(count) {
    return Array.from({ length: count }, () => Math.floor(Math.random() * 10)).join("");
}

function randomPatientId() {
    return `${randomDigits(5)}${randomItem(["H", "L"])}`;
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
        id: randomPatientId(),
        dob: createBirthday(level),
        test: "Glucose",
        accession: `CC-${randomDigits(6)}`
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
            id: randomPatientId(),
            dob: formatDate(new Date(2012, 2, 14)),
            test: "Glucose",
            correct: false,
            mismatchFields: ["name", "id", "dob"]
        };
    } else if (level === "explorer") {
        let differentId = randomPatientId();
        if (differentId === patient.id) differentId = patient.id === "80427H" ? "80427L" : "80427H";
        wrong = { ...patient, id: differentId, correct: false, mismatchFields: ["id"] };
    } else {
        wrong = { ...patient, id: changeIdSubtly(patient.id), correct: false, mismatchFields: ["id"] };
    }
    return Math.random() < .5 ? [correct, wrong] : [wrong, correct];
}

function isCentrifugeStage(stage) {
    return ["centrifuge-load", "centrifuge-spinning", "centrifuge-stopped", "centrifuge-retrieve", "plasma", "centrifuge-complete"].includes(stage);
}

function centrifugeSlotCount(level) {
    return level === "challenge" ? 8 : 4;
}

function createBatch(patient) {
    return [
        { key:"ian", name:patient.name, id:patient.id, dob:patient.dob, accession:patient.accession, cap:"grey", kind:"patient", asset:"grey-bottle-v1.png" },
        { key:"aisha", name:"Aisha Borg", id:`${randomDigits(5)}H`, dob:"18/04/2013", accession:`CC-${randomDigits(6)}`, cap:"yellow", kind:"patient", asset:"yellow-bottle-v1.png" },
        { key:"leo", name:"Leo Vella", id:`${randomDigits(5)}L`, dob:"07/11/2011", accession:`CC-${randomDigits(6)}`, cap:"grey", kind:"patient", asset:"grey-bottle-v1.png" },
        { key:"balance", name:"BALANCE", id:"", dob:"", accession:"", cap:"blue", kind:"balance", asset:"balance-tube-v1.png" }
    ];
}

function createCentrifugeState(level, patient, batch = null) {
    return {
        batch: batch || createBatch(patient),
        rack: ["ian", "aisha", "leo", "balance"],
        slots: Array(centrifugeSlotCount(level)).fill(null),
        selected: null,
        selectedFrom: null,
        lidClosed: false,
        cycle: "idle",
        hint: null,
        feedback: "",
        retrieved: false,
        plasmaChoice: null,
        balancedOnce: false
    };
}

function normaliseCheckpoint(value) {
    if (!value || !LEVELS[value.level]) return value;
    if (value.version === 1) {
        value.version = 2;
        value.caseData.accession ||= `CC-${randomDigits(6)}`;
        value.chapter1Complete = value.stage === "complete";
        value.stage = value.stage === "complete" ? "centrifuge-load" : value.stage;
        value.centrifuge = value.chapter1Complete ? createCentrifugeState(value.level, value.caseData) : null;
    }
    if (value.version === 2 && value.centrifuge?.cycle === "spinning") {
        value.centrifuge.cycle = "idle";
        value.centrifuge.lidClosed = true;
        value.centrifuge.feedback = "The interrupted demonstration is ready to start safely again.";
        value.stage = "centrifuge-load";
    }
    return value;
}

function isValidCheckpoint(value) {
    const stages = ["opening", "story", "clue", "arrival", "carrier", "carrier-open", "inspection", "transfer", "centrifuge-load", "centrifuge-stopped", "centrifuge-retrieve", "plasma", "centrifuge-complete"];
    const c = value?.centrifuge;
    const centrifugeOkay = !isCentrifugeStage(value?.stage) || (c && Array.isArray(c.batch) && c.batch.length === 4
        && Array.isArray(c.slots) && c.slots.length === centrifugeSlotCount(value.level)
        && Array.isArray(c.rack));
    return value && value.version === 2 && LEVELS[value.level]
        && value.caseData && typeof value.caseData.name === "string"
        && typeof value.caseData.id === "string" && /^\d{5}[HL]$/.test(value.caseData.id) && typeof value.caseData.dob === "string"
        && typeof value.caseData.accession === "string"
        && Array.isArray(value.scenario) && value.scenario.length === 2
        && value.scenario.filter(sample => sample && sample.correct === true).length === 1
        && stages.includes(value.stage) && centrifugeOkay;
}

function readCheckpoint() {
    try {
        const raw = localStorage.getItem(CHECKPOINT_KEY);
        if (!raw) return null;
        const value = normaliseCheckpoint(JSON.parse(raw));
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
    chapterLabel.textContent = state.level ? (state.chapter1Complete || isCentrifugeStage(state.stage) ? "Chapter 2 · Balance & separate" : "Chapter 1 · Check the sample") : "Opening";
    caseSummary.textContent = "";
    caseSummary.classList.add("hidden");
    gameBar.classList.remove("has-case");
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
    if (["centrifuge-load", "centrifuge-spinning", "centrifuge-stopped", "centrifuge-retrieve"].includes(state.stage)) renderCentrifuge();
    if (state.stage === "plasma") renderPlasmaChoice();
    if (state.stage === "centrifuge-complete") renderComplete();
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
        version: 2,
        level,
        caseData: createCase(level),
        scenario: null,
        stage: "story",
        clueSeen: false,
        inspectionIndex: null,
        mismatchFields: [],
        acceptedIndex: null,
        bottleSelected: false,
        chapter1Complete: false,
        centrifuge: null,
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
        ${arriving ? '<div class="carrier-transit" aria-hidden="true"><img src="assets/pts-carrier-closed-v1.png" alt=""></div>' : ""}
        <img class="receiver-art" src="assets/pts-receiver-clean-v3.png" alt="PTS receiving terminal">
        <span class="arrival-light ${arriving ? "on" : ""}" role="status" aria-label="${arriving ? "Carrier arrival light on" : "Carrier arrival light off"}"></span>
        ${arriving ? "" : '<button class="carrier-button" type="button" aria-label="Open the canister inside the PTS receiver"><img src="assets/pts-carrier-closed-v1.png" alt="Canister stopped inside the PTS receiver"><span class="bay-lip" aria-hidden="true"></span></button>'}
    </div>`;
}

function renderArrival() {
    screenHost.innerHTML = `
        <section class="screen reception-screen arrival-screen" aria-labelledby="arrivalTitle">
            <img class="reception-bg" src="assets/reception-background-v1.png" alt="Clinical chemistry reception bench">
            <div class="scene-shade"></div>
            <div class="scene-heading"><h1 id="arrivalTitle">A sample is arriving</h1><p>Watch the canister travel down the duct and into the receiving station.</p></div>
            ${receiverMarkup(true)}
        </section>`;
    setGuide("Watch the PTS canister travel through the duct and stop inside the receiver.");
    playTone("arrival");
    schedulePhase(() => {
        state.stage = "carrier";
        saveCheckpoint();
        render();
    }, reducedMotionEnabled() ? 500 : 2450);
}

function renderCarrier(open) {
    screenHost.innerHTML = `
        <section class="screen reception-screen" aria-labelledby="carrierTitle">
            <img class="reception-bg" src="assets/reception-background-v1.png" alt="Clinical chemistry reception bench">
            <div class="scene-shade"></div>
            <div class="scene-heading"><h1 id="carrierTitle">${open ? "The carrier is open" : "Ian's sample has arrived"}</h1><p>${open ? "The carrier moves to the horizontal bench view for inspection." : "It has settled safely in the receiving station."}</p></div>
            ${open ? `<img class="bench-carrier" src="assets/pts-carrier-open-v2.png" alt="Open carrier on the bench with two grey-top samples and paper requests">` : receiverMarkup(false)}
        </section>`;
    setGuide(open ? "Two grey-top sample bottles and their requests are ready to compare." : "Ian's sample has arrived through the tube system. Tap the canister to open it.");
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

function obscuredRequestDetails() {
    return `<span class="request-scribble" role="img" aria-label="Details intentionally obscured">
        <span class="request-scribble-line" aria-hidden="true"></span>
        <span class="request-scribble-line" aria-hidden="true"></span>
        <span class="request-scribble-line" aria-hidden="true"></span>
    </span>`;
}

function monitorMarkup() {
    const patient = state.caseData;
    return `<div class="reference-monitor" aria-label="Laboratory request monitor reference">
        <img src="assets/request-monitor-v1.png" alt="Laboratory request monitor">
        <div class="monitor-ui">
            <header>Clinical Chemistry Request</header>
            <section class="monitor-section monitor-patient-section">
                <h3>Patient details</h3>
                <dl>
                    ${monitorField("Patient name", patient.name, "name")}
                    ${monitorField("ID no.", patient.id, "id")}
                    ${monitorField("Date of birth", patient.dob, "dob")}
                </dl>
            </section>
            <div class="monitor-secondary-grid">
                <section class="monitor-section monitor-secondary-section"><h3>Sample request</h3>${obscuredRequestDetails()}</section>
                <section class="monitor-section monitor-secondary-section"><h3>Clinical details</h3>${obscuredRequestDetails()}</section>
                <section class="monitor-section monitor-secondary-section"><h3>Collection</h3>${obscuredRequestDetails()}</section>
            </div>
        </div>
    </div>`;
}

function tubeLabelMarkup(sample) {
    return `<span class="tube-label">
        <span data-sample-field="name"><b>${sample.name}</b></span>
        <span data-sample-field="id">${sample.id}</span>
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
        <span class="paper-section paper-secondary-section"><em>Sample request</em>${obscuredRequestDetails()}</span>
        <span class="paper-section paper-secondary-section"><em>Clinical details</em>${obscuredRequestDetails()}</span>
        <span class="paper-section paper-secondary-section"><em>Collection</em>${obscuredRequestDetails()}</span>
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
    state.chapter1Complete = true;
    state.centrifuge = createCentrifugeState(state.level, state.caseData);
    state.stage = "centrifuge-load";
    state.bottleSelected = false;
    saveCheckpoint();
    playTone("success");
    render();
}

function batchTube(key) {
    return state.centrifuge.batch.find(tube => tube.key === key);
}

function tubeCardMarkup(key, location, index = null) {
    const tube = batchTube(key);
    const selected = state.centrifuge.selected === key && state.centrifuge.selectedFrom === location;
    const identity = tube.kind === "balance"
        ? `<span class="batch-label balance-label"><b>BALANCE</b></span>`
        : `<span class="batch-label"><b>${tube.name}</b><span>${tube.id}</span><span>${tube.dob}</span><span>${tube.accession}</span></span>`;
    return `<button class="batch-tube ${tube.cap}-top ${selected ? "selected" : ""}" type="button" data-tube="${key}" data-location="${location}" ${index === null ? "" : `data-slot-index="${index}"`} aria-pressed="${selected}" aria-label="${tube.kind === "balance" ? "Balance tube" : `${tube.name}, ${tube.id}`}—select to move">
        <img src="assets/${tube.asset}" alt="" draggable="false">${identity}
    </button>`;
}

function oppositeIndex(index, count = state.centrifuge.slots.length) {
    return (index + count / 2) % count;
}

function unpairedSlots(slots) {
    return slots.map((key, index) => key && !slots[oppositeIndex(index, slots.length)] ? index : -1).filter(index => index >= 0);
}

function isBalancedSlots(slots) {
    const occupied = slots.filter(Boolean);
    return occupied.length > 0 && unpairedSlots(slots).length === 0;
}

function firstOpenOpposite(slots = state.centrifuge.slots) {
    const source = unpairedSlots(slots).find(index => !slots[oppositeIndex(index, slots.length)]);
    return source === undefined ? null : { source, target: oppositeIndex(source, slots.length) };
}

function slotPosition(index, count) {
    const angle = -90 + (360 / count) * index;
    const radians = angle * Math.PI / 180;
    return { angle, x:50 + Math.cos(radians) * 34, y:50 + Math.sin(radians) * 34 };
}

function rotorMarkup() {
    const c = state.centrifuge;
    const hint = c.hint;
    const selectedKey = c.selected;
    const selectedFromSlot = c.selectedFrom === "slot";
    return `<div class="rotor rotor-${c.slots.length}" aria-label="${c.slots.length}-position centrifuge rotor">
        ${hint ? `<span class="opposite-line" style="--line-angle:${slotPosition(hint.source, c.slots.length).angle}deg" aria-hidden="true"></span>` : ""}
        <span class="rotor-hub" aria-hidden="true"></span>
        ${c.slots.map((key, index) => {
            const p = slotPosition(index, c.slots.length);
            const ghost = hint?.target === index;
            const juniorTarget = state.level === "junior" && !hint && firstOpenOpposite()?.target === index;
            const tag = key ? "div" : "button";
            return `<${tag} class="rotor-slot ${key ? "occupied" : ""} ${ghost ? "hint-target" : ""} ${juniorTarget ? "junior-target" : ""}" ${key ? "" : 'type="button"'} data-slot="${index}" style="--slot-x:${p.x}%;--slot-y:${p.y}%" aria-label="Rotor position ${index + 1}${key ? `, ${batchTube(key).name}` : ", empty"}">
                <span class="slot-number">${index + 1}</span>
                ${key ? tubeCardMarkup(key, "slot", index) : ""}
                ${ghost ? '<span class="ghost-tube" aria-hidden="true">↓</span>' : ""}
            </${tag}>`;
        }).join("")}
    </div>`;
}

function setCentrifugeFeedback(message, hint = false) {
    state.centrifuge.feedback = message;
    if (hint) state.centrifuge.hint = firstOpenOpposite();
    saveCheckpoint();
    render();
}

function renderCentrifuge() {
    const c = state.centrifuge;
    const running = c.cycle === "spinning";
    const finished = c.cycle === "finished";
    const retrieve = state.stage === "centrifuge-retrieve";
    const machineClosed = c.lidClosed || running;
    const loaded = c.slots.filter(Boolean).length;
    const status = running ? "Spinning…" : finished ? "Finished!" : machineClosed ? "Lid closed" : "Stopped · lid open";
    screenHost.innerHTML = `
        <section class="screen centrifuge-screen ${running ? "cycle-running" : ""} ${retrieve ? "retrieve-mode" : ""}" aria-labelledby="centrifugeTitle">
            <img class="centrifuge-bg" src="assets/centrifuge-bench-v1.png" alt="Clinical chemistry centrifuge bench">
            <div class="centrifuge-copy">
                <p class="kicker">CHAPTER 2 · PREPARE THE SAMPLE</p>
                <h1 id="centrifugeTitle">${retrieve ? "Retrieve Ian's sample" : "Balance the centrifuge"}</h1>
                <p>${retrieve ? `Find <strong>${state.caseData.name}</strong>, ID <strong>${state.caseData.id}</strong>, and move it to the holder.` : "These tubes all weigh the same. Place them so every tube has another directly opposite it."}</p>
                <span class="reception-continuity">✓ Rejected sample stayed at reception</span>
            </div>
            <aside class="batch-rack ${c.selectedFrom === "slot" ? "return-target" : ""}" data-rack-target aria-label="Checked sample rack">
                <h2>${retrieve ? "Tubes remaining" : "Checked batch"}</h2>
                <div class="rack-tubes">${c.rack.map(key => tubeCardMarkup(key, "rack")).join("")}</div>
                <span class="rack-caption">${retrieve ? "Leave the other tubes here" : `${4 - loaded} ready to load`}</span>
            </aside>
            <div class="machine-stage">
                <div class="machine-shadow" aria-hidden="true"></div>
                <div class="centrifuge-machine ${running ? "spinning" : ""}">
                    <img src="assets/${machineClosed ? "centrifuge-closed-v1.png" : "centrifuge-open-v1.png"}" alt="Centrifuge ${machineClosed ? "with lid closed" : "with lid open"}">
                    ${machineClosed ? "" : rotorMarkup()}
                </div>
                <div class="machine-status ${running ? "running" : finished ? "finished" : ""}" role="status" aria-live="polite"><strong>${status}</strong><span>${running ? "Short illustrative cycle" : `${loaded} of 4 tubes loaded`}</span>${running ? '<span class="spin-progress" aria-hidden="true"><i></i></span>' : ""}</div>
            </div>
            ${retrieve ? `<button class="inspection-drop ${c.selected ? "active" : ""}" type="button" data-holder aria-label="Inspection holder—move Ian's sample here"><span>Inspection holder</span><img src="assets/inspection-holder-v1.png" alt="Empty inspection holder"></button>` : ""}
            <div class="centrifuge-controls">
                ${!retrieve && !running && !finished ? `<button class="secondary-button" type="button" data-lid>${c.lidClosed ? "Open lid" : "Close lid"}</button><button class="primary-button" type="button" data-spin>Spin</button>` : ""}
                ${finished && c.lidClosed ? '<button class="primary-button" type="button" data-open-after>Open lid</button>' : ""}
            </div>
            <div class="centrifuge-feedback ${c.feedback ? "" : "hidden"}" role="alert">${c.feedback || ""}</div>
        </section>`;
    if (retrieve) setGuide(`Move ${state.caseData.name}, ${state.caseData.id}, to the inspection holder. The other tubes stay at the station.`);
    else if (running) setGuide("Spinning… The closed machine is running a short illustrative cycle.");
    else if (finished) setGuide("Finished! The rotor has stopped completely. Open the lid.");
    else if (c.hint) setGuide("Place the balancing tube here, directly opposite this tube.");
    else setGuide("These tubes all weigh the same. Place them so every tube has another directly opposite it.");
    wireCentrifugeInteractions();
    if (running) schedulePhase(finishSpin, reducedMotionEnabled() ? 2200 : 3200);
}

function wireCentrifugeInteractions() {
    const c = state.centrifuge;
    if (c.cycle === "spinning") return;
    document.querySelectorAll(".batch-tube").forEach(button => {
        button.addEventListener("click", event => {
            event.stopPropagation();
            if (Date.now() < (state.suppressClickUntil || 0)) return;
            selectCentrifugeTube(button.dataset.tube, button.dataset.location, Number.isFinite(Number(button.dataset.slotIndex)) ? Number(button.dataset.slotIndex) : null);
        });
        button.addEventListener("pointerdown", beginCentrifugeDrag);
    });
    document.querySelectorAll(".rotor-slot").forEach(slot => slot.addEventListener("click", () => moveSelectedToSlot(Number(slot.dataset.slot))));
    document.querySelector("[data-rack-target]")?.addEventListener("click", () => returnSelectedToRack());
    document.querySelector("[data-holder]")?.addEventListener("click", moveSelectedToHolder);
    document.querySelector("[data-lid]")?.addEventListener("click", toggleLid);
    document.querySelector("[data-spin]")?.addEventListener("click", attemptSpin);
    document.querySelector("[data-open-after]")?.addEventListener("click", openAfterSpin);
}

function selectCentrifugeTube(key, location, slotIndex = null) {
    const c = state.centrifuge;
    if (c.lidClosed || c.cycle === "spinning") return;
    if (c.selected === key && c.selectedFrom === location) {
        c.selected = null;
        c.selectedFrom = null;
        c.selectedSlot = null;
    } else {
        c.selected = key;
        c.selectedFrom = location;
        c.selectedSlot = slotIndex;
    }
    saveCheckpoint();
    render();
}

function moveSelectedToSlot(index) {
    const c = state.centrifuge;
    if (!c.selected || c.lidClosed) return;
    if (c.slots[index]) {
        c.selected = null;
        c.selectedFrom = null;
        c.selectedSlot = null;
        c.feedback = "That position is already in use. The tube returned safely.";
        saveCheckpoint();
        render();
        return;
    }
    const previousSlots = [...c.slots];
    const previousUnpaired = firstOpenOpposite(previousSlots);
    if (c.selectedFrom === "rack") c.rack = c.rack.filter(key => key !== c.selected);
    else if (c.selectedFrom === "slot") c.slots[c.selectedSlot] = null;
    c.slots[index] = c.selected;
    const madeBalancingError = previousUnpaired && index !== previousUnpaired.target && c.selectedFrom === "rack";
    c.selected = null;
    c.selectedFrom = null;
    c.selectedSlot = null;
    c.hint = madeBalancingError || c.hint ? firstOpenOpposite(c.slots) : null;
    c.feedback = madeBalancingError && c.hint ? "Place the balancing tube here, directly opposite this tube." : "";
    if (isBalancedSlots(c.slots) && c.slots.filter(Boolean).length === 4) {
        c.balancedOnce = true;
        c.hint = null;
        c.feedback = "Balanced! Every loaded tube has another directly opposite it.";
        playTone("success");
    }
    saveCheckpoint();
    render();
}

function returnSelectedToRack() {
    const c = state.centrifuge;
    if (!c.selected || c.selectedFrom !== "slot" || c.lidClosed) return;
    c.slots[c.selectedSlot] = null;
    if (!c.rack.includes(c.selected)) c.rack.push(c.selected);
    c.selected = null;
    c.selectedFrom = null;
    c.selectedSlot = null;
    c.hint = firstOpenOpposite(c.slots);
    c.feedback = "The tube returned safely to the rack.";
    saveCheckpoint();
    render();
}

function toggleLid() {
    const c = state.centrifuge;
    if (c.cycle === "spinning" || c.cycle === "finished") return;
    c.lidClosed = !c.lidClosed;
    c.selected = null;
    c.selectedFrom = null;
    c.feedback = c.lidClosed ? "Lid closed. Check the load, then choose Spin." : "Lid open. Tube movement is available again.";
    saveCheckpoint();
    render();
}

function attemptSpin() {
    const c = state.centrifuge;
    if (c.slots.filter(Boolean).length !== 4) {
        c.feedback = "Load all three patient samples and the balance tube before spinning.";
        saveCheckpoint();
        render();
        return;
    }
    if (!isBalancedSlots(c.slots)) {
        c.hint = firstOpenOpposite(c.slots);
        c.feedback = "Place the balancing tube here, directly opposite this tube.";
        c.lidClosed = false;
        playTone("try");
        saveCheckpoint();
        render();
        return;
    }
    if (!c.lidClosed) {
        c.feedback = "Close the lid before starting the centrifuge.";
        saveCheckpoint();
        render();
        return;
    }
    c.balancedOnce = true;
    c.cycle = "spinning";
    c.feedback = "";
    state.stage = "centrifuge-spinning";
    saveCheckpoint();
    playTone("arrival");
    render();
}

function finishSpin() {
    const c = state.centrifuge;
    if (!c || c.cycle !== "spinning") return;
    c.cycle = "finished";
    c.feedback = "Finished! The rotor has stopped completely. Open the lid.";
    state.stage = "centrifuge-stopped";
    saveCheckpoint();
    playTone("success");
    render();
}

function openAfterSpin() {
    const c = state.centrifuge;
    if (c.cycle !== "finished") return;
    c.lidClosed = false;
    c.feedback = "Read the labels and retrieve Ian's grey-top sample.";
    state.stage = "centrifuge-retrieve";
    saveCheckpoint();
    render();
}

function moveSelectedToHolder() {
    const c = state.centrifuge;
    if (state.stage !== "centrifuge-retrieve" || !c.selected) return;
    const tube = batchTube(c.selected);
    if (tube.key !== "ian") {
        c.feedback = `That is ${tube.name}. Find ${state.caseData.name}, ID ${state.caseData.id}, on the grey-top bottle.`;
        c.selected = null;
        c.selectedFrom = null;
        c.selectedSlot = null;
        playTone("try");
        saveCheckpoint();
        render();
        return;
    }
    if (c.selectedFrom === "slot") c.slots[c.selectedSlot] = null;
    else c.rack = c.rack.filter(key => key !== "ian");
    c.selected = null;
    c.selectedFrom = null;
    c.retrieved = true;
    c.feedback = "";
    state.stage = "plasma";
    saveCheckpoint();
    playTone("success");
    render();
}

function beginCentrifugeDrag(event) {
    if (!event.isPrimary || event.button !== 0 || state.centrifuge.lidClosed || state.centrifuge.cycle === "spinning") return;
    const button = event.currentTarget;
    button.setPointerCapture(event.pointerId);
    centrifugeDrag = { pointerId:event.pointerId, button, key:button.dataset.tube, location:button.dataset.location, slotIndex:button.dataset.slotIndex === undefined ? null : Number(button.dataset.slotIndex), startX:event.clientX, startY:event.clientY, moved:false };
    button.addEventListener("pointermove", moveCentrifugeDrag);
    button.addEventListener("pointerup", endCentrifugeDrag);
    button.addEventListener("pointercancel", cancelCentrifugeDrag);
}

function moveCentrifugeDrag(event) {
    if (!centrifugeDrag || event.pointerId !== centrifugeDrag.pointerId) return;
    const dx = event.clientX - centrifugeDrag.startX;
    const dy = event.clientY - centrifugeDrag.startY;
    if (!centrifugeDrag.moved && Math.hypot(dx, dy) < 7) return;
    centrifugeDrag.moved = true;
    event.preventDefault();
    centrifugeDrag.button.classList.add("dragging");
    centrifugeDrag.button.style.setProperty("--drag-x", `${dx}px`);
    centrifugeDrag.button.style.setProperty("--drag-y", `${dy - 42}px`);
    document.querySelectorAll(".rotor-slot,.inspection-drop,.batch-rack").forEach(target => {
        const rect = target.getBoundingClientRect();
        target.classList.toggle("drag-over", event.clientX >= rect.left - 20 && event.clientX <= rect.right + 20 && event.clientY >= rect.top - 20 && event.clientY <= rect.bottom + 20);
    });
}

function endCentrifugeDrag(event) {
    if (!centrifugeDrag || event.pointerId !== centrifugeDrag.pointerId) return;
    const current = { ...centrifugeDrag };
    const target = [...document.querySelectorAll(".rotor-slot,.inspection-drop,.batch-rack")].find(element => {
        const rect = element.getBoundingClientRect();
        return event.clientX >= rect.left - 24 && event.clientX <= rect.right + 24 && event.clientY >= rect.top - 24 && event.clientY <= rect.bottom + 24;
    });
    cleanupCentrifugeDrag();
    if (!current.moved) return;
    state.suppressClickUntil = Date.now() + 450;
    state.centrifuge.selected = current.key;
    state.centrifuge.selectedFrom = current.location;
    state.centrifuge.selectedSlot = current.slotIndex;
    if (target?.classList.contains("rotor-slot")) moveSelectedToSlot(Number(target.dataset.slot));
    else if (target?.classList.contains("inspection-drop")) moveSelectedToHolder();
    else if (target?.classList.contains("batch-rack") && current.location === "slot") returnSelectedToRack();
    else {
        state.centrifuge.selected = null;
        state.centrifuge.selectedFrom = null;
        state.centrifuge.feedback = "The tube returned safely. Missed or cancelled drops do not count as errors.";
        saveCheckpoint();
        render();
    }
}

function cancelCentrifugeDrag() {
    if (!centrifugeDrag) return;
    cleanupCentrifugeDrag();
    if (state.centrifuge) {
        state.centrifuge.feedback = "The tube returned safely. Select it again when you are ready.";
        saveCheckpoint();
        if (!portraitQuery.matches) render();
    }
}

function cleanupCentrifugeDrag() {
    if (!centrifugeDrag) return;
    const { button } = centrifugeDrag;
    button.classList.remove("dragging");
    button.style.removeProperty("--drag-x");
    button.style.removeProperty("--drag-y");
    button.removeEventListener("pointermove", moveCentrifugeDrag);
    button.removeEventListener("pointerup", endCentrifugeDrag);
    button.removeEventListener("pointercancel", cancelCentrifugeDrag);
    document.querySelectorAll(".drag-over").forEach(element => element.classList.remove("drag-over"));
    centrifugeDrag = null;
}

function renderPlasmaChoice() {
    const c = state.centrifuge;
    screenHost.innerHTML = `
        <section class="screen plasma-screen" aria-labelledby="plasmaTitle">
            <img class="centrifuge-bg" src="assets/centrifuge-bench-v1.png" alt="Clinical chemistry bench">
            <div class="plasma-card">
                <div class="separated-sample">
                    <img src="assets/ian-separated-v1.png" alt="Ian's separated grey-top sample with pale upper liquid and red cells below">
                    <span class="separated-label"><b>${state.caseData.name}</b><span>${state.caseData.id}</span><span>${state.caseData.dob}</span><span>${state.caseData.accession}</span></span>
                    <button class="layer-target upper-layer ${c.plasmaChoice === "plasma" ? "correct" : ""}" type="button" data-layer="plasma" aria-label="Choose the upper pale liquid layer" ${c.plasmaChoice === "plasma" ? "disabled" : ""}><span>Choose upper layer</span></button>
                    <button class="layer-target lower-layer" type="button" data-layer="cells" aria-label="Choose the lower red cell layer" ${c.plasmaChoice === "plasma" ? "disabled" : ""}><span>Choose lower layer</span></button>
                </div>
                <div class="plasma-question">
                    <p class="kicker">INSPECT IAN'S SAMPLE</p>
                    <h1 id="plasmaTitle">Which part will we use for Ian’s glucose test?</h1>
                    <p class="identity-chip">${state.caseData.name} · ${state.caseData.id} · Grey top</p>
                    <p class="plasma-feedback ${c.feedback ? "" : "hidden"}" role="alert">${c.feedback || ""}</p>
                </div>
                <img class="plasma-holder" src="assets/inspection-holder-v1.png" alt="Inspection holder">
            </div>
        </section>`;
    setGuide("Which part will we use for Ian’s glucose test? Select a layer in his grey-top sample.");
    document.querySelectorAll("[data-layer]").forEach(button => button.addEventListener("click", () => chooseLayer(button.dataset.layer)));
    if (c.plasmaChoice === "plasma") {
        setGuide("That’s the plasma—the liquid we’ll use to measure glucose.");
        schedulePhase(completeCentrifugeChapter, reducedMotionEnabled() ? 850 : 1450);
    }
}

function chooseLayer(layer) {
    const c = state.centrifuge;
    c.plasmaChoice = layer;
    if (layer !== "plasma") {
        c.feedback = "For this test, choose the liquid above the cells.";
        playTone("try");
        saveCheckpoint();
        render();
        return;
    }
    c.feedback = "That’s the plasma—the liquid we’ll use to measure glucose.";
    saveCheckpoint();
    playTone("success");
    render();
}

function completeCentrifugeChapter() {
    if (state.stage !== "plasma" || state.centrifuge?.plasmaChoice !== "plasma") return;
    state.stage = "centrifuge-complete";
    saveCheckpoint();
    render();
}

function replayCentrifuge() {
    const batch = state.centrifuge?.batch || createBatch(state.caseData);
    state.centrifuge = createCentrifugeState(state.level, state.caseData, batch);
    state.stage = "centrifuge-load";
    saveCheckpoint();
    render();
}

function renderComplete() {
    screenHost.innerHTML = `
        <section class="screen complete-screen" aria-labelledby="completeTitle">
            <div class="complete-card">
                <div class="complete-icon" aria-hidden="true">✓</div>
                <p class="kicker">CHAPTER 2 COMPLETE</p>
                <h1 id="completeTitle">Sample prepared!</h1>
                <p class="success-line">Ian’s sample is prepared. Next, we’ll check that the analyser is ready.</p>
                <p class="section-end"><strong>This is the end of the available content.</strong><br>The analyser chapter is not available yet.</p>
                <div class="complete-actions">
                    <button class="primary-button" id="replayButton" type="button">Replay centrifuge chapter</button>
                    <a class="secondary-button" href="../">Return to Chemistry Lab</a>
                </div>
                <p class="no-badge">No Chemistry badge has been awarded for this partial mission.${storageAvailable ? "" : " Progress could not be saved on this device."}</p>
            </div>
        </section>`;
    setGuide("Ian’s sample is prepared. Next, we’ll check that the analyser is ready.");
    document.getElementById("replayButton").addEventListener("click", replayCentrifuge);
}

function changeLevel(level) {
    levelDialog.close();
    if (!state.caseData || state.stage === "opening") {
        startFresh(level);
        return;
    }
    cancelBottleDrag();
    cancelCentrifugeDrag();
    if (state.chapter1Complete || isCentrifugeStage(state.stage)) {
        const batch = state.centrifuge?.batch || createBatch(state.caseData);
        state.level = level;
        state.centrifuge = createCentrifugeState(level, state.caseData, batch);
        state.stage = "centrifuge-load";
        saveCheckpoint();
        render();
        return;
    }
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
    pausePhaseTimer();
    cancelCentrifugeDrag();
    document.body.classList.add("dialog-paused");
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
}

function closeHelp() {
    helpDialog.close();
    lastFocus?.focus?.();
}

function resumeAfterDialog() {
    document.body.classList.remove("dialog-paused");
    if (!portraitQuery.matches) startPhaseTimer();
}

function updateOrientation() {
    const portrait = portraitQuery.matches;
    gameShell.inert = portrait;
    document.body.classList.toggle("game-paused", portrait);
    if (portrait) {
        pausePhaseTimer();
        cancelBottleDrag();
        cancelCentrifugeDrag();
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
    dialog.innerHTML = `<div class="dialog-card"><p class="dialog-kicker">SAVED CASE FOUND</p><h2 id="resumeTitle">Continue Ian's chemistry mission?</h2><p>Your ${LEVELS[saved.level].label} case will resume with the same name, ID no., birthday, accession and safe chapter checkpoint.</p><div class="dialog-actions"><button class="primary-button" type="button" data-continue>Continue case</button><button class="secondary-button" type="button" data-restart>Start again</button></div></div>`;
    document.body.appendChild(dialog);
    dialog.querySelector("[data-continue]").addEventListener("click", () => {
        state = { ...state, ...saved, soundOn: saved.soundOn !== false };
        dialog.close();
        dialog.remove();
        resumeAfterDialog();
        render();
    });
    dialog.querySelector("[data-restart]").addEventListener("click", () => {
        dialog.close();
        dialog.remove();
        resumeAfterDialog();
        state.stage = "opening";
        state.level = null;
        state.caseData = null;
        state.scenario = null;
        clearCheckpoint();
        render();
    });
    if (portraitQuery.matches) {
        const showWhenLandscape = event => {
            if (event.matches) return;
            portraitQuery.removeEventListener?.("change", showWhenLandscape);
            showDialog(dialog);
        };
        portraitQuery.addEventListener?.("change", showWhenLandscape);
    } else {
        showDialog(dialog);
    }
}

levelButton.addEventListener("click", () => showDialog(levelDialog, levelButton));
levelDialog.addEventListener("close", resumeAfterDialog);
helpDialog.addEventListener("close", resumeAfterDialog);
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
window.addEventListener("blur", () => {
    if (drag) cancelBottleDrag();
    if (centrifugeDrag) cancelCentrifugeDrag();
});

// Read-only hooks make browser verification possible without changing passport progress.
window.__chemistryGame = {
    getState: () => JSON.parse(JSON.stringify(state)),
    hasCheckpoint: () => Boolean(readCheckpoint()),
    testBalance: slots => ({ balanced:isBalancedSlots(slots), unpaired:unpairedSlots(slots) })
};

function runChallengeBalanceSelfTest() {
    let testedPositionSets = 0;
    let acceptedPositionSets = 0;
    let acceptedTubeArrangements = 0;
    for (let mask = 0; mask < 256; mask += 1) {
        const occupied = Array.from({ length:8 }, (_, index) => Boolean(mask & (1 << index)));
        if (occupied.filter(Boolean).length !== 4) continue;
        testedPositionSets += 1;
        const slots = occupied.map((filled, index) => filled ? `tube-${index}` : null);
        if (isBalancedSlots(slots)) {
            acceptedPositionSets += 1;
            acceptedTubeArrangements += 24;
        }
    }
    const passed = testedPositionSets === 70 && acceptedPositionSets === 6 && acceptedTubeArrangements === 144;
    document.body.dataset.balanceSelfTest = passed ? "passed" : "failed";
    document.body.dataset.challengeSetsTested = String(testedPositionSets);
    document.body.dataset.challengeValidSets = String(acceptedPositionSets);
    document.body.dataset.challengeTubeArrangements = String(acceptedTubeArrangements);
    if (!passed) console.error("Challenge rotor balance self-test failed.");
}

updateOrientation();
document.body.classList.toggle("reduced-motion", reducedMotionEnabled());
runChallengeBalanceSelfTest();
render();
const savedCheckpoint = readCheckpoint();
if (savedCheckpoint) showResumeDialog(savedCheckpoint);
