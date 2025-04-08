<template>
  <n-flex vertical class="h-full">
    <n-flex :warp="false" justify="end">
      <n-button
        type="info"
        :disabled="loading"
        size="small"
        @click="showPageListModel = true"
      >
        {{ t('find-and-replace.btn-which-pages-need-editing') }}
      </n-button>
      <n-button
        type="info"
        :disabled="loading"
        size="small"
        @click="showFindAndReplaceModel = true"
      >
        {{ t('find-and-replace.btn-specify-find-and-replace-terms') }}
      </n-button>
    </n-flex>
    <n-spin :show="loading" class="flex-1" content-class="h-full">
      <n-empty v-show="errorMsg" class="h-full justify-center">
        {{ errorMsg }}
      </n-empty>
      <div v-show="!errorMsg" ref="monacoEditorEle" class="h-full"></div>
    </n-spin>
    <n-flex :wrap="false">
      <div class="grow-0">
        <n-input-group>
          <n-button
            :disabled="toEditList.length === 0 || currentPageIndex === 0"
            size="small"
            @click="currentPageIndex--"
          >
            <template #icon>
              <icon icon="fluent:chevron-left-16-regular" />
            </template>
          </n-button>
          <n-input-group-label size="small">
            {{
              toEditList[currentPageIndex] ||
              t('find-and-replace.msg-no-page-needs-editing')
            }}
          </n-input-group-label>
          <n-button
            :disabled="
              toEditList.length === 0 ||
              currentPageIndex === toEditList.length - 1
            "
            size="small"
            @click="currentPageIndex++"
          >
            <template #icon>
              <icon icon="fluent:chevron-right-16-regular" />
            </template>
          </n-button>
        </n-input-group>
      </div>
      <div class="flex-1">
        <n-input-group>
          <n-input
            v-model:value="summary"
            :placeholder="t(`find-and-replace.placeholder-edit-summary`)"
            :disabled="loading"
            size="small"
          />
          <n-button
            type="primary"
            :loading="loading"
            size="small"
            :disabled="errorMsg !== ''"
            @click="saveChanges"
          >
            {{ t(`find-and-replace.btn-save-changes`) }}
          </n-button>
        </n-input-group>
      </div>
    </n-flex>
  </n-flex>

  <!-- page list model -->
  <n-modal
    v-model:show="showPageListModel"
    preset="dialog"
    :show-icon="false"
    :title="t('find-and-replace.title-which-pages-need-editing')"
    class="!w-2xl"
  >
    <template #default>
      <n-flex class="my-8" vertical>
        <n-input-group>
          <n-select
            v-model:value="selectPagesValue"
            :options="selectPagesOptions"
          />
          <n-button type="info" @click="search[selectPagesValue]">
            {{ t(`find-and-replace.btn-search`) }}
          </n-button>
        </n-input-group>
        <n-dynamic-tags v-model:value="toEditList" />
      </n-flex>
    </template>
    <template #action>
      <n-button type="primary" @click="showPageListModel = false">
        {{ t('general.btn-ok') }}
      </n-button>
    </template>
  </n-modal>

  <!-- find and replace terms model -->
  <n-modal
    v-model:show="showFindAndReplaceModel"
    preset="dialog"
    :show-icon="false"
    :title="t('find-and-replace.title-specify-find-and-replace-terms')"
    class="!w-2xl"
  >
    <template #default>
      <n-flex class="my-8" vertical>
        <n-dynamic-input
          v-model:value="regexList"
          show-sort-button
          @create="
            () => {
              return {
                isCheck: true,
                useRegex: false,
                search: '',
                replace: '',
              }
            }
          "
        >
          <template #default="{ value, index }">
            <n-flex :align="'center'" :wrap="false">
              <n-text class="text-nowrap"># {{ index + 1 }}</n-text>
              <n-checkbox v-model:checked="value.isCheck" size="small" />
              <n-input
                v-model:value="value.search"
                :placeholder="t('find-and-replace.placeholder-find')"
                size="small"
              >
                <template #suffix>
                  <n-tooltip>
                    <template #trigger>
                      <n-button
                        size="tiny"
                        :quaternary="!value.useRegex"
                        :secondary="value.useRegex"
                        :type="value.useRegex ? 'primary' : 'default'"
                        class="-mr-[6px]"
                        @click="() => (value.useRegex = !value.useRegex)"
                      >
                        <template #icon>
                          <icon icon="fluent:text-period-asterisk-20-regular" />
                        </template>
                      </n-button>
                    </template>
                    {{ t('find-and-replace.label-use-regular-expression') }}
                  </n-tooltip>
                </template>
              </n-input>
              <n-input
                v-model:value="value.replace"
                size="small"
                :placeholder="t('find-and-replace.placeholder-replace')"
              />
            </n-flex>
          </template>
        </n-dynamic-input>
      </n-flex>
    </template>
    <template #action>
      <n-button
        type="primary"
        @click="((showFindAndReplaceModel = false), applyRegex())"
      >
        {{ t('general.btn-ok') }}
      </n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import loader from '@monaco-editor/loader'
