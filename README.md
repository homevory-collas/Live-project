# LIVE ARENA — 体育 & 电竞直播门户 / Sports & Esports Live Portal

> 语言 / Languages: **中文（主）+ English（次）**。以后加新市场语言只需在 `public/js/i18n.js` 的 `DICT` 里增加一个语言键。
> Add a new market language later by adding one key to `DICT` in `public/js/i18n.js`.

---

## 一、项目结构 / Project structure

```
livearena/
├─ public/                      # 前端（静态托管即可）/ frontend (serve statically)
│  ├─ index.html                # 首页 / home
│  ├─ live.html                 # 直播间（播放器+聊天）/ live room (player + chat)
│  ├─ assets/css/               # 样式，可整体替换 / styles (reskin freely)
│  └─ js/
│     ├─ config.js              # ★ 唯一需要改的接入配置 / the ONLY config you edit
│     ├─ i18n.js                # 多语言 zh+en
│     ├─ api/
│     │  ├─ index.js            # 统一内部接口（UI 只调它）/ unified internal API
│     │  ├─ client.js           # fetch 封装
│     │  ├─ mock.js             # 内置示例数据 + 内部数据结构定义 / mock + internal schema
│     │  └─ adapters/           # ★ 每个服务商一个适配器 / one adapter per provider
│     │     ├─ liveRooms.js
│     │     ├─ sports.js
│     │     └─ news.js
│     ├─ ui/render.js
│     └─ pages/{portal,live}.js
├─ server/proxy.js              # 后端代理示例（藏 API Key）/ proxy example (hides API keys)
├─ .env.example                 # 环境变量模板 / env template
└─ package.json
```

## 二、快速运行（离线演示）/ Quick start (offline demo)

`config.js` 默认 `USE_MOCK: true`，无需任何 API 即可预览。
Default `USE_MOCK: true` runs with zero backend.

```bash
npm run dev          # 启动静态服务 http://localhost:3000
```

> 必须通过 HTTP 打开（用了 ES Modules），不要直接双击 html 文件。
> Serve over HTTP (uses ES Modules); do not open the html via file://.

## 三、接入真实 API / Plug in real APIs

1. **启动代理并填好密钥** / start the proxy with your keys
   ```bash
   cp .env.example .env     # 填入你买的服务商地址和 Key
   npm install
   npm run proxy            # http://localhost:8080
   ```
2. **关闭 mock** / turn off mock — 在 `public/js/config.js`:
   ```js
   USE_MOCK: false,
   API_BASE: 'http://localhost:8080/api',   // 生产改成你的代理域名
   ```
3. **对齐字段** / map fields — 打开对应 `adapters/*.js`，把服务商返回字段映射到内部结构（文件里有 `TODO` 注释）。
   换服务商时，**只改对应一个 adapter**，UI 与其他部分不动。
   Edit the matching `adapters/*.js` to map provider fields into the internal shape (see `TODO`). Swapping a provider touches only that one adapter.

### 内部数据结构 / Internal schema（你的 adapter 必须产出这些）

```
直播间 room   : { id, title, category, categoryKey, viewers, cover, streamer, streamUrl(.m3u8) }
比分   score  : { league, status('live'|'finished'|'upcoming'), clock, home, away, hs, as }
积分   standing: { rank, team, w, d, l, pts }
资讯   news   : { id, title, category, hot }
```

## 四、安全须知 / Security

- **绝不要把 API Key 写进前端**。一切带密钥的请求都走 `server/proxy.js`。
  NEVER put API keys in the frontend. All keyed requests go through the proxy.
- `.env` 不要提交到仓库 / never commit `.env`.

## 五、聊天 / Chat

`config.js` 的 `CHAT_WS_URL` 留空 = 本地演示消息；填上你的 WebSocket 服务地址即接入真实聊天（前端已写好收发与房间号传参）。
Set `CHAT_WS_URL` to your WebSocket server to enable real chat; empty = local demo.

详细的“观众如何进入直播间”流程见 **HUONG-DAN.md（越南语）/ live-join flow**。
