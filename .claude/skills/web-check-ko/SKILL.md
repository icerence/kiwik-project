---
name: web-check-ko
description: 웹페이지 하나를 받아 HTML 문법, CSS 문법, JavaScript(ES6+) 문법·린트, Lighthouse 품질 점수(성능·접근성·SEO·Best Practices)를 한 번에 검사하고 한국어 보고서를 만드는 스킬. 검사는 W3C Nu HTML Checker, W3C CSS Validator, ESLint(recommended 세트), Google PageSpeed Insights API 네 곳의 공식 도구로 수행하며, 영문으로 나오는 오류 메시지와 감사 항목을 한국어로 옮기고 고치는 방법까지 적는다. "사이트 검사해줘", "웹표준 검사", "HTML 문법 검사", "CSS 검사", "JS 린트", "ESLint 돌려줘", "자바스크립트 문법 검사", "ES6 검사", "라이트하우스 돌려줘", "Lighthouse 점수 확인", "속도 측정", "접근성 검사", "이 URL 품질 검사", "웹사이트 점검 보고서", "배포한 사이트 확인해줘", "W3C 검사" 같은 요청에 반드시 사용한다. URL 하나만 줘도 트리거한다. 로컬 HTML·CSS·JS 파일을 주면 문법·린트 검사만 수행한다. 디자인 비평, 콘텐츠 품질 평가, SEO 키워드 전략에는 사용하지 않는다.
---

# 웹페이지 검사 보고서 (한국어)

공개된 웹페이지 하나를 세 가지 공식 검사기에 넣고, 결과를 한국어 보고서 한 장으로 정리하는 스킬이다.

| 검사 | 도구 | 무엇을 보는가 |
| --- | --- | --- |
| HTML 문법 | W3C Nu HTML Checker | 태그 닫힘, 중복 `id`, 필수 속성 누락 |
| CSS 문법 | W3C CSS Validator (Jigsaw) | 없는 속성명, 잘못된 단위, 구문 오류 |
| JS 문법·린트 | ESLint (recommended 세트) | 파싱 오류, `var`·`for` 루프·콜백 등 구식 패턴, `prefer-const`·`eqeqeq` 위반 |
| 품질 점수 | Lighthouse (PageSpeed Insights API) | 성능·접근성·SEO·Best Practices |

네 가지가 겹치지 않는 것을 재므로 함께 돌린다. 문법 검사는 코드가 규칙에 맞는지 보고, 린트는 최신 표준(ES2025+)에서 권장되는 방식으로 짜여 있는지 보고, Lighthouse는 사용자가 실제로 겪는 결과를 본다. 태그가 다 닫혀 있어도 이미지가 크면 성능 점수는 떨어진다.

## 실행 흐름

### 1단계 — 입력 확인

사용자에게서 받을 것은 **공개 URL 하나**다. 없으면 묻는다. 아래 두 가지는 사용자가 말하지 않으면 되묻지 않고 기본값으로 간다.

- 측정 기준: `mobile`(기본) 또는 `desktop`
- PageSpeed Insights API 키: 없으면 키 없이 시도한다

로컬 파일(`.html`·`.css`·`.js`)을 준 경우에는 문법·린트 검사만 수행하고, Lighthouse는 "인터넷에 올린 뒤 다시 실행"으로 안내한다.

### 2단계 — 검사 실행

```bash
node scripts/check.mjs https://example.com/
```

자주 쓰는 옵션이다.

```bash
node scripts/check.mjs https://example.com/ --strategy desktop
node scripts/check.mjs https://example.com/ --psi-key 발급받은키
node scripts/check.mjs https://example.com/ --skip lighthouse
node scripts/check.mjs --html-file index.html --css-file style.css --js-file app.js
node scripts/check.mjs --js-file app.js utils.js
node scripts/check.mjs https://example.com/ --js-file app.js
node scripts/check.mjs https://example.com/ --out result.json
```

**Node.js 18 이상**이 있어야 한다. 그 밖에 설치할 것은 없다. `npm install`도 필요 없다.

JS 린트는 `npx --package eslint@latest eslint`로 ESLint를 임시 실행하므로 프로젝트에 ESLint를 미리 설치할 필요는 없다. `npx`를 못 쓰면 그 항목만 "확인 실패"로 남고 나머지 검사는 그대로 진행한다.

결과는 JSON 한 덩어리로 표준 출력에 나온다. 오류 메시지는 표준 오류로 따로 나가므로 출력을 그대로 파일에 담아도 JSON이 깨지지 않는다.

> 옛 파이썬판 `scripts/check.py` 도 아직 남아 있다. 결과는 같지만 `python3` 이름이
> 환경마다 달라 문제가 되어 Node판으로 옮겼다. 새로 쓸 때는 `check.mjs` 를 쓴다.

### 3단계 — 결과 해석

JSON을 그대로 사용자에게 보여 주지 않는다. `references/`의 대응표를 참조해 한국어로 옮긴다.

1. `references/w3c-messages-ko.md` — HTML·CSS 오류 메시지의 한국어 뜻과 고치는 방법
2. `references/eslint-messages-ko.md` — ESLint 규칙(rule)의 한국어 뜻, 왜 문제인지, 고치는 예시
3. `references/lighthouse-ko.md` — Lighthouse 카테고리·지표·감사 항목의 한국어 이름과 판정 기준
4. `references/report-template.md` — 보고서 틀

