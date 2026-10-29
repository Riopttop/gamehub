// data/games.json 을 불러오고 조회 함수를 제공한다.
// games.json 은 scripts/build-registry.mjs 가 만든 파일이다. (직접 수정 금지)

import { parseDate } from './utils.js';

const NEW_DAYS = 14;
let games = [];

export async function loadGames() {
  const res = await fetch('data/games.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error(`data/games.json: HTTP ${res.status}`);
  const data = await res.json();
  games = Array.isArray(data.games) ? data.games : [];
  return games;
}

export function getGames() {
  return games;
}

export function getGame(id) {
  return games.find((g) => g.id === id) ?? null;
}

function byUpdatedDesc(a, b) {
  return b.updated.localeCompare(a.updated) || a.id.localeCompare(b.id);
}

// featured 가 여러 개면 updated 가 가장 최근인 것
export function getFeatured() {
  return games.filter((g) => g.featured).sort(byUpdatedDesc)[0] ?? null;
}

// 실제로 쓰이는 태그만, 알파벳 순
export function getAllTags() {
  return [...new Set(games.flatMap((g) => g.tags))].sort();
}

export function isNew(game, now = new Date()) {
  const diffDays = (now - parseDate(game.updated)) / 86_400_000;
  return diffDays >= 0 && diffDays < NEW_DAYS;
}

// 제목과 설명(ko/en 모두)으로 검색, tag 가 'all' 이 아니면 태그 필터
export function filterGames({ query = '', tag = 'all' } = {}) {
  const q = query.trim().toLowerCase();
  return games.filter((g) => {
    if (tag !== 'all' && !g.tags.includes(tag)) return false;
    if (!q) return true;
    const haystack = [g.title, ...Object.values(g.description ?? {})].join(' ').toLowerCase();
    return haystack.includes(q);
  });
}

// 태그가 많이 겹치는 순, 같으면 최신순
export function getRelated(game, count = 3) {
  return games
    .filter((g) => g.id !== game.id)
    .map((g) => ({ g, score: g.tags.filter((tag) => game.tags.includes(tag)).length }))
    .sort((a, b) => b.score - a.score || byUpdatedDesc(a.g, b.g))
    .slice(0, count)
    .map(({ g }) => g);
}

// --------------------------------------------------------------------------
// 데브로그: data/devlog.json (scripts/build-devlog.mjs 가 생성, 최신순)
// --------------------------------------------------------------------------
let posts = [];

export async function loadDevlog() {
  const res = await fetch('data/devlog.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error(`data/devlog.json: HTTP ${res.status}`);
  const data = await res.json();
  posts = Array.isArray(data.posts) ? data.posts : [];
  return posts;
}

export function getPosts(type = 'all') {
  return type === 'all' ? posts : posts.filter((p) => p.type === type);
}

export function getPost(slug) {
  return posts.find((p) => p.slug === slug) ?? null;
}

// 실제로 쓰이는 type 만, 정해진 순서대로
export function getPostTypes() {
  return ['update', 'new-game', 'dev-note'].filter((type) => posts.some((p) => p.type === type));
}

export function getPostsForGame(id) {
  return posts.filter((p) => p.games?.includes(id));
}

// 목록이 최신순이므로 newer 는 앞, older 는 뒤
export function getAdjacentPosts(slug) {
  const i = posts.findIndex((p) => p.slug === slug);
  if (i === -1) return { newer: null, older: null };
  return { newer: posts[i - 1] ?? null, older: posts[i + 1] ?? null };
}
