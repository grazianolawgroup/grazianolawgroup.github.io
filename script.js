(function () {
  'use strict';
  document.documentElement.classList.add('js');
})();

document.addEventListener('DOMContentLoaded', function () {
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Scroll progress bar ---------- */
var scrollProgressBar = document.createElement('div');
scrollProgressBar.className = 'scroll-progress';
scrollProgressBar.setAttribute('aria-hidden', 'true');
document.body.appendChild(scrollProgressBar);
var updateScrollProgress = function () {
var doc = document.documentElement;
var scrollTop = doc.scrollTop || document.body.scrollTop;
var scrollHeight = doc.scrollHeight - doc.clientHeight;
var pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
scrollProgressBar.style.width = pct + '%';
};
window.addEventListener('scroll', updateScrollProgress, { passive: true });
window.addEventListener('resize', updateScrollProgress);
updateScrollProgress();

  /* ---------- FAQ accordion smooth expand/collapse ---------- */
  document.querySelectorAll('.faq-list details').forEach(function (det) {
    var summary = det.querySelector('summary');
    if (!summary) return;
    var panel = document.createElement('div');
    panel.className = 'faq-panel';
    var node = summary.nextSibling;
    while (node) {
      var next = node.nextSibling;
      panel.appendChild(node);
      node = next;
    }
    det.appendChild(panel);
    if (det.hasAttribute('open')) {
      panel.style.maxHeight = 'none';
    }
    summary.addEventListener('click', function (e) {
      e.preventDefault();
      var isOpen = det.hasAttribute('open');
      if (isOpen) {
        panel.style.maxHeight = panel.scrollHeight + 'px';
        requestAnimationFrame(function () {
          panel.style.maxHeight = '0px';
        });
        var onCloseEnd = function () {
          det.removeAttribute('open');
          panel.removeEventListener('transitionend', onCloseEnd);
        };
        panel.addEventListener('transitionend', onCloseEnd);
      } else {
        det.setAttribute('open', '');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        var onOpenEnd = function () {
          panel.style.maxHeight = 'none';
          panel.removeEventListener('transitionend', onOpenEnd);
        };
        panel.addEventListener('transitionend', onOpenEnd);
      }
    });
  });

  /* ---------- 3D tilt + glare on cards ---------- */
  if (window.matchMedia && window.matchMedia('(hover: hover)').matches && !prefersReducedMotion) {
    document.querySelectorAll('.card').forEach(function (card) {
      var glare = document.createElement('div');
      glare.className = 'card-glare';
      glare.setAttribute('aria-hidden', 'true');
      card.appendChild(glare);
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var px = (x / rect.width) * 100;
        var py = (y / rect.height) * 100;
        var rx = ((y / rect.height) - 0.5) * -8;
        var ry = ((x / rect.width) - 0.5) * 8;
        card.style.transform = 'perspective(700px) translateY(-8px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
        glare.style.setProperty('--gx', px + '%');
        glare.style.setProperty('--gy', py + '%');
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ---------- Button click ripple ---------- */
  document.querySelectorAll('.btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      if (prefersReducedMotion) return;
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', function () {
        ripple.remove();
      });
    });
  });

  /* ---------- Hero parallax drift ---------- */
  var heroEl = document.querySelector('.hero');
  if (heroEl && !prefersReducedMotion) {
    var heroInner = heroEl.querySelector('.container');
    var updateHeroParallax = function () {
      var rect = heroEl.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      var offset = rect.top * -0.15;
      if (heroInner) heroInner.style.transform = 'translateY(' + offset.toFixed(1) + 'px)';
    };
    window.addEventListener('scroll', updateHeroParallax, { passive: true });
    updateHeroParallax();
  }



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

    /* ---------- FAQ list stagger reveal setup ---------- */
  document.querySelectorAll('.faq-list').forEach(function (list) {
    list.classList.remove('reveal');
    list.classList.add('reveal-group');
    var items = list.querySelectorAll(':scope > details');
    items.forEach(function (det, idx) {
      det.classList.add('reveal');
      det.style.setProperty('--reveal-index', idx);
    });
  });

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



