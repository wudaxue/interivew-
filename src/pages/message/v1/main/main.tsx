import { StrictMode, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import CrossFrameMessenger from '../utils/messaging.service'

export const MainApp: React.FC = () => {
  const [frames, setFrames] = useState<Record<string, { id: string; name: string }>>({})
  const messengerRef = useRef<CrossFrameMessenger>(null)
  useEffect(() => {
    const messenger = new CrossFrameMessenger('main-app')
    messengerRef.current = messenger
    // 帧注册管理
    messenger.on('system.ready', (msg) => {
      setFrames((prev) => ({
        ...prev,
        [msg.from]: { id: msg.from, name: `Frame-${Object.keys(prev).length + 1}` },
      }))
    })
    messenger.on('system.disconnect', (msg) => {
      setFrames((prev) => {
        const updated = { ...prev }
        delete updated[msg.from]
        return updated
      })
    })
    return () => messenger.destroy()
  }, [])

  const sendToFrame = (targetId: string) => {
    messengerRef.current?.send(
      'custom.message',
      { content: `Hello from main to ${targetId}` },
      { to: targetId },
    )
  }

  return (
    <div className='main-container'>
      <h1>SaaS Main Application</h1>

      <div className='frame-list'>
        {Object.values(frames).map((frame) => (
          <div key={frame.id}>
            <span>
              {frame.name} (ID: {frame.id})
            </span>
            <Button onClick={() => sendToFrame(frame.id)}>Send Message</Button>
          </div>
        ))}
      </div>
      <iframe title='iframe' src='../iframe1/index.html?frameId=iframe1' />
      <iframe title='iframe' src='../iframe2/index.html?frameId=iframe2' />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MainApp />
  </StrictMode>,
)
