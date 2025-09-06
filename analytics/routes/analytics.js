const express = require('express');
const router = express.Router();
const Database = require('../database/database');

// Initialize database connection
const db = new Database();
db.init().catch(console.error);

// Track page view
router.post('/pageview', async (req, res) => {
  try {
    const {
      sessionId,
      pageUrl,
      pageTitle,
      referrer,
      userAgent,
      ipAddress,
      timeOnPage,
      scrollDepth,
      deviceType,
      browser,
      os,
      screenResolution,
      viewportSize
    } = req.body;

    // Validate required fields
    if (!sessionId || !pageUrl) {
      return res.status(400).json({ error: 'sessionId and pageUrl are required' });
    }

    const sql = `
      INSERT INTO page_views (
        session_id, page_url, page_title, referrer, user_agent, ip_address,
        time_on_page, scroll_depth, device_type, browser, os, screen_resolution, viewport_size
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.run(sql, [
      sessionId, pageUrl, pageTitle, referrer, userAgent, ipAddress,
      timeOnPage, scrollDepth, deviceType, browser, os, screenResolution, viewportSize
    ]);

    // Update or create session
    await updateSession(sessionId, pageUrl, ipAddress, userAgent, deviceType, browser, os);

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking page view:', error);
    res.status(500).json({ error: 'Failed to track page view' });
  }
});

// Track event
router.post('/event', async (req, res) => {
  try {
    const {
      sessionId,
      eventType,
      eventCategory,
      eventAction,
      eventLabel,
      eventValue,
      pageUrl,
      customData,
      ipAddress
    } = req.body;

    if (!sessionId || !eventType) {
      return res.status(400).json({ error: 'sessionId and eventType are required' });
    }

    const sql = `
      INSERT INTO events (
        session_id, event_type, event_category, event_action, event_label,
        event_value, page_url, custom_data, ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.run(sql, [
      sessionId, eventType, eventCategory, eventAction, eventLabel,
      eventValue, pageUrl, JSON.stringify(customData), ipAddress
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

// Track performance metrics
router.post('/performance', async (req, res) => {
  try {
    const {
      sessionId,
      pageUrl,
      loadTime,
      domContentLoaded,
      firstContentfulPaint,
      largestContentfulPaint,
      firstInputDelay,
      cumulativeLayoutShift,
      timeToInteractive,
      connectionType,
      deviceMemory
    } = req.body;

    if (!sessionId || !pageUrl) {
      return res.status(400).json({ error: 'sessionId and pageUrl are required' });
    }

    const sql = `
      INSERT INTO performance_metrics (
        session_id, page_url, load_time, dom_content_loaded, first_contentful_paint,
        largest_contentful_paint, first_input_delay, cumulative_layout_shift,
        time_to_interactive, connection_type, device_memory
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.run(sql, [
      sessionId, pageUrl, loadTime, domContentLoaded, firstContentfulPaint,
      largestContentfulPaint, firstInputDelay, cumulativeLayoutShift,
      timeToInteractive, connectionType, deviceMemory
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking performance:', error);
    res.status(500).json({ error: 'Failed to track performance metrics' });
  }
});

// Track error
router.post('/error', async (req, res) => {
  try {
    const {
      sessionId,
      errorType,
      errorMessage,
      errorStack,
      pageUrl,
      userAgent,
      ipAddress
    } = req.body;

    if (!errorType || !errorMessage) {
      return res.status(400).json({ error: 'errorType and errorMessage are required' });
    }

    const sql = `
      INSERT INTO errors (
        session_id, error_type, error_message, error_stack, page_url, user_agent, ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await db.run(sql, [
      sessionId, errorType, errorMessage, errorStack, pageUrl, userAgent, ipAddress
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking error:', error);
    res.status(500).json({ error: 'Failed to track error' });
  }
});

// Get analytics data
router.get('/data', async (req, res) => {
  try {
    const { period = '7d', metric = 'overview' } = req.query;
    
    let data = {};
    
    switch (metric) {
      case 'overview':
        data = await getOverviewData(period);
        break;
      case 'pageviews':
        data = await getPageViewData(period);
        break;
      case 'events':
        data = await getEventData(period);
        break;
      case 'performance':
        data = await getPerformanceData(period);
        break;
      case 'errors':
        data = await getErrorData(period);
        break;
      default:
        return res.status(400).json({ error: 'Invalid metric type' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Helper functions
async function updateSession(sessionId, pageUrl, ipAddress, userAgent, deviceType, browser, os) {
  const existingSession = await db.get(
    'SELECT * FROM user_sessions WHERE session_id = ?',
    [sessionId]
  );

  if (existingSession) {
    // Update existing session
    await db.run(`
      UPDATE user_sessions 
      SET last_activity = CURRENT_TIMESTAMP,
          total_page_views = total_page_views + 1,
          is_bounce = 0,
          exit_page = ?
      WHERE session_id = ?
    `, [pageUrl, sessionId]);
  } else {
    // Create new session
    await db.run(`
      INSERT INTO user_sessions (
        session_id, ip_address, user_agent, device_type, browser, os, entry_page, exit_page
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [sessionId, ipAddress, userAgent, deviceType, browser, os, pageUrl, pageUrl]);
  }
}

async function getOverviewData(period) {
  const days = getDaysFromPeriod(period);
  
  const [
    totalVisitors,
    totalPageViews,
    totalSessions,
    bounceRate,
    avgSessionDuration,
    topPages,
    deviceBreakdown,
    browserBreakdown
  ] = await Promise.all([
    db.get('SELECT COUNT(DISTINCT session_id) as count FROM user_sessions WHERE first_visit >= datetime("now", "-' + days + ' days")'),
    db.get('SELECT COUNT(*) as count FROM page_views WHERE timestamp >= datetime("now", "-' + days + ' days")'),
    db.get('SELECT COUNT(*) as count FROM user_sessions WHERE first_visit >= datetime("now", "-' + days + ' days")'),
    db.get('SELECT AVG(CASE WHEN total_page_views = 1 THEN 1.0 ELSE 0.0 END) as rate FROM user_sessions WHERE first_visit >= datetime("now", "-' + days + ' days")'),
    db.get('SELECT AVG(total_time_spent) as avg FROM user_sessions WHERE first_visit >= datetime("now", "-' + days + ' days")'),
    db.all('SELECT page_url, COUNT(*) as views FROM page_views WHERE timestamp >= datetime("now", "-' + days + ' days") GROUP BY page_url ORDER BY views DESC LIMIT 10'),
    db.all('SELECT device_type, COUNT(*) as count FROM user_sessions WHERE first_visit >= datetime("now", "-' + days + ' days") GROUP BY device_type'),
    db.all('SELECT browser, COUNT(*) as count FROM user_sessions WHERE first_visit >= datetime("now", "-' + days + ' days") GROUP BY browser')
  ]);

  return {
    totalVisitors: totalVisitors.count,
    totalPageViews: totalPageViews.count,
    totalSessions: totalSessions.count,
    bounceRate: Math.round((bounceRate.rate || 0) * 100),
    avgSessionDuration: Math.round(avgSessionDuration.avg || 0),
    topPages,
    deviceBreakdown,
    browserBreakdown
  };
}

async function getPageViewData(period) {
  const days = getDaysFromPeriod(period);
  
  const pageViews = await db.all(`
    SELECT 
      DATE(timestamp) as date,
      COUNT(*) as views,
      COUNT(DISTINCT session_id) as unique_visitors
    FROM page_views 
    WHERE timestamp >= datetime("now", "-${days} days")
    GROUP BY DATE(timestamp)
    ORDER BY date DESC
  `);

  return { pageViews };
}

async function getEventData(period) {
  const days = getDaysFromPeriod(period);
  
  const events = await db.all(`
    SELECT 
      event_type,
      event_category,
      event_action,
      COUNT(*) as count
    FROM events 
    WHERE timestamp >= datetime("now", "-${days} days")
    GROUP BY event_type, event_category, event_action
    ORDER BY count DESC
  `);

  return { events };
}

async function getPerformanceData(period) {
  const days = getDaysFromPeriod(period);
  
  const performance = await db.get(`
    SELECT 
      AVG(load_time) as avg_load_time,
      AVG(dom_content_loaded) as avg_dom_loaded,
      AVG(first_contentful_paint) as avg_fcp,
      AVG(largest_contentful_paint) as avg_lcp,
      AVG(first_input_delay) as avg_fid,
      AVG(cumulative_layout_shift) as avg_cls,
      AVG(time_to_interactive) as avg_tti
    FROM performance_metrics 
    WHERE timestamp >= datetime("now", "-${days} days")
  `);

  return { performance };
}

async function getErrorData(period) {
  const days = getDaysFromPeriod(period);
  
  const errors = await db.all(`
    SELECT 
      error_type,
      error_message,
      COUNT(*) as count,
      MAX(timestamp) as last_occurrence
    FROM errors 
    WHERE timestamp >= datetime("now", "-${days} days")
    GROUP BY error_type, error_message
    ORDER BY count DESC
  `);

  return { errors };
}

function getDaysFromPeriod(period) {
  const periodMap = {
    '1d': 1,
    '7d': 7,
    '30d': 30,
    '90d': 90
  };
  return periodMap[period] || 7;
}

module.exports = router;

