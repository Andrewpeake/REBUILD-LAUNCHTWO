/**
 * UAM UCalgary Analytics Configuration
 * Centralized configuration for all analytics tracking
 */

window.UAMAnalyticsConfig = {
    // Server Configuration
    endpoint: null, // Disabled for production
    siteName: 'UAM UCalgary',
    version: '1.0.0',
    
    // Tracking Configuration
    trackPageViews: false, // Disabled for production
    trackClicks: false,
    trackScroll: false,
    trackForms: false,
    trackPerformance: false,
    trackErrors: false,
    trackUAMInteractions: false,
    
    // UAM-Specific Tracking
    uamSections: [
        'home', 'about', 'focus', 'whatisaam', 'team', 'join', 'contact'
    ],
    
    uamInteractions: [
        'aam_item_click',
        'focus_layer_interaction',
        'team_member_click',
        'partnership_click',
        'navigation_click',
        'cta_click',
        'video_interaction',
        'form_submit'
    ],
    
    // Performance Thresholds
    performanceThresholds: {
        slowLoadTime: 3000, // 3 seconds
        highBounceRate: 70, // 70%
        lowScrollDepth: 25  // 25%
    },
    
    // Debug Mode
    debug: false,
    
    // Privacy Settings
    respectDoNotTrack: true,
    anonymizeIP: true,
    
    // Retry Configuration
    maxRetries: 3,
    retryDelay: 1000
};
