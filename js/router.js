// 해시 라우터: #/ , #/game/<id> , ...
// 페이지 함수 시그니처: (outlet, ...params) => cleanup 함수 | undefined
// cleanup 은 다른 페이지로 이동하기 직전에 호출된다.

const routes = [];
let notFoundPage = null;
let outlet = null;
let cleanup = null;
let firstRender = true;

export function addRoute(pattern, page) {
  routes.push({ pattern, page });
}

export function setNotFound(page) {
  notFoundPage = page;
}

export function currentPath() {
  const path = location.hash.replace(/^#/, '');
  return path || '/';
}

export function navigate(path) {
  location.hash = `#${path}`;
}

export function startRouter(el) {
  outlet = el;
  window.addEventListener('hashchange', () => render());
  render();
}

// 언어 변경 등으로 현재 페이지를 다시 그린다. 스크롤은 유지하고, 포커스는 같은 id 요소로 되돌린다.
export function refresh() {
  if (!outlet) return;
  const focusedId = document.activeElement?.id;
  const scrollY = window.scrollY;
  render({ refreshing: true });
  window.scrollTo(0, scrollY);
  if (focusedId) document.getElementById(focusedId)?.focus({ preventScroll: true });
}

function resolve(path) {
  for (const { pattern, page } of routes) {
    const match = path.match(pattern);
    if (!match) continue;
    try {
      return { page, params: match.slice(1).map(decodeURIComponent) };
    } catch {
      break; // 잘못된 % 인코딩 → 404
    }
  }
  return { page: notFoundPage, params: [] };
}

function render({ refreshing = false } = {}) {
  const path = currentPath();

  if (typeof cleanup === 'function') {
    try {
      cleanup();
    } catch (err) {
      console.error(err);
    }
  }
  cleanup = null;

  const { page, params } = resolve(path);
  cleanup = page(outlet, ...params);

  // 검색창에 입력하다가 메인으로 넘어온 경우는 포커스를 빼앗지 않는다
  const typing = document.activeElement?.matches?.('input, textarea');
  if (!firstRender && !refreshing) {
    window.scrollTo(0, 0);
    if (!typing) outlet.focus({ preventScroll: true });
  }
  firstRender = false;

  window.dispatchEvent(new CustomEvent('gamehub:route', { detail: { path, refreshing } }));
}
