import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const manifest = JSON.parse(await readFile(path.join(root, 'data', 'course-manifest.json'), 'utf8'))
const subtitlesDir = path.join(root, 'docs', 'public', 'subtitles')
const outputDir = path.join(root, 'data', 'subtitle-audit')

const videos = manifest.sections.flatMap((section) =>
  section.activities
    .filter((activity) => activity.type === 'video' && activity.includeInFirstEdition !== false)
    .map((activity) => ({
      section: section.titleZh,
      slug: activity.slug,
      title: activity.title,
      titleZh: activity.titleZh,
      entryId: activity.kaltura?.entryId
    }))
)

function parseTime(value) {
  const match = value.match(/(?:(\d+):)?(\d{2}):(\d{2})\.(\d{3})/)
  if (!match) return Number.NaN
  const [, hours = '0', minutes, seconds, millis] = match
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds) + Number(millis) / 1000
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return ''
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const wholeSeconds = Math.floor(seconds % 60)
  const millis = Math.round((seconds - Math.floor(seconds)) * 1000)
  return [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(wholeSeconds).padStart(2, '0')
  ].join(':') + `.${String(millis).padStart(3, '0')}`
}

function parseVtt(text) {
  return text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n\r?\n/)
    .filter((block) => block.trim() && !block.startsWith('WEBVTT'))
    .map((block, index) => {
      const lines = block.trim().split(/\r?\n/)
      const id = lines[0]?.trim() || String(index + 1)
      const time = lines[1]?.trim() || ''
      const [startText = '', endText = ''] = time.split(/\s+-->\s+/)
      const start = parseTime(startText)
      const end = parseTime(endText)
      return {
        id,
        time,
        start,
        end,
        duration: end - start,
        text: lines.slice(2).join('\n').trim()
      }
    })
}

function visualLength(text) {
  return [...text.replace(/\s+/g, '')].length
}

function normalizedText(text) {
  return text
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[\p{P}\p{S}\s]/gu, '')
}

function jaccardLike(a, b) {
  const left = new Set([...normalizedText(a)])
  const right = new Set([...normalizedText(b)])
  if (!left.size || !right.size) return 0
  let intersection = 0
  for (const char of left) if (right.has(char)) intersection += 1
  return intersection / Math.max(left.size, right.size)
}

function sentenceEndCount(text) {
  return (text.match(/[\u3002\uff01\uff1f!?]/g) || []).length
}

function punctuationOnly(text) {
  const compact = text.replace(/\s+/g, '')
  return Boolean(compact) && /^[\p{P}\p{S}]+$/u.test(compact)
}

