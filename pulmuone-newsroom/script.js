// Mobile Menu & Global Navigation
const menuButton = document.querySelector('.menu-button');
const globalNav = document.querySelector('.global-nav');
const newsroomNav = document.querySelector('.nav-newsroom');
const navTrigger = document.querySelector('.nav-trigger');

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  globalNav?.classList.toggle('open', !open);
});

function setDropdown(open) {
  newsroomNav?.classList.toggle('dropdown-open', open);
  navTrigger?.setAttribute('aria-expanded', String(open));
}

newsroomNav?.addEventListener('pointerenter', () => {
  if (window.matchMedia('(min-width: 901px)').matches) setDropdown(true);
});

newsroomNav?.addEventListener('pointerleave', () => {
  if (window.matchMedia('(min-width: 901px)').matches) setDropdown(false);
});

newsroomNav?.addEventListener('focusin', () => setDropdown(true));
newsroomNav?.addEventListener('focusout', event => {
  if (!newsroomNav.contains(event.relatedTarget)) setDropdown(false);
});

navTrigger?.addEventListener('click', event => {
  if (window.matchMedia('(max-width: 900px)').matches) {
    event.preventDefault();
    setDropdown(!newsroomNav.classList.contains('dropdown-open'));
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    setDropdown(false);
    navTrigger?.focus();
  }
});

document.querySelector('[data-search-focus]')?.addEventListener('click', () => {
  document.querySelector('input[type="search"]')?.focus();
});

// Dynamic Newsroom Data Management (Vanilla JS)
const newsPanel = document.getElementById('news-panel');

