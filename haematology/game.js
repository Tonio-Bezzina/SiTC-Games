const CELL_ORDER = ["neutrophil", "lymphocyte", "monocyte", "eosinophil", "basophil"];

const CELLS = {
    neutrophil: {
        name: "Neutrophil",
        role: "Fights bacteria by attacking germs that enter the body.",
        identityHint: "Look at the nucleus. Can you see several purple sections joined together?",
        roleHint: "Think about the body's quick response when bacteria enter."
    },
    lymphocyte: {
        name: "Lymphocyte",
        role: "Helps make antibodies and destroys virus-infected cells.",
        identityHint: "Look for one large, round, dark-purple nucleus with only a thin edge of cytoplasm around it.",
        roleHint: "Think about antibodies and cells that have been infected by viruses."
    },
    monocyte: {
        name: "Monocyte",
        role: "Engulfs germs and helps clear away dead cells.",
        identityHint: "Look for a large cell with plenty of pale blue-grey cytoplasm and a bent or kidney-shaped nucleus.",
        roleHint: "Think about a large clean-up cell that can swallow germs and clear away dead cells."
    },
    eosinophil: {
        name: "Eosinophil",
        role: "Helps fight parasites.",
        identityHint: "Look for a nucleus with two sections and lots of large orange-red granules.",
        roleHint: "Think about the white blood cell that helps the body fight parasites."
    },
    basophil: {
        name: "Basophil",
        role: "Releases substances that cause inflammation during allergic reactions.",
        identityHint: "Look for many dark blue-purple granules. They may make the nucleus difficult to see.",
        roleHint: "Think about histamine, inflammation, and allergic reactions."
    }
};

const state = {
    level: null,
    completed: new Set(),
    sceneOrder: [...CELL_ORDER],
    selectedCell: null,
    step: "identity",
    roleComplete: false
};

const elements = {
    gameScreen: document.querySelector("#gameScreen"),
    levelDialog: document.querySelector("#levelDialog"),
    questionDialog: document.querySelector("#questionDialog"),
    howToDialog: document.querySelector("#howToDialog"),
    completionDialog: document.querySelector("#completionDialog"),
    reviewDialog: document.querySelector("#reviewDialog"),
    levelControl: document.querySelector("#levelControl"),
    levelLabel: document.querySelector("#levelLabel"),
    progressCount: document.querySelector("#progressCount"),
    bloodScene: document.querySelector("#bloodScene"),
    cellGrid: document.querySelector("#cellGrid"),
    checklist: document.querySelector("#cellChecklist"),
    questionStep: document.querySelector("#questionStep"),
    questionTitle: document.querySelector("#questionTitle"),
    questionCellImage: document.querySelector("#questionCellImage"),
    answerGrid: document.querySelector("#answerGrid"),
    feedback: document.querySelector("#questionFeedback"),
    hintText: document.querySelector("#hintText"),
    hintButton: document.querySelector("#hintButton"),
    returnButton: document.querySelector("#returnButton"),
    howToPlayButton: document.querySelector("#howToPlayButton"),
    playAgainButton: document.querySelector("#playAgainButton"),
    reviewButton: document.querySelector("#reviewButton"),
    chooseLevelButton: document.querySelector("#chooseLevelButton"),
    reviewGrid: document.querySelector("#reviewGrid")
};

function titleCaseLevel(level) {
    return level.charAt(0).toUpperCase() + level.slice(1);
}

function shuffled(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
    }
    return copy;
}

function answerOrder(items) {
    return state.level === "junior" ? [...items] : shuffled(items);
}

function assetPath(cellId) {
    const style = state.level === "challenge" ? "realistic" : "cartoon";
    return `assets/cells/${style}/${cellId}.png`;
}

function resetQuestion() {
    state.step = "identity";
    state.roleComplete = false;
    elements.feedback.textContent = "";
    elements.feedback.className = "feedback";
    elements.hintText.textContent = "";
    elements.hintText.hidden = true;
    elements.hintButton.hidden = false;
    elements.returnButton.hidden = true;
}

