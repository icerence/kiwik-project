# 풀무원 Eco-Caring — Figma 시안 코드 구현 작업 보고

- 대상: `kiwik-fresh` / `main`
- 시안 파일: Figma `kbQt32SGSRHikH6GlYj2vc`
- 작성일: 2026-08-10

## 요약

| 항목 | 값 |
|---|---|
| 구현한 시안 | 3건 |
| 풀페이지 단계 | 6단계 (기존 8단계) |
| 하드코딩 위반 | 0건 |
| 판단 필요 | 4건 |
| 보류 | 1건 |

## 1. 범위

`link.md`의 시안 3개를 모두 처리했다. 홈은 이미 코드가 있어 재대조·보정으로, 서브 페이지는 신규 생성으로 진행했다.

| 시안 | node | 성격 | 결과 파일 |
|---|---|---|---|
| pc[home] | 3004:1250 | 재대조 | `index.html` |
| mobile[home] | 3007:2502 | 재대조 | `index.html` |
| pc[sub] | 3040:535 | 신규 | `sub.html` |

## 2. 홈 — 구조 정정

편집 파일: `index.html`, `assets/css/style.css`, `assets/js/main.js`

가장 큰 발견은 개별 스타일 차이가 아니라 **페이지 구조 자체가 시안과 달랐다**는 점이다. 시안의 최상위 프레임은 PC·모바일 모두 6개인데 코드는 8단계였다. 시안에 대응 노드가 없는 4개 블록을 삭제해 `code.md`가 요구한 `1→2→3→4→5→6` 구조와 일치시켰다.

### 2.1 삭제한 블록

| 블록 | 기존 위치 | 시안 대응 노드 |
|---|---|---|
| 친환경 케어, 실천으로 증명하는 약속 | `index.html:436–457` | 없음 |
| 풀무원의 발자국 (섹션 전체) | `index.html:491–525` | 없음 |
| 풀무원 지구식단 + CTA | `index.html:603–640` | 없음 |
| NATURE POSITIVE (모바일 전용) | `index.html:478–486` | 없음. 주석의 근거 노드 3007:2579는 실재하지 않음 |

### 2.2 구조 변경에 딸려 정리한 것

- 앵커 재번호 — Hero `#section1` / Mission-Impact `#section2` / Manifesto `#section3` / Newsroom `#section4` / SNS `#section5` / `#site-footer`
- 헤더 내비·유틸리티 바·도트 내비(8개 → 6개) 링크 갱신
- `main.js`에서 사라진 발자국 캐로셀의 `csr` Swiper 설정 제거
- 이동 대상을 고정 배열에서 `rebuildTargets()`로 교체해 **지금 실제로 보이는 패널만** 대상으로 삼게 함. `gsap.matchMedia()`로 1024px 경계를 처리해 모바일 5단계 / 데스크톱 6단계가 자동 전환된다
- 모바일 시안에 SNS 섹션이 없어 `hidden lg:block`으로 숨김. `display:none`이라 스크린리더에서도 빠진다

### 2.3 시안대로 보정한 항목

| 항목 | 위치 | 시안 근거 |
|---|---|---|
| 섹션 영문 부제를 제목 위로 이동 + PC에서 숨김 | `index.html:341, 416` | 3007:2523 / 3004:1350 |
| 카드가 흰/초록 배경 경계를 가로지르도록 | `index.html:336` | 3004:2217 (y=436 → 40.4%) |
| 모바일 Mission 전체를 초록 배경으로 | `index.html:336` | 3007:2521 |
| 카드 모바일 테두리·액센트 바 제거, padding 20→40px | `style.css` `.value-card` | 3007:2526 / 3004:1352 |
| 전략 아이콘 모바일 4열 1행 + 짧은 라벨 | `index.html:387–410` | 3007:2547 |
| Stat Block 라벨 `text-xl` → `text-base` | `index.html:423–435` | 3004:1411 |
| 뉴스 리스트를 카드형(테두리·radius·144px 정사각 썸네일)으로 | `index.html:497–534` | 3004:1298 / 3007:2593 |
| 대표 이미지 비율 2/1 → 15/8 | `index.html:96` | 3004:1293 (750×400) |
| 모바일 푸터 2열 + 영문 병기 + K·Y·IG 배지 | `index.html:646–685` | 3009:196, 3009:216 |
| 지구식단 배너를 헤더 여백 없이 풀블리드로 | `index.html:449` | 3004:1415 |

