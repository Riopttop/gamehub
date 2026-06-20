/**
 * Game Registry
 * ----------------------------------------------------------------
 * 새 게임 추가:
 *   1. /src/games/<id>/ 폴더 생성 (예: /src/games/snake/)
 *   2. 그 안에 index.js, meta.js, (필요하면) 게임 자체 파일들
 *   3. 아래 배열에 메타데이터 추가
 *   4. 썸네일 PNG는 /assets/thumbnails/<id>.png
 *
 * 필수 필드:
 *   id        - 고유 식별자 (kebab-case)
 *   name      - { ko, en } 형태로 다국어 지원
 *   genre     - 'arcade' | 'puzzle' | 'horror' | 'competitive'
 *   players   - 1 또는 2
 *
 * 선택 필드:
 *   emoji     - 썸네일 PNG 없을 때 대체 표시
 *   thumbnail - PNG 경로 (있으면 emoji 대신 사용됨)
 *   load      - 동적 import 함수 (게임 만들 때 추가)
 *
 * 예시 (게임 실제로 만들 때):
 *   {
 *     id: 'snake',
 *     name: { ko: '스네이크', en: 'Snake' },
 *     genre: 'arcade',
 *     players: 1,
 *     thumbnail: 'assets/thumbnails/snake.png',
 *     load: () => import('./snake/index.js'),
 *   }
 */

export const GAMES = [
  { id: 'snake',       name: { ko: '스네이크',    en: 'Snake' },       genre: 'arcade',      players: 1, emoji: '🐍' },
  { id: 'pong',        name: { ko: '퐁',          en: 'Pong' },        genre: 'competitive', players: 2, emoji: '🏓' },
  { id: 'shadow-hunt', name: { ko: '그림자 사냥', en: 'Shadow Hunt' }, genre: 'horror',      players: 1, emoji: '👻' },
  { id: 'sokoban',     name: { ko: '소코반',      en: 'Sokoban' },     genre: 'puzzle',      players: 1, emoji: '📦' },
  { id: 'tank-battle', name: { ko: '탱크 배틀',   en: 'Tank Battle' }, genre: 'competitive', players: 2, emoji: '🚜' },
  { id: 'maze-escape', name: { ko: '미로 탈출',   en: 'Maze Escape' }, genre: 'horror',      players: 1, emoji: '🕯️' },
  { id: 'block-blitz', name: { ko: '블록 블리츠', en: 'Block Blitz' }, genre: 'puzzle',      players: 1, emoji: '🧩' },
  { id: 'duel-dash',   name: { ko: '듀얼 대시',   en: 'Duel Dash' },   genre: 'competitive', players: 2, emoji: '⚡' },
];

export function getGameById(id) {
  return GAMES.find(g => g.id === id);
}
