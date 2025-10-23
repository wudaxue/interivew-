import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import type { Message } from '../utils/messaging.service'
import '../utils/saas-integration'
import { Button } from '@/components/ui/button'

const messenger = window.saasMessenger

function sendMessage() {
  messenger.send('custom.event', {
    action: 'button-click',
    data: { foo: 'bar' },
  })
}

// 发送给特定iframe
function sendToFrame(targetId: string) {
  messenger.send(
    'private.message',
    {
      content: 'Hello specific frame',
    },
    { to: targetId },
  )
}

messenger.on('config.update', (msg: Message) => {
  toast(`Received config: ${JSON.stringify(msg.payload)}`)
})

messenger.on('private.message', (msg: Message) => {
  console.log(msg, 'msg')
  toast(`Received config: ${JSON.stringify(msg.payload)}`)
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
