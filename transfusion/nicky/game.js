/*
   NICKY'S BLOOD BANK RESCUE

   The mission deliberately varies labels, answer positions and short dialogue on every run.
   Nicky's AB-positive result and the safe A-positive issue decision stay scientifically fixed.
*/

const STORAGE_KEY = "sitcGameProgressV2";
const LAB_ID = "transfusion";
const CASE_ID = "nicky";
const TOTAL_STEPS = 8;

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
    { name: "Nicky Borg", id: "MRN 428731", dob: "14/06/2017" },
    { name: "Nicky Galea", id: "MRN 615204", dob: "22/09/2016" },
    { name: "Nicky Vella", id: "MRN 307518", dob: "03/12/2017" },
    { name: "Nicky Camilleri", id: "MRN 842963", dob: "28/02/2016" }
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
    placedReagents: new Set(),
    mixedWells: new Set(),
    selectedReagent: null,
    selectedBloodPack: null,
    bloodChoiceBusy: false,
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
            <div class="start-visual">
                <img src="assets/nicky-emergency.png" alt="Nicky in a hospital bed with two friendly healthcare professionals preparing a transfusion">
                <span class="monitor-pulse" aria-hidden="true"></span>
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
    state.patient = randomItem(patientVariants);
    state.firstTryWins = 0;
    state.taskCount = 0;
    state.placedReagents = new Set();
    state.mixedWells = new Set();
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

function changeOneDigit(id) {
    const digits = id.split("");
    const indexes = digits.map((character, index) => (/\d/.test(character) ? index : -1)).filter((index) => index >= 0);
    const position = randomItem(indexes);
    digits[position] = String((Number(digits[position]) + randomItem([1, 2, 7])) % 10);
    return digits.join("");
}

function buildWrongSample(patient) {
    if (state.mode === "challenge") {
        const subtleVariants = [
            { ...patient, id: changeOneDigit(patient.id), mismatch: "one-digit patient number difference" },
            { ...patient, name: patient.name.replace("Nicky", "Nicki"), mismatch: "small spelling difference" },
            { ...patient, dob: patient.dob.replace(/^(\d{2})\/(\d{2})/, "$2/$1"), mismatch: "date digits in a different order" }
        ];
        return randomItem(subtleVariants);
    }

    const other = randomItem(patientVariants.filter((candidate) => candidate.name !== patient.name));
    return { ...other, mismatch: "different patient details", obvious: true };
}

function labelMarkup(sample) {
    return `
        <span class="label-table">
            <span class="label-row"><strong>Name</strong><span>${sample.name}</span></span>
            <span class="label-row"><strong>Patient no.</strong><span>${sample.id}</span></span>
            <span class="label-row"><strong>Date of birth</strong><span>${sample.dob}</span></span>
        </span>
    `;
}

function renderSampleCheck() {
    beginTask();
    const correct = { ...state.patient, correct: true };
    const wrong = { ...buildWrongSample(state.patient), correct: false };
    const samples = shuffle([correct, wrong]);

    screenHost.innerHTML = `
        <section class="screen">
            <h1 class="screen-title">Stop and check the sample</h1>
            <p class="screen-instruction">Compare both sample labels with Nicky's request. Select the exact match.</p>
            <div class="task-layout" style="--columns:3">
                <article class="request-card">
                    <h3>Nicky's request</h3>
                    ${labelMarkup(state.patient)}
                </article>
                ${samples.map((sample, index) => `
                    <button class="sample-card ${sample.obvious ? "obvious-wrong" : ""}" type="button" data-sample="${sample.correct}" data-mismatch="${sample.mismatch || ""}">
                        <strong>Sample ${index + 1}</strong>
                        ${labelMarkup(sample)}
                    </button>
                `).join("")}
            </div>
        </section>
    `;

    const clue = state.mode === "challenge"
        ? "Check every character—one small difference means the sample must not be used."
        : "Names, patient numbers and dates of birth must all match.";
    setGuide(clue);
    document.querySelectorAll("[data-sample]").forEach((button) => {
        button.addEventListener("click", () => chooseSample(button));
    });
}

function chooseSample(button) {
    if (button.dataset.sample !== "true") {
        state.firstAttempt = false;
        button.classList.add("wrong");
        const detail = state.mode === "challenge" ? `The labels have a ${button.dataset.mismatch}.` : "This sample belongs to a different patient.";
        showFeedback({ correct: false, title: "Labels do not match", message: `${detail} Check all three identifiers again.`, button: "Check again" });
        return;
    }

    markFirstTry();
    button.classList.add("correct");
    showFeedback({
        correct: true,
        title: "Identity confirmed",
        message: "The sample exactly matches Nicky's request. It is safe to begin blood grouping.",
        action: () => moveTo(4)
    });
}

