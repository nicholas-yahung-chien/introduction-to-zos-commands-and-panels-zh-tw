# Introduction to z/OS Commands and Panels 台灣繁體中文靜態課程網站

此專案沿用 `Introduction to IBM z/OS` 的 VitePress 架構，為 IBM Learn 課程 `Introduction to z/OS Commands and Panels on IBM Z` 建立同樣形式的繁體中文靜態學習網站。

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

GitHub Pages 預設 base path 為 `/introduction-to-zos-commands-and-panels-zh-tw/`，Cloudflare Pages 使用 `/`。正式建置會使用 `VITE_MEDIA_BASE_URL=https://introduction-to-zos-commands-and-panels-media.pages.dev` 指向獨立媒體 host。

## 課程來源

- IBM Learn: https://learn.ibm.com/course/view.php?id=7419
- 課程名稱：Introduction to z/OS Commands and Panels on IBM Z
- 公開站台範圍：課程順序、學習導覽、Lab metadata、詞彙表、授權資訊。
- 原課程範圍：Lab runtime、正式評量、badge quiz、certificate、attempt 與學習者進度。

## 擷取流程

若已用同一個瀏覽器 profile 登入 IBM Learn，可開啟課程頁後執行：

```powershell
npm run capture:course
```

擷取結果會寫入 `data/captured/`，供後續補齊 activity URL、Kaltura metadata、頁面內容與 H5P/Lab 盤點。

## 影片 metadata 與 HLS

產生 Kaltura metadata，不下載大型影片檔：

```powershell
npm run download:videos
```

確認授權與磁碟空間後，才下載媒體並產生 HLS：

```powershell
node scripts/download-kaltura-videos.mjs --force
node scripts/generate-hls.mjs --force
```

`docs/public/media/` 與 `docs/public/hls/` 已被 `.gitignore` 排除。發布正式站前，請先把 HLS 與字幕部署到獨立媒體 host，或調整 `VITE_MEDIA_BASE_URL`。
