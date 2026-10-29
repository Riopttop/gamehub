// #/settings: 테마 / 밝기 / 언어 / 접근성 / 기록(자리) / 초기화
// 저장 버튼 없음. 바꾸는 즉시 settings.set() → 적용 + 저장.
import { LANGS, t } from '../i18n.js';
import * as settings from '../settings.js';
import { esc, setTitle } from '../utils.js';
import { icon } from '../components/icons.js';

// 미리보기 카드: 카드 요소 자체에 data-theme 을 걸어 그 테마 토큰으로 그려진다
function themePreview(id) {
  return `
    <span class="theme-preview" data-theme="${esc(id)}" data-mode="${esc(settings.get('mode'))}" aria-hidden="true">
      <span class="theme-preview__header">
        <span class="theme-preview__logo">GAMEHUB</span>
        <span class="theme-preview__nav"></span>
      </span>
      <span class="theme-preview__body">
        <span class="theme-preview__card">
          <span class="theme-preview__thumb"></span>
          <span class="theme-preview__title">${esc(t(`theme.${id}`))}</span>
          <span class="theme-preview__tag">${esc(t('badge.new'))}</span>
        </span>
        <span class="theme-preview__side">
          <span class="theme-preview__line"></span>
          <span class="theme-preview__line theme-preview__line--short"></span>
          <span class="theme-preview__btn">${esc(t('game.play'))}</span>
        </span>
      </span>
    </span>`;
}

function themeOption({ id }, current) {
  return `
    <label class="theme-option">
      <input class="visually-hidden" type="radio" name="theme" value="${esc(id)}" id="set-theme-${esc(id)}"
             ${id === current ? 'checked' : ''}>
      ${themePreview(id)}
      <span class="theme-option__text">
        <span class="theme-option__name">${t(`theme.${id}`)}</span>
        <span class="theme-option__current">${icon('check')}${t('settings.current')}</span>
        <span class="theme-option__desc">${t(`theme.${id}.desc`)}</span>
      </span>
    </label>`;
}

// 세그먼트 형태 라디오 그룹
function segmented(name, values, current, labelOf) {
  return `
    <div class="segmented">
      ${values
        .map(
          (v) => `
        <label class="segmented__option">
          <input class="visually-hidden" type="radio" name="${name}" value="${esc(v)}" id="set-${name}-${esc(v)}"
                 ${v === current ? 'checked' : ''}>
          <span>${esc(labelOf(v))}</span>
        </label>`,
        )
        .join('')}
    </div>`;
}

