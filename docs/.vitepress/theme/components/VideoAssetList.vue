<script setup lang="ts">
import manifest from '../../../../data/course-manifest.json'
import videoAssets from '../../../public/manifest/video-assets.json'

type VideoAsset = {
  slug: string
  title: string
  titleZh: string
  entryId: string
  duration?: number
  width?: number
  height?: number
  sizeInBytes?: string
}

const assets = videoAssets as VideoAsset[]
const sectionByVideo = new Map<string, string>()

for (const section of manifest.sections) {
  for (const activity of section.activities) {
    if (activity.type === 'video') {
      sectionByVideo.set(activity.slug, section.titleZh || section.title)
    }
  }
}

function formatDuration(seconds?: number) {
  if (!seconds) return '未取得'
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${minutes}:${String(rest).padStart(2, '0')}`
}

function formatSize(value?: string) {
  const bytes = Number(value || 0)
  if (!bytes) return '未取得'
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
</script>

<template>
  <section class="video-assets" aria-label="影片 metadata">
    <div class="video-assets__overview">
      <p>以下 metadata 由登入後 IBM Learn 影片頁與 Kaltura iframe 擷取，用於後續媒體下載、HLS、字幕與發布檢查。</p>
      <div class="video-assets__count">
        <strong>{{ assets.length }}</strong>
        <span>支影片 metadata</span>
      </div>
    </div>

    <div class="video-assets__list">
      <article v-for="asset in assets" :key="asset.slug" class="video-assets__item">
        <div class="video-assets__meta">
          <span>{{ sectionByVideo.get(asset.slug) || '課程影片' }}</span>
          <span>Kaltura {{ asset.entryId }}</span>
        </div>
        <h2>{{ asset.titleZh || asset.title }}</h2>
        <p>{{ asset.title }}</p>
        <dl>
          <div>
            <dt>長度</dt>
            <dd>{{ formatDuration(asset.duration) }}</dd>
          </div>
          <div>
            <dt>解析度</dt>
            <dd>{{ asset.width && asset.height ? `${asset.width} x ${asset.height}` : '未取得' }}</dd>
          </div>
          <div>
            <dt>大小</dt>
            <dd>{{ formatSize(asset.sizeInBytes) }}</dd>
          </div>
        </dl>
      </article>
    </div>
  </section>
</template>
