export function initNavigation() {
  const nav = document.getElementById('main-nav');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const isMobile = () => window.innerWidth <= 768;

  // Toggle mobile menu
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', (e) => {
      e.preventDefault();
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }

  // Handle navigation clicks
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Close mobile menu if open
      if (isMobile()) {
        navToggle?.classList.remove('active');
        navLinks?.classList.remove('active');
      }

      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        const scrollContainer = isMobile() ? document.getElementById('main-container') : window;
        const targetPosition = targetElement.offsetTop;

        if (isMobile()) {
          scrollContainer?.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        } else {
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }

        // Update URL without scrolling
        const url = new URL(window.location);
        url.hash = `#${targetId}`;
        window.history.replaceState({}, '', url);
      }
    });
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (isMobile() && 
        navLinks?.classList.contains('active') && 
        !e.target.closest('.nav-container')) {
      navToggle?.classList.remove('active');
      navLinks?.classList.remove('active');
    }
  });

  // Handle resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!isMobile()) {
        navToggle?.classList.remove('active');
        navLinks?.classList.remove('active');
      }
    }, 250);
  }, { passive: true });
} 