# IBM Learn 課程靜態網站轉置標準框架

本文件彙整 `Introduction to IBM z/OS` 舊站模板、本次 `Introduction to z/OS Commands and Panels on IBM Z` 新站實作過程、驗收修正與已知風險，作為後續 IBM Learn 課程轉置為台灣繁體中文靜態學習網站的標準作業框架。

本文件是內部交付與維護文件，不應直接連到公開 VitePress 網站。

## 核心原則

- 以舊站的資訊架構、用字與視覺結構作為基準，不只複用技術棧。
- `data/course-manifest.json` 是課程中樞，公開頁面應由 manifest、metadata 與整理後的 Markdown 共同驅動。
- `docs/` 只放學習者可公開閱讀的內容；`handoff/`、`references/`、`data/captured/` 保留實作、授權、盤點與維護脈絡。
- 影片、練習題、Badge Quiz、Lab 指示與原課程材料都必須先確認授權範圍，再決定是否重製或只保留 metadata 與回原課程連結。
- 正式 attempt、certificate、badge claim、Lab runtime 與學習者進度一律回 IBM Learn 原課程完成。
- 每次重要內容或版面調整後都要和舊站線上頁面做結構比對，而不是只做本地建置。

## 建議專案結構

```text
.
├─ data/
│  ├─ course-manifest.json
│  ├─ assessment-inventory.json
│  ├─ course-inventory-audit.json
│  ├─ video-assets.json
│  └─ captured/
├─ docs/
│  ├─ .vitepress/
│  ├─ course/
│  ├─ glossary/
│  ├─ labs/
│  ├─ practice/
│  ├─ videos/
│  └─ license-notes.md
├─ handoff/
├─ references/
├─ scripts/
├─ RELEASE-CHECKLIST.md
└─ FIRST-EDITION-SIGNOFF.md
```

用途分工：

- `docs/course/`：課程首頁與章節頁。
- `docs/videos/`：影片總覽，不取代章節頁的學習順序。
- `docs/practice/`：檢核點、綜合回顧與互動練習。
- `docs/labs/`：Lab metadata、目的、順序與回 IBM Learn 指引。
- `docs/glossary/`：本課程需要的詞彙表。
- `docs/license-notes.md`：授權與來源說明。
- `handoff/`：實作框架、交付紀錄、盤點報告與後續維護指引。

## 標準實作流程

### 1. 授權與範圍確認

開始前先建立授權矩陣：

| 類型 | 必問事項 | 預設處理 |
| --- | --- | --- |
| 課程頁文字 | 是否可整理、翻譯、摘要 | 可摘要時仍保留原課程來源 |
| 影片 | 是否可下載、轉檔、部署 HLS、建立字幕 | 未確認前標成 source-only |
| 字幕 | 是否可轉錄、翻譯、公開 | 需跑字幕檢查與品質抽查 |
| 小測驗 / H5P | 是否可重製題目與解答 | 未確認前不公開題庫 |
| Badge Quiz | 是否明確授權重製 | 授權後併入「綜合回顧」，不另立特殊分類 |
| Lab | 是否可重製完整指示 | 預設只做 metadata 與回原課程連結 |
| 閱讀材料 | 是否可引用內部文件 | 以內部核准文件優先，必要時補 IBM 官方 Docs |

本次新站經驗：Badge Quiz 題目須取得明確授權後才可重製；正式 attempt 仍保留在 IBM Learn。授權狀態應寫入 `docs/license-notes.md`、`FIRST-EDITION-SIGNOFF.md` 與相關 handoff 文件。

### 2. 課程盤點

IBM Learn / Moodle 課程常有摺疊章節、H5P、Page、Quiz review、Lab launch page 與 Badge Quiz attempt review。不要只看課程首頁可見數量。

建議流程：

1. 使用已授權帳號登入 IBM Learn。
2. 擷取課程首頁、所有章節、所有 activity URL。
3. 逐一分類 activity type：影片、閱讀頁、H5P/小測驗、Lab、檔案、討論區、Badge Quiz。
4. 對 quiz 類型另外擷取題目、選項、答案、解析與來源 activity。
5. 對 Badge Quiz 檢查正式 attempt 題數與已能看到的 completed review 題庫數。
6. 將盤點結果寫入 `data/course-inventory-audit.json` 與 `data/assessment-inventory.json`。
7. 用腳本建立 release gate，避免後續漏題、漏影片、漏 Lab。

