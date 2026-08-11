(function () {
  'use strict';

  function currentPage() {
    var name = window.location.pathname.split('/').pop() || 'index.html';
    if (/^food\d*\.html$/i.test(name)) return 'food';
    if (name.toLowerCase() === 'sub.html') return 'sub';
    return 'index';
  }

  function setActiveNavigation(header) {
    var page = currentPage();
    header.classList.toggle('common-header--fixed', page === 'index' || page === 'sub');
    header.querySelectorAll('[data-nav-page]').forEach(function (link) {
      if (link.dataset.navPage === page) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
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

  async function loadFragment(path) {
    var response = await fetch(path);
    if (!response.ok) throw new Error(path + ' 응답 오류: ' + response.status);
    return response.text();
  }

  async function mountComponents() {
    var oldHeader = document.querySelector('body > header, #smooth-content > header');
    var oldFooter = document.querySelector('body > footer, #smooth-content > footer');
    if (!oldHeader || !oldFooter) return;

    try {
      var fragments = await Promise.all([
        loadFragment('common/header.html'),
        loadFragment('common/footer.html')
      ]);
      oldHeader.outerHTML = fragments[0];
      oldFooter.outerHTML = fragments[1];

      var header = document.getElementById('site-header');
      if (header) {
        setActiveNavigation(header);
        bindHeader(header);
      }
      document.dispatchEvent(new CustomEvent('common-components:ready'));
    } catch (error) {
      console.error('[common components]', error);
    }
  }

  mountComponents();
})();
