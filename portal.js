/** 首页逻辑 / Home page logic */
import { api } from '../api/index.js';
import { t, getLang, applyDom, initLangSwitch } from '../i18n.js';
import { esc, fmtViewers } from '../ui/render.js';
import { loadAds } from '../ui/ads.js';

const $ = sel => document.querySelector(sel);

async function loadLiveRooms() {
  const box = $('#liveGrid');
  try {
    const rooms = await api.getLiveRooms();
    const lang = getLang();
    box.innerHTML = rooms.map(r => `
      <a class="lcard" href="live.html?room=${encodeURIComponent(r.id)}">
        <div class="th" style="background:${esc(r.cover)}">
          <span class="lv"><i></i>${t('live')}</span>
          <span class="vw">${fmtViewers(r.viewers, lang)} ${t('watching')}</span>
        </div>
        <div class="cap"><span class="cat">${esc(r.category)}</span><span class="ti">${esc(r.title)}</span></div>
      </a>`).join('');
  } catch (e) { box.innerHTML = `<p class="err">${esc(e.message)}</p>`; }
}

async function loadScores(group = 'hot') {
  const box = $('#scoreList');
  try {
    const list = await api.getScores(group);
    box.innerHTML = list.map(m => {
      const score = m.status === 'upcoming'
        ? `<span class="vs">${esc(m.clock || t('vs'))}</span>`
        : `<b>${m.hs ?? 0}</b><b>${m.as ?? 0}</b>`;
      const when = m.status === 'live'
        ? `<span class="slive"><i></i>${t('live')}</span><span>${esc(m.clock)}</span>`
        : `<span class="sfin">${esc(m.clock)}</span>`;
      return `<div class="match">
        <div class="when">${when}</div>
        <div class="teams"><span>${esc(m.home)}</span><span>${esc(m.away)}</span></div>
        <div class="sc">${score}</div>
        <div class="lg">${esc(m.league)}</div>
      </div>`;
    }).join('');
  } catch (e) { box.innerHTML = `<p class="err">${esc(e.message)}</p>`; }
}

async function loadStandings() {
  const box = $('#standings');
  try {
    const rows = await api.getStandings('epl');
    box.innerHTML = `<table class="stand">
      <tr><th>#</th><th>${t('col_team')}</th><th>W</th><th>D</th><th>L</th><th>${t('col_pts')}</th></tr>
      ${rows.map(r => `<tr><td>${r.rank}</td><td class="tn">${esc(r.team)}</td>
        <td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td class="pts">${r.pts}</td></tr>`).join('')}
    </table>`;
  } catch (e) { box.innerHTML = `<p class="err">${esc(e.message)}</p>`; }
}

async function loadNews() {
  const box = $('#newsList');
  try {
    const list = await api.getNews();
    box.innerHTML = list.map(n =>
      `<li class="${n.hot ? 'hot' : ''}"><i>${n.hot ? '🔥' : '›'}</i><span>${esc(n.title)}</span></li>`).join('');
  } catch (e) { box.innerHTML = `<p class="err">${esc(e.message)}</p>`; }
}

function wireScoreTabs() {
  const tabs = $('#scoreTabs');
  tabs.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    tabs.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    loadScores(b.dataset.g);
  });
}

function renderAll() { applyDom(); loadLiveRooms(); loadScores('hot'); loadStandings(); loadNews(); loadAds(); }

window.addEventListener('DOMContentLoaded', () => {
  initLangSwitch($('#lang'));
  wireScoreTabs();
  renderAll();
  // 切换语言时重渲染动态内容 / re-render dynamic content on language change
  window.addEventListener('langchange', renderAll);
});
