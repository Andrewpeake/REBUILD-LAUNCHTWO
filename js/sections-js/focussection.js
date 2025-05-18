import { BaseSection } from './basesection.js';
import gsap from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';
import ScrollTrigger from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js';

gsap.registerPlugin(ScrollTrigger);

export class OurFocusSection extends BaseSection {
  init() {
    super.init();
    if (!this.el) return;

    console.log('Initializing focus section');

    const layers = this.el.querySelectorAll('.focus-layer');
    const isMobile = () => window.innerWidth <= 768;

    // Initial animation when scrolling into view
    layers.forEach((layer, i) => {
      const direction = i % 2 === 0 ? -1 : 1;
      
      gsap.fromTo(
        layer,
        { xPercent: direction * 100 },
        {
          xPercent: 0,
          duration: 1.2,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: layer,
            start: 'top 110%',
            end: 'top 60%',
            scrub: 0.5
          }
        }
      );

      // Add click interaction for mobile
      layer.addEventListener('click', () => {
        if (isMobile()) {
          console.log('Mobile click on focus layer:', layer.textContent.trim());
          // Mobile behavior: Toggle active state
          layers.forEach(l => {
            if (l !== layer) {
              l.classList.remove('active');
              const r = l.querySelector('.focus-reveal');
              if (r) {
                gsap.to(r, {
                  opacity: 0,
                  visibility: 'hidden',
                  duration: 0.3
                });
              }
            }
          });
          
          const reveal = layer.querySelector('.focus-reveal');
          const isActive = layer.classList.contains('active');
          
          layer.classList.toggle('active');
          
          if (reveal) {
            gsap.to(reveal, {
              opacity: isActive ? 0 : 1,
              visibility: isActive ? 'hidden' : 'visible',
              duration: 0.3,
              ease: 'power2.inOut'
            });
          }
        }
      });

      // Add hover interaction for desktop
      if (!isMobile()) {
        layer.addEventListener('mouseenter', () => {
          console.log('Desktop hover on focus layer:', layer.textContent.trim());
          const reveal = layer.querySelector('.focus-reveal');
          if (reveal) {
            gsap.to(reveal, {
              opacity: 1,
              visibility: 'visible',
              y: 0,
              duration: 0.3,
              ease: 'power2.out'
            });
          }
        });

        layer.addEventListener('mouseleave', () => {
          const reveal = layer.querySelector('.focus-reveal');
          if (reveal) {
            gsap.to(reveal, {
              opacity: 0,
              visibility: 'hidden',
              y: 10,
              duration: 0.3,
              ease: 'power2.in'
            });
          }
        });
      }
    });

    // Handle resize events
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const currentIsMobile = isMobile();
        console.log('Window resized, is mobile:', currentIsMobile);
        
        layers.forEach(layer => {
          const reveal = layer.querySelector('.focus-reveal');
          if (currentIsMobile) {
            // Keep current state on mobile
            if (!layer.classList.contains('active') && reveal) {
              gsap.set(reveal, {
                opacity: 0,
                visibility: 'hidden'
              });
            }
          } else {
            // Reset for desktop
            layer.classList.remove('active');
            if (reveal) {
              gsap.set(reveal, {
                opacity: 0,
                visibility: 'hidden',
                y: 10
              });
            }
          }
        });
      }, 250);
    });

    console.log('Focus section initialized');
  }
}







