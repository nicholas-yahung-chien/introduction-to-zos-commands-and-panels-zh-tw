# 處理資料集

本單元是課程的核心實作區段。學習者會配置資料集、使用 ISPF 編輯器主要命令與行命令，並練習複製、移動、重新命名、刪除資料集與成員。

## 學習脈絡

z/OS 的資料集不是一般檔案系統中的檔案。這一章把資料集名稱、配置屬性、PDS/PDSE member、ISPF 編輯器與清單工具放在一起，協助學習者理解為什麼後續 Lab 會反覆要求先確認資料集名稱、成員與目標範圍。

## 本章目標

- 理解資料集、member、PDS/PDSE 與一般檔案概念的差異。
- 說明配置資料集時需要注意名稱、空間、記錄格式與使用情境。
- 使用 ISPF 的 View/Browse/Edit、DSLIST、Library Utility 與 line command 管理資料集。

## 觀看順序

- 先看「配置資料集」，理解建立資料集時要決定的屬性與命名。
- 再看「使用資料集」，把資料集清單、member 操作、複製、移動、重新命名與刪除串成一個工作流程。
- 影片看完後再回到 Exercise 3 到 Exercise 6，逐步練習主要命令、行命令與資料集清單。

## 影片

<VideoLesson
  title="配置資料集"
  video-src="/media/allocating-a-data-set.mp4"
  subtitle-src="/subtitles/allocating-a-data-set.zh-Hant-TW.vtt"
  entry-id="1_mf7bsgi9"
  source-url="https://learn.ibm.com/mod/video/view.php?id=113962"
/>

<LessonNotes slug="allocating-a-data-set" />

<VideoLesson
  title="使用資料集"
  video-src="/media/working-with-data-sets.mp4"
  subtitle-src="/subtitles/working-with-data-sets.zh-Hant-TW.vtt"
  entry-id="1_gu8gc31x"
  source-url="https://learn.ibm.com/mod/video/view.php?id=113967"
/>

<LessonNotes slug="working-with-data-sets" />

## 閱讀材料

- [Data Set 與 Member 操作](https://github.ibm.com/nicholas-yahung-chien/zOSv3R1-migration-planning/blob/main/docs/06-ispf/02-data-set-and-member-workflows.md)
- [Unix/Linux 到 z/OS 的對照指南](https://github.ibm.com/nicholas-yahung-chien/zOSv3R1-migration-planning/blob/main/docs/01-concepts/unix-to-zos-mapping.md)
- [z/OS 核心術語對照表](https://github.ibm.com/nicholas-yahung-chien/zOSv3R1-migration-planning/blob/main/docs/01-concepts/terminology-guide.md)
- [The ISPF editor](https://www.ibm.com/docs/en/zos-basic-skills?topic=ispf-editor)

## 本章完成檢核

- 能說明 sequential data set、PDS/PDSE 與 member 的基本差異。
- 能在修改、複製、移動、重新命名或刪除前，先確認資料集名稱、member 與目標範圍。
- 能區分 ISPF 主要命令與行命令，並知道何時應使用資料集清單定位目標。
