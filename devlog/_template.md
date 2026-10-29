---
title: { ko: "글 제목", en: "Post title" }
date: 2026-10-28
type: update        # update(업데이트) / new-game(새 게임) / dev-note(개발 노트)
games: [pong]       # 관련 게임 id (선택). games/ 폴더에 없는 id 면 빌드 에러
lang: ko            # 본문 언어 (ko / en)
summary: { ko: "목록 카드에 나오는 한 줄 요약", en: "One-line summary for the list" }
---

이 파일을 복사해서 `devlog/YYYY-MM-DD-짧은-이름.md` 로 저장하세요. 파일 이름(확장자 제외)이 주소가 돼요: `#/devlog/YYYY-MM-DD-짧은-이름`
`_` 로 시작하는 파일(이 템플릿)은 빌드에서 빠져요.

## front matter 규칙

- 맨 위 `---` 와 `---` 사이, 한 줄에 `키: 값` 하나.
- 값은 셋 중 하나: 그냥 문자열(따옴표 선택), `[a, b]` 목록, `{ ko: "...", en: "..." }`.
- 필수: `title`, `date`, `type`, `lang`, `summary`. 선택: `games`.
- `title` 과 `summary` 는 문자열 하나로 써도 돼요. 영어가 없으면 영어 화면에서도 한국어로 보여요.
- 따옴표 밖의 ` #` 뒤는 주석이에요.

## 본문에 쓸 수 있는 문법

# 제목 (화면에서는 글 제목 아래 단계로 표시)
## 작은 제목

문단은 빈 줄로 나눠요. **굵게**, *기울임*, `인라인 코드`, [링크](https://example.com), [게임 링크](#/game/pong).

- 목록
- 목록

1. 순서 목록
2. 순서 목록

> 인용문

```js
console.log('코드 블록');
```

![이미지 설명(대체 텍스트)](images/파일이름.png)

- 이미지는 `devlog/images/` 에 넣고 `images/파일이름.png` 처럼 상대경로로 써요. 파일이 없으면 빌드 에러.
- HTML 태그는 지원하지 않아요. 글에 쓰면 글자 그대로 보여요.
