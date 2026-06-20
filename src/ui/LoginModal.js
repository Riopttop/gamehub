/**
 * LoginModal
 * ----------------------------------------------------------------
 * 로그인 / 회원가입 모달.
 *
 * ★ 구글 로그인 도입 시 이 파일을 단순화:
 *   - 폼 전체 제거
 *   - "구글로 로그인" 버튼 하나만 표시
 *   - Auth.loginWithGoogle() 호출
 *
 * 현재는 데모 모드 (Auth.js의 login/signup이 가짜 로그인).
 */

import * as Auth from '../core/Auth.js';
import * as i18n from '../core/i18n.js';
import { on } from '../core/EventBus.js';

let modal, els;
let mode = 'login'; // 'login' | 'signup'

const EYE_OPEN   = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
const EYE_CLOSED = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';

export function init() {
  modal = document.getElementById('loginModal');
  els = {
    closeBtn: document.getElementById('loginCloseBtn'),
    form: document.getElementById('authForm'),
    title: document.getElementById('authTitle'),
    subtitle: document.getElementById('authSubtitle'),
    nameField: document.getElementById('nameField'),
    nameInput: document.getElementById('authName'),
    emailInput: document.getElementById('authEmail'),
    passwordInput: document.getElementById('authPassword'),
    submitBtn: document.getElementById('authSubmit'),
    toggleBtn: document.getElementById('authModeToggle'),
    toggleText: document.getElementById('authToggleText'),
    toggleAction: document.getElementById('authToggleAction'),
    passwordToggle: document.getElementById('passwordToggle'),
    passwordToggleIcon: document.getElementById('passwordToggleIcon'),
    forgotLink: document.getElementById('forgotLink'),
  };

  // 닫기
  els.closeBtn.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });

  // 모드 전환
  els.toggleBtn.addEventListener('click', () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  });

  // 비밀번호 보기/숨기기
  els.passwordToggle.addEventListener('click', () => {
    const isPassword = els.passwordInput.type === 'password';
    els.passwordInput.type = isPassword ? 'text' : 'password';
    els.passwordToggleIcon.innerHTML = isPassword ? EYE_CLOSED : EYE_OPEN;
  });

  // 비밀번호 찾기 (placeholder)
  els.forgotLink.addEventListener('click', e => {
    e.preventDefault();
    console.log('비밀번호 재설정 - 추후 구현');
  });

  // 입력 시 에러 클리어
  ['authEmail', 'authPassword', 'authName'].forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('input', () => clearFieldError(id));
  });

  // 제출
  els.form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = validateForm();
    if (!data) return;

    try {
      if (mode === 'login') await Auth.login(data);
      else await Auth.signup(data);
      close();
    } catch (err) {
      console.error('인증 실패:', err);
      // 추후 사용자에게 에러 표시
    }
  });

  // 언어 변경 시 모드 텍스트 다시 적용
  on('lang:changed', () => setMode(mode));
}

export function open() {
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  setMode('login');
  setTimeout(() => els.emailInput.focus(), 200);
}

export function close() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
  els.form.reset();
  clearAllErrors();
}

export function isOpen() {
  return modal.classList.contains('open');
}

function setMode(newMode) {
  mode = newMode;
  if (mode === 'login') {
    els.nameField.hidden = true;
    els.title.textContent = i18n.t('authLoginTitle');
    els.subtitle.textContent = i18n.t('authLoginSubtitle');
    els.submitBtn.textContent = i18n.t('login');
    els.submitBtn.dataset.i18n = 'login';
    els.toggleText.textContent = i18n.t('noAccountQ');
    els.toggleAction.textContent = i18n.t('signup');
  } else {
    els.nameField.hidden = false;
    els.title.textContent = i18n.t('authSignupTitle');
    els.subtitle.textContent = i18n.t('authSignupSubtitle');
    els.submitBtn.textContent = i18n.t('signup');
    els.submitBtn.dataset.i18n = 'signup';
    els.toggleText.textContent = i18n.t('hasAccountQ');
    els.toggleAction.textContent = i18n.t('login');
  }
  clearAllErrors();
}

function validateForm() {
  clearAllErrors();
  const email = els.emailInput.value.trim();
  const password = els.passwordInput.value;
  const name = els.nameInput.value.trim();

  let valid = true;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFieldError('authEmail', 'errorInvalidEmail');
    valid = false;
  }
  if (!password || password.length < 6) {
    showFieldError('authPassword', 'errorPasswordShort');
    valid = false;
  }
  if (mode === 'signup' && !name) {
    showFieldError('authName', 'errorNameRequired');
    valid = false;
  }

  return valid ? { email, password, name } : null;
}

const ERROR_MAP = {
  authEmail: 'emailError',
  authPassword: 'passwordError',
  authName: 'nameError',
};

function showFieldError(fieldId, errorKey) {
  const input = document.getElementById(fieldId);
  if (input) input.classList.add('invalid');
  const errEl = document.getElementById(ERROR_MAP[fieldId]);
  if (errEl) {
    errEl.textContent = i18n.t(errorKey);
    errEl.classList.add('show');
  }
}

function clearFieldError(fieldId) {
  const input = document.getElementById(fieldId);
  if (input) input.classList.remove('invalid');
  const errEl = document.getElementById(ERROR_MAP[fieldId]);
  if (errEl) {
    errEl.textContent = '';
    errEl.classList.remove('show');
  }
}

function clearAllErrors() {
  document.querySelectorAll('.field-error').forEach(el => {
    el.textContent = '';
    el.classList.remove('show');
  });
  document.querySelectorAll('.form-input').forEach(el => el.classList.remove('invalid'));
}
