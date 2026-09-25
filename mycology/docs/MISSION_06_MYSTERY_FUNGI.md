# Mission 6 Mystery Fungi

## Purpose and entry

Mission 6 introduces phenotype keys and the terms **hyphae**, **conidiophore**, and **conidia**. It requires the growth-positive colony clue. Input is the continuing mystery colony plus four educational reference pairs. Output is the simulated identification clue *Aspergillus fumigatus*.

Instruction: **Our mystery moulds are Aspergillus species. Can you use the clues to identify which is which?** The four reference pathways are exactly:

- blue-green colony + columnar head + small blue-green spores → *Aspergillus fumigatus*;
- yellow-green colony + rough conidiophore + rough green spores → *Aspergillus flavus*;
- black colony + biseriate phialides + rough black spores → *Aspergillus niger*;
- cinnamon-brown colony + uniseriate phialides + small smooth spores → *Aspergillus terreus*.

The player first chooses colony colour, then conidial-head clue, then species. The mystery follows the first path. Every card can toggle between colony and microscopic views. When a hint is shown, live overlays point directly at the colony surface colour or label the conidia (spores), conidial head, and conidiophore (stalk) on the microscopy image.

Correct: **You have matched the clues! Identification complete: Aspergillus fumigatus.** Incorrect: **Not quite. Go back to the last clue and compare the colony and microscopic appearance again.** Hint: **Start with colony colour, then check the shape of the conidial head.** Learning: **Identification keys use observable characteristics to help distinguish organisms. Hyphae are branching filaments; a conidiophore bears conidia, which are asexual spores. Real laboratories use validated methods and may need more evidence than appearance alone.** Completion: **Identification clue saved. Next we will inspect a simulated antifungal test.**

## State, assets, and safety

Persist current key node, viewed reference states, attempts, selected clues, identification clue, and mission flag. Required: shared assets, `assets/mission-6/aspergillus-colony-set.svg`, `aspergillus-microscopy-set.svg`, and `identification-key-arrows.svg`.

All species names, clue text, and image-overlay hints are live HTML. Scientific artwork receives equal size/prominence. A persistent note says **Simplified educational key — not a clinical identification method.** Keyboard/touch can toggle views and choose branches. Reduced motion disables flips and swaps instantly. Never claim morphology alone proves a clinical identification.

## Verification gate

Exercise all branches and four references, wrong/backtrack/hint, glossary, exact species formatting, refresh at each node, equal prominence, keyboard/touch, reduced motion, educational disclaimer, continuous mystery clue, and Mission 7 transition. No hub award.
