import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { type Ref } from 'vue'

interface explorerState {
  sorterKey: SorterKey
  sorterOrder: SorterOrder
  viewMode: ViewMode
}

export const useExplorerStateStore = defineStore('explorerState', () => {
  // define default store
  const defaultExplorerState: explorerState = {
    sorterKey: 'updated_at',
    sorterOrder: 'descend',
    viewMode: 'list'
  }
  // init store from localStorage or use default
  const explorerState: Ref<explorerState> = useLocalStorage('explorerState', defaultExplorerState, {
    mergeDefaults: true
  })

  return { explorerState }
})
