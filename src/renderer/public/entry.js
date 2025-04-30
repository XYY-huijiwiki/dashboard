(async () => {
  // import js
  let moduleUrl =
    "https://xyy-huijiwiki.github.io/dashboard/" + JSON.parse(`{{{js}}}`);
  import(moduleUrl);
  // import css
  let cssUrls = JSON.parse(`{{{css}}}`);
  cssUrls.forEach((url) => {
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://xyy-huijiwiki.github.io/dashboard/" + url;
    document.head.appendChild(link);
  });
})();
