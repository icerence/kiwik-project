---
name: review-design
description: >-
  섹션 또는 컴포넌트 작업을 완료하기 전에 하드코딩 0건, @theme 토큰 참조, CDN 화이트리스트, 접근성, 화면 대조 등 5가지 규칙을 검사하여 PASS/FAIL을 판정할 때 사용한다.
---

# Design Review 스킬

작업을 완료하기 전 최종 품질 검증을 수행하는 스킬입니다. 코드를 직접 수정하지 않고 5가지 항목을 평가하여 PASS/FAIL 판정 및 수정 방향을 보고합니다.

상세 검사 지침은 [design-reviewer 가이드](./references/design-reviewer.md)를 참조합니다.

## 5가지 필수 검사 항목

1. **하드코딩 0건**
   - 대상 파일에서 hex(`#RRGGBB`), `rgb()`, `hsl()` 또는 임의 클래스(`class="...[...]"`)가 없는지 검사합니다 (`index.html`의 `@theme` 블록 제외).

2. **토큰 참조**
   - 시각적 스타일 수치가 `@theme` 변수(`var(--color-*)` 등) 또는 정의된 토큰 클래스로 적절히 참조되었는지 확인합니다.

3. **CDN 화이트리스트**
   - `<script>`, `<link>` 태그가 프로젝트 허용 CDN(Tailwind CSS v4, GSAP core/ScrollTrigger/ScrollSmoother/ScrollToPlugin, Swiper 12)만 사용하는지 확인합니다.

4. **접근성 기본**
   - `img` 태그의 `alt` 속성 누락 여부, 버튼/링크의 텍스트 레이블 유무를 확인합니다.

5. **화면 대조**
   - 기준 시안이나 화면 이미지가 있는 경우 시각적 일치 여부를 대조합니다 (없는 경우 건너뜀을 명시).

## 보고 방식

- 각 항목별 검사 결과(`[1] 하드코딩 0건: PASS` 또는 `FAIL`)를 명시합니다.
- FAIL 항목이 있을 경우 해당 파일, 라인 번호, 수정 권장 사항을 함께 보고합니다.
