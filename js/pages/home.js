import { t, tl, tagLabel } from '../i18n.js';
import { filterGames, getAllTags, getFeatured, getPosts } from '../store.js';
import { esc, prefersReducedMotion, setTitle } from '../utils.js';
import { bindCardPreviews, gameCard, tagList } from '../components/gameCard.js';
import { getSearchQuery, setSearchQuery } from '../components/header.js';
import { icon } from '../components/icons.js';
import { postCard } from '../components/postCard.js';

// 다른 페이지에 다녀와도 선택한 태그를 기억한다
let activeTag = 'all';

function banner(game) {
  const media = game.preview && !prefersReducedMotion() ? game.preview : game.thumb;
  return `
    <section class="banner" aria-labelledby="banner-title">
      <div class="banner__media">
        <img src="${esc(media)}" alt="" width="640" height="400">
      </div>
      <div class="banner__body">
        <p class="eyebrow">${t('home.featured')}</p>
        <h2 id="banner-title" class="banner__title">${esc(game.title)}</h2>
        <p class="banner__desc">${esc(tl(game.description))}</p>
        ${tagList(game.tags)}
        <a class="btn btn--primary btn--lg" href="#/game/${encodeURIComponent(game.id)}">${icon('play')}<span>${t('home.playNow')}</span></a>
      </div>
    </section>`;
}

function chip(tag, label) {
  return `<button class="chip" type="button" data-tag="${esc(tag)}" aria-pressed="${tag === activeTag}">${esc(label)}</button>`;
}

function devlogSection() {
  const posts = getPosts().slice(0, 3);
  if (!posts.length) return '';
  return `
    <section class="section" aria-labelledby="home-devlog-title">
      <div class="section__head">
        <h2 id="home-devlog-title" class="section__title">${t('home.devlog')}</h2>
        <a class="text-link" href="#/devlog">${t('home.devlogAll')}${icon('arrowRight')}</a>
      </div>
      <ul class="post-list post-list--grid">${posts.map((p) => postCard(p)).join('')}</ul>
    </section>`;
}

// #/games (모바일 탭바의 "게임"): 배너, 데브로그 없이 게임 목록만
export function renderGames(main) {
  return renderHome(main, { gamesOnly: true });
}

export function renderHome(main, { gamesOnly = false } = {}) {
  if (gamesOnly) setTitle(t('nav.games'));
  else setTitle();
  const featured = gamesOnly ? null : getFeatured();
  const tags = getAllTags();
  if (activeTag !== 'all' && !tags.includes(activeTag)) activeTag = 'all';

  main.innerHTML = `
    <div class="container page">
      ${gamesOnly ? '' : '<h1 class="visually-hidden">GAMEHUB</h1>'}
      ${featured ? banner(featured) : ''}
      <section class="section" aria-labelledby="all-games-title">
        <div class="section__head">
          <${gamesOnly ? 'h1' : 'h2'} id="all-games-title" class="section__title">${t('home.allGames')}</${gamesOnly ? 'h1' : 'h2'}>
          <p class="section__count" data-count aria-live="polite"></p>
        </div>
        <div class="chips" role="group" aria-label="${t('home.filterLabel')}">
          ${chip('all', t('home.filterAll'))}
          ${tags.map((tag) => chip(tag, tagLabel(tag))).join('')}
        </div>
        <ul class="game-grid" data-grid></ul>
        <div class="empty-state" data-empty hidden>
          ${icon('searchOff')}
          <p class="empty-state__title">${t('home.empty.title')}</p>
          <p>${t('home.empty.body')}</p>
          <button class="btn" type="button" data-reset>${t('home.empty.reset')}</button>
        </div>
      </section>
      ${gamesOnly ? '' : devlogSection()}
    </div>`;

  const grid = main.querySelector('[data-grid]');
  const empty = main.querySelector('[data-empty]');
  const count = main.querySelector('[data-count]');
  const chips = main.querySelectorAll('.chip');

  function update() {
    const list = filterGames({ query: getSearchQuery(), tag: activeTag });
    grid.innerHTML = list.map(gameCard).join('');
    bindCardPreviews(grid);
    grid.hidden = list.length === 0;
    empty.hidden = list.length > 0;
    count.textContent = t('home.count', { n: list.length });
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.tag === activeTag)));
  }

  main.querySelector('.chips').addEventListener('click', (e) => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    activeTag = btn.dataset.tag;
    update();
  });

  main.querySelector('[data-reset]').addEventListener('click', () => {
    activeTag = 'all';
    setSearchQuery('');
    update();
  });

  window.addEventListener('gamehub:search', update);
  update();

  return () => window.removeEventListener('gamehub:search', update);
}
