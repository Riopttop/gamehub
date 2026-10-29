# 게임 템플릿

새 게임을 추가할 때 이 폴더를 통째로 복사해서 쓰세요.

```bash
cp -r games/_template games/my-new-game
```

- 폴더 이름이 곧 게임 id예요. **소문자, 숫자, 하이픈(-)만** 쓸 수 있어요. (예: `neon-blade`, `snake2`)
- `_`로 시작하는 폴더(이 템플릿처럼)는 게임 목록에서 빠져요.
- 복사한 뒤에 이 `README.md`는 지워도 돼요.

## 폴더 구성

| 파일 | 필수 | 설명 |
| --- | --- | --- |
| `game.json` | 필수 | 게임 정보 (아래 필드 설명 참고) |
| `index.html` | `status`가 `live`면 필수 | 게임 본체. iframe 안에서 실행됨 |
| `thumb.png` | 필수 | 썸네일, **16:10** 비율. `png`, `jpg`, `jpeg`, `webp`, `svg` 중 하나 |
| `preview.gif` | 선택 | 카드에 마우스를 올렸을 때 보이는 미리보기. `gif`, `webp`, `svg` 중 하나 |

## game.json 필드

| 필드 | 필수 | 형식 | 설명 |
| --- | --- | --- | --- |
| `title` | 필수 | 문자열 | 게임 제목 |
| `description.ko` | 필수 | 문자열 | 카드와 배너에 표시되는 한 줄 설명 |
| `description.en` | 선택 | 문자열 | 영어 설명 (없으면 한국어로 표시) |
| `about` | 선택 | `{ "ko", "en" }` | 게임 페이지 "게임 소개"의 긴 설명. 없으면 `description` 사용 |
| `tags` | 필수 | 문자열 배열 | 영어 키로 작성. 화면 표시는 `js/i18n.js`의 `TAG_LABELS`가 담당. 새 태그를 쓰면 거기에 라벨을 추가 |
| `controls` | 선택 | 배열 | `{ "action": { "ko", "en" }, "keys": "A / D" }`. `keys`는 ` / `, ` + `, `,`로 구분하면 키캡이 따로따로 그려짐 |
| `input` | 필수 | 객체 | `{ "keyboard": true, "touch": false }`. 터치를 지원하지 않으면 모바일에서 "키보드 필요" 안내가 뜸 |
| `status` | 필수 | `"live"` 또는 `"soon"` | `soon`이면 `index.html` 없이 COMING SOON으로 표시 |
| `featured` | 선택 | 불리언 | `true`면 메인 추천 배너 후보. 여러 개면 `updated`가 가장 최근인 것이 선택됨 |
| `aspect` | 필수 | `"16:9"` 또는 `"9:16"` | 플레이 영역 비율 (세로 게임은 `9:16`) |
| `version` | 선택 | 문자열 | 현재 버전 (예: `"1.2.0"`) |
| `updated` | 필수 | `YYYY-MM-DD` | 마지막 업데이트 날짜. 목록 정렬, NEW 뱃지(14일 이내)에 쓰임 |
| `changelog` | 선택 | 배열 | `{ "version", "date": "YYYY-MM-DD", "notes": { "ko", "en" } }` |

## 게임 만들 때 주의할 점

- **에셋 경로는 상대경로로.** `assets/hero.png`(O), `/assets/hero.png`(X).
  사이트가 `https://<user>.github.io/<repo>/` 아래에 올라가기 때문에 `/`로 시작하면 깨져요.
- 게임이 쓰는 키(방향키, 스페이스)는 `keydown`에서 `e.preventDefault()`를 호출하세요.
  (포털에서도 막아주지만, 게임에서 직접 막는 게 가장 확실해요.)
- 게임 화면은 iframe 크기에 맞춰 늘어나야 해요. (`width: 100%; height: 100%`)
- 페이지 로드만으로 소리가 나면 안 돼요. 포털에서는 플레이 버튼을 눌러야 로드되지만, 게임에서도 첫 입력 이후에 오디오를 시작하는 게 좋아요.

검사:

```bash
npm run registry
```
