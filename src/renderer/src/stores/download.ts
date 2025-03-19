import { defineStore } from 'pinia'
import { computed } from 'vue'
import type { Ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useLocalStorage } from '@vueuse/core'
import { genRawFileUrl } from '@renderer/utils/genUrl'

interface downloadRecord {
  uuid: string
  downloadId: string | null
  url: string
  mimeType: string
  status: 'pending' | 'downloading' | 'completed' | 'error' | 'cancelled' | 'deleted' | 'paused'
  progress: number
  transferredBytes: number
  totalBytes: number
  path: string | null
  filename: string
  error: Error | null
  startedAt: Date
  completedAt: Date | null
}

export const useDownloadStore = defineStore('download', () => {
  // State
  const downloads: Ref<downloadRecord[]> = useLocalStorage('downloads', [])

  // Actions
  const startDownload = async (fileRecord: FileRecord) => {
    const url = genRawFileUrl(fileRecord)
    const uuid = uuidv4()

    window.api.downloadFile({
      uuid: uuid,
      url: url,
      filename: fileRecord.file_name,
      directory: undefined
    })

    const initialData: downloadRecord = {
      uuid: uuid,
      downloadId: null,
      url: url,
      mimeType: fileRecord.content_type,
      status: 'pending',
      progress: 0,
      transferredBytes: 0,
      totalBytes: 0,
      path: null,
      filename: fileRecord.file_name,
      error: null,
      startedAt: new Date(),
      completedAt: null
    }

    // Add the new download to the beginning of the list
    downloads.value.unshift(initialData)
  }

  const cancelDownload = (downloadId) => {
    window.api.cancelDownload(downloadId)
  }

  const pauseDownload = (downloadId) => {
    window.api.pauseDownload(downloadId)
  }

  const resumeDownload = (downloadId) => {
    window.api.resumeDownload(downloadId)
  }

  // Getters
  const activeDownloads = computed(() =>
    downloads.value.filter((d) => ['downloading'].includes(d.status))
  )

  const completedDownloads = computed(() => downloads.value.filter((d) => d.status === 'completed'))

  // Listeners

  // Listen for download started from the main process
  window.api.onDownloadStarted((args) => {
    const { uuid, downloadId } = args
    const download = downloads.value.find((d) => d.uuid === uuid)
    if (download) {
      download.downloadId = downloadId
      download.status = 'downloading'
    }
  })

  // Listen for progress updates from the main process
  window.api.onDownloadProgress((args) => {
    const { uuid, percentCompleted, bytesReceived } = args
    const download = downloads.value.find((d) => d.uuid === uuid)
    if (download) {
      download.progress = percentCompleted
      download.transferredBytes = bytesReceived
    }
  })

  // Listen for completion events
  window.api.onDownloadCompleted((args) => {
    const { uuid, filePath, filename } = args
    const download = downloads.value.find((d) => d.uuid === uuid)
    if (download) {
      download.status = 'completed'
      download.path = filePath
      download.filename = filename
      download.completedAt = new Date()
    }
  })

  // Listen for errors
  window.api.onDownloadError((args) => {
    const { uuid, error } = args
    const download = downloads.value.find((d) => d.uuid === uuid)
    if (download) {
      download.status = 'error'
      download.error = error
    }
  })

  // Listen for cancelled
  window.api.onDownloadCancelled((args) => {
    const { uuid } = args
    const download = downloads.value.find((d) => d.uuid === uuid)
    if (download) {
      download.status = 'cancelled'
    }
  })

  return {
    downloads,
    startDownload,
    cancelDownload,
    pauseDownload,
    resumeDownload,
    activeDownloads,
    completedDownloads
  }
})
