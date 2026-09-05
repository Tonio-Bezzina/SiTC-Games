/* =========================================================
   SiTC GAMES - SHARED PROGRESS SYSTEM

   STRUCTURE

   Laboratory
       ↓
   Main Mission
       → earns Lab Badge
       ↓
   Additional Cases
       → earn Case Stars
       ↓
   Complete every case
       → earns "Lab Master" title

   Complete the main mission in EVERY laboratory
       → earns "SiTC Young Scientist"

   Everything is stored locally in the player's browser.
   ========================================================= */


/* =========================================================
   STORAGE
   ========================================================= */

/* We are using a new key because the original prototype stored
   only simple true/false lab badges.

   This version stores individual completed cases as well. */
const STORAGE_KEY = "sitcGameProgressV2";


/* =========================================================
   LABORATORY CONFIGURATION

   This becomes our central list of laboratories and games.

   Later, adding another case usually means adding one entry here
   rather than redesigning the whole hub.
   ========================================================= */

const labs = [

    {
        id: "transfusion",

        name: "Transfusion",

        icon: "🩸",

        description:
            "Discover how biomedical scientists find safe blood for patients.",

        /* This will eventually open:
           /SiTC-Games/transfusion/ */
        href: "transfusion/",

        /* Until we build the Transfusion sub-hub,
           keep the Enter Lab button disabled. */
        available: true,

        /* The main case is the one required for the lab badge. */
        mainCase: "nicky",

        cases: [

            {
                id: "nicky",
                name: "Nicky's Blood Bank Rescue",
                main: true
            },

            {
                id: "case-2",
                name: "Future Transfusion Case",
                main: false
            },

            {
                id: "case-3",
                name: "Future Transfusion Case",
                main: false
            }

        ],

        masterTitle:
            "Transfusion Master"
    },


    {
        id: "chemistry",

        name: "Clinical Chemistry",

        icon: "🧪",

        description:
            "Investigate how laboratory tests reveal what is happening inside the body.",

        href: "chemistry/",

        available: false,

        mainCase: "main",

        cases: [

            {
                id: "main",
                name: "Main Chemistry Mission",
                main: true
            }

        ],

        masterTitle:
            "Clinical Chemistry Master"
    },


    {
        id: "microbiology",

        name: "Microbiology",

        icon: "🦠",

        description:
            "Explore microorganisms and discover how scientists identify them.",

        href: "microbiology/",

        available: false,

        mainCase: "main",

        cases: [

            {
                id: "main",
                name: "Main Microbiology Mission",
                main: true
            }

        ],

        masterTitle:
            "Microbiology Master"
    },


    {
        id: "haematology",

        name: "Haematology",

        icon: "🔬",

        description:
            "Explore blood cells and the clues they can reveal.",

        href: "haematology/",

        available: false,

        mainCase: "main",

        cases: [

            {
                id: "main",
                name: "Main Haematology Mission",
                main: true
            }

        ],

        masterTitle:
            "Haematology Master"
    },


    {
        id: "histology",

        name: "Histology",

        icon: "🔎",

        description:
            "Look closely at tissues and discover the patterns scientists investigate.",

        href: "histology/",

        available: false,

        mainCase: "main",

        cases: [

            {
                id: "main",
                name: "Main Histology Mission",
                main: true
            }

        ],

        masterTitle:
            "Histology Master"
    }

];


/* =========================================================
   LOAD SAVED PROGRESS
   ========================================================= */

function loadProgress() {

    const saved =
        localStorage.getItem(STORAGE_KEY);


    /* No progress exists yet. */
    if (!saved) {

        return {
            completedCases: {}
        };

    }


    /* Check that the stored JSON is valid.

       Corrupt or manually edited browser data should never stop
       the website from loading. */
    try {

        const progress =
            JSON.parse(saved);


        if (!progress.completedCases) {

            progress.completedCases = {};

        }


        return progress;

    } catch (error) {

        console.error(
            "Could not load SiTC progress:",
            error
        );


        return {
            completedCases: {}
        };

    }

}