本次新站踩到的問題：

- 早期只盤到部分練習題，後續確認實際題數大於 11 題。
- Badge Quiz 每次正式 attempt 顯示 20 題，但 completed review 可合併去重出更多可見題。
- 部分練習題欄位曾有未翻譯內容，題幹、選項、解析、提示與回課程連結都要納入檢查。
- Lab 不只在章節文字中出現，還有獨立 launch page 與原課程活動連結。

### 3. 內容模型

`data/course-manifest.json` 應至少能描述：

- 課程名稱、來源 URL、語言與公開站台名稱。
- 章節清單、章節 slug、中文標題與學習順序。
- 每個 activity 的 type、原文標題、繁中標題、source URL、章節歸屬、公開狀態。
- 影片的 Kaltura entry ID、媒體狀態、字幕、HLS 路徑與原課程連結。
- Lab 的 exercise 編號、目的、所屬章節與回 IBM Learn 方式。
- 練習題的 source、coursePath、videoEntryId 或對應章節。

不要把頁面 Markdown 當作唯一真相；Markdown 是學習者敘事層，manifest 是盤點與檢查層。

## 公開頁面標準結構

### 首頁

首頁應是可直接開始學習的入口，而不是行銷 landing page。保留：

- 課程名稱與一句學習定位。
- 主要 CTA：開始課程、影片、練習、Lab。
- 課程涵蓋範圍。
- 授權或來源說明入口。

### 課程首頁

課程首頁應呈現：

- 課程 lede。
- 統計卡：影片、章節、Lab、練習題。
- 建議學習方式。
- 課程單元卡。
- 學完後會理解的能力。
- 課程活動總覽表。

### 章節頁

舊站章節頁是基準。除「課程概觀 / 課程介紹」這類特殊頁外，一般章節頁應使用下列順序：

1. `# 章節標題`
2. 開場段落
3. `## 學習脈絡`
4. `## 本章目標`
5. `## 觀看順序`
6. `## 影片`
7. 影片元件與影片筆記
8. `## 閱讀材料`
9. `## 本章完成檢核`

注意事項：

- 不要使用 `## 影片學習摘要` 作為可見章節標題；舊站用字是 `## 影片`。
- 不要在章節頁底下放 `## 原課程活動` 一覽表；活動表應集中在課程首頁或 manifest 驅動頁。
- 不要使用 `## 學習提醒` 取代 `## 本章完成檢核`。
- 影片前方不要重複放 `### 影片名稱`。非課程介紹影片只在 `<VideoLesson>` caption 顯示小標。
- 只有類似「課程介紹」的單支介紹頁可保留接近舊站的特殊結構。

### 影片呈現

標準做法：

- 使用懶載入影片元件，避免頁面一開就載入所有媒體。
- 每支影片保留 caption：中文標題、Kaltura entry ID、原始課程活動連結。
- 影片下方接 `LessonNotes`，包含摘要、學習重點、重要術語。
- HLS 與字幕走獨立 media host；課程網站本身不要把大型媒體納入 Git。

本次問題與修正：

- 新站一開始每支影片前後各有同名大標與小標；比對舊站後改為只保留 caption。
- VitePress 導覽列的長課程標題曾在中等寬度覆蓋搜尋框；需用 CSS 讓 title 區域 `min-width: 0`、文字省略、搜尋框維持可點擊。

### 練習題與 Badge Quiz

標準做法：

- 一般小測驗使用舊站用字 `檢核點 x`。
- Badge Quiz 不另立特殊分類，併入「綜合回顧」。
- 答案選項以繁體中文為主，英文放在括弧中作備註。
- 題幹、選項、解析、提示、分類、回課程連結都要做繁中檢查。
- 靜態練習頁明確說明正式 attempt、成績與 badge 仍回 IBM Learn。

本次問題與修正：

- 題庫初盤不足，後續重新盤點 H5P、檢核點與 Badge Quiz review。
- 有些題目欄位未翻譯，後續擴大檢查到 learner-facing fields。
- Badge Quiz 原本被獨立處理，後續依舊站改併入「綜合回顧」。

### Lab 頁

Lab 頁應整理：

- Exercise 編號與標題。
- 對應章節與學習目的。
- 前置準備：Course Exercise Guide、Course Lab Kit、Skytap / IRLP。
- 回 IBM Learn 完成 Lab 的連結與提醒。

