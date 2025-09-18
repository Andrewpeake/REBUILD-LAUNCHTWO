// HomeSection.js
import { BaseSection } from './basesection.js'; // stays the same if in same folder


export class HomeSection extends BaseSection {
  init() {
    super.init();
    if (!this.el) return;

    gsap.fromTo(this.el,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: this.el,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );
    // Custom logic for Home
    // e.g. CTA button behavior, entrance animation, etc.
    
    // Track home section specific interactions
    this.setupHomeAnalytics();
  }

  setupHomeAnalytics() {
    // Track hero CTA clicks
    const heroCTAs = this.el.querySelectorAll('.hero-cta, .cta-button, .main-cta');
    heroCTAs.forEach(cta => {
      cta.addEventListener('click', () => {
            buttonText: cta.textContent.trim(),
            buttonClass: cta.className,
            section: 'home'
          });
        }
      });
    });

    // Track scroll to next section
    const scrollIndicators = this.el.querySelectorAll('.scroll-indicator, .scroll-down, .next-section');
    scrollIndicators.forEach(indicator => {
      indicator.addEventListener('click', () => {
            section: 'home',
            indicatorType: indicator.className
          });
        }
      });
    });
  }
}
