# GAMEHUB: 프로젝트 규칙

직접 만든 브라우저 게임을 모아두는 정적 게임 포털. GitHub Pages(`https://<user>.github.io/<repo>/`)에 배포된다.

## 기술 조건 (반드시 지킬 것)

- **순수 HTML / CSS / JavaScript (ES 모듈)만 사용.** 프레임워크, 번들러, 트랜스파일러 금지.
- **npm 의존성 0개.** `package.json`은 스크립트용(`registry`, `dev`)으로만 쓴다. `dependencies`/`devDependencies` 추가 금지.
- **빌드 없이** 정적 파일 그대로 GitHub Pages에서 동작해야 한다. 생성 단계는 `scripts/build-registry.mjs`, `scripts/build-devlog.mjs` 둘뿐(Node 기본 모듈만 사용).
- **모든 경로는 상대경로.** `href="/..."`, `src="/..."`, `fetch('/...')` 금지. 서브경로(`/<repo>/`)에 올라가도 깨지면 안 된다.
- **라우팅은 해시 라우터**(`js/router.js`). `#/`, `#/games`, `#/game/<id>`, `#/devlog`, `#/devlog/<slug>`, `#/about`, `#/settings`, `#/records`(3단계 자리). 매칭 실패, 없는 게임 id, 없는 글 slug는 404 화면.
- 페이지 이동 시 `setTitle(제목, 설명)`(`js/utils.js`)으로 `document.title`과 description(og 포함)을 갱신한다.
- `data/*.json` 로드는 `main.js`의 `boot()`. 실패하면 에러 화면 + 다시 시도 버튼.
- 아이콘은 `js/components/icons.js`의 인라인 SVG. **이모지 금지.**
- UI 문자열은 하드코딩하지 말고 `js/i18n.js`의 `t()`를 쓴다. `{ko, en}` 데이터는 `tl()`, 태그는 `tagLabel()`.
- 템플릿 문자열에 넣는 데이터는 `esc()`로 이스케이프한다.

## 테마 규칙

- 테마는 `<html data-theme="...">`로 전환한다. 테마는 `basic`(기본), `neon`, `retro`, `terminal`.
- `basic`만 밝기 옵션이 있다: `<html data-mode="system|light|dark">`. 색은 `light-dark(라이트, 다크)`로 한 번에 정의하고 `color-scheme`으로 고른다. 다른 테마는 고정 다크.
- 모션 줄이기는 `<html data-reduced-motion="system|on|off">`. JS에서는 `prefersReducedMotion()`(utils.js)만 쓴다.
- **색, 폰트, 라운드, 그림자, 간격, 글자 크기 값은 `css/tokens.css`에만 정의한다.**
- `css/base.css`, `css/components.css`에는 **하드코딩된 색(`#hex`, `rgb()`, `hsl()`), 폰트 이름, 라운드 px 값을 쓰지 않는다.** 전부 `var(--*)`.
  - 검사: `grep -nE '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|font-family: [^v]|border-radius: [0-9]' css/base.css css/components.css` → 결과가 없어야 한다.
- 새 테마 추가는 아래 "새 테마 추가하는 법" 참고. 컴포넌트 CSS는 건드리지 않는다.
- 테두리 두께도 토큰(`--border-width`)이다. 컴포넌트에서 `1px solid` 대신 `var(--border-width) solid`.
- 접근성: 텍스트 대비 4.5:1 이상, 버튼과 클릭 영역은 최소 44px(`--tap-min`).

## 설정

- 설정은 `js/settings.js` 한 곳에서: `get()`, `set(key, value)`, `subscribe(fn)`, `reset()`. 저장 키 `gamehub:v1:settings` (localStorage). 깨진 값은 키별로 기본값 복구.
- 키: `theme`, `mode`, `lang`, `reducedMotion`, `muted`(3단계용). 새 키는 `defaults()`와 `VALID`에 같이 추가.
- `index.html` `<head>`의 인라인 스크립트가 CSS보다 먼저 같은 키를 읽어 `data-theme`/`data-mode`/`data-reduced-motion`/`lang`을 건다(깜빡임 방지). 테마 id나 값 목록을 바꾸면 **여기도 같이** 고친다.
- 언어가 바뀌면 `main.js`가 헤더/푸터/탭바를 다시 그리고 `refresh()`(router)로 현재 페이지를 다시 그린다. 페이지 함수는 여러 번 불려도 안전해야 한다(리스너는 cleanup에서 해제).
- 게임(iframe)에 넘길 값은 `getGameSettings()`로 모은다.
- 사이트 링크(GitHub, 피드백)는 `js/config.js`의 `SITE`. About 소개 문구는 `i18n.js`의 `about.intro`.

