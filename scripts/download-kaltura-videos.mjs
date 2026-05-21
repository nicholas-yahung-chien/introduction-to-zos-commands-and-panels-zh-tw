import { createWriteStream } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { pipeline } from 'node:stream/promises'

const root = process.cwd()
const manifest = JSON.parse(await readFile(path.join(root, 'data', 'course-manifest.json'), 'utf8'))
const mediaDir = path.join(root, 'docs', 'public', 'media')
const tempDir = path.join(root, 'tmp', 'kaltura-downloads')
const publicManifestDir = path.join(root, 'docs', 'public', 'manifest')
const dryRun = process.argv.includes('--dry-run')
const force = process.argv.includes('--force')

const videos = manifest.sections.flatMap((section) => section.activities
  .filter((activity) => activity.type === 'video' && activity.includeInFirstEdition !== false)
  .map((activity) => ({ section: section.slug, ...activity })))

function extractKalturaPackage(html) {
  const marker = 'window.kalturaIframePackageData = '
  const start = html.indexOf(marker)
  if (start === -1) return null
  const objectStart = html.indexOf('{', start)
  let depth = 0
  let inString = false
  let quote = ''
  let escaped = false
  for (let index = objectStart; index < html.length; index += 1) {
    const char = html[index]
    if (inString) {
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === quote) {
        inString = false
      }
      continue
    }
    if (char === '"' || char === "'") {
      inString = true
      quote = char
      continue
    }
    if (char === '{') depth += 1
    if (char === '}') depth -= 1
    if (depth === 0) {
      return JSON.parse(html.slice(objectStart, index + 1))
    }
  }
  return null
}

function selectBestVideoFlavor(packageData) {
  const flavors = packageData?.entryResult?.contextData?.flavorAssets || []
  return flavors
    .filter((flavor) => flavor.fileExt === 'mp4' && flavor.width > 0 && !flavor.isOriginal)
    .sort((left, right) => (right.width * right.height) - (left.width * left.height))[0]
    || flavors.find((flavor) => flavor.fileExt === 'mp4' && flavor.width > 0)
}

function selectAudioFlavor(packageData) {
  const flavors = packageData?.entryResult?.contextData?.flavorAssets || []
  return flavors
    .filter((flavor) => flavor.fileExt === 'mp4' && flavor.width === 0 && /audio/i.test(`${flavor.tags} ${flavor.description}`))
    .sort((left, right) => Number(right.bitrate || 0) - Number(left.bitrate || 0))[0]
}

function flavorUrl(partnerId, entryId, flavorId) {
  return `https://cdnapisec.kaltura.com/p/${partnerId}/sp/${partnerId}00/playManifest/entryId/${entryId}/flavorId/${flavorId}/format/url/protocol/https/a.mp4`
}

function hlsUrl(partnerId, entryId, flavorId) {
  return `https://cdnapisec.kaltura.com/p/${partnerId}/sp/${partnerId}00/playManifest/entryId/${entryId}/format/applehttp/protocol/https/flavorIds/${flavorId}/a.m3u8`
}

async function getVideoInfo(video) {
  const { partnerId, uiconfId, entryId } = video.kaltura
  const embedUrl = `https://cdnapisec.kaltura.com/p/${partnerId}/sp/${partnerId}00/embedIframeJs/uiconf_id/${uiconfId}/partner_id/${partnerId}?iframeembed=true&playerId=kaltura_player&entry_id=${entryId}&flashvars[localizationCode]=en`
  const response = await fetch(embedUrl)
  if (!response.ok) {
    throw new Error(`Unable to fetch Kaltura iframe for ${entryId}: HTTP ${response.status}`)
  }
  const html = await response.text()
  const packageData = extractKalturaPackage(html)
  const flavor = selectBestVideoFlavor(packageData)
  const audioFlavor = selectAudioFlavor(packageData)
  const downloadUrl = packageData?.entryResult?.meta?.downloadUrl
  return {
    slug: video.slug,
    title: video.title,
    titleZh: video.titleZh,
    entryId,
    duration: packageData?.entryResult?.meta?.duration,
    width: flavor?.width,
    height: flavor?.height,
    sizeInBytes: flavor?.sizeInBytes,
    videoFlavorAssetId: flavor?.id,
    flavorParamsId: flavor?.flavorParamsId,
    audioFlavorAssetId: audioFlavor?.id,
    audioFlavorParamsId: audioFlavor?.flavorParamsId,
    downloadUrl,
    dataUrl: packageData?.entryResult?.meta?.dataUrl,
    videoUrl: flavor ? flavorUrl(partnerId, entryId, flavor.id) : null,
    audioUrl: audioFlavor ? flavorUrl(partnerId, entryId, audioFlavor.id) : null,
    hlsUrl: flavor ? hlsUrl(partnerId, entryId, flavor.id) : null
  }
}

