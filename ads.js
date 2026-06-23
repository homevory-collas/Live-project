/**
 * 广告位前端 / Ad slots (frontend).
 * 在页面放一个容器： <div data-ad-slot="home_top"></div>
 * 本模块自动拉取该位置的广告并渲染（图片或自定义 HTML）。
 * Put <div data-ad-slot="home_top"></div> in the page; this fills it.
 *
 * 位置名约定 / slot names: home_top, home_side, live_below, live_preroll …
 */
import { CONFIG } from './config.js';

const BASE = CONFIG.API_BASE.replace(/\/$/, '');

async function fetchAd(slot) {
  try {
    if (CONFIG.USE_MOCK) {
      // 演示广告 / demo ad so the slot is visible offline
      return { type: 'image', image: '', link: '#', _demo: true, slot };
    }
    const r = await fetch(`${BASE}/ads?slot=${encodeURIComponent(slot)}`);
    const { ad } = await r.json();
    return ad;
  } catch { return null; }
}

function renderAd(el, ad) {
  if (!ad) { el.style.display = 'none'; return; }
  el.classList.add('ad-rendered');
  if (ad._demo) {
    el.innerHTML = `<div class="ad-demo"><span>广告位 / Ad slot</span><small>${ad.slot}</small></div>`;
    return;
  }
  if (ad.type === 'html' && ad.html) { el.innerHTML = ad.html; return; }
  if (ad.image) {
    const img = `<img src="${ad.image}" alt="ad" loading="lazy">`;
    el.innerHTML = ad.link ? `<a href="${ad.link}" target="_blank" rel="noopener nofollow">${img}</a>` : img;
  }
}

/** 扫描页面所有广告位并填充 / fill every [data-ad-slot] on the page */
export async function loadAds() {
  const slots = document.querySelectorAll('[data-ad-slot]');
  for (const el of slots) {
    const ad = await fetchAd(el.dataset.adSlot);
    renderAd(el, ad);
  }
}
