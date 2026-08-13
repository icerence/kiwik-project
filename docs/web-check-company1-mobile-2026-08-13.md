# company1.html 모바일 웹 품질 검사 보고서

- 대상: <https://icerence.github.io/kiwik-project/company1.html>
- 측정 기준: 모바일 (PageSpeed Insights / Lighthouse 13.4.1)
- 검사일: 2026-08-13

## 결과 요약

| HTML | CSS | JavaScript | 성능 | 접근성 | 권장사항 | SEO |
| --- | --- | --- | --- | --- | --- | --- |
| 오류 3 / 경고 27 | 오류 0 / 경고 10 | 오류 511 / 경고 1,084 | 59 | 95 | 96 | 100 |

## 핵심 지표

| FCP | LCP | Speed Index | TBT | CLS |
| --- | --- | --- | --- | --- |
| 5.6초 | 10.9초 | 6.5초 | 0ms | 0 |

## 우선 개선 사항

1. 렌더 차단 요청을 줄이면 약 **4,330ms**를 절감할 수 있습니다. 첫 화면에 필요하지 않은 스크립트는 `defer`로 지연하고, 비핵심 CSS·폰트 로딩을 분리합니다.
2. 이미지 전달 최적화로 약 **973KiB** 절감 가능성이 있습니다. 표시 크기에 맞는 WebP/AVIF 변형을 제공하고 첫 화면 LCP 이미지는 HTML에서 즉시 발견되도록 합니다.
3. 정적 리소스 캐시 수명을 늘리면 재방문 시 약 **1,698KiB**를 줄일 수 있습니다.
4. 이미지 종횡비와 이미지의 명시적 `width`·`height`를 확인합니다.
5. 낮은 텍스트·배경 대비를 WCAG AA 기준(일반 텍스트 4.5:1) 이상으로 조정합니다.

## 문법·린트

- HTML 오류 2건은 `type="text/tailwindcss"`, Tailwind 전용 `@theme`을 W3C가 인식하지 못해 발생합니다. Tailwind를 사전 컴파일하면 해소됩니다.
- 나머지 HTML 오류는 역할 없는 `.site-header-dropdown__inner` `div`의 `aria-label`입니다. `<nav aria-label="전체 하위 메뉴">` 또는 `role="navigation"`을 사용합니다.
- HTML 경고는 빈 요소의 `/>` 표기이며 기능상 영향은 없습니다.
- CSS는 문법 오류가 없습니다. JS 린트 결과 대부분은 GSAP·Tailwind 등 외부 압축 라이브러리에 기본 규칙을 적용한 결과이므로 자체 스크립트와 분리해 확인합니다.

이번 검사는 보고서만 생성했으며 사이트 소스는 변경하지 않았습니다.
