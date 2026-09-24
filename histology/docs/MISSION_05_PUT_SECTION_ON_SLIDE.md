# Mission 5 — Put the Section on a Glass Slide

## Mission purpose

This standalone specification defines **Mission 5 of 7** in **The Histology Journey**. The scientific term is **Slide Preparation**. The player learns that a very thin tissue section is transferred to a glass microscope slide so it can later be stained and examined.

## Entry and required output

Input: the accepted patient's very thin tissue section or ribbon emerging from the microtome.

Output: one intact tissue section positioned on a glass microscope slide, revealed as an **UNSTAINED SLIDE**.

## Player-facing copy

- Title: **Put the Section on a Glass Slide**
- Question: **“We've cut a super-thin section. Where should we put it?”**
- Options:
  - **On a glass microscope slide**
  - **Back into the cassette**
  - **Into the bin**
- Correct choice: **On a glass microscope slide**
- Correct feedback: **“Exactly! The thin tissue section goes onto a glass microscope slide.”**
- Reveal: **UNSTAINED SLIDE**
- Scientist:
  - **“We have our microscope slide, but the tissue is difficult to see.”**
  - **“It needs some colour!”**
- Incorrect feedback: **“We need to keep our thin tissue section so we can look at it under a microscope. Try again.”**
- Scientific term: **Slide Preparation**
- Completion action: **NEXT**

## What the player sees

Show the thin tissue section or ribbon and three large objects on a clean laboratory bench:

1. a blank glass microscope slide;
2. the prior histology cassette, still visibly printed with **HIST-931222** on its built-in writing panel;
3. a laboratory waste bin.

Each object also has a visible text label matching its answer option. The slide must have a clear frosted label end and a transparent viewing area.

## Interaction flow

1. Present the question and three choices.
2. Selecting the cassette or bin shows the exact incorrect feedback and leaves all choices available.
3. Selecting the glass slide locks the answer and shows the exact correct feedback.
4. Transfer the tissue section onto the viewing area of the glass slide with a short animation or player-assisted drag.
5. If player-assisted, also support tap/select-then-target and keyboard operation. Use a generous drop zone and do not require exact alignment.
6. Snap and centre the tissue section on the slide.
7. Reveal **UNSTAINED SLIDE** and show both scientist lines.
8. Enable **NEXT**.

If the transfer is animated automatically after the correct answer, it must still include text explaining what moved and where. Do not add a water-bath subtask or further slide-preparation steps unless separately approved.

## State model

```text
question → glass_slide_selected → transfer_ready
  → section_on_slide → unstained_slide_reveal → complete
```

Persist the selected answer, section position, whether the section is on the slide, and completion. Resume at a safe static state if the transfer is interrupted.

## Visual and interface specification

Use the SiTC palette: navy `#073C63`, blue `#087FC1`, cyan `#21C9DC`, gold `#FFC83D`, ink `#153344`, muted ink `#4B6675`, soft cyan `#DFF9FC`, and white `#FFFFFF`. Use success green `#08784F` and error red `#B51F3C` with text/icons.

The glass slide should remain visible on a contrasting blue/cyan bench mat. The unstained section should be pale and deliberately hard to distinguish, while retaining a subtle outline so the player can still perceive it. Use rounded panels, a scientist guide strip, and **Mission 5 of 7** in the game bar.

## Accessibility

- All three object choices require visible text labels and accessible names.
- Use 44-by-44-pixel minimum targets and visible keyboard focus.
- Support mouse, touch, keyboard, and tap/select interaction where transfer is interactive.
- Use `aria-live` for feedback and the unstained-slide reveal.
- Do not rely on transparency alone; outline and label the unstained section.
- Reduced motion uses a direct before/after state.

## Completion criteria and checks

- Only the glass microscope slide is correct.
- Both distractors use the exact retry message and do not remove the tissue.
- The thin section ends on the slide's viewing area.
- **UNSTAINED SLIDE** and both scientist lines appear after transfer.
- **NEXT** remains disabled until the reveal is complete.

