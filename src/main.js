/**
 * main.js
 * ----------------------------------------------------------------
 * 진입점 (composition root).
 * 모든 모듈을 초기화하고 모듈 간 연결을 담당.
 *
 * 패턴:
 *   1. core 모듈 init (Theme → i18n → Audio → Auth 순서)
 *   2. UI 모듈 init, 필요한 콜백 주입
 *   3. 전역 키바인드 (ESC 등)
 */

import * as Theme from './core/Theme.js';
import * as i18n from './core/i18n.js';
import * as AudioManager from './core/AudioManager.js';
import * as Auth from './core/Auth.js';

import * as Header from './ui/Header.js';
import * as SettingsModal from './ui/SettingsModal.js';
import * as LoginModal from './ui/LoginModal.js';
import * as GameGrid from './ui/GameGrid.js';

import { GAMES } from './games/registry.js';

// ===== Core modules =====
Theme.init();
i18n.init();
AudioManager.init(document.getElementById('bgm'));
Auth.init();

// ===== UI modules =====
Header.init({
  onLoginClick: () => LoginModal.open(),
});

SettingsModal.init();
LoginModal.init();

GameGrid.init(GAMES, {
  onGameSelect: (gameId) => {
    // 추후 Router.openGame(gameId) 로 교체
    console.log('게임 실행:', gameId);
  },
});

// 헤더 설정 버튼 → 설정 모달
document.getElementById('settingsBtn').addEventListener('click', () => {
  if (LoginModal.isOpen()) LoginModal.close();
  SettingsModal.open();
});

// ===== Global ESC handler =====
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (LoginModal.isOpen()) LoginModal.close();
  else if (SettingsModal.isOpen()) SettingsModal.close();
});
