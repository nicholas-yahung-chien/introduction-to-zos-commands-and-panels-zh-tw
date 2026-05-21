import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const subtitlesDir = 'docs/public/subtitles'
const maxLineLength = 42
const zhSubtitlePattern = /\.zh-Hant-TW\.vtt$/

function charLength(text) {
  return [...text].length
}

function splitLongLine(line, maxLength = maxLineLength) {
  if (charLength(line) <= maxLength) return [line]

  const parts = []
  let rest = line.trim()
  const preferredBreaks = ['，', '。', '；', '：', '、', '？', '！', ',', ';', ':', ' ']

  while (charLength(rest) > maxLength) {
    let splitAt = -1
    const chars = [...rest]
    const lowerBound = Math.max(14, Math.floor(maxLength * 0.45))
    const upperBound = Math.min(chars.length - 1, maxLength - 1)

    for (let index = upperBound; index >= lowerBound; index -= 1) {
      if (preferredBreaks.includes(chars[index])) {
        splitAt = index + 1
        break
      }
    }

    if (splitAt === -1) splitAt = upperBound

    parts.push(chars.slice(0, splitAt).join('').trim())
    rest = chars.slice(splitAt).join('').trim()
  }

  if (rest) parts.push(rest)
  return parts
}

function isCueText(line) {
  const trimmed = line.trim()
  if (!trimmed) return false
  if (trimmed === 'WEBVTT') return false
  if (/^\d+$/.test(trimmed)) return false
  if (trimmed.includes('-->')) return false
  if (/^(NOTE|STYLE|REGION)(\s|$)/.test(trimmed)) return false
  return true
}

let changedFiles = 0
let changedLines = 0

for (const file of await readdir(subtitlesDir)) {
  if (!zhSubtitlePattern.test(file)) continue

  const filePath = join(subtitlesDir, file)
  const original = await readFile(filePath, 'utf8')
  const output = []
  let fileChanged = false

  for (const line of original.split(/\r?\n/)) {
    if (!isCueText(line) || charLength(line) <= maxLineLength) {
      output.push(line)
      continue
    }

    const wrapped = splitLongLine(line)
    output.push(...wrapped)
    fileChanged = true
    changedLines += 1
  }

  if (fileChanged) {
    changedFiles += 1
    await writeFile(filePath, output.join('\n'), 'utf8')
  }
}

console.log(`Wrapped ${changedLines} subtitle line(s) in ${changedFiles} file(s).`)
