/**
 * 直播间逻辑 / Live room logic.
 *
 * 「观众如何进入直播」的完整流程 / How a viewer ENTERS a stream:
 *   1) 首页点击直播间卡片 → 跳到 live.html?room=<id>
 *      Click a room card on home → navigate to live.html?room=<id>
 *   2) 这里读取 room id，调用 api.getRoom(id) 取回 streamUrl(.m3u8)
 *      Read room id, call api.getRoom(id) to get the streamUrl (.m3u8)
 *   3) 用 hls.js 把 streamUrl 挂到 <video> 上开始播放
 *      Attach streamUrl to <video> via hls.js and start playback
 *   4) 连接聊天 WebSocket（CONFIG.CHAT_WS_URL），无则用本地演示消息
 *      Connect chat WebSocket; fall back to local demo messages
 */
import { CONFIG } from '../config.js';
import { api } from '../api/index.js';
import { auth } from '../auth.js';
import { t, getLang, applyDom, initLangSwitch } from '../i18n.js';
import { esc, fmtViewers, qs } from '../ui/render.js';
import { EMOJI_GROUPS, ALL_EMOJIS } from '../ui/emojis.js';
import { loadAds } from '../ui/ads.js';

const $ = s => document.querySelector(s);

async function initRoom() {
  const id = qs('room');
  const titleEl = $('#roomTitle'), metaEl = $('#roomMeta'), video = $('#player');

  if (!id) { titleEl.textContent = t('no_room'); return; }

  let room;
  try { room = await api.getRoom(id); }
  catch (e) {
    if (e.status === 451) { titleEl.textContent = t('geo_blocked'); console.warn('geo blocked', e.body); return; }
    titleEl.textContent = t('stream_error'); console.error(e); return;
  }

  if (!room) { titleEl.textContent = t('no_room'); return; }

  titleEl.textContent = room.title;
  metaEl.innerHTML = `<span class="cat">${esc(room.category)}</span>
    <span class="who">${esc(room.streamer)}</span>
    <span class="vw">${fmtViewers(room.viewers, getLang())} ${t('watching')}</span>`;

  playStream(video, room.streamUrl);
  startChat(room);
  enforceGuestLimit(video);
  loadAds();   // 游客 5 分钟限制 / 5-min guest cap
}

/**
 * 未登录游客最多看 5 分钟，然后弹注册引导。
 * Guests (not logged in) watch up to 5 minutes, then a sign-up gate appears.
 *
 * ⚠️ 这是前端软限制：能挡住普通用户，但懂技术的人可绕过（直接取 .m3u8）。
 *    要硬性限制，必须在后端按登录态签发「带时效的播放令牌」。
 * ⚠️ Frontend soft-limit only. Tech-savvy users can bypass it (grab the .m3u8).
 *    For a hard limit, sign short-lived playback tokens on the backend by login state.
 */
function enforceGuestLimit(video) {
  if (auth.isLoggedIn()) return;        // 已登录不限制 / logged in = unlimited
  const LIMIT_MS = 5 * 60 * 1000;       // 5 分钟 / 5 minutes

  showGuestBanner(LIMIT_MS);            // 一进来就提示条件 / inform up-front

  setTimeout(() => {
    if (auth.isLoggedIn()) return;      // 期间登录了就放行 / logged in meanwhile
    try { video.pause(); } catch {}
    showGuestGate();
  }, LIMIT_MS);
}

/** 进入即显示的提示横幅 + 倒计时 / up-front banner with countdown */
function showGuestBanner(limitMs) {
  const wrap = document.querySelector('.stage-wrap');
  if (!wrap || wrap.querySelector('.guest-banner')) return;
  const next = encodeURIComponent(location.pathname + location.search);

  const bar = document.createElement('div');
  bar.className = 'guest-banner';
  bar.innerHTML = `
    <span class="gb-text">${esc(t('banner_text'))}
      <b class="gb-timer" id="gbTimer"></b></span>
    <a class="btn red sm" href="auth.html?mode=register&next=${next}">${esc(t('register'))}</a>`;
  wrap.insertBefore(bar, wrap.firstChild);

  // 倒计时 / countdown
  const end = Date.now() + limitMs;
  const timer = bar.querySelector('#gbTimer');
  const tick = () => {
    if (auth.isLoggedIn()) { bar.remove(); return; }
    const left = Math.max(0, end - Date.now());
    const m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
    timer.textContent = `${m}:${String(s).padStart(2, '0')}`;
    if (left <= 0) { clearInterval(iv); }
  };
  tick();
  const iv = setInterval(tick, 1000);
}

