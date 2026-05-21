import { cp, mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const publicDir = path.join(root, 'docs', 'public')
const distDir = path.join(root, 'docs', '.vitepress', 'dist')
const excluded = new Set(['hls', 'media'])

await mkdir(distDir, { recursive: true })

for (const entry of await readdir(publicDir, { withFileTypes: true })) {
  if (excluded.has(entry.name)) continue

  await cp(
    path.join(publicDir, entry.name),
    path.join(distDir, entry.name),
    { recursive: true, force: true },
  )
}

console.log('Copied public assets except local hls/media into docs/.vitepress/dist.')
