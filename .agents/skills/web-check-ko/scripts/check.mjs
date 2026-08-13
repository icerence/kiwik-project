#!/usr/bin/env node
// Node 내장 기능만 사용합니다. npm install 이 필요 없습니다. (Node 18 이상)
/**
 * 공개 URL 하나를 받아 네 가지 검사를 실행하고 결과를 JSON 한 덩어리로 출력합니다.
 *
 *   1. HTML 문법     - W3C Nu HTML Checker
 *   2. CSS 문법      - W3C CSS Validator (Jigsaw)
 *   3. JS 문법·린트  - ESLint recommended (npx로 임시 실행)
 *   4. 품질 점수     - Lighthouse (PageSpeed Insights API, 실패 시 로컬 lighthouse CLI)
 *
 * 사용법:
 *   node check.mjs https://example.com/
 *   node check.mjs https://example.com/ --strategy desktop
 *   node check.mjs https://example.com/ --psi-key YOUR_KEY
 *   node check.mjs https://example.com/ --skip lighthouse
 *   node check.mjs https://example.com/ --js-file app.js
 *   node check.mjs --js-file app.js utils.js
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const NU_ENDPOINT = "https://validator.w3.org/nu/";
const CSS_ENDPOINT = "https://jigsaw.w3.org/css-validator/validator";
const PSI_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

// W3C Nu 검사기는 User-Agent 가 없는 요청을 거부합니다.
const UA = "web-check-ko/1.0 (+https://validator.w3.org/nu/)";

const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];

const IS_WIN = process.platform === "win32";

// ---------------------------------------------------------------- 공용

/** 예외를 파이썬판과 같은 "이름: 내용" 모양의 문자열로 만듭니다. */
function describe(err) {
  if (err && err.name === "TimeoutError") return "TimeoutError: 시간 초과";
  const name = (err && err.name) || "Error";
  const msg = (err && err.message) || String(err);
  return `${name}: ${msg}`;
}

/** HTTP 오류를 예외로 올립니다. 본문 앞부분을 detail 로 함께 담습니다. */
async function throwIfNotOk(res) {
  if (res.ok) return;
  let body = "";
  try {
    body = (await res.text()).slice(0, 300);
  } catch {
    /* 본문을 못 읽어도 상태 코드는 알립니다. */
  }
  // 파이썬판(urllib)의 오류 문구와 같은 모양으로 맞춥니다: "HTTP Error 404: Not Found"
  const reason = res.statusText || "";
  const err = new Error(`HTTP Error ${res.status}${reason ? `: ${reason}` : ""}`);
  err.name = "HTTPError";
  err.status = res.status;
  err.detail = body;
  throw err;
}

async function fetchJson(url, timeoutMs = 90_000) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  await throwIfNotOk(res);
  return JSON.parse(await res.text());
}

async function postJson(url, body, contentType, timeoutMs = 90_000) {
  const res = await fetch(url, {
    method: "POST",
    body,
    headers: { "User-Agent": UA, Accept: "application/json", "Content-Type": contentType },
    signal: AbortSignal.timeout(timeoutMs),
  });
  await throwIfNotOk(res);
  return JSON.parse(await res.text());
}

/** PATH 에서 실행 파일을 찾습니다. shutil.which 와 같은 역할입니다. */
function which(cmd) {
  const probe = spawnSync(IS_WIN ? "where" : "which", [cmd], { encoding: "utf8" });
  if (probe.status !== 0) return null;
  const first = (probe.stdout || "").split(/\r?\n/).find((l) => l.trim());
  return first ? first.trim() : null;
}

// ---------------------------------------------------------------- HTML

