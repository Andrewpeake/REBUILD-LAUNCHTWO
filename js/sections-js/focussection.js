import { BaseSection } from './basesection.js';

export class OurFocusSection extends BaseSection {
  constructor(id) {
    super(id);
    this.isInitialized = false;
    this.layers = [];
    this.hasAnimated = false;
  }

  init() {
    super.init();
    
    // Only initialize once
    if (this.isInitialized) {
      console.log('Focus section already initialized, skipping');
      return;
    }

    console.log('Focus section: Starting initialization');
    
    // Wait for the element to be fully rendered
    const waitForElement = () => {
      if (!this.el) {
        console.error('Focus section: No element found');
        return;
      }

      this.layers = this.el.querySelectorAll('.focus-layer');
      console.log('Focus section: Found focus layers:', this.layers.length);
      
      if (this.layers.length === 0) {
        console.log('Focus section: Waiting for layers to render...');
        setTimeout(waitForElement, 100);
        return;
      }

      console.log('Focus section: All layers found, initializing...');
      this.initializeFocusSection();
    };
    
    waitForElement();
  }

  initializeFocusSection() {
    if (this.isInitialized) return;
    
    const isMobile = () => window.innerWidth <= 768;

    // Set initial positions FIRST - this is critical
    this.setInitialPositions();

    // Wait a bit for the section to be fully rendered before creating ScrollTrigger
    setTimeout(() => {
      // Initialize GSAP ScrollTrigger animations
      this.initScrollAnimations();
      
      // Set up interactions
      this.setupInteractions();
      
      this.isInitialized = true;
      console.log('Focus section: Initialization complete');
    }, 100);
  }

  setInitialPositions() {
    console.log('Setting initial positions for all layers');
    
    this.layers.forEach((layer, index) => {
      // Set initial centered position and then move off-screen
      gsap.set(layer, {
        x: '-50%',  // Center horizontally
        y: '-50%',  // Center vertically
        opacity: 0,
        clearProps: 'transform'
      });
      
      // Then move off-screen to the right
      gsap.set(layer, {
        x: '100vw',
        y: '-50%',  // Keep vertical centering
        opacity: 0
      });
      
      console.log(`Layer ${index} set to: x=100vw, y=-50%, opacity=0`);
    });
  }

  initScrollAnimations() {
    console.log('Setting up scroll animations using multiple detection methods');

    // Method 1: Intersection Observer (primary)
    if ('IntersectionObserver' in window) {
      this.setupIntersectionObserver();
    } else {
      this.setupScrollListener();
    }

    // Method 2: Resize-based trigger (since we know this works!)
    this.setupResizeTrigger();
    
    // Method 3: Manual test function
    window.testFocusAnimations = () => {
      console.log('🧪 Manually testing focus animations...');
      console.log('Current layers:', this.layers.length);
      
      // Reset to off-screen
      this.layers.forEach((layer, index) => {
        gsap.set(layer, {
          x: '100vw',
          y: '-50%',
          opacity: 0
        });
      });
      
      // Animate in after 1 second
      setTimeout(() => {
        console.log('🧪 Animating layers in manually...');
        this.animateLayersIn();
      }, 1000);
    };
    
    console.log('🧪 Manual test function available: window.testFocusAnimations()');
  }

