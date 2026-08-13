# company5.html 웹 품질 검사 보고서

- 대상: <https://icerence.github.io/kiwik-project/company5.html>
- 측정 기준: 데스크톱
- 검사 일시: 2026-08-13
- 검사 도구: W3C Nu HTML Checker, W3C CSS Validator, ESLint(recommended), Google PageSpeed Insights API (Lighthouse 13.4.1)

## 요약

| 항목 | 결과 |
| --- | --- |
| HTML 문법 | 오류 3건, 경고 42건 |
| CSS 문법 | 오류 0건, 경고 10건 |
| JavaScript 린트 | 오류 511건, 경고 1,084건 |
| Lighthouse 성능 | 95점 |
| Lighthouse 접근성 | 95점 |
| Lighthouse 권장사항 | 100점 |
| Lighthouse SEO | 100점 |

## Lighthouse 지표

| 지표 | 측정값 | 평가 |
| --- | --- | --- |
| First Contentful Paint | 0.6초 | 양호 |
| Speed Index | 0.9초 | 양호 |
| Largest Contentful Paint | 0.8초 | 양호 |
| Total Blocking Time | 0ms | 양호 |
| Cumulative Layout Shift | 0.117 | 개선 필요 |

## HTML 문법

### 오류 1 — `style` 요소의 `type` 값

- 위치: 18행 33열
- 원인: `<style type="text/tailwindcss">`는 W3C HTML 규격에서 허용하지 않는 값입니다. 표준 값은 `text/css`이며, 일반 CSS에서는 `type` 속성을 생략할 수 있습니다.
- 조치: 브라우저용 Tailwind 지시문을 사용하는 방식에서 발생하는 오류입니다. 배포 시 Tailwind CSS를 미리 컴파일하고 `<style>`에는 결과 CSS만 넣으면 해소됩니다.

### 오류 2 — `@theme` 규칙

- 위치: 19행 10열
- 원인: `@theme`은 Tailwind 전용 지시문이라 W3C CSS 파서가 인식하지 못합니다.
- 조치: 런타임 Tailwind를 유지하는 한 예상되는 검사 결과입니다. 사전 컴파일된 CSS 배포로 전환하면 해결됩니다.

### 오류 3 — 역할 없는 `div`의 `aria-label`

- 위치: 95행 73열, `.site-header-dropdown__inner`
- 원인: 의미론적 역할이 없는 `div`에는 `aria-label`을 지정할 수 없습니다.
- 조치: 실제 내비게이션 요소라면 `<nav aria-label="전체 하위 메뉴">`로 바꾸거나, 컨테이너에 적절한 `role="navigation"`을 추가합니다.

### 경고 42건 — 빈 요소 닫는 슬래시

`meta`, `link`, `img`, `input`, `hr`, `br`의 `/>` 표기에서 발생했습니다. HTML5에서는 기능상 문제는 없습니다. W3C 경고를 없애려면 `>`로 통일합니다.

## CSS 문법

W3C CSS Validator 기준 오류는 없습니다. 경고 10건은 Tailwind 지시문·사용자 정의 속성 해석과 관련되어 일반 CSS 문법 오류는 확인되지 않았습니다.

## JavaScript 린트

ESLint에서 오류 511건, 경고 1,084건이 검출됐습니다. 대부분은 GSAP, ScrollTrigger, Tailwind 브라우저 런타임 등의 외부·압축 파일에 기본 규칙을 적용하면서 발생했습니다.

- `gsap.min.js`: 오류 242건
- 주요 규칙: `no-var`, `no-undef`, `eqeqeq`

외부 라이브러리 파일을 수정할 필요는 없습니다. 자체 스크립트만 별도의 ESLint 대상에 두고, 브라우저 환경 전역 객체를 ESLint 환경 설정에 선언해 실제 프로젝트 코드의 이슈를 분리하는 것을 권장합니다.

## Lighthouse 개선 항목

1. **CLS 0.117, 레이아웃 이동 2건**
   - 모든 `<img>`에 실제 비율의 `width`, `height`를 지정합니다.
   - CSS로 이미지 또는 동적 영역을 조절하면 `aspect-ratio`나 예약된 컨테이너 높이를 지정합니다.
   - 웹폰트 교체로 인한 이동은 `font-display: swap`과 대체 폰트 메트릭 조정으로 줄입니다.

2. **이미지 전달 최적화 — 약 700KiB 절감 가능**
   - 표시 크기에 맞춘 이미지 변형을 제공하고, WebP 또는 AVIF 형식을 검토합니다.
   - 첫 화면의 LCP 이미지에는 지연 로딩을 적용하지 않고, 나머지 이미지는 `loading="lazy"`로 유지합니다.

3. **색상 대비 부족**
   - 낮은 대비의 텍스트·배경 조합을 찾아 WCAG AA 기준(일반 텍스트 4.5:1, 큰 텍스트 3:1) 이상으로 조정합니다.

4. **렌더 차단 요청 — 약 300ms 절감 가능**
   - 최초 화면에 필요하지 않은 스크립트에 `defer`를 적용합니다.
   - 공통 CSS와 웹폰트는 핵심 범위를 우선 로드하고, 비핵심 리소스는 지연시킵니다.

5. **캐시 수명 — 약 1,492KiB 재방문 전송량 절감 가능**
   - 이미지·폰트·CSS·JS 정적 파일에 장기 캐시 헤더를 지정하고 파일명 해시 또는 버전 쿼리로 갱신을 관리합니다.

6. **사용하지 않는 JavaScript — 약 29KiB**
   - 이 페이지에서 사용하지 않는 GSAP 플러그인·공통 모듈을 조건부로 불러오거나 페이지별로 분리합니다.

## 추가 수동 확인

자동 검사는 키보드 탐색과 화면 낭독기 이용성을 완전히 평가하지 못합니다. 실제 브라우저에서 헤더 메뉴·검색창·하위 메뉴를 키보드만으로 조작하고, 포커스 표시와 메뉴 열림·닫힘 상태 안내를 확인해야 합니다.

## 권장 적용 순서

1. 이미지 치수와 종횡비를 정리해 CLS를 낮춥니다.
2. 큰 이미지의 표시 크기와 형식을 최적화합니다.
3. 색상 대비와 메뉴 컨테이너의 ARIA 역할을 보완합니다.
4. 렌더 차단 리소스와 불필요한 스크립트를 지연 로딩합니다.
5. 배포 후 동일한 데스크톱 조건에서 재검사합니다.

이번 검사는 보고서 생성만 수행했으며, 사이트 소스는 변경하지 않았습니다.
