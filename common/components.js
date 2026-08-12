(function () {
  'use strict';

  function currentPage() {
    var name = window.location.pathname.split('/').pop() || 'index.html';
    if (/^earthmeal[12]\.html$/i.test(name)) return 'earthmeal';
    if (/^food\d*\.html$/i.test(name)) return 'food';
    if (name.toLowerCase() === 'sub.html') return 'sub';
    if (/^(newsroom|esg|multimedia|resources)\.html$/i.test(name)) return 'newsroom';
    return 'index';
  }

  function setActiveNavigation(header) {
    var page = currentPage();
    header.classList.add('common-header--fixed');
    header.querySelectorAll('[data-nav-page]').forEach(function (link) {
      if (link.dataset.navPage === page) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
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

    function closeMenu(restoreFocus) {
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', '메뉴 열기');
      menu.classList.add('is-hidden');
      openIcon.classList.remove('is-hidden');
      closeIcon.classList.add('is-hidden');
      if (restoreFocus) button.focus();
    }

    button.addEventListener('click', function () {
      var opening = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(opening));
      button.setAttribute('aria-label', opening ? '메뉴 닫기' : '메뉴 열기');
      menu.classList.toggle('is-hidden', !opening);
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
