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

}
