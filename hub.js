/* =========================================================
   SiTC GAMES - SHARED PROGRESS SYSTEM

   STRUCTURE

   Laboratory
       ↓
   Main Mission
       → earns Lab Badge
       ↓
   Other interactive missions (when a laboratory has them)
       → may contribute to "Lab Master"

   Passive scientist-guided Cases are a separate catalogue.
   They never read or write this progress record.

   Complete the main mission in EVERY laboratory
       → earns "SiTC Young Scientist"

   Everything is stored locally in the player's browser.
   ========================================================= */


/* =========================================================
   STORAGE
   ========================================================= */

/* Existing games use completedCases for historical compatibility.
   Entries in this record are progress-bearing interactive missions,
   never passive case-library folders. */
const STORAGE_KEY = "sitcGameProgressV2";


/* =========================================================
   LABORATORY CONFIGURATION

   This becomes our central list of laboratories and games.

   Passive cases are intentionally not registered here. They are
   discovered by the generated case-library catalogue.
   ========================================================= */

const labs = [

    {
        id: "transfusion",

        name: "Transfusion",

        iconAsset: "assets/icons/transfusion-blood-drop.svg",

        description:
            "Discover how biomedical scientists find safe blood for patients.",

        /* This will eventually open:
           /SiTC-Games/transfusion/ */
        href: "transfusion/",
        casesHref: "case-library/?lab=transfusion",

        /* Until we build the Transfusion sub-hub,
           keep the Enter Lab button disabled. */
        available: true,

        /* Historical property names are retained for compatibility.
           Only progress-bearing interactive missions belong here. */
        mainMission: "nicky",

        missions: [

            {
                id: "nicky",
                name: "Nicky's Blood Bank Rescue",
                main: true
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
        casesHref: "case-library/?lab=chemistry",

        available: true,

        mainMission: "main",

        missions: [

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
        id: "bacteriology",

        name: "Bacteriology",

        icon: "🦠",

        description:
            "Follow a patient sample through the laboratory and identify the bacterium causing an infection.",

        href: "bacteriology/",
        casesHref: "case-library/?lab=bacteriology",

        available: true,

        mainMission: "main",

        missions: [

            {
                id: "main",
                name: "Bacteriology Journey",
                main: true
            }

        ],

        masterTitle:
            "Bacteriology Master"
    },


    {
        id: "haematology",

        name: "Haematology",

        icon: "🔬",

        description:
            "Explore blood cells and the clues they can reveal.",

        href: "haematology/",
        casesHref: "case-library/?lab=haematology",

        available: true,

        mainMission: "main",

        missions: [

            {
                id: "main",
                name: "Identify the White Blood Cell",
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
            "Follow a skin specimen from patient checks to a finished H&E microscope slide.",

        href: "histology/",
        casesHref: "case-library/?lab=histology",

        available: true,

        mainMission: "main",

        missions: [

            {
                id: "main",
                name: "The Histology Journey",
                main: true
            }

        ],

        masterTitle:
            "Histology Master"
    },


    {
        id: "mycology",

        name: "Mycology",

        icon: "🍄",

        description:
            "Follow a specimen through the laboratory and solve a fungal mystery.",

        href: "mycology/",
        casesHref: "case-library/?lab=mycology",

        available: true,

        mainMission: "main",

        missions: [

            {
                id: "main",
                name: "The Mycology Journey",
                main: true
            }

        ],

        masterTitle:
            "Mycology Master"
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
   COMPLETE A PROGRESS-BEARING MISSION

   Later, each real game can call:

       completeMission("transfusion", "nicky");

   when its final screen is reached.
   ========================================================= */

function completeMission(labId, missionId) {

    const progress =
        loadProgress();


    /* Create the laboratory's legacy storage list if this is
       its first completed interactive mission. */
    if (!progress.completedCases[labId]) {

        progress.completedCases[labId] = [];

    }


    /* Avoid saving the same mission more than once. */
    if (
        !progress.completedCases[labId]
            .includes(missionId)
    ) {

        progress.completedCases[labId]
            .push(missionId);

    }


    saveProgress(progress);

    renderHub();

}


/* =========================================================
   CHECK WHETHER A MISSION IS COMPLETE
   ========================================================= */

function isMissionComplete(
    progress,
    labId,
    missionId
) {

    const completed =
        progress.completedCases[labId] || [];


    return completed.includes(missionId);

}


/* =========================================================
   CHECK WHETHER LAB BADGE IS EARNED

   Only the laboratory's Main Mission is required.
   ========================================================= */

function isLabBadgeEarned(
    progress,
    lab
) {

    return isMissionComplete(
        progress,
        lab.id,
        lab.mainMission
    );

}


/* =========================================================
   CHECK WHETHER LAB IS MASTERED

   Every listed progress-bearing mission must be completed.
   ========================================================= */

function isLabMastered(
    progress,
    lab
) {

    return lab.missions.every(
        function (mission) {

            return isMissionComplete(
                progress,
                lab.id,
                mission.id
            );

        }
    );

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


    const iconMarkup = lab.iconAsset
        ? `<img class="lab-icon-image" src="${lab.iconAsset}" alt="">`
        : lab.icon;


    badge.innerHTML = `
        <span class="lab-icon">
            ${iconMarkup}
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


    /* ---------- MAIN MISSION BUTTON ---------- */

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


    const actions = document.createElement("div");
    actions.className = "lab-actions";
    actions.appendChild(button);

    const casesButton = document.createElement("a");
    casesButton.href = lab.casesHref;
    casesButton.className = "lab-button cases-button";
    casesButton.textContent = "Cases";
    actions.appendChild(casesButton);

    /* ---------- BUILD CARD ---------- */

    card.appendChild(badge);

    card.appendChild(title);

    card.appendChild(
        badgeStatus
    );

    card.appendChild(
        description
    );

    card.appendChild(actions);


   /* =====================================================
   MAKE THE WHOLE CARD CLICKABLE

   Only laboratories that are currently available become
   clickable.

   Clicking an existing button/link is ignored here because
   that interactive element already handles its own action.

   Keyboard support is also included so Enter/Space can open
   the laboratory when the card itself has focus.
   ===================================================== */

   if (lab.available) {
   
       card.classList.add("clickable");
   
       card.setAttribute("role", "link");
       card.setAttribute("tabindex", "0");
   
       card.addEventListener(
           "click",
           function (event) {
   
               /* Do not interfere with a link or button that
                  the player clicked directly. */
               if (
                   event.target.closest(
                       "a, button"
                   )
               ) {
                   return;
               }
   
               window.location.href =
                   lab.href;
   
           }
       );
   
   
       card.addEventListener(
           "keydown",
           function (event) {
   
               if (
                   event.key === "Enter"
                   ||
                   event.key === " "
               ) {
   
                   event.preventDefault();
   
                   window.location.href =
                       lab.href;
   
               }
   
           }
       );
   
   }


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


/* Simulate completing Nicky's progress-bearing Main Mission. */
document
    .getElementById(
        "testMainMission"
    )
    .addEventListener(
        "click",
        function () {

            completeMission(
                "transfusion",
                "nicky"
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