## 새 테마 추가하는 법

1. `css/tokens.css` 맨 위 주석에 있는 변수 세트를 **전부** 채운 `[data-theme="<id>"] { ... }` 블록을 추가한다. (`color-scheme: dark` 포함)
2. `js/settings.js`의 `THEMES`에 `{ id: "<id>", fonts: [웹폰트 CSS 주소] }`를 추가한다. 웹폰트는 그 테마를 고를 때만 `<link>`로 불러온다. (설정 화면에서는 미리보기용으로 전부 불러옴)
3. `index.html` 인라인 스크립트의 테마 목록에 id를 추가한다.
4. `js/i18n.js`에 `theme.<id>`, `theme.<id>.desc`를 ko/en 둘 다 추가한다.
5. 토큰으로 안 되는 것만 `css/themes/<id>.css`에 둔다. 선택자는 전부 `[data-theme="<id>"]`로 시작하고, 값은 가능하면 변수로. 파일을 만들면 `index.html`에 `<link>`를 추가한다.
6. 대비 확인: 본문/보조 텍스트가 bg, surface, surface-2 위에서 4.5:1 이상, `on-*` 색이 짝 배경 위에서 4.5:1 이상.
7. 설정 화면 미리보기 카드, 메인/게임/설정/데브로그 페이지를 그 테마로 데스크톱과 390px 폭에서 직접 확인한다.

## 데브로그

- 글 하나 = `devlog/<slug>.md` 하나. 파일 이름(확장자 제외)이 slug이고 소문자, 숫자, 하이픈만. `_`로 시작하는 파일(`_template.md`)은 제외.
- front matter 형식은 `devlog/_template.md`가 기준: 한 줄에 `키: 값`, 값은 문자열 / `[a, b]` / `{ ko: "...", en: "..." }`. 필수 `title`, `date`, `type`(`update`|`new-game`|`dev-note`), `lang`, `summary`. 선택 `games`(games/ 에 있는 id만).
- 마크다운 변환은 `scripts/build-devlog.mjs`의 작은 변환기. 지원 문법을 늘리면 `_template.md`와 README도 같이 고친다. **글 안의 HTML은 전부 이스케이프**한다(그래서 `post.html`은 그대로 innerHTML 해도 됨). 링크는 http(s)/mailto/상대경로만.
- 이미지는 `devlog/images/`에 두고 본문에서 `images/x.png`로 쓴다. 빌드가 `devlog/images/x.png`로 바꾸고 width/height를 넣는다. 없는 파일이면 빌드 에러.
- `data/devlog.json`은 자동 생성(최신순, `.gitignore`). 직접 수정 금지.
- 새 type을 추가하면: 빌드 스크립트 `TYPES`, `store.js` `getPostTypes()`, `i18n.js` `devlog.type.<type>`, 필요하면 `.post-type--<type>` 스타일.
- 글 본문 스타일(`.post-body`)도 변수만 쓴다.

## 모바일 규칙 (640px 이하)

- 브레이크포인트는 `640px`(`@media (max-width: 640px)`). 헤더는 로고 + 검색 아이콘 + 메뉴 버튼(`.mobile-only`/`.desktop-only`), 아래 탭바(`js/components/tabbar.js`: 홈/게임/기록/데브로그).
- 탭바는 `env(safe-area-inset-bottom)`을 반영하고(`viewport-fit=cover`), `body`에 탭바 높이만큼 아래 여백. 게임 플레이 중엔 `<body data-playing>`으로 숨긴다.
- 탭/메뉴의 현재 페이지는 `aria-current="page"`. 구역 판단은 `header.js`의 `sectionOf()` 하나로.
- 필터 칩은 한 줄 가로 스크롤. 게임 카드는 2열, 제목 + 태그 1개 + 터치 아이콘만.
- 터치 기기 판단은 `(pointer: coarse)`. 호버 전용 기능(미리보기)은 `(hover: hover) and (pointer: fine)`일 때만.
- 터치 기기에서 터치 미지원 게임은 플레이 버튼 대신 "키보드가 필요한 게임이에요" + "그래도 열기".
- 게임 플레이(터치): 전체화면 → `screen.orientation.lock()` 시도, 실패해도 그냥 진행(try/catch). 방향이 반대면 `.rotate-hint` 안내(CSS 미디어쿼리로 표시, 닫기 가능).
- 클릭/탭 가능한 요소는 전부 최소 44px(`--tap-min`). 본문 속 인라인 링크만 예외.
- 새 화면을 만들면 390px 폭에서 가로 스크롤이 없는지 4개 테마로 확인한다.

