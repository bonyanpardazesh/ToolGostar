document.addEventListener("DOMContentLoaded", function () {
    const contactsTableBody = document.getElementById('contacts-table-body');
    const contactDetailsModal = document.getElementById('contactDetailsModal');
    const contactDetailsContent = document.getElementById('contact-details-content');
    const updateContactBtn = document.getElementById('update-contact-btn');

    let currentFilter = 'all';
    let contacts = [];
    let filteredContacts = [];

    // Load contacts on page load
    loadContacts();

    // Listen for language changes to refresh contacts content
    window.addEventListener('languageChanged', () => {
        renderContacts(filteredContacts);
    });

    // Update contact button event
    if (updateContactBtn) {
        updateContactBtn.addEventListener('click', function() {
            updateContactStatus();
        });
    }

    // Search functionality
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchContacts(this.value);
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            searchContacts(searchInput.value);
        });
    }

    async function loadContacts() {
        try {
            showLoading();
            
            const result = await apiService.getContacts();
            
            if (result.success) {
                // Handle both array format and object with contacts property
                contacts = Array.isArray(result.data) ? result.data : (result.data.contacts || []);
                filteredContacts = [...contacts];
                renderContacts(filteredContacts);
            } else {
                const errorMessage = window.adminI18n ? 
                    window.adminI18n.t('contacts.messages.loadError') + ': ' + (result.error?.message || 'Unknown error') :
                    'Failed to load contacts: ' + (result.error?.message || 'Unknown error');
                apiService.showNotification(errorMessage, 'error');
            }
        } catch (error) {
            console.error('Error loading contacts:', error);
            const networkMessage = window.adminI18n ? window.adminI18n.t('contacts.messages.loadErrorDesc') : 'Network error. Please check your connection and try again.';
            apiService.showNotification(networkMessage, 'error');
        }
    }

    function showLoading() {
        const loadingText = window.adminI18n ? window.adminI18n.t('contacts.messages.loading') : 'Loading contacts...';
        contactsTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">
                    <div class="spinner-border spinner-border-sm me-2" role="status">
                        <span class="visually-hidden" data-i18n="common.loading">Loading...</span>
                    </div>
                    <span data-i18n="contacts.messages.loading">${loadingText}</span>
                </td>
            </tr>
        `;
        
        // Apply translations to the loading state
        if (window.adminI18n) {
            window.adminI18n.refresh();
        }
    }

    function showError(message) {
        const tryAgainText = window.adminI18n ? window.adminI18n.t('contacts.messages.tryAgain') : 'Try Again';
        contactsTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>${message}
                    <br><button class="btn btn-outline-danger btn-sm mt-2" onclick="loadContacts()">
                        <i class="bi bi-arrow-clockwise me-1"></i><span data-i18n="contacts.messages.tryAgain">${tryAgainText}</span>
                    </button>
                </td>
            </tr>
        `;
        
        // Apply translations to the error state
        if (window.adminI18n) {
            window.adminI18n.refresh();
        }
    }

    function renderContacts(contactsToRender) {
        if (contactsToRender.length === 0) {
            const noDataText = window.adminI18n ? window.adminI18n.t('contacts.table.noData') : 'No contacts found';
            contactsTableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center text-muted">
                        <i class="bi bi-inbox me-2"></i><span data-i18n="contacts.table.noData">${noDataText}</span>
                    </td>
                </tr>
            `;
            
            // Apply translations to the no data state
            if (window.adminI18n) {
                window.adminI18n.refresh();
            }
            return;
        }

        contactsTableBody.innerHTML = contactsToRender.map(contact => `
            <tr>
                <td>${contact.id}</td>
                <td>
                    <div>
                        <strong>${contact.firstName || ''} ${contact.lastName || ''}</strong>
                        ${contact.phone ? `<br><small class="text-muted">${contact.phone}</small>` : ''}
                    </div>
                </td>
                <td>
                    <a href="mailto:${contact.email}" class="text-decoration-none">
                        ${contact.email}
                    </a>
                </td>
                <td>${contact.company || 'N/A'}</td>
                <td>
                    <div>
                        <strong>${contact.subject || 'No Subject'}</strong>
                        ${contact.message ? `<br><small class="text-muted">${contact.message.substring(0, 50)}${contact.message.length > 50 ? '...' : ''}</small>` : ''}
                    </div>
                </td>
                <td>
                    <span class="badge bg-${getStatusColor(contact.status)}">
                        ${getStatusText(contact.status)}
                    </span>
                </td>
                <td>
                    <span class="badge bg-${getPriorityColor(contact.priority)}">
                        ${getPriorityText(contact.priority)}
                    </span>
                </td>
                <td>${contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button type="button" class="btn btn-outline-primary" onclick="viewContact(${contact.id})" title="View Details">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button type="button" class="btn btn-outline-success" onclick="updateContactStatus(${contact.id})" title="Update Status">
                            <i class="bi bi-check-circle"></i>
                        </button>
                        <button type="button" class="btn btn-outline-danger" onclick="deleteContact(${contact.id})" title="Delete Contact">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        // Apply translations to the rendered content
        if (window.adminI18n) {
            window.adminI18n.refresh();
        }
    }

    function getStatusColor(status) {
        switch (status) {
            case 'new': return 'warning';
            case 'in_progress': return 'info';
            case 'closed': return 'success';
            default: return 'secondary';
        }
    }

    function getPriorityColor(priority) {
        switch (priority) {
            case 'high': return 'danger';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'secondary';
        }
    }

    function getStatusText(status) {
        if (window.adminI18n) {
            switch (status) {
                case 'new': return window.adminI18n.t('contacts.status.new');
                case 'in_progress': return window.adminI18n.t('contacts.status.inProgress');
                case 'closed': return window.adminI18n.t('contacts.status.closed');
                default: return window.adminI18n.t('contacts.status.new');
            }
        } else {
            switch (status) {
                case 'new': return 'NEW';
                case 'in_progress': return 'IN PROGRESS';
                case 'closed': return 'CLOSED';
                default: return 'NEW';
            }
        }
    }

    function getPriorityText(priority) {
        if (window.adminI18n) {
            switch (priority) {
                case 'low': return window.adminI18n.t('contacts.priority.low');
                case 'medium': return window.adminI18n.t('contacts.priority.medium');
                case 'high': return window.adminI18n.t('contacts.priority.high');
                case 'urgent': return window.adminI18n.t('contacts.priority.urgent');
                default: return window.adminI18n.t('contacts.priority.medium');
            }
        } else {
            switch (priority) {
                case 'low': return 'LOW';
                case 'medium': return 'MEDIUM';
                case 'high': return 'HIGH';
                case 'urgent': return 'URGENT';
                default: return 'MEDIUM';
            }
        }
    }

    function filterContacts(filter) {
        currentFilter = filter;
        
        // Update button states
        document.querySelectorAll('.btn-group button').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        if (filter !== 'all') {
            filteredContacts = contacts.filter(contact => contact.status === filter);
        } else {
            filteredContacts = [...contacts];
        }
        
        renderContacts(filteredContacts);
    }

    // Search functionality
    function searchContacts(searchTerm) {
        if (!searchTerm.trim()) {
            filterContacts(currentFilter);
            return;
        }

        const term = searchTerm.toLowerCase();
        filteredContacts = contacts.filter(contact => 
            (contact.firstName && contact.firstName.toLowerCase().includes(term)) ||
            (contact.lastName && contact.lastName.toLowerCase().includes(term)) ||
            (contact.email && contact.email.toLowerCase().includes(term)) ||
            (contact.company && contact.company.toLowerCase().includes(term)) ||
            (contact.subject && contact.subject.toLowerCase().includes(term)) ||
            (contact.message && contact.message.toLowerCase().includes(term))
        );
        
        renderContacts(filteredContacts);
    }

    // Global functions
    window.viewContact = async function(id) {
        try {
            console.log('🔍 Viewing contact with ID:', id);
            const result = await apiService.getContact(id);
            console.log('📡 API Response:', result);
            
            if (result.success) {
                // Handle both direct data and nested contact structure
                const contact = result.data.contact || result.data;
                console.log('📋 Contact data:', contact);
                showContactDetails(contact);
            } else {
                const errorMessage = window.adminI18n ? window.adminI18n.t('contacts.messages.loadDetailsError') : 'Failed to load contact details';
                console.error('❌ API Error:', result);
                apiService.showNotification(errorMessage, 'error');
            }
        } catch (error) {
            console.error('❌ Network Error:', error);
            const networkMessage = window.adminI18n ? window.adminI18n.t('contacts.messages.networkError') : 'Network error loading contact';
            apiService.showNotification(networkMessage, 'error');
        }
    };

    function showContactDetails(contact) {
        console.log('🎯 showContactDetails called with:', contact);
        
        // Get translations
        const t = window.adminI18n ? window.adminI18n.t.bind(window.adminI18n) : (key) => key;
        const na = t('contacts.modal.na');
        
        const modalHtml = `
            <div class="modal fade" id="contactDetailsModal" tabindex="-1" aria-labelledby="contactDetailsModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="contactDetailsModalLabel" data-i18n="contacts.modal.viewTitle">Contact Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6 data-i18n="contacts.modal.contactInfo">Contact Information</h6>
                                    <p><strong data-i18n="contacts.modal.name">Name:</strong> ${contact.firstName || ''} ${contact.lastName || ''}</p>
                                    <p><strong data-i18n="contacts.modal.email">Email:</strong> <a href="mailto:${contact.email}">${contact.email}</a></p>
                                    <p><strong data-i18n="contacts.modal.company">Company:</strong> ${contact.company || na}</p>
                                    <p><strong data-i18n="contacts.modal.phone">Phone:</strong> ${contact.phone || na}</p>
                                    <p><strong data-i18n="contacts.modal.type">Type:</strong> ${contact.type || 'general'}</p>
                                </div>
                                <div class="col-md-6">
                                    <h6 data-i18n="contacts.modal.inquiryDetails">Inquiry Details</h6>
                                    <p><strong data-i18n="contacts.modal.subject">Subject:</strong> ${contact.subject || t('contacts.table.noSubject')}</p>
                                    <p><strong data-i18n="contacts.modal.status">Status:</strong> 
                                        <span class="badge bg-${getStatusColor(contact.status)}">
                                            ${getStatusText(contact.status)}
                                        </span>
                                    </p>
                                    <p><strong data-i18n="contacts.modal.priority">Priority:</strong> 
                                        <span class="badge bg-${getPriorityColor(contact.priority)}">
                                            ${getPriorityText(contact.priority)}
                                        </span>
                                    </p>
                                    <p><strong data-i18n="contacts.modal.date">Date:</strong> ${contact.createdAt ? new Date(contact.createdAt).toLocaleString() : na}</p>
                                </div>
                            </div>
                            <div class="row mt-3">
                                <div class="col-12">
                                    <h6 data-i18n="contacts.modal.message">Message</h6>
                                    <div class="border p-3 bg-light rounded">
                                        ${contact.message || t('contacts.modal.noMessage')}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="contacts.modal.close">Close</button>
                            <button type="button" class="btn btn-primary" onclick="updateContactStatus(${contact.id}); bootstrap.Modal.getInstance(document.getElementById('contactDetailsModal')).hide();">
                                <i class="bi bi-check-circle me-1"></i><span data-i18n="contacts.modal.updateStatus">Update Status</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('contactDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add new modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        console.log('📝 Modal HTML added to body');
        
        // Show modal
        const modalElement = document.getElementById('contactDetailsModal');
        console.log('🔍 Modal element found:', modalElement);
        
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            console.log('🎭 Bootstrap modal instance created');
            modal.show();
            console.log('✅ Modal show() called');
        } else {
            console.error('❌ Modal element not found!');
        }
        
        // Apply translations to the newly created modal
        if (window.adminI18n) {
            window.adminI18n.refresh();
        }
        
        // Clean up modal when hidden
        document.getElementById('contactDetailsModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    window.replyToContact = function(id) {
        const contact = contacts.find(c => c.id === id);
        if (contact) {
            window.open(`mailto:${contact.email}?subject=Re: ${contact.subject}`, '_blank');
        }
    };

    window.updateContactStatus = async function(id) {
        try {
            const contact = contacts.find(c => c.id === id);
            if (!contact) {
                const errorMessage = window.adminI18n ? window.adminI18n.t('contacts.messages.contactNotFound') : 'Contact not found';
                apiService.showNotification(errorMessage, 'error');
                return;
            }

            // Get translations
            const t = window.adminI18n ? window.adminI18n.t.bind(window.adminI18n) : (key) => key;
            
            // Show status update modal
            const statusModalHtml = `
                <div class="modal fade" id="statusUpdateModal" tabindex="-1" aria-labelledby="statusUpdateModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="statusUpdateModalLabel" data-i18n="contacts.modal.updateTitle">Update Contact Status</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="mb-3">
                                    <label for="status-select" class="form-label" data-i18n="contacts.modal.status">Status</label>
                                    <select class="form-select" id="status-select">
                                        <option value="new" ${contact.status === 'new' ? 'selected' : ''} data-i18n="contacts.status.new">New</option>
                                        <option value="in_progress" ${contact.status === 'in_progress' ? 'selected' : ''} data-i18n="contacts.status.inProgress">In Progress</option>
                                        <option value="closed" ${contact.status === 'closed' ? 'selected' : ''} data-i18n="contacts.status.closed">Closed</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="priority-select" class="form-label" data-i18n="contacts.modal.priority">Priority</label>
                                    <select class="form-select" id="priority-select">
                                        <option value="low" ${contact.priority === 'low' ? 'selected' : ''} data-i18n="contacts.priority.low">Low</option>
                                        <option value="medium" ${contact.priority === 'medium' ? 'selected' : ''} data-i18n="contacts.priority.medium">Medium</option>
                                        <option value="high" ${contact.priority === 'high' ? 'selected' : ''} data-i18n="contacts.priority.high">High</option>
                                        <option value="urgent" ${contact.priority === 'urgent' ? 'selected' : ''} data-i18n="contacts.priority.urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="contacts.modal.cancel">Cancel</button>
                                <button type="button" class="btn btn-primary" onclick="saveContactStatus(${id})" data-i18n="contacts.modal.save">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Remove existing modal if any
            const existingModal = document.getElementById('statusUpdateModal');
            if (existingModal) {
                existingModal.remove();
            }
            
            // Add new modal to body
            document.body.insertAdjacentHTML('beforeend', statusModalHtml);
            
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('statusUpdateModal'));
            modal.show();
            
            // Apply translations to the newly created modal
            if (window.adminI18n) {
                window.adminI18n.refresh();
            }
            
            // Clean up modal when hidden
            document.getElementById('statusUpdateModal').addEventListener('hidden.bs.modal', function() {
                this.remove();
            });
        } catch (error) {
            const errorMessage = window.adminI18n ? window.adminI18n.t('contacts.messages.statusUpdateError') : 'Error opening status update modal';
            apiService.showNotification(errorMessage, 'error');
        }
    };

    window.saveContactStatus = async function(id) {
        try {
            const newStatus = document.getElementById('status-select').value;
            const newPriority = document.getElementById('priority-select').value;
            
            const result = await apiService.updateContactStatus(id, newStatus);
            
            if (result.success) {
                const successMessage = window.adminI18n ? window.adminI18n.t('contacts.messages.updateSuccess') : 'Contact status updated successfully!';
                apiService.showNotification(successMessage, 'success');
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('statusUpdateModal'));
                modal.hide();
                
                // Reload contacts
                loadContacts();
            } else {
                const errorMessage = window.adminI18n ? 
                    window.adminI18n.t('contacts.messages.updateError') + ': ' + (result.error?.message || 'Unknown error') :
                    'Failed to update contact status: ' + (result.error?.message || 'Unknown error');
                apiService.showNotification(errorMessage, 'error');
            }
        } catch (error) {
            const networkMessage = window.adminI18n ? window.adminI18n.t('contacts.messages.updateErrorDesc') : 'Network error updating contact status';
            apiService.showNotification(networkMessage, 'error');
        }
    };

    // Delete contact function
    async function deleteContact(contactId) {
        console.log('🗑️ Delete contact called with ID:', contactId);
        
        try {
            // Find the contact to get its details for confirmation
            const contact = contacts.find(c => c.id === contactId);
            console.log('🔍 Found contact:', contact);
            
            if (!contact) {
                console.error('❌ Contact not found in local array');
                apiService.showNotification('Contact not found', 'error');
                return;
            }

            // Show confirmation dialog
            const confirmMessage = `Are you sure you want to delete the contact from ${contact.firstName} ${contact.lastName} (${contact.email})?`;
            console.log('❓ Showing confirmation:', confirmMessage);
            
            if (!confirm(confirmMessage)) {
                console.log('❌ User cancelled deletion');
                return;
            }

            console.log('✅ User confirmed deletion');
            
            // Show loading state
            showLoading();

            // Call delete API
            console.log('📤 Calling delete API for contact ID:', contactId);
            const result = await apiService.deleteContact(contactId);
            console.log('📡 Delete API response:', result);
            
            if (result.success) {
                console.log('✅ Delete successful, updating local arrays');
                
                // Remove from local arrays
                contacts = contacts.filter(c => c.id !== contactId);
                filteredContacts = filteredContacts.filter(c => c.id !== contactId);
                
                console.log('📊 Updated contacts count:', contacts.length);
                console.log('📊 Updated filtered contacts count:', filteredContacts.length);
                
                // Re-render the table
                renderContacts(filteredContacts);
                
                // Show success message
                const successMessage = window.adminI18n ? 
                    window.adminI18n.t('contacts.messages.deleteSuccess') : 
                    'Contact deleted successfully';
                apiService.showNotification(successMessage, 'success');
                console.log('✅ Delete process completed successfully');
            } else {
                console.error('❌ Delete API returned error:', result);
                const errorMessage = window.adminI18n ? 
                    window.adminI18n.t('contacts.messages.deleteError') + ': ' + (result.error?.message || 'Unknown error') :
                    'Failed to delete contact: ' + (result.error?.message || 'Unknown error');
                apiService.showNotification(errorMessage, 'error');
            }
        } catch (error) {
            console.error('❌ Error deleting contact:', error);
            const networkMessage = window.adminI18n ? 
                window.adminI18n.t('contacts.messages.deleteErrorDesc') : 
                'Network error. Please check your connection and try again.';
            apiService.showNotification(networkMessage, 'error');
        }
    }

    // Make functions globally available
    window.filterContacts = filterContacts;
    window.searchContacts = searchContacts;
    window.loadContacts = loadContacts;
    window.deleteContact = deleteContact;

});
