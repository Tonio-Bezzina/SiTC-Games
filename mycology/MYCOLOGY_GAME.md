# The Mycology Journey Game Specification

## Product definition

**Title:** The Mycology Journey
**Player promise:** Become a Junior Mycologist by following one fictional skin-scraping investigation through the laboratory.
**Audience:** ages 8–14, with optional adult/educator guidance.
**Tone:** curious, encouraging, calm, colourful, scientifically respectful, and never frightening.
**Architecture:** static HTML, CSS, JavaScript, SVG, and PNG; no build step; all runtime paths relative to `/SiTC-Games/mycology/`.

The game is an educational simulation. It does not teach specimen collection, prescribe treatment, reproduce a clinical method, or produce a diagnosis. The player only makes reasoning and observation choices in a fictional laboratory.

## Learning goals

The player will be able to:

1. recognise basic laboratory safety and tidy-workspace behaviours;
2. match common specimen types with the body site being investigated;
3. explain why specimen identifiers and request forms must agree;
4. describe microscopy and culture as different sources of evidence;
5. recognise mould-like culture growth without treating appearance as a diagnosis;
6. follow a simplified phenotype key using colony and microscopic clues;
7. explain MIC as the lowest displayed concentration with no visible growth in the simulation; and
8. order the main stages of the fictional laboratory journey.

## First scene and difficulty

The first rendered scene is always difficulty selection. No mission state is created until the player activates one of these buttons:

- **Junior — Ages 8–10, more guidance.** Persistent instruction, visible glossary, hint after one incorrect attempt, and highlighted next target.
- **Explorer — Ages 10–12, balanced guidance.** Standard instruction, optional hints, and target highlight after two incorrect attempts.
- **Challenge — Ages 12–14, fewer prompts.** Concise instruction, optional hints, and no automatic target highlight.

Correct answers, mission order, scientific content, safety boundaries, completion conditions, required interactions, and hub award are identical at every difficulty. Difficulty changes guidance density, clue timing, distractor order, and whether labels are initially expanded. It never changes medical facts, creates time pressure, hides accessibility text, or penalises mistakes.

Opening copy:

- Eyebrow: **THE MYCOLOGY JOURNEY**
- Heading: **Become a Junior Mycologist!**
- Body: **Follow one specimen through the laboratory, collect every clue, and solve the fungal mystery. Choose how much guidance you would like.**
- Reassurance: **You can change guidance at any time. Your progress will be kept.**

## Story, characters, and privacy

Dr Mira Spore is a fictional laboratory scientist and guide. The five people shown in Missions 2 and 3 are fictional illustrated characters. The continuing case is `MYC-2048`, belonging to fictional patient **Jamie Borg**, with a skin-scraping specimen from a superficial rash. Other cases exist only as matching/reception examples.

No real patient data, dates of birth, addresses, photographs, barcodes, hospital numbers, or clinical forms may be used. Generated IDs use the format `MYC-####`; names come from a fixed fictional list. A replay creates a new case suffix and clears journey state while preserving shared hub progress.

The game must not claim the organism caused the symptoms. It may say that fungal elements or growth were observed in the simulation and that laboratory evidence contributes to an investigation.

## Continuous mission map

| Mission | Title | Input | Core interaction and learning purpose | Output |
|---:|---|---|---|---|
| 1 | The Basics | Selected difficulty | Answer six safety and specimen-handling questions | Safety check complete |
| 2 | Match the Sample | Safety check | Match five specimens to five fictional complaints | Five matched patient/sample pairs; Jamie’s skin scraping selected as continuing case |
| 3 | Detail Checking | Five matched pairs | Compare sample and request fields; accept three and reject two mismatches | Jamie’s correctly matched skin scraping accepted as `MYC-2048` |
| 4 | Process the Dermatology Sample | Accepted skin scraping | Divide six pieces equally between slide and culture; focus/pan simulated fluorescence field | “Fungal elements seen” clue plus inoculated SDCC fungal culture plate |
| 5 | Check the Culture | Incubated plate after simulated one-week time-lapse | Select mould-like growth among four plates | Growth-positive colony clue |
| 6 | Mystery Fungi | Growth-positive colony | Compare four reference cultures/micrographs and follow a simplified key | Educational identification clue: *Aspergillus fumigatus* |
| 7 | The Antifungal Challenge | Identified simulated isolate | Read a simplified colour endpoint across increasing concentrations | MIC clue card; no susceptible/resistant or treatment interpretation |
| 8 | Become the Mycology Detective | All seven prior clue cards | Order eight laboratory stages | Final journey flag and access to completion action |

## Exact shared and mission copy

### Mission 1 The Basics

