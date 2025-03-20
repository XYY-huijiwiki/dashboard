import isElectron from 'is-electron'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'

import { dayjsLocales } from '@renderer/stores/locales'

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const is = {
  dev: import.meta.env.DEV,
  web: !isElectron(),
  win: isElectron() && window.electron.process.platform === 'win32',
  mac: isElectron() && window.electron.process.platform === 'darwin',
  linux: isElectron() && window.electron.process.platform === 'linux'
}

function errNotify(title: string, e: Error) {
  dayjs.extend(localizedFormat).locale(dayjsLocales.value)
  console.dir(e)
  window.$notification.error({
    title: title,
    content: `${e}`,
    meta: dayjs().format('lll')
  })
}

export { sleep, is, errNotify }
