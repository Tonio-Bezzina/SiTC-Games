/*
   NICKY'S BLOOD BANK RESCUE

   The mission deliberately varies labels, answer positions and short dialogue on every run.
   Nicky's patient details, blood group, answer positions and short dialogue vary on every run.
*/

const STORAGE_KEY = "sitcGameProgressV2";
const LAB_ID = "transfusion";
const CASE_ID = "nicky";
const TOTAL_STEPS = 6;

const screenHost = document.getElementById("screenHost");
const guideText = document.getElementById("guideText");
const modeLabel = document.getElementById("modeLabel");
const stepLabel = document.getElementById("stepLabel");
const progressDots = document.getElementById("progressDots");
const nextButton = document.getElementById("nextButton");
const feedbackModal = document.getElementById("feedbackModal");
const feedbackIcon = document.getElementById("feedbackIcon");
const feedbackTitle = document.getElementById("feedbackTitle");
const feedbackText = document.getElementById("feedbackText");
const feedbackButton = document.getElementById("feedbackButton");
const soundButton = document.getElementById("soundButton");
const fullscreenButton = document.getElementById("fullscreenButton");

const modeDetails = {
    junior: { label: "Junior · Ages 7–9", hint: "Big hints and friendly guidance" },
    explorer: { label: "Explorer · Ages 10–12", hint: "Clear clues with less help" },
    challenge: { label: "Challenge · Ages 13–16", hint: "Small differences and fewer clues" }
};

const patientVariants = [
    { name: "Nicky Borg", id: "MRN 428731" },
    { name: "Nicky Galea", id: "MRN 615204" },
    { name: "Nicky Vella", id: "MRN 307518" },
    { name: "Nicky Camilleri", id: "MRN 842963" }
];

const emergencyLines = [
    "The clinical team needs red cells now. Keep Nicky safe while the laboratory completes the blood group.",
    "Nicky cannot wait for the full blood group. Choose the safest emergency red cells first.",
    "The blood bank phone is ringing—Nicky needs an emergency unit before testing is complete."
];

const state = {
    mode: null,
    step: 1,
    patient: patientVariants[0],
    firstAttempt: true,
    firstTryWins: 0,
    taskCount: 0,
    bloodGroup: null,
    groupingWells: null,
    groupingTool: null,
    pipetteLoaded: false,
    groupingBusy: false,
    groupingTaskCounted: false,
    usedStickCount: 0,
    interpretationAttempts: 0,
    suppressGroupingClickUntil: 0,
    selectedBloodPack: null,
    bloodChoiceBusy: false,
    missionStartedAt: null,
    sampleScenario: null,
    soundOn: true,
    modalAction: null
};

/* Fisher-Yates keeps answer positions genuinely variable without changing their meaning. */
function shuffle(items) {
    const copy = [...items];

    for (let index = copy.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
    }

    return copy;
}

function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

/* The tiny Web Audio tones give feedback without requiring external sound files. */
function playTone(kind) {
    if (!state.soundOn || !window.AudioContext) return;

    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.type = kind === "success" ? "sine" : "triangle";
    oscillator.frequency.setValueAtTime(kind === "success" ? 520 : 180, audio.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(kind === "success" ? 780 : 135, audio.currentTime + 0.16);
    gain.gain.setValueAtTime(0.11, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.22);
    oscillator.start();
    oscillator.stop(audio.currentTime + 0.23);
}

function updateChrome() {
    modeLabel.textContent = state.mode ? modeDetails[state.mode].label : "Choose a level";
    stepLabel.textContent = state.mode ? `Step ${state.step} of ${TOTAL_STEPS}` : "Ready";
    progressDots.innerHTML = "";

    for (let index = 1; index <= TOTAL_STEPS; index += 1) {
        const dot = document.createElement("span");
        dot.className = "progress-dot";
        if (index < state.step) dot.classList.add("done");
        if (index === state.step) dot.classList.add("current");
        progressDots.appendChild(dot);
    }
}

function setGuide(message) {
    guideText.textContent = message;
}

function showFeedback({ correct, title, message, button = "Continue", action }) {
    feedbackIcon.textContent = correct ? "⭐" : "🔎";
    feedbackTitle.textContent = title;
    feedbackText.textContent = message;
    feedbackButton.textContent = button;
    state.modalAction = action;
    feedbackModal.classList.remove("hidden");
    playTone(correct ? "success" : "try");
    feedbackButton.focus();
}

function closeFeedback() {
    feedbackModal.classList.add("hidden");
    const action = state.modalAction;
    state.modalAction = null;
    if (typeof action === "function") action();
}

function beginTask() {
    state.firstAttempt = true;
    state.taskCount += 1;
}

function markFirstTry() {
    if (state.firstAttempt) state.firstTryWins += 1;
}

function moveTo(step) {
    state.step = step;
    updateChrome();
    renderCurrentScreen();
}

function attemptFullscreen() {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
    }

    if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock("landscape").catch(() => {});
    }
}

/* The opening illustration anchors the game in Nicky's supplied emergency storyline. */
function renderStart() {
    screenHost.innerHTML = `
        <section class="screen start-screen">
            <div class="start-visual" role="img" aria-label="Nicky resting with his teddy bear, with a nurse and doctor beside his hospital bed and a heart-rate monitor running">
                <img class="scene-room" src="assets/hospital-room-v1.png" alt="" draggable="false">
                <img class="scene-monitor" src="assets/heart-rate-monitor-v1.svg?v=2" alt="" draggable="false">
                <img class="scene-character scene-nurse" src="assets/nurse-v1.png" alt="" draggable="false">
                <img class="scene-character scene-nicky" src="assets/nicky-v1.png" alt="" draggable="false">
                <img class="scene-character scene-doctor" src="assets/doctor-v1.png" alt="" draggable="false">
            </div>
            <div class="start-panel">
                <p class="mission-kicker">TRANSFUSION LAB · MAIN MISSION</p>
                <h1>Nicky needs your help!</h1>
                <p>${randomItem(emergencyLines)}</p>
                <div class="level-grid" aria-label="Choose a mission level">
                    ${Object.entries(modeDetails).map(([id, details]) => `
                        <button class="level-card" type="button" data-mode="${id}">
                            <strong>${details.label.split(" · ")[0]}</strong>
                            <span>${details.label.split(" · ")[1]}</span>
                            <span>${details.hint}</span>
                        </button>
                    `).join("")}
                </div>
            </div>
        </section>
    `;

    setGuide("Choose Junior, Explorer or Challenge. Every level earns the same Transfusion badge.");
    document.querySelectorAll("[data-mode]").forEach((button) => {
        button.addEventListener("click", () => startMission(button.dataset.mode));
    });
}

function startMission(mode) {
    state.mode = mode;
    state.missionStartedAt = new Date();
    state.patient = createMissionPatient(randomItem(patientVariants), mode, state.missionStartedAt);
    state.sampleScenario = createSampleScenario(state.patient, mode, state.missionStartedAt);
    state.firstTryWins = 0;
    state.taskCount = 0;
    state.bloodGroup = randomItem(BLOOD_GROUPS);
    state.groupingWells = createGroupingWells(state.bloodGroup);
    state.groupingTool = null;
    state.pipetteLoaded = false;
    state.groupingBusy = false;
    state.groupingTaskCounted = false;
    state.usedStickCount = 0;
    state.interpretationAttempts = 0;
    state.suppressGroupingClickUntil = 0;
    state.selectedBloodPack = null;
    state.bloodChoiceBusy = false;
    state.step = 2;
    attemptFullscreen();
    updateChrome();
    renderBloodChoice();
}

