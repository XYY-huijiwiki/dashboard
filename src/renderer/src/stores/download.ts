import { defineStore } from 'pinia'
import { computed } from 'vue'
import type { Ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { genRawFileUrl } from '@renderer/utils/genUrl'

interface downloadRecord {
  id: string
  url: string
  mimeType: string
  status: 'downloading' | 'completed' | 'error' | 'cancelled' | 'deleted' | 'paused'
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
    window.api.downloadFile({
      url: genRawFileUrl(fileRecord),
      filename: fileRecord.file_name,
      directory: undefined
    })
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
    const { id, url, mimeType, filename, totalBytes, path } = args
    console.log(`onDownloadStarted: ${id}, ${path}`)
    const initialData: downloadRecord = {
      id: id,
      url: url,
      mimeType: mimeType,
      status: 'downloading',
      progress: 0,
      transferredBytes: 0,
      totalBytes: totalBytes,
      path: path,
      filename: filename,
      error: null,
      startedAt: new Date(),
      completedAt: null
    }

    // Add the new download to the beginning of the list
    downloads.value.unshift(initialData)
  })

  // Listen for progress updates from the main process
  window.api.onDownloadProgress((args) => {
    const { id, percentCompleted, bytesReceived } = args
    const download = downloads.value.find((d) => d.id === id)
    if (download) {
      download.progress = percentCompleted
      download.transferredBytes = bytesReceived
    }
  })

  // Listen for completion events
  window.api.onDownloadCompleted((args) => {
    const { id, filePath, filename } = args
    console.log(`onDownloadCompleted: ${id}, ${filePath}`)
    const download = downloads.value.find((d) => d.id === id)
    if (download) {
      download.status = 'completed'
      download.path = filePath
      download.filename = filename
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
    pauseDownload,
    resumeDownload,
    activeDownloads,
    completedDownloads
  }
})
