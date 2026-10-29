#!/usr/bin/env node
// devlog/*.md 를 검사하고 data/devlog.json 을 생성한다.
// Node 기본 모듈만 사용. 사용법: node scripts/build-devlog.mjs (npm run registry 가 같이 실행)
// 문제가 하나라도 있으면 어떤 글의 어떤 필드인지 출력하고 exit code 1 로 끝난다.
//
// 글 형식 (devlog/_template.md 참고)
//   ---
//   title: { ko: "제목", en: "Title" }   또는   title: 제목
//   date: 2026-10-28
//   type: update                        update | new-game | dev-note
//   games: [pong]                       선택. games/ 에 있는 게임 id
//   lang: ko                            본문 언어 ko | en
//   summary: 한 줄 요약                 또는 { ko: "...", en: "..." }
//   ---
//   본문 (마크다운)

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEVLOG_DIR = path.join(ROOT, 'devlog');
const GAMES_DIR = path.join(ROOT, 'games');
const OUT_FILE = path.join(ROOT, 'data', 'devlog.json');

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TYPES = ['update', 'new-game', 'dev-note'];
const LANGS = ['ko', 'en'];
const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];

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

function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

// --------------------------------------------------------------------------
// front matter
// 한 줄에 "키: 값" 하나. 값은 문자열(따옴표 선택), [a, b] 목록, { ko: "...", en: "..." } 중 하나.
// 따옴표 밖의 " #" 뒤는 주석.
// --------------------------------------------------------------------------
function stripComment(value) {
  let quote = null;
  for (let i = 0; i < value.length; i++) {
    const c = value[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = null;
    } else if (c === '"' || c === "'") quote = c;
    else if (c === '#' && (i === 0 || /\s/.test(value[i - 1]))) return value.slice(0, i).trim();
  }
  return value.trim();
}

