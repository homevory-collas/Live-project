/**
 * 管理后台逻辑 / Admin dashboard logic.
 * 通过 server/proxy.js 的 /api/admin/* 接口管理直播间。
 * Manages rooms via the /api/admin/* endpoints in server/proxy.js.
 *
 * 鉴权：所有请求带 Authorization: Bearer <ADMIN_TOKEN>。
 * token 只存在内存中（不落地），刷新页面需重新登录——简单且足够安全用于内部后台。
 * Auth: every request carries the admin token; kept in memory only.
 */
import { CONFIG } from '../config.js';
import { esc } from '../ui/render.js';

const $ = s => document.querySelector(s);
const BASE = CONFIG.API_BASE.replace(/\/$/, '');
let TOKEN = '';

async function api(path, opts = {}) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}`, ...(opts.headers || {}) },
  });
  if (res.status === 401) throw new Error('unauthorized');
  return res.json();
}

/* ---- 登录 / login ---- */
async function login() {
  TOKEN = $('#tokenInput').value.trim();
  if (!TOKEN) return;
  try {
    await api('/admin/rooms');           // 试探一次 / probe
    $('#loginView').hidden = true;
    $('#dashView').hidden = false;
    loadRooms();
    loadAdminAds();
  } catch {
    $('#loginErr').hidden = false;
  }
}

/* ---- 列表 / list ---- */
async function loadRooms() {
  const list = $('#roomList');
  list.innerHTML = '<p class="gl-tip">加载中… / Loading…</p>';
  try {
    const { rooms = [] } = await api('/admin/rooms');
    $('#count').textContent = rooms.length;
    if (!rooms.length) { list.innerHTML = '<p class="gl-tip">暂无直播间 / No rooms yet.</p>'; return; }
    list.innerHTML = '';
    rooms.forEach(r => {
      const row = document.createElement('div');
      row.className = 'adm-row' + (r.published === false ? ' off' : '');
      row.innerHTML = `
        <div class="ar-main">
          <b>${esc(r.title)}</b>
          <small>${esc(r.id)} · ${esc(r.categoryKey || '')} ${r.published === false ? '· 草稿/draft' : ''}</small>
          <small class="ar-url">${r.streamUrl ? esc(r.streamUrl) : '⚠ 无 .m3u8 / no stream'}</small>
        </div>
        <div class="ar-act">
          <a class="btn line sm" href="live.html?room=${encodeURIComponent(r.id)}" target="_blank">看 / View</a>
          <button class="btn line sm" data-edit>改 / Edit</button>
          <button class="btn line sm danger" data-del>删 / Del</button>
        </div>`;
      row.querySelector('[data-edit]').addEventListener('click', () => fillForm(r));
      row.querySelector('[data-del]').addEventListener('click', () => delRoom(r));
      list.appendChild(row);
    });
  } catch { list.innerHTML = '<p class="adm-err">读取失败 / Failed to load.</p>'; }
}

/* ---- 表单 / form ---- */
function fillForm(r) {
  $('#formTitle').textContent = '编辑直播间 / Edit room';
  $('#fId').value = r.id || '';
  $('#fTitle').value = r.title || '';
  $('#fCat').value = r.category || '';
  $('#fCatKey').value = r.categoryKey || 'esport';
  $('#fStreamer').value = r.streamer || '';
  $('#fStream').value = r.streamUrl || '';
  $('#fStreamName').value = r.streamName || '';
  $('#fCover').value = r.cover || '';
  $('#fGeo').value = (r.geoAllow || []).join(',');
  $('#fPub').checked = r.published !== false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function resetForm() {
  $('#formTitle').textContent = '新建直播间 / New room';
  ['fId', 'fTitle', 'fCat', 'fStreamer', 'fStream', 'fStreamName', 'fCover', 'fGeo'].forEach(id => $('#' + id).value = '');
  $('#fCatKey').value = 'esport'; $('#fPub').checked = true; $('#formErr').hidden = true;
}

async function saveRoom() {
  const payload = {
    id: $('#fId').value || undefined,
    title: $('#fTitle').value.trim(),
    category: $('#fCat').value.trim(),
    categoryKey: $('#fCatKey').value,
    streamer: $('#fStreamer').value.trim(),
    streamUrl: $('#fStream').value.trim(),
    streamName: $('#fStreamName').value.trim(),
    cover: $('#fCover').value.trim(),
    published: $('#fPub').checked,
    geoAllow: $('#fGeo').value.split(',').map(s => s.trim().toUpperCase()).filter(Boolean),
  };
  if (!payload.title) { showErr('请填标题 / Title required'); return; }
  try {
    await api('/admin/rooms', { method: 'POST', body: JSON.stringify(payload) });
    resetForm(); loadRooms();
  } catch { showErr('保存失败 / Save failed'); }
}

async function delRoom(r) {
  if (!confirm(`删除「${r.title}」? / Delete this room?`)) return;
  try { await api('/admin/rooms/' + encodeURIComponent(r.id), { method: 'DELETE' }); loadRooms(); }
  catch { alert('删除失败 / Delete failed'); }
}

function showErr(msg) { const e = $('#formErr'); e.textContent = msg; e.hidden = false; }

/* ---- 广告管理 / ads ---- */
async function loadAdminAds() {
  const list = $('#adList');
  list.innerHTML = '<p class="gl-tip">加载中… / Loading…</p>';
  try {
    const { ads = [] } = await api('/admin/ads');
    $('#adCount').textContent = ads.length;
    if (!ads.length) { list.innerHTML = '<p class="gl-tip">暂无广告 / No ads.</p>'; return; }
    list.innerHTML = '';
    ads.forEach(a => {
      const row = document.createElement('div');
      row.className = 'adm-row' + (a.active === false ? ' off' : '');
      row.innerHTML = `
        <div class="ar-main">
          <b>${esc(a.slot)}</b>
          <small>${esc(a.type)} · weight ${a.weight || 1} ${a.active === false ? '· 停用/off' : ''}</small>
          <small class="ar-url">${esc(a.image || a.html || a.link || '')}</small>
        </div>
        <div class="ar-act">
          <button class="btn line sm" data-edit>改 / Edit</button>
          <button class="btn line sm danger" data-del>删 / Del</button>
        </div>`;
      row.querySelector('[data-edit]').addEventListener('click', () => fillAdForm(a));
      row.querySelector('[data-del]').addEventListener('click', () => delAd(a));
      list.appendChild(row);
    });
  } catch { list.innerHTML = '<p class="adm-err">读取失败 / Failed.</p>'; }
}

function fillAdForm(a) {
  $('#aId').value = a.id || ''; $('#aSlot').value = a.slot || 'home_top';
  $('#aType').value = a.type || 'image'; $('#aImage').value = a.image || '';
  $('#aLink').value = a.link || ''; $('#aHtml').value = a.html || '';
  $('#aWeight').value = a.weight || 1; $('#aActive').checked = a.active !== false;
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}
function resetAdForm() {
  ['aId', 'aImage', 'aLink', 'aHtml', 'aWeight'].forEach(id => $('#' + id).value = '');
  $('#aSlot').value = 'home_top'; $('#aType').value = 'image'; $('#aActive').checked = true;
}
async function saveAd() {
  const payload = {
    id: $('#aId').value || undefined,
    slot: $('#aSlot').value, type: $('#aType').value,
    image: $('#aImage').value.trim(), link: $('#aLink').value.trim(),
    html: $('#aHtml').value.trim(), weight: Number($('#aWeight').value || 1),
    active: $('#aActive').checked,
  };
  try { await api('/admin/ads', { method: 'POST', body: JSON.stringify(payload) }); resetAdForm(); loadAdminAds(); }
  catch { alert('保存失败 / Save failed'); }
}
async function delAd(a) {
  if (!confirm('删除广告? / Delete this ad?')) return;
  try { await api('/admin/ads/' + encodeURIComponent(a.id), { method: 'DELETE' }); loadAdminAds(); }
  catch { alert('删除失败 / Failed'); }
}

window.addEventListener('DOMContentLoaded', () => {
  $('#loginBtn').addEventListener('click', login);
  $('#tokenInput').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
  $('#saveBtn').addEventListener('click', saveRoom);
  $('#resetBtn').addEventListener('click', resetForm);
  $('#adSaveBtn').addEventListener('click', saveAd);
  $('#adResetBtn').addEventListener('click', resetAdForm);
});
