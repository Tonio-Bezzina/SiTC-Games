/* =========================================================
   SiTC GAMES HUB - PASSPORT SYSTEM

   This file:
   1. Stores completed lab sections in browser localStorage.
   2. Reads saved progress whenever the hub opens.
   3. Updates the passport visually.
   4. Provides temporary test buttons while we are developing.
   ========================================================= */


/* ---------- PASSPORT CONFIGURATION ---------- */

/* This is the key used to save the passport inside the browser.
   Keeping one shared key means every SiTC game can later read and
   update the same passport. */
const STORAGE_KEY = "sitcLabPassport";


/* These are the laboratories currently shown in the prototype hub.
   We can add/remove sections later after the committee confirms
   exactly which labs are participating. */
const labs = [
    "transfusion",
    "chemistry",
    "microbiology",
    "haematology",
    "histology"
];


/* ---------- LOAD PASSPORT ---------- */

function loadPassport() {

    /* Try to retrieve the previously saved passport. */
    const savedPassport = localStorage.getItem(STORAGE_KEY);

    /* If nothing has been saved yet, create a fresh empty passport. */
    if (!savedPassport) {

        return createEmptyPassport();

    }

    /* Convert the stored text back into a JavaScript object.
       Check if the saved data is valid. If not, we will fall back
       to a new empty passport rather than breaking the hub. */
    try {

        const passport = JSON.parse(savedPassport);

        /* Make sure every currently configured lab exists.
           This is useful later when we add new laboratories:
           old users will automatically receive the new section
           as incomplete without losing their existing badges. */
        labs.forEach(function (lab) {

            if (passport[lab] === undefined) {
                passport[lab] = false;
            }

        });

        return passport;

    } catch (error) {

        console.error("Could not read SiTC Lab Passport:", error);

        return createEmptyPassport();

    }

}


/* ---------- CREATE EMPTY PASSPORT ---------- */

function createEmptyPassport() {

    const passport = {};

    /* Every laboratory starts as incomplete. */
    labs.forEach(function (lab) {
        passport[lab] = false;
    });

    return passport;

}


/* ---------- SAVE PASSPORT ---------- */

function savePassport(passport) {

    /* localStorage can only save text, so the passport object
       is converted into JSON before being stored. */
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(passport)
    );

}


/* ---------- MARK A LAB AS COMPLETE ---------- */

function completeLab(labName) {

    const passport = loadPassport();

    /* Check that this is a recognised laboratory before saving it.
       If so, mark it as complete. */
    if (labs.includes(labName)) {

        passport[labName] = true;

        savePassport(passport);

        updatePassportDisplay();

    }

}


/* ---------- RESET PASSPORT ---------- */

function resetPassport() {

    /* Remove the saved passport completely.
       The next load will create a new blank passport. */
    localStorage.removeItem(STORAGE_KEY);

    updatePassportDisplay();

}


/* ---------- UPDATE THE HUB DISPLAY ---------- */

function updatePassportDisplay() {

    const passport = loadPassport();

    let completedCount = 0;

    /* Find every passport badge shown on the page. */
    const badgeElements =
        document.querySelectorAll("[data-passport-lab]");

    badgeElements.forEach(function (badgeElement) {

        const labName =
            badgeElement.dataset.passportLab;

        const statusElement =
            badgeElement.querySelector(".badge-status");

        /* Check whether this particular laboratory has been completed. */
        if (passport[labName]) {

            completedCount++;

            /* The CSS uses this class to turn the grey badge
               into an earned badge. */
            badgeElement.classList.add("completed");

            statusElement.textContent = "Badge earned ★";

        } else {

            badgeElement.classList.remove("completed");

            statusElement.textContent = "Not completed";

        }

    });


    /* Update the "0 / 5" progress counter at the top. */
    const progressCount =
        document.getElementById("progressCount");

    progressCount.textContent =
        completedCount + " / " + labs.length;

}


/* ---------- TEMPORARY DEVELOPMENT BUTTONS ---------- */

/* This button lets us pretend the Transfusion game has been completed
   before we actually build the Transfusion game. */
const testCompleteButton =
    document.getElementById("testCompleteTransfusion");

testCompleteButton.addEventListener(
    "click",
    function () {

        completeLab("transfusion");

    }
);


/* This button clears all progress so we can test repeatedly. */
const testResetButton =
    document.getElementById("testResetPassport");

testResetButton.addEventListener(
    "click",
    function () {

        resetPassport();

    }
);


/* ---------- INITIAL PAGE LOAD ---------- */

/* As soon as the hub opens, read the saved passport and update
   all badges before the user starts interacting with the page. */
updatePassportDisplay();
