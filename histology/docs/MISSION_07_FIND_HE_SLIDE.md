# Mission 7 — Find the H&E Slide

## Mission purpose

This standalone specification defines **Mission 7 of 7** in **The Histology Journey**. The scientific term is **Haematoxylin & Eosin (H&E) Staining**. The player identifies the H&E slide by its characteristic blue-purple nuclei and pink surrounding tissue.

## Entry and required output

Input: three large, side-by-side stained tissue images or microscope slides.

Output: the correctly identified purple-and-pink H&E slide, followed by the game-completion screen.

## Player-facing copy

- Title: **Find the H&E Slide**
- Question: **“Which one is the H&E slide?”**
- Options:
  - **Slide A – Green + Yellow**
  - **Slide B – Purple + Pink**
  - **Slide C – Blue + Violet**
- Hint: **“H&E usually makes the nuclei blue-purple and much of the surrounding tissue pink.”**
- Green + Yellow feedback: **“Not this one. H&E doesn't normally look green and yellow. Try again!”**
- Blue + Violet feedback: **“Nearly! Look for the slide that also has lots of pink. Try again!”**
- Purple + Pink feedback: **“YES! You found the H&E slide!”**
- Correct choice: **Slide B – Purple + Pink**
- Scientific term: **Haematoxylin & Eosin (H&E) Staining**
- Completion action: **FINISH**

## What the player sees

Show three equally sized, equally prominent stained tissue images or large slide cards side by side:

- Slide A: green-dominant tissue with yellow structures;
- Slide B: blue-purple nuclei and abundant surrounding pink tissue;
- Slide C: blue and violet tissue with little or no pink.

The three options must share the same specimen framing, magnification style, card size, detail level, and visual quality. Do not make the correct answer larger, brighter, centred differently, preselected, or uniquely decorated. Keep the supplied labels visible so colour-vision differences do not prevent participation.

## Interaction flow

1. Present the question and all three slide cards.
2. Provide an optional **Hint** control at every level.
3. Selecting Slide A displays its exact feedback and keeps all cards available.
4. Selecting Slide C displays its exact feedback and keeps all cards available.
5. Selecting Slide B displays **“YES! You found the H&E slide!”**, marks it correct with text/icon and colour, and locks the answer.
6. Enable **FINISH**.
7. Activating **FINISH** opens the mission-complete screen described below.

Do not shuffle the labels away from their supplied colours. If the visual card order changes responsively, each label must remain attached to its own image and its accessible name.

## Hint behaviour

The hint is optional and may be opened repeatedly without penalty. It must not submit an answer. On open, announce the exact hint text and visually point to representative blue-purple nuclei and pink tissue within Slide B without revealing it through a word such as “correct.”

In reduced motion, use static outlines and callouts rather than pulsing.

## Mission-complete screen

Show the finished H&E slide beside a microscope.

Display:

> **Mission Complete!**  
> **GREAT JOB, SCIENTIST!**

Scientist: **“You successfully prepared a histology sample!”**

Journey:

> Check the patient details  
> ↓  
> Prepare the tissue  
> ↓  
> Put it in a cassette  
> ↓  
> Process & embed the tissue  
> ↓  
> Make an FFPE wax block  
> ↓  
> Cut very thin sections  
> ↓  
> Put the section on a slide  
> ↓  
> Stain the tissue  
> ↓  
> Find the H&E slide!

Final message: **“Your H&E slide is now ready to be looked at under the microscope!”**

Closing heading: **WELL DONE, SCIENTIST!**

Buttons:

- **PLAY AGAIN** — create a new case and return to Mission 1.
- **FINISH** — return to the Histology landing page or SiTC hub according to host integration.

## State model

```text
question → incorrect_retry | correct_selected
  → finish_enabled → mission_complete
```

Persist open hint state, selected slide, feedback, completion, and whether the final screen has been reached. Refresh after a correct answer must not return to an unanswered state.

## Visual and interface specification

Use the SiTC palette: navy `#073C63`, blue `#087FC1`, cyan `#21C9DC`, gold `#FFC83D`, ink `#153344`, muted ink `#4B6675`, soft cyan `#DFF9FC`, and white `#FFFFFF`. Use success green `#08784F` and error red `#B51F3C` only with text/icons.

Scientific slide colours must remain clear and distinct. In the correct slide, use blue-purple nuclei and widespread eosin-pink tissue. Use rounded cards, bold child-friendly text, a scientist guide strip, and **Mission 7 of 7** in the game bar.

## Accessibility

- Each slide is a real button or radio-like choice with a visible label and accessible name.
- Provide 44-by-44-pixel minimum targets and visible keyboard focus.
- Do not require colour alone: labels name the colour pair, and feedback describes the relevant structures.
- Announce hint and answer feedback with `aria-live`.
- Maintain contrast without altering the scientific stain colours.
- Provide alt text describing the colour distribution without stating whether a slide is correct.
- No timer, attempt count, or penalty applies.

## Completion criteria and checks

- Slide B is the only correct answer.
- Slide B visibly contains blue-purple nuclei and abundant pink tissue.
- Each distractor triggers its own exact supplied feedback.
- The hint is optional, non-submitting, and accessible.
- Incorrect answers preserve all three choices.
- **FINISH** remains disabled until Slide B is selected.
- The completion screen reproduces the supplied journey, messages, and buttons.