async function checkHtml(target, localPath = null) {
  let raw;
  try {
    if (localPath) {
      raw = await postJson(`${NU_ENDPOINT}?out=json`, fs.readFileSync(localPath), "text/html; charset=utf-8");
    } else {
      const q = new URLSearchParams({ doc: target, out: "json" });
      raw = await fetchJson(`${NU_ENDPOINT}?${q}`);
    }
  } catch (exc) {
    return { ok: false, reason: describe(exc) };
  }

  const errors = [];
  const warnings = [];
  for (const m of raw.messages || []) {
    const item = {
      message: m.message || "",
      line: m.lastLine ?? null,
      column: m.lastColumn ?? null,
      extract: (m.extract || "").trim(),
    };
    if (m.type === "error") errors.push(item);
    else warnings.push(item);
  }

  return {
    ok: true,
    checker: "W3C Nu HTML Checker",
    version: raw.version ?? null,
    error_count: errors.length,
    warning_count: warnings.length,
    errors,
    warnings,
  };
}

// ---------------------------------------------------------------- CSS

async function checkCss(target, localPath = null) {
  const base = { profile: "css3svg", output: "json", warning: "0" };
  let raw;
  try {
    if (localPath) base.text = fs.readFileSync(localPath, "utf8");
    else base.uri = target;
    raw = await fetchJson(`${CSS_ENDPOINT}?${new URLSearchParams(base)}`);
  } catch (exc) {
    return { ok: false, reason: describe(exc) };
  }

  const body = raw.cssvalidation || {};
  const result = body.result || {};

  // 응답의 errors 는 평평한 목록으로 올 때와 스타일시트별로 묶여 올 때가 있습니다.
  const errors = [];
  for (const group of body.errors || []) {
    const pairs =
      group && typeof group === "object" && Array.isArray(group.errors)
        ? group.errors.map((e) => [group.uri, e])
        : [[null, group]];
    for (const [src, e] of pairs) {
      errors.push({
        source: e.source || src || null,
        line: e.line ?? null,
        message: (e.message || "").trim(),
        context: (e.context || "").trim(),
      });
    }
  }

  return {
    ok: true,
    checker: "W3C CSS Validator",
    css_level: body.csslevel ?? null,
    valid: body.validity ?? null,
    error_count: result.errorcount ?? errors.length,
    warning_count: result.warningcount ?? 0,
    errors,
  };
}

// ---------------------------------------------------------------- JavaScript

// ESLint recommended 세트를 인라인 규칙으로 재현합니다. 외부 패키지를 import 하지 않으므로
// npx로 임시 실행할 때 의존성 해결 문제가 생기지 않습니다.
// 규칙 목록은 ESLint 9.x의 @eslint/js.configs.recommended 기준입니다.
const ESLINT_CONFIG = `
export default [
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        window: "readonly", document: "readonly", console: "readonly",
        navigator: "readonly", location: "readonly", fetch: "readonly",
        setTimeout: "readonly", clearTimeout: "readonly",
        setInterval: "readonly", clearInterval: "readonly",
        Promise: "readonly", process: "readonly",
        module: "readonly", require: "readonly", exports: "readonly",
        __dirname: "readonly", __filename: "readonly",
        globalThis: "readonly", URL: "readonly", URLSearchParams: "readonly",
      },
    },
    rules: {
      // eslint:recommended (ESLint 9.x)
      "constructor-super": "error",
      "for-direction": "error",
      "getter-return": "error",
      "no-async-promise-executor": "error",
      "no-case-declarations": "error",
      "no-class-assign": "error",
      "no-compare-neg-zero": "error",
      "no-cond-assign": "error",
      "no-const-assign": "error",
      "no-constant-binary-expression": "error",
      "no-constant-condition": "error",
      "no-control-regex": "error",
      "no-debugger": "error",
      "no-delete-var": "error",
      "no-dupe-args": "error",
      "no-dupe-class-members": "error",
      "no-dupe-else-if": "error",
      "no-dupe-keys": "error",
      "no-duplicate-case": "error",
      "no-empty": "error",
      "no-empty-character-class": "error",
      "no-empty-pattern": "error",
      "no-empty-static-block": "error",
      "no-ex-assign": "error",
      "no-extra-boolean-cast": "error",
      "no-fallthrough": "error",
      "no-func-assign": "error",
      "no-global-assign": "error",
      "no-import-assign": "error",
      "no-invalid-regexp": "error",
      "no-irregular-whitespace": "error",
      "no-loss-of-precision": "error",
      "no-misleading-character-class": "error",
      "no-new-native-nonconstructor": "error",
      "no-nonoctal-decimal-escape": "error",
      "no-obj-calls": "error",
      "no-octal": "error",
      "no-prototype-builtins": "error",
      "no-redeclare": "error",
      "no-regex-spaces": "error",
      "no-self-assign": "error",
      "no-setter-return": "error",
      "no-shadow-restricted-names": "error",
      "no-sparse-arrays": "error",
      "no-this-before-super": "error",
      "no-undef": "error",
      "no-unexpected-multiline": "error",
      "no-unreachable": "error",
      "no-unsafe-finally": "error",
      "no-unsafe-negation": "error",
      "no-unsafe-optional-chaining": "error",
      "no-unused-labels": "error",
      "no-unused-private-class-members": "error",
      "no-unused-vars": "error",
      "no-useless-backreference": "error",
      "no-useless-catch": "error",
      "no-useless-escape": "error",
      "no-with": "error",
      "require-yield": "error",
      "use-isnan": "error",
      "valid-typeof": "error",
      // 사용자 지침(ES2025+ 최신 표준) 관련 추가 규칙
      "no-var": "error",
      "prefer-const": "warn",
      "eqeqeq": ["error", "smart"],
    },
  },
];
`;

