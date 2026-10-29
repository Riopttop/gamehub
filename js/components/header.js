import { t } from '../i18n.js';
import { currentPath, navigate } from '../router.js';
import * as settings from '../settings.js';
import { esc } from '../utils.js';
import { icon } from './icons.js';

let headerEl = null;
let searchInput = null;
let closeThemeMenu = () => {};
let closeMobilePanels = () => {};

// 데스크톱 nav 와 모바일 메뉴에 같이 쓰인다
const NAV = [
  { key: 'games', href: '#/games', label: 'nav.games' },
  { key: 'devlog', href: '#/devlog', label: 'nav.devlog' },
  { key: 'about', href: '#/about', label: 'nav.about' },
];

// 검색하면 이동하는 페이지 (게임 목록이 있는 곳)
const SEARCH_PAGES = ['/', '/games'];

export function sectionOf(path) {
  if (path === '/') return 'home';
  if (path.startsWith('/games') || path.startsWith('/game/')) return 'games';
  if (path.startsWith('/devlog')) return 'devlog';
  if (path.startsWith('/about')) return 'about';
  if (path.startsWith('/settings')) return 'settings';
  if (path.startsWith('/records')) return 'records';
  return null;
}

// 테마 견본: 요소 자체에 data-theme 을 걸어 그 테마 색으로 보이게 한다
export function themeSwatch(id) {
  return `<span class="swatch" data-theme="${esc(id)}" data-mode="${esc(settings.get('mode'))}" aria-hidden="true"><span class="swatch__dot"></span></span>`;
}

function themeMenuHtml() {
  const current = settings.get('theme');
  return settings.THEMES.map(
    ({ id }) => `
      <button class="theme-menu__item" type="button" role="menuitemradio" tabindex="-1"
              data-theme-option="${esc(id)}" aria-checked="${id === current}">
        ${themeSwatch(id)}<span>${t(`theme.${id}`)}</span>${icon('check')}
      </button>`,
  ).join('');
}

// 헤더 전체를 (다시) 그린다. 언어가 바뀌면 main.js 가 다시 호출한다.
export function renderHeader(el = headerEl) {
  headerEl = el;
  const query = searchInput?.value ?? '';
  closeThemeMenu();

  el.innerHTML = `
    <header class="site-header" data-header>
      <div class="container site-header__inner">
        <a class="logo" href="#/">GAMEHUB</a>
        <nav class="site-nav" aria-label="${t('nav.label')}">
          ${NAV.map((n) => `<a class="site-nav__link" href="${n.href}" data-nav="${n.key}">${t(n.label)}</a>`).join('')}
        </nav>
        <div class="search" role="search" id="site-search-box">
          <label class="visually-hidden" for="site-search">${t('header.search')}</label>
          <span class="search__icon">${icon('search')}</span>
          <input id="site-search" class="search__input" type="search" placeholder="${t('header.searchPlaceholder')}" autocomplete="off" enterkeyhint="search">
        </div>
        <div class="site-header__actions">
          <button class="icon-btn mobile-only" type="button" id="search-toggle" data-search-toggle
                  aria-expanded="false" aria-controls="site-search-box" aria-label="${t('header.openSearch')}">${icon('search')}</button>
          <div class="theme-switcher desktop-only" data-theme-switcher>
            <button class="icon-btn" type="button" id="theme-menu-button" data-theme-toggle
                    aria-haspopup="menu" aria-expanded="false" aria-controls="theme-menu"
                    aria-label="${t('header.theme')}" title="${t('header.theme')}">${icon('palette')}</button>
            <div class="theme-menu" id="theme-menu" role="menu" aria-labelledby="theme-menu-button" hidden>
              ${themeMenuHtml()}
            </div>
          </div>
          <a class="icon-btn desktop-only" href="#/settings" data-nav="settings" id="header-settings"
             aria-label="${t('header.settings')}" title="${t('header.settings')}">${icon('settings')}</a>
          <button class="icon-btn mobile-only" type="button" id="menu-toggle" data-menu-toggle
                  aria-expanded="false" aria-controls="mobile-menu" aria-label="${t('header.openMenu')}">${icon('menu')}</button>
        </div>
      </div>
      <nav class="mobile-menu" id="mobile-menu" aria-label="${t('nav.menu')}" hidden>
        <div class="container"><ul class="mobile-menu__list">
          ${[...NAV, { key: 'settings', href: '#/settings', label: 'nav.settings' }]
            .map((n) => `<li><a class="mobile-menu__link" href="${n.href}" data-nav="${n.key}">${t(n.label)}</a></li>`)
            .join('')}
        </ul></div>
      </nav>
    </header>`;

  searchInput = el.querySelector('#site-search');
  searchInput.value = query;
  searchInput.addEventListener('input', () => {
    if (!SEARCH_PAGES.includes(currentPath())) navigate('/games');
    window.dispatchEvent(new CustomEvent('gamehub:search'));
  });

  bindThemeMenu(el.querySelector('[data-theme-switcher]'));
  bindMobilePanels(el);
  updateActive();
}

