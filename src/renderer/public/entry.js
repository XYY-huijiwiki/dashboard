(async () => {
  // 获取vite构建的manifest.json文件
  let data = JSON.parse(`{{{manifest}}}`);
  // 导入js
  let moduleUrl =
    "https://xyy-huijiwiki.github.io/dashboard/" + data["index.html"]["file"];
  import(moduleUrl);
  // 导入css
  let cssUrls = data["index.html"]["css"];
  cssUrls.forEach((url) => {
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://xyy-huijiwiki.github.io/dashboard/" + url;
    document.head.appendChild(link);
  });
})();
