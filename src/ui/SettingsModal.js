/**
 * SettingsModal
 * ----------------------------------------------------------------
 * 설정 모달 - 음악, 테마, 언어.
 *
 * AudioManager / Theme / i18n 의 변경 이벤트를 구독해서
 * 다른 곳에서 상태가 바뀌어도 UI가 동기화됨.
 */

import * as Theme from '../core/Theme.js';
import * as i18n from '../core/i18n.js';
import * as AudioManager from '../core/AudioManager.js';
import { on } from '../core/EventBus.js';

let modal, els;

const ICON_PLAY  = '<path d="M8 5v14l11-7z"/>';
const ICON_PAUSE = '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>';

export function init() {
  modal = document.getElementById('settingsModal');
  els = {
    closeBtn: document.getElementById('settingsCloseBtn'),
    volumeSlider: document.getElementById('volumeSlider'),
    volumeValue: document.getElementById('volumeValue'),
    musicToggle: document.getElementById('musicToggle'),
    musicLabel: document.getElementById('musicLabel'),
    musicIcon: document.getElementById('musicIcon'),
  };

  // 닫기 핸들러
  els.closeBtn.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });

  // 볼륨
  els.volumeSlider.addEventListener('input', e => {
    AudioManager.setVolume(e.target.value / 100);
  });

  // 음악 재생/정지
  els.musicToggle.addEventListener('click', () => {
    AudioManager.setMusicOn(!AudioManager.isMusicOn());
  });

  // 세그먼트 (테마, 언어)
  modal.querySelectorAll('.segment').forEach(seg => {
    seg.addEventListener('click', e => {
      const btn = e.target.closest('.segment-btn');
      if (!btn) return;
      const key = seg.dataset.setting;
      const val = btn.dataset.value;
      if (key === 'theme') Theme.setTheme(val);
      else if (key === 'lang') i18n.setLang(val);
    });
  });

  // 다른 모듈의 상태 변경 구독
  on('audio:volumeChanged', renderVolume);
  on('audio:musicToggled', renderMusicToggle);
  on('theme:changed', renderSegments);
  on('lang:changed', () => {
    renderSegments();
    renderMusicToggle();
  });

  // 초기 렌더
  renderVolume(AudioManager.getVolume());
  renderMusicToggle();
  renderSegments();
}

export function open() {
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => els.closeBtn.focus(), 100);
}

export function close() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

export function isOpen() {
  return modal.classList.contains('open');
}

function renderVolume(vol) {
  const pct = Math.round(vol * 100);
  els.volumeSlider.value = pct;
  els.volumeValue.textContent = `${pct}%`;
  els.volumeSlider.style.background =
    `linear-gradient(to right, var(--primary) 0%, var(--primary) ${pct}%, var(--bg-soft) ${pct}%, var(--bg-soft) 100%)`;
}

function renderMusicToggle() {
  const on = AudioManager.isMusicOn();
  if (on) {
    els.musicToggle.classList.remove('paused');
    els.musicLabel.textContent = i18n.t('pause');
    els.musicLabel.dataset.i18n = 'pause';
    els.musicIcon.innerHTML = ICON_PAUSE;
  } else {
    els.musicToggle.classList.add('paused');
    els.musicLabel.textContent = i18n.t('play');
    els.musicLabel.dataset.i18n = 'play';
    els.musicIcon.innerHTML = ICON_PLAY;
  }
}

function renderSegments() {
  modal.querySelectorAll('.segment').forEach(seg => {
    const key = seg.dataset.setting;
    const currentVal = key === 'lang' ? i18n.getLang() : Theme.getTheme();
    seg.querySelectorAll('.segment-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.value === currentVal);
    });
  });
}
