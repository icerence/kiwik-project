---
name: sync-tokens
description: 코드에 흩어진 하드코딩을 찾아 index.html의 @theme 토큰으로 정리하고, Figma 변수와 @theme을 맞춘다.
---

이 명령은 하드코딩을 찾아 토큰으로 정리하는 작업을 token-guardian 서브 에이전트에 맡깁니다.

## 절차

1. 사용자에게 검사할 범위(전체 프로젝트인지, 특정 파일·폴더인지)를 확인합니다.
2. token-guardian 서브 에이전트를 호출해 검사 범위를 전달합니다.
3. token-guardian가 Scan → Map → Report 3단계로 작업하고 결과를 보고하면, 그 보고를 사용자에게 그대로 전달합니다.
4. 보고에는 index.html의 @theme에 추가한 토큰과, 코드 파일에 남아 사용자가 바꿔야 할 하드코딩 자리가 담깁니다. 코드 파일의 하드코딩을 바꾸려면 별도로 figma-implementer나 section-builder에게 맡기도록 안내합니다.

## 주의

- token-guardian는 index.html의 @theme 블록만 편집합니다. 코드 파일(HTML·JS)의 하드코딩은 직접 고치지 않고 보고만 합니다.
