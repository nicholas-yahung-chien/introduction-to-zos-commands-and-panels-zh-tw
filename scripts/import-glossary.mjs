import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const sourceRoot = path.resolve(root, '..', '..', 'zOSv3R1-migration-planning')
const sourceGlossary = path.join(sourceRoot, 'docs', '01-concepts', 'ibm-z-glossary')
const targetGlossary = path.join(root, 'docs', 'glossary')
const referencesDir = path.join(root, 'references')
const handoffDir = path.join(root, 'handoff')

const selectedTerms = [
  'Action bar (ISPF)',
  'ALLOC command',
  'Allocation',
  'Alias (catalog)',
  'Block',
  'BLKSIZE',
  'Browse (ISPF)',
  'Catalog',
  'Catalog alias',
  'CHANGE command',
  'CLIST',
  'Command line',
  'Command parameter',
  'COMPRESS command',
  'Cylinder',
  'Data set',
  'Data set list (DSLIST)',
  'Data set name',
  'Data control block (DCB)',
  'Directory block',
  'DSORG',
  'FIND command',
  'FREE command',
  'Function key (ISPF)',
  'HELP command',
  'High-level qualifier (HLQ)',
  'Interactive System Productivity Facility (ISPF)',
  'ISPF editor',
  'ISPF Primary Option Menu',
  'ISPF Settings',
  'ISRDDN',
  'Line command',
  'LISTCAT command',
  'LISTDS command',
  'LOCATE command',
  'Logical record length (LRECL)',
  'Low-level qualifier (LLQ)',
  'Member',
  'Member list (ISPF)',
  'Operand',
  'Overlay line command',
  'Panel (ISPF)',
  'PDS',
  'PDSE',
  'Prefix area',
  'Primary command',
  'PROFILE command',
  'Record format (RECFM)',
  'REXX',
  'RFIND command',
  'Search-For (ISPF)',
  'SEND command',
  'Sequential Data Set',
  'SuperC (ISPF)',
  'Time Sharing Option (TSO)',
  'Track',
  'TSO command',
  'TSO/E',
  'Volume',
  'Volume Table Of Contents (VTOC)',
]

