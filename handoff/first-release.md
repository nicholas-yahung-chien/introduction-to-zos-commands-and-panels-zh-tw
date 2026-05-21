# First Release Notes

## Scope

- 建立與 `Introduction to IBM z/OS` 相同的 VitePress 專案架構。
- 使用登入後 IBM Learn session 擷取 course manifest、activity URL、page/H5P 內容與影片 Kaltura metadata。
- 建立 lesson notes、Lab metadata、公開頁與 release gates。
- 將影片與正式評量保留為 source-only 狀態，避免未授權複製媒體或題目。

## Verification

Run before publishing:

```powershell
npm run verify:release
```

## Known Follow-Up

- 需要媒體授權才能部署 HLS 與字幕。
- 需要題目授權才能建立靜態互動練習題。
