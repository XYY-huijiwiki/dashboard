import { ipcMain, dialog, BrowserWindow, shell } from "electron";
import path from "path";
import fs from "fs";
import mime from "mime-types";
import { ElectronDownloadManager } from "electron-dl-manager";

import base62 from "./utils/base62.js";
import ghLogin from "./utils/ghLogin.js";
import safeRename from "./utils/safeRename.js";

const dlManager = new ElectronDownloadManager();

function registerIPC(): void {
  // #region file upload

  ipcMain.handle("open-file-dialog", async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ["openFile"],
    });

    if (canceled) return null;

    const filePath = filePaths[0];
    const stats = fs.statSync(filePath);
    return {
      name: path.basename(filePath),
      path: filePath,
      size: stats.size,
      type: mime.lookup(filePath) || "application/octet-stream",
    };
  });

  ipcMain.handle(
    "upload-to-github",
    async (_, { ghToken, owner, repo, releaseId, filePath, fileName }) => {
      const fileExt = path.extname(fileName);
      const fileNameWithoutExt = path.basename(fileName, fileExt);
      const base62FileName = base62.encode(fileNameWithoutExt) + fileExt;
      const url = `https://uploads.github.com/repos/${owner}/${repo}/releases/${releaseId}/assets?name=${base62FileName}`;

      const readStream = fs.readFileSync(filePath);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `bearer ${ghToken}`,
          "Content-Type": mime.lookup(filePath) || "application/octet-stream",
        },
        body: readStream,
      });

      if (!response.ok) {
        throw new Error(
          `Upload failed: ${response.status} ${response.statusText}`,
        );
      }

      return response.json();
    },
  );

  // #endregion

  // #region github login

  ipcMain.handle("gh-login", async () => {
    return ghLogin();
  });

  // #endregion

  // #region download file

  ipcMain.handle(
    "download-file",
    async (
      event,
      {
        uuid,
        url,
        filename,
        directory,
      }: { uuid: string; url: string; filename: string; directory?: string },
    ) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (!win) throw new Error("No BrowserWindow found");

      const tempFilename = uuid;
      const targetFilename = filename;

      await dlManager.download({
        window: win,
        url: url,
        saveAsFilename: tempFilename,
        directory: directory,
        callbacks: {
          onDownloadStarted: async ({ id }) => {
            event.sender.send("download-started", {
              uuid: uuid,
              downloadId: id,
            });
          },
          onDownloadProgress: async ({
            item,
            percentCompleted,
            downloadRateBytesPerSecond,
            estimatedTimeRemainingSeconds,
          }) => {
            event.sender.send("download-progress", {
              uuid: uuid,
              percentCompleted,
              bytesReceived: item.getReceivedBytes(),
              totalBytes: item.getTotalBytes(),
              downloadRateBytesPerSecond,
              estimatedTimeRemainingSeconds,
            });
          },
          onDownloadCompleted: async ({ item }) => {
            const filePath = await safeRename(
              item.getSavePath(),
              targetFilename,
            );
            const filename = path.basename(filePath);
            event.sender.send("download-completed", {
              uuid: uuid,
              filePath,
              filename,
            });
          },
          onDownloadCancelled: async () => {
            event.sender.send("download-cancelled", {
              uuid: uuid,
            });
          },
          onError: (err) => {
            event.sender.send("download-error", {
              uuid: uuid,
              err,
            });
          },
        },
      });
    },
  );

  ipcMain.handle("cancel-download", async (_event, id: string) => {
    dlManager.cancelDownload(id);
  });

  ipcMain.handle("pause-download", async (_event, id: string) => {
    dlManager.pauseDownload(id);
  });

  ipcMain.handle("resume-download", async (_event, id: string) => {
    dlManager.resumeDownload(id);
  });

  // #endregion

  // #region fullscreen
  ipcMain.handle("toggle-fullscreen", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) throw new Error("No BrowserWindow found");
    win.setFullScreen(!win.isFullScreen());
  });
  // #endregion

  // #region toggle devtools
  ipcMain.handle("toggle-devtools", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) throw new Error("No BrowserWindow found");
    win.webContents.toggleDevTools();
  });
  // #endregion

  // #region file operations

  ipcMain.handle("show-in-folder", async (_event, filePath: string) => {
    shell.showItemInFolder(filePath);
  });

  ipcMain.handle("open-file", async (_event, filePath: string) => {
    shell.openPath(filePath);
  });

  ipcMain.handle("is-file-exists", async (_event, filePath: string) => {
    return fs.existsSync(filePath);
  });

  // #endregion
}

export default registerIPC;
