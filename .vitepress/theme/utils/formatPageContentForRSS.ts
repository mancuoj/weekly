import * as cheerio from 'cheerio'

export default function formatPageContentForRSS(htmlString: string, hostname: string): string | null {
  const $ = cheerio.load(htmlString)
  const images = $('figure img')
  images.each(function () {
    const current = $(this).attr('src')
    $(this).attr('src', `${hostname}${current}`)
  })

  return $('main').html()
}
