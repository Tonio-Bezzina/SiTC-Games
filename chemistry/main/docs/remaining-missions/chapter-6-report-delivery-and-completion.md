# Chapter 6 implementation brief — Deliver the clues and complete the mission

Status: not implemented
Applies to: the existing plain HTML/CSS/JavaScript Chemistry mission and shared SiTC progress
Design authority: `chemistry-game-design.md`, Chapter 6, Badge and replay, integration boundaries, and completion definition

This document is self-contained. It defines the final playable chapter, badge award, passport persistence, replay, and return behaviour.

## Learning outcome and boundaries

The player closes the loop between laboratory work and patient care: a checked report is sent to Ian's doctor, the doctor interprets it alongside other information, and the player recalls the laboratory journey.

Do not add treatment choices, medicine selection, a cure animation, emergency pressure, diagnosis, or a second scientist-review acknowledgement. Chapter 5 already completed scientific review.

## Entry contract

Chapter 6 begins only when Chapter 5 has a checked report.

Required incoming data:

- Ian's unchanged name, ID no., birthday, accession, and Glucose test.
- Chapters 1–5 complete.
- `report.checked === true`.
- The coherent measurement case (`above` or `within`) and matching doctor-dialogue variant.
- Existing sound, reduced-motion preference, current level, clue-strip state, and checkpoint functionality.

No badge or shared passport entry may exist solely because Chapter 6 was entered. Award happens only after both report delivery and recap completion.

## Stage model

Recommended stages:

| Stage | Purpose | Completion condition |
|---|---|---|
| `delivery-ready` | Checked report visible | Player selects Send checked report |
| `delivery-sending` | Brief safe delivery transition | Transition finishes or reduced-motion state applied |
| `clinic-report` | Doctor receives and discusses report | Dialogue acknowledged/finished |
| `recap` | Three-card order task | Correct order submitted |
| `mission-complete` | Badge award and replay/return | Terminal mission state |

Persist `report.sent`, `doctorAcknowledged`, `recapOrder`, `recapComplete`, and `badgeAwarded`. Badge persistence must be idempotent.

## Scene 1 — Send the checked report

Show the checked report from Chapter 5 with:

- Ian's identity.
- Accession.
- Glucose request.
- Result category and example-range comparison.
- “Scientist review complete”.
- A clear checked/reviewed status.

Primary action:

> Send checked report

This is a button, not an arbitrary paper drop target. It remains disabled until the saved report is valid and checked. Do not require another review acknowledgement.

After activation, show a brief delivery state such as the report moving into a secure send path or a simple “Sending checked report…” status. Reduced motion immediately changes to “Report sent”. Sound is optional.

Repeated clicks must not send or award twice. Refresh during sending restores a safe unsent ready state or a definitively sent state only if `report.sent` was already committed.

## Scene 2 — Return to the clinic

Reuse the established clinic visual language and Malta window. Show Ian with doctor and parent/carer as space allows; the doctor is the speaking focus. Do not substitute Nicky's emergency patient art for Ian.

For the default above-band case, doctor says:

> Thank you. I'll look at this glucose result together with Ian's symptoms and other information to decide what to do next.

For the within-band replay case, doctor says:

> Thank you. This glucose result is within the range shown. I'll use it with the other information to understand why Ian feels tired.

Ian says:

> Thank you for looking after my sample!

The dialogue is determined by the saved case variant. Refresh, retry, level change, or recap mistakes cannot switch it.

## Scene 3 — Three-card recap

Prompt:

> Put the laboratory journey in order.

Cards:

1. **Check and prepare** — identity matching, centrifuge/plasma, and QC are grouped as preparation/checking.
2. **Measure** — aliquot, reagent, reaction, and light reading.
3. **Review and report** — compare, scientist review, and delivery.

Shuffle the starting card order once on recap entry and save it. Do not reshuffle after a wrong submission, resize, rotation, or refresh.

Dragging is the primary interaction. Cards lift above the finger, slots have generous hit areas, valid drops snap, cards can be rearranged, and missed/cancelled drops return safely without counting as errors. Retain tap/select-then-slot and keyboard move controls.

### Junior

- Show three empty slots with picture/shape hints matching the intended cards.
- Highlight the next empty destination after a card is selected.
- A wrong submitted order gives a direct first-step hint without removing cards.

### Explorer and Challenge

- Show text and pictures but no positional hints.
- Both levels use the same scientifically accurate order; Challenge may use shorter guide text, not smaller targets.

Wrong submission:

> Start by checking and preparing the sample before it is measured.

After another wrong submission, highlight the first incorrect adjacent pair and explain the relationship. Do not introduce a timer, lives, stars lost, or badge penalty.

## Badge award

Award only after:

- The checked report was sent.
- Correct doctor dialogue was shown.
- The recap order is correct.

Completion heading:

> Clinical Chemistry Badge Earned!

Recap copy:

> You checked Ian's sample, prepared the plasma, checked the test, measured glucose, and helped his doctor.

Use a short badge reveal, optional gentle sound, and reduced-motion static reveal. Hints and retries never affect the badge.

## Shared passport persistence

Use shared key:

```text
sitcGameProgressV2
```

Add case ID `main` to `completedCases.chemistry` while preserving every existing and unknown field.

Required semantics:

