// ko/en 문자열 사전.
// 현재 언어는 js/settings.js 가 저장/복원하고 setLang() 으로 알려준다.
// 주의: scripts/build-registry.mjs 가 이 파일을 Node에서 import 하므로
//       모듈 최상단에서 window, document, localStorage 를 건드리면 안 된다.

export const LANGS = ['ko', 'en'];
export const DEFAULT_LANG = 'ko';

const STRINGS = {
  ko: {
    'skip': '본문으로 건너뛰기',
    'nav.label': '주 메뉴',
    'nav.games': '게임',
    'nav.devlog': '데브로그',
    'nav.about': 'About',
    'header.search': '게임 검색',
    'header.searchPlaceholder': '게임 검색',
    'nav.settings': '설정',
    'header.settings': '설정',
    'header.theme': '테마 바꾸기',
    'header.themeMenu': '테마',
    'footer.text': '직접 만든 브라우저 게임 모음',

    'home.featured': '추천 게임',
    'home.playNow': '지금 플레이',
    'home.allGames': '전체 게임',
    'home.filterLabel': '태그 필터',
    'home.filterAll': '전체',
    'home.count': '{n}개',
    'home.empty.title': '조건에 맞는 게임이 없어요',
    'home.empty.body': '다른 태그를 고르거나 검색어를 바꿔 보세요.',
    'home.empty.reset': '필터 초기화',

    'badge.new': 'NEW',
    'badge.soon': 'COMING SOON',
    'input.keyboard': '키보드',
    'input.touch': '터치',
    'input.supported': '지원',
    'input.unsupported': '미지원',
    'input.supportsKeyboard': '키보드 지원',
    'input.supportsTouch': '터치 지원',

    'game.back': '게임 목록',
    'game.play': '플레이',
    'game.playLabel': '{title} 플레이',
    'game.frameTitle': '{title} 게임 화면',
    'game.toolbar': '게임 컨트롤',
    'game.fullscreen': '전체화면',
    'game.exitFullscreen': '전체화면 종료',
    'game.restart': '재시작',
    'game.copyLink': '링크 복사',
    'game.copied': '링크를 복사했어요',
    'game.copyFailed': '복사하지 못했어요. 주소창의 링크를 직접 복사해 주세요.',
    'game.controls': '조작법',
    'game.input': '입력 지원',
    'game.info': '정보',
    'game.version': '버전',
    'game.updated': '업데이트',
    'game.about': '게임 소개',
    'game.changelog': '업데이트 기록',
    'game.related': '다른 게임',
    'game.soon.title': '준비 중인 게임이에요',
    'game.soon.body': '곧 플레이할 수 있어요. 조금만 기다려 주세요.',

    'placeholder.body': '이 페이지는 아직 준비 중이에요.',
    'placeholder.home': '게임 보러 가기',
    'notfound.title': '페이지를 찾을 수 없어요',
    'notfound.body': '주소가 잘못됐거나 없어진 페이지예요.',
    'notfound.gameTitle': '게임을 찾을 수 없어요',
    'notfound.gameBody': '주소가 잘못됐거나 내려간 게임이에요.',
    'notfound.home': '메인으로',
    'error.load': '데이터를 불러오지 못했어요',
    'error.loadHint': '네트워크 상태를 확인하고 다시 시도해 주세요. 로컬에서는 먼저 npm run registry 로 data/ 파일을 만들어야 해요.',

    'settings.title': '설정',
    'settings.intro': '바꾸는 즉시 적용되고 이 브라우저에 저장돼요.',
    'settings.theme': '테마',
    'settings.current': '사용 중',
    'settings.mode': '밝기',
    'settings.modeHint': '밝기는 베이식 테마에서만 바꿀 수 있어요. 다른 테마는 항상 어두워요.',
    'settings.mode.system': '시스템',
    'settings.mode.light': '라이트',
    'settings.mode.dark': '다크',
    'settings.lang': '언어',
    'settings.a11y': '접근성',
    'settings.motion': '모션 줄이기',
    'settings.motionHint': '켜면 카드 호버 애니메이션, 미리보기 자동재생, 테마 전환 효과가 꺼져요.',
    'settings.motion.system': '시스템',
    'settings.motion.on': '켜기',
    'settings.motion.off': '끄기',
    'settings.records': '기록',
    'settings.recordsSoon': '게임 기록 초기화와 내보내기는 준비 중이에요.',
    'settings.reset': '초기화',
    'settings.resetHint': '테마, 밝기, 언어, 접근성 설정을 기본값으로 되돌려요.',
    'settings.resetButton': '설정 초기화',
    'settings.resetConfirmTitle': '설정을 초기화할까요?',
    'settings.resetConfirmBody': '테마, 밝기, 언어, 모션 설정이 기본값으로 돌아가요. 되돌릴 수 없어요.',
    'settings.cancel': '취소',
    'settings.confirmReset': '초기화',
    'settings.resetDone': '설정을 초기화했어요.',

    'theme.basic': '베이식',
    'theme.basic.desc': '깔끔하고 중립적인 기본 테마',
    'theme.neon': '네온',
    'theme.neon.desc': '어두운 남색에 시안과 핑크 포인트',
    'theme.retro': '레트로',
    'theme.retro.desc': '픽셀 폰트와 두꺼운 테두리',
    'theme.terminal': '터미널',
    'theme.terminal.desc': '검은 화면에 초록 글자',

    'lang.ko': '한국어',
    'lang.en': 'English',

    'meta.description': '직접 만든 브라우저 게임 모음. 설치 없이 바로 플레이하세요.',
    'nav.home': '홈',
    'nav.records': '기록',
    'nav.menu': '메뉴',
    'nav.tabbar': '하단 메뉴',
    'header.openSearch': '검색 열기',
    'header.closeSearch': '검색 닫기',
    'header.openMenu': '메뉴 열기',
    'header.closeMenu': '메뉴 닫기',

    'home.devlog': '데브로그',
    'home.devlogAll': '전체 보기',

    'devlog.title': '데브로그',
    'devlog.description': 'GAMEHUB 업데이트, 새 게임, 개발 노트',
    'devlog.filterLabel': '글 종류 필터',
    'devlog.all': '전체',
    'devlog.type.update': '업데이트',
    'devlog.type.new-game': '새 게임',
    'devlog.type.dev-note': '개발 노트',
    'devlog.empty': '아직 글이 없어요.',
    'devlog.back': '데브로그 목록',
    'devlog.newer': '다음 글',
    'devlog.older': '이전 글',
    'devlog.pager': '다른 글',
    'devlog.relatedGames': '관련 게임',
    'devlog.langNote': '이 글은 {lang}로 작성됐어요.',
    'game.devlog': '관련 데브로그',

    'records.title': '기록',

    'about.title': 'About',
    'about.description': 'GAMEHUB 소개, 사용한 기술, 링크',
    'about.intro': '[소개 문구]',
    'about.tech': '사용한 기술',
    'about.tech.web': '순수 HTML, CSS, JavaScript (ES 모듈). 프레임워크와 npm 의존성 없음',
    'about.tech.router': '해시 라우터로 만든 단일 페이지 앱',
    'about.tech.build': 'Node 기본 모듈로 만든 게임 목록, 데브로그 생성 스크립트',
    'about.tech.deploy': 'GitHub Actions로 검사 후 GitHub Pages에 배포',
    'about.tech.themes': 'CSS 변수로 만든 테마 4종',
    'about.links': '링크',
    'about.github': 'GitHub 저장소',
    'about.githubMissing': '[GitHub 저장소 링크]',
    'about.feedback': '피드백 보내기',
    'about.feedbackMissing': '[피드백 받는 곳]',
    'about.newTab': '(새 탭)',

    'game.rotate.landscape': '가로로 돌려주세요',
    'game.rotate.portrait': '세로로 돌려주세요',
    'game.rotate.dismiss': '이대로 할게요',
    'game.keyboardOnly.title': '키보드가 필요한 게임이에요',
    'game.keyboardOnly.body': '터치로는 조작할 수 없어요. 키보드가 연결돼 있다면 열어도 돼요.',
    'game.openAnyway': '그래도 열기',

    'notfound.postTitle': '글을 찾을 수 없어요',
    'notfound.postBody': '주소가 잘못됐거나 지워진 글이에요.',
    'error.retry': '다시 시도',
    'error.loading': '불러오는 중...',
  },
  en: {
    'skip': 'Skip to content',
    'nav.label': 'Main menu',
    'nav.games': 'Games',
    'nav.devlog': 'Devlog',
    'nav.about': 'About',
    'header.search': 'Search games',
    'header.searchPlaceholder': 'Search games',
    'nav.settings': 'Settings',
    'header.settings': 'Settings',
    'header.theme': 'Change theme',
    'header.themeMenu': 'Theme',
    'footer.text': 'A collection of handmade browser games',

    'home.featured': 'Featured',
    'home.playNow': 'Play now',
    'home.allGames': 'All games',
    'home.filterLabel': 'Filter by tag',
    'home.filterAll': 'All',
    'home.count': '{n} games',
    'home.empty.title': 'No games match',
    'home.empty.body': 'Try another tag or search term.',
    'home.empty.reset': 'Reset filters',

    'badge.new': 'NEW',
    'badge.soon': 'COMING SOON',
    'input.keyboard': 'Keyboard',
    'input.touch': 'Touch',
    'input.supported': 'supported',
    'input.unsupported': 'not supported',
    'input.supportsKeyboard': 'Keyboard supported',
    'input.supportsTouch': 'Touch supported',

    'game.back': 'All games',
    'game.play': 'Play',
    'game.playLabel': 'Play {title}',
    'game.frameTitle': '{title} game',
    'game.toolbar': 'Game controls',
    'game.fullscreen': 'Fullscreen',
    'game.exitFullscreen': 'Exit fullscreen',
    'game.restart': 'Restart',
    'game.copyLink': 'Copy link',
    'game.copied': 'Link copied',
    'game.copyFailed': 'Could not copy. Please copy the URL from the address bar.',
    'game.controls': 'Controls',
    'game.input': 'Input',
    'game.info': 'Info',
    'game.version': 'Version',
    'game.updated': 'Updated',
    'game.about': 'About this game',
    'game.changelog': 'Changelog',
    'game.related': 'More games',
    'game.soon.title': 'Coming soon',
    'game.soon.body': 'This game is not playable yet. Stay tuned.',

    'placeholder.body': 'This page is coming soon.',
    'placeholder.home': 'Browse games',
    'notfound.title': 'Page not found',
    'notfound.body': 'The address is wrong or the page no longer exists.',
    'notfound.gameTitle': 'Game not found',
    'notfound.gameBody': 'The address is wrong or the game was removed.',
    'notfound.home': 'Go home',
    'error.load': 'Could not load data',
    'error.loadHint': 'Check your connection and try again. Locally, run npm run registry first to generate the data/ files.',

    'settings.title': 'Settings',
    'settings.intro': 'Changes apply right away and are saved in this browser.',
    'settings.theme': 'Theme',
    'settings.current': 'Current',
    'settings.mode': 'Brightness',
    'settings.modeHint': 'Brightness is only available for the Basic theme. Other themes are always dark.',
    'settings.mode.system': 'System',
    'settings.mode.light': 'Light',
    'settings.mode.dark': 'Dark',
    'settings.lang': 'Language',
    'settings.a11y': 'Accessibility',
    'settings.motion': 'Reduce motion',
    'settings.motionHint': 'Turns off card hover animations, preview autoplay and theme transitions.',
    'settings.motion.system': 'System',
    'settings.motion.on': 'On',
    'settings.motion.off': 'Off',
    'settings.records': 'Records',
    'settings.recordsSoon': 'Resetting and exporting game records is coming soon.',
    'settings.reset': 'Reset',
    'settings.resetHint': 'Restore theme, brightness, language and accessibility settings to defaults.',
    'settings.resetButton': 'Reset settings',
    'settings.resetConfirmTitle': 'Reset settings?',
    'settings.resetConfirmBody': 'Theme, brightness, language and motion settings will return to defaults. This cannot be undone.',
    'settings.cancel': 'Cancel',
    'settings.confirmReset': 'Reset',
    'settings.resetDone': 'Settings have been reset.',

    'theme.basic': 'Basic',
    'theme.basic.desc': 'Clean and neutral default',
    'theme.neon': 'Neon',
    'theme.neon.desc': 'Dark navy with cyan and pink accents',
    'theme.retro': 'Retro',
    'theme.retro.desc': 'Pixel font and chunky borders',
    'theme.terminal': 'Terminal',
    'theme.terminal.desc': 'Green text on a black screen',

    'lang.ko': '한국어',
    'lang.en': 'English',

    'meta.description': 'A collection of handmade browser games. Play instantly, no install.',
    'nav.home': 'Home',
    'nav.records': 'Records',
    'nav.menu': 'Menu',
    'nav.tabbar': 'Bottom menu',
    'header.openSearch': 'Open search',
    'header.closeSearch': 'Close search',
    'header.openMenu': 'Open menu',
    'header.closeMenu': 'Close menu',

    'home.devlog': 'Devlog',
    'home.devlogAll': 'See all',

    'devlog.title': 'Devlog',
    'devlog.description': 'GAMEHUB updates, new games and dev notes',
    'devlog.filterLabel': 'Filter by post type',
    'devlog.all': 'All',
    'devlog.type.update': 'Update',
    'devlog.type.new-game': 'New game',
    'devlog.type.dev-note': 'Dev note',
    'devlog.empty': 'No posts yet.',
    'devlog.back': 'All posts',
    'devlog.newer': 'Newer',
    'devlog.older': 'Older',
    'devlog.pager': 'More posts',
    'devlog.relatedGames': 'Related games',
    'devlog.langNote': 'This post is written in {lang}.',
    'game.devlog': 'Related devlog',

    'records.title': 'Records',

    'about.title': 'About',
    'about.description': 'About GAMEHUB, the tech behind it and links',
    'about.intro': '[Introduction]',
    'about.tech': 'Built with',
    'about.tech.web': 'Plain HTML, CSS and JavaScript (ES modules). No frameworks, no npm dependencies',
    'about.tech.router': 'Single-page app with a hash router',
    'about.tech.build': 'Game list and devlog generator scripts using only Node built-ins',
    'about.tech.deploy': 'Validated by GitHub Actions and deployed to GitHub Pages',
    'about.tech.themes': 'Four themes built on CSS variables',
    'about.links': 'Links',
    'about.github': 'GitHub repository',
    'about.githubMissing': '[GitHub repository link]',
    'about.feedback': 'Send feedback',
    'about.feedbackMissing': '[Feedback link]',
    'about.newTab': '(opens in a new tab)',

    'game.rotate.landscape': 'Rotate to landscape',
    'game.rotate.portrait': 'Rotate to portrait',
    'game.rotate.dismiss': 'Keep playing like this',
    'game.keyboardOnly.title': 'This game needs a keyboard',
    'game.keyboardOnly.body': 'Touch controls are not supported. If you have a keyboard connected, you can still open it.',
    'game.openAnyway': 'Open anyway',

    'notfound.postTitle': 'Post not found',
    'notfound.postBody': 'The address is wrong or the post was removed.',
    'error.retry': 'Try again',
    'error.loading': 'Loading...',
  },
};

