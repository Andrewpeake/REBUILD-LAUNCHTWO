/**
 * UAM UCalgary Analytics Script
 * Production-ready analytics tracking for uamu site
 * 
 * Usage: Add this script to your website:
 * <script src="https://your-analytics-server.com/uam-analytics.js"></script>
 */

(function() {
    'use strict';
    
    // Configuration
    const ANALYTICS_ENDPOINT = 'http://10.0.0.124:3001/api/analytics';
    const SITE_NAME = 'UAM UCalgary';
    const VERSION = '1.0.0';
    
    // Check if analytics is already loaded
    if (window.UAMAnalytics) {
        console.warn('UAM Analytics already loaded');
        return;
    }
    
    class UAMAnalytics {
        constructor() {
            this.sessionId = this.generateSessionId();
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
            this.navigationPath = [];
            
            this.init();
        }

        init() {
            console.log('🚀 UAM Analytics initialized for', SITE_NAME);
            
            // Track initial page view
            this.trackPageView();
            
            // Set up all tracking
            this.setupClickTracking();
            this.setupScrollTracking();
            this.setupNavigationTracking();
            this.setupSessionTracking();
            this.setupPerformanceTracking();
            this.setupErrorTracking();
            this.setupFormTracking();
            this.setupMediaTracking();
            
            // Track UAM-specific interactions
            this.setupUAMInteractions();
        }

        generateSessionId() {
            let sessionId = sessionStorage.getItem('uam_analytics_session_id');
            if (!sessionId) {
                sessionId = 'uam_session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                sessionStorage.setItem('uam_analytics_session_id', sessionId);
            }
            return sessionId;
        }

        getDeviceInfo() {
            const userAgent = navigator.userAgent;
            
            return {
                deviceType: this.getDeviceType(),
                browser: this.getBrowser(),
                os: this.getOS(),
                userAgent,
                screenResolution: `${screen.width}x${screen.height}`,
                viewportSize: `${window.innerWidth}x${window.innerHeight}`,
                language: navigator.language,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
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

        setupUAMInteractions() {
            // Track UAM-specific elements
            this.trackUAMNavigation();
            this.trackAAMInteractions();
            this.trackFocusInteractions();
            this.trackTeamInteractions();
            this.trackPartnershipInteractions();
        }

        trackUAMNavigation() {
            // Track navigation clicks
            document.addEventListener('click', (e) => {
                if (e.target.closest('nav a')) {
                    const link = e.target.closest('nav a');
                    const href = link.getAttribute('href');
                    const text = link.textContent.trim();
                    
                    this.trackEvent('navigation_click', 'navigation', 'click', text, null, {
                        href: href,
                        section: href.replace('#', ''),
                        isInternal: href.startsWith('#')
                    });
                }
            });
        }

        trackAAMInteractions() {
            // Track AAM (Advanced Air Mobility) item interactions
            document.addEventListener('click', (e) => {
                if (e.target.closest('.aam-item')) {
                    const item = e.target.closest('.aam-item');
                    const itemId = item.id || 'unknown';
                    const itemText = item.textContent.trim();
                    
                    this.trackEvent('aam_item_click', 'engagement', 'click', itemText, null, {
                        itemId: itemId,
                        itemText: itemText
                    });
                }
            });
        }

        trackFocusInteractions() {
            // Track focus layer interactions
            document.addEventListener('click', (e) => {
                if (e.target.closest('.focus-layer')) {
                    const layer = e.target.closest('.focus-layer');
                    const layerId = layer.id || 'unknown';
                    
                    this.trackEvent('focus_layer_click', 'engagement', 'click', layerId, null, {
                        layerId: layerId,
                        isActive: layer.classList.contains('active')
                    });
                }
            });
        }

        trackTeamInteractions() {
            // Track team member interactions
            document.addEventListener('click', (e) => {
                if (e.target.closest('.team-member') || e.target.closest('[href*="bios/"]')) {
                    const element = e.target.closest('.team-member') || e.target.closest('[href*="bios/"]');
                    const memberName = element.textContent.trim();
                    
                    this.trackEvent('team_member_click', 'engagement', 'click', memberName, null, {
                        memberName: memberName,
                        elementType: element.tagName
                    });
                }
            });
        }

        trackPartnershipInteractions() {
            // Track partnership interactions
            document.addEventListener('click', (e) => {
                if (e.target.closest('.partnership') || e.target.closest('[href*="partnership"]')) {
                    const element = e.target.closest('.partnership') || e.target.closest('[href*="partnership"]');
                    const partnerName = element.textContent.trim();
                    
                    this.trackEvent('partnership_click', 'engagement', 'click', partnerName, null, {
                        partnerName: partnerName,
                        elementType: element.tagName
                    });
                }
            });
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
                    customData: {
                        siteName: SITE_NAME,
                        version: VERSION
                    }
                };
                
                this.sendData('/click-tracking', clickData);
                this.clickCount++;
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
                    
                    // Track significant scroll milestones
                    if (this.scrollDepth % 25 === 0 && this.scrollDepth > 0) {
                        this.trackEvent('scroll_milestone', 'engagement', 'scroll', `${Math.round(this.scrollDepth)}%`, this.scrollDepth);
                    }
                }, 100);
            }, { passive: true });
        }

        setupNavigationTracking() {
            // Track page changes
            let currentPage = window.location.href;
            this.navigationPath.push({
                url: currentPage,
                timestamp: Date.now(),
                type: 'entry'
            });
            
            // Track browser navigation
            window.addEventListener('popstate', () => {
                this.navigationPath.push({
                    url: window.location.href,
                    timestamp: Date.now(),
                    type: 'navigation'
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

        setupPerformanceTracking() {
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
                        siteName: SITE_NAME
                    };

                    this.sendData('/performance', performanceData);
                }, 2000);
            });
        }

        setupErrorTracking() {
            window.addEventListener('error', (event) => {
                this.trackEvent('javascript_error', 'error', 'error', event.message, null, {
                    errorMessage: event.message,
                    errorStack: event.error ? event.error.stack : '',
                    siteName: SITE_NAME
                });
            });

            window.addEventListener('unhandledrejection', (event) => {
                this.trackEvent('promise_rejection', 'error', 'error', event.reason ? event.reason.toString() : 'Unknown', null, {
                    errorMessage: event.reason ? event.reason.toString() : 'Unknown promise rejection',
                    siteName: SITE_NAME
                });
            });
        }

        setupFormTracking() {
            document.addEventListener('submit', (e) => {
                const form = e.target;
                const formData = new FormData(form);
                const data = Object.fromEntries(formData);
                
                this.trackEvent('form_submit', 'engagement', 'submit', form.id || 'unknown', 1, {
                    formId: form.id,
                    formAction: form.action,
                    fieldCount: form.elements.length,
                    siteName: SITE_NAME
                });
            });

            // Track form field interactions
            document.addEventListener('focus', (e) => {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                    this.trackEvent('form_field_focus', 'engagement', 'focus', e.target.name || 'unknown', null, {
                        fieldName: e.target.name,
                        fieldType: e.target.type,
                        formId: e.target.closest('form')?.id
                    });
                }
            });
        }

        setupMediaTracking() {
            // Track video interactions
            document.querySelectorAll('video').forEach(video => {
                video.addEventListener('play', () => {
                    this.trackEvent('video_play', 'media', 'play', video.id || 'unknown', 1, {
                        videoId: video.id,
                        videoSrc: video.src,
                        siteName: SITE_NAME
                    });
                });
            });

            // Track image interactions
            document.addEventListener('click', (e) => {
                if (e.target.tagName === 'IMG') {
                    this.trackEvent('image_click', 'engagement', 'click', e.target.alt || 'unknown', null, {
                        imageSrc: e.target.src,
                        imageAlt: e.target.alt,
                        siteName: SITE_NAME
                    });
                }
            });
        }

        isCTAElement(element) {
            const ctaClasses = ['cta', 'button', 'btn', 'call-to-action', 'nav-cta'];
            const ctaTexts = ['click', 'buy', 'sign up', 'get started', 'learn more', 'join', 'contact'];
            
            return ctaClasses.some(cls => element.className.includes(cls)) ||
                   ctaTexts.some(text => element.textContent.toLowerCase().includes(text));
        }

        trackPageView() {
            const deviceInfo = this.getDeviceInfo();
            const pageData = {
                sessionId: this.sessionId,
                pageUrl: window.location.href,
                pageTitle: document.title,
                referrer: document.referrer || '',
                userAgent: deviceInfo.userAgent,
                timeOnPage: 0,
                scrollDepth: 0,
                deviceType: deviceInfo.deviceType,
                browser: deviceInfo.browser,
                os: deviceInfo.os,
                screenResolution: deviceInfo.screenResolution,
                viewportSize: deviceInfo.viewportSize,
                siteName: SITE_NAME,
                version: VERSION
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
                customData: {
                    ...customData,
                    siteName: SITE_NAME,
                    version: VERSION
                }
            };

            this.sendData('/event', eventData);
        }

        trackSessionEnd() {
            this.sendData('/session-end', {
                sessionId: this.sessionId,
                totalTimeSpent: this.timeOnPage,
                totalClicks: this.clickCount,
                maxScrollDepth: this.maxScrollDepth,
                navigationPath: this.navigationPath,
                siteName: SITE_NAME,
                version: VERSION
            });
        }

        async sendData(endpoint, data, useBeacon = false) {
            const url = ANALYTICS_ENDPOINT + endpoint;
            
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
                console.warn('UAM Analytics tracking failed:', error);
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
    }

    // Initialize analytics
    window.UAMAnalytics = new UAMAnalytics();
    
    // Also make it globally available
    window.uamAnalytics = window.UAMAnalytics;
    
    console.log('✅ UAM Analytics loaded successfully');
})();
