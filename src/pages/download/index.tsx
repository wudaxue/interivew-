import { useState } from 'react'
import { Button } from '@/components/ui/button'

type TaskType = 'single' | 'batch'
type TaskStatus = 'pending' | 'downloading' | 'completed'

interface DownloadTask {
  id: number
  name: string
  type: TaskType
  urls: string[]
  status: TaskStatus
  progressText: string
}

let taskIdCounter = 1

// 模拟下载函数，返回 Promise
const fakeDownload = (url: string, delay = 1000) =>
  new Promise<void>((resolve) => setTimeout(resolve, delay))

export default function DownloadManager() {
  const [tasks, setTasks] = useState<DownloadTask[]>([])

  const addSingleTask = () => {
    const task: DownloadTask = {
      id: taskIdCounter++,
      name: `单个下载任务 ${taskIdCounter}`,
      type: 'single',
      urls: ['https://example.com/file1.png'],
      status: 'pending',
      progressText: '等待中',
    }
    setTasks((prev) => [...prev, task])
  }

  const addBatchTask = () => {
    const task: DownloadTask = {
      id: taskIdCounter++,
      name: `批量下载任务 ${taskIdCounter}`,
      type: 'batch',
      urls: [
        'https://example.com/file1.png',
        'https://example.com/file2.png',
        'https://example.com/file3.png',
      ],
      status: 'pending',
      progressText: '等待中',
    }
    setTasks((prev) => [...prev, task])
  }

  const startTask = async (task: DownloadTask) => {
    // 暂停其他下载中任务
    setTasks((prev) =>
      prev.map((t) =>
        t.id !== task.id && t.status === 'downloading'
          ? { ...t, status: 'pending', progressText: '等待中' }
          : t,
      ),
    )

    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: 'downloading' } : t)))

    if (task.type === 'single') {
      await fakeDownload(task.urls[0])
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: 'completed', progressText: '下载完成 ✅' } : t,
        ),
      )
    } else {
      let completed = 0
      for (const url of task.urls) {
        await fakeDownload(url, 1000)
        completed++
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, progressText: `进度：${completed}/${task.urls.length}` } : t,
          ),
        )
      }
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: 'completed', progressText: '批量下载完成 ✅' } : t,
        ),
      )
    }
  }

  return (
    <div className='mx-auto max-w-xl p-6'>
      <h2 className='mb-4 font-bold text-lg'>下载管理器</h2>

      <div className='mb-4 space-x-2'>
        <Button onClick={addSingleTask} className='rounded bg-blue-500 px-3 py-1 text-white'>
          添加单个下载
        </Button>
        <Button onClick={addBatchTask} className='rounded bg-green-500 px-3 py-1 text-white'>
          添加批量下载
        </Button>
      </div>

      {tasks.map((task) => (
        <div key={task.id} className='mb-2 rounded border p-3'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='font-semibold'>{task.name}</p>
              <p className='text-gray-600 text-sm'>
                {task.status === 'completed' ? '已完成 ✅' : task.progressText}
              </p>
            </div>
            <div>
              {task.status === 'pending' && (
                <Button
                  onClick={() => startTask(task)}
                  className='rounded bg-green-500 px-2 py-1 text-sm text-white'
                >
                  开始
                </Button>
              )}
              {task.status === 'downloading' && (
                <Button disabled className='rounded bg-gray-400 px-2 py-1 text-sm text-white'>
                  进行中
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
