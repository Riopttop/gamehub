/**
 * EventBus
 * ----------------------------------------------------------------
 * 모듈 간 느슨한 통신을 위한 단순 pub/sub.
 *
 * 사용 예:
 *   import { on, emit } from './EventBus.js';
 *   on('auth:changed', state => console.log(state));
 *   emit('auth:changed', { isLoggedIn: true });
 *
 * 컨벤션:
 *   이벤트명은 'namespace:action' 형식 (예: 'auth:changed', 'lang:changed')
 */

const listeners = new Map();

/**
 * 이벤트 리스너 등록.
 * @returns {Function} 해제 함수
 */
export function on(event, handler) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(handler);
  return () => listeners.get(event)?.delete(handler);
}

/**
 * 이벤트 발행.
 */
export function emit(event, data) {
  const handlers = listeners.get(event);
  if (!handlers) return;
  handlers.forEach(h => {
    try { h(data); }
    catch (err) { console.error(`[EventBus] ${event} handler error:`, err); }
  });
}
