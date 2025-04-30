import { is } from "@renderer/utils";

const imageProxy = __IMAGE_PROXY__;
const corsProxy = __CORS_PROXY__;
const ghOwner = __GH_OWNER__;
const ghRepo = __GH_REPO__;
const ghFileRelease = __GH_FILE_RELEASE__;
const ghThumbRelease = __GH_THUMB_RELEASE__;

function genRawFileUrl(file: FileRecord): string {
  let needCorsProxy = false;
  if (
    (is.dev || is.web) &&
    (file.content_type.startsWith("model") ||
      file.content_type.startsWith("application/x-shockwave-flash"))
  ) {
    needCorsProxy = true;
  }
  return `${needCorsProxy ? corsProxy : ""}https://github.com/${ghOwner}/${ghRepo}/releases/download/${ghFileRelease}/${file.file_name_base62}`;
}
function genThumbUrl(file: FileRecord): string {
  const hasThumb =
    file.content_type.startsWith("image") ||
    file.content_type.startsWith("video") ||
    file.content_type.startsWith("model");
  return hasThumb
    ? `${imageProxy}https://github.com/${ghOwner}/${ghRepo}/releases/download/${ghThumbRelease}/${file.file_name_base62}`
    : "";
}

export { genRawFileUrl, genThumbUrl };
