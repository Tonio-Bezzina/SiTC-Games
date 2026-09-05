/* =========================================================
   SiTC GAMES — TRANSFUSION LAB HUB

   This page uses the SAME browser storage as the main
   SiTC Games hub.

   It controls:
   - Transfusion badge status
   - Individual case stars
   - Unlocking bonus cases
   - Transfusion case progress
   - Transfusion Master status
   - Temporary development controls

   IMPORTANT:
   The storage key and case IDs must match those used in
   the main hub.js configuration.
   ========================================================= */


/* =========================================================
   CONFIGURATION
   ========================================================= */

/* Same key used by the main SiTC Games hub. */
const STORAGE_KEY = "sitcGameProgressV2";


/* Transfusion laboratory ID. */
const LAB_ID = "transfusion";


/* The Main Mission.
   Completing this earns the Transfusion Lab Badge and
   unlocks the additional Transfusion cases. */
const MAIN_CASE_ID = "nicky";


/* All currently registered Transfusion cases.

   Later, when the Transfusion team provides the other cases,
   "case-2" and "case-3" can be renamed to meaningful IDs.

   The same IDs must then also be updated in the root hub.js. */
const TRANSFUSION_CASES = [
    "nicky",
    "case-2",
    "case-3"
];


/* =========================================================
   LOAD PROGRESS
   ========================================================= */

