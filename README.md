# GameHub

모듈러 HTML 게임 허브.

## 폴더 구조

```
gamehub/
├── index.html                 # 메인 HTML (DOM 골격)
├── styles/
│   ├── variables.css          # 테마 토큰 (light/dark)
│   └── main.css               # 컴포넌트 스타일
├── src/
│   ├── main.js                # 진입점 (composition root)
│   ├── core/                  # 도메인 로직, 백엔드 추상화
│   │   ├── EventBus.js        # 모듈 간 pub/sub
│   │   ├── Storage.js         # localStorage 추상화
│   │   ├── Theme.js           # 라이트/다크
│   │   ├── AudioManager.js    # BGM
│   │   ├── i18n.js            # 다국어
│   │   └── Auth.js            # 인증 (★ 구글 OAuth 대비)
│   ├── ui/                    # DOM 조작
│   │   ├── Header.js
│   │   ├── SettingsModal.js
│   │   ├── LoginModal.js
│   │   └── GameGrid.js
│   ├── games/
│   │   └── registry.js        # 게임 목록
│   └── locales/               # 다국어 문자열
│       ├── ko.js
│       └── en.js
└── assets/
    ├── audio/
    │   └── bgm.mp3            # ← 직접 추가
    └── thumbnails/            # ← 게임 썸네일 PNG
```

## 실행 방법

ES Modules는 `file://`로 못 열기 때문에 로컬 서버 필요.

```bash
# Python
python3 -m http.server 8000

# Node
npx serve

# VS Code: Live Server 익스텐션
```

→ `http://localhost:8000` 접속

## 게임 추가하는 법

1. `src/games/<id>/` 폴더 생성 (예: `src/games/snake/`)
2. 게임 파일 작성 (`index.js`, `meta.js` 등)
3. `src/games/registry.js`에 메타데이터 한 줄 추가
4. 썸네일 PNG는 `assets/thumbnails/<id>.png`

게임 모듈 인터페이스는 첫 게임 만들 때 확정.

## 번역 추가하는 법

1. `src/locales/ko.js` + `src/locales/en.js`에 새 키 추가
2. UI에서 `data-i18n="새키"` 속성 사용
3. 코드에서는 `i18n.t('새키')` 호출

## 모듈 통신

`EventBus`로 느슨하게 연결. 주요 이벤트:

| 이벤트 | 페이로드 | 발행자 |
|---|---|---|
| `auth:changed` | `{ isLoggedIn, user }` | `Auth` |
| `lang:changed` | `'ko' \| 'en'` | `i18n` |
| `theme:changed` | `'light' \| 'dark'` | `Theme` |
| `audio:volumeChanged` | `number 0-1` | `AudioManager` |
| `audio:musicToggled` | `boolean` | `AudioManager` |

## 구글 로그인으로 갈아끼우는 법 (나중에)

1. `src/core/Auth.js`의 `login()` 함수 안만 교체
   - Google Identity Services 또는 Firebase Auth 사용
   - 성공 시 `setState({ isLoggedIn: true, user: { ...googleUser, provider: 'google' } })`
2. `src/ui/LoginModal.js`의 폼 HTML을 "구글로 로그인" 버튼 하나로 교체
3. `signup()` 함수는 제거 가능 (구글 첫 로그인이 곧 가입)

그 외 코드는 `Auth.getUser()` / `Auth.isLoggedIn()`만 사용하므로 무손상.

## 다음 단계 후보

- [ ] `core/Router.js` - 메뉴 ↔ 게임 화면 전환
- [ ] `core/InputManager.js` - 키보드 통합 관리 (WASD / 화살표)
- [ ] `ui/GameShell.js` - 게임 감싸는 헤더 (나가기, 점수)
- [ ] 첫 게임 (퐁 추천 — competitive 인터페이스 검증)
- [ ] 게임 카드 PNG 썸네일