### 2.4 추가한 @theme 토큰

모두 Figma 실측값이며, 하드코딩 대신 토큰을 먼저 등록하고 참조했다.

| 토큰 | 값 | 근거 |
|---|---|---|
| `--spacing-accent-bar` | 4px | 3004:1353 |
| `--spacing-news-thumb` | 144px | 3004:1299 |
| `--spacing-news-thumb-w-mobile` | 90px | 3007:2594 |
| `--spacing-news-thumb-h-mobile` | 70px | 3007:2594 |
| `--spacing-social-pill-w` / `-h` | 36px / 19px | 3009:244 |
| `--aspect-featured` (값 정정) | 2/1 → 15/8 | 3004:1293 |

### 2.5 작업 중 발견해 고친 버그

`.social-pill`이 선언한 `display:inline-flex`가 Tailwind `lg:hidden`을 이겨 데스크톱에서 K·Y·IG 배지가 노출됐다. Tailwind v4 유틸리티는 `@layer utilities`에 들어가는데 `style.css`는 레이어 밖이라 항상 이긴다. 숨김을 `style.css` 내부 미디어 쿼리로 옮겨 해결했다.

> 주의: `style.css`에서 `display`를 선언하는 클래스에 Tailwind `hidden` 계열을 붙이면 같은 함정에 빠진다.

## 3. 서브 페이지 — 신규

생성 파일: `sub.html`

기사 상세 레이아웃이다. Hero Banner 450px → Breadcrumbs → 본문 800px + 사이드바 340px 2열(gap 60px) → 푸터. 사이드바는 추천 콘텐츠 3장과 E-REPORT 다운로드 CTA로 구성된다.

- 헤더·푸터는 `index.html` 마크업을 그대로 재사용했다. 시안에서도 같은 컴포넌트 인스턴스다
- `assets/css/sub.css`는 만들지 않았다. 커스텀 규칙이 2열 그리드 하나뿐이라 `@utility grid-article`로 해결했고, Play CDN이 외부 CSS의 `@theme`을 읽지 못하는 제약도 함께 피했다
- 접근성: Breadcrumbs는 `nav` + `aria-label`, 본문은 `article`, 사이드바는 `aside`, 이미지 캡션은 `figure`/`figcaption`. 시안이 텍스트 불릿 기호로 그린 목록은 `ul`/`li`로 옮겼다
- 풀페이지 레이아웃은 적용하지 않았다. `code.md` 8항은 홈 전용 요구이고 서브는 2223px 문서 스크롤 페이지다
- 모바일 서브 시안이 없어 값을 창작하지 않고 `index.html` 관례(`lg:` 64rem, 1열 스택)를 따랐다

### 3.1 임시 대체한 이미지

시안 전용 사진이 저장소에 없어 기존 파일로 채웠다. 모두 마크업에 주석으로 표기돼 있다.

| 시안 위치 | 필요한 에셋 | 임시 대체 |
|---|---|---|
| Hero Banner 배경 | 숲 햇살 사진 | `assets/images/forest.png` |
| 본문 사진 | 친환경 패키지 용기 | `assets/images/product-1.png` |
| 추천 카드 썸네일 1 | 재활용 지구 일러스트 | `assets/images/about-media.png` |
| 추천 카드 썸네일 2 | 샐러드볼 사진 | `assets/images/community-1.png` |
| 추천 카드 썸네일 3 | 수자원 지구 일러스트 | `assets/images/eco-farm.png` |
| Download Callout 아이콘 | `circle-x` | `assets/icons/file-text.svg` |

## 4. 정리 작업

- **에셋 위치 통합** — 루트 `assets/`에 흩어져 있던 png 8개를 `git mv`로 `assets/images/`에 모으고 참조를 갱신했다. `assets/images/` 밖 이미지 참조는 0건이다
- **링크 정합성** — `sub.html`이 옛 8섹션 번호를 가리키고 있어 8곳을 새 번호로 재매핑했고, 홈에서 제거된 티스토리 아이콘을 서브 푸터에서도 빼 SNS 4개로 맞췄다. `sub.html`이 참조하는 앵커 5개가 `index.html`에 전부 실재함을 확인했다

## 4.5 `pr.md` 지시 반영

