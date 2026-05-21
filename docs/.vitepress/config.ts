import { defineConfig } from 'vitepress'

function normalizeBase(base: string | undefined) {
  if (!base) return '/introduction-to-zos-commands-and-panels-zh-tw/'
  const withLeadingSlash = base.startsWith('/') ? base : `/${base}`
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}

export default defineConfig({
  title: 'Introduction to z/OS Commands and Panels',
  description: 'IBM Z z/OS 命令與面板入門課程台灣繁體中文靜態學習網站',
  lang: 'zh-Hant-TW',
  cleanUrls: true,
  base: normalizeBase(process.env.VITEPRESS_BASE),
  head: [
    ['meta', { name: 'theme-color', content: '#0f62fe' }],
    ['meta', { property: 'og:title', content: 'Introduction to z/OS Commands and Panels 台灣繁體中文課程' }],
    ['meta', { property: 'og:description', content: 'IBM Learn 課程的繁體中文靜態學習導覽、Lab 順序與術語整理。' }]
  ],
  themeConfig: {
    logo: '/ibm-z-mark.svg',
    nav: [
      { text: '課程', link: '/course/' },
      { text: '影片', link: '/videos/' },
      { text: '互動練習', link: '/practice/' },
      { text: 'Lab 與互動實作', link: '/labs/' },
      { text: '詞彙表', link: '/glossary/' },
      { text: '授權資訊', link: '/license-notes' }
    ],
    sidebar: [
      {
        text: '課程',
        items: [
          { text: '課程首頁', link: '/course/' },
          { text: 'z/OS 命令與面板入門', link: '/course/introduction-to-commands-and-panels' },
          { text: '處理資料集', link: '/course/working-with-data-sets' },
          { text: 'TSO 命令', link: '/course/tso-commands' },
          { text: '互動練習', link: '/practice/' },
          { text: 'Lab 與互動實作', link: '/labs/' }
        ]
      },
      {
        text: '資源',
        items: [
          { text: '影片總覽', link: '/videos/' },
          { text: 'Lab 與互動實作', link: '/labs/' },
          { text: '詞彙表', link: '/glossary/' },
          { text: '授權資訊', link: '/license-notes' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/nicholas-yahung-chien/introduction-to-zos-commands-and-panels-zh-tw' }
    ],
    footer: {
      message: 'IBM Learn 課程台灣繁體中文化教材，供 IBM Taiwan enablement 使用。',
      copyright: 'Prepared for IBM Taiwan enablement use.'
    },
    search: {
      provider: 'local'
    }
  }
})
