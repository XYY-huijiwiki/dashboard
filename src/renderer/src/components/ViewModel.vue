<template>
  <model-viewer
    ref="modelViewer"
    :src="modelUrl"
    camera-controls
    shadow-intensity="1"
    autoplay
    :animation-name="animation"
    class="w-full grow"
    :poster="posterUrl"
  >
    <!-- eslint-disable-next-line vue/no-deprecated-slot-attribute -->
    <div slot="progress-bar"></div>
  </model-viewer>
  <n-divider v-if="animations.length > 0" />
  <div v-if="animations.length > 0" class="w-full">
    <n-radio-group v-model:value="animation">
      <n-space>
        <n-radio v-for="item in animations" :key="item" :value="item">
          {{ item }}
        </n-radio>
      </n-space>
    </n-radio-group>
  </div>
</template>

<script setup lang="ts">
import '@google/model-viewer'
import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import type { ModelViewerElement } from '@google/model-viewer'

const modelViewer: Ref<ModelViewerElement | null> = ref(null)
const animation: Ref<string> = ref('')
const animations: Ref<string[]> = ref([])

defineProps({
  modelUrl: {
    type: String,
    required: true,
  },
  posterUrl: {
    type: String,
    required: true,
  },
})

// watch modelViewer load
watch(
  modelViewer,
  () => {
    modelViewer.value?.addEventListener('load', () => {
      animations.value = modelViewer.value?.availableAnimations || []
      animation.value = modelViewer.value?.availableAnimations[0] || ''
    })
  },
  { once: true },
)
</script>

<style scoped></style>