function chooseLevel(level) {
    state.level = level;
    state.completed = new Set();
    state.sceneOrder = level === "junior" ? [...CELL_ORDER] : shuffled(CELL_ORDER);
    state.selectedCell = null;
    resetQuestion();
    elements.levelLabel.textContent = titleCaseLevel(level);
    elements.gameScreen.hidden = false;
    elements.bloodScene.className = `blood-scene ${level}`;
    renderGame();
    elements.levelDialog.close();
    elements.cellGrid.querySelector("button")?.focus();
}

function renderGame() {
    renderCells();
    renderChecklist();
    elements.progressCount.textContent = `${state.completed.size}/5`;
}

function renderCells() {
    const order = state.sceneOrder;
    elements.cellGrid.replaceChildren();

    order.forEach((cellId, index) => {
        const cell = CELLS[cellId];
        const button = document.createElement("button");
        const isComplete = state.completed.has(cellId);

        button.type = "button";
        button.className = `cell-button${isComplete ? " completed" : ""}`;
        button.dataset.cell = cellId;
        button.disabled = isComplete;
        button.setAttribute("aria-label", isComplete ? `${cell.name}, completed` : `White blood cell ${index + 1}`);

        const image = document.createElement("img");
        image.src = assetPath(cellId);
        image.alt = "";
        button.appendChild(image);

        if (isComplete) {
            const name = document.createElement("span");
            name.className = "cell-name";
            name.textContent = cell.name;
            button.appendChild(name);
        } else {
            button.addEventListener("click", () => openQuestion(cellId));
        }

        elements.cellGrid.appendChild(button);
    });
}

function renderChecklist() {
    elements.checklist.replaceChildren();
    CELL_ORDER.forEach((cellId) => {
        const item = document.createElement("li");
        const completed = state.completed.has(cellId);
        item.className = completed ? "completed" : "";
        item.textContent = CELLS[cellId].name;
        elements.checklist.appendChild(item);
    });
}

function openQuestion(cellId) {
    state.selectedCell = cellId;
    resetQuestion();
    elements.questionCellImage.src = assetPath(cellId);
    elements.questionCellImage.alt = "Selected white blood cell";
    renderIdentityQuestion();
    elements.questionDialog.showModal();
}

function renderIdentityQuestion() {
    state.step = "identity";
    elements.questionStep.textContent = "CELL IDENTIFICATION";
    elements.questionTitle.textContent = "What type of white blood cell is this?";
    elements.answerGrid.replaceChildren();

    answerOrder(CELL_ORDER).forEach((cellId) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "answer-button";
        button.textContent = CELLS[cellId].name;
        button.addEventListener("click", () => checkIdentity(cellId));
        elements.answerGrid.appendChild(button);
    });
}

function checkIdentity(answer) {
    if (answer !== state.selectedCell) {
        setFeedback("Not quite. Please try again!", false);
        return;
    }

    setFeedback("Great job! Now can you tell me the role of this white blood cell?", true);
    renderRoleQuestion();
}

function renderRoleQuestion() {
    state.step = "role";
    elements.questionStep.textContent = "CELL ROLE";
    const article = state.selectedCell === "eosinophil" ? "an" : "a";
    elements.questionTitle.textContent = `What does ${article} ${CELLS[state.selectedCell].name} do?`;
    elements.answerGrid.replaceChildren();
    elements.hintText.hidden = true;
    elements.hintText.textContent = "";

    const roles = answerOrder(CELL_ORDER.map((cellId) => ({ cellId, text: CELLS[cellId].role })));
    roles.forEach((role) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "answer-button";
        button.textContent = role.text;
        button.addEventListener("click", () => checkRole(role.cellId));
        elements.answerGrid.appendChild(button);
    });
}