/** node·npx 경로를 찾습니다. 없으면 null 을 돌려줍니다. */
function findNodeAndNpx() {
  return { node: which("node"), npx: which("npx") };
}

/** 임시 디렉터리에 쓸 안전한 파일 이름으로 다듬습니다. */
function safeName(name) {
  return name.replace(/[^A-Za-z0-9._-]/g, "_") || "script.js";
}

/**
 * URL 페이지에서 inline <script>와 외부 .js 파일을 모두 수집합니다.
 * 돌려주는 값은 [{name, code}] 목록입니다. name은 표시용 식별자입니다.
 */
async function extractJsFromUrl(url) {
  const scripts = [];
  let html;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(30_000),
    });
    await throwIfNotOk(res);
    html = await res.text();
  } catch (exc) {
    return [scripts, `페이지를 열지 못했습니다: ${describe(exc)}`];
  }

  // inline scripts: <script>...</script> (단 src 속성이 있으면 제외)
  const inlineRe = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let idx = 0;
  for (const m of html.matchAll(inlineRe)) {
    idx += 1;
    const code = m[1].trim();
    if (code) scripts.push({ name: `inline#${idx}`, code });
  }

  // 외부 .js 파일: <script src="...">
  const srcRe = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  const seen = new Set();
  for (const m of html.matchAll(srcRe)) {
    let src;
    try {
      src = new URL(m[1], url).toString();
    } catch {
      continue;
    }
    if (seen.has(src)) continue;
    seen.add(src);
    try {
      const res = await fetch(src, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(30_000),
      });
      await throwIfNotOk(res);
      scripts.push({ name: src, code: await res.text() });
    } catch (exc) {
      scripts.push({ name: src, code: null, fetch_error: describe(exc) });
    }
  }
  return [scripts, null];
}

