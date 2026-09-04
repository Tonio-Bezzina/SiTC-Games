/*
  LAB HERO GAME LOGIC

  This first version has one question only.
  Later we can replace this with multiple rounds without changing
  the fullscreen or aspect-ratio system.
*/

const samples = document.querySelectorAll(".sample");
const feedback = document.getElementById("feedback");
const scoreDisplay = document.getElementById("score");
const restartButton = document.getElementById("restartButton");
const playButton = document.getElementById("playButton");
const fullscreenButton = document.getElementById("fullscreenButton");
const exitButton = document.getElementById("exitButton");
const startScreen = document.getElementById("startScreen");

let score = 0;
let answered = false;

/*
  Try to enter fullscreen and request landscape orientation.
  Browsers may reject the orientation request, especially on iOS,
  so portrait mode is still blocked visually by CSS.
*/
async function enterGameMode() {
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
  } catch (error) {
    console.info("Fullscreen was not granted by this browser.", error);
  }

  try {
    if (screen.orientation && screen.orientation.lock) {
      await screen.orientation.lock("landscape");
    }
  } catch (error) {
    console.info("Landscape orientation lock is not supported here.", error);
  }
}

function resetGame() {
  score = 0;
  answered = false;
  scoreDisplay.textContent = "0";
  feedback.textContent = "Choose a sample.";
  feedback.style.background = "white";

  samples.forEach(function (sample) {
    sample.classList.remove("correct", "incorrect");
    sample.disabled = false;
  });
}

samples.forEach(function (sample) {
  sample.addEventListener("click", function () {
    if (answered) {
      return;
    }

    answered = true;

    const priority = Number(sample.dataset.priority);

    samples.forEach(function (otherSample) {
      otherSample.disabled = true;
    });

    if (priority === 3) {
      score = 1;
      scoreDisplay.textContent = String(score);
      sample.classList.add("correct");
      feedback.textContent =
        "⭐ Correct! The Emergency Department patient needs a result quickly, so this sample gets priority.";
      feedback.style.background = "#e9f8ef";
    } else {
      sample.classList.add("incorrect");
      feedback.textContent =
        "Almost! The Emergency Department sample should be tested first because that patient needs the result most urgently.";
      feedback.style.background = "#fdecec";

      samples.forEach(function (otherSample) {
        if (Number(otherSample.dataset.priority) === 3) {
          otherSample.classList.add("correct");
        }
      });
    }
  });
});

playButton.addEventListener("click", async function () {
  await enterGameMode();
  startScreen.style.display = "none";
});

fullscreenButton.addEventListener("click", async function () {
  await enterGameMode();
});

restartButton.addEventListener("click", function () {
  resetGame();
});

/*
  For the prototype, Exit first leaves fullscreen.
  It then tries to return to the previous page, which is suitable
  when the game has been opened from the Wix website.

  When we know the final Wix URL, this can be changed to a fixed
  "Back to website" address instead.
*/
exitButton.addEventListener("click", async function () {
  try {
    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
    }
  } catch (error) {
    console.info("Could not leave fullscreen.", error);
  }

  if (window.history.length > 1) {
    window.history.back();
  }
});

resetGame();
