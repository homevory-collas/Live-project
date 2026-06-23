/**
 * ============================================================
 *  LIVE ARENA · 数据代理 / API proxy (Express)
 *    - 服务端持有 API Key，绝不暴露前端 / hold keys server-side
 *    - 转发体育/资讯 API / forward sports & news APIs
 *    - 账号(含邮箱验证) / accounts (with email verification)
 *    - 直播间 CRUD + 地理封锁 / rooms CRUD + geo-blocking
 *    - 广告位 / ad slots
 *  存储统一走 server/db.js（SQLite 或 JSON 回退）。
 *  Storage goes through server/db.js (SQLite or JSON fallback).
 *  运行 / Run:  npm install && npm run proxy
 * ============================================================ */
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { store, usingSqlite } from './db.js';
import { sendEmail, mailConfigured } from './mail.js';
import { visitorCountry, isAllowed } from './geo.js';
import { tencentSignedHls, tencentConfigured } from './tencent.js';

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 8080;

console.log(`[db] ${usingSqlite ? 'SQLite' : 'JSON fallback'} | [mail] ${mailConfigured() ? 'configured' : 'DEV console'}`);

/* ---- 服务商配置 / providers ---- */
const SPORTS_API_BASE = process.env.SPORTS_API_BASE || '';
const SPORTS_API_KEY  = process.env.SPORTS_API_KEY  || '';
const NEWS_API_BASE   = process.env.NEWS_API_BASE   || '';
const NEWS_API_KEY    = process.env.NEWS_API_KEY    || '';
const LIVE_API_BASE   = process.env.LIVE_API_BASE   || '';
const LIVE_API_KEY    = process.env.LIVE_API_KEY    || '';
const SPORTS_RAPID_HOST = process.env.SPORTS_RAPID_HOST || '';
const sportsOpts = SPORTS_RAPID_HOST ? { rapidHost: SPORTS_RAPID_HOST } : {};
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'change-me-admin-token';
const REQUIRE_VERIFY = String(process.env.REQUIRE_EMAIL_VERIFY || 'false') === 'true';

/* ---- 通用转发器 / generic forwarder ---- */
async function forward(base, key, path, query, res, opts = {}) {
  if (!base) return res.status(501).json({ error: 'provider not configured' });
  const url = new URL(base + path);
  Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));
  let headers = {};
  if (opts.rapidHost) headers = { 'x-rapidapi-key': key, 'x-rapidapi-host': opts.rapidHost };
  else if (key) headers = { Authorization: `Bearer ${key}` };
  try {
    const r = await fetch(url, { headers });
    res.status(r.status).json(await r.json());
  } catch (e) { res.status(502).json({ error: 'upstream error', detail: String(e) }); }
}

/* ---- 体育 / 资讯 ---- */
app.get('/api/sports/scores',    (req, res) => forward(SPORTS_API_BASE, SPORTS_API_KEY, '/football-current-live',    req.query, res, sportsOpts));
app.get('/api/sports/standings', (req, res) => forward(SPORTS_API_BASE, SPORTS_API_KEY, '/football-get-standing-all', req.query, res, sportsOpts));
app.get('/api/news',             (req, res) => forward(NEWS_API_BASE, NEWS_API_KEY, '', req.query, res));

/* ============================ 账号 / accounts ============================ */
const sessions = new Map();   // token -> { email }
const hashPw = (pw, salt = randomBytes(16).toString('hex')) => `${salt}:${scryptSync(pw, salt, 64).toString('hex')}`;
const verifyPw = (pw, stored) => { const [s, h] = String(stored).split(':'); const a = Buffer.from(h, 'hex'), b = scryptSync(pw, s, 64); return a.length === b.length && timingSafeEqual(a, b); };
const validEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const sixDigit = () => String(Math.floor(100000 + Math.random() * 900000));

app.post('/api/auth/register', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const pw = String(req.body?.password || '');
  if (!validEmail(email)) return res.status(400).json({ error: 'invalid_email' });
  if (pw.length < 6)      return res.status(400).json({ error: 'weak_password' });
  if (store.users.find(email)) return res.status(409).json({ error: 'email_taken' });

  const code = sixDigit();
  store.users.create({ email, pw: hashPw(pw), verified: false, verifyCode: code, createdAt: Date.now() });
  await sendEmail(email, 'LIVE ARENA 验证码 / Verification code', `Your code: ${code}`);

  // 不要求验证时直接发令牌；要求验证时让前端进入"输入验证码"流程
  if (!REQUIRE_VERIFY) {
    const token = randomBytes(24).toString('hex'); sessions.set(token, { email });
    return res.json({ token, email, needVerify: false });
  }
  res.json({ email, needVerify: true });
});

// 校验邮箱验证码 / verify the email code
app.post('/api/auth/verify', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const code = String(req.body?.code || '');
  const u = store.users.find(email);
  if (!u) return res.status(404).json({ error: 'no_user' });
  if (u.verified) { const token = randomBytes(24).toString('hex'); sessions.set(token, { email }); return res.json({ token, email }); }
  if (u.verifyCode !== code) return res.status(400).json({ error: 'bad_code' });
  store.users.update(email, { verified: true, verifyCode: null });
  const token = randomBytes(24).toString('hex'); sessions.set(token, { email });
  res.json({ token, email });
});

