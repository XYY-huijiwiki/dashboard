<template>
  <model-viewer
    autoplay
    auto-rotate
    :src="src"
    camera-controls
    touch-action="pan-y"
    style="width: 100%; height: 100%"
    :poster="poster"
  ></model-viewer>
</template>

<script setup lang="ts">
import '@google/model-viewer'

defineProps<{ src: string; poster?: string }>()
</script>

<style scoped></style>
