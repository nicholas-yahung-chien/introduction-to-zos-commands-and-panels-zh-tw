import { readFile, writeFile } from 'node:fs/promises'

const practicePath = 'data/practice-questions.json'
const sourcesPath = 'data/practice-sources.json'
const assessmentPath = 'data/assessment-inventory.json'
const auditPath = 'data/course-inventory-audit.json'
const badgeCapturePath = 'data/captured/badge-quiz-questions.json'

const choiceIds = 'abcdefghijklmnopqrstuvwxyz'.split('')

const sourceDisplayTitles = new Map([
  ['short-quiz-exercises-1-and-2', '檢核點 1'],
  ['short-quiz-exercise-3', '檢核點 2'],
  ['short-quiz-exercise-4', '檢核點 3'],
  ['short-quiz-exercise-5', '檢核點 4'],
  ['short-quiz-exercise-6', '檢核點 5'],
  ['short-quiz-exercise-7', '檢核點 6'],
  ['badge-quiz', '綜合回顧（Badge Quiz）'],
])

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function review(coursePath, hint, label = '回到課程複習', videoEntryId = 'badge-quiz') {
  return { label, coursePath, videoEntryId, hint }
}

const exercise12Updates = {
  'exercise-1-2-q1': {
    section: 'z/OS 命令與面板入門',
    lessonTitle: '配置 sequential data set',
    prompt: '配置 sequential data set 後，Data Set Information 面板中的哪個欄位表示這是 sequential data set？',
    choices: ['類型 (Type)', '配置 (Allocation)', '組織 (Organisation)', '資料集 (Data set)'],
    explanation: 'Organisation 欄位會顯示資料集組織；本題的 sequential data set 會由 Organisation 欄位判斷。',
    review: review('/course/introduction-to-commands-and-panels', '回到 Exercise 2 與資料集配置內容複習。', '回到命令與面板入門', '1_mf7bsgi9')
  },
  'exercise-1-2-q2': {
    section: 'z/OS 命令與面板入門',
    lessonTitle: '資料集 member 名稱',
    prompt: '資料集 JEFF.LOVES.GUITARS(ELECTRIC) 的 member 名稱是什麼？',
    choices: ['GUITARS', 'LOVES', 'ELECTRIC', 'JEFF'],
    explanation: 'Member 名稱是括號中的值，因此答案是 ELECTRIC。',
    review: review('/course/introduction-to-commands-and-panels', '回到 ISPF 中顯示與編輯資料集 member 的段落複習。', '回到命令與面板入門', '1_tfpzz00p')
  },
  'exercise-1-2-q3': {
    section: 'z/OS 命令與面板入門',
    lessonTitle: '配置 PDSE',
    prompt: '在 Allocate New Data Set 面板配置 PDSE 時，Data set name type 應選哪一項？',
    choices: ['大型 (Large)', '程式庫 (Library)', 'PD', 'PDSE'],
    explanation: '在此面板中配置 PDSE 時，Data set name type 應使用 Library。',
    review: review('/course/introduction-to-commands-and-panels', '回到 Allocate New Data Set 面板欄位複習。', '回到命令與面板入門', '1_mf7bsgi9')
  },
  'exercise-1-2-q4': {
    section: 'z/OS 命令與面板入門',
    lessonTitle: 'ISPF 設定',
    prompt: '在 ISPF Settings 面板中，通常使用哪個字元來設定選項？',
    choices: ['問號 (?)', "字母 O ('O')", "字母 A ('A')", '斜線 (/)'],
    explanation: 'ISPF 面板通常使用斜線（/）來選取或設定選項。',
    review: review('/course/introduction-to-commands-and-panels', '回到 TSO 與 ISPF 面板操作複習。', '回到命令與面板入門', '1_mf7bsgi9')
  },
  'exercise-1-2-q5': {
    section: 'z/OS 命令與面板入門',
    lessonTitle: 'Lab 環境熟悉',
    prompt: '課程 Lab 使用哪一套通訊軟體連線到各種系統？',
    choices: ['PCOMM', 'COMM', 'TSO console', 'z/OS Console'],
    explanation: '課程 Lab 情境中使用的通訊軟體是 PCOMM。',
    review: review('/course/introduction-to-commands-and-panels', '回到系統熟悉 Lab 影片複習。', '回到命令與面板入門', '1_5vl4y7ri')
  },
  'exercise-1-2-q6': {
    section: 'z/OS 命令與面板入門',
    lessonTitle: '鍵盤設定',
    prompt: '變更鍵盤設定後，應使用哪個副檔名儲存設定檔？',
    choices: ['bmp', 'key', 'jpeg', 'kmp'],
    explanation: 'PCOMM 的鍵盤對應設定會以 .kmp 副檔名儲存。',
    review: review('/course/introduction-to-commands-and-panels', '回到系統熟悉 Lab 影片中的鍵盤對應設定複習。', '回到命令與面板入門', '1_5vl4y7ri')
  },
  'exercise-1-2-q7': {
    section: 'z/OS 命令與面板入門',
    lessonTitle: '配置 sequential data set',
    prompt: '配置 sequential data set 時，Directory blocks 欄位應使用哪個值？',
    choices: ['10', '2', '0', '4'],
    explanation: 'Sequential data set 不需要 member directory，因此 Directory blocks 應設定為 0。',
    review: review('/course/introduction-to-commands-and-panels', '回到 sequential data set 配置值複習。', '回到命令與面板入門', '1_mf7bsgi9')
  },
  'exercise-1-2-q8': {
    section: 'z/OS 命令與面板入門',
    lessonTitle: 'ISPF Primary Option Menu 主選單',
    prompt: '要從 ISPF Primary Option Menu 移除 Licensed Material copyright 資訊，正確程序是什麼？',
    choices: ['按 F2', '按 Enter 鍵', '按 F12'],
    explanation: '依檢核點題目，正確程序是按 Enter 鍵。',
    review: review('/course/introduction-to-commands-and-panels', '回到 ISPF Primary Option Menu 的操作行為複習。', '回到命令與面板入門', '1_mf7bsgi9')
  }
}

