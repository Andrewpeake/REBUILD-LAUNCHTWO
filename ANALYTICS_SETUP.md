# Analytics Setup Guide

This guide will help you set up the analytics system for your UAM UCalgary website.

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)
- Your website running locally or on a server

## Quick Setup

### 1. Install Analytics Dependencies

```bash
cd analytics
npm install
```

### 2. Initialize the Database

```bash
npm run init-db
```

This will create the SQLite database with all necessary tables.

### 3. Start the Analytics Server

```bash
# For development (with auto-restart)
npm run dev

# For production
npm start
```

The server will start on `http://localhost:3001`

### 4. Access the Dashboard

Open your browser and go to: `http://localhost:3001/dashboard`

## Configuration

### Update Analytics Endpoint

In your website's `js/analytics.js` file, update the endpoint URL:

```javascript
// For local development
this.analyticsEndpoint = 'http://localhost:3001/api/analytics';

// For production (replace with your server URL)
this.analyticsEndpoint = 'https://your-analytics-server.com/api/analytics';
```

### Production Deployment

1. **Deploy the analytics server** to your hosting provider
2. **Update the CORS origins** in `server.js` to include your website domain
3. **Set up SSL certificate** for secure data transmission
4. **Configure environment variables** for production settings

## What's Being Tracked

### Automatic Tracking
- ✅ Page views and navigation
- ✅ User sessions and duration
- ✅ Device information (type, browser, OS)
- ✅ Performance metrics (load times, Core Web Vitals)
- ✅ Scroll depth and engagement
- ✅ JavaScript errors
- ✅ Mobile menu interactions
- ✅ AAM item interactions
- ✅ Focus layer interactions

### Manual Tracking Available
- Button clicks
- Link clicks
- Form submissions
- Section views
- File downloads
- Custom events

## Dashboard Features

### Overview Tab
- Total visitors, page views, sessions
- Bounce rate and average session duration
- Top pages and device breakdown
- Browser and OS statistics
- Page views timeline

### Page Views Tab
- Detailed page view analytics
- Unique visitors vs total views
- Page performance over time

### Events Tab
- All tracked events and interactions
- Event categories and frequencies
- Custom event data

### Performance Tab
- Core Web Vitals metrics
- Load time averages
- Performance trends

### Errors Tab
- JavaScript error tracking
- Error frequency and types
- Recent error occurrences

## Testing the Setup

1. **Start the analytics server**
2. **Open your website** in a browser
3. **Navigate through different sections**
4. **Check the dashboard** at `http://localhost:3001/dashboard`
5. **Verify data is being collected**

## Troubleshooting

### Common Issues

**CORS Errors**: Update the CORS origins in `server.js` to include your website URL.

**No Data in Dashboard**: 
- Check that the analytics server is running
- Verify the endpoint URL in `analytics.js`
- Check browser console for errors

**Database Errors**: 
- Ensure the database file has proper permissions
- Run `npm run init-db` to recreate the database

**Performance Issues**:
- Monitor server resources
- Check database size and optimize queries
- Consider data retention policies

### Debug Mode

Enable debug logging in `analytics.js`:

```javascript
// Add this line to see analytics data being sent
console.log('Sending analytics data:', data);
```

## Security Considerations

- The system includes rate limiting (1000 requests per 15 minutes per IP)
- CORS protection is configured
- No personally identifiable information is collected by default
- All data is stored locally in SQLite database

## Data Privacy

This analytics system is designed to be privacy-compliant:
- No cookies are used for tracking
- Session IDs are generated locally
- No personal data is collected
- Users can disable analytics by setting `analytics.disable()`

## Next Steps

1. **Monitor the dashboard** regularly to understand user behavior
2. **Set up alerts** for critical errors or performance issues
3. **Customize tracking** by adding more events as needed
4. **Set up data retention** policies for long-term storage
5. **Consider backup strategies** for your analytics data

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the full documentation in `analytics/README.md`
3. Check the browser console for JavaScript errors
4. Verify the analytics server logs

---

**Congratulations!** Your analytics system is now set up and ready to track user behavior on your UAM UCalgary website.

