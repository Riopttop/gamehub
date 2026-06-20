/**
 * Auth
 * ----------------------------------------------------------------
 * 인증 추상화 레이어.
 *
 * ★ 현재: localStorage 기반 데모 (아무 이메일/비번으로 로그인됨)
 * ★ 추후: Google OAuth로 교체 예정
 *
 * 마이그레이션 가이드 (구글 로그인으로 전환 시):
 *   1. 이 파일의 login() 함수 안 구현만 교체:
 *      - Google Identity Services 또는 Firebase Auth SDK 사용
 *      - 성공 시 setState({ isLoggedIn: true, user: { ...googleUser, provider: 'google' } })
 *   2. ui/LoginModal.js의 폼을 "구글로 로그인" 버튼 하나로 교체
 *   3. signup() 함수는 구글 가입 시 자동 호출되므로 제거 가능
 *
 * 다른 모듈은 이 모듈의 공개 API만 사용 (getUser, isLoggedIn, login, logout):
 *   백엔드 어떻게 바뀌어도 UI 코드는 그대로 동작.
 *
 * 이벤트:
 *   'auth:changed' - 로그인 상태 변경 시 발생, 페이로드는 user 객체 또는 null
 */

import * as Storage from './Storage.js';
import { emit } from './EventBus.js';

const KEY = 'auth';

/**
 * @typedef {Object} User
 * @property {string} email
 * @property {string} name
 * @property {string} provider - 'demo' | 'google' | 등
 */

/** @type {{ isLoggedIn: boolean, user: User | null }} */
let state = { isLoggedIn: false, user: null };

export function getUser() { return state.user; }
export function isLoggedIn() { return state.isLoggedIn; }

/**
 * 이메일/비밀번호 로그인 (현재 데모).
 * 추후 구글 OAuth로 교체.
 */
export async function login({ email, password }) {
  // TODO: 실제 백엔드 호출로 교체
  const name = email.split('@')[0];
  setState({ isLoggedIn: true, user: { email, name, provider: 'demo' } });
  return state.user;
}

/**
 * 회원가입 (현재 데모).
 * 구글 로그인 도입 시 제거 가능 (구글 첫 로그인 = 자동 가입).
 */
export async function signup({ email, password, name }) {
  // TODO: 실제 백엔드 호출로 교체
  setState({ isLoggedIn: true, user: { email, name, provider: 'demo' } });
  return state.user;
}

/**
 * 구글 OAuth 로그인 (미구현 - 추후 추가 예정).
 */
export async function loginWithGoogle() {
  // TODO: Google Identity Services 또는 Firebase Auth 사용
  // const result = await google.accounts.oauth2.authorize(...);
  // setState({ isLoggedIn: true, user: { ...userInfo, provider: 'google' } });
  throw new Error('Google login not implemented yet');
}

export function logout() {
  setState({ isLoggedIn: false, user: null });
  Storage.remove(KEY);
}

function setState(next) {
  state = next;
  if (state.isLoggedIn) Storage.set(KEY, state);
  emit('auth:changed', state);
}

export function init() {
  const saved = Storage.get(KEY);
  if (saved?.isLoggedIn && saved.user) state = saved;
  emit('auth:changed', state);
}