const badgeTranslations = [
  {
    prompt: '哪個 TSO 命令可用來告訴系統你想如何使用終端機？',
    choices: ['編輯 (EDIT)', '命令清單 (CLIST)', '使用者設定檔 (PROFILE)', '終端機 (TERM)'],
    explanation: 'PROFILE 命令可顯示或變更 TSO/E 使用者 profile，其中包含終端機使用方式相關設定。'
  },
  {
    prompt: '依下列資訊配置新的 PDS 時，正確的 TSO ALLOC 命令語法是哪一個？使用者 ID：IBM；資料集名稱：BUILDS.SERVERS；Block length：100 bytes；Logical record length：80；Data control block size：300；Directory blocks：2；Record format：fixed block。',
    choices: [
      'ALLOC DA(BUILDS.SERVERS) DSORG(PDS) BLOCK(100) LRECL(80) BLKSIZE(300) DIR(2) RECFM(F,B) NEW TRACKS SPACE(2,3)',
      'ALLOC DA(BUILDS.SERVERS) DSORG(PDSE) BLOCK(100) LRECL(80) BLKSIZE(300) DIR(2) RECFM(F,B) NEW TRACKS SPACE(2,3)',
      'ALLOC DA(BUILDS.SERVERS) DSORG(PO) BLOCK(100) LRECL(80) BLKSIZE(300) DIR(2) RECFM(F,B) NEW TRACKS SPACE(2,3)',
      'ALLOC DA(IBM.BUILDS.SERVERS) DSORG(PO) BLOCK(100) LRECL(80) BLKSIZE(300) DIR(2) RECFM(F,B) NEW TRACKS SPACE(2,3)'
    ],
    explanation: 'PDS 的 DSORG 使用 PO，且題目指定的資料集名稱是 BUILDS.SERVERS，不需額外加上 IBM。'
  },
  {
    prompt: '建立到某個資料集的連結時，這個動作稱為什麼？',
    choices: ['指定 (Assign)', '配置 (Allocate)', '設定 (Configure)', '建立 (Create)'],
    explanation: '在 TSO/E 中，讓工作階段能使用資料集的動作稱為 allocate。'
  },
  {
    prompt: '哪個 prefix line command 會把一筆或多筆來源記錄中指定欄位的資料，複製到一筆或多筆既有記錄的對應欄位？',
    choices: ['C', 'R', 'M', 'O'],
    explanation: 'O 是 overlay line command，用來將來源欄位覆蓋到既有記錄的對應欄位。'
  },
  {
    prompt: '在 edit panel 的資料集中，要移動一整段連續資料列時，prefix area 應輸入什麼？',
    choices: [
      '第一列輸入 MM、最後一列輸入 MM，目標列輸入後方 (F, following) 或前方 (P, preceding)',
      '第一列輸入 MM、最後一列輸入 MM，目標列輸入之後 (A, after) 或之前 (B, before)',
      '第一列輸入 M、最後一列輸入 M，目標列輸入後方 (F, following) 或前方 (P, preceding)',
      '第一列輸入 M、最後一列輸入 M，目標列輸入之後 (A, after) 或之前 (B, before)'
    ],
    explanation: '移動區塊時以 MM 標示區塊起訖，再用 A 或 B 指定要放在目標列之後或之前。'
  },
  {
    prompt: '正確登出 TSO 的程序是什麼？',
    choices: ['在主要選項選單 (Primary Option Menu) 輸入 disconnect', "在 ready 模式 ('ready' mode) 輸入 logoff", '在主要選項選單 (Primary Option Menu) 輸入 logoff', '結束 ISPF 工作階段 (session) 後輸入 disconnect'],
    explanation: "結束 ISPF 回到 'ready' mode 後，輸入 logoff 才是正確的 TSO 登出方式。"
  },
  {
    prompt: "在 ISPF data set list function（3.4）回傳的資料集清單中，哪個 primary command 會定位游標到第一個以 'PROD' 開頭的資料集？",
    choices: ['L PROD', 'F PROD', 'S PROD'],
    explanation: 'L PROD 會在清單中 locate 到第一個符合指定字首的位置。'
  },
  {
    prompt: '在資料集中搜尋某個字詞後，哪個 function key 可再次尋找同一個字詞？',
    choices: ['F5', 'F4', 'F10', 'F2'],
    explanation: 'F5 對應 RFIND，可重複上一個 FIND 搜尋。'
  },
  {
    prompt: '結束 ISPF session 的兩種方式是哪一組？',
    choices: [
      '在 ISPF 主要選項選單 (Primary Option Menu) 的命令列 (command line) 輸入 END，或按取消鍵 (F12, Cancel)',
      '按離開鍵 (F3, Exit)，再在主要選項選單 (Primary Option Menu) 輸入 Logoff',
      '按取消鍵 (F12, Cancel)，再在主要選項選單 (Primary Option Menu) 輸入 Logoff',
      '在 ISPF 主要選項選單 (Primary Option Menu) 的命令列 (command line) 輸入 X，或按取消鍵 (F12, Cancel)'
    ],
    explanation: '在 ISPF Primary Option Menu 可輸入 X 結束，或使用 F12（Cancel）離開 ISPF。'
  },
  {
    prompt: '在 edit panel 的資料集中，要新增三列空白列供輸入資料，prefix area 應輸入什麼？',
    choices: ['A3', '13', 'I3', 'A 1-3'],
    explanation: 'I3 表示 insert 3 lines，也就是插入三列空白列。'
  },
  {
    prompt: '資料集名稱為 "IBM.Z.MAINFRAME" 時，low-level qualifier（LLQ）是哪一段？',
    choices: ['Z.MAINFRAME', 'Z', 'IBM', 'MAINFRAME'],
    explanation: 'LLQ 是完整資料集名稱最右側的 qualifier，因此是 MAINFRAME。'
  },
  {
    prompt: '要在資料集中把所有 mainframes 取代成 servers，正確語法是哪一個？',
    choices: ['REP MAINFRAMES SERVERS ALL', 'CH,MAINFRAMES,SERVERS,ALL', 'C MAINFRAMES SERVERS ALL'],
    explanation: 'ISPF edit 中可用 C 作為 CHANGE 的縮寫，ALL 表示取代所有符合項目。'
  },
  {
    prompt: '要顯示與 HLQ STUDENT 相關的 catalog alias entry，正確命令語法是哪一個？',
    choices: ["LISTCAT ENT('STUDENT') ALIAS ALL", 'LISTCAT ENT(STUDENT) ALIAS ALL', "LIST ALL ALIAS ('STUDENT')", "LISTALC ENT('STUDENT') ALAIS ALL"],
    explanation: "LISTCAT ENT('STUDENT') ALIAS ALL 會列出 STUDENT 這個 entry 的 alias 資訊。"
  },
  {
    prompt: '要列出資料集 IBM.SURVEY.RESULTS 的基本屬性，正確的 TSO 命令語法是哪一個？',
    choices: ["LISTDS ('IBM.SURVEY.RESULTS')", "LIST 'IBM.SURVEY.RESULTS'", 'LISTDS (IBM.SURVEY.RESULTS)', 'LISTALC IBM.SURVEY.RESULTS'],
    explanation: "LISTDS ('IBM.SURVEY.RESULTS') 是列出指定資料集基本屬性的正確語法。"
  },
  {
    prompt: '輸入 TSO commands 的三種方法是哪一組？',
    choices: [
      '在對話面板 (Dialog panel) 的命令選項列 (command option line)、ISPF 主要選項選單 (Primary Option Menu) option 5，以及命令提示字元 (command prompt)',
      '從 ISPF 主要選項選單 (Primary Option Menu) option 6、ISPF 面板 (panel) 的命令選項列 (command option line)，以及命令提示字元 (command prompt)',
      '從 ISPF 主要選項選單 (Primary Option Menu) option 6、對話面板 (Dialog panel) 的命令選項列 (command option line)，以及命令提示字元 (command prompt)',
      '從 ISPF 面板 (panel) 的命令選項列 (command option line)、命令提示字元 (command prompt)，以及 ISPF 主要選項選單 (Primary Option Menu) option 5'
    ],
    explanation: 'TSO commands 可從 ISPF option 6、ISPF panel 的 command option line，以及 command prompt 輸入。'
  },
  {
    prompt: '在 logon screen 上輸入 userid 時，TSOID01、tsoid01、TSoid01 哪些大小寫寫法有效？',
    choices: ['全部都無效', '全部都有效'],
    explanation: 'TSO userid 在此情境中不區分大小寫，因此三種大小寫寫法都有效。'
  },
  {
    prompt: '結束 ISPF 後，TSO session 目前處於什麼狀態？',
    choices: ['異常結束 (TSO ABEND)', '仍在執行 (TSO active)', '已登出 (TSO logged off)', '已中斷連線 (TSO disconnected)'],
    explanation: '結束 ISPF 不等於登出 TSO；回到 ready mode 時 TSO session 仍在執行。'
  },
  {
    prompt: '哪個 TSO 命令會 deallocate 不再需要的資料集？',
    choices: ['CLEAN', 'FREE', 'UNALLOCATE', 'REMOVE'],
    explanation: 'FREE 命令用來釋放或 deallocate 不再需要的資料集配置。'
  },
  {
    prompt: '找到特定字詞後，若要不重新輸入字串而重複同一個搜尋，應使用什麼？',
    choices: ['rchar', 'rsearch', 'locate', 'rfind'],
    explanation: 'RFIND 會重複上一個 FIND 搜尋；在題目中以 rfind 表示。'
  },
  {
    prompt: '哪個 prefix area 命令會新增六列空白列？',
    choices: ['A6', 'I6', 'A,6', 'I,6'],
    explanation: 'I6 表示 insert 6 lines，也就是插入六列空白列。'
  },
  {
    prompt: '在練習中成功登入 TSO 後，畫面顯示哪個 panel？',
    choices: ['IBM Education', 'ISPF Primary Option Menu', 'IBM Training', 'Command prompt'],
    explanation: '成功登入 TSO 並進入 ISPF 後，會顯示 ISPF Primary Option Menu。'
  },
  {
    prompt: '哪一類資料集可以包含 members？',
    choices: ['分割資料集與延伸分割資料集 (PDS 與 PDSE)', '虛擬儲存存取方法與分割資料集 (VSAM 與 PDS)', '延伸分割資料集與循序資料集 (PDSE 與 Sequential)', '分割資料集與虛擬儲存存取方法 (PDS 與 VSAM)'],
    explanation: 'PDS 與 PDSE 都是可包含 members 的資料集型態。'
  },
  {
    prompt: '哪個 TSO 命令會回收被刪除或更新的 members 原先占用、目前可重新使用的浪費空間？',
    choices: ['Restate', 'Consolidate', 'Contract', 'Compress'],
    explanation: 'Compress 會整理 PDS 空間，回收刪除或更新 members 後留下的可用空間。'
  },
  {
    prompt: '關於 TSO commands，下列哪些敘述正確？',
    choices: [
      '區分大小寫的 TSO 命令 (TSO commands)',
      '包含位置式運算元與必要運算元的 TSO 命令 (positional operands 與 required operands)',
      '可從任何 ISPF 畫面輸入的 TSO 命令 (ISPF screen)',
      '不區分大小寫的 TSO 命令 (TSO commands)',
      '使用 HELP LISTDS ALL 查詢 LISTDS 命令的完整資訊 (LISTDS command)'
    ],
    explanation: 'TSO commands 不區分大小寫，可包含 positional 與 required operands；在 ISPF screen 的 command line 可輸入 TSO commands，而 HELP LISTDS ALL 可查看 LISTDS 的完整說明。'
  },
  {
    prompt: '成功登入 TSO 後，畫面出現三個星號（***）時，正確動作是什麼？',
    choices: ['按空白鍵', '按 Enter 鍵', '輸入 continue'],
    explanation: '三個星號（***）通常表示系統等待使用者確認；此時按 Enter 鍵繼續。'
  }
]