// 모바일: 검색 열기/닫기, 메뉴 열기/닫기 (disclosure 버튼)
function bindMobilePanels(el) {
  const header = el.querySelector('[data-header]');
  const searchBtn = el.querySelector('[data-search-toggle]');
  const menuBtn = el.querySelector('[data-menu-toggle]');
  const menu = el.querySelector('#mobile-menu');

  function setSearch(open, { focus = true } = {}) {
    header.toggleAttribute('data-search-open', open);
    searchBtn.setAttribute('aria-expanded', String(open));
    searchBtn.setAttribute('aria-label', t(open ? 'header.closeSearch' : 'header.openSearch'));
    searchBtn.innerHTML = icon(open ? 'x' : 'search');
    if (open && focus) searchInput.focus();
  }

  function setMenu(open) {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', t(open ? 'header.closeMenu' : 'header.openMenu'));
    menuBtn.innerHTML = icon(open ? 'x' : 'menu');
  }

  searchBtn.addEventListener('click', () => {
    const open = !header.hasAttribute('data-search-open');
    setMenu(false);
    setSearch(open);
    if (!open) searchBtn.focus();
  });

  menuBtn.addEventListener('click', () => {
    const open = menu.hidden;
    setSearch(false, { focus: false });
    setMenu(open);
    if (open) menu.querySelector('a')?.focus();
  });

  header.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!menu.hidden) {
      setMenu(false);
      menuBtn.focus();
    } else if (header.hasAttribute('data-search-open') && !searchInput.value) {
      setSearch(false);
      searchBtn.focus();
    }
  });

  // 메뉴는 페이지 이동 시 닫는다. 검색창은 결과를 보는 중일 수 있으니 그대로 둔다.
  closeMobilePanels = () => setMenu(false);
}

function bindThemeMenu(root) {
  const toggle = root.querySelector('[data-theme-toggle]');
  const menu = root.querySelector('[role="menu"]');
  const items = () => [...menu.querySelectorAll('[role="menuitemradio"]')];

  function open(focusTarget = 'checked') {
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    const list = items();
    const target = focusTarget === 'last' ? list.at(-1) : list.find((i) => i.getAttribute('aria-checked') === 'true') ?? list[0];
    target.focus();
    document.addEventListener('pointerdown', onOutside, true);
  }

  function close({ restoreFocus = false } = {}) {
    if (menu.hidden) return;
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    document.removeEventListener('pointerdown', onOutside, true);
    if (restoreFocus) toggle.focus();
  }
  closeThemeMenu = () => close();

  function onOutside(e) {
    if (!root.contains(e.target)) close();
  }

  toggle.addEventListener('click', () => (menu.hidden ? open() : close()));
  toggle.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      open(e.key === 'ArrowUp' ? 'last' : 'checked');
    }
  });

  menu.addEventListener('click', (e) => {
    const item = e.target.closest('[data-theme-option]');
    if (!item) return;
    settings.set('theme', item.dataset.themeOption);
    close({ restoreFocus: true });
  });

  menu.addEventListener('keydown', (e) => {
    const list = items();
    const i = list.indexOf(document.activeElement);
    const move = { ArrowDown: 1, ArrowUp: -1 }[e.key];
    if (move) {
      e.preventDefault();
      list[(i + move + list.length) % list.length].focus();
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      (e.key === 'Home' ? list[0] : list.at(-1)).focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close({ restoreFocus: true });
    } else if (e.key === 'Tab') {
      close();
    }
  });
}

function updateActive() {
  if (!headerEl) return;
  const section = sectionOf(currentPath());
  headerEl.querySelectorAll('[data-nav]').forEach((a) => {
    if (a.dataset.nav === section) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

// 리스너는 모듈당 한 번만 (renderHeader 는 여러 번 불릴 수 있음)
window.addEventListener('gamehub:route', (e) => {
  updateActive();
  if (!e.detail?.refreshing) closeMobilePanels();
});
settings.subscribe((key) => {
  if (!headerEl) return;
  if (key === 'theme') {
    headerEl.querySelectorAll('[data-theme-option]').forEach((item) => {
      item.setAttribute('aria-checked', String(item.dataset.themeOption === settings.get('theme')));
    });
  }
  if (key === 'mode') {
    headerEl.querySelectorAll('.swatch').forEach((sw) => {
      sw.dataset.mode = settings.get('mode');
    });
  }
});

export function getSearchQuery() {
  return searchInput?.value ?? '';
}

export function setSearchQuery(value) {
  if (searchInput) searchInput.value = value;
}
