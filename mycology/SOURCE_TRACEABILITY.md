# Mycology Source Traceability

## Source record

- **Authoritative source:** `The Mycology Journey Game.docx`
- **Original path:** `C:\Users\User\Downloads\The Mycology Journey Game.docx`
- **Format:** Microsoft Word Open XML (`.docx`)
- **Modified:** 20 September 2026, 02:05:32 Europe/Malta
- **Size:** 59,537 bytes
- **Document structure:** 133 body paragraphs; no tables, embedded images, headers, footers, footnotes, endnotes, or comments.
- **Read method:** complete OOXML paragraph-order extraction plus package inventory. The packaged visual renderer was attempted but could not start because its required bundled LibreOffice executable is absent from this environment. No content was hidden in media or auxiliary Word parts.
- **Preservation:** the original attachment is unchanged. A byte-identical copy is retained with the production package.

## Numbering ambiguity and decision

The source has eight ordered gameplay beats but labels both “Check the Culture” and “Mystery Fungi” as Mission 5. The production sequence preserves both beats and corrects the duplicate numbering:

1. The Basics
2. Match the Sample
3. Detail Checking
4. Process the Dermatology Sample
5. Check the Culture
6. Mystery Fungi
7. The Antifungal Challenge
8. Become the Mycology Detective

This is an implementation numbering correction, not a change to the story order.

## Requirement map

| Source requirement | Representation |
|---|---|
| Title “THE MYCOLOGY JOURNEY” and goal “Become a Junior Mycologist!” | `MYCOLOGY_GAME.md` title, opening, shell, and final screen |
| Mission 1 definition of mycology and six laboratory-safety/sample questions | Base specification and `MISSION_01_THE_BASICS.md`; all source questions and choices preserved verbatim except terminal punctuation normalization |
| Correct “Correct.” and incorrect “Try again.” | Mission 1 feedback exactly |
| Five complaints: ear, skin, nail, urine, mouth | Mission 2 fictional patient cards and Mission 3 reception cases |
| Five samples: ear swab, skin scrapings, nail clippings, urine, mouth swab | Mission 2 matching assets/state and Mission 3 case set |
| Drag samples to corresponding patients | Mission 2 drag/drop plus tap/select and keyboard alternatives |
| Reception with five samples and request forms | Mission 3 scene and data model |
| Compare patient name, ID number, specimen type | Mission 3 live HTML fields |
| Exactly two mismatches: one ID and one surname | Mission 3 deterministic validation set |
| Skin scraping, slide, fluorescent stain, fluorescence microscope, SDCC agar; six pieces divided three and three | Mission 4 specimen lineage and two balanced groups; “fluorescent fungal stain” and “SDCC fungal agar” remain generic to avoid teaching a clinical recipe |
| Focus and pan to bright fluorescing septate hyphae and spores | Mission 4 simulated microscopy field and target |
| Simulation must not teach children to perform laboratory work | Global safety boundary and Mission 4/7 copy; no volumes, recipes, temperatures, timings, handling technique, or treatment advice |
| Accelerated one-week culture animation and multiple plates | Mission 5 time-lapse and choice grid; reduced-motion state jump |
| Select fluffy mould-like growth; zoom colony | Mission 5 interaction and success transition |
| Four Aspergillus cultures and microscopic views | Mission 6 comparison set |
| Simplified key for *A. fumigatus*, *A. flavus*, *A. niger*, and *A. terreus* | Mission 6 clue paths; clearly labelled an educational phenotype exercise, not clinical identification |
| Terms hyphae, conidiophore, conidia | Mission 6 glossary and accessible descriptions |
| 96-well antifungal plate; different agents/concentrations; pink growth, blue no growth | Mission 7 simplified supervised simulation |
| Identify lowest/first concentration with no visible growth as MIC | Mission 7 validation and exact success copy |
| Present YeastOne only as supervised laboratory simulation | Mission 7 safety copy; no operational protocol |
| Detective board sequence of eight cards ending in laboratory result | Mission 8 ordered interaction and final gate |
| Final scientist congratulations and Junior Mycologist completion wording | Completion screen, preserved verbatim |
| Correct, incorrect, and learning-point copy for every source mission | Base specification and each mission specification |

## Scientific additions and boundaries

The source does not specify a real patient, diagnosis, strain, antifungal, concentration, or reportable result. The game therefore uses a fictional case (`MYC-2048`) and never generates real identifiers. The skin finding is described as “fungal elements seen” and the culture/identification results as a simulated educational investigation, not a diagnosis or treatment recommendation.

The following implementation decisions are supported by authoritative sources:

- Patient/specimen matching uses multiple identifiers because WHO patient-identification guidance requires matching patients with specimens/results and recommends at least two identifiers: https://cdn.who.int/media/docs/default-source/patient-safety/patient-safety-solutions/ps-solution2-patient-identification.pdf
- Skin scrapings and nail clippings are legitimate fungal-investigation samples; microscopy can provide a rapid indication while culture helps distinguish fungal groups: https://assets.publishing.service.gov.uk/media/5a82e55f40f0b6230269d449/Fungal_skin_and_nail_infections_guidance_summary_table.pdf
- The simplified *Aspergillus* clues are based on colony pigmentation and conidial-head morphology. The source pathways are retained, with the key made non-diagnostic: https://mycology.adelaide.edu.au/fungal-descriptions-and-antifungal-susceptibility/hyphomycetes-conidial-moulds/aspergillus
- MIC is presented only as an observed endpoint in a broth microdilution simulation. CLSI M38 covers susceptibility testing of filamentous fungi including *Aspergillus*: https://clsi.org/shop/standards/m38/
- EUCAST likewise defines broth-dilution MIC methods for conidia-forming moulds: https://www.eucast.org/fungi-afst/methodology-and-instructions/ast-of-moulds/

No clinical breakpoint, drug recommendation, specimen-collection instruction, organism-risk claim, or treatment decision is simulated.

## Source-to-specification gate

Every substantive source paragraph is represented above and is assigned to `MYCOLOGY_GAME.md`, a mission specification, or both. Exact source wording that appears in play is enumerated in the base specification. The only source contradiction is the duplicate Mission 5 number, resolved transparently above.
