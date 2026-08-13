---
name: new-section
description: >-
  Figma 시안 없이 기존 index.html의 @theme 토큰과 Tailwind CSS만으로 새로운 섹션(hero, about, products 등) HTML을 생성하거나 추가할 때 사용한다.
---

# New Section 생성 스킬

Figma 시안 없이 기존 토큰 및 디자인 시스템 하네스 규칙만으로 새로운 섹션 HTML을 구현하는 스킬입니다.

상세 구현 지침 및 원칙은 [section-builder 가이드](./references/section-builder.md)를 참조합니다.

## 절차

1. **공통 영역 동기화**
   - 작업 시작 전 `node common/sync-common.mjs`를 실행해 공통 head, header, footer를 최신 상태로 맞춥니다.

2. **요구사항 확인 (Clarify)**
   - 생성할 섹션 이름(hero, about, products 등), 포함할 콘텐츠(제목, 본문 문단, 이미지 영역, 버튼 등), 결과가 들어갈 대상 파일을 확인합니다.

3. **재사용 구조 확인 (Reuse)**
   - `index.html`의 `@theme` 블록과 기존 섹션들의 컨테이너 및 간격 패턴을 확인합니다.

4. **코드 구현 (Implement)**
   - 요청된 섹션 범위만 최소 수정(Surgical Changes) 원칙으로 구현합니다.
   - 하드코딩 없이 `@theme` 토큰 기반 Tailwind 유틸리티 클래스를 사용합니다.
   - 새 페이지 생성 또는 구현 완료 후 `node common/sync-common.mjs`를 재실행합니다.

5. **자체 검증 (Evaluate)**
   - 변경 범위가 요청된 섹션에만 한정되었는지, 공통 영역 마커가 정상 유지되었는지 확인 후 사용자에게 보고합니다.