/** 준비된 디렉터리에서 ESLint를 실행하고 JSON 결과를 돌려줍니다. */
function runEslint(scriptsDir, filenames) {
  // cwd 를 작업 디렉터리로 잡아 두었으므로 상대 경로만 넘깁니다.
  // 그래야 임시 폴더 경로에 공백이 있어도 따옴표 문제가 생기지 않습니다.
  // 파일 이름은 safeName 으로 다듬어 두어 공백·특수문자가 없습니다.
  //
  // 윈도우의 npx 는 .cmd 파일이라 셸을 거쳐야 실행됩니다. 이때 인자를 배열로 넘기면
  // Node 가 DEP0190 경고를 stderr 로 뿌리므로, 명령 전체를 한 문자열로 만들어 넘깁니다.
  const cmd = [
    "npx", "--yes", "--package", "eslint@latest",
    "eslint",
    "--no-config-lookup",
    "--config", "eslint.config.mjs",
    "--format", "json",
    ...filenames,
  ].join(" ");

  const proc = spawnSync(cmd, {
    cwd: scriptsDir,
    encoding: "utf8",
    timeout: 300_000,
    shell: true,
    maxBuffer: 64 * 1024 * 1024,
  });

  if (proc.error) {
    if (proc.error.code === "ETIMEDOUT") return [null, "ESLint 실행이 5분을 넘겼습니다."];
    return [null, describe(proc.error)];
  }
  if (proc.signal === "SIGTERM") return [null, "ESLint 실행이 5분을 넘겼습니다."];

  const stdout = proc.stdout || "";
  const stderr = proc.stderr || "";

  // ESLint는 문제가 있어도 JSON을 정상 출력합니다. 종료 코드가 2 이상이면 실행 자체 실패.
  if (proc.status >= 2 || !stdout.trim()) {
    return [null, stderr.trim() || `ESLint 종료 코드 ${proc.status}`];
  }
  try {
    return [JSON.parse(stdout), null];
  } catch (exc) {
    return [null, `ESLint 출력을 해석하지 못했습니다: ${exc.message}`];
  }
}

