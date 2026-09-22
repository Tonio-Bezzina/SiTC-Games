(() => {
  "use strict";

  const STORAGE_KEY = "sitcGameProgressV2";
  const body = document.body;
  const labId = body.dataset.labId;
  const missionId = body.dataset.mainMission || "main";

  function loadProgress() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return parsed && typeof parsed === "object" ? parsed : { completedCases: {} };
    } catch (_) {
      return { completedCases: {} };
    }
  }

  const progress = loadProgress();
  const completed = Array.isArray(progress.completedCases?.[labId])
    && progress.completedCases[labId].includes(missionId);

  const statusCard = document.querySelector("[data-lab-status]");
  const badgeTitle = document.querySelector("[data-badge-title]");
  const badgeDescription = document.querySelector("[data-badge-description]");
  const missionStatus = document.querySelector("[data-mission-status]");

  if (completed) {
    statusCard?.classList.add("earned");
    if (badgeTitle) badgeTitle.textContent = "Lab Badge Earned";
    if (badgeDescription) badgeDescription.textContent = "Your Main Mission is complete. You can replay it at any time or explore the scientist-guided cases.";
    if (missionStatus) {
      missionStatus.textContent = "Completed";
      missionStatus.classList.add("complete");
    }
  } else {
    if (badgeTitle) badgeTitle.textContent = "Badge Not Yet Earned";
    if (badgeDescription) badgeDescription.textContent = "Complete the Main Mission to earn this laboratory badge for your Young Scientist progress.";
    if (missionStatus) missionStatus.textContent = "Not completed";
  }
})();
