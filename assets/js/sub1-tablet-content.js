// 태블릿(768~1199px) 전용 보조 스크립트.
// 콘텐츠(텍스트/아이콘)는 sub1-responsive.html 하단 인라인 스크립트가
// #capital-grid / #orbit / #output-grid 를 모든 브레이크포인트 공용으로 1회만 생성한다.
// 이 파일은 그 결과물 위에 태블릿 CSS(sub1-tablet-fix.css, sub1-tablet-content.css)가
// 요구하는 클래스(.page/.cap/.grid/.heading)가 항상 붙어 있도록 보장하는
// 방어적 안전망 역할만 하며, innerHTML을 다시 쓰지 않는다(중복 렌더링 방지를 위해
// 콘텐츠 생성 책임은 인라인 스크립트 하나로 통일했다).
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('page');
  document.querySelectorAll('.model .business > .card').forEach((el) => el.classList.add('cap'));
  const grid = document.querySelector('.output .output-grid');
  if (grid) grid.classList.add('grid');
  const heading = document.querySelector('.output .center-title');
  if (heading) heading.classList.add('heading');
  document.querySelectorAll('.output .output-grid > .output-card').forEach((el) => el.classList.add('cap'));
});
