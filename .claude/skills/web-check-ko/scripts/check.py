#!/usr/bin/env python3
# 표준 라이브러리만 사용합니다. 별도 설치가 필요 없습니다.
"""
공개 URL 하나를 받아 네 가지 검사를 실행하고 결과를 JSON 한 덩어리로 출력합니다.

  1. HTML 문법     - W3C Nu HTML Checker
  2. CSS 문법      - W3C CSS Validator (Jigsaw)
  3. JS 문법·린트  - ESLint recommended (npx로 임시 실행)
  4. 품질 점수     - Lighthouse (PageSpeed Insights API, 실패 시 로컬 lighthouse CLI)

사용법:
  python3 check.py https://example.com/
  python3 check.py https://example.com/ --strategy desktop
  python3 check.py https://example.com/ --psi-key YOUR_KEY
  python3 check.py https://example.com/ --skip lighthouse
  python3 check.py https://example.com/ --js-file app.js
  python3 check.py --js-file app.js utils.js
"""

import argparse
import json
import os
import re
import shutil
import ssl
import subprocess
import sys
import tempfile
import urllib.error
import urllib.parse
import urllib.request

NU_ENDPOINT = "https://validator.w3.org/nu/"
CSS_ENDPOINT = "https://jigsaw.w3.org/css-validator/validator"
PSI_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"

# W3C Nu 검사기는 User-Agent 가 없는 요청을 거부합니다.
UA = "web-check-ko/1.0 (+https://validator.w3.org/nu/)"

CATEGORIES = ["performance", "accessibility", "best-practices", "seo"]


def fetch_json(url, timeout=90):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, timeout=timeout, context=ctx) as res:
        return json.loads(res.read().decode("utf-8", "replace"))


# ---------------------------------------------------------------- HTML

def post_json(url, body, content_type, timeout=90):
    req = urllib.request.Request(
        url, data=body,
        headers={"User-Agent": UA, "Accept": "application/json", "Content-Type": content_type},
    )
    with urllib.request.urlopen(req, timeout=timeout, context=ssl.create_default_context()) as res:
        return json.loads(res.read().decode("utf-8", "replace"))


def check_html(target, local_path=None):
    try:
        if local_path:
            with open(local_path, "rb") as f:
                raw = post_json(f"{NU_ENDPOINT}?out=json", f.read(),
                                "text/html; charset=utf-8")
        else:
            q = urllib.parse.urlencode({"doc": target, "out": "json"})
            raw = fetch_json(f"{NU_ENDPOINT}?{q}")
    except Exception as exc:
        return {"ok": False, "reason": f"{type(exc).__name__}: {exc}"}

    errors, warnings = [], []
    for m in raw.get("messages", []):
        item = {
            "message": m.get("message", ""),
            "line": m.get("lastLine"),
            "column": m.get("lastColumn"),
            "extract": (m.get("extract") or "").strip(),
        }
        if m.get("type") == "error":
            errors.append(item)
        else:
            warnings.append(item)

    return {
        "ok": True,
        "checker": "W3C Nu HTML Checker",
        "version": raw.get("version"),
        "error_count": len(errors),
        "warning_count": len(warnings),
        "errors": errors,
        "warnings": warnings,
    }


# ---------------------------------------------------------------- CSS

def check_css(target, local_path=None):
    base = {"profile": "css3svg", "output": "json", "warning": "0"}
    try:
        if local_path:
            with open(local_path, encoding="utf-8", errors="replace") as f:
                base["text"] = f.read()
        else:
            base["uri"] = target
        raw = fetch_json(f"{CSS_ENDPOINT}?{urllib.parse.urlencode(base)}")
    except Exception as exc:
        return {"ok": False, "reason": f"{type(exc).__name__}: {exc}"}

    body = raw.get("cssvalidation", {})
    result = body.get("result", {})

    # 응답의 errors 는 평평한 목록으로 올 때와 스타일시트별로 묶여 올 때가 있습니다.
    errors = []
    for group in body.get("errors", []):
        if isinstance(group, dict) and isinstance(group.get("errors"), list):
            pairs = [(group.get("uri"), e) for e in group["errors"]]
        else:
            pairs = [(None, group)]
        for src, e in pairs:
            errors.append({
                "source": e.get("source") or src,
                "line": e.get("line"),
                "message": (e.get("message") or "").strip(),
                "context": (e.get("context") or "").strip(),
            })

    return {
        "ok": True,
        "checker": "W3C CSS Validator",
        "css_level": body.get("csslevel"),
        "valid": body.get("validity"),
        "error_count": result.get("errorcount", len(errors)),
        "warning_count": result.get("warningcount", 0),
        "errors": errors,
    }


