class AnalyticsDashboard {
    constructor() {
        this.currentSection = 'overview';
        this.currentPeriod = '7d';
        this.charts = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadData();
        
        // Auto-refresh every 30 seconds
        setInterval(() => {
            this.loadData();
        }, 30000);
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
            pageviews: 'Page Views',
            events: 'Events',
            performance: 'Performance',
            errors: 'Errors'
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
                case 'pageviews':
                    this.updatePageViews(data);
                    break;
                case 'events':
                    this.updateEvents(data);
                    break;
                case 'performance':
                    this.updatePerformance(data);
                    break;
                case 'errors':
                    this.updateErrors(data);
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
        this.updateTopPagesChart(data.topPages || []);
        this.updateDeviceChart(data.deviceBreakdown || []);
        this.updateBrowserChart(data.browserBreakdown || []);
        this.updatePageViewsChart(data.pageViews || []);
    }

    updatePageViews(data) {
        this.updatePageViewsTimelineChart(data.pageViews || []);
    }

    updateEvents(data) {
        this.updateEventsTable(data.events || []);
    }

    updatePerformance(data) {
        const perf = data.performance || {};
        document.getElementById('avgLoadTime').textContent = Math.round(perf.avg_load_time || 0) + 'ms';
        document.getElementById('avgFCP').textContent = Math.round(perf.avg_fcp || 0) + 'ms';
        document.getElementById('avgLCP').textContent = Math.round(perf.avg_lcp || 0) + 'ms';
    }

    updateErrors(data) {
        this.updateErrorsTable(data.errors || []);
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

    updatePageViewsChart(pageViews) {
        const ctx = document.getElementById('pageViewsChart').getContext('2d');
        
        if (this.charts.pageViews) {
            this.charts.pageViews.destroy();
        }

        this.charts.pageViews = new Chart(ctx, {
            type: 'line',
            data: {
                labels: pageViews.map(pv => new Date(pv.date).toLocaleDateString()),
                datasets: [{
                    label: 'Page Views',
                    data: pageViews.map(pv => pv.views),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Unique Visitors',
                    data: pageViews.map(pv => pv.unique_visitors),
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

    updatePageViewsTimelineChart(pageViews) {
        const ctx = document.getElementById('pageViewsTimelineChart').getContext('2d');
        
        if (this.charts.pageViewsTimeline) {
            this.charts.pageViewsTimeline.destroy();
        }

        this.charts.pageViewsTimeline = new Chart(ctx, {
            type: 'line',
            data: {
                labels: pageViews.map(pv => new Date(pv.date).toLocaleDateString()),
                datasets: [{
                    label: 'Page Views',
                    data: pageViews.map(pv => pv.views),
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

    updateEventsTable(events) {
        const tbody = document.getElementById('eventsTableBody');
        tbody.innerHTML = '';

        events.forEach(event => {
            const row = document.createElement('tr');
            row.className = 'border-b';
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${event.event_type}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${event.event_category || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${event.event_action || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${event.count}</td>
            `;
            tbody.appendChild(row);
        });
    }

    updateErrorsTable(errors) {
        const tbody = document.getElementById('errorsTableBody');
        tbody.innerHTML = '';

        errors.forEach(error => {
            const row = document.createElement('tr');
            row.className = 'border-b';
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${error.error_type}</td>
                <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">${error.error_message}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${error.count}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(error.last_occurrence).toLocaleString()}</td>
            `;
            tbody.appendChild(row);
        });
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
    new AnalyticsDashboard();
});