function checkRole(answer) {
    if (answer !== state.selectedCell) {
        setFeedback("Not quite. Please try again!", false);
        return;
    }

    state.roleComplete = true;
    setFeedback("That's right! Well done!", true);
    elements.answerGrid.querySelectorAll("button").forEach((button) => { button.disabled = true; });
    elements.hintButton.hidden = true;
    elements.hintText.hidden = true;
    elements.returnButton.hidden = false;
    elements.returnButton.focus();
}

function setFeedback(message, correct) {
    elements.feedback.textContent = message;
    elements.feedback.className = `feedback ${correct ? "correct" : "incorrect"}`;
}

function showHint() {
    if (!state.selectedCell) return;
    const cell = CELLS[state.selectedCell];
    elements.hintText.textContent = state.step === "identity" ? cell.identityHint : cell.roleHint;
    elements.hintText.hidden = false;
}

function finishCurrentCell() {
    if (!state.roleComplete || !state.selectedCell) return;
    state.completed.add(state.selectedCell);
    state.selectedCell = null;
    elements.questionDialog.close();
    renderGame();

    if (state.completed.size === CELL_ORDER.length) {
        saveHubCompletion();
        elements.completionDialog.showModal();
    } else {
        elements.cellGrid.querySelector("button:not(:disabled)")?.focus();
    }
}

function saveHubCompletion() {
    const storageKey = "sitcGameProgressV2";
    let progress = { completedCases: {} };
    try {
        const saved = JSON.parse(localStorage.getItem(storageKey));
        if (saved && typeof saved === "object") progress = saved;
    } catch (error) {
        progress = { completedCases: {} };
    }

    if (!progress.completedCases) progress.completedCases = {};
    if (!Array.isArray(progress.completedCases.haematology)) progress.completedCases.haematology = [];
    if (!progress.completedCases.haematology.includes("main")) progress.completedCases.haematology.push("main");
    localStorage.setItem(storageKey, JSON.stringify(progress));
}

function playAgain() {
    state.completed = new Set();
    state.sceneOrder = state.level === "junior" ? [...CELL_ORDER] : shuffled(CELL_ORDER);
    state.selectedCell = null;
    resetQuestion();
    elements.completionDialog.close();
    renderGame();
    elements.cellGrid.querySelector("button")?.focus();
}

function openReview() {
    elements.reviewGrid.replaceChildren();
    CELL_ORDER.forEach((cellId) => {
        const cell = CELLS[cellId];
        const item = document.createElement("article");
        item.className = "review-item";
        item.innerHTML = `
            <img src="${assetPath(cellId)}" alt="${cell.name}">
            <div>
                <h3>${cell.name}</h3>
                <p>${cell.role}</p>
            </div>
        `;
        elements.reviewGrid.appendChild(item);
    });
    elements.completionDialog.close();
    elements.reviewDialog.showModal();
}

function openLevelDialog() {
    if (elements.completionDialog.open) elements.completionDialog.close();
    elements.levelDialog.showModal();
}

document.querySelectorAll("[data-level]").forEach((button) => {
    button.addEventListener("click", () => chooseLevel(button.dataset.level));
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => {
        const dialog = button.closest("dialog");
        if (dialog === elements.levelDialog && !state.level) return;
        if (dialog === elements.questionDialog && state.roleComplete) {
            finishCurrentCell();
            return;
        }
        dialog.close();
    });
});

elements.levelControl.addEventListener("click", openLevelDialog);
elements.hintButton.addEventListener("click", showHint);
elements.returnButton.addEventListener("click", finishCurrentCell);
elements.howToPlayButton.addEventListener("click", () => elements.howToDialog.showModal());
elements.playAgainButton.addEventListener("click", playAgain);
elements.reviewButton.addEventListener("click", openReview);
elements.chooseLevelButton.addEventListener("click", openLevelDialog);

elements.questionDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    if (state.roleComplete) {
        finishCurrentCell();
        return;
    }
    elements.questionDialog.close();
});

elements.levelDialog.addEventListener("cancel", (event) => {
    if (!state.level) event.preventDefault();
});

window.addEventListener("DOMContentLoaded", () => {
    elements.levelDialog.showModal();
});