const badgeQuestionPlacement = [
  {
    section: 'TSO 命令',
    lessonSlug: 'tso-commands',
    lessonTitle: 'TSO PROFILE 設定',
    review: review('/course/tso-commands', '回到 TSO 命令單元複習 PROFILE command 與終端機設定。', '回到 TSO 命令', '1_l7ew4gle')
  },
  {
    section: '處理資料集',
    lessonSlug: 'working-with-data-sets',
    lessonTitle: '配置 PDS',
    review: review('/course/working-with-data-sets', '回到處理資料集單元複習 PDS 配置與 ALLOC 語法。', '回到資料集操作', '1_8c0kkd2m')
  },
  {
    section: '處理資料集',
    lessonSlug: 'working-with-data-sets',
    lessonTitle: '資料集配置',
    review: review('/course/working-with-data-sets', '回到處理資料集單元複習 allocate 與資料集建立概念。', '回到資料集操作', '1_8c0kkd2m')
  },
  {
    section: '處理資料集',
    lessonSlug: 'working-with-data-sets',
    lessonTitle: 'ISPF 編輯器行命令',
    review: review('/course/working-with-data-sets', '回到處理資料集單元複習 ISPF editor prefix line commands。', '回到資料集操作', '1_2knifm0p')
  },
  {
    section: '處理資料集',
    lessonSlug: 'working-with-data-sets',
    lessonTitle: 'ISPF 編輯器行命令',
    review: review('/course/working-with-data-sets', '回到處理資料集單元複習 ISPF editor 的搬移與區塊命令。', '回到資料集操作', '1_2knifm0p')
  },
  {
    section: 'z/OS 命令與面板入門',
    lessonSlug: 'introduction-to-commands-and-panels',
    lessonTitle: 'TSO session 登出',
    review: review('/course/introduction-to-commands-and-panels', '回到命令與面板入門單元複習 TSO session 與 logoff 流程。', '回到命令與面板入門', '1_mf7bsgi9')
  },
  {
    section: '處理資料集',
    lessonSlug: 'working-with-data-sets',
    lessonTitle: 'ISPF Data Set List 清單',
    review: review('/course/working-with-data-sets', '回到處理資料集單元複習 ISPF 3.4 Data Set List 與 primary command。', '回到資料集操作', '1_8c0kkd2m')
  },
  {
    section: '處理資料集',
    lessonSlug: 'working-with-data-sets',
    lessonTitle: 'ISPF editor 搜尋',
    review: review('/course/working-with-data-sets', '回到處理資料集單元複習 FIND、RFIND 與 function key。', '回到資料集操作', '1_2knifm0p')
  },
  {
    section: 'z/OS 命令與面板入門',
    lessonSlug: 'introduction-to-commands-and-panels',
    lessonTitle: 'ISPF session 結束',
    review: review('/course/introduction-to-commands-and-panels', '回到命令與面板入門單元複習 ISPF Primary Option Menu 與 session 結束方式。', '回到命令與面板入門', '1_mf7bsgi9')
  },
  {
    section: '處理資料集',
    lessonSlug: 'working-with-data-sets',
    lessonTitle: 'ISPF editor 插入列',
    review: review('/course/working-with-data-sets', '回到處理資料集單元複習 ISPF editor prefix area 的插入列命令。', '回到資料集操作', '1_2knifm0p')
  },
  {
    section: '處理資料集',
    lessonSlug: 'working-with-data-sets',
    lessonTitle: '資料集 qualifier',
    review: review('/course/working-with-data-sets', '回到處理資料集單元複習資料集命名、HLQ 與 LLQ。', '回到資料集操作', '1_8c0kkd2m')
  },
  {
    section: '處理資料集',
    lessonSlug: 'working-with-data-sets',
    lessonTitle: 'ISPF editor 變更命令',
    review: review('/course/working-with-data-sets', '回到處理資料集單元複習 CHANGE command 與 editor primary commands。', '回到資料集操作', '1_2knifm0p')
  },
  {
    section: 'TSO 命令',
    lessonSlug: 'tso-commands',
    lessonTitle: 'LISTCAT 與 catalog alias',
    review: review('/course/tso-commands', '回到 TSO 命令單元複習 LISTCAT 與 catalog alias。', '回到 TSO 命令', '1_l7ew4gle')
  },
  {
    section: 'TSO 命令',
    lessonSlug: 'tso-commands',
    lessonTitle: 'LISTDS 資料集屬性',
    review: review('/course/tso-commands', '回到 TSO 命令單元複習 LISTDS 與資料集屬性查詢。', '回到 TSO 命令', '1_l7ew4gle')
  },
  {
    section: 'TSO 命令',
    lessonSlug: 'tso-commands',
    lessonTitle: '輸入 TSO commands',
    review: review('/course/tso-commands', '回到 TSO 命令單元複習輸入 TSO commands 的三種方式。', '回到 TSO 命令', '1_l7ew4gle')
  },
  {
    section: 'z/OS 命令與面板入門',
    lessonSlug: 'introduction-to-commands-and-panels',
    lessonTitle: 'TSO logon 登入',
    review: review('/course/introduction-to-commands-and-panels', '回到命令與面板入門單元複習 TSO logon 與 userid 輸入。', '回到命令與面板入門', '1_mf7bsgi9')
  },
  {
    section: 'z/OS 命令與面板入門',
    lessonSlug: 'introduction-to-commands-and-panels',
    lessonTitle: 'ISPF 與 TSO session',
    review: review('/course/introduction-to-commands-and-panels', '回到命令與面板入門單元複習 ISPF 結束後的 TSO ready mode。', '回到命令與面板入門', '1_mf7bsgi9')
  },
  {
    section: 'TSO 命令',
    lessonSlug: 'tso-commands',
    lessonTitle: 'FREE 釋放命令',
    review: review('/course/tso-commands', '回到 TSO 命令單元複習 FREE command 與 deallocate。', '回到 TSO 命令', '1_l7ew4gle')
  },
  {
    section: '處理資料集',
    lessonSlug: 'working-with-data-sets',
    lessonTitle: 'RFIND 搜尋命令',
    review: review('/course/working-with-data-sets', '回到處理資料集單元複習 FIND 與 RFIND 搜尋操作。', '回到資料集操作', '1_2knifm0p')
  },
  {
    section: '處理資料集',
    lessonSlug: 'working-with-data-sets',
    lessonTitle: 'ISPF editor 插入列',
    review: review('/course/working-with-data-sets', '回到處理資料集單元複習 ISPF editor prefix area 的插入列命令。', '回到資料集操作', '1_2knifm0p')
  },
  {
    section: 'z/OS 命令與面板入門',
    lessonSlug: 'introduction-to-commands-and-panels',
    lessonTitle: 'TSO logon 後的 ISPF',
    review: review('/course/introduction-to-commands-and-panels', '回到命令與面板入門單元複習 TSO logon 後進入 ISPF Primary Option Menu。', '回到命令與面板入門', '1_mf7bsgi9')
  },
  {
    section: '處理資料集',
    lessonSlug: 'working-with-data-sets',
    lessonTitle: 'PDS 與 PDSE members',
    review: review('/course/working-with-data-sets', '回到處理資料集單元複習 PDS、PDSE 與 members。', '回到資料集操作', '1_8c0kkd2m')
  },
  {
    section: 'TSO 命令',
    lessonSlug: 'tso-commands',
    lessonTitle: 'COMPRESS 空間回收命令',
    review: review('/course/tso-commands', '回到 TSO 命令單元複習 COMPRESS command 與 PDS 空間回收。', '回到 TSO 命令', '1_l7ew4gle')
  },
  {
    section: 'TSO 命令',
    lessonSlug: 'tso-commands',
    lessonTitle: 'TSO command 基礎',
    review: review('/course/tso-commands', '回到 TSO 命令單元複習 TSO command 語法與使用方式。', '回到 TSO 命令', '1_l7ew4gle')
  },
  {
    section: 'z/OS 命令與面板入門',
    lessonSlug: 'introduction-to-commands-and-panels',
    lessonTitle: 'TSO logon 畫面',
    review: review('/course/introduction-to-commands-and-panels', '回到命令與面板入門單元複習 TSO logon 後的畫面操作。', '回到命令與面板入門', '1_mf7bsgi9')
  }
]

