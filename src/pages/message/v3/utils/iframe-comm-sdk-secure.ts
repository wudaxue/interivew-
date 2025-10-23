/**
 * iframe-comm-sdk-secure.ts
 * 安全双向通信 SDK：
 * - 主页面与 iframe 双向通信
 * - iframe 间通信通过主页面中转
 * - 域名白名单、sessionKey 会话认证
 * - 消息加密接口留空
 */

export interface SDKOptions {
  id: string;
  domain: string;
}

interface MessageBase {
  messageId: string;
  sourceId: string;
  targetId: string;
  relayId?: string;
  type: 'request' | 'response';
  encryptedPayload: string;
  sessionKey?: string;
}

interface RequestPayload {
  action: string;
  data: any;
}

type MessageHandler = (
  payload: RequestPayload,
  sendResponse: (res: any) => void,
  rawMsg: MessageBase
) => void;

// ================= 加密占位 =================
function encrypt(data: any): string {
  return btoa(JSON.stringify(data)); // 可替换成 AES 等
}
function decrypt(data: string): any {
  return JSON.parse(atob(data));
}

// ================= 域名白名单 =================
const STATIC_WHITELIST = new Set([
  'https://main.example.com',
  'https://partnerA.example.com',
  'https://partnerB.example.com',
]);

async function validateDomainRemotely(domain: string): Promise<boolean> {
  // 模拟动态验证，可替换真实 API
  await new Promise((r) => setTimeout(r, 30));
  return STATIC_WHITELIST.has(domain);
}

// =================================================
export class IframeCommSDK {
  private id: string;
  private domain: string;
  private isMain: boolean;
  private sessionKey?: string;
  private trustedKeys = new Set<string>();
  private allowedDomains = new Set<string>();
  private iframeMap = new Map<string, Window>();
  private handlers: MessageHandler[] = [];
  private pending = new Map<string, (data: any) => void>();

  constructor(opt: SDKOptions) {
    this.id = opt.id;
    this.domain = opt.domain;
    this.isMain = window === window.parent; // 🚫 禁止 iframe 伪装成 main

    this.registerDomain(this.domain);
    window.addEventListener('message', this.handleMessage.bind(this));

    // 主页面生成会话 key
    if (this.isMain) {
      this.sessionKey = crypto.randomUUID();
      console.log(`[SDK] Main sessionKey generated: ${this.sessionKey}`);
    } else {
      // iframe 主动握手
      this.sendHandshake();
    }
  }

  /** 注册域名 */
  private async registerDomain(domain: string) {
    if (STATIC_WHITELIST.has(domain) || (await validateDomainRemotely(domain))) {
      this.allowedDomains.add(domain);
    } else {
      console.warn(`[SDK] Domain not allowed: ${domain}`);
    }
  }

  /** iframe -> 主页面 发起握手 */
  private sendHandshake() {
    if (this.isMain) return;
    const msg = {
      type: 'handshake',
      sourceId: this.id,
      domain: this.domain,
    };
    window.parent.postMessage(msg, '*');
  }

  /** 主页面注册 iframe */
  registerIframe(targetId: string, iframe: HTMLIFrameElement) {
    if (!this.isMain) return;
    this.iframeMap.set(targetId, iframe.contentWindow!);
  }

  /** 添加监听 */
  onMessage(handler: MessageHandler) {
    this.handlers.push(handler);
  }

  /** 发送消息 */
  send(targetId: string, payload: RequestPayload, callback?: (res: any) => void) {
    const encryptedPayload = encrypt(payload);
    const msg: MessageBase = {
      messageId: crypto.randomUUID(),
      sourceId: this.id,
      targetId,
      type: 'request',
      encryptedPayload,
      sessionKey: this.sessionKey,
    };
    if (callback) this.pending.set(msg.messageId, callback);
    this.post(targetId, msg);
  }

  /** 处理所有消息事件 */
  private handleMessage(event: MessageEvent) {
    const data = event.data;
    const origin = event.origin;

    // 阻断非法域
    if (!this.allowedDomains.has(origin) && !STATIC_WHITELIST.has(origin)) {
      console.warn(`[SDK] Blocked origin: ${origin}`);
      return;
    }

    // ============ 握手阶段 ============
    if (this.isMain && data?.type === 'handshake') {
      // iframe 请求会话 key
      const iframeWin = event.source as Window;
      const ack = {
        type: 'handshake_ack',
        targetId: data.sourceId,
        key: this.sessionKey,
      };
      iframeWin.postMessage(ack, origin);
      console.log(`[SDK] Handshake ACK sent to ${data.sourceId}`);
      return;
    }

    if (!this.isMain && data?.type === 'handshake_ack' && data.key) {
      this.sessionKey = data.key;
      this.trustedKeys.add(data.key);
      console.log('[SDK] Handshake success, sessionKey received');
      return;
    }

    // ============ 会话校验 ============
    if (data?.sessionKey && !this.isMain && !this.trustedKeys.has(data.sessionKey)) {
      console.warn('[SDK] Rejected: invalid sessionKey');
      return;
    }

    // ============ 消息路由 ============
    const msg = data as MessageBase;
    if (!msg || !msg.type) return;

    // ---- 响应 ----
    if (msg.type === 'response') {
      const cb = this.pending.get(msg.messageId);
      if (cb) {
        this.pending.delete(msg.messageId);
        cb(decrypt(msg.encryptedPayload));
      }
      return;
    }

    // ---- 请求 ----
    if (msg.type === 'request') {
      const payload = decrypt(msg.encryptedPayload);

      const sendResponse = (res: any) => {
        const resp: MessageBase = {
          messageId: msg.messageId,
          sourceId: this.id,
          targetId: msg.sourceId,
          relayId: this.isMain ? undefined : this.id,
          type: 'response',
          encryptedPayload: encrypt(res),
          sessionKey: this.sessionKey,
        };
        this.post(msg.sourceId, resp);
      };

      if (this.isMain && msg.targetId && msg.targetId !== this.id) {
        // iframe 间通信中转
        this.relayMessage(msg);
        return;
      }

      this.handlers.forEach((h) => {h(payload, sendResponse, msg)});
    }
  }

  /** 主页面转发 iframe 间通信 */
  private relayMessage(msg: MessageBase) {
    if (!this.isMain) return;
    const relayMsg = { ...msg, relayId: this.id };
    const targetWin = this.iframeMap.get(msg.targetId);
    targetWin?.postMessage(relayMsg, '*');
  }

  /** 统一发送消息 */
  private post(targetId: string, msg: MessageBase) {
    if (this.isMain) {
      const win = this.iframeMap.get(targetId);
      win?.postMessage(msg, '*');
    } else {
      window.parent.postMessage(msg, '*');
    }
  }
}