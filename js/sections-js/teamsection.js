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
    
    // Track team section interactions
    this.setupTeamAnalytics();
  }

  setupTeamAnalytics() {
    // Track team member clicks
    const teamMembers = this.el.querySelectorAll('.team-member, .member-card, [data-member]');
    teamMembers.forEach(member => {
      member.addEventListener('click', () => {
        const memberName = member.querySelector('.member-name, .name, h3, h4')?.textContent || 'Unknown';
        const memberRole = member.querySelector('.member-role, .role, .position')?.textContent || 'Unknown';
        
            memberName: memberName,
            memberRole: memberRole,
            section: 'team',
            memberId: member.id || member.dataset.member || 'unknown'
          });
        }
      });
    });

    // Track bio link clicks
    const bioLinks = this.el.querySelectorAll('a[href*="bios/"], .bio-link, .member-bio');
    bioLinks.forEach(link => {
      link.addEventListener('click', () => {
        const memberName = link.textContent.trim() || link.closest('.team-member')?.querySelector('.member-name, .name')?.textContent || 'Unknown';
        
            memberName: memberName,
            bioUrl: link.href,
            section: 'team'
          });
        }
      });
    });

    // Track team section scroll depth
    let maxScrollDepth = 0;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const scrollDepth = (entry.intersectionRatio * 100);
          if (scrollDepth > maxScrollDepth) {
            maxScrollDepth = scrollDepth;
                section: 'team',
                scrollDepth: scrollDepth
              });
            }
          }
        }
      });
    }, {
      threshold: [0.25, 0.5, 0.75, 1.0]
    });

    observer.observe(this.el);
  }
}
