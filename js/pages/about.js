// #/about: 소개, 사용한 기술, GitHub/피드백 링크
// 소개 문구는 js/i18n.js 의 'about.intro', 링크는 js/config.js 의 SITE 에서 채운다.
import { t } from '../i18n.js';
import { SITE } from '../config.js';
import { esc, setTitle } from '../utils.js';
import { icon } from '../components/icons.js';

const TECH = ['web', 'router', 'themes', 'build', 'deploy'];

function linkItem(url, iconName, labelKey, missingKey) {
  if (!url) {
    return `<li class="about-links__item about-links__item--missing">${icon(iconName)}<span>${t(missingKey)}</span></li>`;
  }
  const external = /^https?:/i.test(url);
  return `
    <li>
      <a class="btn about-links__btn" href="${esc(url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
        ${icon(iconName)}<span>${t(labelKey)}</span>
        ${external ? `${icon('external')}<span class="visually-hidden">${t('about.newTab')}</span>` : ''}
      </a>
    </li>`;
}

export function renderAbout(main) {
  setTitle(t('about.title'), t('about.description'));
  main.innerHTML = `
    <div class="container page about">
      <header class="page-head">
        <h1 class="page-title">${t('about.title')}</h1>
      </header>
      <p class="about__intro">${esc(t('about.intro'))}</p>

      <section class="section" aria-labelledby="about-tech-title">
        <h2 id="about-tech-title" class="section__title section__head">${t('about.tech')}</h2>
        <ul class="about-tech">
          ${TECH.map((key) => `<li>${icon('check')}<span>${t(`about.tech.${key}`)}</span></li>`).join('')}
        </ul>
      </section>

      <section class="section" aria-labelledby="about-links-title">
        <h2 id="about-links-title" class="section__title section__head">${t('about.links')}</h2>
        <ul class="about-links">
          ${linkItem(SITE.githubUrl, 'github', 'about.github', 'about.githubMissing')}
          ${linkItem(SITE.feedbackUrl, 'message', 'about.feedback', 'about.feedbackMissing')}
        </ul>
      </section>
    </div>`;
}
