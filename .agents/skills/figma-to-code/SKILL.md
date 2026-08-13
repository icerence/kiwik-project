---
name: figma-to-code
description: >-
  Figma 시안(URL 또는 nodeId)을 프로젝트 하네스 규칙에 따라 코드로 옮길 때 사용한다. Figma Dev Mode MCP 도구를 사용하여 변수·스크린샷·코드 컨텍스트를 분석하고, @theme 변수 및 Tailwind CSS 규칙을 준수하여 컴포넌트와 섹션을 구현한다.
---

# Figma to Code 스킬

Figma 시안을 프로젝트 하네스 규칙에 맞춰 코드로 변환 및 구현하는 스킬입니다.

상세 구현 지침 및 원칙은 [figma-implementer 가이드](./references/figma-implementer.md)를 참조합니다.

## 절차

1. **요구사항 및 시안 확인 (Clarify)**
   - 사용자에게 Figma 시안 URL(또는 fileKey와 nodeId)과 결과가 들어갈 대상 파일을 확인합니다.
   - Figma Dev Mode MCP 도구(`get_figma_data`, `download_figma_images` 등)를 사용해 변수, 스크린샷, 코드 컨텍스트를 읽습니다.
   - 필요한 경우 반응형·인터랙션 요구사항을 사전에 확인합니다.

2. **재사용 확인 (Reuse)**
   - 대상 HTML 파일의 `<style type="text/tailwindcss">` 내 `@theme` 블록에서 참조할 변수명을 확정합니다.
   - 기존 컴포넌트 및 구조 패턴을 확인하여 재사용합니다.

3. **코드 구현 (Implement)**
   - 하드코딩(hex, rgb, arbitrary `[...]` 클래스 등)을 배제하고 `@theme` 토큰 및 Tailwind 유틸리티 클래스로 작성합니다.
   - 새 토큰이 필요한 경우 `index.html`의 `@theme` 블록에 먼저 정의한 후 참조합니다.
   - 구현 완료 후 `node common/sync-common.mjs`를 실행하여 공통 요소를 동기화합니다.

4. **자체 검증 (Evaluate)**
   - 불필요한 하드코딩 수치 단위가 남아있는지 점검합니다.
   - Figma 렌더 시안과 결과물의 시각적 일치 여부를 점검하고 결과를 사용자에게 보고합니다.
