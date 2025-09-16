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
  }

  init() {
    this.sections.forEach(section => section.init());
    
    // Track section visibility
    this.setupSectionTracking();
  }

  setupSectionTracking() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          const sectionName = entry.target.querySelector('h1, h2, h3')?.textContent || sectionId;
          
          
          // Track with app state
          if (window.uamAppState) {
            window.uamAppState.trackInteraction('section_view', {
              sectionId: sectionId,
              sectionName: sectionName
            });
          }
        }
      });
    }, {
      threshold: 0.5 // Trigger when 50% of section is visible
    });

    // Observe all sections
    this.sections.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });
  }
}


