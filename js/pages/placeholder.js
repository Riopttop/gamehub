// 아직 만들지 않은 페이지(데브로그, About)용 "준비 중" 화면
import { t } from '../i18n.js';
import { setTitle } from '../utils.js';
import { icon } from '../components/icons.js';

export function placeholderPage(titleKey) {
  return (main) => {
    const title = t(titleKey);
    setTitle(title);
    main.innerHTML = `
      <div class="container page">
        <div class="message-page">
          ${icon('clock')}
          <h1 class="message-page__title">${title}</h1>
          <p class="message-page__body">${t('placeholder.body')}</p>
          <a class="btn" href="#/">${t('placeholder.home')}</a>
        </div>
      </div>`;
  };
}
