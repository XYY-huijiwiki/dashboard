import { app, shell, BrowserWindow, nativeTheme } from "electron";
import type { BrowserWindowConstructorOptions } from "electron";
import { electronApp, optimizer, is, platform } from "@electron-toolkit/utils";
import { installExtension, VUEJS_DEVTOOLS } from "electron-devtools-installer";
import { join } from "path";
import { fileURLToPath } from "url";
import debug from "electron-debug";

import icon from "../../resources/icon.png?asset";
import registerIPC from "./api.js";

// register debug environment for dev
debug();

let mainWindow: BrowserWindow;

// single instance lock
const isSingleInstance = app.requestSingleInstanceLock();
if (!isSingleInstance) {
  app.quit();
} else {
  app.on("second-instance", () => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false,
    icon,
    webPreferences: {
      preload: fileURLToPath(new URL("../preload/index.mjs", import.meta.url)),
      sandbox: false,
    },
    ...generateWindowsOnlyConfig(),
    ...generateMacOSOnlyConfig(),
    ...generateLinuxOnlyConfig(),
  });

  function generateWindowsOnlyConfig(): BrowserWindowConstructorOptions {
    return platform.isWindows
      ? {
          autoHideMenuBar: true,
          titleBarStyle: "hidden",
          titleBarOverlay: {
            color: "#00000000",
            symbolColor: nativeTheme.shouldUseDarkColors
              ? "#FFFFFF"
              : "#000000",
            height: 30, // the smallest size of the title bar on windows 11
          },
          frame: false,
          backgroundMaterial: "mica", // must init with some value to enable the feature
        }
      : {};
  }

  function generateMacOSOnlyConfig(): BrowserWindowConstructorOptions {
    return platform.isMacOS ? {} : {};
  }

  function generateLinuxOnlyConfig(): BrowserWindowConstructorOptions {
    return platform.isLinux ? {} : {};
  }

  mainWindow.removeMenu();

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Setup devtools
  if (is.dev) {
    installExtension(VUEJS_DEVTOOLS);
  }

  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC
  registerIPC();

  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
