import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const mediaDist = path.join(root, 'dist-media')
const manifest = JSON.parse(await readFile(path.join(root, 'data', 'course-manifest.json'), 'utf8'))
const videos = manifest.sections
  .flatMap((section) => section.activities)
  .filter((activity) => activity.type === 'video' && activity.mediaStatus !== 'source-only')

const requiredRoots = [
  ['hls', path.join(root, 'docs', 'public', 'hls')],
  ['subtitles', path.join(root, 'docs', 'public', 'subtitles')],
  ['manifest', path.join(root, 'docs', 'public', 'manifest')],
]

const findings = []

for (const video of videos) {
  const playlist = path.join(root, 'docs', 'public', 'hls', video.slug, 'index.m3u8')
  if (!existsSync(playlist)) findings.push(`missing HLS playlist for ${video.slug}`)
  for (const lang of ['en', 'zh-Hant-TW']) {
    const subtitle = path.join(root, 'docs', 'public', 'subtitles', `${video.slug}.${lang}.vtt`)
    if (!existsSync(subtitle)) findings.push(`missing ${lang} subtitle for ${video.slug}`)
  }
}

if (findings.length > 0) {
  console.error(findings.join('\n'))
  process.exit(1)
}

await rm(mediaDist, { recursive: true, force: true })
await mkdir(mediaDist, { recursive: true })

for (const [name, source] of requiredRoots) {
  await cp(source, path.join(mediaDist, name), { recursive: true })
}

await writeFile(
  path.join(mediaDist, '_headers'),
  [
    '/*',
    '  Access-Control-Allow-Origin: *',
    '  Cache-Control: public, max-age=31536000, immutable',
    '',
    '/manifest/*',
    '  Cache-Control: public, max-age=300',
    '',
    '/subtitles/*',
    '  Cache-Control: public, max-age=300',
    '',
  ].join('\n'),
  'utf8',
)

await writeFile(
  path.join(mediaDist, 'index.html'),
  [
    '<!doctype html>',
    '<html lang="zh-Hant-TW">',
    '<meta charset="utf-8">',
    '<title>Introduction to z/OS Commands and Panels media</title>',
    '<h1>Introduction to z/OS Commands and Panels media</h1>',
    `<p>${videos.length} deployed video playlist(s), subtitles, and public media manifest are packaged here.</p>`,
    '</html>',
  ].join('\n'),
  'utf8',
)

console.log(`Packaged ${videos.length} video media set(s) into ${path.relative(root, mediaDist)}.`)
