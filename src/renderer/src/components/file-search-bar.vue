<template>
  <Teleport to="#mini-dashboard-title-bar">
    <n-input-group class="flex-1">
      <n-input
        ref="searchBarEle"
        v-model:value="searchText"
        round
        clearable
        @keydown.enter="doSearch"
      >
        <template #prefix>
          <n-button circle quaternary size="tiny" @click="cancelSearch">
            <template #icon>
              <n-icon :size="20">
                <arrow-left20-regular v-if="searchText" />
                <search20-regular v-else />
              </n-icon>
            </template>
          </n-button>
        </template>
      </n-input>
      <n-button round secondary @click="doSearch">
        {{ t('github-files.btn-search') }}
      </n-button>
    </n-input-group>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search20Regular, ArrowLeft20Regular } from '@vicons/fluent'

const { t } = useI18n()
const emit = defineEmits(['search'])
const searchBarEle = ref()
const searchText = defineModel<string>('searchText')

function cancelSearch() {
  searchText.value = ``
  emit('search')
  // cancel focus on search bar
  searchBarEle.value.blur()
}

function doSearch() {
  emit('search')
}
</script>

<style scoped></style>
