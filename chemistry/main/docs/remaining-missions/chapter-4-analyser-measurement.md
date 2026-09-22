# Chapter 4 implementation brief — Discover what happens inside

Status: not implemented
Applies to: the existing plain HTML/CSS/JavaScript mission in `chemistry/main/`
Design authority: `chemistry-game-design.md`, Chapter 4 and the shared interaction, difficulty, visual, persistence, and verification rules

This document is self-contained. It defines the complete Chapter 4 build, its dependencies, state, interactions, artwork, copy, accessibility, saving, completion gate, and verification.

## Learning outcome and boundaries

The player follows one simplified glucose colour-reaction method from a small aliquot of Ian's plasma to an analyser reading:

1. Take a little sample.
2. Add glucose reagent.
3. Mix and allow the colour reaction to develop.
4. Measure the reaction with light and obtain a settled reading.

This is a teaching cutaway, not a literal claim that scientists manually perform four button presses for every routine sample. It must not imply that Ian's blood glucose changes during the animation, that the graph directly displays mmol/L, or that a child can diagnose him by colour. Do not add reagent branding, clinical cutoffs, instrument speeds, exact timings, or operating parameters.

## Entry contract

Chapter 4 starts only after Chapter 3 has a correctly accepted passing quality-control result.

Required incoming data:

- Ian's unchanged `name`, five-digit-plus-H/L `id`, `dob`, `accession`, and requested `test: "Glucose"`.
- Ian's prepared grey-top bottle with straw-coloured plasma above red cells.
- Chapters 1–3 marked complete.
- A case-level result variant selected once and saved. At minimum support `above` as the default story and `within` as a replay variant. The result variant, reaction appearance, graph endpoint, Chapter 5 category, and Chapter 6 doctor dialogue must be generated as one coherent case; never reroll it after entry, refresh, resize, retry, or level change.

If an older version-3 checkpoint ends at `qc-complete`, migrate it to the new Chapter 4 entry checkpoint without changing Ian or the saved QC history.

## Chapter stages

Recommended stage model:

| Stage | Purpose | Safe refresh state |
|---|---|---|
| `analyser-entry` | Scan/load Ian and choose glucose | Restore current tube location and selected tile |
| `analyser-zoom` | Short transition into teaching cutaway | Restore at cutaway introduction, not halfway through a fade |
| `analyser-sample` | Move probe to plasma and dispense aliquot | Preserve whether aliquot is in the reaction cup |
| `analyser-reagent` | Add glucose reagent | Preserve reagent-added state |
| `analyser-reaction` | Start mixing/colour development | Restore to a safe ready-to-start or completed reaction state |
| `analyser-light` | Run light reading and live graph | Restore to ready-to-read or completed trace; never mark complete from a stale timer |
| `analyser-compare` | Explorer/Challenge colour-strength extension | Preserve selected demonstration cup and feedback |
| `analyser-complete` | Chapter gate and transition to report | Keep final result variant and completed trace |

Add a dedicated `chapter3Complete`, `chapter4Complete`, and `analyser` state rather than inferring all progress only from the current screen. Increment and migrate the checkpoint schema deliberately; validate every new object before resuming.

## Scene 1 — Exterior hand-off

Reuse:

- `analyser-exterior-v1.png`.
- `ian-separated-v1.png` with editable HTML identity label.
- `sample-rack-clean-v3.png` if it fits the analyser composition; otherwise create the patient-rack layer specified in the asset brief.
- The established analyser bench treatment, top controls, and guide strip.

Show Ian's prepared sample in a patient rack separate from QC materials. QC is complete, so the QC vial no longer competes for attention.

Required actions:

1. Drag Ian's prepared bottle to the highlighted patient-rack/scanner position. Tap/select-then-target and keyboard must work identically.
2. The analyser screen confirms Ian's name, ID no., birthday, accession, and “Requested test: glucose”.
3. Present a small set of clearly labelled test tiles. Glucose is the only tile matching the request. Other tiles may be visually present but must not create false clinical claims.
4. Select **Glucose**.

Wrong tile feedback:

> Ian's request says glucose. Choose the glucose test.

A missed bottle drop returns safely and is not an error. Ian's sample may be returned to its rack before test selection, but it must never duplicate.

Guide:

