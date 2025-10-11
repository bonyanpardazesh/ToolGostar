/**
 * Quote Requests Management JavaScript
 * Handles all quote request-related functionality in the admin panel
 */

class QuoteManager {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 1;
        this.searchTerm = '';
        this.filterStatus = '';
        this.quotesData = [];
        
        this.init();
    }

    async init() {
        try {
            // Check authentication
            if (!apiService.isAuthenticated()) {
                window.location.href = 'login.html';
                return;
            }

            // Load initial data
            await this.loadQuoteStats();
            await this.loadQuotes();

            // Setup event listeners
            this.setupEventListeners();

            // Listen for language changes to refresh quotes content
            window.addEventListener('languageChanged', () => {
                this.renderQuotes();
            });

        } catch (error) {
            console.error('Quote Manager initialization error:', error);
            const errorMessage = window.adminI18n ? window.adminI18n.t('quotes.messages.initError') : 'Failed to initialize quote management';
            this.showError(errorMessage);
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-quotes');
        const searchBtn = document.getElementById('search-btn');
        
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.handleSearch());
        }

        // Filter by status
        const filterItems = document.querySelectorAll('.dropdown-item[data-status]');
        filterItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterStatus = e.target.dataset.status;
                this.currentPage = 1;
                this.loadQuotes();
                
                // Update dropdown button text
                const dropdownBtn = document.getElementById('filter-status');
                dropdownBtn.innerHTML = `<i class="bi bi-funnel me-2"></i>${e.target.textContent}`;
            });
        });

        // Export button
        const exportBtn = document.getElementById('export-quotes-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportQuotes());
        }

        // Retry button
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.loadQuotes());
        }
    }

    async loadQuoteStats() {
        try {
            const response = await apiService.getQuoteStats();
            if (response.success) {
                this.updateStatsDisplay(response.data.stats);
            }
        } catch (error) {
            console.error('Failed to load quote stats:', error);
        }
    }

    async loadQuotes(page = 1) {
        try {
            this.showLoading();
            
            const params = {
                page,
                limit: 20,
                sortBy: 'createdAt',
                sortOrder: 'DESC'
            };

            if (this.searchTerm) {
                params.search = this.searchTerm;
            }

            if (this.filterStatus) {
                params.status = this.filterStatus;
            }

            const response = await apiService.getQuotes(params);
            
            if (response.success) {
                this.quotesData = response.data.quotes;
                this.currentPage = response.data.pagination.currentPage;
                this.totalPages = response.data.pagination.totalPages;
                
                this.renderQuotes();
                this.renderPagination();
                this.hideLoading();
            } else {
                const errorMessage = window.adminI18n ? 
                    window.adminI18n.t('quotes.messages.loadError') + ': ' + (response.error || 'Unknown error') :
                    'Failed to load quotes: ' + (response.error || 'Unknown error');
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Failed to load quotes:', error);
            this.showError(error.message);
        }
    }

    renderQuotes() {
        const tbody = document.getElementById('quotes-tbody');
        if (!tbody) return;

        if (this.quotesData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center py-4">
                        <i class="bi bi-file-earmark-text fs-1 text-muted mb-3"></i>
                        <h5 class="text-muted" data-i18n="quotes.messages.noData">No quote requests found</h5>
                        <p class="text-muted" data-i18n="quotes.messages.noDataMessage">No quotes match your current filters.</p>
                    </td>
                </tr>
            `;
            if (window.adminI18n) {
                window.adminI18n.refresh();
            }
            return;
        }

        tbody.innerHTML = this.quotesData.map(quote => `
            <tr>
                <td>
                    <strong>${quote.quoteNumber}</strong>
                </td>
                <td>
                    <div>
                        <strong>${quote.contact.firstName} ${quote.contact.lastName}</strong><br>
                        <small class="text-muted">${quote.contact.email}</small>
                    </div>
                </td>
                <td>${quote.contact.company || 'N/A'}</td>
                <td>
                    <span class="badge ${this.getStatusBadgeClass(quote.status)}">
                        ${this.formatStatus(quote.status)}
                    </span>
                </td>
                <td>
                    ${quote.quoteAmount ? `$${this.formatNumber(quote.quoteAmount)}` : 'N/A'}
                </td>
                <td>${quote.industry || 'N/A'}</td>
                <td>
                    ${quote.assignedTo ? 
                        `${quote.assignedTo.firstName} ${quote.assignedTo.lastName}` : 
                        '<span class="text-muted">Unassigned</span>'
                    }
                </td>
                <td>${this.formatDate(quote.createdAt)}</td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="quoteManager.viewQuote(${quote.id})" title="View">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="quoteManager.editQuote(${quote.id})" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-outline-info dropdown-toggle" data-bs-toggle="dropdown" title="Status">
                                <i class="bi bi-gear"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#" onclick="quoteManager.updateStatus(${quote.id}, 'pending')" data-i18n="quotes.status.pending">Pending</a></li>
                                <li><a class="dropdown-item" href="#" onclick="quoteManager.updateStatus(${quote.id}, 'in_progress')" data-i18n="quotes.status.inProgress">In Progress</a></li>
                                <li><a class="dropdown-item" href="#" onclick="quoteManager.updateStatus(${quote.id}, 'quoted')" data-i18n="quotes.status.quoted">Quoted</a></li>
                                <li><a class="dropdown-item" href="#" onclick="quoteManager.updateStatus(${quote.id}, 'approved')" data-i18n="quotes.status.approved">Approved</a></li>
                                <li><a class="dropdown-item" href="#" onclick="quoteManager.updateStatus(${quote.id}, 'rejected')" data-i18n="quotes.status.rejected">Rejected</a></li>
                            </ul>
                        </div>
                        <button class="btn btn-sm btn-outline-danger" onclick="quoteManager.deleteQuote(${quote.id})" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        if (window.adminI18n) {
            window.adminI18n.refresh();
        }
    }

    renderPagination() {
        const container = document.getElementById('pagination-container');
        const pagination = document.getElementById('pagination');
        
        if (!container || !pagination) return;

        if (this.totalPages <= 1) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        
        let paginationHTML = '';
        
        // Previous button
        const prevText = window.adminI18n ? window.adminI18n.t('quotes.pagination.previous') : 'Previous';
        paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="quoteManager.loadQuotes(${this.currentPage - 1})" data-i18n="quotes.pagination.previous">${prevText}</a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= this.totalPages; i++) {
            if (i === 1 || i === this.totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="quoteManager.loadQuotes(${i})">${i}</a>
                    </li>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }

        // Next button
        const nextText = window.adminI18n ? window.adminI18n.t('quotes.pagination.next') : 'Next';
        paginationHTML += `
            <li class="page-item ${this.currentPage === this.totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="quoteManager.loadQuotes(${this.currentPage + 1})" data-i18n="quotes.pagination.next">${nextText}</a>
            </li>
        `;

        pagination.innerHTML = paginationHTML;
        
        // Apply translations to the pagination
        if (window.adminI18n) {
            window.adminI18n.refresh();
        }
    }

    updateStatsDisplay(stats) {
        const elements = {
            'total-quotes': stats.totalQuotes || 0,
            'pending-quotes': stats.pendingQuotes || 0,
            'in-progress-quotes': stats.inProgressQuotes || 0,
            'approved-quotes': stats.approvedQuotes || 0
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    handleSearch() {
        const searchInput = document.getElementById('search-quotes');
        if (searchInput) {
            this.searchTerm = searchInput.value.trim();
            this.currentPage = 1;
            this.loadQuotes();
        }
    }

    async viewQuote(id) {
        try {
            const response = await apiService.getQuoteById(id);
            if (response.success) {
                this.showQuoteDetails(response.data.quote);
            } else {
                throw new Error(response.error || 'Failed to load quote details');
            }
        } catch (error) {
            console.error('Failed to view quote:', error);
            const errorMessage = window.adminI18n ? window.adminI18n.t('quotes.messages.viewError') : 'Failed to load quote details';
            apiService.showNotification(errorMessage, 'error');
        }
    }

    async editQuote(id) {
        try {
            const response = await apiService.getQuoteById(id);
            if (response.success) {
                this.showEditQuoteModal(response.data.quote);
            } else {
                throw new Error(response.error || 'Failed to load quote for editing');
            }
        } catch (error) {
            console.error('Failed to edit quote:', error);
            const errorMessage = window.adminI18n ? window.adminI18n.t('quotes.messages.editError') : 'Failed to load quote for editing';
            apiService.showNotification(errorMessage, 'error');
        }
    }

    async updateStatus(id, status) {
        try {
            const response = await apiService.updateQuoteStatus(id, status);
            if (response.success) {
                const successMessage = window.adminI18n ? window.adminI18n.t('quotes.messages.updateSuccess') : 'Quote status updated successfully';
                apiService.showNotification(successMessage, 'success');
                await this.loadQuotes(this.currentPage);
                await this.loadQuoteStats();
            } else {
                throw new Error(response.error || 'Failed to update quote status');
            }
        } catch (error) {
            console.error('Failed to update quote status:', error);
            const errorMessage = window.adminI18n ? window.adminI18n.t('quotes.messages.updateError') : 'Failed to update quote status';
            apiService.showNotification(errorMessage, 'error');
        }
    }

    async deleteQuote(id) {
        const quote = this.quotesData.find(q => q.id === id);
        if (!quote) return;

        const confirmMessage = window.adminI18n ? 
            window.adminI18n.t('quotes.messages.confirmDelete').replace('{quoteNumber}', quote.quoteNumber) :
            `Are you sure you want to delete quote "${quote.quoteNumber}"? This action cannot be undone.`;
        
        if (confirm(confirmMessage)) {
            try {
                const response = await apiService.deleteQuote(id);
                if (response.success) {
                    const successMessage = window.adminI18n ? window.adminI18n.t('quotes.messages.deleteSuccess') : 'Quote request deleted successfully';
                    apiService.showNotification(successMessage, 'success');
                    await this.loadQuotes(this.currentPage);
                    await this.loadQuoteStats();
                } else {
                    throw new Error(response.error || 'Failed to delete quote');
                }
            } catch (error) {
                console.error('Failed to delete quote:', error);
                const errorMessage = window.adminI18n ? window.adminI18n.t('quotes.messages.deleteError') : 'Failed to delete quote request';
                apiService.showNotification(errorMessage, 'error');
            }
        }
    }

    async exportQuotes() {
        try {
            const params = {};
            if (this.filterStatus) params.status = this.filterStatus;
            if (this.searchTerm) params.search = this.searchTerm;

            const response = await apiService.exportQuotes(params);
            if (response.success) {
                // Create download link
                const blob = new Blob([response.data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `quotes-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                const successMessage = window.adminI18n ? window.adminI18n.t('quotes.messages.exportSuccess') : 'Quotes exported successfully';
                apiService.showNotification(successMessage, 'success');
            } else {
                throw new Error(response.error || 'Failed to export quotes');
            }
        } catch (error) {
            console.error('Failed to export quotes:', error);
            const errorMessage = window.adminI18n ? window.adminI18n.t('quotes.messages.exportError') : 'Failed to export quotes';
            apiService.showNotification(errorMessage, 'error');
        }
    }

    showQuoteDetails(quote) {
        // Get translations
        const t = window.adminI18n ? window.adminI18n.t.bind(window.adminI18n) : (key) => key;
        const na = t('quotes.modal.notSet');
        
        // Create modal HTML for viewing quote details
        const modalHTML = `
            <div class="modal fade" id="quoteDetailsModal" tabindex="-1" aria-labelledby="quoteDetailsModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="quoteDetailsModalLabel" data-i18n="quotes.modal.viewTitle">${t('quotes.modal.viewTitle').replace('{quoteNumber}', quote.quoteNumber)}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-header">
                                            <h6 class="mb-0" data-i18n="quotes.modal.contactInfo">Contact Information</h6>
                                        </div>
                                        <div class="card-body">
                                            <p><strong data-i18n="quotes.modal.name">Name:</strong> ${quote.contact.firstName} ${quote.contact.lastName}</p>
                                            <p><strong data-i18n="quotes.modal.email">Email:</strong> ${quote.contact.email}</p>
                                            <p><strong data-i18n="quotes.modal.phone">Phone:</strong> ${quote.contact.phone || na}</p>
                                            <p><strong data-i18n="quotes.modal.company">Company:</strong> ${quote.contact.company || na}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-header">
                                            <h6 class="mb-0" data-i18n="quotes.modal.quoteDetails">Quote Details</h6>
                                        </div>
                                        <div class="card-body">
                                            <p><strong data-i18n="quotes.modal.status">Status:</strong> <span class="badge ${this.getStatusBadgeClass(quote.status)}">${this.formatStatus(quote.status)}</span></p>
                                            <p><strong data-i18n="quotes.modal.industry">Industry:</strong> ${quote.industry || na}</p>
                                            <p><strong data-i18n="quotes.modal.applicationArea">Application Area:</strong> ${this.formatApplicationArea(quote.applicationArea)}</p>
                                            <p><strong data-i18n="quotes.modal.requiredCapacity">Required Capacity:</strong> ${quote.requiredCapacity || na}</p>
                                            <p><strong data-i18n="quotes.modal.budget">Budget:</strong> ${quote.budget ? `$${this.formatNumber(quote.budget)}` : na}</p>
                                            <p><strong data-i18n="quotes.modal.timeline">Timeline:</strong> ${quote.timeline || na}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="row mt-3">
                                <div class="col-12">
                                    <div class="card">
                                        <div class="card-header">
                                            <h6 class="mb-0" data-i18n="quotes.modal.additionalInfo">Additional Information</h6>
                                        </div>
                                        <div class="card-body">
                                            <p><strong data-i18n="quotes.modal.quoteAmount">Quote Amount:</strong> ${quote.quoteAmount ? `$${this.formatNumber(quote.quoteAmount)}` : t('quotes.modal.notSet')}</p>
                                            <p><strong data-i18n="quotes.modal.assignedTo">Assigned To:</strong> ${quote.assignedTo ? `${quote.assignedTo.firstName} ${quote.assignedTo.lastName}` : t('quotes.modal.unassigned')}</p>
                                            <p><strong data-i18n="quotes.modal.created">Created:</strong> ${this.formatDate(quote.createdAt)}</p>
                                            <p><strong data-i18n="quotes.modal.lastUpdated">Last Updated:</strong> ${this.formatDate(quote.updatedAt)}</p>
                                            ${quote.notes ? `<p><strong data-i18n="quotes.modal.notes">Notes:</strong> ${quote.notes}</p>` : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="quotes.modal.close">Close</button>
                            <button type="button" class="btn btn-primary" onclick="quoteManager.editQuote(${quote.id})">
                                <i class="bi bi-pencil me-2"></i><span data-i18n="quotes.modal.editQuote">Edit Quote</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('quoteDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('quoteDetailsModal'));
        modal.show();
        
        // Apply translations to the newly created modal
        if (window.adminI18n) {
            window.adminI18n.refresh();
        }
    }

    showEditQuoteModal(quote) {
        // Get translations
        const t = window.adminI18n ? window.adminI18n.t.bind(window.adminI18n) : (key) => key;
        
        // Create modal HTML for editing quote
        const modalHTML = `
            <div class="modal fade" id="editQuoteModal" tabindex="-1" aria-labelledby="editQuoteModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="editQuoteModalLabel" data-i18n="quotes.modal.editTitle">${t('quotes.modal.editTitle').replace('{quoteNumber}', quote.quoteNumber)}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="edit-quote-form">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="edit-industry" class="form-label" data-i18n="quotes.modal.industry">Industry</label>
                                            <input type="text" class="form-control" id="edit-industry" value="${quote.industry || ''}">
                                        </div>
                                        <div class="mb-3">
                                            <label for="edit-application-area" class="form-label" data-i18n="quotes.modal.applicationArea">Application Area</label>
                                            <select class="form-select" id="edit-application-area">
                                                <option value="" data-i18n="quotes.form.selectApplicationArea">Select Application Area</option>
                                                <option value="industrial_process" ${quote.applicationArea === 'industrial_process' ? 'selected' : ''} data-i18n="quotes.applicationArea.industrialProcess">Industrial Process</option>
                                                <option value="municipal_water" ${quote.applicationArea === 'municipal_water' ? 'selected' : ''} data-i18n="quotes.applicationArea.municipalWater">Municipal Water</option>
                                                <option value="wastewater_treatment" ${quote.applicationArea === 'wastewater_treatment' ? 'selected' : ''} data-i18n="quotes.applicationArea.wastewaterTreatment">Wastewater Treatment</option>
                                                <option value="food_beverage" ${quote.applicationArea === 'food_beverage' ? 'selected' : ''} data-i18n="quotes.applicationArea.foodBeverage">Food & Beverage</option>
                                                <option value="pharmaceutical" ${quote.applicationArea === 'pharmaceutical' ? 'selected' : ''} data-i18n="quotes.applicationArea.pharmaceutical">Pharmaceutical</option>
                                                <option value="power_generation" ${quote.applicationArea === 'power_generation' ? 'selected' : ''} data-i18n="quotes.applicationArea.powerGeneration">Power Generation</option>
                                                <option value="mining" ${quote.applicationArea === 'mining' ? 'selected' : ''} data-i18n="quotes.applicationArea.mining">Mining</option>
                                                <option value="other" ${quote.applicationArea === 'other' ? 'selected' : ''} data-i18n="quotes.applicationArea.other">Other</option>
                                            </select>
                                        </div>
                                        <div class="mb-3">
                                            <label for="edit-required-capacity" class="form-label" data-i18n="quotes.modal.requiredCapacity">Required Capacity</label>
                                            <input type="text" class="form-control" id="edit-required-capacity" value="${quote.requiredCapacity || ''}">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="edit-budget" class="form-label" data-i18n="quotes.modal.budget">Budget</label>
                                            <input type="number" class="form-control" id="edit-budget" value="${quote.budget || ''}">
                                        </div>
                                        <div class="mb-3">
                                            <label for="edit-timeline" class="form-label" data-i18n="quotes.modal.timeline">Timeline</label>
                                            <input type="text" class="form-control" id="edit-timeline" value="${quote.timeline || ''}">
                                        </div>
                                        <div class="mb-3">
                                            <label for="edit-quote-amount" class="form-label" data-i18n="quotes.modal.quoteAmount">Quote Amount</label>
                                            <input type="number" class="form-control" id="edit-quote-amount" value="${quote.quoteAmount || ''}">
                                        </div>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="edit-notes" class="form-label" data-i18n="quotes.modal.notes">Notes</label>
                                    <textarea class="form-control" id="edit-notes" rows="4">${quote.notes || ''}</textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="quotes.modal.cancel">Cancel</button>
                            <button type="button" class="btn btn-primary" id="save-quote-btn">
                                <i class="bi bi-check me-2"></i><span data-i18n="quotes.modal.saveChanges">Save Changes</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('editQuoteModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Setup save button
        const saveBtn = document.getElementById('save-quote-btn');
        saveBtn.addEventListener('click', () => this.saveQuoteChanges(quote.id));

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('editQuoteModal'));
        modal.show();
        
        // Apply translations to the newly created modal
        if (window.adminI18n) {
            window.adminI18n.refresh();
        }
    }

    async saveQuoteChanges(id) {
        try {
            const updateData = {
                industry: document.getElementById('edit-industry').value,
                applicationArea: document.getElementById('edit-application-area').value,
                requiredCapacity: document.getElementById('edit-required-capacity').value,
                budget: document.getElementById('edit-budget').value ? parseFloat(document.getElementById('edit-budget').value) : null,
                timeline: document.getElementById('edit-timeline').value,
                quoteAmount: document.getElementById('edit-quote-amount').value ? parseFloat(document.getElementById('edit-quote-amount').value) : null,
                notes: document.getElementById('edit-notes').value
            };

            const response = await apiService.updateQuote(id, updateData);

            if (response.success) {
                const successMessage = window.adminI18n ? window.adminI18n.t('quotes.messages.saveSuccess') : 'Quote updated successfully';
                apiService.showNotification(successMessage, 'success');
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('editQuoteModal'));
                modal.hide();
                
                // Reload data
                await this.loadQuotes(this.currentPage);
            } else {
                throw new Error(response.error || 'Failed to update quote');
            }
        } catch (error) {
            console.error('Failed to update quote:', error);
            const errorMessage = window.adminI18n ? window.adminI18n.t('quotes.messages.saveError') : 'Failed to update quote';
            apiService.showNotification(errorMessage, 'error');
        }
    }

    getStatusBadgeClass(status) {
        switch (status) {
            case 'pending': return 'bg-warning';
            case 'in_progress': return 'bg-info';
            case 'quoted': return 'bg-primary';
            case 'approved': return 'bg-success';
            case 'rejected': return 'bg-danger';
            case 'cancelled': return 'bg-secondary';
            default: return 'bg-secondary';
        }
    }

    formatStatus(status) {
        if (window.adminI18n) {
            switch (status) {
                case 'pending': return window.adminI18n.t('quotes.status.pending');
                case 'in_progress': return window.adminI18n.t('quotes.status.inProgress');
                case 'quoted': return window.adminI18n.t('quotes.status.quoted');
                case 'approved': return window.adminI18n.t('quotes.status.approved');
                case 'rejected': return window.adminI18n.t('quotes.status.rejected');
                case 'cancelled': return window.adminI18n.t('quotes.status.cancelled');
                default: return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            }
        } else {
            return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    }

    formatApplicationArea(area) {
        if (!area) return window.adminI18n ? window.adminI18n.t('quotes.modal.notSet') : 'N/A';
        
        if (window.adminI18n) {
            switch (area) {
                case 'industrial_process': return window.adminI18n.t('quotes.applicationArea.industrialProcess');
                case 'municipal_water': return window.adminI18n.t('quotes.applicationArea.municipalWater');
                case 'wastewater_treatment': return window.adminI18n.t('quotes.applicationArea.wastewaterTreatment');
                case 'food_beverage': return window.adminI18n.t('quotes.applicationArea.foodBeverage');
                case 'pharmaceutical': return window.adminI18n.t('quotes.applicationArea.pharmaceutical');
                case 'power_generation': return window.adminI18n.t('quotes.applicationArea.powerGeneration');
                case 'mining': return window.adminI18n.t('quotes.applicationArea.mining');
                case 'other': return window.adminI18n.t('quotes.applicationArea.other');
                default: return area.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            }
        } else {
            return area.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    }

    formatNumber(num) {
        return new Intl.NumberFormat().format(num);
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    }

    showLoading() {
        const loadingState = document.getElementById('loading-state');
        const errorState = document.getElementById('error-state');
        const tableContainer = document.getElementById('quotes-table-container');
        
        if (loadingState) loadingState.style.display = 'block';
        if (errorState) errorState.style.display = 'none';
        if (tableContainer) tableContainer.style.display = 'none';
    }

    hideLoading() {
        const loadingState = document.getElementById('loading-state');
        const tableContainer = document.getElementById('quotes-table-container');
        
        if (loadingState) loadingState.style.display = 'none';
        if (tableContainer) tableContainer.style.display = 'block';
    }

    showError(message) {
        const loadingState = document.getElementById('loading-state');
        const errorState = document.getElementById('error-state');
        const errorMessage = document.getElementById('error-message');
        const tableContainer = document.getElementById('quotes-table-container');
        
        if (loadingState) loadingState.style.display = 'none';
        if (errorState) errorState.style.display = 'block';
        if (errorMessage) errorMessage.textContent = message;
        if (tableContainer) tableContainer.style.display = 'none';
    }
}

// Initialize quote manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quoteManager = new QuoteManager();
});