不要讓學習者誤以為 Lab 可在靜態網站完成。Lab runtime、credential、progress 一律以 IBM Learn 原課程為準。

### 詞彙表

標準做法：

- 形式、用字與舊站一致。
- 詞彙來源應說明為參考 IBM 官方 Zikipedia / IBM Z glossary 類資料，而不是暗示只有本機來源。
- 只列本課程學習者需要查閱的項目，但要足夠覆蓋影片、Lab、練習題與閱讀材料。
- 如有內部補充詞彙，應在 handoff 中保留來源與選取理由。

本次問題與修正：

- 初版詞彙項目太少，後續以 `zOSv3R1-migration-planning/docs/01-concepts/ibm-z-glossary/README.md` 可查到的詞彙補齊。
- 移除不貼切的「完整來源詞彙庫仍保留於本機參考資料」說法，改為 IBM 官方 Zikipedia 參考脈絡。

### 授權頁

授權頁要和舊站結構一致，至少包含：

- 課程來源名稱與 URL。
- 本站用途與授權範圍。
- 影片、字幕、練習題、Badge Quiz、Lab 的處理方式。
- 正式 attempt、certificate、badge、progress 回 IBM Learn 的聲明。
- 原始課程活動連結保留原脈絡。

## 閱讀材料選取規則

優先順序：

1. 既有內部核准或團隊維護文件，例如 `zOSv3R1-migration-planning`。
2. IBM 官方 Docs、IBM Redbooks、Zikipedia 等 IBM 官方來源。
3. 其他網路資料只在必要時補充，且必須確認可靠性與時效。

章節頁的「閱讀材料」不應塞滿連結。每章 2 到 4 個最直接補強本章學習目標的來源即可。

本次新站採用的模式：

- TSO / ISPF 入門：`docs/06-ispf/README.md`、`01-navigation-and-session.md`。
- 資料集操作：`02-data-set-and-member-workflows.md`、`unix-to-zos-mapping.md`、核心術語對照。
- TSO 命令：ISPF 操作情境、TSO/E Commands IBM Docs。

## 視覺與互動一致性檢查

每次完成頁面後，至少比對：

- 首頁與課程首頁的資訊密度、卡片形式、CTA。
- 章節頁 heading 順序。
- 影片標題位置與 caption。
- 練習題命名、選項語言順序、解析風格。
- 詞彙表條目格式、來源說明與語氣。
- 授權頁的段落順序與聲明完整性。
- 導覽列在桌面中等寬度、手機寬度下是否有重疊。

可用線上舊站做抽查：

```powershell
$urls = @(
  'https://introduction-to-ibm-zos-zh-tw.pages.dev/course/mainframe-environment',
  'https://introduction-to-ibm-zos-zh-tw.pages.dev/course/mainframe-infrastructure',
  'https://introduction-to-ibm-zos-zh-tw.pages.dev/course/mainframe-security'
)
foreach ($u in $urls) {
  $html = (Invoke-WebRequest -Uri $u -UseBasicParsing).Content
  [regex]::Matches($html, '<h([123])[^>]*>(.*?)</h\1>') |
    ForEach-Object {
      "h$($_.Groups[1].Value) " + (($_.Groups[2].Value -replace '<[^>]+>','' -replace '​','').Trim())
    }
}
```

## 建置與發布標準

必要 scripts：

- `npm run build:github`
- `npm run build:cloudflare`
- `npm run site:check`
- `npm run subtitles:check`
- `npm run content:quality`
- `npm run practice:check`
- `npm run course:inventory:check`
- `npm run verify:release`

正式發布前必跑：

```powershell
npm run verify:release
```

Cloudflare Pages 與 GitHub Pages base path 不同：

- Cloudflare Pages：`VITEPRESS_BASE=/`
- GitHub Pages：`VITEPRESS_BASE=/repo-name/`

媒體 host 注意事項：

- 大型媒體、HLS、字幕可打包至獨立 media Pages 專案。
- 正式 build 可使用 `VITE_SKIP_LOCAL_MEDIA=1` 與 `publicDir: false` 避免把本機媒體塞入課程站產物。
- 每次部署課程站前確認 media manifest、playlist、字幕 URL 可讀。

Cloudflare 手動部署範例：

