import { readdir, readFile } from 'node:fs/promises'
import { existsSync, statSync } from 'node:fs'
import { join, sep } from 'node:path'

const contentTargets = [
  'docs/course',
  'docs/labs',
  'docs/practice',
  'docs/videos',
  'docs/index.md',
  'docs/license-notes.md',
  'docs/public/subtitles',
  'data/lesson-notes.json',
  'data/course-manifest.json',
  'data/labs.json',
]

const maxSubtitleLineLength = 42

const simplifiedTerms = [
  '主机', '系统', '视频', '课程', '关键', '数据', '应用程序', '软件', '硬件',
  '计算机', '设置', '网络', '用户', '服务器', '执行', '启动',
  '内存', '缓存', '磁盘', '连接', '组织', '通过', '设计', '业务', '术语',
  '状态', '驱动器', '级', '为', '与', '这', '个',
]

const discouragedTerms = new Map([
  ['大型電腦', '大型主機'],
  ['操作系統', '作業系統'],
  ['密鑰', '金鑰'],
  ['啟用設定檔', '啟動設定檔'],
  ['初始程序載入', '初始程式載入'],
  ['事務', '交易'],
])

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

async function listFiles(target) {
  if (!existsSync(target)) return []
  if (statSync(target).isFile()) return [target]

  const files = []
  for (const entry of await readdir(target, { withFileTypes: true })) {
    const filePath = join(target, entry.name)
    if (entry.isDirectory()) {
      files.push(...await listFiles(filePath))
    } else if (/\.(md|json|vtt|vue|ts)$/.test(entry.name)) {
      files.push(filePath)
    }
  }
  return files
}

function isPublicQualityTarget(file) {
  return !file.includes(`${sep}glossary${sep}`)
    && !file.includes(`${sep}.vitepress${sep}dist${sep}`)
    && !file.includes(`${sep}.vitepress${sep}cache${sep}`)
}

function isSubtitleText(line) {
  const trimmed = line.trim()
  if (!trimmed) return false
  if (trimmed === 'WEBVTT') return false
  if (/^\d+$/.test(trimmed)) return false
  if (trimmed.includes('-->')) return false
  if (/^(NOTE|STYLE|REGION)(\s|$)/.test(trimmed)) return false
  return true
}

const files = (await Promise.all(contentTargets.map(listFiles)))
  .flat()
  .filter(isPublicQualityTarget)

const findings = []

for (const file of files) {
  const text = await readFile(file, 'utf8')
  const lines = text.split(/\r?\n/)

  lines.forEach((line, index) => {
    for (const term of simplifiedTerms) {
      if (line.includes(term)) {
        findings.push(`${file}:${index + 1}: simplified candidate "${term}"`)
      }
    }

    for (const [discouraged, preferred] of discouragedTerms) {
      if (line.includes(discouraged)) {
        findings.push(`${file}:${index + 1}: use "${preferred}" instead of "${discouraged}"`)
      }
    }

    for (const term of publicPlanningTerms) {
      if (line.includes(term)) {
        findings.push(`${file}:${index + 1}: public page contains internal planning term "${term}"`)
      }
    }

    if (file.endsWith('.zh-Hant-TW.vtt') && isSubtitleText(line) && [...line].length > maxSubtitleLineLength) {
      findings.push(`${file}:${index + 1}: subtitle line length ${[...line].length} exceeds ${maxSubtitleLineLength}`)
    }
  })
}

if (findings.length > 0) {
  console.error(findings.join('\n'))
  process.exit(1)
}

console.log('Content quality checks passed.')
