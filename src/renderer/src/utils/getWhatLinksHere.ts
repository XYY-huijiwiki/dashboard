import ky from 'ky'

async function parseHTML(html: string) {
  let nextPageLink: string | null = null
  const links: string[] = []
  // prepare html
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // get next page link
  const aTags = doc.querySelectorAll('a')
  for (let index = 0; index < aTags.length; index++) {
    const aTag = aTags[index]
    const href = aTag.getAttribute('href') || ''
    const aTagUrl = new URL(href, 'https://xyy.huijiwiki.com')
    if (aTagUrl.searchParams.get('dir') === 'next') {
      nextPageLink = aTagUrl.toString()
      break
    }
  }

  // get links
  const linkTags = doc.querySelectorAll('ul#mw-whatlinkshere-list li > a')
  for (let index = 0; index < linkTags.length; index++) {
    const linkTag = linkTags[index]
    const title = linkTag.getAttribute('title')
    if (title) links.push(title)
  }

  return { nextPageLink, links }
}

async function getWhatLinksHere(pageName: string): Promise<string[]> {
  const url = new URL('https://xyy.huijiwiki.com/index.php')
  url.searchParams.set('title', `Special:Whatlinkshere/${pageName}`)
  url.searchParams.set('limit', '5000')

  const links: string[] = []
  let nextPageLink: string | null = url.toString()

  while (nextPageLink) {
    const html = await ky.get(nextPageLink).text()
    const { nextPageLink: newNextPageLink, links: newLinks } = await parseHTML(html)
    links.push(...newLinks)
    nextPageLink = newNextPageLink
  }

  return links
}

export default getWhatLinksHere