const reagents = [
    { id: "a", label: "Anti-A", color: "#62aee8", text: "A" },
    { id: "b", label: "Anti-B", color: "#f2d34e", text: "B" },
    { id: "d", label: "Anti-D", color: "#e7eef2", text: "D" },
    { id: "control", label: "Control", color: "#f4f7f9", text: "C" }
];

function renderGroupingSetup() {
    state.placedReagents = new Set();
    state.selectedReagent = null;
    screenHost.innerHTML = `
        <section class="screen">
            <h1 class="screen-title">Set up Nicky's blood group</h1>
            <p class="screen-instruction">Tap a reagent, then tap its matching labelled well.</p>
            <div class="lab-bench">
                <div class="reagent-tray">
                    ${shuffle(reagents).map((reagent) => `
                        <button class="reagent" type="button" data-reagent="${reagent.id}">
                            <span class="reagent-drop" style="background:${reagent.color}" aria-hidden="true"><span>${reagent.text}</span></span>
                            ${reagent.label}
                        </button>
                    `).join("")}
                </div>
                <div class="well-grid">
                    ${reagents.map((reagent) => `
                        <button class="well-station" type="button" data-target="${reagent.id}">
                            <span class="well empty" aria-hidden="true"></span>
                            <span class="well-label">${reagent.label}</span>
                        </button>
                    `).join("")}
                </div>
            </div>
        </section>
    `;

    setGuide("Anti-A, Anti-B and Anti-D test for blood-group markers. The control checks that the test behaves properly.");
    document.querySelectorAll("[data-reagent]").forEach((button) => button.addEventListener("click", () => selectReagent(button)));
    document.querySelectorAll("[data-target]").forEach((button) => button.addEventListener("click", () => placeReagent(button)));
}

function selectReagent(button) {
    if (button.classList.contains("used")) return;
    state.selectedReagent = button.dataset.reagent;
    document.querySelectorAll("[data-reagent]").forEach((item) => item.style.borderColor = "");
    button.style.borderColor = "#ffc83d";
    setGuide(`Now tap the ${reagents.find((item) => item.id === state.selectedReagent).label} well.`);
}

function placeReagent(button) {
    if (!state.selectedReagent || state.placedReagents.has(button.dataset.target)) return;

    if (button.dataset.target !== state.selectedReagent) {
        playTone("try");
        button.classList.add("wrong");
        setTimeout(() => button.classList.remove("wrong"), 350);
        setGuide("That label does not match the selected reagent. Try the same reagent again.");
        return;
    }

    const reagent = reagents.find((item) => item.id === state.selectedReagent);
    state.placedReagents.add(reagent.id);
    button.querySelector(".well").classList.remove("empty");
    button.querySelector(".well").classList.add("ready");
    document.querySelector(`[data-reagent="${reagent.id}"]`).classList.add("used");
    state.selectedReagent = null;
    playTone("success");

    if (state.placedReagents.size === reagents.length) {
        showFeedback({
            correct: true,
            title: "Grouping tray ready",
            message: "All four wells contain the correct reagent and Nicky's red cells.",
            action: () => moveTo(5)
        });
    } else {
        setGuide(`${reagents.length - state.placedReagents.size} reagent${reagents.length - state.placedReagents.size === 1 ? "" : "s"} still to place.`);
    }
}

function renderMixing() {
    state.mixedWells = new Set();
    screenHost.innerHTML = `
        <section class="screen">
            <h1 class="screen-title">Mix and watch the reaction</h1>
            <p class="screen-instruction">Tap each well to mix it. Clumps mean a positive reaction.</p>
            <div class="lab-bench" style="grid-template-columns:1fr">
                <div class="well-grid">
                    ${reagents.map((reagent) => `
                        <button class="well-station" type="button" data-mix="${reagent.id}">
                            <span class="well mix-well ${reagent.id === "control" ? "control" : ""}" aria-hidden="true"></span>
                            <span class="well-label">${reagent.label}</span>
                        </button>
                    `).join("")}
                </div>
            </div>
        </section>
    `;

    setGuide("Mix every well. Look closely for clumps in Anti-A, Anti-B and Anti-D.");
    document.querySelectorAll("[data-mix]").forEach((button) => button.addEventListener("click", () => mixWell(button)));
}

