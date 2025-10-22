import { saveAs } from 'file-saver'
import JSZip from 'jszip'

export type ProgressCallback = (completed: number, total: number) => void

/**
 * 批量下载文件并打包为 zip，支持并发限制
 * @param fileUrls 文件 URL 列表
 * @param limit 并发限制，默认 5
 * @param onProgress 下载进度回调 (已完成, 总数)
 */
export async function downloadFilesWithLimit(
  fileUrls: string[],
  limit = 5,
  onProgress?: ProgressCallback,
): Promise<void> {
  const zip = new JSZip()
  let completed = 0
  const total = fileUrls.length

  const downloadSingleFile = async (url: string): Promise<void> => {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to fetch ${url}`)
    const blob = await response.blob()
    const fileName = url.split('/').pop() || 'file'
    zip.file(fileName, blob)
    completed++
    onProgress?.(completed, total)
  }

  const queue = [...fileUrls]
  const running: Promise<void>[] = []

  async function runNext(): Promise<void> {
    if (queue.length === 0) return

    const url = queue.shift()
    if (!url) return
    const task = downloadSingleFile(url).then(() => {
      running.splice(running.indexOf(task), 1)
      return runNext()
    })
    running.push(task)

    if (running.length < limit) {
      await runNext()
    }
  }

  await runNext()
  await Promise.all(running)

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  saveAs(zipBlob, 'materials.zip')
}

/**
 * 单文件下载
 * @param url 文件 URL
 */
export async function downloadSingleFile(url: string): Promise<void> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch ${url}`)
  const blob = await response.blob()
  const fileName = url.split('/').pop() || 'file'
  saveAs(blob, fileName)
}
