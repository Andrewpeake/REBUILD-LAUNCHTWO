# 🚀 UAM UCalgary Analytics Integration Guide

## ✅ **Your Analytics System is Ready!**

Your UAM UCalgary website now has comprehensive analytics tracking that will send data to your dashboard when visitors interact with your site.

## 📊 **Current Status**

- ✅ **Analytics Server**: Running on `http://10.0.0.124:3001`
- ✅ **Dashboard**: Available at `http://10.0.0.124:3001/dashboard`
- ✅ **UAM Website**: Running on `http://10.0.0.124:8080`
- ✅ **Analytics Script**: Integrated and tracking data

## 🎯 **What's Being Tracked**

### **Core Metrics**
- **Page Views**: Every visit to your UAM website
- **Unique Visitors**: New vs returning visitors
- **Session Duration**: How long people stay on your site
- **Bounce Rate**: Single-page visits
- **Device Information**: Mobile, desktop, tablet, browser, OS

### **UAM-Specific Interactions**
- **Navigation Clicks**: All menu and navigation interactions
- **AAM Item Clicks**: Advanced Air Mobility content interactions
- **Focus Layer Interactions**: Your focus section interactions
- **Team Member Clicks**: Bio and team member interactions
- **Partnership Clicks**: Partnership and collaboration links

### **User Behavior**
- **Scroll Depth**: How far users scroll on each page
- **Click Tracking**: Every button, link, and interactive element
- **Form Interactions**: Contact forms and submissions
- **Media Engagement**: Video and image interactions
- **Navigation Paths**: User journey through your site

### **Performance Metrics**
- **Page Load Times**: How fast your pages load
- **Core Web Vitals**: LCP, CLS, FID metrics
- **Error Tracking**: JavaScript errors and issues
- **Mobile Performance**: Mobile-specific metrics

## 📱 **Testing from Your Phone**

1. **Open your phone's browser**
2. **Go to**: `http://10.0.0.124:8080/index.html`
3. **Interact with your UAM website**:
   - Click navigation links
   - Scroll through sections
   - Click on AAM items
   - Interact with focus layers
   - Click team member links
4. **Open the dashboard**: `http://10.0.0.124:3001/dashboard`
5. **Watch real-time data appear!**

## 🌐 **For Production Deployment**

When you deploy your UAM website live (uamu site), you have two options:

### **Option 1: Keep Current Setup (Recommended)**
Your analytics script is already integrated. Just make sure your production server can access the analytics server at `http://10.0.0.124:3001`.

### **Option 2: Deploy Analytics Server**
If you want to deploy the analytics server to a production environment:

1. **Deploy the analytics server** to your hosting provider
2. **Update the script URL** in your website:
   ```html
   <!-- Change this line in your index.html -->
   <script src="https://your-analytics-server.com/uam-analytics.js"></script>
   ```

## 🔧 **Integration Code**

The analytics is integrated with this single line in your `index.html`:

```html
<!-- UAM Analytics Tracking -->
<script src="http://10.0.0.124:3001/uam-analytics.js"></script>
```

## 📈 **Dashboard Features**

Your analytics dashboard includes:

- **📊 Overview**: Key metrics and real-time activity
- **👥 Traffic & Engagement**: Page views, clicks, scroll depth
- **🌍 Audience Insights**: Device types, locations, visitor types
- **⚡ Performance**: Load times and Core Web Vitals
- **🎯 Conversions**: Goals and conversion funnels
- **🖱️ User Behavior**: Heatmaps, user journeys, form analytics
- **📄 Content Analytics**: Top pages, exit intent, media engagement
- **📢 Marketing**: Traffic sources, UTM campaigns, search keywords
- **🛡️ Security**: Bot detection, suspicious activity
- **🧠 AI Insights**: User segmentation, churn prediction, recommendations

## 🚀 **Next Steps**

1. **Test the integration** by visiting your UAM website from your phone
2. **Check the dashboard** to see the data appearing in real-time
3. **Share the dashboard** with your team to monitor website performance
4. **Set up alerts** for important metrics (optional)
5. **Deploy to production** when ready

## 📞 **Support**

If you need help with the analytics system:

1. **Check the dashboard** for real-time data
2. **Review the logs** in the terminal where the server is running
3. **Test the integration** using the test page: `http://10.0.0.124:8080/test-analytics.html`

## 🎉 **You're All Set!**

Your UAM UCalgary website now has enterprise-level analytics tracking. Every visitor interaction will be captured and displayed in your beautiful, real-time dashboard.

**Happy analyzing!** 📊✨
