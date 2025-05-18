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

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Initialize performance monitoring
    performance.mark('app-init-start');
    
    // Start preloading sections immediately
    sectionIds.forEach(preloadSection);
    
    // Show loading state
    const mainContainer = document.getElementById('main-container');
    if (mainContainer) {
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

        // Show main container with animation
        if (mainContainer) {
          mainContainer.style.display = 'block';
          gsap.to(mainContainer, {
            opacity: 1,
            duration: 1,
            ease: 'power2.out'
          });
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

      } catch (error) {
        console.error('Error showing site:', error);
        appState.addError({
          type: 'site_load_error',
          error: error.message
        });
      }
    };

    if (skipIntro === 'true') {
      sessionStorage.removeItem('skipIntro');
      sessionStorage.removeItem('scrollTo');
      await showSite();
    } else {
      await showSite();
    }

    // Initialize AAM interaction with error handling
    try {
      const items = document.querySelectorAll('.aam-item');
      items.forEach(item => {
        item.addEventListener('click', () => {
          const details = item.nextElementSibling;

          // Track interaction
          appState.trackInteraction('aam_item_click', {
            itemId: item.id || 'unknown'
          });

          document.querySelectorAll('.aam-details').forEach(detail => {
            detail.style.maxHeight = '0px';
            detail.style.opacity = '0';
            detail.style.transition = 'max-height 0.5s ease, opacity 0.4s ease';
          });

          items.forEach(i => i.classList.remove('active'));

          if (!item.classList.contains('active')) {
            item.classList.add('active');
            details.style.maxHeight = details.scrollHeight + 'px';
            details.style.opacity = '1';
          } else {
            item.classList.remove('active');
            details.style.maxHeight = '0px';
            details.style.opacity = '0';
          }
        });
      });
    } catch (error) {
      console.error('Error setting up AAM interactions:', error);
      appState.addError({
        type: 'aam_setup_error',
        error: error.message
      });
    }

    ScrollTrigger.defaults({ markers: false });
    ScrollTrigger.refresh();

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





