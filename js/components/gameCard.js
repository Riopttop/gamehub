import { t, tl, tagLabel } from '../i18n.js';
import { isNew } from '../store.js';
import { esc, prefersReducedMotion } from '../utils.js';
import { icon } from './icons.js';

export function tagList(tags) {
  return `<ul class="tag-list">${tags.map((tag) => `<li class="tag">${esc(tagLabel(tag))}</li>`).join('')}</ul>`;
}

// 지원하는 입력만 아이콘으로 표시
export function inputIcons(input = {}) {
  const items = [];
  if (input.keyboard) items.push(['keyboard', t('input.supportsKeyboard')]);
  if (input.touch) items.push(['touch', t('input.supportsTouch')]);
  return `<span class="input-icons">${items
    .map(([name, label]) => `<span class="input-icons__item input-icons__item--${name}" title="${esc(label)}">${icon(name, { label })}</span>`)
    .join('')}</span>`;
}

export function gameCard(game) {
  const soon = game.status === 'soon';
  const badges = [
    isNew(game) ? `<span class="badge badge--new">${t('badge.new')}</span>` : '',
    soon ? `<span class="badge badge--soon">${t('badge.soon')}</span>` : '',
  ].join('');

  return `
    <li>
      <a class="game-card${soon ? ' game-card--soon' : ''}" href="#/game/${encodeURIComponent(game.id)}"
         data-thumb="${esc(game.thumb)}" data-preview="${esc(game.preview ?? '')}">
        <div class="game-card__media">
          <img class="game-card__img" src="${esc(game.thumb)}" alt="" width="640" height="400" loading="lazy" decoding="async">
          <div class="game-card__badges">${badges}</div>
        </div>
        <div class="game-card__body">
          <h3 class="game-card__title">${esc(game.title)}</h3>
          <p class="game-card__desc">${esc(tl(game.description))}</p>
          <div class="game-card__meta">
            ${tagList(game.tags)}
            ${inputIcons(game.input)}
          </div>
        </div>
      </a>
    </li>`;
}

// 호버/포커스 시 썸네일을 preview 로 교체.
// 마우스가 있는 기기에서만 (터치에서는 호버가 없음). 모션 줄이기 설정이면 생략. 설정이 바뀔 수 있어 매번 확인.
const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
export function bindCardPreviews(container) {
  container.querySelectorAll('.game-card[data-preview]:not([data-preview=""])').forEach((card) => {
    const img = card.querySelector('.game-card__img');
    let showing = false;
    const show = () => {
      if (!card.dataset.preview || prefersReducedMotion() || !canHover()) return;
      showing = true;
      img.src = card.dataset.preview;
    };
    const hide = () => {
      if (!showing) return;
      showing = false;
      img.src = card.dataset.thumb;
    };
    // 미리보기 파일이 깨졌으면 그 카드는 미리보기를 끈다
    img.addEventListener('error', () => {
      if (!showing) return;
      card.dataset.preview = '';
      hide();
    });
    card.addEventListener('mouseenter', show);
    card.addEventListener('mouseleave', hide);
    card.addEventListener('focus', show);
    card.addEventListener('blur', hide);
  });
}