> Let's zoom inside and see one way the analyser measures glucose.

## Scene 2 — Magnified teaching cutaway

Transition the analyser housing into a cutaway labelled:

> Inside the analyser — a simplified view

Keep Ian's accession and a small image of his original grey-top bottle visible throughout so the cutaway remains connected to the accepted patient. Add a subtle four-part progress strip:

> Sample → Reagent → Reaction → Light

Only the currently relevant tool is active. Completed parts remain visibly complete. Decorative equipment must not look draggable.

### Part 1 — Take a little

Primary action: drag the teaching-view sample probe to the highlighted plasma target in Ian's bottle, then to the reaction-cup target if the visual sequence needs two destinations. A tap sequence and keyboard equivalent must be available.

Visible response:

- The probe enters only the upper straw-coloured plasma layer.
- A small aliquot moves through the teaching path into a clear reaction cup.
- Most of Ian's plasma visibly remains in the original bottle.
- The original patient label stays unchanged.

Copy:

> The analyser uses a tiny amount of the sample.

Wrong target:

> Take the sample from the liquid above the cells.

Do not transform the entire tube contents or remove the red-cell layer.

### Part 2 — Add the reagent

Primary action: drag the glucose reagent/dispenser to the highlighted reaction-cup target.

Visible response: a small reagent addition enters the reaction cup. Ian's original tube does not change colour.

Copy:

> This reagent helps us measure glucose.

If the player tries to start reaction or light early:

> Add the sample and reagent before starting the reaction.

Dropped tools outside a valid target return safely without counting as errors.

### Part 3 — Mix and react

Primary action: activate **Start reaction** after sample and reagent are present.

Visible response:

- The separate reaction cup mixes.
- Its contents develop a case-consistent colour.
- A text status progresses from “Mixing” to “Colour developing” to “Ready for light reading”.
- The cutaway makes clear that the colour is in the reaction cup, not in Ian's original bottle.

Copy:

> The reaction produces a colour we can measure.

Reduced motion replaces swirl/motion with discrete labelled states. Skip animation may finish the visual reaction, but it cannot skip the required sample and reagent actions.

### Part 4 — Measure with light

Primary action: activate **Start light reading**.

Visible response:

- A light beam crosses the reacting mixture and reaches the detector.
- A live graph beside the cup reveals progressively.
- A moving point follows the trace until it settles at the saved case endpoint.
- The detector and graph show matching activity.

Copy:

> Watch the reading change as the reaction develops.

Graph labels:

- Horizontal: **Reaction time**.
- Vertical: **Light absorbed**.
- Explorer/Challenge may show **Absorbance** as a secondary term.
- Use a schematic signal scale with no invented clinical units.

The trace begins near baseline, rises as colour develops, and approaches a plateau. It is a compressed educational reaction trace, not Ian's blood glucose changing over time. The final concentration/category comes from the analyser after a valid reading; the player never converts graph height into a glucose result.

## Level behaviour

### Junior

- Highlight each active tool and destination.
- One short instruction at a time.
- The graph runs automatically after Start light reading.
- Status text says “The reading is changing…” and then “The reading is steady.”
- Continue automatically to the final analyser result after the steady state is visibly explained.

### Explorer

- Fewer target highlights before the first attempt.
- After the trace begins, require the player to select **Use reading** only when the graph is settled.
- An early selection says: “Wait for the reading to settle.”
- After the main reaction, show two labelled demonstration cups and ask which has the stronger colour. Pair colour with a pattern/fill-strength or text description.
- Explain: “In this example, a stronger colour corresponds to more glucose within the method's working range.”

### Challenge

- Same required actions and colour comparison as Explorer.
- Explain how more absorbed light creates a stronger signal, using “absorbance” as the secondary term.
- Do not remove status text or make axes tiny; difficulty is interpretation, not readability.

Changing difficulty while this chapter is unfinished restarts at `analyser-entry` with Ian's already prepared sample and accepted QC preserved. Preserve the case result variant, reaction strength, final dialogue choice, and completed earlier chapters. Cancel all active drags, graph frames, timers, and transition callbacks before rebuilding.

## Graph and animation implementation

Build the graph as an HTML/SVG interface layer, not raster artwork. It needs independent axes, trace, moving point, status, marker, and final state. A single normalized path can be scaled responsively; store a deterministic endpoint/strength for each case variant.