```js
function awardChemistryMain(progress) {
  const next = structuredClone-or-equivalent(progress ?? {});
  if (!next.completedCases || typeof next.completedCases !== "object") {
    next.completedCases = {};
  }
  if (!Array.isArray(next.completedCases.chemistry)) {
    next.completedCases.chemistry = [];
  }
  if (!next.completedCases.chemistry.includes("main")) {
    next.completedCases.chemistry.push("main");
  }
  return next;
}
```

Implementation rules:

- Parse defensively.
- Preserve Transfusion, future laboratory, and unknown top-level data.
- Never replace the whole progress object with a Chemistry-only object.
- Avoid duplicate `main` entries.
- Commit logical mission completion before showing the celebration, but render the celebration even if storage is unavailable.
- If saving fails, say briefly that the badge could not be saved on this device; do not block or remove the earned in-session celebration.
- Reopening a completed checkpoint may show the badge screen but must not replay multiple writes or sounds.

The current hub has one Chemistry case. Completing `main` therefore satisfies both its badge and current mastery calculation. Review the hub wording so it does not promise additional Chemistry cases that do not exist.

## Replay and return controls

Provide:

- **Play a new version** — clears only the active Chemistry mission checkpoint, creates a new coherent case, preserves `sitcGameProgressV2`, and returns to the mission opening/level selection. A new case may choose a different valid measurement result variant.
- **Return to Clinical Chemistry** — links to `../` from `chemistry/main/`.
- The Chemistry hub retains its link back to the main SiTC laboratories.

Do not show a nonfunctional Continue button.

Changing level on the final badge screen starts a new case rather than revising the completed one. Generate the new birthday from the newly selected level's internal age range. Never alter the completed badge record.

## Chemistry hub completion updates

When the full mission ships, revise `chemistry/index.html`:

- Remove “MAIN MISSION · FIRST SECTION”.
- Remove “Available now: opening and sample reception.”
- Remove the message that more of the mission is in development.
- Describe the full journey without spoilers or diagnosis.
- Change the call to action to **Start mission** or **Play mission**, and if desired reflect saved/earned state using the shared passport without exposing age bands.

Do not add fake locked Chemistry cases or a future Master tier merely to fill space.

## Saving, refresh, and level behaviour

- Save immediately after report send, doctor acknowledgement, each recap placement, recap completion, and badge award.
- Refresh restores the same card order and placements.
- Rotation cancels an active card drag and returns it to its last valid slot.
- Portrait, Help, and Level dialogs pause delivery/celebration timers.
- Old callbacks cannot award the badge after the player starts a new case or returns to the lab.
- Changing difficulty during the unfinished recap restarts only Chapter 6 entry under the new level's hint rules while preserving the checked report, result, doctor dialogue, and Chapters 1–5.
- Once `mission-complete`, difficulty selection starts a genuinely new case rather than resetting only Chapter 6.

## Assets and reuse

Reuse:

- `ian-seated-v2.png`.
- Existing CSS clinic room and `malta-window-townscape-v2.png`.
- `paper-request-v2.png` as a blank paper base only if the checked-report overlay remains visually clear.
- Existing sample/analyser thumbnails for recap cards.
- Shared doctor artwork from Transfusion only if visual inspection confirms the clothing, pose, viewpoint, and emergency context fit this calm clinic; otherwise use the new Chemistry doctor asset in the remaining-assets brief.

Create:

- A Chemistry badge illustration or code-native badge face, following the asset brief.
- A versatile doctor pose and parent/carer only if reuse cannot meet the clinic composition.
- A scientist pose only if not already produced for Chapters 3/5.

Build as interface layers:

- Every report word and patient identifier.
- Checked/reviewed stamps.
- Delivery status.
- Doctor/Ian dialogue cards.
- Recap card text, slots, order state, and focus indicators.
- Badge title, earned state, and actions.

## Accessibility and responsive requirements

- Recap cards and slots have at least 48 CSS-pixel controls and clear accessible names including current position.
- Keyboard users can select a card and move it to a named slot or use explicit Move left/right controls.
- Correct order is announced in text; visuals and colour are supplementary.
- Doctor dialogue is readable and exposed in logical DOM order.
- Badge reveal does not flash or depend on sound.
- Phone landscape reflows characters away from dialogue/actions; text and recap controls remain reachable.
- Portrait blocks gameplay and preserves report/recap state.
- Focus moves to the badge heading on completion and to the appropriate heading after replay/return navigation.

## Verification checklist

- Complete above and within stories at Junior, Explorer, and Challenge.
- Confirm doctor dialogue exactly matches the saved result case.
- Verify report cannot be sent before Chapter 5 review.
- Verify no second review acknowledgement is required.
- Test every recap permutation, wrong submission, retry, drag rearrangement, missed drop, cancellation, tap path, and keyboard path.
- Refresh during send, clinic dialogue, partial recap, correct recap, and badge reveal.
- Rotate during card drag and transition; confirm safe pause/resume.
- Change level during partial recap and from the final badge screen.
- Verify badge is awarded only after send plus correct recap and is never duplicated.
- Begin with existing Transfusion and unknown progress fields; confirm they are byte-for-byte equivalent in meaning after Chemistry completion.
- Test corrupt/missing shared progress and unavailable storage.
- Confirm Play a new version preserves the badge and creates a new coherent Ian case.
- Confirm both return paths resolve correctly from the hosted subpath.
- Confirm hub wording reflects a complete mission and does not invent unavailable Chemistry content.
