/**
 * Storage
 * ----------------------------------------------------------------
 * localStorage 추상화 레이어. 모든 영속 데이터는 이 모듈을 통해 접근.
 *
 * 나중에 백엔드 API로 갈아끼울 때 이 파일만 수정하면 됨
 * (예: get() 안에서 fetch 호출로 변경).
 *
 * 키 컨벤션: 'gamehub.<topic>'
 *   예: 'gamehub.settings', 'gamehub.auth', 'gamehub.scores.snake'
 */

const PREFIX = 'gamehub.';

function fullKey(key) {
  return key.startsWith(PREFIX) ? key : PREFIX + key;
}

export function get(key, defaults = null) {
  try {
    const raw = localStorage.getItem(fullKey(key));
    if (raw === null) return defaults ? { ...defaults } : null;
    const parsed = JSON.parse(raw);
    // defaults가 객체면 merge, 아니면 raw 값 반환
    return defaults && typeof defaults === 'object' && !Array.isArray(defaults)
      ? { ...defaults, ...parsed }
      : parsed;
  } catch {
    return defaults ? { ...defaults } : null;
  }
}

export function set(key, value) {
  try {
    localStorage.setItem(fullKey(key), JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(fullKey(key));
    return true;
  } catch {
    return false;
  }
}
