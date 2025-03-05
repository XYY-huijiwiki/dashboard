import { parse } from 'wikity'
import { h, type VNode } from 'vue'

function genWikitextDom(wikitext: string): VNode {
  const rawHtmlStr = parse(wikitext)

  // Ensure all the links open in the external browser
  const articleEle = document.createElement('article')
  articleEle.innerHTML = rawHtmlStr
  const links = articleEle.querySelectorAll('a')
  links.forEach((link) => {
    link.setAttribute('target', '_blank')
  })

  return h('article', { innerHTML: articleEle.innerHTML, class: 'markdown-body' })
}

export default genWikitextDom
