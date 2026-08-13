---
name: sync-tokens
description: >-
  코드에 흩어진 하드코딩된 시각 값(색상, 간격, 반지름 등)을 찾아 index.html의 @theme 토큰으로 등록하고 Figma 변수와 동기화할 때 사용한다.
---

# Sync Tokens 스킬

코드 내 하드코딩 값을 찾아 `@theme` 디자인 토큰으로 정리하고 동기화하는 스킬입니다.

상세 지침은 [token-guardian 가이드](./references/token-guardian.md)를 참조합니다.

## 절차

1. **하드코딩 탐색 (Scan)**
   - `.html`, `.css`, `.js` 파일에서 하드코딩된 색상값(hex, rgb, hsl) 및 임의 수치(px, rem)를 스캔합니다.
   - 탐색된 값의 위치(파일, 라인 번호)를 기록합니다.

2. **토큰 매핑 (Map)**
   - `index.html`의 `@theme` 블록과 비교하여 기존 토큰과 매핑하거나 새 토큰 후보(`--color-*`, `--spacing-*`, `--radius-*`)를 정리합니다.

3. **토큰 등록 및 보고 (Report)**
   - `index.html`의 `@theme` 블록에 신규 토큰을 추가 등록합니다.
   - HTML/JS 코드 상에서 교체가 필요한 위치와 토큰명을 정리하여 사용자에게 보고합니다.