/** URL의 스크립트나 로컬 .js 파일을 ESLint로 검사합니다. */
async function checkJs({ targetUrl = null, localPaths = null } = {}) {
  const { node, npx } = findNodeAndNpx();
  if (!node || !npx) {
    return {
      ok: false,
      reason: "Node.js(node·npx)를 찾지 못했습니다. Node.js LTS 설치 후 다시 실행합니다.",
    };
  }

  const workdir = fs.mkdtempSync(path.join(os.tmpdir(), "eslint-check-"));
  try {
    // 설정 파일과 최소 package.json을 준비합니다.
    fs.writeFileSync(path.join(workdir, "eslint.config.mjs"), ESLINT_CONFIG, "utf8");
    fs.writeFileSync(
      path.join(workdir, "package.json"),
      '{"name":"web-check-ko-eslint","private":true,"type":"module"}\n',
      "utf8",
    );

    const filenames = [];
    const fetchErrors = [];

    if (localPaths && localPaths.length) {
      for (const p of localPaths) {
        if (!fs.existsSync(p) || !fs.statSync(p).isFile()) {
          fetchErrors.push({ source: p, reason: "파일을 찾지 못했습니다." });
          continue;
        }
        const base = safeName(path.basename(p));
        let dest = path.join(workdir, base);
        // 이름이 겹치면 인덱스를 붙입니다.
        let i = 1;
        while (fs.existsSync(dest)) {
          const ext = path.extname(base);
          const stem = path.basename(base, ext);
          dest = path.join(workdir, `${stem}_${i}${ext}`);
          i += 1;
        }
        fs.copyFileSync(p, dest);
        filenames.push(path.basename(dest));
      }
    } else if (targetUrl) {
      const [scripts, err] = await extractJsFromUrl(targetUrl);
      if (err) return { ok: false, reason: err };
      let n = 0;
      for (const s of scripts) {
        n += 1;
        if (s.fetch_error) {
          fetchErrors.push({ source: s.name, reason: s.fetch_error });
          continue;
        }
        // 파일 이름은 원본을 짐작할 수 있게 남깁니다.
        let fname;
        if (s.name.startsWith("inline#")) {
          fname = `inline_${n}.js`;
        } else {
          const tail = path.basename(new URL(s.name).pathname) || "script.js";
          fname = safeName(`remote_${n}_${tail}`);
          if (!fname.endsWith(".js")) fname += ".js";
        }
        fs.writeFileSync(path.join(workdir, fname), s.code, "utf8");
        filenames.push(fname);
      }
    }

    if (!filenames.length) {
      return {
        ok: false,
        reason: "검사할 JavaScript 코드를 찾지 못했습니다.",
        fetch_errors: fetchErrors,
      };
    }

    const [result, err] = runEslint(workdir, filenames);
    if (err) return { ok: false, reason: err, fetch_errors: fetchErrors };

    // 파일별로 오류·경고를 모읍니다. severity 2 = error, 1 = warning.
    const files = [];
    let errorCount = 0;
    let warningCount = 0;
    for (const entry of result) {
      const fname = path.basename(entry.filePath || "");
      const errs = [];
      const warns = [];
      for (const msg of entry.messages || []) {
        const item = {
          rule: msg.ruleId || "parsing-error",
          message: msg.message || "",
          line: msg.line ?? null,
          column: msg.column ?? null,
        };
        if (msg.severity === 2) {
          errs.push(item);
          errorCount += 1;
        } else {
          warns.push(item);
          warningCount += 1;
        }
      }
      files.push({
        file: fname,
        error_count: errs.length,
        warning_count: warns.length,
        errors: errs,
        warnings: warns,
      });
    }

    return {
      ok: true,
      checker: "ESLint (recommended)",
      error_count: errorCount,
      warning_count: warningCount,
      files,
      fetch_errors: fetchErrors,
    };
  } finally {
    fs.rmSync(workdir, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------- Lighthouse

/** Lighthouse 결과 원본에서 보고서에 쓸 부분만 추립니다. */
function shapeLighthouse(lhr) {
  const scores = {};
  for (const [key, cat] of Object.entries(lhr.categories || {})) {
    scores[key] = cat.score === null || cat.score === undefined ? null : Math.round(cat.score * 100);
  }

  const metrics = {};
  for (const id of [
    "first-contentful-paint",
    "speed-index",
    "largest-contentful-paint",
    "total-blocking-time",
    "cumulative-layout-shift",
  ]) {
    const a = (lhr.audits || {})[id];
    if (a) metrics[id] = { display: a.displayValue ?? null, score: a.score ?? null };
  }

  const failed = [];
  for (const a of Object.values(lhr.audits || {})) {
    const s = a.score;
    if (s !== null && s !== undefined && s < 1 &&
        a.scoreDisplayMode !== "notApplicable" && a.scoreDisplayMode !== "informative") {
      failed.push({
        id: a.id ?? null,
        title: a.title ?? null,
        description: a.description ?? null,
        score: s,
        display: a.displayValue ?? null,
      });
    }
  }
  failed.sort((x, y) => x.score - y.score);

  const manual = Object.values(lhr.audits || {})
    .filter((a) => a.scoreDisplayMode === "manual")
    .map((a) => ({ id: a.id ?? null, title: a.title ?? null }));

  return {
    ok: true,
    lighthouse_version: lhr.lighthouseVersion ?? null,
    final_url: lhr.finalDisplayedUrl || lhr.finalUrl || null,
    scores,
    speed_metrics: metrics,
    failed_audits: failed,
    manual_checks: manual,
  };
}

async function checkLighthousePsi(target, strategy, key = null) {
  const params = new URLSearchParams([["url", target], ["strategy", strategy]]);
  for (const c of CATEGORIES) params.append("category", c);
  if (key) params.append("key", key);

  let raw;
  try {
    raw = await fetchJson(`${PSI_ENDPOINT}?${params}`, 180_000);
  } catch (exc) {
    if (exc.name === "HTTPError") {
      return { ok: false, source: "psi", reason: `HTTP ${exc.status}`, detail: exc.detail || "" };
    }
    return { ok: false, source: "psi", reason: describe(exc) };
  }

  const out = shapeLighthouse(raw.lighthouseResult || {});
  out.source = "PageSpeed Insights API";
  out.strategy = strategy;
  return out;
}

function checkLighthouseCli(target, strategy) {
  if (!which("lighthouse")) {
    return { ok: false, source: "cli", reason: "lighthouse 명령을 찾지 못했습니다." };
  }

  const tmpFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "lh-")), "report.json");
  const args = [
    target, "--quiet", "--output=json", `--output-path=${tmpFile}`,
    `--only-categories=${CATEGORIES.join(",")}`,
    "--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage --disable-gpu",
  ];
  if (strategy === "desktop") args.push("--preset=desktop");

  let raw;
  try {
    spawnSync("lighthouse", args, { encoding: "utf8", timeout: 300_000, shell: IS_WIN });
    raw = JSON.parse(fs.readFileSync(tmpFile, "utf8"));
  } catch (exc) {
    return { ok: false, source: "cli", reason: describe(exc) };
  } finally {
    fs.rmSync(path.dirname(tmpFile), { recursive: true, force: true });
  }

  const cats = raw.categories;
  if (!cats || Object.values(cats).every((c) => c.score === null || c.score === undefined)) {
    return {
      ok: false,
      source: "cli",
      reason: "브라우저가 페이지를 열지 못했습니다. 방화벽이나 프록시를 확인합니다.",
    };
  }

  const out = shapeLighthouse(raw);
  out.source = "로컬 lighthouse CLI";
  out.strategy = strategy;
  return out;
}

