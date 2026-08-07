#!/usr/bin/env node
/**
 * extract-common.js — MPA 프로젝트 공통영역 자동 추출 스크립트 (v2)
 *
 * 실행 위치의 프로젝트 폴더를 스캔해 팀 표준 3종을 만들어 냅니다.
 *   common/head.html   — Tailwind v4 CDN 스크립트 + <style type="text/tailwindcss"> 블록
 *   common/header.html — 사이트 GNB(<header>)
 *   common/footer.html — 사이트 푸터(<footer>)
 *
 * 사용법 (3가지 중 편한 것을 씁니다):
 *   node extract-common.js                          → 프로젝트 자동 스캔 (인수 없음)
 *   node extract-common.js index.html               → 소스 페이지 명시 지정
 *   node extract-common.js index.html partials      → 소스 + 출력 폴더 지정
 *
 * 자동 스캔 규칙:
 *   1. 현재 폴더의 .html 파일 목록화 (하위 폴더는 무시).
 *   2. <html> 태그를 포함한 완전한 페이지만 선별 (스니펫·조각 제외).
 *   3. index.html이 있으면 소스로 채택, 없으면 첫 번째 페이지.
 *   4. 다른 페이지들과 head 스니펫·header·footer가 일치하는지 대조 리포트.
 *
 * 필요 환경: Node.js 14 이상. 추가 라이브러리 없음.
 */

const fs = require("fs");
const path = require("path");

// -- 인수 파싱 -----------------------------------------------------------
const [, , sourceArg, outArg] = process.argv;

