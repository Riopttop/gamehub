// 사용자 설정을 한 곳에서 관리한다: get(), set(key, value), subscribe(fn)
// localStorage 'gamehub:v1:settings' 에 저장. 값이 깨졌거나 없으면 기본값으로 복구한다.
// index.html 의 인라인 스크립트도 같은 키를 읽어 첫 화면 깜빡임을 막는다. (키나 속성 이름을 바꾸면 거기도 고칠 것)

import { LANGS, DEFAULT_LANG, setLang } from './i18n.js';
import { prefersReducedMotion } from './utils.js';

export const STORAGE_KEY = 'gamehub:v1:settings';

// 테마 목록. 새 테마는 css/tokens.css 블록 + 여기 한 줄. (CLAUDE.md "새 테마 추가하는 법")
// modes: 밝기 옵션(시스템/라이트/다크)을 쓰는 테마. 나머지는 고정 다크.
// fonts: 이 테마를 고를 때만 <link> 로 불러오는 웹폰트 CSS 주소
// (css/themes/<id>.css 추가 스타일은 index.html 에서 항상 불러온다. 선택자가 테마로 한정돼 있어 다른 테마엔 영향 없음)
export const THEMES = [
  { id: 'basic', modes: true, fonts: [] },
  {
    id: 'neon',
    fonts: ['https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;700&family=Noto+Sans+KR:wght@400;500;700&display=swap'],
  },
  { id: 'retro', fonts: ['https://cdn.jsdelivr.net/npm/galmuri@2.40.3/dist/galmuri.css'] },
  { id: 'terminal', fonts: ['https://fonts.googleapis.com/css2?family=Nanum+Gothic+Coding:wght@400;700&display=swap'] },
];

export const MODES = ['system', 'light', 'dark'];
export const MOTIONS = ['system', 'on', 'off'];

function detectLang() {
  const nav = String(globalThis.navigator?.language ?? '').toLowerCase();
  if (!nav) return DEFAULT_LANG;
  return nav.startsWith('ko') ? 'ko' : 'en';
}

function defaults() {
  return {
    theme: 'basic',
    mode: 'system',
    lang: detectLang(),
    reducedMotion: 'system',
    muted: false, // 3단계: 게임 음소거
  };
}

// 키별 검사. 통과 못 하면 기본값을 쓴다.
const VALID = {
  theme: (v) => THEMES.some((th) => th.id === v),
  mode: (v) => MODES.includes(v),
  lang: (v) => LANGS.includes(v),
  reducedMotion: (v) => MOTIONS.includes(v),
  muted: (v) => typeof v === 'boolean',
};

function sanitize(raw) {
  const base = defaults();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return base;
  for (const key of Object.keys(base)) {
    if (key in raw && VALID[key](raw[key])) base[key] = raw[key];
  }
  return base;
}

function load() {
  try {
    return sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY)));
  } catch {
    return defaults();
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 저장소 접근이 막힌 환경 (사생활 보호 모드 등): 이번 방문 동안만 유지
  }
}

let state = load();
const listeners = new Set();

export function get(key) {
  return key ? state[key] : { ...state };
}

export function set(key, value) {
  if (!(key in VALID) || !VALID[key](value) || state[key] === value) return;
  const prev = state[key];
  state = { ...state, [key]: value };
  save();
  if (key === 'theme' || key === 'mode') markThemeSwitching();
  apply();
  listeners.forEach((fn) => fn(key, value, prev));
}

export function reset() {
  const prev = state;
  state = defaults();
  save();
  markThemeSwitching();
  apply();
  for (const key of Object.keys(state)) {
    if (prev[key] !== state[key]) listeners.forEach((fn) => fn(key, state[key], prev[key]));
  }
}

// 반환값: 구독 해제 함수
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// 실제로 보이는 밝기 (basic 이외는 항상 dark)
export function resolvedMode() {
  const theme = THEMES.find((th) => th.id === state.theme);
  if (!theme?.modes) return 'dark';
  if (state.mode !== 'system') return state.mode;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// 3단계에서 iframe 게임에 보낼 값만 모은다
export function getGameSettings() {
  return {
    theme: state.theme,
    mode: resolvedMode(),
    lang: state.lang,
    muted: state.muted,
    reducedMotion: prefersReducedMotion(),
  };
}

// 테마 웹폰트를 한 번만 <link> 로 추가한다
const loadedFonts = new Set();
export function loadThemeFonts(id) {
  const theme = THEMES.find((th) => th.id === id);
  for (const href of theme?.fonts ?? []) {
    if (loadedFonts.has(href)) continue;
    loadedFonts.add(href);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.append(link);
  }
}

// 테마를 바꾸는 순간에만 색 트랜지션을 켠다 (css/base.css [data-theme-switching]).
// 모션 줄이기가 켜져 있으면 CSS 쪽에서 트랜지션 시간이 0 이 된다.
let switchTimer = 0;
function markThemeSwitching() {
  const root = document.documentElement;
  root.setAttribute('data-theme-switching', '');
  clearTimeout(switchTimer);
  switchTimer = setTimeout(() => root.removeAttribute('data-theme-switching'), 400);
}

// <html> 속성 반영. CSS 는 data-theme / data-mode / data-reduced-motion 만 본다.
function apply() {
  const root = document.documentElement;
  loadThemeFonts(state.theme);
  root.dataset.theme = state.theme;
  root.dataset.mode = state.mode;
  root.dataset.reducedMotion = state.reducedMotion;
  root.lang = state.lang;
  setLang(state.lang);
}

apply();
