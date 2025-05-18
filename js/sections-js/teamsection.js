import { BaseSection } from './basesection.js';

export class MeettheTeamSection extends BaseSection {
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
    console.log('MeettheTeamSection initialized');
    // Add specific logic for the Meet the Team section here
  }
}
