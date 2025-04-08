<template>
  <n-scrollbar>
    <n-flex vertical>
      <n-steps :current="currentStep" class="m-4">
        <n-step :title="t('miui-themes.label-fill-in')" />
        <n-step :title="t('miui-themes.label-preview')" />
        <n-step :title="t('miui-themes.label-submit')" />
      </n-steps>
      <!-- Step 1 -->
      <n-flex v-if="currentStep === 1" vertical>
        <n-form>
          <n-form-item
            :label="t('miui-themes.step2-label-theme-link')"
            show-require-mark
          >
            <n-input-group>
              <n-input v-model:value="themeInput.link" :disabled="loading" />
              <n-button
                :disabled="loading || !themeInput.link"
                @click="getDownloadLink"
              >
                {{ t('miui-themes.step2-btn-get-download-link') }}
              </n-button>
            </n-input-group>
          </n-form-item>
          <n-form-item
            :label="t('miui-themes.step2-label-download-link')"
            show-require-mark
          >
            <n-input
              v-model:value="themeInput.downloadLink"
              :disabled="loading"
            />
          </n-form-item>
          <n-form-item :label="t('miui-themes.step2-label-release-date')">
            <n-date-picker
              v-model:value="themeInput.date"
              type="date"
              :disabled="loading"
            />
          </n-form-item>
          <n-form-item :label="t('miui-themes.step2-label-date-screenshot')">
            <n-flex :align="`center`">
              <n-button :disabled="loading" @click="openFile">
                {{ t('miui-themes.step2-btn-upload-date-screenshot') }}
              </n-button>
              <div>
                {{
                  themeInput.dateImg
                    ? t('miui-themes.step2-selected-file', [
                        themeInput.dateImg.name,
                      ])
                    : t('miui-themes.step2-no-file-selected')
                }}
              </div>
            </n-flex>
          </n-form-item>
          <n-form-item :label="t('miui-themes.step2-label-trivia')">
            <n-input v-model:value="themeInput.trivia" :disabled="loading" />
          </n-form-item>
        </n-form>
        <n-flex justify="end">
          <n-button
            type="primary"
            :loading="loading"
            :disabled="!themeInput.link || !themeInput.downloadLink"
            @click="clickNext"
          >
            {{ t('miui-themes.btn-next-step') }}
          </n-button>
        </n-flex>
      </n-flex>
      <!-- Step 2 -->
      <n-flex v-if="currentStep === 2 && result !== null" vertical>
        <n-flex>
          <code-block
            :code="JSON.stringify(result.themeJson, null, 2)"
            lang="json"
          ></code-block>
          <n-flex
            v-for="img in [
              result.files.dateImg,
              result.files.squareImg,
              ...(result?.files.previews || []),
            ].filter(Boolean)"
            :key="img?.name"
            vertical
          >
            <n-image
              class="w-32 h-32 rounded bg-gray-200"
              object-fit="contain"
              :src="img && createObjectURL(img)"
            ></n-image>
            <n-text class="w-32">{{ img && img.name }}</n-text>
          </n-flex>
        </n-flex>
        <n-flex justify="end">
          <n-button @click="currentStep--">
            {{ t('miui-themes.btn-prev-step') }}
          </n-button>
          <n-button type="primary" @click="(currentStep++, submitInfo())">
            {{ t('miui-themes.btn-next-step') }}
          </n-button>
        </n-flex>
      </n-flex>
      <!-- Step 3 -->
      <n-flex v-if="currentStep === 3" vertical>
        <n-progress
          type="circle"
          :percentage="Math.min(Math.ceil(submitPercentage), 100)"
          :status="submitStatus"
          class="mx-auto"
        />
        <n-flex justify="end">
          <n-button @click="currentStep--">
            {{ t('miui-themes.btn-prev-step') }}
          </n-button>
        </n-flex>
      </n-flex>
    </n-flex>
  </n-scrollbar>
</template>

