/**
 * 登录/注册页逻辑 / Login & Register page logic.
 * 成功后跳回来源页（?next=...）或首页。
 * On success, redirect to ?next= or home.
 */
import { auth } from '../auth.js';
import { t, applyDom, initLangSwitch } from '../i18n.js';
import { qs } from '../ui/render.js';

const $ = s => document.querySelector(s);
let mode = 'login';   // 'login' | 'register'

function setMode(m) {
  mode = m;
  $('#tabLogin').classList.toggle('on', m === 'login');
  $('#tabReg').classList.toggle('on', m === 'register');
  $('#submitBtn').textContent = m === 'login' ? t('login') : t('register');
  $('#password').setAttribute('autocomplete', m === 'login' ? 'current-password' : 'new-password');
  $('#err').hidden = true;
}

const ERR = {
  invalid_email: '邮箱格式不正确 / Invalid email',
  weak_password: '密码至少 6 位 / Password ≥ 6 chars',
  email_taken: '该邮箱已注册 / Email already registered',
  bad_credentials: '邮箱或密码错误 / Wrong email or password',
  bad_code: '验证码错误 / Wrong code',
  not_verified: '请先验证邮箱 / Please verify your email first',
};
function showErr(code) {
  const e = $('#err');
  e.textContent = ERR[code] || ('出错了 / Error: ' + code);
  e.hidden = false;
}

async function submit() {
  const email = $('#email').value.trim();
  const password = $('#password').value;
  $('#submitBtn').disabled = true;
  try {
    if (mode === 'verify') {
      await auth.verify(pendingEmail, $('#password').value.trim());
      location.href = qs('next') || 'index.html';
      return;
    }
    if (mode === 'register') {
      const r = await auth.register(email, password);
      if (r.needVerify) { enterVerifyMode(email); return; }   // chuyển sang nhập mã
    } else {
      await auth.login(email, password);
    }
    location.href = qs('next') || 'index.html';
  } catch (e) {
    showErr(e.message);
  } finally {
    $('#submitBtn').disabled = false;
  }
}

let pendingEmail = '';
function enterVerifyMode(email) {
  mode = 'verify';
  pendingEmail = email;
  $('#sub').textContent = t('verify_sub');
  document.querySelector('label[data-i18n="email"]').style.display = 'none';
  const pwLabel = document.querySelector('label[data-i18n="password"]');
  pwLabel.firstChild.textContent = t('verify_code') + ' ';
  $('#password').type = 'text';
  $('#password').value = '';
  $('#password').placeholder = '6-digit code';
  $('#submitBtn').textContent = t('verify_btn');
  $('#tabLogin').style.display = $('#tabReg').style.display = 'none';
  $('#err').hidden = true;
}

window.addEventListener('DOMContentLoaded', () => {
  initLangSwitch();
  applyDom();
  // 已登录则直接回去 / already logged in → bounce back
  if (auth.isLoggedIn()) { location.href = qs('next') || 'index.html'; return; }
  if (qs('mode') === 'register') setMode('register'); else setMode('login');

  $('#tabLogin').addEventListener('click', () => setMode('login'));
  $('#tabReg').addEventListener('click', () => setMode('register'));
  $('#submitBtn').addEventListener('click', submit);
  $('#password').addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
});