import { ref, type Ref, watch, onMounted } from 'vue'
import type { editor, Uri } from 'monaco-editor'
import { useI18n } from 'vue-i18n'
import type { SelectOption } from 'naive-ui'
import { shikiToMonaco } from '@shikijs/monaco'
import { createHighlighter } from 'shiki'
import { storeToRefs } from 'pinia'
import { usePreferredDark } from '@vueuse/core'
import { Icon } from '@iconify/vue'

import { getPage, editPage } from '@renderer/utils/mwApi'
import { errNotify } from '@renderer/utils'
import { useLocalesStore } from '@renderer/stores/locales'
import { xor } from 'lodash-es'

const { t } = useI18n()
const loading = ref(false)
const { langCode } = storeToRefs(useLocalesStore())
const summary: Ref<undefined | string> = ref()
const errorMsg: Ref<string> = ref('')

async function saveChanges() {
  if (!summary.value) {
    window.$dialog.error({
      title: 'summary-empty',
      content: 'summary-empty',
      positiveText: t('general.btn-confirm'),
      autoFocus: false,
    })
    return
  }

  loading.value = true

  try {
    const newCode = editorInstance.getModifiedEditor().getValue()
    const response = await editPage({
      title: toEditList.value[currentPageIndex.value],
      text: newCode,
      summary: summary.value,
    })
    if (!response.ok)
      errNotify(
        t('mediawiki.msg-page-edit-failed', [
          toEditList.value[currentPageIndex.value],
        ]),
        response.body,
      )
    else
      window.$message.success(
        t('mediawiki.msg-page-edited', [
          toEditList.value[currentPageIndex.value],
        ]),
      )
  } catch (e) {
    errNotify(t('general.error'), e)
  } finally {
    // remove page from list
    toEditList.value = xor(toEditList.value, [
      toEditList.value[currentPageIndex.value],
    ])
    // adjust current page num
    if (currentPageIndex.value > toEditList.value.length - 1) {
      currentPageIndex.value = toEditList.value.length - 1
    }
    // stop loading
    loading.value = false
  }
}

// #region list pages
const showPageListModel: Ref<boolean> = ref(false)
const toEditList: Ref<string[]> = ref([])
watch(
  toEditList,
  (val) => {
    if (val.length === 0) {
      errorMsg.value = t('find-and-replace.msg-no-page-needs-editing')
    }
  },
  { immediate: true },
)
const currentPageIndex: Ref<number> = ref(0)
const selectPagesValue: Ref<'xlsx' | 'txt'> = ref('txt')
const selectPagesOptions: Ref<SelectOption[]> = ref([
  {
    label: t('find-and-replace.label-select-pages-by-txt'),
    value: 'txt',
  },
  {
    label: t('find-and-replace.label-select-pages-by-xlsx'),
    value: 'xlsx',
    disabled: true,
  },
  {
    label: t('find-and-replace.label-select-pages-by-category'),
    value: 'category',
    disabled: true,
  },
])
const search = {
  txt: () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.txt'
    input.onchange = async () => {
      if (!input.files) return
      let txtString = await input.files[0].text()
      if (!txtString) return
      // normalise line breaks
      txtString = txtString.replace(/\r\n/g, '\n')
      // split by line breaks
      let list = txtString.split('\n')
      // trim
      list = list.map((item) => item.trim())
      // remove empty
      list = list.filter((item) => item !== '')
      // remove duplicate
      list = [...new Set(list)]
      toEditList.value = list
    }
    input.click()
  },
}
// #endregion

// #region find and replace terms
const showFindAndReplaceModel: Ref<boolean> = ref(false)
const regexList: Ref<
  {
    isCheck: boolean
    useRegex: boolean
    search: string
    replace: string
  }[]
> = ref([])
function applyRegex() {
  if (toEditList.value.length === 0) return
  try {
    const newCode = getNewCode(orgCode.value)
    editorInstance.setModel({
      original: createMonacoModel(orgCode.value, 'wikitext'),
      modified: createMonacoModel(newCode, 'wikitext'),
    })
    if (newCode === orgCode.value) {
      window.$message.info(t('find-and-replace.msg-no-change'))
    }
    errorMsg.value = ''
  } catch (error) {
    errNotify(t('general.error'), error)
  }
}
// #endregion

