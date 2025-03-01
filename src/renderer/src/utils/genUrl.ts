import { useSettingsStore } from '@renderer/stores/settings'
import { storeToRefs } from 'pinia'

const { settings } = storeToRefs(useSettingsStore())

function genRawFileUrl(file: FileRecord): string {
  return `https://github.com/${settings.value.ghOwner}/${settings.value.ghRepo}/releases/download/${settings.value.ghRelease}/${file.file_name_base62}`
}
function genThumbUrl(file: FileRecord): string {
  const rawFileUrl = genRawFileUrl(file)
  return file.content_type.startsWith('image')
    ? `https://karsten-zhou.gumlet.io/${rawFileUrl}`
    : file.content_type.startsWith('video')
      ? `https://ik.imagekit.io/eelwilzma/${rawFileUrl}/ik-video.mp4/ik-thumbnail.jpg`
      : ''
}

export { genRawFileUrl, genThumbUrl }
