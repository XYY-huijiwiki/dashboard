import { BrowserWindow, session } from 'electron'
import { is } from '@electron-toolkit/utils'

async function ghLogin(): Promise<string> {
  return new Promise((resolve, reject) => {
    const authWindow = new BrowserWindow({
      width: 480,
      height: 640,
      webPreferences: { sandbox: false, devTools: is.dev ? true : false }
    })

    authWindow.removeMenu()

    const serverlessURL = 'https://dashboard-login.24218079.xyz/'
    const url = new URL(serverlessURL + 'login')
    url.searchParams.set('redirect_uri', 'http://localhost/')
    url.searchParams.set('scope', 'public_repo')

    authWindow.loadURL(url.toString())

    const filter = { urls: ['http://localhost/*'] }
    session.defaultSession.webRequest.onBeforeRequest(filter, async (details, callback) => {
      const url = new URL(details.url)
      if (url.searchParams.has('access_token')) {
        const code = url.searchParams.get('access_token')
        callback({ cancel: true })
        authWindow.close()
        resolve(code || '')
      } else {
        callback({ cancel: false })
      }
    })

    authWindow.on('closed', () => {
      reject(new Error('Window was closed by user'))
    })
  })
}

export default ghLogin