// -- 정규식 --------------------------------------------------------------
const cdnScriptRegex = /<script\s+[^>]*src\s*=\s*["'][^"']*@tailwindcss\/browser@4[^"']*["'][^>]*>\s*<\/script>/i;
const tailwindStyleRegex = /<style\s+type\s*=\s*["']text\/tailwindcss["'][^>]*>[\s\S]*?<\/style>/i;
const headerRegex = /<header\b[^>]*>[\s\S]*?<\/header>/i;
const footerRegexGlobal = /<footer\b[^>]*>[\s\S]*?<\/footer>/gi;
const htmlTagRegex = /<html\b[^>]*>/i;

// -- 헬퍼 ---------------------------------------------------------------
function scanHtmlFiles(dir) {
  // 현재 디렉토리의 .html 파일만. 하위 폴더는 무시 (common/·partials/·node_modules 등이 섞이지 않도록).
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.toLowerCase().endsWith(".html"))
    .map((d) => d.name);
}

function extractParts(html) {
  const cdnScript = html.match(cdnScriptRegex);
  const tailwindStyle = html.match(tailwindStyleRegex);
  const header = html.match(headerRegex);
  const footerAll = [...html.matchAll(footerRegexGlobal)];
  const footer = footerAll[footerAll.length - 1] || null;

  let headSnippet = "";
  if (cdnScript) headSnippet += cdnScript[0] + "\n";
  if (tailwindStyle) headSnippet += tailwindStyle[0] + "\n";

  return {
    head: headSnippet.trim() || null,
    header: header ? header[0].trim() : null,
    footer: footer ? footer[0].trim() : null,
  };
}

function normalize(s) {
  // 공백·개행 차이만 있는 경우 같은 코드로 인정
  return (s || "").replace(/\s+/g, " ").trim();
}

function isFullPage(filepath) {
  const content = fs.readFileSync(filepath, "utf8");
  return htmlTagRegex.test(content);
}

// -- 프로젝트 환경 감지 --------------------------------------------------
const cwd = process.cwd();
let sourcePath;
let allPages = []; // 프로젝트 내 완전한 페이지 목록 (파일명)

if (sourceArg) {
  // 명시 지정 모드
  sourcePath = path.resolve(sourceArg);
  if (!fs.existsSync(sourcePath)) {
    console.error(`파일이 없습니다: ${sourcePath}`);
    process.exit(1);
  }
  console.log(`[MODE] 명시 지정: ${path.relative(cwd, sourcePath)}\n`);

  // 소스가 현재 폴더 안이면 다른 페이지들도 자동 감지해서 대조에 사용
  if (path.dirname(sourcePath) === cwd) {
    allPages = scanHtmlFiles(cwd).filter((n) => isFullPage(path.join(cwd, n)));
  }
} else {
  // 자동 스캔 모드
  console.log(`[MODE] 프로젝트 자동 스캔: ${cwd}\n`);

  const htmlFiles = scanHtmlFiles(cwd);
  if (htmlFiles.length === 0) {
    console.error("이 폴더에 .html 파일이 없습니다.");
    console.error("먼저 index.html 같은 완성된 페이지를 만든 뒤 다시 실행하세요.");
    process.exit(1);
  }

  const fullPages = htmlFiles.filter((n) => isFullPage(path.join(cwd, n)));
  if (fullPages.length === 0) {
    console.error("완전한 HTML 페이지가 없습니다 (<html> 태그가 필요합니다).");
    console.error(`감지된 파일: ${htmlFiles.join(", ")}`);
    process.exit(1);
  }
  allPages = fullPages;

  // index.html 우선, 없으면 첫 번째
  const preferred = fullPages.find((n) => n.toLowerCase() === "index.html");
  const chosen = preferred || fullPages[0];
  sourcePath = path.join(cwd, chosen);

  console.log(`감지된 페이지 (${fullPages.length}개): ${fullPages.join(", ")}`);
  console.log(`소스로 선택: ${chosen}${preferred ? " (index.html 우선 규칙)" : " (가나다순 첫 번째)"}\n`);
}

const outDir = path.resolve(outArg || "common");

// -- 소스에서 공통영역 추출 ----------------------------------------------
const sourceHtml = fs.readFileSync(sourcePath, "utf8");
const parts = extractParts(sourceHtml);

if (!parts.head) console.warn("[WARN] 소스에서 Tailwind CDN 스크립트를 찾지 못함.");
if (!parts.header) console.warn("[WARN] 소스에서 <header> 태그를 찾지 못함.");
if (!parts.footer) console.warn("[WARN] 소스에서 <footer> 태그를 찾지 못함.");

// -- 다른 페이지들과 대조 리포트 -----------------------------------------
const others = allPages.filter((n) => path.join(cwd, n) !== sourcePath);
if (others.length > 0) {
  console.log("\n팀 페이지 간 공통영역 일치 검사:");
  const mismatch = { head: [], header: [], footer: [] };

  for (const name of others) {
    const otherHtml = fs.readFileSync(path.join(cwd, name), "utf8");
    const op = extractParts(otherHtml);
    if (normalize(op.head) !== normalize(parts.head)) mismatch.head.push(name);
    if (normalize(op.header) !== normalize(parts.header)) mismatch.header.push(name);
    if (normalize(op.footer) !== normalize(parts.footer)) mismatch.footer.push(name);
  }

  const label = (arr) => (arr.length === 0 ? "모두 일치" : `${arr.length}개 불일치 → ${arr.join(", ")}`);
  console.log(`  head 스니펫: ${label(mismatch.head)}`);
  console.log(`  header:      ${label(mismatch.header)}`);
  console.log(`  footer:      ${label(mismatch.footer)}`);

  const total = mismatch.head.length + mismatch.header.length + mismatch.footer.length;
  if (total > 0) {
    console.log("\n→ 불일치 파일은 추출된 공통 스니펫과 다른 코드를 갖고 있습니다.");
    console.log("  common/ 배포 후 각 파일의 해당 부분을 스니펫으로 교체하면 팀 표준이 통일됩니다.");
  }
}

// -- 파일 저장 -----------------------------------------------------------
fs.mkdirSync(outDir, { recursive: true });

function saveIf(filename, content, label) {
  if (!content) {
    console.log(`[FAIL] ${label}: 원본에서 찾지 못함 → 저장 생략`);
    return;
  }
  const filepath = path.join(outDir, filename);
  fs.writeFileSync(filepath, content + "\n", "utf8");
  console.log(`[OK]   ${label}: ${path.relative(cwd, filepath)} (${content.split("\n").length}줄)`);
}

console.log(`\n출력폴더: ${path.relative(cwd, outDir)}`);
saveIf("head.html", parts.head, "head 스니펫");
saveIf("header.html", parts.header, "header 스니펫");
saveIf("footer.html", parts.footer, "footer 스니펫");

// -- 후속 안내 -----------------------------------------------------------
console.log(`\n다음 단계:`);
console.log(`  1) common/ 폴더의 세 파일을 팀 저장소에 커밋합니다.`);
console.log(`  2) 불일치 리포트의 파일들을 열어 해당 부분을 스니펫으로 교체합니다.`);
console.log(`  3) 새 페이지를 만들 때 스니펫을 각 위치에 그대로 복사합니다.`);
console.log(`  4) 토큰(색·폰트·간격)이 바뀌면 common/head.html 만 고치고 팀원 전체에 공지합니다.`);
