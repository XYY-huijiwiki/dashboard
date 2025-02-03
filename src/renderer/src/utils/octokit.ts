import { Octokit } from 'octokit'
import { useSettingsStore } from '@renderer/stores/settings'
import base62 from './base62'
import { i18n } from '@renderer/main'

const { t } = i18n.global

const store = useSettingsStore()

const octokit = new Octokit({
  auth: store.settings.ghToken
})

const owner = store.settings.ghOwner
const repo = store.settings.ghRepo
const release_id = store.settings.rootReleaseId
const headers = { 'X-GitHub-Api-Version': '2022-11-28' }

// general GitHub API
async function ghApi(route: string, params?: object) {
  const response = await octokit.request(route, {
    headers: { 'X-GitHub-Api-Version': '2022-11-28' },
    ...params
  })
  if (response.status !== 200) {
    window.$notification.error({
      title: t('general.error'),
      content: `GitHub API error: ${response.status}\n${response.data.message}`,
      meta: new Date().toLocaleString()
    })
  }
  return response
}

// aceess verification
async function ghVerify() {
  return (
    await octokit.request('GET /repos/{owner}/{repo}', {
      headers,
      owner,
      repo
    })
  ).data
}

// new release
async function ghNewRelease(tag: string, body: string) {
  return (
    await octokit.request(`POST /repos/{owner}/{repo}/releases`, {
      owner,
      repo,
      tag_name: base62.encode(tag),
      body,
      headers
    })
  ).data
}

// update release
async function ghUpdateRelease(body: string) {
  return (
    await octokit.request(`PATCH /repos/{owner}/{repo}/releases/{release_id}`, {
      owner,
      repo,
      release_id,
      body,
      headers
    })
  ).data
}

// get release
async function ghGetRelease(tag: string) {
  const encodedTag = base62.encode(tag)
  return (
    await octokit.request(`GET /repos/{owner}/{repo}/releases/tags/{tag}`, {
      owner,
      repo,
      headers,
      tag: encodedTag
    })
  ).data
}

// get assets
async function ghGetAssets(per_page?: number, page?: number) {
  return (
    await octokit.request(`GET /repos/{owner}/{repo}/releases/{release_id}/assets`, {
      owner,
      repo,
      release_id,
      headers,
      per_page,
      page
    })
  ).data
}

// update asset
async function ghUpdateAsset(assetId: number, name: string) {
  return (
    await octokit.request(`PATCH /repos/{owner}/{repo}/releases/assets/{asset_id}`, {
      owner,
      repo,
      asset_id: assetId,
      name,
      headers
    })
  ).data
}

export default ghApi
export { ghNewRelease, ghGetRelease, ghUpdateRelease, ghGetAssets, ghUpdateAsset, ghVerify }
