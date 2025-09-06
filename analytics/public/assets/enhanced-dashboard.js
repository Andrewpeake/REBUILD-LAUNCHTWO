class EnhancedAnalyticsDashboard {
    constructor() {
        this.currentSection = 'overview';
        this.currentPeriod = '7d';
        this.charts = {};
        this.realTimeData = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadData();
        
        // Auto-refresh every 30 seconds
        setInterval(() => {
            this.loadData();
        }, 30000);

        // Real-time updates every 5 seconds
        setInterval(() => {
            this.updateRealTimeData();
        }, 5000);
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.switchSection(section);
            });
        });

        // Time period selector
        document.getElementById('timePeriod').addEventListener('change', (e) => {
            this.currentPeriod = e.target.value;
            this.loadData();
        });
    }

    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.section').forEach(sec => {
            sec.classList.add('hidden');
        });
        document.getElementById(`${section}-section`).classList.remove('hidden');

        // Update title
        const titles = {
            overview: 'Overview',
            traffic: 'Traffic & Engagement',
            audience: 'Audience Insights',
            performance: 'Performance',
            conversions: 'Conversions',
            behavior: 'User Behavior',
            content: 'Content Analytics',
            marketing: 'Marketing',
            security: 'Security',
            advanced: 'AI Insights'
        };
        document.getElementById('sectionTitle').textContent = titles[section];

        this.currentSection = section;
        this.loadData();
    }

    async loadData() {
        try {
            const response = await fetch(`/api/analytics/data?period=${this.currentPeriod}&metric=${this.currentSection}`);
            const data = await response.json();

            switch (this.currentSection) {
                case 'overview':
                    this.updateOverview(data);
                    break;
                case 'traffic':
                    this.updateTrafficData(data);
                    break;
                case 'audience':
                    this.updateAudienceData(data);
                    break;
                case 'performance':
                    this.updatePerformanceData(data);
                    break;
                case 'conversions':
                    this.updateConversionsData(data);
                    break;
                case 'behavior':
                    this.updateBehaviorData(data);
                    break;
                case 'content':
                    this.updateContentData(data);
                    break;
                case 'marketing':
                    this.updateMarketingData(data);
                    break;
                case 'security':
                    this.updateSecurityData(data);
                    break;
                case 'advanced':
                    this.updateAdvancedData(data);
                    break;
            }
        } catch (error) {
            console.error('Error loading analytics data:', error);
        }
    }

    updateOverview(data) {
        // Update metric cards
        document.getElementById('totalVisitors').textContent = data.totalVisitors || 0;
        document.getElementById('totalPageViews').textContent = data.totalPageViews || 0;
        document.getElementById('bounceRate').textContent = data.bounceRate || 0;
        document.getElementById('avgSession').textContent = this.formatDuration(data.avgSessionDuration || 0);

        // Update charts
        this.updateRealtimeChart();
        this.updateTopPagesChart(data.topPages || []);
        this.updateDeviceChart(data.deviceBreakdown || []);
        this.updateBrowserChart(data.browserBreakdown || []);
    }

    updateTrafficData(data) {
        this.updateTrafficSourcesChart(data.trafficSources || []);
        this.updateCTRTable(data.ctrData || []);
        this.updateScrollDepthChart(data.scrollDepth || []);
    }

    updateAudienceData(data) {
        this.updateGeographicChart(data.geographic || []);
        this.updateVisitorTypeChart(data.visitorTypes || []);
        this.updateScreenResolutionChart(data.screenResolutions || []);
    }

    updatePerformanceData(data) {
        const perf = data.performance || {};
        document.getElementById('avgLoadTime').textContent = Math.round(perf.avg_load_time || 0) + 'ms';
        document.getElementById('avgFCP').textContent = Math.round(perf.avg_fcp || 0) + 'ms';
        document.getElementById('avgLCP').textContent = Math.round(perf.avg_lcp || 0) + 'ms';
        
        this.updateWebVitalsChart(data.webVitals || []);
    }

    updateConversionsData(data) {
        this.updateConversionFunnel(data.funnel || []);
        this.updateConversionGoals(data.goals || []);
    }

    updateBehaviorData(data) {
        this.updateHeatmap(data.heatmap || []);
        this.updateFormAnalytics(data.formAnalytics || []);
        this.updateUserJourneyChart(data.userJourney || []);
    }

    updateContentData(data) {
        this.updateContentPerformanceChart(data.contentPerformance || []);
        this.updateExitIntentAnalysis(data.exitIntent || []);
        this.updateMediaEngagementChart(data.mediaEngagement || []);
    }

    updateMarketingData(data) {
        this.updateUTMCampaignChart(data.utmCampaigns || []);
        this.updateSearchKeywords(data.searchKeywords || []);
    }

    updateSecurityData(data) {
        this.updateSecurityEvents(data.securityEvents || []);
        this.updateBotDetectionChart(data.botDetection || []);
        this.updateConsentChart(data.consent || []);
    }

    updateAdvancedData(data) {
        this.updateAIInsights(data.aiInsights || []);
        this.updateUserSegmentationChart(data.userSegments || []);
        this.updateChurnPredictionChart(data.churnPrediction || []);
        this.updateFeatureUsageChart(data.featureUsage || []);
    }

    // ===== CHART UPDATES =====

    updateRealtimeChart() {
        const ctx = document.getElementById('realtimeChart').getContext('2d');
        
        if (this.charts.realtime) {
            this.charts.realtime.destroy();
        }

        // Generate sample real-time data
        const now = new Date();
        const labels = [];
        const visitors = [];
        const pageViews = [];

        for (let i = 23; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 5 * 60000); // Every 5 minutes
            labels.push(time.toLocaleTimeString());
            visitors.push(Math.floor(Math.random() * 20) + 5);
            pageViews.push(Math.floor(Math.random() * 50) + 10);
        }

        this.charts.realtime = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Visitors',
                    data: visitors,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Page Views',
                    data: pageViews,
                    borderColor: '#764ba2',
                    backgroundColor: 'rgba(118, 75, 162, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateTopPagesChart(pages) {
        const ctx = document.getElementById('topPagesChart').getContext('2d');
        
        if (this.charts.topPages) {
            this.charts.topPages.destroy();
        }

        this.charts.topPages = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: pages.map(p => p.page_url.split('/').pop() || 'Home'),
                datasets: [{
                    data: pages.map(p => p.views),
                    backgroundColor: [
                        '#667eea', '#764ba2', '#f093fb', '#f5576c',
                        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateDeviceChart(devices) {
        const ctx = document.getElementById('deviceChart').getContext('2d');
        
        if (this.charts.device) {
            this.charts.device.destroy();
        }

        this.charts.device = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: devices.map(d => d.device_type || 'Unknown'),
                datasets: [{
                    data: devices.map(d => d.count),
                    backgroundColor: ['#667eea', '#764ba2', '#f093fb']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateBrowserChart(browsers) {
        const ctx = document.getElementById('browserChart').getContext('2d');
        
        if (this.charts.browser) {
            this.charts.browser.destroy();
        }

        this.charts.browser = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: browsers.map(b => b.browser || 'Unknown'),
                datasets: [{
                    label: 'Users',
                    data: browsers.map(b => b.count),
                    backgroundColor: '#667eea'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateTrafficSourcesChart(sources) {
        const ctx = document.getElementById('trafficSourcesChart').getContext('2d');
        
        if (this.charts.trafficSources) {
            this.charts.trafficSources.destroy();
        }

        this.charts.trafficSources = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: sources.map(s => s.source || 'Unknown'),
                datasets: [{
                    data: sources.map(s => s.count),
                    backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateCTRTable(ctrData) {
        const tbody = document.getElementById('ctrTableBody');
        tbody.innerHTML = '';

        ctrData.forEach(item => {
            const row = document.createElement('tr');
            row.className = 'border-b';
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.element}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.clicks}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.ctr}%</td>
            `;
            tbody.appendChild(row);
        });
    }

    updateScrollDepthChart(scrollData) {
        const ctx = document.getElementById('scrollDepthChart').getContext('2d');
        
        if (this.charts.scrollDepth) {
            this.charts.scrollDepth.destroy();
        }

        this.charts.scrollDepth = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['0%', '25%', '50%', '75%', '100%'],
                datasets: [{
                    label: 'Users',
                    data: scrollData,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateGeographicChart(geographic) {
        const ctx = document.getElementById('geographicChart').getContext('2d');
        
        if (this.charts.geographic) {
            this.charts.geographic.destroy();
        }

        this.charts.geographic = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: geographic.map(g => g.country || 'Unknown'),
                datasets: [{
                    label: 'Visitors',
                    data: geographic.map(g => g.count),
                    backgroundColor: '#667eea'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateVisitorTypeChart(visitorTypes) {
        const ctx = document.getElementById('visitorTypeChart').getContext('2d');
        
        if (this.charts.visitorType) {
            this.charts.visitorType.destroy();
        }

        this.charts.visitorType = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['New Visitors', 'Returning Visitors'],
                datasets: [{
                    data: [visitorTypes.new || 0, visitorTypes.returning || 0],
                    backgroundColor: ['#667eea', '#764ba2']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateScreenResolutionChart(resolutions) {
        const ctx = document.getElementById('screenResolutionChart').getContext('2d');
        
        if (this.charts.screenResolution) {
            this.charts.screenResolution.destroy();
        }

        this.charts.screenResolution = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: resolutions.map(r => r.resolution || 'Unknown'),
                datasets: [{
                    label: 'Users',
                    data: resolutions.map(r => r.count),
                    backgroundColor: '#667eea'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateWebVitalsChart(webVitals) {
        const ctx = document.getElementById('webVitalsChart').getContext('2d');
        
        if (this.charts.webVitals) {
            this.charts.webVitals.destroy();
        }

        this.charts.webVitals = new Chart(ctx, {
            type: 'line',
            data: {
                labels: webVitals.map(v => v.date),
                datasets: [{
                    label: 'LCP (ms)',
                    data: webVitals.map(v => v.lcp),
                    borderColor: '#f5576c',
                    backgroundColor: 'rgba(245, 87, 108, 0.1)',
                    tension: 0.4
                }, {
                    label: 'FID (ms)',
                    data: webVitals.map(v => v.fid),
                    borderColor: '#4facfe',
                    backgroundColor: 'rgba(79, 172, 254, 0.1)',
                    tension: 0.4
                }, {
                    label: 'CLS',
                    data: webVitals.map(v => v.cls),
                    borderColor: '#43e97b',
                    backgroundColor: 'rgba(67, 233, 123, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateConversionFunnel(funnel) {
        const container = document.getElementById('conversionFunnel');
        container.innerHTML = '';

        funnel.forEach((step, index) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'funnel-step';
            stepDiv.innerHTML = `
                <div class="flex justify-between items-center">
                    <div>
                        <h4 class="font-semibold">${step.name}</h4>
                        <p class="text-sm text-gray-600">${step.description}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-2xl font-bold text-blue-600">${step.visitors}</p>
                        <p class="text-sm text-gray-500">${step.conversionRate}%</p>
                    </div>
                </div>
            `;
            container.appendChild(stepDiv);
        });
    }

    updateConversionGoals(goals) {
        const container = document.getElementById('conversionGoals');
        container.innerHTML = '';

        goals.forEach(goal => {
            const goalDiv = document.createElement('div');
            goalDiv.className = 'conversion-goal';
            goalDiv.innerHTML = `
                <div class="flex justify-between items-center">
                    <div>
                        <h4 class="font-semibold">${goal.name}</h4>
                        <p class="text-sm text-gray-600">${goal.type}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-2xl font-bold text-green-600">${goal.completions}</p>
                        <p class="text-sm text-gray-500">${goal.rate}%</p>
                    </div>
                </div>
            `;
            container.appendChild(goalDiv);
        });
    }

    updateHeatmap(heatmapData) {
        const container = document.getElementById('heatmapContainer');
        container.innerHTML = '';

        // Create a simple heatmap visualization
        heatmapData.forEach(point => {
            const pointDiv = document.createElement('div');
            pointDiv.className = 'heatmap-point';
            pointDiv.style.left = point.x + 'px';
            pointDiv.style.top = point.y + 'px';
            pointDiv.style.width = '10px';
            pointDiv.style.height = '10px';
            pointDiv.style.backgroundColor = `rgba(102, 126, 234, ${point.intensity || 0.5})`;
            pointDiv.title = `Clicks: ${point.clicks}`;
            container.appendChild(pointDiv);
        });
    }

    updateFormAnalytics(formData) {
        const container = document.getElementById('formAnalytics');
        container.innerHTML = '';

        formData.forEach(form => {
            const formDiv = document.createElement('div');
            formDiv.className = 'bg-white p-4 rounded-lg shadow mb-4';
            formDiv.innerHTML = `
                <h4 class="font-semibold mb-2">${form.formName}</h4>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p class="text-gray-600">Submissions:</p>
                        <p class="font-bold">${form.submissions}</p>
                    </div>
                    <div>
                        <p class="text-gray-600">Completion Rate:</p>
                        <p class="font-bold">${form.completionRate}%</p>
                    </div>
                    <div>
                        <p class="text-gray-600">Avg. Time:</p>
                        <p class="font-bold">${form.avgTime}s</p>
                    </div>
                    <div>
                        <p class="text-gray-600">Drop-off:</p>
                        <p class="font-bold">${form.dropOffRate}%</p>
                    </div>
                </div>
            `;
            container.appendChild(formDiv);
        });
    }

    updateUserJourneyChart(journeyData) {
        const ctx = document.getElementById('userJourneyChart').getContext('2d');
        
        if (this.charts.userJourney) {
            this.charts.userJourney.destroy();
        }

        this.charts.userJourney = new Chart(ctx, {
            type: 'line',
            data: {
                labels: journeyData.map(j => j.step),
                datasets: [{
                    label: 'Users',
                    data: journeyData.map(j => j.users),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateContentPerformanceChart(contentData) {
        const ctx = document.getElementById('contentPerformanceChart').getContext('2d');
        
        if (this.charts.contentPerformance) {
            this.charts.contentPerformance.destroy();
        }

        this.charts.contentPerformance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: contentData.map(c => c.page),
                datasets: [{
                    label: 'Engagement Score',
                    data: contentData.map(c => c.engagement),
                    backgroundColor: '#667eea'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateExitIntentAnalysis(exitIntentData) {
        const container = document.getElementById('exitIntentAnalysis');
        container.innerHTML = '';

        exitIntentData.forEach(data => {
            const div = document.createElement('div');
            div.className = 'bg-white p-4 rounded-lg shadow mb-4';
            div.innerHTML = `
                <h4 class="font-semibold mb-2">${data.page}</h4>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p class="text-gray-600">Exit Intent Rate:</p>
                        <p class="font-bold text-red-600">${data.exitIntentRate}%</p>
                    </div>
                    <div>
                        <p class="text-gray-600">Avg. Time on Page:</p>
                        <p class="font-bold">${data.avgTimeOnPage}s</p>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
    }

    updateMediaEngagementChart(mediaData) {
        const ctx = document.getElementById('mediaEngagementChart').getContext('2d');
        
        if (this.charts.mediaEngagement) {
            this.charts.mediaEngagement.destroy();
        }

        this.charts.mediaEngagement = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: mediaData.map(m => m.type),
                datasets: [{
                    data: mediaData.map(m => m.engagement),
                    backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#f5576c']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateUTMCampaignChart(utmData) {
        const ctx = document.getElementById('utmCampaignChart').getContext('2d');
        
        if (this.charts.utmCampaign) {
            this.charts.utmCampaign.destroy();
        }

        this.charts.utmCampaign = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: utmData.map(u => u.campaign),
                datasets: [{
                    label: 'Conversions',
                    data: utmData.map(u => u.conversions),
                    backgroundColor: '#667eea'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateSearchKeywords(keywords) {
        const container = document.getElementById('searchKeywords');
        container.innerHTML = '';

        keywords.forEach(keyword => {
            const div = document.createElement('div');
            div.className = 'bg-white p-4 rounded-lg shadow mb-4';
            div.innerHTML = `
                <div class="flex justify-between items-center">
                    <div>
                        <h4 class="font-semibold">${keyword.query}</h4>
                        <p class="text-sm text-gray-600">${keyword.type}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-2xl font-bold text-blue-600">${keyword.searches}</p>
                        <p class="text-sm text-gray-500">${keyword.clicks} clicks</p>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
    }

    updateSecurityEvents(securityEvents) {
        const container = document.getElementById('securityEvents');
        container.innerHTML = '';

        securityEvents.forEach(event => {
            const div = document.createElement('div');
            div.className = 'security-alert';
            div.innerHTML = `
                <div class="flex justify-between items-center">
                    <div>
                        <h4 class="font-semibold">${event.type}</h4>
                        <p class="text-sm text-gray-600">${event.description}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm text-gray-500">${event.timestamp}</p>
                        <p class="text-sm font-bold text-red-600">${event.severity}</p>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
    }

    updateBotDetectionChart(botData) {
        const ctx = document.getElementById('botDetectionChart').getContext('2d');
        
        if (this.charts.botDetection) {
            this.charts.botDetection.destroy();
        }

        this.charts.botDetection = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Human Traffic', 'Bot Traffic'],
                datasets: [{
                    data: [botData.human || 0, botData.bot || 0],
                    backgroundColor: ['#4caf50', '#f44336']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateConsentChart(consentData) {
        const ctx = document.getElementById('consentChart').getContext('2d');
        
        if (this.charts.consent) {
            this.charts.consent.destroy();
        }

        this.charts.consent = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Consent Given', 'Consent Declined'],
                datasets: [{
                    data: [consentData.accepted || 0, consentData.declined || 0],
                    backgroundColor: ['#4caf50', '#f44336']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateAIInsights(insights) {
        const container = document.getElementById('aiInsights');
        container.innerHTML = '';

        insights.forEach(insight => {
            const div = document.createElement('div');
            div.className = 'ai-insight';
            div.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h4 class="font-semibold">${insight.title}</h4>
                        <p class="text-sm text-gray-600 mb-2">${insight.description}</p>
                        <p class="text-sm font-medium">Recommendation: ${insight.recommendation}</p>
                    </div>
                    <div class="text-right ml-4">
                        <p class="text-sm text-gray-500">Confidence: ${insight.confidence}%</p>
                        <p class="text-sm text-gray-500">Impact: ${insight.impact}</p>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
    }

    updateUserSegmentationChart(segments) {
        const ctx = document.getElementById('userSegmentationChart').getContext('2d');
        
        if (this.charts.userSegmentation) {
            this.charts.userSegmentation.destroy();
        }

        this.charts.userSegmentation = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: segments.map(s => s.segment),
                datasets: [{
                    data: segments.map(s => s.count),
                    backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateChurnPredictionChart(churnData) {
        const ctx = document.getElementById('churnPredictionChart').getContext('2d');
        
        if (this.charts.churnPrediction) {
            this.charts.churnPrediction.destroy();
        }

        this.charts.churnPrediction = new Chart(ctx, {
            type: 'line',
            data: {
                labels: churnData.map(c => c.date),
                datasets: [{
                    label: 'Churn Risk',
                    data: churnData.map(c => c.risk),
                    borderColor: '#f44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    updateFeatureUsageChart(featureData) {
        const ctx = document.getElementById('featureUsageChart').getContext('2d');
        
        if (this.charts.featureUsage) {
            this.charts.featureUsage.destroy();
        }

        this.charts.featureUsage = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: featureData.map(f => f.feature),
                datasets: [{
                    label: 'Usage Count',
                    data: featureData.map(f => f.usage),
                    backgroundColor: '#667eea'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateRealTimeData() {
        // Simulate real-time data updates
        const now = new Date();
        this.realTimeData.push({
            timestamp: now,
            visitors: Math.floor(Math.random() * 10) + 1,
            pageViews: Math.floor(Math.random() * 20) + 5
        });

        // Keep only last 24 data points
        if (this.realTimeData.length > 24) {
            this.realTimeData.shift();
        }

        // Update real-time chart if it exists
        if (this.charts.realtime) {
            this.charts.realtime.data.labels = this.realTimeData.map(d => d.timestamp.toLocaleTimeString());
            this.charts.realtime.data.datasets[0].data = this.realTimeData.map(d => d.visitors);
            this.charts.realtime.data.datasets[1].data = this.realTimeData.map(d => d.pageViews);
            this.charts.realtime.update();
        }
    }

    formatDuration(seconds) {
        if (seconds < 60) return `${Math.round(seconds)}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes}m ${remainingSeconds}s`;
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EnhancedAnalyticsDashboard();
});
