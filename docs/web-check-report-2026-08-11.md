# kiwik 프로젝트 로컬 파일 검사 보고서

검사 대상: 로컬 파일 (HTML 7개, CSS 3개, JS 1개)
검사 기준: 로컬 파일 모드 (Lighthouse 미실행)
검사일: 2026-08-11

## 한눈에 보기

| 파일 | HTML 오류 | HTML 경고 | 판정 |
| --- | --- | --- | --- |
| index.html | 5 | 59 | 고칠 것 있음 |
| sub.html | 4 | 29 | 고칠 것 있음 |
| hyein.html | 2 | 54 | 고칠 것 있음 |
| pulmuone-newsroom/esg.html | 6 | 0 | 고칠 것 있음 |
| pulmuone-newsroom/multimedia.html | 2 | 0 | 고칠 것 있음 |
| pulmuone-newsroom/newsroom.html | 3 | 0 | 고칠 것 있음 |
| pulmuone-newsroom/resources.html | 16 | 0 | 고칠 것 있음 |

| CSS 파일 | 오류 | 판정 |
| --- | --- | --- |
| assets/css/custom.css | 0 | 통과 |
| assets/css/fonts.css | 0 | 통과 |
| assets/css/style.css | - | 확인 실패 (W3C 검증 서버 오류) |

| JS 파일 | 오류 | 경고 | 판정 |
| --- | --- | --- | --- |
| assets/js/main.js | 77건 (그중 16건은 도구 한계로 인한 오탐 추정) | 0 | 고칠 것 있음 |

가장 먼저 고칠 것: resources.html의 `<time>` 형식 오류 16건이 실제 결함 중 건수가 가장 많다. index.html·sub.html·hyein.html에서 반복되는 `@theme`/`@utility` 오류와 `<img ... />` 경고, main.js의 `no-undef` 16건은 검사기 한계로 인한 오탐이며 실제 버그가 아니다 — 아래에서 근거를 설명한다.

## 1 - HTML 문법

### 공통 패턴: index.html · sub.html · hyein.html — Tailwind v4 CSS-in-HTML 문법

이 세 파일은 `<style type="text/tailwindcss">` 블록 안에 Tailwind v4 CDN 빌드 전용 문법(`@theme`, `@utility`)을 쓴다. W3C Nu 검사기는 이 블록을 표준 CSS로 해석하려다 실패한다.

| 줄 | 무엇이 잘못됐는가 | 어떻게 고치는가 |
| --- | --- | --- |
| index.html:19 / sub.html:16 / hyein.html:14 | `style` 태그의 `type="text/tailwindcss"`는 표준 값이 아님 ("The only allowed value for the type attribute for the style element is text/css") | Tailwind CDN 빌드가 요구하는 값이라 실제로는 고칠 필요 없음 |
| index.html:20,148 / sub.html:23,91 / hyein.html:15 | `@theme` at-rule을 인식 못 함 ("CSS: Unrecognized at-rule @theme") | Tailwind v4 CDN 문법이며 브라우저에서는 정상 동작 |
| index.html:175,179 / sub.html:106 | `@utility` at-rule을 인식 못 함 | 위와 동일 |

→ 이 유형(총 9건)은 **고칠 대상이 아니다.** W3C 검사기가 아직 모르는 최신 CSS 확장 문법이며 브라우저 렌더링에는 영향이 없다.

### esg.html — 오류 6건

| 줄 | 무엇이 잘못됐는가 | 어떻게 고치는가 |
| --- | --- | --- |
| 7, 9 | `div` 요소에 `role` 없이 `aria-label`을 붙임 | `role="group"` 등 의미 있는 role을 추가하거나, `aria-label` 대신 화면에 숨긴 텍스트로 대체 |
| 20 (4곳) | `<time>` 내용 "2026.07.30"이 datetime 형식과 안 맞음 | `<time datetime="2026-07-30">2026.07.30</time>`처럼 `datetime` 속성을 ISO 형식으로 채움 |

### multimedia.html — 오류 2건

| 줄 | 무엇이 잘못됐는가 | 어떻게 고치는가 |
| --- | --- | --- |
| 4 | `div`에 role 없이 `aria-label` | esg.html과 동일하게 처리 |
| 5 | `role="tab"`에 대응하는 `role="tabpanel"`이 없음 | 탭 콘텐츠 영역에 `role="tabpanel"`과 `aria-labelledby` 추가 |

### newsroom.html — 오류 3건

| 줄 | 무엇이 잘못됐는가 | 어떻게 고치는가 |
| --- | --- | --- |
| 13, 26 | `div`에 role 없이 `aria-label` (2건) | esg.html과 동일하게 처리 |
| 53 | `role="tab"`에 대응하는 `role="tabpanel"` 없음 | multimedia.html과 동일하게 처리 |

