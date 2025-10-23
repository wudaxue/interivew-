import { StrictMode, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { IframeCommSDK } from '../utils/iframe-comm-sdk-secure';

const main = new IframeCommSDK({
  id: 'main',
  domain: window.location.origin,
});

main.registerIframe('iframe1', document.querySelector('#iframe1')!);
main.registerIframe('iframeB', document.querySelector('#iframe2')!);

main.onMessage((payload, sendResponse) => {
  console.log('[Main] 收到消息:', payload);
  sendResponse({ ok: true, from: 'main' });
})

// 主页面主动发消息
main.send('iframe1', { action: 'ping', data: 1 }, (res) => {
  console.log('[Main] 收到 iframe1 响应:', res);
})

export const MainApp: React.FC = () => {

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
      {/** biome-ignore lint/correctness/useUniqueElementIds: <> */}
      <iframe id='iframe1' title='iframe' src='../iframe1/index.html?frameId=iframe1' />
      {/** biome-ignore lint/correctness/useUniqueElementIds: <> */}
      <iframe id='iframe2' title='iframe' src='../iframe2/index.html?frameId=iframe2' />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MainApp />
  </StrictMode>,
)