Intro: **Mycology is the study of fungi. This includes yeasts and moulds which can cause infections. Answer the following questions and start your journey to become a Junior Mycologist.**

The six questions and choices appear in source order:

1. **Why is it important to wear a lab coat while doing experiments?**
   - It keeps you warm when the room gets chilly.
   - **It keeps your clothes clean and protects your skin.**
   - It helps you spot microscopic mould spores easier.
   - It helps you run faster around the workbench.
2. **Why must you check sample details before opening containers?**
   - To practice reading out loud to your friends.
   - To make sure the container is shiny enough to use.
   - **To make sure that the patient details match those on the request form.**
   - To guess how heavy the container will be when lifted.
3. **What is the best way to clean your workspace?**
   - Cover the dirt with clean sheets of paper.
   - Blow gently across the table to clear away dust.
   - **Wipe the bench with a clean disinfectant cloth.**
   - Dust the bench using your bare hands.
4. **Why should long hair be tied back before working in the lab?**
   - To make sure your lab coat fits better.
   - To help you hear instructions better.
   - To be more stylish.
   - **To keep hair out of flames and off agar plates.**
5. **What is the primary reason for wearing disposable gloves in a lab?**
   - To allow you to touch hot glass safely.
   - To make your hands look like colorful balloons.
   - **To prevent hand germs from contaminating samples.**
   - To avoid washing your hands after finishing.
6. **What is the proper way to leave your lab station when you finish an experiment?**
   - Leave everything on the desk for the next person.
   - **Dispose of waste in the proper bin, clean surfaces, wash your hands, and remove your PPE.**
   - Throw everything into the recycling bin.
   - Just turn off the lights and walk out.

Correct: **Correct.**
Incorrect: **Try again.**
Hint: **Look for the answer that protects people, specimens, and the workspace.**
Completion: **Safety check complete. Let’s match each patient with the right sample.**

### Mission 2 Match the Sample

Instruction: **Fungal infections can occur all over the body. Can you match the sample to the correct patient?**

Pairs: ear discomfort ↔ ear swab; skin rash ↔ skin scrapings; changed nail ↔ nail clippings; urinary symptoms ↔ urine sample; sore mouth ↔ mouth swab. These are complaints under investigation, not confirmed infections.

Correct: **Well done! This sample is needed for this patient.**
Incorrect: **Not this one. Look closely at what the patient is complaining of and try again.**
Hint: **Match the sample name to the body area shown on the patient card.**
Learning: **Fungal infections can affect many areas of the body. Collecting the right sample is important for the scientist investigating what may be present.**
Completion: **All five samples are matched. Jamie’s skin scraping will continue through our journey.**

### Mission 3 Detail Checking

Instruction: **New samples have arrived! Before we investigate, can you check that the specimen information matches the request forms?**

Decision buttons:

- **The details on the sample match those on the request form! The sample can be sent for processing.**
- **There is a mismatch! The sample cannot be processed.**

Exactly two cases mismatch: one ID number and one surname. The other three match all displayed fields.

Correct match feedback: **Excellent! The details match. We can continue with the next specimen.**
Correct rejection feedback: **Excellent! You found the mismatch. This specimen must not be processed in our simulation.**
Incorrect: **Something doesn’t match. Check the information again.**
Hint: **Compare the surname, ID number, and specimen type one field at a time.**
Learning: **Specimen reception is the first laboratory step. Correct identification helps ensure that results are linked to the correct patient.**
Completion: **Jamie’s skin scraping is correctly identified and ready for the next stage.**

### Mission 4 Process the Dermatology Sample

Instruction: **Let’s use the skin scraping sample for fluorescent microscopy and culture.**

Transfer prompt: **Place three pieces on the microscope slide and three pieces on the SDCC fungal agar plate.**
Balanced success: **Good work. Three pieces are ready for microscopy and three are ready for culture.**
Unbalanced attempt: **Keep the sample balanced: three pieces for each laboratory method.**
Microscope prompt: **Place the prepared slide on the microscope, adjust the focus, then explore the field to find bright fungal structures.**
Success: **You found them! The bright structures are fungal elements. Fluorescence makes it easier for us to find them.**
Incorrect region: **Look carefully through the microscope and try finding a different area.**
Hint: **Look for bright branching, tube-like hyphae with cross-walls and small spore shapes.**
Learning: **Microscopy can examine a clinical specimen directly for fungal structures. This is a laboratory simulation, not an activity to perform yourself.**
Completion: **Microscopy clue saved. The culture plate is now in the simulated incubator.**

### Mission 5 Check the Culture

