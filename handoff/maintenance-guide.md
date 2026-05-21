# 維護流程指南

## 常用命令

```powershell
npm install
npm run dev -- --port 5174
npm run verify:release
```

## 更新課程 manifest

主要位置：

- `data/course-manifest.json`
- `data/captured/course-capture.json`
- `docs/course/`
- `docs/videos/index.md`

若登入後擷取到更精準的 activity URL，更新 manifest 後請跑：

```powershell
npm run build
npm run site:check
```

## 更新 Lab

主要位置：

- `data/labs.json`
- `docs/labs/index.md`
- `docs/.vitepress/theme/components/LabList.vue`

Lab 頁只描述目的、學習順序與原課程連結，不重建 runtime。

## 更新影片與字幕

若取得授權媒體：

1. 在 manifest 補上每支影片的 Kaltura metadata。
2. 執行 `npm run download:videos` 產生 `data/video-assets.json` 與 `docs/public/manifest/video-assets.json`。
3. 確認授權與磁碟空間後，用 `node scripts/download-kaltura-videos.mjs --force` 下載媒體。
4. 用 `node scripts/generate-hls.mjs --force` 產生 HLS。
5. 產生字幕並移除對應影片的 `mediaStatus: "source-only"`。
6. 跑 `npm run subtitles:check` 與 `npm run verify:release`。

正式網站建置會透過 `VITE_MEDIA_BASE_URL` 指向獨立媒體 host，並在 dist 內移除 HLS 大檔。預設媒體 host：

```text
https://nicholas-yahung-chien.github.io/introduction-to-zos-commands-and-panels-media
```

## 更新練習題

主要位置：

- `data/practice-questions.json`
- `data/practice-sources.json`
- `docs/.vitepress/theme/components/PracticeQuestions.vue`

本站練習題只作學習確認，不保存作答紀錄，也不替代 badge quiz。