async function checkLighthouse(target, strategy, key) {
  const first = await checkLighthousePsi(target, strategy, key);
  if (first.ok) return first;
  const second = checkLighthouseCli(target, strategy);
  if (second.ok) {
    second.psi_failure = first.reason;
    return second;
  }
  return { ok: false, psi: first, cli: second };
}

// ---------------------------------------------------------------- 옵션 해석

const HELP = `사용법: node check.mjs [URL] [옵션]

위치 인자:
  URL                    검사할 공개 URL

옵션:
  --html-file 경로       로컬 HTML 파일 경로(문법만 검사)
  --css-file 경로        로컬 CSS 파일 경로(문법만 검사)
  --js-file 경로 [경로…] 로컬 JavaScript 파일 경로(여러 개 허용)
  --strategy both|mobile|desktop   측정 기준 (기본: both)
  --psi-key 키           PageSpeed Insights API 키
  --skip html|css|js|lighthouse   건너뛸 검사 (여러 번 지정 가능)
  --out 경로             결과 JSON을 저장할 경로
  -h, --help             이 도움말
`;

/** argparse 의 동작(특히 --js-file 의 여러 값 받기)을 그대로 흉내 냅니다. */
function parseArgs(argv) {
  const opts = {
    url: null, htmlFile: null, cssFile: null, jsFile: null,
    strategy: "both", psiKey: null, skip: [], out: null,
  };
  const SINGLE = {
    "--html-file": "htmlFile", "--css-file": "cssFile",
    "--strategy": "strategy", "--psi-key": "psiKey", "--out": "out",
  };
  const SKIP_CHOICES = ["html", "css", "js", "lighthouse"];

  for (let i = 0; i < argv.length; i += 1) {
    const tok = argv[i];

    if (tok === "-h" || tok === "--help") {
      process.stdout.write(HELP);
      process.exit(0);
    }

    if (tok === "--js-file") {
      // nargs="+" : 다음 옵션이 나올 때까지 값을 모두 가져옵니다.
      const vals = [];
      while (i + 1 < argv.length && !argv[i + 1].startsWith("--")) {
        i += 1;
        vals.push(argv[i]);
      }
      if (!vals.length) fail("--js-file 에는 파일 경로가 하나 이상 필요합니다.");
      opts.jsFile = (opts.jsFile || []).concat(vals);
      continue;
    }

    if (tok === "--skip") {
      if (i + 1 >= argv.length) fail("--skip 에는 값이 필요합니다.");
      i += 1;
      if (!SKIP_CHOICES.includes(argv[i])) {
        fail(`--skip 값은 ${SKIP_CHOICES.join(" / ")} 중 하나여야 합니다.`);
      }
      opts.skip.push(argv[i]);
      continue;
    }

    if (tok in SINGLE) {
      if (i + 1 >= argv.length) fail(`${tok} 에는 값이 필요합니다.`);
      i += 1;
      opts[SINGLE[tok]] = argv[i];
      continue;
    }

    if (tok.startsWith("--")) fail(`알 수 없는 옵션입니다: ${tok}`);

    if (opts.url === null) opts.url = tok;
    else fail(`인자가 너무 많습니다: ${tok}`);
  }

  if (!["both", "mobile", "desktop"].includes(opts.strategy)) {
    fail("--strategy 값은 both, mobile 또는 desktop 이어야 합니다.");
  }
  return opts;
}

