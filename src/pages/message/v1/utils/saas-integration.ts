import CrossFrameMessenger from './messaging.service'

// 自动从URL获取或生成frameId
function getFrameId() {
  const params = new URLSearchParams(location.search);
  return params.get('frameId') || `ext-${Math.random().toString(36).substr(2, 8)}`;
}

function initSaaSIntegration() {
  const frameId = getFrameId();
  console.log(frameId, 'frameId')
  const messenger = new CrossFrameMessenger(frameId)
  
  // 暴露给第三方使用的基本API
  const api = {
    send: (type, payload, options) => messenger.send(type, payload, options),
    on: messenger.on.bind(messenger),
    frameId,
    destroy: () => {
      messenger.destroy();
      window.saasMessenger = null;
    }
  };
  
  // 挂载到全局
  window.saasMessenger = api;
  
  // 自动响应系统消息
  messenger.on('system.ping', () => {
    messenger.send('system.pong');
  });
  
  return api;
}

// 自动初始化
if (!window.saasMessenger) {
  initSaaSIntegration();
}
