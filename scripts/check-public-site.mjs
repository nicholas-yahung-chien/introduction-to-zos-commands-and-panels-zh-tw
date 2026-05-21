import { readdir, readFile } from 'node:fs/promises'
import { existsSync, statSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const distDir = path.join(root, 'docs', '.vitepress', 'dist')

const requiredPages = [
  {
    name: 'home',
    source: 'docs/index.md',
    output: 'index.html',
    requiredText: ['課程內容', '影片總覽', '互動練習', 'Lab 與互動實作', '詞彙表', '授權資訊']
  },
  { name: 'course', source: 'docs/course/index.md', output: 'course/index.html', requiredText: ['課程首頁', 'z/OS 命令與面板入門', 'TSO 命令'] },
  { name: 'videos', source: 'docs/videos/index.md', output: 'videos/index.html', requiredText: ['影片清單', '載入影片', '單元'] },
  { name: 'practice', source: 'docs/practice/index.md', output: 'practice/index.html', requiredText: ['互動練習', '練習題目', 'Badge Quiz 題庫'] },
  { name: 'labs', source: 'docs/labs/index.md', output: 'labs/index.html', requiredText: ['Lab 與互動實作', '練習 7'] },
  { name: 'glossary', source: 'docs/glossary/index.md', output: 'glossary/index.html', requiredText: ['IBM Z 詞彙表', '依字母查詢詞彙', 'A', 'V'] },
  { name: 'glossary-a', source: 'docs/glossary/a.md', output: 'glossary/a.html', requiredText: ['IBM Z 詞彙表：A', 'ALLOC command', 'Action bar'] },
  { name: 'glossary-b', source: 'docs/glossary/b.md', output: 'glossary/b.html', requiredText: ['IBM Z 詞彙表：B', 'BLKSIZE', 'Browse'] },
  { name: 'glossary-c', source: 'docs/glossary/c.md', output: 'glossary/c.html', requiredText: ['IBM Z 詞彙表：C', 'Catalog', 'COMPRESS command'] },
  { name: 'glossary-d', source: 'docs/glossary/d.md', output: 'glossary/d.html', requiredText: ['IBM Z 詞彙表：D', 'Data set', '返回詞彙表索引'] },
  { name: 'glossary-f', source: 'docs/glossary/f.md', output: 'glossary/f.html', requiredText: ['IBM Z 詞彙表：F', 'FIND command', 'Function key'] },
  { name: 'glossary-h', source: 'docs/glossary/h.md', output: 'glossary/h.html', requiredText: ['IBM Z 詞彙表：H', 'HELP command', 'High-level qualifier'] },
  { name: 'glossary-i', source: 'docs/glossary/i.md', output: 'glossary/i.html', requiredText: ['IBM Z 詞彙表：I', 'ISPF', 'ISPF editor'] },
  { name: 'glossary-l', source: 'docs/glossary/l.md', output: 'glossary/l.html', requiredText: ['IBM Z 詞彙表：L', 'Line command'] },
  { name: 'glossary-m', source: 'docs/glossary/m.md', output: 'glossary/m.html', requiredText: ['IBM Z 詞彙表：M', 'Member'] },
  { name: 'glossary-o', source: 'docs/glossary/o.md', output: 'glossary/o.html', requiredText: ['IBM Z 詞彙表：O', 'Operand', 'Overlay line command'] },
  { name: 'glossary-p', source: 'docs/glossary/p.md', output: 'glossary/p.html', requiredText: ['IBM Z 詞彙表：P', 'PDS', 'Primary command'] },
  { name: 'glossary-r', source: 'docs/glossary/r.md', output: 'glossary/r.html', requiredText: ['IBM Z 詞彙表：R', 'RECFM', 'RFIND command'] },
  { name: 'glossary-s', source: 'docs/glossary/s.md', output: 'glossary/s.html', requiredText: ['IBM Z 詞彙表：S', 'Sequential Data Set', 'SEND command'] },
  { name: 'glossary-t', source: 'docs/glossary/t.md', output: 'glossary/t.html', requiredText: ['IBM Z 詞彙表：T', 'TSO/E'] },
  { name: 'glossary-v', source: 'docs/glossary/v.md', output: 'glossary/v.html', requiredText: ['IBM Z 詞彙表：V', 'Volume', 'VTOC'] },
  { name: 'license', source: 'docs/license-notes.md', output: 'license-notes.html', requiredText: ['授權資訊'] },
]

const publicPlanningTerms = [
  'TODO',
  '待辦',
  '專案規劃',
  '規劃方向',
  '等待補入',
  '內部筆記',
  'project planning',
  'second-phase',
]

const findings = []

function normalizePath(file) {
  return file.split(path.sep).join('/')
}

async function listFiles(dir, predicate, out = []) {
  if (!existsSync(dir)) return out
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const filePath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await listFiles(filePath, predicate, out)
    } else if (predicate(filePath)) {
      out.push(filePath)
    }
  }
  return out
}

