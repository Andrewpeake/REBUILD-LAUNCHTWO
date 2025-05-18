import { BaseSection } from './basesection.js';

export class AboutUsSection extends BaseSection {
  init() {
    super.init();
    if (!this.el) return;

    // Section-level fade in only
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

    // Interactive AAM detail logic
    const items = this.el.querySelectorAll('.aam-item');
    items.forEach(item => {
      // Simple fade in for initial appearance
      gsap.from(item, {
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
        }
      });

      item.addEventListener('click', () => {
        const details = item.nextElementSibling;

        // Track interaction
        this.trackInteraction('about_item_click', {
          itemId: item.textContent.trim()
        });

        // Close all others
        this.el.querySelectorAll('.aam-details').forEach(detail => {
          detail.style.maxHeight = '0';
          detail.style.opacity = '0';
        });

        items.forEach(i => i.classList.remove('active'));

        // Toggle clicked
        if (!item.classList.contains('active')) {
          item.classList.add('active');
          details.style.maxHeight = details.scrollHeight + 'px';
          details.style.opacity = '1';
        } else {
          item.classList.remove('active');
          details.style.maxHeight = '0';
          details.style.opacity = '0';
        }
      });
    });

    console.log('AboutUsSection initialized');
  }
}
