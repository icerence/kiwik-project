# 디자인 시스템 하네스

Figma 디자인 시스템을 코드로 변환하는 규칙 모음이다.
이 파일은 이식 가능하다

## 목적 (측정 가능한 완료 기준)

| 목적 | 측정 기준 |
|---|---|
| 일관성 보장 | 모든 시각 값이 토큰만 참조한다. raw hex/px/rgb/arbitrary Tailwind 값 0건 |
| 하드코딩 자동 차단 | 토큰 외 값 입력 시 도구 레벨에서 자동 차단한다(사람 리뷰 아님) |
| 구현 프로세스 표준화 | 모든 컴포넌트 작업이 동일한 4단계 절차를 거친다 |

## 기술 스택 전제

- HTML5 + Tailwind CSS v4 (CDN, `@tailwindcss/browser@4`) + VanillaJS
- 허용 CDN(jsDelivr만):
  - GSAP 3.15 — `gsap.min.js` / `ScrollTrigger.min.js` / `ScrollSmoother.min.js` / `ScrollToPlugin.min.js`
  - Swiper 12 — `swiper-bundle.min.css` / `swiper-bundle.min.js`
- 금지: 위 목록 외 npm 패키지·CDN, 번들러(Vite/Webpack), TypeScript, React, Storybook

## 4원칙

| 원칙 | 막는 문제 | 강제 방식 |
|---|---|---|
| Think Before Coding | 잘못된 가정 | 모호하면 멈추고 질문한다. 추측을 사실처럼 말하지 않는다 |
| Simplicity First | 부풀리기 | 새로 만들기 전 기존 토큰·섹션을 재사용한다. 요청 안 한 추상화·옵션 금지 |
| Surgical Changes | 범위 밖 변경 | 변경된 모든 줄이 요청과 1:1로 추적된다 |
| Goal-Driven Execution | 미완 종료 | 측정 가능한 완료 조건을 정한다. 자체 검증 통과 전엔 "완료"라 말하지 않는다 |

## 강제 계약 (3중 레이어)

4원칙은 문서 권고로 끝나지 않는다. 3개 레이어로 강제된다.

| 레이어 | 내용 |
|---|---|
| 1. 선언 | CLAUDE.md가 원칙·규칙을 선언한다 |
| 2. 절차 | 에이전트가 Clarify → Reuse → Implement → Evaluate 절차로 원칙을 실행한다 |
| 3. 자동 차단 | hook이 토큰 외 값을 도구 레벨에서 차단한다 |

## 표준 워크플로

모든 컴포넌트/섹션 작업은 4단계: **Clarify → Reuse → Implement → Evaluate**

각 단계는 원칙과 1:1 대응한다.

| 단계 | 대응 원칙 |
|---|---|
| Clarify | Think Before Coding |
| Reuse | Simplicity First |
| Implement | Surgical Changes |
| Evaluate | Goal-Driven Execution |

## 토큰 규칙

### 값의 출처는 디자인시스템이다

토큰 값을 사람이 눈대중으로 정하거나, 시안 화면에서 스포이드로 뽑아 적지 않는다.
값의 유일한 출처는 아래 Figma 디자인시스템 파일이다.

- kiwik_design_system — https://www.figma.com/design/3lXGBmQuUQ1RYM2cwhfyum/kiwik_design_system?node-id=0-1
  - fileKey `3lXGBmQuUQ1RYM2cwhfyum`, 페이지 `0:1` (Tailwind CSS)
  - 값이 모여 있는 프레임: Color Palette `12:34` · Typography `23:1273` · Spacing `37:1399` · Sizing `36:1358` · Border `42:1848` · Shadow `47:1526` · Breakpoint `33:1311`
  - 변수 이름은 `color/lime/500`, `font/size/xl`처럼 슬래시 경로다. `@theme` 토큰 이름은 이 경로를 그대로 옮긴다(`--color-lime-500`).

지킬 것.

1. 새 토큰이 필요하면 **먼저 디자인시스템에서 해당 변수를 찾는다.** Figma MCP의 `get_variable_defs`로 변수 이름과 값을 읽는다.
2. 토큰 이름은 디자인시스템 변수 이름을 따른다. 같은 값을 가리키는 별칭 토큰을 새로 만들지 않는다.
3. 토큰 정의 옆 주석에 **출처(변수 이름 또는 node id)를 남긴다.** 출처 없는 토큰은 하드코딩과 같다.
4. 화면 구현 시안(페이지 시안)과 디자인시스템 값이 다르면 디자인시스템을 따르고, 차이를 보고한다.

### 시스템에 없는 값을 만났을 때

순서대로 처리한다. 임의의 새 값을 지어내는 것은 마지막까지 하지 않는다.

1. **유사한 토큰으로 대치한다.** 같은 역할·같은 계열에서 가장 가까운 시스템 변수를 찾아 그것으로 바꾼다.
   예: `#4b5563`(Tailwind 기본 gray-600) → `color/gray/600` `#535964`.
   대치하면 화면 색·크기가 미세하게 달라진다. **무엇을 무엇으로 바꿨는지 반드시 보고한다.**
2. **유사값이 없으면 `@theme`에 변수로 등록한다.** 이때도 값을 지어내지 말고 시안에서 실측한 값을 쓰고,
   정의 옆 주석에 출처(시안 node id)와 "디자인시스템에 대응 변수 없음"을 남긴다.

대치 대상이 아닌 것(2번으로 가는 것)의 예.

- 알파 오버레이(`rgba(0,0,0,0.85)` 같은 스크림) — 팔레트는 불투명색만 다룬다
- `clamp()` 유동 크기 — 시스템은 고정 스텝만 정의한다
- 컴포넌트 고유 치수(헤더 높이, 썸네일 크기 등) — 시스템 spacing 스케일에 대응이 없다

### 참조 방식

- 모든 시각 값(색·간격·반지름·그림자·글자 크기)은 `@theme` 토큰만 참조한다.
- raw hex/px/rgb/hsl 금지.
- arbitrary Tailwind 클래스(`[...]` 표기) 금지.

## CDN 화이트리스트

`<script src>` / `<link href>`는 아래 시작 문자열만 허용한다.

- `https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4`
- `https://cdn.jsdelivr.net/npm/gsap@3.15/`
- `https://cdn.jsdelivr.net/npm/swiper@12/`

## 에이전트 라우팅 & 스킬 가이드

에이전트 = 역할, 스킬 = 절차. 아래 4개는 다음 청크에서 만든다.

| 워크플로 단계 | 담당 에이전트 | 스킬 |
|---|---|---|
| Clarify | (다음 청크) | (다음 청크) |
| Reuse | (다음 청크) | (다음 청크) |
| Implement | (다음 청크) | (다음 청크) |
| Evaluate | (다음 청크) | (다음 청크) |

> 에이전트 구현 / hook 구현 / `tokens.css` 실제 파일은 다음 청크에서 만든다.

## 배포 방법

이 파일을 하위 프로젝트 루트에 그대로 복사한다.
예: `design-system-harness.md` → `kiwik/design-system-harness.md`

각 프로젝트의 CLAUDE.md에서 이 파일을 참고하도록 한 줄만 추가한다.