function assertExists(label, file) {
  if (!existsSync(file)) findings.push(`${label}: missing ${normalizePath(path.relative(root, file))}`)
}

function assertContains(label, text, requiredText) {
  for (const required of requiredText) {
    if (!text.includes(required)) findings.push(`${label}: missing expected public text "${required}"`)
  }
}

function checkInternalPlanningText(label, text) {
  for (const term of publicPlanningTerms) {
    if (text.includes(term)) findings.push(`${label}: contains internal planning term "${term}"`)
  }
}

function distCandidates(pathname) {
  const cleanPath = decodeURIComponent(pathname).replace(/^\/+/, '')
  if (!cleanPath) return [path.join(distDir, 'index.html')]

  const direct = path.join(distDir, cleanPath)
  const ext = path.extname(cleanPath)
  if (ext) return [direct]

  return [
    `${direct}.html`,
    path.join(direct, 'index.html'),
  ]
}

function internalTargetExists(pathname) {
  return distCandidates(pathname).some((candidate) => existsSync(candidate) && statSync(candidate).isFile())
}

function extractLinks(html) {
  const links = []
  const pattern = /\b(?:href|src)="([^"]+)"/g
  let match
  while ((match = pattern.exec(html))) {
    links.push(match[1])
  }
  return links
}

function shouldIgnoreLink(rawLink) {
  return !rawLink
    || rawLink.startsWith('#')
    || rawLink.startsWith('mailto:')
    || rawLink.startsWith('tel:')
    || rawLink.startsWith('data:')
    || rawLink.startsWith('javascript:')
}

function stripBase(pathname) {
  const base = process.env.VITEPRESS_BASE || '/'
  if (base !== '/' && pathname.startsWith(base)) {
    return pathname.slice(base.length - 1)
  }
  return pathname
}

function checkLink(file, rawLink) {
  if (shouldIgnoreLink(rawLink)) return

  if (/^https?:\/\//i.test(rawLink)) {
    try {
      new URL(rawLink)
    } catch {
      findings.push(`${normalizePath(path.relative(root, file))}: malformed external URL "${rawLink}"`)
    }
    return
  }

  let resolved
  try {
    resolved = new URL(rawLink, `https://example.invalid/${normalizePath(path.relative(distDir, path.dirname(file)))}/`)
  } catch {
    findings.push(`${normalizePath(path.relative(root, file))}: malformed link "${rawLink}"`)
    return
  }

  if (!internalTargetExists(stripBase(resolved.pathname))) {
    findings.push(`${normalizePath(path.relative(root, file))}: broken internal link "${rawLink}"`)
  }
}

for (const page of requiredPages) {
  const sourceFile = path.join(root, page.source)
  const outputFile = path.join(distDir, page.output)
  assertExists(`${page.name} source`, sourceFile)
  assertExists(`${page.name} output`, outputFile)

  if (existsSync(outputFile)) {
    const html = await readFile(outputFile, 'utf8')
    assertContains(`${page.name} output`, html, page.requiredText)
    checkInternalPlanningText(`${page.name} output`, html)
  }
}

const htmlFiles = await listFiles(distDir, (file) => file.endsWith('.html'))
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8')
  checkInternalPlanningText(normalizePath(path.relative(root, file)), html)
  for (const link of extractLinks(html)) {
    checkLink(file, link)
  }
}

const manifest = JSON.parse(await readFile(path.join(root, 'data', 'course-manifest.json'), 'utf8'))
const lessonNotes = JSON.parse(await readFile(path.join(root, 'data', 'lesson-notes.json'), 'utf8'))
const videoAssets = JSON.parse(await readFile(path.join(root, 'data', 'video-assets.json'), 'utf8'))
const publicVideoAssets = JSON.parse(await readFile(path.join(root, 'docs', 'public', 'manifest', 'video-assets.json'), 'utf8'))
const practiceQuestions = JSON.parse(await readFile(path.join(root, 'data', 'practice-questions.json'), 'utf8'))
const labs = JSON.parse(await readFile(path.join(root, 'data', 'labs.json'), 'utf8'))

