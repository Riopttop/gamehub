/**
 * AudioManager
 * ----------------------------------------------------------------
 * BGM 재생 / 볼륨 / 음소거 관리.
 *
 * 브라우저 autoplay 정책: 사용자가 페이지에 한 번이라도 클릭/터치해야
 * 자동 재생 가능. 첫 클릭 시점에 자동으로 시도함.
 *
 * 추후 SFX (효과음) 지원 추가 예정.
 */

import * as Storage from './Storage.js';
import { emit } from './EventBus.js';

const KEY = 'audio';
const DEFAULTS = { volume: 0.5, musicOn: true };

let state = { ...DEFAULTS };
let bgmEl = null;
let userInteracted = false;

/**
 * @param {HTMLAudioElement} audioElement BGM용 <audio> 엘리먼트
 */
export function init(audioElement) {
  bgmEl = audioElement;
  const saved = Storage.get(KEY, DEFAULTS);
  state = saved;
  bgmEl.volume = state.volume;

  // 첫 사용자 인터랙션 시점에 BGM 재생 시도 (autoplay 정책 대응)
  document.addEventListener('click', () => {
    if (userInteracted) return;
    userInteracted = true;
    if (state.musicOn) tryPlay();
  }, { capture: true });
}

export function getVolume() { return state.volume; }
export function isMusicOn() { return state.musicOn; }

export function setVolume(vol) {
  state.volume = vol;
  if (bgmEl) bgmEl.volume = vol;
  Storage.set(KEY, state);
  emit('audio:volumeChanged', vol);
}

export function setMusicOn(on) {
  state.musicOn = on;
  if (on) tryPlay();
  else bgmEl?.pause();
  Storage.set(KEY, state);
  emit('audio:musicToggled', on);
}

function tryPlay() {
  if (!bgmEl) return;
  bgmEl.play().catch(() => {
    // autoplay 차단됨 - 다음 사용자 클릭 때 다시 시도됨
  });
}