Use animation state driven from saved logical phases, not animation completion events alone. Pause requestAnimationFrame/timers when:

- Portrait overlay is active.
- Level or Help dialog is open.
- The page is hidden or loses focus if progression would otherwise continue unseen.

On resume, continue from the remaining illustrative duration or restore the safe completed visual only if the logical action was already recorded complete. A stale callback from a previous level/chapter must not reveal a result.

Reduced motion and **Skip animation** immediately show the completed trace, final mixture, detector state, and “Reading steady” label. Explorer/Challenge must still make the settled-reading decision and colour comparison.

## Case consistency contract

Add a saved case measurement object similar to:

```js
measurementCase: {
  category: "above" | "within",
  reactionStrength: "strong" | "moderate",
  graphVariant: "highPlateau" | "midPlateau",
  reportMarker: 0.78 | 0.52,
  doctorDialogue: "above" | "within"
}
```

Values are illustrative normalized positions, not clinical units. Validate allowed enums and numeric bounds on resume. All five properties must agree. The default new story is `above`; replay may choose `within`. Never change category as feedback for a wrong action.

## Asset and layer plan

Reuse existing analyser exterior and Ian tube. Create only the missing illustrated layers listed in `remaining-assets.md`:

- Analyser cutaway background/housing.
- Teaching probe.
- Reagent dispenser/reservoir.
- Clear reaction cup.
- Light source/detector if these cannot be cleanly represented as DOM/CSS within the cutaway.

Create in HTML/CSS/SVG:

- Progress strip and completion marks.
- Highlighted targets and generous hit regions.
- Aliquot path/liquid movement.
- Reagent drop/path.
- Reaction-cup liquid fills and colour states.
- Light beam.
- Graph axes, trace, point, status, and settled marker.
- Patient identity/accession label and every readable word.

Do not bake labels, scales, coloured liquid, graph lines, or selectable zones into the background.

## Completion gate and hand-off

Chapter 4 is complete only after:

- Ian's correct prepared tube is scanned and loaded.
- Glucose is selected.
- A plasma aliquot enters the reaction cup.
- Correct reagent is added.
- Reaction/mixing reaches its complete logical state.
- Light measurement reaches a settled reading.
- Explorer/Challenge correctly choose Use reading and complete the colour-strength comparison.

Persist `chapter4Complete = true`, retain the complete trace/result case, and transition to Chapter 5's reporting monitor. Do not award a badge or show doctor dialogue yet.

## Responsive and accessibility requirements

- Design first for desktop/tablet landscape and 844×390 short phone landscape.
- Preserve at least 48×48 CSS-pixel targets with larger invisible hit areas around the probe and dispenser.
- Lift dragged tools above the finger and offset them so the destination remains visible.
- Ensure graph labels, cup, detector, and active control remain simultaneously visible; reduce background decoration rather than essential text.
- Every drag has tap/select and keyboard equivalents with visible selected-object text.
- Status changes use text and symbols as well as motion/colour.
- The light beam and reaction colour are never the sole indicators.
- Full keyboard focus order follows progress: tube → rack → test tile → active tool → target/action → graph decision.
- Portrait completely blocks interaction and pauses the active sequence without losing or duplicating aliquots/reagent.

## Verification checklist

- Complete Junior, Explorer, and Challenge from a valid Chapter 3 checkpoint.
- Verify incorrect test tile, wrong tool order, wrong target, missed drops, cancellation, repeated clicks, and early Use reading.
- Verify the original tube never changes reaction colour and most plasma remains.
- Verify every case variant's reaction, graph, report marker, and future dialogue agree.
- Complete by drag, tap-only, and keyboard-only.
- Check muted sound, reduced motion, Skip animation, and full-screen denial.
- Refresh at every listed stage and during every animation.
- Rotate during each drag, zoom, mixing, and live graph; confirm no background progress.
- Open Level/Help during mixing and graph; confirm pause and safe resume.
- Switch between every pair of levels mid-chapter; confirm only Chapter 4 resets.
- Test desktop, tablet landscape, short phone landscape, and enlarged text.
- Confirm axes and controls are not clipped and no clinical units or diagnosis appear.
- Confirm Chapter 5 receives the same Ian identity and saved result category.
