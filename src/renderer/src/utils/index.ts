import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

import { dayjsLocales } from "@renderer/stores/locales";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const isDev = import.meta.env.DEV;
const isWeb = isDev
  ? window.electron?.process?.platform === undefined
  : __IS_WEB__;
const isWin = isDev
  ? window.electron?.process?.platform === "win32"
  : __IS_WIN__;
const isMac = isDev
  ? window.electron?.process?.platform === "darwin"
  : __IS_MAC__;
const isLinux = isDev
  ? window.electron?.process?.platform === "linux"
  : __IS_LINUX__;
const is = {
  dev: isDev,
  web: isWeb,
  win: isWin,
  mac: isMac,
  linux: isLinux,
};

function errNotify(title: string, error: unknown) {
  dayjs.extend(localizedFormat).locale(dayjsLocales.value);
  console.dir(error);
  window.$notification.error({
    title: title,
    content: error instanceof Error ? error.message : String(error),
    meta: dayjs().format("lll"),
  });
}

export { sleep, is, errNotify };
