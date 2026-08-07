const ALLOWED_CDN_PREFIXES = [
  'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4',
  'https://cdn.jsdelivr.net/npm/gsap@3.15/dist/gsap.min.js',
  'https://cdn.jsdelivr.net/npm/gsap@3.15/dist/ScrollTrigger.min.js',
  'https://cdn.jsdelivr.net/npm/gsap@3.15/dist/ScrollSmoother.min.js',
  'https://cdn.jsdelivr.net/npm/gsap@3.15/dist/ScrollToPlugin.min.js',
  'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css',
  'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js',
];

const CHECKED_EXTENSIONS = ['.html', '.css', '.js'];

const COLOR_PATTERNS = [
  /#[0-9a-fA-F]{3,8}\b/,
  /\brgba?\s*\(/,
  /\bhsla?\s*\(/,
];

const EXEMPT_PATTERN = /(\/\/\s*token-exempt:|\/\*\s*token-exempt:)/;
const CLASS_ATTR_PATTERN = /class\s*=\s*(["'])(.*?)\1/g;
const CDN_TAG_PATTERN = /<(?:script|link)\b[^>]*\b(?:src|href)\s*=\s*(["'])(https?:\/\/[^"']+)\1/gi;

// Tailwind v4 CDN(Play CDN)은 외부 CSS의 @theme을 못 읽는다.
// 그래서 @theme { ... } 토큰 정의는 index.html 안에 그대로 있어야 하며,
// 이 블록 안 색상값만 하드코딩 검사에서 예외로 둔다.
const THEME_START_PATTERN = /@theme\s*\{/;

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

function getExtension(filePath) {
  const match = /\.[a-zA-Z0-9]+$/.exec(filePath || '');
  return match ? match[0].toLowerCase() : '';
}

function findColorViolations(line) {
  const violations = [];
  for (const pattern of COLOR_PATTERNS) {
    const match = pattern.exec(line);
    if (match) violations.push(`하드코딩 색상 사용 - "${match[0]}"`);
  }
  return violations;
}

function findArbitraryClassViolations(line) {
  const violations = [];
  let m;
  CLASS_ATTR_PATTERN.lastIndex = 0;
  while ((m = CLASS_ATTR_PATTERN.exec(line)) !== null) {
    const value = m[2];
    if (value.includes('[')) {
      violations.push(`arbitrary Tailwind 클래스 - class="${value}"`);
    }
  }
  return violations;
}

function findCdnViolations(line) {
  const violations = [];
  let m;
  CDN_TAG_PATTERN.lastIndex = 0;
  while ((m = CDN_TAG_PATTERN.exec(line)) !== null) {
    const url = m[2];
    const allowed = ALLOWED_CDN_PREFIXES.some((prefix) => url.startsWith(prefix));
    if (!allowed) violations.push(`허용되지 않은 CDN - ${url}`);
  }
  return violations;
}

async function main() {
  let payload;
  try {
    payload = JSON.parse(await readStdin());
  } catch {
    process.exit(0);
  }

  const filePath = payload?.tool_input?.file_path || '';
  const ext = getExtension(filePath);

  if (!CHECKED_EXTENSIONS.includes(ext)) process.exit(0);

  const text = payload?.tool_input?.content ?? payload?.tool_input?.new_string ?? '';
  if (!text) process.exit(0);

  const findings = [];
  let themeDepth = 0;

  text.split('\n').forEach((line, index) => {
    if (EXEMPT_PATTERN.test(line)) return;

    const enteringTheme = themeDepth === 0 && THEME_START_PATTERN.test(line);
    const inTheme = themeDepth > 0 || enteringTheme;

    if (enteringTheme) {
      themeDepth = 1;
      // @theme를 여는 이 줄에 추가로 열리거나 닫힌 중괄호를 반영한다.
      // @theme의 여는 중괄호 하나는 이미 셈했으므로 그만큼 뺀다.
      themeDepth += (line.match(/\{/g) || []).length - 1;
      themeDepth -= (line.match(/\}/g) || []).length;
      if (themeDepth < 0) themeDepth = 0;
    }
    else if (themeDepth > 0) {
      themeDepth += (line.match(/\{/g) || []).length;
      themeDepth -= (line.match(/\}/g) || []).length;
      if (themeDepth < 0) themeDepth = 0;
    }

    const lineNumber = index + 1;
    const lineViolations = [
      ...(inTheme ? [] : findColorViolations(line)),
      ...findArbitraryClassViolations(line),
      ...findCdnViolations(line),
    ];

    for (const violation of lineViolations) {
      findings.push(`  L${lineNumber}: ${violation}`);
    }
  });

  if (findings.length > 0) {
    process.stderr.write(`[check-hardcode] 하드코딩/토큰 위반 발견 in ${filePath}:\n`);
    process.stderr.write(findings.join('\n') + '\n');
    process.exit(2);
  }

  process.exit(0);
}

main();
