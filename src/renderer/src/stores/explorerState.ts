import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { type Ref } from 'vue'

interface explorerState {
  sorterKey: SorterKey
  sorterOrder: SorterOrder
  viewMode: ViewMode
  filters: {
    type: FilterType[]
    status: FilterStatus[]
  }
}

export const useExplorerStateStore = defineStore('explorerState', () => {
  // define default store
  const defaultExplorerState: explorerState = {
    sorterKey: 'updated_at',
    sorterOrder: 'descend',
    viewMode: 'list',
    filters: {
      type: [],
      status: []
    }
  }
  // init store from localStorage or use default
  const explorerState: Ref<explorerState> = useLocalStorage(
    '[Ov23liXwSttWUEILSEqe] explorerState',
    defaultExplorerState,
    {
      mergeDefaults: true
    }
  )
  return { explorerState }
})
