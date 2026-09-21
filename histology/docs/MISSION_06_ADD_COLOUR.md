# Mission 6 — Add Colour to the Tissue

## Mission purpose

This standalone specification defines **Mission 6 of 7** in **The Histology Journey**. The scientific term is **Histological Staining**. The player learns that staining adds contrast so different parts of the tissue can be seen more clearly.

## Entry and required output

Input: the accepted patient's unstained microscope slide.

Output: a group of stained-slide choices ready for the H&E recognition task in Mission 7. This mission has no machine-choice question; the staining machine is the only destination.

## Player-facing copy

- Title: **Add Colour to the Tissue**
- Instruction:
  - **“Our tissue is on the slide, but we need to add colour so we can see the cells more clearly.”**
  - **“Drag the slide into the Staining Machine!”**
- Visible animation text: **WHOOSH…**
- Visible completion text: **DING!**
- Scientist: **“Great! Staining adds colour to the tissue so we can see its different parts more clearly.”**
- Then: **“Your stained slides are ready!”**
- Scientific term: **Histological Staining**
- Completion action: **NEXT: Can you find the H&E slide?**

## What the player sees

Show the unstained slide on a clean laboratory bench beside a clearly labelled **Staining Machine**. The machine has one obvious slide-loading area and a generous interactive target. Do not display alternative machines during this mission.

## Interaction flow

1. Display both instruction lines.
2. Activate the unstained slide and the staining-machine drop zone.
3. The player drags the slide into the machine, or uses tap/select-then-target or keyboard controls.
4. Once correctly placed, lock the slide in the machine and pause so the player can inspect the loaded state. Enable **NEXT**.
5. When the player presses **NEXT**, display **WHOOSH…** while a colourful staining state shows the slide travelling through the machine. Pause again until the player presses **NEXT**.
6. On the next press, show visible **DING!** and reveal the finished stained-slide state or the tray that will lead to Mission 7.
7. Show the scientist explanation, followed by **“Your stained slides are ready!”**
8. Enable **NEXT: Can you find the H&E slide?**

Dropping outside the machine returns the slide to its safe starting position with a gentle cue. It is not a scientific error. The player does not select stains, timings, chemicals, or programmes in this simplified mission.

## Animation rules

- Use colour movement to communicate staining, but do not flash or rapidly alternate the entire screen.
- Keep **WHOOSH…** and **DING!** as visible words even if optional sound is ever added later.
- Sound is not required and no information may depend on it.
- Never move to the next teaching state automatically. Each transition after loading is controlled by the visible **NEXT** button so the player has time to read and inspect the scene.
- Reduced motion uses static labelled states or a gentle crossfade:

```text
Unstained slide → Inside staining machine → Stained slides ready
```

- If interrupted, restore the exact player-controlled stage. Never lose or duplicate the case slide.

## State model

```text
transfer_ready → slide_in_machine → staining
  → stained_slides_ready → complete
```

Persist slide position, whether the machine has started, whether the staining sequence has completed, and mission completion. Do not replay the animation on every resume after completion.

## Visual and interface specification

Use the SiTC palette: navy `#073C63`, blue `#087FC1`, cyan `#21C9DC`, gold `#FFC83D`, ink `#153344`, muted ink `#4B6675`, soft cyan `#DFF9FC`, and white `#FFFFFF`. Use success green `#08784F` with text/icon for the completed machine state.

Reserve vivid purple, pink, green, yellow, blue, and violet for the staining visuals and resulting tissue imagery. These scientific colours should sit inside the navy-blue-cyan SiTC interface rather than recolouring the whole UI. Include rounded panels, a scientist guide strip, and **Mission 6 of 7** in the game bar.

## Accessibility

- Give the slide, machine, loading area, and fallback buttons accessible names.
- Support mouse, touch, keyboard, and tap/select interaction.
- Use a 44-by-44-pixel minimum target and a generous drop zone.
- Announce loading, staining, and completion states with `aria-live`.
- Do not rely on sound or colour alone; use the visible words and status labels.
- Prevent page scrolling during drag.
- Reduced motion carries the same teaching content.

## Completion criteria and checks

- The only required action is putting the unstained slide into the staining machine.
- The machine can advance only after a valid placement, and every later state change requires the player to press **NEXT**.
- **WHOOSH…** and **DING!** appear visibly in the correct order.
- Both scientist messages appear after completion.
- The output is ready for the three-choice H&E recognition mission.
- The transition action remains disabled until staining completes.