<script setup lang="ts">
// Third-party library imports
import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import dayjsUTC from 'dayjs/plugin/utc'
import jszip from 'jszip'
import { xml2json } from 'xml-js'
import { useFileDialog } from '@vueuse/core'
import { Octokit } from 'octokit'
import { errNotify, sleep } from '@renderer/utils'
import { storeToRefs } from 'pinia'
import { fileToBase64 } from 'file64'
import jsSHA from 'jssha'
import ky from 'ky'

// Local imports
import { getMTZFile, cleanURL } from '@renderer/utils/miui-themes'
import type { Result } from '@renderer/utils/miui-themes'
import { useSettingsStore } from '@renderer/stores/settings'
import { editPage, uploadFile } from '@renderer/utils/mwApi'

// configure i18n
const { t } = useI18n()
dayjs.extend(dayjsUTC)

const currentStep = ref(1)
const result: Ref<Result | null> = ref(null)
const loading = ref(false)
const submitPercentage = ref(0)
const submitStatus = ref('default')
const createObjectURL = window.URL.createObjectURL
const { settings } = storeToRefs(useSettingsStore())

watch(currentStep, () => {
  // scroll to top smoothly with offset
  const element = document.getElementById('mini-dashboard')
  if (element) {
    const offset = 100
    const elementPosition = element.getBoundingClientRect().top + window.scrollY
    const offsetPosition = elementPosition - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    })
  }
})

// Step 1 logic
type ThemeInput = {
  downloadLink: string | undefined
  link: string | undefined
  date: number | undefined
  dateImg: File | undefined
  trivia: string | undefined
}
const themeInput: Ref<ThemeInput> = ref({
  downloadLink: undefined,
  link: undefined,
  date: undefined,
  dateImg: undefined,
  trivia: undefined,
})
const { open: openFile, onChange: onChangeFile } = useFileDialog({
  accept: 'image/*',
})
onChangeFile((files) => {
  if (files?.length !== 1) return
  themeInput.value.dateImg = files[0]
})
function getDownloadLink() {
  const packId = new URL(
    cleanURL(themeInput.value.link || ''),
  ).searchParams.get('packId')
  window.open(
    `https://thm.market.xiaomi.com/thm/download/v2/${packId}?miuiUIVersion=100`,
  )
}

async function clickNext() {
  try {
    loading.value = true

    // Process input text
    async function getTitleAndSquareImgLink(link: string): Promise<{
      title: string
      squareImgLink: string
    }> {
      const packID = new URL(link).searchParams.get('packId')
      if (!packID) {
        throw new Error('主题链接格式错误')
      }
      const res = (await (
        await ky.get(
          `${corsProxy}https://zhuti.xiaomi.com/thm/share/picture/${packID}`,
        )
      ).json()) as {
        downloadUrl: string
        name: string
      }
      return {
        title: res.name,
        squareImgLink: res.downloadUrl,
      }
    }
    const corsProxy = 'https://cors-proxy.24218079.xyz/'
    const link = cleanURL(themeInput.value.link || '')
    const url = new URL(link)
    url.searchParams.delete('miref')
    const 主题链接 = url.href
    const { title, squareImgLink } = await getTitleAndSquareImgLink(link)
    const 主题名称 = title
    const squareImg = new File(
      [await (await fetch(corsProxy + squareImgLink)).blob()],
      `小米主题 ${title}.png`,
    )
    const 你知道咩 = themeInput.value.trivia || ''

    // Process .mtz file
    const downloadLink = cleanURL(themeInput.value.downloadLink || '')
    const mtz = await getMTZFile(downloadLink, title)
    const zipObj = await jszip.loadAsync(mtz)
    const xmlFile = zipObj.file('description.xml')
    if (!xmlFile) throw new Error('description.xml不存在')
    const 发布日期 = themeInput.value.date
      ? dayjs(themeInput.value.date).format('YYYY-MM-DD')
      : dayjs(xmlFile.date).utc().format('YYYY-MM-DD')
    const description_xml = await xmlFile.async('string')
    const description_json = JSON.parse(
      xml2json(description_xml, { compact: true }),
    )
    const 主题作者 = description_json.theme.designer._cdata.trim()
    const 主题介绍 = description_json.theme.description._cdata
      .trim()
      .replace(/[\r\n]{1,2}/g, '<br/>')
    const allFiles = Object.keys(zipObj.files)
    let imgs_list = allFiles.filter((file) => file.startsWith('preview/'))
    imgs_list.forEach((element, index) => {
      imgs_list[index] = element.slice(8)
    })
    imgs_list = imgs_list.filter((img) => img !== '')
    const 主题预览 = imgs_list.sort()
    const previews = await Promise.all(
      imgs_list.map(async (img) => {
        const blob = await zipObj.file(`preview/${img}`)?.async('blob')
        return blob
          ? new File([blob], `小米主题 ${主题名称} ${img}`)
          : undefined
      }),
    ).then((files) => files.filter((file) => file !== undefined))

    // Process date image
    let dateImg: File | undefined
    if (themeInput.value.date) {
      if (!themeInput.value.dateImg) {
        throw new Error('手动输入日期时，需要提供日期截图')
      }
      dateImg = new File(
        [themeInput.value.dateImg],
        `小米主题 ${主题名称} 发布日期截图.jpg`,
      )
    }

    // Result
    result.value = {
      themeJson: {
        _hjschema: '小米主题',
        主题名称,
        发布日期,
        主题作者,
        主题链接,
        主题介绍,
        主题预览,
        你知道咩,
      },
      files: {
        mtz,
        dateImg,
        squareImg,
        previews,
      },
    }

    currentStep.value++
  } catch (error) {
    errNotify(t('general.error'), error)
  } finally {
    loading.value = false
  }
}

