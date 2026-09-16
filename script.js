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

document.addEventListener('DOMContentLoaded', function () {
  /* ---------- Tel link click-to-call icon ---------- */
  var telLinks = document.querySelectorAll('a[href^="tel:"]');
  telLinks.forEach(function (link) {
    if (link.classList.contains('btn')) return;
    link.classList.add('tel-link');
    var icon = document.createElement('span');
    icon.className = 'tel-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.5 21 3 13.5 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"></path></svg>';
    link.appendChild(icon);
  });
});

document.addEventListener('DOMContentLoaded', function () {
  /* ---------- Form submit loading state ---------- */
  var inquiryForm = document.querySelector('form.inquiry');
  if (!inquiryForm) return;
  inquiryForm.addEventListener('submit', function () {
    if (!inquiryForm.checkValidity()) return;
    var btn = inquiryForm.querySelector('button[type="submit"]');
    if (btn) btn.classList.add('is-submitting');
  });
});


// ============ Dark mode toggle + copy-link + toast (v16) ============
document.addEventListener('DOMContentLoaded', function () {
  var root = document.documentElement;
  var DARK_KEY = 'gzDarkMode';

  var moonIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
  var sunIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></svg>';
  var linkIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.5"></path><path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07L12.5 19.5"></path></svg>';

  var group = document.createElement('div');
  group.className = 'utility-fab-group';

  var darkBtn = document.createElement('button');
  darkBtn.type = 'button';
  darkBtn.className = 'utility-fab dark-toggle';
  group.appendChild(darkBtn);

  var linkBtn = document.createElement('button');
  linkBtn.type = 'button';
  linkBtn.className = 'utility-fab copy-link-fab';
  linkBtn.innerHTML = linkIcon;
  linkBtn.setAttribute('aria-label', 'Copy link to this page');
  group.appendChild(linkBtn);

  document.body.appendChild(group);

  function applyDarkMode(on) {
    root.classList.toggle('dark-mode', on);
    darkBtn.innerHTML = on ? sunIcon : moonIcon;
    darkBtn.setAttribute('aria-label', on ? 'Switch to light mode' : 'Switch to dark mode');
  }

  var storedDark = null;
  try { storedDark = localStorage.getItem(DARK_KEY); } catch (e) {}
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var initialDark = storedDark === '1' ? true : (storedDark === '0' ? false : prefersDark);
  applyDarkMode(initialDark);

  darkBtn.addEventListener('click', function () {
    var nowDark = !root.classList.contains('dark-mode');
    applyDarkMode(nowDark);
    try { localStorage.setItem(DARK_KEY, nowDark ? '1' : '0'); } catch (e) {}
  });

  var toastEl = null;
  function showToast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'gz-toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastEl._hideTimer);
    toastEl._hideTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 2400);
  }

  linkBtn.addEventListener('click', function () {
    var url = window.location.href;
    function fallbackCopy() {
      var ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      showToast('Link copied to clipboard');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        showToast('Link copied to clipboard');
      }).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
  });
});

// ============ Auto-generated table of contents for long guides (v16) ============
document.addEventListener('DOMContentLoaded', function () {
  var container = document.querySelector('.article-body');
  if (!container) return;
  var headings = container.querySelectorAll('h2');
  if (headings.length < 3) return;

  var usedIds = {};
  function slugify(text) {
    var base = (text || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    if (!base) base = 'section';
    var id = base, n = 2;
    while (usedIds[id] || document.getElementById(id)) { id = base + '-' + n; n++; }
    usedIds[id] = true;
    return id;
  }

  var list = document.createElement('ul');
  headings.forEach(function (h) {
    if (!h.id) { h.id = slugify(h.textContent); } else { usedIds[h.id] = true; }
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    li.appendChild(a);
    list.appendChild(li);
  });

  var toc = document.createElement('details');
  toc.className = 'toc-widget';
  var summary = document.createElement('summary');
  summary.textContent = 'On This Page';
  toc.appendChild(summary);
  toc.appendChild(list);
  container.insertBefore(toc, container.firstChild);
});

// ============ Reading time, external links, helpful widget (v17) ============
document.addEventListener('DOMContentLoaded', function () {
  var container = document.querySelector('.article-body');
  if (!container) return;

  var text = container.textContent || '';
  var words = text.trim().split(/\s+/).filter(Boolean).length;

  if (words > 150) {
    var minutes = Math.max(1, Math.round(words / 200));
    var badge = document.createElement('div');
    badge.className = 'reading-time-badge';
    badge.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg><span>' + minutes + ' min read</span>';
    container.insertBefore(badge, container.firstChild);
  }

  var links = container.querySelectorAll('a[href^="http"]');
  links.forEach(function (a) {
    try {
      var url = new URL(a.href);
      if (url.hostname && url.hostname !== window.location.hostname) {
        a.classList.add('ext-link');
        a.insertAdjacentHTML('beforeend', '<svg class="ext-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7"></path><path d="M7 7h10v10"></path></svg>');
        if (!a.getAttribute('rel')) a.setAttribute('rel', 'noopener');
      }
    } catch (e) {}
  });

  if (words > 150) {
    var HELPFUL_KEY = 'gzHelpful' + window.location.pathname;
    var widget = document.createElement('div');
    widget.className = 'helpful-widget';
    widget.innerHTML =
      '<p>Was this article helpful?</p>' +
      '<div class="helpful-buttons">' +
        '<button type="button" class="up" aria-label="Yes, this was helpful"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 10v12"></path><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"></path></svg><span>Yes</span></button>' +
        '<button type="button" class="down" aria-label="No, this was not helpful"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 10v12"></path><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"></path></svg><span>No</span></button>' +
      '</div>' +
      '<p class="helpful-thanks">Thanks for the feedback!</p>';
    container.appendChild(widget);

    var stored = null;
    try { stored = localStorage.getItem(HELPFUL_KEY); } catch (e) {}
    if (stored) widget.classList.add('is-answered');

    var helpfulButtons = widget.querySelectorAll('button');
    helpfulButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        widget.classList.add('is-answered');
        helpfulButtons.forEach(function (b) { b.classList.remove('is-selected'); });
        btn.classList.add('is-selected');
        try { localStorage.setItem(HELPFUL_KEY, btn.classList.contains('up') ? 'up' : 'down'); } catch (e) {}
      });
    });
  }
});

// ============ Print button (v17) ============
document.addEventListener('DOMContentLoaded', function () {
  var fabGroup = document.querySelector('.utility-fab-group');
  if (!fabGroup) return;
  var printBtn = document.createElement('button');
  printBtn.type = 'button';
  printBtn.className = 'utility-fab print-fab';
  printBtn.setAttribute('aria-label', 'Print this page');
  printBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>';
  printBtn.addEventListener('click', function () { window.print(); });
  fabGroup.appendChild(printBtn);
});
