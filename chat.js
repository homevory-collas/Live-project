/**
 * ============================================================
 *  LIVE ARENA · 聊天服务器 / Live chat WebSocket server
 *  按房间号广播消息 / broadcast messages per room.
 *
 *  前端连接方式（已写好）/ frontend connects as:
 *    wss://chat.your-domain.com?room=<roomId>
 *  对应 config.js 的 CHAT_WS_URL。
 *
 *  运行 / Run:  npm run chat   (默认 ws://localhost:8090)
 *
 *  ⚠️ 关于高并发（你关心的 20-30 万观众/房）/ on high concurrency:
 *  单个 Node 进程扛不了几十万长连接。生产环境要做的是：
 *  A single Node process CANNOT hold hundreds of thousands of sockets.
 *  For production you must:
 *    1) 横向扩展多个本服务实例（PM2 / k8s 多副本）
 *       run many instances of THIS server behind a load balancer
 *    2) 用 Redis Pub/Sub（或 NATS/Kafka）在实例间转发同一房间的消息
 *       use Redis Pub/Sub to fan-out a room's messages across instances
 *    3) 观众侧建议「只读+采样」：几十万人不可能人人发言都广播给所有人，
 *       通常合并/抽样/限频（见下方 NOTE 标记的可扩展点）
 *       sample / throttle outbound for massive rooms
 *  这个文件是可工作的单机版 + 预留了上述扩展点。
 *  This file is a working single-node version with those extension points marked.
 * ============================================================
 */
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || process.env.CHAT_PORT || 8090;
const wss = new WebSocketServer({ port: PORT });

/** 房间 -> 该房间的连接集合 / room -> set of sockets */
const rooms = new Map();

function roomOf(req) {
  try {
    const url = new URL(req.url, 'http://localhost');
    return url.searchParams.get('room') || 'lobby';
  } catch { return 'lobby'; }
}

function join(room, ws) {
  if (!rooms.has(room)) rooms.set(room, new Set());
  rooms.get(room).add(ws);
}
function leave(room, ws) {
  const set = rooms.get(room);
  if (set) { set.delete(ws); if (!set.size) rooms.delete(room); }
}

/**
 * 向同房间广播 / broadcast to a room.
 * NOTE(scale): 多实例时，这里应改成「发布到 Redis 频道 room」，
 * 由各实例订阅后再本地广播。Replace with Redis publish for multi-instance.
 */
function broadcast(room, payload, exclude) {
  const set = rooms.get(room);
  if (!set) return;
  const data = JSON.stringify(payload);
  for (const client of set) {
    if (client !== exclude && client.readyState === 1) client.send(data);
  }
}

wss.on('connection', (ws, req) => {
  const room = roomOf(req);
  join(room, ws);

  // 简单限频：每位用户最多 1 条/秒 / basic rate limit: 1 msg/sec/user
  let lastSent = 0;
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  // 进房通知人数 / notify viewer count on join
  broadcast(room, { type: 'system', count: rooms.get(room)?.size || 1 });

  ws.on('message', raw => {
    const now = Date.now();
    if (now - lastSent < 1000) return;        // 丢弃过快的消息 / drop spam
    lastSent = now;

    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }
    const text = String(msg.text || '').slice(0, 300);  // 限长 / cap length
    if (!text.trim()) return;

    // NOTE(moderation): 在这里接入敏感词过滤 / plug content moderation here.
    const user = String(msg.user || 'guest').slice(0, 40);

    broadcast(room, { type: 'chat', user, text, ts: now });
  });

  ws.on('close', () => {
    leave(room, ws);
    broadcast(room, { type: 'system', count: rooms.get(room)?.size || 0 });
  });
  ws.on('error', () => {});
});

// 心跳：清理掉线连接 / heartbeat to drop dead sockets
const HEARTBEAT = setInterval(() => {
  wss.clients.forEach(ws => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    try { ws.ping(); } catch {}
  });
}, 30000);
wss.on('close', () => clearInterval(HEARTBEAT));

console.log(`[chat] WebSocket server on ws://localhost:${PORT}  (?room=<id>)`);
