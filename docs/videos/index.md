# 影片與活動總覽

本頁是登入後擷取到的原課程活動順序快速索引。影片媒體與字幕在取得授權資產後，可沿用既有 `VideoLesson`、HLS 與 VTT 流程接入；目前公開站保留活動定位、Kaltura metadata 與原課程連結。

## 影片與活動清單

<CourseManifest />

## Kaltura metadata

<VideoAssetList />

## 媒體接入原則

- 影片檔、HLS 與字幕不直接從未授權來源擷取或公開。
- 取得 Kaltura metadata 後，將 `data/course-manifest.json` 的影片活動補上 `kaltura.entryId`、`partnerId` 與 `uiconfId`。
- 每支已部署影片需具備繁體中文字幕，並通過 `npm run subtitles:check`。
