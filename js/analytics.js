/**
 * Analytics tracking module for UAM UCalgary website
 * Tracks page views, events, performance metrics, and errors
 */

export class Analytics {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.analyticsEndpoint = 'http://10.0.0.124:3001/api/analytics'; // Network accessible endpoint
    this.isEnabled = true;
    this.retryQueue = [];
    this.retryDelay = 1000;
    this.maxRetries = 3;
    
    // Performance tracking
    this.pageStartTime = performance.now();
    this.scrollDepth = 0;
    this.maxScrollDepth = 0;
    this.timeOnPage = 0;
    
    this.init();
  }

  init() {
    // Track initial page view
    this.trackPageView();
    
    // Set up performance tracking
    this.setupPerformanceTracking();
    
    // Set up scroll tracking
    this.setupScrollTracking();
    
    // Set up error tracking
    this.setupErrorTracking();
    
    // Set up visibility change tracking
    this.setupVisibilityTracking();
    
    // Set up beforeunload tracking
    this.setupBeforeUnloadTracking();
  }

  generateSessionId() {
    // Check if session ID exists in sessionStorage
    let sessionId = sessionStorage.getItem('analytics_session_id');
    
    if (!sessionId) {
      // Generate new session ID
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    
    return sessionId;
  }

  getDeviceInfo() {
    const userAgent = navigator.userAgent;
    
    // Device type detection
    let deviceType = 'desktop';
    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      deviceType = 'mobile';
    } else if (/Tablet|iPad/i.test(userAgent)) {
      deviceType = 'tablet';
    }

    // Browser detection
    let browser = 'unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    // OS detection
    let os = 'unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    return {
      deviceType,
      browser,
      os,
      userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`
    };
  }

  async trackPageView() {
    if (!this.isEnabled) return;

    const deviceInfo = this.getDeviceInfo();
    const pageData = {
      sessionId: this.sessionId,
      pageUrl: window.location.href,
      pageTitle: document.title,
      referrer: document.referrer || '',
      userAgent: deviceInfo.userAgent,
      ipAddress: '', // Will be determined by server
      timeOnPage: 0, // Will be updated on page unload
      scrollDepth: 0, // Will be updated continuously
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      screenResolution: deviceInfo.screenResolution,
      viewportSize: deviceInfo.viewportSize
    };

    await this.sendData('/pageview', pageData);
  }

  async trackEvent(eventType, eventCategory = '', eventAction = '', eventLabel = '', eventValue = null, customData = {}) {
    if (!this.isEnabled) return;

    const eventData = {
      sessionId: this.sessionId,
      eventType,
      eventCategory,
      eventAction,
      eventLabel,
      eventValue,
      pageUrl: window.location.href,
      customData,
      ipAddress: ''
    };

    await this.sendData('/event', eventData);
  }

  async trackPerformance() {
    if (!this.isEnabled) return;

    // Wait for performance metrics to be available
    setTimeout(async () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paintEntries = performance.getEntriesByType('paint');
      
      let firstContentfulPaint = 0;
      let largestContentfulPaint = 0;
      
      paintEntries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          firstContentfulPaint = entry.startTime;
        }
      });

      // Get LCP if available
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            largestContentfulPaint = lastEntry.startTime;
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          // LCP not supported
        }
      }

      const performanceData = {
        sessionId: this.sessionId,
        pageUrl: window.location.href,
        loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
        domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
        firstContentfulPaint,
        largestContentfulPaint,
        firstInputDelay: 0, // Would need additional observer
        cumulativeLayoutShift: 0, // Would need additional observer
        timeToInteractive: 0, // Would need additional calculation
        connectionType: navigator.connection ? navigator.connection.effectiveType : 'unknown',
        deviceMemory: navigator.deviceMemory || 0
      };

      await this.sendData('/performance', performanceData);
    }, 2000); // Wait 2 seconds for metrics to stabilize
  }

  async trackError(errorType, errorMessage, errorStack = '') {
    if (!this.isEnabled) return;

    const errorData = {
      sessionId: this.sessionId,
      errorType,
      errorMessage,
      errorStack,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      ipAddress: ''
    };

    await this.sendData('/error', errorData);
  }

  setupPerformanceTracking() {
    // Track performance metrics after page load
    window.addEventListener('load', () => {
      this.trackPerformance();
    });
  }

  setupScrollTracking() {
    let scrollTimeout;
    
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        this.scrollDepth = documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;
        this.maxScrollDepth = Math.max(this.maxScrollDepth, this.scrollDepth);
      }, 100);
    }, { passive: true });
  }

  setupErrorTracking() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError('javascript_error', event.message, event.error ? event.error.stack : '');
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError('promise_rejection', event.reason ? event.reason.toString() : 'Unknown promise rejection', '');
    });
  }

  setupVisibilityTracking() {
    let visibilityStartTime = Date.now();
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page became hidden, track time spent
        this.timeOnPage += Date.now() - visibilityStartTime;
      } else {
        // Page became visible again
        visibilityStartTime = Date.now();
      }
    });
  }

  setupBeforeUnloadTracking() {
    window.addEventListener('beforeunload', () => {
      // Update time on page
      this.timeOnPage = performance.now() - this.pageStartTime;
      
      // Send final page view update with time on page and scroll depth
      this.sendData('/pageview', {
        sessionId: this.sessionId,
        pageUrl: window.location.href,
        timeOnPage: this.timeOnPage,
        scrollDepth: this.maxScrollDepth
      }, true); // Use sendBeacon for reliability
    });
  }

  async sendData(endpoint, data, useBeacon = false) {
    const url = this.analyticsEndpoint + endpoint;
    
    if (useBeacon && 'sendBeacon' in navigator) {
      // Use sendBeacon for critical data (like page unload)
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
      return;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
      // Add to retry queue
      this.retryQueue.push({ endpoint, data, retries: 0 });
      this.processRetryQueue();
    }
  }

  async processRetryQueue() {
    if (this.retryQueue.length === 0) return;

    const item = this.retryQueue.shift();
    
    if (item.retries < this.maxRetries) {
      setTimeout(async () => {
        try {
          await this.sendData(item.endpoint, item.data);
        } catch (error) {
          item.retries++;
          this.retryQueue.push(item);
          this.processRetryQueue();
        }
      }, this.retryDelay * Math.pow(2, item.retries)); // Exponential backoff
    }
  }

  // Convenience methods for common events
  trackButtonClick(buttonId, buttonText = '') {
    this.trackEvent('button_click', 'engagement', 'click', buttonText, null, { buttonId });
  }

  trackLinkClick(linkUrl, linkText = '') {
    this.trackEvent('link_click', 'navigation', 'click', linkText, null, { linkUrl });
  }

  trackFormSubmit(formId, formData = {}) {
    this.trackEvent('form_submit', 'engagement', 'submit', formId, null, formData);
  }

  trackSectionView(sectionId) {
    this.trackEvent('section_view', 'engagement', 'view', sectionId);
  }

  trackDownload(fileName, fileType = '') {
    this.trackEvent('download', 'engagement', 'download', fileName, null, { fileType });
  }

  // Enable/disable analytics
  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }
}

// Create global analytics instance
window.analytics = new Analytics();