export function renderSettings(main) {
  setTitle(t('settings.title'));
  const s = settings.get();
  const hasModes = (id) => settings.THEMES.find((th) => th.id === id)?.modes === true;

  // 미리보기 카드가 제 폰트로 보이도록 설정 화면에서는 모든 테마 웹폰트를 불러온다
  settings.THEMES.forEach(({ id }) => settings.loadThemeFonts(id));

  main.innerHTML = `
    <div class="container page settings">
      <header class="settings__head">
        <h1 class="page-title">${t('settings.title')}</h1>
        <p class="muted">${t('settings.intro')}</p>
      </header>

      <section class="settings-section" aria-labelledby="set-theme-title">
        <h2 id="set-theme-title" class="section__title">${t('settings.theme')}</h2>
        <fieldset class="settings-group">
          <legend class="visually-hidden">${t('settings.theme')}</legend>
          <div class="theme-options">${settings.THEMES.map((th) => themeOption(th, s.theme)).join('')}</div>
        </fieldset>
        <fieldset class="settings-group" data-mode-group ${hasModes(s.theme) ? '' : 'disabled'}>
          <legend class="settings-group__label">${t('settings.mode')}</legend>
          ${segmented('mode', settings.MODES, s.mode, (v) => t(`settings.mode.${v}`))}
          <p class="settings-group__hint" data-mode-hint ${hasModes(s.theme) ? 'hidden' : ''}>${t('settings.modeHint')}</p>
        </fieldset>
      </section>

      <section class="settings-section" aria-labelledby="set-lang-title">
        <h2 id="set-lang-title" class="section__title">${t('settings.lang')}</h2>
        <fieldset class="settings-group">
          <legend class="visually-hidden">${t('settings.lang')}</legend>
          ${segmented('lang', LANGS, s.lang, (v) => t(`lang.${v}`))}
        </fieldset>
      </section>

      <section class="settings-section" aria-labelledby="set-a11y-title">
        <h2 id="set-a11y-title" class="section__title">${t('settings.a11y')}</h2>
        <fieldset class="settings-group">
          <legend class="settings-group__label">${t('settings.motion')}</legend>
          ${segmented('reducedMotion', settings.MOTIONS, s.reducedMotion, (v) => t(`settings.motion.${v}`))}
          <p class="settings-group__hint">${t('settings.motionHint')}</p>
        </fieldset>
      </section>

      <!-- stage 3: records reset / export -->
      <section class="settings-section" aria-labelledby="set-records-title" data-settings-records>
        <h2 id="set-records-title" class="section__title">${t('settings.records')}</h2>
        <p class="muted">${t('settings.recordsSoon')}</p>
      </section>

      <section class="settings-section" aria-labelledby="set-reset-title">
        <h2 id="set-reset-title" class="section__title">${t('settings.reset')}</h2>
        <p class="muted">${t('settings.resetHint')}</p>
        <div class="settings-actions">
          <button class="btn" type="button" id="set-reset" data-reset-open>${t('settings.resetButton')}</button>
          <p class="settings-actions__status" role="status" data-reset-status></p>
        </div>
      </section>

      <dialog class="dialog" data-reset-dialog aria-labelledby="reset-dialog-title" aria-describedby="reset-dialog-body">
        <form method="dialog" class="dialog__inner">
          <h2 id="reset-dialog-title" class="dialog__title">${t('settings.resetConfirmTitle')}</h2>
          <p id="reset-dialog-body" class="muted">${t('settings.resetConfirmBody')}</p>
          <div class="dialog__actions">
            <button class="btn" value="cancel" autofocus>${t('settings.cancel')}</button>
            <button class="btn btn--primary" value="confirm">${t('settings.confirmReset')}</button>
          </div>
        </form>
      </dialog>
    </div>`;

  // 라디오 변경 → 설정 저장. 이름이 곧 설정 키.
  main.querySelector('.settings').addEventListener('change', (e) => {
    const input = e.target;
    if (input.type === 'radio') settings.set(input.name, input.value);
  });

  // 다른 곳(헤더 빠른 테마 메뉴 등)에서 바뀐 값도 화면에 반영 (언어는 main.js 가 전체를 다시 그림)
  function sync() {
    const cur = settings.get();
    main.querySelectorAll('.settings input[type="radio"]').forEach((input) => {
      input.checked = cur[input.name] === input.value;
    });
    const modes = hasModes(cur.theme);
    main.querySelector('[data-mode-group]').disabled = !modes;
    main.querySelector('[data-mode-hint]').hidden = modes;
    main.querySelectorAll('.theme-preview').forEach((p) => {
      p.dataset.mode = cur.mode;
    });
  }
  const unsubscribe = settings.subscribe(sync);

  const dialog = main.querySelector('[data-reset-dialog]');
  const status = main.querySelector('[data-reset-status]');
  const openBtn = main.querySelector('[data-reset-open]');
  openBtn.addEventListener('click', () => {
    status.textContent = '';
    dialog.returnValue = '';
    dialog.showModal();
  });
  dialog.addEventListener('close', () => {
    if (dialog.returnValue === 'confirm') {
      settings.reset();
      // 언어가 바뀌면 페이지가 다시 그려지므로, 새 화면의 요소를 찾아서 알린다
      const fresh = document.querySelector('[data-reset-status]');
      if (fresh) fresh.textContent = t('settings.resetDone');
      document.getElementById('set-reset')?.focus();
    } else {
      openBtn.focus();
    }
  });

  return () => {
    unsubscribe();
    if (dialog.open) dialog.close();
  };
}
