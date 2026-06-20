/**
 * GameGrid
 * ----------------------------------------------------------------
 * 게임 카드 그리드 + 필터 (플레이어/장르) + 검색.
 *
 * 게임 데이터는 외부에서 주입 (games/registry.js).
 * 카드 클릭 시 콜백 호출 (라우터 도입 전까지는 console.log 정도).
 */

import * as i18n from '../core/i18n.js';
import { on } from '../core/EventBus.js';

let grid, searchInput, games, onGameSelect;
const state = { players: 'all', genre: 'all', search: '' };

/**
 * @param {Array} gameList - games/registry.js의 GAMES
 * @param {Object} options
 * @param {Function} options.onGameSelect - 게임 카드 클릭 시 호출, 인자는 gameId
 */
export function init(gameList, options = {}) {
  games = gameList;
  onGameSelect = options.onGameSelect || (id => console.log('게임 선택:', id));
  grid = document.getElementById('gameGrid');
  searchInput = document.getElementById('searchInput');

  // 필터 칩
  document.querySelectorAll('.filter-group').forEach(group => {
    const key = group.dataset.filter;
    group.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state[key] = chip.dataset.value;
      render();
    });
  });

  // 검색
  searchInput.addEventListener('input', e => {
    state.search = e.target.value;
    render();
  });

  // 카드 클릭
  grid.addEventListener('click', e => {
    const card = e.target.closest('.game-card');
    if (!card) return;
    onGameSelect(card.dataset.gameId);
  });

  on('lang:changed', render);

  render();
}

function render() {
  const lang = i18n.getLang();
  const filtered = games.filter(g => {
    if (state.players !== 'all' && String(g.players) !== state.players) return false;
    if (state.genre !== 'all' && g.genre !== state.genre) return false;
    if (state.search) {
      const q = state.search.toLowerCase();
      const matches = g.name[lang].toLowerCase().includes(q)
                   || g.name.ko.toLowerCase().includes(q)
                   || g.name.en.toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-emoji">🔍</div>
        <div class="empty-state-title">${i18n.t('emptyTitle')}</div>
        <div>${i18n.t('emptyBody')}</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(g => cardHtml(g, lang)).join('');
}

function cardHtml(g, lang) {
  const genreLabel = i18n.t('genre' + g.genre.charAt(0).toUpperCase() + g.genre.slice(1));
  // 추후 g.thumbnail 있으면 <img> 사용, 없으면 이모지 fallback
  const thumb = g.thumbnail
    ? `<img src="${g.thumbnail}" alt="">`
    : `<span aria-hidden="true">${g.emoji}</span>`;

  return `
    <article class="game-card" data-game-id="${g.id}" tabindex="0">
      <div class="card-thumb g-${g.genre}">
        ${thumb}
        <div class="player-badge p${g.players}">${g.players}P</div>
      </div>
      <div class="card-info">
        <h3 class="card-title">${g.name[lang]}</h3>
        <span class="genre-tag g-${g.genre}">${genreLabel}</span>
      </div>
    </article>
  `;
}
