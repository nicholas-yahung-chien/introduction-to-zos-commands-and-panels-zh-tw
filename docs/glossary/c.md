# IBM Z 詞彙表：C

[返回詞彙表索引](./)

## Catalog

z/OS 用來記錄資料集名稱與所在位置的目錄機制。使用者通常透過 catalog 找到資料集，而不需要直接記住 volume。

## Catalog alias

Catalog 中的別名 entry，常和 high-level qualifier 搭配使用。課程中以 `LISTCAT` 檢視 `STUDENT` 相關 alias。

## CHANGE command

ISPF editor 的 primary command，用來取代文字。課程題目中的 `C MAINFRAMES SERVERS ALL` 表示把所有 `MAINFRAMES` 取代成 `SERVERS`。

## CLIST

Command List。z/OS TSO 的程序語言，可把一串 TSO 命令包成可重複執行的程序。

## Command line

ISPF panel 上輸入 primary command 的欄位，常見標示為 `Command ===>`。它和左側 prefix area 的 line command 不同。

## Command parameter

命令後面用來調整命令行為的參數或 operand。TSO commands 常包含 positional operands 與 required operands。

## COMPRESS command

TSO 中整理 PDS 空間的命令，可回收刪除或更新 member 後留下的可用空間。

## Cylinder

DASD 上由相同位置的一組 tracks 組成的儲存單位。初學配置資料集時，常會先看到 tracks 與 cylinders 這兩種空間單位。
