import { BaseSection } from './basesection.js';

export class OurFocusSection extends BaseSection {
  init() {
    super.init();
    if (!this.el) return;

    console.log('Initializing focus section');

    const layers = this.el.querySelectorAll('.focus-layer');
    const isMobile = () => window.innerWidth <= 768;

    console.log('Found focus layers:', layers.length);

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

    // Create timeline for staggered lateral sliding animations
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: this.el,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 1,
        markers: false,
        onEnter: () => console.log('Focus section scroll animation started'),
        onLeave: () => console.log('Focus section scroll animation completed')
      }
    });

    // Add lateral sliding animations for each layer
    layers.forEach((layer, index) => {
      const depth = layer.getAttribute('data-depth') || 300;
      const delay = layer.getAttribute('data-delay') || 0.2;
      
      // Set initial position (off-screen to the right)
      gsap.set(layer, {
        x: '100vw',
        opacity: 0
      });

      // Add to timeline with staggered delay
      tl.to(layer, {
        x: 0,
        opacity: 1,
        duration: 1,
        ease: 'power2.out',
        delay: index * 0.3
      }, index * 0.2);

      console.log(`Added scroll animation for layer ${index}: ${layer.textContent.trim()}`);
    });

    // Add parallax effect for the focus section
    gsap.to('.focus-parallax', {
      y: -100,
      ease: 'none',
      scrollTrigger: {
        trigger: this.el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    });

    console.log('Scroll animations setup complete');
  }
}