await mkdir(mediaDir, { recursive: true })
await mkdir(publicManifestDir, { recursive: true })
await mkdir(tempDir, { recursive: true })

async function downloadFile(url, target, referer) {
  const response = await fetch(url, {
    headers: {
      Referer: referer,
      'User-Agent': 'Mozilla/5.0'
    },
    redirect: 'follow'
  })
  if (!response.ok || !response.body) {
    throw new Error(`Unable to download ${url}: HTTP ${response.status}`)
  }
  await pipeline(response.body, createWriteStream(target))
}

async function mergeAudioVideo(videoPath, audioPath, outputPath) {
  await new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-y',
      '-hide_banner',
      '-loglevel',
      'error',
      '-i',
      videoPath,
      '-i',
      audioPath,
      '-map',
      '0:v:0',
      '-map',
      '1:a:0',
      '-c',
      'copy',
      '-movflags',
      '+faststart',
      outputPath
    ], { stdio: 'inherit' })
    ffmpeg.on('error', reject)
    ffmpeg.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`ffmpeg exited with ${code}`))
    })
  })
}

async function downloadWithYtDlp(video, outputPath) {
  await new Promise((resolve, reject) => {
    const ytDlp = spawn('yt-dlp', [
      '--no-warnings',
      '--force-overwrites',
      '-f',
      'best[protocol=m3u8_native]/best[protocol=m3u8]',
      '--merge-output-format',
      'mp4',
      '-o',
      outputPath,
      `kaltura:${video.kaltura.partnerId}:${video.kaltura.entryId}`
    ], { stdio: 'inherit' })
    ytDlp.on('error', reject)
    ytDlp.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`yt-dlp exited with ${code}`))
    })
  })
}

async function downloadWithFfmpegHls(info, sourceUrl, outputPath) {
  await new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-y',
      '-hide_banner',
      '-loglevel',
      'warning',
      '-headers',
      `Referer: ${sourceUrl}\r\nUser-Agent: Mozilla/5.0\r\n`,
      '-i',
      info.hlsUrl,
      '-map',
      '0:v:0',
      '-map',
      '0:a:0',
      '-c',
      'copy',
      '-movflags',
      '+faststart',
      outputPath
    ], { stdio: 'inherit' })
    ffmpeg.on('error', reject)
    ffmpeg.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`ffmpeg exited with ${code}`))
    })
  })
}

const assets = []
for (const video of videos) {
  const info = await getVideoInfo(video)
  assets.push(info)
  const target = path.join(mediaDir, `${video.slug}.mp4`)
  console.log(`${dryRun ? '[dry-run] ' : ''}${video.slug}: ${info.width || '?'}x${info.height || '?'} ${info.duration || '?'}s`)
  if (!dryRun && info.hlsUrl) {
    if (!force) {
      console.log('  pass --force to download media files; leaving manifest only')
      continue
    }
    await downloadWithFfmpegHls(info, video.sourceUrl, target)
    console.log(`  wrote ${path.relative(root, target)}`)
  } else if (!dryRun && info.videoUrl) {
    if (!force) {
      console.log('  pass --force to download media files; leaving manifest only')
      continue
    }
    await downloadWithYtDlp(video, target)
    console.log(`  wrote ${path.relative(root, target)}`)
  }
}

await writeFile(path.join(root, 'data', 'video-assets.json'), JSON.stringify(assets, null, 2), 'utf8')
await writeFile(path.join(publicManifestDir, 'video-assets.json'), JSON.stringify(assets, null, 2), 'utf8')
console.log(`Wrote metadata for ${assets.length} videos.`)
