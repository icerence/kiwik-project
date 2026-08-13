# company7.html 웹 품질 검사 보고서

- 대상: <https://icerence.github.io/kiwik-project/company7.html>
- 측정 기준: 데스크톱
- 검사 일시: 2026-08-13
- 검사 도구: W3C Nu HTML Checker, W3C CSS Validator, ESLint(recommended), Google PageSpeed Insights API (Lighthouse 13.4.1)

## 요약

| 항목 | 결과 |
| --- | --- |
| HTML 문법 | 오류 4건, 경고 25건 |
| CSS 문법 | 오류 0건, 경고 10건 |
| JavaScript 린트 | 오류 511건, 경고 1,084건 |
| Lighthouse 성능 | 92점 |
| Lighthouse 접근성 | 97점 |
| Lighthouse 권장사항 | 96점 |
| Lighthouse SEO | 100점 |

## Lighthouse 지표

| 지표 | 측정값 | 평가 |
| --- | --- | --- |
| First Contentful Paint | 0.7초 | 양호 |
| Speed Index | 1.0초 | 양호 |
| Largest Contentful Paint | 1.4초 | 양호 |
| Total Blocking Time | 0ms | 양호 |
| Cumulative Layout Shift | 0.115 | 개선 필요 |

## HTML 문법

### 오류 1 — `style` 요소의 `type` 값

- 위치: 18행 33열
- 원인: `<style type="text/tailwindcss">`는 W3C HTML 표준에서 허용하지 않는 값입니다.
- 조치: Tailwind CSS를 배포 전에 컴파일하고 `<style>`에는 결과 CSS만 넣으면 해결됩니다.

### 오류 2 — `@theme` 규칙

- 위치: 19행 10열
- 원인: `@theme`은 Tailwind 전용 지시문이므로 W3C CSS 파서가 인식하지 못합니다.
- 조치: 사전 컴파일 CSS 배포로 전환할 때 함께 해소됩니다.

### 오류 3 — 역할 없는 `div`의 `aria-label`

- 위치: 152행 73열, `.site-header-dropdown__inner`
- 원인: 의미론적 역할이 없는 `div`에는 `aria-label`을 지정할 수 없습니다.
- 조치: 메뉴 영역이면 `<nav aria-label="전체 하위 메뉴">`를 사용하거나 `role="navigation"`을 지정합니다.

### 오류 4 — 탭에 대응하는 탭 패널 없음

- 위치: 275행 129열, `role="tab"` 버튼
- 원인: 활성 탭에는 연결된 `role="tabpanel"` 요소가 필요합니다.
- 조치: 각 탭에 고유 `id`와 `aria-controls="패널ID"`를 추가하고, 대응 콘텐츠에 `role="tabpanel"`, `id`, `aria-labelledby="탭ID"`를 지정합니다. 단순 필터 버튼이라면 `role="tab"` 대신 일반 버튼과 `aria-pressed`를 사용합니다.

### 경고 25건 — 빈 요소의 닫는 슬래시

`meta`, `link`, `img`, `input`, `hr`, `br`의 `/>` 표기에서 발생했습니다. HTML5 기능상 영향은 없으며 W3C 경고를 없애려면 `>`로 통일하면 됩니다.

## CSS 문법

W3C CSS Validator 기준 오류는 없습니다. 경고 10건은 Tailwind 지시문 및 사용자 정의 속성의 해석과 관련되어 일반 CSS 문법 오류는 확인되지 않았습니다.

## JavaScript 린트

ESLint에서 오류 511건, 경고 1,084건이 검출됐습니다. 대부분은 GSAP·ScrollTrigger·Tailwind 브라우저 런타임 등 외부 압축 코드에 기본 린트 규칙을 적용한 결과입니다.

- `gsap.min.js`: 오류 242건
- 주요 규칙: `no-var`, `no-undef`, `eqeqeq`

외부 라이브러리를 수정할 필요는 없습니다. 자체 스크립트만 별도 검사 대상으로 분리하고, 브라우저 환경 전역 객체를 ESLint 설정에 선언해 실제 코드 이슈를 분리하는 방식을 권장합니다.

## Lighthouse 개선 항목

1. **렌더 차단 요청 — 약 580ms 절감 가능**
   - 첫 화면에 필요하지 않은 스크립트에 `defer`를 적용합니다.
   - 핵심 CSS만 우선 적용하고 폰트·비핵심 스타일은 지연시킵니다.

2. **이미지 전달 최적화 — 약 712KiB 절감 가능**
   - 표시 크기에 맞춘 이미지 변형을 제공하고 WebP 또는 AVIF 형식을 검토합니다.
   - 첫 화면 LCP 이미지에는 지연 로딩을 적용하지 않고, 화면 밖 이미지만 `loading="lazy"`로 둡니다.

3. **CLS 0.115, 레이아웃 이동 3건**
   - 모든 `<img>`에 실제 비율의 `width`, `height`를 지정합니다.
   - CSS에서 이미지를 조절하는 컨테이너에는 `aspect-ratio`를 지정합니다.
   - 웹폰트 교체에 따른 이동은 `font-display: swap`과 대체 폰트 메트릭 조정으로 줄입니다.

4. **이미지 종횡비 불일치**
   - CSS의 고정 폭·높이와 원본 이미지 비율을 일치시키고, 의도적인 크롭에는 `object-fit`과 컨테이너 비율을 함께 지정합니다.

5. **색상 대비 부족**
   - 낮은 대비의 텍스트·배경 조합을 WCAG AA 기준(일반 텍스트 4.5:1, 큰 텍스트 3:1) 이상으로 조정합니다.

6. **캐시 수명 — 약 1,814KiB 재방문 전송량 절감 가능**
   - 이미지·폰트·CSS·JS 정적 파일에 장기 캐시 헤더를 적용하고, 파일명 해시 또는 버전 쿼리로 갱신을 관리합니다.

7. **사용하지 않는 JavaScript — 약 30KiB**
   - 현재 페이지에서 쓰이지 않는 플러그인·공통 모듈은 조건부로 로드하거나 페이지별로 분리합니다.

## 추가 수동 확인

자동 검사는 키보드 탐색과 화면 낭독기 이용성을 완전히 평가하지 못합니다. 실제 브라우저에서 헤더 메뉴·검색창·보고서 탭을 키보드만으로 조작하고, 포커스 표시 및 탭 변경 시 콘텐츠 안내를 확인해야 합니다.

## 권장 적용 순서

1. 보고서 탭의 ARIA 구조를 패널과 연결합니다.
2. 이미지 치수·종횡비를 정리해 CLS를 낮춥니다.
3. 큰 이미지의 형식과 표시 크기를 최적화합니다.
4. 렌더 차단 리소스와 불필요한 스크립트를 지연 로딩합니다.
5. 색상 대비와 메뉴 컨테이너의 ARIA 역할을 보완한 뒤 재검사합니다.

이번 검사는 보고서 생성만 수행했으며, 사이트 소스는 변경하지 않았습니다.
