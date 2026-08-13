# company4.html 모바일 웹 품질 검사 보고서

- 대상: <https://icerence.github.io/kiwik-project/company4.html>
- 측정 기준: 모바일 (PageSpeed Insights / Lighthouse 13.4.1)
- 검사일: 2026-08-13

## 결과 요약

| HTML | CSS | JavaScript | 성능 | 접근성 | 권장사항 | SEO |
| --- | --- | --- | --- | --- | --- | --- |
| 오류 3 / 경고 26 | 오류 0 / 경고 10 | 오류 511 / 경고 1,084 | 60 | 100 | 96 | 100 |

## 핵심 지표

| FCP | LCP | Speed Index | TBT | CLS |
| --- | --- | --- | --- | --- |
| 5.6초 | 9.3초 | 6.0초 | 0ms | 0 |

## 우선 개선 사항

1. 렌더 차단 리소스를 줄이면 약 **4,330ms**를 절감할 수 있습니다. 비필수 JS는 `defer`로, 비핵심 스타일과 폰트는 초기 렌더 이후로 분리합니다.
2. 이미지 전달 최적화로 약 **676KiB**, 캐시 수명 개선으로 약 **1,391KiB**를 절감할 수 있습니다.
3. LCP 이미지가 즉시 발견되도록 HTML에 직접 두고 지연 로딩을 적용하지 않습니다.
4. 이미지의 자연 비율과 표시 비율을 맞추고, 모든 이미지에 명시적 크기를 제공합니다.

## 문법·린트

- W3C HTML 오류 2건은 `type="text/tailwindcss"` 및 `@theme`의 Tailwind 전용 문법입니다. 사전 컴파일 CSS로 전환하면 해결됩니다.
- `.site-header-dropdown__inner`의 `aria-label`은 `div` 대신 `<nav aria-label="전체 하위 메뉴">` 또는 `role="navigation"`으로 연결합니다.
- HTML 경고 26건은 빈 요소의 `/>` 표기입니다. CSS 문법 오류는 없습니다.
- JS 오류 511건·경고 1,084건은 대부분 외부 압축 라이브러리의 기본 ESLint 검출입니다.

이번 검사는 보고서만 생성했으며 사이트 소스는 변경하지 않았습니다.
