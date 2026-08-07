---
name: new-section
description: Figma 시안 없이 기존 토큰만으로 섹션(hero·about·products 등) HTML을 만든다.
---

이 명령은 섹션 HTML을 만드는 작업을 section-builder 서브 에이전트에 맡깁니다.

## 절차

1. 프로젝트 폴더에 `.html` 페이지가 여러 개면, `node .claude/scripts/extract-common.js`를 실행해 공통 head·header·footer를 `common/`에 뽑아두고 페이지 간 불일치를 확인합니다. 페이지가 하나뿐이면 이 단계는 건너뜁니다.
2. 사용자에게 만들 섹션 이름(hero·about·products 등)과, 그 섹션에 담을 내용, 들어갈 대상 파일을 확인합니다.
3. section-builder 서브 에이전트를 호출해 아래를 전달합니다.
   - 만들 섹션 이름
   - 담을 내용(제목·문단·이미지 자리·버튼)
   - 결과가 들어갈 대상 파일 경로
4. section-builder가 Clarify → Reuse → Implement → Evaluate 4단계로 작업하고 결과를 보고하면, 그 보고를 사용자에게 그대로 전달합니다.

## 주의

- 이 명령은 Figma를 읽지 않습니다. 이미 있는 index.html의 @theme 토큰만으로 섹션을 만듭니다.
- section-builder는 요청한 섹션 외의 파일을 건드리지 않습니다. 다른 섹션까지 바꿔야 하면 명령을 나누어 부릅니다.
- `extract-common.js`는 도구 실행에 자동으로 끼어드는 훅이 아니라 사람이 직접 돌리는 스크립트라 `.claude/scripts/`에 둡니다. 이 스킬 절차 1번에서 직접 실행합니다.