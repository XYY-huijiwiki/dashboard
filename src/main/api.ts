import { ipcMain, dialog, shell } from 'electron'
import path from 'path'
import fs from 'fs'
import mime from 'mime-types'
import base62 from './utils/base62.js'
import ghLogin from './utils/ghLogin.js'

function registerIPC() {
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

  ipcMain.handle('open-external', (_, url: string) => {
    shell.openExternal(url)
  })

  ipcMain.handle('gh-login', async () => {
    return ghLogin()
  })
}

export default registerIPC
