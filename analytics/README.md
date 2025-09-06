# UAM Analytics System

A comprehensive analytics solution for the UAM UCalgary website that tracks user behavior, performance metrics, and site interactions.

## Features

- **Page View Tracking**: Automatic tracking of page views with detailed metadata
- **Event Tracking**: Custom event tracking for user interactions
- **Performance Monitoring**: Core Web Vitals and performance metrics
- **Error Tracking**: JavaScript error monitoring and reporting
- **Real-time Dashboard**: Beautiful, responsive analytics dashboard
- **Session Management**: User session tracking and analysis
- **Device Analytics**: Device type, browser, and OS breakdown
- **Scroll Tracking**: Scroll depth and engagement metrics

## Architecture

```
analytics/
├── server.js                 # Main Express server
├── package.json             # Dependencies and scripts
├── database/
│   └── database.js          # SQLite database management
├── routes/
│   ├── analytics.js         # Analytics API endpoints
│   └── dashboard.js         # Dashboard serving
├── public/
│   ├── dashboard.html       # Analytics dashboard UI
│   └── assets/
│       └── dashboard.js     # Dashboard JavaScript
└── README.md               # This file
```

## Quick Start

### 1. Install Dependencies

```bash
cd analytics
npm install
```

### 2. Start the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The analytics server will start on `http://localhost:3001`

### 3. Access the Dashboard

Visit `http://localhost:3001/dashboard` to view your analytics data.

## API Endpoints

### Track Page View
```http
POST /api/analytics/pageview
Content-Type: application/json

{
  "sessionId": "session_123",
  "pageUrl": "https://example.com/page",
  "pageTitle": "Page Title",
  "referrer": "https://google.com",
  "userAgent": "Mozilla/5.0...",
  "timeOnPage": 30000,
  "scrollDepth": 75.5,
  "deviceType": "desktop",
  "browser": "Chrome",
  "os": "Windows"
}
```

### Track Event
```http
POST /api/analytics/event
Content-Type: application/json

{
  "sessionId": "session_123",
  "eventType": "button_click",
  "eventCategory": "engagement",
  "eventAction": "click",
  "eventLabel": "cta_button",
  "eventValue": 1,
  "customData": {"buttonId": "hero-cta"}
}
```

### Track Performance
```http
POST /api/analytics/performance
Content-Type: application/json

{
  "sessionId": "session_123",
  "pageUrl": "https://example.com/page",
  "loadTime": 1500,
  "domContentLoaded": 800,
  "firstContentfulPaint": 1200,
  "largestContentfulPaint": 2000,
  "firstInputDelay": 50,
  "cumulativeLayoutShift": 0.1,
  "timeToInteractive": 2500
}
```

### Track Error
```http
POST /api/analytics/error
Content-Type: application/json

{
  "sessionId": "session_123",
  "errorType": "javascript_error",
  "errorMessage": "Cannot read property 'x' of undefined",
  "errorStack": "TypeError: Cannot read property...",
  "pageUrl": "https://example.com/page"
}
```

### Get Analytics Data
```http
GET /api/analytics/data?period=7d&metric=overview
```

Parameters:
- `period`: `1d`, `7d`, `30d`, `90d`
- `metric`: `overview`, `pageviews`, `events`, `performance`, `errors`

## Frontend Integration

The analytics system is automatically integrated into your website. The `analytics.js` module provides:

### Automatic Tracking
- Page views on load
- Performance metrics
- Scroll depth
- JavaScript errors
- Session management

### Manual Event Tracking
```javascript
// Track button clicks
analytics.trackButtonClick('hero-cta', 'Get Started');

// Track link clicks
analytics.trackLinkClick('https://example.com', 'External Link');

// Track form submissions
analytics.trackFormSubmit('contact-form', { fields: ['name', 'email'] });

// Track section views
analytics.trackSectionView('about-section');

// Track downloads
analytics.trackDownload('brochure.pdf', 'pdf');

// Custom events
analytics.trackEvent('video_play', 'media', 'play', 'intro_video', 1, {
  videoId: 'intro-video',
  duration: 120
});
```

## Database Schema

### Tables

1. **page_views**: Individual page view records
2. **user_sessions**: User session data
3. **events**: Custom event tracking
4. **performance_metrics**: Performance data
5. **errors**: Error tracking
6. **daily_summary**: Aggregated daily data

### Key Fields

- **Session Management**: Unique session IDs, session duration, bounce rate
- **Device Analytics**: Device type, browser, OS, screen resolution
- **Performance**: Load times, Core Web Vitals, connection type
- **Engagement**: Scroll depth, time on page, interaction events

## Dashboard Features

### Overview Section
- Total visitors, page views, sessions
- Bounce rate and average session duration
- Top pages, device breakdown, browser stats
- Page views over time chart

### Page Views Section
- Detailed page view timeline
- Unique visitors vs total views
- Page performance metrics

### Events Section
- Event tracking table
- Event categories and actions
- Custom event data

### Performance Section
- Core Web Vitals metrics
- Load time averages
- Performance trends

### Errors Section
- Error tracking table
- Error frequency and types
- Recent error occurrences

## Configuration

### Environment Variables

```bash
# Server configuration
PORT=3001
NODE_ENV=production

# CORS origins (comma-separated)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Analytics Configuration

Update the analytics endpoint in `js/analytics.js`:

```javascript
// For production
this.analyticsEndpoint = 'https://your-analytics-server.com/api/analytics';

// For development
this.analyticsEndpoint = 'http://localhost:3001/api/analytics';
```

## Security Features

- **Rate Limiting**: 1000 requests per 15 minutes per IP
- **CORS Protection**: Configurable origin restrictions
- **Helmet Security**: Security headers and protection
- **Input Validation**: Request data validation
- **Error Handling**: Graceful error handling and logging

## Performance Optimizations

- **Compression**: Gzip compression for responses
- **Database Indexing**: Optimized database queries
- **Caching**: Efficient data retrieval
- **Batch Processing**: Optimized data insertion
- **Retry Logic**: Failed request retry with exponential backoff

## Monitoring and Maintenance

### Health Check
```http
GET /health
```

### Database Maintenance
```bash
# Initialize database (first run)
npm run init-db

# Database file location
analytics/database/analytics.db
```

### Logs
- Server logs via Morgan
- Error tracking in database
- Performance monitoring

## Deployment

### Production Setup

1. **Server Deployment**:
   ```bash
   # Install dependencies
   npm install --production
   
   # Start server
   npm start
   ```

2. **Process Management** (PM2):
   ```bash
   npm install -g pm2
   pm2 start server.js --name "uam-analytics"
   pm2 startup
   pm2 save
   ```

3. **Reverse Proxy** (Nginx):
   ```nginx
   location /analytics/ {
       proxy_pass http://localhost:3001/;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
   }
   ```

4. **SSL Certificate**: Use Let's Encrypt or your SSL provider

### Environment Configuration

```bash
# Production environment
NODE_ENV=production
PORT=3001
CORS_ORIGINS=https://yourdomain.com
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Update CORS origins in server configuration
2. **Database Errors**: Check file permissions for SQLite database
3. **Performance Issues**: Monitor server resources and database size
4. **Missing Data**: Check network connectivity and API endpoints

### Debug Mode

Enable debug logging:
```javascript
// In analytics.js
console.log('Analytics data:', data);
```

### Database Queries

Access database directly:
```bash
sqlite3 analytics/database/analytics.db
.tables
SELECT * FROM page_views LIMIT 10;
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section

---

**Note**: This analytics system is designed to be privacy-compliant and GDPR-friendly. No personally identifiable information is collected by default.

