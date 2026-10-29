#!/usr/bin/env node
// games/<id>/ 폴더들을 검사하고 data/games.json 을 생성한다.
// Node 기본 모듈만 사용. 사용법: node scripts/build-registry.mjs (또는 npm run registry)
// 문제가 하나라도 있으면 어떤 게임의 어떤 필드인지 출력하고 exit code 1 로 끝난다.

import { existsSync, readFileSync } from 'node:fs';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TAG_LABELS } from '../js/i18n.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GAMES_DIR = path.join(ROOT, 'games');
const OUT_FILE = path.join(ROOT, 'data', 'games.json');

const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TAG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const THUMB_EXTS = ['png', 'jpg', 'jpeg', 'webp', 'svg'];
const PREVIEW_EXTS = ['gif', 'webp', 'svg'];
const STATUSES = ['live', 'soon'];
const ASPECTS = ['16:9', '9:16'];

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);
const red = paint('31');
const yellow = paint('33');
const green = paint('32');
const dim = paint('2');

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isNonEmptyString = (v) => typeof v === 'string' && v.trim() !== '';

function isValidDate(value) {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function findFile(dir, base, exts) {
  return exts.map((ext) => `${base}.${ext}`).find((name) => existsSync(path.join(dir, name))) ?? null;
}

function checkLocalized(value, field, errors, { required = true } = {}) {
  if (value === undefined && !required) return;
  if (!isObject(value)) {
    errors.push(`${field}: { "ko": "...", "en": "..." } 형식의 객체여야 해요`);
    return;
  }
  if (!isNonEmptyString(value.ko)) errors.push(`${field}.ko: 비어 있지 않은 문자열이 필요해요`);
  if (value.en !== undefined && typeof value.en !== 'string') errors.push(`${field}.en: 문자열이어야 해요`);
}

function validateGame(id) {
  const dir = path.join(GAMES_DIR, id);
  const errors = [];
  const warnings = [];

  if (!ID_RE.test(id)) {
    errors.push(`폴더 이름 "${id}": 소문자, 숫자, 하이픈(-)만 쓸 수 있어요 (예: neon-blade)`);
  }

  // game.json
  const jsonPath = path.join(dir, 'game.json');
  if (!existsSync(jsonPath)) {
    errors.push('game.json 파일이 없어요');
    return { errors, warnings };
  }
  let data;
  try {
    data = JSON.parse(stripBom(readFileSync(jsonPath, 'utf8')));
  } catch (err) {
    errors.push(`game.json: JSON 형식이 잘못됐어요 (${err.message})`);
    return { errors, warnings };
  }
  if (!isObject(data)) {
    errors.push('game.json: 최상위는 { } 객체여야 해요');
    return { errors, warnings };
  }

  // 필수 필드
  if (!isNonEmptyString(data.title)) errors.push('title: 필수 필드예요 (비어 있지 않은 문자열)');

  if (data.description === undefined) errors.push('description: 필수 필드예요 ({ "ko": "...", "en": "..." })');
  else {
    checkLocalized(data.description, 'description', errors);
    if (isObject(data.description) && data.description.en === undefined) {
      warnings.push('description.en: 영어 설명이 없어요 (한국어로 대신 표시돼요)');
    }
  }

  if (data.tags === undefined) errors.push('tags: 필수 필드예요 (문자열 배열)');
  else if (!Array.isArray(data.tags)) errors.push('tags: 배열이어야 해요 (예: ["action", "platformer"])');
  else {
    data.tags.forEach((tag, i) => {
      if (typeof tag !== 'string' || !TAG_RE.test(tag)) {
        errors.push(`tags[${i}]: "${tag}" — 영어 소문자, 숫자, 하이픈만 쓸 수 있어요`);
      } else if (!(tag in TAG_LABELS.ko)) {
        warnings.push(`tags[${i}]: "${tag}" 태그의 한국어 라벨이 없어요 (js/i18n.js 의 TAG_LABELS 에 추가하세요)`);
      }
    });
    if (new Set(data.tags).size !== data.tags.length) warnings.push('tags: 중복된 태그가 있어요');
  }

  if (data.input === undefined) errors.push('input: 필수 필드예요 ({ "keyboard": true, "touch": false })');
  else if (!isObject(data.input)) errors.push('input: 객체여야 해요 ({ "keyboard": true, "touch": false })');
  else {
    for (const key of ['keyboard', 'touch']) {
      if (typeof data.input[key] !== 'boolean') errors.push(`input.${key}: true 또는 false 여야 해요`);
    }
  }

  if (data.status === undefined) errors.push(`status: 필수 필드예요 (${STATUSES.join(' 또는 ')})`);
  else if (!STATUSES.includes(data.status)) {
    errors.push(`status: "${data.status}" — ${STATUSES.map((s) => `"${s}"`).join(' 또는 ')} 만 쓸 수 있어요`);
  }

  if (data.aspect === undefined) errors.push(`aspect: 필수 필드예요 (${ASPECTS.join(' 또는 ')})`);
  else if (!ASPECTS.includes(data.aspect)) {
    errors.push(`aspect: "${data.aspect}" — ${ASPECTS.map((a) => `"${a}"`).join(' 또는 ')} 만 쓸 수 있어요`);
  }

  if (data.updated === undefined) errors.push('updated: 필수 필드예요 (YYYY-MM-DD)');
  else if (!isValidDate(data.updated)) errors.push(`updated: "${data.updated}" — YYYY-MM-DD 형식의 올바른 날짜여야 해요`);

  // 선택 필드 (있으면 형식 검사)
  if (data.featured !== undefined && typeof data.featured !== 'boolean') errors.push('featured: true 또는 false 여야 해요');
  if (data.version !== undefined && !isNonEmptyString(data.version)) errors.push('version: 문자열이어야 해요 (예: "1.0.0")');
  checkLocalized(data.about, 'about', errors, { required: false });

  if (data.controls !== undefined) {
    if (!Array.isArray(data.controls)) errors.push('controls: 배열이어야 해요');
    else {
      data.controls.forEach((c, i) => {
        if (!isObject(c)) return errors.push(`controls[${i}]: 객체여야 해요`);
        checkLocalized(c.action, `controls[${i}].action`, errors);
        if (!isNonEmptyString(c.keys)) errors.push(`controls[${i}].keys: 문자열이 필요해요 (예: "A / D")`);
      });
    }
  }

  if (data.changelog !== undefined) {
    if (!Array.isArray(data.changelog)) errors.push('changelog: 배열이어야 해요');
    else {
      data.changelog.forEach((c, i) => {
        if (!isObject(c)) return errors.push(`changelog[${i}]: 객체여야 해요`);
        if (!isNonEmptyString(c.version)) errors.push(`changelog[${i}].version: 문자열이 필요해요`);
        if (!isValidDate(c.date)) errors.push(`changelog[${i}].date: YYYY-MM-DD 형식의 올바른 날짜여야 해요`);
        checkLocalized(c.notes, `changelog[${i}].notes`, errors);
      });
    }
  }

  // 파일
  const thumb = findFile(dir, 'thumb', THUMB_EXTS);
  if (!thumb) errors.push(`썸네일이 없어요 (thumb.${THUMB_EXTS.join(' / thumb.')} 중 하나)`);
  const preview = findFile(dir, 'preview', PREVIEW_EXTS);
  const hasIndex = existsSync(path.join(dir, 'index.html'));
  if (data.status === 'live' && !hasIndex) errors.push('index.html 이 없어요 (status 가 "live" 면 필수)');

  if (errors.length) return { errors, warnings };

  const base = `games/${id}`;
  const entry = {
    id,
    title: data.title,
    description: data.description,
    ...(data.about ? { about: data.about } : {}),
    tags: data.tags,
    controls: data.controls ?? [],
    input: data.input,
    status: data.status,
    featured: data.featured === true,
    aspect: data.aspect,
    version: data.version ?? null,
    updated: data.updated,
    changelog: data.changelog ?? [],
    thumb: `${base}/${thumb}`,
    preview: preview ? `${base}/${preview}` : null,
    url: data.status === 'live' ? `${base}/index.html` : null,
  };
  return { errors, warnings, entry };
}

// 윈도우 메모장 등이 붙이는 BOM 제거
function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

async function main() {
  if (!existsSync(GAMES_DIR)) {
    console.error(red('games/ 폴더가 없어요.'));
    process.exit(1);
  }

  const dirents = await readdir(GAMES_DIR, { withFileTypes: true });
  const ids = dirents
    .filter((d) => d.isDirectory() && !d.name.startsWith('_') && !d.name.startsWith('.'))
    .map((d) => d.name)
    .sort();

  console.log(dim(`games/ 에서 게임 폴더 ${ids.length}개를 검사합니다...\n`));

  const games = [];
  let errorCount = 0;
  let warningCount = 0;

  for (const id of ids) {
    const { errors, warnings, entry } = validateGame(id);
    errorCount += errors.length;
    warningCount += warnings.length;

    const label = `games/${id}/`;
    if (errors.length) console.log(`${red('[ERROR]')} ${label}`);
    else console.log(`${green('[OK]')}    ${label}${warnings.length ? yellow(`  (경고 ${warnings.length}개)`) : ''}`);
    errors.forEach((msg) => console.log(`        ${red('-')} ${msg}`));
    warnings.forEach((msg) => console.log(`        ${yellow('!')} ${msg}`));

    if (entry) games.push(entry);
  }

  console.log('');

  if (errorCount) {
    console.error(red(`검사 실패: 오류 ${errorCount}개. 위 내용을 고친 뒤 다시 실행하세요.`));
    console.error(dim('data/games.json 은 갱신되지 않았어요.'));
    process.exit(1);
  }

  games.sort((a, b) => b.updated.localeCompare(a.updated) || a.id.localeCompare(b.id));

  const featured = games.filter((g) => g.featured);
  if (featured.length > 1) {
    console.log(yellow(`! featured 게임이 ${featured.length}개예요. updated 가 가장 최근인 "${featured[0].id}" 가 배너에 표시돼요.`));
  }

  const output = {
    _comment: '자동 생성 파일입니다. 직접 수정하지 말고 games/<id>/game.json 을 고친 뒤 npm run registry 를 실행하세요.',
    generatedAt: new Date().toISOString(),
    games,
  };

  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

  console.log(green(`data/games.json 생성 완료: 게임 ${games.length}개${warningCount ? `, 경고 ${warningCount}개` : ''}`));
}

main().catch((err) => {
  console.error(red('예상치 못한 오류:'), err);
  process.exit(1);
});
