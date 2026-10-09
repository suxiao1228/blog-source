'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');

function checkDate(value) {
  if (typeof value !== 'string') return false;
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2}))?$/.exec(value);
  if (!m) return false;
  const [year, month, day, hour, minute, second] = m.slice(1).map(value => value === undefined ? 0 : Number(value));
  const maxDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return year >= 1000 && month >= 1 && month <= 12 && day >= 1 && day <= maxDay
    && hour <= 23 && minute <= 59 && second <= 59;
}

function checkFences(body) {
  let open = null;
  for (const line of body.split(/\r?\n/)) {
    const m = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (!m) continue;
    if (!open) {
      if (m[1][0] === '`' && m[2].includes('`')) continue;
      open = { char: m[1][0], length: m[1].length };
    } else if (m[1][0] === open.char && m[1].length >= open.length && !m[2].trim()) {
      open = null;
    }
  }
  if (open) throw new Error('Unclosed Markdown code fence.');
}

function checkPost(rootArg, postArg) {
  const root = fs.realpathSync(rootArg);
  const posts = fs.realpathSync(path.join(root, 'source', '_posts'));
  const post = fs.realpathSync(path.resolve(root, postArg));
  const relative = path.relative(posts, post);
  if (!relative || relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) {
    throw new Error('Post must be inside this Hexo site source/_posts directory.');
  }
  if (path.extname(post).toLowerCase() !== '.md') throw new Error('Expected a Markdown file.');
  const source = new TextDecoder('utf-8', { fatal: true }).decode(fs.readFileSync(post));
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
  if (!match) throw new Error('Missing YAML front matter.');
  const siteRequire = createRequire(path.join(root, 'package.json'));
  const yaml = siteRequire('js-yaml');
  const meta = yaml.load(match[1], { schema: yaml.JSON_SCHEMA });
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) throw new Error('Front matter must be a mapping.');
  if (typeof meta.title !== 'string' || !meta.title.trim()) throw new Error('Missing non-empty title.');
  if (!checkDate(meta.date)) throw new Error('Expected valid date: YYYY-MM-DD or YYYY-MM-DD HH:mm:ss.');
  const body = source.slice(match[0].length);
  if (!body.trim()) throw new Error('Article body is empty.');
  checkFences(body);
  return path.relative(root, post);
}

if (require.main === module) {
  if (process.argv.length !== 4) {
    console.error('Usage: node check-post.cjs <hexo-root> <post-file>');
    process.exitCode = 2;
  } else {
    try {
      console.log('OK: ' + checkPost(process.argv[2], process.argv[3]));
    } catch (error) {
      console.error('ERROR: ' + error.message);
      process.exitCode = 1;
    }
  }
}

module.exports = { checkPost };
