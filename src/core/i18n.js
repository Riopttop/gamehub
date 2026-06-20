/**
 * i18n
 * ----------------------------------------------------------------
 * 다국어 처리. 첫 진입 시 navigator.language 감지,
 * 사용자가 수동 설정하면 그게 우선.
 *
 * DOM 사용법:
 *   <button data-i18n="login">로그인</button>
 *   <input data-i18n-placeholder="searchPlaceholder">
 *   <button data-i18n-aria-label="close" aria-label="닫기">
 *
 * 새 언어 추가:
 *   1. src/locales/<lang>.js 생성
 *   2. 아래 STRINGS 객체에 import 추가
 *   3. SUPPORTED 배열에 코드 추가
 */

import * as Storage from './Storage.js';
import { emit } from './EventBus.js';
import { strings as ko } from '../locales/ko.js';
import { strings as en } from '../locales/en.js';

const KEY = 'lang';
const STRINGS = { ko, en };
const SUPPORTED = ['ko', 'en'];

let current = 'ko';

export function getLang() { return current; }

export function t(key) {
  return STRINGS[current]?.[key] ?? STRINGS.en?.[key] ?? key;
}

export function setLang(lang) {
  if (!SUPPORTED.includes(lang)) return;
  current = lang;
  document.documentElement.lang = lang;
  Storage.set(KEY, { lang });
  applyToDom();
  emit('lang:changed', lang);
}

/**
 * data-i18n 속성을 가진 모든 엘리먼트의 텍스트를 현재 언어로 업데이트.
 * setLang() 호출 시 자동으로 실행되지만, 동적으로 추가된 엘리먼트에는
 * 호출자가 직접 t()를 써야 함.
 */
export function applyToDom() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
    el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel));
  });
}

function detectBrowserLang() {
  const b = (navigator.language || 'en').toLowerCase();
  return b.startsWith('ko') ? 'ko' : 'en';
}

export function init() {
  const saved = Storage.get(KEY);
  const lang = saved?.lang ?? detectBrowserLang();
  current = lang;
  document.documentElement.lang = lang;
  applyToDom();
  emit('lang:changed', lang);
}
