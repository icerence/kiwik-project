# company.html 모바일 웹 품질 검사 보고서

- 대상: <https://icerence.github.io/kiwik-project/company.html>
- 측정 기준: 모바일 (PageSpeed Insights / Lighthouse 13.4.1)
- 검사일: 2026-08-13
- 검사 도구: W3C Nu HTML Checker, W3C CSS Validator, ESLint(recommended), Google PageSpeed Insights API

## 결과 요약

| HTML | CSS | JavaScript | 성능 | 접근성 | 권장사항 | SEO |
| --- | --- | --- | --- | --- | --- | --- |
| 오류 3 / 경고 18 | 오류 0 / 경고 10 | 오류 511 / 경고 1,084 | 61 | 96 | 96 | 100 |

## Lighthouse 핵심 지표

| FCP | LCP | Speed Index | TBT | CLS |
| --- | --- | --- | --- | --- |
| 2.2초 | 31.6초 | 6.6초 | 220ms | 0.08 |

## 우선 개선 사항

1. **LCP 31.6초 개선이 최우선입니다.** 첫 화면의 대표 이미지가 HTML에서 즉시 발견되도록 하고, LCP 후보에 `loading="lazy"`를 사용하지 않습니다. 필요하면 `fetchpriority="high"`와 이미지 `preload`를 검토합니다.
2. **이미지 최적화로 약 3,906KiB 절감 가능**합니다. 전체 전송량은 5,980KiB입니다. 이미지마다 실제 표시 크기의 WebP/AVIF 변형을 제공하고, 화면 밖 이미지만 지연 로딩합니다.
3. **캐시 수명 개선으로 약 5,380KiB 절감 가능**합니다. 이미지·폰트·CSS·JS에 장기 캐시를 적용하고 파일명 해시 또는 버전 쿼리로 갱신을 관리합니다.
4. 렌더 차단 요청을 줄이면 약 **640ms** 절감할 수 있습니다. 최초 화면에 필요하지 않은 스크립트에는 `defer`를 적용하고 비핵심 CSS·폰트를 분리합니다.
5. TBT 220ms와 강제 리플로우가 검출됐습니다. DOM 변경 뒤 `offsetWidth` 같은 레이아웃 값을 즉시 읽지 않도록 하고, 읽기와 쓰기 작업을 분리합니다.
6. 이미지 종횡비를 자연 크기와 맞추고, 모든 이미지에 실제 비율의 `width`와 `height` 또는 CSS `aspect-ratio`를 지정합니다. CLS 0.08은 통과 범위지만 더 낮출 수 있습니다.
7. 낮은 색상 대비를 WCAG AA 기준(일반 텍스트 4.5:1, 큰 텍스트 3:1) 이상으로 조정합니다.

## HTML 문법

- 18행: `<style type="text/tailwindcss">`는 W3C HTML 표준의 `style` 타입 값이 아닙니다.
- 19행: `@theme`은 Tailwind 전용 지시문이라 W3C CSS 파서가 인식하지 못합니다.
- 87행: 역할 없는 `.site-header-dropdown__inner` `div`에 `aria-label`을 지정했습니다. `<nav aria-label="전체 하위 메뉴">`를 사용하거나 `role="navigation"`을 지정합니다.

첫 두 항목은 브라우저 런타임 Tailwind 방식에서 발생합니다. 배포 전에 Tailwind CSS를 컴파일하고 결과 CSS만 넣으면 해결됩니다. HTML 경고 18건은 빈 요소의 `/>` 표기이며 기능상 영향은 없습니다.

## CSS 및 JavaScript

CSS Validator 기준 문법 오류는 없습니다. JavaScript 오류 511건·경고 1,084건은 대부분 GSAP·Tailwind 같은 외부 압축 라이브러리에 기본 ESLint 규칙을 적용한 결과입니다. 외부 파일은 수정 대상에서 제외하고, 자체 스크립트만 별도 ESLint 설정으로 분리해 검사하는 것을 권장합니다.

## 추가 수동 확인

자동 검사는 키보드 탐색과 화면 낭독기 이용성을 완전히 평가하지 못합니다. 모바일 화면에서 메뉴·검색창·하위 메뉴를 키보드와 화면 낭독기로 확인하고 포커스 표시 및 열림 상태 안내를 점검해야 합니다.

이번 검사는 보고서만 생성했으며 사이트 소스는 변경하지 않았습니다.
