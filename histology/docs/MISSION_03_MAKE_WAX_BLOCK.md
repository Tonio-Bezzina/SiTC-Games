# Mission 3 — Make a Wax Block

## Mission purpose

This standalone specification defines **Mission 3 of 7** in **The Histology Journey**. The scientific term is **Tissue Processing & Paraffin Embedding**. The player chooses the correct equipment and observes the cassette tissue becoming an FFPE wax block.

## Entry and required output

Input: the labelled histology cassette containing the accepted patient's tissue.

Output: a completed paraffin wax block containing the tissue, labelled as an FFPE block. Preserve the same patient/case identity without generating a new specimen.

## Player-facing copy

- Title: **Make a Wax Block**
- Question: **“Our tissue is in its cassette. Where should it go next?”**
- Options:
  - **Processor & Embedding Centre**
  - **Microtome**
  - **Staining Machine**
- Correct choice: **Processor & Embedding Centre**
- Correct feedback: **“Correct! The tissue needs to be processed and embedded in wax.”**
- Incorrect feedback: **“Not yet! Our tissue isn't ready for that machine. Try again.”**
- Reveal heading: **WAX BLOCK**
- Reveal definition: **FFPE Block – Formalin-Fixed Paraffin-Embedded Tissue**
- Scientist: **“Look! We've made a wax block!”**
- Scientific term: **Tissue Processing & Paraffin Embedding**
- Completion action: **NEXT**

## What the player sees

Show the tissue cassette on a laboratory bench and three clearly labelled equipment choices:

1. Processor & Embedding Centre
2. Microtome
3. Staining Machine

Equipment silhouettes must be distinct, but the player must still use the visible text labels. Do not make a wrong answer look damaged, dangerous, or joke-like.

## Interaction flow

1. Present the question, cassette, and three equipment choices.
2. Selecting the microtome or staining machine shows the exact incorrect feedback and keeps all options available.
3. Selecting **Processor & Embedding Centre** locks the equipment choice and shows the exact correct feedback.
4. Run a short explanatory sequence:
   1. cassette enters the tissue processor;
   2. a compact processing indicator shows that the tissue is prepared;
   3. tissue is positioned in an embedding mould;
   4. paraffin wax fills the mould;
   5. the wax sets;
   6. a completed FFPE block appears.
5. Show the reveal heading, expansion of **FFPE**, and scientist line.
6. Enable **NEXT** only after the block reveal is complete.

This sequence is a simplified educational representation. Do not introduce chemical recipes, durations, temperatures, or additional procedural steps not supplied in the brief.

## Animation behaviour

The animation should last only long enough to explain the transformation. Use gentle movement, a progress path, and before/after states. Do not use flashing or require interaction during the animation.

Reduced-motion mode must show three static labelled panels or an immediate crossfade:

```text
Tissue in cassette → Process and embed in wax → FFPE wax block
```

If interrupted, restore either the unprocessed cassette state or the completed wax-block state; never duplicate or lose the tissue.

## State model

```text
question → equipment_selected → processing
  → embedding → wax_block_reveal → complete
```

Persist selected equipment, animation step, reduced-motion preference, whether the wax block has been created, and completion. Reloading after the correct choice may safely resume at the reveal rather than replaying a partial animation.

## Visual and interface specification

Use the SiTC palette: navy `#073C63`, blue `#087FC1`, cyan `#21C9DC`, gold `#FFC83D`, ink `#153344`, muted ink `#4B6675`, soft cyan `#DFF9FC`, and white `#FFFFFF`. Use success green `#08784F` and error red `#B51F3C` with text/icons.

The tissue block should use pale translucent cream paraffin with a clearly visible embedded pink tissue piece and a cassette base. Use rounded panels, bold child-friendly text, high contrast, a scientist guide strip, and **Mission 3 of 7** in the game bar.

## Accessibility

- Equipment options are real buttons with visible text and accessible names.
- Provide 44-by-44-pixel minimum targets and visible keyboard focus.
- Announce answer feedback and the final wax-block reveal with `aria-live`.
- Provide a text alternative for every visual processing step.
- Do not rely on movement, sound, or colour to explain the transformation.
- No input is required while the animation runs.

## Completion criteria and checks

- Only **Processor & Embedding Centre** is correct.
- Both incorrect choices use the exact supplied retry message.
- The transformation visibly begins with the cassette and ends with one FFPE wax block.
- The full term **Formalin-Fixed Paraffin-Embedded Tissue** is displayed.
- Reduced-motion mode conveys the same scientific sequence.
- **NEXT** is disabled until the wax-block reveal.