Time-lapse label: **One simulated week later…**
Instruction: **The culture has been given time to grow. Can you find the plate showing fungal growth?**
Correct: **Excellent! We found fungal growth. Now we need to work out what it is.**
Incorrect: **Not this one. Look for the plate showing fungal or mould-like growth.**
Hint: **Look for a fluffy or powdery colony spreading across the agar surface.**
Learning: **After fungal growth is detected, the laboratory can examine its appearance and use further tests to investigate the organism.**
Completion: **Culture clue saved. Let’s compare the colony and microscopic appearance.**

### Mission 6 Mystery Fungi

Instruction: **Our mystery moulds are Aspergillus species. Can you use the clues to identify which is which?**

Reference pathways:

- blue-green colony + columnar head + small blue-green spores → *Aspergillus fumigatus*;
- yellow-green colony + rough conidiophore + rough green spores → *Aspergillus flavus*;
- black colony + biseriate phialides + rough black spores → *Aspergillus niger*;
- cinnamon-brown colony + uniseriate phialides + small smooth spores → *Aspergillus terreus*.

The continuing mystery shows the first path.
Correct: **You have matched the clues! Identification complete: Aspergillus fumigatus.**
Incorrect: **Not quite. Go back to the last clue and compare the colony and microscopic appearance again.**
Hint: **Start with colony colour, then check the shape of the conidial head.**
Learning: **Identification keys use observable characteristics to help distinguish organisms. Hyphae are branching filaments; a conidiophore bears conidia, which are asexual spores. Real laboratories use validated methods and may need more evidence than appearance alone.**
Completion: **Identification clue saved. Next we will inspect a simulated antifungal test.**

### Mission 7 The Antifungal Challenge

Instruction: **We have identified our fungus. But which concentration first stops visible growth? Let’s investigate!**

Safety line: **This is a simplified, supervised laboratory simulation. It does not show how to prepare or perform the test.**
Read prompt: **Start at the lowest concentration and move upward. Select the first blue well with no visible growth after the pink growth wells.**
Correct: **Excellent! You found the MIC — the Minimum Inhibitory Concentration.**
Incorrect: **Look from the lower concentrations upwards. Find the first concentration where visible growth is inhibited.**
Hint: **Pink means visible growth in this simulation. Blue means no visible growth. Find the first blue well in order.**
Learning: **Antifungal susceptibility testing investigates how a fungus responds to antifungal agents. MIC means Minimum Inhibitory Concentration. The result is not a treatment recommendation.**
Completion: **MIC clue saved. You now have every clue needed to reconstruct the journey.**

The simulated row uses arbitrary display units and never names a drug or applies a susceptible/resistant category.

### Mission 8 Become the Mycology Detective

Instruction: **You’ve collected all the clues. Can you put the laboratory journey in the correct order?**

Required order: **sample arrives → check details → microscopy → culture → check growth → identification → antifungal susceptibility testing → laboratory result**.

Correct: **Fantastic! You followed the specimen through the mycology laboratory.**
Incorrect: **Almost! Think about what the laboratory needs to do first, and what information becomes available later.**
Hint: **The sample must arrive and be checked before testing begins. Identification follows visible growth.**
Learning: **Different laboratory methods provide different pieces of information. Together they help the mycologist investigate the specimen.**
Completion action label: **Complete my journey**

## Final screen and hub award

The final screen appears only after the completion action validates all eight mission flags, the case ID, the selected difficulty, the accepted skin-scraping lineage, and all required clue records.

Exact copy:

- **CONGRATULATIONS, JUNIOR MYCOLOGIST! You solved the fungal mystery!**
- **Mycology scientists use many different laboratory clues and tests to investigate fungal infections. You followed the specimen all the way from the patient to the final laboratory result!**
- **JUNIOR MYCOLOGIST — MISSION COMPLETE!**

Actions: **Review my journey**, **Back to SiTC Games**, and **Play again**. Play again requires confirmation: **Start a fresh fictional case? Your SiTC laboratory badge will stay safe.**

Only the validated final action may idempotently append `"main"` to `completedCases.mycology` in `sitcGameProgressV2`. No earlier mission, direct final-route load, malformed save, or replay may award completion. Existing progress for other laboratories must be preserved byte-for-byte after parse/stringify semantics.

## Interaction contract

- Every drag/drop interaction also supports tap/select-then-target and keyboard select/arrow-or-tab/Enter workflows.
- All controls are semantic buttons, links, or form controls; no click-only `div` elements.
- Pointer dragging uses Pointer Events and works for mouse, touch, and pen.
- Correctness is never conveyed by colour alone; icons, text, and `aria-live` feedback accompany colour.
- Minimum target size is 44×44 CSS pixels; primary targets are 48×48 or larger.
- Focus order follows visual order. Focus moves to feedback/next action after completion and returns sensibly after dialogs.
- Escape closes non-critical dialogs. No keyboard trap is permitted.

## Responsive, orientation, and motion rules