```powershell
$env:CLOUDFLARE_API_TOKEN = [Environment]::GetEnvironmentVariable('CLOUDFLARE_API_TOKEN', 'User')
$env:CLOUDFLARE_ACCOUNT_ID = [Environment]::GetEnvironmentVariable('CLOUDFLARE_ACCOUNT_ID', 'User')
npx wrangler pages deploy docs/.vitepress/dist --project-name <cloudflare-pages-project> --branch main --commit-dirty=true
```

若 Pages project 尚未建立，先建立專案並確認：

- project name
- production branch
- build command
- output directory
- environment variables

## Release Gate 建議

每個課程專案都應把本次踩到的問題寫成自動檢查：

- 必要頁面存在。
- 影片數、Lab 數、練習題數與盤點檔一致。
- Badge Quiz 授權與題數說明一致。
- learner-facing 欄位不得殘留英文主文或未翻譯內容。
- 練習題答案選項格式符合「中文（English）」。
- `檢核點 x`、`綜合回顧` 用字一致。
- 章節頁 heading 順序符合舊站骨架。
- 詞彙表來源說明不含本機路徑式語句。
- 授權頁包含正式 attempt / badge / Lab 回 IBM Learn 的說明。
- 導覽列長標題不覆蓋搜尋框。

## 標準驗收清單

### 內容盤點

- [ ] 課程章節、活動、影片、Lab、閱讀頁、Quiz、Badge Quiz 已盤點。
- [ ] `course-inventory-audit.json` 與 `assessment-inventory.json` 已更新。
- [ ] 每個公開 activity 都可回溯原 IBM Learn URL。
- [ ] 授權狀態已寫入 handoff 與授權頁。

### 影片與字幕

- [ ] Kaltura entry ID、source URL、HLS、字幕都已對應。
- [ ] 字幕檔存在且通過檢查。
- [ ] 影片懶載入按鈕、caption、metadata 顯示正常。
- [ ] 影片頁與章節頁沒有重複大標。

### 練習題

- [ ] 檢核點與綜合回顧題數符合盤點。
- [ ] Badge Quiz 題目已確認授權。
- [ ] 題幹、選項、解析、提示全為繁中學習者可讀內容。
- [ ] 英文只作括弧備註或必要術語保留。

### Lab

- [ ] Lab 頁只提供 metadata、目的、順序與回原課程連結。
- [ ] 沒有暗示靜態站能保存 Lab completion。
- [ ] Exercise 編號與章節順序一致。

### 詞彙表

- [ ] 覆蓋影片、Lab、題庫、閱讀材料的必要術語。
- [ ] 用字與舊站一致。
- [ ] 來源說明指向 IBM 官方 Zikipedia / IBM Z glossary 脈絡。

### 版面與風格

- [ ] 首頁、課程首頁、章節頁、練習頁、授權頁都和舊站結構一致。
- [ ] 章節頁使用 `學習脈絡 / 本章目標 / 觀看順序 / 影片 / 閱讀材料 / 本章完成檢核`。
- [ ] 導覽列、搜尋框、側欄、手機版沒有重疊。
- [ ] 長標題有省略或合理換行策略。

### 發布

- [ ] `npm run verify:release` 通過。
- [ ] GitHub Pages build 通過。
- [ ] Cloudflare Pages deployment 通過。
- [ ] production URL 抽查首頁、課程頁、影片頁、練習頁、詞彙表、授權頁。
- [ ] `FIRST-EDITION-SIGNOFF.md` 或交付紀錄已更新。

## 後續課程啟動模板

建立新課程時，先填下面資料：

```md
# Course Static Site Kickoff

- IBM Learn URL:
- Course title:
- Target site name:
- GitHub repo:
- Cloudflare Pages project:
- Media host:
- Authorized content:
  - Course text:
  - Videos:
  - Subtitles:
  - H5P / short quizzes:
  - Badge Quiz:
  - Lab instructions:
- Expected public pages:
  - Home:
  - Course index:
  - Chapter pages:
  - Videos:
  - Practice:
  - Labs:
  - Glossary:
  - License:
- Reference prior site:
  - https://introduction-to-ibm-zos-zh-tw.pages.dev/
```

第一輪交付不追求一次完美，但必須留下可重跑的盤點、可驗證的題數、清楚的授權狀態，以及能和舊站對齊的公開資訊架構。這些是後續修正能快速收斂的關鍵。
