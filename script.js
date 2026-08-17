(function () {
  'use strict';
  document.documentElement.classList.add('js');
})();

document.addEventListener('DOMContentLoaded', function () {
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile navigation ---------- */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('mainNav');
  var scrim = document.getElementById('navScrim');

  function closeNav(returnFocus) {
    if (!nav || !toggle) return;
    nav.classList.remove('open');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open-body');
    if (scrim) scrim.classList.remove('open');
    if (returnFocus) toggle.focus();
  }

  function openNav() {
    if (!nav || !toggle) return;
    nav.classList.add('open');
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open-body');
    if (scrim) scrim.classList.add('open');
    window.requestAnimationFrame(function () {
      var firstLink = nav.querySelector('a');
      if (firstLink) firstLink.focus();
    });
  }

  if (toggle && nav) {
    var lastToggleAt = 0;
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var now = Date.now();
      if (now - lastToggleAt < 150) return;
      lastToggleAt = now;
      var isOpen = nav.classList.contains('open');
      if (isOpen) { closeNav(false); } else { openNav(); }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        closeNav(true);
      }
    });

    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('open')) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      closeNav(false);
    });

    if (scrim) {
      scrim.addEventListener('click', function () { closeNav(false); });
    }

    var navLinks = nav.querySelectorAll('a');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function () { closeNav(false); });
    }

    var mq = window.matchMedia('(min-width: 860px)');
    var handleBreak = function () { if (mq.matches) closeNav(false); };
    if (mq.addEventListener) mq.addEventListener('change', handleBreak);
    else if (mq.addListener) mq.addListener(handleBreak);
  }

  /* ---------- Sticky header shadow ---------- */
  var header = document.getElementById('siteHeader');
  if (header) {
    var onScrollHeader = function () {
      if (window.scrollY > 8) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScrollHeader, { passive: true });
    onScrollHeader();
  }

  /* ---------- Reveal-on-scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var groups = document.querySelectorAll('.reveal-group');
      groups.forEach(function (group) {
        var children = group.querySelectorAll('.reveal');
        children.forEach(function (child, idx) { child.style.setProperty('--reveal-index', idx); });
      });

      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

      revealEls.forEach(function (el) { revealObserver.observe(el); });
    }
  }

  /* ---------- Practice-areas quick nav: scroll-spy ---------- */
  var quickNavLinks = document.querySelectorAll('.quick-nav-list a');
  var practiceBlocks = document.querySelectorAll('.practice-block[id]');
  if (quickNavLinks.length && practiceBlocks.length && 'IntersectionObserver' in window) {
    var linkById = {};
    quickNavLinks.forEach(function (link) {
      var id = link.getAttribute('href').replace('#', '');
      linkById[id] = link;
    });

    var setActive = function (id) {
      quickNavLinks.forEach(function (link) { link.classList.remove('is-active'); link.removeAttribute('aria-current'); });
      var active = linkById[id];
      if (active) {
        active.classList.add('is-active');
        active.setAttribute('aria-current', 'true');
        if (active.scrollIntoView) {
          active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }
      }
    };

    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    practiceBlocks.forEach(function (block) { spyObserver.observe(block); });
  }

  /* ---------- Contact form: validation + micro-interactions ---------- */
  var form = document.querySelector('form.inquiry');
  if (form) {
    var submitBtn = form.querySelector('button[type="submit"]');
    var banner = form.querySelector('.form-banner');

    var showBanner = function (type, message) {
      if (!banner) return;
      banner.textContent = message;
      banner.className = 'form-banner ' + type + ' is-visible';
    };
    var hideBanner = function () {
      if (!banner) return;
      banner.className = 'form-banner';
    };

    var markField = function (field, invalid, message) {
      var wrap = field.closest('.field');
      if (!wrap) return;
      wrap.classList.toggle('is-invalid', invalid);
      var msg = wrap.querySelector('.field-msg');
      if (msg && message) msg.textContent = message;
    };

    var fields = form.querySelectorAll('input, select, textarea');
    fields.forEach(function (field) {
      field.addEventListener('blur', function () {
        if (field.hasAttribute('required') || field.value) {
          markField(field, !field.checkValidity(), field.validationMessage);
        }
      });
      field.addEventListener('input', function () {
        var wrap = field.closest('.field');
        if (wrap && wrap.classList.contains('is-invalid') && field.checkValidity()) {
          markField(field, false);
        }
      });
    });

    form.addEventListener('submit', function (e) {
      hideBanner();
      if (!form.checkValidity()) {
        e.preventDefault();
        var firstInvalid = null;
        fields.forEach(function (field) {
          var invalid = !field.checkValidity();
          markField(field, invalid, field.validationMessage);
          if (invalid && !firstInvalid) firstInvalid = field;
        });
        if (firstInvalid) firstInvalid.focus();
        showBanner('error', 'Please fix the highlighted fields before sending your message.');
        return;
      }

      if (submitBtn) {
        submitBtn.classList.add('is-loading');
        submitBtn.setAttribute('aria-busy', 'true');
      }
      window.setTimeout(function () {
        if (submitBtn) {
          submitBtn.classList.remove('is-loading');
          submitBtn.removeAttribute('aria-busy');
        }
        showBanner('success', 'Your email app should be opening now with your message pre-filled. If nothing happens, email us directly at pwg@grazianolawgroup.com.');
      }, 500);
    });
  }

  /* ---------- Back to top ---------- */
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    var toggleBackToTop = function () {
      if (window.scrollY > 640) backToTop.classList.add('is-visible');
      else backToTop.classList.remove('is-visible');
    };
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    toggleBackToTop();
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }
});