## 접근성

- 라우트가 바뀌면 `<main>`으로 포커스 이동(router). 언어 변경 재렌더(`refresh()`)는 같은 id 요소로 포커스 복원.
- 아이콘만 있는 버튼/링크는 `aria-label`. 장식용 이미지는 `alt=""`, 내용 이미지는 대체 텍스트 필수. 썸네일은 `loading="lazy"` + width/height.
- 모든 기능은 키보드로: 메뉴(Esc 닫기), 테마 메뉴(화살표), 라디오 그룹, 다이얼로그(`<dialog>`). 포커스 표시는 `:focus-visible` 아웃라인.

## 게임 폴더 규칙

- 게임 하나 = `games/<id>/` 폴더 하나. **폴더 이름이 id**이고 소문자, 숫자, 하이픈만 허용.
- `_`로 시작하는 폴더(`games/_template/`)는 레지스트리에서 제외된다.
- 필수: `game.json`, `thumb.(png|jpg|jpeg|webp|svg)` (16:10). `status: "live"`면 `index.html` 필수. 선택: `preview.(gif|webp|svg)`.
- `game.json` 필수 필드: `title`, `description.ko`, `tags`, `input`, `status`(`live`|`soon`), `aspect`(`16:9`|`9:16`), `updated`(YYYY-MM-DD).
- 필드 설명은 `games/_template/README.md` 참고. 새 필드를 추가하면 검사 로직(`scripts/build-registry.mjs`)과 템플릿 README도 함께 고친다.
- 태그는 영어 키로 저장. 새 태그는 `js/i18n.js`의 `TAG_LABELS`에 ko/en 라벨을 추가한다.
- 게임 안의 에셋도 상대경로.

## data/*.json

- `data/games.json`, `data/devlog.json`은 **자동 생성 파일. 직접 수정 금지.** `npm run registry`가 만든다.
- `.gitignore`에 들어 있고, 배포 시 GitHub Actions가 생성한다.

## 명령어

- `npm run registry`: 게임 폴더 검사 후 `data/games.json`, 데브로그 검사 후 `data/devlog.json` 생성 (문제 있으면 exit 1)
- `npm run dev`: registry 실행 후 `npx serve .`로 로컬 서버 (`serve.json`에서 cleanUrls를 끔. 켜면 게임 상대경로가 깨짐)

## 구조

```
index.html            앱 셸 (헤더/메인/푸터/탭바 자리, 깜빡임 방지 스크립트, og 메타)
og.png                공유 미리보기 이미지 1200x630
css/tokens.css        테마 변수 (유일하게 실제 값이 들어가는 곳)
css/base.css          리셋, 타이포, 유틸리티
css/components.css    컴포넌트 스타일 (변수만 사용)
css/themes/<id>.css   테마 전용 추가 스타일 (retro, terminal)
js/main.js            시작점: 크롬 렌더, 라우트 등록, data 로드(boot) + 재시도
js/router.js          해시 라우터. 페이지 함수는 cleanup 함수를 반환할 수 있음. refresh()
js/store.js           games.json, devlog.json 로드와 조회 함수
js/settings.js        설정 저장/구독, 테마 목록(THEMES), getGameSettings()
js/config.js          사이트 링크 (GitHub, 피드백)
js/i18n.js            ko/en 사전, t(), tl(), tagLabel(), setLang()
js/utils.js           esc(), setTitle(), parseDate(), prefersReducedMotion()
js/pages/*.js         페이지 (home, game, devlog, about, settings, notfound, placeholder)
js/components/*.js    header, footer, tabbar, gameCard, postCard, icons
games/<id>/           게임
devlog/               데브로그 글 (.md), _template.md, images/
scripts/build-registry.mjs, scripts/build-devlog.mjs
```

## 다음 단계에서 붙일 것 (구조만 잡혀 있음)

- 점수 기록(3단계): `#/records`는 현재 `placeholderPage`, 설정 페이지 `[data-settings-records]` 섹션 자리, 게임에 설정 전달은 `getGameSettings()`.
