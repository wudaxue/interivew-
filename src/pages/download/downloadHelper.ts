import { saveAs } from 'file-saver'
import JSZip from 'jszip'

type ProgressCallback = (completed: number, total: number) => void

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


export async function downloadSingleFile(url: string): Promise<void> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch ${url}`)
  const blob = await response.blob()
  const fileName = url.split('/').pop() || 'file'
  saveAs(blob, fileName)
}
