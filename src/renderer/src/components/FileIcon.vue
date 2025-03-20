<template>
  <img
    :src="src"
    :alt="fileType || 'file'"
    :width="size || 24"
    :height="size || 24"
    class="inline-block align-text-bottom"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { fileType } = defineProps<{
  fileType?: string | null
  size?: number
}>()

const iconPack = import.meta.glob('../assets/icons/*.ico', {
  as: 'url',
  eager: true
})

console.log('iconPack', iconPack)

const src = computed(() => {
  const iconName = getIconName(fileType)
  return iconPack[`../assets/icons/${iconName}.ico`]
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
  if (type === 'application/zip') return 'zip'
  if (type?.startsWith('model')) return 'model'
  if (type?.startsWith('image')) return 'image'
  if (type?.startsWith('audio')) return 'audio'
  if (type?.startsWith('video')) return 'video'
  if (type?.startsWith('text')) return 'text'
  return 'default'
}
</script>
