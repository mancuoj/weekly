import path from 'path'
import { writeFileSync } from 'fs'
import { Feed } from 'feed'
import { defineConfig, createContentLoader } from 'vitepress'
import { imagetools } from 'vite-imagetools'
import formatPageContentForRSS from './theme/utils/formatPageContentForRSS'

const siteConfig = {
  title: '漫谈',
  description: '一个开发者周刊，记录我的所见所闻所思，每周日更新',
  copyright: 'Copyright © 2024-present ❤️ Mancuoj',
  hostName: 'https://weekly.mancuoj.me',
  dir: 'weekly',
  lang: 'zh-CN',
  author: {
    name: 'Mancuoj',
    email: 'mancuoj@gmail.com',
    link: 'https://weekly.mancuoj.me',
  },
  github: 'https://github.com/mancuoj',
  twitter: 'https://twitter.com/humancuoj',
  rss: '/rss.xml',
}

const formattedPagesForRSS: Record<string, string> = {}

export default defineConfig({
  title: siteConfig.title,
  description: siteConfig.description,
  lang: siteConfig.lang,
  cleanUrls: true,
  head: [['link', { rel: 'icon', href: '/logo.svg' }]],
  vite: { plugins: [imagetools()] },
  themeConfig: {
    logo: '/logo.svg',
    outline: false,
    aside: false,
    socialLinks: [
      { icon: 'github', link: siteConfig.github },
      { icon: 'twitter', link: siteConfig.twitter },
      {
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" width="112" height="128" viewBox="0 0 448 512"><path fill="currentColor" d="M0 64c0-17.7 14.3-32 32-32c229.8 0 416 186.2 416 416c0 17.7-14.3 32-32 32s-32-14.3-32-32C384 253.6 226.4 96 32 96C14.3 96 0 81.7 0 64m0 352a64 64 0 1 1 128 0a64 64 0 1 1-128 0m32-256c159.1 0 288 128.9 288 288c0 17.7-14.3 32-32 32s-32-14.3-32-32c0-123.7-100.3-224-224-224c-17.7 0-32-14.3-32-32s14.3-32 32-32"/></svg>',
        },
        link: siteConfig.rss,
      },
    ],
    footer: {
      copyright: siteConfig.copyright,
    },
    search: {
      provider: 'local',
    },
  },

  rewrites: {
    'weekly/:file': ':file'
  },

  transformHtml(_code, _id, { content, pageData }) {
    const { filePath } = pageData
    const dirname = path.dirname(filePath)
    const basename = path.basename(filePath, '.md')

    if (dirname === siteConfig.dir) {
      const html = formatPageContentForRSS(content, siteConfig.hostName)
      if (html) {
        formattedPagesForRSS[`/${dirname}/${basename}`] = html
      }
    }
  },


  buildEnd: async (config) => {
    const feed = new Feed({
      title: siteConfig.title,
      description: siteConfig.description,
      id: siteConfig.hostName,
      link: siteConfig.hostName,
      copyright: siteConfig.copyright,
      language: siteConfig.lang,
    })

    const data = await createContentLoader(`/${siteConfig.dir}/*.md`, {
      render: true,
      includeSrc: true,
      transform(rawData) {
        return rawData.sort((a, b) => {
          return +new Date(b.frontmatter.date).getTime() - +new Date(a.frontmatter.date).getTime()
        })
      },
    }).load()

    for (const { url, excerpt, frontmatter, html } of data) {
      const improvedHtml = formattedPagesForRSS[url]

      feed.addItem({
        title: frontmatter.title,
        id: `${siteConfig.hostName}${url}`,
        link: `${siteConfig.hostName}${url}`,
        description: excerpt,
        content: improvedHtml || html,
        author: [siteConfig.author],
        date: new Date(frontmatter.date),
      })
    }

    writeFileSync(path.join(config.outDir, 'rss.xml'), feed.rss2())
  },
})
