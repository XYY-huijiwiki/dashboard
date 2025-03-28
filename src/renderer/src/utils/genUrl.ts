import { storeToRefs } from 'pinia'

import { is } from '@renderer/utils'
import { useSettingsStore } from '@renderer/stores/settings'

const { settings } = storeToRefs(useSettingsStore())

function genRawFileUrl(file: FileRecord): string {
  let corsProxy = ''
  if (
    (is.dev || is.web) &&
    (file.content_type.startsWith('model') ||
      file.content_type.startsWith('application/x-shockwave-flash'))
  ) {
    corsProxy = 'https://cors-proxy.24218079.xyz/'
  }
  return `${corsProxy}https://github.com/${settings.value.ghOwner}/${settings.value.ghRepo}/releases/download/${settings.value.ghFileRelease}/${file.file_name_base62}`
}
function genThumbUrl(file: FileRecord): string {
  const hasThumb =
    file.content_type.startsWith('image') ||
    file.content_type.startsWith('video') ||
    file.content_type.startsWith('model')
  return hasThumb
    ? `https://karsten-zhou.gumlet.io/https://github.com/${settings.value.ghOwner}/${settings.value.ghRepo}/releases/download/${settings.value.ghThumbRelease}/${file.file_name_base62}`
    : ''
}

export { genRawFileUrl, genThumbUrl }
