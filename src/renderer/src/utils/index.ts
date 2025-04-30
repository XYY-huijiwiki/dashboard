import isElectron from "is-electron";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

import { dayjsLocales } from "@renderer/stores/locales";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const __IS_DEV__ = import.meta.env.DEV;
const is = {
  dev: __IS_DEV__,
  web: __IS_DEV__ ? !isElectron() : __IS_WEB__,
  win: __IS_DEV__ ? window.electron.process.platform === "win32" : __IS_WIN__,
  mac: __IS_DEV__ ? window.electron.process.platform === "darwin" : __IS_MAC__,
  linux: __IS_DEV__
    ? window.electron.process.platform === "linux"
    : __IS_LINUX__,
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