const supplementalEntries = new Map(Object.entries({
  'Action bar (ISPF)': 'ISPF panel 最上方的功能列。使用者可透過 action bar 開啟 pull-down menu，選擇與目前 panel 相關的功能。',
  'ALLOC command': 'TSO/E 中用來配置資料集的命令。常見語法會指定資料集名稱、組織方式、記錄長度、區塊大小、空間配置與記錄格式等屬性。',
  'Allocation': '將資料集、檔案或其他資源指派給目前工作階段、job 或程式使用的動作。',
  'Alias (catalog)': 'Catalog 中代表另一個 catalog 或 catalog entry 的替代名稱。Alias 常用於讓高階限定元對應到正確的 catalog 結構。',
  'Block': '作為一個單元記錄、處理或傳輸的一串資料元素。在資料集配置中，block size 會影響資料記錄在儲存裝置上的組織方式。',
  'BLKSIZE': 'Block size 的縮寫，表示資料集每個實體區塊可包含的位元組數。BLKSIZE 通常與 LRECL、RECFM 一起決定資料集的記錄儲存方式。',
  'Browse (ISPF)': 'ISPF 中以唯讀方式檢視資料集或 member 的功能。Browse 適合用來查看內容而不變更原始資料。',
  'Catalog': 'z/OS 用來記錄資料集名稱與其所在磁碟區等資訊的系統資料結構。透過 catalog，使用者可以用資料集名稱存取資料，而不必直接指定實體位置。',
  'Catalog alias': 'Catalog 中的別名項目，通常用來將特定 high-level qualifier 對應到指定的 user catalog。',
  'CHANGE command': 'ISPF editor 中用來取代文字的 primary command。可指定要尋找的字串、替換字串與搜尋範圍。',
  'CLIST': 'Command list 的縮寫，是 TSO/E 中可執行的一組命令序列。CLIST 可用來自動化重複性的 TSO 操作。',
  'Command line': '使用者輸入命令的位置。在 ISPF panel 中通常顯示為 Command ===> 或 Option ===> 欄位。',
  'COMPRESS command': 'TSO/E 中用於整理 PDS 空間的命令。COMPRESS 可回收刪除或更新 member 後留下的可用空間。',
  'Data set': 'z/OS 中具名的一組資料集合，可類比為其他系統中的檔案或檔案集合。資料集有固定的命名規則與配置屬性。',
  'Data set list (DSLIST)': 'ISPF Utilities 中用來列出資料集的功能。使用者可依資料集名稱樣式查詢資料集，並從清單進行 browse、edit、information、copy、delete 或 rename 等操作。',
  'Data set name': '用來識別 z/OS data set 的名稱。名稱由一個或多個 qualifier 組成，並以句點分隔。',
  'Data control block (DCB)': '描述資料集處理屬性的控制區塊。DCB 資訊可包含記錄格式、邏輯記錄長度與區塊大小等欄位。',
  'Directory block': 'PDS 目錄使用的空間單位。Directory block 用來保存 member 名稱與其位置等目錄資訊。',
  'DSORG': 'Data set organization 的縮寫，表示資料集的組織方式，例如 sequential、partitioned 或 VSAM。',
  'FIND command': 'ISPF editor 與部分 ISPF 清單中用來尋找文字的 command。找到項目後，可用 RFIND 重複前一次搜尋。',
  'FREE command': 'TSO/E 中用來釋放已配置資料集或資源的命令。FREE 可讓不再需要的配置從目前工作階段移除。',
  'Function key (ISPF)': 'ISPF panel 下方顯示的 PF key 功能提示。Function key 是 ISPF 操作的基本導航方式，不同 panel 可有不同 key definition。',
  'HELP command': '用來查詢命令、子命令、語法、操作數或訊息說明的命令。',
  'High-level qualifier (HLQ)': 'z/OS data set name 最左側的 qualifier。HLQ 常用來代表使用者、群組、應用程式或資料集集合。',
  'ISPF editor': 'ISPF 提供的資料集與 member 編輯工具。ISPF editor 可使用 primary command 與 line command 進行搜尋、取代、插入、複製、移動與刪除。',
  'ISPF Primary Option Menu': 'ISPF 啟動後常見的主要選單。使用者可從此選單進入 Settings、View、Edit、Utilities 與 Command 等功能。',
  'ISPF Settings': 'ISPF option 0 的設定功能。使用者可在此調整顯示、功能鍵、panel 行為與其他個人化選項。',
  'ISRDDN': 'ISPF 提供的診斷工具，可列出目前 TSO/ISPF session 的 DDNAME allocation、data set concatenation 與相關 library/member 使用情形。',
  'Line command': '在 ISPF 清單或 editor prefix area 中輸入、作用於特定列或列區塊的命令。',
  'LISTCAT command': 'TSO/E 中用來列出 catalog entry 資訊的命令。LISTCAT 可查詢 alias、資料集與 VSAM 物件等 catalog 資訊。',
  'LISTDS command': 'TSO/E 中用來列出資料集資訊的命令。LISTDS 可顯示資料集基本屬性與配置資訊。',
  'LOCATE command': 'ISPF 清單中用來將游標移到符合指定字串或排序位置項目的 primary command。',
  'Logical record length (LRECL)': '資料集中每筆邏輯記錄的長度。LRECL 通常與 RECFM、BLKSIZE 一起定義資料的儲存格式。',
  'Low-level qualifier (LLQ)': 'z/OS data set name 最右側的 qualifier。LLQ 常用來表示資料集的用途、類型或最後一層分類。',
  'Member': 'PDS 或 PDSE 中的命名項目，可類比為資料集容器中的單一檔案。',
  'Member list (ISPF)': 'ISPF 中顯示 PDS 或 PDSE members 的清單。使用者可在 member list 上對特定 member 執行 browse、view、edit、rename、delete、copy 或 select 等操作。',
  'Operand': '命令中用來提供額外資訊或控制命令行為的參數。Operand 可為位置式，也可使用關鍵字指定。',
  'Overlay line command': 'ISPF editor 的 line command，用於將來源記錄指定欄位覆寫到既有記錄的對應欄位。',
  'Panel (ISPF)': 'ISPF 與使用者互動的畫面單位。Panel 可包含選單、輸入欄位、scrollable data display、message、action bar 與 function key 提示。',
  'PDS': 'Partitioned Data Set 的縮寫，是可包含多個 member 的資料集型態，常用於存放程式、JCL、控制資料或其他分項管理內容。',
  'PDSE': 'Partitioned Data Set Extended 的縮寫，是 PDS 的延伸型態，由 DFSMS 管理並提供較新的目錄與 member 管理能力。',
  'Prefix area': 'ISPF editor 或清單左側用來輸入 line command 的區域。Prefix area 通常位於每一列資料前方。',
  'Primary command': '在 ISPF panel command line 輸入、通常作用於目前整個 panel、清單或編輯工作階段的命令。',
  'PROFILE command': 'TSO/E 中用來顯示或變更使用者 profile 的命令。Profile 內容會影響終端機與互動工作階段的使用方式。',
  'Record format (RECFM)': '資料集記錄格式屬性，用來描述記錄是 fixed、variable 或 undefined，以及是否採用 blocked 格式。',
  'REXX': 'Restructured Extended Executor 的縮寫，是 z/OS 與 TSO/E 環境中常用的程序式語言。',
  'RFIND command': 'ISPF 中用來重複前一次 FIND 搜尋的 command，也常對應到 PF key。',
  'Search-For (ISPF)': 'ISPF Utilities 中用來在指定 data set 或 members 內搜尋文字的功能。',
  'SEND command': 'TSO/E 中用來傳送訊息給其他使用者的命令。',
  'SuperC (ISPF)': 'ISPF Utilities 中用來比較 data set、member 或文字內容差異的工具。',
  'TSO command': '可在 TSO/E 環境中執行的命令。TSO command 可從 READY prompt、ISPF Command Shell 或 ISPF command line 輸入。',
  'TSO/E': 'Time Sharing Option/Extensions 的縮寫，是 z/OS 中提供互動式命令處理與使用者工作階段的環境。',
}))

