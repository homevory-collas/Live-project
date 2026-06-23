/**
 * ============================================================
 *  存储层 / Storage layer
 *  优先用 SQLite（better-sqlite3）；未安装则回退到 JSON 文件，
 *  这样开箱即跑，装了依赖即升级到数据库——无需改业务代码。
 *  Uses SQLite (better-sqlite3) if installed; otherwise falls back to
 *  JSON files. Runs out of the box; upgrades to a DB once the dep is present.
 *
 *  生产建议 / Production: 装 better-sqlite3，或把本文件换成 Postgres 适配。
 *  Install better-sqlite3, or swap this file for a Postgres adapter.
 *
 *  对外暴露统一 API（业务代码只用这些）/ unified API used by proxy.js:
 *    users.find(email) / users.create(u) / users.update(email, patch)
 *    rooms.all() / rooms.published() / rooms.get(id) / rooms.upsert(r) / rooms.remove(id)
 *    ads.active(slot) / ads.all() / ads.upsert(a) / ads.remove(id)
 * ============================================================ */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));

let Database = null;
try {
  // 动态加载，未安装也不报错 / optional dependency
  ({ default: Database } = await import('better-sqlite3'));
} catch {
  console.warn('[db] better-sqlite3 not installed → using JSON file fallback (fine for demo, NOT for scale).');
}

/* ============================ SQLite 实现 ============================ */
function makeSqlite() {
  const db = new Database(join(__dir, 'livearena.db'));
  db.pragma('journal_mode = WAL');           // 并发更友好 / better concurrency
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY, pw TEXT NOT NULL,
      verified INTEGER DEFAULT 0, verifyCode TEXT, createdAt INTEGER
    );
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY, title TEXT, category TEXT, categoryKey TEXT,
      streamer TEXT, streamUrl TEXT, streamName TEXT, cover TEXT, viewers INTEGER DEFAULT 0,
      published INTEGER DEFAULT 1, geoAllow TEXT
    );
    CREATE TABLE IF NOT EXISTS ads (
      id TEXT PRIMARY KEY, slot TEXT, type TEXT, image TEXT, link TEXT,
      html TEXT, weight INTEGER DEFAULT 1, active INTEGER DEFAULT 1
    );
  `);

  const bool = v => v ? 1 : 0;
  const roomOut = r => r && { ...r, published: !!r.published, geoAllow: r.geoAllow ? JSON.parse(r.geoAllow) : [] };
  const adOut = a => a && { ...a, active: !!a.active };

  return {
    users: {
      find: email => db.prepare('SELECT * FROM users WHERE email=?').get(email) || null,
      create: u => db.prepare('INSERT INTO users (email,pw,verified,verifyCode,createdAt) VALUES (?,?,?,?,?)')
                     .run(u.email, u.pw, bool(u.verified), u.verifyCode || null, u.createdAt || Date.now()),
      update: (email, patch) => {
        const cur = db.prepare('SELECT * FROM users WHERE email=?').get(email); if (!cur) return;
        const m = { ...cur, ...patch, verified: bool(patch.verified ?? cur.verified) };
        db.prepare('UPDATE users SET pw=?,verified=?,verifyCode=? WHERE email=?')
          .run(m.pw, m.verified, m.verifyCode, email);
      },
    },
    rooms: {
      all: () => db.prepare('SELECT * FROM rooms').all().map(roomOut),
      published: () => db.prepare('SELECT * FROM rooms WHERE published=1').all().map(roomOut),
      get: id => roomOut(db.prepare('SELECT * FROM rooms WHERE id=?').get(id)),
      upsert: r => db.prepare(`INSERT INTO rooms (id,title,category,categoryKey,streamer,streamUrl,streamName,cover,viewers,published,geoAllow)
        VALUES (@id,@title,@category,@categoryKey,@streamer,@streamUrl,@streamName,@cover,@viewers,@published,@geoAllow)
        ON CONFLICT(id) DO UPDATE SET title=@title,category=@category,categoryKey=@categoryKey,streamer=@streamer,
        streamUrl=@streamUrl,streamName=@streamName,cover=@cover,viewers=@viewers,published=@published,geoAllow=@geoAllow`)
        .run({ ...r, streamName: r.streamName || '', published: bool(r.published), geoAllow: JSON.stringify(r.geoAllow || []) }),
      remove: id => db.prepare('DELETE FROM rooms WHERE id=?').run(id),
    },
    ads: {
      all: () => db.prepare('SELECT * FROM ads').all().map(adOut),
      active: slot => db.prepare('SELECT * FROM ads WHERE active=1 AND slot=?').all(slot).map(adOut),
      upsert: a => db.prepare(`INSERT INTO ads (id,slot,type,image,link,html,weight,active)
        VALUES (@id,@slot,@type,@image,@link,@html,@weight,@active)
        ON CONFLICT(id) DO UPDATE SET slot=@slot,type=@type,image=@image,link=@link,html=@html,weight=@weight,active=@active`)
        .run({ ...a, active: bool(a.active) }),
      remove: id => db.prepare('DELETE FROM ads WHERE id=?').run(id),
    },
  };
}

/* ============================ JSON 回退实现 ============================ */
function makeJson() {
  const F = name => join(__dir, name);
  const rd = (f, d) => { try { return existsSync(F(f)) ? JSON.parse(readFileSync(F(f), 'utf8')) : d; } catch { return d; } };
  const wr = (f, v) => writeFileSync(F(f), JSON.stringify(v, null, 2));

  return {
    users: {
      find: email => rd('users.data.json', []).find(u => u.email === email) || null,
      create: u => { const l = rd('users.data.json', []); l.push(u); wr('users.data.json', l); },
      update: (email, patch) => { const l = rd('users.data.json', []); const i = l.findIndex(u => u.email === email); if (i >= 0) { l[i] = { ...l[i], ...patch }; wr('users.data.json', l); } },
    },
    rooms: {
      all: () => rd('rooms.data.json', []),
      published: () => rd('rooms.data.json', []).filter(r => r.published !== false),
      get: id => rd('rooms.data.json', []).find(r => r.id === id) || null,
      upsert: r => { const l = rd('rooms.data.json', []); const i = l.findIndex(x => x.id === r.id); if (i >= 0) l[i] = { ...l[i], ...r }; else l.push(r); wr('rooms.data.json', l); },
      remove: id => wr('rooms.data.json', rd('rooms.data.json', []).filter(r => r.id !== id)),
    },
    ads: {
      all: () => rd('ads.data.json', []),
      active: slot => rd('ads.data.json', []).filter(a => a.active !== false && a.slot === slot),
      upsert: a => { const l = rd('ads.data.json', []); const i = l.findIndex(x => x.id === a.id); if (i >= 0) l[i] = { ...l[i], ...a }; else l.push(a); wr('ads.data.json', l); },
      remove: id => wr('ads.data.json', rd('ads.data.json', []).filter(a => a.id !== id)),
    },
  };
}

export const store = Database ? makeSqlite() : makeJson();
export const usingSqlite = !!Database;