const technicalTermAnchors = [
  { label: 'IBM Z', en: /\bIBM\s*Z\b|\bZ data processing\b/i, zh: /IBM\s*Z/i },
  { label: 'z/OS', en: /\bZOS\b|\bz\/OS\b/i, zh: /z\/OS/i },
  { label: 'z/VM', en: /\bZVM\b|\bz\/VM\b/i, zh: /z\/VM|ZVM/i },
  { label: 'z/VSE', en: /\bZVSE\b|\bz\/VSE\b/i, zh: /z\/VSE/i },
  { label: 'Z-TPF', en: /\bZ-?TPF\b|\bZ transaction processing facility\b/i, zh: /Z-?TPF/i },
  { label: 'LPAR', en: /\bL-?PARs?\b|\blogical partitions?\b/i, zh: /LPAR|L-Pars?|邏輯分割區/i },
  { label: 'CPC', en: /\bCPC\b|\bcentral processor complex\b/i, zh: /CPC|中央處理器複合體/i },
  { label: 'HMC', en: /\bHMCs?\b|\bhardware management console\b/i, zh: /HMC|硬體管理主控台/i },
  { label: 'Support Element', en: /\bSEs?\b|\bsupport elements?\b/i, zh: /\bSE\b|Support Element|支援元件/i },
  { label: 'IOCDS', en: /\bIOCDS\b|\bI\/?O\s*CDS\b|\binput-?output configuration data ?set\b/i, zh: /IOCDS|Input\/Output Configuration Data Set/i },
  { label: 'CHPID', en: /\bCHP?IDs?\b|\bchipp?ids?\b|\bchannel path (?:IDs?|identifiers?)\b/i, zh: /CHPID|chipp?id|通道路徑 ID|通道路徑識別碼/i },
  { label: 'PCHID', en: /\bP-?CHIDs?\b|\bphysical channel ID\b/i, zh: /P-?CHID|physical channel ID/i },
  { label: 'channel subsystem', en: /\bchannel subsystems?\b/i, zh: /通道子系統|channel subsystem/i },
  { label: 'logical channel subsystem', en: /\blogical channel subsystems?\b/i, zh: /邏輯通道子系統|logical channel subsystem/i },
  { label: 'control unit', en: /\bcontrol units?\b/i, zh: /控制單元/i },
  { label: 'DASD', en: /\bDASD(?:I)?\b|\bdirect access storage devices?\b/i, zh: /DASD|DASDI|直接存取儲存裝置/i },
  { label: 'RACF', en: /\bRACF\b|\bresource access control facility\b/i, zh: /RACF|資源存取控制設施/i },
  { label: 'CPACF', en: /\bCPACF\b|\bCP Assist for cryptographic functions?\b|\bcentral processor assist for cryptographic function\b/i, zh: /CPACF|CP Assist for cryptographic functions?|密碼功能輔助處理/i },
  { label: 'Crypto Express', en: /\bCrypto Express\b/i, zh: /Crypto Express/i },
  { label: 'pervasive encryption', en: /\bpervasive encryption\b/i, zh: /pervasive encryption|全域加密|全方位加密/i },
  { label: 'protected keys', en: /\bprotected keys?\b/i, zh: /protected keys?|受保護金鑰/i },
  { label: 'Sysplex', en: /\bSysplex\b/i, zh: /Sysplex/i },
  { label: 'parallel Sysplex', en: /\bparallel Sysplex\b/i, zh: /parallel Sysplex/i },
  { label: 'coupling facility', en: /\bcoupling facilit(?:y|ies)\b/i, zh: /coupling facility|耦合設施/i },
  { label: 'coupling links', en: /\bcoupling links?\b/i, zh: /coupling links?|耦合連結/i },
  { label: 'STP', en: /\bSTP\b|\bserver-time protocol\b/i, zh: /\bSTP\b|server-time protocol|伺服器時間協定/i },
  { label: 'GRS', en: /\bGRS\b|\bglobal resource serialization\b/i, zh: /\bGRS\b|全域資源序列化/i },
  { label: 'XCF', en: /\bXCF\b|\bcross (?:system )?coupling facility\b/i, zh: /\bXCF\b|交叉結合設施/i },
  { label: 'WLM', en: /\bWLM\b|\bworkload manager\b/i, zh: /\bWLM\b|工作負載管理員/i },
  { label: 'KVM', en: /\bKVM\b|\bkernel-based virtual machine\b/i, zh: /\bKVM\b|kernel-based virtual machine/i },
  { label: 'hypervisor', en: /\bhypervisor\b/i, zh: /hypervisor/i },
  { label: 'DFSMS', en: /\bDFSMS\b|\bdata facility storage management service\b/i, zh: /DFSMS|資料設施儲存管理服務/i },
  { label: 'SDSF', en: /\bSDSF\b|\bsystem display and search facility\b/i, zh: /SDSF|系統顯示與搜尋功能/i },
  { label: 'SMF', en: /\bSMF\b|\bSystems Management Facility\b/i, zh: /SMF|Systems Management Facility/i },
  { label: 'USS', en: /\bUSS\b|\bUNIX system services\b/i, zh: /USS|UNIX system services/i },
  { label: 'zIIP', en: /\bzIIP\b|\bZ-I-I-P\b|\bzip processors?\b/i, zh: /zIIP/i },
  { label: 'CP processor', en: /\bCP\b|\bcentral processor\b/i, zh: /\bCP\b|central processor|中央處理器/i },
  { label: 'SAP', en: /\bSAP\b|\bsystem assist processor\b/i, zh: /\bSAP\b|system assist processor|系統輔助處理器/i },
  { label: 'physical design', en: /\bphysical design\b/i, zh: /物理設計/ },
  { label: 'logic gates', en: /\blogic gates?\b/i, zh: /邏輯閘/ },
  { label: 'physical chips', en: /\bphysical chips?\b/i, zh: /實體晶片/ },
  { label: 'digital design', en: /\bdigital design\b/i, zh: /數位設計/ },
  { label: 'circuit implementation', en: /\bcircuit implementation\b/i, zh: /電路實作/ },
  { label: 'physical implementation', en: /\bphysical implementation\b/i, zh: /物理實作/ },
  { label: 'multiple image facility', en: /\bmultiple image facility\b/i, zh: /multiple image facility|MIF ID/i },
  { label: 'Telum', en: /\b(?:tell them|telum)\b/i, zh: /Telum/i },
  { label: 'Millicode', en: /\bMillico(?:de|at)\b/i, zh: /Millicode/i },
  { label: 'server-time protocol', en: /\bserver-time protocol\b/i, zh: /server-time protocol|伺服器時間協定/i }
]

function findSemanticNeighborDrift(enCues, zhCue, index) {
  const neighborWindow = [index + 1, index + 2]
    .filter((candidate) => candidate >= 0 && candidate < enCues.length)

  return technicalTermAnchors
    .filter((anchor) => anchor.zh.test(zhCue.text) && !anchor.en.test(enCues[index]?.text || ''))
    .map((anchor) => {
      const neighbor = neighborWindow.find((candidate) => anchor.en.test(enCues[candidate]?.text || ''))
      return neighbor == null ? null : { anchor, neighbor: enCues[neighbor] }
    })
    .filter(Boolean)
}

