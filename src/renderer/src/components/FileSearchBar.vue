<template>
  <Teleport to="#title-bar">
    <n-input-group class="flex-1">
      <n-input
        ref="searchBarEle"
        v-model:value="searchText"
        round
        clearable
        @keydown.enter="doSearch"
      >
        <template #prefix>
          <!-- show search icon only if searched text is empty -->
          <n-icon v-if="!searchedText" :size="20">
            <search20-regular />
          </n-icon>
          <!-- show cancel icon only if searched text is not empty -->
          <n-button v-else circle quaternary size="tiny" @click="cancelSearch">
            <template #icon>
              <n-icon :size="20">
                <arrow-left20-regular v-if="searchText" />
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
const searchText = defineModel<string>('search-text', { required: true })
const searchedText = ref('')

function cancelSearch(): void {
  searchText.value = ``
  // do search only if non empty string have been searched
  if (searchedText.value !== '') emit('search')
  // clear searched text
  searchedText.value = ''
  // cancel focus on search bar
  searchBarEle.value.blur()
}

function doSearch(): void {
  searchedText.value = searchText.value
  emit('search')
}
</script>

<style scoped></style>