/* =========================================================
   SAVE PROGRESS
   ========================================================= */

function saveProgress(progress) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(progress)
    );

}


/* =========================================================
   COMPLETE A CASE

   Later, each real game can call:

       completeCase("transfusion", "nicky");

   when its final screen is reached.
   ========================================================= */

function completeCase(labId, caseId) {

    const progress =
        loadProgress();


    /* Create the laboratory's list if this is the first
       case completed from that lab. */
    if (!progress.completedCases[labId]) {

        progress.completedCases[labId] = [];

    }


    /* Avoid saving the same case more than once. */
    if (
        !progress.completedCases[labId]
            .includes(caseId)
    ) {

        progress.completedCases[labId]
            .push(caseId);

    }


    saveProgress(progress);

    renderHub();

}


/* =========================================================
   CHECK WHETHER A CASE IS COMPLETE
   ========================================================= */

function isCaseComplete(
    progress,
    labId,
    caseId
) {

    const completed =
        progress.completedCases[labId] || [];


    return completed.includes(caseId);

}


/* =========================================================
   CHECK WHETHER LAB BADGE IS EARNED

   Only the laboratory's MAIN case is required.
   ========================================================= */

function isLabBadgeEarned(
    progress,
    lab
) {

    return isCaseComplete(
        progress,
        lab.id,
        lab.mainCase
    );

}


/* =========================================================
   CHECK WHETHER LAB IS MASTERED

   Every listed case must be completed.
   ========================================================= */

function isLabMastered(
    progress,
    lab
) {

    return lab.cases.every(
        function (gameCase) {

            return isCaseComplete(
                progress,
                lab.id,
                gameCase.id
            );

        }
    );

}


/* =========================================================
   COUNT COMPLETED CASES
   ========================================================= */

function countCompletedCases(
    progress,
    lab
) {

    return lab.cases.filter(
        function (gameCase) {

            return isCaseComplete(
                progress,
                lab.id,
                gameCase.id
            );

        }
    ).length;

}


/* =========================================================
   CREATE CASE STAR DISPLAY
   ========================================================= */

function createCaseStars(
    completed,
    total
) {

    let stars = "";


    for (
        let i = 0;
        i < total;
        i++
    ) {

        if (i < completed) {

            stars += "★";

        } else {

            stars += "☆";

        }

    }


    return stars;

}


/* =========================================================
   CREATE ONE LABORATORY CARD
   ========================================================= */

