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

- 모든 시각 값(색·간격·반지름·그림자·글자 크기)은 `assets/css/tokens.css`의 `@theme` 토큰만 참조한다.
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
