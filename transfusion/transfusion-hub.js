/* Transfusion progress covers interactive missions only.
   Passive case-library content is deliberately absent from this file. */
const STORAGE_KEY = "sitcGameProgressV2";
const LAB_ID = "transfusion";
const MAIN_MISSION_ID = "nicky";
const PROGRESS_MISSIONS = [MAIN_MISSION_ID];

function loadProgress() {
  try {
    const progress = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { completedCases: {} };
    if (!progress.completedCases || typeof progress.completedCases !== "object") progress.completedCases = {};
    return progress;
  } catch (error) {
    console.error("Could not load SiTC Games progress:", error);
    return { completedCases: {} };
  }
}

function completedMissions(progress) {
  const stored = Array.isArray(progress.completedCases[LAB_ID]) ? progress.completedCases[LAB_ID] : [];
  return PROGRESS_MISSIONS.filter((missionId) => stored.includes(missionId));
}

function renderTransfusionHub() {
  const progress = loadProgress();
  const completed = completedMissions(progress);
  const mainComplete = completed.includes(MAIN_MISSION_ID);

  document.getElementById("transfusionBadge").classList.toggle("earned", mainComplete);
  document.querySelector(".main-mission").classList.toggle("completed", mainComplete);
  document.getElementById("badgeTitle").textContent = mainComplete ? "Transfusion Badge Earned!" : "Badge Not Yet Earned";
  document.getElementById("badgeDescription").textContent = mainComplete
    ? "Your Transfusion badge counts towards becoming an SiTC Young Scientist."
    : "Complete the Main Mission to earn your Transfusion badge.";
  document.getElementById("missionProgressText").textContent = mainComplete
    ? "Main Mission completed"
    : "Main Mission not completed";
  document.getElementById("nickyStatus").textContent = mainComplete ? "Completed ★" : "Not completed";
  document.getElementById("nickyButton").textContent = mainComplete ? "Play Again" : "Start Mission";
  document.getElementById("masterCard").classList.toggle("hidden", completed.length !== PROGRESS_MISSIONS.length);
}

window.addEventListener("pageshow", renderTransfusionHub);
renderTransfusionHub();
