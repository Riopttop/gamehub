/**
 * Header
 * ----------------------------------------------------------------
 * 헤더 영역의 유저 칩, 로그인/로그아웃 버튼 관리.
 *
 * Auth 상태에 따라:
 *   - 게스트: 아바타 'G', 이름 '게스트', [로그인] 버튼 표시
 *   - 로그인됨: 아바타 첫 글자, 이름 표시, [로그아웃] 버튼 표시
 */

import * as Auth from '../core/Auth.js';
import * as i18n from '../core/i18n.js';
import { on } from '../core/EventBus.js';

let els = {};

/**
 * @param {Object} options
 * @param {Function} options.onLoginClick - 로그인 버튼 클릭 시 호출 (모달 열기 등)
 */
export function init(options = {}) {
  els = {
    avatar: document.getElementById('userAvatar'),
    name: document.getElementById('userName'),
    loginBtn: document.getElementById('loginBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
  };

  els.loginBtn.addEventListener('click', () => options.onLoginClick?.());
  els.logoutBtn.addEventListener('click', () => Auth.logout());

  on('auth:changed', render);
  on('lang:changed', render);

  render();
}

function render() {
  const user = Auth.getUser();

  if (user) {
    const name = user.name || 'User';
    els.avatar.textContent = name.charAt(0).toUpperCase();
    els.name.textContent = name;
    els.name.removeAttribute('data-i18n');
    els.loginBtn.hidden = true;
    els.logoutBtn.hidden = false;
  } else {
    els.avatar.textContent = 'G';
    els.name.setAttribute('data-i18n', 'guest');
    els.name.textContent = i18n.t('guest');
    els.loginBtn.hidden = false;
    els.logoutBtn.hidden = true;
  }
}
