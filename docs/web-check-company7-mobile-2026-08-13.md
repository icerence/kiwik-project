# company7.html 모바일 웹 품질 검사 보고서

- 대상: <https://icerence.github.io/kiwik-project/company7.html>
- 측정 기준: 모바일 (PageSpeed Insights / Lighthouse 13.4.1)
- 검사일: 2026-08-13

## 결과 요약

| HTML | CSS | JavaScript | 성능 | 접근성 | 권장사항 | SEO |
| --- | --- | --- | --- | --- | --- | --- |
| 오류 4 / 경고 25 | 오류 0 / 경고 10 | 오류 511 / 경고 1,084 | 58 | 97 | 96 | 100 |

## 핵심 지표

| FCP | LCP | Speed Index | TBT | CLS |
| --- | --- | --- | --- | --- |
| 7.6초 | 11.7초 | 7.6초 | 0ms | 0 |

## 우선 개선 사항

1. 렌더 차단 요청 절감 가능치는 약 **6,130ms**입니다. 비필수 JS에 `defer`를 적용하고 첫 화면의 CSS·폰트 요청을 줄입니다.
2. 이미지 최적화로 약 **759KiB**, 캐시 수명 개선으로 약 **1,814KiB**를 절감할 수 있습니다.
3. LCP **11.7초**를 개선하려면 첫 화면 대표 이미지를 HTML에서 바로 요청할 수 있게 하고 지연 로딩을 제거합니다.
4. 이미지 종횡비 및 명시적 크기를 정리하고, 낮은 색상 대비를 WCAG AA 수준으로 조정합니다.

## 문법·린트

- `text/tailwindcss`, `@theme`은 Tailwind 전용 문법에 따른 W3C 오류입니다.
- `.site-header-dropdown__inner`의 `aria-label`은 `<nav>`나 `role="navigation"` 요소로 옮깁니다.
- `role="tab"` 버튼에는 대응하는 `role="tabpanel"`이 없습니다. 각 탭에 `id`·`aria-controls`, 각 패널에 `id`·`role="tabpanel"`·`aria-labelledby`를 연결합니다. 단순 필터라면 일반 버튼과 `aria-pressed`를 사용합니다.
- HTML 경고 25건은 빈 요소 `/>` 표기입니다. CSS 문법 오류는 없고 JS 린트 대부분은 외부 압축 라이브러리에서 검출됐습니다.

이번 검사는 보고서만 생성했으며 사이트 소스는 변경하지 않았습니다.