### resources.html — 오류 16건

| 줄 | 무엇이 잘못됐는가 | 어떻게 고치는가 |
| --- | --- | --- |
| 5, 6(×15) | `<time>` 내용이 datetime 형식과 안 맞음(같은 유형 16건, 예: "2026년 8월 10일") | `<time datetime="2026-08-10">2026년 8월 10일</time>`처럼 `datetime` 속성 추가 |

### 경고 — index.html(59건)·sub.html(29건)·hyein.html(54건)

| 유형 | 내용 | 권고 |
| --- | --- | --- |
| Trailing slash on void elements (대부분) | `<img ... />`처럼 self-closing 슬래시를 씀 | HTML5에서는 효과가 없는 표기지만 렌더링에는 문제 없음. 급하지 않음 |
| Article lacks heading (sub.html 1건, hyein.html 다수) | `<article>` 안에 h2~h6 제목이 없음 | 각 article에 제목 요소를 추가하면 스크린리더 탐색성 개선 |
| button이 role=option의 자손 (hyein.html 2건) | 언어 선택 옵션에 `<button>`을 씀 | `role="option"`의 자손으로는 button 대신 일반 텍스트나 `role="presentation"` 요소 권장 |
| 주석 안 이중 하이픈 (index.html·sub.html 각 1건) | 주석에 `--`가 포함됨 | 급하지 않음. 필요하면 `—`(엠대시)로 대체 |

## 2 - CSS 문법

| 파일 | 결과 |
| --- | --- |
| assets/css/custom.css | 오류 없음 |
| assets/css/fonts.css | 오류 없음 |
| assets/css/style.css | 확인 실패 — W3C CSS Validator(Jigsaw)가 모든 요청에 `java.lang.IllegalStateException: Reader used`로 HTTP 500을 반환함. 트리비얼한 테스트 CSS로도 재현되어 파일 문제가 아니라 검증 서버 자체 장애로 판단. 서버 복구 후 재검사 필요 |

## 3 - JavaScript 린트

검사 세트: ESLint recommended + 프로젝트 지침(`no-var` 오류 처리)

### 오류 77건 — assets/js/main.js

| 규칙 | 건수 | 무엇이 잘못됐는가 | 어떻게 고치는가 |
| --- | --- | --- | --- |
| no-var | 61 | `var`로 변수 선언 | 재할당 여부에 따라 `let` 또는 `const`로 교체 |
| no-undef | 16 | `gsap`·`ScrollTrigger`·`ScrollToPlugin`·`history`가 선언 없이 쓰임 | **오탐으로 판단.** index.html 703~705행이 `<script src="...gsap...">`로 CDN을 먼저 로드하므로 브라우저에서는 정상 동작. `history`도 브라우저 내장 전역. 이 스킬 ESLint 설정의 전역(globals) 목록에 두 이름이 빠져 생긴 오탐이며 main.js 코드 자체의 결함이 아님 |

no-var 61건은 파일 전체에 흩어져 있어 규칙 단위로 묶었다(개별 줄 번호는 `scripts/check.mjs` 재실행 결과 JSON에서 확인 가능).

## 4~6 - 성능·접근성·검색 최적화

로컬 파일 모드라 Lighthouse를 실행하지 않았다. 인터넷에 올린 뒤 URL로 다시 검사해야 확인 가능하다.

## 7 - 먼저 할 일

1. **resources.html의 `<time>` 태그 16건**에 `datetime` 속성을 ISO 형식(`YYYY-MM-DD`)으로 채운다 — 실제 오류 중 건수가 가장 많다.
2. **esg.html·multimedia.html·newsroom.html의 `aria-label`/`role=tab` 접근성 오류(총 5건)**를 고친다 — 스크린리더 사용자의 실제 탐색 경험에 영향을 준다.
3. **main.js의 `var` 61건**을 `let`/`const`로 교체한다 — 실행 동작에는 영향 없지만 스코프 관련 버그를 예방한다.

Tailwind `@theme`/`@utility` 관련 검사기 오탐, void element trailing slash 경고, JS `no-undef` 오탐(gsap 등)은 실제 결함이 아니므로 수정 대상에서 제외를 권장한다.

## 검사 도구와 한계

이 보고서는 W3C Nu HTML Checker, W3C CSS Validator(일부 실패), ESLint(recommended + no-var)로 로컬 파일을 검사한 결과다. Lighthouse는 로컬 파일에 적용할 수 없어 실행하지 않았다. 이 스킬의 ESLint 전역(globals) 목록에 없는 CDN 라이브러리 전역(gsap 등)은 no-undef 오탐을 일으킬 수 있어 실제 코드(스크립트 로드 순서)와 대조해 판단했다. style.css는 W3C 검증 서버 자체 장애로 결과를 얻지 못해 재검사가 필요하다.
