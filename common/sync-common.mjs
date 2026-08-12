import { readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const commonDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(commonDir, '..');
const targets = (await readdir(rootDir))
  .filter((name) => name.toLowerCase().endsWith('.html'))
  .sort();

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

function hasRegion(source, name) {
  return source.includes(`<!-- common:${name}:start -->`) &&
    source.includes(`<!-- common:${name}:end -->`);
}

function placeHeaderOutsideSmoothWrapper(source, fileName) {
  const wrapperPattern = /<div\b[^>]*\bid=["']smooth-wrapper["'][^>]*>/i;
  const wrapperMatch = wrapperPattern.exec(source);
  const headerStart = source.indexOf('<!-- common:header:start -->');

  if (!wrapperMatch || headerStart < wrapperMatch.index) return source;

  const headerRegionPattern = /^[\t ]*<!-- common:header:start -->[\s\S]*?^[\t ]*<!-- common:header:end -->[\t ]*\n?/m;
  const headerRegionMatch = headerRegionPattern.exec(source);
  if (!headerRegionMatch) {
    throw new Error(`${fileName}: common:header 영역을 이동할 수 없습니다.`);
  }

  const withoutHeader = source.slice(0, headerRegionMatch.index) +
    source.slice(headerRegionMatch.index + headerRegionMatch[0].length);
  const nextWrapperMatch = wrapperPattern.exec(withoutHeader);
  const wrapperLineStart = withoutHeader.lastIndexOf('\n', nextWrapperMatch.index - 1) + 1;
  const wrapperIndent = withoutHeader.slice(wrapperLineStart, nextWrapperMatch.index);

  return withoutHeader.slice(0, wrapperLineStart) +
    `${wrapperIndent}<!-- common:header:start -->\n` +
    `${wrapperIndent}<!-- common:header:end -->\n\n` +
    withoutHeader.slice(wrapperLineStart);
}

function initializeRegions(source, fileName) {
  let updated = source;

  if (!hasRegion(updated, 'head')) {
    if (!updated.includes('</head>')) throw new Error(`${fileName}: </head>가 없습니다.`);
    updated = updated.replace(
      '</head>',
      '  <!-- common:head:start -->\n  <!-- common:head:end -->\n</head>',
    );
  }

  if (!hasRegion(updated, 'header')) {
    const mainIndex = updated.search(/<main\b/i);
    const searchArea = mainIndex >= 0 ? updated.slice(0, mainIndex) : updated;
    const headerMatch = searchArea.match(/<header\b[^>]*>[\s\S]*?<\/header>/i);
    if (headerMatch) {
      updated = updated.replace(
        headerMatch[0],
        '<!-- common:header:start -->\n<!-- common:header:end -->',
      );
    } else {
      const bodyMatch = updated.match(/<body\b[^>]*>/i);
      if (!bodyMatch) throw new Error(`${fileName}: <body>가 없습니다.`);
      updated = updated.replace(
        bodyMatch[0],
        `${bodyMatch[0]}\n<!-- common:header:start -->\n<!-- common:header:end -->`,
      );
    }
  }

  if (!hasRegion(updated, 'footer')) {
    const footerMatches = [...updated.matchAll(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi)];
    const footerMatch = footerMatches.at(-1);
    if (footerMatch) {
      updated = updated.slice(0, footerMatch.index) +
        '<!-- common:footer:start -->\n<!-- common:footer:end -->' +
        updated.slice(footerMatch.index + footerMatch[0].length);
    } else {
      if (!updated.includes('</body>')) throw new Error(`${fileName}: </body>가 없습니다.`);
      updated = updated.replace(
        '</body>',
        '<!-- common:footer:start -->\n<!-- common:footer:end -->\n</body>',
      );
    }
  }

  return updated;
}

for (const fileName of targets) {
  const filePath = resolve(rootDir, fileName);
  const original = await readFile(filePath, 'utf8');
  const newline = original.includes('\r\n') ? '\r\n' : '\n';
  let updated = initializeRegions(original.replace(/\r\n/g, '\n'), fileName);
  updated = placeHeaderOutsideSmoothWrapper(updated, fileName);

  for (const [name, partial] of Object.entries(partials)) {
    updated = replaceRegion(updated, name, partial, fileName);
  }

  updated = updated.replace(/\n/g, newline);
  if (updated !== original) await writeFile(filePath, updated, 'utf8');
  console.log(`synced ${fileName}`);
}
