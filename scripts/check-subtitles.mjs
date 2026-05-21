import { access, readFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const manifest = JSON.parse(await readFile(path.join(root, 'data', 'course-manifest.json'), 'utf8'))
const subtitlesDir = path.join(root, 'docs', 'public', 'subtitles')
const videos = manifest.sections
  .flatMap((section) => section.activities.filter((activity) => activity.type === 'video' && activity.mediaStatus !== 'source-only'))

const missing = []
const emptyCues = []

function findEmptyCues(text) {
  return text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n\r?\n/)
    .slice(1)
    .map((block) => {
      const lines = block.split(/\r?\n/)
      return {
        id: lines[0],
        time: lines[1],
        text: lines.slice(2).join('\n')
      }
    })
    .filter((cue) => cue.id && cue.time && cue.text.trim() === '')
}

for (const video of videos) {
  const file = path.join(subtitlesDir, `${video.slug}.zh-Hant-TW.vtt`)
  try {
    await access(file)
    const cues = findEmptyCues(await readFile(file, 'utf8'))
    for (const cue of cues) {
      emptyCues.push(`${video.slug}.zh-Hant-TW.vtt cue ${cue.id} ${cue.time}`)
    }
  } catch {
    missing.push(`${video.slug}.zh-Hant-TW.vtt`)
  }
}

if (missing.length) {
  console.log(`Missing ${missing.length} subtitle files:`)
  for (const file of missing) console.log(`- ${file}`)
  process.exitCode = 1
}

if (emptyCues.length) {
  console.log('Empty subtitle cues found:')
  for (const cue of emptyCues) console.log(`- ${cue}`)
  process.exitCode = 1
}

if (!missing.length && !emptyCues.length) {
  console.log(`Subtitle checks passed for ${videos.length} deployed video(s).`)
} else {
  console.log('Subtitle check failed.')
}
