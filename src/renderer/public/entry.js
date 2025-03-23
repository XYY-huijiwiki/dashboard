;(async () => {
  // 获取vite构建的manifest.json文件
  let response = await fetch('https://xyy-huijiwiki.github.io/dashboard/.vite/manifest.json')
  let data = await response.json()
  // 导入js
  let moduleUrl = 'https://xyy-huijiwiki.github.io/dashboard/' + data['index.html']['file']
  import(moduleUrl)
  // 导入css
  let cssUrls = data['index.html']['css']
  cssUrls.forEach((url) => {
    let link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://xyy-huijiwiki.github.io/dashboard/' + url
    document.head.appendChild(link)
  })
})()
