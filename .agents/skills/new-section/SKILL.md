---
name: new-section
description: Figma 시안 없이 기존 토큰만으로 섹션(hero·about·products 등) HTML을 만든다.
---

이 명령은 섹션 HTML을 만드는 작업을 section-builder 서브 에이전트에 맡깁니다.

## 절차

1. 작업을 시작하기 전에 `node common/sync-common.mjs`를 실행해 기존 페이지의 공통 head·header·footer를 최신 상태로 맞춥니다. 스크립트가 루트의 모든 HTML을 자동으로 찾으므로 새 페이지 파일명을 별도로 등록하지 않습니다.
2. 사용자에게 만들 섹션 이름(hero·about·products 등)과, 그 섹션에 담을 내용, 들어갈 대상 파일을 확인합니다.
3. section-builder 서브 에이전트를 호출해 아래를 전달합니다.
   - 만들 섹션 이름
   - 담을 내용(제목·문단·이미지 자리·버튼)
   - 결과가 들어갈 대상 파일 경로
4. section-builder가 구현을 마치면 `node common/sync-common.mjs`를 다시 실행해 새 페이지에도 공통 head·header·footer를 자동 적용합니다.
5. section-builder가 Clarify → Reuse → Implement → Evaluate 4단계로 작업하고 결과를 보고하면, 그 보고를 사용자에게 그대로 전달합니다.

## 주의

- 이 명령은 Figma를 읽지 않습니다. 이미 있는 index.html의 @theme 토큰만으로 섹션을 만듭니다.
- section-builder는 요청한 섹션 외의 파일을 건드리지 않습니다. 다른 섹션까지 바꿔야 하면 명령을 나누어 부릅니다.
- 새 HTML에 공통 마커가 없어도 `sync-common.mjs`가 `<head>`와 기존 헤더·푸터를 찾아 공통 영역을 만들고 동기화합니다.
