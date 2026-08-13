# company5.html 모바일 웹 품질 검사 보고서

- 대상: <https://icerence.github.io/kiwik-project/company5.html>
- 측정 기준: 모바일 (PageSpeed Insights / Lighthouse 13.4.1)
- 검사일: 2026-08-13

## 결과 요약

| HTML | CSS | JavaScript | 성능 | 접근성 | 권장사항 | SEO |
| --- | --- | --- | --- | --- | --- | --- |
| 오류 3 / 경고 42 | 오류 0 / 경고 10 | 오류 511 / 경고 1,084 | 60 | 95 | 100 | 100 |

## 핵심 지표

| FCP | LCP | Speed Index | TBT | CLS |
| --- | --- | --- | --- | --- |
| 5.5초 | 10.0초 | 5.5초 | 0ms | 0.079 |

## 우선 개선 사항

1. 렌더 차단 요청을 줄이면 약 **4,890ms** 절감 가능성이 있습니다. 비필수 스크립트는 `defer`를 적용하고 초기 CSS·폰트 요청을 정리합니다.
2. 이미지 최적화로 약 **815KiB**, 캐시 수명 개선으로 약 **1,492KiB**를 절감할 수 있습니다.
3. LCP **10.0초**를 낮추기 위해 첫 화면 이미지를 즉시 요청 가능하게 만들고, 지연 로딩을 피합니다.
4. CLS는 0.079로 통과 범위지만, 이미지에 `width`·`height`와 `aspect-ratio`를 계속 명시합니다. 낮은 색상 대비도 함께 보완합니다.

## 문법·린트

- `text/tailwindcss`, `@theme`은 Tailwind 전용 문법이므로 W3C 오류로 표시됩니다. 사전 컴파일 CSS 배포 시 해소됩니다.
- 역할 없는 `.site-header-dropdown__inner`의 `aria-label`은 `<nav>` 또는 `role="navigation"`으로 수정합니다.
- HTML 경고 42건은 빈 요소 닫는 슬래시 표기이며, CSS 문법 오류는 없습니다.
- JS 오류 511건·경고 1,084건은 주로 GSAP 등 외부 압축 라이브러리에서 검출됐습니다.

이번 검사는 보고서만 생성했으며 사이트 소스는 변경하지 않았습니다.
