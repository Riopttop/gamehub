import { t } from './i18n.js';

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

// 템플릿 문자열에 넣는 모든 데이터는 esc() 를 거친다.
export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

// 페이지마다 호출: 탭 제목과 description(og 포함)을 바꾼다. description 을 생략하면 사이트 기본 문구.
export function setTitle(part, description) {
  const title = part ? `${part} — GAMEHUB` : 'GAMEHUB';
  const desc = description || t('meta.description');
  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc);
}

// 설정의 "모션 줄이기"(system / on / off)를 반영한다. <html data-reduced-motion> 은 settings.js 가 설정.
export function prefersReducedMotion() {
  const pref = document.documentElement.dataset.reducedMotion;
  if (pref === 'on') return true;
  if (pref === 'off') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// 'YYYY-MM-DD' 를 로컬 자정 Date 로
export function parseDate(isoDate) {
  const [y, m, d] = String(isoDate).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
