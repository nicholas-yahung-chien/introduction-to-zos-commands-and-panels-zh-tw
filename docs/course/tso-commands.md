# TSO 命令

本單元把前面透過 ISPF 面板建立的操作經驗延伸到 TSO/E 命令。學習者會練習命令語法、結果判讀與最後一個 hands-on Lab。

## 學習脈絡

ISPF 是常用的互動面板，但許多查詢、配置與作業控制仍會透過 TSO/E 命令完成。這一章把命令語法、縮寫、參數與結果訊息放在 Lab 情境中理解，讓學習者能在 ISPF command line 或 Command Shell 中安全地執行與判讀 TSO 命令。

## 本章目標

- 說明 TSO/E 命令與 ISPF panel 操作如何互補。
- 辨識常用命令的語法、縮寫與參數位置。
- 在執行命令前確認目標資料集、使用者 ID 與 Lab 指示，並能閱讀回應訊息。

## 觀看順序

- 先看「TSO 命令 - 第 1 部分」，建立命令輸入位置、語法與基本查詢方式。
- 再看「TSO 命令 - 第 2 部分」，延伸到更多資料集與系統查詢命令。
- 最後看「Lab：使用 TSO 命令」，把前兩支影片的命令放進 Exercise 7 的操作流程。

## 影片

<VideoLesson
  title="TSO 命令 - 第 1 部分"
  video-src="/media/tso-commands-part-1.mp4"
  subtitle-src="/subtitles/tso-commands-part-1.zh-Hant-TW.vtt"
  entry-id="1_slqjkgxp"
  source-url="https://learn.ibm.com/mod/video/view.php?id=113961"
/>

<LessonNotes slug="tso-commands-part-1" />

<VideoLesson
  title="TSO 命令 - 第 2 部分"
  video-src="/media/tso-commands-part-2.mp4"
  subtitle-src="/subtitles/tso-commands-part-2.zh-Hant-TW.vtt"
  entry-id="1_wrv2aloe"
  source-url="https://learn.ibm.com/mod/video/view.php?id=113966"
/>

<LessonNotes slug="tso-commands-part-2" />

<VideoLesson
  title="Lab：使用 TSO 命令"
  video-src="/media/lab-using-tso-commands.mp4"
  subtitle-src="/subtitles/lab-using-tso-commands.zh-Hant-TW.vtt"
  entry-id="1_bqff6hoz"
  source-url="https://learn.ibm.com/mod/video/view.php?id=113964"
/>

<LessonNotes slug="lab-using-tso-commands" />

## 閱讀材料

- [ISPF 導覽與 Session 基礎](https://github.ibm.com/nicholas-yahung-chien/zOSv3R1-migration-planning/blob/main/docs/06-ispf/01-navigation-and-session.md)
- [本專案 ISPF 操作情境](https://github.ibm.com/nicholas-yahung-chien/zOSv3R1-migration-planning/blob/main/docs/06-ispf/03-migration-operator-playbook.md)
- [List of TSO/E Commands](https://www.ibm.com/docs/en/zos/latest?topic=commands-list-tsoe)
- [Unix/Linux 到 z/OS 的對照指南](https://github.ibm.com/nicholas-yahung-chien/zOSv3R1-migration-planning/blob/main/docs/01-concepts/unix-to-zos-mapping.md)

## 本章完成檢核

- 能說明在 ISPF 中前綴 `TSO` 執行單一命令，與進入 Command Shell 連續執行命令的差異。
- 能依 Lab 指示確認命令目標，再執行資料集查詢、配置或釋放相關命令。
- 能根據命令回應訊息判斷是否需要回到影片、Lab 指示或 TSO/E command reference 比對語法。
