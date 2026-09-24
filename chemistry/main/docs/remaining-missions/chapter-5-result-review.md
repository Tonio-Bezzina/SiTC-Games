# Chapter 5 implementation brief — Check the result

Status: implemented; keep this brief aligned with the playable chapter
Applies to: the existing plain HTML/CSS/JavaScript mission in `chemistry/main/`
Design authority: `chemistry-game-design.md`, Chapter 5 and shared continuity, difficulty, interaction, persistence, and accessibility rules

This document is self-contained. It specifies the full result-review chapter and its transition to report delivery.

## Learning outcome and boundaries

The player learns that producing an analyser result is not the same as reviewing and reporting it. The result must stay linked to the correct patient, be compared with the expected range shown, and receive scientist review before it is sent.

The chapter must not diagnose Ian, prescribe treatment, imply that a within-band result proves he is well, or replace an out-of-range result with a normal result after a wrong answer. Label the educational band and show its supplied endpoints:

> Expected range · 3.9 mmol/L to 9.00 mmol/L

## Entry contract

Chapter 5 starts only after Chapter 4 completed all sample, reagent, reaction, and light-reading actions.

Required incoming data:

- Ian's unchanged name, ID no., birthday, accession, and Glucose request.
- `chapter1Complete` through `chapter4Complete` true.
- The saved case measurement object with a coherent `above` or `within` result category, reaction strength, graph endpoint, report-marker position, and future doctor-dialogue variant.
- A settled analyser reading. It cannot be recomputed or rerolled here.

## Scene

Return from the analyser cutaway to a laboratory reporting monitor. Reuse the visual language of `request-monitor-v1.png` or the analyser/lab background, but build the report and checklist as readable HTML. Show:

- Ian's name.
- ID no.
- Birthday.
- Accession.
- Test: Glucose.
- A result marker.
- A large labelled **Expected range** band with visible endpoints **3.9 mmol/L** and **9.00 mmol/L**.
- A visible checklist whose rows open the associated action.
- The existing scientist guide and bottom clue strip.

The result marker must be clearly within or above the band; do not use boundary cases. Position, words, and symbols must communicate the category without relying on colour. Do not show mmol/L or an arbitrary numeric concentration in the first version.

## Case result variants

### Default above-band story

- Marker clearly above the expected band.
- Correct category: **Outside expected range**.
- Neutral conclusion:

> This result needs the doctor's attention.

This is not a diagnosis.

### Within-band replay story

- Marker clearly inside the example band.
- Correct category: **Within**.
- Neutral conclusion:

> This result is within the expected range. The doctor will consider it alongside Ian's other information.

Never state that Ian is healthy or that the result explains all symptoms.

## Checklist behaviour

Checklist rows are task launchers, not freely tickable checkboxes. A row becomes checked only after its associated action succeeds. Lock later rows until prerequisites are complete and explain what remains.

Recommended stages/state:

```js
review: {
  phase: "compare" | "identity" | "scientist" | "complete",
  identityConfirmed: false,
  categorySelected: null,
  comparisonComplete: false,
  reviewRequested: false,
  scientistReviewed: false,
  reviewAcknowledged: false,
  feedback: ""
}
```

Persist the selected category and every completed row. Wrong choices never alter the saved patient result.

## Junior flow

Guide:

> The result is ready. Use your checklist to compare it with the expected range.

Visible player checklist contains one actionable row:

- Compare the glucose result with the shown range.

Ian's identity remains visible, but identity confirmation and scientist review happen automatically in the background. Do not create hidden clicks for either.

Choices:

- **Within expected range**
- **Outside expected range**

After the correct comparison, explain the direction in plain language and visibly mark background checks/review as complete without requiring input.

Above-band correct feedback:

> The marker is outside the expected range, above the shaded band. The scientist will review it before reporting.

Within-band correct feedback:

> The marker is within the expected range. The scientist will still review it before reporting.

## Explorer flow

Guide:

> Work through the checklist: check the patient, compare the result, and acknowledge the scientist's review.

Checklist order:

1. Confirm Ian's identity.
2. Compare the glucose result.
3. Acknowledge scientist review.

### Identity action

Open a large comparison view showing the report identifiers beside Ian's accepted request/reference. Require confirmation that name, ID no., birthday, and accession match. The values are the already accepted values; this is continuity verification, not a new distractor puzzle.

Provide **Matches Ian** only after all fields are visible. If the player attempts to proceed without inspecting, highlight the identifier group rather than inventing a mismatch.

### Result comparison

Ask: **Is Ian's result within the normal expected range?**

Choices at every level:

- **Within expected range**
- **Outside expected range**

Enable after identity confirmation. The marker position and endpoint labels show whether it is within or outside; do not add separate Below/Above choices.

### Scientist review

Enable after the correct category. The player selects **Request scientist review**, sees:

> Scientist review complete

Then selects **Acknowledge review**. This must be one review sequence, not repeated in Chapter 6.

## Challenge flow

Use the Explorer checklist and order, plus a brief explanation before acknowledgement:

> A result is one clue. The doctor interprets it with symptoms, history, and other information.

Require the same identity, classification, and review actions. Difficulty comes from independent interpretation and explanation, never smaller labels or ambiguous marker placement.

## Incorrect and premature actions

### Wrong classification

Preserve the marker and case. Highlight its position relative to the nearest relevant boundary.

For the default above case:

> The marker is beyond 9.00 mmol/L. Choose Outside expected range.

For a within case:

> The marker is between 3.9 and 9.00 mmol/L. Choose Within expected range.

An incorrect category is a deliberate scientific decision and may count as an attempt. It never changes the underlying result.

### Locked checklist row

If a later row is selected early, redirect to the first incomplete row:

> Complete the highlighted checklist step first.

Do not count inspection, opening/closing a panel, background taps, or focus movement as errors.

### Repeated actions

Once a row is complete, reopening it may show the completed evidence but must not duplicate state, play multiple success sequences, or bypass a later row.

## Level switching

Changing difficulty while Chapter 5 is unfinished restarts only Chapter 5 at its entry checkpoint:

- Preserve Ian and the fixed measurement/result variant.
- Preserve Chapters 1–4 and accepted QC.
- Junior rebuilds as the single comparison row with automatic identity/review.
- Explorer/Challenge rebuild as the three-row checklist.
- Cancel feedback timers, dialogs, active focus traps, and any scientist animation before rerendering.

Selecting the current level closes the picker without resetting. Switching level after Chapter 5 completes must not reopen or invalidate the report review.

## Saving and refresh

Persist the chapter state after every completed row and deliberate category selection. On refresh:

- Restore the same marker and category.
- Restore completed checklist rows.
- Never reroll an above result to within.
- Never auto-complete an unacknowledged Explorer/Challenge scientist review.
- Junior may restore its explicit automatic background-review state once the comparison has succeeded.

Increment/validate the checkpoint schema to include `chapter4Complete`, the saved measurement case, and the review object. Corrupt review state should return to a safe Chapter 5 entry without changing Ian or the measurement case.

## Visual and interaction specification

- Make the result band and marker the dominant evidence, not decorative graphics.
- Keep checklist actions in stable positions.
- Use check marks plus text such as “Complete”; do not rely on green.
- Keep the full patient identifier block readable in an inspection panel at enlarged text sizes.
- Use normal buttons rather than drag for the checklist decisions; dragging is not useful for arbitrary ticking.
- Optional recap-card-style dragging does not belong here; it is reserved for Chapter 6.
- Scientist acknowledgement may reuse a new shared scientist illustration, but readable review text remains HTML.

## Assets and reuse

Prefer interface construction over new raster art:

- Reuse `request-monitor-v1.png` or `analyser-exterior-v1.png` as an equipment shell/background if compositionally suitable.
- Reuse the established bench background.
- Reuse the versatile scientist guide/acknowledgement pose specified in the remaining-assets brief.
- Render the report, patient data, range band, marker, checklist, checks, status, and feedback in HTML/CSS/SVG.
- Reuse `paper-request-v2.png` only as a blank paper/report base if it remains visually accurate; do not force report copy into a request-form composition that confuses the task.

No readable report text or result marker may be baked into an image.

## Completion gate and hand-off

Junior completes after:

- Correct Within/Outside comparison.
- Automatic identity and scientist review states visibly complete.

Explorer/Challenge complete after:

- Ian identity confirmed.
- Correct Below/Within/Above classification.
- Scientist review requested, completed, and acknowledged.

On completion:

- Persist `chapter5Complete = true` and a `report.checked = true` state.
- Preserve the reviewed result and patient identity.
- Transition to Chapter 6 with the checked report ready to send.
- Do not award the badge yet.

## Accessibility and responsive requirements

- Minimum 48 CSS-pixel actions.
- Report and identifier panels support controlled scrolling when text is enlarged.
- Focus order follows checklist order and returns to the invoking row after dialogs.
- Dialogs are labelled and trap focus only while open.
- The range, marker, and classification are announced in text.
- Phone landscape repositions or collapses decorative art; it never clips the marker, band, checklist action, or feedback.
- Portrait pauses and blocks interactions while preserving any open comparison/review panel underneath.
- Sound and motion remain optional.

## Verification checklist

- Complete above and within cases at Junior, Explorer, and Challenge.
- Verify Junior has exactly one actionable row and no hidden identity/review clicks.
- Verify Explorer/Challenge cannot open later rows early.
- Try all wrong categories and confirm the result never changes.
- Refresh before and after every row and during scientist review.
- Change between every pair of levels after each partial checklist state.
- Rotate with identifier/review dialogs open; confirm correct restoration and focus.
- Test keyboard-only, tap-only, screen-reader names/status, enlarged text, muted sound, and reduced motion.
- Check short phone/tablet landscape layouts.
- Confirm all identifiers equal the Chapter 1 accepted values.
- Confirm report category agrees with Chapter 4 reaction and graph.
- Confirm no diagnosis, numerical cutoff, badge write, or report sending occurs here.
