import { mkdir, readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'

const root = process.cwd()
const manifest = JSON.parse(await readFile(path.join(root, 'data', 'course-manifest.json'), 'utf8'))
const mediaDir = path.join(root, 'docs', 'public', 'media')
const hlsRoot = path.join(root, 'docs', 'public', 'hls')
const force = process.argv.includes('--force')

const videos = manifest.sections.flatMap((section) => section.activities
  .filter((activity) => activity.type === 'video' && activity.includeInFirstEdition !== false))

async function runFfmpeg(input, outputDir) {
  await mkdir(outputDir, { recursive: true })
  await new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-y',
      '-hide_banner',
      '-loglevel',
      'error',
      '-i',
      input,
      '-map',
      '0:v:0',
      '-map',
      '0:a:0',
      '-c',
      'copy',
      '-hls_time',
      '6',
      '-hls_playlist_type',
      'vod',
      '-hls_segment_filename',
      path.join(outputDir, 'segment_%04d.ts'),
      path.join(outputDir, 'index.m3u8')
    ], { stdio: 'inherit' })
    ffmpeg.on('error', reject)
    ffmpeg.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`ffmpeg exited with ${code}`))
    })
  })
}

for (const video of videos) {
  const input = path.join(mediaDir, `${video.slug}.mp4`)
  const outputDir = path.join(hlsRoot, video.slug)
  if (force) {
    await rm(outputDir, { recursive: true, force: true })
  }
  console.log(`generating HLS for ${video.slug}`)
  await runFfmpeg(input, outputDir)
}
