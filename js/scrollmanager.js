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
  }
}


