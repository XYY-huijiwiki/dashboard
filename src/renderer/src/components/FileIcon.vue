<template>
  <img
    :src="src"
    :alt="fileType || 'file'"
    :width="size || 24"
    :height="size || 24"
    :class="[is.web ? `!inline-block` : `inline-block`, `align-text-bottom`]"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { is } from '@renderer/utils'

const { fileType } = defineProps<{
  fileType?: string | null
  size?: number
}>()

const iconPack = import.meta.glob('../assets/icons/*.ico', {
  as: 'url',
  eager: true
})

const src = computed(() => {
  const iconName = getIconName(fileType)
  let result = iconPack[`../assets/icons/${iconName}.ico`]
  if (is.dev && is.web) {
    const newOrigin = new URL(import.meta.url).origin
    result = new URL(result, newOrigin).href
  }
  return result
})

function getIconName(type: string | undefined | null): string {
  if (
    [
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
    ].includes(type || '')
  )
    return 'word'
  if (
    [
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
    ].includes(type || '')
  )
    return 'excel'
  if (
    [
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation' // .pptx
    ].includes(type || '')
  )
    return 'powerpoint'
  if (type === 'application/pdf') return 'doc'
  if (['application/zip', 'application/x-zip-compressed'].includes(type || '')) return 'zip'
  if (type?.startsWith('model')) return 'model'
  if (type?.startsWith('image')) return 'image'
  if (type?.startsWith('audio')) return 'audio'
  if (type?.startsWith('video')) return 'video'
  if (type?.startsWith('text')) return 'text'
  return 'default'
}
</script>
