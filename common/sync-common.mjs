import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const commonDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(commonDir, '..');
const targets = [
  'index.html',
  'sub.html',
  'food.html',
  'food2.html',
  'food3.html',
  'food4.html',
  'food5.html',
];

const partials = {
  head: (await readFile(resolve(commonDir, 'head.html'), 'utf8')).trim(),
  header: (await readFile(resolve(commonDir, 'header.html'), 'utf8')).trim(),
  footer: (await readFile(resolve(commonDir, 'footer.html'), 'utf8')).trim(),
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

for (const fileName of targets) {
  const filePath = resolve(rootDir, fileName);
  const original = await readFile(filePath, 'utf8');
  const newline = original.includes('\r\n') ? '\r\n' : '\n';
  let updated = original.replace(/\r\n/g, '\n');

  for (const [name, partial] of Object.entries(partials)) {
    updated = replaceRegion(updated, name, partial, fileName);
  }

  updated = updated.replace(/\n/g, newline);
  if (updated !== original) await writeFile(filePath, updated, 'utf8');
  console.log(`synced ${fileName}`);
}