if (newsPanel) {
  const ITEMS_PER_PAGE = 6;
  const PAGE_GROUP_SIZE = 10;

  let allNewsData = [];
  let currentCategory = '기업뉴스';
  let currentSearchQuery = '';
  let currentPage = 1;

  /**
   * Format date string (YYYY-MM-DD) to Korean display string (YYYY년 M월 D일)
   */
  function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    const match = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (match) {
      return `${match[1]}년 ${parseInt(match[2], 10)}월 ${parseInt(match[3], 10)}일`;
    }
    return dateStr;
  }

  /**
   * Get filtered news items based on current category and search query
   */
  function getFilteredItems() {
    return allNewsData.filter(item => {
      const matchCategory = item.category === currentCategory;
      if (!matchCategory) return false;

      if (!currentSearchQuery) return true;

      const q = currentSearchQuery.toLowerCase();
      const titleMatch = item.title && item.title.toLowerCase().includes(q);
      const descMatch = item.description && item.description.toLowerCase().includes(q);
      return titleMatch || descMatch;
    });
  }

  /**
   * Render .news-card items for the current page
   */
  function renderNewsList(items) {
    // Remove existing news cards
    const existingCards = newsPanel.querySelectorAll('.news-card');
    existingCards.forEach(card => card.remove());

    const emptyMessage = newsPanel.querySelector('.empty-message');

    if (items.length === 0) {
      if (emptyMessage) {
        emptyMessage.textContent = currentSearchQuery ? '검색 결과가 없습니다.' : '등록된 뉴스가 없습니다.';
        emptyMessage.hidden = false;
      }
      return;
    }

    if (emptyMessage) {
      emptyMessage.hidden = true;
    }

    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = items.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    pageItems.forEach((item, index) => {
      const article = document.createElement('article');
      article.className = 'news-card';

      const img = document.createElement('img');
      img.className = 'thumbnail';
      img.width = 360;
      img.height = 220;
      // 첫 카드는 초기 화면(LCP 후보)이라 즉시 로드하고, 나머지는 지연 로드한다.
      if (index === 0) {
        img.loading = 'eager';
        img.fetchPriority = 'high';
      } else {
        img.loading = 'lazy';
      }
      img.src = item.image || 'assets/news-01.png';
      img.alt = item.title || '풀무원 뉴스 이미지';
      img.onerror = () => {
        img.onerror = null;
        img.src = 'assets/news-01.png';
      };

      const copy = document.createElement('div');
      copy.className = 'news-copy';

      const span = document.createElement('span');
      span.textContent = item.category || '기업뉴스';

      const h2 = document.createElement('h2');
      const a = document.createElement('a');
      a.href = item.url || '#';
      a.textContent = item.title;
      h2.appendChild(a);

      const p = document.createElement('p');
      const rawDesc = item.description || '';
      p.textContent = rawDesc.length > 160 ? rawDesc.slice(0, 160).trim() + '…' : rawDesc;

      const time = document.createElement('time');
      time.setAttribute('datetime', item.date || '');
      time.textContent = formatDateDisplay(item.date);

      copy.appendChild(span);
      copy.appendChild(h2);
      copy.appendChild(p);
      copy.appendChild(time);

      article.appendChild(img);
      article.appendChild(copy);

      newsPanel.appendChild(article);
    });
  }

  /**
   * Render pagination controls (Displays 1-10 page group size identical to desktop web)
   */
  function renderPagination(totalItems) {
    const paginationNav = document.querySelector('.pagination');
    if (!paginationNav) return;

    paginationNav.innerHTML = '';

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 0) return;

    const startPage = Math.floor((currentPage - 1) / PAGE_GROUP_SIZE) * PAGE_GROUP_SIZE + 1;
    const endPage = Math.min(startPage + PAGE_GROUP_SIZE - 1, totalPages);

    function createPageBtn(label, targetPage, isDisabled, isCurrent = false, extraClass = '') {
      const el = isDisabled ? document.createElement('button') : document.createElement('a');
      if (isDisabled) {
        el.type = 'button';
        el.disabled = true;
      } else {
        el.href = '#';
      }
      el.textContent = label;
      if (extraClass) el.classList.add(extraClass);
      if (isCurrent) {
        el.classList.add('current');
        el.setAttribute('aria-current', 'page');
      }
      if (!isDisabled) {
        el.addEventListener('click', e => {
          e.preventDefault();
          if (currentPage !== targetPage) {
            currentPage = targetPage;
            renderNews();
          }
        });
      }
      return el;
    }

    // « First Page
    paginationNav.appendChild(createPageBtn('«', 1, currentPage === 1, false, 'page-btn-first'));

    // ‹ Prev Page
    paginationNav.appendChild(createPageBtn('‹', Math.max(1, currentPage - 1), currentPage === 1, false, 'page-btn-prev'));

    // Numbered Pages (1..10)
    for (let p = startPage; p <= endPage; p++) {
      paginationNav.appendChild(createPageBtn(String(p), p, false, p === currentPage, 'page-btn-num'));
    }

    // › Next Page
    paginationNav.appendChild(createPageBtn('›', Math.min(totalPages, currentPage + 1), currentPage === totalPages, false, 'page-btn-next'));

    // » Last Page
    paginationNav.appendChild(createPageBtn('»', totalPages, currentPage === totalPages, false, 'page-btn-last'));
  }

  /**
   * Update news list and pagination UI
   */
  function renderNews() {
    const filteredItems = getFilteredItems();
    renderNewsList(filteredItems);
    renderPagination(filteredItems.length);
  }

  /**
   * Load JSON news data via fetch
   */
  async function loadNewsData() {
    try {
      let response = await fetch('./newsroom.json');
      if (!response.ok) {
        response = await fetch('./data/newsroom.json');
      }
      if (!response.ok) {
        response = await fetch('./data/news.json');
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      allNewsData = await response.json();
      renderNews();
    } catch (error) {
      console.error('뉴스 데이터를 불러오지 못했습니다.', error);
      newsPanel.querySelectorAll('.news-card').forEach(card => card.remove());
      const emptyMessage = newsPanel.querySelector('.empty-message');
      if (emptyMessage) {
        emptyMessage.textContent = '뉴스 데이터를 불러오지 못했습니다.';
        emptyMessage.hidden = false;
      }
    }
  }

  // Tab Event Listeners
  const tabButtons = document.querySelectorAll('.news-tabs [role="tab"]');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => {
        btn.classList.remove('selected');
        btn.setAttribute('aria-selected', 'false');
      });
      button.classList.add('selected');
      button.setAttribute('aria-selected', 'true');

      currentCategory = button.textContent.trim();
      currentPage = 1;
      renderNews();
    });
  });

  // Search Event Listener
  const searchForm = document.querySelector('form.search');
  if (searchForm) {
    searchForm.addEventListener('submit', event => {
      event.preventDefault();
      const input = searchForm.querySelector('input[type="search"]');
      currentSearchQuery = input ? input.value.trim() : '';
      currentPage = 1;
      renderNews();
    });

    const searchInput = searchForm.querySelector('input[type="search"]');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        if (searchInput.value.trim() === '' && currentSearchQuery !== '') {
          currentSearchQuery = '';
          currentPage = 1;
          renderNews();
        }
      });
    }
  }

  // Initial Load
  loadNewsData();
} else {
  // Non-newsroom pages fallback search
  document.querySelectorAll('form[role="search"]').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const input = form.querySelector('input[type="search"]');
      const query = input?.value.trim().toLocaleLowerCase('ko') || '';
      const selector = document.body.classList.contains('page-multimedia') || document.body.classList.contains('page-resources')
        ? '.filter-card'
        : '.news-card';
      const cards = [...document.querySelectorAll(selector)];
      if (!cards.length) return;
      let visible = 0;
      cards.forEach(card => {
        const match = !query || card.textContent.toLocaleLowerCase('ko').includes(query);
        card.hidden = !match;
        if (match) visible += 1;
      });
      const empty = document.querySelector('.empty-message');
      if (empty) empty.hidden = visible !== 0;
    });
  });
}