const activities = manifest.sections.flatMap((section) => section.activities)
const videos = activities.filter((activity) => activity.type === 'video')
const deployedVideos = videos.filter((activity) => activity.mediaStatus !== 'source-only')

if (manifest.course.id !== 7419) findings.push('manifest: course id must be 7419')
if (manifest.sections.length !== 5) findings.push(`manifest: expected 5 sections, found ${manifest.sections.length}`)
if (videos.length !== 9) findings.push(`video manifest: expected 9 source videos, found ${videos.length}`)
if (!Array.isArray(videoAssets) || videoAssets.length !== videos.length) {
  findings.push(`video assets: expected ${videos.length} items, found ${Array.isArray(videoAssets) ? videoAssets.length : 'non-array data'}`)
}
if (!Array.isArray(publicVideoAssets) || publicVideoAssets.length !== videos.length) {
  findings.push(`public video assets: expected ${videos.length} items, found ${Array.isArray(publicVideoAssets) ? publicVideoAssets.length : 'non-array data'}`)
}

const assetBySlug = new Map(Array.isArray(videoAssets) ? videoAssets.map((asset) => [asset.slug, asset]) : [])

for (const video of videos) {
  const label = `video ${video.slug}`
  if (!video.title || !video.titleZh) findings.push(`${label}: missing title/titleZh`)
  if (!video.sourceUrl?.startsWith('https://learn.ibm.com/')) findings.push(`${label}: sourceUrl must point to IBM Learn`)
  if (!lessonNotes[video.slug]) findings.push(`${label}: missing lesson notes`)
  if (!video.kaltura?.entryId) findings.push(`${label}: missing Kaltura entryId`)

  const asset = assetBySlug.get(video.slug)
  if (!asset) {
    findings.push(`${label}: missing data/video-assets.json record`)
  } else {
    if (asset.entryId !== video.kaltura?.entryId) findings.push(`${label}: video asset entryId ${asset.entryId} does not match manifest ${video.kaltura?.entryId}`)
    if (!asset.duration || !asset.width || !asset.height) findings.push(`${label}: video asset metadata is incomplete`)
  }

  if (video.mediaStatus !== 'source-only') {
    if (!video.kaltura?.entryId) findings.push(`${label}: deployed videos need Kaltura entryId`)
    for (const lang of ['en', 'zh-Hant-TW']) {
      const subtitle = path.join(root, 'docs', 'public', 'subtitles', `${video.slug}.${lang}.vtt`)
      assertExists(`${label} ${lang} subtitle`, subtitle)
    }
    const playlist = path.join(root, 'docs', 'public', 'hls', video.slug, 'index.m3u8')
    assertExists(`${label} HLS playlist`, playlist)
  }
}

if (!Array.isArray(practiceQuestions)) {
  findings.push('practice questions: data must be an array')
}

if (!Array.isArray(labs) || labs.length !== 7) {
  findings.push(`labs: expected 7 lab items, found ${Array.isArray(labs) ? labs.length : 'non-array data'}`)
} else {
  for (const lab of labs) {
    const label = `lab ${lab.id || '(missing id)'}`
    for (const field of ['id', 'title', 'titleZh', 'type', 'sourceUrl', 'courseUrl', 'section', 'summary', 'launchGuidance']) {
      if (!lab[field]) findings.push(`${label}: missing ${field}`)
    }
    if (lab.sourceUrl && !lab.sourceUrl.startsWith('https://learn.ibm.com/')) findings.push(`${label}: sourceUrl must point to IBM Learn`)
    if (!Array.isArray(lab.learningPurpose) || lab.learningPurpose.length === 0) findings.push(`${label}: learningPurpose must not be empty`)
    if (!Array.isArray(lab.recommendedBefore) || lab.recommendedBefore.length === 0) findings.push(`${label}: recommendedBefore must not be empty`)
  }
}

if (findings.length > 0) {
  console.error(findings.join('\n'))
  process.exit(1)
}

console.log(`Public site checks passed: ${requiredPages.length} required pages, ${htmlFiles.length} HTML files, ${videos.length} source videos, ${deployedVideos.length} deployed videos, ${practiceQuestions.length} practice questions, ${labs.length} lab items.`)
