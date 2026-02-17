/* ============================================
   Personal Portfolio - Main JavaScript
   Smooth Scroll (Lenis) + GSAP Animations
   ============================================ */

(function () {
  'use strict';

  // Wait for DOM and libraries to load
  window.addEventListener('DOMContentLoaded', init);

  function init() {
    initLoader();
    initLenis();
    initCursor();
    initMobileMenu();
    initMagnetic();
  }

  /* ============================================
     Loader
     ============================================ */

  function initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;

    // Simulate a brief loading period, then reveal
    window.addEventListener('load', function () {
      setTimeout(function () {
        loader.classList.add('is-hidden');
        startEntryAnimations();
      }, 800);
    });

    // Fallback: if load event already fired
    if (document.readyState === 'complete') {
      setTimeout(function () {
        loader.classList.add('is-hidden');
        startEntryAnimations();
      }, 800);
    }
  }

  /* ============================================
     Lenis Smooth Scroll
     ============================================ */

  function initLenis() {
    if (typeof Lenis === 'undefined') return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      orientation: 'vertical',
      smoothWheel: true,
    });

    // Connect Lenis to GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    } else {
      // Fallback: use requestAnimationFrame
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    // Handle anchor link clicks for smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        var target = document.querySelector(href);
        if (target) {
          lenis.scrollTo(target, { offset: 0 });
          // Close mobile menu if open
          closeMobileMenu();
        }
      });
    });

    window._lenis = lenis;
  }

  /* ============================================
     GSAP Entry Animations
     ============================================ */

  function startEntryAnimations() {
    if (typeof gsap === 'undefined') return;

    // Hero title lines
    var heroLines = document.querySelectorAll('[data-animate="hero"]');
    gsap.to(heroLines, {
      y: 0,
      duration: 1.2,
      ease: 'expo.out',
      stagger: 0.1,
      delay: 0.2,
    });

    // Fade-up elements in hero
    var fadeUpElements = document.querySelectorAll('.hero [data-animate="fade-up"]');
    gsap.to(fadeUpElements, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'expo.out',
      stagger: 0.15,
      delay: 0.8,
    });

    // Init scroll-triggered animations after entry
    setTimeout(initScrollAnimations, 100);
  }

  /* ============================================
     GSAP Scroll-Triggered Animations
     ============================================ */

  function initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Section headers
    gsap.utils.toArray('.section-header').forEach(function (header) {
      gsap.to(header, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: header,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });

    // Work items - staggered reveal
    gsap.utils.toArray('.work-item').forEach(function (item, i) {
      gsap.to(item, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'expo.out',
        delay: (i % 2) * 0.15,
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });

    // About text and skills
    gsap.utils.toArray('.about-text, .about-skills').forEach(function (el) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });

    // Stats counter animation
    var statsSection = document.querySelector('.stats');
    if (statsSection) {
      ScrollTrigger.create({
        trigger: statsSection,
        start: 'top 80%',
        onEnter: animateCounters,
        once: true,
      });
    }

    // Contact section
    animateContactSection();

    // Parallax on work images
    gsap.utils.toArray('.work-item-image-wrap').forEach(function (wrap) {
      gsap.to(wrap.querySelector('.work-item-image'), {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    });

    // Nav hide/show on scroll
    var nav = document.getElementById('nav');
    var lastScrollY = 0;
    ScrollTrigger.create({
      start: 'top top',
      end: 'max',
      onUpdate: function (self) {
        var scrollY = self.scroll();
        if (scrollY > lastScrollY && scrollY > 100) {
          nav.style.transform = 'translateY(-100%)';
        } else {
          nav.style.transform = 'translateY(0)';
        }
        lastScrollY = scrollY;
      },
    });
  }

  /* ============================================
     Counter Animation
     ============================================ */

  function animateCounters() {
    var counters = document.querySelectorAll('.stat-number[data-count]');
    counters.forEach(function (counter) {
      var target = parseInt(counter.getAttribute('data-count'), 10);
      var obj = { value: 0 };

      gsap.to(obj, {
        value: target,
        duration: 2,
        ease: 'expo.out',
        onUpdate: function () {
          counter.textContent = Math.round(obj.value);
        },
      });
    });
  }

  /* ============================================
     Contact Section - Split Text Animation
     ============================================ */

  function animateContactSection() {
    var contactTitle = document.querySelector('.contact-title');
    if (!contactTitle || typeof gsap === 'undefined') return;

    // Split text into characters
    var text = contactTitle.innerHTML;
    var chars = '';
    var inTag = false;

    for (var i = 0; i < text.length; i++) {
      var char = text[i];
      if (char === '<') {
        inTag = true;
        chars += char;
      } else if (char === '>') {
        inTag = false;
        chars += char;
      } else if (inTag) {
        chars += char;
      } else if (char === ' ') {
        chars += ' ';
      } else {
        chars += '<span class="char">' + char + '</span>';
      }
    }

    contactTitle.innerHTML = chars;

    // Animate each character
    gsap.to(contactTitle.querySelectorAll('.char'), {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'expo.out',
      stagger: 0.02,
      scrollTrigger: {
        trigger: contactTitle,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    // Animate email and links
    var contactEmail = document.querySelector('.contact-email');
    if (contactEmail) {
      gsap.to(contactEmail, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: contactEmail,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }

    var contactLinks = document.querySelector('.contact-links');
    if (contactLinks) {
      gsap.to(contactLinks, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'expo.out',
        delay: 0.2,
        scrollTrigger: {
          trigger: contactLinks,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }
  }

  /* ============================================
     Custom Cursor
     ============================================ */

  function initCursor() {
    // Only show custom cursor on devices with fine pointer
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var cursor = document.getElementById('cursor');
    if (!cursor) return;

    cursor.style.display = 'block';
    document.body.style.cursor = 'none';

    var dotX = 0, dotY = 0;
    var outlineX = 0, outlineY = 0;
    var mouseX = 0, mouseY = 0;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateCursor() {
      // Dot follows immediately
      dotX += (mouseX - dotX) * 0.5;
      dotY += (mouseY - dotY) * 0.5;

      // Outline follows with lag
      outlineX += (mouseX - outlineX) * 0.15;
      outlineY += (mouseY - outlineY) * 0.15;

      var dot = cursor.querySelector('.cursor-dot');
      var outline = cursor.querySelector('.cursor-outline');

      dot.style.transform = 'translate(calc(' + dotX + 'px - 50%), calc(' + dotY + 'px - 50%))';
      outline.style.transform = 'translate(calc(' + outlineX + 'px - 50%), calc(' + outlineY + 'px - 50%))';

      requestAnimationFrame(animateCursor);
    }
    requestAnimationFrame(animateCursor);

    // Hover state for interactive elements
    var interactiveElements = document.querySelectorAll(
      'a, button, [data-magnetic], .work-item-link, .contact-link'
    );

    interactiveElements.forEach(function (el) {
      el.style.cursor = 'none';
      el.addEventListener('mouseenter', function () {
        cursor.classList.add('is-hovering');
      });
      el.addEventListener('mouseleave', function () {
        cursor.classList.remove('is-hovering');
      });
    });
  }

  /* ============================================
     Magnetic Elements
     ============================================ */

  function initMagnetic() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (typeof gsap === 'undefined') return;

    var magneticElements = document.querySelectorAll('[data-magnetic]');
    magneticElements.forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;

        gsap.to(el, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.4,
          ease: 'power2.out',
        });
      });

      el.addEventListener('mouseleave', function () {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)',
        });
      });
    });
  }

  /* ============================================
     Mobile Menu
     ============================================ */

  var mobileMenuOpen = false;

  function initMobileMenu() {
    var menuBtn = document.getElementById('menuBtn');
    var mobileMenu = document.getElementById('mobileMenu');
    if (!menuBtn || !mobileMenu) return;

    menuBtn.addEventListener('click', function () {
      mobileMenuOpen = !mobileMenuOpen;

      if (mobileMenuOpen) {
        menuBtn.classList.add('is-active');
        mobileMenu.classList.add('is-open');
        if (window._lenis) window._lenis.stop();
      } else {
        closeMobileMenu();
      }
    });

    // Close on link click
    mobileMenu.querySelectorAll('.mobile-menu-link').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMobileMenu();
      });
    });
  }

  function closeMobileMenu() {
    var menuBtn = document.getElementById('menuBtn');
    var mobileMenu = document.getElementById('mobileMenu');

    mobileMenuOpen = false;
    if (menuBtn) menuBtn.classList.remove('is-active');
    if (mobileMenu) mobileMenu.classList.remove('is-open');
    if (window._lenis) window._lenis.start();
  }
})();
