# esg.html / styles.css / script.js 로컬 검사 보고서

검사 주소: 로컬 파일 (`esg.html`, `styles.css`, `script.js`, `scroll-reveal.js`)
검사 기준: 로컬 파일 모드 (Lighthouse 미실행 — 공개 URL 필요)
검사일: 2026-08-13

이 보고서는 `docs/2. esg 경영 [검사 보고서]/웹성능+표준+개선+프롬프트-esg.md`에 따라 `esg.html`을 성능·표준 개선한 **직후**, 아직 커밋·배포되지 않은 로컬 상태를 검사한 결과다. 이전 배포본 검사(데스크톱 47점대~54점/모바일·태블릿 55점)와 직접 비교할 수 있는 Lighthouse 점수는 이번에 측정하지 못했다. 배포 후 URL 기준으로 다시 검사해야 실제 점수 변화를 확인할 수 있다.

## 한눈에 보기

| 항목 | 결과 | 판정 |
| --- | --- | --- |
| HTML 문법 (esg.html) | 오류 0건, 경고 0건 | 통과 |
| CSS 문법 (styles.css) | 확인 실패 | 파일 크기(114KB)로 W3C Validator 요청 URI 초과 |
| JS 린트 (script.js) | 오류 0건, 경고 0건 | 통과 |
| JS 린트 (scroll-reveal.js) | 오류 2건, 경고 0건 | 고칠 것 있음 (실질적 결함 아님) |
| 성능(Lighthouse) | 측정 안 함 | 로컬 파일은 측정 불가 |

기존 검사에서 보고됐던 HTML 오류 1건(`div[aria-label]`)과 경고 다수(void 요소 trailing slash)가 이번 검사에서 **0건**으로 사라졌다. 남은 것은 `scroll-reveal.js`의 브라우저 전역 인식 오류 2건뿐이며, 실제 버그는 아니다.

## 1 - HTML 문법 (esg.html)

오류 없음, 경고 없음.

이전 배포본 검사에서 지적됐던 항목이 모두 해소됐다.
- `div[aria-label]` 오류(62행): 이미 `role="group"`이 지정돼 있어 W3C 규칙을 만족한다.
- void 요소 trailing slash 경고(`meta`, `link`, `img`, `br`, `input` 등 19곳): 이번 작업에서 `/>` → `>`로 전량 정리했다.

## 2 - CSS 문법 (styles.css)

이번 로컬 검사 도구는 CSS 내용을 URL 쿼리로 W3C CSS Validator(Jigsaw)에 전달하는데, `styles.css`가 114KB로 너무 커서 `HTTP 414 Request-URI Too Large`로 실패했다. **확인 실패**로 남긴다.

참고로 배포본 대상 이전 검사(PageSpeed 연계 스킬)에서는 같은 파일이 `오류 0건, 경고 28건, valid: true`로 나온 바 있다. 이번 작업에서 CSS 선택자 확장(`> picture > img` 추가)과 색상 값 교체만 했고 문법 자체를 건드리는 수정은 없었으므로, 문법 유효성 자체가 나빠졌을 가능성은 낮다. 정확한 확인은 배포 후 URL 기준 재검사로 하는 것이 안전하다.

## 3 - JavaScript 린트

검사 세트: ESLint recommended

### script.js — 오류 없음, 경고 없음

이전 배포본 검사에서 지적됐던 `initEntranceAnimations`(미사용 함수, `no-unused-vars`)와 `gsap`/`ScrollTrigger` 미정의(`no-undef`) 오류가 모두 사라졌다. 이는 미사용 GSAP 진입 애니메이션 코드가 삭제되고, 이번 작업에서 그 코드가 참조하던 CDN 스크립트 태그도 `esg.html`에서 함께 제거했기 때문이다.

### scroll-reveal.js — 오류 2건

| 파일 | 줄:열 | 규칙 | 무엇이 잘못됐는가 | 어떻게 고치는가 |
| --- | --- | --- | --- | --- |
| scroll-reveal.js | 63:24 | `no-undef` | 브라우저 API `IntersectionObserver`를 선언 없이 사용 (`'IntersectionObserver' is not defined.`) | ESLint 설정에 브라우저 환경(`env: browser`)을 켜면 사라진다. 실행 오류가 아니라 모든 최신 브라우저가 기본 제공하는 전역 API다. |
| scroll-reveal.js | 108:32 | `no-undef` | 브라우저 API `MutationObserver`를 선언 없이 사용 (`'MutationObserver' is not defined.`) | 위와 동일. |

두 건 모두 ESLint 기본(`recommended`) 세트가 브라우저 전역을 모른 채 검사해서 나오는 오탐이며, 실제 코드 결함이 아니다. 이 스크립트가 현재 페이지의 스크롤 등장 애니메이션(hover/entrance 효과)을 담당하는 코드이므로 수정하지 않았다.

## 4 - 성능

로컬 파일이라 Lighthouse를 실행하지 못했다. 이번 작업에서 적용한 성능 개선(이미지 WebP 전환 89.6% 용량 절감, LCP preload/fetchpriority, 이미지 width/height 지정, 미사용 GSAP 스크립트 제거)의 실측 점수는 **배포 후 URL 기준 재검사가 필요**하다.

## 5 - 접근성

자동 문법·린트 검사 범위 밖이라 이번 로컬 검사에는 포함되지 않았다. 이번 작업에서 손댄 부분은 다음과 같다.
- `.story-meta`/`.esg-card-grid .story-meta`/`.esg-news-grid .story-meta`의 시간·메타 텍스트 색상을 `#9ca3af`(대비비 약 2.5:1, WCAG AA 미달)에서 `var(--muted)` `#6d7482`(대비비 약 4.7:1, AA 충족)로 교체했다.

키보드 이동, 포커스 순서 등은 이번 검사로도 확인되지 않으므로 별도 수동 확인이 필요하다.

## 6 - 검색 최적화와 권장 사항

로컬 파일 모드에서는 측정하지 않는다(Lighthouse 전용 항목).

## 7 - 먼저 할 일

1. **배포 후 URL 기준 재검사** — 이번 로컬 검사로 HTML·JS 문법 개선은 확인됐지만, 실제 사용자가 겪는 Lighthouse 성능·CLS·LCP 점수는 배포본에 반영된 뒤에만 측정할 수 있다.
2. **CSS 검사 재시도** — 이번엔 파일 크기 때문에 확인 실패했다. URL 기준 검사(POST 방식 W3C 검사)나 파일을 나눠서 재시도하면 정확한 경고 28건의 위치를 알 수 있다.
3. (선택) `scroll-reveal.js`의 `no-undef` 2건은 ESLint 설정에 `env: { browser: true }`를 추가하면 없앨 수 있으나, 검사 도구 설정 문제이지 코드 결함이 아니므로 급하지 않다.

## 검사 도구와 한계

이 보고서는 W3C Nu HTML Checker와 ESLint(recommended)를 로컬 파일에 대해 실행한 결과다. CSS는 파일 크기 제약으로 이번엔 확인하지 못했다. Lighthouse(성능·접근성 자동 점수·SEO·Best Practices)는 공개 URL이 있어야 측정되므로, 이번 작업으로 개선한 성능 지표(이미지 용량, LCP, CLS, 렌더 차단)의 실제 점수 변화는 배포 후 별도로 확인해야 한다.
