import { defineStore } from 'pinia'
import { computed } from 'vue'
import type { Ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { Options } from 'electron-dl'
import { useLocalStorage } from '@vueuse/core'
import { genRawFileUrl } from '@renderer/utils/genUrl'

interface downloadRecord {
  id: string
  url: string
  mimeType: string
  status: 'pending' | 'downloading' | 'completed' | 'error' | 'cancelled'
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
  const startDownload = async (fileRecord: FileRecord, options: Options = {}) => {
    const downloadId = uuidv4()
    const url = genRawFileUrl(fileRecord)
    const initialData: downloadRecord = {
      id: downloadId,
      url,
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

    // Add the new download to the list
    downloads.value.push(initialData)

    // Start the download by sending a request to the main process
    window.api.downloadFile({ id: downloadId, url, options })
  }

  const cancelDownload = (downloadId) => {
    // Send a cancellation request to the main process
    window.api.cancelDownload(downloadId)
  }

  // Getters
  const activeDownloads = computed(() =>
    downloads.value.filter((d) => ['pending', 'downloading'].includes(d.status))
  )

  const completedDownloads = computed(() => downloads.value.filter((d) => d.status === 'completed'))

  // Listeners

  // Listen for download started from the main process
  window.api.onDownloadStarted((args) => {
    const { id } = args
    const download = downloads.value.find((d) => d.id === id)
    if (download && download.status === 'pending') {
      download.status = 'downloading'
    }
  })

  // Listen for progress updates from the main process
  window.api.onDownloadProgress((args) => {
    const { id, percent, transferredBytes, totalBytes } = args
    const download = downloads.value.find((d) => d.id === id)
    if (download) {
      download.progress = percent
      download.transferredBytes = transferredBytes
      download.totalBytes = totalBytes
    }
  })

  // Listen for completion events
  window.api.onDownloadCompleted((args) => {
    console.table(args)
    const { id, fileName, filePath } = args
    const download = downloads.value.find((d) => d.id === id)
    if (download) {
      download.status = 'completed'
      download.path = filePath
      download.filename = fileName
      download.completedAt = new Date()
    }
  })

  // Listen for errors
  window.api.onDownloadError((args) => {
    const { id, error } = args
    const download = downloads.value.find((d) => d.id === id)
    if (download) {
      download.status = 'error'
      download.error = error
    }
  })

  // Listen for cancelled
  window.api.onDownloadCancelled((args) => {
    const { id } = args
    const download = downloads.value.find((d) => d.id === id)
    if (download) {
      download.status = 'cancelled'
    }
  })

  return {
    downloads,
    startDownload,
    cancelDownload,
    activeDownloads,
    completedDownloads
  }
})
