import path from 'path'
import { writeFileSync } from 'fs'
import { Feed } from 'feed'
import { defineConfig, createContentLoader } from 'vitepress'
import { imagetools } from 'vite-imagetools'
import formatPageContentForRSS from './theme/utils/formatPageContentForRSS'

const siteConfig = {
  title: '漫谈',
  description: '一个开发者周刊，记录我的所见所闻所思，每周日更新',
  copyRight: 'Copyright © 2024-present ❤️ Mancuoj',
  hostName: 'https://weekly.mancuoj.me',
  dir: 'weekly',
}

const formattedPagesForRSS: Record<string, string> = {}

export default defineConfig({
  title: siteConfig.title,
  description: siteConfig.description,
  lang: 'zh-CN',
  cleanUrls: true,
  head: [['link', { rel: 'icon', href: '/logo.svg' }]],
  vite: { plugins: [imagetools()] },
  themeConfig: {
    logo: '/logo.svg',
    nav: [{ text: 'RSS', link: '/rss.xml' }],
    outline: false,
    aside: false,
    socialLinks: [{ icon: 'github', link: 'https://github.com/mancuoj' }],
    footer: {
      copyright: siteConfig.copyRight,
    },
    search: {
      provider: 'local',
    },
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
      copyright: siteConfig.copyRight,
      language: 'zh-CN',
    })

    const posts = await createContentLoader(`/${siteConfig.dir}/*.md`, {
      render: true,
      includeSrc: true,
      transform(rawData) {
        return rawData.sort((a, b) => {
          return +new Date(b.frontmatter.date).getTime() - +new Date(a.frontmatter.date).getTime()
        })
      },
    }).load()

    for (const { url, excerpt, frontmatter, html } of posts) {
      const improvedHtml = formattedPagesForRSS[url]

      feed.addItem({
        title: frontmatter.title,
        id: `${siteConfig.hostName}${url}`,
        link: `${siteConfig.hostName}${url}`,
        description: excerpt,
        content: improvedHtml || html,
        author: [
          {
            name: 'Mancuoj',
            email: 'mancuoj@gmail.com',
            link: 'https://weekly.mancuoj.me',
          },
        ],
        date: frontmatter.date,
      })
    }

    writeFileSync(path.join(config.outDir, 'rss.xml'), feed.rss2())
  },
})
