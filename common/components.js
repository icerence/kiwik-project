(function () {
  'use strict';

  function currentPage() {
    var name = window.location.pathname.split('/').pop() || 'index.html';
    if (/^earthmeal[12]\.html$/i.test(name)) return 'earthmeal';
    if (/^food\d*\.html$/i.test(name)) return 'food';
    if (/^sub\d*(-responsive)?\.html$/i.test(name)) return 'sub';
    if (/^(newsroom|esg|multimedia|resources)\.html$/i.test(name)) return 'newsroom';
    return 'index';
  }

  function setActiveNavigation(header) {
    var page = currentPage();
    var currentPath = window.location.pathname.replace(/\/$/, '');
    header.classList.add('common-header--fixed');
    header.querySelectorAll('[data-nav-page]').forEach(function (link) {
      if (link.dataset.navPage === page) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    header.querySelectorAll('.site-header-dropdown__link').forEach(function (link) {
      var linkPath = new URL(link.getAttribute('href'), window.location.href).pathname.replace(/\/$/, '');
      link.classList.toggle('is-current-submenu', linkPath === currentPath);
    });
  }

  function placeHeaderOutsideSmoothWrapper(header) {
    var wrapper = document.getElementById('smooth-wrapper');
    if (wrapper && wrapper.contains(header)) wrapper.before(header);
  }

  function bindHeader(header) {
    var button = header.querySelector('#menu-btn');
    var menu = header.querySelector('#mobile-menu');
    var openIcon = header.querySelector('#menu-icon-open');
    var closeIcon = header.querySelector('#menu-icon-close');
    if (!button || !menu || !openIcon || !closeIcon) return;

    function buildMobileMenu() {
      var list = menu.querySelector('ul');
      var desktopSubmenus = header.querySelectorAll('.site-header-dropdown__list');
      if (!list || list.dataset.accordionReady === 'true') return;

      var hero = document.createElement('div');
      var heroTop = document.createElement('div');
      var closeButton = document.createElement('button');
      var shortcuts = document.createElement('nav');
      var shortcutsGraphic = document.createElement('img');
      var language = header.querySelector('.common-header__language');
      var utilityLinks = header.querySelectorAll('.common-header__utility-link');

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
      shortcutsGraphic.src = window.location.pathname.indexOf('/pulmuone-newsroom/') !== -1 ? '../assets/icons/mobile-menu-shortcuts.svg' : 'assets/icons/mobile-menu-shortcuts.svg';
      shortcutsGraphic.alt = '';
      shortcutsGraphic.setAttribute('aria-hidden', 'true');
      if (language) {
        var languageCopy = language.cloneNode(true);
        languageCopy.classList.add('common-header__mobile-language');
        heroTop.appendChild(languageCopy);
      }
      shortcuts.appendChild(shortcutsGraphic);
      Array.prototype.slice.call(utilityLinks).forEach(function (utilityLink) {
        shortcuts.appendChild(utilityLink.cloneNode(true));
      });
      heroTop.insertBefore(closeButton, heroTop.firstChild);
      hero.appendChild(heroTop);
      hero.appendChild(shortcuts);
      menu.insertBefore(hero, list);

      closeButton.addEventListener('click', function () {
        closeMenu(true);
      });

      Array.prototype.slice.call(list.children).forEach(function (item, index) {
        var link = item.querySelector('a[data-nav-page]');
        var sourceLinks = desktopSubmenus[index] ? desktopSubmenus[index].querySelectorAll('a') : [];
        if (!link || !sourceLinks.length) return;

        var heading = document.createElement('div');
        var toggle = document.createElement('button');
        var submenu = document.createElement('ul');
        var submenuId = 'mobile-submenu-' + link.dataset.navPage + '-' + index;

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
          var childItem = document.createElement('li');
          var childLink = document.createElement('a');
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

        toggle.addEventListener('click', function () {
          var willOpen = toggle.getAttribute('aria-expanded') !== 'true';
          Array.prototype.slice.call(list.querySelectorAll('.common-header__mobile-menu-toggle')).forEach(function (otherToggle) {
            var otherSubmenu = document.getElementById(otherToggle.getAttribute('aria-controls'));
            otherToggle.setAttribute('aria-expanded', 'false');
            otherToggle.setAttribute('aria-label', otherToggle.closest('li').querySelector('a').textContent.trim() + ' 하위 메뉴 열기');
            if (otherSubmenu) otherSubmenu.classList.add('is-hidden');
          });
          toggle.setAttribute('aria-expanded', String(willOpen));
          toggle.setAttribute('aria-label', link.textContent.trim() + ' 하위 메뉴 ' + (willOpen ? '닫기' : '열기'));
          submenu.classList.toggle('is-hidden', !willOpen);
        });
      });
      list.dataset.accordionReady = 'true';
    }

    buildMobileMenu();

    function closeMenu(restoreFocus) {
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', '메뉴 열기');
      header.classList.remove('common-header--menu-open');
      document.body.classList.remove('common-header-menu-open');
      menu.classList.remove('is-entering');
      menu.classList.add('is-hidden');
      openIcon.classList.remove('is-hidden');
      closeIcon.classList.add('is-hidden');
      menu.querySelectorAll('.common-header__mobile-menu-toggle[aria-expanded="true"]').forEach(function (toggle) {
        var submenu = document.getElementById(toggle.getAttribute('aria-controls'));
        toggle.click();
        if (submenu) submenu.classList.add('is-hidden');
      });
      if (restoreFocus) button.focus();
    }

    button.addEventListener('click', function () {
      var opening = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(opening));
      button.setAttribute('aria-label', opening ? '메뉴 닫기' : '메뉴 열기');
      header.classList.toggle('common-header--menu-open', opening);
      document.body.classList.toggle('common-header-menu-open', opening);
      menu.classList.toggle('is-hidden', !opening);
      menu.classList.toggle('is-entering', opening);
      openIcon.classList.toggle('is-hidden', opening);
      closeIcon.classList.toggle('is-hidden', !opening);
    });

    header.addEventListener('click', function (event) {
      if (event.target.closest('#mobile-menu a')) closeMenu(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') closeMenu(true);
    });
  }

  function bindHeaderDropdown(header) {
    var headerMain = header.querySelector('.common-header__main');
    var dropdown = header.querySelector('[data-header-dropdown]');
    var dropdownInner = dropdown ? dropdown.querySelector('.site-header-dropdown__inner') : null;
    var navLinks = Array.prototype.slice.call(header.querySelectorAll('.common-header__nav-link'));
    if (!headerMain || !dropdown || !dropdownInner || !navLinks.length) return;

    function syncColumnAlignment() {
      var innerRect = dropdownInner.getBoundingClientRect();
      navLinks.forEach(function (link, index) {
        var linkRect = link.getBoundingClientRect();
        var center = linkRect.left + (linkRect.width / 2) - innerRect.left;
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

    dropdown.querySelectorAll('.site-header-dropdown__link').forEach(function (link) {
      link.addEventListener('mouseenter', function () {
        link.classList.add('is-hovered');
      });
      link.addEventListener('mouseleave', function () {
        link.classList.remove('is-hovered');
      });
      link.addEventListener('focus', function () {
        link.classList.add('is-hovered');
      });
      link.addEventListener('blur', function () {
        link.classList.remove('is-hovered');
      });
    });

    headerMain.addEventListener('mouseleave', closeDropdown);
    headerMain.addEventListener('focusout', function () {
      window.requestAnimationFrame(function () {
        if (!headerMain.contains(document.activeElement)) closeDropdown();
      });
    });
    dropdown.addEventListener('click', function (event) {
      var link = event.target.closest('a');
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

  function bindScrollState(header) {
    var ticking = false;

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

  function initComponents() {
    var header = document.getElementById('site-header');
    if (header) {
      placeHeaderOutsideSmoothWrapper(header);
      setActiveNavigation(header);
      bindHeader(header);
      bindHeaderDropdown(header);
      bindScrollState(header);
    }
    document.dispatchEvent(new CustomEvent('common-components:ready'));
  }

  initComponents();
})();
