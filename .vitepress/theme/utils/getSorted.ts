import { ContentData } from 'vitepress'

export default function getSorted(data: ContentData[]): ContentData[] {
  return [...data].sort((a, b) => {
    const dateA = new Date(a.frontmatter.date).getTime()
    const dateB = new Date(b.frontmatter.date).getTime()
    return dateB - dateA
  })
}