function createLabCard(
    lab,
    progress
) {

    const badgeEarned =
        isLabBadgeEarned(
            progress,
            lab
        );


    const mastered =
        isLabMastered(
            progress,
            lab
        );


    const completedCases =
        countCompletedCases(
            progress,
            lab
        );


    const totalCases =
        lab.cases.length;


    const percentage =
        Math.round(
            (
                completedCases /
                totalCases
            ) * 100
        );


    /* Main card */
    const card =
        document.createElement("article");

    card.className =
        "lab-card";


    if (badgeEarned) {

        card.classList.add(
            "badge-earned"
        );

    }


    if (mastered) {

        card.classList.add(
            "mastered"
        );

    }


    /* ---------- BADGE ---------- */

    const badge =
        document.createElement("div");

    badge.className =
        "lab-badge";


    badge.innerHTML = `
        <span class="lab-icon">
            ${lab.icon}
        </span>

        <span class="badge-mark">
            ${badgeEarned ? "★" : ""}
        </span>
    `;


    /* ---------- NAME ---------- */

    const title =
        document.createElement("h3");

    title.textContent =
        lab.name;


    /* ---------- BADGE STATUS ---------- */

    const badgeStatus =
        document.createElement("div");

    badgeStatus.className =
        "lab-badge-status";


    if (mastered) {

        badgeStatus.textContent =
            lab.masterTitle;

    } else if (badgeEarned) {

        badgeStatus.textContent =
            "Lab Badge Earned";

    } else {

        badgeStatus.textContent =
            "Main Mission Not Yet Completed";

    }


    /* ---------- DESCRIPTION ---------- */

    const description =
        document.createElement("p");

    description.className =
        "lab-description";

    description.textContent =
        lab.description;


    /* ---------- CASE STARS ---------- */

    const stars =
        document.createElement("div");

    stars.className =
        "case-stars";

    stars.textContent =
        createCaseStars(
            completedCases,
            totalCases
        );


    /* ---------- CASE COUNT ---------- */

    const caseCount =
        document.createElement("div");

    caseCount.className =
        "case-count";

    caseCount.textContent =
        completedCases +
        " / " +
        totalCases +
        " cases completed";


    /* ---------- PROGRESS BAR ---------- */

    const progressTrack =
        document.createElement("div");

    progressTrack.className =
        "case-progress-track";


    const progressFill =
        document.createElement("div");

    progressFill.className =
        "case-progress-fill";

    progressFill.style.width =
        percentage + "%";


    progressTrack.appendChild(
        progressFill
    );


    /* ---------- ENTER LAB BUTTON ---------- */

    let button;


    if (lab.available) {

        button =
            document.createElement("a");

        button.href =
            lab.href;

        button.className =
            "lab-button";

        button.textContent =
            "Enter Lab";

    } else {

        button =
            document.createElement("button");

        button.className =
            "lab-button disabled";

        button.disabled =
            true;

        button.textContent =
            "Coming Soon";

    }


    /* ---------- BUILD CARD ---------- */

    card.appendChild(badge);

    card.appendChild(title);

    card.appendChild(
        badgeStatus
    );

    card.appendChild(
        description
    );

    card.appendChild(stars);

    card.appendChild(
        caseCount
    );

    card.appendChild(
        progressTrack
    );

    card.appendChild(button);


    return card;

}


/* =========================================================
   RENDER WHOLE HUB
   ========================================================= */

function renderHub() {

    const progress =
        loadProgress();


    const grid =
        document.getElementById(
            "labGrid"
        );


    grid.innerHTML = "";


    let earnedLabBadges = 0;


    /* Build each laboratory card. */
    labs.forEach(
        function (lab) {

            if (
                isLabBadgeEarned(
                    progress,
                    lab
                )
            ) {

                earnedLabBadges++;

            }


            grid.appendChild(
                createLabCard(
                    lab,
                    progress
                )
            );

        }
    );


    /* ---------- OVERALL COUNTER ---------- */

    const counter =
        document.getElementById(
            "labProgressCount"
        );


    counter.textContent =
        earnedLabBadges +
        " / " +
        labs.length;


    /* ---------- YOUNG SCIENTIST ---------- */

    const completionBox =
        document.getElementById(
            "youngScientistComplete"
        );


    if (
        earnedLabBadges ===
        labs.length
    ) {

        completionBox
            .classList
            .remove("hidden");

    } else {

        completionBox
            .classList
            .add("hidden");

    }

}


/* =========================================================
   RESET ALL PROGRESS
   ========================================================= */

function resetProgress() {

    localStorage.removeItem(
        STORAGE_KEY
    );

    renderHub();

}


/* =========================================================
   TEMPORARY DEVELOPMENT CONTROLS
   ========================================================= */


/* Simulate completing Nicky.

   This earns:
   - Nicky's case star
   - the Transfusion Lab Badge */
document
    .getElementById(
        "testMainMission"
    )
    .addEventListener(
        "click",
        function () {

            completeCase(
                "transfusion",
                "nicky"
            );

        }
    );


/* Simulate completing every current Transfusion case.

   This should award the Transfusion Master title. */
document
    .getElementById(
        "testAllTransfusion"
    )
    .addEventListener(
        "click",
        function () {

            completeCase(
                "transfusion",
                "nicky"
            );

            completeCase(
                "transfusion",
                "case-2"
            );

            completeCase(
                "transfusion",
                "case-3"
            );

        }
    );


/* Clear everything. */
document
    .getElementById(
        "testResetProgress"
    )
    .addEventListener(
        "click",
        function () {

            resetProgress();

        }
    );


/* =========================================================
   INITIAL PAGE LOAD
   ========================================================= */

renderHub();
