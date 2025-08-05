import { BaseSection } from './basesection.js';

export class OurFocusSection extends BaseSection {
  constructor(id) {
    super(id);
    this.isInitialized = false;
    this.layers = [];
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
    console.log('Setting up scroll animations using Intersection Observer');

    // Use Intersection Observer instead of ScrollTrigger for better reliability
    if ('IntersectionObserver' in window) {
      this.setupIntersectionObserver();
    } else {
      // Fallback to scroll event listener
      this.setupScrollListener();
    }
    
    // Add manual test function to window for debugging
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
          this.animateLayersIn();
        } else {
          console.log('🎯 Focus section leaving viewport (Intersection Observer)');
          this.animateLayersOut();
        }
      });
    }, options);

    // Start observing the focus section
    this.observer.observe(this.el);
    console.log('🔍 Intersection Observer started for focus section');
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







