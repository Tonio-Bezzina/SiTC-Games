# Chapter 3 implementation brief — Complete the quality-control chapter

Status: implemented in part; revision required before Chapter 4
Applies to: `chemistry/main/game.js`, `chemistry/main/style.css`, and `chemistry/main/index.html`
Design authority: `chemistry-game-design.md`, especially Chapter 3, difficulty rules, interaction contract, and completion definition

This document is self-contained. It specifies the final required form of Chapter 3 and the hand-off to Chapter 4. It records requested changes only; creating this document does not authorise changing the current game yet.

## Outcome

The player must understand that a material with an expected result is used to check whether the glucose measurement process is ready before Ian's patient sample can be tested. A failed result pauses patient testing, prompts scientist help, and requires a fresh passing quality-control material. Ian's sample remains separate and unchanged.

Chapter 3 is complete only when a passing QC result has been correctly accepted. Once Chapter 4 exists, Chapter 3 must transition to it instead of showing an end-of-available-content screen.

## Required terminology revision

Replace player-facing **“Check sample”** with **“Quality control sample”** everywhere in Chapter 3, including:

- Vial label and accessible name.
- Supply/rack label.
- Loading-target instructions.
- Success, safe-return, refresh-recovery, and scientist-intervention feedback.
- Help text and guide-strip text.
- Fresh-vial text: use **“Fresh quality control sample.”**

The analyser screen may continue to use **“Quality control”** as the process name. Do not call the material a patient sample or calibration sample. Existing internal property names and the current filename `check-sample-vial-v1.png` may remain stable if renaming them would create unnecessary asset churn; player-visible and assistive-technology text must use the new terminology.

Recommended introductory copy:

> Before testing Ian's sample, we check that the glucose test is working as expected.

Then:

> This quality control sample has an expected result. Let's see whether the analyser gets it right.

## Current implementation to preserve

Reuse the existing:

- `analyser-exterior-v1.png` analyser.
- `check-sample-vial-v1.png` vial artwork with editable HTML label.
- `ian-separated-v1.png` as Ian's waiting prepared sample.
- Analyser display, expected-range band, result marker, status light, and loading tray as separate HTML/CSS layers.
- Passing Junior scenario, saved Explorer pass/fail choice, first-run failing Challenge scenario, scientist investigation, fresh passing material, reduced-motion state, muted play, drag handling, tap/select path, keyboard controls, and safe interrupted-processing restoration.

Do not bake the revised words into raster artwork.

## Entry contract

Prerequisites:

- Chapter 1 is complete and the accepted Ian sample is linked to its accession.
- Chapter 2 is complete, Ian's bottle has been centrifuged, retrieved, and its upper plasma layer selected.
- `caseData.name`, `caseData.id`, `caseData.dob`, `caseData.accession`, and `caseData.test` remain unchanged.
- The rejected reception sample remains outside the active batch and cannot appear here.

Entry stage: `qc-intro`.
Entry state: one QC material in its supply position; Ian's separated grey-top tube in a clearly separate waiting rack; analyser idle; no result displayed.

## Scene and visual hierarchy

Show:

1. A prominent analyser and readable screen.
2. A distinct QC vial with a cyan cap and editable “Quality control sample” label.
3. A generous highlighted QC loading target.
4. Ian's labelled grey-top tube in a separate rack with the warning “Patient sample — quality control first.”
5. Stable primary actions at the lower right and the shared clue strip at the bottom.

The QC vial and Ian's bottle must never occupy the same source rack or be visually confused. The analyser stays stationary during processing. Tray movement, light state, text, and progress communicate processing without centrifuge-style hopping.

## Required interaction flow

1. The player drags the quality control sample to the QC loading position.
2. A valid drop snaps into place. A missed or cancelled drop returns safely without an error.
3. Tap/select-then-target and keyboard activation perform the same move.
4. “Run quality control” becomes available only after the QC material is loaded.
5. Processing briefly moves the tray inward, changes the status light, and shows “Checking…”.
6. The analyser reveals a marker clearly inside or outside a labelled “Expected range”. Text and symbols repeat the state so colour is never the only cue.
7. The player chooses “Ready to test” or “Ask the scientist for help”. Button positions do not move between the first result and retries.

Do not show Ian's glucose result in this chapter.

## Ian's sample redirection — required new behaviour

If the player taps, selects, drags, keyboard-activates, or drops Ian's patient sample toward the analyser before QC acceptance:

1. Return Ian's sample safely to its waiting rack without consuming or changing it.
2. Clear Ian as the selected object.
3. Highlight the QC vial if it is still in the supply area; otherwise highlight the QC loading position or pending decision that must be completed.
4. Move keyboard focus to the currently required QC control when appropriate, without trapping focus.
5. Update the guide strip and show concise feedback:

> Complete the quality control check before loading Ian's sample.

6. Do not count this as a scientific error.

The redirection must be phase-aware:

