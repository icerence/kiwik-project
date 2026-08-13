---
name: figma-to-code
description: Figma 시안(URL 또는 nodeId)을 프로젝트 하네스 규칙에 따라 코드로 옮긴다.
---

이 명령은 Figma 시안을 코드로 옮기는 작업을 figma-implementer 서브 에이전트에 맡깁니다.

## 절차

1. 사용자에게 Figma 시안 URL(또는 fileKey와 nodeId)과, 그 시안이 들어갈 대상 파일을 확인합니다.
2. figma-implementer 서브 에이전트를 호출해 아래를 전달합니다.
   - 옮길 Figma 시안의 URL 또는 nodeId
   - 결과가 들어갈 대상 파일 경로
3. figma-implementer가 Clarify → Reuse → Implement → Evaluate 4단계로 작업하고 결과를 보고하면, 그 보고를 사용자에게 그대로 전달합니다.
4. figma-implementer가 하드코딩이나 시안 불일치를 보고하면, 사용자에게 다음 조치를 물어보고 임의로 재수정하지 않습니다.

## 주의

- 이 명령은 직접 코드를 편집하지 않습니다. 모든 편집은 figma-implementer가 하네스 규칙 안에서 수행합니다.
- Figma MCP 도구가 프로젝트에 연결되어 있어야 figma-implementer가 시안을 읽을 수 있습니다.
