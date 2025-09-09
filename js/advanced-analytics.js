/**
 * Advanced Analytics Module for UAM UCalgary Website
 * Comprehensive tracking for all business metrics and user behavior
 */

export class AdvancedAnalytics {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.analyticsEndpoint = 'http://10.0.0.124:3001/api/analytics';
    this.isEnabled = true;
    this.retryQueue = [];
    this.retryDelay = 1000;
    this.maxRetries = 3;
    
    // Core tracking variables
    this.pageStartTime = performance.now();
    this.scrollDepth = 0;
    this.maxScrollDepth = 0;
    this.timeOnPage = 0;
    this.clickCount = 0;
    this.formInteractions = 0;
    this.videoEngagement = 0;
    this.socialShares = 0;
    this.searchQueries = [];
    this.navigationPath = [];
    this.heatmapData = [];
    this.featureUsage = new Map();
    this.conversionGoals = new Map();
    
    // Advanced tracking
    this.exitIntentDetected = false;
    this.botDetected = false;
    this.suspiciousActivity = false;
    this.consentGiven = false;
    this.userSegment = 'unknown';
    this.churnRisk = 'low';
    
    // Performance tracking
    this.coreWebVitals = {};
    this.apiCalls = [];
    this.errorCount = 0;
    
    this.init();
  }

  init() {
    // Initialize all tracking modules
    this.setupCoreTracking();
    this.setupAudienceInsights();
    this.setupPerformanceTracking();
    this.setupConversionTracking();
    this.setupUserBehaviorTracking();
    this.setupContentAnalytics();
    this.setupMarketingTracking();
    this.setupSecurityCompliance();
    this.setupAdvancedAnalytics();
    
    // Track initial page view
    this.trackPageView();
  }

  generateSessionId() {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  // ===== CORE TRAFFIC & ENGAGEMENT =====
  setupCoreTracking() {
    // Enhanced page view tracking
    this.trackPageView();
    
    // Click tracking for CTR analysis
    this.setupClickTracking();
    
    // Scroll depth tracking
    this.setupScrollTracking();
    
    // Navigation path tracking
    this.setupNavigationTracking();
    
    // Session duration tracking
    this.setupSessionTracking();
  }

  setupClickTracking() {
    document.addEventListener('click', (e) => {
      if (!this.isEnabled) return;
      
      const element = e.target;
      const clickData = {
        sessionId: this.sessionId,
        elementType: element.tagName.toLowerCase(),
        elementId: element.id || null,
        elementClass: element.className || null,
        elementText: element.textContent?.substring(0, 100) || null,
        pageUrl: window.location.href,
        clickX: e.clientX,
        clickY: e.clientY,
        isCta: this.isCTAElement(element),
        conversionGoal: this.getConversionGoal(element),
        customData: this.getElementCustomData(element)
      };
      
      this.sendData('/click-tracking', clickData);
      this.clickCount++;
      
      // Track CTR for specific elements
      this.trackCTR(element);
    });
  }

  setupScrollTracking() {
    let scrollTimeout;
    let lastScrollDepth = 0;
    
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        this.scrollDepth = documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;
        this.maxScrollDepth = Math.max(this.maxScrollDepth, this.scrollDepth);
        
        // Track significant scroll milestones
        if (this.scrollDepth - lastScrollDepth > 25) {
          this.trackScrollMilestone(this.scrollDepth);
          lastScrollDepth = this.scrollDepth;
        }
      }, 100);
    }, { passive: true });
  }

  setupNavigationTracking() {
    // Track navigation clicks
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        const linkData = {
          sessionId: this.sessionId,
          linkUrl: e.target.href,
          linkText: e.target.textContent,
          isInternal: e.target.hostname === window.location.hostname,
          linkPosition: this.getElementPosition(e.target)
        };
        
        this.sendData('/link-tracking', linkData);
        this.navigationPath.push({
          url: e.target.href,
          timestamp: Date.now(),
          type: 'click'
        });
      }
    });
    
    // Track browser navigation
    window.addEventListener('popstate', () => {
      this.navigationPath.push({
        url: window.location.href,
        timestamp: Date.now(),
        type: 'browser'
      });
    });
  }

  setupSessionTracking() {
    let visibilityStartTime = Date.now();
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.timeOnPage += Date.now() - visibilityStartTime;
      } else {
        visibilityStartTime = Date.now();
      }
    });
    
    // Track session end
    window.addEventListener('beforeunload', () => {
      this.timeOnPage = performance.now() - this.pageStartTime;
      this.trackSessionEnd();
    });
  }

  // ===== AUDIENCE INSIGHTS =====
  setupAudienceInsights() {
    this.trackDeviceInfo();
    this.trackGeographicInfo();
    this.trackLanguageInfo();
    this.trackReturningVisitor();
  }

  trackDeviceInfo() {
    const deviceInfo = this.getDetailedDeviceInfo();
    this.sendData('/device-info', {
      sessionId: this.sessionId,
      ...deviceInfo
    });
  }

  getCountryFromLanguage(language) {
    // Simple mapping of language codes to countries
    const languageToCountry = {
      'en': 'US',
      'en-US': 'US',
      'en-CA': 'CA',
      'en-GB': 'GB',
      'fr': 'FR',
      'fr-CA': 'CA',
      'es': 'ES',
      'de': 'DE',
      'it': 'IT',
      'pt': 'PT',
      'ru': 'RU',
      'ja': 'JP',
      'ko': 'KR',
      'zh': 'CN',
      'ar': 'SA'
    };
    
    // Extract base language code
    const baseLang = language.split('-')[0];
    return languageToCountry[language] || languageToCountry[baseLang] || 'Unknown';
  }

  trackGeographicInfo() {
    // This would typically use a geolocation service
    // For now, we'll track what we can from the browser
    const geoInfo = {
      sessionId: this.sessionId,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      country: this.getCountryFromLanguage(navigator.language)
    };
    
    this.sendData('/geographic-info', geoInfo);
  }

  trackLanguageInfo() {
    const languageInfo = {
      sessionId: this.sessionId,
      primaryLanguage: navigator.language,
      languages: navigator.languages,
      acceptLanguage: navigator.language
    };
    
    this.sendData('/language-info', languageInfo);
  }

  trackReturningVisitor() {
    const isReturning = localStorage.getItem('analytics_returning_visitor') === 'true';
    if (!isReturning) {
      localStorage.setItem('analytics_returning_visitor', 'true');
    }
    
    this.sendData('/visitor-type', {
      sessionId: this.sessionId,
      isReturning,
      firstVisit: !isReturning
    });
  }

  // ===== PERFORMANCE & TECHNICAL METRICS =====
  setupPerformanceTracking() {
    this.trackCoreWebVitals();
    this.trackPageLoadMetrics();
    this.trackAPIRequests();
    this.trackErrors();
    this.trackUptime();
  }

  trackCoreWebVitals() {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.coreWebVitals.lcp = lastEntry.startTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP tracking not supported');
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            this.coreWebVitals.fid = entry.processingStart - entry.startTime;
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID tracking not supported');
      }

      // Cumulative Layout Shift
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          list.getEntries().forEach(entry => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.coreWebVitals.cls = clsValue;
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS tracking not supported');
      }
    }
  }

  trackPageLoadMetrics() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paintEntries = performance.getEntriesByType('paint');
        
        let fcp = 0;
        paintEntries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            fcp = entry.startTime;
          }
        });

        const performanceData = {
          sessionId: this.sessionId,
          pageUrl: window.location.href,
          loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
          domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
          firstContentfulPaint: fcp,
          largestContentfulPaint: this.coreWebVitals.lcp || 0,
          firstInputDelay: this.coreWebVitals.fid || 0,
          cumulativeLayoutShift: this.coreWebVitals.cls || 0,
          timeToInteractive: this.calculateTTI(),
          connectionType: navigator.connection ? navigator.connection.effectiveType : 'unknown',
          deviceMemory: navigator.deviceMemory || 0
        };

        this.sendData('/performance', performanceData);
      }, 2000);
    });
  }

  trackAPIRequests() {
    // Override fetch to track API calls
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        
        this.apiCalls.push({
          url: args[0],
          method: args[1]?.method || 'GET',
          status: response.status,
          duration: endTime - startTime,
          success: response.ok,
          timestamp: Date.now()
        });
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        this.apiCalls.push({
          url: args[0],
          method: args[1]?.method || 'GET',
          status: 0,
          duration: endTime - startTime,
          success: false,
          error: error.message,
          timestamp: Date.now()
        });
        throw error;
      }
    };
  }

  trackErrors() {
    window.addEventListener('error', (event) => {
      this.errorCount++;
      this.sendData('/error', {
        sessionId: this.sessionId,
        errorType: 'javascript_error',
        errorMessage: event.message,
        errorStack: event.error ? event.error.stack : '',
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
        ipAddress: ''
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.errorCount++;
      this.sendData('/error', {
        sessionId: this.sessionId,
        errorType: 'promise_rejection',
        errorMessage: event.reason ? event.reason.toString() : 'Unknown promise rejection',
        errorStack: '',
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
        ipAddress: ''
      });
    });
  }

  trackUptime() {
    // Simple uptime tracking
    setInterval(() => {
      this.sendData('/uptime', {
        sessionId: this.sessionId,
        uptime: performance.now(),
        timestamp: Date.now()
      });
    }, 60000); // Every minute
  }

  // ===== CONVERSION & BUSINESS METRICS =====
  setupConversionTracking() {
    this.setupGoalTracking();
    this.setupRevenueTracking();
    this.setupFunnelTracking();
  }

  setupGoalTracking() {
    // Track form submissions as goals
    document.addEventListener('submit', (e) => {
      const form = e.target;
      this.trackConversionGoal('form_submission', {
        formId: form.id,
        formName: form.name,
        formAction: form.action,
        fieldCount: form.elements.length
      });
    });
  }

  setupRevenueTracking() {
    // This would integrate with your e-commerce system
    // For now, we'll track potential revenue events
    this.trackConversionGoal('page_view', { value: 0.01 }); // Micro-conversion
  }

  setupFunnelTracking() {
    // Define your conversion funnels
    this.funnels = {
      'awareness': ['home', 'about', 'whatisaam'],
      'interest': ['focus', 'team', 'how-it-works'],
      'consideration': ['join', 'partnerships'],
      'action': ['contact', 'signup']
    };
    
    this.trackFunnelStep();
  }

  // ===== USER BEHAVIOR & FLOW =====
  setupUserBehaviorTracking() {
    this.setupHeatmapTracking();
    this.setupSessionRecording();
    this.setupUserJourneyTracking();
    this.setupFormAnalytics();
    this.setupRetentionTracking();
  }

  setupHeatmapTracking() {
    // Click heatmap
    document.addEventListener('click', (e) => {
      this.heatmapData.push({
        type: 'click',
        x: e.clientX,
        y: e.clientY,
        element: e.target.tagName,
        timestamp: Date.now()
      });
    });

    // Hover heatmap
    document.addEventListener('mouseover', (e) => {
      this.heatmapData.push({
        type: 'hover',
        x: e.clientX,
        y: e.clientY,
        element: e.target.tagName,
        timestamp: Date.now()
      });
    });

    // Send heatmap data periodically
    setInterval(() => {
      if (this.heatmapData.length > 0) {
        this.sendData('/heatmap', {
          sessionId: this.sessionId,
          pageUrl: window.location.href,
          heatmapData: this.heatmapData
        });
        this.heatmapData = [];
      }
    }, 30000); // Every 30 seconds
  }

  setupSessionRecording() {
    // Basic session recording (would need more sophisticated implementation)
    this.sessionEvents = [];
    
    // Record key events
    ['click', 'scroll', 'keydown', 'mousemove'].forEach(eventType => {
      document.addEventListener(eventType, (e) => {
        this.sessionEvents.push({
          type: eventType,
          timestamp: Date.now(),
          data: this.serializeEvent(e)
        });
      }, { passive: true });
    });
  }

  setupUserJourneyTracking() {
    // Track user journey through the site
    this.userJourney = [];
    
    // Track page changes
    let currentPage = window.location.href;
    this.userJourney.push({
      page: currentPage,
      timestamp: Date.now(),
      type: 'entry'
    });
    
    // Track navigation
    window.addEventListener('popstate', () => {
      this.userJourney.push({
        page: window.location.href,
        timestamp: Date.now(),
        type: 'navigation'
      });
    });
  }

  setupFormAnalytics() {
    // Track form field interactions
    document.addEventListener('focus', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        this.trackFormFieldInteraction(e.target, 'focus');
      }
    });

    document.addEventListener('blur', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        this.trackFormFieldInteraction(e.target, 'blur');
      }
    });

    document.addEventListener('input', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        this.trackFormFieldInteraction(e.target, 'input');
      }
    });
  }

  setupRetentionTracking() {
    // Track user retention
    const lastVisit = localStorage.getItem('analytics_last_visit');
    const now = Date.now();
    
    if (lastVisit) {
      const daysSinceLastVisit = (now - parseInt(lastVisit)) / (1000 * 60 * 60 * 24);
      this.sendData('/retention', {
        sessionId: this.sessionId,
        daysSinceLastVisit,
        isReturning: daysSinceLastVisit > 0
      });
    }
    
    localStorage.setItem('analytics_last_visit', now.toString());
  }

  // ===== CONTENT-SPECIFIC ANALYTICS =====
  setupContentAnalytics() {
    this.trackTopContent();
    this.trackExitIntent();
    this.trackSocialShares();
    this.trackMediaEngagement();
  }

  trackTopContent() {
    // Track which content is most engaging
    this.sendData('/content-engagement', {
      sessionId: this.sessionId,
      pageUrl: window.location.href,
      pageTitle: document.title,
      timeOnPage: 0, // Will be updated on page unload
      scrollDepth: 0, // Will be updated continuously
      clickCount: this.clickCount
    });
  }

  trackExitIntent() {
    // Track exit intent (mouse leaving viewport)
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY <= 0) {
        this.exitIntentDetected = true;
        this.sendData('/exit-intent', {
          sessionId: this.sessionId,
          pageUrl: window.location.href,
          timeOnPage: performance.now() - this.pageStartTime
        });
      }
    });
  }

  trackSocialShares() {
    // Track social media shares
    document.addEventListener('click', (e) => {
      if (e.target.href && this.isSocialShareLink(e.target.href)) {
        this.socialShares++;
        this.sendData('/social-share', {
          sessionId: this.sessionId,
          platform: this.getSocialPlatform(e.target.href),
          pageUrl: window.location.href,
          shareUrl: e.target.href
        });
      }
    });
  }

  trackMediaEngagement() {
    // Track video engagement
    document.querySelectorAll('video').forEach(video => {
      video.addEventListener('play', () => {
        this.trackMediaEvent(video, 'play');
      });
      
      video.addEventListener('pause', () => {
        this.trackMediaEvent(video, 'pause');
      });
      
      video.addEventListener('ended', () => {
        this.trackMediaEvent(video, 'ended');
      });
    });

    // Track audio engagement
    document.querySelectorAll('audio').forEach(audio => {
      audio.addEventListener('play', () => {
        this.trackMediaEvent(audio, 'play');
      });
    });
  }

  // ===== MARKETING & ACQUISITION =====
  setupMarketingTracking() {
    this.trackTrafficSources();
    this.trackUTMCampaigns();
    this.trackReferralSources();
    this.trackSearchKeywords();
  }

  trackTrafficSources() {
    const referrer = document.referrer;
    const trafficSource = this.categorizeTrafficSource(referrer);
    
    this.sendData('/traffic-source', {
      sessionId: this.sessionId,
      referrer,
      trafficSource,
      isDirect: !referrer,
      utmParams: this.getUTMParams()
    });
  }

  trackUTMCampaigns() {
    const utmParams = this.getUTMParams();
    if (Object.keys(utmParams).length > 0) {
      this.sendData('/utm-campaign', {
        sessionId: this.sessionId,
        ...utmParams,
        pageUrl: window.location.href
      });
    }
  }

  trackReferralSources() {
    const referrer = document.referrer;
    if (referrer) {
      this.sendData('/referral', {
        sessionId: this.sessionId,
        referrer,
        referrerDomain: new URL(referrer).hostname,
        pageUrl: window.location.href
      });
    }
  }

  trackSearchKeywords() {
    // Track internal search
    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (form.querySelector('input[type="search"]')) {
        const searchQuery = form.querySelector('input[type="search"]').value;
        this.searchQueries.push(searchQuery);
        
        this.sendData('/search', {
          sessionId: this.sessionId,
          searchQuery,
          searchType: 'internal',
          pageUrl: window.location.href
        });
      }
    });
  }

  // ===== SECURITY & COMPLIANCE =====
  setupSecurityCompliance() {
    this.detectBots();
    this.trackSuspiciousActivity();
    this.trackConsent();
    this.trackDataExports();
  }

  detectBots() {
    // Simple bot detection
    const botPatterns = [
      /bot/i, /crawler/i, /spider/i, /scraper/i,
      /curl/i, /wget/i, /python/i, /java/i
    ];
    
    const userAgent = navigator.userAgent;
    this.botDetected = botPatterns.some(pattern => pattern.test(userAgent));
    
    if (this.botDetected) {
      this.sendData('/bot-detection', {
        sessionId: this.sessionId,
        userAgent,
        botType: 'automated'
      });
    }
  }

  trackSuspiciousActivity() {
    // Track unusual patterns
    let rapidClicks = 0;
    let lastClickTime = 0;
    
    document.addEventListener('click', () => {
      const now = Date.now();
      if (now - lastClickTime < 100) { // Less than 100ms between clicks
        rapidClicks++;
        if (rapidClicks > 10) {
          this.suspiciousActivity = true;
          this.sendData('/suspicious-activity', {
            sessionId: this.sessionId,
            activityType: 'rapid_clicks',
            count: rapidClicks,
            timestamp: now
          });
        }
      } else {
        rapidClicks = 0;
      }
      lastClickTime = now;
    });
  }

  trackConsent() {
    // Track GDPR/CCPA consent
    const consent = localStorage.getItem('analytics_consent');
    this.consentGiven = consent === 'true';
    
    if (!this.consentGiven) {
      this.showConsentBanner();
    }
  }

  trackDataExports() {
    // Track when users download or export data
    document.addEventListener('click', (e) => {
      if (e.target.href && this.isDataExportLink(e.target.href)) {
        this.sendData('/data-export', {
          sessionId: this.sessionId,
          exportType: this.getExportType(e.target.href),
          exportUrl: e.target.href,
          timestamp: Date.now()
        });
      }
    });
  }

  // ===== ADVANCED ANALYTICS =====
  setupAdvancedAnalytics() {
    this.setupUserSegmentation();
    this.setupFeatureUsageTracking();
    this.setupChurnPrediction();
    this.setupAIInsights();
  }

  setupUserSegmentation() {
    // Segment users based on behavior
    this.userSegment = this.calculateUserSegment();
    this.sendData('/user-segment', {
      sessionId: this.sessionId,
      segment: this.userSegment,
      attributes: this.getUserAttributes()
    });
  }

  setupFeatureUsageTracking() {
    // Track which features users interact with
    document.addEventListener('click', (e) => {
      const feature = this.identifyFeature(e.target);
      if (feature) {
        this.trackFeatureUsage(feature);
      }
    });
  }

  setupChurnPrediction() {
    // Simple churn prediction based on engagement
    const engagementScore = this.calculateEngagementScore();
    this.churnRisk = this.predictChurnRisk(engagementScore);
    
    this.sendData('/churn-prediction', {
      sessionId: this.sessionId,
      engagementScore,
      churnRisk: this.churnRisk,
      riskFactors: this.getChurnRiskFactors()
    });
  }

  setupAIInsights() {
    // Generate AI insights based on user behavior
    setInterval(() => {
      this.generateAIInsights();
    }, 300000); // Every 5 minutes
  }

  // ===== UTILITY METHODS =====
  getDetailedDeviceInfo() {
    const userAgent = navigator.userAgent;
    
    return {
      deviceType: this.getDeviceType(),
      browser: this.getBrowser(),
      os: this.getOS(),
      userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      touchSupport: 'ontouchstart' in window,
      connectionType: navigator.connection ? navigator.connection.effectiveType : 'unknown',
      deviceMemory: navigator.deviceMemory || 0
    };
  }

  getDeviceType() {
    const userAgent = navigator.userAgent;
    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      return 'mobile';
    } else if (/Tablet|iPad/i.test(userAgent)) {
      return 'tablet';
    }
    return 'desktop';
  }

  getBrowser() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  getOS() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  isCTAElement(element) {
    const ctaClasses = ['cta', 'button', 'btn', 'call-to-action'];
    const ctaTexts = ['click', 'buy', 'sign up', 'get started', 'learn more', 'join'];
    
    return ctaClasses.some(cls => element.className.includes(cls)) ||
           ctaTexts.some(text => element.textContent.toLowerCase().includes(text));
  }

  getConversionGoal(element) {
    // Determine conversion goal based on element
    if (element.href && element.href.includes('contact')) return 'contact';
    if (element.href && element.href.includes('join')) return 'join';
    if (element.href && element.href.includes('signup')) return 'signup';
    return null;
  }

  getElementCustomData(element) {
    return {
      id: element.id,
      className: element.className,
      tagName: element.tagName,
      textContent: element.textContent?.substring(0, 100)
    };
  }

  trackCTR(element) {
    // Track click-through rate for specific elements
    const elementId = element.id || element.className;
    if (elementId) {
      this.sendData('/ctr', {
        sessionId: this.sessionId,
        elementId,
        elementType: element.tagName,
        pageUrl: window.location.href
      });
    }
  }

  trackScrollMilestone(depth) {
    this.sendData('/scroll-milestone', {
      sessionId: this.sessionId,
      scrollDepth: depth,
      pageUrl: window.location.href,
      timestamp: Date.now()
    });
  }

  trackSessionEnd() {
    this.sendData('/session-end', {
      sessionId: this.sessionId,
      totalTimeSpent: this.timeOnPage,
      totalClicks: this.clickCount,
      maxScrollDepth: this.maxScrollDepth,
      formInteractions: this.formInteractions,
      videoEngagement: this.videoEngagement,
      socialShares: this.socialShares,
      searchQueries: this.searchQueries,
      navigationPath: this.navigationPath,
      exitIntentDetected: this.exitIntentDetected,
      botDetected: this.botDetected,
      suspiciousActivity: this.suspiciousActivity,
      consentGiven: this.consentGiven,
      userSegment: this.userSegment,
      churnRisk: this.churnRisk,
      errorCount: this.errorCount,
      apiCalls: this.apiCalls
    });
  }

  // ===== DATA SENDING =====
  async sendData(endpoint, data, useBeacon = false) {
    // Skip if analytics is disabled
    if (!this.analyticsEndpoint) {
      return;
    }
    
    const url = this.analyticsEndpoint + endpoint;
    
    if (useBeacon && 'sendBeacon' in navigator) {
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
      }, this.retryDelay * Math.pow(2, item.retries));
    }
  }

  // ===== PUBLIC API =====
  trackPageView() {
    const deviceInfo = this.getDetailedDeviceInfo();
    const pageData = {
      sessionId: this.sessionId,
      pageUrl: window.location.href,
      pageTitle: document.title,
      referrer: document.referrer || '',
      userAgent: deviceInfo.userAgent,
      ipAddress: '',
      timeOnPage: 0,
      scrollDepth: 0,
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      screenResolution: deviceInfo.screenResolution,
      viewportSize: deviceInfo.viewportSize
    };

    this.sendData('/pageview', pageData);
  }

  trackEvent(eventType, eventCategory = '', eventAction = '', eventLabel = '', eventValue = null, customData = {}) {
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

    this.sendData('/event', eventData);
  }

  trackConversionGoal(goalName, goalData = {}) {
    this.conversionGoals.set(goalName, goalData);
    this.sendData('/conversion-goal', {
      sessionId: this.sessionId,
      goalName,
      goalData,
      timestamp: Date.now()
    });
  }

  trackFeatureUsage(featureName) {
    const currentUsage = this.featureUsage.get(featureName) || { count: 0, firstUsed: Date.now() };
    currentUsage.count++;
    currentUsage.lastUsed = Date.now();
    this.featureUsage.set(featureName, currentUsage);

    this.sendData('/feature-usage', {
      sessionId: this.sessionId,
      featureName,
      usageCount: currentUsage.count,
      firstUsed: currentUsage.firstUsed,
      lastUsed: currentUsage.lastUsed
    });
  }

  // ===== ENABLE/DISABLE =====
  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  // ===== CONSENT MANAGEMENT =====
  showConsentBanner() {
    const banner = document.createElement('div');
    banner.id = 'analytics-consent-banner';
    banner.innerHTML = `
      <div style="position: fixed; bottom: 0; left: 0; right: 0; background: #333; color: white; padding: 20px; text-align: center; z-index: 10000;">
        <p>We use analytics to improve your experience. Do you consent to data collection?</p>
        <button onclick="window.advancedAnalytics.acceptConsent()" style="background: #4CAF50; color: white; border: none; padding: 10px 20px; margin: 0 10px; cursor: pointer;">Accept</button>
        <button onclick="window.advancedAnalytics.declineConsent()" style="background: #f44336; color: white; border: none; padding: 10px 20px; margin: 0 10px; cursor: pointer;">Decline</button>
      </div>
    `;
    document.body.appendChild(banner);
  }

  acceptConsent() {
    this.consentGiven = true;
    localStorage.setItem('analytics_consent', 'true');
    document.getElementById('analytics-consent-banner').remove();
    this.sendData('/consent', {
      sessionId: this.sessionId,
      consent: true,
      timestamp: Date.now()
    });
  }

  declineConsent() {
    this.consentGiven = false;
    localStorage.setItem('analytics_consent', 'false');
    document.getElementById('analytics-consent-banner').remove();
    this.disable();
  }
}

// Create global instance
window.advancedAnalytics = new AdvancedAnalytics();
