# Clinical Chemistry asset management standard

Status date: 22 September 2026
Scope: all existing and future assets used by `chemistry/main/`
Audience: developers, illustrators, image-generation operators, reviewers, and maintainers

This document is self-contained. Follow it whenever an asset is reused, generated, edited, integrated, replaced, or retired.

## Objectives

- Minimise duplicate artwork and unnecessary generation.
- Preserve visual continuity across six chapters.
- Keep player-facing information editable and accessible.
- Make every committed asset traceable to a source and intended use.
- Avoid broken hosted paths, oversized downloads, alpha artifacts, stale versions, and orphaned files.
- Ensure stateful visual changes remain controlled by game logic rather than baked pixels.

## Source hierarchy

Before creating anything, search in this order:

1. `chemistry/main/assets/` for an exact or adaptable Chemistry asset.
2. Other SiTC mission assets for a compatible exact reuse.
3. Code-native HTML/CSS/SVG for diagrams, interface layers, labels, markers, and simple shapes.
4. A new raster illustration only when the first three options cannot meet the visual requirement.

Document why reuse was rejected before generating a replacement. “A different filename would be clearer” is not enough reason to duplicate an unchanged image.

## Ownership and file locations

- Runtime Chemistry assets live in `chemistry/main/assets/`.
- Implementation briefs live in `chemistry/main/docs/remaining-missions/` and are not runtime dependencies.
- Do not place final runtime assets in temp folders, attachments, generated-output directories, or user-profile paths.
- Keep source/provenance text in `chemistry/main/assets/` beside the outputs, using one chapter/group source file or a unified manifest.
- Do not edit files under external `sources/` or Codex project reference locations.

## Naming convention

Use lowercase kebab-case with a semantic object/state and integer version:

```text
<subject>-<state-or-purpose>-v<number>.<extension>
```

Examples:

- `analyser-cutaway-v1.png`
- `reaction-cup-empty-v1.png`
- `scientist-guide-v1.png`
- `chemistry-badge-v1.svg`

Rules:

- Use British spelling already established in the project: `analyser`, `colour` in prose, and consistent existing identifiers in code.
- Avoid names tied to temporary scene numbers when the object is reused.
- Do not encode patient identifiers, dates, difficulty, screen dimensions, or copy into filenames.
- A visual content change that would break layout or review expectations receives a new version.
- Do not rename a stable raster asset solely because an editable HTML label changes.

## Asset manifest

Create or maintain `chemistry/main/assets/assets-manifest.json` when producing the next asset batch. It should be valid machine-readable JSON and contain one record per runtime asset:

```json
{
  "schemaVersion": 1,
  "assets": [
    {
      "file": "analyser-cutaway-v1.png",
      "kind": "raster-background",
      "chapters": [4],
      "status": "active",
      "source": "generated",
      "sourceReference": "generated-output-id-or-repository-path",
      "promptReference": "remaining-assets.md#A1",
      "license": "project-generated",
      "width": 1600,
      "height": 900,
      "hasAlpha": false,
      "meaningful": true,
      "defaultAlt": "Simplified interior of the clinical chemistry analyser",
      "notes": "Text, tools, liquids and graph are separate layers."
    }
  ]
}
```

Allowed `status` values: `candidate`, `active`, `superseded`, `retired`.
Allowed `source` examples: `generated`, `original`, `reused-cross-game`, `derived`, `code-native`.

Unknown manifest fields must be preserved by scripts. Do not store sensitive local paths if the repository will be public; use stable repository-relative references or generation IDs plus the adjacent provenance file.

Until the manifest exists, retain the current provenance files:

- `centrifuge-assets-sources.txt`
- `quality-control-assets-sources.txt`

Migrate their information into the manifest only after confirming nothing is lost.

## Generation and provenance record

For every generated asset, record:

- Final repository filename.
- Original generated output ID/path or provider reference.
- Exact final prompt.
- Any reference images used.
- Generation mode/tool.
- Whether post-processing occurred and how.
- Selection reason when multiple candidates existed.
- Dimensions, colour mode, and alpha status.
- Chapter(s) and CSS/DOM role.
- Reviewer/date and known limitations.

Do not claim an asset was hand-edited or alpha-verified unless it was actually checked. Never discard provenance before the selected file is safely copied into the repository.

## Raster versus interface-layer decision

Raster artwork is appropriate for:

- Characters.
- Illustrated equipment housings.
- Environmental backgrounds.
- Complex transparent cutouts that define the established painted style.

HTML/CSS/SVG is required for:

- All readable text and patient information.
- Buttons, focus rings, targets, arrows, drop zones, and status lights.
- Liquid levels and reaction-colour changes.
- Expected ranges and result markers.
- Graph axes, trace, moving point, and settled state.
- Light beams, aliquot/reagent paths, and progress strips.
- Checklists, reports, dialogue, recap cards, and badge wording.

This separation is mandatory because these elements change by patient case, difficulty, state, screen size, reduced motion, and accessibility mode.

## Reuse procedure

Before reusing an asset:

