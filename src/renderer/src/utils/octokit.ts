import { Octokit } from "octokit";
import { useSettingsStore } from "@renderer/stores/settings";
import base62 from "./base62";
import { i18n } from "@renderer/main";

const { t } = i18n.global;

const store = useSettingsStore();

const octokit = new Octokit({
  auth: store.settings.ghToken,
});

const GH_OWNER = import.meta.env.VITE_GH_OWNER;
const GH_REPO = import.meta.env.VITE_GH_REPO;
const GH_FILE_RELEASE_ID = import.meta.env.VITE_GH_FILE_RELEASE_ID;
const GH_THUMB_RELEASE_ID = import.meta.env.VITE_GH_THUMB_RELEASE_ID;
const headers = { "X-GitHub-Api-Version": "2022-11-28" };

// general GitHub API
async function ghApi(route: string, params?: object) {
  const response = await octokit.request(route, {
    headers: { "X-GitHub-Api-Version": "2022-11-28" },
    ...params,
  });
  if (response.status !== 200) {
    window.$notification.error({
      title: t("general.error"),
      content: `GitHub API error: ${response.status}\n${response.data.message}`,
      meta: new Date().toLocaleString(),
    });
  }
  return response;
}

// aceess verification
async function ghVerify() {
  return (
    await octokit.request("GET /repos/{owner}/{repo}", {
      headers,
      owner: GH_OWNER,
      repo: GH_REPO,
    })
  ).data;
}

// new release
async function ghNewRelease(tag: string, body: string) {
  return (
    await octokit.request(`POST /repos/{owner}/{repo}/releases`, {
      owner: GH_OWNER,
      repo: GH_REPO,
      tag_name: base62.encode(tag),
      body,
      headers,
    })
  ).data;
}

// update release
async function ghUpdateRelease(
  body: string,
  release: "files" | "thumbs" = "files",
) {
  return (
    await octokit.request(`PATCH /repos/{owner}/{repo}/releases/{release_id}`, {
      owner: GH_OWNER,
      repo: GH_REPO,
      release_id:
        release === "files"
          ? parseInt(GH_FILE_RELEASE_ID)
          : parseInt(GH_THUMB_RELEASE_ID),
      body,
      headers,
    })
  ).data;
}

// get release
async function ghGetRelease(tag: string) {
  const encodedTag = base62.encode(tag);
  return (
    await octokit.request(`GET /repos/{owner}/{repo}/releases/tags/{tag}`, {
      owner: GH_OWNER,
      repo: GH_REPO,
      headers,
      tag: encodedTag,
    })
  ).data;
}

// get assets
async function ghGetAssets(
  per_page?: number,
  page?: number,
  release: "files" | "thumbs" = "files",
) {
  return (
    await octokit.request(
      `GET /repos/{owner}/{repo}/releases/{release_id}/assets`,
      {
        owner: GH_OWNER,
        repo: GH_REPO,
        release_id:
          release === "files"
            ? parseInt(GH_FILE_RELEASE_ID)
            : parseInt(GH_THUMB_RELEASE_ID),
        headers,
        per_page,
        page,
      },
    )
  ).data;
}

// get asset
async function ghGetAsset(assetId: number) {
  return (
    await octokit.request(
      `GET /repos/{owner}/{repo}/releases/assets/{asset_id}`,
      {
        owner: GH_OWNER,
        repo: GH_REPO,
        asset_id: assetId,
        headers,
      },
    )
  ).data;
}

// update asset
async function ghUpdateAsset(assetId: number, name: string) {
  return (
    await octokit.request(
      `PATCH /repos/{owner}/{repo}/releases/assets/{asset_id}`,
      {
        owner: GH_OWNER,
        repo: GH_REPO,
        asset_id: assetId,
        name,
        headers,
      },
    )
  ).data;
}

export default ghApi;
export {
  ghNewRelease,
  ghGetRelease,
  ghUpdateRelease,
  ghGetAssets,
  ghUpdateAsset,
  ghGetAsset,
  ghVerify,
};
