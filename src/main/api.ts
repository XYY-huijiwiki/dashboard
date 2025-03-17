import { ipcMain, dialog, BrowserWindow } from 'electron'
import path from 'path'
import fs from 'fs'
import mime from 'mime-types'
import { download, CancelError } from 'electron-dl'
import type { Options } from 'electron-dl'

import base62 from './utils/base62.js'
import ghLogin from './utils/ghLogin.js'

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

  ipcMain.handle('download-file', async (event, url: string, fileName: string) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) throw new Error('No BrowserWindow found')
    const options = {
      filename: fileName,
      saveAs: true,
      onProgress: (progress) => {
        win.webContents.send('download-progress', fileName, progress)
      },
      onCompleted: () => {
        win.webContents.send('download-completed', fileName)
      }
    } satisfies Options
    try {
      console.dir(await download(win, url, options))
    } catch (error) {
      if (error instanceof CancelError) {
        console.info('item.cancel() was called')
      } else {
        console.error(error)
      }
      throw error
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
}

export default registerIPC