function unquote(s) {
  const t = s.trim();
  if (t.length >= 2 && (t[0] === '"' || t[0] === "'") && t.at(-1) === t[0]) {
    return t.slice(1, -1).replace(/\\(["'\\])/g, '$1');
  }
  return t;
}

// 따옴표를 고려해서 쉼표로 나눈다
function splitTopLevel(s) {
  const parts = [];
  let quote = null;
  let cur = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quote) {
      if (c === '\\') {
        cur += c + (s[i + 1] ?? '');
        i++;
        continue;
      }
      if (c === quote) quote = null;
    } else if (c === '"' || c === "'") quote = c;
    else if (c === ',') {
      parts.push(cur);
      cur = '';
      continue;
    }
    cur += c;
  }
  if (cur.trim() !== '') parts.push(cur);
  return parts;
}

function parseValue(raw) {
  const v = stripComment(raw);
  if (v.startsWith('[')) {
    if (!v.endsWith(']')) throw new Error('목록은 [ 로 시작해서 ] 로 끝나야 해요');
    return splitTopLevel(v.slice(1, -1)).map(unquote).filter((x) => x !== '');
  }
  if (v.startsWith('{')) {
    if (!v.endsWith('}')) throw new Error('{ ko: "...", en: "..." } 형식이어야 해요');
    const obj = {};
    for (const pair of splitTopLevel(v.slice(1, -1))) {
      const m = pair.match(/^\s*([a-z]{2})\s*:\s*(.*)$/s);
      if (!m) throw new Error(`"${pair.trim()}" — 키: "값" 형식이어야 해요`);
      obj[m[1]] = unquote(m[2]);
    }
    return obj;
  }
  return unquote(v);
}

function parseFrontMatter(text) {
  const lines = stripBom(text).replace(/\r\n?/g, '\n').split('\n');
  if (lines[0].trim() !== '---') throw new Error('파일 맨 첫 줄이 --- 여야 해요 (front matter 시작)');
  const endTrim = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
  if (endTrim === -1) throw new Error('front matter 를 닫는 --- 줄이 없어요');

  const data = {};
  for (let i = 1; i < endTrim; i++) {
    const line = lines[i];
    if (line.trim() === '' || line.trim().startsWith('#')) continue;
    const m = line.match(/^([a-zA-Z][\w-]*)\s*:\s*(.*)$/);
    if (!m) throw new Error(`front matter ${i + 1}번째 줄: "키: 값" 형식이 아니에요`);
    if (m[1] in data) throw new Error(`front matter: "${m[1]}" 가 두 번 나와요`);
    try {
      data[m[1]] = parseValue(m[2]);
    } catch (err) {
      throw new Error(`front matter "${m[1]}": ${err.message}`);
    }
  }
  return { data, body: lines.slice(endTrim + 1).join('\n') };
}

// --------------------------------------------------------------------------
// 이미지 크기 읽기 (레이아웃 밀림 방지용 width/height)
// --------------------------------------------------------------------------
function imageSize(file) {
  const buf = readFileSync(file);
  const ext = path.extname(file).slice(1).toLowerCase();
  try {
    if (ext === 'png' && buf.toString('ascii', 12, 16) === 'IHDR') {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    if (ext === 'gif') return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
    if (ext === 'jpg' || ext === 'jpeg') {
      let i = 2;
      while (i < buf.length) {
        if (buf[i] !== 0xff) return null;
        const marker = buf[i + 1];
        const len = buf.readUInt16BE(i + 2);
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
        }
        i += 2 + len;
      }
      return null;
    }
    if (ext === 'webp') {
      const chunk = buf.toString('ascii', 12, 16);
      if (chunk === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
      if (chunk === 'VP8L') {
        const b = buf.readUInt32LE(21);
        return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
      }
      if (chunk === 'VP8X') return { width: buf.readUIntLE(24, 3) + 1, height: buf.readUIntLE(27, 3) + 1 };
      return null;
    }
    if (ext === 'svg') {
      const head = buf.toString('utf8', 0, 2000);
      const tag = head.match(/<svg\b[^>]*>/)?.[0] ?? '';
      const w = tag.match(/\bwidth="(\d+(?:\.\d+)?)(px)?"/)?.[1];
      const h = tag.match(/\bheight="(\d+(?:\.\d+)?)(px)?"/)?.[1];
      if (w && h) return { width: Math.round(w), height: Math.round(h) };
      const vb = tag.match(/\bviewBox="[\d.\s-]*?(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)"/);
      if (vb) return { width: Math.round(vb[1]), height: Math.round(vb[2]) };
    }
  } catch {
    // 파일이 깨졌으면 크기 없이
  }
  return null;
}

// --------------------------------------------------------------------------
// 마크다운 → HTML (작은 변환기)
// 지원: 제목(#~######), 문단, **굵게**, *기울임* / _기울임_, [링크](url), ![대체 텍스트](images/x.png),
//       - / * / 1. 목록, `인라인 코드`, ``` 코드 블록, > 인용
// 글 안의 HTML 태그는 지원하지 않고 전부 이스케이프한다.
// 본문의 # 은 <h2> 가 된다 (글 제목이 <h1>).
// --------------------------------------------------------------------------
const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ESCAPES[c]);

function safeUrl(url) {
  const u = url.trim();
  if (/^(https?:|mailto:)/i.test(u)) return u;
  if (/^[a-z][a-z0-9+.-]*:/i.test(u) || u.startsWith('//')) return null; // javascript: 등 차단
  if (u.startsWith('/')) return null; // 절대경로 금지 (서브경로 배포)
  return u;
}

function createConverter(ctx) {
  function inline(text) {
    // 1) 인라인 코드를 먼저 빼 둔다
    const codes = [];
    let s = text.replace(/`([^`]+)`/g, (m, code) => {
      codes.push(`<code>${escapeHtml(code)}</code>`);
      return `\u0000${codes.length - 1}\u0000`;
    });
    s = escapeHtml(s);

    // 2) 이미지 ![alt](src)
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, src) => {
      const img = ctx.image(src.replace(/&amp;/g, '&'), alt);
      return img ?? m;
    });
    // 3) 링크 [text](url)
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, href) => {
      const url = safeUrl(href.replace(/&amp;/g, '&'));
      if (!url) {
        ctx.error(`링크 주소를 쓸 수 없어요: ${href} (http(s), mailto, 상대경로만 가능)`);
        return label;
      }
      const external = /^https?:/i.test(url);
      return `<a href="${escapeHtml(url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}</a>`;
    });
    // 4) 굵게, 기울임
    s = s.replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/__(?=\S)([\s\S]*?\S)__/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*\w])\*(?=\S)([\s\S]*?\S)\*(?!\*)/g, '$1<em>$2</em>');
    s = s.replace(/(^|[^_\w])_(?=\S)([\s\S]*?\S)_(?![_\w])/g, '$1<em>$2</em>');

    return s.replace(/\u0000(\d+)\u0000/g, (m, i) => codes[Number(i)]);
  }

  function blocks(lines) {
    const out = [];
    let i = 0;
    const isBlank = (l) => l.trim() === '';
    const isFence = (l) => /^\s*```/.test(l);
    const listRe = /^(\s*)([-*]|\d+[.)])\s+(.*)$/;
    const startsBlock = (l) => isFence(l) || /^#{1,6}\s/.test(l) || /^\s*>/.test(l) || listRe.test(l);

    while (i < lines.length) {
      const line = lines[i];
      if (isBlank(line)) {
        i++;
        continue;
      }

      // 코드 블록
      if (isFence(line)) {
        const lang = line.trim().slice(3).trim().match(/^[\w+-]*/)[0];
        const code = [];
        i++;
        while (i < lines.length && !isFence(lines[i])) code.push(lines[i++]);
        if (i >= lines.length) ctx.error('``` 코드 블록이 닫히지 않았어요');
        i++;
        out.push(`<pre><code${lang ? ` class="language-${escapeHtml(lang)}"` : ''}>${escapeHtml(code.join('\n'))}</code></pre>`);
        continue;
      }

      // 제목
      const h = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
      if (h) {
        const level = Math.min(h[1].length + 1, 6);
        out.push(`<h${level}>${inline(h[2])}</h${level}>`);
        i++;
        continue;
      }

      // 인용 (안쪽도 블록으로 다시 변환)
      if (/^\s*>/.test(line)) {
        const inner = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) inner.push(lines[i++].replace(/^\s*>\s?/, ''));
        out.push(`<blockquote>${blocks(inner)}</blockquote>`);
        continue;
      }

      // 목록 (한 단계. 들여쓴 줄은 이전 항목에 이어 붙임)
      const lm = line.match(listRe);
      if (lm) {
        const ordered = /\d/.test(lm[2]);
        const start = ordered ? parseInt(lm[2], 10) : 1;
        const items = [];
        while (i < lines.length) {
          const m = lines[i].match(listRe);
          if (m && /\d/.test(m[2]) === ordered) {
            items.push(m[3]);
            i++;
          } else if (!isBlank(lines[i]) && /^\s+/.test(lines[i]) && items.length && !startsBlock(lines[i].trim())) {
            items[items.length - 1] += ` ${lines[i].trim()}`;
            i++;
          } else break;
        }
        const tag = ordered ? 'ol' : 'ul';
        const startAttr = ordered && start !== 1 ? ` start="${start}"` : '';
        out.push(`<${tag}${startAttr}>${items.map((it) => `<li>${inline(it)}</li>`).join('')}</${tag}>`);
        continue;
      }

      // 문단 (빈 줄이나 다른 블록이 나올 때까지)
      const para = [];
      while (i < lines.length && !isBlank(lines[i]) && !startsBlock(lines[i])) para.push(lines[i++].trim());
      const html = inline(para.join('\n')).replace(/\n/g, ' ');
      // 이미지 하나만 있는 문단은 figure 로
      if (/^<img [^>]+>$/.test(html)) out.push(`<figure>${html}</figure>`);
      else out.push(`<p>${html}</p>`);
    }
    return out.join('\n');
  }

  return (markdown) => blocks(markdown.replace(/\r\n?/g, '\n').split('\n'));
}