  setupResizeTrigger() {
    console.log('📏 Setting up resize-based trigger (since resize works!)');
    
    // Create a hidden element that we can resize to trigger animations
    this.resizeTrigger = document.createElement('div');
    this.resizeTrigger.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 1px;
      height: 1px;
      opacity: 0;
      pointer-events: none;
      z-index: -1;
    `;
    document.body.appendChild(this.resizeTrigger);
    
    // Function to trigger animation
    const triggerAnimation = () => {
      console.log('📏 Resize trigger activated - checking if focus section is in view');
      
      const rect = this.el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Check if section is in viewport
      const isInView = rect.top < windowHeight * 0.8 && rect.bottom > windowHeight * 0.2;
      
      if (isInView && !this.hasAnimated) {
        console.log('📏 Focus section in view - triggering animation via resize method');
        this.hasAnimated = true;
        this.animateLayersIn();
      }
    };
    
    // Trigger on initial load
    setTimeout(triggerAnimation, 500);
    
    // Also trigger on scroll (as backup)
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(triggerAnimation, 100);
    }, { passive: true });
    
    console.log('📏 Resize trigger setup complete');
  }

  setupIntersectionObserver() {
    console.log('🔍 Setting up Intersection Observer for focus section');
    
    const options = {
      root: null, // Use viewport as root
      rootMargin: '-20% 0px -20% 0px', // Trigger when 20% from top and bottom
      threshold: 0.1 // Trigger when 10% of element is visible
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          console.log('🎯 Focus section entering viewport (Intersection Observer)');
          if (!this.hasAnimated) {
            this.hasAnimated = true;
            this.animateLayersIn();
          }
        } else {
          console.log('🎯 Focus section leaving viewport (Intersection Observer)');
          this.hasAnimated = false;
          this.animateLayersOut();
        }
      });
    }, options);

    // Start observing the focus section
    this.observer.observe(this.el);
    console.log('🔍 Intersection Observer started for focus section');
    
    // Also add a simple scroll check as backup
    this.setupSimpleScrollCheck();
  }

  setupSimpleScrollCheck() {
    console.log('📜 Setting up simple scroll check as backup');
    
    const checkIfInView = () => {
      const rect = this.el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Check if section is in viewport
      const isInView = rect.top < windowHeight * 0.8 && rect.bottom > windowHeight * 0.2;
      
      if (isInView && !this.hasAnimated) {
        console.log('📜 Simple scroll check: Focus section in view - triggering animation');
        this.hasAnimated = true;
        this.animateLayersIn();
      } else if (!isInView && this.hasAnimated) {
        console.log('📜 Simple scroll check: Focus section out of view - resetting');
        this.hasAnimated = false;
        this.animateLayersOut();
      }
    };
    
    // Check on scroll
    window.addEventListener('scroll', checkIfInView, { passive: true });
    
    // Check immediately
    setTimeout(checkIfInView, 100);
    
    console.log('📜 Simple scroll check setup complete');
  }

  setupScrollListener() {
    console.log('📜 Setting up scroll listener for focus section (fallback)');
    
    let isAnimating = false;
    let hasAnimated = false;

    const checkScroll = () => {
      if (isAnimating) return;

      const rect = this.el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Check if section is in viewport (20% from top, 20% from bottom)
      const isInView = rect.top < windowHeight * 0.8 && rect.bottom > windowHeight * 0.2;
      
      if (isInView && !hasAnimated) {
        console.log('🎯 Focus section entering viewport (Scroll Listener)');
        hasAnimated = true;
        isAnimating = true;
        this.animateLayersIn();
        setTimeout(() => { isAnimating = false; }, 1000);
      } else if (!isInView && hasAnimated) {
        console.log('🎯 Focus section leaving viewport (Scroll Listener)');
        hasAnimated = false;
        isAnimating = true;
        this.animateLayersOut();
        setTimeout(() => { isAnimating = false; }, 500);
      }
    };

    // Add scroll listener with throttling
    let ticking = false;
    const scrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          checkScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });
    
    // Check initial position
    setTimeout(checkScroll, 100);
    
    console.log('📜 Scroll listener setup complete');
  }

  animateLayersIn() {
    console.log('Animating layers in');
    
    this.layers.forEach((layer, index) => {
      gsap.to(layer, {
        x: '-50%',  // Center horizontally
        y: '-50%',  // Center vertically
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        delay: index * 0.2
      });
    });
  }

  animateLayersOut() {
    console.log('Animating layers out');
    
    this.layers.forEach((layer, index) => {
      gsap.to(layer, {
        x: '100vw',
        y: '-50%',  // Keep vertical centering
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in'
      });
    });
  }

  setupInteractions() {
    this.layers.forEach((layer, index) => {
      const reveal = layer.querySelector('.focus-reveal');
      if (!reveal) return;

      // Click/touch handler
      const handleInteraction = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Close all other layers
        this.layers.forEach(l => {
          if (l !== layer) {
            l.classList.remove('active');
            const r = l.querySelector('.focus-reveal');
            if (r) {
              r.style.opacity = '0';
              r.style.visibility = 'hidden';
              r.style.maxHeight = '0';
            }
          }
        });
        
        // Toggle current layer
        const isActive = layer.classList.contains('active');
        layer.classList.toggle('active');
        
        if (isActive) {
          reveal.style.opacity = '0';
          reveal.style.visibility = 'hidden';
          reveal.style.maxHeight = '0';
        } else {
          reveal.style.opacity = '1';
          reveal.style.visibility = 'visible';
          reveal.style.maxHeight = '300px';
        }
      };

      layer.addEventListener('click', handleInteraction);
      layer.addEventListener('touchstart', handleInteraction, { passive: false });
      
      // Desktop hover
      if (window.innerWidth > 768) {
        layer.addEventListener('mouseenter', () => {
          this.layers.forEach(l => {
            if (l !== layer) {
              l.classList.remove('active');
              const r = l.querySelector('.focus-reveal');
              if (r) {
                r.style.opacity = '0';
                r.style.visibility = 'hidden';
                r.style.maxHeight = '0';
              }
            }
          });
          
          layer.classList.add('active');
          reveal.style.opacity = '1';
          reveal.style.visibility = 'visible';
          reveal.style.maxHeight = '300px';
        });

        layer.addEventListener('mouseleave', () => {
          layer.classList.remove('active');
          reveal.style.opacity = '0';
          reveal.style.visibility = 'hidden';
          reveal.style.maxHeight = '0';
        });
      }
    });
  }

  reinitialize() {
    console.log('Focus section: Reinitializing');
    
    // Clean up existing observer
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    this.isInitialized = false;
    this.setInitialPositions();
    this.init();
  }
}







