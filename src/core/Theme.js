/**
 * Theme
 * ----------------------------------------------------------------
 * 라이트/다크 테마 관리. <html data-theme="..."> 속성으로 작동.
 */

import * as Storage from './Storage.js';
import { emit } from './EventBus.js';

const KEY = 'theme';
const VALID = ['light', 'dark'];
let current = 'light';

export function getTheme() { return current; }

export function setTheme(theme) {
  if (!VALID.includes(theme)) return;
  current = theme;
  document.documentElement.dataset.theme = theme;
  Storage.set(KEY, { theme });
  emit('theme:changed', theme);
}

export function init() {
  const saved = Storage.get(KEY, { theme: 'light' });
  setTheme(saved.theme);
}