const currentQuestions = JSON.parse(await readFile(practicePath, 'utf8'))
const sources = JSON.parse(await readFile(sourcesPath, 'utf8'))
const assessment = JSON.parse(await readFile(assessmentPath, 'utf8'))
const audit = JSON.parse(await readFile(auditPath, 'utf8'))
const badgeCapture = JSON.parse(await readFile(badgeCapturePath, 'utf8'))

assert(Array.isArray(currentQuestions), 'practice questions must be an array')
assert(badgeCapture.uniqueQuestionCount === badgeTranslations.length, 'Badge capture count and translation count differ')

const shortQuizQuestions = currentQuestions.filter((question) => question.sourceReference !== 'badge-quiz')

const translatedExisting = shortQuizQuestions.map((question) => {
  const update = exercise12Updates[question.id]
  if (!update) return question
  return {
    ...question,
    section: update.section,
    lessonTitle: update.lessonTitle,
    prompt: update.prompt,
    choices: question.choices.map((choice, index) => ({
      ...choice,
      text: update.choices[index]
    })),
    explanation: update.explanation,
    review: update.review
  }
})

const badgeQuestions = badgeCapture.questions.map((capturedQuestion, index) => {
  const translation = badgeTranslations[index]
  const placement = badgeQuestionPlacement[index]
  assert(capturedQuestion.choices.length === translation.choices.length, `Badge question ${index + 1} choice count differs`)
  assert(placement, `Badge question ${index + 1} is missing course placement`)

  const choices = capturedQuestion.choices.map((choice, choiceIndex) => ({
    id: choiceIds[choiceIndex],
    text: translation.choices[choiceIndex]
  }))

  return {
    id: `badge-quiz-q${index + 1}`,
    section: placement.section,
    lessonSlug: placement.lessonSlug,
    lessonTitle: placement.lessonTitle,
    sourceType: 'moodle-quiz',
    sourceUrl: 'https://learn.ibm.com/mod/quiz/view.php?id=348590',
    sourceReference: 'badge-quiz',
    prompt: translation.prompt,
    choices,
    correctChoiceIds: capturedQuestion.choices
      .map((choice, choiceIndex) => (choice.isCorrect ? choiceIds[choiceIndex] : null))
      .filter(Boolean),
    explanation: translation.explanation,
    review: placement.review
  }
})

