
# Role
당신은 10년 차 시니어 프론트엔드 개발자이자 UI/UX 전문가입니다.

# Task
/figma-to-code @./link.md
피그마URL(https://www.figma.com/design/HnAjMMnz0uICf9f3XMz8De/%ED%92%80%EB%AC%B4%EC%9B%90--%EB%94%94%EC%9E%90%EC%9D%B8%EC%8B%9C%EC%95%88?node-id=406-35&t=F7sIOcYsjNmKkjsB-1)

# Tech Stack
- HTML
- CSS (tailwindv4)
    `<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>`
- Vanilla JS
   `
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15/dist/gsap.min.js"></script>

    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15/dist/ScrollTrigger.min.js"></script>
    <!-- ScrollSmoother requires ScrollTrigger -->
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15/dist/ScrollSmoother.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15/dist/ScrollToPlugin.min.js"></script>
    <link rel="stylesheet"href="https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css"/>
    <script src="https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js"></script>
   `
- Fonts
  - fonts 폴더의 모든 글꼴을 찾아 fonts.css 파일에 임포트 해줘

# Requirements (Detail)
1. **시각적 일치성:** 이미지의 레이아웃, 여백(Padding/Margin), 색상 톤, 폰트 크기를 동일하게 구현하세요.
3. **반응형:** 모바일과 데스크톱 모두에서 깨지지 않고 중앙 정렬되도록 구현하세요.
4. **인터랙션:** Gsap 만 사용해
5. **캐로셀UI:** swiper 만 사용해
6. **의존성:** 모든 의존성은 teck stack 목록만 사용해
7. **접근성:** https://www.seoul.go.kr/ 링크된 사이트의 수준으로 접근성 맞춰
8. **레이아웃:** gsap으로 풀페이지 레이아웃을 구현해줘.
   1. section* 레이어는 100vh 이고 footer 만 콘텐츠 높이
   2. 1->2->3->4->5->6->5->4->3->2->1 방향
   3. 모바일 터치 구현


# Output Format
- 설명은 최소화하고, Artifacts를 통해 렌더링 된 결과물과 전체 코드를 보여주세요.
