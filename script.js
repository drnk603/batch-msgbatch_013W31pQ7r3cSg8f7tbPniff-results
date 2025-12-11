(function() {
  'use strict';

  if (!window.__app) {
    window.__app = {};
  }

  var app = window.__app;

  if (app.__initialized) {
    return;
  }

  function debounce(func, wait) {
    var timeout;
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  function throttle(func, limit) {
    var inThrottle;
    return function() {
      var context = this;
      var args = arguments;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(function() {
          inThrottle = false;
        }, limit);
      }
    };
  }

  function initBurgerMenu() {
    if (app.__burgerInit) return;
    app.__burgerInit = true;

    var nav = document.querySelector('.c-nav');
    var toggle = document.querySelector('.c-nav__toggle');
    var navList = document.querySelector('.c-nav__list');
    var body = document.body;

    if (!nav || !toggle || !navList) return;

    function openMenu() {
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('u-no-scroll');
      navList.style.maxHeight = 'calc(100vh - var(--header-h-mobile))';
    }

    function closeMenu() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('u-no-scroll');
      navList.style.maxHeight = '0';
    }

    toggle.addEventListener('click', function(e) {
      e.stopPropagation();
      if (nav.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMenu();
      }
    });

    document.addEventListener('click', function(e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target)) {
        closeMenu();
      }
    });

    var navLinks = document.querySelectorAll('.c-nav__link');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function() {
        if (window.innerWidth < 1024) {
          closeMenu();
        }
      });
    }

    var resizeHandler = debounce(function() {
      if (window.innerWidth >= 1024 && nav.classList.contains('is-open')) {
        closeMenu();
      }
    }, 200);

    window.addEventListener('resize', resizeHandler);
  }

  function initSmoothScroll() {
    if (app.__smoothScrollInit) return;
    app.__smoothScrollInit = true;

    function getHeaderHeight() {
      var header = document.querySelector('.l-header');
      return header ? header.offsetHeight : 80;
    }

    function smoothScrollTo(target) {
      var headerHeight = getHeaderHeight();
      var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }

    document.addEventListener('click', function(e) {
      var target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }

      if (!target) return;

      var href = target.getAttribute('href');
      if (!href || !href.startsWith('#') || href === '#' || href === '#!') return;

      var targetId = href.substring(1);
      var targetElement = document.getElementById(targetId);

      if (targetElement) {
        e.preventDefault();
        smoothScrollTo(targetElement);
        history.pushState(null, '', href);
      }
    });
  }

  function initActiveMenu() {
    if (app.__activeMenuInit) return;
    app.__activeMenuInit = true;

    var currentPath = window.location.pathname;
    var navLinks = document.querySelectorAll('.c-nav__link');

    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      var linkPath = link.getAttribute('href');

      if (!linkPath) continue;

      var isActive = false;

      if (linkPath === '/' || linkPath === '/index.html') {
        isActive = currentPath === '/' || currentPath.endsWith('/index.html');
      } else {
        isActive = currentPath === linkPath || currentPath.endsWith(linkPath);
      }

      if (isActive) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      } else {
        link.removeAttribute('aria-current');
        link.classList.remove('active');
      }
    }
  }

  function initScrollSpy() {
    if (app.__scrollSpyInit) return;
    app.__scrollSpyInit = true;

    var sections = document.querySelectorAll('[id]');
    var navLinks = document.querySelectorAll('.c-nav__link[href^="#"]');

    if (sections.length === 0 || navLinks.length === 0) return;

    function updateActiveLink() {
      var scrollPos = window.pageYOffset + 100;

      for (var i = sections.length - 1; i >= 0; i--) {
        var section = sections[i];
        var sectionTop = section.offsetTop;
        var sectionHeight = section.offsetHeight;
        var sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          for (var j = 0; j < navLinks.length; j++) {
            var link = navLinks[j];
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + sectionId) {
              link.classList.add('active');
            }
          }
          break;
        }
      }
    }

    var scrollHandler = throttle(updateActiveLink, 100);
    window.addEventListener('scroll', scrollHandler);
  }

  function initIntersectionObserver() {
    if (app.__intersectionInit) return;
    app.__intersectionInit = true;

    if (!('IntersectionObserver' in window)) return;

    var animateElements = document.querySelectorAll('.card, .c-card, .c-service-card, .c-testimonial, .c-industry-card, img, .l-hero__text, .l-hero__image');

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '0';
          entry.target.style.transform = 'translateY(30px)';
          entry.target.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';

          setTimeout(function() {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, 100);

          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    for (var i = 0; i < animateElements.length; i++) {
      observer.observe(animateElements[i]);
    }
  }

  function initButtonEffects() {
    if (app.__buttonEffectsInit) return;
    app.__buttonEffectsInit = true;

    var buttons = document.querySelectorAll('.c-button, .c-nav__link, .c-breadcrumb__link, .c-link');

    for (var i = 0; i < buttons.length; i++) {
      (function(btn) {
        btn.addEventListener('mouseenter', function() {
          this.style.transition = 'all 0.3s ease-out';
        });

        btn.addEventListener('click', function(e) {
          var ripple = document.createElement('span');
          var rect = this.getBoundingClientRect();
          var size = Math.max(rect.width, rect.height);
          var x = e.clientX - rect.left - size / 2;
          var y = e.clientY - rect.top - size / 2;

          ripple.style.width = ripple.style.height = size + 'px';
          ripple.style.left = x + 'px';
          ripple.style.top = y + 'px';
          ripple.style.position = 'absolute';
          ripple.style.borderRadius = '50%';
          ripple.style.transform = 'scale(0)';
          ripple.style.opacity = '0.5';
          ripple.style.pointerEvents = 'none';

          var bgColor = window.getComputedStyle(this).backgroundColor;
          var textColor = window.getComputedStyle(this).color;

          if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
            ripple.style.backgroundColor = textColor;
          } else {
            var rgb = bgColor.match(/d+/g);
            if (rgb) {
              var brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
              ripple.style.backgroundColor = brightness > 128 ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)';
            }
          }

          var existingRipple = this.querySelector('span[style*="position: absolute"]');
          if (existingRipple) {
            existingRipple.remove();
          }

          this.style.position = 'relative';
          this.style.overflow = 'hidden';
          this.appendChild(ripple);

          setTimeout(function() {
            ripple.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
            ripple.style.transform = 'scale(2)';
            ripple.style.opacity = '0';
          }, 10);

          setTimeout(function() {
            if (ripple.parentNode) {
              ripple.remove();
            }
          }, 600);
        });
      })(buttons[i]);
    }
  }

  function initFormValidation() {
    if (app.__formValidationInit) return;
    app.__formValidationInit = true;

    var form = document.getElementById('contact-form');
    if (!form) return;

    var nameInput = document.getElementById('name');
    var emailInput = document.getElementById('email');
    var phoneInput = document.getElementById('phone');
    var messageInput = document.getElementById('message');
    var privacyInput = document.getElementById('privacy');

    var nameError = document.getElementById('name-error');
    var emailError = document.getElementById('email-error');
    var phoneError = document.getElementById('phone-error');
    var messageError = document.getElementById('message-error');
    var privacyError = document.getElementById('privacy-error');

    function showError(input, errorElement, message) {
      input.classList.add('has-error');
      errorElement.textContent = message;
      errorElement.classList.add('is-visible');
    }

    function hideError(input, errorElement) {
      input.classList.remove('has-error');
      errorElement.textContent = '';
      errorElement.classList.remove('is-visible');
    }

    function validateName() {
      var value = nameInput.value.trim();
      var namePattern = /^[a-zA-ZÀ-ÿs-']{2,50}$/;

      if (!value) {
        showError(nameInput, nameError, 'Naam is verplicht');
        return false;
      }

      if (!namePattern.test(value)) {
        showError(nameInput, nameError, 'Voer een geldige naam in (2-50 tekens, alleen letters)');
        return false;
      }

      hideError(nameInput, nameError);
      return true;
    }

    function validateEmail() {
      var value = emailInput.value.trim();
      var emailPattern = /^[^s@]+@[^s@]+.[^s@]+$/;

      if (!value) {
        showError(emailInput, emailError, 'E-mailadres is verplicht');
        return false;
      }

      if (!emailPattern.test(value)) {
        showError(emailInput, emailError, 'Voer een geldig e-mailadres in');
        return false;
      }

      hideError(emailInput, emailError);
      return true;
    }

    function validatePhone() {
      var value = phoneInput.value.trim();

      if (!value) {
        hideError(phoneInput, phoneError);
        return true;
      }

      var phonePattern = /^[ds+-()]{10,20}$/;

      if (!phonePattern.test(value)) {
        showError(phoneInput, phoneError, 'Voer een geldig telefoonnummer in (10-20 tekens)');
        return false;
      }

      hideError(phoneInput, phoneError);
      return true;
    }

    function validateMessage() {
      var value = messageInput.value.trim();

      if (!value) {
        showError(messageInput, messageError, 'Bericht is verplicht');
        return false;
      }

      if (value.length < 10) {
        showError(messageInput, messageError, 'Bericht moet minimaal 10 tekens bevatten');
        return false;
      }

      hideError(messageInput, messageError);
      return true;
    }

    function validatePrivacy() {
      if (!privacyInput.checked) {
        showError(privacyInput, privacyError, 'U moet akkoord gaan met het privacybeleid');
        return false;
      }

      hideError(privacyInput, privacyError);
      return true;
    }

    nameInput.addEventListener('blur', validateName);
    emailInput.addEventListener('blur', validateEmail);
    phoneInput.addEventListener('blur', validatePhone);
    messageInput.addEventListener('blur', validateMessage);
    privacyInput.addEventListener('change', validatePrivacy);

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      var isNameValid = validateName();
      var isEmailValid = validateEmail();
      var isPhoneValid = validatePhone();
      var isMessageValid = validateMessage();
      var isPrivacyValid = validatePrivacy();

      if (!isNameValid || !isEmailValid || !isPhoneValid || !isMessageValid || !isPrivacyValid) {
        return;
      }

      var submitButton = form.querySelector('button[type="submit"]');
      var originalText = submitButton.innerHTML;

      submitButton.disabled = true;
      submitButton.innerHTML = '<span style="display:inline-block;width:16px;height:16px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:8px;"></span>Verzenden...';

      var style = document.createElement('style');
      style.innerHTML = '@keyframes spin { to { transform: rotate(360deg); } }';
      document.head.appendChild(style);

      setTimeout(function() {
        window.location.href = 'thank_you.html';
      }, 1500);
    });
  }

  function initScrollToTop() {
    if (app.__scrollToTopInit) return;
    app.__scrollToTopInit = true;

    var scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '↑';
    scrollBtn.style.cssText = 'position:fixed;bottom:30px;right:30px;width:50px;height:50px;border-radius:50%;background:var(--color-primary);color:#fff;border:none;font-size:24px;cursor:pointer;opacity:0;visibility:hidden;transition:all 0.3s ease;z-index:1000;box-shadow:0 4px 12px rgba(0,0,0,0.15);';
    scrollBtn.setAttribute('aria-label', 'Scroll naar boven');
    document.body.appendChild(scrollBtn);

    function toggleScrollBtn() {
      if (window.pageYOffset > 300) {
        scrollBtn.style.opacity = '1';
        scrollBtn.style.visibility = 'visible';
      } else {
        scrollBtn.style.opacity = '0';
        scrollBtn.style.visibility = 'hidden';
      }
    }

    scrollBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    scrollBtn.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.1)';
      this.style.background = 'var(--color-primary-dark)';
    });

    scrollBtn.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
      this.style.background = 'var(--color-primary)';
    });

    var scrollHandler = throttle(toggleScrollBtn, 100);
    window.addEventListener('scroll', scrollHandler);
    toggleScrollBtn();
  }

  function initCountUpAnimation() {
    if (app.__countUpInit) return;
    app.__countUpInit = true;

    var counters = document.querySelectorAll('[data-count]');

    if (counters.length === 0 || !('IntersectionObserver' in window)) return;

    function animateCounter(element) {
      var target = parseInt(element.getAttribute('data-count'));
      var duration = 2000;
      var start = 0;
      var increment = target / (duration / 16);
      var current = start;

      function updateCounter() {
        current += increment;
        if (current < target) {
          element.textContent = Math.floor(current);
          requestAnimationFrame(updateCounter);
        } else {
          element.textContent = target;
        }
      }

      updateCounter();
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    for (var i = 0; i < counters.length; i++) {
      observer.observe(counters[i]);
    }
  }

  function initCardHoverEffects() {
    if (app.__cardHoverInit) return;
    app.__cardHoverInit = true;

    var cards = document.querySelectorAll('.card, .c-card, .c-service-card, .c-testimonial');

    for (var i = 0; i < cards.length; i++) {
      (function(card) {
        card.addEventListener('mouseenter', function() {
          this.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
          this.style.transform = 'translateY(-8px)';
          this.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.2)';
        });

        card.addEventListener('mouseleave', function() {
          this.style.transform = 'translateY(0)';
          this.style.boxShadow = '';
        });
      })(cards[i]);
    }
  }

  function initPrivacyModal() {
    if (app.__privacyModalInit) return;
    app.__privacyModalInit = true;

    var privacyLinks = document.querySelectorAll('a[href*="privacy"]');

    for (var i = 0; i < privacyLinks.length; i++) {
      privacyLinks[i].addEventListener('click', function(e) {
        var href = this.getAttribute('href');
        if (href && (href.includes('privacy.html') || href.includes('#privacy'))) {
          return;
        }
      });
    }
  }

  function initImageAnimations() {
    if (app.__imageAnimInit) return;
    app.__imageAnimInit = true;

    var images = document.querySelectorAll('img[loading="lazy"]');

    for (var i = 0; i < images.length; i++) {
      images[i].style.opacity = '0';
      images[i].style.transform = 'scale(0.95)';
      images[i].style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';

      (function(img) {
        img.addEventListener('load', function() {
          setTimeout(function() {
            img.style.opacity = '1';
            img.style.transform = 'scale(1)';
          }, 100);
        });

        if (img.complete) {
          img.style.opacity = '1';
          img.style.transform = 'scale(1)';
        }
      })(images[i]);
    }
  }

  app.init = function() {
    if (app.__initialized) return;

    initBurgerMenu();
    initSmoothScroll();
    initActiveMenu();
    initScrollSpy();
    initIntersectionObserver();
    initButtonEffects();
    initFormValidation();
    initScrollToTop();
    initCountUpAnimation();
    initCardHoverEffects();
    initPrivacyModal();
    initImageAnimations();

    app.__initialized = true;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
  } else {
    app.init();
  }

})();
.c-nav__list {
  height: 0;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.c-nav.is-open .c-nav__list {
  height: calc(100vh - var(--header-h-mobile));
  max-height: calc(100vh - var(--header-h-mobile));
}
