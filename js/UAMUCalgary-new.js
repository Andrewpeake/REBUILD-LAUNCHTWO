/**
 * Project: UAMUCalgary
 * Authors:
 *   • Andrew Peake — andrew@kaivomedia.com (Lead Developer)
 *   • Armaan Kautish — armaankautish@gmail.com (Lead Developer)
 */

import gsap from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';
import ScrollTrigger from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js';

import { initIntro } from './intro.js';
import { initTesseract } from './tesseract.js';
import { loadSections, preloadSection } from './sectionloader.js';
import { ScrollManager } from './scrollmanager.js';
import { AppState } from './state.js';
import { initNavigation } from './navigation.js';

gsap.registerPlugin(ScrollTrigger);

gsap.config({ trialWarn: false }); // Optional: Silences a GSAP trial warning in the console
ScrollTrigger.normalizeScroll(true); // The magic line for smooth scrolling!

const sectionIds = [
  'home',
  'whatisaam',
  'about',
  'focus',
  'team',
  'how-it-works',
  'join',
  'partnerships',
  'contact'
];

// Initialize app state
const appState = new AppState();
window.uamAppState = appState;

// Add performance monitoring
const performanceMetrics = {
  startTime: performance.now(),
  sectionLoadTimes: {}
};

// Safari detection
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

document.addEventListener('DOMContentLoaded', async () => {
  // Track page load start

  let scrollTimeout;
  window.addEventListener('scroll', () => {
    window.tesseractAnimation.pause();
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      window.tesseractAnimation.resume();
    }, 150); // Resume animation after 150ms of no scrolling
    
    // Track scroll depth
    const scrollDepth = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    if (scrollDepth % 25 === 0 && scrollDepth > 0) {
    }
  }, { passive: true });


  try {
    // Add Safari class if needed
    if (isSafari) {
      document.documentElement.classList.add('safari');
    }

    // Initialize performance monitoring
    performance.mark('app-init-start');
    
    // Start preloading sections immediately
    sectionIds.forEach(preloadSection);
    
    // Show loading state
    const mainContainer = document.getElementById('main-container');
    if (mainContainer) {
      mainContainer.style.opacity = '0';
    }

    // Initialize tesseract with error handling and mobile optimization
    // Replace the block above with this one
    try {
      console.log('Starting tesseract initialization...');
      initTesseract(); // Always initialize the animation
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
        const sectionLoadStart = performance.now();
        const loadedSections = await loadSections(sectionIds);
        const sectionLoadTime = performance.now() - sectionLoadStart;
        appState.setLoading(false);
        
        // Track section loading performance
        
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


        // Set up comprehensive click tracking
        setupClickTracking();
        
        // Set up UAM-specific interactions
        setupUAMInteractions();
        
        // Set up form tracking
        setupFormTracking();
        
        // Set up media tracking
        setupMediaTracking();

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

    // Give the browser a moment to render before refreshing ScrollTrigger
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100); // 100ms delay

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

// Comprehensive Click Tracking
function setupClickTracking() {
  document.addEventListener('click', (e) => {
    const element = e.target;
    const clickData = {
      elementType: element.tagName.toLowerCase(),
      elementId: element.id || null,
      elementClass: element.className || null,
      elementText: element.textContent?.substring(0, 100) || null,
      clickX: e.clientX,
      clickY: e.clientY,
      isCTA: isCTAElement(element),
      pageUrl: window.location.href,
      timestamp: Date.now()
    };

  });
}

// UAM-Specific Interactions
function setupUAMInteractions() {
  // Track navigation clicks
  document.addEventListener('click', (e) => {
    if (e.target.closest('nav a')) {
      const link = e.target.closest('nav a');
      const href = link.getAttribute('href');
      const text = link.textContent.trim();
      
    }
  });

  // Track focus layer interactions
  document.addEventListener('click', (e) => {
    if (e.target.closest('.focus-layer')) {
      const layer = e.target.closest('.focus-layer');
      const layerId = layer.id || 'unknown';
      
    }
  });

  // Track team member interactions
  document.addEventListener('click', (e) => {
    if (e.target.closest('.team-member') || e.target.closest('[href*="bios/"]')) {
      const element = e.target.closest('.team-member') || e.target.closest('[href*="bios/"]');
      const memberName = element.textContent.trim();
      
    }
  });

  // Track partnership interactions
  document.addEventListener('click', (e) => {
    if (e.target.closest('.partnership') || e.target.closest('[href*="partnership"]')) {
      const element = e.target.closest('.partnership') || e.target.closest('[href*="partnership"]');
      const partnerName = element.textContent.trim();
      
    }
  });

  // Track CTA button clicks
  document.addEventListener('click', (e) => {
    if (e.target.closest('.cta') || e.target.closest('.button') || e.target.closest('.btn')) {
      const button = e.target.closest('.cta') || e.target.closest('.button') || e.target.closest('.btn');
      const buttonText = button.textContent.trim();
      
    }
  });
}

// Form Tracking
function setupFormTracking() {
  document.addEventListener('submit', (e) => {
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
  });

  // Track form field interactions
  document.addEventListener('focus', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
    }
  });
}

// Media Tracking
function setupMediaTracking() {
  // Track video interactions
  document.querySelectorAll('video').forEach(video => {
    video.addEventListener('play', () => {
    });

    video.addEventListener('pause', () => {
    });
  });

  // Track image interactions
  document.addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG') {
    }
  });
}

// Helper function to identify CTA elements
function isCTAElement(element) {
  const ctaClasses = ['cta', 'button', 'btn', 'call-to-action', 'nav-cta'];
  const ctaTexts = ['click', 'buy', 'sign up', 'get started', 'learn more', 'join', 'contact', 'apply'];
  
  return ctaClasses.some(cls => element.className.includes(cls)) ||
         ctaTexts.some(text => element.textContent.toLowerCase().includes(text));
}


