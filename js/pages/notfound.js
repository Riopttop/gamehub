import { t } from '../i18n.js';
import { setTitle } from '../utils.js';
import { icon } from '../components/icons.js';

// kind: 'page'(기본) | 'game' | 'post'
const KEYS = {
  page: ['notfound.title', 'notfound.body'],
  game: ['notfound.gameTitle', 'notfound.gameBody'],
  post: ['notfound.postTitle', 'notfound.postBody'],
};

export function renderNotFound(main, { kind = 'page' } = {}) {
  const [titleKey, bodyKey] = KEYS[kind] ?? KEYS.page;
  setTitle('404');
  main.innerHTML = `
    <div class="container page">
      <div class="message-page">
        ${icon('gamepad')}
        <p class="message-page__code">404</p>
        <h1 class="message-page__title">${t(titleKey)}</h1>
        <p class="message-page__body">${t(bodyKey)}</p>
        <a class="btn btn--primary" href="#/">${t('notfound.home')}</a>
      </div>
    </div>`;
}
