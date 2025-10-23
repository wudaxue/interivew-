import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'

type TaskType = 'single' | 'batch'
type TaskStatus = 'pending' | 'downloading' | 'completed'

interface DownloadTask {
  id: number
  name: string
  type: TaskType
  urls: string[]
  status: TaskStatus
  progress: number
}

let taskIdCounter = 1

const fakeDownload = (url: string, delay = 1000) =>
  new Promise<void>((resolve) => setTimeout(resolve, delay))

export default function DownloadManager() {
  const [tasks, setTasks] = useState<DownloadTask[]>([])

  const addTask = useCallback((type: TaskType) => {
    const newTask: DownloadTask = {
      id: taskIdCounter++,
      name: type === 'single' ? `单个下载任务 ${taskIdCounter}` : `批量下载任务 ${taskIdCounter}`,
      type,
      urls:
        type === 'single'
          ? ['https://example.com/file1.png']
          : [
              'https://example.com/file1.png',
              'https://example.com/file2.png',
              'https://example.com/file3.png',
            ],
      status: 'pending',
      progress: 0,
    }
    setTasks((prev) => [...prev, newTask])
  }, [])

  const startTask = useCallback(async (task: DownloadTask) => {
    // 暂停其他下载中任务
    setTasks((prev) =>
      prev.map((t) =>
        t.id !== task.id && t.status === 'downloading'
          ? { ...t, status: 'pending', progress: 0 }
          : t,
      ),
    )

    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: 'downloading' } : t)))

    for (let i = 0; i < task.urls.length; i++) {
      await fakeDownload(task.urls[i])
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, progress: i + 1 } : t)))
    }

    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: 'completed' } : t)))
  }, [])

  return (
    <div className='mx-auto max-w-xl p-6'>
      <h2 className='mb-4 font-bold text-lg'>下载管理器</h2>

      <div className='mb-4 space-x-2'>
        <Button
          onClick={() => addTask('single')}
          className='rounded bg-blue-500 px-3 py-1 text-white'
        >
          添加单个下载
        </Button>
        <Button
          onClick={() => addTask('batch')}
          className='rounded bg-green-500 px-3 py-1 text-white'
        >
          添加批量下载
        </Button>
      </div>

      {tasks.map((task) => (
        <div key={task.id} className='mb-2 rounded border p-3'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='font-semibold'>{task.name}</p>
              <p className='text-gray-600 text-sm'>
                {task.status === 'completed'
                  ? '已完成 ✅'
                  : `进度：${task.progress}/${task.urls.length}`}
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
