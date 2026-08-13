(function () {
  'use strict';

  function currentPage() {
    const name = window.location.pathname.split('/').pop() || 'index.html';
    if (/^earthmeal[12]\.html$/i.test(name)) return 'earthmeal';
    if (/^food\d*\.html$/i.test(name)) return 'food';
    if (/^sub\d*(-responsive)?\.html$/i.test(name)) return 'sub';
    if (/^(newsroom|esg|multimedia|resources)\.html$/i.test(name)) return 'newsroom';
    return 'index';
  }

  function setActiveNavigation(header) {
    const page = currentPage();
    header.classList.add('common-header--fixed');
    header.querySelectorAll('[data-nav-page]').forEach(function (link) {
      if (link.dataset.navPage === page) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function placeHeaderOutsideSmoothWrapper(header) {
    const wrapper = document.getElementById('smooth-wrapper');
    if (wrapper && wrapper.contains(header)) wrapper.before(header);
  }

  function bindHeader(header) {
    const button = header.querySelector('#menu-btn');
    const menu = header.querySelector('#mobile-menu');
    const openIcon = header.querySelector('#menu-icon-open');
    const closeIcon = header.querySelector('#menu-icon-close');
    if (!button || !menu || !openIcon || !closeIcon) return;

    function normalizeReportLabel() {
      const reportLabel = header.querySelector('.common-header__utility-link:first-child > span:last-child');
      if (!reportLabel || reportLabel.dataset.reportLabelNormalized === 'true') return;
      reportLabel.textContent = '';
      reportLabel.appendChild(document.createTextNode('지속가능경영'));
      reportLabel.appendChild(document.createElement('wbr'));
      reportLabel.appendChild(document.createTextNode('보고서'));
      reportLabel.dataset.reportLabelNormalized = 'true';
    }

    normalizeReportLabel();

    function buildMobileMenu() {
      const list = menu.querySelector('ul');
      const desktopSubmenus = header.querySelectorAll('.site-header-dropdown__list');
      if (!list || list.dataset.accordionReady === 'true') return;

      const hero = document.createElement('div');
      const heroTop = document.createElement('div');
      const closeButton = document.createElement('button');
      const shortcuts = document.createElement('nav');
      const language = header.querySelector('.common-header__language');
      const utilityLinks = header.querySelectorAll('.common-header__utility-link');

      hero.className = 'common-header__mobile-menu-hero';
      heroTop.className = 'common-header__mobile-menu-hero-top';
      closeButton.type = 'button';
      closeButton.className = 'common-focus common-header__mobile-menu-close';
      closeButton.setAttribute('aria-label', '메뉴 닫기');
      closeButton.appendChild(closeIcon.cloneNode(true));
      closeButton.querySelector('svg').removeAttribute('id');
      closeButton.querySelector('svg').classList.remove('is-hidden');
      shortcuts.className = 'common-header__mobile-shortcuts';
      shortcuts.setAttribute('aria-label', '바로가기');
      if (language) {
        const languageCopy = language.cloneNode(true);
        languageCopy.classList.add('common-header__mobile-language');
        heroTop.appendChild(languageCopy);
      }
      Array.prototype.slice.call(utilityLinks).forEach(function (utilityLink) {
        const shortcutLink = utilityLink.cloneNode(true);
        shortcutLink.classList.add('common-header__mobile-shortcut');
        shortcuts.appendChild(shortcutLink);
      });
      heroTop.insertBefore(closeButton, heroTop.firstChild);
      hero.appendChild(heroTop);
      hero.appendChild(shortcuts);
      menu.insertBefore(hero, list);

      closeButton.addEventListener('click', function () {
        closeMenu(true);
      });

      Array.prototype.slice.call(list.children).forEach(function (item, index) {
        const link = item.querySelector('a[data-nav-page]');
        const sourceLinks = desktopSubmenus[index] ? desktopSubmenus[index].querySelectorAll('a') : [];
        if (!link || !sourceLinks.length) return;

        const heading = document.createElement('div');
        const toggle = document.createElement('button');
        const submenu = document.createElement('ul');
        const submenuId = 'mobile-submenu-' + link.dataset.navPage + '-' + index;

        heading.className = 'common-header__mobile-menu-heading';
        toggle.type = 'button';
        toggle.className = 'common-focus common-header__mobile-menu-toggle';
        toggle.setAttribute('aria-label', link.textContent.trim() + ' 하위 메뉴 열기');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-controls', submenuId);
        toggle.innerHTML = '<span aria-hidden="true"></span>';
        submenu.className = 'common-header__mobile-submenu is-hidden';
        submenu.id = submenuId;

        Array.prototype.slice.call(sourceLinks).forEach(function (sourceLink) {
          const childItem = document.createElement('li');
          const childLink = document.createElement('a');
          childLink.href = sourceLink.href;
          childLink.textContent = sourceLink.textContent.trim();
          childItem.appendChild(childLink);
          submenu.appendChild(childItem);
        });

        link.remove();
        heading.appendChild(link);
        heading.appendChild(toggle);
        item.appendChild(heading);
        item.appendChild(submenu);

        function toggleSubmenu(event) {
          if (event) event.preventDefault();
          const willOpen = toggle.getAttribute('aria-expanded') !== 'true';
          Array.prototype.slice.call(list.querySelectorAll('.common-header__mobile-menu-toggle')).forEach(function (otherToggle) {
            const otherSubmenu = document.getElementById(otherToggle.getAttribute('aria-controls'));
            otherToggle.setAttribute('aria-expanded', 'false');
            otherToggle.setAttribute('aria-label', otherToggle.closest('li').querySelector('a').textContent.trim() + ' 하위 메뉴 열기');
            if (otherSubmenu) otherSubmenu.classList.add('is-hidden');
          });
          toggle.setAttribute('aria-expanded', String(willOpen));
          toggle.setAttribute('aria-label', link.textContent.trim() + ' 하위 메뉴 ' + (willOpen ? '닫기' : '열기'));
          submenu.classList.toggle('is-hidden', !willOpen);
        }

        toggle.addEventListener('click', toggleSubmenu);
        heading.addEventListener('click', function (event) {
          if (event.target.closest('.common-header__mobile-menu-toggle')) return;
          toggleSubmenu(event);
        });
      });
      list.dataset.accordionReady = 'true';
    }

    buildMobileMenu();

    function setPageInert(isInert) {
      Array.prototype.slice.call(document.body.children).forEach(function (child) {
        if (child !== header && child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE') {
          child.inert = isInert;
          if (isInert) {
            child.dataset.headerPageInert = 'true';
            child.setAttribute('aria-hidden', 'true');
          } else if (child.dataset.headerPageInert === 'true') {
            delete child.dataset.headerPageInert;
            child.removeAttribute('aria-hidden');
          }
        }
      });
    }

    function bindLanguageSelectors() {
      const languageButtons = Array.prototype.slice.call(header.querySelectorAll('.common-header__language'));
      languageButtons.forEach(function (languageButton, index) {
        if (languageButton.parentElement.classList.contains('common-header__language-wrap')) return;
        const wrapper = document.createElement('span');
        const options = document.createElement('div');
        const optionId = 'language-options-' + index;
        wrapper.className = 'common-header__language-wrap';
        options.className = 'common-header__language-options';
        options.id = optionId;
        options.setAttribute('role', 'listbox');
        options.hidden = true;
        ['KOR', 'ENG', 'CHN', 'JPN'].forEach(function (language) {
          const option = document.createElement('button');
          option.type = 'button';
          option.className = 'common-focus common-header__language-option';
          option.setAttribute('role', 'option');
          option.textContent = language;
          option.addEventListener('click', function () {
            languageButton.querySelector('span').textContent = language;
            languageButton.setAttribute('aria-label', language + ' 언어 선택, 현재 ' + language);
            options.hidden = true;
            wrapper.classList.remove('is-open');
            languageButton.setAttribute('aria-expanded', 'false');
          });
          options.appendChild(option);
        });
        languageButton.setAttribute('aria-expanded', 'false');
        languageButton.setAttribute('aria-controls', optionId);
        languageButton.parentNode.insertBefore(wrapper, languageButton);
        wrapper.appendChild(languageButton);
        wrapper.appendChild(options);
        languageButton.addEventListener('click', function (event) {
          event.stopPropagation();
          header.querySelectorAll('.common-header__language-wrap').forEach(function (otherWrapper) {
            if (otherWrapper !== wrapper) {
              otherWrapper.classList.remove('is-open');
              otherWrapper.querySelector('.common-header__language-options').hidden = true;
              otherWrapper.querySelector('.common-header__language').setAttribute('aria-expanded', 'false');
            }
          });
          const opening = options.hidden;
          options.hidden = !opening;
          wrapper.classList.toggle('is-open', opening);
          languageButton.setAttribute('aria-expanded', String(opening));
        });
      });
      document.addEventListener('click', function (event) {
        if (event.target.closest('.common-header__language-wrap')) return;
        header.querySelectorAll('.common-header__language-wrap').forEach(function (wrapper) {
          wrapper.classList.remove('is-open');
          wrapper.querySelector('.common-header__language-options').hidden = true;
          wrapper.querySelector('.common-header__language').setAttribute('aria-expanded', 'false');
        });
      });
    }

    bindLanguageSelectors();

    function closeMenu(restoreFocus) {
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', '메뉴 열기');
      header.classList.remove('common-header--menu-open');
      document.body.classList.remove('common-header-menu-open');
      setPageInert(false);
      menu.classList.remove('is-entering');
      menu.classList.add('is-hidden');
      openIcon.classList.remove('is-hidden');
      closeIcon.classList.add('is-hidden');
      menu.querySelectorAll('.common-header__mobile-menu-toggle[aria-expanded="true"]').forEach(function (toggle) {
        const submenu = document.getElementById(toggle.getAttribute('aria-controls'));
        toggle.click();
        if (submenu) submenu.classList.add('is-hidden');
      });
      if (restoreFocus) button.focus();
    }

    button.addEventListener('click', function () {
      const opening = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(opening));
      button.setAttribute('aria-label', opening ? '메뉴 닫기' : '메뉴 열기');
      header.classList.toggle('common-header--menu-open', opening);
      document.body.classList.toggle('common-header-menu-open', opening);
      setPageInert(opening);
      menu.classList.toggle('is-hidden', !opening);
      menu.classList.toggle('is-entering', opening);
      openIcon.classList.toggle('is-hidden', opening);
      closeIcon.classList.toggle('is-hidden', !opening);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024 && button.getAttribute('aria-expanded') === 'true') {
        closeMenu(false);
      }
    });

    header.addEventListener('click', function (event) {
      if (event.target.closest('#mobile-menu .common-header__mobile-submenu a')) closeMenu(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') closeMenu(true);
    });
  }

  function bindHeaderDropdown(header) {
    const headerMain = header.querySelector('.common-header__main');
    const dropdown = header.querySelector('[data-header-dropdown]');
    const dropdownInner = dropdown ? dropdown.querySelector('.site-header-dropdown__inner') : null;
    const navLinks = Array.prototype.slice.call(header.querySelectorAll('.common-header__nav-link'));
    if (!headerMain || !dropdown || !dropdownInner || !navLinks.length) return;

    function syncColumnAlignment() {
      const innerRect = dropdownInner.getBoundingClientRect();
      navLinks.forEach(function (link, index) {
        const linkRect = link.getBoundingClientRect();
        const center = linkRect.left + (linkRect.width / 2) - innerRect.left;
        dropdownInner.style.setProperty('--dropdown-col-' + index, center + 'px');
      });
    }

    function setAnchor(link) {
      navLinks.forEach(function (item) {
        item.classList.toggle('is-dropdown-anchor', item === link);
      });
    }

    function openDropdown(link) {
      if (link) setAnchor(link);
      headerMain.classList.add('is-dropdown-open');
      dropdown.setAttribute('aria-hidden', 'false');
      syncColumnAlignment();
    }

    function closeDropdown() {
      headerMain.classList.remove('is-dropdown-open');
      dropdown.setAttribute('aria-hidden', 'true');
      setAnchor(null);
    }

    navLinks.forEach(function (link) {
      link.addEventListener('mouseenter', function () {
        openDropdown(link);
      });
      link.addEventListener('focus', function () {
        openDropdown(link);
      });
    });

    headerMain.addEventListener('mouseleave', closeDropdown);
    headerMain.addEventListener('focusout', function () {
      window.requestAnimationFrame(function () {
        if (!headerMain.contains(document.activeElement)) closeDropdown();
      });
    });
    dropdown.addEventListener('click', function (event) {
      const link = event.target.closest('a');
      if (!link) return;

      closeDropdown();

      if (link.hasAttribute('data-page-navigation')) {
        event.preventDefault();
        window.location.assign(link.href);
      }
    });
    window.addEventListener('resize', function () {
      if (headerMain.classList.contains('is-dropdown-open')) syncColumnAlignment();
    });
  }

  function bindHeaderSearch(header) {
    const button = header.querySelector('.common-header__search');
    const panel = header.querySelector('#common-search-panel');
    const input = header.querySelector('#common-search-input');
    const status = header.querySelector('#common-search-status');
    const results = header.querySelector('#common-search-results');
    if (!button || !panel || !input || !status || !results) return;

    const prefix = window.location.pathname.indexOf('/pulmuone-newsroom/') !== -1 ? '../' : '';
    const pages = [
      ['index.html', '홈'], ['company.html', '회사소개'], ['company1.html', '회사소개'],
      ['sub.html', '사회책임경영'], ['food.html', '바른먹거리'], ['food2.html', '바른먹거리'],
      ['food3.html', '바른먹거리'], ['food4.html', '바른먹거리'], ['food5.html', '바른먹거리'],
      ['earthmeal1.html', '지구식단'], ['earthmeal2.html', '지구식단'],
      ['pulmuone-newsroom/newsroom.html', '뉴스룸'], ['pulmuone-newsroom/esg.html', '뉴스룸'],
      ['pulmuone-newsroom/multimedia.html', '뉴스룸'], ['pulmuone-newsroom/resources.html', '뉴스룸']
    ];
    let searchDocuments = [];
    let ready = false;
    let loading = null;

    function normalize(value) {
      return value.replace(/\s+/g, ' ').trim();
    }

    function loadDocuments() {
      if (loading) return loading;
      status.textContent = '검색할 페이지를 불러오는 중입니다.';
      loading = Promise.all(pages.map(function (page) {
        return fetch(prefix + page[0]).then(function (response) {
          if (!response.ok) throw new Error(page[0]);
          return response.text();
        }).then(function (html) {
          const parsed = new DOMParser().parseFromString(html, 'text/html');
          const main = parsed.querySelector('main');
          const titleNode = (main && main.querySelector('h1')) || parsed.querySelector('h1') || parsed.querySelector('title');
          return {
            path: prefix + page[0],
            section: page[1],
            title: normalize(titleNode ? titleNode.textContent : page[0]),
            text: normalize(main ? main.textContent : parsed.body.textContent)
          };
        }).catch(function () {
          return null;
        });
      })).then(function (loaded) {
        searchDocuments = loaded.filter(Boolean);
        ready = true;
        render(input.value);
      });
      return loading;
    }

    function excerpt(text, query) {
      const index = text.toLocaleLowerCase('ko').indexOf(query.toLocaleLowerCase('ko'));
      const start = Math.max(0, index - 55);
      const end = Math.min(text.length, index + query.length + 95);
      return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
    }

    function render(value) {
      const query = normalize(value);
      results.replaceChildren();
      if (!query) {
        status.textContent = ready ? '검색어를 입력하면 결과가 실시간으로 표시됩니다.' : '검색할 페이지를 불러오는 중입니다.';
        return;
      }
      if (!ready) return;

      const lowered = query.toLocaleLowerCase('ko');
      const matches = searchDocuments.filter(function (page) {
        return (page.title + ' ' + page.text).toLocaleLowerCase('ko').includes(lowered);
      });
      status.textContent = '“' + query + '” 검색 결과 ' + matches.length + '건';

      matches.forEach(function (page) {
        const item = document.createElement('li');
        const link = document.createElement('a');
        const category = document.createElement('span');
        const title = document.createElement('strong');
        const summary = document.createElement('span');
        link.className = 'common-focus common-header__search-result-link';
        link.href = page.path;
        category.className = 'common-header__search-result-category';
        title.className = 'common-header__search-result-title';
        summary.className = 'common-header__search-result-summary';
        category.textContent = page.section;
        title.textContent = page.title;
        summary.textContent = excerpt(page.text, query);
        link.append(category, title, summary);
        item.appendChild(link);
        results.appendChild(item);
      });
    }

    function openSearch() {
      panel.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      button.setAttribute('aria-label', '통합검색 닫기');
      loadDocuments();
      window.requestAnimationFrame(function () { input.focus(); });
    }

    function closeSearch() {
      panel.hidden = true;
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', '통합검색 열기');
    }

    button.addEventListener('click', function () {
      if (panel.hidden) openSearch();
      else closeSearch();
    });
    input.addEventListener('input', function () { render(input.value); });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !panel.hidden) {
        closeSearch();
        button.focus();
      }
    });
    document.addEventListener('click', function (event) {
      if (!panel.hidden && !header.contains(event.target)) closeSearch();
    });
  }

  function bindScrollState(header) {
    let ticking = false;

    function sync() {
      header.classList.toggle('common-header--compact', window.scrollY > 8);
      ticking = false;
    }

    function requestSync() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(sync);
    }

    window.addEventListener('scroll', requestSync, { passive: true });
    window.addEventListener('pageshow', sync);
    sync();
  }

  function bindFooterFamily() {
    const family = document.querySelector('.common-footer__family-site');
    if (!family) return;
    const button = family.querySelector('button[aria-controls]');
    const panel = document.getElementById(button ? button.getAttribute('aria-controls') : '');
    if (!button || !panel) return;

    function closePanel(restoreFocus) {
      button.setAttribute('aria-expanded', 'false');
      panel.hidden = true;
      if (restoreFocus) button.focus();
    }

    button.addEventListener('click', function () {
      const opening = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(opening));
      panel.hidden = !opening;
    });
    document.addEventListener('click', function (event) {
      if (!family.contains(event.target)) closePanel(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !panel.hidden) closePanel(true);
    });
  }

  function initComponents() {
    const header = document.getElementById('site-header');
    if (header) {
      placeHeaderOutsideSmoothWrapper(header);
      setActiveNavigation(header);
      bindHeader(header);
      bindHeaderDropdown(header);
      bindHeaderSearch(header);
      bindScrollState(header);
    }
    bindFooterFamily();
    document.dispatchEvent(new CustomEvent('common-components:ready'));
  }

  initComponents();
})();