대응표에 없는 메시지는 직접 번역하되, **원문 메시지를 괄호로 함께 남긴다.** 사용자가 검색해 찾아볼 수 있어야 한다.

### 4단계 — 보고서 작성

`references/report-template.md` 틀에 맞춰 마크다운 보고서를 만든다. 분량이 1,000자를 넘으면 채팅에 늘어놓지 말고 `.md` 파일로 저장해 전달한다.

### 5단계 — 승인받고 수정

보고서를 전달한 뒤 **무엇을 고칠지 사용자에게 승인을 받는다.** 승인 없이 파일을 고치지 않는다.

승인 요청은 보고서 "먼저 할 일" 항목을 기준으로 한다. 고칠 항목과 바꿀 내용을 짚어 묻고, 사용자가 고른 것만 수정한다.

아래 두 가지는 수정 대상에서 빼고 그 까닭을 밝힌다.

1. 외부 라이브러리에서 나온 오류(`.min.js` 등). 직접 만든 코드가 아니다.
2. 사이트 운영 도구가 자동으로 넣은 코드.

수정한 뒤에는 같은 대상을 다시 검사해 오류가 줄었는지 확인한다. 문법만 볼 때는 `--skip lighthouse` 를 쓴다. URL 검사라면 고친 파일이 서버에 올라간 뒤라야 결과가 달라진다는 점을 함께 알린다.

## 보고 원칙

1. **숫자를 그대로 적는다.** "오류가 좀 있습니다"가 아니라 "HTML 오류 4건, 경고 2건"으로 적는다.
2. **오류마다 줄 번호와 고치는 방법을 함께 적는다.** 무엇이 잘못됐는지만 알려 주면 학습자는 다음 동작을 정하지 못한다.
3. **경고와 오류를 섞지 않는다.** 오류는 규칙 위반이고, 경고는 권고 사항이다. 표를 나눈다.
4. **점수는 측정 기준을 함께 밝힌다.** 모바일 기준과 데스크톱 기준은 점수가 다르게 나온다.
5. **자동 검사의 한계를 마지막에 한 줄로 적는다.** Lighthouse 접근성 점수는 자동으로 잡히는 항목만 반영하며, 키보드 이동이나 포커스 순서는 사람이 직접 확인해야 한다.
6. **추측을 사실처럼 적지 않는다.** 검사기가 판단하지 않은 것은 "확인되지 않음"으로 적는다.

## 실패했을 때

검사기가 응답하지 않으면 그 항목만 "확인 실패"로 적고 나머지는 그대로 보고한다. 세 검사는 서로 독립이므로 하나가 막혀도 나머지는 나온다.

| 증상 | 원인 | 대응 |
| --- | --- | --- |
| Lighthouse가 `HTTP 429` | 키 없이 쓰는 공용 사용량이 소진됨 | PageSpeed Insights API 키를 발급해 `--psi-key`로 넘긴다 |
| Lighthouse가 `HTTP 400` | 검사기가 페이지를 열지 못함 | 주소가 인터넷에 공개돼 있는지, 로그인이 필요한 페이지인지 확인한다 |
| HTML 검사가 시간 초과 | 페이지가 크거나 검사기가 붐빔 | 잠시 뒤 다시 실행한다 |
| CSS 오류가 0인데 화면이 깨짐 | 문법은 맞고 값이 의도와 다름 | 문법 검사로는 잡히지 않는다고 적고, 브라우저 개발자 도구로 확인하도록 안내한다 |
| 아무 검사도 안 됨 — `node` 없음 | Node.js가 설치되지 않았음 | Node.js LTS(18 이상)를 설치한다 |
| JS 린트만 "확인 실패" — `npx` 없음 | Node는 있는데 npx가 빠짐 | Node.js를 다시 설치한다. 다른 검사는 그대로 나온다 |
| JS 린트가 네트워크 오류 | `npx`가 ESLint 패키지를 내려받지 못함 | 인터넷 연결을 확인하거나, 프로젝트에 `npm i -D eslint` 후 다시 실행한다 |
| URL 검사에서 JS 파일을 못 찾음 | 페이지의 `<script src>`가 상대 경로거나 CORS로 차단됨 | 문제되는 `.js` 파일을 직접 `--js-file`로 지정해 다시 실행한다 |

`--psi-key` 없이 쓰다가 `429`가 나오면, 로컬에 `lighthouse` 명령이 설치돼 있는 경우 자동으로 그쪽을 한 번 더 시도한다. 그것도 실패하면 결과에 두 실패 사유가 모두 담긴다.

## 하지 않는 것

- 승인 없이 사이트를 고치지 않는다. 보고서를 먼저 전달하고, 무엇을 고칠지 승인을 받은 뒤에 수정한다.
- 콘텐츠의 내용 품질(글이 믿을 만한지, 광고인지)은 판단하지 않는다. 문법과 기술 점수만 본다.
- 로그인이 필요한 페이지는 검사하지 못한다. 공개 URL만 다룬다.
