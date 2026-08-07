# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 이 폴더의 성격

F:\harness는 단일 프로젝트가 아니다.
서로 무관한 프로젝트 두 개를 담은 워크스페이스다.

각 프로젝트는 독립된 git 저장소이고, 자기만의 CLAUDE.md가 있다.
이 폴더는 PM의 역할을 수행한다.
독립된 프로젝트의 품질 검사 한다.

## 디자인 시스템 하네스

이식 가능한 규칙(목적·기술스택·4원칙·강제계약·워크플로·토큰규칙·CDN화이트리스트·에이전트라우팅)은
`design-system-harness.md`에 따로 있다.

하위 프로젝트에 배포할 때는 그 파일만 복사한다.

## 하위 프로젝트

| 폴더 | 내용 | 스택 | 상세 가이드 |
|---|---|---|---|
| `kiwik/` | 풀무원 ESG 소개 사이트 | HTML5 + Tailwind v4 (CDN) + Vanilla JS | `kiwik/CLAUDE.md` |
| `synergos/` | IKEA 스타일 "공간별 쇼핑" 랜딩 페이지 (5인 팀) | 단일 `index.html`, Tailwind CDN + Swiper + GSAP | `synergos/CLAUDE.md` |

빌드·린트·테스트 명령은 두 프로젝트 다 없다(정적 사이트, 브라우저에서 바로 열거나 `npx serve .`로 확인).

## 작업 규칙

1. 작업 전 대상 폴더(kiwik 또는 synergos)를 먼저 확인한다.
2. 그 폴더 안에서만 읽고 쓴다.
3. 다른 폴더의 코드·에셋·설정을 섞지 않는다.
4. 빌드/커밋 메시지 접두어/파일명 규칙 등 세부 사항은 각 폴더의 CLAUDE.md를 따른다.

이 루트 파일은 워크스페이스 안내용이다.
프로젝트별 상세 규칙은 각 폴더 CLAUDE.md가 우선한다.
