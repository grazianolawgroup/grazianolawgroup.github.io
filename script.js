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
  var collapseTimer = null;

  function closeNav(returnFocus) {
    if (!nav || !toggle) return;
    nav.classList.remove('open');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open-body');
    if (scrim) scrim.classList.remove('open');
    window.clearTimeout(collapseTimer);
    collapseTimer = window.setTimeout(function () {
      if (!nav.classList.contains('open')) nav.classList.add('nav-collapsed');
    }, 380);
    if (returnFocus) toggle.focus();
  }

  function openNav() {
    if (!nav || !toggle) return;
    window.clearTimeout(collapseTimer);
    nav.classList.remove('nav-collapsed');
    void nav.offsetWidth; /* force reflow so the slide-in transition starts from the off-screen position */
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
      e.preventDefault();
      hideBanner();
      if (!form.checkValidity()) {
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

      var payload = {};
      new FormData(form).forEach(function (value, key) { payload[key] = value; });
      var ajaxUrl = form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/');

      fetch(ajaxUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          if (submitBtn) {
            submitBtn.classList.remove('is-loading');
            submitBtn.removeAttribute('aria-busy');
          }
          if (response.ok) {
            form.reset();
            if (typeof gtag === 'function') {
              gtag('event', 'generate_lead', { event_category: 'engagement', event_label: 'contact_form' });
            }
            showBanner('success', 'Thank you — your message has been sent. Attorney Graziano will follow up with you directly.');
          } else {
            showBanner('error', 'Something went wrong sending your message. Please email us directly at pwg@grazianolawgroup.com or call (954) 440-6608.');
          }
        })
        .catch(function () {
          if (submitBtn) {
            submitBtn.classList.remove('is-loading');
            submitBtn.removeAttribute('aria-busy');
          }
          showBanner('error', 'Something went wrong sending your message. Please email us directly at pwg@grazianolawgroup.com or call (954) 440-6608.');
        });
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


document.addEventListener('DOMContentLoaded', function () {
  if (typeof gtag !== 'function') return;
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="tel:"]');
    if (link) {
      gtag('event', 'phone_click', { event_category: 'engagement', event_label: link.getAttribute('href').replace('tel:', '') });
      return;
    }
    var sms = e.target.closest('a[href^="sms:"]');
    if (sms) {
      gtag('event', 'text_click', { event_category: 'engagement', event_label: sms.getAttribute('href').replace('sms:', '') });
      return;
    }
    var mail = e.target.closest('a[href^="mailto:"]');
    if (mail) {
      gtag('event', 'email_click', { event_category: 'engagement', event_label: mail.getAttribute('href').replace('mailto:', '') });
    }
  });
});
document.addEventListener('DOMContentLoaded', function () { var track = document.getElementById('testimonialTrack'); if (!track) return; var cards = track.querySelectorAll('.testimonial-card'); var dotsWrap = document.getElementById('tcDots'); var prevBtn = document.getElementById('tcPrev'); var nextBtn = document.getElementById('tcNext'); var carousel = document.getElementById('testimonialCarousel'); var current = 0; var total = cards.length; var timer = null; var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; cards.forEach(function (card, idx) { var dot = document.createElement('button'); dot.type = 'button'; dot.className = 'tc-dot' + (idx === 0 ? ' is-active' : ''); dot.setAttribute('aria-label', 'Show testimonial ' + (idx + 1) + ' of ' + total); dot.addEventListener('click', function () { goTo(idx); resetTimer(); }); dotsWrap.appendChild(dot); }); var dots = dotsWrap.querySelectorAll('.tc-dot'); function goTo(idx) { cards[current].classList.remove('is-active'); dots[current].classList.remove('is-active'); current = (idx + total) % total; cards[current].classList.add('is-active'); dots[current].classList.add('is-active'); } function next() { goTo(current + 1); } function prev() { goTo(current - 1); } function resetTimer() { if (timer) window.clearInterval(timer); if (!prefersReducedMotion) { timer = window.setInterval(next, 6000); } } if (prevBtn) prevBtn.addEventListener('click', function () { prev(); resetTimer(); }); if (nextBtn) nextBtn.addEventListener('click', function () { next(); resetTimer(); }); if (carousel) { carousel.addEventListener('mouseenter', function () { if (timer) window.clearInterval(timer); }); carousel.addEventListener('mouseleave', resetTimer); carousel.addEventListener('focusin', function () { if (timer) window.clearInterval(timer); }); carousel.addEventListener('focusout', resetTimer); } resetTimer(); });
