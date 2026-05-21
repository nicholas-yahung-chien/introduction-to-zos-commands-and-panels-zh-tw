import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { findDebugPage, evaluateInPage } from './cdp-client.mjs'

const root = process.cwd()
const outputDir = path.join(root, 'data', 'captured')

const expression = String.raw`(async () => {
  const clean = (value) => (value || '').replace(/\s+/g, ' ').trim()
  const htmlToMarkdown = (root) => {
    const lines = []
    const walk = (node, depth = 0) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = clean(node.textContent)
        if (text) lines.push(text)
        return
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return
      const tag = node.tagName.toLowerCase()
      if (['script', 'style', 'nav', 'footer'].includes(tag)) return
      if (/^h[1-6]$/.test(tag)) {
        const level = Number(tag.slice(1))
        lines.push('#'.repeat(Math.min(level + 1, 6)) + ' ' + clean(node.textContent))
        return
      }
      if (tag === 'p') {
        const text = clean(node.textContent)
        if (text) lines.push(text)
        return
      }
      if (tag === 'li') {
        const text = clean(node.textContent)
        if (text) lines.push('- ' + text)
        return
      }
      if (tag === 'a') {
        const text = clean(node.textContent)
        const href = node.href
        if (text && href) lines.push('[' + text + '](' + href + ')')
        return
      }
      Array.from(node.childNodes).forEach((child) => walk(child, depth + 1))
    }
    walk(root)
    return lines
      .join('\n\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  const sectionNodes = Array.from(document.querySelectorAll('li.section.main, .course-section.main, li.section'))
  const sections = sectionNodes.map((section) => ({
    title: clean(section.querySelector('.sectionname, h3, h2')?.textContent),
    activities: Array.from(section.querySelectorAll('li.activity')).map((activity) => {
      const link = activity.querySelector('a.aalink[href], a.stretched-link[href], .activityname a[href], a[href*="/mod/"]')
      const type = (activity.className.match(/modtype_([^\s]+)/) || [])[1] || ''
      const title = clean((link?.textContent || activity.querySelector('.instancename')?.textContent || activity.innerText || '')
        .replace(/\b(Video|Page|Quiz|Forum|View|URL|Questionnaire|Interactive Content)\b/g, ''))
      return { title, type, href: link?.href || '' }
    }).filter((activity) => activity.title || activity.href)
  })).filter((section) => section.title || section.activities.length)

  const includedPages = sections.flatMap((section) => section.activities
    .filter((activity) => ['page', 'hvp'].includes(activity.type))
    .map((activity) => ({ section: section.title, ...activity })))

  const pages = []
  for (const activity of includedPages) {
    const response = await fetch(activity.href, { credentials: 'include' })
    const html = await response.text()
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const content = doc.querySelector('.activity-description, .generalbox, #intro, [role="main"]') || doc.body
    const assets = Array.from(doc.querySelectorAll('a[href], img[src], iframe[src], video[src], source[src], track[src]')).map((node) => ({
      tag: node.tagName.toLowerCase(),
      text: clean(node.textContent || node.alt || node.title),
      href: node.href || node.src || ''
    }))
    pages.push({
      section: activity.section,
      type: activity.type,
      title: clean(doc.querySelector('h1')?.textContent || activity.title),
      sourceUrl: activity.href,
      markdown: htmlToMarkdown(content),
      assets,
      hasH5P: /h5p|H5P/.test(html),
      htmlLength: html.length
    })
  }

  return {
    capturedAt: new Date().toISOString(),
    courseUrl: location.href,
    courseTitle: clean(document.querySelector('h1')?.textContent || document.title),
    sections,
    pages
  }
})()`

await mkdir(outputDir, { recursive: true })

const courseId = process.env.IBM_LEARN_COURSE_ID || '7419'
const page = await findDebugPage((candidate) => candidate.url.includes(`learn.ibm.com/course/view.php?id=${courseId}`))
const capture = await evaluateInPage(page, expression)

await writeFile(path.join(outputDir, 'course-capture.json'), JSON.stringify(capture, null, 2), 'utf8')

for (const pageCapture of capture.pages) {
  const slug = pageCapture.sourceUrl.match(/id=(\d+)/)?.[1] || pageCapture.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const content = `# ${pageCapture.title}\n\n> Source: ${pageCapture.sourceUrl}\n\n${pageCapture.markdown}\n`
  await writeFile(path.join(outputDir, `${slug}.md`), content, 'utf8')
}

console.log(`Captured ${capture.sections.length} sections and ${capture.pages.length} page/H5P activities.`)
console.log(`Wrote ${path.relative(root, outputDir)}.`)