function cueUrl(slug, cue) {
  return `../docs/public/subtitles/${slug}.zh-Hant-TW.vtt#cue-${cue.id}`
}

function addIssue(issues, severity, type, video, cue, details, enCue) {
  issues.push({
    severity,
    type,
    slug: video.slug,
    entryId: video.entryId,
    titleZh: video.titleZh,
    cueId: cue?.id || '',
    time: cue?.time || '',
    start: cue?.start ?? null,
    end: cue?.end ?? null,
    en: enCue?.text || '',
    zh: cue?.text || '',
    details
  })
}

async function readVtt(file) {
  return parseVtt(await readFile(file, 'utf8'))
}

const results = []
const issues = []

for (const video of videos) {
  const enFile = path.join(subtitlesDir, `${video.slug}.en.vtt`)
  const zhFile = path.join(subtitlesDir, `${video.slug}.zh-Hant-TW.vtt`)
  const result = { ...video, enCount: 0, zhCount: 0, issueCount: 0, highCount: 0, mediumCount: 0, lowCount: 0 }

  let enCues
  let zhCues
  try {
    enCues = await readVtt(enFile)
  } catch {
    addIssue(issues, 'high', 'missing_en_file', video, null, `${video.slug}.en.vtt is missing`)
    results.push(result)
    continue
  }
  try {
    zhCues = await readVtt(zhFile)
  } catch {
    addIssue(issues, 'high', 'missing_zh_file', video, null, `${video.slug}.zh-Hant-TW.vtt is missing`)
    results.push(result)
    continue
  }

  result.enCount = enCues.length
  result.zhCount = zhCues.length

  if (enCues.length !== zhCues.length) {
    addIssue(issues, 'high', 'cue_count_mismatch', video, null, `EN has ${enCues.length} cues; ZH has ${zhCues.length} cues`)
  }

  const max = Math.max(enCues.length, zhCues.length)
  for (let index = 0; index < max; index += 1) {
    const enCue = enCues[index]
    const zhCue = zhCues[index]
    if (!enCue || !zhCue) continue

    if (enCue.id !== zhCue.id) {
      addIssue(issues, 'high', 'cue_id_mismatch', video, zhCue, `EN cue id ${enCue.id}; ZH cue id ${zhCue.id}`, enCue)
    }
    if (enCue.time !== zhCue.time) {
      addIssue(issues, 'high', 'timecode_mismatch', video, zhCue, `EN time ${enCue.time}; ZH time ${zhCue.time}`, enCue)
    }
    if (!zhCue.text) {
      addIssue(issues, 'high', 'empty_zh_cue', video, zhCue, 'Chinese cue is empty', enCue)
      continue
    }
    if (punctuationOnly(zhCue.text)) {
      addIssue(issues, 'high', 'punctuation_only_zh_cue', video, zhCue, 'Chinese cue contains only punctuation or symbols', enCue)
    }

    const zhLength = visualLength(zhCue.text)
    const enLength = visualLength(enCue.text)
    const charsPerSecond = zhCue.duration > 0 ? zhLength / zhCue.duration : 0
    if (charsPerSecond > 11 || (zhLength > 42 && charsPerSecond > 5.5) || zhLength > 64) {
      addIssue(issues, 'medium', 'long_zh_cue', video, zhCue, `ZH length ${zhLength}; ${charsPerSecond.toFixed(1)} chars/sec`, enCue)
    }
    if (enLength > 12 && zhLength <= 2) {
      addIssue(issues, 'medium', 'suspiciously_short_zh_cue', video, zhCue, `EN length ${enLength}; ZH length ${zhLength}`, enCue)
    }
    if (sentenceEndCount(zhCue.text) >= 2 && zhCue.duration < 4 && sentenceEndCount(zhCue.text) > sentenceEndCount(enCue.text)) {
      addIssue(issues, 'medium', 'possibly_merged_zh_cue', video, zhCue, 'Chinese cue has multiple sentence endings in a short time window', enCue)
    }

    const previous = zhCues[index - 1]
    const next = zhCues[index + 1]
    const previousEn = enCues[index - 1]
    const nextEn = enCues[index + 1]
    if (previous && jaccardLike(previous.text, zhCue.text) >= 0.72 && (!previousEn || jaccardLike(previousEn.text, enCue.text) < 0.72)) {
      addIssue(issues, 'medium', 'near_duplicate_previous_zh_cue', video, zhCue, `Similar to previous cue ${previous.id}`, enCue)
    }
    if (next && jaccardLike(next.text, zhCue.text) >= 0.72 && (!nextEn || jaccardLike(nextEn.text, enCue.text) < 0.72)) {
      addIssue(issues, 'low', 'near_duplicate_next_zh_cue', video, zhCue, `Similar to next cue ${next.id}`, enCue)
    }

    const startsWithPunctuation = /^[\p{P}\p{S}]/u.test(zhCue.text)
    if (startsWithPunctuation) {
      addIssue(issues, 'medium', 'starts_with_punctuation', video, zhCue, 'Chinese cue starts with punctuation', enCue)
    }

    for (const drift of findSemanticNeighborDrift(enCues, zhCue, index)) {
      addIssue(issues, 'medium', 'semantic_neighbor_drift', video, zhCue, `ZH contains ${drift.anchor.label}, but EN cue ${drift.neighbor.id} contains that term`, enCue)
    }
  }

  results.push(result)
}

