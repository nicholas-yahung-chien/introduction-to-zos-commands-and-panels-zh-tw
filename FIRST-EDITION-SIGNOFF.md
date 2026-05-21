# First Edition Signoff

This file records the accepted first-edition delivery state for the Traditional Chinese static course site. It is a repository planning and handoff record only; do not link it from the public VitePress site.

## Signoff Status

- Status: accepted by project owner
- Signoff date: 2026-05-21
- Course source: `https://learn.ibm.com/course/view.php?id=7419`
- Course title: `Introduction to z/OS Commands and Panels on IBM Z`
- Locale: `zh-Hant-TW`

## Planned Public Delivery URLs

- Cloudflare Pages: `https://introduction-to-zos-commands-and-panels-zh-tw.pages.dev/`
- GitHub Pages: `https://nicholas-yahung-chien.github.io/introduction-to-zos-commands-and-panels-zh-tw/`
- Media host: `https://nicholas-yahung-chien.github.io/introduction-to-zos-commands-and-panels-media/`

## Included Scope

- VitePress static course site.
- Course landing page and learner-facing unit pages.
- 9 course videos delivered through local HLS assets and configured for an external media host.
- Traditional Chinese WebVTT subtitle tracks.
- English WebVTT subtitle tracks retained for traceability.
- Kaltura metadata inventory for every course video.
- Lesson summaries and key terms for each video.
- Static learning practice converted from 1 Moodle short quiz source and 5 H5P short quiz sources, 19 questions total.
- Badge Quiz inventoried as a 20-question formal assessment; question content is not reproduced in the static site.
- Lab metadata for 7 IBM Remote Lab Platform activities.
- Glossary, license notes, release checklist, and automated quality checks.

## Accepted Quality Gates

- `npm run verify:release`
- `npm run subtitles:audit`
- `npm run media:package`
- Public-page hygiene scan described in `RELEASE-CHECKLIST.md`

The revalidated first-edition baseline passed release verification, subtitle presence checks, content quality checks, practice data checks, course inventory checks, and site checks with 9 deployed videos, 19 static practice questions, 20 formal Badge Quiz questions inventoried, and 7 lab items.

## Verification Record

- Verified at: 2026-05-21
- `npm run subtitles:audit`: passed structural audit run with 0 high, 15 medium, and 1 low subtitle review item. See `data/subtitle-audit/report.md`.
- `npm run media:package`: packaged 9 video media sets into `dist-media/`.
- `npm run verify:release`: passed GitHub Pages build, Cloudflare Pages build, public site checks, subtitle checks, content quality checks, and practice data checks.
- Build note: Vite reported the existing chunk-size warning during production builds; this did not block the release verification.

## Excluded From First Edition

- Badge quiz, certificate, survey, practitioner badge claim, and Moodle learner-state workflows.
- Login-dependent learner progress tracking.
- Scoring, answer persistence, or result history.
- Recreated IBM Remote Lab Platform runtime.

## Media And Deployment Notes

- Course media is hosted by the dedicated GitHub Pages media project for this accepted first edition.
- Site builds use `VITE_MEDIA_BASE_URL=https://nicholas-yahung-chien.github.io/introduction-to-zos-commands-and-panels-media`.
- Local generated HLS files may exist under `docs/public/hls/`, but they are ignored by Git and pruned from site builds.
- `npm run media:package` creates `dist-media/` for the media Pages project.
- Cloudflare Pages uses `/` as the VitePress base.
- GitHub Pages uses `/introduction-to-zos-commands-and-panels-zh-tw/` as the VitePress base.
