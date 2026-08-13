# AGENTS.md

@name.md를 준수해

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## 이 폴더의 성격

F:\harness는 단일 프로젝트가 아니다.
서로 무관한 프로젝트 두 개를 담은 워크스페이스다.

각 프로젝트는 독립된 git 저장소이고, 자기만의 AGENTS.md가 있다.
이 폴더는 PM의 역할을 수행한다.
독립된 프로젝트의 품질 검사 한다.

## 디자인 시스템 하네스

이식 가능한 규칙(목적·기술스택·4원칙·강제계약·워크플로·토큰규칙·CDN화이트리스트·에이전트라우팅)은
`design-system-harness.md`에 따로 있다.

하위 프로젝트에 배포할 때는 그 파일만 복사한다.

## 하위 프로젝트

| 폴더 | 내용 | 스택 | 상세 가이드 |
|---|---|---|---|
| `kiwik/` | 풀무원 ESG 소개 사이트 | HTML5 + Tailwind v4 (CDN) + Vanilla JS | `kiwik/AGENTS.md` |
| `synergos/` | IKEA 스타일 "공간별 쇼핑" 랜딩 페이지 (5인 팀) | 단일 `index.html`, Tailwind CDN + Swiper + GSAP | `synergos/AGENTS.md` |

빌드·린트·테스트 명령은 두 프로젝트 다 없다(정적 사이트, 브라우저에서 바로 열거나 `npx serve .`로 확인).

## 작업 규칙

1. 작업 전 대상 폴더(kiwik 또는 synergos)를 먼저 확인한다.
2. 그 폴더 안에서만 읽고 쓴다.
3. 다른 폴더의 코드·에셋·설정을 섞지 않는다.
4. 빌드/커밋 메시지 접두어/파일명 규칙 등 세부 사항은 각 폴더의 AGENTS.md를 따른다.

## README 동기화 규칙

1. `git pull` 또는 `git push`가 완료되면 변경된 파일을 기준으로 루트 `README.md`와 실제 프로젝트 상태가 일치하는지 확인한다.
2. 새 페이지의 추가·삭제, 파일명이나 폴더 구조 변경, 사용 기술·외부 라이브러리 변경, 실행·배포 방식 변경, 공통 컴포넌트 관리 방식 변경이 있으면 README 갱신이 필요한 것으로 판단한다.
3. README 갱신이 필요하면 바로 수정하지 말고, 변경이 필요한 항목을 간단히 설명한 뒤 사용자에게 갱신 여부를 묻는다.
4. 디자인, 문구, 이미지, 접근성 속성, HTML 오류 또는 성능 최적화처럼 README의 프로젝트 안내에 영향을 주지 않는 변경은 갱신 대상으로 보지 않는다.
5. README 갱신 필요 여부를 판단할 수 없으면 추측하지 말고 사용자에게 확인한다.

이 루트 파일은 워크스페이스 안내용이다.
프로젝트별 상세 규칙은 각 폴더 AGENTS.md가 우선한다.
