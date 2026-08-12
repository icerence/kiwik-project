(function () {
  'use strict';

  function currentPage() {
    var name = window.location.pathname.split('/').pop() || 'index.html';
    if (/^earthmeal[12]\.html$/i.test(name)) return 'earthmeal';
    if (/^food\d*\.html$/i.test(name)) return 'food';
    if (name.toLowerCase() === 'sub.html') return 'sub';
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

  function bindDesktopMegaMenu(header) {
    var nav = header.querySelector('#primary-nav');
    var mega = header.querySelector('#desktop-mega-menu');
    var triggers = nav ? Array.from(nav.querySelectorAll('[aria-controls="desktop-mega-menu"]')) : [];
    var lastTrigger = null;
    if (!nav || !mega || !triggers.length) return;

    function isDesktop() { return window.getComputedStyle(nav).display !== 'none'; }
    function setOpen(open) {
      var active = open && isDesktop();
      mega.classList.toggle('is-open', active);
      mega.setAttribute('aria-hidden', String(!active));
      triggers.forEach(function (trigger) { trigger.setAttribute('aria-expanded', String(active)); });
    }
    function containsFocus() {
      return nav.contains(document.activeElement) || mega.contains(document.activeElement);
    }

    nav.addEventListener('pointerenter', function () { setOpen(true); });
    header.addEventListener('pointerleave', function () { if (!containsFocus()) setOpen(false); });
    triggers.forEach(function (trigger) {
      trigger.addEventListener('focus', function () { lastTrigger = trigger; setOpen(true); });
    });
    header.addEventListener('focusout', function () {
      window.requestAnimationFrame(function () { if (!containsFocus()) setOpen(false); });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || mega.getAttribute('aria-hidden') === 'true') return;
      event.preventDefault();
      if (lastTrigger) lastTrigger.focus();
      setOpen(false);
    });
    window.addEventListener('resize', function () { if (!isDesktop()) setOpen(false); });
  }

  function initComponents() {
    var header = document.getElementById('site-header');
    if (header) {
      placeHeaderOutsideSmoothWrapper(header);
      setActiveNavigation(header);
      bindHeader(header);
      bindDesktopMegaMenu(header);
      bindScrollState(header);
    }
    document.dispatchEvent(new CustomEvent('common-components:ready'));
  }

  initComponents();
})();
