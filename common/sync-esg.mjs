// One-off sync: apply common/header.html, common/footer.html into esg/*.html.
// esg/ is one directory below root, so root-relative paths get a "../" prefix.
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const commonDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(commonDir, '..');
const esgDir = resolve(rootDir, 'esg');

const targets = (await readdir(esgDir))
  .filter((name) => name.toLowerCase().endsWith('.html'))
  .sort();

function rewritePaths(html) {
  return html.replace(/(href|src)="([^"]*)"/g, (match, attr, value) => {
    if (/^(#|https?:|tel:|mailto:|\.\.\/|\/)/.test(value)) return match;
    return `${attr}="../${value}"`;
  });
}

const partials = {
  header: rewritePaths((await readFile(resolve(commonDir, 'header.html'), 'utf8')).trim()),
  footer: rewritePaths((await readFile(resolve(commonDir, 'footer.html'), 'utf8')).trim()),
};

function replaceRegion(source, name, partial, fileName) {
  const pattern = new RegExp(
    `([\\t ]*)<!-- common:${name}:start -->[\\s\\S]*?<!-- common:${name}:end -->`,
    'g',
  );
  const matches = [...source.matchAll(pattern)];
  if (matches.length !== 1) {
    throw new Error(`${fileName}: common:${name} 영역이 ${matches.length}개입니다.`);
  }

  const indent = matches[0][1];
  const rendered = partial
    .split(/\r?\n/)
    .map((line) => (line ? indent + line : ''))
    .join('\n');

  return source.replace(
    pattern,
    `${indent}<!-- common:${name}:start -->\n${rendered}\n${indent}<!-- common:${name}:end -->`,
  );
}

function hasRegion(source, name) {
  return source.includes(`<!-- common:${name}:start -->`) &&
    source.includes(`<!-- common:${name}:end -->`);
}

function ensureAssets(source) {
  let updated = source;
  if (!updated.includes('common/components.css')) {
    if (!updated.includes('</head>')) throw new Error('</head>가 없습니다.');
    updated = updated.replace(
      '</head>',
      '<link rel="stylesheet" href="../common/components.css">\n<script src="../common/components.js" defer></script>\n</head>',
    );
  }
  return updated;
}

function initializeRegions(source, fileName) {
  let updated = ensureAssets(source);

  if (!hasRegion(updated, 'header')) {
    const headerMatch = updated.match(/<header\b[^>]*>[\s\S]*?<\/header>/i);
    if (!headerMatch) throw new Error(`${fileName}: <header>를 찾을 수 없습니다.`);
    updated = updated.replace(
      headerMatch[0],
      '<!-- common:header:start -->\n<!-- common:header:end -->',
    );
  }

  if (!hasRegion(updated, 'footer')) {
    const footerMatches = [...updated.matchAll(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi)];
    const footerMatch = footerMatches.at(-1);
    if (!footerMatch) throw new Error(`${fileName}: <footer>를 찾을 수 없습니다.`);
    updated = updated.slice(0, footerMatch.index) +
      '<!-- common:footer:start -->\n<!-- common:footer:end -->' +
      updated.slice(footerMatch.index + footerMatch[0].length);
  }

  return updated;
}

for (const fileName of targets) {
  const filePath = resolve(esgDir, fileName);
  const original = await readFile(filePath, 'utf8');
  const newline = original.includes('\r\n') ? '\r\n' : '\n';
  let updated = initializeRegions(original.replace(/\r\n/g, '\n'), fileName);

  for (const [name, partial] of Object.entries(partials)) {
    updated = replaceRegion(updated, name, partial, fileName);
  }

  updated = updated.replace(/\n/g, newline);
  if (updated !== original) await writeFile(filePath, updated, 'utf8');
  console.log(`synced esg/${fileName}`);
}
