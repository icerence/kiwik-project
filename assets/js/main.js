/* ------------------------------------------------------------------
   main.js
   - GSAP(ScrollTrigger + ScrollToPlugin)으로 풀페이지 섹션 이동
     section1 → section2 → ... → section5 → footer, 그리고 역방향
     (= Figma 시안의 Hero · Mission-Impact · Manifesto · Newsroom · Social + Footer 6단계.
      모바일에서는 SNS가 빠져 5단계가 된다 — rebuildTargets가 매번 다시 계산한다.)
   - 마우스 휠 / 터치 스와이프 / 키보드 / 앵커 링크 / 도트 내비 지원
   - 카드 줄은 좁은 화면에서만 Swiper 캐로셀로 전환
   외부 의존성은 index.html에 선언한 GSAP·Swiper 뿐이다.
   ------------------------------------------------------------------ */
/* global gsap, ScrollTrigger, ScrollToPlugin, history */

(function () {
  'use strict';

  if (!window.gsap) return;

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopQuery = window.matchMedia('(min-width: 1024px)');

  // 모바일은 문서의 기본 스크롤만 사용한다. 이전에 내려받은 main.js가 남아
  // 있더라도 휠·터치 이벤트를 가로채 섹션 단위로 이동시키지 않는다.
  if (!desktopQuery.matches) return;

  const panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
  const footer = document.getElementById('site-footer');
  let targets = [];
  let lastIndex = 0;

  /* 모바일 시안에는 SNS 섹션이 없어 lg 미만에서 display:none으로 감춘다.
     그래서 이동 대상 목록은 "지금 실제로 보이는 패널"만으로 매번 다시 만든다. */
  function rebuildTargets() {
    const previous = targets[currentIndex] || null;

    targets = panels.filter(function (panel) {
      return panel.getClientRects().length > 0;
    });
    if (footer) targets.push(footer);
    lastIndex = Math.max(0, targets.length - 1);

    const moved = previous ? targets.indexOf(previous) : -1;
    currentIndex = moved === -1 ? Math.min(currentIndex, lastIndex) : moved;
  }

  const dotLinks = Array.prototype.slice.call(document.querySelectorAll('.dot-nav__link'));

  let currentIndex = 0;
  let isAnimating = false;

  /* ---------------- 이동 ---------------- */

  function reduceMotion() {
    return reduceMotionQuery.matches;
  }

  function targetTop(index) {
    const el = targets[index];
    if (el === footer) {
      return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    }
    return el.getBoundingClientRect().top + window.scrollY;
  }

  // Hero 섹션에서는 헤더가 사진 위에 떠 있고, 벗어나면 흰 배경으로 돌아온다.
  const siteHeader = document.getElementById('site-header');

  function syncHeaderFloat() {
    if (!siteHeader) return;
    siteHeader.classList.toggle('site-header--float', currentIndex === 0);
  }

  function syncNav() {
    syncHeaderFloat();

    const id = targets[currentIndex] ? targets[currentIndex].id : '';
    dotLinks.forEach(function (link) {
      const isCurrent = link.getAttribute('href') === '#' + id;
      if (isCurrent) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function goTo(index, options) {
    const opts = options || {};
    index = Math.max(0, Math.min(lastIndex, index));

    currentIndex = index;
    syncNav();

    const y = targetTop(index);
    isAnimating = true;

    gsap.to(window, {
      duration: reduceMotion() ? 0 : 0.9,
      ease: 'power2.inOut',
      scrollTo: { y: y, autoKill: false },
      onComplete: function () {
        isAnimating = false;
        if (opts.focus) {
          focusSection(targets[index]);
        }
      }
    });
  }

  function focusSection(el) {
    if (!el) return;
    const heading = el.querySelector('h1, h2');
    const focusTarget = heading || el;
    if (!focusTarget.hasAttribute('tabindex')) {
      focusTarget.setAttribute('tabindex', '-1');
    }
    focusTarget.focus({ preventScroll: true });
  }

  function indexOfId(id) {
    for (let i = 0; i < targets.length; i += 1) {
      if (targets[i].id === id) return i;
    }
    return -1;
  }

  /* ---------------- 패널 안쪽 스크롤 우선 ---------------- */

  function scrollerOf(node) {
    if (!node || !node.closest) return null;
    return node.closest('.panel__scroll');
  }

  function scrollerHasRoom(scroller, direction) {
    if (!scroller) return false;
    const max = scroller.scrollHeight - scroller.clientHeight;
    if (max <= 1) return false;
    if (direction > 0) return scroller.scrollTop < max - 1;
    return scroller.scrollTop > 1;
  }

  /* ---------------- 휠 ---------------- */

  window.addEventListener('wheel', function (event) {
    if (event.ctrlKey) return;

    const direction = event.deltaY > 0 ? 1 : -1;
    const scroller = scrollerOf(event.target);

    if (scrollerHasRoom(scroller, direction)) return;

    // 마지막 대상(푸터)에서 아래로 더 내릴 여지가 있으면 브라우저 기본 스크롤에 맡긴다.
    if (!scroller && currentIndex === lastIndex && direction > 0) return;

    event.preventDefault();

    if (isAnimating) return;
    if (Math.abs(event.deltaY) < 4) return;

    goTo(currentIndex + direction);
  }, { passive: false });

  /* ---------------- 터치 ---------------- */

  let touchStartX = 0;
  let touchStartY = 0;
  let touchScroller = null;

  window.addEventListener('touchstart', function (event) {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchScroller = scrollerOf(event.target);
  }, { passive: true });

  window.addEventListener('touchmove', function (event) {
    const touch = event.touches[0];
    const deltaY = touchStartY - touch.clientY;
    const deltaX = touchStartX - touch.clientX;

    // 가로 제스처는 Swiper 캐로셀 몫이므로 건드리지 않는다.
    if (Math.abs(deltaX) > Math.abs(deltaY)) return;

    const direction = deltaY > 0 ? 1 : -1;
    if (scrollerHasRoom(touchScroller, direction)) return;
    if (!touchScroller && currentIndex === lastIndex && direction > 0) return;

    event.preventDefault();
  }, { passive: false });

  window.addEventListener('touchend', function (event) {
    const touch = event.changedTouches[0];
    const deltaY = touchStartY - touch.clientY;
    const deltaX = touchStartX - touch.clientX;

    if (Math.abs(deltaY) < 60) return;
    if (Math.abs(deltaX) > Math.abs(deltaY)) return;

    const direction = deltaY > 0 ? 1 : -1;
    if (scrollerHasRoom(touchScroller, direction)) return;
    if (isAnimating) return;

    goTo(currentIndex + direction);
  }, { passive: true });

  /* ---------------- 키보드 ---------------- */

  window.addEventListener('keydown', function (event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target.closest && event.target.closest('input, textarea, select, [contenteditable]')) return;

    const key = event.key;
    let direction = 0;

    if (key === 'ArrowDown' || key === 'PageDown') direction = 1;
    else if (key === 'ArrowUp' || key === 'PageUp') direction = -1;
    else if (key === 'Home') {
      event.preventDefault();
      goTo(0, { focus: true });
      return;
    } else if (key === 'End') {
      event.preventDefault();
      goTo(lastIndex, { focus: true });
      return;
    } else {
      return;
    }

    const scroller = scrollerOf(document.activeElement) || scrollerOf(targets[currentIndex]);
    if (scrollerHasRoom(scroller, direction)) return;

    event.preventDefault();
    if (isAnimating) return;
    goTo(currentIndex + direction);
  });

  /* ---------------- 앵커 링크 ---------------- */

  document.addEventListener('click', function (event) {
    const link = event.target.closest ? event.target.closest('a[href^="#"]') : null;
    if (!link) return;

    const id = link.getAttribute('href').slice(1);
    if (!id) return;

    const index = indexOfId(id);
    if (index === -1) return;

    event.preventDefault();
    closeMenu();
    goTo(index, { focus: true });
  });

  /* ---------------- 모바일 메뉴 ---------------- */

  const menuToggle = document.getElementById('menu-toggle');
  const primaryNav = document.getElementById('primary-nav');

  function closeMenu() {
    if (!menuToggle || !primaryNav) return;
    if (!primaryNav.classList.contains('is-open')) return;

    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '메뉴 열기');

    if (reduceMotion()) {
      primaryNav.classList.remove('is-open');
      return;
    }

    // 열 때 GSAP이 남긴 인라인 opacity/transform이 CSS 전환을 덮어써서
    // 클래스만 떼면 닫히지 않는다. slideUp으로 직접 애니메이션한 뒤 클래스를 뗀다.
    gsap.to(primaryNav, {
      autoAlpha: 0,
      y: -8,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: function () {
        primaryNav.classList.remove('is-open');
        gsap.set(primaryNav, { clearProps: 'opacity,visibility,transform' });
      }
    });
  }

  if (menuToggle && primaryNav) {
    menuToggle.addEventListener('click', function () {
      if (primaryNav.classList.contains('is-open')) {
        closeMenu();
        return;
      }

      primaryNav.classList.add('is-open');
      menuToggle.setAttribute('aria-expanded', 'true');
      menuToggle.setAttribute('aria-label', '메뉴 닫기');

      if (!reduceMotion()) {
        gsap.fromTo(primaryNav, { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power2.out' });
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });
  }

  /* ---------------- 등장 애니메이션 ---------------- */

  function buildEntranceAnimations() {
    if (reduceMotion()) return;

    panels.forEach(function (panel) {
      const blocks = panel.querySelectorAll('.panel__block > *, .hero__inner > *');
      if (!blocks.length) return;

      gsap.from(blocks, {
        y: 32,
        autoAlpha: 0,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: panel,
          start: 'top 60%',
          once: true
        }
      });
    });

    gsap.to('.scroll-cue', {
      y: 6,
      duration: 0.8,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    });
  }

  /* ---------------- Swiper 캐로셀 ---------------- */

  const swipers = {};

  const swiperOptions = {
    value: {
      slidesPerView: 1.1,
      spaceBetween: 16,
      breakpoints: { 640: { slidesPerView: 2.1 } }
    },
    // 뉴스는 가로형 리스트 카드라 옆으로 두 장을 놓으면 좁다.
    // 한 슬라이드에 세로로 2장씩 담아 4개 항목이 2페이지가 되게 한다.
    news: {
      slidesPerView: 1,
      spaceBetween: 16,
      grid: { rows: 2, fill: 'row' }
    }
  };

  function syncSwipers() {
    const shouldRun = !desktopQuery.matches;

    Object.keys(swiperOptions).forEach(function (key) {
      const el = document.querySelector('.card-swiper[data-swiper="' + key + '"]');
      if (!el) return;

      if (shouldRun && !swipers[key]) {
        const options = Object.assign({}, swiperOptions[key], {
          a11y: {
            enabled: true,
            prevSlideMessage: '이전 항목',
            nextSlideMessage: '다음 항목',
            paginationBulletMessage: '{{index}}번째 항목으로 이동',
            slideLabelMessage: '전체 {{slidesLength}}개 중 {{index}}번째'
          },
          pagination: {
            el: el.querySelector('.swiper-pagination'),
            clickable: true
          }
        });
        swipers[key] = new window.Swiper(el, options);
      } else if (!shouldRun && swipers[key]) {
        swipers[key].destroy(true, true);
        swipers[key] = null;
        delete swipers[key];
      }
    });
  }

  /* ---------------- 초기화 ---------------- */

  /* 브레이크포인트가 바뀌면 보이는 패널 구성이 달라지므로 GSAP matchMedia로 다시 맞춘다. */
  function watchBreakpoints() {
    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px)', function () {
      rebuildTargets();
      syncNav();
    });

    mm.add('(max-width: 1023.98px)', function () {
      rebuildTargets();
      syncNav();
    });
  }

  function init() {
    rebuildTargets();
    watchBreakpoints();
    syncNav();
    buildEntranceAnimations();

    if (window.Swiper) syncSwipers();

    const hashIndex = window.location.hash ? indexOfId(window.location.hash.slice(1)) : -1;
    if (hashIndex > 0) {
      goTo(hashIndex);
    } else {
      window.scrollTo(0, 0);
    }
  }

  let resizeTimer = null;
  window.addEventListener('resize', function () {
    if (window.Swiper) syncSwipers();
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      rebuildTargets();
      syncNav();
      ScrollTrigger.refresh();
      if (!isAnimating) {
        window.scrollTo(0, targetTop(currentIndex));
      }
    }, 200);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 브라우저가 이전 스크롤 위치를 복원했을 때 현재 섹션 표시와 어긋나지 않게 맞춘다.
  function syncFromScroll() {
    const y = window.scrollY;
    let nearest = 0;
    let best = Infinity;

    for (let i = 0; i < targets.length; i += 1) {
      const distance = Math.abs(targetTop(i) - y);
      if (distance < best) {
        best = distance;
        nearest = i;
      }
    }

    currentIndex = nearest;
    syncNav();
    if (best > 1) window.scrollTo(0, targetTop(nearest));
  }

  window.addEventListener('load', function () {
    ScrollTrigger.refresh();
    if (!window.location.hash) syncFromScroll();
  });
})();
