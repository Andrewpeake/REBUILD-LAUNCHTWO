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
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.error('GSAP or ScrollTrigger not available');
      return;
    }

    console.log('Setting up scroll animations for focus section:', this.el);

    // Kill any existing ScrollTriggers for this section
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger.vars.trigger === this.el) {
        console.log('Killing existing ScrollTrigger for focus section');
        trigger.kill();
      }
    });

    // Create ScrollTrigger directly (not in a timeline)
    const scrollTrigger = ScrollTrigger.create({
      trigger: this.el,
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: false,
      markers: true, // Enable markers for debugging
      onEnter: () => {
        console.log('🎯 Focus section entering viewport - triggering animation');
        this.animateLayersIn();
      },
      onLeave: () => {
        console.log('🎯 Focus section leaving viewport - triggering animation');
        this.animateLayersOut();
      },
      onEnterBack: () => {
        console.log('🎯 Focus section entering back - triggering animation');
        this.animateLayersIn();
      },
      onLeaveBack: () => {
        console.log('🎯 Focus section leaving back - triggering animation');
        this.animateLayersOut();
      },
      onRefresh: () => {
        console.log('🎯 Focus section ScrollTrigger refreshed');
      }
    });

    console.log('ScrollTrigger created for focus section:', scrollTrigger);
    
    // Force a refresh to ensure it's working
    ScrollTrigger.refresh();
    
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
    this.isInitialized = false;
    this.setInitialPositions();
    this.init();
  }
}







