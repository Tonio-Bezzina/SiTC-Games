# Haematology Game: Identify the White Blood Cell

## Status

Planning document only. Development of the game has not started.

## Game concept

The player explores a peripheral blood scene containing five different white blood cells. The Junior and Explorer levels use cartoon-style cells, while the Challenge level uses realistic blood-cell images. The player clicks a cell, identifies its type, and then identifies its role.

The five white blood cells are:

1. Neutrophil
2. Lymphocyte
3. Monocyte
4. Eosinophil
5. Basophil

The game is complete when the player has correctly identified all five cells and matched each one to its role.

## Confirmed design decisions

- The game will have **Junior**, **Explorer**, and **Challenge** levels.
- Internal target age ranges are Junior: 7–9, Explorer: 10–12, and Challenge: 13–16.
- Ages must not be displayed on the level-selection screen or elsewhere in the player-facing level labels.
- Junior and Explorer will use cartoon-style illustrations.
- Challenge will use realistic white blood cell images.
- Cartoon cells must retain their scientifically recognisable features.
- The player will click or tap a white blood cell and then identify it from a set of answer buttons.
- Drag-and-drop is not required for the base game.
- Each white blood cell will be fully visible and easy to select.
- **No white blood cell, red blood cell, platelet, label, decoration, or interface element may overlap or obscure a selectable white blood cell at any level.**
- Incorrect answers will allow the player to try again.
- A cell is only marked complete after both its identity and role have been answered correctly.
- The game will provide a visible `0/5` to `5/5` progress indicator.
- Optional hints will be available at every level.
- No score, attempt count, accuracy percentage, timer, stars, or performance rating will be visible at any level.
- Player-facing wording will remain as similar as possible across all three levels and will use simple language children can understand.
- The wording will be reviewed and may be refined later.
- The cells will not be animated.
- Cartoon cells will not have faces or facial features.
- Spoken narration will not be used.
- Music and sound effects will not be used.
- The haematology game will use the same overall colour balance as the other SiTC games.

## Visual direction

The main scene should resemble a friendly microscope view of a peripheral blood sample. Its interface should follow the established visual style of the other games in the SiTC folder.

Shared SiTC interface characteristics include:

- The same navy, blue, cyan, white, and gold colour balance used by the other SiTC games
- Rounded panels, cards, buttons, and dialog boxes
- Clear, bold headings and child-friendly sans-serif text
- High-contrast controls and feedback
- A clean laboratory theme that feels welcoming rather than clinical or intimidating
- A consistent game bar, level control, help or hint access, and completion presentation where practical

The blood cells need their medically recognisable pink, red, purple, and orange staining colours inside the blood scene. These cell colours should be contained within the established SiTC interface so that the overall screen retains the same colour balance as the other games.

- Red blood cells form a soft pink background pattern.
- The five selectable white blood cells are larger and visually distinct.
- Each WBC has generous empty space around it and a large invisible touch target.
- The nucleus shape, granules, colour, and cell proportions are the main identifying features.
- Junior and Explorer cells must not have eyes, mouths, faces, or facial expressions. Their friendly appearance should come from rounded illustration shapes, clear colour, and an approachable art style.
- Challenge cells must use realistic imagery without cartoon faces or character features.
- Costumes, props, labels, or role-related accessories must not reveal a cell's identity before the player answers.
- Completed cells may receive a tick, glow, or badge after both questions have been answered correctly.
- Cells must remain static. Feedback may change borders, ticks, highlights, or surrounding interface elements, but the cells themselves must not move, bounce, speak, pulse, or perform celebration animations.

### Cell appearance guide

| Cell | Essential visual features | Illustration treatment |
| --- | --- | --- |
| Neutrophil | Pale cytoplasm and a segmented purple nucleus | Rounded and approachable, without a face |
| Lymphocyte | Large round nucleus with a thin rim of cytoplasm | Clear and simple, without a face |
| Monocyte | Large cell with a kidney-shaped or folded nucleus | Softly illustrated, without a face |
| Eosinophil | Bilobed nucleus and prominent orange-red granules | Bold granule pattern, without a face |
| Basophil | Dense dark-purple granules that partly veil the nucleus | Strong purple granule pattern, without a face |

