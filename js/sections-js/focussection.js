import { BaseSection } from './basesection.js';

export class OurFocusSection extends BaseSection {
  init() {
    super.init();
    
    // Wait for the element to be fully rendered
    const waitForElement = () => {
      if (!this.el) {
        console.error('Focus section: No element found');
        return;
      }

      const layers = this.el.querySelectorAll('.focus-layer');
      console.log('Focus section: Found focus layers:', layers.length);
      
      if (layers.length === 0) {
        console.log('Focus section: Waiting for layers to render...');
        setTimeout(waitForElement, 50);
        return;
      }

      console.log('Focus section: Initializing with element:', this.el);
      this.initializeFocusSection(layers);
    };
    
    waitForElement();
  }

  initializeFocusSection(layers) {
    const isMobile = () => window.innerWidth <= 768;

    // Initialize GSAP ScrollTrigger animations for lateral sliding
    this.initScrollAnimations(layers);

    // Simple click/touch interaction for all devices
    layers.forEach((layer, index) => {
      console.log(`Setting up layer ${index}:`, layer.textContent.trim());
      
      const reveal = layer.querySelector('.focus-reveal');
      if (!reveal) {
        console.error('No reveal element found for layer:', layer.textContent.trim());
        return;
      }

      // Click/touch handler
      const handleInteraction = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Interaction with layer:', layer.textContent.trim());
        
        // Close all other layers
        layers.forEach(l => {
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
          // Close
          reveal.style.opacity = '0';
          reveal.style.visibility = 'hidden';
          reveal.style.maxHeight = '0';
        } else {
          // Open
          reveal.style.opacity = '1';
          reveal.style.visibility = 'visible';
          reveal.style.maxHeight = '300px';
        }
      };

      // Add event listeners
      layer.addEventListener('click', handleInteraction);
      layer.addEventListener('touchstart', handleInteraction, { passive: false });
      
      // Add hover for desktop
      if (!isMobile()) {
        layer.addEventListener('mouseenter', () => {
          console.log('Desktop hover on:', layer.textContent.trim());
          // Close all others
          layers.forEach(l => {
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
          
          // Open current
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

    console.log('Focus section initialized successfully');
  }

  initScrollAnimations(layers) {
    // Check if GSAP and ScrollTrigger are available
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP or ScrollTrigger not available, skipping scroll animations');
      return;
    }

    console.log('Setting up scroll animations for focus layers');

    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Set initial positions for all layers (off-screen to the right)
    layers.forEach((layer, index) => {
      gsap.set(layer, {
        x: '100vw',
        opacity: 0,
        clearProps: 'transform' // Clear any existing transforms
      });
    });

    // Create individual ScrollTriggers for each layer with staggered timing
    layers.forEach((layer, index) => {
      const delay = index * 0.2; // Stagger delay
      
      ScrollTrigger.create({
        trigger: this.el,
        start: `top ${80 - (index * 10)}%`, // Staggered start points
        end: 'bottom 20%',
        onEnter: () => {
          console.log(`Layer ${index} entering: ${layer.textContent.trim()}`);
          gsap.to(layer, {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            delay: delay
          });
        },
        onLeave: () => {
          console.log(`Layer ${index} leaving: ${layer.textContent.trim()}`);
          gsap.to(layer, {
            x: '-100vw',
            opacity: 0,
            duration: 0.5,
            ease: 'power2.in'
          });
        },
        onEnterBack: () => {
          console.log(`Layer ${index} entering back: ${layer.textContent.trim()}`);
          gsap.to(layer, {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            delay: delay
          });
        },
        onLeaveBack: () => {
          console.log(`Layer ${index} leaving back: ${layer.textContent.trim()}`);
          gsap.to(layer, {
            x: '100vw',
            opacity: 0,
            duration: 0.5,
            ease: 'power2.in'
          });
        }
      });
    });

    // Add subtle parallax effect for the focus section background
    ScrollTrigger.create({
      trigger: this.el,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        gsap.set('.focus-parallax', {
          y: progress * -50 // Subtle parallax effect
        });
      }
    });

    console.log('Scroll animations setup complete');
  }

  // Fallback method to reinitialize on resize
  reinitialize() {
    console.log('Focus section: Reinitializing due to resize');
    this.init();
  }
}