/* ---------- Smart sticky mobile call/text bar ---------- */
document.addEventListener('DOMContentLoaded', function () {
  var stickyBar = document.querySelector('.sticky-cta-bar');
  if (!stickyBar) return;
  var lastStickyY = window.scrollY;
  var onStickyScroll = function () {
    var y = window.scrollY;
    if (y > lastStickyY && y > 220) {
      stickyBar.classList.add('is-hidden');
    } else {
      stickyBar.classList.remove('is-hidden');
    }
    lastStickyY = y;
  };
  window.addEventListener('scroll', onStickyScroll, { passive: true });
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
document.addEventListener('DOMContentLoaded', function () {
var track = document.getElementById('testimonialTrack');
if (!track) return;
var cards = track.querySelectorAll('.testimonial-card');
var dotsWrap = document.getElementById('tcDots');
var prevBtn = document.getElementById('tcPrev');
var nextBtn = document.getElementById('tcNext');
var carousel = document.getElementById('testimonialCarousel');
var current = 0;
var total = cards.length;
var timer = null;
var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
cards.forEach(function (card, idx) {
var dot = document.createElement('button');
dot.type = 'button';
dot.className = 'tc-dot' + (idx === 0 ? ' is-active' : '');
dot.setAttribute('aria-label', 'Show testimonial ' + (idx + 1) + ' of ' + total);
dot.addEventListener('click', function () { goTo(idx); resetTimer(); });
dotsWrap.appendChild(dot);
});
var dots = dotsWrap.querySelectorAll('.tc-dot');
var progressFill = null;
if (carousel && dotsWrap && dotsWrap.parentNode) {
var progressBar = document.createElement('div');
progressBar.className = 'tc-progress';
progressFill = document.createElement('span');
progressFill.className = 'tc-progress-fill';
progressBar.appendChild(progressFill);
dotsWrap.parentNode.insertBefore(progressBar, dotsWrap);
}
function restartProgress() {
if (!progressFill || prefersReducedMotion) return;
progressFill.style.animation = 'none';
void progressFill.offsetWidth;
progressFill.style.animation = 'tcProgressFill 6s linear forwards';
}
function pauseProgress() {
if (progressFill) progressFill.style.animationPlayState = 'paused';
}
function goTo(idx) {
cards[current].classList.remove('is-active');
dots[current].classList.remove('is-active');
current = (idx + total) % total;
cards[current].classList.add('is-active');
dots[current].classList.add('is-active');
}
function next() { goTo(current + 1); }
function prev() { goTo(current - 1); }
function resetTimer() {
if (timer) window.clearInterval(timer);
if (!prefersReducedMotion) {
timer = window.setInterval(next, 6000);
restartProgress();
}
}
if (prevBtn) prevBtn.addEventListener('click', function () { prev(); resetTimer(); });
if (nextBtn) nextBtn.addEventListener('click', function () { next(); resetTimer(); });
if (carousel) {
carousel.addEventListener('mouseenter', function () { if (timer) window.clearInterval(timer); pauseProgress(); });
carousel.addEventListener('mouseleave', resetTimer);
carousel.addEventListener('focusin', function () { if (timer) window.clearInterval(timer); pauseProgress(); });
carousel.addEventListener('focusout', resetTimer);
}
resetTimer();
});

document.addEventListener('DOMContentLoaded', function () {
  var statNums = document.querySelectorAll('.stat-strip .num[data-count]');
  if (!statNums.length) return;
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || !('IntersectionObserver' in window)) return;

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;
    var duration = 1200;
    var start = null;
    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  statNums.forEach(function (el) { el.textContent = '0' + (el.getAttribute('data-suffix') || ''); });

  var statObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  statNums.forEach(function (el) { statObserver.observe(el); });
});

document.addEventListener('DOMContentLoaded', function () {
  var copyTargets = document.querySelectorAll('.topbar .contact-line a[href^="tel:"], .topbar .contact-line a[href^="mailto:"]');
  copyTargets.forEach(function (link) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.setAttribute('aria-label', 'Copy to clipboard');
    btn.innerHTML =
      '<span class="copy-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></span>' +
      '<span class="copy-check" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg></span>';
    link.insertAdjacentElement('afterend', btn);
    var resetTimer = null;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var raw = link.getAttribute('href').replace('tel:', '').replace('mailto:', '');
      var value = link.textContent.trim() || raw;
      var done = function () {
        btn.classList.add('is-copied');
        btn.setAttribute('aria-label', 'Copied');
        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(function () {
          btn.classList.remove('is-copied');
          btn.setAttribute('aria-label', 'Copy to clipboard');
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done, function () {});
      } else {
        var temp = document.createElement('textarea');
        temp.value = value;
        temp.style.position = 'fixed';
        temp.style.opacity = '0';
        document.body.appendChild(temp);
        temp.select();
        try { document.execCommand('copy'); done(); } catch (err) {}
        document.body.removeChild(temp);
      }
    });
  });
});

document.addEventListener('DOMContentLoaded', function () {
  /* ---------- External link indicators ---------- */
  var links = document.querySelectorAll('a[href^="http"]');
  links.forEach(function (link) {
    if (link.classList.contains('btn') || link.querySelector('svg')) return;
    try {
      var url = new URL(link.href);
      if (url.hostname && url.hostname !== window.location.hostname) {
        link.classList.add('ext-link');
        var icon = document.createElement('span');
        icon.className = 'ext-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" width="11" height="11"><path d="M7 17L17 7"></path><path d="M8 7h9v9"></path></svg>';
        link.appendChild(icon);
      }
    } catch (e) {}
  });
});

document.addEventListener('DOMContentLoaded', function () {
  /* ---------- Hero scroll cue ---------- */
  var hero = document.querySelector('.hero');
  if (!hero) return;
  var cue = document.createElement('div');
  cue.className = 'scroll-cue';
  cue.setAttribute('aria-hidden', 'true');
  cue.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" width="26" height="26"><path d="M6 9l6 6 6-6"></path></svg>';
  hero.appendChild(cue);
  var onCueScroll = function () {
    if (window.scrollY > 80) {
      cue.classList.add('is-hidden');
    } else {
      cue.classList.remove('is-hidden');
    }
  };
  window.addEventListener('scroll', onCueScroll, { passive: true });
});
