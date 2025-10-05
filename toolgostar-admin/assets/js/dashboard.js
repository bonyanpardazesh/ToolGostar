document.addEventListener("DOMContentLoaded", function () {
    const dashboardContent = document.getElementById('dashboard-content');

    // Wait for i18n system to be ready before rendering
    const waitForI18n = () => {
        return new Promise((resolve) => {
            if (window.adminI18n && window.adminI18n.initialized) {
                resolve();
            } else {
                setTimeout(() => waitForI18n().then(resolve), 100);
            }
        });
    };

    const renderDashboard = (data) => {
        const systemStatusColor = data.systemStatus === 'online' ? 'success' : 'danger';
        const systemStatusIcon = data.systemStatus === 'online' ? 'bi-check-circle' : 'bi-x-circle';
        
        dashboardContent.innerHTML = `
            <div class="row">
                <div class="col-md-3 mb-3">
                    <div class="card bg-primary text-white h-100">
                        <div class="card-body py-5">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h3 class="mb-0">${data.totalProducts}</h3>
                                    <p class="mb-0" data-i18n="dashboard.stats.products">Products</p>
                                </div>
                                <i class="bi bi-box-seam fs-1 opacity-75"></i>
                            </div>
                        </div>
                        <div class="card-footer d-flex align-items-center" onclick="window.location.href='pages/products.html'">
                            <span data-i18n="dashboard.actions.viewDetails">View Details</span>
                            <span class="ms-auto">
                                <i class="bi bi-chevron-right"></i>
                            </span>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card bg-warning text-white h-100">
                        <div class="card-body py-5">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h3 class="mb-0">${data.totalProjects}</h3>
                                    <p class="mb-0" data-i18n="dashboard.stats.projects">Projects</p>
                                </div>
                                <i class="bi bi-building fs-1 opacity-75"></i>
                            </div>
                        </div>
                        <div class="card-footer d-flex align-items-center" onclick="window.location.href='pages/projects.html'">
                            <span data-i18n="dashboard.actions.viewDetails">View Details</span>
                            <span class="ms-auto">
                                <i class="bi bi-chevron-right"></i>
                            </span>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card bg-success text-white h-100">
                        <div class="card-body py-5">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h3 class="mb-0">${data.newContacts}</h3>
                                    <p class="mb-0" data-i18n="dashboard.stats.newContacts">New Contacts</p>
                                </div>
                                <i class="bi bi-envelope-paper fs-1 opacity-75"></i>
                            </div>
                        </div>
                        <div class="card-footer d-flex align-items-center" onclick="window.location.href='pages/contacts.html'">
                            <span data-i18n="dashboard.actions.viewDetails">View Details</span>
                            <span class="ms-auto">
                                <i class="bi bi-chevron-right"></i>
                            </span>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card bg-danger text-white h-100">
                        <div class="card-body py-5">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h3 class="mb-0">${data.pendingQuotes}</h3>
                                    <p class="mb-0" data-i18n="dashboard.stats.pendingQuotes">Pending Quotes</p>
                                </div>
                                <i class="bi bi-file-earmark-text fs-1 opacity-75"></i>
                            </div>
                        </div>
                        <div class="card-footer d-flex align-items-center" onclick="window.location.href='pages/quotes.html'">
                            <span data-i18n="dashboard.actions.viewDetails">View Details</span>
                            <span class="ms-auto">
                                <i class="bi bi-chevron-right"></i>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- System Status Card -->
            <div class="row mt-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0" data-i18n="dashboard.systemStatus.title">System Status</h5>
                            <span class="badge bg-${systemStatusColor}">
                                <i class="bi ${systemStatusIcon} me-1"></i>
                                ${data.systemStatus.toUpperCase()}
                            </span>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <p class="mb-1"><strong data-i18n="dashboard.systemStatus.lastUpdated">Last Updated:</strong> ${new Date(data.lastUpdated).toLocaleString()}</p>
                                    <p class="mb-0"><strong data-i18n="dashboard.systemStatus.backendStatus">Backend Status:</strong> 
                                        <span class="badge bg-${systemStatusColor}">${data.systemStatus}</span>
                                    </p>
                                </div>
                                <div class="col-md-6 text-end">
                                    <button class="btn btn-outline-primary btn-sm" onclick="refreshDashboard()">
                                        <i class="bi bi-arrow-clockwise me-1"></i><span data-i18n="dashboard.actions.refreshData">Refresh Data</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Apply translations to the newly rendered content with multiple attempts
        if (window.adminI18n) {
            window.adminI18n.refresh();
            // Force refresh again after a short delay to ensure translations are applied
            setTimeout(() => {
                if (window.adminI18n) {
                    window.adminI18n.refresh();
                }
            }, 100);
            // Additional refresh after longer delay for dynamic content
            setTimeout(() => {
                if (window.adminI18n) {
                    window.adminI18n.refresh();
                }
            }, 500);
        }
    };

    const renderLoading = () => {
        dashboardContent.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body text-center py-5">
                            <div class="spinner-border text-primary mb-3" role="status">
                                <span class="visually-hidden" data-i18n="common.loading">Loading...</span>
                            </div>
                            <h5 data-i18n="dashboard.messages.loading">Loading Dashboard Data...</h5>
                            <p class="text-muted" data-i18n="dashboard.messages.loadingDesc">Fetching real-time statistics from the backend</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Apply translations to the loading state with multiple attempts
        if (window.adminI18n) {
            window.adminI18n.refresh();
            setTimeout(() => {
                if (window.adminI18n) {
                    window.adminI18n.refresh();
                }
            }, 100);
        }
    };

    const renderError = (error) => {
        dashboardContent.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="card border-danger">
                        <div class="card-body text-center py-5">
                            <i class="bi bi-exclamation-triangle text-danger fs-1 mb-3"></i>
                            <h5 class="text-danger" data-i18n="dashboard.messages.loadError">Failed to Load Dashboard Data</h5>
                            <p class="text-muted">${error}</p>
                            <button class="btn btn-outline-danger" onclick="loadDashboardData()">
                                <i class="bi bi-arrow-clockwise me-1"></i><span data-i18n="dashboard.actions.tryAgain">Try Again</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Apply translations to the error state with multiple attempts
        if (window.adminI18n) {
            window.adminI18n.refresh();
            setTimeout(() => {
                if (window.adminI18n) {
                    window.adminI18n.refresh();
                }
            }, 100);
        }
    };

    // Load dashboard data from API
    const loadDashboardData = async () => {
        if (!dashboardContent) return;

        // Wait for i18n system to be ready
        await waitForI18n();
        
        renderLoading();

        try {
            const result = await apiService.getDashboardData();
            
            if (result.success) {
                renderDashboard(result.data);
            } else {
                renderError(result.error?.message || 'Failed to fetch dashboard data');
            }
        } catch (error) {
            console.error('Dashboard load error:', error);
            renderError('Network error. Please check your connection and try again.');
        }
    };

    // Global function for refresh button
    window.refreshDashboard = loadDashboardData;

    // Load dashboard data on page load
    loadDashboardData();

    // Force translation refresh after page load
    setTimeout(() => {
        if (window.adminI18n) {
            window.adminI18n.refresh();
            // Check if dashboard content is translated, if not, re-render
            const pendingQuotesText = document.querySelector('[data-i18n="dashboard.stats.pendingQuotes"]');
            if (pendingQuotesText && pendingQuotesText.textContent === 'Pending Quotes') {
                // Content is not translated, force re-render
                loadDashboardData();
            }
        }
    }, 1000);

    // Auto-refresh every 5 minutes
    setInterval(loadDashboardData, 5 * 60 * 1000);

    // Listen for language changes to refresh dashboard content
    window.addEventListener('languageChanged', () => {
        // Wait for i18n to be ready, then re-render dashboard
        setTimeout(async () => {
            await waitForI18n();
            loadDashboardData();
        }, 100);
    });
});
