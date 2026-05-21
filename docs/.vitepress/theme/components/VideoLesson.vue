<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { withBase } from 'vitepress'

const props = defineProps<{
  title: string
  videoSrc?: string
  poster?: string
  subtitleSrc?: string
  entryId?: string
  sourceUrl?: string
}>()

const mediaVersion = 'hls-f6d6b21'
const subtitleVersion = 'subtitles-quality-wrap'
const mediaBaseUrl = import.meta.env.VITE_MEDIA_BASE_URL?.replace(/\/$/, '')

function appendVersion(src: string, version = mediaVersion) {
  return `${src}${src.includes('?') ? '&' : '?'}v=${version}`
}

function isAbsoluteUrl(src: string) {
  return /^https?:\/\//i.test(src)
}

function siteAsset(src: string) {
  return isAbsoluteUrl(src) ? src : withBase(src)
}

function mediaAsset(src: string) {
  if (isAbsoluteUrl(src)) return src
  return mediaBaseUrl ? `${mediaBaseUrl}${src.startsWith('/') ? src : `/${src}`}` : siteAsset(src)
}

const versionedVideoSrc = computed(() => {
  if (!props.videoSrc) return undefined
  return appendVersion(mediaAsset(props.videoSrc))
})

const subtitleTrackSrc = computed(() => {
  if (!props.subtitleSrc) return undefined
  return appendVersion(siteAsset(props.subtitleSrc), subtitleVersion)
})

const videoRef = ref<HTMLVideoElement>()
const isActivated = ref(false)
const isLoading = ref(false)
const loadError = ref('')
const hlsSrc = computed(() => {
  if (!props.videoSrc) return undefined
  const source = props.videoSrc.split('?')[0]
  const playlist = source.replace('/media/', '/hls/').replace(/\.mp4$/, '/index.m3u8')
  return appendVersion(mediaAsset(playlist))
})

let hls: { destroy: () => void } | undefined
let hasInitialized = false

const posterStyle = computed(() => {
  if (!props.poster) return undefined
  return {
    backgroundImage: `linear-gradient(rgba(22, 22, 22, 0.5), rgba(22, 22, 22, 0.5)), url("${props.poster}")`,
  }
})

function destroyHls() {
  hls?.destroy()
  hls = undefined
}

async function initializePlayer() {
  if (hasInitialized) return
  const video = videoRef.value
  if (!video) return

  hasInitialized = true

  if (hlsSrc.value && video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = hlsSrc.value
    return
  }

  if (hlsSrc.value) {
    const { default: Hls } = await import('hls.js')
    if (Hls.isSupported()) {
      hls = new Hls()
      hls.loadSource(hlsSrc.value)
      hls.attachMedia(video)
      return
    }
  }

  if (versionedVideoSrc.value) {
    video.src = versionedVideoSrc.value
  }
}

async function activateVideo() {
  if (!props.videoSrc || isActivated.value || isLoading.value) return

  isLoading.value = true
  loadError.value = ''
  isActivated.value = true

  try {
    await nextTick()
    await initializePlayer()
  } catch {
    hasInitialized = false
    isActivated.value = false
    destroyHls()
    loadError.value = '影片載入失敗，請稍後再試。'
  } finally {
    isLoading.value = false
  }
}

function pauseOtherVideos(event: Event) {
  const current = event.currentTarget as HTMLVideoElement
  document.querySelectorAll<HTMLVideoElement>('.video-lesson video').forEach((video) => {
    if (video !== current) video.pause()
  })
}

onBeforeUnmount(() => {
  destroyHls()
})
</script>

<template>
  <figure class="video-lesson">
    <div
      v-if="!isActivated"
      class="video-lesson__placeholder"
      :class="{ 'video-lesson__placeholder--empty': !poster }"
      :style="posterStyle"
    >
      <button
        v-if="videoSrc"
        type="button"
        class="video-lesson__load-button"
        :disabled="isLoading"
        @click="activateVideo"
      >
        <span class="video-lesson__play-mark" aria-hidden="true">▶</span>
        <span>{{ isLoading ? '載入中' : '載入影片' }}</span>
      </button>
      <span v-else class="video-lesson__unavailable">影片尚未部署</span>
    </div>
    <video v-else ref="videoRef" controls preload="none" :poster="poster" @play="pauseOtherVideos">
      <track
        v-if="subtitleSrc"
        kind="subtitles"
        srclang="zh-Hant-TW"
        label="繁體中文（台灣）"
        :src="subtitleTrackSrc"
        default
      >
      你的瀏覽器不支援 HTML5 video。
    </video>
    <p v-if="loadError" class="video-lesson__error">{{ loadError }}</p>
    <figcaption>
      <strong>{{ title }}</strong>
      <div class="video-lesson__meta">
        <span v-if="entryId" class="video-lesson__tag">Kaltura {{ entryId }}</span>
        <a v-if="sourceUrl" class="video-lesson__tag" :href="sourceUrl">原始課程活動</a>
        <span v-if="!videoSrc" class="video-lesson__tag">等待媒體檔部署</span>
        <span v-if="!subtitleSrc" class="video-lesson__tag">等待中文字幕</span>
      </div>
    </figcaption>
  </figure>
</template>
