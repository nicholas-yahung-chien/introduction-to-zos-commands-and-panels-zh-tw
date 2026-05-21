# Introduction to z/OS Commands and Panels 靜態學習網站

本專案依照 `introduction-to-ibm-zos` 的 VitePress 架構，為 IBM Learn 課程 `Introduction to z/OS Commands and Panels on IBM Z` 建立繁體中文靜態學習網站。

## 快速開始

```powershell
npm install
npm run dev
```

## 建置與驗證

```powershell
npm run verify:release
npm run build:github
npm run build:cloudflare
```

GitHub Pages base path 為 `/introduction-to-zos-commands-and-panels-zh-tw/`，Cloudflare Pages 使用 `/`。正式建置會使用 `VITE_MEDIA_BASE_URL=https://nicholas-yahung-chien.github.io/introduction-to-zos-commands-and-panels-media` 指向獨立媒體 host。

## 課程範圍

- IBM Learn: https://learn.ibm.com/course/view.php?id=7419
- 課程名稱：Introduction to z/OS Commands and Panels on IBM Z
- 公開站台範圍：課程順序、影片與字幕、靜態練習、Lab metadata、詞彙表、授權資訊。
- 原課程範圍：Lab runtime、正式 Badge Quiz attempt、certificate、attempt 與學習者進度。

## 重新盤點結果

- Live course inventory：5 個章節、33 個唯一活動。
- 影片：9 支，皆已建立 HLS 與字幕。
- Lab：7 個 Exercise Lab 頁面。
- 靜態練習：6 個 short quiz 來源與 1 個 Badge Quiz 題庫來源，共 44 題。
- Badge Quiz：每次正式 attempt 顯示 20 題；已依 IBM 團隊主管授權，從 2 次 completed review 合併去重收錄 25 題作靜態練習。

盤點資料位於：

- `data/course-inventory-audit.json`
- `data/assessment-inventory.json`
- `data/captured/live-course-inventory.raw.json`
- `data/captured/moodle-quiz-120013-questions.json`
- `data/captured/badge-quiz-questions.json`

## 擷取與維護

登入 IBM Learn 並停在課程頁後，可重新擷取課程頁結構：

```powershell
npm run capture:course
```

影片資產可透過 Kaltura metadata 下載並產生 HLS：

```powershell
npm run download:videos
npm run generate:hls
```

若需要強制重新產生媒體檔，請直接呼叫腳本：

```powershell
node scripts/download-kaltura-videos.mjs --force
node scripts/generate-hls.mjs --force
```

`docs/public/media/`、`docs/public/hls/` 與 `dist-media/` 已由 `.gitignore` 排除。發布正式站前，請先部署媒體 host，或調整 `VITE_MEDIA_BASE_URL`。
