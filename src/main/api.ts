import { ipcMain, dialog, BrowserWindow, shell } from 'electron'
import path from 'path'
import fs from 'fs'
import mime from 'mime-types'
import { download, CancelError } from 'electron-dl'
import type { Options } from 'electron-dl'

import base62 from './utils/base62.js'
import ghLogin from './utils/ghLogin.js'
import safeRename from './utils/safeRename.js'

function registerIPC(): void {
  // #region file upload

  ipcMain.handle('open-file-dialog', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile']
    })

    if (canceled) return null

    const filePath = filePaths[0]
    const stats = fs.statSync(filePath)
    return {
      name: path.basename(filePath),
      path: filePath,
      size: stats.size,
      type: mime.lookup(filePath) || 'application/octet-stream'
    }
  })

  ipcMain.handle(
    'upload-to-github',
    async (_, { ghToken, owner, repo, releaseId, filePath, fileName }) => {
      const fileExt = path.extname(fileName)
      const fileNameWithoutExt = path.basename(fileName, fileExt)
      const base62FileName = base62.encode(fileNameWithoutExt) + fileExt
      const url = `https://uploads.github.com/repos/${owner}/${repo}/releases/${releaseId}/assets?name=${base62FileName}`

      const readStream = fs.readFileSync(filePath)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `bearer ${ghToken}`,
          'Content-Type': mime.lookup(filePath) || 'application/octet-stream'
        },
        body: readStream
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
      }

      return response.json()
    }
  )

  // #endregion

  // #region github login

  ipcMain.handle('gh-login', async () => {
    return ghLogin()
  })

  // #endregion

  // #region download file

  const downloadItems: Record<string, Electron.DownloadItem> = {}

  ipcMain.handle(
    'download-file',
    async (event, { id, url, options }: { id: string; url: string; options: Options }) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      if (!win) throw new Error('No BrowserWindow found')

      let targetFilename = options.filename

      try {
        download(win, url, {
          ...options,
          filename: id,
          onStarted: (item) => {
            event.sender.send('downloadStarted', { id })
            downloadItems[id] = item
          },
          onProgress: (progress) => {
            event.sender.send('downloadProgress', {
              id,
              ...progress
            })
          },
          onCompleted: async (data) => {
            if (!targetFilename) targetFilename = downloadItems[id].getFilename()
            const filePath = await safeRename(data.path, targetFilename)
            const fileName = path.basename(filePath)
            event.sender.send('downloadCompleted', {
              id,
              filePath,
              fileName
            })
            delete downloadItems[id]
          },
          onCancel: (_item) => {
            event.sender.send('downloadCancelled', { id })
            delete downloadItems[id]
          }
        })
      } catch (error) {
        if (error instanceof CancelError) {
          console.info('item.cancel() was called')
        } else {
          console.error(error)
        }
        event.sender.send('downloadError', { id, error })
        throw error
      }
    }
  )

  ipcMain.handle('cancel-download', async (_event, id: string) => {
    const item = downloadItems[id]
    if (item) {
      item.cancel()
    }
  })

  // #endregion

  // #region fullscreen
  ipcMain.handle('toggle-fullscreen', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) throw new Error('No BrowserWindow found')
    win.setFullScreen(!win.isFullScreen())
  })
  // #endregion

  // #region toggle devtools
  ipcMain.handle('toggle-devtools', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) throw new Error('No BrowserWindow found')
    win.webContents.toggleDevTools()
  })
  // #endregion

  // #region file operations

  ipcMain.handle('show-in-folder', async (_event, filePath: string) => {
    shell.showItemInFolder(filePath)
  })

  ipcMain.handle('open-file', async (_event, filePath: string) => {
    shell.openPath(filePath)
  })

  // #endregion
}

export default registerIPC
