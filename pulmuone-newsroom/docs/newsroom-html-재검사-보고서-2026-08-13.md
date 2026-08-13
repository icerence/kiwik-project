# 풀무원 뉴스룸(newsroom.html) 재검사 보고서

검사 대상: 로컬 파일 `newsroom.html` / `styles.css` / `script.js` / `scroll-reveal.js` (성능·표준 개선 수정 직후, 아직 배포 전)
검사 기준: 문법·린트만 (Lighthouse는 로컬 파일이라 제외 — 배포 후 URL로 재실행 필요)
검사일: 2026-08-13
검사 도구: W3C Nu HTML Checker 26.8.8 / W3C CSS Validator(Jigsaw) / ESLint recommended

## 한눈에 보기

| 항목 | 결과 | 판정 |
| --- | --- | --- |
| HTML 문법 | 오류 0건, 경고 6건 | 통과 |
| CSS 문법 | 오류 0건, 경고 18건 | 통과 |
| JS 린트 | 오류 2건, 경고 0건 | 고칠 것 있음(모두 scroll-reveal.js, 브라우저 전역 오탐) |
| 성능(Lighthouse) | 확인 실패 | 로컬 파일은 측정 불가 — 배포 후 URL 필요 |

이전 검사 보고서(배포된 구버전 기준: HTML 오류 1건·경고 25건)와 비교하면 **HTML 오류 1건, 경고 25건이 모두 해소**됐습니다. 남은 6건은 이번에 새로 추가한 CLS 방지용 스켈레톤 카드가 원인이며, 화면에는 보이지 않는(`aria-hidden`) 장식 요소라 심각도가 낮습니다.

## 1 - HTML 문법

### 오류 0건

### 경고 6건

| 줄 | 내용 | 권고 |
| --- | --- | --- |
| 222, 231, 240, 249, 258, 267 | `<article>`에 제목(`h2`~`h6`)이 없음 (`Article lacks heading. Consider using "h2"–"h6" elements...`) | 데이터 로딩 중 레이아웃 공간을 미리 확보하려고 넣은 스켈레톤 카드입니다. `aria-hidden="true"`로 스크린리더에서는 이미 제외되어 있고, 실제 뉴스 데이터가 로드되면 자동으로 제거되어 화면에 남지 않습니다. 제목을 넣지 않아도 기능상 문제는 없습니다. |

## 2 - CSS 문법

오류 없음. 경고 18건은 모두 이번 수정 이전부터 있던 것으로, 제가 만진 부분(색상 토큰 2개, 스켈레톤 스타일)과는 무관합니다.

| 줄 | 내용 |
| --- | --- |
| 53 | `clip` 속성은 폐지 예정(deprecated) — `sr-only` 클래스의 스크린리더 전용 숨김 기법으로, 널리 쓰이는 관용구입니다 |
| 304~306, 985~986, 1067~1068 등 같은 유형 다수 | `-webkit-box`·`-webkit-line-clamp`·`-webkit-box-orient`는 브라우저 접두사(vendor extension) — 2줄 요약(말줄임) 표시에 쓰는 표준 관용구입니다 |
| 663 | `pointer-events: auto`가 아직 공식 명세 값은 아니지만 대부분 브라우저가 지원 |

## 3 - JavaScript 린트

검사 세트: ESLint recommended

### 오류 2건

| 파일 | 줄:열 | 규칙 | 무엇이 잘못됐는가 | 어떻게 고치는가 |
| --- | --- | --- | --- | --- |
| `scroll-reveal.js` | 63:24 | `no-undef` | `IntersectionObserver`가 선언되지 않았다고 감지됨 | 브라우저 전역 API라 실제 오류는 아닙니다. ESLint 환경 설정에 `browser: true`를 켜면 사라지는 오탐입니다. |
| `scroll-reveal.js` | 108:32 | `no-undef` | `MutationObserver`가 선언되지 않았다고 감지됨 | 위와 동일 |

`script.js`는 **오류 0건, 경고 0건**입니다. 이전 검사에서 지적됐던 `initEntranceAnimations` 미사용 함수, `gsap`/`ScrollTrigger`/`IntersectionObserver` 미선언, `prefer-const`(`indicator`) 경고가 모두 해소됐습니다.

## 4 - 성능

로컬 파일이라 Lighthouse를 실행하지 못했습니다. **배포(푸시) 후 실제 URL로 다시 검사해야 정확한 점수가 나옵니다.**

## 검사 도구와 한계

이 보고서는 W3C Nu HTML Checker, W3C CSS Validator, ESLint(recommended) 결과를 옮긴 것입니다. `scroll-reveal.js`의 `no-undef` 2건은 실제 코드 결함이 아니라 ESLint에 브라우저 전역을 알려주지 않아 생긴 오탐으로 보이며, 별도 ESLint 설정 파일이 없는 이번 검사 방식의 한계입니다. CSS 경고 18건은 스크린리더 전용 숨김·2줄 말줄임처럼 실무에서 널리 쓰는 관용구로, 고칠 필요가 낮다고 판단했습니다. 문법·린트 검사는 코드가 규칙에 맞는지만 보므로, 통과했다고 해서 화면이 의도대로 보인다는 뜻은 아닙니다.
