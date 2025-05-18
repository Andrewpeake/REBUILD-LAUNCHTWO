import { HomeSection } from './sections-js/homesection.js';
import { WhatisAAMSection } from './sections-js/whatisaamsection.js';
import { AboutUsSection } from './sections-js/aboutsection.js';
import { OurFocusSection } from './sections-js/focussection.js';
import { MeettheTeamSection } from './sections-js/teamsection.js';
import { JoinUsSection } from './sections-js/joinsection.js';
import { ContactUsSection } from './sections-js/contactsection.js';

export class ScrollManager {
  constructor() {
    this.sections = [
      new HomeSection('home'),
      new WhatisAAMSection('whatisaam'),
      new AboutUsSection('about'),
      new OurFocusSection('focus'),
      new MeettheTeamSection('team'),
      new JoinUsSection('join'),
      new ContactUsSection('contact'),
    ];
    
    this.isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.scrollContainer = this.isMobile ? document.getElementById('main-container') : window;
    this.isScrolling = false;
    this.lastScrollTop = 0;
  }

  handleScroll = () => {
    if (this.isScrolling) return;
    this.isScrolling = true;

    requestAnimationFrame(() => {
      const scrollTop = this.isMobile ? 
        this.scrollContainer.scrollTop : 
        window.pageYOffset || document.documentElement.scrollTop;

      // Update nav visibility
      const nav = document.getElementById('main-nav');
      if (nav) {
        if (scrollTop > this.lastScrollTop && scrollTop > 100) {
          nav.classList.add('nav-hidden');
        } else {
          nav.classList.remove('nav-hidden');
        }
      }

      // Update active section
      this.sections.forEach(section => {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const isVisible = rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2;
          if (isVisible) {
            this.setActiveSection(section.id);
          }
        }
      });

      this.lastScrollTop = scrollTop;
      this.isScrolling = false;
    });
  };

  setActiveSection(id) {
    // Update nav links
    document.querySelectorAll('.nav-links a').forEach(link => {
      const href = link.getAttribute('href').substring(1);
      link.classList.toggle('active', href === id);
    });

    // Update URL without scrolling
    const url = new URL(window.location);
    url.hash = `#${id}`;
    window.history.replaceState({}, '', url);
  }

  init() {
    // Initialize sections
    this.sections.forEach(section => section.init());

    // Set up scroll listener
    this.scrollContainer.addEventListener('scroll', this.handleScroll, { passive: true });

    // Handle resize
    window.addEventListener('resize', () => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= 768;
      
      if (wasMobile !== this.isMobile) {
        // Remove old scroll listener
        this.scrollContainer.removeEventListener('scroll', this.handleScroll);
        
        // Update scroll container
        this.scrollContainer = this.isMobile ? document.getElementById('main-container') : window;
        
        // Add new scroll listener
        this.scrollContainer.addEventListener('scroll', this.handleScroll, { passive: true });
      }
    }, { passive: true });

    // Initial scroll position check
    this.handleScroll();
  }
}