// #region monaco editor
const monacoEditorEle: Ref<HTMLElement | null> = ref(null)
let editorInstance: editor.IStandaloneDiffEditor
let setMonacoTheme: (theme: string) => void
let createMonacoModel: (
  value: string,
  language?: string,
  uri?: Uri,
) => editor.ITextModel
let resolveWaitMonaco: () => void
const waitMonaco = new Promise<void>((resolve) => {
  resolveWaitMonaco = resolve
})
onMounted(async () => {
  if (!monacoEditorEle.value) throw new Error('monacoEditor is null')

  // #region get language code for monaco
  function getLangCode(input: string): string {
    const supported = new Set([
      'en',
      'de',
      'es',
      'fr',
      'it',
      'ja',
      'ko',
      'ru',
      'zh-cn',
      'zh-tw',
    ])

    try {
      let locale: Intl.Locale
      try {
        locale = new Intl.Locale(input)
      } catch {
        // Handle invalid locale format
        return 'en'
      }

      // Attempt to maximize the locale to get the most specific information
      locale = locale.maximize()

      const baseLang = locale.language.toLowerCase()

      // Handle non-Chinese supported languages
      if (supported.has(baseLang)) {
        return baseLang
      }

      // Handle Chinese variants
      if (baseLang === 'zh') {
        const region = (locale.region || '').toUpperCase()
        const script = (locale.script || '').toLowerCase()

        // Region-based matching
        if (['CN', 'SG'].includes(region)) return 'zh-cn'
        if (['TW', 'HK', 'MO'].includes(region)) return 'zh-tw'

        // Script-based matching
        if (script === 'hans') return 'zh-cn'
        if (script === 'hant') return 'zh-tw'

        // Default for Chinese (Simplified Chinese)
        return 'zh-cn'
      }
    } catch (e) {
      // Fall through to default return
    }

    return 'en'
  }
  //  #endregion

  const highlighter = await createHighlighter({
    themes: ['dark-plus', 'light-plus'],
    langs: ['wikitext', 'json', 'html', 'javascript', 'css', 'lua'],
  })

  loader.config({
    'vs/nls': {
      availableLanguages: {
        '*': getLangCode(langCode.value),
      },
    },
  })

  const monacoInstance = await loader.init()
  monacoInstance.languages.register({ id: 'wikitext' })
  shikiToMonaco(highlighter, monacoInstance)

  // Initialize diff editor
  const {
    editor: { setTheme, createDiffEditor, createModel },
  } = monacoInstance
  editorInstance = createDiffEditor(monacoEditorEle.value, {
    theme: isDark.value ? 'dark-plus' : 'light-plus',
    automaticLayout: true,
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    /*
     * TODO: see if any updates in this issue: https://github.com/microsoft/monaco-editor/discussions/4454#discussioncomment-11111244
     * somehow `useInlineViewWhenSpaceIsLimited` must be set to false
     * to force the left side editor wrap words
     */
    useInlineViewWhenSpaceIsLimited: false,
    unicodeHighlight: {
      ambiguousCharacters: false, // avoid highlight Chinese punctuation
    },
    hideUnchangedRegions: {
      enabled: true,
    },
  })
  setMonacoTheme = setTheme
  createMonacoModel = createModel

  resolveWaitMonaco()
})
// Theme Management
const isDark = usePreferredDark()
watch(isDark, async () => {
  await waitMonaco
  setMonacoTheme(isDark.value ? 'dark-plus' : 'light-plus')
})
// display the diff editor
const orgCode = ref('')
watch(
  () => toEditList.value[currentPageIndex.value],
  async () => {
    loading.value = true
    try {
      await waitMonaco
      const pageName = toEditList.value[currentPageIndex.value]
      if (!pageName) {
        errorMsg.value = t('find-and-replace.msg-no-page-needs-editing')
        return
      }
      const pageContent = await getPage(pageName)
      if (!pageContent) {
        errorMsg.value = t('find-and-replace.msg-page-not-found')
        return
      }
      orgCode.value = pageContent.content
      const newCode = getNewCode(orgCode.value)
      if (newCode === orgCode.value) {
        window.$message.info(t('find-and-replace.msg-no-change'))
      }
      editorInstance.setModel({
        original: createMonacoModel(orgCode.value, 'wikitext'),
        modified: createMonacoModel(newCode, 'wikitext'),
      })
      errorMsg.value = ''
    } catch (error) {
      console.error(error)
      errNotify(t('general.error'), error)
    } finally {
      loading.value = false
    }
  },
)
function getNewCode(orgCode: string): string {
  let newCode = orgCode
  for (let index = 0; index < regexList.value.length; index++) {
    const element = regexList.value[index]
    if (!element.isCheck || !element.search) continue
    // check regex valid and replace
    try {
      if (element.useRegex) {
        newCode = newCode.replace(
          new RegExp(element.search, 'g'),
          // JSON.parse to process special characters like \n
          JSON.parse('"' + element.replace.replace(/"/g, '\\"') + '"'),
        )
      } else {
        // escape regex
        newCode = newCode.replaceAll(element.search, element.replace)
      }
    } catch (error) {
      errNotify(t('general.error'), error)
    }
  }
  return newCode
}
// #endregion
</script>

<style scoped></style>
