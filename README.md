# KIWIK — 풀무원 웹사이트 프로젝트

풀무원의 기업 소개, ESG 활동, 바른먹거리와 지구식단 콘텐츠를 여러 정적 페이지로 구현한 웹 프로젝트입니다. 공통 헤더와 푸터를 재사용하며 데스크톱과 모바일 화면에 대응합니다.

## 배포 주소

- GitHub Pages: https://icerence.github.io/kiwik-project/
- 저장소: https://github.com/icerence/kiwik-project

## 주요 페이지

| 영역 | 시작 페이지 | 내용 |
| --- | --- | --- |
| 홈 | `index.html` | 프로젝트 메인 화면 |
| 회사소개 | `company.html` | CEO 인사말, CI, 연혁, 가치체계, 사업 및 투자정보 |
| 사회책임경영 | `sub1-responsive.html` | 개요, 추진전략, 활동 및 실적, 수상내역 |
| 바른먹거리 | `food.html` | 지속가능 식생활·식품, 바른먹거리 원칙과 캠페인, 품질정책 |
| 지구식단 | `earthmeal1.html` | 지구로그와 팝업스토어 |
| 뉴스룸 | `pulmuone-newsroom/newsroom.html` | 풀무원 뉴스, ESG, 멀티미디어, 자료 및 공지 |
| 쇼핑 | `shop.html` | 바른먹거리 상품 소개 |

## 기술 구성

- HTML5
- Tailwind CSS v4 Browser CDN
- Vanilla JavaScript
- GSAP 및 ScrollTrigger
- Swiper
- GitHub Pages

별도의 빌드 과정 없이 브라우저에서 실행하는 정적 웹사이트입니다.

## 프로젝트 구조

```text
kiwik-project/
├─ index.html                 # 메인 페이지
├─ company*.html             # 회사소개 페이지
├─ sub*-responsive.html      # 사회책임경영 페이지
├─ food*.html                # 바른먹거리 페이지
├─ earthmeal*.html           # 지구식단 페이지
├─ shop.html                 # 쇼핑 페이지
├─ common/                   # 공통 헤더·푸터·스타일·스크립트
├─ assets/
│  ├─ css/                   # 페이지별·공통 스타일
│  ├─ js/                    # 메인 및 반응형 동작
│  ├─ fonts/                 # 로컬 웹폰트
│  ├─ icons/                 # SVG 아이콘
│  └─ images/                # 페이지 이미지
├─ pulmuone-newsroom/        # 뉴스룸 페이지·데이터·수집 스크립트
└─ docs/                     # 검사 및 작업 보고서
```

## 로컬 실행

저장소를 내려받은 후 프로젝트 루트에서 정적 서버를 실행합니다.

```bash
git clone https://github.com/icerence/kiwik-project.git
cd kiwik-project
npx serve .
```

터미널에 표시되는 로컬 주소로 접속하면 됩니다. 일부 공통 컴포넌트는 HTML 조각을 불러오므로 파일을 직접 여는 방식보다 로컬 서버 사용을 권장합니다.

## 공통 컴포넌트

`common/header.html`과 `common/footer.html`을 각 페이지에서 동적으로 불러옵니다. 공통 레이아웃과 반응형 내비게이션은 `common/components.css`, `common/components.js`에서 관리합니다.

공통 컴포넌트를 수정한 뒤 정적 페이지에 동기화가 필요하면 다음 스크립트를 확인할 수 있습니다.

```bash
node common/sync-common.mjs
node common/sync-esg.mjs
```

## 품질 검사 문서

HTML·CSS·JavaScript 문법과 Lighthouse 품질 검사 결과는 `docs/`에 보관합니다. 검사 보고서와 실제 수정 보고서를 구분하여 기록하며, 공개 URL의 점수는 GitHub Pages 배포가 완료된 뒤 다시 측정해야 최신 코드가 반영됩니다.

## 참고 자료

- [Figma 초안](https://www.figma.com/design/VbmurylfKZBI68KYdGqnd9/%EC%B4%88%EC%95%88?node-id=6-1144&t=leT5tQnlnwnK0X4D-4)

