# Mission 1 The Basics

## Purpose and entry

Mission 1 begins immediately after the player chooses Junior, Explorer, or Challenge guidance. Its scientific term is **mycology**, the study of fungi. Input is a valid difficulty and a fresh/resumed fictional `MYC-####` case. Output is `missionFlags[1] = true` after all six questions are answered correctly.

The scene shows Dr Mira, a six-step progress indicator, and one safety question at a time over the shared lab backdrop. Intro: **Mycology is the study of fungi. This includes yeasts and moulds which can cause infections. Answer the following questions and start your journey to become a Junior Mycologist.**

## Questions and behaviour

Use the six questions and four choices exactly as listed under Mission 1 in `MYCOLOGY_GAME.md`, in that order. The correct indexes are `[1,2,2,3,2,1]` using zero-based indexing. On a correct answer announce **Correct.** and enable **Next question**. On an incorrect answer announce **Try again.**, keep the question active, and increment only that question’s attempt count. Hint: **Look for the answer that protects people, specimens, and the workspace.** Mistakes never reduce progress.

After question six, show: **Safety check complete. Let’s match each patient with the right sample.** The **Continue to Mission 2** button saves the flag, records the `safety` clue, and transitions.

## State, safety, and persistence

Persist `questionIndex`, per-question attempts, answers correctly completed, hint state, and mission completion after each answer. On resume, restore the current question without replaying prior feedback. Review mode may revisit questions but cannot remove completion. Do not add procedural laboratory detail beyond the source wording. General PPE and cleaning choices are educational safety concepts, not operating instructions.

## Assets and presentation

Required: `assets/shared/mycology-lab-background.png`, `assets/shared/dr-mira-neutral.png`, `assets/shared/dr-mira-pointing.png`, `assets/shared/dr-mira-success.png`, `assets/shared/hint-icon.svg`, `assets/shared/success-check.svg`, and `assets/mission-1/safety-lab-vignettes.svg`.

Questions are live HTML, never raster text. Answers are semantic buttons at least 48 px high. Keyboard Tab/Shift+Tab and Enter/Space complete the mission; mouse and touch use identical controls. Feedback is an assertive `aria-live` region. Focus moves to feedback, then the Next button. Reduced motion removes guide entrance and progress transitions. Narrow portrait stacks the guide below the question; no rotation is mandatory.

## Verification gate

Verify exact copy and order, all 24 choices, correct indexes, incorrect retry, all difficulty hint timings, refresh on questions 1/3/6, keyboard-only completion, touch targets, visible focus, live announcements, Mission 2 transition, and that neither hub progress nor any later mission flag is written.