# ---------------------------------------------------------------- JavaScript

# ESLint recommended 세트를 인라인 규칙으로 재현합니다. 외부 패키지를 import 하지 않으므로
# npx로 임시 실행할 때 의존성 해결 문제가 생기지 않습니다.
# 규칙 목록은 ESLint 9.x의 @eslint/js.configs.recommended 기준입니다.
ESLINT_CONFIG = """
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
"""


def _find_node_and_npx():
    """node·npx 경로를 찾습니다. 없으면 None을 돌려줍니다."""
    node = shutil.which("node")
    npx = shutil.which("npx")
    return node, npx


def _extract_js_from_url(url):
    """URL 페이지에서 inline <script>와 외부 .js 파일을 모두 수집합니다.

    돌려주는 값은 [{name, code}] 목록입니다. name은 표시용 식별자입니다.
    """
    scripts = []
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=30, context=ssl.create_default_context()) as res:
            html = res.read().decode("utf-8", "replace")
    except Exception as exc:
        return scripts, f"페이지를 열지 못했습니다: {type(exc).__name__}: {exc}"

    # inline scripts: <script>...</script> (단 src 속성이 있으면 제외)
    inline_re = re.compile(
        r'<script\b(?![^>]*\bsrc=)[^>]*>(.*?)</script>',
        re.DOTALL | re.IGNORECASE,
    )
    for idx, m in enumerate(inline_re.finditer(html), start=1):
        code = m.group(1).strip()
        if code:
            scripts.append({"name": f"inline#{idx}", "code": code})

    # 외부 .js 파일: <script src="...">
    src_re = re.compile(
        r'<script\b[^>]*\bsrc=["\']([^"\']+)["\'][^>]*>',
        re.IGNORECASE,
    )
    seen = set()
    for m in src_re.finditer(html):
        src = urllib.parse.urljoin(url, m.group(1))
        if src in seen:
            continue
        seen.add(src)
        try:
            req = urllib.request.Request(src, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=30, context=ssl.create_default_context()) as res:
                scripts.append({
                    "name": src,
                    "code": res.read().decode("utf-8", "replace"),
                })
        except Exception as exc:
            scripts.append({
                "name": src,
                "code": None,
                "fetch_error": f"{type(exc).__name__}: {exc}",
            })
    return scripts, None


def _run_eslint(scripts_dir, filenames, npx):
    """준비된 디렉터리에서 ESLint를 실행하고 JSON 결과를 돌려줍니다."""
    cmd = [
        npx, "--yes", "--package", "eslint@latest",
        "eslint",
        "--no-config-lookup",
        "--config", os.path.join(scripts_dir, "eslint.config.mjs"),
        "--format", "json",
    ] + filenames
    try:
        proc = subprocess.run(
            cmd, cwd=scripts_dir,
            capture_output=True, timeout=300, check=False,
        )
    except subprocess.TimeoutExpired:
        return None, "ESLint 실행이 5분을 넘겼습니다."
    except Exception as exc:
        return None, f"{type(exc).__name__}: {exc}"

    stdout = proc.stdout.decode("utf-8", "replace")
    stderr = proc.stderr.decode("utf-8", "replace")

    # ESLint는 문제가 있어도 JSON을 정상 출력합니다. 종료 코드가 2 이상이면 실행 자체 실패.
    if proc.returncode >= 2 or not stdout.strip():
        return None, (stderr.strip() or f"ESLint 종료 코드 {proc.returncode}")
    try:
        return json.loads(stdout), None
    except json.JSONDecodeError as exc:
        return None, f"ESLint 출력을 해석하지 못했습니다: {exc}"


