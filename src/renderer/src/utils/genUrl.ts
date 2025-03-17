import { useSettingsStore } from '@renderer/stores/settings'
import { storeToRefs } from 'pinia'

const { settings } = storeToRefs(useSettingsStore())

function genRawFileUrl(file: FileRecord): string {
  return `https://github.com/${settings.value.ghOwner}/${settings.value.ghRepo}/releases/download/${settings.value.ghFileRelease}/${file.file_name_base62}`
}
function genThumbUrl(file: FileRecord): string {
  const hasThumb = file.content_type.startsWith('image') || file.content_type.startsWith('video')
  return hasThumb
    ? `https://karsten-zhou.gumlet.io/https://github.com/${settings.value.ghOwner}/${settings.value.ghRepo}/releases/download/${settings.value.ghThumbRelease}/${file.file_name_base62}`
    : ''
}

export { genRawFileUrl, genThumbUrl }