// --------------------------------------------------------------------------
// 검사
// --------------------------------------------------------------------------
function checkLocalized(value, field, errors) {
  if (typeof value === 'string') {
    if (!isNonEmptyString(value)) errors.push(`${field}: 비어 있으면 안 돼요`);
    return;
  }
  if (!isObject(value)) {
    errors.push(`${field}: 문자열 또는 { ko: "...", en: "..." } 형식이어야 해요`);
    return;
  }
  if (!isNonEmptyString(value.ko)) errors.push(`${field}.ko: 비어 있지 않은 문자열이 필요해요`);
}

// games/ 아래 game.json 이 있는 폴더 (_ 로 시작하는 템플릿 제외)
function gameIds() {
  if (!existsSync(GAMES_DIR)) return new Set();
  return new Set(
    readdirSync(GAMES_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith('_') && existsSync(path.join(GAMES_DIR, d.name, 'game.json')))
      .map((d) => d.name),
  );
}

function validatePost(file, knownGames) {
  const slug = file.replace(/\.md$/, '');
  const errors = [];
  const warnings = [];

  if (!SLUG_RE.test(slug)) {
    errors.push(`파일 이름 "${file}": 소문자, 숫자, 하이픈(-)만 쓸 수 있어요 (예: 2026-10-28-gamehub-open.md)`);
  }

  let parsed;
  try {
    parsed = parseFrontMatter(readFileSync(path.join(DEVLOG_DIR, file), 'utf8'));
  } catch (err) {
    errors.push(err.message);
    return { errors, warnings };
  }
  const { data, body } = parsed;

  const REQUIRED = ['title', 'date', 'type', 'lang', 'summary'];
  for (const key of REQUIRED) {
    if (data[key] === undefined) errors.push(`${key}: 필수 필드예요`);
  }
  for (const key of Object.keys(data)) {
    if (![...REQUIRED, 'games'].includes(key)) warnings.push(`${key}: 모르는 필드예요 (무시돼요)`);
  }

  if (data.title !== undefined) checkLocalized(data.title, 'title', errors);
  if (data.summary !== undefined) checkLocalized(data.summary, 'summary', errors);
  if (data.date !== undefined && !isValidDate(data.date)) errors.push(`date: "${data.date}" — YYYY-MM-DD 형식의 올바른 날짜여야 해요`);
  if (data.type !== undefined && !TYPES.includes(data.type)) {
    errors.push(`type: "${data.type}" — ${TYPES.join(' / ')} 중 하나여야 해요`);
  }
  if (data.lang !== undefined && !LANGS.includes(data.lang)) errors.push(`lang: "${data.lang}" — ko 또는 en 이어야 해요`);

  let games = [];
  if (data.games !== undefined) {
    if (!Array.isArray(data.games)) errors.push('games: [id, id] 형식의 목록이어야 해요');
    else {
      games = data.games;
      for (const id of games) {
        if (!knownGames.has(id)) errors.push(`games: "${id}" — games/ 폴더에 없는 게임 id 예요`);
      }
    }
  }

  if (!body.trim()) errors.push('본문이 비어 있어요');

  const ctx = {
    error: (msg) => errors.push(`본문: ${msg}`),
    image(src, alt) {
      const url = safeUrl(src);
      if (!url || /^https?:/i.test(url)) {
        errors.push(`본문: 이미지는 devlog/images/ 안의 파일을 상대경로로 써야 해요: ${src}`);
        return null;
      }
      const rel = path.posix.normalize(url.replace(/^\.\//, ''));
      const ext = path.extname(rel).slice(1).toLowerCase();
      if (!rel.startsWith('images/') || !IMAGE_EXTS.includes(ext)) {
        errors.push(`본문: 이미지는 images/<파일>.(${IMAGE_EXTS.join('|')}) 형식이어야 해요: ${src}`);
        return null;
      }
      const abs = path.join(DEVLOG_DIR, rel);
      if (!existsSync(abs)) {
        errors.push(`본문: 이미지 파일이 없어요: devlog/${rel}`);
        return null;
      }
      if (!alt.trim()) warnings.push(`본문: 이미지에 대체 텍스트가 없어요: ${src} (![설명](${src}) 처럼 써 주세요)`);
      const size = imageSize(abs);
      if (!size) warnings.push(`본문: 이미지 크기를 읽지 못했어요: ${src}`);
      const dims = size ? ` width="${size.width}" height="${size.height}"` : '';
      // 사이트 루트(index.html) 기준 경로로 바꾼다
      return `<img src="devlog/${escapeHtml(rel)}" alt="${alt}"${dims} loading="lazy" decoding="async">`;
    },
  };

  const html = errors.length ? '' : createConverter(ctx)(body);
  if (errors.length) return { errors, warnings };

  return {
    errors,
    warnings,
    entry: {
      slug,
      title: data.title,
      date: data.date,
      type: data.type,
      games,
      lang: data.lang,
      summary: data.summary,
      html,
    },
  };
}

async function main() {
  if (!existsSync(DEVLOG_DIR)) {
    console.error(red('devlog/ 폴더가 없어요.'));
    process.exit(1);
  }

  const files = (await readdir(DEVLOG_DIR, { withFileTypes: true }))
    .filter((d) => d.isFile() && d.name.endsWith('.md') && !d.name.startsWith('_'))
    .map((d) => d.name)
    .sort();

  console.log(dim(`devlog/ 에서 글 ${files.length}개를 검사합니다...\n`));

  const knownGames = gameIds();
  const posts = [];
  let errorCount = 0;
  let warningCount = 0;

  for (const file of files) {
    const { errors, warnings, entry } = validatePost(file, knownGames);
    errorCount += errors.length;
    warningCount += warnings.length;

    const label = `devlog/${file}`;
    if (errors.length) console.log(`${red('[ERROR]')} ${label}`);
    else console.log(`${green('[OK]')}    ${label}${warnings.length ? yellow(`  (경고 ${warnings.length}개)`) : ''}`);
    errors.forEach((msg) => console.log(`        ${red('-')} ${msg}`));
    warnings.forEach((msg) => console.log(`        ${yellow('!')} ${msg}`));

    if (entry) posts.push(entry);
  }

  console.log('');

  if (errorCount) {
    console.error(red(`검사 실패: 오류 ${errorCount}개. 위 내용을 고친 뒤 다시 실행하세요.`));
    console.error(dim('data/devlog.json 은 갱신되지 않았어요.'));
    process.exit(1);
  }

  // 최신순. 같은 날짜면 파일 이름 역순
  posts.sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug));

  const output = {
    _comment: '자동 생성 파일입니다. 직접 수정하지 말고 devlog/*.md 를 고친 뒤 npm run registry 를 실행하세요.',
    generatedAt: new Date().toISOString(),
    posts,
  };

  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

  console.log(green(`data/devlog.json 생성 완료: 글 ${posts.length}개${warningCount ? `, 경고 ${warningCount}개` : ''}`));
}

main().catch((err) => {
  console.error(red('예상치 못한 오류:'), err);
  process.exit(1);
});