await mkdir(targetGlossary, { recursive: true })
await mkdir(referencesDir, { recursive: true })
await mkdir(handoffDir, { recursive: true })

function parseGlossaryEntries(markdown, letter) {
  const normalized = markdown.replace(/\r\n/g, '\n')
  const headings = []
  const pattern = /^##\s+(.+)$/gm
  let match
  while ((match = pattern.exec(normalized))) {
    headings.push({
      term: match[1].trim(),
      start: match.index,
    })
  }

  return headings.map((heading, index) => {
    const end = index + 1 < headings.length ? headings[index + 1].start : normalized.length
    return {
      letter,
      term: heading.term,
      markdown: normalized.slice(heading.start, end).trim(),
    }
  })
}

function rewriteLinks(markdown) {
  return markdown
    .replace(/\]\((\.\/)?README(\.md)?(#[^)]+)?\)/g, (_, _prefix, _ext, hash = '') => `](./${hash})`)
    .replace(/\]\((\.\/)?([a-z]\.md)(#[^)]+)?\)/g, (_, _prefix, file, hash = '') => `](./${file.replace('.md', '')}${hash})`)
}

function letterForTerm(term) {
  return term[0].toLowerCase()
}

const sourceEntries = []
for (const file of await readdir(sourceGlossary)) {
  if (!/^[a-z]\.md$/.test(file)) continue
  const letter = file.replace('.md', '')
  const markdown = await readFile(path.join(sourceGlossary, file), 'utf8')
  sourceEntries.push(...parseGlossaryEntries(markdown, letter))
}

const sourceByTerm = new Map(sourceEntries.map((entry) => [entry.term.toLowerCase(), entry]))
const finalEntries = selectedTerms.map((term) => {
  const text = supplementalEntries.get(term)
  if (text) {
    return {
      letter: letterForTerm(term),
      term,
      markdown: `## ${term}\n\n${text}`,
      reason: 'course supplemental entry',
    }
  }

  const sourceEntry = sourceByTerm.get(term.toLowerCase())
  if (sourceEntry) {
    return {
      letter: sourceEntry.letter,
      term,
      markdown: rewriteLinks(sourceEntry.markdown),
      reason: 'source glossary entry',
    }
  }

  throw new Error(`Missing supplemental glossary entry for ${term}`)
}).sort((a, b) => a.letter.localeCompare(b.letter) || a.term.localeCompare(b.term, 'en'))

const finalByLetter = new Map()
for (const entry of finalEntries) {
  if (!finalByLetter.has(entry.letter)) finalByLetter.set(entry.letter, [])
  finalByLetter.get(entry.letter).push(entry)
}

for (const oldFile of await readdir(targetGlossary)) {
  if (/^[a-z]\.md$/.test(oldFile)) await rm(path.join(targetGlossary, oldFile))
}

for (const [letter, entries] of finalByLetter) {
  const body = [
    `# IBM Z 詞彙表：${letter.toUpperCase()}`,
    '',
    '[返回詞彙表索引](./)',
    '',
    ...entries.flatMap((entry) => [entry.markdown, '']),
  ].join('\n')
  await writeFile(path.join(targetGlossary, `${letter}.md`), body, 'utf8')
}

const letterLinks = [...finalByLetter.keys()]
  .sort()
  .map((letter) => `- [${letter.toUpperCase()}](./${letter})`)
  .join('\n')

await writeFile(path.join(targetGlossary, 'index.md'), `# IBM Z 詞彙表\n\n本詞彙表整理 IBM Z 與 z/OS 課程中提及或直接相關的英文術語，並搭配繁體中文解釋。詞彙說明參考 IBM Redbooks 維護的 [Zikipedia](https://ibmredbooks.github.io/zikipedia/) 與 IBM Z、z/OS 相關公開技術文件，再依本課程的命令、面板與資料集情境整理。\n\n目前收錄 ${finalEntries.length} 個課程相關詞彙。\n\n## 依字母查閱\n\n${letterLinks}\n`, 'utf8')

if (existsSync(path.join(sourceGlossary, 'README.md'))) {
  const readme = await readFile(path.join(sourceGlossary, 'README.md'), 'utf8')
  await writeFile(path.join(referencesDir, 'glossary-source-readme.md'), readme, 'utf8')
}

const terminologyGuide = path.join(sourceRoot, 'docs', '01-concepts', 'terminology-guide.md')
if (existsSync(terminologyGuide)) {
  await copyFile(terminologyGuide, path.join(referencesDir, 'terminology-guide.md'))
}

await writeFile(path.join(referencesDir, 'README.md'), `# References\n\nLocal source project:\n\n\`${sourceRoot}\`\n\nImported source files:\n\n- \`docs/01-concepts/ibm-z-glossary/*.md\`\n- \`docs/01-concepts/terminology-guide.md\`\n\nThe public glossary in \`docs/glossary/\` is filtered to terms that are mentioned in or directly relevant to this Introduction to z/OS Commands and Panels course. The original PDF is intentionally not copied into this public repo by default:\n\n- \`${path.join(sourceRoot, 'IBM-Z-Glossary-of-Terms.pdf')}\`\n\n`, 'utf8')

const keptReport = finalEntries
  .map((entry) => `- ${entry.term} (${entry.reason})`)
  .join('\n')

const excludedReport = sourceEntries
  .filter((entry) => !finalEntries.some((kept) => kept.term === entry.term))
  .map((entry) => `- ${entry.term} (not selected for this course glossary)`)
  .join('\n')

await writeFile(path.join(handoffDir, 'glossary-relevance-report.md'), `# Glossary Relevance Report\n\nGenerated by \`npm run glossary:import\`.\n\nSource glossary entries: ${sourceEntries.length}\nPublished course glossary entries: ${finalEntries.length}\nSource-backed published entries: ${finalEntries.filter((entry) => entry.reason === 'source glossary entry').length}\nSupplemental course entries: ${finalEntries.filter((entry) => entry.reason === 'course supplemental entry').length}\n\n## Published Terms\n\n${keptReport}\n\n## Excluded Source Terms\n\n${excludedReport}\n`, 'utf8')

console.log(`Imported ${sourceEntries.length} source glossary entries.`)
console.log(`Published ${finalEntries.length} course-relevant glossary entries into docs/glossary.`)
console.log('Reference notes written to references/.')
console.log('Relevance report written to handoff/glossary-relevance-report.md.')
