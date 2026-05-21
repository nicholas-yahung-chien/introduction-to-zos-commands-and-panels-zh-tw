# IBM Z 詞彙表：I

[返回詞彙表索引](./)

## Interactive System Productivity Facility (ISPF)

z/OS 上常用的互動式面板環境，主要透過 3270 terminal 介面呈現。課程中的資料集清單、編輯器、command shell 與 utilities 都透過 ISPF 操作。

## ISPF editor

ISPF 提供的資料集與 member 編輯工具，可搭配 primary command 與 line command 進行搜尋、取代、插入、複製、移動與刪除等操作。

## ISPF Primary Option Menu

ISPF 啟動後常見的主選單，提供 `0 Settings`、`1 View`、`2 Edit`、`3 Utilities`、`6 Command` 等入口。課程多個 Lab 會從這個畫面開始。

## ISPF Settings

ISPF option `0` 的設定面板，可調整顯示、function key、panel 行為與其他個人化設定。課程小測驗中提到可用斜線 `/` 選取或設定選項。

## ISRDDN

ISPF 提供的診斷工具，可從 ISPF command line 啟動，檢查目前 session 的 DDNAME allocation、data set concatenation 與相關 library/member 使用情形。
