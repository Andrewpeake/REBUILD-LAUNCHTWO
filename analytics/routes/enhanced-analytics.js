const express = require('express');
const router = express.Router();
const Database = require('../database/database');

// Initialize database connection
const db = new Database();
db.init().catch(console.error);

// ===== CORE TRAFFIC & ENGAGEMENT =====

// Track click events for CTR analysis
router.post('/click-tracking', async (req, res) => {
  try {
    const {
      sessionId,
      elementType,
      elementId,
      elementClass,
      elementText,
      pageUrl,
      clickX,
      clickY,
      isCta,
      conversionGoal,
      customData
    } = req.body;

    if (!sessionId || !elementType) {
      return res.status(400).json({ error: 'sessionId and elementType are required' });
    }

    const sql = `
      INSERT INTO click_tracking (
        session_id, element_type, element_id, element_class, element_text,
        page_url, click_x, click_y, is_cta, conversion_goal, custom_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.run(sql, [
      sessionId, elementType, elementId, elementClass, elementText,
      pageUrl, clickX, clickY, isCta, conversionGoal, JSON.stringify(customData)
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({ error: 'Failed to track click' });
  }
});

// Track scroll depth
router.post('/scroll-tracking', async (req, res) => {
  try {
    const {
      sessionId,
      pageUrl,
      scrollDepth,
      maxScrollDepth,
      timeToScroll,
      viewportHeight,
      pageHeight
    } = req.body;

    if (!sessionId || !pageUrl) {
      return res.status(400).json({ error: 'sessionId and pageUrl are required' });
    }

    const sql = `
      INSERT INTO scroll_tracking (
        session_id, page_url, scroll_depth, max_scroll_depth, time_to_scroll,
        viewport_height, page_height
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await db.run(sql, [
      sessionId, pageUrl, scrollDepth, maxScrollDepth, timeToScroll,
      viewportHeight, pageHeight
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking scroll:', error);
    res.status(500).json({ error: 'Failed to track scroll' });
  }
});

// Track navigation paths
router.post('/navigation-path', async (req, res) => {
  try {
    const {
      sessionId,
      pathSequence,
      stepNumber,
      pageUrl,
      pageTitle,
      timeOnPage,
      isEntry,
      isExit,
      funnelName,
      conversionStep
    } = req.body;

    if (!sessionId || !pageUrl) {
      return res.status(400).json({ error: 'sessionId and pageUrl are required' });
    }

    const sql = `
      INSERT INTO navigation_paths (
        session_id, path_sequence, step_number, page_url, page_title,
        time_on_page, is_entry, is_exit, funnel_name, conversion_step
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.run(sql, [
      sessionId, pathSequence, stepNumber, pageUrl, pageTitle,
      timeOnPage, isEntry, isExit, funnelName, conversionStep
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking navigation path:', error);
    res.status(500).json({ error: 'Failed to track navigation path' });
  }
});

// ===== AUDIENCE INSIGHTS =====

// Track device information
router.post('/device-info', async (req, res) => {
  try {
    const {
      sessionId,
      deviceType,
      browser,
      os,
      userAgent,
      screenResolution,
      viewportSize,
      colorDepth,
      pixelRatio,
      touchSupport,
      connectionType,
      deviceMemory
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    // Update or create enhanced session
    await updateEnhancedSession(sessionId, {
      device_type: deviceType,
      browser,
      os,
      user_agent: userAgent,
      screen_resolution: screenResolution,
      viewport_size: viewportSize
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking device info:', error);
    res.status(500).json({ error: 'Failed to track device info' });
  }
});

// Track geographic information
router.post('/geographic-info', async (req, res) => {
  try {
    const {
      sessionId,
      timezone,
      language,
      country
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    await updateEnhancedSession(sessionId, {
      timezone,
      language,
      country
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking geographic info:', error);
    res.status(500).json({ error: 'Failed to track geographic info' });
  }
});

// Track visitor type (new vs returning)
router.post('/visitor-type', async (req, res) => {
  try {
    const {
      sessionId,
      isReturning,
      firstVisit
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    await updateEnhancedSession(sessionId, {
      is_returning: isReturning,
      first_visit: firstVisit
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking visitor type:', error);
    res.status(500).json({ error: 'Failed to track visitor type' });
  }
});

// ===== CONVERSION & BUSINESS METRICS =====

// Track conversion goals
router.post('/conversion-goal', async (req, res) => {
  try {
    const {
      sessionId,
      goalName,
      goalData,
      timestamp
    } = req.body;

    if (!sessionId || !goalName) {
      return res.status(400).json({ error: 'sessionId and goalName are required' });
    }

    const sql = `
      INSERT INTO conversion_goals (
        session_id, goal_name, goal_type, goal_value, conversion_data, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    await db.run(sql, [
      sessionId, goalName, goalData.type || 'custom', goalData.value || 0,
      JSON.stringify(goalData), new Date(timestamp)
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking conversion goal:', error);
    res.status(500).json({ error: 'Failed to track conversion goal' });
  }
});

// ===== USER BEHAVIOR & FLOW =====

// Track heatmap data
router.post('/heatmap', async (req, res) => {
  try {
    const {
      sessionId,
      pageUrl,
      heatmapData
    } = req.body;

    if (!sessionId || !pageUrl) {
      return res.status(400).json({ error: 'sessionId and pageUrl are required' });
    }

    // Insert heatmap data in batch
    for (const data of heatmapData) {
      const sql = `
        INSERT INTO heatmap_data (
          session_id, page_url, element_selector, element_type, click_x, click_y,
          hover_duration, scroll_position, viewport_width, viewport_height, device_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await db.run(sql, [
        sessionId, pageUrl, data.element || '', data.type || 'click',
        data.x || 0, data.y || 0, data.hoverDuration || 0, data.scrollPosition || 0,
        window.innerWidth, window.innerHeight, 'desktop' // This should come from the client
      ]);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking heatmap data:', error);
    res.status(500).json({ error: 'Failed to track heatmap data' });
  }
});

// Track form analytics
router.post('/form-analytics', async (req, res) => {
  try {
    const {
      sessionId,
      formId,
      formName,
      fieldName,
      fieldType,
      fieldValue,
      actionType,
      completionTime,
      dropOffStep,
      validationErrors,
      conversionGoal
    } = req.body;

    if (!sessionId || !formId) {
      return res.status(400).json({ error: 'sessionId and formId are required' });
    }

    const sql = `
      INSERT INTO form_analytics (
        session_id, form_id, form_name, field_name, field_type, field_value,
        action_type, completion_time, drop_off_step, validation_errors, conversion_goal
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.run(sql, [
      sessionId, formId, formName, fieldName, fieldType, fieldValue,
      actionType, completionTime, dropOffStep, JSON.stringify(validationErrors), conversionGoal
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking form analytics:', error);
    res.status(500).json({ error: 'Failed to track form analytics' });
  }
});

// ===== CONTENT ANALYTICS =====

// Track content engagement
router.post('/content-engagement', async (req, res) => {
  try {
    const {
      sessionId,
      pageUrl,
      pageTitle,
      timeOnPage,
      scrollDepth,
      clickCount
    } = req.body;

    if (!sessionId || !pageUrl) {
      return res.status(400).json({ error: 'sessionId and pageUrl are required' });
    }

    // Update page views with engagement data
    const sql = `
      UPDATE page_views 
      SET time_on_page = ?, scroll_depth = ?
      WHERE session_id = ? AND page_url = ?
    `;

    await db.run(sql, [timeOnPage, scrollDepth, sessionId, pageUrl]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking content engagement:', error);
    res.status(500).json({ error: 'Failed to track content engagement' });
  }
});

// Track exit intent
router.post('/exit-intent', async (req, res) => {
  try {
    const {
      sessionId,
      pageUrl,
      timeOnPage
    } = req.body;

    if (!sessionId || !pageUrl) {
      return res.status(400).json({ error: 'sessionId and pageUrl are required' });
    }

    await updateEnhancedSession(sessionId, {
      exitIntentDetected: true
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking exit intent:', error);
    res.status(500).json({ error: 'Failed to track exit intent' });
  }
});

// Track social shares
router.post('/social-share', async (req, res) => {
  try {
    const {
      sessionId,
      platform,
      pageUrl,
      shareUrl
    } = req.body;

    if (!sessionId || !platform) {
      return res.status(400).json({ error: 'sessionId and platform are required' });
    }

    await updateEnhancedSession(sessionId, {
      socialShares: 1 // Increment social shares
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking social share:', error);
    res.status(500).json({ error: 'Failed to track social share' });
  }
});

// Track media engagement
router.post('/media-engagement', async (req, res) => {
  try {
    const {
      sessionId,
      mediaType,
      mediaId,
      mediaUrl,
      engagementType,
      engagementValue,
      duration,
      pageUrl,
      customData
    } = req.body;

    if (!sessionId || !mediaType || !engagementType) {
      return res.status(400).json({ error: 'sessionId, mediaType, and engagementType are required' });
    }

    const sql = `
      INSERT INTO media_engagement (
        session_id, media_type, media_id, media_url, engagement_type,
        engagement_value, duration, page_url, custom_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.run(sql, [
      sessionId, mediaType, mediaId, mediaUrl, engagementType,
      engagementValue, duration, pageUrl, JSON.stringify(customData)
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking media engagement:', error);
    res.status(500).json({ error: 'Failed to track media engagement' });
  }
});

// ===== MARKETING & ACQUISITION =====

// Track traffic sources
router.post('/traffic-source', async (req, res) => {
  try {
    const {
      sessionId,
      referrer,
      trafficSource,
      isDirect,
      utmParams
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    await updateEnhancedSession(sessionId, {
      referrer,
      traffic_source: trafficSource,
      utm_source: utmParams.utm_source,
      utm_medium: utmParams.utm_medium,
      utm_campaign: utmParams.utm_campaign,
      utm_term: utmParams.utm_term,
      utm_content: utmParams.utm_content
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking traffic source:', error);
    res.status(500).json({ error: 'Failed to track traffic source' });
  }
});

// Track search analytics
router.post('/search', async (req, res) => {
  try {
    const {
      sessionId,
      searchQuery,
      searchType,
      pageUrl,
      searchEngine,
      organic
    } = req.body;

    if (!sessionId || !searchQuery) {
      return res.status(400).json({ error: 'sessionId and searchQuery are required' });
    }

    const sql = `
      INSERT INTO search_analytics (
        session_id, search_query, search_type, page_url, search_engine, organic
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    await db.run(sql, [
      sessionId, searchQuery, searchType, pageUrl, searchEngine || 'internal', organic
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking search:', error);
    res.status(500).json({ error: 'Failed to track search' });
  }
});

// ===== SECURITY & COMPLIANCE =====

// Track security events
router.post('/security-event', async (req, res) => {
  try {
    const {
      sessionId,
      eventType,
      severity,
      ipAddress,
      userAgent,
      eventData,
      actionTaken
    } = req.body;

    if (!sessionId || !eventType) {
      return res.status(400).json({ error: 'sessionId and eventType are required' });
    }

    const sql = `
      INSERT INTO security_events (
        session_id, event_type, severity, ip_address, user_agent, event_data, action_taken
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await db.run(sql, [
      sessionId, eventType, severity, ipAddress, userAgent,
      JSON.stringify(eventData), actionTaken
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking security event:', error);
    res.status(500).json({ error: 'Failed to track security event' });
  }
});

// Track consent
router.post('/consent', async (req, res) => {
  try {
    const {
      sessionId,
      consent,
      timestamp
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    await updateEnhancedSession(sessionId, {
      consent_given: consent
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking consent:', error);
    res.status(500).json({ error: 'Failed to track consent' });
  }
});

// ===== ADVANCED ANALYTICS =====

// Track user segments
router.post('/user-segment', async (req, res) => {
  try {
    const {
      sessionId,
      segment,
      attributes
    } = req.body;

    if (!sessionId || !segment) {
      return res.status(400).json({ error: 'sessionId and segment are required' });
    }

    const sql = `
      INSERT INTO user_segments (
        session_id, segment_name, segment_type, segment_value, custom_attributes
      ) VALUES (?, ?, ?, ?, ?)
    `;

    await db.run(sql, [
      sessionId, segment, 'behavioral', segment, JSON.stringify(attributes)
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking user segment:', error);
    res.status(500).json({ error: 'Failed to track user segment' });
  }
});

// Track feature usage
router.post('/feature-usage', async (req, res) => {
  try {
    const {
      sessionId,
      featureName,
      usageCount,
      firstUsed,
      lastUsed
    } = req.body;

    if (!sessionId || !featureName) {
      return res.status(400).json({ error: 'sessionId and featureName are required' });
    }

    const sql = `
      INSERT OR REPLACE INTO feature_usage (
        session_id, feature_name, usage_count, first_used, last_used
      ) VALUES (?, ?, ?, ?, ?)
    `;

    await db.run(sql, [
      sessionId, featureName, usageCount, new Date(firstUsed), new Date(lastUsed)
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking feature usage:', error);
    res.status(500).json({ error: 'Failed to track feature usage' });
  }
});

// Track churn prediction
router.post('/churn-prediction', async (req, res) => {
  try {
    const {
      sessionId,
      engagementScore,
      churnRisk,
      riskFactors
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const sql = `
      INSERT OR REPLACE INTO churn_prediction (
        session_id, churn_probability, risk_factors, engagement_trend, updated_at
      ) VALUES (?, ?, ?, ?, ?)
    `;

    await db.run(sql, [
      sessionId, engagementScore, JSON.stringify(riskFactors), churnRisk, new Date()
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking churn prediction:', error);
    res.status(500).json({ error: 'Failed to track churn prediction' });
  }
});

// ===== HELPER FUNCTIONS =====

async function updateEnhancedSession(sessionId, data) {
  const existingSession = await db.get(
    'SELECT * FROM enhanced_sessions WHERE session_id = ?',
    [sessionId]
  );

  if (existingSession) {
    // Update existing session
    const updateFields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const updateValues = Object.values(data);
    updateValues.push(sessionId);

    await db.run(`
      UPDATE enhanced_sessions 
      SET ${updateFields}, last_activity = CURRENT_TIMESTAMP
      WHERE session_id = ?
    `, updateValues);
  } else {
    // Create new enhanced session
    const fields = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);

    await db.run(`
      INSERT INTO enhanced_sessions (session_id, ${fields})
      VALUES (?, ${placeholders})
    `, [sessionId, ...values]);
  }
}

module.exports = router;
