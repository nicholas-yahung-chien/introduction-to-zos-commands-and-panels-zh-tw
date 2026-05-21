# IBM Z 詞彙表：D

[返回詞彙表索引](./)

## Data set

在 z/OS 中使用的資料集合，可包含程式、控制敘述、資料記錄或其他可由系統管理與存取的內容。

## Data set list (DSLIST)

ISPF Utilities option `3.4` 的資料集清單工具，可依 data set name pattern 列出資料集，並從清單中 browse、view、edit、information、member list、copy、delete 或 rename。

## Data set name

z/OS 資料集的名稱，由一段或多段 qualifier 組成，例如 `IBM.Z.MAINFRAME`。最左側通常稱為 HLQ，最右側稱為 LLQ。

## Data control block (DCB)

描述資料集記錄與區塊屬性的控制資訊。課程配置題中常見的 `LRECL`、`BLKSIZE`、`RECFM` 都屬於資料集格式設定的一部分。

## Directory block

PDS 用來記錄 member directory 的空間。Sequential data set 不需要 member directory，因此配置時 directory blocks 通常為 0。

## DSORG

Data set organization 的縮寫，用來描述資料集組織型態。課程中 `DSORG(PO)` 表示 partitioned organization，也就是 PDS 類型。
