import { BaseSection } from './basesection.js';

export class WhatisAAMSection extends BaseSection {
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

    console.log('WhatisAAMSection initialized');

    // 🔥 Interactive AAM detail logic here
    const items = this.el.querySelectorAll('.aam-item');

    items.forEach(item => {
      item.addEventListener('click', () => {
        const details = item.nextElementSibling;

        // Close all others
        this.el.querySelectorAll('.aam-details').forEach(detail => {
          detail.style.maxHeight = '0';
          detail.style.opacity = '0';
        });

        items.forEach(i => i.classList.remove('active'));

        // Toggle clicked
        if (details.style.maxHeight === '0px' || !details.style.maxHeight) {
          item.classList.add('active');
          details.style.maxHeight = '300px';
          details.style.opacity = '1';
        } else {
          item.classList.remove('active');
          details.style.maxHeight = '0';
          details.style.opacity = '0';
        }
      });
    });
  }
}

