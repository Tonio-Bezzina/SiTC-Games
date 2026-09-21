# SiTC Games

Browser-based educational laboratory games for Science in the City.

## Adding a scientist-guided case (no code required)

Passive Cases are separate from the interactive Main Missions. They are always available and never award progress, stars, badges, Lab Master, or SiTC Young Scientist.

To add a case to any laboratory:

1. Open that laboratory's `cases` folder, for example `haematology/cases/`.
2. Create one folder for the case, such as `case-01` or `03-haemolytic-reaction`.
3. Upload the numbered case images: `image 1.png`, `image 2.png`, `image 3.png`, and so on.
4. Optionally add `thumbnail.png`. Without it, the first numbered image becomes the card thumbnail.
5. Commit or upload the files to `main`.
6. Wait for the **Generate passive case catalogue** action and the following GitHub Pages deployment to finish.
7. Open that laboratory's Cases section and confirm the case appears.

The scanner accepts `Image` or `image` and separators such as spaces, hyphens, and underscores. Image numbering controls slideshow order, so image 9 appears before image 10. Only numbered images become slides.

The folder name supplies the title automatically:

- `case-01` becomes **Case 01**.
- `03-haemolytic-reaction` becomes **Haemolytic Reaction**.

An optional `case.json` or `metadata.json` containing `{ "title": "Custom title" }` can override the derived title, but ordinary case additions do not need metadata or code changes.

Supported laboratory folders are `transfusion`, `chemistry`, `bacteriology`, `haematology`, `histology`, and `mycology`.