// 태그는 영어 키로 저장하고 화면에는 여기 라벨로 표시한다.
// 새 태그를 쓰면 여기에 추가할 것 (없으면 build-registry 가 경고를 출력).
export const TAG_LABELS = {
  ko: {
    action: '액션',
    platformer: '플랫포머',
    education: '교육',
    classic: '클래식',
    survival: '서바이벌',
    arcade: '아케이드',
    puzzle: '퍼즐',
  },
  en: {
    action: 'Action',
    platformer: 'Platformer',
    education: 'Education',
    classic: 'Classic',
    survival: 'Survival',
    arcade: 'Arcade',
    puzzle: 'Puzzle',
  },
};

let currentLang = DEFAULT_LANG;

export function getLang() {
  return currentLang;
}

// js/settings.js 가 호출한다. 화면 다시 그리기는 main.js 가 맡는다.
export function setLang(lang) {
  if (LANGS.includes(lang)) currentLang = lang;
}

// t('home.count', { n: 3 }) → '3개'
export function t(key, params) {
  const lang = getLang();
  let str = STRINGS[lang]?.[key] ?? STRINGS[DEFAULT_LANG][key] ?? key;
  if (params) {
    str = str.replace(/\{(\w+)\}/g, (m, name) => (name in params ? String(params[name]) : m));
  }
  return str;
}

// { ko, en } 객체에서 현재 언어 값을 고른다. 없으면 ko, 그것도 없으면 빈 문자열.
export function tl(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value[getLang()] ?? value[DEFAULT_LANG] ?? '';
}

export function tagLabel(tag) {
  return TAG_LABELS[getLang()]?.[tag] ?? TAG_LABELS[DEFAULT_LANG][tag] ?? tag;
}

export function formatDate(isoDate) {
  const [y, m, d] = String(isoDate).split('-').map(Number);
  if (!y || !m || !d) return String(isoDate);
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat(getLang(), { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
}