for (const result of results) {
  const videoIssues = issues.filter((issue) => issue.slug === result.slug)
  result.issueCount = videoIssues.length
  result.highCount = videoIssues.filter((issue) => issue.severity === 'high').length
  result.mediumCount = videoIssues.filter((issue) => issue.severity === 'medium').length
  result.lowCount = videoIssues.filter((issue) => issue.severity === 'low').length
}

const severityOrder = { high: 0, medium: 1, low: 2 }
issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity] || a.slug.localeCompare(b.slug) || (a.start ?? 0) - (b.start ?? 0))

function csvEscape(value) {
  const text = String(value ?? '')
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function issueToCsv(issue) {
  return [
    issue.severity,
    issue.type,
    issue.slug,
    issue.entryId,
    issue.titleZh,
    issue.cueId,
    issue.time,
    issue.en,
    issue.zh,
    issue.details
  ].map(csvEscape).join(',')
}

function issueToMarkdown(issue) {
  const time = issue.start == null ? issue.time : `${formatTime(issue.start)}-${formatTime(issue.end)}`
  return [
    `| ${issue.severity} | ${issue.type} | ${issue.slug} | ${issue.entryId || ''} | ${issue.cueId} | ${time} | ${issue.details.replace(/\|/g, '\\|')} |`,
    issue.en ? `| | | | | | EN | ${issue.en.replace(/\|/g, '\\|')} |` : '',
    issue.zh ? `| | | | | | ZH | ${issue.zh.replace(/\|/g, '\\|')} |` : ''
  ].filter(Boolean).join('\n')
}

function makeReport() {
  const generatedAt = new Date().toISOString()
  const summaryRows = results
    .map((result) => `| ${result.slug} | ${result.entryId || ''} | ${result.enCount} | ${result.zhCount} | ${result.highCount} | ${result.mediumCount} | ${result.lowCount} |`)
    .join('\n')
  const issueRows = issues.map(issueToMarkdown).join('\n')
  const topReview = issues
    .filter((issue) => issue.severity !== 'low')
    .slice(0, 80)
    .map((issue) => `- ${issue.severity.toUpperCase()} ${issue.slug} cue ${issue.cueId} ${issue.time}: ${issue.type} - ${issue.details}`)
    .join('\n')

  return `# Subtitle Alignment Audit

Generated at: ${generatedAt}

This report checks structural alignment between English and Traditional Chinese WebVTT files. It catches deterministic issues such as mismatched cue counts, mismatched ids/timecodes, empty cues, punctuation-only cues, suspiciously short cues, likely merged cues, and near-duplicates. It does not prove semantic correctness; flagged windows should be reviewed against audio and source English cues.

## Summary

| Video | Kaltura | EN cues | ZH cues | High | Medium | Low |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
${summaryRows}

## Priority Review Queue

${topReview || 'No high or medium issues found.'}

## All Issues

| Severity | Type | Video | Kaltura | Cue | Time | Details |
| --- | --- | --- | --- | --- | --- | --- |
${issueRows || '| | | | | | | No issues found. |'}
`
}

await mkdir(outputDir, { recursive: true })
await writeFile(path.join(outputDir, 'report.json'), JSON.stringify({ generatedAt: new Date().toISOString(), results, issues }, null, 2), 'utf8')
await writeFile(path.join(outputDir, 'report.csv'), [
  'severity,type,slug,entryId,titleZh,cueId,time,en,zh,details',
  ...issues.map(issueToCsv)
].join('\n'), 'utf8')
await writeFile(path.join(outputDir, 'report.md'), makeReport(), 'utf8')

console.log(`Audited ${videos.length} videos.`)
console.log(`Found ${issues.length} issues: ${issues.filter((issue) => issue.severity === 'high').length} high, ${issues.filter((issue) => issue.severity === 'medium').length} medium, ${issues.filter((issue) => issue.severity === 'low').length} low.`)
console.log(`Wrote ${path.relative(root, path.join(outputDir, 'report.md'))}`)
