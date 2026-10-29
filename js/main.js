// settings.js 를 가장 먼저 불러온다: 저장된 테마/언어를 <html> 과 i18n 에 적용
import * as settings from './settings.js';
import { t } from './i18n.js';
import { loadDevlog, loadGames } from './store.js';
import { addRoute, refresh, setNotFound, startRouter } from './router.js';
import { esc, setTitle } from './utils.js';
import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { renderTabbar } from './components/tabbar.js';
import { icon } from './components/icons.js';
import { renderGames, renderHome } from './pages/home.js';
import { renderGame } from './pages/game.js';
import { renderDevlog, renderPost } from './pages/devlog.js';
import { renderAbout } from './pages/about.js';
import { renderSettings } from './pages/settings.js';
import { renderNotFound } from './pages/notfound.js';
import { placeholderPage } from './pages/placeholder.js';

const main = document.getElementById('main');
const headerEl = document.getElementById('site-header');
const footerEl = document.getElementById('site-footer');
const tabbarEl = document.getElementById('site-tabbar');
const skip = document.querySelector('[data-skip-link]');

function renderChrome() {
  renderHeader(headerEl);
  renderFooter(footerEl);
  renderTabbar(tabbarEl);
  skip.textContent = t('skip');
}

renderChrome();

// 스킵 링크: 해시 라우터와 충돌하지 않도록 기본 동작 대신 포커스만 이동
skip.addEventListener('click', (e) => {
  e.preventDefault();
  main.focus();
});

addRoute(/^\/$/, renderHome);
addRoute(/^\/games\/?$/, renderGames);
addRoute(/^\/game\/([^/]+)\/?$/, renderGame);
addRoute(/^\/devlog\/?$/, renderDevlog);
addRoute(/^\/devlog\/([^/]+)\/?$/, renderPost);
addRoute(/^\/about\/?$/, renderAbout);
addRoute(/^\/settings\/?$/, renderSettings);
addRoute(/^\/records\/?$/, placeholderPage('records.title')); // 3단계: 기록 페이지
setNotFound(renderNotFound);

let lastError = null;

function renderLoadError(err) {
  setTitle(t('error.load'));
  main.innerHTML = `
    <div class="container page">
      <div class="message-page load-error" role="alert">
        ${icon('info')}
        <h1 class="message-page__title">${t('error.load')}</h1>
        <p class="message-page__body">${esc(t('error.loadHint'))}</p>
        <p class="message-page__body"><code>${esc(err.message)}</code></p>
        <button class="btn btn--primary" type="button" data-retry>${icon('restart')}<span>${t('error.retry')}</span></button>
      </div>
    </div>`;
  main.querySelector('[data-retry]').addEventListener('click', (e) => {
    e.currentTarget.disabled = true;
    e.currentTarget.lastElementChild.textContent = t('error.loading');
    boot({ retry: true });
  });
}

// games.json 과 devlog.json 을 둘 다 불러온 뒤 라우터 시작. 실패하면 에러 화면 + 다시 시도.
async function boot({ retry = false } = {}) {
  try {
    await Promise.all([loadGames(), loadDevlog()]);
    lastError = null;
    startRouter(main);
    if (retry) main.focus({ preventScroll: true });
  } catch (err) {
    console.error(err);
    lastError = err;
    renderLoadError(err);
    if (retry) main.querySelector('[data-retry]')?.focus();
  }
}

// 언어가 바뀌면 새로고침 없이 헤더/푸터/탭바/현재 페이지를 다시 그린다
settings.subscribe((key) => {
  if (key !== 'lang') return;
  renderChrome();
  if (lastError) renderLoadError(lastError);
  else refresh();
});

boot();