## Level design

### Junior Scientist

- Bright, friendly artwork with strongly differentiated cells.
- Clear silhouettes and exaggerated—but accurate—identifying features.
- Simple instructions and large answer buttons.
- Simple role wording.
- Unlimited encouraging retries.
- Optional hints are available, with the clearest and most direct guidance of the three levels.
- A completed cell reveals its name in the main scene or checklist.

### Explorer

- The same cartoon world and core character designs as the Junior level.
- More realistic cell proportions and subtler colour differences.
- Less exaggerated nuclei and granules while remaining clearly readable.
- More red blood cells may be used in the background, provided none overlap or obscure a WBC.
- Answer choices may be shuffled.
- Reduced guidance compared with the Junior level.
- Difficulty must come from recognition and knowledge, not from hiding cells or making them hard to click.

### Challenge

- Realistic images of the five white blood cells rather than cartoon illustrations.
- A realistic peripheral blood-smear appearance with scientifically accurate nuclei, granules, colour, texture, and cell proportions.
- One clearly recognisable example of each required WBC type.
- Background red blood cells may be more realistic and numerous, but they must never overlap or obscure a selectable WBC.
- All five WBCs must remain clearly separated and easy to click or tap.
- Answer choices may be shuffled.
- Less guidance than the Junior and Explorer levels, while retaining an optional hint for every question.
- The same simple instructions, question structure, role wording, feedback, and completion flow used in the other levels wherever possible.
- Difficulty must come from interpreting realistic cell morphology, not from tiny targets, overlapping cells, visual obstruction, trick wording, time pressure, or scoring.

### Level-selection presentation

The player-facing level choices should be:

- **Junior** — More guidance
- **Explorer** — Some guidance
- **Challenge** — Realistic cells and fewer clues

Do not show age ranges on this screen. The age ranges are internal design guidance only.

Every level should make it clear that the player may use a hint if needed and that completing the learning activity is more important than performance measurement.

## Base screen layout

The main game screen contains:

- Game title: **Identify the White Blood Cell**
- Short instruction: **Click a white blood cell to begin**
- Illustrated peripheral blood scene
- Five selectable WBCs, each placed separately with clear space around it
- Progress indicator, such as **Cells identified: 0/5**
- Checklist for the five cell types
- Optional **Hint** button
- Optional **How to Play** button

The layout must work with mouse, touchscreen, and keyboard input. On smaller screens, the checklist may move below the blood scene rather than reducing the selectable cells to an unusable size.

## Core game flow

1. The player chooses **Junior**, **Explorer**, or **Challenge**. No ages are shown.
2. The blood-smear scene appears with five unlabelled WBCs.
3. The player clicks or taps any uncompleted WBC.
4. The selected cell appears enlarged in a question card.
5. The player answers: **What type of white blood cell is this?**
6. If the answer is incorrect, the player is encouraged to try again.
7. If the answer is correct, the game asks for that cell's role.
8. If the role is incorrect, the player remains on the role question and tries again.
9. If the role is correct, the cell is marked complete and progress increases by one.
10. The player returns to the blood scene and chooses another uncompleted cell.
11. After all five cells are complete, the celebration screen appears.

The same core flow and wording should be used at all three levels. The principal differences are the visual realism and the amount of guidance.

## Part 1: Cell identification

The selected WBC is enlarged and shown with five answer buttons:

- Neutrophil
- Lymphocyte
- Monocyte
- Eosinophil
- Basophil

### Feedback

Incorrect answer:

> Not quite. Please try again!

Correct answer:

> Great job! Now can you tell me the role of this white blood cell?

The identification question remains open after an incorrect answer so the player can immediately try again.

An optional hint is available at every level. A hint should draw attention to a useful scientific feature, such as the shape of the nucleus or the presence and colour of granules. It should guide observation without directly supplying the answer.

### Identification hint text

Use the following simple hint text at all three levels. The player only sees a hint after choosing the optional **Hint** button.