function loadProgress() {

    const saved =
        localStorage.getItem(STORAGE_KEY);


    /* No SiTC Games progress has been stored yet. */
    if (!saved) {

        return {
            completedCases: {}
        };

    }


    /* Convert the stored JSON back into a JavaScript object.

       Check if the stored data is valid. If the browser data
       has somehow become invalid, start with empty progress
       rather than allowing the page to stop working. */
    try {

        const progress =
            JSON.parse(saved);


        if (!progress.completedCases) {

            progress.completedCases = {};

        }


        return progress;

    } catch (error) {

        console.error(
            "Could not load SiTC Games progress:",
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

    /* Browser localStorage stores text, so convert the
       progress object into JSON first. */
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(progress)
    );

}


/* =========================================================
   GET COMPLETED TRANSFUSION CASES
   ========================================================= */

function getCompletedTransfusionCases(progress) {

    /* Return the stored Transfusion case list.

       If the player has never completed a Transfusion case,
       return an empty list instead. */
    return (
        progress.completedCases[LAB_ID]
        || []
    );

}


/* =========================================================
   CHECK WHETHER A CASE IS COMPLETE
   ========================================================= */

function isCaseComplete(
    progress,
    caseId
) {

    const completedCases =
        getCompletedTransfusionCases(
            progress
        );


    return completedCases.includes(
        caseId
    );

}


/* =========================================================
   CHECK WHETHER THE TRANSFUSION BADGE IS EARNED
   ========================================================= */

function isBadgeEarned(progress) {

    /* The Transfusion badge depends ONLY on completing
       the Main Mission: Nicky's Blood Bank Rescue. */
    return isCaseComplete(
        progress,
        MAIN_CASE_ID
    );

}


/* =========================================================
   CHECK WHETHER TRANSFUSION IS MASTERED
   ========================================================= */

function isTransfusionMastered(progress) {

    /* Every registered Transfusion case must be complete. */
    return TRANSFUSION_CASES.every(
        function (caseId) {

            return isCaseComplete(
                progress,
                caseId
            );

        }
    );

}


/* =========================================================
   COMPLETE A CASE
   ========================================================= */

function completeCase(caseId) {

    /* Ignore unknown case IDs.

       This prevents a typo or incorrectly configured game
       from adding random entries to the passport. */
    if (
        !TRANSFUSION_CASES.includes(
            caseId
        )
    ) {

        console.warn(
            "Unknown Transfusion case:",
            caseId
        );

        return;

    }


    const progress =
        loadProgress();


    /* Create the Transfusion list when the player completes
       their first Transfusion case. */
    if (
        !progress.completedCases[LAB_ID]
    ) {

        progress.completedCases[LAB_ID] = [];

    }


    /* Do not store the same case twice. */
    if (
        !progress.completedCases[LAB_ID]
            .includes(caseId)
    ) {

        progress.completedCases[LAB_ID]
            .push(caseId);

    }


    saveProgress(progress);

    renderTransfusionHub();

}


/* =========================================================
   CREATE STAR DISPLAY
   ========================================================= */

function createStars(
    completed,
    total
) {

    let stars = "";


    /* Build one filled or empty star for every case. */
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
   UPDATE THE MAIN NICKY MISSION
   ========================================================= */

function updateMainMission(progress) {

    const completed =
        isCaseComplete(
            progress,
            MAIN_CASE_ID
        );


    const mainCard =
        document.querySelector(
            ".main-mission"
        );


    const status =
        document.getElementById(
            "nickyStatus"
        );


    const button =
        document.getElementById(
            "nickyButton"
        );


    if (completed) {

        /* Visually show that Nicky has been completed. */
        mainCard.classList.add(
            "completed"
        );


        status.textContent =
            "Completed ★";


        /* The real game does not exist yet, so keep the
           button disabled for now.

           Later this will become something such as:
           "Play Again". */
        button.textContent =
            "Game Coming Soon";

        button.disabled =
            true;

    } else {

        mainCard.classList.remove(
            "completed"
        );


        status.textContent =
            "Not completed";


        button.textContent =
            "Game Coming Soon";

        button.disabled =
            true;

    }

}


/* =========================================================
   UPDATE BONUS CASES
   ========================================================= */

function updateBonusCases(progress) {

    const mainMissionComplete =
        isBadgeEarned(progress);


    const bonusCards =
        document.querySelectorAll(
            "[data-bonus-case]"
        );


    bonusCards.forEach(
        function (card) {

            const caseId =
                card.dataset.bonusCase;


            const caseComplete =
                isCaseComplete(
                    progress,
                    caseId
                );


            const status =
                card.querySelector(
                    ".bonus-status"
                );


            const button =
                card.querySelector(
                    ".bonus-button"
                );


            /* -----------------------------------------
               CASE ALREADY COMPLETED
               ----------------------------------------- */

            if (caseComplete) {

                card.classList.add(
                    "unlocked"
                );

                card.classList.add(
                    "completed"
                );


                status.textContent =
                    "Completed ★";


                /* Actual replay links will replace this once
                   the bonus games exist. */
                button.textContent =
                    "Game Coming Soon";

                button.disabled =
                    true;


                return;

            }


            /* -----------------------------------------
               MAIN MISSION COMPLETE:
               BONUS CASE IS UNLOCKED
               ----------------------------------------- */

            if (mainMissionComplete) {

                card.classList.add(
                    "unlocked"
                );

                card.classList.remove(
                    "completed"
                );


                status.textContent =
                    "Unlocked";


                /* The game itself is not built yet, so although
                   the case is logically unlocked, its launch
                   button remains disabled.

                   Once built, this becomes an active Play button. */
                button.textContent =
                    "Game Coming Soon";

                button.disabled =
                    true;


                return;

            }


            /* -----------------------------------------
               MAIN MISSION NOT YET COMPLETE:
               BONUS CASE REMAINS LOCKED
               ----------------------------------------- */

            card.classList.remove(
                "unlocked"
            );

            card.classList.remove(
                "completed"
            );


            status.textContent =
                "Locked";


            button.textContent =
                "Complete Main Mission First";

            button.disabled =
                true;

        }
    );

}


/* =========================================================
   UPDATE BADGE AREA
   ========================================================= */

function updateBadgeArea(progress) {

    const badge =
        document.getElementById(
            "transfusionBadge"
        );


    const title =
        document.getElementById(
            "badgeTitle"
        );


    const description =
        document.getElementById(
            "badgeDescription"
        );


    const badgeEarned =
        isBadgeEarned(progress);


    const mastered =
        isTransfusionMastered(
            progress
        );


    /* -----------------------------------------
       EVERY CASE COMPLETE
       ----------------------------------------- */

    if (mastered) {

        badge.classList.add(
            "earned"
        );


        title.textContent =
            "Transfusion Master";


        description.textContent =
            "You earned the Transfusion badge and completed every available Transfusion case.";


        return;

    }


    /* -----------------------------------------
       MAIN MISSION COMPLETE
       ----------------------------------------- */

    if (badgeEarned) {

        badge.classList.add(
            "earned"
        );


        title.textContent =
            "Transfusion Badge Earned!";


        description.textContent =
            "Your Transfusion badge counts towards becoming an SiTC Young Scientist. Keep exploring to become a Transfusion Master.";


        return;

    }


    /* -----------------------------------------
       NOTHING COMPLETE YET
       ----------------------------------------- */

    badge.classList.remove(
        "earned"
    );


    title.textContent =
        "Badge Not Yet Earned";


    description.textContent =
        "Complete the Main Mission to earn your Transfusion badge.";

}


/* =========================================================
   UPDATE CASE PROGRESS
   ========================================================= */

function updateCaseProgress(progress) {

    const completedCases =
        TRANSFUSION_CASES.filter(
            function (caseId) {

                return isCaseComplete(
                    progress,
                    caseId
                );

            }
        );


    const completedCount =
        completedCases.length;


    const totalCases =
        TRANSFUSION_CASES.length;


    const percentage =
        Math.round(
            (
                completedCount /
                totalCases
            )
            * 100
        );


    /* Update "0 / 3 cases". */
    document
        .getElementById(
            "caseProgressText"
        )
        .textContent =
            completedCount
            + " / "
            + totalCases
            + " cases";


    /* Update ☆☆☆ / ★☆☆ / ★★☆ / ★★★. */
    document
        .getElementById(
            "caseStars"
        )
        .textContent =
            createStars(
                completedCount,
                totalCases
            );


    /* Animate the progress bar. */
    document
        .getElementById(
            "caseProgressFill"
        )
        .style
        .width =
            percentage + "%";

}


/* =========================================================
   UPDATE TRANSFUSION MASTER CARD
   ========================================================= */

function updateMasterCard(progress) {

    const masterCard =
        document.getElementById(
            "masterCard"
        );


    if (
        isTransfusionMastered(
            progress
        )
    ) {

        masterCard
            .classList
            .remove("hidden");

    } else {

        masterCard
            .classList
            .add("hidden");

    }

}


/* =========================================================
   RENDER THE WHOLE TRANSFUSION HUB
   ========================================================= */

function renderTransfusionHub() {

    const progress =
        loadProgress();


    updateBadgeArea(
        progress
    );


    updateCaseProgress(
        progress
    );


    updateMainMission(
        progress
    );


    updateBonusCases(
        progress
    );


    updateMasterCard(
        progress
    );

}


/* =========================================================
   RESET ONLY TRANSFUSION PROGRESS

   IMPORTANT:
   This removes Transfusion progress without deleting badges
   or case progress from Clinical Chemistry, Microbiology,
   Haematology, etc.
   ========================================================= */

function resetTransfusionProgress() {

    const progress =
        loadProgress();


    delete progress
        .completedCases[LAB_ID];


    saveProgress(progress);

    renderTransfusionHub();

}


/* =========================================================
   TEMPORARY DEVELOPMENT CONTROLS
   ========================================================= */


/* Simulate reaching the end of Nicky's Blood Bank Rescue.

   This should:
   - earn Nicky's star
   - earn the Transfusion badge
   - unlock the bonus cases */
document
    .getElementById(
        "testNickyComplete"
    )
    .addEventListener(
        "click",
        function () {

            completeCase(
                "nicky"
            );

        }
    );


/* Simulate completing all currently registered
   Transfusion games.

   This should also award Transfusion Master. */
document
    .getElementById(
        "testAllCases"
    )
    .addEventListener(
        "click",
        function () {

            TRANSFUSION_CASES.forEach(
                function (caseId) {

                    completeCase(
                        caseId
                    );

                }
            );

        }
    );


/* Reset ONLY the Transfusion Laboratory. */
document
    .getElementById(
        "testResetTransfusion"
    )
    .addEventListener(
        "click",
        function () {

            resetTransfusionProgress();

        }
    );


/* =========================================================
   INITIAL PAGE LOAD
   ========================================================= */

renderTransfusionHub();
