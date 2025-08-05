//*  @author: Andrew Peake - andrew@kaivomedia.com

import gsap from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';
import ScrollTrigger from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js';

import { initIntro } from './intro.js';
import { initTesseract } from './tesseract.js';
import { loadSections, preloadSection } from './sectionloader.js';
import { ScrollManager } from './scrollmanager.js';
import { AppState } from './state.js';
import { initNavigation } from './navigation.js';

gsap.registerPlugin(ScrollTrigger);

const sectionIds = [
  'home',
  'whatisaam',
  'about',
  'focus',
  'team',
  'join',
  'contact'
];

// Initialize app state
const appState = new AppState();

// Add performance monitoring
const performanceMetrics = {
  startTime: performance.now(),
  sectionLoadTimes: {}
};

// Safari detection
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isMobile = () => {
  return (
    window.innerWidth <= 768 ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0 ||
    ('ontouchstart' in window) ||
    (window.DocumentTouch && document instanceof DocumentTouch)
  );
};

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Add Safari class if needed
    if (isSafari) {
      document.documentElement.classList.add('safari');
    }
    
    // Add mobile class if needed
    if (isMobile()) {
      document.documentElement.classList.add('mobile');
      document.body.classList.add('mobile');
    }

    // Initialize performance monitoring
    performance.mark('app-init-start');
    
    // Start preloading sections immediately
    sectionIds.forEach(preloadSection);
    
    // Show loading state
    const mainContainer = document.getElementById('main-container');
    if (mainContainer) {
      mainContainer.style.display = 'block';
      mainContainer.style.opacity = '0';
    }

    // Initialize tesseract with error handling
    try {
      console.log('Starting tesseract initialization...');
      initTesseract();
      console.log('Tesseract initialized successfully');
    } catch (error) {
      console.error('Error initializing tesseract:', error);
    }

    const skipIntro = sessionStorage.getItem('skipIntro');
    const scrollToId = sessionStorage.getItem('scrollTo');

    // Initialize navigation after intro
    if (!skipIntro) {
      await initIntro();
    }
    initNavigation();

    const showSite = async () => {
      try {
        performance.mark('sections-load-start');
        
        // Load sections with loading state
        appState.setLoading(true);
        const loadedSections = await loadSections(sectionIds);
        appState.setLoading(false);
        
        performance.mark('sections-load-end');
        performance.measure('sections-load', 'sections-load-start', 'sections-load-end');
        
        // Initialize scroll manager
        const scrollManager = new ScrollManager();
        await scrollManager.init();

        // Debug: Check focus section
        const focusSection = document.getElementById('focus');
        if (focusSection) {
          console.log('Focus section found in DOM');
          const focusLayers = focusSection.querySelectorAll('.focus-layer');
          console.log('Focus layers found:', focusLayers.length);
          
          // Test focus section interaction
          focusLayers.forEach((layer, index) => {
            console.log(`Focus layer ${index}:`, layer.textContent.trim());
            layer.addEventListener('click', () => {
              console.log(`Focus layer ${index} clicked!`);
            });
          });
        } else {
          console.log('Focus section NOT found in DOM');
        }

        // Show main container with animation
        if (mainContainer) {
          console.log('Showing main container');
          mainContainer.style.display = 'block';
          mainContainer.style.opacity = '1';
          gsap.to(mainContainer, {
            opacity: 1,
            duration: 1,
            ease: 'power2.out'
          });
        } else {
          console.error('Main container not found!');
        }

        // Show footer
        const footer = document.getElementById('site-footer');
        if (footer) {
          footer.style.display = 'block';
          gsap.from(footer, {
            opacity: 0,
            y: 20,
            duration: 0.8,
            delay: 0.5
          });
        }

        // Handle scroll to section
        if (scrollToId) {
          setTimeout(() => {
            const target = document.getElementById(scrollToId);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth' });
              appState.setActiveSection(scrollToId);
            }
          }, 200);
        }

        // Track successful load
        appState.trackInteraction('site_loaded', {
          loadedSections,
          loadTime: performance.now() - performanceMetrics.startTime
        });

        // Debug: Check what sections are actually in the DOM
        console.log('=== DEBUG: Checking sections in DOM ===');
        sectionIds.forEach(id => {
          const section = document.getElementById(id);
          console.log(`Section ${id}:`, section ? 'EXISTS' : 'MISSING');
        });
        console.log('=== END DEBUG ===');

      } catch (error) {
        console.error('Error showing site:', error);
        appState.addError({
          type: 'site_load_error',
          error: error.message
        });
      }
    };

    console.log('About to show site...');
    await showSite();
    console.log('Site show complete');



    ScrollTrigger.defaults({ markers: false });
    ScrollTrigger.refresh();

    // Initialize ScrollManager to handle all section-specific functionality
    const scrollManager = new ScrollManager();
    
    // Add a small delay to ensure sections are fully loaded
    setTimeout(() => {
      console.log('Initializing ScrollManager...');
      scrollManager.init();
      
      // Refresh ScrollTrigger after initialization
      ScrollTrigger.refresh();
      console.log('ScrollManager initialization complete');
    }, 100);

    // Update mobile status on resize with debouncing
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const wasMobile = document.documentElement.classList.contains('mobile');
        const isMobileNow = isMobile();
        
        if (wasMobile !== isMobileNow) {
          document.documentElement.classList.toggle('mobile', isMobileNow);
          document.body.classList.toggle('mobile', isMobileNow);
          // Refresh ScrollTrigger after mobile state change
          ScrollTrigger.refresh();
        }
      }, 250);
    }, { passive: true });

    // Final performance mark
    performance.mark('app-init-end');
    performance.measure('app-total-init', 'app-init-start', 'app-init-end');

  } catch (error) {
    console.error('Critical application error:', error);
    appState.addError({
      type: 'critical_error',
      error: error.message
    });
    
    // Show error message to user
    const errorOverlay = document.createElement('div');
    errorOverlay.className = 'critical-error-overlay';
    errorOverlay.innerHTML = `
      <div class="error-message">
        <h2>Something went wrong</h2>
        <p>We're having trouble loading the site. Please try refreshing the page.</p>
        <button onclick="window.location.reload()">Refresh Page</button>
      </div>
    `;
    document.body.appendChild(errorOverlay);
  }
});





