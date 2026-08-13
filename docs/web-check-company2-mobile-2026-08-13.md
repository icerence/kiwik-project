# company2.html 모바일 웹 품질 검사 보고서

- 대상: <https://icerence.github.io/kiwik-project/company2.html>
- 측정 기준: 모바일 (PageSpeed Insights / Lighthouse 13.4.1)
- 검사일: 2026-08-13

## 결과 요약

| HTML | CSS | JavaScript | 성능 | 접근성 | 권장사항 | SEO |
| --- | --- | --- | --- | --- | --- | --- |
| 오류 3 / 경고 23 | 오류 0 / 경고 10 | 오류 511 / 경고 1,084 | 59 | 100 | 96 | 100 |

## 핵심 지표

| FCP | LCP | Speed Index | TBT | CLS |
| --- | --- | --- | --- | --- |
| 5.6초 | 18.0초 | 7.0초 | 0ms | 0 |

## 우선 개선 사항

1. LCP가 **18.0초**로 가장 큰 개선 대상입니다. 첫 화면 대표 이미지를 HTML에서 즉시 발견 가능하게 두고, `loading="lazy"`를 제거하며 `fetchpriority="high"` 적용을 검토합니다.
2. 이미지 전달 최적화로 약 **2,349KiB**, 캐시 수명 개선으로 약 **2,971KiB**를 절감할 수 있습니다. 페이지 총 전송량은 **3,350KiB**입니다.
3. 렌더 차단 요청을 줄이면 약 **4,330ms** 절감 가능성이 있습니다. 비핵심 JS에 `defer`를 적용하고 초기 CSS를 최소화합니다.
4. 이미지 종횡비 및 명시적 `width`·`height`를 정리합니다.

## 문법·린트

- HTML 오류 2건은 런타임 Tailwind의 `type="text/tailwindcss"`, `@theme` 때문에 발생하며 사전 컴파일 CSS로 전환하면 해소됩니다.
- 나머지 HTML 오류는 역할 없는 `.site-header-dropdown__inner` `div`의 `aria-label`입니다. `<nav aria-label="전체 하위 메뉴">` 또는 `role="navigation"`을 사용합니다.
- HTML 경고는 빈 요소의 `/>` 표기입니다. CSS는 문법 오류가 없습니다.
- JS 오류 511건·경고 1,084건은 주로 외부 압축 라이브러리에서 검출됐습니다. 자체 스크립트를 분리 검사하는 것을 권장합니다.

이번 검사는 보고서만 생성했으며 사이트 소스는 변경하지 않았습니다.
