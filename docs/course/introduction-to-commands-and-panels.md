# z/OS 命令與面板入門

本單元先建立主機環境操作感：學習者會認識 TSO/E 與 ISPF，接著熟悉原課程提供的實作環境、課程套件與 Lab checklist，最後完成存取 Lab 環境與資料集配置的前兩個 Lab。

## 學習脈絡

這一章是從 IBM Z 與 z/OS 概念走向實際操作的入口。學習者會先理解 TSO/E 與 ISPF 如何構成互動式工作環境，再把畫面中的 panel、command line、function key、資料集與 member 放進同一個操作模型中理解。

## 本章目標

- 說明 TSO/E 與 ISPF 在 z/OS 互動操作中的角色。
- 辨識 ISPF panel、primary command、line command 與 function key 的用途。
- 理解 Lab 環境、課程套件與資料集配置練習之間的先後關係。

## 觀看順序

- 先看「TSO 與 ISPF 入門」，建立登入、panel 與命令操作的共同語言。
- 接著看「Lab：熟悉系統」，確認實作環境與課程套件的使用方式。
- 再看「在 ISPF 中建立、編輯與顯示成員」與「練習 2 介紹」，把 ISPF 操作連到後續資料集 Lab。

## 影片

<VideoLesson
  title="TSO 與 ISPF 入門"
  video-src="/media/introduction-to-tso-and-ispf.mp4"
  subtitle-src="/subtitles/introduction-to-tso-and-ispf.zh-Hant-TW.vtt"
  entry-id="1_vgfp9zxt"
  source-url="https://learn.ibm.com/mod/video/view.php?id=113970"
/>

<LessonNotes slug="introduction-to-tso-and-ispf" />

<VideoLesson
  title="Lab：熟悉系統"
  video-src="/media/lab-system-familiarization.mp4"
  subtitle-src="/subtitles/lab-system-familiarization.zh-Hant-TW.vtt"
  entry-id="1_599iixml"
  source-url="https://learn.ibm.com/mod/video/view.php?id=113963"
/>

<LessonNotes slug="lab-system-familiarization" />

<VideoLesson
  title="在 ISPF 中建立、編輯與顯示成員"
  video-src="/media/creating-editing-and-displaying-members-in-ispf.mp4"
  subtitle-src="/subtitles/creating-editing-and-displaying-members-in-ispf.zh-Hant-TW.vtt"
  entry-id="1_tfpzz00p"
  source-url="https://learn.ibm.com/mod/video/view.php?id=113969"
/>

<LessonNotes slug="creating-editing-and-displaying-members-in-ispf" />

<VideoLesson
  title="練習 2 介紹"
  video-src="/media/introduction-to-exercise-2.mp4"
  subtitle-src="/subtitles/introduction-to-exercise-2.zh-Hant-TW.vtt"
  entry-id="1_q62zrx6d"
  source-url="https://learn.ibm.com/mod/video/view.php?id=113965"
/>

<LessonNotes slug="introduction-to-exercise-2" />

## 閱讀材料

- [ISPF：大型主機互動操作入門](https://github.ibm.com/nicholas-yahung-chien/zOSv3R1-migration-planning/blob/main/docs/06-ispf/README.md)
- [ISPF 導覽與 Session 基礎](https://github.ibm.com/nicholas-yahung-chien/zOSv3R1-migration-planning/blob/main/docs/06-ispf/01-navigation-and-session.md)
- [Data Set 與 Member 操作](https://github.ibm.com/nicholas-yahung-chien/zOSv3R1-migration-planning/blob/main/docs/06-ispf/02-data-set-and-member-workflows.md)
- [The ISPF editor](https://www.ibm.com/docs/en/zos-basic-skills?topic=ispf-editor)

## 本章完成檢核

- 能說明 TSO/E 偏向命令互動，而 ISPF 偏向 panel 式互動操作。
- 能區分 primary command 與 line command，並知道它們分別輸入在何處。
- 能在開始 Lab 前確認使用者 ID、資料集名稱、Course Lab Kit 與實作環境畫面。