function showGuestGate() {
  const stage = document.querySelector('.stage');
  if (!stage || stage.querySelector('.guest-gate')) return;
  const next = encodeURIComponent(location.pathname + location.search);
  const gate = document.createElement('div');
  gate.className = 'guest-gate';
  gate.innerHTML = `
    <div class="gg-box">
      <h3>${esc(t('gate_title'))}</h3>
      <p>${esc(t('gate_desc'))}</p>
      <div class="gg-btns">
        <a class="btn red" href="auth.html?mode=register&next=${next}">${esc(t('register'))}</a>
        <a class="btn line" href="auth.html?mode=login&next=${next}">${esc(t('login'))}</a>
      </div>
    </div>`;
  stage.appendChild(gate);
}

/** 播放 HLS 直播流 / play an HLS stream */
function playStream(video, url) {
  const onErr = () => { $('#streamMsg').textContent = t('stream_error'); $('#streamMsg').hidden = false; };
  if (!url) return onErr();

  if (window.Hls && window.Hls.isSupported()) {
    const hls = new window.Hls({ liveDurationInfinity: true, lowLatencyMode: true });
    hls.loadSource(url);
    hls.attachMedia(video);
    hls.on(window.Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
    // 直播流容易瞬断，先尝试自恢复，连续致命错误才报错
    // live streams hiccup; try to self-recover before showing an error
    let fatalCount = 0;
    hls.on(window.Hls.Events.ERROR, (_e, data) => {
      if (!data.fatal) return;
      fatalCount++;
      if (fatalCount > 3) return onErr();
      switch (data.type) {
        case window.Hls.ErrorTypes.NETWORK_ERROR: hls.startLoad(); break;     // 重新拉流 / retry
        case window.Hls.ErrorTypes.MEDIA_ERROR:   hls.recoverMediaError(); break;
        default: onErr();
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    // Safari / iOS 原生支持 HLS / native HLS
    video.src = url;
    video.addEventListener('loadedmetadata', () => video.play().catch(() => {}));
    video.addEventListener('error', onErr);
  } else {
    onErr();
  }
}

/* ----------------------- 聊天 / chat ----------------------- */
function startChat(room) {
  const body = $('#chatBody'), input = $('#chatInput'), btn = $('#chatSend');

  showChatPledge();                       // 文明观赛公约 / civil-chat pledge
  buildEmojiPanel(input);                 // 表情面板（100 个）/ emoji panel (100)
  const reactLayer = ensureReactionLayer(); // 飘屏反应层 / floating reaction layer

  // 一条消息里若只含表情则放大显示 / enlarge emoji-only messages
  const isEmojiOnly = txt => {
    const stripped = txt.replace(/\s+/g, '');
    return stripped.length > 0 && [...stripped].every(ch => ALL_EMOJIS.includes(ch));
  };

  const push = (name, text, mine = false) => {
    const el = document.createElement('div');
    el.className = 'cmsg' + (mine ? ' me' : '') + (isEmojiOnly(text) ? ' big' : '');
    el.innerHTML = `<b>${esc(name)}</b><span>${esc(text)}</span>`;
    body.appendChild(el); body.scrollTop = body.scrollHeight;
    while (body.children.length > 200) body.removeChild(body.firstChild);
    // 收到含表情的消息时，飘屏 / float the emojis it contains
    [...text].filter(ch => ALL_EMOJIS.includes(ch)).slice(0, 5)
      .forEach(ch => floatReaction(reactLayer, ch));
  };

  let ws = null;
  if (CONFIG.CHAT_WS_URL) {
    // 真实聊天：连接你的 WebSocket 服务 / real chat via your WS server
    try {
      ws = new WebSocket(`${CONFIG.CHAT_WS_URL}?room=${encodeURIComponent(room.id)}`);
      ws.onmessage = ev => {
        try {
          const m = JSON.parse(ev.data);
          if (m.type === 'system' && typeof m.count === 'number') {
            // 实时在线人数 / live viewer count
            const vw = document.querySelector('#roomMeta .vw');
            if (vw) vw.textContent = `${fmtViewers(m.count, getLang())} ${t('watching')}`;
            return;
          }
          push(m.user || 'user', m.text);
        } catch {}
      };
    } catch (e) { console.warn('chat ws failed', e); }
  } else {
    // 本地演示消息 / local demo messages
    const demo = ['这波操作太强了！🔥', '比分追平了 😱', '解说666 👏', 'GG 🎮', '主队加油 ⚽💪', '画面很清晰 ✨', '👍👍👍', '❤️❤️'];
    const users = ['观众A', 'fan_88', '老王看球', 'esports_cn', '路人甲'];
    setInterval(() => {
      if (document.hidden) return;
      push(users[Math.random() * users.length | 0], demo[Math.random() * demo.length | 0]);
    }, 3500);
  }

  const send = () => {
    const v = input.value.trim(); if (!v) return;
    push('me', v, true); input.value = '';
    if (ws && ws.readyState === 1) ws.send(JSON.stringify({ room: room.id, text: v }));
  };
  btn.addEventListener('click', send);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
}

/* 文明观赛公约 / civil-chat pledge shown above the chat */
function showChatPledge() {
  const head = document.querySelector('.chat-head');
  if (!head || document.querySelector('.chat-pledge')) return;
  const p = document.createElement('div');
  p.className = 'chat-pledge';
  p.textContent = t('chat_pledge');
  head.insertAdjacentElement('afterend', p);
}

/* ---- 100 个表情面板 / 100-emoji picker ---- */
function buildEmojiPanel(input) {
  const wrap = $('.chat-input');
  if (!wrap) return;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'emoji-btn';
  toggle.textContent = '😀';
  toggle.setAttribute('aria-label', 'emoji');

  const panel = document.createElement('div');
  panel.className = 'emoji-panel';
  panel.hidden = true;

  const tabs = document.createElement('div');
  tabs.className = 'emoji-tabs';
  const grid = document.createElement('div');
  grid.className = 'emoji-grid';
  panel.append(tabs, grid);

  const lang = getLang();
  EMOJI_GROUPS.forEach((g, i) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'emoji-tab' + (i === 0 ? ' on' : '');
    tab.textContent = lang === 'zh' ? g.label_zh : g.label_en;
    tab.addEventListener('click', () => {
      tabs.querySelectorAll('.emoji-tab').forEach(x => x.classList.remove('on'));
      tab.classList.add('on');
      renderGrid(g.items);
    });
    tabs.appendChild(tab);
  });

  function renderGrid(items) {
    grid.innerHTML = '';
    items.forEach(ch => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'emoji-cell';
      b.textContent = ch;
      b.addEventListener('click', () => {
        const start = input.selectionStart ?? input.value.length;
        input.value = input.value.slice(0, start) + ch + input.value.slice(start);
        input.focus();
        const pos = start + ch.length;
        input.setSelectionRange(pos, pos);
      });
      grid.appendChild(b);
    });
  }
  renderGrid(EMOJI_GROUPS[0].items);

  toggle.addEventListener('click', e => { e.stopPropagation(); panel.hidden = !panel.hidden; });
  document.addEventListener('click', e => {
    if (!panel.hidden && !panel.contains(e.target) && e.target !== toggle) panel.hidden = true;
  });

  // 放在输入框前面 / insert before the input
  wrap.insertBefore(toggle, wrap.firstChild);
  wrap.appendChild(panel);
}

/* ---- 表情飘屏 / floating emoji reactions over the video ---- */
function ensureReactionLayer() {
  const stage = document.querySelector('.stage');
  if (!stage) return null;
  let layer = stage.querySelector('.react-layer');
  if (!layer) {
    layer = document.createElement('div');
    layer.className = 'react-layer';
    stage.appendChild(layer);
  }
  return layer;
}

function floatReaction(layer, ch) {
  if (!layer) return;
  const el = document.createElement('span');
  el.className = 'react-fly';
  el.textContent = ch;
  el.style.left = (8 + Math.random() * 30) + '%';
  el.style.fontSize = (22 + Math.random() * 18) + 'px';
  el.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');
  el.style.animationDuration = (2.4 + Math.random() * 1.2) + 's';
  layer.appendChild(el);
  setTimeout(() => el.remove(), 3800);
}

window.addEventListener('DOMContentLoaded', () => {
  initLangSwitch($('#lang'));
  applyDom();
  initRoom();
  window.addEventListener('langchange', () => { applyDom(); });
});
