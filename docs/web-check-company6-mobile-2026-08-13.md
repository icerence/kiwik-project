# company6.html 모바일 웹 품질 검사 보고서

- 대상: <https://icerence.github.io/kiwik-project/company6.html>
- 측정 기준: 모바일 (PageSpeed Insights / Lighthouse 13.4.1)
- 검사일: 2026-08-13

## 결과 요약

| HTML | CSS | JavaScript | 성능 | 접근성 | 권장사항 | SEO |
| --- | --- | --- | --- | --- | --- | --- |
| 오류 3 / 경고 25 | 오류 0 / 경고 10 | 오류 511 / 경고 1,084 | 60 | 96 | 96 | 100 |

## 핵심 지표

| FCP | LCP | Speed Index | TBT | CLS |
| --- | --- | --- | --- | --- |
| 5.6초 | 9.0초 | 6.2초 | 0ms | 0 |

## 우선 개선 사항

1. 렌더 차단 요청 절감 가능치는 약 **4,330ms**입니다. 최초 화면에 필요 없는 JS는 `defer`로 로드하고 스타일·폰트 요청을 분리합니다.
2. 이미지 전달 최적화로 약 **612KiB**, 캐시 수명 개선으로 약 **1,319KiB**를 절감할 수 있습니다.
3. LCP 이미지는 문서에 직접 선언하고 지연 로딩을 피합니다. 이미지 종횡비가 표시 크기와 맞는지도 확인합니다.
4. 모든 이미지에 `width`·`height` 또는 `aspect-ratio`를 지정하고, 색상 대비를 WCAG AA 수준으로 조정합니다.

## 문법·린트

- `type="text/tailwindcss"`, `@theme`은 런타임 Tailwind 때문에 W3C 오류가 됩니다. CSS 사전 컴파일 시 해소됩니다.
- `.site-header-dropdown__inner`의 `aria-label`은 의미 있는 `<nav>` 요소 또는 `role="navigation"`에 설정합니다.
- HTML 경고 25건은 빈 요소의 `/>` 표기입니다. CSS 문법 오류는 없습니다.
- JS 오류 511건·경고 1,084건은 주로 외부 압축 라이브러리에서 검출됐습니다.

이번 검사는 보고서만 생성했으며 사이트 소스는 변경하지 않았습니다.