app.post('/api/auth/login', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const pw = String(req.body?.password || '');
  const u = store.users.find(email);
  if (!u || !verifyPw(pw, u.pw)) return res.status(401).json({ error: 'bad_credentials' });
  if (REQUIRE_VERIFY && !u.verified) return res.status(403).json({ error: 'not_verified', email });
  const token = randomBytes(24).toString('hex'); sessions.set(token, { email });
  res.json({ token, email });
});

app.get('/api/auth/me', (req, res) => {
  const s = sessions.get((req.headers.authorization || '').replace(/^Bearer /, ''));
  s ? res.json({ email: s.email }) : res.status(401).json({ error: 'no_session' });
});
app.post('/api/auth/logout', (req, res) => {
  sessions.delete((req.headers.authorization || '').replace(/^Bearer /, ''));
  res.json({ ok: true });
});

/* ============================ 直播间 + 地理封锁 / rooms + geo ============================ */
function requireAdmin(req, res, next) {
  if ((req.headers.authorization || '') === `Bearer ${ADMIN_TOKEN}`) return next();
  res.status(401).json({ error: 'unauthorized' });
}

// 公开列表（仅已发布）/ public published list
app.get('/api/live/rooms', (req, res, next) => {
  if (LIVE_API_BASE) return next();
  res.json({ rooms: store.rooms.published() });
});

// 单个房间：检查地理封锁 / single room with geo check
app.get('/api/live/room', (req, res, next) => {
  if (LIVE_API_BASE) return next();
  const room = store.rooms.get(req.query.id);
  if (!room) return res.status(404).json({ error: 'not found' });
  const country = visitorCountry(req);
  if (!isAllowed(room, country)) return res.status(451).json({ error: 'geo_blocked', country });

  // 若房间只填了 streamName 且配置了腾讯云，则现签发带签名的 .m3u8（每次请求新鲜、有时效）
  // If the room has a streamName and Tencent is configured, mint a fresh signed URL.
  const out = { ...room };
  if (!out.streamUrl && room.streamName && tencentConfigured()) {
    out.streamUrl = tencentSignedHls(room.streamName);
  }
  res.json({ room: out });
});

// 管理 / admin
app.get('/api/admin/rooms', requireAdmin, (_req, res) => res.json({ rooms: store.rooms.all() }));
app.post('/api/admin/rooms', requireAdmin, (req, res) => {
  const b = req.body || {};
  const room = {
    id: b.id || 'room-' + Date.now().toString(36),
    title: b.title || 'Untitled', category: b.category || '', categoryKey: b.categoryKey || 'esport',
    streamer: b.streamer || '', streamUrl: b.streamUrl || '', cover: b.cover || '',
    streamName: b.streamName || '',
    viewers: Number(b.viewers || 0), published: b.published !== false,
    geoAllow: Array.isArray(b.geoAllow) ? b.geoAllow.map(c => String(c).toUpperCase()) : [],
  };
  store.rooms.upsert(room);
  res.json({ room });
});
app.delete('/api/admin/rooms/:id', requireAdmin, (req, res) => { store.rooms.remove(req.params.id); res.json({ ok: true }); });

/* ============================ 广告位 / ad slots ============================ */
// 公开：按位置取一条广告（按权重随机）/ public: pick one ad for a slot
app.get('/api/ads', (req, res) => {
  const slot = String(req.query.slot || '');
  const list = store.ads.active(slot);
  if (!list.length) return res.json({ ad: null });
  const total = list.reduce((s, a) => s + (a.weight || 1), 0);
  let r = Math.random() * total, pick = list[0];
  for (const a of list) { r -= (a.weight || 1); if (r <= 0) { pick = a; break; } }
  res.json({ ad: pick });
});
// 管理 / admin
app.get('/api/admin/ads', requireAdmin, (_req, res) => res.json({ ads: store.ads.all() }));
app.post('/api/admin/ads', requireAdmin, (req, res) => {
  const b = req.body || {};
  const ad = {
    id: b.id || 'ad-' + Date.now().toString(36),
    slot: b.slot || 'home_top', type: b.type || 'image',
    image: b.image || '', link: b.link || '', html: b.html || '',
    weight: Number(b.weight || 1), active: b.active !== false,
  };
  store.ads.upsert(ad);
  res.json({ ad });
});
app.delete('/api/admin/ads/:id', requireAdmin, (req, res) => { store.ads.remove(req.params.id); res.json({ ok: true }); });

app.get('/health', (_req, res) => res.json({ ok: true, db: usingSqlite ? 'sqlite' : 'json' }));

/* 外部 LIVE_API 转发兜底 / fallback to external LIVE_API */
app.get('/api/live/rooms', (req, res) => forward(LIVE_API_BASE, LIVE_API_KEY, '/rooms', req.query, res));
app.get('/api/live/room',  (req, res) => forward(LIVE_API_BASE, LIVE_API_KEY, '/room',  req.query, res));

/* 静态前端：让本服务同时托管 public/（部署时一个服务即可）
const __pubDir = dirname(fileURLToPath(import.meta.url));

app.use(express.static(__pubDir));

app.get('/', (_req, res) => {
  res.sendFile(join(__pubDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`LIVE ARENA proxy + site on http://localhost:${PORT}`);
});