for (const question of badgeQuestions) {
  assert(question.correctChoiceIds.length > 0, `${question.id} has no correct answer`)
}

const allQuestions = [...translatedExisting, ...badgeQuestions]

for (const question of allQuestions) {
  for (const field of ['section', 'lessonTitle', 'prompt', 'explanation']) {
    assert(/[\u4e00-\u9fff]/.test(question[field]), `${question.id} missing Chinese translation in ${field}`)
  }
  assert(/[\u4e00-\u9fff]/.test(question.review.hint), `${question.id} missing Chinese review hint`)
}

for (const source of sources.sources) {
  if (sourceDisplayTitles.has(source.id)) {
    source.title = sourceDisplayTitles.get(source.id)
  }

  if (source.id === 'badge-quiz') {
    source.title = '綜合回顧（Badge Quiz）'
    source.sectionSlug = 'comprehensive-review'
    source.sectionTitle = '綜合回顧'
    source.status = 'captured-for-static-practice-authorized'
    source.intendedUse = 'IBM 團隊主管已授權重製 Badge Quiz 題目；本站依題目主題併入一般練習分類，並以綜合回顧標示來源。正式成績、attempt 與 badge 仍以 IBM Learn 為準。'
    source.capturedQuestionCount = badgeQuestions.length
    source.captureNotes = [
      '每次 Badge Quiz attempt 顯示 20 題。',
      `已從 ${badgeCapture.attempts.length} 次 completed review 合併去重為 ${badgeQuestions.length} 題可見題庫。`
    ]
  }
}