// ESG Page Dynamic Data Renderer (page-esg)
if (document.body.classList.contains('page-esg')) {
  let cachedEsgData = null;

  function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    const match = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (match) {
      const mm = match[2].padStart(2, '0');
      const dd = match[3].padStart(2, '0');
      return `${match[1]}.${mm}.${dd}`;
    }
    return dateStr.replace(/-/g, '.');
  }

  function truncateText(str, maxLen) {
    if (!str) return '';
    const cleanStr = str.trim().replace(/\s+/g, ' ');
    if (cleanStr.length <= maxLen) return cleanStr;
    return cleanStr.slice(0, maxLen).trim() + '…';
  }

  function renderFeaturedSection(featuredList) {
    const featuredStory = document.querySelector('.featured-story');
    const esgCardGrid = document.querySelector('.esg-card-grid');
    const emptyMsg = document.querySelector('#featured .empty-message');

    if (!featuredList || featuredList.length === 0) {
      if (featuredStory) featuredStory.style.display = 'none';
      if (esgCardGrid) esgCardGrid.style.display = 'none';
      if (emptyMsg) emptyMsg.hidden = false;
      return;
    }

    if (emptyMsg) emptyMsg.hidden = true;

    // 1. Featured Main Story (featuredList[0])
    if (featuredStory) {
      featuredStory.style.display = '';
      const mainItem = featuredList[0];

      const img = featuredStory.querySelector('img');
      if (img) {
        img.src = mainItem.image || 'assets/esg-feature.png';
        img.alt = mainItem.title || '풀무원 ESG 스토리';
        img.onerror = () => { img.onerror = null; img.src = 'assets/esg-feature.png'; };
      }

      const span = featuredStory.querySelector('span');
      if (span) span.textContent = mainItem.category || '기획자료';

      const h3 = featuredStory.querySelector('h3');
      if (h3) {
        h3.innerHTML = `<a href="${mainItem.url || '#'}" style="color:inherit;text-decoration:none;">${mainItem.title}</a>`;
      }

      const p = featuredStory.querySelector('p');
      if (p) p.textContent = truncateText(mainItem.description, 150);

      const storyMetaB = featuredStory.querySelector('.story-meta b');
      if (storyMetaB) storyMetaB.textContent = mainItem.category || '기획자료';

      const time = featuredStory.querySelector('time');
      if (time) {
        time.setAttribute('datetime', mainItem.date || '');
        time.textContent = formatDateDisplay(mainItem.date);
      }

      const arrowLink = featuredStory.querySelector('a.circle-arrow');
      if (arrowLink) arrowLink.href = mainItem.url || '#';
    }

    // 2. Featured Sub Cards Grid (featuredList[1..3])
    if (esgCardGrid) {
      const subItems = featuredList.slice(1, 4);
      const cardArticles = esgCardGrid.querySelectorAll('article');

      if (subItems.length === 0) {
        esgCardGrid.style.display = 'none';
      } else {
        esgCardGrid.style.display = '';
        cardArticles.forEach((article, idx) => {
          if (idx < subItems.length) {
            const item = subItems[idx];
            article.style.display = '';

            const img = article.querySelector('img');
            if (img) {
              img.src = item.image || `assets/esg-card-0${idx + 1}.png`;
              img.alt = item.title;
              img.onerror = () => { img.onerror = null; img.src = `assets/esg-card-0${idx + 1}.png`; };
            }

            const span = article.querySelector('span');
            if (span) span.textContent = item.category || '기획자료';

            const h3 = article.querySelector('h3');
            if (h3) {
              h3.innerHTML = `<a href="${item.url || '#'}" style="color:inherit;text-decoration:none;">${item.title}</a>`;
            }

            const p = article.querySelector('p');
            if (p) {
              const dateStr = formatDateDisplay(item.date);
              const desc = truncateText(item.description, 40);
              p.textContent = dateStr && desc ? `${dateStr} · ${desc}` : (dateStr || desc);
            }
          } else {
            article.style.display = 'none';
          }
        });
      }
    }
  }

  function renderVideoSection(videosList) {
    const esgVideo = document.querySelector('.esg-video');
    if (!esgVideo || !videosList || videosList.length === 0) return;

    const videoItem = videosList[0];
    const img = esgVideo.querySelector('img');
    if (img) {
      img.src = videoItem.image || 'assets/esg-video.png';
      img.alt = videoItem.title || 'ESG 영상';
      img.onerror = () => { img.onerror = null; img.src = 'assets/esg-video.png'; };
    }

    const h3 = esgVideo.querySelector('h3');
    if (h3) h3.textContent = videoItem.title;

    const p = esgVideo.querySelector('p');
    if (p) p.textContent = videoItem.description;

    const playLink = esgVideo.querySelector('a');
    if (playLink) playLink.href = videoItem.url || '#';
  }

  function renderNewsSection(newsList) {
    const esgNewsGrid = document.querySelector('.esg-news-grid');
    if (!esgNewsGrid || !newsList || newsList.length === 0) return;

    const newsItems = newsList.slice(0, 4);
    const newsArticles = esgNewsGrid.querySelectorAll('article');

    newsArticles.forEach((article, idx) => {
      if (idx < newsItems.length) {
        const item = newsItems[idx];
        article.style.display = '';

        const img = article.querySelector('img');
        if (img) {
          img.src = item.image || `assets/esg-news-0${idx + 1}.png`;
          img.alt = item.title;
          img.onerror = () => { img.onerror = null; img.src = `assets/esg-news-0${idx + 1}.png`; };
        }

        const span = article.querySelector('span');
        if (span) span.textContent = item.category || 'ESG뉴스';

        const h3 = article.querySelector('h3');
        if (h3) {
          h3.innerHTML = `<a href="${item.url || '#'}" style="color:inherit;text-decoration:none;">${item.title}</a>`;
        }

        const time = article.querySelector('time');
        if (time) {
          time.setAttribute('datetime', item.date || '');
          time.textContent = formatDateDisplay(item.date);
        }
      } else {
        article.style.display = 'none';
      }
    });
  }

  async function loadEsgData() {
    try {
      let response = await fetch('./esg.json');
      if (!response.ok) {
        response = await fetch('./data/esg.json');
      }
      if (!response.ok) {
        console.error('ESG 데이터를 불러오지 못했습니다. HTTP ' + response.status);
        return;
      }

      cachedEsgData = await response.json();
      const { featured = [], videos = [], news = [] } = cachedEsgData;

      renderFeaturedSection(featured);
      renderVideoSection(videos);
      renderNewsSection(news);
    } catch (e) {
      console.error('ESG 데이터 로딩 중 에러가 발생했습니다.', e);
    }
  }

  // ESG Compact Search Listener (targets featured section)
  const compactSearchForm = document.querySelector('form.compact-search');
  if (compactSearchForm) {
    function handleEsgSearch(query) {
      if (!cachedEsgData || !cachedEsgData.featured) return;

      const q = query.trim().toLowerCase();
      if (!q) {
        renderFeaturedSection(cachedEsgData.featured);
        return;
      }

      const filtered = cachedEsgData.featured.filter(item => {
        const titleMatch = item.title && item.title.toLowerCase().includes(q);
        const descMatch = item.description && item.description.toLowerCase().includes(q);
        return titleMatch || descMatch;
      });

      renderFeaturedSection(filtered);
    }

    compactSearchForm.addEventListener('submit', event => {
      event.preventDefault();
      const input = compactSearchForm.querySelector('input[type="search"]');
      handleEsgSearch(input ? input.value : '');
    });

    const searchInput = compactSearchForm.querySelector('input[type="search"]');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        if (searchInput.value.trim() === '') {
          handleEsgSearch('');
        }
      });
    }
  }

  loadEsgData();
}