/* Emergency O-negative selection is visually hinted only in Junior mode, as agreed. */
function renderBloodChoice() {
    beginTask();
    const units = shuffle(["O−", "A+", "AB+", "B−"]);
    screenHost.innerHTML = `
        <section class="screen blood-bank-screen entering" aria-labelledby="bloodBankTitle">
            <img class="blood-bank-room" src="assets/screen-2/blood-bank-room.png" alt="">
            <div class="blood-bank-brief">
                <p class="mission-kicker">EMERGENCY BLOOD ISSUE</p>
                <h1 id="bloodBankTitle" class="screen-title">Choose emergency red cells</h1>
                <p id="bloodBankInstruction" class="screen-instruction">Move the safest unit from the fridge to the nurse.</p>
            </div>
            <div class="blood-fridge" aria-label="Open blood storage refrigerator with four shelves">
                <div class="fridge-cool-glow" aria-hidden="true"></div>
                <img src="assets/screen-2/blood-fridge-open.png" alt="Open blood storage refrigerator">
                ${units.map((type, shelf) => `
                    <button class="shelf-blood-pack shelf-${shelf + 1} ${state.mode === "junior" && type === "O−" ? "junior-blood-hint" : ""}" type="button" data-blood="${type}" aria-pressed="false" aria-describedby="bloodBankInstruction" aria-label="${type} red-cell pack on shelf ${shelf + 1}">
                        <img src="assets/screen-2/red-cell-pack-blank.png" alt="">
                        <span class="shelf-blood-label">${type}</span>
                    </button>
                `).join("")}
            </div>
            <button class="nurse-receiving-zone" type="button" data-receive-blood aria-label="Give the selected red-cell pack to the nurse">
                <span class="receive-target" aria-hidden="true"></span>
                <img class="blood-bank-nurse" src="assets/screen-2/nurse-waiting.png" alt="Nurse waiting to receive the emergency red-cell pack">
                <span class="receive-caption">Give selected pack</span>
            </button>
        </section>
    `;

    state.selectedBloodPack = null;
    state.bloodChoiceBusy = false;
    setGuide(state.mode === "junior" ? "Drag the gently pulsing O-negative unit to the nurse, or select it and then tap her hand." : "Drag a unit to the nurse, or select it and then tap her hand.");
    document.querySelectorAll(".shelf-blood-pack").forEach(setUpBloodPack);

    const receivingZone = document.querySelector("[data-receive-blood]");
    receivingZone.addEventListener("click", () => {
        if (document.querySelector(".blood-bank-screen.entering")) return;
        if (state.selectedBloodPack && !state.bloodChoiceBusy) handBloodToNurse(state.selectedBloodPack);
    });
    window.setTimeout(() => document.querySelector(".blood-bank-screen")?.classList.remove("entering"), 500);
}

function selectBloodPack(pack) {
    if (state.bloodChoiceBusy || document.querySelector(".blood-bank-screen.entering")) return;
    document.querySelectorAll(".shelf-blood-pack.selected").forEach((item) => {
        item.classList.remove("selected");
        item.setAttribute("aria-pressed", "false");
    });
    pack.classList.add("selected");
    pack.setAttribute("aria-pressed", "true");
    state.selectedBloodPack = pack;
    setGuide(`${pack.dataset.blood} selected. Drag it to the nurse or tap the nurse's hand to give it to her.`);
}

function setUpBloodPack(pack) {
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let offsetX = 0;
    let offsetY = 0;
    let dragging = false;

    pack.addEventListener("dragstart", (event) => event.preventDefault());
    pack.addEventListener("click", () => selectBloodPack(pack));
    pack.addEventListener("pointerdown", (event) => {
        if (state.bloodChoiceBusy || document.querySelector(".blood-bank-screen.entering") || (event.button !== undefined && event.button !== 0)) return;
        pointerId = event.pointerId;
        startX = event.clientX;
        startY = event.clientY;
        const rect = pack.getBoundingClientRect();
        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;
        pack._homeRect = rect;
        pack.setPointerCapture(pointerId);
        selectBloodPack(pack);
    });
    pack.addEventListener("pointermove", (event) => {
        if (event.pointerId !== pointerId || state.bloodChoiceBusy) return;
        if (!dragging && Math.hypot(event.clientX - startX, event.clientY - startY) > 6) {
            dragging = true;
            liftBloodPack(pack, pack._homeRect);
            document.body.classList.add("blood-pack-dragging");
        }
        if (!dragging) return;
        event.preventDefault();
        pack.style.left = `${event.clientX - offsetX}px`;
        pack.style.top = `${event.clientY - offsetY}px`;
        updateReceivingHighlight(event.clientX, event.clientY);
    });
    pack.addEventListener("pointerup", (event) => {
        if (event.pointerId !== pointerId) return;
        pointerId = null;
        document.body.classList.remove("blood-pack-dragging");
        if (!dragging) return;
        dragging = false;
        const overNurse = isOverReceivingArea(event.clientX, event.clientY);
        updateReceivingHighlight(-1, -1);
        if (overNurse) handBloodToNurse(pack);
        else returnBloodPack(pack);
    });
    pack.addEventListener("pointercancel", (event) => {
        if (event.pointerId !== pointerId) return;
        pointerId = null;
        dragging = false;
        document.body.classList.remove("blood-pack-dragging");
        updateReceivingHighlight(-1, -1);
        returnBloodPack(pack);
    });
}

