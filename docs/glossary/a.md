# IBM Z 詞彙表：A

[返回詞彙表索引](./)

## Action bar (ISPF)

ISPF panel 最上方的功能列，常見項目包含 `Menu`、`Utilities`、`Options`、`Status` 與 `Help`。當你不知道某個功能的命令名稱時，可以先從 action bar 探索。

## ALLOC command

TSO/E 中用來配置資料集的命令。課程中的 PDS 配置題會使用 `ALLOC DA(...) DSORG(...) LRECL(...) BLKSIZE(...)` 這類語法，把資料集名稱、組織、記錄長度與空間需求一次指定清楚。

## Allocation

讓目前 TSO/E session 或 job 能夠使用某個資料集的動作。對學習者來說，可以先理解成「建立或連接到資料集資源」。

## Alias (catalog)

Catalog 中可指向另一個 catalog 或 entry 的別名。課程 Badge Quiz 中的 `LISTCAT ENT('STUDENT') ALIAS ALL` 用來查看與 `STUDENT` 這個 HLQ 相關的 alias entry。
