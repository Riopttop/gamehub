import { formatDate, t, tl } from '../i18n.js';
import { getGame, getPostsForGame, getRelated } from '../store.js';
import { esc, setTitle } from '../utils.js';
import { bindCardPreviews, gameCard, tagList } from '../components/gameCard.js';
import { icon } from '../components/icons.js';
import { postCard } from '../components/postCard.js';
import { renderNotFound } from './notfound.js';

// 게임 안에서 눌러도 부모 페이지를 스크롤시키면 안 되는 키
const SCROLL_KEYS = new Set([' ', 'Spacebar', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End']);

const IFRAME_ALLOW = 'fullscreen; autoplay; gamepad';
const IFRAME_SANDBOX = 'allow-scripts allow-same-origin allow-pointer-lock';

// "A / D", "Ctrl + R" → 키캡 + 구분자
function keycaps(keys) {
  return String(keys)
    .split(/(\s+[/+,]\s+|\s*,\s*)/)
    .filter((part) => part.trim() !== '')
    .map((part) => {
      const trimmed = part.trim();
      return /^[/+,]$/.test(trimmed)
        ? `<span class="keys__sep" aria-hidden="true">${esc(trimmed)}</span>`
        : `<kbd class="keycap">${esc(trimmed)}</kbd>`;
    })
    .join('');
}

// 모바일에서 화면을 돌려 달라는 안내. CSS 가 (pointer: coarse) + 방향이 안 맞을 때만 보여준다.
function rotateHintHtml(portrait) {
  return `
    <div class="rotate-hint" data-rotate-hint>
      ${icon('rotate')}
      <p class="rotate-hint__title">${t(portrait ? 'game.rotate.portrait' : 'game.rotate.landscape')}</p>
      <button class="btn" type="button" data-rotate-dismiss>${t('game.rotate.dismiss')}</button>
    </div>`;
}

// keyboardOnly: 터치 기기에서 터치 미지원 게임 → 플레이 버튼 대신 안내 + "그래도 열기"
function stageHtml(game, portrait, keyboardOnly) {
  const cls = `stage${portrait ? ' stage--portrait' : ''}`;
  if (game.status !== 'live') {
    return `
      <div class="${cls}">
        <div class="stage__frame">
          <img class="stage__poster" src="${esc(game.thumb)}" alt="" width="640" height="400">
          <div class="stage__message">
            ${icon('clock')}
            <h2 class="stage__message-title">${t('game.soon.title')}</h2>
            <p>${t('game.soon.body')}</p>
          </div>
        </div>
      </div>`;
  }
  return `
    <div class="${cls}" data-stage data-orientation="${portrait ? 'portrait' : 'landscape'}">
      <div class="stage__frame" data-frame>
        <img class="stage__poster" src="${esc(game.thumb)}" alt="" width="640" height="400">
        <div class="stage__overlay" data-overlay>
          ${
            keyboardOnly
              ? `${icon('keyboard')}
                 <h2 class="stage__message-title">${t('game.keyboardOnly.title')}</h2>
                 <p>${t('game.keyboardOnly.body')}</p>
                 <button class="btn" type="button" data-play>${t('game.openAnyway')}</button>`
              : `<button class="play-btn" type="button" data-play aria-label="${esc(t('game.playLabel', { title: game.title }))}">
                   ${icon('play')}<span>${t('game.play')}</span>
                 </button>`
          }
        </div>
        ${rotateHintHtml(portrait)}
      </div>
    </div>
    <div class="stage-toolbar" role="toolbar" aria-label="${t('game.toolbar')}">
      <button class="btn" type="button" data-action="fullscreen" disabled>${icon('fullscreen')}<span>${t('game.fullscreen')}</span></button>
      <button class="btn" type="button" data-action="restart" disabled>${icon('restart')}<span>${t('game.restart')}</span></button>
      <button class="btn" type="button" data-action="copy">${icon('link')}<span>${t('game.copyLink')}</span></button>
      <p class="stage-toolbar__status" role="status" data-status></p>
    </div>`;
}

function infoHtml(game) {
  const controls = game.controls?.length
    ? `<section>
        <h2 class="info-block__title">${t('game.controls')}</h2>
        <dl class="controls-list">
          ${game.controls
            .map((c) => `<div class="controls-list__row"><dt>${esc(tl(c.action))}</dt><dd>${keycaps(c.keys)}</dd></div>`)
            .join('')}
        </dl>
      </section>`
    : '';

  const support = (name, ok) => `
    <li class="support${ok ? '' : ' support--no'}">
      ${icon(name)}<span>${t(`input.${name}`)}</span>
      <span class="support__state">${icon(ok ? 'check' : 'x', { label: t(ok ? 'input.supported' : 'input.unsupported') })}</span>
    </li>`;

  return `
    <div>
      <h1 class="game-title">${esc(game.title)}</h1>
      ${tagList(game.tags)}
    </div>
    ${controls}
    <section>
      <h2 class="info-block__title">${t('game.input')}</h2>
      <ul class="support-list">${support('keyboard', game.input?.keyboard)}${support('touch', game.input?.touch)}</ul>
    </section>
    <section>
      <h2 class="info-block__title">${t('game.info')}</h2>
      <dl class="meta-list">
        ${game.version ? `<dt>${t('game.version')}</dt><dd>${esc(game.version)}</dd>` : ''}
        <dt>${t('game.updated')}</dt><dd><time datetime="${esc(game.updated)}">${esc(formatDate(game.updated))}</time></dd>
      </dl>
    </section>`;
}

function changelogHtml(game) {
  if (!game.changelog?.length) return '';
  const items = [...game.changelog].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return `
    <section class="section" aria-labelledby="changelog-title">
      <h2 id="changelog-title" class="section__title section__head">${t('game.changelog')}</h2>
      <ol class="changelog">
        ${items
          .map(
            (c) => `
          <li class="changelog__item">
            <div class="changelog__head">
              <span class="changelog__version">v${esc(c.version)}</span>
              <time class="changelog__date" datetime="${esc(c.date)}">${esc(formatDate(c.date))}</time>
            </div>
            <p>${esc(tl(c.notes))}</p>
          </li>`,
          )
          .join('')}
      </ol>
    </section>`;
}

export function renderGame(main, id) {
  const game = getGame(id);
  if (!game) return renderNotFound(main, { kind: 'game' });

  setTitle(game.title, tl(game.description));
  const portrait = game.aspect === '9:16';
  // 모바일(터치 위주 기기)에서 터치 미지원 게임을 열면 안내
  const needsKeyboard = !game.input?.touch && isTouchDevice();
  const related = getRelated(game, 3);
  const posts = getPostsForGame(game.id);

  main.innerHTML = `
    <div class="container page">
      <a class="back-link" href="#/">${icon('arrowLeft')}<span>${t('game.back')}</span></a>
      <div class="game-layout">
        <div class="game-layout__play">${stageHtml(game, portrait, needsKeyboard)}</div>
        <aside class="game-layout__info">${infoHtml(game)}</aside>
      </div>

      <section class="section" aria-labelledby="about-title">
        <h2 id="about-title" class="section__title section__head">${t('game.about')}</h2>
        <p class="prose">${esc(tl(game.about) || tl(game.description))}</p>
      </section>

      ${changelogHtml(game)}

      ${
        posts.length
          ? `<section class="section" aria-labelledby="game-devlog-title">
              <h2 id="game-devlog-title" class="section__title section__head">${t('game.devlog')}</h2>
              <ul class="post-list">${posts.map((post) => postCard(post)).join('')}</ul>
            </section>`
          : ''
      }

      ${
        related.length
          ? `<section class="section" aria-labelledby="related-title">
              <h2 id="related-title" class="section__title section__head">${t('game.related')}</h2>
              <ul class="game-grid" data-related>${related.map(gameCard).join('')}</ul>
            </section>`
          : ''
      }
    </div>`;

  const relatedGrid = main.querySelector('[data-related]');
  if (relatedGrid) bindCardPreviews(relatedGrid);

  if (game.status !== 'live') return undefined;
  return setupPlayer(main, game);
}

function isTouchDevice() {
  return window.matchMedia('(pointer: coarse)').matches;
}

function fullscreenElement() {
  return document.fullscreenElement ?? document.webkitFullscreenElement ?? null;
}

function setupPlayer(main, game) {
  const stage = main.querySelector('[data-stage]');
  const frame = main.querySelector('[data-frame]');
  const overlay = main.querySelector('[data-overlay]');
  const status = main.querySelector('[data-status]');
  const fsBtn = main.querySelector('[data-action="fullscreen"]');
  const restartBtn = main.querySelector('[data-action="restart"]');
  const copyBtn = main.querySelector('[data-action="copy"]');
  let iframe = null;
  let statusTimer = 0;

  const fsSupported = Boolean(document.fullscreenEnabled || document.webkitFullscreenEnabled);
  if (!fsSupported) fsBtn.hidden = true;

  function focusGame() {
    if (!iframe) return;
    iframe.focus({ preventScroll: true });
    try {
      iframe.contentWindow?.focus();
    } catch {
      // 접근 불가 시 무시
    }
  }

  function onFrameLoad() {
    fsBtn.disabled = false;
    restartBtn.disabled = false;
    // 게임 쪽에서 preventDefault 를 안 해도 스페이스/방향키가 부모 페이지를 스크롤하지 않도록
    try {
      iframe.contentWindow.addEventListener('keydown', (e) => {
        if (SCROLL_KEYS.has(e.key) && !e.target.closest?.('input, textarea, select, [contenteditable]')) {
          e.preventDefault();
        }
      });
    } catch {
      // 다른 출처면 접근 불가 → 게임 쪽에서 처리해야 함
    }
    focusGame();
  }

  // 모바일: 전체화면 + 방향 잠금을 시도한다. 지원 안 하거나 거부돼도(iOS 등) 그냥 진행.
  async function enterMobilePlay() {
    try {
      if (fsSupported && !fullscreenElement()) await (stage.requestFullscreen?.() ?? stage.webkitRequestFullscreen?.());
    } catch {
      // 무시
    }
    try {
      await screen.orientation?.lock?.(game.aspect === '9:16' ? 'portrait' : 'landscape');
    } catch {
      // 무시 (데스크톱, iOS, 전체화면이 아닐 때 등)
    }
    focusGame();
  }

  function play() {
    iframe = document.createElement('iframe');
    iframe.className = 'stage__iframe';
    iframe.title = t('game.frameTitle', { title: game.title });
    iframe.setAttribute('allow', IFRAME_ALLOW);
    iframe.setAttribute('sandbox', IFRAME_SANDBOX);
    iframe.addEventListener('load', onFrameLoad);
    iframe.src = game.url;
    frame.append(iframe);
    overlay.remove();
    frame.querySelector('.stage__poster')?.remove();
    stage.toggleAttribute('data-playing', true);
    document.body.toggleAttribute('data-playing', true); // 탭바 숨김
    if (isTouchDevice()) enterMobilePlay();
  }

  function restart() {
    if (!iframe) return;
    try {
      iframe.contentWindow.location.reload();
    } catch {
      iframe.src = game.url;
    }
  }

  async function toggleFullscreen() {
    try {
      if (fullscreenElement()) {
        await (document.exitFullscreen?.() ?? document.webkitExitFullscreen?.());
      } else {
        await (stage.requestFullscreen?.() ?? stage.webkitRequestFullscreen?.());
      }
    } catch (err) {
      console.warn('fullscreen failed', err);
    }
    focusGame();
  }

  function onFullscreenChange() {
    const active = fullscreenElement() === stage;
    fsBtn.innerHTML = `${icon(active ? 'exitFullscreen' : 'fullscreen')}<span>${t(active ? 'game.exitFullscreen' : 'game.fullscreen')}</span>`;
    focusGame();
  }

  function showStatus(message) {
    status.textContent = message;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      status.textContent = '';
    }, 2500);
  }

  async function copyLink() {
    const url = location.href;
    try {
      await navigator.clipboard.writeText(url);
      showStatus(t('game.copied'));
    } catch {
      // http 로컬 서버 등 clipboard API 를 못 쓰는 환경용 대체
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.setAttribute('readonly', '');
      ta.className = 'visually-hidden';
      document.body.append(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      showStatus(t(ok ? 'game.copied' : 'game.copyFailed'));
    }
    focusGame();
  }

  // 포스터(썸네일)가 게임 화면처럼 보일 수 있으니 오버레이 어디를 눌러도 시작한다.
  // "키보드 필요" 안내일 때는 "그래도 열기" 버튼으로만.
  if (overlay.querySelector('.play-btn')) {
    overlay.classList.add('stage__overlay--clickable');
    overlay.addEventListener('click', play, { once: true });
  } else {
    main.querySelector('[data-play]').addEventListener('click', play);
  }
  main.querySelector('[data-rotate-dismiss]').addEventListener('click', () => {
    stage.toggleAttribute('data-rotate-dismissed', true);
    focusGame();
  });
  fsBtn.addEventListener('click', toggleFullscreen);
  restartBtn.addEventListener('click', restart);
  copyBtn.addEventListener('click', copyLink);
  document.addEventListener('fullscreenchange', onFullscreenChange);
  document.addEventListener('webkitfullscreenchange', onFullscreenChange);

  return () => {
    clearTimeout(statusTimer);
    document.body.removeAttribute('data-playing');
    try {
      screen.orientation?.unlock?.();
    } catch {
      // 무시
    }
    document.removeEventListener('fullscreenchange', onFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    if (fullscreenElement()) document.exitFullscreen?.().catch(() => {});
  };
}
