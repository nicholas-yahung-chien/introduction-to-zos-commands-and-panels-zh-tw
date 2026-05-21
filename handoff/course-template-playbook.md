# 課程網站範本化與經驗傳承

本專案直接沿用 `Introduction to IBM z/OS` 的課程網站模板：

- VitePress 作為靜態網站框架。
- `data/course-manifest.json` 作為課程中樞。
- `docs/` 僅放公開學習者內容。
- `handoff/`、`references/`、`data/captured/` 保留交付與維護脈絡。
- Lab 用 metadata 呈現並導回原課程。
- 練習題、影片與字幕只有在授權清楚時才公開。

## 7419 課程套用重點

- 課程名稱：`Introduction to z/OS Commands and Panels on IBM Z`。
- 三個主題：命令與面板入門、資料集操作、TSO 命令。
- 七個 Lab 均需回 IBM Learn 原環境完成。
- Badge Quiz 題目已於 2026-05-21 經 IBM 團隊主管授權重製為非計分靜態練習；正式 attempt、成績與 badge 仍回 IBM Learn 完成。
- IBM Learn 頁面需要登入；本專案已用授權 session 擷取 activity URL、page/H5P 盤點與 Kaltura metadata。

## 下一步

1. 依授權狀態決定是否下載或掛載影片。
2. 產生字幕、翻譯繁體中文並跑字幕檢查。
3. 若授權範圍或題庫有更新，重新擷取與翻譯靜態互動練習題。
4. 若 IBM Learn 課程更新，再用授權帳號登入並執行 `npm run capture:course`。