1. Inspect it at original resolution.
2. Check license/provenance and whether it is project-owned.
3. Compare viewpoint, lighting, style, and narrative context.
4. Place it on the actual destination background at intended CSS size.
5. Test tablet and short-phone landscape crops.
6. Confirm it contains no baked text or state that conflicts with the new use.
7. Decide whether to reference the shared path or copy a versioned derivative.
8. Add/update the manifest record and document the dependency.

Do not modify a shared asset in place when another mission relies on its current appearance. Create a versioned derivative and retain the source relationship.

## Image-generation procedure

1. Build the scene wireframe first; determine needed viewpoint, empty UI areas, approximate displayed size, and transparent/background requirement.
2. Write one asset-specific prompt using the production brief. Explicitly exclude text, logos, fixed UI, liquids, markers, target highlights, and unwanted objects.
3. Generate candidates in the approved image-generation system. Do not use programmatic raster drawing as a shortcut for illustrated assets unless explicitly requested.
4. Inspect candidates visually before editing or selection.
5. Select the smallest set that covers the requirement; do not keep near-duplicates.
6. Copy the original selected output to a clear versioned filename.
7. Verify dimensions, alpha, edge quality, crop, and destination composition.
8. Optimise only after approval, comparing the optimised output to the source.
9. Record the exact prompt and provenance.
10. Integrate with separate DOM/SVG interaction layers and test before committing.

## Transparency and edge verification

For transparent PNGs:

- Confirm alpha exists and all intended outside corners are transparent.
- View against white, clinic pale blue, analyser navy, and the actual destination background.
- Inspect at 100% and expected rendered size for halos, rough hair/coat edges, transparent holes, and clipped shadows.
- Keep only subtle contained shadows; avoid large semi-transparent canvases that block pointer targets.
- Set decorative images to `pointer-events: none` in CSS.

Do not treat a checkerboard shown in a generated image as real transparency; inspect the actual alpha channel.

## Dimensions, optimisation, and delivery

- Preserve enough resolution for high-density displays, but do not ship unused 4K backgrounds when the stage never renders near that size.
- Use lossless or visually safe optimisation; preserve alpha and colour appearance.
- Record original and final byte sizes when optimisation is material.
- Avoid inline base64 for large art.
- Use repository-relative URLs such as `assets/analyser-cutaway-v1.png` so hosted subpaths work.
- Preload only assets needed immediately; later chapters may lazy-load their artwork before transition.
- Give images explicit dimensions or stable aspect-ratio boxes to avoid layout shifts.

## Versioning and replacement

- A new file version is required when silhouette, crop, viewpoint, safe area, or interaction alignment changes.
- Minor compression that is visually identical may replace the same file after review.
- Update code references and manifest in the same change.
- Mark the old manifest entry `superseded`; do not delete immediately if saved screens, branches, or documentation still reference it.
- Remove an old asset only after `rg` confirms no runtime, CSS, documentation, or manifest dependency remains and Git history provides recovery.

Never bulk-delete by wildcard. Resolve and verify exact repository paths before removal.

## Accessibility metadata

Classify each image:

- **Meaningful:** carries scene information not already expressed in nearby text; give concise contextual alt text.
- **Decorative:** adds atmosphere or duplicates adjacent text; use empty alt and `aria-hidden` where appropriate.
- **Interactive object:** the enclosing button/control receives the accessible name; the inner image normally has empty alt.

Do not place essential instructions solely in alt text. Accessible state belongs on the control/status layer and updates with the logical state.

## Integration review

Before accepting an asset change:

- Verify every path under local server and intended hosted subpath.
- Test missing-image behaviour; controls must not become impossible to identify.
- Confirm the art does not intercept touch/pointer input.
- Confirm drop-target geometry aligns with the visible equipment at all supported breakpoints.
- Test portrait pause, level picker, help dialog, reduced motion, muted sound, and enlarged text.
- Confirm no player-facing copy became baked or duplicated.
- Confirm new art does not silently change scientific meaning.
- Run `git diff --check` and inspect `git status` for unintended binaries or temporary candidates.

## Commit and review policy

- Keep selected assets, provenance/manifest updates, code references, and relevant tests in the same logical commit where practical.
- Do not commit generation contact sheets, temporary crops, QA harnesses, or rejected candidates.
- A reviewer should be able to answer: where did this asset come from, why is it needed, which scene uses it, what is interactive, and how can it be replaced?
- Preserve unrelated working-tree changes.

## Retirement checklist

Before retiring an asset:

1. Search exact filename across the repository.
2. Check dynamic asset-name construction in JavaScript.
3. Check documentation and manifest references.
4. Verify the replacement loads at every breakpoint and saved stage.
5. Mark old record superseded/retired.
6. Remove only the exact unused file.
7. Run the affected chapter and a full-mission smoke test.

## Final asset readiness gate

The complete Chemistry mission may ship only when:

- Every runtime asset has known ownership/provenance.
- New Chapter 4 illustrated layers pass actual-background edge checks.
- Every readable/stateful element is code-native.
- No missing, stretched, duplicated, or orphaned asset remains.
- Phone/tablet landscape compositions retain readable essential content.
- All paths work from the repository's hosted subpath.
- The badge art is not shown or persisted before Chapter 6 completion.
