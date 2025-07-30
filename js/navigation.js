export function initNavigation() {
  const nav = document.getElementById('main-nav');
  let lastScrollTop = 0;
  let isHovering = false;
  let scrollTimeout;

  // Mobile detection
  const isMobile = () => {
    return (
      window.innerWidth <= 768 ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0 ||
      ('ontouchstart' in window) ||
      (window.DocumentTouch && document instanceof DocumentTouch)
    );
  };

  // Create hover detection area (only for desktop)
  if (!isMobile()) {
    const hoverArea = document.createElement('div');
    hoverArea.className = 'nav-hover-area';
    document.body.appendChild(hoverArea);

    // Handle hover (desktop only)
    function handleHover(isEntering) {
      isHovering = isEntering;
      if (isEntering) {
        nav.classList.remove('nav-hidden');
        nav.classList.add('nav-visible');
      } else {
        // Only hide if we're scrolling down
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop && scrollTop > 100) {
          nav.classList.add('nav-hidden');
          nav.classList.remove('nav-visible');
        }
      }
    }

    hoverArea.addEventListener('mouseenter', () => handleHover(true));
    hoverArea.addEventListener('mouseleave', () => handleHover(false));
    nav.addEventListener('mouseenter', () => handleHover(true));
    nav.addEventListener('mouseleave', () => handleHover(false));
  }

  // Show nav after intro
  nav.classList.add('nav-hidden');
  setTimeout(() => {
    nav.classList.add('nav-visible');
  }, 100); // Small delay after intro

  // Handle scroll
  function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Clear the timeout on new scroll
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }

    // Don't hide if hovering (desktop only)
    if (isHovering && !isMobile()) return;

    // On mobile, always show nav when scrolling up or at top
    if (isMobile()) {
      if (scrollTop <= 100 || scrollTop < lastScrollTop) {
        nav.classList.remove('nav-hidden');
        nav.classList.add('nav-visible');
      } else {
        nav.classList.add('nav-hidden');
        nav.classList.remove('nav-visible');
      }
    } else {
      // Desktop behavior
      if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down & not at top
        nav.classList.add('nav-hidden');
        nav.classList.remove('nav-visible');
      } else {
        // Scrolling up or at top
        nav.classList.remove('nav-hidden');
        nav.classList.add('nav-visible');
      }
    }

    lastScrollTop = scrollTop;

    // Set timeout to show nav after scrolling stops
    scrollTimeout = setTimeout(() => {
      nav.classList.remove('nav-hidden');
      nav.classList.add('nav-visible');
    }, 2000); // Show nav after 2 seconds of no scrolling
  }

  // Event listeners
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Handle smooth scrolling for nav links
  nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      e.preventDefault();
      const targetId = e.target.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });

  // Handle mobile menu toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    const navLinksArray = document.querySelectorAll('.nav-links a');
    navLinksArray.forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-container')) {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
      }
    });
  }

  // Handle focus section mobile interactions
  const focusLayers = document.querySelectorAll('.focus-layer');
  
  focusLayers.forEach(layer => {
    // Touch events for mobile
    layer.addEventListener('touchstart', (e) => {
      if (isMobile()) {
        e.preventDefault();
        // Close other layers
        focusLayers.forEach(l => {
          if (l !== layer) l.classList.remove('active');
        });
        // Toggle current layer
        layer.classList.toggle('active');
      }
    }, { passive: false });

    // Click events for desktop
    layer.addEventListener('click', (e) => {
      if (!isMobile()) {
        // Close other layers
        focusLayers.forEach(l => {
          if (l !== layer) l.classList.remove('active');
        });
        // Toggle current layer
        layer.classList.toggle('active');
      }
    });
  });

  // Handle resize events for focus layers
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!isMobile()) {
        focusLayers.forEach(layer => layer.classList.remove('active'));
      }
    }, 250);
  }, { passive: true });
} 