| Cell being shown | Hint text |
| --- | --- |
| Neutrophil | **Look at the nucleus. Can you see several purple sections joined together?** |
| Lymphocyte | **Look for one large, round, dark-purple nucleus with only a thin edge of cytoplasm around it.** |
| Monocyte | **Look for a large cell with plenty of pale blue-grey cytoplasm and a bent or kidney-shaped nucleus.** |
| Eosinophil | **Look for a nucleus with two sections and lots of large orange-red granules.** |
| Basophil | **Look for many dark blue-purple granules. They may make the nucleus difficult to see.** |

These hints are based on normal WBC morphology described by the [NCBI Bookshelf overview of white blood cell histology](https://www.ncbi.nlm.nih.gov/books/NBK563148/?report=printable) and illustrated in the [American Society of Hematology Image Bank](https://imagebank.hematology.org/atlas-images). The wording is paraphrased and simplified for children.

## Part 2: Cell role

The player chooses from the five available roles. The answer order should be shuffled where appropriate.

| Cell | Base role text |
| --- | --- |
| Neutrophil | Fights bacteria by attacking germs that enter the body. |
| Lymphocyte | Helps make antibodies and destroys virus-infected cells. |
| Monocyte | Engulfs germs and helps clear away dead cells. |
| Eosinophil | Helps fight parasites. |
| Basophil | Releases substances that cause inflammation during allergic reactions. |

### Feedback

Incorrect answer:

> Not quite. Please try again!

Correct answer:

> That's right! Well done!

The role question remains open after an incorrect answer. When the correct role is selected, the player returns to the main scene and the cell is marked complete.

An optional role hint is available at every level. It should provide a short clue without revealing the full answer immediately.

### Role hint text

| Cell being shown | Hint text |
| --- | --- |
| Neutrophil | **Think about the body's quick response when bacteria enter.** |
| Lymphocyte | **Think about antibodies and cells that have been infected by viruses.** |
| Monocyte | **Think about a large clean-up cell that can swallow germs and clear away dead cells.** |
| Eosinophil | **Think about the white blood cell that helps the body fight parasites.** |
| Basophil | **Think about histamine, inflammation, and allergic reactions.** |

The role hints are based on the functions summarised in [Molecular Biology of the Cell via NCBI Bookshelf](https://www.ncbi.nlm.nih.gov/books/NBK26919/) and the [NCBI Bookshelf white blood cell histology overview](https://www.ncbi.nlm.nih.gov/books/NBK563148/?report=classic). The wording is paraphrased and simplified for children.

## Progress and completed cells

- Progress begins at `0/5` and reaches `5/5`.
- The checklist updates after both questions for a cell are correct.
- Completed cells receive a clear visual state, such as a green tick or gentle glow.
- Completed cells should not be accidentally selectable as new questions.
- The player should always be able to tell which cells remain.
- Do not display scores, accuracy, attempt totals, timers, stars, or comparative performance messages.

## Completion screen

After all five cells and roles have been correctly identified, show:

> **You're an incredible scientist!**  
> You identified all five white blood cells and their roles. Well done!

Suggested buttons:

- **Play Again**
- **Review the Cells**
- **Choose Another Level**

Keep the completion wording the same across all three levels where possible.

## Accessibility and usability requirements

- Do not rely on colour alone to distinguish cells, answers, or completion states.
- Use large touch targets and readable text.
- Provide visible keyboard focus states.
- Allow the answer buttons and selectable WBCs to be operated with a keyboard.
- Use clear feedback text together with visual highlighting.
- Do not use flashing effects.
- Do not use music, sound effects, or spoken narration.
- Do not display a sound or mute control because the game has no audio.
- Do not animate the white blood cells.
- Maintain strong contrast between text, controls, and the illustrated background.

## Reference image notes

The supplied reference image is useful for understanding the distinguishing features of the cells. It should not be copied directly into the game because it contains labels, a platelet, many background cells, and both an immature band neutrophil and a mature segmented neutrophil.

Every level should use one clearly recognisable mature neutrophil and one example of each of the other four WBC types. The reference should inform both the cartoon morphology used for Junior and Explorer and the realistic imagery used for Challenge.

## Items still to confirm

- Source and approval process for the realistic Challenge images
- Final wording after educational review

## Out of scope for the current planning stage

- Building the playable game
- Producing final artwork or realistic cell imagery
- Choosing the implementation technology
- Adding expert, timed, scored, competitive, or performance-ranked modes


