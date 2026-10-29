// 모바일(640px 이하) 화면 아래 탭바: 홈 / 게임 / 기록 / 데브로그
// 게임 플레이 중에는 <body data-playing> 이 붙어 CSS 에서 숨긴다.
import { t } from '../i18n.js';
import { currentPath } from '../router.js';
import { icon } from './icons.js';
import { sectionOf } from './header.js';

let tabbarEl = null;

const TABS = [
  { key: 'home', href: '#/', icon: 'home', label: 'nav.home' },
  { key: 'games', href: '#/games', icon: 'gamepad', label: 'nav.games' },
  { key: 'records', href: '#/records', icon: 'trophy', label: 'nav.records' },
  { key: 'devlog', href: '#/devlog', icon: 'doc', label: 'nav.devlog' },
];

export function renderTabbar(el = tabbarEl) {
  tabbarEl = el;
  el.innerHTML = `
    <nav class="tabbar" aria-label="${t('nav.tabbar')}">
      ${TABS.map(
        (tab) => `
        <a class="tabbar__link" href="${tab.href}" data-tab="${tab.key}">
          ${icon(tab.icon)}<span>${t(tab.label)}</span>
        </a>`,
      ).join('')}
    </nav>`;
  updateActive();
}

function updateActive() {
  if (!tabbarEl) return;
  const section = sectionOf(currentPath());
  tabbarEl.querySelectorAll('[data-tab]').forEach((a) => {
    if (a.dataset.tab === section) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

window.addEventListener('gamehub:route', updateActive);
