/**
 * ============================================================
 *  LIVE ARENA · 全局配置 / Global config
 *  你的团队只需修改这个文件即可接入真实 API。
 *  Your team only edits THIS file to plug in real APIs.
 * ============================================================
 */
export const CONFIG = {
  /** 默认语言 / Default language: 'zh' | 'en' */
  DEFAULT_LANG: 'zh',

  /** 支持的语言 / Supported languages (zh = 主 / primary) */
  LANGS: ['zh', 'en', 'vi', 'ms', 'id'],

  /**
   * 是否使用内置示例数据。
   * true  = 离线演示，无需任何 API，可直接打开预览。
   * false = 调用下面的 API_BASE 接入真实服务商。
   * Use built-in mock data. true = offline demo; false = call real API_BASE.
   */
  USE_MOCK: true,

  /**
   * 你的后端代理 / 数据网关地址。
   * 强烈建议通过 server/proxy.js 转发，避免在前端暴露 API Key。
   * Your backend proxy base URL. Keep API keys server-side (see server/proxy.js).
   */
  API_BASE: '/api',

  /**
   * 直播聊天 WebSocket 地址。留空则使用本地演示消息。
   * Live chat WebSocket URL. Empty = local demo messages.
   * 例 / e.g. 'wss://chat.your-domain.com'
   */
  CHAT_WS_URL: '',

  /** 直播流格式（HLS 为 Web 直播主流方案）/ Stream format (HLS standard for web) */
  STREAM: { type: 'hls' },

  /**
   * 主播在网页上「用摄像头开播」的推流出口（WebRTC / WHIP）。
   * 填上你媒体服务器的 WHIP 入口即可真正把摄像头画面送出去。
   * 留空 = 开播台只做本地预览演示（不真正分发）。
   * Browser webcam publishing target (WebRTC / WHIP). Put your media server's
   * WHIP ingest URL here to actually push the camera out. Empty = local preview only.
   * 例 / e.g. 'https://media.your-domain.com/whip/<streamKey>'
   * 兼容 MediaMTX / Janus / LiveKit / Cloudflare Stream 等 WHIP 入口。
   */
  PUBLISH: { WHIP_URL: '' },

  /**
   * 内部统一接口的端点路径。
   * 在 server/proxy.js 里把这些路径映射到你购买的真实服务商。
   * Internal endpoint paths. Map them to your purchased providers in server/proxy.js.
   */
  ENDPOINTS: {
    liveRooms: '/live/rooms',        // 直播间列表 / live room list
    room:      '/live/room',         // 单个直播间 (?id=) / single room
    scores:    '/sports/scores',     // 比分 (?league=) / scores
    standings: '/sports/standings',  // 积分榜 (?league=) / standings
    news:      '/news',              // 资讯 (?category=) / news
  },
};