function fail(msg) {
  process.stderr.write(`오류: ${msg}\n\n${HELP}`);
  process.exit(2);
}

// ---------------------------------------------------------------- main

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const hasLocalFiles = Boolean(args.htmlFile || args.cssFile || args.jsFile);
  const localMode = !args.url && hasLocalFiles;
  if (!args.url && !hasLocalFiles) {
    fail("URL 또는 --html-file/--css-file/--js-file 중 하나는 있어야 합니다.");
  }

  let target = args.url || "";
  if (target && !/^https?:\/\//i.test(target)) target = `https://${target}`;

  const report = { target: target || null, strategy: args.strategy, local_mode: localMode };

  if (localMode) {
    report.html = args.htmlFile ? await checkHtml(null, args.htmlFile) : { skipped: true };
    report.css = args.cssFile ? await checkCss(null, args.cssFile) : { skipped: true };
    if (args.skip.includes("js") || !args.jsFile) report.js = { skipped: true };
    else report.js = await checkJs({ localPaths: args.jsFile });
    report.lighthouse = {
      ok: false,
      reason: "로컬 파일은 Lighthouse 로 측정할 수 없습니다. 인터넷에 올린 뒤 URL 로 다시 실행합니다.",
    };
  } else {
    report.html = args.skip.includes("html")
      ? { skipped: true }
      : await checkHtml(args.htmlFile ? null : target, args.htmlFile);
    report.css = args.skip.includes("css")
      ? { skipped: true }
      : await checkCss(args.cssFile ? null : target, args.cssFile);
    // URL 모드에서도 --js-file이 오면 그 파일들을 검사합니다.
    if (args.skip.includes("js")) report.js = { skipped: true };
    else if (args.jsFile) report.js = await checkJs({ localPaths: args.jsFile });
    else report.js = await checkJs({ targetUrl: target });
    if (args.skip.includes("lighthouse")) {
      report.lighthouse = { skipped: true };
    } else if (args.strategy === "both") {
      const [mobile, desktop] = await Promise.all([
        checkLighthouse(target, "mobile", args.psiKey),
        checkLighthouse(target, "desktop", args.psiKey),
      ]);
      report.lighthouse = { mobile, desktop };
    } else {
      report.lighthouse = await checkLighthouse(target, args.strategy, args.psiKey);
    }
  }

  const text = JSON.stringify(report, null, 2);
  if (args.out) {
    fs.writeFileSync(args.out, text, "utf8");
    process.stdout.write(`저장 완료: ${args.out}\n`);
  }
  process.stdout.write(`${text}\n`);
}

main().catch((exc) => {
  process.stderr.write(`예상하지 못한 오류: ${describe(exc)}\n`);
  process.exit(1);
});