| Current phase | Redirect the player to |
|---|---|
| QC material waiting | The quality control sample |
| QC material selected | The QC loading target |
| QC material loaded | “Run quality control” |
| Result displayed | The Ready/Help decision |
| Failed result under investigation | The scientist-intervention status; patient testing remains paused |
| Fresh material waiting | The fresh quality control sample |
| QC accepted | Briefly highlight Ian as next, but do not load him until Chapter 4 |

## Difficulty behaviour

### Junior

- First QC result passes.
- Explain: “The quality control result is inside its expected range.”
- Correct decision: “Ready to test.”
- Asking for help is not an error. Give a reassuring explanation and return to the same decision.

### Explorer

- Choose pass or fail once at Chapter 3 entry and save it.
- Do not reroll on retry, resize, rotation, or refresh.
- Pass → Ready to test.
- Fail → Ask the scientist for help.

### Challenge

- First run through this chapter uses the failing route.
- Keep the result and expected band fully readable while giving fewer initial clues.
- Correct decision: Ask the scientist for help.

Changing difficulty while Chapter 3 is unfinished creates a fresh Chapter 3 state using the new level's scenario rules. It preserves Ian, prepared sample, accession, Chapters 1–2, and any global case result variant. Selecting the current level only closes the picker.

## Failed-result recovery

When the marker is outside the expected range:

- “Ready to test” must not advance.
- Preserve and emphasize the failing marker.
- Say:

> This quality control result is outside its expected range. Ask the scientist to investigate before testing Ian's sample.

When help is requested:

1. Show scientist acknowledgement.
2. Display: “The scientist investigates and corrects the problem.”
3. Keep patient testing paused.
4. Run a short maintenance/status state; reduced motion uses a static completed-progress state.
5. Only after investigation finishes, make a **fresh quality control sample** available.
6. Require the fresh material to be loaded and processed.
7. The fresh result passes.
8. Require the player to recognise and accept the passing result.

Never present repeatedly rerunning the same unexplained failed vial as the solution. Do not ask the child to diagnose faults, calibrate, or select maintenance procedures.

## State and saving contract

Persist at least:

- Chosen first-round scenario.
- Current round.
- Phase: intro, load, loaded, processing, result, investigating, accepted.
- QC vial location and whether it is fresh.
- Result, decision feedback, investigation completion, and acceptance.
- Ian's unchanged waiting-sample identity.

On refresh during processing, restore a safe loaded state and allow the player to rerun the illustrative check. Do not manufacture a pass, reroll the saved scenario, skip investigation, or duplicate completion. On refresh during investigation, resume or restore a clearly defined investigation state; the fresh material must not appear before investigation completion.

Opening the Level or Help dialog and entering portrait pause timers and animations. Rotation, blur, chapter exit, or difficulty change cancels an active drag and returns the object to its last valid position. Old callbacks must be invalidated before rerendering.

## Completion and hand-off

Completion gate:

- QC material was loaded and processed.
- Any failing result was referred to the scientist.
- Any required investigation and fresh QC run completed.
- A passing result was correctly accepted.

After acceptance:

1. Briefly highlight Ian's prepared tube as the next sample.
2. Say: “The quality control check passed! We're ready to measure glucose in Ian's sample.”
3. Set Chapter 3 complete.
4. When Chapter 4 is present, transition to its exterior analyser entry scene.

Do not award the Chemistry badge here. If Chapter 4 is still absent at implementation time, retain an honest end-of-available-content message with replay and return controls and no nonfunctional Continue button.

## Accessibility and responsive requirements

- Minimum 48 CSS-pixel controls and forgiving drop zones.
- Lift dragged vials above the finger; suppress the release click after a drag.
- Every visual state has text and an accessible name/status.
- Expected range and marker remain readable at 844×390 phone landscape and tablet landscape.
- Do not shrink essential text to fit; reposition decorative art.
- Portrait blocks the underlying game and preserves the QC state.
- Reduced motion removes tray travel and pulsing while preserving explicit “Checking”, “Passed”, “Outside range”, and “Investigation complete” states.
- Muting sound has no gameplay effect.

## Verification checklist

- Complete Junior pass, Explorer pass, Explorer fail, and Challenge recovery.
- Confirm Explorer's chosen scenario survives incorrect answers and refresh.
- Try Ian by tap, drag, keyboard, and drop before QC; verify phase-aware redirection and no change to Ian.
- Incorrectly accept a failing result; verify the marker remains failing.
- Ask for help on a passing result; verify reassurance and return to the decision.
- Confirm the fresh QC material is unavailable before investigation and distinct afterward.
- Test repeated Run/decision clicks and stale callbacks.
- Test valid drag, missed drop, pointer cancellation, tap/select, and keyboard.
- Rotate during drag, processing, result, and investigation.
- Change difficulty during the first failure and investigation.
- Refresh at load, loaded, processing, failing result, investigation, fresh load, passing result, and accepted hand-off.
- Confirm Ian's name, ID no., birthday, accession, grey stopper, and separated plasma remain unchanged.
- Confirm no shared passport write or badge occurs.