function mixWell(button) {
    const id = button.dataset.mix;
    if (state.mixedWells.has(id)) return;
    state.mixedWells.add(id);
    button.querySelector(".well").classList.add("mixed");
    playTone("success");

    if (state.mixedWells.size === reagents.length) {
        showFeedback({
            correct: true,
            title: "Reactions complete",
            message: "Anti-A, Anti-B and Anti-D formed visible clumps. The control stayed smooth.",
            action: () => moveTo(6)
        });
    } else {
        setGuide(`${reagents.length - state.mixedWells.size} well${reagents.length - state.mixedWells.size === 1 ? "" : "s"} still to mix.`);
    }
}

function resultStrip() {
    return `
        <div class="results-strip">
            ${reagents.map((reagent) => `
                <div class="mini-result">
                    <strong>${reagent.label}</strong>
                    <div class="reaction ${reagent.id === "control" ? "" : "clumps"}" aria-hidden="true"></div>
                    <span>${reagent.id === "control" ? "No reaction" : "Clumps"}</span>
                </div>
            `).join("")}
        </div>
    `;
}

function renderInterpretation() {
    beginTask();
    const options = shuffle(["A positive", "B positive", "AB positive", "O negative"]);
    screenHost.innerHTML = `
        <section class="screen">
            <h1 class="screen-title">What is Nicky's blood group?</h1>
            ${resultStrip()}
            <div class="result-grid">
                ${options.map((option) => `<button class="result-choice" type="button" data-group="${option}">${option}</button>`).join("")}
            </div>
        </section>
    `;

    setGuide(state.mode === "junior" ? "Clumps with Anti-A and Anti-B mean AB. Clumps with Anti-D mean positive." : "Use the three positive reactions and the smooth control to identify the group.");
    document.querySelectorAll("[data-group]").forEach((button) => button.addEventListener("click", () => chooseGroup(button)));
}

function chooseGroup(button) {
    if (button.dataset.group !== "AB positive") {
        state.firstAttempt = false;
        button.classList.add("wrong");
        showFeedback({ correct: false, title: "Read every reaction", message: "Anti-A and Anti-B both clumped, and Anti-D also clumped. Use all three clues together.", button: "Try again" });
        return;
    }

    markFirstTry();
    button.classList.add("correct");
    showFeedback({
        correct: true,
        title: "Nicky is AB positive",
        message: "Nicky's red cells carry A, B and D markers, so all three test wells clumped.",
        action: () => moveTo(7)
    });
}

function renderCompatibility() {
    beginTask();
    const units = shuffle(["A+", "B−", "O+", "AB−"]);
    screenHost.innerHTML = `
        <section class="screen">
            <h1 class="screen-title">Issue the planned red-cell unit</h1>
            <p class="screen-instruction">Nicky is AB positive. Select the labelled compatible unit requested for issue.</p>
            <div class="task-layout" style="--columns:4">
                ${units.map((type) => `
                    <button class="choice-card blood-choice" type="button" data-unit="${type}">
                        <span class="blood-bag" aria-hidden="true"><span class="blood-type">${type}</span></span>
                        <strong>${type === "A+" ? "Requested unit" : "Available unit"}</strong>
                    </button>
                `).join("")}
            </div>
        </section>
    `;

    setGuide(state.mode === "challenge" ? "Confirm both ABO and RhD compatibility before issue." : "An AB-positive patient can safely receive compatible A-positive red cells.");
    document.querySelectorAll("[data-unit]").forEach((button) => button.addEventListener("click", () => chooseCompatibleUnit(button)));
}

function chooseCompatibleUnit(button) {
    if (button.dataset.unit !== "A+") {
        state.firstAttempt = false;
        button.classList.add("wrong");
        showFeedback({ correct: false, title: "Check the issue request", message: "The selected unit is not the planned A-positive unit. Match the unit label and confirm compatibility.", button: "Try again" });
        return;
    }

    markFirstTry();
    button.classList.add("correct");
    showFeedback({
        correct: true,
        title: "Safe unit selected",
        message: "A-positive red cells are compatible with an AB-positive patient. The unit can be issued for Nicky.",
        action: () => moveTo(8)
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
            <p>You helped identify Nicky's AB-positive group and issue compatible red cells.</p>
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
        5: renderMixing,
        6: renderInterpretation,
        7: renderCompatibility,
        8: renderCompletion
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

