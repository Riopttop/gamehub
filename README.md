# GAMEHUB

직접 만든 브라우저 게임을 모아두는 게임 포털이에요.
순수 HTML / CSS / JavaScript로 만들었고 빌드 과정이 없어서 GitHub Pages에 그대로 올라가요. npm 의존성도 없어요.

- **게임**: 태그 필터, 검색, iframe 플레이, 전체화면, 링크 복사
- **데브로그**: 마크다운으로 쓴 글을 목록/본문으로 보여줘요 (`#/devlog`)
- **설정** (`#/settings`): 테마 4종(베이식/네온/레트로/터미널), 밝기, 언어(한국어/English), 모션 줄이기. 브라우저에 저장돼요.
- **모바일**: 640px 이하에서 하단 탭바, 접히는 검색/메뉴, 플레이 시 전체화면과 가로 방향 잠금 시도

## 로컬에서 실행하기

[Node.js](https://nodejs.org/) 18 이상이 필요해요. (설치할 패키지는 없어요)

```bash
npm run dev
```

1. `games/` 폴더를 검사해서 `data/games.json`을, `devlog/` 글을 검사해서 `data/devlog.json`을 만들고
2. `npx serve .`로 로컬 서버를 띄워요. 터미널에 나오는 주소(보통 http://localhost:3000)를 브라우저에서 여세요.

> `index.html`을 더블클릭해서 `file://`로 열면 동작하지 않아요. (브라우저가 `fetch`와 ES 모듈을 막음) 꼭 로컬 서버로 여세요.

게임 목록과 데브로그 데이터만 다시 만들고 싶으면:

```bash
npm run registry
```

## 새 게임 올리는 법

### 1. 템플릿 복사

```bash
cp -r games/_template games/my-game
```

폴더 이름 `my-game`이 게임 id가 돼요. **소문자, 숫자, 하이픈(-)만** 쓸 수 있어요.
주소는 `#/game/my-game`이 돼요.

### 2. 게임 파일 넣기

#### 예시 A: HTML 파일 하나로 된 게임

`games/my-game/index.html`을 내 게임 파일로 바꿔요. 이미지나 사운드가 있으면 같은 폴더 안에 넣어요.

```
games/my-game/
  index.html        ← 게임
  assets/
    hero.png
    jump.wav
  game.json
  thumb.png
```

`index.html` 안에서는 `assets/hero.png`처럼 **상대경로**로 불러와야 해요.

#### 예시 B: GameMaker HTML5 export

1. GameMaker에서 **Build → Create Executable → HTML5**로 내보내요. (zip이면 압축을 풀어요)
2. 결과 폴더 안의 내용물 전체(`index.html`, `html5game/` 폴더, `favicon.ico` 등)를 `games/my-game/`에 복사해요.

```
games/my-game/
  index.html        ← GameMaker가 만든 파일
  html5game/
    my-game.js
    ...
  game.json
  thumb.png
```

3. `index.html`이 **폴더 바로 아래**에 있어야 해요. (`games/my-game/MyGame/index.html`처럼 한 단계 더 들어가 있으면 안 됨)
4. GameMaker export는 기본적으로 `html5game/...` 같은 상대경로를 써서 보통 그대로 동작해요.
   만약 경로가 `/`로 시작하게 바뀌어 있으면 앞의 `/`를 지워 주세요.
5. 게임 화면이 iframe 크기에 맞게 늘어나도록 GameMaker의 HTML5 옵션에서 화면 스케일링(Scale to fit 등)을 켜 두는 걸 추천해요.

### 3. 썸네일 넣기

- `thumb.png` (또는 `jpg`, `webp`, `svg`), **16:10 비율** (예: 1280×800)
- 선택: `preview.gif`는 카드에 마우스를 올리면 재생돼요. (`webp`, `svg`도 가능. 터치 기기와 모션 줄이기 설정에서는 재생 안 함)

### 4. game.json 작성

```json
{
  "title": "MY GAME",
  "description": { "ko": "한 줄 설명", "en": "One-line description" },
  "tags": ["action", "platformer"],
  "controls": [
    { "action": { "ko": "이동", "en": "Move" }, "keys": "A / D" }
  ],
  "input": { "keyboard": true, "touch": false },
  "status": "live",
  "featured": false,
  "aspect": "16:9",
  "version": "1.0.0",
  "updated": "2026-10-28",
  "changelog": [
    { "version": "1.0.0", "date": "2026-10-28", "notes": { "ko": "첫 공개", "en": "First release" } }
  ]
}
```

모든 필드 설명은 [`games/_template/README.md`](games/_template/README.md)에 있어요. 자주 쓰는 것만 정리하면:

- `status`: `"live"`(플레이 가능) 또는 `"soon"`(준비 중, `index.html` 없어도 됨)
- `aspect`: `"16:9"`(가로) 또는 `"9:16"`(세로 게임). 모바일에서 플레이하면 이 방향으로 화면 잠금을 시도하고, 반대로 들고 있으면 돌려 달라고 안내해요.
- `input.touch: false`면 터치 기기에서 플레이 버튼 대신 "키보드가 필요한 게임이에요" 안내와 "그래도 열기" 버튼이 나와요.
- `featured: true`: 메인 추천 배너에 표시돼요. 여러 개면 `updated`가 가장 최근인 게임이 나와요.
- `updated`가 14일 이내면 NEW 뱃지가 붙어요.
- 태그는 영어로 써요. 한국어 표시는 `js/i18n.js`의 `TAG_LABELS`가 해요. 새 태그를 쓰면 거기에 추가하세요.

### 5. 검사

```bash
npm run registry
```

문제가 있으면 이렇게 알려줘요:

```
[ERROR] games/my-game/
        - updated: 필수 필드예요 (YYYY-MM-DD)
        - 썸네일이 없어요 (thumb.png / thumb.jpg / ...)
```

`npm run dev`로 브라우저에서도 확인해 보세요.

### 6. push

```bash
git add .
git commit -m "Add my-game"
git push
```

push하면 GitHub Actions가 검사와 배포를 자동으로 해요. **검사에 실패하면 배포되지 않아요.** (Actions 탭에서 오류 확인)

## 주의: 게임 안의 경로는 상대경로로

사이트는 `https://<user>.github.io/<repo>/` 처럼 **서브경로** 아래에 올라가요.

| | 예시 | 결과 |
| --- | --- | --- |
| O | `assets/hero.png`, `./sound/jump.wav` | 정상 |
| X | `/assets/hero.png` | `https://<user>.github.io/assets/hero.png`를 찾아서 깨짐 |
| X | `http://localhost:3000/...` | 배포 후 깨짐 |

그 밖에:

- 게임이 쓰는 방향키, 스페이스는 `keydown`에서 `e.preventDefault()`를 호출해 주세요.
- 게임은 iframe 안에서 실행돼요. `sandbox="allow-scripts allow-same-origin allow-pointer-lock"` 범위 안에서 동작해야 해요. (팝업, 폼 전송, 상위 페이지 이동은 막혀 있어요)

## 기록 연동하는 법

> 점수 기록 기능(3단계)은 아직 들어오지 않았어요. 지금 준비된 건 아래까지예요.

- 하단 탭바의 **기록** 탭과 `#/records` 페이지 자리 (지금은 "준비 중" 화면)
- 설정 페이지의 **기록** 섹션 자리 (기록 초기화/내보내기가 들어갈 곳)
- `js/settings.js`의 `getGameSettings()`: 게임(iframe)에 넘길 테마, 밝기, 언어, 음소거, 모션 줄이기 값을 모아 줘요

기록 기능이 붙으면 게임 쪽에서 점수를 보내는 방법을 이 섹션에 정리할 예정이에요.

## 데브로그 쓰는 법

1. `devlog/_template.md`를 복사해서 `devlog/YYYY-MM-DD-짧은-이름.md`로 저장해요. 파일 이름이 주소가 돼요: `#/devlog/YYYY-MM-DD-짧은-이름`
2. 맨 위 front matter를 채워요.

   ```
   ---
   title: { ko: "게임허브 오픈", en: "GAMEHUB is live" }
   date: 2026-10-28
   type: update        # update / new-game / dev-note
   games: [pong]       # 관련 게임 id (선택)
   lang: ko            # 본문 언어
   summary: { ko: "한 줄 요약", en: "One-line summary" }
   ---
   ```

   - 한 줄에 `키: 값` 하나. 값은 문자열, `[a, b]` 목록, `{ ko: "...", en: "..." }` 중 하나예요.
   - 필수: `title`, `date`, `type`, `lang`, `summary`. `games`에 없는 게임 id를 쓰면 빌드 에러가 나요.
3. 본문은 마크다운이에요. 제목, 문단, **굵게**/*기울임*, 링크, 이미지, 목록, `인라인 코드`, 코드 블록, 인용을 쓸 수 있어요. HTML 태그는 지원하지 않아요(글자 그대로 보여요).
4. 이미지는 `devlog/images/`에 넣고 `![설명](images/파일.png)`처럼 상대경로로 써요. 크기는 빌드할 때 자동으로 읽어서 넣어요.
5. `npm run registry`로 검사해요. 통과하면 `data/devlog.json`이 만들어지고, 메인의 "데브로그" 섹션(최신 3개), 관련 게임 페이지의 "관련 데브로그"에도 나와요.

## 테마 추가하는 법

자세한 순서는 [`CLAUDE.md`의 "새 테마 추가하는 법"](CLAUDE.md)에 있어요. 요약하면:

1. `css/tokens.css`에 `[data-theme="<id>"] { ... }` 블록을 추가하고 맨 위 주석의 변수를 전부 채워요.
2. `js/settings.js`의 `THEMES`, `index.html`의 인라인 스크립트, `js/i18n.js`의 테마 이름에 id를 추가해요.
3. 텍스트 대비 4.5:1 이상인지 확인해요. 컴포넌트 CSS(`css/components.css`)는 건드리지 않아요.

## 배포 (GitHub Pages)

push하면 GitHub Actions(`.github/workflows/deploy.yml`)가 `build-registry.mjs`와 `build-devlog.mjs`를 실행하고, 둘 다 통과하면 배포해요.
`data/games.json`, `data/devlog.json`은 git에 올라가지 않고 배포할 때 만들어져요.

### GitHub에 처음 연결하기

1. GitHub에서 **새 저장소**를 만들어요. (예: `gamehub`, README 추가 체크는 **끄기**)
2. 이 폴더에서 원격 저장소를 연결하고 push해요.

   ```bash
   git remote add origin https://github.com/<user>/gamehub.git
   git branch -M main
   git push -u origin main
   ```

3. GitHub 저장소에서 **Settings → Pages**로 가서
   **Build and deployment → Source**를 **GitHub Actions**로 바꿔요.
4. **Actions** 탭에서 "Deploy to GitHub Pages" 워크플로가 실행되는지 확인해요.
   (처음 push 때 Source를 바꾸기 전이라 실패했다면, Actions 탭에서 **Run workflow**로 다시 실행하세요)
5. 완료되면 `https://<user>.github.io/gamehub/`에서 확인할 수 있어요.

### 공개 전에 채울 것

- `og.png`(1200×630): 공유 미리보기 이미지. 들어 있는 건 기본 이미지라 원하면 바꿔요.
- `index.html`의 `og:image`는 지금 상대경로(`og.png`)예요. 일부 SNS는 절대 주소만 읽으니까 배포 주소가 정해지면 `https://<user>.github.io/<repo>/og.png`로 바꿔 주세요.
- About 페이지 소개 문구: `js/i18n.js`의 `about.intro` (ko/en)
- GitHub/피드백 링크: `js/config.js`의 `SITE`

## 폴더 구조

```
index.html              앱 셸 (+ 깜빡임 방지 인라인 스크립트, og 메타)
og.png, favicon.svg     공유 이미지, 파비콘
css/                    tokens(테마 변수) / base / components / themes/<id>.css
js/                     main, router, store, settings, i18n, config, pages/, components/
data/games.json         자동 생성 (직접 수정 금지, git에 올라가지 않음)
data/devlog.json        자동 생성 (직접 수정 금지, git에 올라가지 않음)
games/_template/        새 게임용 템플릿
games/<id>/             게임
devlog/                 데브로그 글 (_template.md, images/)
scripts/                build-registry.mjs, build-devlog.mjs
.github/workflows/deploy.yml
```

프로젝트 규칙은 [`CLAUDE.md`](CLAUDE.md)에 있어요.
