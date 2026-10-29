import { formatDate, t, tl } from '../i18n.js';
import { esc } from '../utils.js';

export function postTypeLabel(type) {
  return `<span class="post-type post-type--${esc(type)}">${esc(t(`devlog.type.${type}`))}</span>`;
}

export function postMeta(post) {
  return `
    <span class="post-meta">
      ${postTypeLabel(post.type)}
      <time datetime="${esc(post.date)}">${esc(formatDate(post.date))}</time>
    </span>`;
}

// 데브로그 목록 카드 (type 라벨, 날짜, 제목, 요약)
export function postCard(post, { headingLevel = 3 } = {}) {
  const h = `h${headingLevel}`;
  return `
    <li>
      <a class="post-card" href="#/devlog/${encodeURIComponent(post.slug)}">
        ${postMeta(post)}
        <${h} class="post-card__title">${esc(tl(post.title))}</${h}>
        <p class="post-card__summary">${esc(tl(post.summary))}</p>
      </a>
    </li>`;
}
