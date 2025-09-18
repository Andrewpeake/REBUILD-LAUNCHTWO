export function initNavigation() {
  const nav = document.getElementById('main-nav');
  let lastScrollTop = 0;
  let isHovering = false;
  let scrollTimeout;

  // Create hover detection area
  const hoverArea = document.createElement('div');
  hoverArea.className = 'nav-hover-area';
  document.body.appendChild(hoverArea);

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

    // Don't hide if hovering
    if (isHovering) return;

    // Determine scroll direction and show/hide nav
    if (scrollTop > lastScrollTop && scrollTop > 100) {
      // Scrolling down & not at top
      nav.classList.add('nav-hidden');
      nav.classList.remove('nav-visible');
    } else {
      // Scrolling up or at top
      nav.classList.remove('nav-hidden');
      nav.classList.add('nav-visible');
    }

    lastScrollTop = scrollTop;

    // Set timeout to show nav after scrolling stops
    scrollTimeout = setTimeout(() => {
      nav.classList.remove('nav-hidden');
      nav.classList.add('nav-visible');
    }, 2000); // Show nav after 2 seconds of no scrolling
  }

  // Handle hover
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

  // Event listeners
  window.addEventListener('scroll', handleScroll, { passive: true });
  hoverArea.addEventListener('mouseenter', () => handleHover(true));
  hoverArea.addEventListener('mouseleave', () => handleHover(false));
  nav.addEventListener('mouseenter', () => handleHover(true));
  nav.addEventListener('mouseleave', () => handleHover(false));

  // Handle smooth scrolling for nav links
  nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      e.preventDefault();
      const targetId = e.target.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
        
        
        // Track with app state
        if (window.uamAppState) {
          window.uamAppState.trackInteraction('navigation_click', {
            targetSection: targetId.replace('#', ''),
            linkText: e.target.textContent
          });
        }
      }
    }
  });
} 