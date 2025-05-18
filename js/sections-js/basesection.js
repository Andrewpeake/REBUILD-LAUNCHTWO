// BaseSection.js
import { AppState } from '../state.js';

export class BaseSection {
  constructor(id) {
    this.id = id;
    this.el = document.getElementById(id);
    this.state = new AppState();
    this.setupLoadingIndicator();
  }

  setupLoadingIndicator() {
    this.loadingEl = document.createElement('div');
    this.loadingEl.className = 'section-loading';
    this.loadingEl.innerHTML = `
      <div class="loading-spinner"></div>
      <div class="loading-text">Loading...</div>
    `;
    this.loadingEl.style.display = 'none';
    if (this.el) {
      this.el.appendChild(this.loadingEl);
    }
  }

  showLoading() {
    if (this.loadingEl) {
      this.loadingEl.style.display = 'flex';
      this.state.setLoading(true);
    }
  }

  hideLoading() {
    if (this.loadingEl) {
      this.loadingEl.style.display = 'none';
      this.state.setLoading(false);
    }
  }

  async init() {
    try {
      this.showLoading();
      console.log(`[Init] ${this.id} section`);
      
      // Track section initialization
      this.state.trackInteraction('section_init', { sectionId: this.id });
      
      // Setup section-specific features
      await this.setupAnimations();
      await this.setupEventListeners();
      
      this.state.addLoadedSection(this.id);
      this.hideLoading();
    } catch (error) {
      console.error(`Error initializing ${this.id} section:`, error);
      this.state.addError({
        section: this.id,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      this.handleError(error);
    }
  }

  async setupAnimations() {
    // Override in child classes
  }

  async setupEventListeners() {
    // Override in child classes
  }

  handleError(error) {
    // Create error message element
    const errorEl = document.createElement('div');
    errorEl.className = 'section-error';
    errorEl.innerHTML = `
      <div class="error-message">
        <p>Something went wrong loading this section.</p>
        <button class="retry-button">Retry</button>
      </div>
    `;

    // Add retry functionality
    const retryButton = errorEl.querySelector('.retry-button');
    retryButton.addEventListener('click', async () => {
      errorEl.remove();
      this.state.clearErrors();
      await this.init();
    });

    // Add to DOM
    if (this.el) {
      this.el.appendChild(errorEl);
    }
  }

  // Utility method for tracking section-specific interactions
  trackInteraction(type, data = {}) {
    this.state.trackInteraction(type, {
      ...data,
      sectionId: this.id
    });
  }
}