// Step 3 logic
async function submitInfo() {
  try {
    function err() {
      submitStatus.value = 'error'
      loading.value = false
      throw new Error('提交失败')
    }
    function success() {
      submitPercentage.value += progressChunk
    }

    const themeJson = result.value!.themeJson
    const files = [
      result.value!.files.dateImg,
      result.value!.files.squareImg,
      ...result.value!.files.previews,
    ].filter(Boolean)
    const progressChunk = 100 / (files.length + 4)
    for (let index = 0; index < files.length; index++) {
      const element = files[index]
      if (await uploadFile(element as File, `{{合理使用}}`)) {
        success()
      } else {
        err()
      }
    }

    const editResponse1 = await editPage({
      title: `Data:${themeJson.主题名称}.json`,
      text: JSON.stringify(themeJson),
    })
    if (editResponse1.ok) {
      success()
    } else {
      console.log(editResponse1)
      err()
    }

    const editResponse2 = await editPage({
      title: `${themeJson.主题名称}`,
      text: `{{小米主题}}`,
    })
    if (editResponse2.ok) {
      success()
    } else {
      console.log(editResponse2)
      err()
    }

    const token = settings.value.ghToken
    const owner = 'XYY-huijiwiki'
    const repo = 'MIUI-theme'
    const path = `mtz/${themeJson.发布日期} ${themeJson.主题名称}.mtz`
    const message = `upload ${themeJson.发布日期} ${themeJson.主题名称}.mtz`
    const content = (await fileToBase64(result.value!.files.mtz)).split(',')[1]
    const shaObj = new jsSHA('SHA-1', 'B64')
    shaObj.update(content)
    const sha = shaObj.getHash('HEX')
    success()

    const octokit = new Octokit({ auth: token })
    const octokitRes = await octokit.request(
      'PUT /repos/{owner}/{repo}/contents/{path}',
      {
        owner,
        repo,
        path,
        sha,
        message,
        content,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
    )
    if (octokitRes.status === 201) {
      success()
    } else {
      err()
    }

    await sleep(500)
    submitStatus.value = 'success'
  } catch (error) {
    window.$notification.error({
      title: t('general.error'),
      content: `${error}`,
    })
    submitStatus.value = 'error'
    loading.value = false
  }
}
</script>

<style scoped></style>
