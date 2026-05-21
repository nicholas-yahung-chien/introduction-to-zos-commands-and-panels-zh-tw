import { rm } from 'node:fs/promises'
import { resolve } from 'node:path'

const distDir = resolve('docs/.vitepress/dist')
const mediaPaths = ['hls', 'media'].map((path) => resolve(distDir, path))

await Promise.all(
  mediaPaths.map((path) => rm(path, { force: true, recursive: true })),
)