def check_js(target_url=None, local_paths=None):
    """URL의 스크립트나 로컬 .js 파일을 ESLint로 검사합니다."""
    node, npx = _find_node_and_npx()
    if not node or not npx:
        return {
            "ok": False,
            "reason": "Node.js(node·npx)를 찾지 못했습니다. Node.js LTS 설치 후 다시 실행합니다.",
        }

    with tempfile.TemporaryDirectory(prefix="eslint-check-") as workdir:
        # 설정 파일과 최소 package.json을 준비합니다.
        with open(os.path.join(workdir, "eslint.config.mjs"), "w", encoding="utf-8") as f:
            f.write(ESLINT_CONFIG)
        with open(os.path.join(workdir, "package.json"), "w", encoding="utf-8") as f:
            f.write('{"name":"web-check-ko-eslint","private":true,"type":"module"}\n')

        filenames = []
        fetch_errors = []

        if local_paths:
            for path in local_paths:
                if not os.path.isfile(path):
                    fetch_errors.append({"source": path, "reason": "파일을 찾지 못했습니다."})
                    continue
                base = os.path.basename(path)
                dest = os.path.join(workdir, base)
                # 이름이 겹치면 인덱스를 붙입니다.
                idx = 1
                while os.path.exists(dest):
                    stem, ext = os.path.splitext(base)
                    dest = os.path.join(workdir, f"{stem}_{idx}{ext}")
                    idx += 1
                shutil.copyfile(path, dest)
                filenames.append(os.path.basename(dest))

        elif target_url:
            scripts, err = _extract_js_from_url(target_url)
            if err:
                return {"ok": False, "reason": err}
            for idx, s in enumerate(scripts, start=1):
                if s.get("fetch_error"):
                    fetch_errors.append({"source": s["name"], "reason": s["fetch_error"]})
                    continue
                # 파일 이름은 원본을 짐작할 수 있게 남깁니다.
                if s["name"].startswith("inline#"):
                    fname = f"inline_{idx}.js"
                else:
                    fname = f"remote_{idx}_{os.path.basename(urllib.parse.urlparse(s['name']).path) or 'script.js'}"
                    if not fname.endswith(".js"):
                        fname += ".js"
                dest = os.path.join(workdir, fname)
                with open(dest, "w", encoding="utf-8") as f:
                    f.write(s["code"])
                filenames.append(fname)

        if not filenames:
            return {
                "ok": False,
                "reason": "검사할 JavaScript 코드를 찾지 못했습니다.",
                "fetch_errors": fetch_errors,
            }

        result, err = _run_eslint(workdir, filenames, npx)
        if err:
            return {"ok": False, "reason": err, "fetch_errors": fetch_errors}

        # 파일별로 오류·경고를 모읍니다. severity 2 = error, 1 = warning.
        files = []
        error_count = 0
        warning_count = 0
        for entry in result:
            fname = os.path.basename(entry.get("filePath", ""))
            errs, warns = [], []
            for msg in entry.get("messages", []):
                item = {
                    "rule": msg.get("ruleId") or "parsing-error",
                    "message": msg.get("message", ""),
                    "line": msg.get("line"),
                    "column": msg.get("column"),
                }
                if msg.get("severity") == 2:
                    errs.append(item)
                    error_count += 1
                else:
                    warns.append(item)
                    warning_count += 1
            files.append({
                "file": fname,
                "error_count": len(errs),
                "warning_count": len(warns),
                "errors": errs,
                "warnings": warns,
            })

        return {
            "ok": True,
            "checker": "ESLint (recommended)",
            "error_count": error_count,
            "warning_count": warning_count,
            "files": files,
            "fetch_errors": fetch_errors,
        }


# ---------------------------------------------------------------- Lighthouse

def _shape_lighthouse(lhr):
    """Lighthouse 결과 원본에서 보고서에 쓸 부분만 추립니다."""
    scores = {}
    for key, cat in lhr.get("categories", {}).items():
        s = cat.get("score")
        scores[key] = None if s is None else round(s * 100)

    metrics = {}
    for audit_id in ["first-contentful-paint", "speed-index",
                     "largest-contentful-paint", "total-blocking-time",
                     "cumulative-layout-shift"]:
        a = lhr.get("audits", {}).get(audit_id)
        if a:
            metrics[audit_id] = {
                "display": a.get("displayValue"),
                "score": a.get("score"),
            }

    failed = []
    for a in lhr.get("audits", {}).values():
        s = a.get("score")
        if s is not None and s < 1 and a.get("scoreDisplayMode") not in ("notApplicable", "informative"):
            failed.append({
                "id": a.get("id"),
                "title": a.get("title"),
                "description": a.get("description"),
                "score": s,
                "display": a.get("displayValue"),
            })
    failed.sort(key=lambda x: x["score"])

    manual = [
        {"id": a.get("id"), "title": a.get("title")}
        for a in lhr.get("audits", {}).values()
        if a.get("scoreDisplayMode") == "manual"
    ]

    return {
        "ok": True,
        "lighthouse_version": lhr.get("lighthouseVersion"),
        "final_url": lhr.get("finalDisplayedUrl") or lhr.get("finalUrl"),
        "scores": scores,
        "speed_metrics": metrics,
        "failed_audits": failed,
        "manual_checks": manual,
    }


def check_lighthouse_psi(target, strategy, key=None):
    params = [("url", target), ("strategy", strategy)]
    params += [("category", c) for c in CATEGORIES]
    if key:
        params.append(("key", key))
    url = f"{PSI_ENDPOINT}?{urllib.parse.urlencode(params)}"
    try:
        raw = fetch_json(url, timeout=180)
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", "replace")[:300]
        return {"ok": False, "source": "psi", "reason": f"HTTP {exc.code}", "detail": detail}
    except Exception as exc:
        return {"ok": False, "source": "psi", "reason": f"{type(exc).__name__}: {exc}"}

    out = _shape_lighthouse(raw.get("lighthouseResult", {}))
    out["source"] = "PageSpeed Insights API"
    out["strategy"] = strategy
    return out