| 항목 | 결과 |
|---|---|
| 1. Hero 스크림 방향 | 변경 없음(지시대로). 시안을 렌더해 봤으나 사진 원본 명암과 스크림을 분해해 구분하지 않은 상태라 뒤집을 근거가 없었다 |
| 2. SNS 아이콘 | 유튜브 해석 + 티스토리 제거로 확정. 변경 없음 |
| 3. 뉴스 캐로셀 | `slidesPerView: 1` + `grid: { rows: 2 }`. 4개 항목이 한 슬라이드 2장씩 2페이지 |
| 4. 미사용 이미지 | `award` · `hero-hands` · `mou` · `news-card` · `product-2` 삭제. `sns-tistory.png`는 보존 |
| 5. Hero 100vh + gnb floating | 헤더 높이 padding 제거로 사진이 100vh를 채우고, `.site-header--float`를 `main.js`가 Hero 구간에서만 토글 |
| 6. gnb 사회책임경영 | `index.html` → `sub.html`, `sub.html`은 자기 자신(`aria-current="page"`) |
| 7. 파일 정리 룰 | `CLAUDE.md`에 자리 표 + 지킬 것 5가지 추가 |
| 8. 토큰은 디자인시스템 참조 | `design-system-harness.md` 토큰 규칙을 "값의 출처" + "참조 방식"으로 재작성 |

### gnb floating의 제약

로고(`logo-pulmuone.png`)가 어두운 글자라 **완전 투명 헤더로는 사진 위에서 읽히지 않는다.**
흰색 로고 에셋이 없어 반투명 흰 판(72%) + `backdrop-filter: blur(10px)`로 처리했다.
완전 투명을 하려면 흰색 로고 에셋이 먼저 필요하다.

## 4.6 디자인시스템 토큰 정렬

출처: kiwik_design_system `3lXGBmQuUQ1RYM2cwhfyum`, Color Palette `12:34`

값이 어긋나거나 시스템에 없던 토큰을 정리했다.

| 변경 | 전 | 후 |
|---|---|---|
| 값 정정 | `--color-gray-700: #374151`(Tailwind 기본) | `#40444d` (`color/gray/700`) |
| 이름·값 교체 | `--color-brand-700: #65a80f`(시스템에 없음) | `--color-lime-600: #60a10c` |
| 토큰 제거 | `--color-stat-bg: #263826` | `bg-green-900` 직접 사용 |
| 토큰 제거 | `--color-cta: #6ba842` | `bg-brand` 직접 사용 |

역할 이름 별칭을 시스템 변수 경로로 통일했다.

| 전 | 후 | 시스템 변수 |
|---|---|---|
| `--color-text-primary` | `--color-gray-800` | `color/gray/800` |
| `--color-text-secondary` | `--color-gray-600` | `color/gray/600` |
| `--color-text-invert` | `--color-white` | `color/white` |
| `--color-footer-body` | `--color-gray-500` | `color/gray/500` |
| `--color-badge-brand` | `--color-lime-100` → 제거 | 사용처 0건이라 삭제 |
| `--color-accent-globe` | `--color-green-400` → 제거 | 사용처 0건이라 삭제 |

## 4.7 작업 중 발견해 고친 기존 버그

뉴스 Swiper가 초기화되는 순간 **컨테이너 폭이 33,554,428px로 폭주**하고 있었다.
`grid` 옵션 없이 기존 설정으로도 동일하게 재현되어 이번 변경과 무관한 기존 버그로 확인했다.

원인은 `.card-swiper`가 CSS grid 셀의 자식인데 `min-width: auto`(기본값)라 콘텐츠 아래로 줄지 못해,
Swiper가 wrapper에 픽셀 폭을 써 넣는 순간 트랙이 함께 밀리는 되먹임이다.
`.card-swiper`에 `min-width: 0; max-width: 100%`를 넣어 끊었다.

## 5. 판단이 필요한 항목

### 5.1 Hero 스크림 방향 — 시안과 접근성이 충돌

시안 Hero는 오른쪽이 밝은데, 코드는 오른쪽으로 어두워지는 그라디언트를 쓴다. 우측 하단 흰 글자의 대비 확보용이라 시안대로 되돌리지 않았다. `code.md` 7항(접근성)과 정면으로 부딪히는 지점이다.

### 5.2 푸터 SNS 아이콘 해석 — 미확정

