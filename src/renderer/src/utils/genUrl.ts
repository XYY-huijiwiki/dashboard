import { is } from "@renderer/utils";

const imageProxy = import.meta.env.VITE_IMAGE_PROXY;
const corsProxy = import.meta.env.VITE_CORS_PROXY;
const ghOwner = import.meta.env.VITE_GH_OWNER;
const ghRepo = import.meta.env.VITE_GH_REPO;
const ghFileRelease = import.meta.env.VITE_GH_FILE_RELEASE;
const ghThumbRelease = import.meta.env.VITE_GH_THUMB_RELEASE;

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
