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
  linux: isElectron() && window.electron.process.platform === 'linux',
}

function errNotify(title: string, error: unknown) {
  dayjs.extend(localizedFormat).locale(dayjsLocales.value)
  console.dir(error)
  window.$notification.error({
    title: title,
    content: error instanceof Error ? error.message : String(error),
    meta: dayjs().format('lll'),
  })
}

export { sleep, is, errNotify }
