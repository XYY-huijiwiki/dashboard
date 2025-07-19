import { debounce, isArray } from "lodash-es";

import { is } from "@renderer/utils";
import router from "@renderer/router";
import { genRawFileUrl } from "@renderer/utils/genUrl";
import { useDownloadStore } from "@renderer/stores/download";

const { startDownload } = useDownloadStore();

const fileDownload = debounce(fileDownloadUndebounced, 300);
async function fileDownloadUndebounced(files: FileRecord | FileRecord[]) {
  if (!isArray(files)) {
    files = [files];
  }
  if (is.web) {
    const a = document.createElement("a");
    a.href = genRawFileUrl(files[0]);
    a.click();
  } else {
    for (const item of files) {
      startDownload(item);
    }
    router.push({ name: "download-manager" });
  }
}

export { fileDownload };
