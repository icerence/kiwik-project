# 디자인 리뷰 보고서 — index.html

- 검사일: 2026-08-07
- 검사 대상: `E:\team\kiwik\index.html` 전체
- 담당: design-reviewer
- 기준 시안: 없음 (화면 대조 항목 생략)

## 최종 판정: FAIL

| 항목 | 결과 |
|---|---|
| 하드코딩 0건 | FAIL |
| 토큰 참조 | FAIL |
| CDN 화이트리스트 | PASS |
| 접근성 | PASS |
| 화면 대조 | 건너뜀 (기준 시안 없음) |

## [1] 하드코딩 0건 — FAIL

`@theme` 블록(15~22줄)은 제외. `<style>` 블록(24~144줄)과 인라인 SVG(156줄 이하)에 raw hex/rgb 값이 다수 존재.

- 27줄: `::selection { background: #7bcc12; color: #052e00; }`
- 34~35줄: `.skip-link { background: #7bcc12; color: #052e00; }`
- 52줄: `.nav-link::after { background: #7bcc12; }`
- 67~74줄: `.swiper-btn { border: 1px solid #9ca3af; background: #ffffff; color: #4b5563; }` / `:hover { border-color: #7bcc12; color: #7bcc12; }` / `:focus-visible { outline: 2px solid #7bcc12; }`
- 91줄: `.swiper-pagination-bullet { background: #9ca3af; }`
- 97줄: `.swiper-pagination-bullet-active { background: #030712; }`
- 99줄: `outline: 2px solid #7bcc12;`
- 117줄: `.dot-btn .dot-mark { background: #9ca3af; }`
- 127~128줄: `.dot-btn .dot-circle { background: #7bcc12; box-shadow: 0 0 4px rgba(0, 200, 83, 0.45); }`
- 135줄: `.dot-btn:focus-visible { outline: 2px solid #7bcc12; }`

→ `#7bcc12`, `#052e00`, `rgba(0,200,83,0.45)`는 이미 `@theme`에 `--color-brand` / `--color-brand-ink` / `--color-brand-glow`로 정의돼 있으므로 `var(--color-*)`로 교체 가능. `#9ca3af`, `#4b5563`, `#ffffff`, `#030712`는 대응 토큰이 `@theme`에 없어 추가 필요.

## [2] 토큰 참조 — FAIL

[1]과 동일 위치가 raw 값을 직접 써서 미참조 상태. 본문 HTML의 Tailwind 유틸리티 클래스(`text-brand`, `bg-gray-50`, `border-gray-400` 등, 예: 156, 160, 176, 274줄)는 `@theme` 기반이라 문제 없음. 다만 `@theme`에 명시적으로 정의된 gray 토큰은 `--color-gray-200`(19줄) 하나뿐이고 나머지 gray 계열은 Tailwind v4 기본 팔레트에 기대는 구조 — 참고용 관찰 사항.

## [3] CDN 화이트리스트 — PASS

10, 12, 633, 635, 637, 638, 640줄 모두 jsDelivr 기반 화이트리스트(Tailwind browser@4, Swiper 12, GSAP 3.15 4종) 범위 내. 위반 없음.

## [4] 접근성 — PASS (경미한 관찰 사항 있음)

- `<html lang="ko">` 정상 (2줄), skip link 존재(147줄)
- 모든 `<img>` alt 속성 존재. `alt=""`인 곳(437, 444, 451, 458, 465, 472, 497, 507, 517, 527, 537, 547줄)은 인접 텍스트 링크와 중복되는 장식성 이미지로 허용 가능한 패턴
- 아이콘 SVG에 `aria-hidden="true"` 일관 적용, 아이콘 버튼에 `aria-label` 부여
- 드롭다운/토글에 `aria-expanded`, `aria-controls`, `aria-haspopup`, `role="listbox"`/`role="option"` 정확히 사용 (175, 183, 191, 202~206)
- 시맨틱 태그(`header`, `nav`(aria-label), `main`, `section`(aria-labelledby), `article`, `footer`) 양호
- 검색 input에 `<label class="sr-only">` 연결 (184~185)
- `prefers-reduced-motion` 대응 (137~143, JS 705~713)

## [5] 화면 대조 — 건너뜀

기준 시안 없음.

## 다음 단계

design-reviewer는 코드를 고치지 않음. 실제 수정은 다음 에이전트에 위임:

- **token-guardian** — 부족한 gray 계열 토큰(`#9ca3af`, `#4b5563`, `#ffffff`, `#030712`)을 `@theme`에 추가
- **section-builder** 또는 **figma-implementer** — `<style>` 블록 내 raw 색상값을 `var(--color-*)`로 교체