assessment.summary.staticPracticeQuestions = allQuestions.length
assessment.summary.staticPracticeSources = sources.sources.length
assessment.summary.formalBadgeQuizQuestions = 20
assessment.summary.badgeQuizQuestionsPerAttempt = 20
assessment.summary.badgeQuizCapturedUniqueQuestions = badgeQuestions.length
assessment.summary.totalKnownQuizQuestionsIncludingBadge = allQuestions.length
assessment.practiceSources = sources.sources.map((source) => ({
  id: source.id,
  title: source.title,
  type: source.type,
  status: source.status,
  capturedQuestionCount: source.capturedQuestionCount,
  sourceUrl: source.sourceUrl
}))
assessment.captureNotes = [
  'Short quiz: Exercises 1 and 2 is a Moodle quiz and was omitted from the first static practice pass, which only extracted H5P activities.',
  `Badge Quiz is a formal IBM Learn Moodle quiz with 20 questions per attempt. After user confirmed IBM team lead authorization on 2026-05-21, ${badgeQuestions.length} unique questions visible across completed review attempts were reproduced as static practice questions.`,
  'H5P short quiz activities for Exercises 3-7 contain 11 total questions.',
  'All static practice prompts, explanations, and review hints were checked for Traditional Chinese learner-facing text.'
]

audit.quizQuestionSources = {
  moodleShortQuizExercises1And2: 8,
  hvpExercises3To7: 11,
  badgeQuizFormalAssessment: 20,
  badgeQuizCapturedUniqueQuestions: badgeQuestions.length,
  staticPracticeQuestions: allQuestions.length
}

await writeFile(practicePath, `${JSON.stringify(allQuestions, null, 2)}\n`, 'utf8')
await writeFile(sourcesPath, `${JSON.stringify(sources, null, 2)}\n`, 'utf8')
await writeFile(assessmentPath, `${JSON.stringify(assessment, null, 2)}\n`, 'utf8')
await writeFile(auditPath, `${JSON.stringify(audit, null, 2)}\n`, 'utf8')

console.log(`Rebuilt ${allQuestions.length} practice question(s): ${translatedExisting.length} short quiz question(s) plus ${badgeQuestions.length} Badge Quiz question(s).`)
