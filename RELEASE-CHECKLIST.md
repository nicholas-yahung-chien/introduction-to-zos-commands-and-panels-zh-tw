# Release Checklist

Use this checklist before publishing course content changes.

## Local Verification

```powershell
npm ci
npm run subtitles:wrap
npm run subtitles:audit
npm run media:package
npm run verify:release
```

- Confirm `npm run verify:release` completes successfully.
- Confirm `npm run site:check` passes; this is included in `npm run verify:release`.
- Confirm public pages are present: home, course, videos, practice, labs, glossary, and license notes.
- Confirm internal links, video metadata, subtitles, HLS playlists, practice question count, assessment inventory, and Lab metadata pass automated checks.
- Confirm `npm run practice:check` reports 19 question(s) and 7 source(s).
- Confirm `npm run course:inventory:check` reports 33 activities, 9 videos, 7 labs, 19 static practice questions, and 20 formal Badge Quiz questions.
- If subtitles changed, inspect `data/subtitle-audit/report.md`.
- If video HLS assets changed, run `npm run media:package` and deploy `dist-media/` before publishing the course site.

## Media Host

- Default media host: `https://nicholas-yahung-chien.github.io/introduction-to-zos-commands-and-panels-media`
- Package command:

```powershell
npm run media:package
```

- Deploy `dist-media/` to the dedicated media Pages project.
- Confirm these paths exist after deployment:
  - `/introduction-to-zos-commands-and-panels-media/hls/introduction-to-tso-and-ispf/index.m3u8`
  - `/introduction-to-zos-commands-and-panels-media/subtitles/introduction-to-tso-and-ispf.zh-Hant-TW.vtt`
  - `/introduction-to-zos-commands-and-panels-media/manifest/video-assets.json`

## GitHub Pages

- Push to `main`.
- Confirm the GitHub Pages workflow completes successfully.
- Spot-check the course base path:

```text
https://nicholas-yahung-chien.github.io/introduction-to-zos-commands-and-panels-zh-tw/
```

- Confirm course links include the `/introduction-to-zos-commands-and-panels-zh-tw/` base path.

## Cloudflare Pages

- Confirm the Cloudflare Pages project points to:
  - Repository: `nicholas-yahung-chien/introduction-to-zos-commands-and-panels-zh-tw`
  - Production branch: `main`
  - Build command: `npm ci && npm run build:cloudflare`
  - Build output directory: `docs/.vitepress/dist`

- Manual deployment command:

```powershell
npm run deploy:cloudflare
```

- Spot-check:

```text
https://introduction-to-zos-commands-and-panels-zh-tw.pages.dev/
https://introduction-to-zos-commands-and-panels-zh-tw.pages.dev/course/
https://introduction-to-zos-commands-and-panels-zh-tw.pages.dev/practice/
```

- Confirm media playlists load from the dedicated media host.
