import { createRoot } from 'react-dom/client'
import '@/index.css'
import { StrictMode } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { IframeCommSDK } from '../utils/iframe-comm-sdk-secure'

const iframe1 = new IframeCommSDK({
  id: 'iframe1',
  domain: window.location.origin,
})

iframe1.onMessage(async (payload, sendResponse) => {
  console.log('[iframe1] 收到消息:', payload)
  await new Promise((r) => setTimeout(r, 300))
  sendResponse({ done: true, at: Date.now() })
})

// 向 iframeB 发消息（经主页面中转）
iframe1.send('iframeB', { action: 'hello', data: 'hi iframeB' }, (res) => {
  console.log('[iframe1] 收到 iframeB 响应:', res)
})

function Iframe2App() {
  return (
    <div className='h-full p-4'>
      <h1 className='mb-4 font-bold text-2xl text-green-600'>Iframe 2</h1>
      <Button onClick={() => sendToFrame('iframe1')}>Send Message</Button>
      <Toaster />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Iframe2App />
  </StrictMode>,
)