The primary game layout targets landscape at 1280×720 and scales to tablet landscape and short-phone landscape (minimum supported interactive viewport 568×320). Portrait shows a polite orientation panel with a **Continue in portrait** option; core play remains possible in a single-column layout. No content may be clipped at 200% browser zoom.

Animations last under 1.2 seconds except the optional culture time-lapse, which is skippable. With `prefers-reduced-motion: reduce`, movement, pulsing, zoom, and time-lapse are replaced by instant state changes and labelled before/after diagrams. No flashing content exceeds three flashes per second.

## Save, migration, resume, and review

Storage key: `sitcMycologyJourneyV1`. Current schema version: `1`.

Required top-level fields: `version`, `caseId`, `difficulty`, `currentMission`, `missionFlags`, `clues`, `missionState`, `completed`, `updatedAt`. Saves occur after every correct sub-step and mission transition.

- Missing/invalid data is migrated conservatively when possible.
- Unknown future versions are quarantined and start at difficulty selection with: **We couldn’t safely read this journey, so we started a fresh case. Your SiTC badges are unchanged.**
- If a later mission is claimed without all earlier flags, resume at the earliest incomplete mission and discard downstream transient state.
- Continue copy: **Continue case MYC-#### from Mission N**.
- Review mode may open completed missions but cannot clear forward flags, alter clues, or re-award the hub badge.
- Replay clears only `sitcMycologyJourneyV1` after confirmation and creates a new case ID; it never clears `sitcGameProgressV2`.

## SiTC shell and design system

The audited canonical interface palette is:

- Navy `#073C63`; Blue `#087FC1`; Cyan `#21C9DC`; Gold `#FFC83D`;
- Ink `#153344`; Muted ink `#4B6675`; Soft cyan `#DFF9FC`; White `#FFFFFF`;
- Success `#08784F`; Error `#B51F3C`.

Use Trebuchet MS with Segoe UI/Arial fallbacks, rounded 13–28 px cards, navy game bar, pill progress, gold 4 px focus ring, white content cards, strong cyan borders, and green/red text-plus-icon feedback. Scientific colours remain inside specimens, plates, stains, and microscopy fields.

Hub integration adds one available Mycology card with `id: "mycology"`, `href: "mycology/"`, `mainCase: "main"`, and one total case. It follows existing badge, case-star, and progress conventions without modifying other labs.

## Scientific and safety boundaries

- No real patient data or realistic hospital identifiers.
- No culture recipes, incubation conditions, quantities, reagent preparation, specimen-collection technique, live handling, or disposal procedure beyond general safety concepts already in the source.
- No diagnosis, clinical report, drug recommendation, dose, breakpoint, susceptible/resistant label, or claim that an organism caused symptoms.
- “SDCC fungal agar” is a visual label only; its composition is not taught.
- Fluorescence is a simulated observation. The game does not name or instruct use of a stain.
- The *Aspergillus* key is explicitly simplified and educational. Appearance alone is not presented as definitive clinical identification.
- MIC values use arbitrary display units and demonstrate ordering only.

## Acceptance criteria and end-to-end QA

1. Difficulty is the first scene and all three modes preserve the same science and gate.
2. Eight missions appear in the specified order with one continuous `MYC-####` lineage.
3. Every exact question, choice, feedback phrase, transition, and completion phrase above is present.
4. Mission 3 has five cases and exactly two specified mismatch types.
5. Mission 4 requires a 3/3 split and a distinct microscopy-find step.
6. Mission 5 uses a skippable simulated-week transition and offers one mould-like plate.
7. Mission 6 exposes all four source pathways and labels the key non-diagnostic.
8. Mission 7 identifies the first no-growth well only and provides no clinical interpretation.
9. Mission 8 requires the exact eight-stage order.
10. Save corruption, missing predecessors, refresh, Continue, replay, and review behave as specified.
11. `mycology/main` is absent before the validated final action and appended once afterward without changing other lab progress.
12. All asset URLs resolve from a basic HTTP server and GitHub Pages subpath.
13. Keyboard-only, mouse, touch/tap alternative, reduced-motion, desktop landscape, tablet landscape, short-phone landscape, and narrow portrait paths complete successfully.
14. Focus is visible, live feedback is announced, target sizes pass, landmarks/headings are logical, and automated accessibility checks show no serious violations.
15. Browser console and network logs are clean; automated logic, migration, gate, link, manifest, and asset tests pass; `git diff --check` passes.

Full QA must start fresh at each difficulty, exercise correct and incorrect answers, use every hint/retry, refresh within every mission, complete a full keyboard path, confirm every prior mission remains reviewable, verify reduced-motion equivalents, and test final award idempotency with pre-existing progress in other laboratories.
