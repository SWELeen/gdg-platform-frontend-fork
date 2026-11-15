# Visual comparison

Baseline: `4022134`; candidate source: `02f4119`. Each revision has 128 full-page captures: 16 routes, two locales, two widths (1440/390), two themes. See `before.json`, `after.json`, and `diff.json` for the inventories and pixel counts.

- 128/128 pairs have identical dimensions, rendered text, link targets, control inventories and final destinations.
- 122/128 pairs are identical at the RGBA pixel level.
- 124/128 pairs have zero perceptual differences with pixelmatch threshold 0.1 and anti-aliasing excluded. Two activation-page pairs differ by just 9/12 raw pixels, excluded as anti-aliasing.
- The remaining four pairs were inspected; no layout, content or design change was found. Their diffs are retained in `diff/`.

| Pair | Perceptual pixels | Investigation |
|---|---:|---|
| EN home, desktop, light | 4729 | Existing perspective project-card transform/raster phase and a few decorative pixels. Card geometry/content matches; the project-card and showcase code is unchanged. This is a timing/raster difference in the preserved animation. |
| EN home, desktop, dark | 574 | Existing hero decoration phase. A repeat capture of the unchanged baseline exactly matches the candidate under the perceptual comparison. |
| AR home, desktop, light | 541 | Existing hero decoration phase. A repeat capture of the unchanged baseline exactly matches the candidate under the perceptual comparison. |
| AR signup/complete, mobile, light | 102 | Small unchanged header-logo raster region (x280–373, y29–38). Baseline-versus-baseline reproduces the same 102 pixels; repeated baseline and candidate compare at zero. |

`repeat-control.json` records the negative controls. Screenshot normalization settles fonts and lazy images, finishes finite browser animations, pauses loops and cancels pending application animation frames only for capture. Two consecutive identical screenshots are required. An exploratory home repeat failed this stability requirement and was not substituted for an accepted capture; the full 128-pair runs passed. This is not a claim of perfect deterministic rasterization.

The owner permits animation timing differences. Live animation behavior is checked separately, without freezing, in `../../pass2-before-interactions.json` and `../../pass2-interactions.json`. Screenshots do not establish authenticated QR, 3D badge or backend behavior; those limitations are explicit in the performance report.
