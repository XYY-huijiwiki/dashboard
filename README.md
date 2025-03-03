# RDrive (XYY Wiki Edition)

A convenient file manager for accessing and managing files stored on GitHub, (almost) seamlessly integrated with XYY Wiki. With this, you can effortlessly browse, upload, download, rename, and delete files – and more! Because who doesn’t love more? 😏

[![Download Latest Release](https://img.shields.io/github/v/release/XYY-huijiwiki/r-drive?label=Download&style=for-the-badge)](https://github.com/XYY-huijiwiki/r-drive/releases/latest)

## Features 🎯

- ✅ **List files** – Search and sort like a pro.
- ✅ **Upload files** – Just a few clicks, but don’t forget to provide the file source and licence! (See [licence details in XYY Wiki](https://xyy.huijiwiki.com/wiki/MediaWiki:Licenses))
- ✅ **Download files** – Supports multiple downloads at once. No one likes downloading files one by one. 😤
- ✅ **Basic file operations** – Rename, delete, and feel powerful. 💪

## Notes 📌

### GitHub Login Required 🔑

> [!Note]
> You must log in to GitHub to use this app. Also, all files will be **read-only** unless you have admin permissions in the `XYY-huijiwiki` GitHub organisation.

### Network Connection 🌍

> [!Note]
> This app requires an internet connection to access GitHub and Cloudflare. If you’re in mainland China, you might have trouble connecting.

## How It Works ⚙️

All files are stored as assets in GitHub releases, while file metadata is kept in a Cloudflare D1 database. With the file name, XYY Wiki can display files directly. For extra details like file source and licence, the database has your back.

## Development 🛠️

### Requirements

- Node.js **>= 20**

### Install Dependencies

```bash
npm install
```

### Start Development

```bash
npm run dev
```

## To-Do List 📝

- [ ] Support for multiple file uploads
- [ ] Support for multiple file downloads
- [ ] Error handling for download
- [ ] Implement transactional operations
- [ ] Draggable file uploads
- [ ] Cross-platform support
- [ ] Remove `any` from `src/renderer/src/components/file-list-grid.vue` once `@coleqiu/vue-drag-select` gets update
- [ ] recycle bin
- [ ] Auto update
