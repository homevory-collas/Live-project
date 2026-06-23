/**
 * 开播台逻辑 / Streamer "Go Live" console.
 *
 * 这页让主播只用「摄像头」就能开播，并能在画面上贴广告文字 / Logo，
 * 还能切换多种直播间布景（scene）自由创作。
 * Lets a streamer go live with just a WEBCAM, paste ad text / logos onto the
 * picture, and switch between several creative room "scenes".
 *
 * ───────────────────────────────────────────────────────────────────────
 * 真正把画面送到观众端怎么做？/ How the picture actually reaches viewers:
 *
 *   [本页 getUserMedia 拿到摄像头/屏幕 MediaStream]
 *        │  浏览器只能"采集"，不能直接做大规模分发
 *        ▼
 *   把 MediaStream 推到你们的媒体服务器，二选一：
 *     A) WebRTC 推流（WHIP）—— 延迟最低，适合互动直播
 *        new RTCPeerConnection → addTrack(stream) → 把 SDP POST 到你的 WHIP 端点
 *        (如 MediaMTX / Janus / LiveKit / Cloudflare Stream 的 WHIP 入口)
 *     B) 通过一个本地/云端打包器把它转成 RTMP 再转 HLS（见 HUONG-DAN.md 的 1-2-3-4）
 *        浏览器原生不能推 RTMP，所以 WebRTC(WHIP) 是纯网页方案的首选。
 *        │
 *        ▼
 *   媒体服务器 transcode → 打包成 HLS(.m3u8) → CDN 分发
 *        │
 *        ▼
 *   live/rooms 接口把该房间的 .m3u8 作为 streamUrl 返回（见 adapters/liveRooms.js）
 *        │
 *        ▼
 *   观众打开 live.html?room=<id> → hls.js 播放 → 进入直播
 *
 * 下面 publishWHIP() 给出了浏览器侧 WebRTC 推流的最小骨架，
 * 把 CONFIG 里的 WHIP 地址填好即可真正开播。
 * publishWHIP() below is a minimal browser-side WebRTC(WHIP) publisher skeleton.
 * ───────────────────────────────────────────────────────────────────────
 */
import { CONFIG } from '../config.js';
import { t, getLang, applyDom, initLangSwitch } from '../i18n.js';
import { esc, qs } from '../ui/render.js';

const $ = s => document.querySelector(s);

/* 多种直播间布景 / multiple creative scenes（纯 CSS class，可让设计师再扩展）*/
const SCENES = [
  { key: 'clean',   zh: '极简',   en: 'Clean' },
  { key: 'arena',   zh: '竞技场', en: 'Arena' },
  { key: 'neon',    zh: '霓虹',   en: 'Neon' },
  { key: 'stadium', zh: '球场',   en: 'Stadium' },
  { key: 'studio',  zh: '演播室', en: 'Studio' },
  { key: 'retro',   zh: '复古',   en: 'Retro' },
];

let camStream = null;
let liveTimer = null, liveSeconds = 0;
let pc = null; // RTCPeerConnection（推流用）

/* ----------------------- 摄像头 / camera ----------------------- */
async function startCamera() {
  try {
    camStream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: true,
    });
    const cam = $('#cam');
    cam.srcObject = camStream;
    await cam.play().catch(() => {});
    $('#camHint').hidden = true;
    $('#btnGoLive').disabled = false;
  } catch (e) {
    $('#camHint').textContent = t('cam_denied');
    console.error(e);
  }
}

async function shareScreen() {
  try {
    const screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    camStream = screen;
    const cam = $('#cam');
    cam.srcObject = screen;
    await cam.play().catch(() => {});
    $('#camHint').hidden = true;
    $('#btnGoLive').disabled = false;
    // 用户停止共享时回收 / handle the browser "stop sharing"
    screen.getVideoTracks()[0].addEventListener('ended', () => {
      $('#camHint').hidden = false;
      $('#camHint').textContent = t('cam_hint');
    });
  } catch (e) { console.warn('screen share cancelled', e); }
}

/* ----------------------- 开/关播 / start-stop ----------------------- */
async function toggleLive() {
  const btn = $('#btnGoLive');
  if (liveTimer) { stopLive(); return; }
  if (!camStream) return;

  // 真实推流（可选）：填了 WHIP 地址就尝试 WebRTC 推流
  // Optional real publish: if a WHIP URL is configured, try WebRTC publishing.
  if (CONFIG.PUBLISH && CONFIG.PUBLISH.WHIP_URL) {
    try { await publishWHIP(camStream, CONFIG.PUBLISH.WHIP_URL); }
    catch (e) { console.warn('WHIP publish failed (still going "live" in demo):', e); }
  }

  $('#liveBadge').hidden = false;
  $('#glTimer').hidden = false;
  btn.textContent = t('stop_live');
  btn.classList.add('on');
  liveSeconds = 0;
  liveTimer = setInterval(() => {
    liveSeconds++;
    const m = String(Math.floor(liveSeconds / 60)).padStart(2, '0');
    const s = String(liveSeconds % 60).padStart(2, '0');
    $('#glTimer').textContent = `${m}:${s}`;
  }, 1000);

  // 演示：生成分享链接（真实环境里这里会先调你的建房 API 拿到 room id）
  const id = (qs('room') || 'my-' + Math.random().toString(36).slice(2, 7));
  const link = `${location.origin}${location.pathname.replace('go-live.html','live.html')}?room=${encodeURIComponent(id)}`;
  const sl = $('#shareLine');
  sl.hidden = false;
  sl.innerHTML = `${t('share_link')} <a href="${esc(link)}">${esc(link)}</a>`;
}

