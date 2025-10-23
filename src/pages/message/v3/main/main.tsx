import { StrictMode, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import React, { useEffect, useState } from 'react'
import { Toaster, toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { IframeCommSDK, type IframeInfo } from '../utils/frame-sdk'

const sdk = new IframeCommSDK({
  id: 'main',
  domain: window.location.origin,
})

sdk.onMessage((payload, sendResponse) => {
  console.log('[Main] 收到消息:', payload)
  sendResponse({ ok: true, from: 'main' })
})

export const MainApp: React.FC = () => {
  const iframe1 = useRef(null)
  const iframe2 = useRef(null)
  const [iframeList, setIframeList] = useState<IframeInfo[]>([])
  useEffect(() => {
    if (iframe1.current) {
      sdk.registerIframe('iframe1', iframe1.current)
    }
    if (iframe2.current) {
      sdk.registerIframe('iframe2', iframe2.current)
    }
  }, [])

  setTimeout(() => {
    const list = sdk.getConnectedIframes()
    setIframeList(list)
  }, 5000)

  function sendToFrame(id: string) {
    sdk.send(id, { action: 'hello', data: `hi ${id}` }, (res) => {
      console.log(`main 收到 ${id} 响应:`, res)
      toast(`main 收到 ${id} 响应: ${JSON.stringify(res)}`)
    })
  }

  function frameEnabled(id: string) {
    return iframeList.find(item => item.id === id && item.isConnected)
  }

  return (
    <div className='main-container'>
      <h1>SaaS Main Application</h1>
      <div className='frame-list'>
        <div>
          <span>iframe1</span>
          <Button disabled={!frameEnabled('iframe1')} onClick={() => sendToFrame('iframe1')}>
            Send Message
          </Button>
        </div>
        <div>
          <span>iframe2</span>
          <Button disabled={!frameEnabled('iframe1')} onClick={() => sendToFrame('iframe2')}>
            Send Message
          </Button>
        </div>
      </div>
      {/** biome-ignore lint/correctness/useUniqueElementIds: <> */}
      <iframe
        ref={iframe1}
        id='iframe1'
        title='iframe'
        src='../iframe1/index.html?frameId=iframe1'
      />
      {/** biome-ignore lint/correctness/useUniqueElementIds: <> */}
      <iframe
        ref={iframe2}
        id='iframe2'
        title='iframe'
        src='../iframe2/index.html?frameId=iframe2'
      />
      <Toaster />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MainApp />
  </StrictMode>,
)