function liftBloodPack(pack, rect = pack.getBoundingClientRect()) {
    pack._homeRect = pack._homeRect || rect;
    Object.assign(pack.style, {
        position: "fixed",
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`
    });
    pack.classList.add("dragging");
}

function clearFloatingPack(pack) {
    pack.classList.remove("dragging", "returning", "wrong-pack");
    for (const property of ["position", "left", "top", "width", "height", "opacity", "transform"]) {
        pack.style[property] = "";
    }
    pack._homeRect = null;
}

function transitionFinished(element, timeout = 500) {
    return new Promise((resolve) => {
        let finished = false;
        const done = () => {
            if (finished) return;
            finished = true;
            element.removeEventListener("transitionend", done);
            resolve();
        };
        element.addEventListener("transitionend", done, { once: true });
        window.setTimeout(done, timeout);
    });
}

async function returnBloodPack(pack, showWrongFeedback = false) {
    if (!pack.classList.contains("dragging")) liftBloodPack(pack);
    const home = pack._homeRect;
    pack.classList.add("returning");
    requestAnimationFrame(() => {
        pack.style.left = `${home.left}px`;
        pack.style.top = `${home.top}px`;
        pack.style.transform = "scale(1)";
    });
    await transitionFinished(pack);
    clearFloatingPack(pack);
    if (showWrongFeedback) {
        state.bloodChoiceBusy = false;
        showFeedback({
            correct: false,
            title: "Keep Nicky safe",
            message: "Nicky's blood group is not yet known. O-negative red cells are the safest emergency choice.",
            button: "Try again"
        });
    }
}

function isOverReceivingArea(x, y) {
    const target = document.querySelector(".receive-target");
    if (!target) return false;
    const rect = target.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function updateReceivingHighlight(x, y) {
    const zone = document.querySelector(".nurse-receiving-zone");
    if (zone) zone.classList.toggle("drag-over", isOverReceivingArea(x, y));
}

async function handBloodToNurse(pack) {
    if (!pack || state.bloodChoiceBusy) return;
    state.bloodChoiceBusy = true;
    document.querySelector(".nurse-receiving-zone")?.classList.remove("drag-over");

    if (pack.dataset.blood !== "O−") {
        state.firstAttempt = false;
        pack.classList.add("wrong-pack");
        if (!pack.classList.contains("dragging")) {
            liftBloodPack(pack);
            requestAnimationFrame(() => {
                pack.style.left = `${pack._homeRect.left + Math.max(22, pack._homeRect.width * .35)}px`;
                pack.style.transform = "rotate(5deg)";
            });
            await new Promise((resolve) => window.setTimeout(resolve, 170));
        }
        await returnBloodPack(pack, true);
        return;
    }

    markFirstTry();
    if (!pack.classList.contains("dragging")) liftBloodPack(pack);
    const target = document.querySelector(".receive-target").getBoundingClientRect();
    const packRect = pack.getBoundingClientRect();
    pack.classList.add("handover");
    requestAnimationFrame(() => {
        pack.style.left = `${target.left + (target.width - packRect.width) / 2}px`;
        pack.style.top = `${target.top + (target.height - packRect.height) / 2}px`;
        pack.style.transform = "scale(.74) rotate(-5deg)";
        pack.style.opacity = ".12";
    });
    await transitionFinished(pack, 650);
    pack.hidden = true;
    const nurseZone = document.querySelector(".nurse-receiving-zone");
    const nurse = nurseZone.querySelector(".blood-bank-nurse");
    nurse.src = "assets/screen-2/nurse-received.png";
    nurse.alt = "Nurse smiling after receiving the O-negative emergency red-cell pack";
    nurseZone.classList.add("received");
    nurseZone.disabled = true;
    state.selectedBloodPack = null;
    showFeedback({
        correct: true,
        title: "Emergency unit released!",
        message: "O-negative red cells give the laboratory time to confirm Nicky's blood group safely.",
        action: () => moveTo(3)
    });
}

const ageRanges = {
    junior: [7, 9],
    explorer: [10, 12],
    challenge: [13, 16]
};

const collectorInitials = ["AB", "KM", "LT", "RS"];

function twoDigits(value) {
    return String(value).padStart(2, "0");
}

function formatDate(date) {
    return `${twoDigits(date.getDate())}/${twoDigits(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function formatDateTime(date) {
    return `${formatDate(date)}, ${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}`;
}

function createMissionPatient(basePatient, mode, referenceDate) {
    const [minimumAge, maximumAge] = ageRanges[mode];
    const age = minimumAge + Math.floor(Math.random() * (maximumAge - minimumAge + 1));
    const month = Math.floor(Math.random() * 12);
    let day = 1 + Math.floor(Math.random() * 12);
    if (day === month + 1) day = day === 12 ? 11 : day + 1;
    const birthdayHasPassed = month < referenceDate.getMonth()
        || (month === referenceDate.getMonth() && day <= referenceDate.getDate());
    const year = referenceDate.getFullYear() - age - (birthdayHasPassed ? 0 : 1);
    return { ...basePatient, dob: formatDate(new Date(year, month, day)), age };
}

function alterMrnSubtly(id) {
    const prefix = id.slice(0, id.search(/\d/));
    const digits = id.replace(/\D/g, "").split("");
    const canTranspose = digits.some((digit, index) => index < digits.length - 1 && digit !== digits[index + 1]);

    if (canTranspose && Math.random() < .5) {
        const positions = digits.map((digit, index) => index < digits.length - 1 && digit !== digits[index + 1] ? index : -1).filter((index) => index >= 0);
        const index = randomItem(positions);
        [digits[index], digits[index + 1]] = [digits[index + 1], digits[index]];
    } else {
        const index = Math.floor(Math.random() * digits.length);
        digits[index] = String((Number(digits[index]) + randomItem([1, 3, 7])) % 10);
    }

    return `${prefix}${digits.join("")}`;
}

function alterDobClearly(dob) {
    const [day, month, year] = dob.split("/");
    return `${day}/${month}/${Number(year) - 3}`;
}

function createWrongSample(patient, mode) {
    if (mode === "junior") {
        return {
            ...patient,
            name: randomItem(["Maya Zammit", "Luca Farrugia", "Sara Mifsud"]),
            id: `MRN ${randomItem(["950124", "173806", "564290"])}`,
            dob: alterDobClearly(patient.dob),
            mismatchFields: ["name", "mrn", "dob"]
        };
    }

    if (mode === "explorer") {
        return {
            ...patient,
            id: `MRN ${randomItem(["950124", "173806", "564290"])}`,
            mismatchFields: ["mrn"]
        };
    }

    return { ...patient, id: alterMrnSubtly(patient.id), mismatchFields: ["mrn"] };
}

function createSampleScenario(patient, mode, missionStartedAt) {
    const correct = { ...patient, correct: true, collector: randomItem(collectorInitials) };
    const wrong = { ...createWrongSample(patient, mode), correct: false, collector: randomItem(collectorInitials) };
    const correctFirst = Math.random() < .5;
    return {
        requestDateTime: formatDateTime(missionStartedAt),
        correctSide: correctFirst ? "left" : "right",
        samples: correctFirst ? [correct, wrong] : [wrong, correct]
    };
}

function monitorField(label, value, field = "", extraClass = "") {
    const attribute = field ? ` data-reference-field="${field}"` : "";
    return `<div class="monitor-request-field ${extraClass}"${attribute}><dt>${label}</dt><dd>${value}<span class="reference-marker">Reference</span></dd></div>`;
}

function obscuredRequestDetails() {
    return `
        <span class="request-scribble" role="img" aria-label="Details intentionally obscured">
            <span class="request-scribble-line" aria-hidden="true"></span>
            <span class="request-scribble-line" aria-hidden="true"></span>
            <span class="request-scribble-line" aria-hidden="true"></span>
        </span>
    `;
}

function requestMonitorMarkup() {
    const patient = state.patient;
    return `
        <div class="request-monitor" aria-label="Transfusion Laboratory Request reference">
            <img src="assets/screen-3/request-monitor.png" alt="Laboratory request monitor">
            <div class="request-monitor-ui">
                <header><strong>Transfusion Laboratory Request</strong></header>
                <section class="monitor-section monitor-patient-section" aria-labelledby="monitorPatientHeading">
                    <h3 id="monitorPatientHeading">Patient details</h3>
                    <dl>
                        ${monitorField("Patient name", patient.name, "name")}
                        ${monitorField("MRN", patient.id, "mrn")}
                        ${monitorField("Date of birth", patient.dob, "dob")}
                        ${monitorField("Location", "Emergency Department")}
                    </dl>
                </section>
                <section class="monitor-section monitor-sample-section" aria-labelledby="monitorSampleHeading">
                    <h3 id="monitorSampleHeading">Sample request</h3>
                    ${obscuredRequestDetails()}
                </section>
                <section class="monitor-section monitor-obscured-section" aria-labelledby="monitorClinicalHeading">
                    <h3 id="monitorClinicalHeading">Clinical details</h3>
                    ${obscuredRequestDetails()}
                </section>
                <section class="monitor-section monitor-obscured-section" aria-labelledby="monitorCollectionHeading">
                    <h3 id="monitorCollectionHeading">Collection</h3>
                    ${obscuredRequestDetails()}
                </section>
            </div>
        </div>
    `;
}

function mismatchNote() {
    return '<span class="mismatch-note"><span aria-hidden="true">!</span> Mismatch</span>';
}

function tubeLabelMarkup(sample) {
    const initials = sample.name
        .trim()
        .split(/\s+/)
        .map((namePart) => namePart.charAt(0))
        .join("")
        .toUpperCase();

    return `
        <span class="tube-label-copy">
            <span class="tube-label-initials" aria-hidden="true">${initials}</span>
            <span class="tube-label-details">
                <span data-sample-field="name"><b>${sample.name}</b>${mismatchNote()}</span>
                <span data-sample-field="mrn">${sample.id}${mismatchNote()}</span>
                <span data-sample-field="dob">${sample.dob}${mismatchNote()}</span>
            </span>
        </span>
    `;
}

function paperRow(label, value, field = "") {
    const attribute = field ? ` data-sample-field="${field}"` : "";
    return `<span class="paper-request-row"${attribute}><b>${label}</b><span>${value}${mismatchNote()}</span></span>`;
}

function paperRequestMarkup(sample) {
    return `
        <span class="paper-request-copy">
            <strong>Blood Transfusion Request</strong>
            <span class="paper-details-section paper-patient-details">
                <em>Patient details</em>
                ${paperRow("Name", sample.name, "name")}
                ${paperRow("MRN", sample.id, "mrn")}
                ${paperRow("DOB", sample.dob, "dob")}
                ${paperRow("Location", "Emergency Dept.")}
            </span>
            <span class="paper-details-section paper-sample-request">
                <em>Sample request</em>
                ${obscuredRequestDetails()}
            </span>
            <span class="paper-details-section paper-clinical-details">
                <em>Clinical details</em>
                ${obscuredRequestDetails()}
            </span>
            <span class="paper-details-section paper-collection-details">
                <em>Collection</em>
                ${obscuredRequestDetails()}
            </span>
        </span>
    `;
}

function sampleStationMarkup(sample, index) {
    const number = index + 1;
    const word = number === 1 ? "one" : "two";
    return `
        <article class="sample-station station-${number}" data-sample-station data-correct="${sample.correct}" data-mismatch-fields="${(sample.mismatchFields || []).join(",")}">
            <button class="station-inspect" type="button" aria-label="Select sample set ${word} to inspect details" aria-expanded="false">
                <span class="station-number">Sample set ${number}</span>
                <span class="tube-asset-wrap">
                    <img src="assets/screen-3/edta-tube.png" alt="Purple-top EDTA sample tube">
                    <span class="tube-label-overlay">${tubeLabelMarkup(sample)}</span>
                </span>
                <span class="paper-asset-wrap">
                    <span class="paper-scroll-content">
                        <img src="assets/screen-3/paper-request.png?v=3" alt="Paper blood-request form">
                        ${paperRequestMarkup(sample)}
                    </span>
                </span>
                <span class="inspect-prompt">Tap to inspect</span>
            </button>
            <div class="station-review-actions">
                <button class="select-sample-button primary-button" type="button" aria-label="Select sample set ${word} for analysis">Select this sample →</button>
                <button class="close-sample-button" type="button" aria-label="Close sample set ${word}">Compare other sample</button>
            </div>
        </article>
    `;
}

function renderSampleCheck() {
    beginTask();
    if (!state.sampleScenario) state.sampleScenario = createSampleScenario(state.patient, state.mode, state.missionStartedAt || new Date());
    const scenario = state.sampleScenario;

    screenHost.innerHTML = `
        <section class="screen sample-check-screen" aria-labelledby="sampleCheckTitle">
            <img class="sample-workbench-background" src="assets/screen-3/workbench-background.png" alt="">
            <div class="sample-check-heading">
                <h1 id="sampleCheckTitle" class="screen-title">First we check and confirm the sample details</h1>
                <p class="screen-instruction"><span class="wide-instruction">Compare the monitor request with both sample labels and request forms. Select the exact match.</span><span class="compact-instruction">Compare the monitor with both samples. Select the exact match.</span></p>
            </div>
            ${requestMonitorMarkup()}
            <div class="sample-stations" data-correct-side="${scenario.correctSide}">
                ${scenario.samples.map((sample, index) => sampleStationMarkup(sample, index)).join("")}
            </div>
            <p class="sample-check-live" aria-live="polite"></p>
        </section>
    `;

    const clue = state.mode === "challenge"
        ? "Inspect each complete set carefully—one small identifier difference means it cannot be used."
        : "The name, MRN and date of birth must match on the monitor, tube and paper request.";
    setGuide(clue);

    document.querySelectorAll(".station-inspect").forEach((button) => {
        button.addEventListener("click", () => {
            const station = button.closest(".sample-station");
            if (!station.classList.contains("expanded")) openSampleStation(station);
        });
    });
    document.querySelectorAll(".close-sample-button").forEach((button) => {
        button.addEventListener("click", () => closeSampleStation(button.closest(".sample-station")));
    });
    document.querySelectorAll(".select-sample-button").forEach((button) => {
        button.addEventListener("click", () => chooseSample(button.closest(".sample-station")));
    });
}

function openSampleStation(station) {
    document.querySelectorAll(".sample-station.expanded").forEach((item) => closeSampleStation(item));
    station.classList.add("expanded");
    station.querySelector(".station-inspect").setAttribute("aria-expanded", "true");
    document.querySelector(".sample-check-screen").classList.add("reviewing-sample");
    station.querySelector(".select-sample-button").focus();
}

function closeSampleStation(station) {
    station.classList.remove("expanded");
    station.querySelector(".station-inspect").setAttribute("aria-expanded", "false");
    if (!document.querySelector(".sample-station.expanded")) document.querySelector(".sample-check-screen")?.classList.remove("reviewing-sample");
    station.querySelector(".station-inspect").focus();
}

function clearSampleMismatchHighlights() {
    document.querySelectorAll(".sample-field-mismatch, .reference-field-mismatch").forEach((field) => {
        field.classList.remove("sample-field-mismatch", "reference-field-mismatch");
    });
}

function chooseSample(station) {
    if (station.dataset.correct !== "true") {
        state.firstAttempt = false;
        clearSampleMismatchHighlights();
        const fields = station.dataset.mismatchFields.split(",").filter(Boolean);
        fields.forEach((field) => {
            station.querySelectorAll(`[data-sample-field="${field}"]`).forEach((item) => item.classList.add("sample-field-mismatch"));
            document.querySelector(`[data-reference-field="${field}"]`)?.classList.add("reference-field-mismatch");
        });
        const messages = {
            name: "Check the patient name. It does not match the request.",
            mrn: "Check the MRN. One or more digits do not match the request.",
            dob: "Check the date of birth. It does not match the request."
        };
        const message = fields.length > 1
            ? "Check the patient details. The name, MRN and date of birth do not match the request."
            : messages[fields[0]];
        document.querySelector(".sample-check-live").textContent = message;
        showFeedback({ correct: false, title: "Sample details do not match", message, button: "Check again" });
        return;
    }

    markFirstTry();
    clearSampleMismatchHighlights();
    station.classList.add("sample-correct");
    document.querySelector(".sample-check-live").textContent = "Correct sample selected.";
    showFeedback({
        correct: true,
        title: "Identity confirmed",
        message: "Correct — the patient name, MRN and date of birth match the blood request.",
        action: () => moveTo(4)
    });
}

const BLOOD_GROUPS = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"];
const GROUPING_REAGENTS = [
    { id: "a", bottle: "Anti-A", well: "A", asset: "reagent-anti-a.png" },
    { id: "b", bottle: "Anti-B", well: "B", asset: "reagent-anti-b.png" },
    { id: "d", bottle: "Anti-D", well: "RhD", asset: "reagent-anti-d.png" },
    { id: "control", bottle: "Control", well: "Control", asset: "reagent-control.png" }
];
const REACTION_PATTERNS = {
    "A+":  { a: true,  b: false, d: true,  control: false },
    "A−":  { a: true,  b: false, d: false, control: false },
    "B+":  { a: false, b: true,  d: true,  control: false },
    "B−":  { a: false, b: true,  d: false, control: false },
    "AB+": { a: true,  b: true,  d: true,  control: false },
    "AB−": { a: true,  b: true,  d: false, control: false },
    "O+":  { a: false, b: false, d: true,  control: false },
    "O−":  { a: false, b: false, d: false, control: false }
};

function createGroupingWells(group) {
    return Object.fromEntries(GROUPING_REAGENTS.map(({ id }) => [id, {
        reagent: false,
        blood: false,
        mixed: false,
        reaction: REACTION_PATTERNS[group][id] ? "reaction" : "no-reaction",
        complete: false
    }]));
}

function groupingReagent(id) {
    return GROUPING_REAGENTS.find((item) => item.id === id);
}

function motionDelay(milliseconds) {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 10 : milliseconds;
}

function groupingWellMarkup(reagent) {
    const well = state.groupingWells[reagent.id];
    return `
        <button class="typing-well well-${reagent.id}" type="button" data-grouping-well="${reagent.id}"
                aria-label="${reagent.well} well. Empty.">
            <span class="typing-well-label">${reagent.well}</span>
            <span class="well-liquid" aria-hidden="true">
                <span class="deposited-reagent"></span>
                <span class="deposited-blood"></span>
                <img class="well-reaction-image" src="assets/screen-4/${well.reaction === "reaction" ? "reaction-agglutinated.png" : "reaction-smooth.png"}" alt="" draggable="false" hidden>
            </span>
            <span class="well-result-text" hidden>${well.reaction === "reaction" ? "Reaction" : "No reaction"}</span>
            <span class="target-cue" aria-hidden="true">Target</span>
        </button>
    `;
}

function interpretationTableMarkup() {
    return BLOOD_GROUPS.map((group) => {
        const pattern = REACTION_PATTERNS[group];
        const cell = (id) => pattern[id] ? "Reaction" : "No reaction";
        return `<tr><th scope="row">${group}</th><td>${cell("a")}</td><td>${cell("b")}</td><td>${cell("d")}</td><td>No reaction</td></tr>`;
    }).join("");
}

function renderGroupingSetup() {
    if (!state.groupingWells) state.groupingWells = createGroupingWells(state.bloodGroup);
    if (!state.groupingTaskCounted) {
        beginTask();
        state.groupingTaskCounted = true;
    }

    screenHost.innerHTML = `
        <section class="screen grouping-workbench-screen" aria-labelledby="groupingTitle">
            <img class="grouping-room" src="assets/screen-4/workbench-background.png" alt="">
            <div class="grouping-heading">
                <h1 id="groupingTitle" class="screen-title">Test Nicky's red cells</h1>
                <p class="screen-instruction">Add each reagent and a drop of Nicky's blood to the matching well. Mix each well with a clean stick and observe the reaction.</p>
                <p class="grouping-science-note">A reaction means that the matching antigen is present on Nicky's red blood cells.</p>
            </div>

            <div class="grouping-scene">
                <button class="sample-tube-target" type="button" data-grouping-target="tube" aria-label="Nicky's EDTA blood sample">
                    <img src="assets/screen-3/edta-tube.png" alt="Purple-top EDTA blood tube" draggable="false">
                    <span class="grouping-tube-name">${state.patient.name}</span>
                    <span class="target-cue" aria-hidden="true">Collect here</span>
                </button>

                <button class="grouping-tool pipette-tool" type="button" data-grouping-tool="pipette" aria-label="${state.pipetteLoaded ? "Loaded blood pipette" : "Empty pipette"}">
                    <img src="assets/screen-4/${state.pipetteLoaded ? "pipette-loaded.png" : "pipette-empty.png"}" alt="" draggable="false">
                    <span>${state.pipetteLoaded ? "Blood pipette" : "Empty pipette"}</span>
                </button>

                <div class="reagent-rack" aria-label="Blood grouping reagents">
                    ${GROUPING_REAGENTS.map((reagent) => `
                        <button class="grouping-tool reagent-bottle reagent-${reagent.id}" type="button"
                                data-grouping-tool="reagent" data-tool-id="${reagent.id}" aria-label="${reagent.bottle} reagent bottle">
                            <img src="assets/screen-4/${reagent.asset}" alt="${reagent.bottle}" draggable="false">
                            <span class="tool-status"></span>
                        </button>
                    `).join("")}
                </div>

                <div class="typing-tile" data-typing-tile>
                    <img src="assets/screen-4/typing-tile.png" alt="Four-well blood typing tile" draggable="false">
                    <span class="typing-tile-name">${state.patient.name}</span>
                    ${GROUPING_REAGENTS.map(groupingWellMarkup).join("")}
                </div>

                <button class="grouping-tool stick-supply" type="button" data-grouping-tool="stick" aria-label="Take a clean mixing stick">
                    <img src="assets/screen-4/mixing-stick.png" alt="Clean mixing stick" draggable="false">
                    <span>Clean sticks</span>
                </button>
                <div class="used-stick-bin" aria-label="Used-stick container">
                    <img src="assets/screen-4/used-stick-container.png" alt="Used-stick container" draggable="false">
                    <span><b data-used-stick-count>${state.usedStickCount}</b> used</span>
                </div>

                <button class="grouping-help-button" type="button" aria-label="Open blood-group reaction guide">?</button>
                <div class="grouping-pattern-help hidden" role="dialog" aria-modal="false" aria-labelledby="patternHelpTitle">
                    <div class="pattern-help-card">
                        <button class="pattern-help-close" type="button" aria-label="Close reaction guide">×</button>
                        <h2 id="patternHelpTitle">Blood-group reaction guide</h2>
                        <div class="pattern-table-wrap">
                            <table><thead><tr><th>Group</th><th>A</th><th>B</th><th>RhD</th><th>Control</th></tr></thead><tbody>${interpretationTableMarkup()}</tbody></table>
                        </div>
                    </div>
                </div>

                <div class="grouping-interpretation" hidden>
                    <p><strong>Based on the reaction pattern, what is Nicky's blood group?</strong></p>
                    <div class="group-answer-grid">
                        ${shuffle(BLOOD_GROUPS).map((group) => `<button class="group-answer" type="button" data-group-answer="${group}">${group}</button>`).join("")}
                    </div>
                </div>
                <p class="grouping-live" aria-live="polite"></p>
            </div>
        </section>
    `;

    document.querySelectorAll("[data-grouping-tool]").forEach((button) => {
        button.addEventListener("click", () => selectGroupingTool(button));
        installGroupingDrag(button);
    });
    document.querySelector("[data-grouping-target='tube']").addEventListener("click", (event) => useGroupingToolOnTarget(event.currentTarget));
    document.querySelectorAll("[data-grouping-well]").forEach((button) => button.addEventListener("click", () => useGroupingToolOnTarget(button)));
    document.querySelectorAll("[data-group-answer]").forEach((button) => button.addEventListener("click", () => chooseGroup(button)));
    document.querySelector(".grouping-help-button").addEventListener("click", openGroupingHelp);
    document.querySelector(".pattern-help-close").addEventListener("click", closeGroupingHelp);
    updateGroupingScene();
}

function selectGroupingTool(button) {
    if (performance.now() < state.suppressGroupingClickUntil || state.groupingBusy || button.disabled) return;
    const kind = button.dataset.groupingTool;
    const id = button.dataset.toolId || "";
    state.groupingTool = { kind, id };
    updateGroupingScene();

    if (kind === "reagent") setGuide(`${groupingReagent(id).bottle} selected. Add it to the ${groupingReagent(id).well} well.`);
    if (kind === "pipette") setGuide(state.pipetteLoaded ? "Blood pipette selected. Add one drop to an unfinished well." : "Empty pipette selected. Collect blood from Nicky's tube.");
    if (kind === "stick") setGuide("Clean stick selected. Choose a well containing both reagent and blood.");
}

function useGroupingToolOnTarget(target) {
    if (!state.groupingTool || state.groupingBusy) return;
    applyGroupingDrop(state.groupingTool, target);
}

async function applyGroupingDrop(tool, target) {
    const wellId = target.dataset.groupingWell;
    if (target.dataset.groupingTarget === "tube") {
        if (tool.kind !== "pipette" || state.pipetteLoaded) return;
        await collectBloodWithPipette();
        return;
    }
    if (!wellId) return;
    if (tool.kind === "reagent") await dispenseReagent(tool.id, wellId);
    if (tool.kind === "pipette") await dispenseBlood(wellId);
    if (tool.kind === "stick") await mixGroupingWell(wellId);
}

async function collectBloodWithPipette() {
    state.groupingBusy = true;
    const pipette = document.querySelector(".pipette-tool");
    const tube = document.querySelector(".sample-tube-target");
    pipette.classList.add("collecting");
    tube.classList.add("receiving-tool");
    await new Promise((resolve) => window.setTimeout(resolve, motionDelay(420)));
    state.pipetteLoaded = true;
    state.groupingTool = null;
    state.groupingBusy = false;
    pipette.classList.remove("collecting");
    tube.classList.remove("receiving-tool");
    pipette.querySelector("img").src = "assets/screen-4/pipette-loaded.png";
    pipette.setAttribute("aria-label", "Loaded blood pipette");
    pipette.querySelector("span").textContent = "Blood pipette";
    setGuide("Pipette loaded. Add one drop of Nicky's blood to each well.");
    updateGroupingScene();
}

async function dispenseReagent(reagentId, wellId) {
    const reagent = groupingReagent(reagentId);
    const well = state.groupingWells[wellId];
    if (reagentId !== wellId) {
        state.firstAttempt = false;
        const properWell = document.querySelector(`[data-grouping-well="${reagentId}"]`);
        properWell.classList.add("proper-target");
        window.setTimeout(() => properWell.classList.remove("proper-target"), motionDelay(900));
        showFeedback({ correct: false, title: "Check the labels", message: `${reagent.bottle} belongs in the ${reagent.well} well. Check the bottle and well labels.`, button: "Try again" });
        return;
    }
    if (well.reagent || well.complete) return;
    state.groupingBusy = true;
    const wellButton = document.querySelector(`[data-grouping-well="${wellId}"]`);
    const bottle = document.querySelector(`[data-grouping-tool="reagent"][data-tool-id="${reagentId}"]`);
    bottle.classList.add("pouring");
    wellButton.classList.add("receiving-drop");
    await new Promise((resolve) => window.setTimeout(resolve, motionDelay(360)));
    well.reagent = true;
    state.groupingTool = null;
    state.groupingBusy = false;
    bottle.classList.remove("pouring");
    wellButton.classList.remove("receiving-drop");
    playTone("success");
    updateGroupingScene();
}

async function dispenseBlood(wellId) {
    const well = state.groupingWells[wellId];
    if (!state.pipetteLoaded) {
        setGuide("Collect Nicky's blood with the pipette first.");
        return;
    }
    if (well.blood || well.complete) return;
    state.groupingBusy = true;
    const wellButton = document.querySelector(`[data-grouping-well="${wellId}"]`);
    const pipette = document.querySelector(".pipette-tool");
    pipette.classList.add("dispensing");
    wellButton.classList.add("receiving-blood");
    await new Promise((resolve) => window.setTimeout(resolve, motionDelay(320)));
    well.blood = true;
    state.groupingTool = null;
    state.groupingBusy = false;
    pipette.classList.remove("dispensing");
    wellButton.classList.remove("receiving-blood");
    playTone("success");
    updateGroupingScene();
}

async function mixGroupingWell(wellId) {
    const well = state.groupingWells[wellId];
    if (well.complete) return;
    if (!well.reagent || !well.blood) {
        showFeedback({ correct: false, title: "The well is not ready", message: "Add the reagent and Nicky's blood before mixing this well.", button: "Continue testing" });
        return;
    }
    state.groupingBusy = true;
    const wellButton = document.querySelector(`[data-grouping-well="${wellId}"]`);
    const stick = document.querySelector(".stick-supply");
    stick.classList.add("stirring");
    wellButton.classList.add("stirring-well");
    await new Promise((resolve) => window.setTimeout(resolve, motionDelay(480)));
    well.mixed = true;
    well.complete = true;
    state.usedStickCount += 1;
    state.groupingTool = null;
    state.groupingBusy = false;
    stick.classList.remove("stirring");
    wellButton.classList.remove("stirring-well");
    document.querySelector(".used-stick-bin").classList.add("receiving-stick");
    window.setTimeout(() => document.querySelector(".used-stick-bin")?.classList.remove("receiving-stick"), motionDelay(420));
    playTone("success");
    updateGroupingScene();
}

function updateGroupingScene() {
    if (!document.querySelector(".grouping-workbench-screen")) return;
    document.querySelectorAll(".junior-guide-target").forEach((item) => item.classList.remove("junior-guide-target"));
    GROUPING_REAGENTS.forEach((reagent) => {
        const well = state.groupingWells[reagent.id];
        const wellButton = document.querySelector(`[data-grouping-well="${reagent.id}"]`);
        const bottle = document.querySelector(`[data-grouping-tool="reagent"][data-tool-id="${reagent.id}"]`);
        wellButton.classList.toggle("has-reagent", well.reagent);
        wellButton.classList.toggle("has-blood", well.blood);
        wellButton.classList.toggle("complete", well.complete);
        wellButton.querySelector(".well-reaction-image").hidden = !well.mixed;
        wellButton.setAttribute("aria-label", `${reagent.well} well. ${well.reagent ? "Reagent added. " : ""}${well.blood ? "Blood added. " : ""}${well.complete ? (well.reaction === "reaction" ? "Reaction." : "No reaction.") : "Not mixed."}`);
        bottle.disabled = well.reagent;
        bottle.classList.toggle("used", well.reagent);
    });

    document.querySelectorAll("[data-grouping-tool]").forEach((button) => {
        const matches = state.groupingTool
            && button.dataset.groupingTool === state.groupingTool.kind
            && (button.dataset.toolId || "") === state.groupingTool.id;
        button.classList.toggle("selected", Boolean(matches));
        button.setAttribute("aria-pressed", String(Boolean(matches)));
    });
    document.querySelector("[data-used-stick-count]").textContent = state.usedStickCount;

    const allComplete = GROUPING_REAGENTS.every(({ id }) => state.groupingWells[id].complete);
    document.querySelectorAll(".well-result-text").forEach((label) => { label.hidden = !allComplete; });
    document.querySelector(".grouping-interpretation").hidden = !allComplete;
    if (allComplete) setGuide("Compare the A, B and RhD reactions, then choose Nicky's blood group. The smooth control shows the test worked correctly.");
    else updateJuniorGroupingGuidance();
}

function updateJuniorGroupingGuidance() {
    if (state.mode !== "junior") {
        setGuide("Prepare each well with its matching reagent and Nicky's blood, then mix it with a fresh stick.");
        return;
    }

    if (state.groupingTool) {
        if (state.groupingTool.kind === "reagent") document.querySelector(`[data-grouping-well="${state.groupingTool.id}"]`)?.classList.add("junior-guide-target");
        if (state.groupingTool.kind === "pipette" && !state.pipetteLoaded) document.querySelector(".sample-tube-target")?.classList.add("junior-guide-target");
        if (state.groupingTool.kind === "pipette" && state.pipetteLoaded) document.querySelectorAll("[data-grouping-well]").forEach((item) => { if (!state.groupingWells[item.dataset.groupingWell].blood) item.classList.add("junior-guide-target"); });
        if (state.groupingTool.kind === "stick") document.querySelectorAll("[data-grouping-well]").forEach((item) => { const well = state.groupingWells[item.dataset.groupingWell]; if (well.reagent && well.blood && !well.complete) item.classList.add("junior-guide-target"); });
        return;
    }

    if (!state.pipetteLoaded) {
        document.querySelector(".pipette-tool")?.classList.add("junior-guide-target");
        document.querySelector(".sample-tube-target")?.classList.add("junior-guide-target");
        setGuide("Collect Nicky's blood with the pipette.");
        return;
    }

    const next = GROUPING_REAGENTS.find(({ id }) => !state.groupingWells[id].complete);
    if (!next) return;
    const well = state.groupingWells[next.id];
    if (!well.reagent) {
        document.querySelector(`[data-grouping-tool="reagent"][data-tool-id="${next.id}"]`)?.classList.add("junior-guide-target");
        setGuide(`Add ${next.bottle} to the ${next.well} well.`);
    } else if (!well.blood) {
        document.querySelector(".pipette-tool")?.classList.add("junior-guide-target");
        setGuide("Add one drop of Nicky's blood.");
    } else {
        document.querySelector(".stick-supply")?.classList.add("junior-guide-target");
        document.querySelector(`[data-grouping-well="${next.id}"]`)?.classList.add("junior-guide-target");
        setGuide("Use a clean stick to mix the well.");
    }
}

function installGroupingDrag(button) {
    button.addEventListener("pointerdown", (event) => {
        if (button.disabled || state.groupingBusy || (event.pointerType === "mouse" && event.button !== 0)) return;
        const origin = button.getBoundingClientRect();
        const start = { x: event.clientX, y: event.clientY };
        let dragging = false;
        let hoverTarget = null;
        button.setPointerCapture(event.pointerId);

        const clearHover = () => {
            hoverTarget?.classList.remove("drag-over");
            hoverTarget = null;
        };
        const move = (moveEvent) => {
            if (!dragging && Math.hypot(moveEvent.clientX - start.x, moveEvent.clientY - start.y) < 6) return;
            if (!dragging) {
                dragging = true;
                button.classList.add("dragging");
                document.body.classList.add("grouping-drag-active");
                Object.assign(button.style, { position: "fixed", width: `${origin.width}px`, height: `${origin.height}px`, margin: "0", zIndex: "1000", pointerEvents: "none" });
            }
            moveEvent.preventDefault();
            button.style.left = `${moveEvent.clientX - origin.width / 2}px`;
            button.style.top = `${moveEvent.clientY - origin.height / 2}px`;
            const found = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY)?.closest("[data-grouping-well], [data-grouping-target='tube']");
            if (found !== hoverTarget) {
                clearHover();
                hoverTarget = found;
                hoverTarget?.classList.add("drag-over");
            }
            button.classList.toggle("over-well", Boolean(found?.dataset.groupingWell));
        };
        const finish = (finishEvent, cancelled = false) => {
            button.removeEventListener("pointermove", move);
            button.removeEventListener("pointerup", up);
            button.removeEventListener("pointercancel", cancel);
            const target = hoverTarget;
            clearHover();
            if (!dragging) return;
            finishEvent.preventDefault();
            state.suppressGroupingClickUntil = performance.now() + 350;
            button.classList.remove("dragging", "over-well");
            button.classList.add("returning");
            document.body.classList.remove("grouping-drag-active");
            button.style.left = `${origin.left}px`;
            button.style.top = `${origin.top}px`;
            window.setTimeout(() => {
                button.classList.remove("returning");
                button.removeAttribute("style");
                if (!cancelled && target) {
                    const tool = { kind: button.dataset.groupingTool, id: button.dataset.toolId || "" };
                    state.groupingTool = tool;
                    applyGroupingDrop(tool, target);
                }
            }, motionDelay(180));
        };
        const up = (upEvent) => finish(upEvent, false);
        const cancel = (cancelEvent) => finish(cancelEvent, true);
        button.addEventListener("pointermove", move);
        button.addEventListener("pointerup", up);
        button.addEventListener("pointercancel", cancel);
    });
}

function openGroupingHelp() {
    document.querySelector(".grouping-pattern-help").classList.remove("hidden");
    document.querySelector(".pattern-help-close").focus();
}

function closeGroupingHelp() {
    document.querySelector(".grouping-pattern-help").classList.add("hidden");
    document.querySelector(".grouping-help-button").focus();
}

function bloodGroupName(group) {
    return `${group.replace(/[+−]/, "")} ${group.endsWith("+") ? "positive" : "negative"}`;
}

function interpretationConflictMessage(id, actualReaction) {
    const reagent = groupingReagent(id);
    if (id === "d") return actualReaction
        ? "Look again at the RhD well. It reacted, showing that Nicky is RhD positive."
        : "Look again at the RhD well. It did not react, showing that Nicky is RhD negative.";
    return actualReaction
        ? `Look again at the ${reagent.well} well. It reacted, showing that the ${reagent.well} antigen is present.`
        : `Look again at the ${reagent.well} well. There was no reaction, so the ${reagent.well} antigen was not detected.`;
}

function correctGroupingMessage() {
    const pattern = REACTION_PATTERNS[state.bloodGroup];
    const reacted = [pattern.a && "A", pattern.b && "B", pattern.d && "RhD"].filter(Boolean);
    const reactionText = reacted.length
        ? `${reacted.join(reacted.length > 1 ? ", " : "")} ${reacted.length === 1 ? "well reacted" : "wells reacted"}`
        : "the A, B and RhD wells showed no reaction";
    return `Correct — ${reactionText}. Nicky's blood group is ${bloodGroupName(state.bloodGroup)}. The control did not react, confirming that the test behaved as expected.`;
}

function chooseGroup(button) {
    document.querySelectorAll(".interpretation-conflict").forEach((well) => well.classList.remove("interpretation-conflict"));
    document.querySelectorAll(".group-answer.wrong").forEach((answer) => answer.classList.remove("wrong"));
    const selected = button.dataset.groupAnswer;
    if (selected !== state.bloodGroup) {
        state.firstAttempt = false;
        state.interpretationAttempts += 1;
        button.classList.add("wrong");
        const expected = REACTION_PATTERNS[selected];
        const actual = REACTION_PATTERNS[state.bloodGroup];
        const conflicts = ["a", "b", "d"].filter((id) => expected[id] !== actual[id]);
        const shown = state.interpretationAttempts === 1 ? conflicts.slice(0, 1) : conflicts;
        shown.forEach((id) => document.querySelector(`[data-grouping-well="${id}"]`)?.classList.add("interpretation-conflict"));
        const message = interpretationConflictMessage(shown[0], actual[shown[0]]);
        document.querySelector(".grouping-live").textContent = message;
        showFeedback({ correct: false, title: "Read the reaction pattern again", message, button: "Try another group" });
        return;
    }

    markFirstTry();
    button.classList.add("correct");
    document.querySelector("[data-typing-tile]").classList.add("typing-success");
    document.querySelector(".grouping-live").textContent = correctGroupingMessage();
    showFeedback({
        correct: true,
        title: `${state.patient.name} is ${bloodGroupName(state.bloodGroup)}`,
        message: correctGroupingMessage(),
        action: () => moveTo(5)
    });
}

function renderCompatibility() {
    beginTask();
    const requestedUnit = state.bloodGroup;
    const units = shuffle([requestedUnit, ...shuffle(BLOOD_GROUPS.filter((group) => group !== requestedUnit)).slice(0, 3)]);
    screenHost.innerHTML = `
        <section class="screen">
            <h1 class="screen-title">Issue the planned red-cell unit</h1>
            <p class="screen-instruction">${state.patient.name} is ${bloodGroupName(state.bloodGroup)}. Select the labelled group-identical unit requested for issue.</p>
            <div class="task-layout" style="--columns:4">
                ${units.map((type) => `
                    <button class="choice-card blood-choice" type="button" data-unit="${type}">
                        <span class="blood-bag" aria-hidden="true"><span class="blood-type">${type}</span></span>
                        <strong>${type === requestedUnit ? "Requested unit" : "Available unit"}</strong>
                    </button>
                `).join("")}
            </div>
        </section>
    `;

    setGuide(state.mode === "challenge" ? "Confirm both ABO and RhD before issue." : `Match the unit label to ${state.patient.name}'s ${state.bloodGroup} result.`);
    document.querySelectorAll("[data-unit]").forEach((button) => button.addEventListener("click", () => chooseCompatibleUnit(button)));
}

function chooseCompatibleUnit(button) {
    if (button.dataset.unit !== state.bloodGroup) {
        state.firstAttempt = false;
        button.classList.add("wrong");
        showFeedback({ correct: false, title: "Check the issue request", message: `The requested unit is ${state.bloodGroup}. Match both the ABO and RhD label.`, button: "Try again" });
        return;
    }

    markFirstTry();
    button.classList.add("correct");
    showFeedback({
        correct: true,
        title: "Safe unit selected",
        message: `${state.bloodGroup} red cells are group-identical for ${state.patient.name}. The unit can be issued safely.`,
        action: () => moveTo(6)
    });
}

function saveCompletion() {
    let progress = { completedCases: {} };
    try {
        progress = JSON.parse(localStorage.getItem(STORAGE_KEY)) || progress;
    } catch (error) {
        console.info("Starting a new SiTC progress record.", error);
    }

    if (!progress.completedCases) progress.completedCases = {};
    if (!Array.isArray(progress.completedCases[LAB_ID])) progress.completedCases[LAB_ID] = [];
    if (!progress.completedCases[LAB_ID].includes(CASE_ID)) progress.completedCases[LAB_ID].push(CASE_ID);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function renderCompletion() {
    saveCompletion();
    const confettiColors = ["#db334e", "#43c6e5", "#ffc83d", "#28a76f"];
    const confetti = Array.from({ length: 24 }, (_, index) => {
        const left = (index * 13 + Math.random() * 8) % 100;
        const delay = Math.random() * 2.8;
        return `<i style="left:${left}%;animation-delay:${delay}s;background:${confettiColors[index % confettiColors.length]}"></i>`;
    }).join("");

    screenHost.innerHTML = `
        <section class="screen completion-screen">
            <div class="confetti" aria-hidden="true">${confetti}</div>
            <div class="badge-reveal" aria-label="Transfusion Laboratory badge">🩸</div>
            <h1>Transfusion Badge Earned!</h1>
            <p>You identified ${state.patient.name}'s ${bloodGroupName(state.bloodGroup)} group and issued compatible red cells.</p>
            <div class="completion-actions">
                <button id="playAgainButton" class="primary-button" type="button">Play a new version</button>
                <a class="secondary-button" href="../">Return to Transfusion Lab</a>
            </div>
        </section>
    `;

    setGuide(`Mission complete. You solved ${state.firstTryWins} of ${state.taskCount} decision tasks on your first try—and earned the badge either way.`);
    document.getElementById("playAgainButton").addEventListener("click", () => {
        state.mode = null;
        state.step = 1;
        updateChrome();
        renderStart();
    });
    playTone("success");
}

function renderCurrentScreen() {
    nextButton.classList.add("hidden");
    const renderers = {
        1: renderStart,
        2: renderBloodChoice,
        3: renderSampleCheck,
        4: renderGroupingSetup,
        5: renderCompatibility,
        6: renderCompletion
    };
    renderers[state.step]();
}

feedbackButton.addEventListener("click", closeFeedback);

soundButton.addEventListener("click", () => {
    state.soundOn = !state.soundOn;
    soundButton.textContent = state.soundOn ? "🔊" : "🔇";
    soundButton.setAttribute("aria-pressed", String(state.soundOn));
    soundButton.setAttribute("aria-label", state.soundOn ? "Turn sound off" : "Turn sound on");
    if (state.soundOn) playTone("success");
});

fullscreenButton.addEventListener("click", attemptFullscreen);

updateChrome();
renderStart();


