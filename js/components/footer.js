import { t } from '../i18n.js';

export function renderFooter(el) {
  el.innerHTML = `
    <footer class="site-footer">
      <div class="container site-footer__inner">
        <span>GAMEHUB</span>
        <span>${t('footer.text')}</span>
      </div>
    </footer>`;
}