// Multimedia Page Dynamic Data Renderer (page-multimedia)
if (document.body.classList.contains('page-multimedia')) {
  const MEDIA_ITEMS_PER_PAGE = 7;
  const PAGE_GROUP_SIZE = 10;

  let allMultimediaData = [];
  let currentCategory = '회사 동영상';
  let currentSearchQuery = '';
  let currentPage = 1;

  function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    const match = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (match) {
      return `${match[1]}년 ${parseInt(match[2], 10)}월 ${parseInt(match[3], 10)}일`;
    }
    return dateStr;
  }

  function formatMetaText(item) {
    const parts = [];
    if (item.language) parts.push(item.language);
    if (item.date) parts.push(formatDateDisplay(item.date));
    if (item.views) parts.push(`조회수 ${item.views}`);
    return parts.join(' · ');
  }

  function getFilteredItems() {
    return allMultimediaData.filter(item => {
      const matchCategory = item.category === currentCategory;
      if (!matchCategory) return false;

      if (!currentSearchQuery) return true;

      const q = currentSearchQuery.toLowerCase();
      const titleMatch = item.title && item.title.toLowerCase().includes(q);
      const descMatch = item.description && item.description.toLowerCase().includes(q);
      return titleMatch || descMatch;
    });
  }

  function renderMultimedia() {
    const mediaPanel = document.getElementById('media-panel');
    if (!mediaPanel) return;

    const filteredItems = getFilteredItems();
    const emptyMessage = mediaPanel.querySelector('.empty-message');
    const featuredVideo = mediaPanel.querySelector('.featured-video');
    const videoGrid = mediaPanel.querySelector('.video-grid');
    const paginationNav = document.querySelector('.pagination');

    if (filteredItems.length === 0) {
      if (featuredVideo) featuredVideo.style.display = 'none';
      if (videoGrid) videoGrid.style.display = 'none';
      if (paginationNav) paginationNav.innerHTML = '';
      if (emptyMessage) {
        emptyMessage.textContent = currentSearchQuery ? '검색 결과가 없습니다.' : '등록된 영상이 없습니다.';
        emptyMessage.hidden = false;
      }
      return;
    }

    if (emptyMessage) emptyMessage.hidden = true;

    // Calculate Page Slicing (7 items per page: 1 featured + up to 6 grid cards)
    const startIndex = (currentPage - 1) * MEDIA_ITEMS_PER_PAGE;
    const pageItems = filteredItems.slice(startIndex, startIndex + MEDIA_ITEMS_PER_PAGE);

    const mainFeaturedItem = pageItems[0];
    const gridItems = pageItems.slice(1);

    // 1. Render Featured Video / Content
    if (featuredVideo && mainFeaturedItem) {
      featuredVideo.style.display = '';

      const targetUrl = mainFeaturedItem.videoUrl || mainFeaturedItem.url || '#';
      const hasVideo = Boolean(mainFeaturedItem.videoUrl && mainFeaturedItem.videoUrl.trim() !== '');

      // Thumbnail Image
      const img = featuredVideo.querySelector('.video-cover img');
      if (img) {
        img.src = mainFeaturedItem.image || 'assets/media-feature.png';
        img.alt = mainFeaturedItem.title || '대표 콘텐츠';
        img.onerror = () => { img.onerror = null; img.src = 'assets/media-feature.png'; };
      }

      // Play Icon visibility
      const playIcon = featuredVideo.querySelector('.youtube-play');
      if (playIcon) {
        playIcon.style.display = hasVideo ? '' : 'none';
      }

      // Cover click link
      const cover = featuredVideo.querySelector('.video-cover');
      if (cover) {
        cover.style.cursor = 'pointer';
        cover.onclick = (e) => {
          e.preventDefault();
          window.location.href = targetUrl;
        };
      }

      // Copy Text
      const copy = featuredVideo.querySelector('.featured-video-copy');
      if (copy) {
        const span = copy.querySelector('span');
        if (span) {
          const catLabel = mainFeaturedItem.category || '대표 콘텐츠';
          span.textContent = mainFeaturedItem.language ? `${catLabel} · ${mainFeaturedItem.language}` : catLabel;
        }

        const h2 = copy.querySelector('h2');
        if (h2) {
          h2.innerHTML = `<a href="${targetUrl}" style="color:inherit;text-decoration:none;">${mainFeaturedItem.title}</a>`;
        }

        const p = copy.querySelector('p');
        if (p) p.textContent = mainFeaturedItem.description || '';

        const small = copy.querySelector('small');
        if (small) small.textContent = formatMetaText(mainFeaturedItem);
      }
    } else if (featuredVideo) {
      featuredVideo.style.display = 'none';
    }

    // 2. Render Video Grid Cards
    if (videoGrid) {
      videoGrid.innerHTML = '';
      if (gridItems.length > 0) {
        videoGrid.style.display = '';
        gridItems.forEach(item => {
          const targetUrl = item.videoUrl || item.url || '#';
          const hasVideo = Boolean(item.videoUrl && item.videoUrl.trim() !== '');

          const article = document.createElement('article');
          article.className = 'video-card filter-card';
          article.style.cursor = 'pointer';
          article.addEventListener('click', (e) => {
            if (!e.target.closest('a')) {
              window.location.href = targetUrl;
            }
          });

          const div = document.createElement('div');

          const img = document.createElement('img');
          img.width = 960;
          img.height = 540;
          img.loading = 'lazy';
          img.src = item.image || 'assets/media-01.png';
          img.alt = item.title || '썸네일';
          img.onerror = () => { img.onerror = null; img.src = 'assets/media-01.png'; };
          div.appendChild(img);

          // Render play button ONLY if videoUrl exists
          if (hasVideo) {
            const playSpan = document.createElement('span');
            playSpan.className = 'youtube-play';
            const playImg = document.createElement('img');
            playImg.src = 'assets/youtube_icon.svg';
            playImg.width = 72;
            playImg.height = 50;
            playImg.alt = '재생';
            playSpan.appendChild(playImg);
            div.appendChild(playSpan);
          }

          const h3 = document.createElement('h3');
          const a = document.createElement('a');
          a.href = targetUrl;
          a.style.color = 'inherit';
          a.style.textDecoration = 'none';
          a.textContent = item.title;
          h3.appendChild(a);

          const small = document.createElement('small');
          small.textContent = formatMetaText(item);

          article.appendChild(div);
          article.appendChild(h3);
          article.appendChild(small);

          videoGrid.appendChild(article);
        });
      } else {
        videoGrid.style.display = 'none';
      }
    }

    // 3. Render Pagination
    renderMultimediaPagination(filteredItems.length);
  }

  function renderMultimediaPagination(totalItems) {
    const paginationNav = document.querySelector('.pagination');
    if (!paginationNav) return;

    paginationNav.innerHTML = '';

    const totalPages = Math.ceil(totalItems / MEDIA_ITEMS_PER_PAGE);
    if (totalPages <= 0) return;

    const startPage = Math.floor((currentPage - 1) / PAGE_GROUP_SIZE) * PAGE_GROUP_SIZE + 1;
    const endPage = Math.min(startPage + PAGE_GROUP_SIZE - 1, totalPages);

    function createPageBtn(label, targetPage, isDisabled, isCurrent = false) {
      if (isDisabled) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.disabled = true;
        btn.textContent = label;
        return btn;
      } else {
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = label;
        if (isCurrent) {
          a.className = 'current';
          a.setAttribute('aria-current', 'page');
        }
        a.addEventListener('click', e => {
          e.preventDefault();
          if (currentPage !== targetPage) {
            currentPage = targetPage;
            renderMultimedia();
          }
        });
        return a;
      }
    }

    // « First Page
    paginationNav.appendChild(createPageBtn('«', 1, currentPage === 1));

    // ‹ Prev Page
    paginationNav.appendChild(createPageBtn('‹', Math.max(1, currentPage - 1), currentPage === 1));

    // Numbered Pages
    for (let p = startPage; p <= endPage; p++) {
      paginationNav.appendChild(createPageBtn(String(p), p, false, p === currentPage));
    }

    // › Next Page
    paginationNav.appendChild(createPageBtn('›', Math.min(totalPages, currentPage + 1), currentPage === totalPages));

    // » Last Page
    paginationNav.appendChild(createPageBtn('»', totalPages, currentPage === totalPages));
  }

  async function loadMultimediaData() {
    try {
      let response = await fetch('./multimedia.json');
      if (!response.ok) {
        response = await fetch('./data/multimedia.json');
      }
      if (!response.ok) {
        console.error('멀티미디어 데이터를 불러오지 못했습니다. HTTP ' + response.status);
        return;
      }

      allMultimediaData = await response.json();

      const selectedTab = document.querySelector('.media-tabs button.selected');
      if (selectedTab) {
        currentCategory = selectedTab.textContent.trim();
      }

      renderMultimedia();
    } catch (e) {
      console.error('멀티미디어 데이터 로딩 중 오류:', e);
    }
  }

  // Tab Switching Event Handlers
  const tabButtons = document.querySelectorAll('.media-tabs [role="tab"]');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => {
        btn.classList.remove('selected');
        btn.setAttribute('aria-selected', 'false');
      });
      button.classList.add('selected');
      button.setAttribute('aria-selected', 'true');

      currentCategory = button.textContent.trim();
      currentPage = 1;
      renderMultimedia();
    });
  });

  // Search Event Handler for #media-search
  const searchForm = document.querySelector('.media-intro form[role="search"]') || document.querySelector('form.page-filter');
  if (searchForm) {
    searchForm.addEventListener('submit', event => {
      event.preventDefault();
      const input = searchForm.querySelector('input[type="search"]');
      currentSearchQuery = input ? input.value.trim() : '';
      currentPage = 1;
      renderMultimedia();
    });

    const searchInput = searchForm.querySelector('input[type="search"]');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        if (searchInput.value.trim() === '' && currentSearchQuery !== '') {
          currentSearchQuery = '';
          currentPage = 1;
          renderMultimedia();
        }
      });
    }
  }

  loadMultimediaData();
}

// Scroll reveal is initialized once for every newsroom subpage by scroll-reveal.js.

/* ---------------- 카테고리 탭 슬라이딩 Active Indicator ---------------- */
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
        const indicator = container.querySelector('.tab-sliding-indicator');
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSlidingCategoryTabs);
} else {
  initSlidingCategoryTabs();
}
