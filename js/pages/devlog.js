// #/devlog: 글 목록 (type 필터 칩)
// #/devlog/<slug>: 본문, 관련 게임, 이전/다음 글
import { getLang, t, tl } from '../i18n.js';
import { getAdjacentPosts, getGame, getPost, getPosts, getPostTypes } from '../store.js';
import { esc, setTitle } from '../utils.js';
import { bindCardPreviews, gameCard } from '../components/gameCard.js';
import { postCard, postMeta } from '../components/postCard.js';
import { icon } from '../components/icons.js';
import { renderNotFound } from './notfound.js';

// 다른 페이지에 다녀와도 선택한 필터를 기억한다
let activeType = 'all';

function chip(type, label) {
  return `<button class="chip" type="button" data-type="${esc(type)}" aria-pressed="${type === activeType}">${esc(label)}</button>`;
}

export function renderDevlog(main) {
  setTitle(t('devlog.title'), t('devlog.description'));
  const types = getPostTypes();
  if (activeType !== 'all' && !types.includes(activeType)) activeType = 'all';

  main.innerHTML = `
    <div class="container page">
      <header class="page-head">
        <h1 class="page-title">${t('devlog.title')}</h1>
        <p class="muted">${t('devlog.description')}</p>
      </header>
      ${
        types.length > 1
          ? `<div class="chips" role="group" aria-label="${t('devlog.filterLabel')}">
              ${chip('all', t('devlog.all'))}
              ${types.map((type) => chip(type, t(`devlog.type.${type}`))).join('')}
            </div>`
          : ''
      }
      <ul class="post-list" data-list></ul>
      <p class="empty-state" data-empty hidden>${t('devlog.empty')}</p>
    </div>`;

  const list = main.querySelector('[data-list]');
  const empty = main.querySelector('[data-empty]');

  function update() {
    const posts = getPosts(activeType);
    list.innerHTML = posts.map((p) => postCard(p, { headingLevel: 2 })).join('');
    list.hidden = posts.length === 0;
    empty.hidden = posts.length > 0;
    main.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.type === activeType)));
  }

  main.querySelector('.chips')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    activeType = btn.dataset.type;
    update();
  });

  update();
}

function pagerLink(post, dir) {
  if (!post) return '<span></span>';
  return `
    <a class="pager__link pager__link--${dir}" href="#/devlog/${encodeURIComponent(post.slug)}">
      <span class="pager__label">${dir === 'older' ? icon('arrowLeft') : ''}${t(`devlog.${dir}`)}${dir === 'newer' ? icon('arrowRight') : ''}</span>
      <span class="pager__title">${esc(tl(post.title))}</span>
    </a>`;
}

export function renderPost(main, slug) {
  const post = getPost(slug);
  if (!post) return renderNotFound(main, { kind: 'post' });

  const title = tl(post.title);
  setTitle(title, tl(post.summary));
  const games = post.games.map(getGame).filter(Boolean);
  const { newer, older } = getAdjacentPosts(slug);
  // post.html 은 build-devlog.mjs 가 마크다운을 이스케이프해서 만든 결과라 그대로 넣는다
  const langNote = post.lang !== getLang() ? `<p class="notice notice--inline">${icon('info')}<span>${t('devlog.langNote', { lang: t(`lang.${post.lang}`) })}</span></p>` : '';

  main.innerHTML = `
    <div class="container page">
      <a class="back-link" href="#/devlog">${icon('arrowLeft')}<span>${t('devlog.back')}</span></a>
      <article class="post" aria-labelledby="post-title">
        <header class="post__head">
          ${postMeta(post)}
          <h1 id="post-title" class="post__title">${esc(title)}</h1>
          <p class="post__summary">${esc(tl(post.summary))}</p>
        </header>
        ${langNote}
        <div class="post-body" lang="${esc(post.lang)}">${post.html}</div>
      </article>

      ${
        games.length
          ? `<section class="section" aria-labelledby="post-games-title">
              <h2 id="post-games-title" class="section__title section__head">${t('devlog.relatedGames')}</h2>
              <ul class="game-grid" data-games>${games.map(gameCard).join('')}</ul>
            </section>`
          : ''
      }

      ${
        newer || older
          ? `<nav class="pager section" aria-label="${t('devlog.pager')}">${pagerLink(older, 'older')}${pagerLink(newer, 'newer')}</nav>`
          : ''
      }
    </div>`;

  const grid = main.querySelector('[data-games]');
  if (grid) bindCardPreviews(grid);
}
