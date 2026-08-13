# company4.html 웹 품질 검사 보고서

- 대상: <https://icerence.github.io/kiwik-project/company4.html>
- 측정 기준: 데스크톱
- 검사 일시: 2026-08-13
- 검사 도구: W3C Nu HTML Checker, W3C CSS Validator, ESLint(recommended), Google PageSpeed Insights API (Lighthouse 13.4.1)

## 요약

| 항목 | 결과 |
| --- | --- |
| HTML 문법 | 오류 3건, 경고 26건 |
| CSS 문법 | 오류 0건, 경고 10건 |
| JavaScript 린트 | 오류 511건, 경고 1,084건 |
| Lighthouse 성능 | 90점 |
| Lighthouse 접근성 | 95점 |
| Lighthouse 권장사항 | 96점 |
| Lighthouse SEO | 100점 |

## Lighthouse 지표

| 지표 | 측정값 | 평가 |
| --- | --- | --- |
| First Contentful Paint | 0.6초 | 양호 |
| Speed Index | 0.8초 | 양호 |
| Largest Contentful Paint | 1.6초 | 양호 |
| Total Blocking Time | 10ms | 양호 |
| Cumulative Layout Shift | 0.117 | 개선 필요 |

## HTML 문법

### 오류 1 — `style` 요소의 `type` 값

- 위치: 18행 33열
- 원인: `<style type="text/tailwindcss">`는 W3C HTML 규격에서 허용되지 않는 값입니다. 표준 값은 `text/css`이며, 일반 CSS에서는 `type` 속성 자체를 생략할 수 있습니다.
- 조치: 브라우저용 Tailwind의 처리 방식 때문에 생기는 검사 오류입니다. Tailwind 변환 과정을 빌드 단계로 옮길 수 있다면 `<style>`에 결과 CSS만 두고 `type` 속성은 제거합니다.

### 오류 2 — `@theme` 규칙

- 위치: 19행 10열
- 원인: `@theme`은 Tailwind의 전용 지시문이라 W3C CSS 파서가 인식하지 못합니다.
- 조치: Tailwind 런타임 구성을 유지하는 한 예상되는 경고성 오류입니다. 배포 시 사전 컴파일된 CSS로 전환하면 해소됩니다.

### 오류 3 — 역할 없는 `div`의 `aria-label`

- 위치: 83행 73열, `.site-header-dropdown__inner`
- 원인: 의미론적 역할이 없는 `div`에는 `aria-label`을 지정할 수 없습니다.
- 조치: 하위 메뉴 컨테이너라면 `role="navigation"`과 적절한 `aria-label`을 함께 사용하거나, 해당 레이블을 실제 `<nav aria-label="전체 하위 메뉴">`에 둡니다.

### 경고 26건 — 빈 요소의 닫는 슬래시

`meta`, `link`, `img`, `input`, `hr` 등에 붙은 `/>` 표기에서 발생했습니다. HTML5에서는 닫는 슬래시가 기능에 영향을 주지 않습니다. 팀 포맷 규칙상 유지할 수 있으나, W3C 경고를 없애려면 `>`로 바꿉니다.

## CSS 문법

W3C CSS Validator 기준 오류는 없습니다. 경고 10건은 Tailwind 전용 지시문 및 사용자 정의 속성 해석에서 비롯된 것으로 보이며, 일반 CSS 문법 오류는 확인되지 않았습니다.

## JavaScript 린트

ESLint에서 오류 511건, 경고 1,084건이 검출됐습니다. 대부분은 직접 작성한 페이지 로직보다 외부·압축 라이브러리 코드에 대한 기본 ESLint 규칙 적용 결과입니다.

- `gsap.min.js`: 오류 242건
- `ScrollTrigger` 및 Tailwind 브라우저 런타임, 공통 스크립트에서도 `no-var`, `no-undef`, `eqeqeq` 등이 다수 검출

압축된 외부 파일은 수정 대상에서 제외하는 것이 적절합니다. 프로젝트 코드만 별도 ESLint 설정으로 검사하고, 브라우저 전역 객체(`window`, `document`, `DOMParser`, `CustomEvent` 등)를 환경 설정에 추가하면 실제 자체 코드 이슈를 분리할 수 있습니다.

## Lighthouse 개선 항목

1. **이미지 전송량 축소 — 약 518KiB 절감 가능**
   - 큰 원본 이미지를 표시 크기에 맞춰 재생성하고, 가능하면 WebP 또는 AVIF를 제공합니다.
   - 화면 밖 이미지는 `loading="lazy"`를 사용하되, 첫 화면의 LCP 후보 이미지는 지연 로딩하지 않습니다.

2. **CLS 0.117, 레이아웃 이동 3건**
   - 너비·높이가 없는 모든 `<img>`에 실제 비율의 `width`와 `height`를 지정합니다.
   - CSS에서 이미지 크기를 바꿀 때도 `aspect-ratio` 또는 예약된 컨테이너 높이를 지정합니다.
   - 웹폰트 로딩에 따른 이동은 `font-display: swap`과 대체 폰트 메트릭 조정으로 줄일 수 있습니다.

3. **이미지 종횡비 불일치**
   - CSS의 고정 폭/높이와 원본 이미지 비율을 맞춥니다. `object-fit: cover`를 사용하는 요소도 컨테이너의 `aspect-ratio`를 원본/의도된 크롭 비율에 맞춥니다.

4. **렌더 차단 요청 — 약 320ms 절감 가능**
   - 첫 화면에 꼭 필요하지 않은 스크립트는 `defer`로 로드합니다.
   - 공통 CSS와 폰트는 필요한 범위를 줄이고, 첫 화면 핵심 스타일만 우선 적용합니다.

5. **색상 대비**
   - 낮은 대비의 텍스트와 배경 조합을 찾아 WCAG AA 기준(일반 텍스트 4.5:1, 큰 텍스트 3:1) 이상으로 조정합니다.

6. **캐시 수명 — 약 1,391KiB 재방문 전송량 절감 가능**
   - 정적 이미지·폰트·CSS·JS에 장기 `Cache-Control`을 적용하고, 파일명 해시 또는 버전 쿼리로 갱신을 관리합니다.

7. **사용하지 않는 JavaScript — 약 29KiB**
   - 현재 페이지에서 쓰지 않는 GSAP 플러그인 또는 공통 모듈은 조건부로 불러오거나 페이지별 번들로 분리합니다.

## 추가 확인이 필요한 항목

Lighthouse 자동 검사는 다음을 완전히 판정하지 못합니다. 실제 브라우저에서 키보드만으로 헤더 메뉴·검색창·하위 메뉴를 순회하고, 포커스 표시 및 화면 낭독기 이동을 확인해야 합니다.

## 권장 적용 순서

1. 모든 이미지의 고정 치수·종횡비를 정리해 CLS를 낮춥니다.
2. 큰 이미지 형식과 표시 크기를 최적화합니다.
3. 외부 스크립트와 렌더 차단 리소스를 지연 로딩합니다.
4. 낮은 텍스트 대비와 메뉴 컨테이너의 ARIA 역할을 보완합니다.
5. 수정 배포 후 동일한 데스크톱 조건에서 재검사합니다.

이번 검사는 보고서 생성만 수행했으며, 사이트 소스는 변경하지 않았습니다.
