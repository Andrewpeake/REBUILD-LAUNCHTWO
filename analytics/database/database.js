const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = null;
    this.dbPath = path.join(__dirname, 'analytics.db');
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    const tables = [
      // Page views table
      `CREATE TABLE IF NOT EXISTS page_views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        page_url TEXT NOT NULL,
        page_title TEXT,
        referrer TEXT,
        user_agent TEXT,
        ip_address TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        time_on_page INTEGER,
        scroll_depth REAL,
        device_type TEXT,
        browser TEXT,
        os TEXT,
        screen_resolution TEXT,
        viewport_size TEXT
      )`,

      // User sessions table
      `CREATE TABLE IF NOT EXISTS user_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT UNIQUE NOT NULL,
        first_visit DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
        total_page_views INTEGER DEFAULT 1,
        total_time_spent INTEGER DEFAULT 0,
        ip_address TEXT,
        user_agent TEXT,
        device_type TEXT,
        browser TEXT,
        os TEXT,
        country TEXT,
        city TEXT,
        is_bounce BOOLEAN DEFAULT 1,
        entry_page TEXT,
        exit_page TEXT
      )`,

      // Events table
      `CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        event_category TEXT,
        event_action TEXT,
        event_label TEXT,
        event_value REAL,
        page_url TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        custom_data TEXT,
        ip_address TEXT
      )`,

      // Performance metrics table
      `CREATE TABLE IF NOT EXISTS performance_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        page_url TEXT NOT NULL,
        load_time INTEGER,
        dom_content_loaded INTEGER,
        first_contentful_paint INTEGER,
        largest_contentful_paint INTEGER,
        first_input_delay INTEGER,
        cumulative_layout_shift REAL,
        time_to_interactive INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        connection_type TEXT,
        device_memory INTEGER
      )`,

      // Error tracking table
      `CREATE TABLE IF NOT EXISTS errors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        error_type TEXT NOT NULL,
        error_message TEXT,
        error_stack TEXT,
        page_url TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_agent TEXT,
        ip_address TEXT
      )`,

      // Daily summary table for faster queries
      `CREATE TABLE IF NOT EXISTS daily_summary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL,
        total_visitors INTEGER DEFAULT 0,
        total_page_views INTEGER DEFAULT 0,
        total_sessions INTEGER DEFAULT 0,
        bounce_rate REAL DEFAULT 0,
        avg_session_duration INTEGER DEFAULT 0,
        top_pages TEXT,
        top_referrers TEXT,
        device_breakdown TEXT,
        browser_breakdown TEXT,
        country_breakdown TEXT,
        UNIQUE(date)
      )`,

      // Enhanced user sessions with detailed tracking
      `CREATE TABLE IF NOT EXISTS enhanced_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT UNIQUE NOT NULL,
        first_visit DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
        total_page_views INTEGER DEFAULT 1,
        total_time_spent INTEGER DEFAULT 0,
        ip_address TEXT,
        user_agent TEXT,
        device_type TEXT,
        browser TEXT,
        os TEXT,
        country TEXT,
        city TEXT,
        region TEXT,
        language TEXT,
        timezone TEXT,
        screen_resolution TEXT,
        viewport_size TEXT,
        is_bounce BOOLEAN DEFAULT 1,
        is_returning BOOLEAN DEFAULT 0,
        entry_page TEXT,
        exit_page TEXT,
        referrer TEXT,
        traffic_source TEXT,
        campaign_source TEXT,
        campaign_medium TEXT,
        campaign_name TEXT,
        utm_source TEXT,
        utm_medium TEXT,
        utm_campaign TEXT,
        utm_term TEXT,
        utm_content TEXT,
        conversion_goals TEXT,
        revenue REAL DEFAULT 0,
        customer_lifetime_value REAL DEFAULT 0,
        session_quality_score REAL DEFAULT 0,
        engagement_score REAL DEFAULT 0,
        scroll_depth_avg REAL DEFAULT 0,
        click_through_rate REAL DEFAULT 0,
        form_interactions INTEGER DEFAULT 0,
        video_engagement REAL DEFAULT 0,
        social_shares INTEGER DEFAULT 0,
        search_queries TEXT,
        exit_intent_detected BOOLEAN DEFAULT 0,
        bot_detected BOOLEAN DEFAULT 0,
        suspicious_activity BOOLEAN DEFAULT 0,
        consent_given BOOLEAN DEFAULT 0,
        data_export_events INTEGER DEFAULT 0,
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Click tracking for CTR analysis
      `CREATE TABLE IF NOT EXISTS click_tracking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        element_type TEXT NOT NULL,
        element_id TEXT,
        element_class TEXT,
        element_text TEXT,
        page_url TEXT NOT NULL,
        click_x INTEGER,
        click_y INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_cta BOOLEAN DEFAULT 0,
        conversion_goal TEXT,
        custom_data TEXT
      )`,

      // Scroll depth tracking
      `CREATE TABLE IF NOT EXISTS scroll_tracking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        page_url TEXT NOT NULL,
        scroll_depth REAL NOT NULL,
        max_scroll_depth REAL NOT NULL,
        time_to_scroll INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        viewport_height INTEGER,
        page_height INTEGER
      )`,

      // Navigation paths and funnels
      `CREATE TABLE IF NOT EXISTS navigation_paths (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        path_sequence TEXT NOT NULL,
        step_number INTEGER NOT NULL,
        page_url TEXT NOT NULL,
        page_title TEXT,
        time_on_page INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_entry BOOLEAN DEFAULT 0,
        is_exit BOOLEAN DEFAULT 0,
        funnel_name TEXT,
        conversion_step INTEGER
      )`,

      // Form analytics
      `CREATE TABLE IF NOT EXISTS form_analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        form_id TEXT NOT NULL,
        form_name TEXT,
        field_name TEXT,
        field_type TEXT,
        field_value TEXT,
        action_type TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        completion_time INTEGER,
        drop_off_step INTEGER,
        validation_errors TEXT,
        conversion_goal TEXT
      )`,

      // Media engagement tracking
      `CREATE TABLE IF NOT EXISTS media_engagement (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        media_type TEXT NOT NULL,
        media_id TEXT NOT NULL,
        media_url TEXT,
        engagement_type TEXT NOT NULL,
        engagement_value REAL,
        duration INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        page_url TEXT,
        custom_data TEXT
      )`,

      // Search analytics
      `CREATE TABLE IF NOT EXISTS search_analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        search_query TEXT NOT NULL,
        search_type TEXT NOT NULL,
        results_count INTEGER,
        clicked_result INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        page_url TEXT,
        search_engine TEXT,
        organic BOOLEAN DEFAULT 1
      )`,

      // Conversion goals
      `CREATE TABLE IF NOT EXISTS conversion_goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        goal_name TEXT NOT NULL,
        goal_type TEXT NOT NULL,
        goal_value REAL DEFAULT 0,
        conversion_data TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        page_url TEXT,
        funnel_step INTEGER,
        attribution_source TEXT
      )`,

      // Heatmap data
      `CREATE TABLE IF NOT EXISTS heatmap_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        page_url TEXT NOT NULL,
        element_selector TEXT,
        element_type TEXT,
        click_x INTEGER,
        click_y INTEGER,
        hover_duration INTEGER,
        scroll_position INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        viewport_width INTEGER,
        viewport_height INTEGER,
        device_type TEXT
      )`,

      // Security and compliance
      `CREATE TABLE IF NOT EXISTS security_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        event_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        event_data TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolved BOOLEAN DEFAULT 0,
        action_taken TEXT
      )`,

      // User segments
      `CREATE TABLE IF NOT EXISTS user_segments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        segment_name TEXT NOT NULL,
        segment_type TEXT NOT NULL,
        segment_value TEXT,
        confidence_score REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        custom_attributes TEXT
      )`,

      // Feature usage tracking
      `CREATE TABLE IF NOT EXISTS feature_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        feature_name TEXT NOT NULL,
        feature_category TEXT,
        usage_count INTEGER DEFAULT 1,
        first_used DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_used DATETIME DEFAULT CURRENT_TIMESTAMP,
        total_time_spent INTEGER DEFAULT 0,
        success_rate REAL DEFAULT 1.0,
        custom_metrics TEXT
      )`,

      // Churn prediction data
      `CREATE TABLE IF NOT EXISTS churn_prediction (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        churn_probability REAL NOT NULL,
        risk_factors TEXT,
        last_activity DATETIME,
        days_since_last_visit INTEGER,
        engagement_trend TEXT,
        predicted_churn_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // AI insights and recommendations
      `CREATE TABLE IF NOT EXISTS ai_insights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        insight_type TEXT NOT NULL,
        insight_category TEXT NOT NULL,
        insight_data TEXT NOT NULL,
        confidence_score REAL,
        impact_score REAL,
        recommendation TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        applied BOOLEAN DEFAULT 0,
        custom_attributes TEXT
      )`,

      // Users table for authentication
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        email TEXT,
        role TEXT DEFAULT 'admin',
        is_active BOOLEAN DEFAULT 1,
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // User sessions for tracking active sessions
      `CREATE TABLE IF NOT EXISTS auth_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        session_token TEXT UNIQUE NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`
    ];

    for (const table of tables) {
      await this.run(table);
    }

    // Create indexes for better performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id)',
      'CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON page_views(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_page_views_page_url ON page_views(page_url)',
      'CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id)',
      'CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type)',
      'CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON user_sessions(session_id)',
      'CREATE INDEX IF NOT EXISTS idx_sessions_first_visit ON user_sessions(first_visit)',
      'CREATE INDEX IF NOT EXISTS idx_performance_session_id ON performance_metrics(session_id)',
      'CREATE INDEX IF NOT EXISTS idx_errors_timestamp ON errors(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_daily_summary_date ON daily_summary(date)'
    ];

    for (const index of indexes) {
      await this.run(index);
    }
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // User management methods
  async createUser(username, passwordHash, email = null, role = 'admin') {
    const sql = `
      INSERT INTO users (username, password_hash, email, role)
      VALUES (?, ?, ?, ?)
    `;
    return this.run(sql, [username, passwordHash, email, role]);
  }

  async getUserByUsername(username) {
    const sql = 'SELECT * FROM users WHERE username = ? AND is_active = 1';
    return this.get(sql, [username]);
  }

  async getUserById(id) {
    const sql = 'SELECT * FROM users WHERE id = ? AND is_active = 1';
    return this.get(sql, [id]);
  }

  async updateLastLogin(userId) {
    const sql = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
    return this.run(sql, [userId]);
  }

  async createAuthSession(userId, sessionToken, ipAddress, userAgent, expiresAt) {
    const sql = `
      INSERT INTO auth_sessions (user_id, session_token, ip_address, user_agent, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `;
    return this.run(sql, [userId, sessionToken, ipAddress, userAgent, expiresAt]);
  }

  async getAuthSession(sessionToken) {
    const sql = `
      SELECT s.*, u.username, u.role 
      FROM auth_sessions s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.session_token = ? AND s.is_active = 1 AND s.expires_at > CURRENT_TIMESTAMP
    `;
    return this.get(sql, [sessionToken]);
  }

  async deactivateAuthSession(sessionToken) {
    const sql = 'UPDATE auth_sessions SET is_active = 0 WHERE session_token = ?';
    return this.run(sql, [sessionToken]);
  }

  async deactivateAllUserSessions(userId) {
    const sql = 'UPDATE auth_sessions SET is_active = 0 WHERE user_id = ?';
    return this.run(sql, [userId]);
  }

  async cleanupExpiredSessions() {
    const sql = 'UPDATE auth_sessions SET is_active = 0 WHERE expires_at < CURRENT_TIMESTAMP';
    return this.run(sql);
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('Database connection closed');
        }
      });
    }
  }
}

module.exports = Database;

