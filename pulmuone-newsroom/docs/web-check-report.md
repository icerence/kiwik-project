# 풀무원 뉴스룸 로컬 파일 검사 보고서

검사 대상: `index.html`, `styles.css`, `script.js`  
검사 기준: 로컬 파일 문법·린트 검사  
검사일: 2026-08-11

## 한눈에 보기

| 항목 | 결과 | 판정 |
| --- | --- | --- |
| HTML 문법 | 오류 3건, 경고 0건 | 고칠 것 있음 |
| CSS 문법 | 확인 실패 (`HTTP 520`) | 판정 보류 |
| JS 린트 | 오류 0건, 경고 0건 | 통과 |
| Lighthouse | 로컬 파일이라 측정하지 않음 | 공개 URL 필요 |

가장 먼저 탭 UI의 ARIA 구조를 완성해야 한다. 현재 `role="tab"`에 대응하는 `role="tabpanel"`이 없어 보조기술이 탭과 콘텐츠의 관계를 파악하기 어렵다.

## 1 - HTML 문법

### 오류 3건

| 줄:열 | 무엇이 잘못됐는가 | 어떻게 고치는가 |
| --- | --- | --- |
| 13:53 | 일반 `div`에 역할 없이 `aria-label="바로가기"`를 사용했다. (The “aria-label” attribute must not be specified on any “div” element unless the element has a “role” value other than “caption”, “code”, “deletion”, “emphasis”, “generic”, “insertion”, “paragraph”, “presentation”, “strong”, “subscript”, or “superscript”.) | 실제 의미에 맞는 시맨틱 요소로 바꾸거나 적절한 `role`을 추가하고, 불필요한 라벨이면 `aria-label`을 제거한다. |
| 26:59 | 일반 `div`에 역할 없이 `aria-label="뉴스룸 하위 메뉴"`를 사용했다. (The “aria-label” attribute must not be specified on any “div” element unless the element has a “role” value other than “caption”, “code”, “deletion”, “emphasis”, “generic”, “insertion”, “paragraph”, “presentation”, “strong”, “subscript”, or “superscript”.) | 드롭다운의 실제 상호작용 구조에 맞는 역할을 부여하거나 라벨을 제거하고 트리거와 `aria-controls`로 연결한다. |
| 53:77 | 활성 `role="tab"`에 대응하는 `role="tabpanel"`이 없다. (Every active “role=tab” element must have a corresponding “role=tabpanel” element.) | 각 탭에 고유 `id`와 `aria-controls`를 주고, 대응 콘텐츠에 `role="tabpanel"`, `id`, `aria-labelledby`를 추가한다. |

### 경고 0건

경고 없음.

## 2 - CSS 문법

W3C CSS Validator가 두 차례 모두 `HTTP 520`을 반환해 확인하지 못했다. 이는 오류 0건을 뜻하지 않으며, 검사 서비스가 정상화된 뒤 재검사가 필요하다.

## 3 - JavaScript 린트

검사 세트: ESLint recommended

`script.js`는 오류 0건, 경고 0건으로 통과했다.

## 4 - Lighthouse

로컬 파일은 Lighthouse로 측정하지 않았다. 인터넷에 공개된 URL이 준비되면 모바일 또는 데스크톱 기준으로 성능·접근성·SEO·Best Practices를 검사할 수 있다.

## 5 - 먼저 할 일

1. 53줄의 탭과 탭 패널을 `id`, `aria-controls`, `aria-labelledby`로 연결해 탭 접근성 구조를 완성한다.
2. 13줄과 26줄의 `div`에 붙은 `aria-label`을 실제 의미에 맞는 시맨틱 구조 또는 역할로 정리한다.
3. W3C CSS Validator가 정상 응답할 때 `styles.css`를 다시 검사한다.

## 검사 도구와 한계

이 보고서는 W3C Nu HTML Checker와 ESLint(recommended) 결과를 옮긴 것이다. CSS 검사는 외부 검사기 오류로 완료되지 않았고 Lighthouse는 로컬 파일이라 측정하지 않았다. 자동 검사는 키보드 이동, 포커스 순서, 실제 화면 의도까지 완전히 판단하지 못하므로 별도의 수동 접근성 확인이 필요하다.
