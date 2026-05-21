# IBM Z 詞彙表：L

[返回詞彙表索引](./)

## Line command

在 ISPF editor 或清單面板左側 prefix area 輸入的命令，用來對特定資料列或資料列區塊執行插入、複製、移動、重複、刪除等動作。

## LISTCAT command

TSO/IDCAMS 常用來列出 catalog 資訊的命令。課程中用 `LISTCAT ENT('STUDENT') ALIAS ALL` 查看指定 HLQ 相關的 alias entry。

## LISTDS command

TSO 中列出資料集屬性的命令。課程中以 `LISTDS ('IBM.SURVEY.RESULTS')` 查詢資料集基本屬性。

## LOCATE command

ISPF 清單或 editor 中用來定位到指定字串或項目的命令。課程中的 `L PROD` 會在 data set list 中定位到第一個以 `PROD` 開頭的資料集。

## Logical record length (LRECL)

資料集中單筆 logical record 的長度。配置資料集時常和 `RECFM`、`BLKSIZE` 一起指定。

## Low-level qualifier (LLQ)

資料集名稱最右側的 qualifier。例如 `IBM.Z.MAINFRAME` 的 LLQ 是 `MAINFRAME`。
