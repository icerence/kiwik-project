(function () {
  let resourcesData = {
    press: [],
    reports: [],
    brochures: [],
    notices: []
  };

  let currentTab = 'press';
  let searchQuery = '';

  let currentPages = {
    press: 1,
    report: 1,
    brochure: 1,
    notice: 1
  };

  const PRESS_PER_PAGE = 15;
  const REPORTS_PER_PAGE = 9;
  const NOTICES_PER_PAGE = 9;
  const PAGE_BLOCK_SIZE = 9;

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const match = dateStr.match(/^(\d{4})[.\-년]?\s*(\d{1,2})[.\-월]?\s*(\d{1,2})/);
    if (match) {
      const year = match[1];
      const month = parseInt(match[2], 10);
      const day = parseInt(match[3], 10);
      return `${year}년 ${month}월 ${day}일`;
    }
    return dateStr;
  }

  async function loadResources() {
    try {
      let response = await fetch('./resources.json');
      if (!response.ok) {
        response = await fetch('./data/resources.json');
      }
      if (!response.ok) {
        throw new Error(`resources.json 로딩 실패: ${response.status}`);
      }
      resourcesData = await response.json();

      renderActiveTab();
    } catch (error) {
      console.error('자료 데이터를 불러오지 못했습니다.', error);
    }
  }

  function initTabsAndSearch() {
    const tabButtons = document.querySelectorAll('.tabs button');
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const tabName = button.dataset.tab || 'press';
        currentTab = tabName;
        currentPages[currentTab] = 1;

        document.querySelectorAll('.panel').forEach(panel => {
          panel.classList.toggle('active', panel.id === tabName);
        });

        renderActiveTab();
      });
    });

    const searchForm = document.querySelector('.search');
    if (searchForm) {
      searchForm.addEventListener('submit', e => {
        e.preventDefault();
        const input = searchForm.querySelector('input');
        if (input) {
          searchQuery = input.value.trim().toLowerCase();
          currentPages[currentTab] = 1;
          renderActiveTab();
        }
      });

      const searchInput = searchForm.querySelector('input');
      if (searchInput) {
        searchInput.addEventListener('input', e => {
          searchQuery = e.target.value.trim().toLowerCase();
          currentPages[currentTab] = 1;
          renderActiveTab();
        });
      }
    }
  }

  function renderActiveTab() {
    if (currentTab === 'press') {
      renderPress();
    } else if (currentTab === 'report') {
      renderReports();
    } else if (currentTab === 'brochure') {
      renderBrochures();
    } else if (currentTab === 'notice') {
      renderNotices();
    }
  }

  // --- 1. Render Press Release Table ---
  function renderPress() {
    const panel = document.getElementById('press');
    if (!panel) return;

    const pressTable = panel.querySelector('.press-table');
    const paginationNav = panel.querySelector('.pagination');
    if (!pressTable) return;

    let items = resourcesData.press || [];
    if (searchQuery) {
      items = items.filter(item => (item.title || '').toLowerCase().includes(searchQuery));
    }

    // Keep table header row (.press-row.head)
    const existingRows = pressTable.querySelectorAll('.press-row:not(.head)');
    existingRows.forEach(r => r.remove());

    if (items.length === 0) {
      if (paginationNav) paginationNav.innerHTML = '';
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'press-row';
      emptyDiv.style.justifyContent = 'center';
      emptyDiv.style.color = '#7e8894';
      emptyDiv.textContent = searchQuery ? '검색 결과가 없습니다.' : '등록된 보도자료가 없습니다.';
      pressTable.appendChild(emptyDiv);
      return;
    }

    const totalPages = Math.ceil(items.length / PRESS_PER_PAGE);
    if (currentPages.press > totalPages) currentPages.press = totalPages;

    const startIndex = (currentPages.press - 1) * PRESS_PER_PAGE;
    const pageItems = items.slice(startIndex, startIndex + PRESS_PER_PAGE);

    pageItems.forEach(item => {
      const a = document.createElement('a');
      a.className = 'press-row';
      a.href = item.url || '#';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';

      const numSpan = document.createElement('span');
      numSpan.textContent = item.id || '';

      const titleB = document.createElement('b');
      titleB.textContent = item.title || '';

      const timeTag = document.createElement('time');
      timeTag.setAttribute('datetime', item.date || '');
      timeTag.textContent = formatDate(item.date);

      a.appendChild(numSpan);
      a.appendChild(titleB);
      a.appendChild(timeTag);

      pressTable.appendChild(a);
    });

    renderBlockPagination(paginationNav, totalPages, currentPages.press, page => {
      currentPages.press = page;
      renderPress();
    });
  }

  // --- 2. Render Sustainability Reports ---
  function renderReports() {
    const panel = document.getElementById('report');
    if (!panel) return;

    const reportGrid = panel.querySelector('.report-grid');
    let paginationNav = panel.querySelector('.report-pagination');
    
    if (!paginationNav) {
      paginationNav = document.createElement('div');
      paginationNav.className = 'pagination report-pagination';
      if (reportGrid && reportGrid.parentNode) {
        reportGrid.parentNode.insertBefore(paginationNav, reportGrid.nextSibling);
      }
    }

    if (!reportGrid) return;

    let items = [...(resourcesData.reports || [])];
    items.sort((a, b) => Number(b.year || 0) - Number(a.year || 0));

    if (searchQuery) {
      items = items.filter(item =>
        (item.title || '').toLowerCase().includes(searchQuery) ||
        (item.year && item.year.toString().includes(searchQuery))
      );
    }

    reportGrid.innerHTML = '';

    if (items.length === 0) {
      if (paginationNav) paginationNav.innerHTML = '';
      reportGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding: 40px; color:#7e8894;">${searchQuery ? '검색 결과가 없습니다.' : '등록된 보고서가 없습니다.'}</p>`;
      return;
    }

    const totalPages = Math.ceil(items.length / REPORTS_PER_PAGE);
    if (currentPages.report > totalPages) currentPages.report = totalPages;

    const startIndex = (currentPages.report - 1) * REPORTS_PER_PAGE;
    const pageItems = items.slice(startIndex, startIndex + REPORTS_PER_PAGE);

    pageItems.forEach(item => {
      const article = document.createElement('article');
      article.className = 'report-card';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'report-title';
      titleSpan.textContent = item.title || '';

      const coverWrap = document.createElement('div');
      coverWrap.className = 'report-cover';

      const img = document.createElement('img');
      img.src = item.coverImage || '';
      img.alt = item.title || '보고서 표지';
      img.loading = 'lazy';
      coverWrap.appendChild(img);

      const btnDiv = document.createElement('div');
      btnDiv.className = 'download-row';

      if (item.koPdf || item.url) {
        const koLink = document.createElement('a');
        koLink.href = item.koPdf || item.url;
        koLink.target = '_blank';
        koLink.rel = 'noopener noreferrer';
        koLink.textContent = '국문 ↓';
        btnDiv.appendChild(koLink);
      }

      if (item.enPdf) {
        const enLink = document.createElement('a');
        enLink.href = item.enPdf;
        enLink.target = '_blank';
        enLink.rel = 'noopener noreferrer';
        enLink.textContent = '영문 ↓';
        btnDiv.appendChild(enLink);
      }

      article.appendChild(titleSpan);
      article.appendChild(coverWrap);
      article.appendChild(btnDiv);

      reportGrid.appendChild(article);
    });

    renderBlockPagination(paginationNav, totalPages, currentPages.report, page => {
      currentPages.report = page;
      renderReports();
    });
  }

  // --- 3. Render Brochures ---
  function renderBrochures() {
    const panel = document.getElementById('brochure');
    if (!panel) return;

    const brochureGrid = panel.querySelector('.brochure-grid');
    if (!brochureGrid) return;

    let items = resourcesData.brochures || [];
    if (searchQuery) {
      items = items.filter(item =>
        (item.title || '').toLowerCase().includes(searchQuery) ||
        (item.description || '').toLowerCase().includes(searchQuery)
      );
    }

    brochureGrid.innerHTML = '';

    if (items.length === 0) {
      brochureGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding: 40px; color:#7e8894;">${searchQuery ? '검색 결과가 없습니다.' : '등록된 브로슈어가 없습니다.'}</p>`;
      return;
    }

    items.forEach(item => {
      const article = document.createElement('article');
      article.className = 'brochure-card';

      const img = document.createElement('img');
      img.src = item.coverImage || '';
      img.alt = item.title || '브로슈어 표지';
      img.loading = 'lazy';

      const contentDiv = document.createElement('div');

      const h4 = document.createElement('h4');
      h4.textContent = item.title || '';

      const p = document.createElement('p');
      p.innerHTML = (item.description || '').replace(/\n/g, '<br>');

      const dlLink = document.createElement('a');
      dlLink.href = item.downloadUrl || item.koPdf || '#';
      dlLink.target = '_blank';
      dlLink.rel = 'noopener noreferrer';
      dlLink.textContent = '다운로드 ↓';

      contentDiv.appendChild(h4);
      contentDiv.appendChild(p);
      contentDiv.appendChild(dlLink);

      article.appendChild(img);
      article.appendChild(contentDiv);

      brochureGrid.appendChild(article);
    });
  }

  // --- 4. Render Notices ---
  function renderNotices() {
    const panel = document.getElementById('notice');
    if (!panel) return;

    const noticeGrid = panel.querySelector('.notice-grid');
    const paginationNav = panel.querySelector('.pagination');
    if (!noticeGrid) return;

    let items = resourcesData.notices || [];
    if (searchQuery) {
      items = items.filter(item => (item.title || '').toLowerCase().includes(searchQuery));
    }

    noticeGrid.innerHTML = '';

    if (items.length === 0) {
      if (paginationNav) paginationNav.innerHTML = '';
      noticeGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding: 40px; color:#7e8894;">${searchQuery ? '검색 결과가 없습니다.' : '등록된 공지사항이 없습니다.'}</p>`;
      return;
    }

    const totalPages = Math.ceil(items.length / NOTICES_PER_PAGE);
    if (currentPages.notice > totalPages) currentPages.notice = totalPages;

    const startIndex = (currentPages.notice - 1) * NOTICES_PER_PAGE;
    const pageItems = items.slice(startIndex, startIndex + NOTICES_PER_PAGE);

    pageItems.forEach(item => {
      const a = document.createElement('a');
      a.href = item.url || '#';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';

      const h3 = document.createElement('h3');
      h3.textContent = item.title || '';

      const p = document.createElement('p');
      p.innerHTML = (item.summary || '').replace(/\n/g, '<br>');

      const timeTag = document.createElement('time');
      timeTag.setAttribute('datetime', item.date || '');
      timeTag.textContent = formatDate(item.date);

      a.appendChild(h3);
      a.appendChild(p);
      a.appendChild(timeTag);

      noticeGrid.appendChild(a);
    });

    renderBlockPagination(paginationNav, totalPages, currentPages.notice, page => {
      currentPages.notice = page;
      renderNotices();
    });
  }

  // --- Block Pagination Component (Max 9 page numbers per block) ---
  function renderBlockPagination(container, totalPages, pageCurrent, onPageClick) {
    if (!container) return;
    container.innerHTML = '';

    if (totalPages <= 1) return;

    const blockIndex = Math.floor((pageCurrent - 1) / PAGE_BLOCK_SIZE);
    const startPage = blockIndex * PAGE_BLOCK_SIZE + 1;
    const endPage = Math.min(startPage + PAGE_BLOCK_SIZE - 1, totalPages);

    // « First Page
    const firstBtn = document.createElement('button');
    firstBtn.textContent = '«';
    firstBtn.disabled = (pageCurrent === 1);
    firstBtn.addEventListener('click', () => onPageClick(1));
    container.appendChild(firstBtn);

    // ‹ Prev Page
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '‹';
    prevBtn.disabled = (pageCurrent === 1);
    prevBtn.addEventListener('click', () => onPageClick(Math.max(1, pageCurrent - 1)));
    container.appendChild(prevBtn);

    // Number Buttons (startPage .. endPage)
    for (let p = startPage; p <= endPage; p++) {
      const btn = document.createElement('button');
      btn.textContent = p;
      if (p === pageCurrent) {
        btn.className = 'current';
      }
      btn.addEventListener('click', () => onPageClick(p));
      container.appendChild(btn);
    }

    // › Next Page
    const nextBtn = document.createElement('button');
    nextBtn.textContent = '›';
    nextBtn.disabled = (pageCurrent === totalPages);
    nextBtn.addEventListener('click', () => onPageClick(Math.min(totalPages, pageCurrent + 1)));
    container.appendChild(nextBtn);

    // » Last Page
    const lastBtn = document.createElement('button');
    lastBtn.textContent = '»';
    lastBtn.disabled = (pageCurrent === totalPages);
    lastBtn.addEventListener('click', () => onPageClick(totalPages));
    container.appendChild(lastBtn);
  }

  function initEntranceAnimations() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    function runAnimation() {
      if (window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);

        const sectionSelectors = [
          '.page-head', '.center-intro', '.tabs',
          '.report-grid', '.brochure-grid', '.notice-grid',
          '.parts', '.brochure-parts', '.press-table',
          '.report-feature', '.brochure-hero', '.pagination'
        ];

        sectionSelectors.forEach((selector) => {
          const containers = document.querySelectorAll(selector);
          containers.forEach((container) => {
            if (container.dataset.entranceDone) return;

            const items = container.querySelectorAll(
              ':scope > *, .report-card, .brochure-card, .notice-grid > a, article'
            );
            const targets = items.length > 0 ? Array.from(items) : [container];

            gsap.fromTo(
              targets,
              { opacity: 0, y: 32 },
              {
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: 'power2.out',
                stagger: 0.1,
                scrollTrigger: {
                  trigger: container,
                  start: 'top 88%',
                  once: true,
                },
              }
            );

            container.dataset.entranceDone = 'true';
          });
        });
      } else {
        const observerOptions = {
          root: null,
          rootMargin: '0px 0px -40px 0px',
          threshold: 0.05,
        };

        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        }, observerOptions);

        const targets = document.querySelectorAll(
          '.page-head, .center-intro, .report-card, .brochure-card, .notice-grid > a, article, .press-table, .overview, .pagination'
        );

        targets.forEach((el) => {
          if (!el.classList.contains('entrance-reveal')) {
            el.classList.add('entrance-reveal');
            observer.observe(el);
          }
        });
      }
    }

    runAnimation();
    window.addEventListener('load', runAnimation);
  }

    function initSlidingCategoryTabs() {
      const containers = document.querySelectorAll('.tabs, .media-tabs, .news-tabs, .resource-tabs');

      containers.forEach(container => {
        let indicator = container.querySelector('.tab-sliding-indicator');
        if (!indicator) {
          indicator = document.createElement('div');
          indicator.className = 'tab-sliding-indicator';
          container.insertBefore(indicator, container.firstChild);
        }

        function moveIndicator(targetTab, animate = true) {
          if (!targetTab) return;

          if (!animate) {
            indicator.style.transition = 'none';
          } else {
            indicator.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), width 0.4s cubic-bezier(0.22, 1, 0.36, 1), height 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
          }

          const left = targetTab.offsetLeft;
          const top = targetTab.offsetTop;
          const width = targetTab.offsetWidth;
          const height = targetTab.offsetHeight;

          indicator.style.transform = `translate3d(${left}px, ${top}px, 0)`;
          indicator.style.width = `${width}px`;
          indicator.style.height = `${height}px`;

          if (!animate) {
            indicator.offsetHeight; // Force reflow
            indicator.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), width 0.4s cubic-bezier(0.22, 1, 0.36, 1), height 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
          }
        }

        const activeTab = container.querySelector('.selected, .active') || container.querySelector('button, a');
        if (activeTab) {
          setTimeout(() => moveIndicator(activeTab, false), 50);
        }

        const tabs = container.querySelectorAll('button, a');
        tabs.forEach(tab => {
          tab.addEventListener('click', (e) => {
            const href = tab.getAttribute('href') || tab.dataset.href;
            const isPageNavigation = href && href !== '#' && !href.startsWith('javascript:');

            tabs.forEach(t => {
              t.classList.remove('selected', 'active');
              t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('selected', 'active');
            tab.setAttribute('aria-selected', 'true');

            moveIndicator(tab, true);

            if (isPageNavigation) {
              e.preventDefault();
              setTimeout(() => {
                window.location.href = href;
              }, 380);
            }
          });
        });
      });

      window.addEventListener('resize', () => {
        containers.forEach(container => {
          const activeTab = container.querySelector('.selected, .active') || container.querySelector('button, a');
          if (activeTab) {
            let indicator = container.querySelector('.tab-sliding-indicator');
            if (indicator) {
              indicator.style.transition = 'none';
              const left = activeTab.offsetLeft;
              const top = activeTab.offsetTop;
              const width = activeTab.offsetWidth;
              const height = activeTab.offsetHeight;
              indicator.style.transform = `translate3d(${left}px, ${top}px, 0)`;
              indicator.style.width = `${width}px`;
              indicator.style.height = `${height}px`;
              indicator.offsetHeight;
              indicator.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), width 0.4s cubic-bezier(0.22, 1, 0.36, 1), height 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
            }
          }
        });
      });
    }

  document.addEventListener('DOMContentLoaded', () => {
    initTabsAndSearch();
    loadResources();
    // Scroll reveal is initialized once for every newsroom subpage by scroll-reveal.js.
    initSlidingCategoryTabs();
  });
})();
