import { BaseSection } from './basesection.js';

export class OurFocusSection extends BaseSection {
  init() {
    super.init();
    if (!this.el) return;

    console.log('Initializing focus section');

    const layers = this.el.querySelectorAll('.focus-layer');
    const isMobile = () => window.innerWidth <= 768;

    console.log('Found focus layers:', layers.length);

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
}