def check_lighthouse_cli(target, strategy):
    if not shutil.which("lighthouse"):
        return {"ok": False, "source": "cli", "reason": "lighthouse 명령을 찾지 못했습니다."}

    tmp = tempfile.NamedTemporaryFile(suffix=".json", delete=False)
    tmp.close()
    cmd = [
        "lighthouse", target, "--quiet", "--output=json", f"--output-path={tmp.name}",
        "--only-categories=" + ",".join(CATEGORIES),
        "--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage --disable-gpu",
    ]
    if strategy == "desktop":
        cmd.append("--preset=desktop")
    try:
        subprocess.run(cmd, capture_output=True, timeout=300, check=False)
        with open(tmp.name, encoding="utf-8") as f:
            raw = json.load(f)
    except Exception as exc:
        return {"ok": False, "source": "cli", "reason": f"{type(exc).__name__}: {exc}"}

    if not raw.get("categories") or all(c.get("score") is None for c in raw["categories"].values()):
        return {"ok": False, "source": "cli",
                "reason": "브라우저가 페이지를 열지 못했습니다. 방화벽이나 프록시를 확인합니다."}

    out = _shape_lighthouse(raw)
    out["source"] = "로컬 lighthouse CLI"
    out["strategy"] = strategy
    return out


def check_lighthouse(target, strategy, key):
    first = check_lighthouse_psi(target, strategy, key)
    if first.get("ok"):
        return first
    second = check_lighthouse_cli(target, strategy)
    if second.get("ok"):
        second["psi_failure"] = first.get("reason")
        return second
    return {"ok": False, "psi": first, "cli": second}


# ---------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url", nargs="?", help="검사할 공개 URL")
    ap.add_argument("--html-file", default=None, help="로컬 HTML 파일 경로(문법만 검사)")
    ap.add_argument("--css-file", default=None, help="로컬 CSS 파일 경로(문법만 검사)")
    ap.add_argument("--js-file", nargs="+", default=None,
                    help="로컬 JavaScript 파일 경로(여러 개 허용)")
    ap.add_argument("--strategy", choices=["mobile", "desktop"], default="mobile")
    ap.add_argument("--psi-key", default=None, help="PageSpeed Insights API 키")
    ap.add_argument("--skip", action="append", default=[],
                    choices=["html", "css", "js", "lighthouse"], help="건너뛸 검사")
    ap.add_argument("--out", default=None, help="결과 JSON을 저장할 경로")
    args = ap.parse_args()

    local_mode = bool(args.html_file or args.css_file or args.js_file)
    if not args.url and not local_mode:
        ap.error("URL 또는 --html-file/--css-file/--js-file 중 하나는 있어야 합니다.")

    target = args.url or ""
    if target and not target.startswith(("http://", "https://")):
        target = "https://" + target

    report = {"target": target or None, "strategy": args.strategy, "local_mode": local_mode}

    if local_mode:
        report["html"] = (check_html(None, args.html_file) if args.html_file
                          else {"skipped": True})
        report["css"] = (check_css(None, args.css_file) if args.css_file
                         else {"skipped": True})
        if "js" in args.skip:
            report["js"] = {"skipped": True}
        elif args.js_file:
            report["js"] = check_js(local_paths=args.js_file)
        else:
            report["js"] = {"skipped": True}
        report["lighthouse"] = {
            "ok": False,
            "reason": "로컬 파일은 Lighthouse 로 측정할 수 없습니다. 인터넷에 올린 뒤 URL 로 다시 실행합니다.",
        }
    else:
        report["html"] = {"skipped": True} if "html" in args.skip else check_html(target)
        report["css"] = {"skipped": True} if "css" in args.skip else check_css(target)
        # URL 모드에서도 --js-file이 오면 그 파일들을 검사합니다.
        if "js" in args.skip:
            report["js"] = {"skipped": True}
        elif args.js_file:
            report["js"] = check_js(local_paths=args.js_file)
        else:
            report["js"] = check_js(target_url=target)
        report["lighthouse"] = ({"skipped": True} if "lighthouse" in args.skip
                                else check_lighthouse(target, args.strategy, args.psi_key))

    text = json.dumps(report, ensure_ascii=False, indent=2)
    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"저장 완료: {args.out}")
    print(text)


if __name__ == "__main__":
    sys.exit(main())
