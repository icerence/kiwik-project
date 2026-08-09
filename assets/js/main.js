/* ------------------------------------------------------------------
   main.js
   - GSAP(ScrollTrigger + ScrollToPlugin)으로 풀페이지 섹션 이동
     section1 → section2 → ... → section6 → footer, 그리고 역방향
   - 마우스 휠 / 터치 스와이프 / 키보드 / 앵커 링크 / 도트 내비 지원
   - 카드 줄은 좁은 화면에서만 Swiper 캐로셀로 전환
   외부 의존성은 index.html에 선언한 GSAP·Swiper 뿐이다.
   ------------------------------------------------------------------ */

(function () {
  'use strict';

  if (!window.gsap) return;

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  var reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var desktopQuery = window.matchMedia('(min-width: 1024px)');

  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
  var footer = document.getElementById('site-footer');
  var targets = footer ? panels.concat([footer]) : panels;
  var lastIndex = targets.length - 1;

  var dotLinks = Array.prototype.slice.call(document.querySelectorAll('.dot-nav__link'));

  var currentIndex = 0;
  var isAnimating = false;

  /* ---------------- 이동 ---------------- */

  function reduceMotion() {
    return reduceMotionQuery.matches;
  }

  function targetTop(index) {
    var el = targets[index];
    if (el === footer) {
      return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    }
    return el.getBoundingClientRect().top + window.scrollY;
  }

  // 상단 유틸리티 바는 첫 번째 섹션에서만 보인다.
  var utilityBar = document.getElementById('utility-bar');
  var utilityShown = true;

  function syncUtilityBar() {
    if (!utilityBar) return;

    var shouldShow = currentIndex === 0;
    if (shouldShow === utilityShown) return;
    utilityShown = shouldShow;

    document.body.classList.toggle('is-header-compact', !shouldShow);

    var state = shouldShow
      ? { height: 'auto', autoAlpha: 1 }
      : { height: 0, autoAlpha: 0 };

    if (reduceMotion()) {
      gsap.set(utilityBar, state);
      return;
    }

    gsap.to(utilityBar, {
      height: state.height,
      autoAlpha: state.autoAlpha,
      duration: 0.35,
      ease: 'power2.out'
    });
  }

  function syncNav() {
    syncUtilityBar();

    var id = targets[currentIndex] ? targets[currentIndex].id : '';
    dotLinks.forEach(function (link) {
      var isCurrent = link.getAttribute('href') === '#' + id;
      if (isCurrent) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function goTo(index, options) {
    var opts = options || {};
    index = Math.max(0, Math.min(lastIndex, index));

    currentIndex = index;
    syncNav();

    var y = targetTop(index);
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
    var heading = el.querySelector('h1, h2');
    var focusTarget = heading || el;
    if (!focusTarget.hasAttribute('tabindex')) {
      focusTarget.setAttribute('tabindex', '-1');
    }
    focusTarget.focus({ preventScroll: true });
  }

  function indexOfId(id) {
    for (var i = 0; i < targets.length; i += 1) {
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
    var max = scroller.scrollHeight - scroller.clientHeight;
    if (max <= 1) return false;
    if (direction > 0) return scroller.scrollTop < max - 1;
    return scroller.scrollTop > 1;
  }

  /* ---------------- 휠 ---------------- */

  window.addEventListener('wheel', function (event) {
    if (event.ctrlKey) return;

    var direction = event.deltaY > 0 ? 1 : -1;
    var scroller = scrollerOf(event.target);

    if (scrollerHasRoom(scroller, direction)) return;

    // 마지막 대상(푸터)에서 아래로 더 내릴 여지가 있으면 브라우저 기본 스크롤에 맡긴다.
    if (!scroller && currentIndex === lastIndex && direction > 0) return;

    event.preventDefault();

    if (isAnimating) return;
    if (Math.abs(event.deltaY) < 4) return;

    goTo(currentIndex + direction);
  }, { passive: false });

  /* ---------------- 터치 ---------------- */

  var touchStartX = 0;
  var touchStartY = 0;
  var touchScroller = null;

  window.addEventListener('touchstart', function (event) {
    var touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchScroller = scrollerOf(event.target);
  }, { passive: true });

  window.addEventListener('touchmove', function (event) {
    var touch = event.touches[0];
    var deltaY = touchStartY - touch.clientY;
    var deltaX = touchStartX - touch.clientX;

    // 가로 제스처는 Swiper 캐로셀 몫이므로 건드리지 않는다.
    if (Math.abs(deltaX) > Math.abs(deltaY)) return;

    var direction = deltaY > 0 ? 1 : -1;
    if (scrollerHasRoom(touchScroller, direction)) return;
    if (!touchScroller && currentIndex === lastIndex && direction > 0) return;

    event.preventDefault();
  }, { passive: false });

  window.addEventListener('touchend', function (event) {
    var touch = event.changedTouches[0];
    var deltaY = touchStartY - touch.clientY;
    var deltaX = touchStartX - touch.clientX;

    if (Math.abs(deltaY) < 60) return;
    if (Math.abs(deltaX) > Math.abs(deltaY)) return;

    var direction = deltaY > 0 ? 1 : -1;
    if (scrollerHasRoom(touchScroller, direction)) return;
    if (isAnimating) return;

    goTo(currentIndex + direction);
  }, { passive: true });

  /* ---------------- 키보드 ---------------- */

  window.addEventListener('keydown', function (event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target.closest && event.target.closest('input, textarea, select, [contenteditable]')) return;

    var key = event.key;
    var direction = 0;

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

    var scroller = scrollerOf(document.activeElement) || scrollerOf(targets[currentIndex]);
    if (scrollerHasRoom(scroller, direction)) return;

    event.preventDefault();
    if (isAnimating) return;
    goTo(currentIndex + direction);
  });

  /* ---------------- 앵커 링크 ---------------- */

  document.addEventListener('click', function (event) {
    var link = event.target.closest ? event.target.closest('a[href^="#"]') : null;
    if (!link) return;

    var id = link.getAttribute('href').slice(1);
    if (!id) return;

    var index = indexOfId(id);
    if (index === -1) return;

    event.preventDefault();
    closeMenu();
    goTo(index, { focus: true });
  });

  /* ---------------- 모바일 메뉴 ---------------- */

  var menuToggle = document.getElementById('menu-toggle');
  var primaryNav = document.getElementById('primary-nav');

  function closeMenu() {
    if (!menuToggle || !primaryNav) return;
    primaryNav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '메뉴 열기');
  }

  if (menuToggle && primaryNav) {
    menuToggle.addEventListener('click', function () {
      var willOpen = !primaryNav.classList.contains('is-open');
      primaryNav.classList.toggle('is-open', willOpen);
      menuToggle.setAttribute('aria-expanded', String(willOpen));
      menuToggle.setAttribute('aria-label', willOpen ? '메뉴 닫기' : '메뉴 열기');

      if (willOpen && !reduceMotion()) {
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
      var blocks = panel.querySelectorAll('.panel__block > *, .hero__inner > *');
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

  var swipers = {};

  var swiperOptions = {
    value: {
      slidesPerView: 1.1,
      spaceBetween: 16,
      breakpoints: { 640: { slidesPerView: 2.1 } }
    },
    csr: {
      slidesPerView: 1.1,
      spaceBetween: 16
    },
    news: {
      slidesPerView: 1.1,
      spaceBetween: 16,
      breakpoints: { 640: { slidesPerView: 2.1 } }
    }
  };

  function syncSwipers() {
    var shouldRun = !desktopQuery.matches;

    Object.keys(swiperOptions).forEach(function (key) {
      var el = document.querySelector('.card-swiper[data-swiper="' + key + '"]');
      if (!el) return;

      if (shouldRun && !swipers[key]) {
        var options = Object.assign({}, swiperOptions[key], {
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

  function init() {
    syncNav();
    buildEntranceAnimations();

    if (window.Swiper) syncSwipers();

    var hashIndex = window.location.hash ? indexOfId(window.location.hash.slice(1)) : -1;
    if (hashIndex > 0) {
      goTo(hashIndex);
    } else {
      window.scrollTo(0, 0);
    }
  }

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    if (window.Swiper) syncSwipers();
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
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
    var y = window.scrollY;
    var nearest = 0;
    var best = Infinity;

    for (var i = 0; i < targets.length; i += 1) {
      var distance = Math.abs(targetTop(i) - y);
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