시안 아이콘 4개 중 첫 번째가 회색 재생 삼각형이라 유튜브로 읽고 티스토리를 제거했다. 시안 노드가 인스턴스라 파일명을 직접 읽을 수 없어 확정이 아니다.

### 5.3 뉴스 4번째 카드 — 모바일에서 제거 불가

모바일 시안(3007:2592)은 카드 3장이지만, 모바일에서 이 목록은 Swiper 캐로셀이라 슬라이드를 숨기면 빈 칸이 생긴다. 4장을 유지하고 사유를 주석으로 남겼다.

### 5.4 sub.html의 색 4개 — 디자인시스템에 없음

`sub.html`이 sub 시안에서 가져온 아래 4개는 kiwik 디자인시스템에 없는 **Tailwind 기본 팔레트 값**이다.
규칙("시스템에 없는 값은 임의로 만들지 말고 멈추고 물어본다")에 따라 손대지 않았다.

| 토큰 | 현재 값 | 같은 역할의 시스템 변수 |
|---|---|---|
| `--color-text-body` | `#4b5563` | `color/gray/600` `#535964` |
| `--color-text-grey-out` | `#9ca3af` | `color/gray/400` `#9ca1ab` |
| `--color-text-strong` | `#030712` | `color/gray/950` `#17191c` |
| `--color-border-grey-out` | `#e5e7eb` | `color/gray/200` `#d9dade` |

시스템 값으로 바꾸면 서브 페이지 본문·캡션·구분선 색이 미세하게 달라진다. 승인 필요.

### 5.5 글자 크기 토큰 — 디자인시스템과 체계가 다름

디자인시스템 Typography(`23:1273`)의 크기 체계는 **고정 스텝**(12·14·16·18·20·24·30·36·48·60·72·96·128)이다.
반면 코드의 `--text-hero` · `--text-section` · `--text-display*` · `--text-stat` · `--text-card*`는
1920px 캔버스 기준 `clamp()` 유동값이다.

고정 스텝으로 바꾸면 반응형 거동이 통째로 달라지고 페이지 시안과도 어긋난다.
어느 쪽을 기준으로 삼을지 결정이 필요해 손대지 않았다.
참고로 `font/family/sans`는 `NanumSquare Neo`로 코드와 일치한다.

### 5.6 스크림 색 — 시스템에 없음

`--color-scrim-hero` · `--color-scrim-banner` · `--color-scrim-mobile-via` · `--color-scrim-banner-bottom`은
`rgba(0,0,0,α)` 알파 오버레이라 시스템 팔레트에 대응 변수가 없다. `token-exempt`로 표기한 채 두었다.

## 6. 보류

**`main.js` 풀페이지 가드** — `sub.html`은 `main.js`를 링크하지 못한다. `.panel`이 없으면 이동 대상이 푸터 하나뿐이 되어, 위로 스크롤할 때 `goTo(-1)`이 푸터로 강제 이동시켜 스크롤이 잠기기 때문이다(`main.js:149–166`). 현재는 모바일 메뉴 토글과 GSAP 등장 애니메이션만 `sub.html` 인라인 스크립트로 넣어 회피한 상태다. 근본 해결은 `main.js`가 풀페이지 페이지에서만 동작하도록 가드를 넣는 것이다.

## 7. 검증 근거

- **하드코딩** — `.claude/hooks/check-hardcode.fixed.mjs`를 `sub.html` 전문에 실행해 exit 0. `style.css`에 raw hex/rgb 없음, `index.html`에 arbitrary 클래스 대괄호 표기 없음
- **브라우저 실측** — 로컬 서버에서 Chrome 1440×900 / 390×844로 확인. 콘솔 오류·경고 0건, 데스크톱 6패널 · 모바일 5패널 전환 동작, 섹션별 스크린샷을 시안과 대조
- **서브 페이지 실측(1600px)** — 그리드 800px + 340px, gap 60px, Hero 450px, 썸네일 80px, callout 테두리색이 브랜드 green-700과 일치, 본문 line-height 32.4px(=18×1.8), 기사 제목 40.06px @1600 → 48px @1920
- **링크** — `sub.html`이 참조하는 `index.html` 앵커 5개가 모두 실재. 루트 `assets/*.png` 0개

---

이 문서의 수치·노드 ID는 Figma MCP와 로컬 실행 결과에서 직접 확인한 값이다. 5절의 4개 항목과 6절 보류 1건은 확정되지 않은 상태다.
