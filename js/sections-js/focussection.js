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

    // Initialize GSAP ScrollTrigger animations
    this.initScrollAnimations();

    // Set up interactions
    this.setupInteractions();

    this.isInitialized = true;
    console.log('Focus section: Initialization complete');
  }

  setInitialPositions() {
    console.log('Setting initial positions for all layers');
    
    this.layers.forEach((layer, index) => {
      // Force initial position off-screen
      gsap.set(layer, {
        x: '100vw',
        opacity: 0,
        clearProps: 'transform'
      });
      
      console.log(`Layer ${index} set to: x=100vw, opacity=0`);
    });
  }

  initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.error('GSAP or ScrollTrigger not available');
      return;
    }

    console.log('Setting up scroll animations');

    // Kill any existing ScrollTriggers for this section
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger.vars.trigger === this.el) {
        trigger.kill();
      }
    });

    // Create a single timeline for the entire section
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: this.el,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: false,
        markers: false,
        onEnter: () => {
          console.log('Focus section entering viewport');
          this.animateLayersIn();
        },
        onLeave: () => {
          console.log('Focus section leaving viewport');
          this.animateLayersOut();
        },
        onEnterBack: () => {
          console.log('Focus section entering back');
          this.animateLayersIn();
        },
        onLeaveBack: () => {
          console.log('Focus section leaving back');
          this.animateLayersOut();
        }
      }
    });

    console.log('ScrollTrigger created for focus section');
  }

  animateLayersIn() {
    console.log('Animating layers in');
    
    this.layers.forEach((layer, index) => {
      gsap.to(layer, {
        x: 0,
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







