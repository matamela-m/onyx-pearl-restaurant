/* ============================================================
   ONYX & PEARL — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ── Utility ── */
  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const on  = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

  /* ============================================================
     NAVIGATION — transparent → solid on scroll
     ============================================================ */
  function initNav() {
    const nav = qs('.nav');
    if (!nav) return;

    const isHomePage = nav.classList.contains('nav--transparent-start');

    function updateNav() {
      if (isHomePage) {
        if (window.scrollY > 60) {
          nav.classList.remove('transparent');
          nav.classList.add('solid');
        } else {
          nav.classList.remove('solid');
          nav.classList.add('transparent');
        }
      } else {
        nav.classList.add('light-bg');
      }
    }

    // Hamburger
    const hamburger = qs('.nav__hamburger');
    const mobileMenu = qs('.nav__mobile');
    if (hamburger && mobileMenu) {
      on(hamburger, 'click', () => {
        hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
      });
      qsa('.nav__mobile .nav__link').forEach(link => {
        on(link, 'click', () => {
          hamburger.classList.remove('open');
          mobileMenu.classList.remove('open');
          document.body.style.overflow = '';
        });
      });
    }

    // Active link
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    qsa('.nav__link').forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
        link.classList.add('active');
      }
    });

    on(window, 'scroll', updateNav, { passive: true });
    updateNav();
  }

  /* ============================================================
     SCROLL REVEAL (Intersection Observer)
     ============================================================ */
  function initScrollReveal() {
    const elements = qsa('[data-reveal]');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger siblings
          const siblings = qsa('[data-reveal]', entry.target.parentElement)
            .filter(el => !el.classList.contains('revealed'));
          const delay = siblings.indexOf(entry.target) * 80;
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    });

    elements.forEach(el => observer.observe(el));
  }

  /* ============================================================
     PARALLAX (subtle, performance-safe)
     ============================================================ */
  function initParallax() {
    const elements = qsa('[data-parallax]');
    if (!elements.length) return;

    let ticking = false;

    function update() {
      const scrollY = window.scrollY;
      elements.forEach(el => {
        const speed  = parseFloat(el.dataset.parallax) || 0.3;
        const rect   = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const offset = (window.innerHeight / 2 - center) * speed;
        el.style.transform = `translateY(${offset}px)`;
      });
      ticking = false;
    }

    on(window, 'scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ============================================================
     MENU TABS
     ============================================================ */
  function initMenuTabs() {
    const tabs = qsa('.menu-tab');
    const panels = qsa('.menu-category');
    if (!tabs.length) return;

    tabs.forEach(tab => {
      on(tab, 'click', () => {
        const target = tab.dataset.tab;
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const panel = qs(`[data-category="${target}"]`);
        if (panel) {
          panel.classList.add('active');
          // Animate items in
          qsa('[data-reveal]', panel).forEach(el => {
            el.classList.remove('revealed');
            void el.offsetWidth;
            setTimeout(() => el.classList.add('revealed'), 50);
          });
        }
      });
    });
  }

  /* ============================================================
     SEASON TOGGLE
     ============================================================ */
  function initSeasonToggle() {
    const btns = qsa('.season-toggle__btn');
    if (!btns.length) return;

    btns.forEach(btn => {
      on(btn, 'click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const season = btn.dataset.season;
        const allSeasonalItems = qsa('[data-season-menu]');
        allSeasonalItems.forEach(item => {
          if (item.dataset.seasonMenu === season || item.dataset.seasonMenu === 'both') {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });

    // Apply initial active season on page load
    const initialActive = qs('.season-toggle__btn.active');
    if (initialActive) initialActive.click();
  }

  /* ============================================================
     TABLE SELECTION
     ============================================================ */
  function initTableSelection() {
    const tables = qsa('.table-btn');
    if (!tables.length) return;

    tables.forEach(table => {
      if (table.classList.contains('unavailable')) return;
      on(table, 'click', () => {
        if (table.classList.contains('selected')) {
          table.classList.remove('selected');
          updateTableInfo(null);
        } else {
          tables.forEach(t => t.classList.remove('selected'));
          table.classList.add('selected');
          updateTableInfo(table.dataset.tableId);
        }
      });
    });

    function updateTableInfo(tableId) {
      const infoEl = qs('.table-selection__selected-info');
      if (!infoEl) return;
      if (tableId) {
        infoEl.textContent = `Table ${tableId} selected`;
        infoEl.style.opacity = '1';
      } else {
        infoEl.textContent = '';
        infoEl.style.opacity = '0';
      }
    }
  }

  /* ============================================================
     PRIVATE DINING TOGGLE
     ============================================================ */
  function initPrivateDining() {
    const toggle = qs('.private-toggle');
    if (!toggle) return;
    const sw = toggle.querySelector('.toggle-switch');

    on(toggle, 'click', () => {
      sw.classList.toggle('on');
      const privateExtra = qs('.private-dining-extra');
      if (privateExtra) {
        if (sw.classList.contains('on')) {
          privateExtra.style.maxHeight = '200px';
          privateExtra.style.opacity = '1';
        } else {
          privateExtra.style.maxHeight = '0';
          privateExtra.style.opacity = '0';
        }
      }
    });
  }

  /* ============================================================
     GALLERY FILTER
     ============================================================ */
  function initGalleryFilter() {
    const filterBtns = qsa('.gallery-filter__btn');
    const items = qsa('.masonry-item');
    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
      on(btn, 'click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        items.forEach((item, i) => {
          const show = filter === 'all' || item.dataset.category === filter;
          item.style.transition = `opacity 0.4s ${i * 0.03}s, transform 0.4s ${i * 0.03}s`;
          if (show) {
            item.style.display = '';
            requestAnimationFrame(() => {
              item.style.opacity = '1';
              item.style.transform = 'scale(1)';
            });
          } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.96)';
            setTimeout(() => {
              if (item.style.opacity === '0') item.style.display = 'none';
            }, 400 + i * 30);
          }
        });
      });
    });
  }

  /* ============================================================
     LIGHTBOX
     ============================================================ */
  function initLightbox() {
    const lightbox = qs('.lightbox');
    if (!lightbox) return;

    const items = qsa('.masonry-item');
    const closeBtn = qs('.lightbox__close');
    const prevBtn = qs('.lightbox__nav-btn--prev');
    const nextBtn = qs('.lightbox__nav-btn--next');
    const caption = qs('.lightbox__caption');
    const lightboxImg = qs('#lightbox-img');
    let currentIndex = 0;
    const captions = [
      'Pan-Seared Halibut with Saffron Emulsion',
      'Main Dining Room — Onyx & Pearl',
      'Evening Atmosphere',
      'Wagyu Steak — Signature Main Course',
      'The Bar — Curated Wine Selection',
      'Candlelit Table Setting',
      'Chocolate Délice Dessert',
      'Pearl Chamber — Private Dining',
      'Garden Terrace at Dusk',
      'Chef\'s Table Amuse-Bouche',
      'Wine Cellar',
      'Signature Cocktail — The Onyx',
    ];

    function setLightboxImage(index, crossfade) {
      if (!lightboxImg) return;
      const img = items[index] && items[index].querySelector('img');
      if (!img || !img.src) return;
      if (crossfade) {
        lightboxImg.style.opacity = '0';
        lightboxImg.style.transform = 'scale(0.97)';
        setTimeout(() => {
          lightboxImg.src = img.src;
          lightboxImg.alt = img.alt || captions[index % captions.length] || '';
          lightboxImg.style.opacity = '1';
          lightboxImg.style.transform = 'scale(1)';
        }, 200);
      } else {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || captions[index % captions.length] || '';
      }
    }

    function openLightbox(index) {
      currentIndex = index;
      setLightboxImage(index, false);
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (caption) caption.textContent = captions[index % captions.length] || '';
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    items.forEach((item, i) => {
      on(item, 'click', () => openLightbox(i));
    });

    if (closeBtn) on(closeBtn, 'click', closeLightbox);

    on(lightbox, 'click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    if (prevBtn) {
      on(prevBtn, 'click', () => {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        setLightboxImage(currentIndex, true);
        if (caption) caption.textContent = captions[currentIndex % captions.length] || '';
      });
    }
    if (nextBtn) {
      on(nextBtn, 'click', () => {
        currentIndex = (currentIndex + 1) % items.length;
        setLightboxImage(currentIndex, true);
        if (caption) caption.textContent = captions[currentIndex % captions.length] || '';
      });
    }

    on(document, 'keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft' && prevBtn) prevBtn.click();
      if (e.key === 'ArrowRight' && nextBtn) nextBtn.click();
    });
  }

  /* ============================================================
     BOOKING FORM — date defaults + validation
     ============================================================ */
  function initBookingForm() {
    const form = qs('.booking-form form');
    if (!form) return;

    // Set min date to today
    const dateInput = qs('input[type="date"]', form);
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
      dateInput.value = today;
    }

    on(form, 'submit', (e) => {
      e.preventDefault();
      const submitBtn = qs('[type="submit"]', form);
      if (!submitBtn) return;

      submitBtn.textContent = 'Confirming...';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.textContent = 'Reservation Requested!';
        submitBtn.style.background = '#6DAA7A';
        submitBtn.style.borderColor = '#6DAA7A';
        setTimeout(() => {
          submitBtn.textContent = 'Reserve My Table';
          submitBtn.style.background = '';
          submitBtn.style.borderColor = '';
          submitBtn.disabled = false;
          form.reset();
          if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
        }, 3000);
      }, 1500);
    });
  }

  /* ============================================================
     CONTACT FORM
     ============================================================ */
  function initContactForm() {
    const form = qs('.contact-form');
    if (!form) return;

    on(form, 'submit', (e) => {
      e.preventDefault();
      const submitBtn = qs('[type="submit"]', form);
      if (!submitBtn) return;
      const original = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.textContent = 'Message Sent!';
        submitBtn.style.background = '#6DAA7A';
        submitBtn.style.borderColor = '#6DAA7A';
        setTimeout(() => {
          submitBtn.textContent = original;
          submitBtn.style.background = '';
          submitBtn.style.borderColor = '';
          submitBtn.disabled = false;
          form.reset();
        }, 3000);
      }, 1400);
    });
  }

  /* ============================================================
     URGENCY — live availability counter animation
     ============================================================ */
  function initUrgency() {
    const counters = qsa('[data-urgency-count]');
    counters.forEach(el => {
      const min = parseInt(el.dataset.min || '1');
      const max = parseInt(el.dataset.max || '5');
      let current = parseInt(el.dataset.urgencyCount || max);

      // Periodically "decrease" count for realism effect
      setInterval(() => {
        if (current > min) {
          // Randomly remove one table with low probability
          if (Math.random() < 0.15) {
            current--;
            el.textContent = current;
            el.closest('[data-urgency-wrap]')?.classList.add('urgency-flash');
            setTimeout(() => {
              el.closest('[data-urgency-wrap]')?.classList.remove('urgency-flash');
            }, 800);
          }
        }
      }, 12000);
    });
  }

  /* ============================================================
     SMOOTH ANCHOR SCROLL
     ============================================================ */
  function initSmoothScroll() {
    qsa('a[href^="#"]').forEach(link => {
      on(link, 'click', (e) => {
        const target = qs(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-height')) || 80;
        const top = target.getBoundingClientRect().top + window.scrollY - navH;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  /* ============================================================
     NUMBER COUNTERS (for about page stats)
     ============================================================ */
  function initCounters() {
    const counters = qsa('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const duration = 1500;
        const start = performance.now();

        function animate(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target) + suffix;
          if (progress < 1) requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  /* ============================================================
     CURSOR TRAILER (subtle luxury touch)
     ============================================================ */
  function initCursorTrail() {
    if (window.matchMedia('(pointer: coarse)').matches) return; // no touch devices

    const trail = document.createElement('div');
    trail.style.cssText = `
      position: fixed; pointer-events: none; z-index: 9998;
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--gold); opacity: 0;
      transform: translate(-50%, -50%);
      transition: opacity 0.3s, transform 0.3s;
    `;
    document.body.appendChild(trail);

    const ring = document.createElement('div');
    ring.style.cssText = `
      position: fixed; pointer-events: none; z-index: 9997;
      width: 32px; height: 32px; border-radius: 50%;
      border: 1px solid rgba(138,118,80,0.4);
      transform: translate(-50%, -50%);
      transition: all 0.15s cubic-bezier(0.25,0.46,0.45,0.94);
      opacity: 0;
    `;
    document.body.appendChild(ring);

    let mx = 0, my = 0, rx = 0, ry = 0;

    on(document, 'mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      trail.style.left = mx + 'px';
      trail.style.top  = my + 'px';
      trail.style.opacity = '1';
      ring.style.opacity  = '0.7';
    });

    function animateRing() {
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Scale ring on clickable elements
    const clickables = 'a, button, .table-btn, .masonry-item, .gallery-teaser__item';
    on(document, 'mouseover', (e) => {
      if (e.target.closest(clickables)) {
        ring.style.transform = 'translate(-50%, -50%) scale(1.8)';
        ring.style.borderColor = 'rgba(138,118,80,0.7)';
      }
    });
    on(document, 'mouseout', (e) => {
      if (e.target.closest(clickables)) {
        ring.style.transform = 'translate(-50%, -50%) scale(1)';
        ring.style.borderColor = 'rgba(138,118,80,0.4)';
      }
    });

    on(document, 'mouseleave', () => {
      trail.style.opacity = '0';
      ring.style.opacity  = '0';
    });
  }

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    initNav();
    initScrollReveal();
    initParallax();
    initMenuTabs();
    initSeasonToggle();
    initTableSelection();
    initPrivateDining();
    initGalleryFilter();
    initLightbox();
    initBookingForm();
    initContactForm();
    initUrgency();
    initSmoothScroll();
    initCounters();
    initCursorTrail();
  }

  if (document.readyState === 'loading') {
    on(document, 'DOMContentLoaded', init);
  } else {
    init();
  }
})();