function stopLive() {
  clearInterval(liveTimer); liveTimer = null;
  $('#liveBadge').hidden = true;
  $('#glTimer').hidden = true;
  const btn = $('#btnGoLive');
  btn.textContent = t('go_live');
  btn.classList.remove('on');
  if (pc) { pc.close(); pc = null; }
}

/** 浏览器 WebRTC(WHIP) 推流最小骨架 / minimal WHIP publisher */
async function publishWHIP(stream, whipUrl) {
  pc = new RTCPeerConnection();
  stream.getTracks().forEach(track => pc.addTrack(track, stream));
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  const res = await fetch(whipUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/sdp' },
    body: offer.sdp,
  });
  if (!res.ok) throw new Error('WHIP endpoint returned ' + res.status);
  const answer = await res.text();
  await pc.setRemoteDescription({ type: 'answer', sdp: answer });
}

/* ----------------------- 布景 / scenes ----------------------- */
function buildScenes() {
  const box = $('#sceneList'), lang = getLang(), stage = $('#glStage');
  box.innerHTML = '';
  SCENES.forEach((sc, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'scene-chip scene-' + sc.key + (i === 0 ? ' on' : '');
    b.textContent = lang === 'zh' ? sc.zh : sc.en;
    b.addEventListener('click', () => {
      box.querySelectorAll('.scene-chip').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      SCENES.forEach(s => stage.classList.remove('sc-' + s.key));
      stage.classList.add('sc-' + sc.key);
    });
    box.appendChild(b);
  });
  stage.classList.add('sc-clean');
}

/* ----------------------- 叠加广告层 / ad overlays ----------------------- */
function makeDraggable(el) {
  el.addEventListener('pointerdown', e => {
    if (e.target.closest('input')) return;
    const layer = $('#ovLayer').getBoundingClientRect();
    const ox = e.clientX - el.getBoundingClientRect().left;
    const oy = e.clientY - el.getBoundingClientRect().top;
    el.setPointerCapture(e.pointerId);
    const move = ev => {
      let x = ((ev.clientX - layer.left - ox) / layer.width) * 100;
      let y = ((ev.clientY - layer.top - oy) / layer.height) * 100;
      x = Math.max(0, Math.min(92, x)); y = Math.max(0, Math.min(92, y));
      el.style.left = x + '%'; el.style.top = y + '%';
    };
    const up = () => { el.removeEventListener('pointermove', move); };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up, { once: true });
  });
  el.addEventListener('dblclick', () => el.remove()); // 双击删除 / dbl-click to remove
}

function addTextOverlay() {
  const txt = $('#ovText').value.trim();
  if (!txt) return;
  const el = document.createElement('div');
  el.className = 'ov-item ov-text';
  el.textContent = txt;
  el.style.left = '8%'; el.style.top = '12%';
  el.style.color = $('#ovColor').value;
  el.style.fontSize = $('#ovSize').value + 'px';
  $('#ovLayer').appendChild(el);
  makeDraggable(el);
  $('#ovText').value = '';
}

function addTicker() {
  const txt = $('#ovText').value.trim() || t('ticker_default');
  // 同一时间只保留一条滚动条 / keep a single ticker
  const old = $('#ovLayer .ov-ticker'); if (old) old.remove();
  const bar = document.createElement('div');
  bar.className = 'ov-item ov-ticker';
  bar.innerHTML = `<span>${esc(txt)}　•　${esc(txt)}　•　${esc(txt)}</span>`;
  $('#ovLayer').appendChild(bar);
  $('#ovText').value = '';
}

function addLogo(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const el = document.createElement('div');
    el.className = 'ov-item ov-logo';
    el.style.left = '72%'; el.style.top = '8%';
    el.innerHTML = `<img src="${reader.result}" alt="logo">`;
    $('#ovLayer').appendChild(el);
    makeDraggable(el);
  };
  reader.readAsDataURL(file);
}

/* 保存当前画面 + 叠加层为封面图 / snapshot frame+overlays as a cover image */
function saveFrame() {
  const cam = $('#cam');
  if (!cam.videoWidth) return;
  const c = document.createElement('canvas');
  c.width = cam.videoWidth; c.height = cam.videoHeight;
  c.getContext('2d').drawImage(cam, 0, 0, c.width, c.height);
  const a = document.createElement('a');
  a.href = c.toDataURL('image/png');
  a.download = 'cover.png';
  a.click();
  // 注：叠加文字/Logo 是 DOM 层，真实合成请在媒体服务器侧用 canvas 推流（见 publishWHIP 注释）
}

/* ----------------------- init ----------------------- */
window.addEventListener('DOMContentLoaded', () => {
  initLangSwitch($('#lang'));
  applyDom();
  buildScenes();

  $('#btnCam').addEventListener('click', startCamera);
  $('#btnScreen').addEventListener('click', shareScreen);
  $('#btnGoLive').addEventListener('click', toggleLive);
  $('#btnAddText').addEventListener('click', addTextOverlay);
  $('#btnAddTicker').addEventListener('click', addTicker);
  $('#btnClearOv').addEventListener('click', () => { $('#ovLayer').innerHTML = ''; });
  $('#btnSnap').addEventListener('click', saveFrame);
  $('#ovLogo').addEventListener('change', e => addLogo(e.target.files[0]));

  window.addEventListener('langchange', () => { applyDom(); buildScenes(); });
  window.addEventListener('beforeunload', () => {
    if (camStream) camStream.getTracks().forEach(t => t.stop());
  });
});
