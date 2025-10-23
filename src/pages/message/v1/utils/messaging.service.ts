type FrameID = string;

export interface Message<T = any> {
  id: string;
  type: string;
  from: FrameID;
  to: FrameID | 'broadcast';
  payload?: T;
  timestamp: number;
}

export default class CrossFrameMessenger {
  private channel: BroadcastChannel;
  private frameId: FrameID;

  constructor(frameId: FrameID) {
    this.frameId = frameId;
    this.channel = new BroadcastChannel('saas_messaging');
    this.send('system.ready');
  }

  send<T>(type: string, payload?: T, options?: { to?: FrameID }) {
    const message: Message<T> = {
      id: self.crypto.randomUUID(),
      type,
      from: this.frameId,
      to: options?.to || 'broadcast',
      payload,
      timestamp: Date.now()
    };
    this.channel.postMessage(message);
  }

  on(type: string, callback: (msg: Message) => void) {
    const handler = (event: MessageEvent<Message>) => {
      const msg = event.data;
      if ((msg.to === 'broadcast' || msg.to === this.frameId) && msg.type === type) {
        callback(msg);
      }
    };
    this.channel.addEventListener('message', handler);
    return () => this.channel.removeEventListener('message', handler);
  }

  destroy() {
    this.send('system.disconnect');
    this.channel.close();
  }
}
