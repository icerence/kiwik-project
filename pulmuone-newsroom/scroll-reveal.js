(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const groups = [
    { container: '.intro, .page-head', targets: ':scope > *' },
    { container: '.tabs, .media-tabs, .news-tabs, .resource-tabs', targets: ':scope' },
    { container: '.news-list', targets: ':scope > .news-card' },
    { container: '.featured-video', targets: ':scope > *' },
    { container: '.video-grid', targets: ':scope > .video-card' },
    { container: '.esg-hero', targets: '.esg-hero-copy > *' },
    { container: '#featured', targets: '.section-heading, .featured-story, .esg-card-grid > article' },
    { container: '#videos', targets: '.section-heading, .esg-video' },
    { container: '#esg-news', targets: '.section-heading, .esg-news-grid > article' },
    { container: '.center-intro', targets: ':scope' },
    { container: '.report-feature', targets: ':scope > *' },
    { container: '.parts', targets: ':scope > article' },
    { container: '.report-grid', targets: ':scope > .report-card' },
    { container: '.brochure-hero', targets: ':scope' },
    { container: '.brochure-parts', targets: ':scope > article' },
    { container: '.brochure-grid', targets: ':scope > .brochure-card' },
    { container: '.notice-grid', targets: ':scope > a' },
    { container: '.section-title, .archive-note, .press-table, .overview, .pagination', targets: ':scope' },
  ];

  const pending = new Map();
  let scanFrame = 0;

  function isRenderable(element) {
    return element.getClientRects().length > 0 && !element.hidden;
  }

  function reveal(elements) {
    elements.forEach((element, index) => {
      if (element.dataset.scrollRevealDone) return;
      element.dataset.scrollRevealDone = 'true';

      if (reduceMotion) {
        element.classList.add('is-scroll-revealed');
        return;
      }

      const animation = element.animate(
        [
          { opacity: 0, translate: '0 28px' },
          { opacity: 1, translate: '0 0' },
        ],
        {
          duration: 700,
          delay: index * 90,
          easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          fill: 'both',
        }
      );

      animation.addEventListener('finish', () => {
        element.classList.add('is-scroll-revealed');
        animation.cancel();
      }, { once: true });
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const elements = pending.get(entry.target) || [];
      const renderable = elements.filter(isRenderable);
      if (renderable.length === 0) return;

      reveal(renderable);
      pending.delete(entry.target);
      observer.unobserve(entry.target);
    });
  }, {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.04,
  });

  function collectTargets(container, selector) {
    const candidates = selector === ':scope'
      ? [container]
      : Array.from(container.querySelectorAll(selector));

    return candidates.filter((element) => !element.dataset.scrollRevealDone);
  }

  function scan() {
    scanFrame = 0;

    groups.forEach(({ container: containerSelector, targets }) => {
      document.querySelectorAll(containerSelector).forEach((container) => {
        const elements = collectTargets(container, targets);
        if (elements.length === 0) return;

        elements.forEach((element) => element.classList.add('scroll-reveal-item'));
        pending.set(container, elements);
        observer.observe(container);
      });
    });
  }

  function scheduleScan() {
    if (scanFrame) return;
    scanFrame = window.requestAnimationFrame(scan);
  }

  const mutationObserver = new MutationObserver(scheduleScan);
  mutationObserver.observe(document.getElementById('content') || document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'hidden', 'style'],
  });

  scan();
  window.addEventListener('load', scheduleScan, { once: true });
  document.addEventListener('newsroom-data-rendered', scheduleScan);
}());
