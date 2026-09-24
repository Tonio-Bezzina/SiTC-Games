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
let qcDrag = null;
let analyserDrag = null;
let recapDrag = null;
let lastFocus = null;
let allowWithinNextCase = false;
let probeTravel = { frameId:null, direction:0, velocity:0, lastTime:0, cuePlayed:false };

const PROBE_MIN = 0;
const PROBE_MAX = 2;
const PROBE_TARGET_TOLERANCE = .27;
const PROBE_RAIL_LEFT = 7;
const PROBE_RAIL_STEP = 36.5;

let state = {
    version: 7,
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
    chapter2Complete: false,
    chapter3Complete: false,
    chapter4Complete: false,
    chapter5Complete: false,
    chapter6Complete: false,
    centrifuge: null,
    qualityControl: null,
    measurementCase: null,
    analyser: null,
    review: null,
    report: null,
    delivery: null,
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

function isQualityControlStage(stage) {
    return ["qc-intro", "qc", "qc-complete"].includes(stage);
}

function isAnalyserStage(stage) {
    return stage === "analyser";
}

function isReviewStage(stage) {
    return stage === "review";
}

function isDeliveryStage(stage) {
    return ["delivery", "mission-complete"].includes(stage);
}

function createMeasurementCase(allowWithin = false) {
    const category = allowWithin && Math.random() < .45 ? "within" : "above";
    return category === "within"
        ? { category, reactionStrength:"moderate", graphVariant:"midPlateau", reportMarker:.52, doctorDialogue:"within" }
        : { category, reactionStrength:"strong", graphVariant:"highPlateau", reportMarker:.82, doctorDialogue:"above" };
}

function createAnalyserState() {
    return {
        phase:"entry",
        tubeLocation:"rack",
        selected:null,
        testSelected:null,
        probePosition:1,
        probeLoad:null,
        guideTarget:null,
        probeMoving:false,
        pendingProbeAction:null,
        sampleAdded:false,
        reagentAdded:false,
        reactionComplete:false,
        graphComplete:false,
        readingAccepted:false,
        comparisonComplete:false,
        feedback:""
    };
}

function createReviewState(level) {
    return {
        phase: level === "junior" ? "compare" : "identity",
        identityConfirmed: level === "junior",
        categorySelected:null,
        comparisonComplete:false,
        reviewRequested:false,
        scientistReviewed:false,
        reviewAcknowledged:false,
        feedback:""
    };
}

function shuffleRecapCards() {
    const cards = ["prepare", "measure", "report"];
    for (let index = cards.length - 1; index > 0; index -= 1) {
        const swap = Math.floor(Math.random() * (index + 1));
        [cards[index], cards[swap]] = [cards[swap], cards[index]];
    }
    return cards;
}

function createDeliveryState() {
    return {
        phase:"ready",
        sent:false,
        doctorAcknowledged:false,
        recapCards:shuffleRecapCards(),
        recapSlots:[null, null, null],
        selected:null,
        attempts:0,
        recapComplete:false,
        badgeAwarded:false,
        feedback:""
    };
}

function chooseControlScenario(level) {
    if (level === "junior") return "pass";
    if (level === "challenge") return "fail";
    return Math.random() < .5 ? "pass" : "fail";
}

function createQualityControlState(level, scenario = null) {
    return {
        scenario: scenario || chooseControlScenario(level),
        round: 1,
        phase: "load",
        controlLocation: "rack",
        selected: null,
        result: null,
        feedback: "",
        investigated: false,
        freshControl: false,
        accepted: false
    };
}

function centrifugeSlotCount(level) {
    return level === "challenge" ? 8 : 4;
}

function createBatch(patient, level = state.level) {
    const leoCap = level === "challenge" ? "grey" : "yellow";
    return [
        { key:"ian", name:patient.name, id:patient.id, dob:patient.dob, accession:patient.accession, cap:"grey", kind:"patient", asset:"grey-bottle-v1.png" },
        { key:"aisha", name:"Aisha Borg", id:`${randomDigits(5)}H`, dob:"18/04/2013", accession:`CC-${randomDigits(6)}`, cap:"yellow", kind:"patient", asset:"yellow-bottle-v1.png" },
        { key:"leo", name:"Leo Vella", id:`${randomDigits(5)}L`, dob:"07/11/2011", accession:`CC-${randomDigits(6)}`, cap:leoCap, kind:"patient", asset:leoCap === "grey" ? "grey-bottle-v1.png" : "yellow-bottle-v1.png" },
        { key:"balance", name:"BALANCE", id:"", dob:"", accession:"", cap:"blue", kind:"balance", asset:"balance-tube-v1.png" }
    ];
}

function createCentrifugeState(level, patient, batch = null) {
    const preparedBatch = (batch || createBatch(patient, level)).map(tube => {
        if (level !== "challenge" && tube.key !== "ian" && tube.kind === "patient" && tube.cap === "grey") {
            return { ...tube, cap:"yellow", asset:"yellow-bottle-v1.png" };
        }
        return tube;
    });
    return {
        batch: preparedBatch,
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
    if (value.version === 2) {
        value.version = 3;
        value.chapter2Complete = value.stage === "centrifuge-complete";
        value.qualityControl = value.chapter2Complete ? createQualityControlState(value.level) : null;
        if (value.chapter2Complete) value.stage = "qc-intro";
    }
    if (value.version === 3) {
        const qcAccepted = value.stage === "qc-complete" && value.qualityControl?.accepted === true && value.qualityControl?.result === "pass";
        value.version = 6;
        value.chapter3Complete = qcAccepted;
        value.chapter4Complete = false;
        value.chapter5Complete = false;
        value.chapter6Complete = false;
        value.measurementCase = createMeasurementCase(false);
        value.analyser = qcAccepted ? createAnalyserState() : null;
        value.review = null;
        value.report = null;
        value.delivery = null;
        if (qcAccepted) value.stage = "analyser";
    }
    if (value.version === 6) {
        value.version = 7;
        if (value.stage === "clue") value.stage = "arrival";
        if (value.level !== "challenge" && value.centrifuge?.batch) {
            value.centrifuge.batch.forEach(tube => {
                if (tube.key !== "ian" && tube.kind === "patient" && tube.cap === "grey") {
                    tube.cap = "yellow";
                    tube.asset = "yellow-bottle-v1.png";
                }
            });
        }
        if (value.stage === "analyser" && !value.chapter4Complete) value.analyser = createAnalyserState();
    }
    if (value.version === 7 && value.centrifuge?.cycle === "spinning") {
        value.centrifuge.cycle = "idle";
        value.centrifuge.lidClosed = true;
        value.centrifuge.feedback = "The interrupted demonstration is ready to start safely again.";
        value.stage = "centrifuge-load";
    }
    if (value.version === 7 && value.qualityControl?.phase === "processing") {
        value.qualityControl.phase = "loaded";
        value.qualityControl.controlLocation = "loader";
        value.qualityControl.result = null;
        value.qualityControl.feedback = "The interrupted quality control check is ready to run safely again.";
    }
    if (value.version === 7 && ["reaction-running", "light-running"].includes(value.analyser?.phase)) {
        value.analyser.phase = value.analyser.phase === "reaction-running" ? "reaction-ready" : "light-ready";
        value.analyser.feedback = "The interrupted demonstration is ready to continue safely.";
    }
    if (value.version === 7 && value.analyser?.probeMoving) {
        value.analyser.probeMoving = false;
        value.analyser.pendingProbeAction = null;
        value.analyser.feedback = "The interrupted probe step is ready to try again.";
    }
    if (value.version === 7 && value.delivery?.phase === "sending" && !value.delivery.sent) {
        value.delivery.phase = "ready";
        value.delivery.feedback = "The checked report is ready to send again.";
    }
    return value;
}

function isValidCheckpoint(value) {
    const stages = ["opening", "story", "arrival", "carrier", "carrier-open", "inspection", "transfer", "centrifuge-load", "centrifuge-stopped", "centrifuge-retrieve", "plasma", "qc-intro", "qc", "analyser", "review", "delivery", "mission-complete"];
    const c = value?.centrifuge;
    const centrifugeOkay = !isCentrifugeStage(value?.stage) || (c && Array.isArray(c.batch) && c.batch.length === 4
        && Array.isArray(c.slots) && c.slots.length === centrifugeSlotCount(value.level)
        && Array.isArray(c.rack));
    const q = value?.qualityControl;
    const qualityOkay = !isQualityControlStage(value?.stage) || (q && ["pass", "fail"].includes(q.scenario) && [1, 2].includes(q.round));
    const measurementOkay = !value?.measurementCase || (["above", "within"].includes(value.measurementCase.category)
        && Number.isFinite(value.measurementCase.reportMarker) && value.measurementCase.reportMarker >= 0 && value.measurementCase.reportMarker <= 1);
    const analyserOkay = !isAnalyserStage(value?.stage) || (value.chapter3Complete && value.analyser && value.measurementCase);
    const reviewOkay = !isReviewStage(value?.stage) || (value.chapter4Complete && value.review && value.measurementCase);
    const deliveryOkay = !isDeliveryStage(value?.stage) || (value.chapter5Complete && value.delivery && value.report?.checked);
    return value && value.version === 7 && LEVELS[value.level]
        && value.caseData && typeof value.caseData.name === "string"
        && typeof value.caseData.id === "string" && /^\d{5}[HL]$/.test(value.caseData.id) && typeof value.caseData.dob === "string"
        && typeof value.caseData.accession === "string"
        && Array.isArray(value.scenario) && value.scenario.length === 2
        && value.scenario.filter(sample => sample && sample.correct === true).length === 1
        && stages.includes(value.stage) && centrifugeOkay && qualityOkay && measurementOkay && analyserOkay && reviewOkay && deliveryOkay;
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
    chapterLabel.textContent = state.level ? chapterLabelForStage(state.stage) : "Opening";
    caseSummary.textContent = "";
    caseSummary.classList.add("hidden");
    gameBar.classList.remove("has-case");
    soundButton.textContent = state.soundOn ? "🔊" : "🔇";
    soundButton.setAttribute("aria-pressed", String(state.soundOn));
    soundButton.setAttribute("aria-label", state.soundOn ? "Turn sound off" : "Turn sound on");
}

function chapterLabelForStage(stage) {
    if (isDeliveryStage(stage)) return "Chapter 6 · Deliver the clues";
    if (isReviewStage(stage)) return "Chapter 5 · Check the result";
    if (isAnalyserStage(stage)) return "Chapter 4 · Inside the analyser";
    if (state.chapter2Complete || isQualityControlStage(stage)) return "Chapter 3 · Check the test";
    if (state.chapter1Complete || isCentrifugeStage(stage)) return "Chapter 2 · Balance & separate";
    return "Chapter 1 · Check the sample";
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
    cancelProbeTravel(false);
    cancelPhaseTimer();
    updateChrome();
    if (state.stage === "opening") renderOpening();
    if (state.stage === "story") renderStory();
    if (state.stage === "arrival") renderArrival();
    if (state.stage === "carrier") renderCarrier(false);
    if (state.stage === "carrier-open") renderCarrier(true);
    if (state.stage === "inspection") renderInspection();
    if (state.stage === "transfer") renderTransfer();
    if (["centrifuge-load", "centrifuge-spinning", "centrifuge-stopped", "centrifuge-retrieve"].includes(state.stage)) renderCentrifuge();
    if (state.stage === "plasma") renderPlasmaChoice();
    if (state.stage === "qc-intro") renderQualityControlIntro();
    if (state.stage === "qc") renderQualityControl();
    if (state.stage === "analyser") renderAnalyserChapter();
    if (state.stage === "review") renderReviewChapter();
    if (state.stage === "delivery") renderDeliveryChapter();
    if (state.stage === "mission-complete") renderComplete();
}

function syncElementAttributes(current, next) {
    [...current.attributes].forEach(attribute => {
        if (!next.hasAttribute(attribute.name)) current.removeAttribute(attribute.name);
    });
    [...next.attributes].forEach(attribute => current.setAttribute(attribute.name, attribute.value));
}

function persistentSceneType(element) {
    if (element?.classList.contains("centrifuge-screen")) return "centrifuge";
    if (element?.classList.contains("analyser-cutaway-screen")) return "analyser-cutaway";
    if (element?.matches(".delivery-screen,.clinic-report-screen,.recap-screen,.mission-complete-screen")) return "delivery";
    return null;
}

function updatePersistentScene(markup) {
    const template = document.createElement("template");
    template.innerHTML = markup.trim();
    const nextRoot = template.content.firstElementChild;
    const currentRoot = screenHost.firstElementChild;
    const sceneType = persistentSceneType(currentRoot);
    if (!nextRoot || !sceneType || persistentSceneType(nextRoot) !== sceneType) {
        screenHost.replaceChildren(...template.content.childNodes);
        return;
    }

    const reusableImages = new Map();
    currentRoot.querySelectorAll("img[src]").forEach(image => {
        const key = `${image.getAttribute("src")}|${image.className}`;
        if (!reusableImages.has(key)) reusableImages.set(key, []);
        reusableImages.get(key).push(image);
    });
    nextRoot.querySelectorAll("img[src]").forEach(image => {
        const key = `${image.getAttribute("src")}|${image.className}`;
        const existing = reusableImages.get(key)?.shift();
        if (!existing) return;
        syncElementAttributes(existing, image);
        image.replaceWith(existing);
    });

    syncElementAttributes(currentRoot, nextRoot);
    currentRoot.replaceChildren(...nextRoot.childNodes);
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
                <p class="same-badge">Every level earns the same badge.</p>
            </div>
        </section>`;
    setGuide("Choose Junior, Explorer or Challenge to start Ian's case.");
    document.querySelectorAll("[data-opening-level]").forEach(button => button.addEventListener("click", () => {
        const allowWithin = allowWithinNextCase;
        allowWithinNextCase = false;
        startFresh(button.dataset.openingLevel, allowWithin);
    }));
}

function startFresh(level, allowWithin = false) {
    clearCheckpoint();
    state = {
        version: 7,
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
        chapter2Complete: false,
        chapter3Complete: false,
        chapter4Complete: false,
        chapter5Complete: false,
        chapter6Complete: false,
        centrifuge: null,
        qualityControl: null,
        measurementCase:createMeasurementCase(allowWithin),
        analyser:null,
        review:null,
        report:null,
        delivery:null,
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
        state.clueSeen = true;
        state.stage = "arrival";
        saveCheckpoint();
        render();
    });
}

function receiverMarkup(arriving = false) {
    return `<div class="receiver-wrap ${arriving ? "arriving" : ""}">
        ${arriving ? '<div class="carrier-transit" aria-hidden="true"><span class="whoosh-streak streak-one"></span><span class="whoosh-streak streak-two"></span><span class="whoosh-streak streak-three"></span><span class="whoosh-puff"></span><img src="assets/pts-carrier-closed-v1.png" alt=""></div>' : ""}
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
    playWhoosh();
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
    updatePersistentScene(`
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
                ${!retrieve && !running && !finished ? `<button class="${c.lidClosed ? "secondary-button" : "primary-button"}" type="button" data-lid>${c.lidClosed ? "Open lid" : "Close lid"}</button><button class="${c.lidClosed ? "primary-button" : "secondary-button"}" type="button" data-spin>Spin</button>` : ""}
                ${finished && c.lidClosed ? '<button class="secondary-button" type="button" data-open-after>Open lid</button>' : ""}
            </div>
            <div class="centrifuge-feedback ${c.feedback ? "" : "hidden"}" role="alert">${c.feedback || ""}</div>
        </section>`);
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
    state.chapter2Complete = true;
    state.qualityControl = createQualityControlState(state.level);
    state.stage = "qc-intro";
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

function renderQualityControlIntro() {
    screenHost.innerHTML = `
        <section class="screen qc-screen qc-intro-screen" aria-labelledby="qcIntroTitle">
            <img class="qc-bg" src="assets/centrifuge-bench-v1.png" alt="Clinical chemistry analyser bench">
            <div class="qc-intro-card">
                <p class="kicker">CHAPTER 3 · QUALITY CONTROL</p>
                <h1 id="qcIntroTitle">Check the glucose test first</h1>
                <p>Before testing Ian’s sample, we check that the glucose test is working as expected.</p>
                <button class="primary-button" type="button" data-start-qc>Meet the quality control sample →</button>
            </div>
            <img class="qc-intro-analyser" src="assets/analyser-exterior-v1.png" alt="Clinical chemistry analyser">
        </section>`;
    setGuide("Before testing Ian’s sample, we check that the glucose test is working as expected.");
    document.querySelector("[data-start-qc]").addEventListener("click", () => {
        state.stage = "qc";
        saveCheckpoint();
        render();
    });
}

function qcResultScaleMarkup(result) {
    if (!result) return "";
    const pass = result === "pass";
    return `<div class="control-result-scale ${pass ? "passing" : "failing"}" aria-label="Quality control result ${pass ? "inside" : "outside"} the expected range">
        <div class="scale-track"><span class="expected-band"><b>Expected range</b></span><span class="check-marker" style="--marker:${pass ? 52 : 84}%"><b>QC result</b><i aria-hidden="true">${pass ? "✓" : "!"}</i></span></div>
        <p>${pass ? "✓ Inside the expected range" : "! Outside the expected range"}</p>
    </div>`;
}

function qcScreenMarkup() {
    const q = state.qualityControl;
    if (q.phase === "processing") return `<div class="analyser-display checking"><strong>Checking…</strong><span>Quality control in progress</span><i aria-hidden="true"></i></div>`;
    if (["result", "accepted"].includes(q.phase)) return `<div class="analyser-display result-display"><strong>Quality control</strong>${qcResultScaleMarkup(q.result)}</div>`;
    if (q.phase === "investigating") return `<div class="analyser-display maintenance"><strong>Scientist investigating</strong><span>Patient testing paused</span><i aria-hidden="true"></i></div>`;
    return `<div class="analyser-display"><strong>Quality control</strong><span>${q.controlLocation === "loader" ? "Quality control sample ready" : "Waiting for quality control sample"}</span></div>`;
}

function controlVialMarkup(location = "rack") {
    const q = state.qualityControl;
    const interactive = location === "rack";
    const tag = interactive ? "button" : "div";
    return `<${tag} class="qc-vial ${interactive && q.selected === "control" ? "selected" : ""} ${interactive ? "" : "loaded-vial"}" ${interactive ? `type="button" data-qc-object="control" aria-pressed="${q.selected === "control"}"` : "aria-hidden=\"true\""} data-location="${location}" aria-label="${interactive ? `${q.freshControl ? "Fresh " : ""}quality control sample vial—select to move` : ""}">
        <img src="assets/check-sample-vial-v1.png" alt="" draggable="false"><span><b>${q.freshControl ? "Fresh QC sample" : "Quality control sample"}</b><small>Expected result known</small></span>
    </${tag}>`;
}

function ianWaitingMarkup() {
    const q = state.qualityControl;
    return `<button class="qc-ian ${q.selected === "ian" ? "selected" : ""}" type="button" data-qc-object="ian" aria-pressed="${q.selected === "ian"}" aria-label="Ian’s waiting grey-top sample, ${state.caseData.name}, ${state.caseData.id}">
        <img src="assets/ian-separated-v1.png" alt="" draggable="false"><span><b>${state.caseData.name}</b><small>${state.caseData.id}</small><small>${state.caseData.dob}</small><small>${state.caseData.accession}</small></span>
    </button>`;
}

function renderQualityControl() {
    const q = state.qualityControl;
    const resultPhase = ["result", "accepted"].includes(q.phase);
    const processing = q.phase === "processing";
    const investigating = q.phase === "investigating";
    screenHost.innerHTML = `
        <section class="screen qc-screen phase-${q.phase} ${q.feedback.startsWith("This quality control result is outside") ? "failed-choice" : ""}" aria-labelledby="qcTitle">
            <img class="qc-bg" src="assets/centrifuge-bench-v1.png" alt="Clinical chemistry analyser bench">
            <div class="qc-heading"><p class="kicker">CHAPTER 3 · QUALITY CONTROL</p><h1 id="qcTitle">Check the test is ready</h1><p>${q.round === 2 ? "Run the fresh quality control sample after the scientist’s investigation." : "This quality control sample has an expected result. Let’s see whether the analyser gets it right."}</p></div>
            <aside class="qc-supply" aria-label="Quality control sample supply">${q.controlLocation === "rack" ? controlVialMarkup("rack") : ""}<span>${q.round === 2 ? "Fresh quality control sample" : "Quality control sample"}</span></aside>
            <aside class="ian-waiting ${q.phase === "accepted" ? "next" : ""}" aria-label="Ian’s sample waiting separately"><h2>${q.phase === "accepted" ? "Ian’s sample is next" : "Ian’s sample waits here"}</h2>${ianWaitingMarkup()}<span>${q.phase === "accepted" ? "Ready for the next chapter" : "Patient sample — quality control first"}</span></aside>
            <div class="analyser-stage">
                <img class="analyser-art" src="assets/analyser-exterior-v1.png" alt="Clinical chemistry analyser">
                <span class="analyser-light ${processing ? "busy" : resultPhase && q.result === "pass" ? "pass" : resultPhase ? "hold" : "ready"}" role="status" aria-label="${processing ? "Status: checking" : resultPhase && q.result === "pass" ? "Status: check passed" : resultPhase ? "Status: testing paused" : "Status: ready"}"></span>
                ${qcScreenMarkup()}
                <button class="control-loader ${q.selected ? "active" : ""} ${q.controlLocation === "loader" ? "loaded" : ""} ${processing ? "inward" : ""}" type="button" data-control-loader aria-label="Highlighted control-loading position">
                    <span class="tray-face" aria-hidden="true"></span>${q.controlLocation === "loader" ? controlVialMarkup("loader") : '<span class="loader-copy">Load quality control sample here</span>'}
                </button>
            </div>
            <div class="qc-actions">
                ${["load", "loaded"].includes(q.phase) ? `<button class="primary-button" type="button" data-run-check ${q.controlLocation !== "loader" ? "disabled" : ""}>Run quality control</button>` : ""}
                ${resultPhase ? `<button class="primary-button" type="button" data-qc-choice="ready" ${q.phase === "accepted" ? "disabled" : ""}>Ready to test</button><button class="secondary-button" type="button" data-qc-choice="help" ${q.phase === "accepted" ? "disabled" : ""}>Ask the scientist for help</button>` : ""}
            </div>
            ${investigating ? '<div class="scientist-intervention"><img src="assets/scientist-guide-v1.png" alt="Clinical scientist investigating the quality control result"><div><strong>The scientist investigates and corrects the problem.</strong><p>Patient testing stays paused while the analyser is checked.</p><i aria-hidden="true"></i></div></div>' : ""}
            <div class="qc-feedback ${q.feedback ? "" : "hidden"}" role="alert">${q.feedback || ""}</div>
        </section>`;
    if (q.phase === "load") setGuide(state.level === "challenge" ? "Load the quality control sample, then run the check." : "This quality control sample has an expected result. Let’s see whether the analyser gets it right.");
    else if (q.phase === "loaded") setGuide("The quality control sample is loaded. Press Run quality control.");
    else if (processing) setGuide("Checking… The analyser is processing the control.");
    else if (investigating) setGuide("The scientist investigates and corrects the problem.");
    else if (q.phase === "accepted") setGuide("The quality control check passed! We’re ready to measure glucose in Ian’s sample.");
    else setGuide("Is the quality control result inside its Expected range?");
    wireQualityControlInteractions();
    if (processing) schedulePhase(revealControlResult, reducedMotionEnabled() ? 1100 : 2200);
    if (investigating) schedulePhase(finishInvestigation, reducedMotionEnabled() ? 1100 : 2100);
    if (q.phase === "accepted") schedulePhase(completeQualityControl, reducedMotionEnabled() ? 900 : 1500);
}

function wireQualityControlInteractions() {
    const q = state.qualityControl;
    const ian = document.querySelector('[data-qc-object="ian"]');
    if (ian && q.phase !== "accepted") {
        ian.addEventListener("click", redirectIanToQc);
        if (["load", "loaded"].includes(q.phase)) ian.addEventListener("pointerdown", beginQcDrag);
    }
    if (["processing", "investigating", "accepted"].includes(q.phase)) return;
    document.querySelectorAll('[data-qc-object="control"]').forEach(button => {
        button.addEventListener("click", () => selectQcObject(button.dataset.qcObject));
        button.addEventListener("pointerdown", beginQcDrag);
    });
    document.querySelector("[data-control-loader]")?.addEventListener("click", loadSelectedQcObject);
    document.querySelector("[data-run-check]")?.addEventListener("click", runQualityCheck);
    document.querySelectorAll("[data-qc-choice]").forEach(button => button.addEventListener("click", () => chooseQcDecision(button.dataset.qcChoice)));
}

function selectQcObject(object) {
    const q = state.qualityControl;
    if (object === "ian") {
        redirectIanToQc();
        return;
    }
    if (Date.now() < (state.suppressClickUntil || 0) || !["load", "loaded"].includes(q.phase)) return;
    q.selected = q.selected === object ? null : object;
    saveCheckpoint();
    render();
}

function playWhoosh() {
    if (!state.soundOn) return;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    try {
        const context = new Audio();
        const duration = 1.55;
        const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
        const data = buffer.getChannelData(0);
        for (let index = 0; index < data.length; index += 1) {
            const progress = index / data.length;
            const envelope = Math.sin(Math.PI * progress) * (1 - progress * .35);
            data[index] = (Math.random() * 2 - 1) * envelope;
        }
        const source = context.createBufferSource();
        const filter = context.createBiquadFilter();
        const gain = context.createGain();
        source.buffer = buffer;
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(1150, context.currentTime);
        filter.frequency.exponentialRampToValueAtTime(360, context.currentTime + duration);
        filter.Q.value = .7;
        gain.gain.setValueAtTime(.001, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(.12, context.currentTime + .12);
        gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + duration);
        source.connect(filter);
        filter.connect(gain);
        gain.connect(context.destination);
        source.start();
        source.stop(context.currentTime + duration);
    } catch (error) {
        // Sound is optional; the moving carrier and airflow streaks remain visible.
    }
}

function redirectIanToQc() {
    const q = state.qualityControl;
    if (!q || q.phase === "accepted") return;
    q.selected = null;
    q.feedback = "Complete the quality control check before loading Ian’s sample.";
    saveCheckpoint();
    render();
    const target = q.phase === "load" ? (q.controlLocation === "rack" ? document.querySelector('[data-qc-object="control"]') : document.querySelector("[data-control-loader]"))
        : q.phase === "loaded" ? document.querySelector("[data-run-check]")
        : q.phase === "result" ? document.querySelector('[data-qc-choice="ready"]')
        : document.querySelector(".scientist-intervention, .analyser-display");
    target?.focus?.();
}

function loadSelectedQcObject() {
    const q = state.qualityControl;
    if (!q.selected || !["load", "loaded"].includes(q.phase)) return;
    if (q.selected === "ian") {
        q.selected = null;
        q.feedback = "Complete the quality control check before loading Ian’s sample.";
        saveCheckpoint();
        render();
        return;
    }
    q.selected = null;
    q.controlLocation = "loader";
    q.phase = "loaded";
    q.feedback = "The quality control sample snapped into the control-loading position.";
    saveCheckpoint();
    render();
}

function runQualityCheck() {
    const q = state.qualityControl;
    if (q.phase !== "loaded" || q.controlLocation !== "loader") return;
    q.phase = "processing";
    q.feedback = "";
    saveCheckpoint();
    playTone("arrival");
    render();
}

function revealControlResult() {
    const q = state.qualityControl;
    if (!q || q.phase !== "processing") return;
    q.result = q.round === 2 ? "pass" : q.scenario;
    q.phase = "result";
    q.feedback = q.result === "pass" && state.level === "junior" ? "The quality control result is inside its expected range." : "";
    saveCheckpoint();
    playTone(q.result === "pass" ? "success" : "try");
    render();
}

function chooseQcDecision(choice) {
    const q = state.qualityControl;
    if (q.phase !== "result") return;
    if (choice === "ready" && q.result === "fail") {
        q.feedback = "This quality control result is outside its expected range. Ask the scientist to investigate before testing Ian’s sample.";
        playTone("try");
        saveCheckpoint();
        render();
        return;
    }
    if (choice === "help" && q.result === "pass") {
        q.feedback = "The scientist shows you that the quality control result is inside the Expected range. Asking for help is always okay—now choose Ready to test.";
        saveCheckpoint();
        render();
        return;
    }
    if (choice === "help" && q.result === "fail") {
        q.phase = "investigating";
        q.investigated = true;
        q.feedback = "";
        saveCheckpoint();
        render();
        return;
    }
    q.accepted = true;
    q.phase = "accepted";
    q.feedback = "The quality control result is inside its expected range.";
    saveCheckpoint();
    playTone("success");
    render();
}

function finishInvestigation() {
    const q = state.qualityControl;
    if (!q || q.phase !== "investigating") return;
    q.round = 2;
    q.phase = "load";
    q.controlLocation = "rack";
    q.result = null;
    q.freshControl = true;
    q.feedback = "A fresh quality control sample is ready. Load it and run a new check.";
    saveCheckpoint();
    render();
}

function completeQualityControl() {
    const q = state.qualityControl;
    if (!q?.accepted || q.result !== "pass") return;
    state.chapter3Complete = true;
    state.analyser = createAnalyserState();
    state.stage = "analyser";
    saveCheckpoint();
    render();
}

function beginQcDrag(event) {
    if (!event.isPrimary || event.button !== 0 || !["load", "loaded"].includes(state.qualityControl.phase)) return;
    const button = event.currentTarget;
    button.setPointerCapture(event.pointerId);
    qcDrag = { pointerId:event.pointerId, button, object:button.dataset.qcObject, startX:event.clientX, startY:event.clientY, moved:false };
    button.addEventListener("pointermove", moveQcDrag);
    button.addEventListener("pointerup", endQcDrag);
    button.addEventListener("pointercancel", cancelQcDrag);
}

function moveQcDrag(event) {
    if (!qcDrag || event.pointerId !== qcDrag.pointerId) return;
    const dx = event.clientX - qcDrag.startX;
    const dy = event.clientY - qcDrag.startY;
    if (!qcDrag.moved && Math.hypot(dx, dy) < 7) return;
    qcDrag.moved = true;
    event.preventDefault();
    qcDrag.button.classList.add("dragging");
    qcDrag.button.style.setProperty("--drag-x", `${dx}px`);
    qcDrag.button.style.setProperty("--drag-y", `${dy - 42}px`);
    const target = document.querySelector(".control-loader");
    const rect = target.getBoundingClientRect();
    target.classList.toggle("drag-over", event.clientX >= rect.left - 30 && event.clientX <= rect.right + 30 && event.clientY >= rect.top - 30 && event.clientY <= rect.bottom + 30);
}

function endQcDrag(event) {
    if (!qcDrag || event.pointerId !== qcDrag.pointerId) return;
    const current = { ...qcDrag };
    const target = document.querySelector(".control-loader");
    const rect = target.getBoundingClientRect();
    const inside = current.moved && event.clientX >= rect.left - 30 && event.clientX <= rect.right + 30 && event.clientY >= rect.top - 30 && event.clientY <= rect.bottom + 30;
    cleanupQcDrag();
    if (!current.moved) return;
    state.suppressClickUntil = Date.now() + 450;
    state.qualityControl.selected = current.object;
    if (inside) loadSelectedQcObject();
    else {
        state.qualityControl.selected = null;
        state.qualityControl.feedback = current.object === "ian" ? "Complete the quality control check before loading Ian’s sample." : "The quality control sample returned safely. Missed drops are not scientific errors.";
        saveCheckpoint();
        render();
    }
}

function cancelQcDrag() {
    if (!qcDrag) return;
    cleanupQcDrag();
    if (state.qualityControl) {
        state.qualityControl.feedback = "The sample returned safely. Select it again when you are ready.";
        saveCheckpoint();
        if (!portraitQuery.matches) render();
    }
}

function cleanupQcDrag() {
    if (!qcDrag) return;
    const { button } = qcDrag;
    button.classList.remove("dragging");
    button.style.removeProperty("--drag-x");
    button.style.removeProperty("--drag-y");
    button.removeEventListener("pointermove", moveQcDrag);
    button.removeEventListener("pointerup", endQcDrag);
    button.removeEventListener("pointercancel", cancelQcDrag);
    document.querySelector(".control-loader")?.classList.remove("drag-over");
    qcDrag = null;
}

function patientIdentityMarkup(compact = false) {
    const patient = state.caseData;
    return `<dl class="patient-identity ${compact ? "compact" : ""}">
        <div><dt>Name</dt><dd>${patient.name}</dd></div>
        <div><dt>ID no.</dt><dd>${patient.id}</dd></div>
        <div><dt>Birthday</dt><dd>${patient.dob}</dd></div>
        <div><dt>Accession</dt><dd>${patient.accession}</dd></div>
        <div><dt>Requested test</dt><dd>${patient.test}</dd></div>
    </dl>`;
}

function analyserTubeMarkup(interactive = true) {
    const a = state.analyser;
    const tag = interactive ? "button" : "div";
    return `<${tag} class="analyser-tube ${interactive && a.selected === "tube" ? "selected" : ""} ${interactive ? "" : "loaded-tube"}" ${interactive ? `type="button" data-analyser-object="tube" aria-pressed="${a.selected === "tube"}" aria-label="Ian’s prepared grey-top sample—select to move"` : "aria-hidden=\"true\""}>
        <img src="assets/ian-separated-v1.png" alt="" draggable="false"><span><b>${state.caseData.name}</b><small>${state.caseData.id}</small><small>${state.caseData.accession}</small></span>
    </${tag}>`;
}

function renderAnalyserChapter() {
    const a = state.analyser;
    if (!a) return;
    if (["entry", "test"].includes(a.phase)) renderAnalyserExterior();
    else renderAnalyserCutaway();
}

function renderAnalyserExterior() {
    const a = state.analyser;
    screenHost.innerHTML = `
        <section class="screen analyser-entry-screen" aria-labelledby="analyserEntryTitle">
            <img class="analyser-room-bg" src="assets/centrifuge-bench-v1.png" alt="Clinical chemistry analyser bench">
            <div class="analyser-entry-heading"><p class="kicker">CHAPTER 4 · DISCOVER WHAT HAPPENS INSIDE</p><h1 id="analyserEntryTitle">Load Ian’s prepared sample</h1><p>Quality control has passed. Now the analyser can measure Ian’s requested test.</p></div>
            <aside class="patient-rack" aria-label="Ian’s prepared sample rack">${a.tubeLocation === "rack" ? analyserTubeMarkup() : ""}<span>Ian’s prepared plasma sample</span></aside>
            <div class="analyser-entry-machine">
                <img src="assets/analyser-exterior-v1.png" alt="Clinical chemistry analyser">
                <button class="patient-loader ${a.selected === "tube" ? "active" : ""} ${a.tubeLocation === "loader" ? "loaded" : ""}" type="button" data-analyser-target="patient-loader" aria-label="Patient rack and scanner">
                    ${a.tubeLocation === "loader" ? analyserTubeMarkup(false) : "<span>Load Ian’s sample here</span>"}
                </button>
                <div class="analyser-request-monitor" aria-live="polite">
                    <img src="assets/request-monitor-v1.png" alt="Laboratory request computer">
                    <div class="request-test-screen">
                        ${a.tubeLocation === "loader" ? `<strong>Test request</strong><span>Requested: ${state.caseData.test}</span><div class="test-tiles" aria-label="Select the requested chemistry test"><button type="button" data-test-tile="electrolytes">Salts</button><button type="button" data-test-tile="glucose">Glucose</button><button type="button" data-test-tile="kidney">Kidney clues</button></div>` : "<strong>Test request</strong><span>Waiting for patient sample</span>"}
                    </div>
                </div>
            </div>
            ${a.tubeLocation === "loader" ? `<div class="identity-confirmed-card"><strong>Identity confirmed</strong>${patientIdentityMarkup(true)}</div>` : ""}
            <p class="chapter-feedback ${a.feedback ? "" : "hidden"}" role="alert">${a.feedback || ""}</p>
        </section>`;
    setGuide(a.tubeLocation === "rack" ? "Drag Ian’s prepared grey-top sample into the patient rack." : "The request says glucose. Select the matching test.");
    wireAnalyserInteractions();
}

function analyserProgressMarkup() {
    const a = state.analyser;
    const steps = [
        ["sample", a.sampleAdded],
        ["reagent", a.reagentAdded],
        ["reaction", a.reactionComplete],
        ["light", a.graphComplete]
    ];
    return `<ol class="analyser-progress" aria-label="Analyser teaching sequence">${steps.map(([name, done], index) => `<li class="${done ? "done" : ""}"><span>${done ? "✓" : index + 1}</span>${name[0].toUpperCase() + name.slice(1)}</li>`).join("")}</ol>`;
}

function analyserGraphMarkup() {
    const a = state.analyser;
    const high = state.measurementCase.graphVariant === "highPlateau";
    const path = high ? "M12 112 C42 110 58 98 78 76 S125 32 168 24 S222 20 270 20" : "M12 112 C45 110 61 100 82 83 S128 55 171 49 S224 46 270 46";
    return `<div class="reaction-graph ${a.phase === "light-running" ? "running" : ""} ${a.graphComplete ? "complete" : ""}" role="img" aria-label="Reaction reading ${a.graphComplete ? "steady" : "changing"}; horizontal axis Reaction time; vertical axis Light absorbed">
        <span class="graph-y">Light absorbed${state.level === "junior" ? "" : " · Absorbance"}</span>
        <svg viewBox="0 0 286 132" aria-hidden="true"><path class="axis" d="M12 8 V118 H278"/><path class="trace" pathLength="1" d="${path}"/><circle class="reading-point" cx="270" cy="${high ? 20 : 46}" r="6"/></svg>
        <span class="graph-x">Reaction time</span><strong>${a.graphComplete ? "Reading steady" : a.phase === "light-running" ? "Reading changing…" : "Ready for light reading"}</strong>
    </div>`;
}

function renderAnalyserCutaway() {
    const a = state.analyser;
    const aspirateStep = ["sample", "reagent-aspirate"].includes(a.phase);
    const dispenseStep = ["dispense-sample", "dispense-reagent"].includes(a.phase);
    const liquidStep = aspirateStep || dispenseStep;
    const reactionRunning = a.phase === "reaction-running";
    const lightRunning = a.phase === "light-running";
    const readingStep = ["light-running", "reading"].includes(a.phase);
    const compareStep = a.phase === "compare";
    const targetPosition = a.phase === "sample" ? 0 : a.phase === "reagent-aspirate" ? 1 : dispenseStep ? 2 : null;
    const probePosition = normaliseProbePosition(a.probePosition);
    a.probePosition = probePosition;
    const probeTarget = nearestProbeTarget(probePosition);
    const probeLabel = probeTarget === null ? "between stations" : ["Ian’s sample", "glucose reagent", "reaction cell"][probeTarget];
    updatePersistentScene(`
        <section class="screen analyser-cutaway-screen phase-${a.phase}" aria-labelledby="cutawayTitle">
            <img class="cutaway-art" src="assets/analyser-cutaway-v2.png" alt="Simplified interior of the clinical chemistry analyser">
            <header class="cutaway-heading"><p class="kicker">CHAPTER 4 · TEACHING CUTAWAY</p><h1 id="cutawayTitle">Inside the analyser — a simplified view</h1><p>${state.caseData.name} · ${state.caseData.accession}</p></header>
            ${analyserProgressMarkup()}
            <div class="probe-workspace" aria-label="Move the sampling probe between the tube, reagent and reaction cell">
                <div class="probe-rail" aria-hidden="true"></div>
                <div class="probe-carriage ${a.probeMoving ? "lowering" : ""}" style="left:${probePositionToPercent(probePosition)}%" role="img" aria-label="Sampling probe at ${probeLabel}"><img src="assets/analyser-probe-front-v1.png" alt=""></div>
                <button class="probe-arrow probe-left" type="button" data-probe-move="-1" aria-label="Hold to move probe left" ${!liquidStep || a.probeMoving || probePosition <= PROBE_MIN ? "disabled" : ""}>←</button>
                <button class="probe-arrow probe-right" type="button" data-probe-move="1" aria-label="Hold to move probe right" ${!liquidStep || a.probeMoving || probePosition >= PROBE_MAX ? "disabled" : ""}>→</button>
                <div class="probe-station sample-station-inside ${targetPosition === 0 ? "next-target" : ""} ${probeTarget === 0 ? "probe-aligned" : ""}"><img src="assets/ian-separated-v1.png" alt="Ian’s grey-top tube in the sampling area"><b>Ian’s sample</b></div>
                <div class="probe-station reagent-station-inside ${targetPosition === 1 ? "next-target" : ""} ${probeTarget === 1 ? "probe-aligned" : ""}"><img src="assets/glucose-reagent-dispenser-v1.png" alt="Glucose reagent"><b>Glucose reagent</b></div>
                <div class="probe-station reaction-station-inside ${targetPosition === 2 ? "next-target" : ""} ${probeTarget === 2 ? "probe-aligned" : ""}">
                    <img src="assets/reaction-cup-empty-v1.png" alt="Clear reaction cell">
                    <span class="reaction-fill ${a.sampleAdded ? "sample" : ""} ${a.reagentAdded ? "reagent-added" : ""} ${a.reactionComplete || reactionRunning ? state.measurementCase.reactionStrength : ""}"></span>
                    <b>${a.graphComplete ? "Measured" : a.reactionComplete ? "Ready for light" : a.reagentAdded ? "Sample + reagent" : a.sampleAdded ? "Tiny plasma aliquot" : "Reaction cell"}</b>
                </div>
                ${a.guideTarget !== null ? `<span class="probe-guidance target-${a.guideTarget}" aria-hidden="true">↓</span>` : ""}
            </div>
            <div class="optical-path ${readingStep ? "active" : ""}" aria-hidden="true"><span></span><i></i></div>
            ${analyserGraphMarkup()}
            <div class="cutaway-actions">
                ${liquidStep ? `<button class="primary-button probe-action-button" type="button" data-probe-action="${aspirateStep ? "aspirate" : "dispense"}" ${a.probeMoving ? "disabled" : ""}>${aspirateStep ? "Aspirate" : "Dispense"}</button>` : ""}
                ${a.phase === "reaction-ready" ? '<button class="primary-button" type="button" data-start-reaction>Start reaction</button>' : ""}
                ${a.phase === "light-ready" ? '<button class="primary-button" type="button" data-start-light>Start light reading</button>' : ""}
                ${reactionRunning || lightRunning ? '<button class="secondary-button" type="button" data-skip-animation>Skip animation</button>' : ""}
                ${lightRunning && state.level !== "junior" ? '<button class="primary-button" type="button" data-use-reading>Use reading</button>' : ""}
                ${a.phase === "reading" && state.level !== "junior" ? '<button class="primary-button" type="button" data-use-reading>Use reading</button>' : ""}
            </div>
            ${compareStep ? `<div class="colour-compare"><h2>Which demonstration cup has the stronger colour?</h2><button type="button" data-colour-choice="a"><span class="demo-cup moderate"></span><b>Cup A · lighter pattern</b></button><button type="button" data-colour-choice="b"><span class="demo-cup strong"></span><b>Cup B · stronger pattern</b></button></div>` : ""}
            <p class="chapter-feedback ${a.feedback ? "" : "hidden"}" role="alert">${a.feedback || ""}</p>
        </section>`);
    if (a.phase === "sample") setGuide("Hold an arrow to line up over Ian’s tube, then press Aspirate.");
    else if (a.phase === "dispense-sample") setGuide("Hold an arrow to line up over the reaction cell, then press Dispense.");
    else if (a.phase === "reagent-aspirate") setGuide("Hold an arrow to line up over the glucose reagent, then press Aspirate.");
    else if (a.phase === "dispense-reagent") setGuide("Hold an arrow to line up over the reaction cell, then press Dispense.");
    else if (["reaction-ready", "reaction-running"].includes(a.phase)) setGuide("Start the reaction. The colour develops in the reaction cell, not Ian’s tube.");
    else if (["light-ready", "light-running", "reading"].includes(a.phase)) setGuide("Use light to follow the reaction until the reading is steady.");
    else setGuide("Compare the demonstration cups. The analyser calculates Ian’s result.");
    wireAnalyserInteractions();
    if (a.probeMoving) schedulePhase(finishProbeAction, reducedMotionEnabled() ? 250 : 700);
    if (reactionRunning) schedulePhase(finishReaction, reducedMotionEnabled() ? 700 : 1900);
    if (lightRunning) schedulePhase(finishLightReading, reducedMotionEnabled() ? 900 : 2600);
    if (a.phase === "reading" && state.level === "junior") schedulePhase(completeAnalyserChapter, reducedMotionEnabled() ? 500 : 1100);
    if (a.phase === "complete") schedulePhase(completeAnalyserChapter, reducedMotionEnabled() ? 600 : 1300);
}

function wireAnalyserInteractions() {
    document.querySelectorAll("[data-analyser-object]").forEach(button => {
        button.addEventListener("click", () => selectAnalyserObject(button.dataset.analyserObject));
        button.addEventListener("pointerdown", beginAnalyserDrag);
    });
    document.querySelectorAll("[data-analyser-target]").forEach(button => button.addEventListener("click", () => useAnalyserTarget(button.dataset.analyserTarget)));
    document.querySelectorAll("[data-test-tile]").forEach(button => button.addEventListener("click", () => chooseAnalyserTest(button.dataset.testTile)));
    document.querySelectorAll("[data-probe-move]").forEach(button => {
        const direction = Number(button.dataset.probeMove);
        button.addEventListener("pointerdown", event => {
            event.preventDefault();
            button.setPointerCapture?.(event.pointerId);
            startProbeTravel(direction);
        });
        button.addEventListener("pointerup", releaseProbeTravel);
        button.addEventListener("pointercancel", () => cancelProbeTravel(true));
        button.addEventListener("lostpointercapture", releaseProbeTravel);
    });
    document.querySelector("[data-probe-action]")?.addEventListener("click", event => attemptProbeAction(event.currentTarget.dataset.probeAction));
    document.querySelector("[data-start-reaction]")?.addEventListener("click", startReaction);
    document.querySelector("[data-start-light]")?.addEventListener("click", startLightReading);
    document.querySelector("[data-skip-animation]")?.addEventListener("click", skipAnalyserAnimation);
    document.querySelector("[data-use-reading]")?.addEventListener("click", useSettledReading);
    document.querySelectorAll("[data-colour-choice]").forEach(button => button.addEventListener("click", () => chooseColourStrength(button.dataset.colourChoice)));
}

function selectAnalyserObject(object) {
    const a = state.analyser;
    if (Date.now() < (state.suppressClickUntil || 0)) return;
    const allowed = a.phase === "entry" && object === "tube";
    if (!allowed) return;
    a.selected = a.selected === object ? null : object;
    a.feedback = a.selected ? "Ian’s sample selected. Choose the highlighted analyser rack." : "";
    saveCheckpoint();
    render();
}

function useAnalyserTarget(target) {
    const a = state.analyser;
    if (target === "patient-loader" && a.phase === "entry" && a.selected === "tube") {
        a.selected = null;
        a.tubeLocation = "loader";
        a.phase = "test";
        a.feedback = "Ian’s identity and requested test are confirmed.";
    } else {
        a.feedback = "Complete the highlighted analyser step first.";
        playTone("try");
    }
    saveCheckpoint();
    render();
}

function chooseAnalyserTest(test) {
    const a = state.analyser;
    if (a.phase !== "test") return;
    if (test !== "glucose") {
        a.feedback = "Ian’s request says glucose. Choose the glucose test.";
        playTone("try");
    } else {
        a.testSelected = "glucose";
        a.phase = "sample";
        a.probePosition = 1;
        a.probeLoad = null;
        a.guideTarget = null;
        a.feedback = "Glucose selected. Hold an arrow to move the probe to Ian’s sample.";
        playTone("success");
    }
    saveCheckpoint();
    render();
}

function normaliseProbePosition(position) {
    const numeric = Number(position);
    return Number.isFinite(numeric) ? Math.max(PROBE_MIN, Math.min(PROBE_MAX, numeric)) : 1;
}

function probePositionToPercent(position) {
    return PROBE_RAIL_LEFT + normaliseProbePosition(position) * PROBE_RAIL_STEP;
}

function nearestProbeTarget(position) {
    const numeric = normaliseProbePosition(position);
    const nearest = Math.round(numeric);
    return Math.abs(numeric - nearest) <= PROBE_TARGET_TOLERANCE ? nearest : null;
}

function probeCanTravel() {
    const a = state.analyser;
    return Boolean(a && !a.probeMoving && ["sample", "dispense-sample", "reagent-aspirate", "dispense-reagent"].includes(a.phase) && !portraitQuery.matches && !document.body.classList.contains("dialog-paused"));
}

function playProbeCue(kind) {
    if (!state.soundOn) return;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    try {
        const context = new Audio();
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(kind === "move" ? 115 : 165, context.currentTime);
        oscillator.frequency.linearRampToValueAtTime(kind === "move" ? 135 : 130, context.currentTime + .09);
        gain.gain.setValueAtTime(.025, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .1);
        oscillator.start();
        oscillator.stop(context.currentTime + .11);
    } catch (error) {
        // Probe sound is optional; the controls and movement remain complete.
    }
}

function startProbeTravel(direction) {
    if (!probeCanTravel() || ![-1, 1].includes(direction)) return;
    const a = state.analyser;
    a.probePosition = normaliseProbePosition(a.probePosition);
    a.guideTarget = null;
    const starting = !probeTravel.frameId;
    probeTravel.direction = direction;
    if (starting) {
        a.probePosition = normaliseProbePosition(a.probePosition + direction * .018);
        probeTravel.lastTime = performance.now();
        updateProbeTravelDom();
    }
    if (!probeTravel.cuePlayed) {
        playProbeCue("move");
        probeTravel.cuePlayed = true;
    }
    if (starting) probeTravel.frameId = requestAnimationFrame(updateProbeTravel);
}

function updateProbeTravel(now) {
    if (!probeCanTravel()) {
        cancelProbeTravel(true);
        return;
    }
    const elapsed = Math.min(34, Math.max(1, now - (probeTravel.lastTime || now)));
    probeTravel.lastTime = now;
    const maxSpeed = reducedMotionEnabled() ? .0012 : .00175;
    const acceleration = reducedMotionEnabled() ? .00005 : .000007;
    const braking = reducedMotionEnabled() ? .00005 : .0000105;
    if (probeTravel.direction) {
        const desired = probeTravel.direction * maxSpeed;
        const change = acceleration * elapsed;
        probeTravel.velocity += Math.max(-change, Math.min(change, desired - probeTravel.velocity));
    } else {
        const change = braking * elapsed;
        if (Math.abs(probeTravel.velocity) <= change) probeTravel.velocity = 0;
        else probeTravel.velocity -= Math.sign(probeTravel.velocity) * change;
    }
    const a = state.analyser;
    const before = normaliseProbePosition(a.probePosition);
    a.probePosition = normaliseProbePosition(before + probeTravel.velocity * elapsed);
    updateProbeTravelDom();
    const hitBoundary = (a.probePosition <= PROBE_MIN && probeTravel.velocity < 0) || (a.probePosition >= PROBE_MAX && probeTravel.velocity > 0);
    if (hitBoundary) {
        probeTravel.direction = 0;
        probeTravel.velocity = 0;
    }
    if (!probeTravel.direction && Math.abs(probeTravel.velocity) < .00001) {
        settleProbeTravel(true);
        return;
    }
    probeTravel.frameId = requestAnimationFrame(updateProbeTravel);
}

function updateProbeTravelDom() {
    const a = state.analyser;
    const carriage = document.querySelector(".probe-carriage");
    if (!a || !carriage) return;
    const position = normaliseProbePosition(a.probePosition);
    const target = nearestProbeTarget(position);
    carriage.style.left = `${probePositionToPercent(position)}%`;
    carriage.setAttribute("aria-label", `Sampling probe at ${target === null ? "between stations" : ["Ian’s sample", "glucose reagent", "reaction cell"][target]}`);
    document.querySelectorAll(".probe-station").forEach((station, index) => station.classList.toggle("probe-aligned", index === target));
    document.querySelector(".probe-guidance")?.remove();
    const left = document.querySelector('[data-probe-move="-1"]');
    const right = document.querySelector('[data-probe-move="1"]');
    if (left) left.disabled = position <= PROBE_MIN;
    if (right) right.disabled = position >= PROBE_MAX;
}

function releaseProbeTravel() {
    probeTravel.direction = 0;
    if (reducedMotionEnabled()) probeTravel.velocity = 0;
    if (!probeTravel.frameId && probeCanTravel()) settleProbeTravel(true);
}

function settleProbeTravel(updateDom = true) {
    if (probeTravel.frameId) cancelAnimationFrame(probeTravel.frameId);
    probeTravel.frameId = null;
    probeTravel.direction = 0;
    probeTravel.velocity = 0;
    probeTravel.lastTime = 0;
    const hadCue = probeTravel.cuePlayed;
    probeTravel.cuePlayed = false;
    const a = state.analyser;
    if (!a) return;
    a.probePosition = normaliseProbePosition(a.probePosition);
    const target = nearestProbeTarget(a.probePosition);
    a.feedback = target === null
        ? "The probe is between stations. Line it up over the next container."
        : `Probe aligned over ${["Ian’s sample", "the glucose reagent", "the reaction cell"][target]}.`;
    if (hadCue) playProbeCue("stop");
    saveCheckpoint();
    if (updateDom && state.stage === "analyser") {
        updateProbeTravelDom();
        const feedback = document.querySelector(".analyser-cutaway-screen .chapter-feedback");
        if (feedback) {
            feedback.textContent = a.feedback;
            feedback.classList.toggle("hidden", !a.feedback);
        }
    }
}

function cancelProbeTravel(savePosition = false) {
    const active = Boolean(probeTravel.frameId || probeTravel.direction || probeTravel.velocity);
    if (probeTravel.frameId) cancelAnimationFrame(probeTravel.frameId);
    probeTravel = { frameId:null, direction:0, velocity:0, lastTime:0, cuePlayed:false };
    if (active && savePosition && state.analyser) {
        state.analyser.probePosition = normaliseProbePosition(state.analyser.probePosition);
        saveCheckpoint();
    }
}

function attemptProbeAction(action) {
    const a = state.analyser;
    if (!a || a.probeMoving) return;
    if (probeTravel.frameId || probeTravel.direction || probeTravel.velocity) settleProbeTravel(false);
    const requirements = {
        sample:{ action:"aspirate", position:0, label:"Ian’s sample" },
        "dispense-sample":{ action:"dispense", position:2, label:"the reaction cell" },
        "reagent-aspirate":{ action:"aspirate", position:1, label:"the glucose reagent" },
        "dispense-reagent":{ action:"dispense", position:2, label:"the reaction cell" }
    };
    const required = requirements[a.phase];
    if (!required || action !== required.action || Math.abs(normaliseProbePosition(a.probePosition) - required.position) > PROBE_TARGET_TOLERANCE) {
        if (required) {
            a.guideTarget = required.position;
            a.feedback = `${required.action === "aspirate" ? "Aspirate from" : "Dispense into"} ${required.label} next. Follow the arrow.`;
            playTone("try");
            saveCheckpoint();
            render();
        }
        return;
    }
    a.guideTarget = null;
    a.probeMoving = true;
    a.pendingProbeAction = a.phase;
    a.feedback = `${action === "aspirate" ? "Aspirating" : "Dispensing"}…`;
    saveCheckpoint();
    render();
}

function finishProbeAction() {
    const a = state.analyser;
    if (!a?.probeMoving || !a.pendingProbeAction) return;
    const completed = a.pendingProbeAction;
    a.probeMoving = false;
    a.pendingProbeAction = null;
    if (completed === "sample") {
        a.probeLoad = "sample";
        a.phase = "dispense-sample";
        a.feedback = "A tiny plasma aliquot is in the probe. Move to the reaction cell and dispense it.";
    } else if (completed === "dispense-sample") {
        a.probeLoad = null;
        a.sampleAdded = true;
        a.phase = "reagent-aspirate";
        a.feedback = "The sample is in the reaction cell. Move to the glucose reagent and aspirate.";
    } else if (completed === "reagent-aspirate") {
        a.probeLoad = "reagent";
        a.phase = "dispense-reagent";
        a.feedback = "Reagent is in the probe. Move to the reaction cell and dispense it.";
    } else if (completed === "dispense-reagent") {
        a.probeLoad = null;
        a.reagentAdded = true;
        a.phase = "reaction-ready";
        a.feedback = "Sample and reagent are together. Start the reaction.";
    }
    saveCheckpoint();
    render();
}

function startReaction() {
    const a = state.analyser;
    if (a.phase !== "reaction-ready" || !a.sampleAdded || !a.reagentAdded) {
        if (a) a.feedback = "Add the sample and reagent before starting the reaction.";
        saveCheckpoint();
        render();
        return;
    }
    a.phase = "reaction-running";
    a.feedback = "Mixing… the colour is developing in the separate reaction cell.";
    saveCheckpoint();
    render();
}

function finishReaction() {
    const a = state.analyser;
    if (!a || a.phase !== "reaction-running") return;
    a.reactionComplete = true;
    a.phase = "light-ready";
    a.feedback = "The reaction produced a colour we can measure.";
    saveCheckpoint();
    render();
}

function startLightReading() {
    const a = state.analyser;
    if (a.phase !== "light-ready" || !a.reactionComplete) return;
    a.phase = "light-running";
    a.feedback = "The reading is changing as the reaction develops.";
    saveCheckpoint();
    render();
}

function finishLightReading() {
    const a = state.analyser;
    if (!a || a.phase !== "light-running") return;
    a.graphComplete = true;
    a.phase = "reading";
    a.feedback = "The reading is steady.";
    saveCheckpoint();
    render();
}

function skipAnalyserAnimation() {
    const a = state.analyser;
    if (a.phase === "reaction-running") finishReaction();
    else if (a.phase === "light-running") finishLightReading();
}

function useSettledReading() {
    const a = state.analyser;
    if (a.phase === "light-running" || !a.graphComplete) {
        a.feedback = "Wait for the reading to settle.";
        playTone("try");
        saveCheckpoint();
        render();
        return;
    }
    if (a.phase !== "reading") return;
    a.readingAccepted = true;
    a.phase = "compare";
    a.feedback = "Reading accepted. Now compare two demonstration reactions.";
    saveCheckpoint();
    render();
}

function chooseColourStrength(choice) {
    const a = state.analyser;
    if (a.phase !== "compare") return;
    if (choice !== "b") {
        a.feedback = "Cup B has the stronger fill pattern and deeper colour. Choose Cup B.";
        playTone("try");
        saveCheckpoint();
        render();
        return;
    }
    a.comparisonComplete = true;
    a.phase = "complete";
    a.feedback = "In this example, a stronger colour corresponds to more glucose within the method’s working range. The analyser calculates Ian’s result.";
    playTone("success");
    saveCheckpoint();
    render();
}

function completeAnalyserChapter() {
    const a = state.analyser;
    const required = a?.sampleAdded && a.reagentAdded && a.reactionComplete && a.graphComplete;
    const olderLevelDone = state.level === "junior" || (a?.readingAccepted && a?.comparisonComplete);
    if (!required || !olderLevelDone) return;
    state.chapter4Complete = true;
    state.review = createReviewState(state.level);
    state.report = { checked:false, sent:false };
    state.stage = "review";
    saveCheckpoint();
    render();
}

function analyserDropTargetForPhase() {
    if (state.analyser?.phase === "entry") return document.querySelector('[data-analyser-target="patient-loader"]');
    return null;
}

function beginAnalyserDrag(event) {
    if (!event.isPrimary || event.button !== 0 || event.currentTarget.disabled) return;
    const button = event.currentTarget;
    button.setPointerCapture(event.pointerId);
    analyserDrag = { pointerId:event.pointerId, button, object:button.dataset.analyserObject, startX:event.clientX, startY:event.clientY, moved:false };
    button.addEventListener("pointermove", moveAnalyserDrag);
    button.addEventListener("pointerup", endAnalyserDrag);
    button.addEventListener("pointercancel", cancelAnalyserDrag);
}

function moveAnalyserDrag(event) {
    if (!analyserDrag || event.pointerId !== analyserDrag.pointerId) return;
    const dx = event.clientX - analyserDrag.startX;
    const dy = event.clientY - analyserDrag.startY;
    if (!analyserDrag.moved && Math.hypot(dx, dy) < 7) return;
    analyserDrag.moved = true;
    event.preventDefault();
    analyserDrag.button.classList.add("dragging");
    analyserDrag.button.style.setProperty("--drag-x", `${dx}px`);
    analyserDrag.button.style.setProperty("--drag-y", `${dy - 44}px`);
    const target = analyserDropTargetForPhase();
    if (!target) return;
    const rect = target.getBoundingClientRect();
    target.classList.toggle("drag-over", event.clientX >= rect.left - 38 && event.clientX <= rect.right + 38 && event.clientY >= rect.top - 38 && event.clientY <= rect.bottom + 38);
}

function endAnalyserDrag(event) {
    if (!analyserDrag || event.pointerId !== analyserDrag.pointerId) return;
    const current = { ...analyserDrag };
    const target = analyserDropTargetForPhase();
    const rect = target?.getBoundingClientRect();
    const inside = current.moved && rect && event.clientX >= rect.left - 38 && event.clientX <= rect.right + 38 && event.clientY >= rect.top - 38 && event.clientY <= rect.bottom + 38;
    cleanupAnalyserDrag();
    if (!current.moved) return;
    state.suppressClickUntil = Date.now() + 450;
    state.analyser.selected = inside ? current.object : null;
    if (inside) useAnalyserTarget(target.dataset.analyserTarget);
    else {
        state.analyser.feedback = "The object returned safely. Missed drops are not scientific errors.";
        saveCheckpoint();
        render();
    }
}

function cancelAnalyserDrag() {
    if (!analyserDrag) return;
    cleanupAnalyserDrag();
    if (state.analyser) {
        state.analyser.selected = null;
        state.analyser.feedback = "The object returned safely. Continue when you are ready.";
        saveCheckpoint();
        if (!portraitQuery.matches) render();
    }
}

function cleanupAnalyserDrag() {
    if (!analyserDrag) return;
    const { button } = analyserDrag;
    button.classList.remove("dragging");
    button.style.removeProperty("--drag-x");
    button.style.removeProperty("--drag-y");
    button.removeEventListener("pointermove", moveAnalyserDrag);
    button.removeEventListener("pointerup", endAnalyserDrag);
    button.removeEventListener("pointercancel", cancelAnalyserDrag);
    analyserDropTargetForPhase()?.classList.remove("drag-over");
    analyserDrag = null;
}

function reportScaleMarkup() {
    const within = state.measurementCase.category === "within";
    return `<div class="report-scale" aria-label="Glucose result ${within ? "within" : "outside"} the expected range of 3.9 to 9.00 millimoles per litre">
        <strong>Expected range</strong>
        <div class="report-track"><span class="story-band">Expected range</span><span class="range-value range-low">3.9 mmol/L</span><span class="range-value range-high">9.00 mmol/L</span><span class="report-marker" style="--report-marker:${state.measurementCase.reportMarker * 100}%"><b>Ian’s result</b><i>${within ? "✓" : "↑"}</i></span></div>
        <p>${within ? "Result marker within the expected range" : "Result marker outside the expected range"}</p>
    </div>`;
}

function reviewStepState(step) {
    const r = state.review;
    if (step === "identity") return r.identityConfirmed ? "complete" : r.phase.startsWith("identity") ? "active" : "pending";
    if (step === "compare") return r.comparisonComplete ? "complete" : r.phase === "compare" ? "active" : "pending";
    return r.reviewAcknowledged ? "complete" : ["scientist", "acknowledge"].includes(r.phase) ? "active" : "pending";
}

function renderReviewChapter() {
    const r = state.review;
    const junior = state.level === "junior";
    const choices = [["within", "Within expected range"], ["outside", "Outside expected range"]];
    screenHost.innerHTML = `
        <section class="screen review-screen" aria-labelledby="reviewTitle">
            <img class="review-bg" src="assets/reception-background-v1.png" alt="Clinical chemistry reporting bench">
            <header class="review-heading"><p class="kicker">CHAPTER 5 · CHECK THE RESULT</p><h1 id="reviewTitle">Review Ian’s glucose result</h1><p>${junior ? "Compare the result with the expected range." : "Check the patient, compare the result, and acknowledge the scientist’s review."}</p></header>
            <article class="result-report"><div class="report-title"><strong>Checked result</strong><span>Glucose</span></div>${patientIdentityMarkup(true)}${reportScaleMarkup()}</article>
            <ol class="review-checklist" aria-label="Result review checklist">
                ${junior ? "" : `<li class="${reviewStepState("identity")}"><button type="button" data-review-step="identity"><span>${r.identityConfirmed ? "✓" : "1"}</span>Confirm Ian’s identity<small>${r.identityConfirmed ? "Complete" : "Compare report and accepted request"}</small></button></li>`}
                <li class="${reviewStepState("compare")}"><button type="button" data-review-step="compare"><span>${r.comparisonComplete ? "✓" : junior ? "1" : "2"}</span>Compare the glucose result<small>${r.comparisonComplete ? "Complete" : "Use the expected range"}</small></button></li>
                ${junior ? `<li class="${r.reviewAcknowledged ? "complete" : "pending"} automatic"><span>${r.reviewAcknowledged ? "✓" : "2"}</span><b>Scientist review</b><small>${r.reviewAcknowledged ? "Completed automatically after comparison" : "Follows the comparison"}</small></li>` : `<li class="${reviewStepState("scientist")}"><button type="button" data-review-step="scientist"><span>${r.reviewAcknowledged ? "✓" : "3"}</span>Acknowledge scientist review<small>${r.reviewAcknowledged ? "Complete" : "Available after comparison"}</small></button></li>`}
            </ol>
            ${r.phase === "identity-open" ? `<div class="review-action-panel identity-panel"><h2>Compare the identifiers</h2><div class="identity-columns"><div><h3>Accepted request</h3>${patientIdentityMarkup()}</div><div><h3>Result report</h3>${patientIdentityMarkup()}</div></div><button class="primary-button" type="button" data-confirm-identity>Matches Ian</button></div>` : ""}
            ${r.phase === "compare" ? `<div class="review-action-panel compare-panel"><h2>Is Ian’s result within the normal expected range?</h2><div class="classification-buttons">${choices.map(([value, label]) => `<button type="button" data-result-choice="${value}">${label}</button>`).join("")}</div></div>` : ""}
            ${r.phase === "scientist" ? '<div class="review-action-panel scientist-panel"><img class="review-scientist" src="assets/scientist-guide-v1.png" alt="Clinical scientist"><div><h2>Scientist review</h2><p>The report and result comparison are ready for a laboratory scientist.</p><button class="primary-button" type="button" data-request-review>Request scientist review</button></div></div>' : ""}
            ${r.phase === "acknowledge" ? `<div class="review-action-panel scientist-panel"><img class="review-scientist" src="assets/scientist-guide-v1.png" alt="Clinical scientist"><div><h2>Scientist review complete</h2><p>${state.level === "challenge" ? "A result is one clue. The doctor interprets it with symptoms, history, and other information." : "The checked result is ready to report."}</p><button class="primary-button" type="button" data-acknowledge-review>Acknowledge review</button></div></div>` : ""}
            <p class="chapter-feedback ${r.feedback ? "" : "hidden"}" role="alert">${r.feedback || ""}</p>
        </section>`;
    setGuide(junior ? "The result is ready. Use your checklist to compare it with the expected range." : "Work through the checklist: check the patient, compare the result, and acknowledge the scientist’s review.");
    wireReviewInteractions();
    if (r.phase === "complete") schedulePhase(completeReviewChapter, reducedMotionEnabled() ? 500 : 1100);
}

function wireReviewInteractions() {
    document.querySelectorAll("[data-review-step]").forEach(button => button.addEventListener("click", () => openReviewStep(button.dataset.reviewStep)));
    document.querySelector("[data-confirm-identity]")?.addEventListener("click", confirmReviewIdentity);
    document.querySelectorAll("[data-result-choice]").forEach(button => button.addEventListener("click", () => chooseResultCategory(button.dataset.resultChoice)));
    document.querySelector("[data-request-review]")?.addEventListener("click", requestScientistReview);
    document.querySelector("[data-acknowledge-review]")?.addEventListener("click", acknowledgeScientistReview);
}

function openReviewStep(step) {
    const r = state.review;
    if (step === "identity" && !r.identityConfirmed) r.phase = "identity-open";
    else if (step === "compare" && r.identityConfirmed && !r.comparisonComplete) r.phase = "compare";
    else if (step === "scientist" && r.comparisonComplete && !r.reviewAcknowledged) r.phase = r.scientistReviewed ? "acknowledge" : "scientist";
    else if ((step === "compare" && !r.identityConfirmed) || (step === "scientist" && !r.comparisonComplete)) r.feedback = "Complete the highlighted checklist step first.";
    else r.feedback = "This checklist step is already complete.";
    saveCheckpoint();
    render();
}

function confirmReviewIdentity() {
    const r = state.review;
    if (r.phase !== "identity-open") return;
    r.identityConfirmed = true;
    r.phase = "compare";
    r.feedback = "The report identifiers match Ian’s accepted request.";
    saveCheckpoint();
    render();
}

function chooseResultCategory(choice) {
    const r = state.review;
    if (r.phase !== "compare") return;
    r.categorySelected = choice;
    const expected = state.measurementCase.category === "above" ? "outside" : "within";
    if (choice !== expected) {
        r.feedback = state.measurementCase.category === "above" ? "The marker is beyond 9.00 mmol/L. Choose Outside expected range." : "The marker is between 3.9 and 9.00 mmol/L. Choose Within expected range.";
        playTone("try");
        saveCheckpoint();
        render();
        return;
    }
    r.comparisonComplete = true;
    if (state.level === "junior") {
        r.scientistReviewed = true;
        r.reviewAcknowledged = true;
        r.phase = "complete";
        r.feedback = state.measurementCase.category === "above" ? "The marker is outside the expected range, above the shaded band. The scientist reviewed it before reporting." : "The marker is within the expected range. The scientist still reviewed it before reporting.";
    } else {
        r.phase = "scientist";
        r.feedback = state.measurementCase.category === "above" ? "This result needs the doctor’s attention. It is not a diagnosis." : "This result is within the expected range. The doctor will consider it with Ian’s other information.";
    }
    playTone("success");
    saveCheckpoint();
    render();
}

function requestScientistReview() {
    const r = state.review;
    if (r.phase !== "scientist" || !r.comparisonComplete) return;
    r.reviewRequested = true;
    r.scientistReviewed = true;
    r.phase = "acknowledge";
    r.feedback = "Scientist review complete.";
    saveCheckpoint();
    render();
}

function acknowledgeScientistReview() {
    const r = state.review;
    if (r.phase !== "acknowledge" || !r.scientistReviewed) return;
    r.reviewAcknowledged = true;
    r.phase = "complete";
    r.feedback = "The checked report is ready to send.";
    playTone("success");
    saveCheckpoint();
    render();
}

function completeReviewChapter() {
    const r = state.review;
    if (!r?.comparisonComplete || !r.reviewAcknowledged) return;
    state.chapter5Complete = true;
    state.report = { checked:true, sent:false };
    state.delivery = createDeliveryState();
    state.stage = "delivery";
    saveCheckpoint();
    render();
}

function checkedReportMarkup() {
    return `<article class="checked-report"><header><strong>Clinical Chemistry · Checked report</strong><span>✓ Scientist review complete</span></header>${patientIdentityMarkup()}${reportScaleMarkup()}<p class="report-conclusion">${state.measurementCase.category === "above" ? "This result needs the doctor’s attention." : "This result is within the expected range. The doctor will consider it with Ian’s other information."}</p></article>`;
}

function renderDeliveryChapter() {
    const d = state.delivery;
    if (d.phase === "ready" || d.phase === "sending") renderReportDelivery();
    else if (d.phase === "clinic") renderClinicReport();
    else renderRecap();
}

function renderReportDelivery() {
    const d = state.delivery;
    updatePersistentScene(`<section class="screen delivery-screen" aria-labelledby="deliveryTitle">
        <img class="review-bg" src="assets/reception-background-v1.png" alt="Clinical chemistry reporting bench">
        <header class="delivery-heading"><p class="kicker">CHAPTER 6 · DELIVER THE CLUES</p><h1 id="deliveryTitle">Send Ian’s checked report</h1><p>The laboratory work is reviewed and ready for Ian’s doctor.</p></header>
        ${checkedReportMarkup()}
        <div class="delivery-action"><button class="primary-button" type="button" data-send-report ${d.phase === "sending" ? "disabled" : ""}>${d.phase === "sending" ? "Sending checked report…" : "Send checked report"}</button></div>
        <p class="chapter-feedback ${d.feedback ? "" : "hidden"}" role="status">${d.feedback || ""}</p>
    </section>`);
    setGuide(d.phase === "sending" ? "Sending the checked report securely to Ian’s doctor…" : "The report is checked. Send it to Ian’s doctor.");
    document.querySelector("[data-send-report]")?.addEventListener("click", sendCheckedReport);
    if (d.phase === "sending") schedulePhase(showClinicReport, reducedMotionEnabled() ? 450 : 1300);
}

function sendCheckedReport() {
    const d = state.delivery;
    if (d.phase !== "ready" || !state.report?.checked) return;
    d.sent = true;
    state.report.sent = true;
    d.phase = "sending";
    d.feedback = "Sending checked report…";
    saveCheckpoint();
    render();
}

function showClinicReport() {
    const d = state.delivery;
    if (!d?.sent || d.phase !== "sending") return;
    d.phase = "clinic";
    d.feedback = "Report received by Ian’s doctor.";
    saveCheckpoint();
    render();
}

function renderClinicReport() {
    const d = state.delivery;
    const doctorCopy = state.measurementCase.doctorDialogue === "above"
        ? "Thank you. I’ll look at this glucose result together with Ian’s symptoms and other information to decide what to do next."
        : "Thank you. This glucose result is within the expected range. I’ll use it with the other information to understand why Ian feels tired.";
    updatePersistentScene(`<section class="screen clinic-report-screen" aria-labelledby="clinicReportTitle">
        <div class="clinic-return-art"><div class="clinic-window"><img src="assets/malta-window-townscape-v2.png" alt=""></div><img class="ian-return" src="assets/ian-seated-v2.png" alt="Ian sitting calmly"><img class="doctor-return" src="assets/doctor-clinic-v1.png" alt="Ian’s doctor"></div>
        <div class="clinic-dialogue"><p class="kicker">REPORT RECEIVED</p><h1 id="clinicReportTitle">Ian’s doctor has the clues</h1><p><strong>Doctor:</strong> “${doctorCopy}”</p><p><strong>Ian:</strong> “Thank you for looking after my sample!”</p><button class="primary-button" type="button" data-start-recap>Review the laboratory journey →</button></div>
    </section>`);
    setGuide("The checked glucose report is back with Ian’s doctor.");
    document.querySelector("[data-start-recap]").addEventListener("click", () => {
        d.doctorAcknowledged = true;
        d.phase = "recap";
        saveCheckpoint();
        render();
    });
}

const RECAP_CARDS = {
    prepare:{ title:"Check and prepare", copy:"Match the sample, separate plasma, and complete quality control.", asset:"centrifuge-open-v1.png" },
    measure:{ title:"Measure", copy:"Use a tiny aliquot, reagent, reaction, and light reading.", asset:"analyser-cutaway-v1.png" },
    report:{ title:"Review and report", copy:"Compare, review, and send the checked result.", asset:"request-monitor-v1.png" }
};

function recapCardMarkup(key, source = "pool") {
    const card = RECAP_CARDS[key];
    return `<button class="recap-card ${state.delivery.selected === key ? "selected" : ""}" type="button" data-recap-card="${key}" data-source="${source}" aria-pressed="${state.delivery.selected === key}" aria-label="${card.title} recap card${source.startsWith("slot") ? ` in ${Number(source.slice(4)) + 1}` : " in card tray"}"><img src="assets/${card.asset}" alt=""><span><b>${card.title}</b><small>${card.copy}</small></span></button>`;
}

function renderRecap() {
    const d = state.delivery;
    const placed = new Set(d.recapSlots.filter(Boolean));
    updatePersistentScene(`<section class="screen recap-screen" aria-labelledby="recapTitle">
        <header class="recap-heading"><p class="kicker">CHAPTER 6 · MISSION RECAP</p><h1 id="recapTitle">Put the laboratory journey in order</h1><p>Drag each card into a slot, or select a card and then a slot.</p></header>
        <div class="recap-pool" aria-label="Recap card tray">${d.recapCards.filter(key => !placed.has(key)).map(key => recapCardMarkup(key)).join("")}</div>
        <div class="recap-slots" aria-label="Journey order">
            ${d.recapSlots.map((key, index) => `<div class="recap-slot ${d.selected ? "active" : ""}" role="button" tabindex="0" data-recap-slot="${index}" aria-label="Journey position ${index + 1}${state.level === "junior" ? `; hint ${["check and prepare", "measure", "review and report"][index]}` : ""}"><span class="slot-number">${index + 1}</span>${key ? recapCardMarkup(key, `slot${index}`) : `<span class="slot-hint">${state.level === "junior" ? ["Check first", "Measure next", "Review last"][index] : "Drop a card here"}</span>`}</div>`).join("")}
        </div>
        <button class="primary-button recap-submit" type="button" data-submit-recap ${d.recapSlots.some(value => !value) ? "disabled" : ""}>Check the order</button>
        <p class="chapter-feedback ${d.feedback ? "" : "hidden"}" role="alert">${d.feedback || ""}</p>
    </section>`);
    setGuide("Order the journey: checking and preparation happen before measurement, review, and reporting.");
    wireRecapInteractions();
}

function wireRecapInteractions() {
    document.querySelectorAll("[data-recap-card]").forEach(button => {
        button.addEventListener("click", event => { event.stopPropagation(); selectRecapCard(button.dataset.recapCard); });
        button.addEventListener("pointerdown", beginRecapDrag);
    });
    document.querySelectorAll("[data-recap-slot]").forEach(slot => {
        slot.addEventListener("click", () => placeSelectedRecapCard(Number(slot.dataset.recapSlot)));
        slot.addEventListener("keydown", event => {
            if (!["Enter", " "].includes(event.key)) return;
            event.preventDefault();
            placeSelectedRecapCard(Number(slot.dataset.recapSlot));
        });
    });
    document.querySelector("[data-submit-recap]")?.addEventListener("click", submitRecap);
}

function selectRecapCard(key) {
    if (Date.now() < (state.suppressClickUntil || 0)) return;
    state.delivery.selected = state.delivery.selected === key ? null : key;
    state.delivery.feedback = state.delivery.selected ? `${RECAP_CARDS[key].title} selected. Choose a journey position.` : "";
    saveCheckpoint();
    render();
}

function placeSelectedRecapCard(index) {
    const d = state.delivery;
    const key = d.selected;
    if (!key) return;
    const oldIndex = d.recapSlots.indexOf(key);
    const displaced = d.recapSlots[index];
    if (oldIndex >= 0) d.recapSlots[oldIndex] = displaced || null;
    else if (displaced) {
        const empty = d.recapSlots.findIndex(value => !value);
        if (empty >= 0) d.recapSlots[empty] = displaced;
    }
    d.recapSlots[index] = key;
    d.selected = null;
    d.feedback = `${RECAP_CARDS[key].title} placed in position ${index + 1}.`;
    saveCheckpoint();
    render();
}

function submitRecap() {
    const d = state.delivery;
    if (d.recapSlots.some(value => !value)) return;
    if (d.recapSlots.join(",") !== "prepare,measure,report") {
        d.attempts += 1;
        d.feedback = d.attempts > 1 ? "Check the first pair that is out of order: prepare the sample before measuring it, then review and report." : "Start by checking and preparing the sample before it is measured.";
        playTone("try");
        saveCheckpoint();
        render();
        return;
    }
    d.recapComplete = true;
    d.feedback = "That is the laboratory journey in the correct order!";
    saveCheckpoint();
    awardChemistryBadge();
}

function beginRecapDrag(event) {
    if (!event.isPrimary || event.button !== 0) return;
    const button = event.currentTarget;
    button.setPointerCapture(event.pointerId);
    recapDrag = { pointerId:event.pointerId, button, key:button.dataset.recapCard, startX:event.clientX, startY:event.clientY, moved:false };
    button.addEventListener("pointermove", moveRecapDrag);
    button.addEventListener("pointerup", endRecapDrag);
    button.addEventListener("pointercancel", cancelRecapDrag);
}

function moveRecapDrag(event) {
    if (!recapDrag || event.pointerId !== recapDrag.pointerId) return;
    const dx = event.clientX - recapDrag.startX;
    const dy = event.clientY - recapDrag.startY;
    if (!recapDrag.moved && Math.hypot(dx, dy) < 7) return;
    recapDrag.moved = true;
    event.preventDefault();
    recapDrag.button.classList.add("dragging");
    recapDrag.button.style.setProperty("--drag-x", `${dx}px`);
    recapDrag.button.style.setProperty("--drag-y", `${dy - 42}px`);
    document.querySelectorAll("[data-recap-slot]").forEach(slot => {
        const rect = slot.getBoundingClientRect();
        slot.classList.toggle("drag-over", event.clientX >= rect.left - 24 && event.clientX <= rect.right + 24 && event.clientY >= rect.top - 24 && event.clientY <= rect.bottom + 24);
    });
}

function endRecapDrag(event) {
    if (!recapDrag || event.pointerId !== recapDrag.pointerId) return;
    const current = { ...recapDrag };
    const slot = Array.from(document.querySelectorAll("[data-recap-slot]")).find(candidate => {
        const rect = candidate.getBoundingClientRect();
        return event.clientX >= rect.left - 24 && event.clientX <= rect.right + 24 && event.clientY >= rect.top - 24 && event.clientY <= rect.bottom + 24;
    });
    cleanupRecapDrag();
    if (!current.moved) return;
    state.suppressClickUntil = Date.now() + 450;
    state.delivery.selected = current.key;
    if (slot) placeSelectedRecapCard(Number(slot.dataset.recapSlot));
    else {
        state.delivery.selected = null;
        state.delivery.feedback = "The recap card returned safely. Missed drops are not errors.";
        saveCheckpoint();
        render();
    }
}

function cancelRecapDrag() {
    if (!recapDrag) return;
    cleanupRecapDrag();
    if (state.delivery) {
        state.delivery.selected = null;
        state.delivery.feedback = "The recap card returned to its last valid position.";
        saveCheckpoint();
        if (!portraitQuery.matches) render();
    }
}

function cleanupRecapDrag() {
    if (!recapDrag) return;
    const { button } = recapDrag;
    button.classList.remove("dragging");
    button.style.removeProperty("--drag-x");
    button.style.removeProperty("--drag-y");
    button.removeEventListener("pointermove", moveRecapDrag);
    button.removeEventListener("pointerup", endRecapDrag);
    button.removeEventListener("pointercancel", cancelRecapDrag);
    document.querySelectorAll("[data-recap-slot]").forEach(slot => slot.classList.remove("drag-over"));
    recapDrag = null;
}

function awardChemistryBadge() {
    const d = state.delivery;
    if (!d?.sent || !d.doctorAcknowledged || !d.recapComplete) return;
    if (!d.badgeAwarded) {
        d.badgeAwarded = true;
        saveSharedChemistryProgress();
    }
    state.chapter6Complete = true;
    state.stage = "mission-complete";
    saveCheckpoint();
    playTone("success");
    render();
}

function saveSharedChemistryProgress() {
    try {
        const key = "sitcGameProgressV2";
        const raw = localStorage.getItem(key);
        let progress = {};
        if (raw) {
            try { progress = JSON.parse(raw); } catch (error) { progress = {}; }
        }
        if (!progress || typeof progress !== "object" || Array.isArray(progress)) progress = {};
        if (!progress.completedCases || typeof progress.completedCases !== "object" || Array.isArray(progress.completedCases)) progress.completedCases = {};
        if (!Array.isArray(progress.completedCases.chemistry)) progress.completedCases.chemistry = [];
        if (!progress.completedCases.chemistry.includes("main")) progress.completedCases.chemistry.push("main");
        localStorage.setItem(key, JSON.stringify(progress));
        storageAvailable = true;
    } catch (error) {
        storageAvailable = false;
        console.warn("Chemistry badge progress could not be saved:", error);
    }
}

function replayQualityControl() {
    state.qualityControl = createQualityControlState(state.level);
    state.stage = "qc-intro";
    saveCheckpoint();
    render();
}

function renderComplete() {
    updatePersistentScene(`
        <section class="screen complete-screen mission-complete-screen" aria-labelledby="completeTitle">
            <div class="complete-card chemistry-badge-card">
                <div class="chemistry-badge" aria-hidden="true"><span class="badge-tube"></span><span class="badge-cup"></span><span class="badge-beam"></span><b>★</b></div>
                <p class="kicker">ALL SIX CHAPTERS COMPLETE</p>
                <h1 id="completeTitle" tabindex="-1">Clinical Chemistry Badge Earned!</h1>
                <p class="success-line">You checked Ian’s sample, prepared the plasma, checked the test, measured glucose, and helped his doctor.</p>
                <p class="section-end"><strong>${state.caseData.name}’s laboratory journey is complete.</strong><br>Hints and retries never change the badge you earn.</p>
                <div class="complete-actions">
                    <button class="primary-button" id="newVersionButton" type="button">Play a new version</button>
                    <a class="secondary-button" href="../">Return to Clinical Chemistry</a>
                </div>
                <p class="no-badge">${storageAvailable ? "The badge is saved in your laboratory passport." : "The mission is complete, but the badge could not be saved on this device."}</p>
            </div>
        </section>`);
    setGuide("Clinical Chemistry Badge Earned! Ian’s checked report reached his doctor.");
    document.getElementById("newVersionButton").addEventListener("click", startNewVersion);
    document.getElementById("completeTitle")?.focus();
}

function startNewVersion() {
    resetToOpening(true);
}

function resetToOpening(allowWithin = false) {
    const soundOn = state.soundOn;
    clearCheckpoint();
    allowWithinNextCase = allowWithin;
    state = {
        version:7, level:null, caseData:null, scenario:null, stage:"opening", clueSeen:false,
        inspectionIndex:null, mismatchFields:[], acceptedIndex:null, bottleSelected:false,
        chapter1Complete:false, chapter2Complete:false, chapter3Complete:false, chapter4Complete:false, chapter5Complete:false, chapter6Complete:false,
        centrifuge:null, qualityControl:null, measurementCase:null, analyser:null, review:null, report:null, delivery:null, soundOn
    };
    render();
}

function changeLevel(level) {
    levelDialog.close();
    if (level === state.level) return;
    if (!state.caseData || state.stage === "opening") {
        startFresh(level);
        return;
    }
    cancelBottleDrag();
    cancelCentrifugeDrag();
    cancelQcDrag();
    cancelAnalyserDrag();
    cancelRecapDrag();
    if (state.stage === "mission-complete") {
        startFresh(level, true);
        return;
    }
    if (state.chapter5Complete || state.stage === "delivery") {
        state.level = level;
        state.delivery = createDeliveryState();
        state.stage = "delivery";
        saveCheckpoint();
        render();
        return;
    }
    if (state.chapter4Complete || state.stage === "review") {
        state.level = level;
        state.review = createReviewState(level);
        state.report = { checked:false, sent:false };
        state.stage = "review";
        saveCheckpoint();
        render();
        return;
    }
    if (state.chapter3Complete || state.stage === "analyser") {
        state.level = level;
        state.analyser = createAnalyserState();
        state.stage = "analyser";
        saveCheckpoint();
        render();
        return;
    }
    if (state.chapter2Complete || isQualityControlStage(state.stage)) {
        state.level = level;
        state.qualityControl = createQualityControlState(level);
        state.stage = "qc-intro";
        saveCheckpoint();
        render();
        return;
    }
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
    state.stage = state.stage === "story" ? "story" : "arrival";
    state.clueSeen = true;
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
    cancelQcDrag();
    cancelAnalyserDrag();
    cancelProbeTravel(true);
    cancelRecapDrag();
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
        cancelQcDrag();
        cancelAnalyserDrag();
        cancelProbeTravel(true);
        cancelRecapDrag();
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
    dialog.innerHTML = `<div class="dialog-card"><p class="dialog-kicker">SAVED CASE FOUND</p><h2 id="resumeTitle">Continue Ian's chemistry mission?</h2><p>Your ${LEVELS[saved.level].label} case will resume with the same name, ID no., birthday, accession and safe laboratory checkpoint.</p><div class="dialog-actions"><button class="primary-button" type="button" data-continue>Continue case</button><button class="secondary-button" type="button" data-restart>Start again</button></div></div>`;
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
        resetToOpening(false);
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
document.addEventListener("keydown", event => {
    if (state.stage !== "analyser" || !state.analyser || portraitQuery.matches || document.body.classList.contains("dialog-paused")) return;
    if (!["sample", "dispense-sample", "reagent-aspirate", "dispense-reagent"].includes(state.analyser.phase)) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        startProbeTravel(event.key === "ArrowLeft" ? -1 : 1);
    }
});
document.addEventListener("keyup", event => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    releaseProbeTravel();
});
document.addEventListener("fullscreenchange", () => {
    fullscreenButton.textContent = document.fullscreenElement ? "×" : "⛶";
    fullscreenButton.setAttribute("aria-label", document.fullscreenElement ? "Exit full screen" : "Enter full screen");
});
portraitQuery.addEventListener?.("change", updateOrientation);
window.addEventListener("resize", updateOrientation);
window.addEventListener("blur", () => {
    if (drag) cancelBottleDrag();
    if (centrifugeDrag) cancelCentrifugeDrag();
    if (qcDrag) cancelQcDrag();
    if (analyserDrag) cancelAnalyserDrag();
    cancelProbeTravel(true);
    if (recapDrag) cancelRecapDrag();
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
