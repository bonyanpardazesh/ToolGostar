/**
 * User Management JavaScript
 * Handles all user management-related functionality in the admin panel
 */

class UserManager {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 1;
        this.searchTerm = '';
        this.filterRole = '';
        this.filterStatus = '';
        this.usersData = [];
        
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
            await this.loadUserStats();
            await this.loadUsers();

            // Setup event listeners
            this.setupEventListeners();

            // Listen for language changes to refresh users content
            window.addEventListener('languageChanged', () => {
                this.renderUsers();
            });

        } catch (error) {
            console.error('User Manager initialization error:', error);
            const errorMessage = window.adminI18n ? window.adminI18n.t('users.messages.initError') : 'Failed to initialize user management';
            this.showError(errorMessage);
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-users');
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

        // Filter by role
        const roleFilterItems = document.querySelectorAll('.dropdown-item[data-role]');
        roleFilterItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterRole = e.target.dataset.role;
                this.currentPage = 1;
                this.loadUsers();
                
                // Update dropdown button text
                const dropdownBtn = document.getElementById('filter-role');
                dropdownBtn.innerHTML = `<i class="bi bi-funnel me-2"></i>${e.target.textContent}`;
            });
        });

        // Filter by status
        const statusFilterItems = document.querySelectorAll('.dropdown-item[data-status]');
        statusFilterItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterStatus = e.target.dataset.status;
                this.currentPage = 1;
                this.loadUsers();
                
                // Update dropdown button text
                const dropdownBtn = document.getElementById('filter-status');
                dropdownBtn.innerHTML = `<i class="bi bi-funnel me-2"></i>${e.target.textContent}`;
            });
        });

        // Add user button
        const addBtn = document.getElementById('add-user-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddUserModal());
        }

        // Export button
        const exportBtn = document.getElementById('export-users-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportUsers());
        }

        // Retry button
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.loadUsers());
        }
    }

    async loadUserStats() {
        try {
            const response = await apiService.getUserStats();
            if (response.success) {
                this.updateStatsDisplay(response.data.stats);
            }
        } catch (error) {
            console.error('Failed to load user stats:', error);
        }
    }

    async loadUsers(page = 1) {
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

            if (this.filterRole) {
                params.role = this.filterRole;
            }

            if (this.filterStatus) {
                params.status = this.filterStatus;
            }

            const response = await apiService.getUsers(params);
            
            if (response.success) {
                this.usersData = response.data.users;
                this.currentPage = response.data.pagination.currentPage;
                this.totalPages = response.data.pagination.totalPages;
                
                this.renderUsers();
                this.renderPagination();
                this.hideLoading();
            } else {
                throw new Error(response.error || 'Failed to load users');
            }
        } catch (error) {
            console.error('Failed to load users:', error);
            this.showError(error.message);
        }
    }

    renderUsers() {
        const tbody = document.getElementById('users-tbody');
        if (!tbody) return;

        if (this.usersData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <i class="bi bi-people fs-1 text-muted mb-3"></i>
                        <h5 class="text-muted" data-i18n="users.messages.noData">No users found</h5>
                        <p class="text-muted" data-i18n="users.messages.noDataMessage">No users match your current filters.</p>
                    </td>
                </tr>
            `;
            if (window.adminI18n) {
                window.adminI18n.refresh();
            }
            return;
        }

        tbody.innerHTML = this.usersData.map(user => `
            <tr>
                <td>
                    <div>
                        <strong>${user.firstName} ${user.lastName}</strong>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>
                    <span class="badge ${this.getRoleBadgeClass(user.role)}">
                        ${this.formatRole(user.role)}
                    </span>
                </td>
                <td>
                    <span class="badge ${user.isActive ? 'bg-success' : 'bg-danger'}">
                        ${user.isActive ? (window.adminI18n ? window.adminI18n.t('users.status.active') : 'Active') : (window.adminI18n ? window.adminI18n.t('users.status.inactive') : 'Inactive')}
                    </span>
                </td>
                <td>${this.formatDate(user.lastLoginAt)}</td>
                <td>${this.formatDate(user.createdAt)}</td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="userManager.viewUser(${user.id})" title="${window.adminI18n ? window.adminI18n.t('users.actions.view') : 'View'}">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="userManager.editUser(${user.id})" title="${window.adminI18n ? window.adminI18n.t('users.actions.edit') : 'Edit'}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-outline-info dropdown-toggle" data-bs-toggle="dropdown" title="${window.adminI18n ? window.adminI18n.t('users.actions.actions') : 'Actions'}">
                                <i class="bi bi-gear"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#" onclick="userManager.toggleUserStatus(${user.id}, ${!user.isActive})">
                                    ${user.isActive ? (window.adminI18n ? window.adminI18n.t('users.actions.deactivate') : 'Deactivate') : (window.adminI18n ? window.adminI18n.t('users.actions.activate') : 'Activate')}
                                </a></li>
                                <li><a class="dropdown-item" href="#" onclick="userManager.showResetPasswordModal(${user.id})">
                                    ${window.adminI18n ? window.adminI18n.t('users.actions.resetPassword') : 'Reset Password'}
                                </a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item text-danger" href="#" onclick="userManager.deleteUser(${user.id})">
                                    ${window.adminI18n ? window.adminI18n.t('users.actions.deleteUser') : 'Delete User'}
                                </a></li>
                            </ul>
                        </div>
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
        const prevText = window.adminI18n ? window.adminI18n.t('users.pagination.previous') : 'Previous';
        paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="userManager.loadUsers(${this.currentPage - 1})" data-i18n="users.pagination.previous">${prevText}</a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= this.totalPages; i++) {
            if (i === 1 || i === this.totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="userManager.loadUsers(${i})">${i}</a>
                    </li>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }

        // Next button
        const nextText = window.adminI18n ? window.adminI18n.t('users.pagination.next') : 'Next';
        paginationHTML += `
            <li class="page-item ${this.currentPage === this.totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="userManager.loadUsers(${this.currentPage + 1})" data-i18n="users.pagination.next">${nextText}</a>
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
            'total-users': stats.totalUsers || 0,
            'active-users': stats.activeUsers || 0,
            'admin-users': stats.adminUsers || 0,
            'editor-users': stats.editorUsers || 0
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    handleSearch() {
        const searchInput = document.getElementById('search-users');
        if (searchInput) {
            this.searchTerm = searchInput.value.trim();
            this.currentPage = 1;
            this.loadUsers();
        }
    }

    async viewUser(id) {
        try {
            const response = await apiService.getUserById(id);
            if (response.success) {
                this.showUserDetails(response.data.user);
            } else {
                throw new Error(response.error || 'Failed to load user details');
            }
        } catch (error) {
            console.error('Failed to view user:', error);
            const errorMessage = window.adminI18n ? window.adminI18n.t('users.messages.viewError') : 'Failed to load user details';
            apiService.showNotification(errorMessage, 'error');
        }
    }

    async editUser(id) {
        try {
            const response = await apiService.getUserById(id);
            if (response.success) {
                this.showEditUserModal(response.data.user);
            } else {
                throw new Error(response.error || 'Failed to load user for editing');
            }
        } catch (error) {
            console.error('Failed to edit user:', error);
            const errorMessage = window.adminI18n ? window.adminI18n.t('users.messages.editError') : 'Failed to load user for editing';
            apiService.showNotification(errorMessage, 'error');
        }
    }

    async toggleUserStatus(id, isActive) {
        try {
            const response = await apiService.updateUserStatus(id, isActive);
            if (response.success) {
                const statusText = isActive ? 
                    (window.adminI18n ? window.adminI18n.t('users.status.active') : 'activated') :
                    (window.adminI18n ? window.adminI18n.t('users.status.inactive') : 'deactivated');
                const successMessage = window.adminI18n ? 
                    window.adminI18n.t('users.messages.toggleSuccess').replace('{status}', statusText) :
                    `User ${statusText} successfully`;
                apiService.showNotification(successMessage, 'success');
                await this.loadUsers(this.currentPage);
                await this.loadUserStats();
            } else {
                throw new Error(response.error || 'Failed to update user status');
            }
        } catch (error) {
            console.error('Failed to update user status:', error);
            const errorMessage = window.adminI18n ? window.adminI18n.t('users.messages.toggleError') : 'Failed to update user status';
            apiService.showNotification(errorMessage, 'error');
        }
    }

    async deleteUser(id) {
        const user = this.usersData.find(u => u.id === id);
        if (!user) return;

        const confirmMessage = window.adminI18n ? 
            window.adminI18n.t('users.messages.deleteConfirm').replace('{userName}', `${user.firstName} ${user.lastName}`) :
            `Are you sure you want to delete user "${user.firstName} ${user.lastName}"? This action cannot be undone.`;
        
        if (confirm(confirmMessage)) {
            try {
                const response = await apiService.deleteUser(id);
                if (response.success) {
                    const successMessage = window.adminI18n ? window.adminI18n.t('users.messages.deleteSuccess') : 'User deleted successfully';
                    apiService.showNotification(successMessage, 'success');
                    await this.loadUsers(this.currentPage);
                    await this.loadUserStats();
                } else {
                    throw new Error(response.error || 'Failed to delete user');
                }
            } catch (error) {
                console.error('Failed to delete user:', error);
                const errorMessage = window.adminI18n ? window.adminI18n.t('users.messages.deleteError') : 'Failed to delete user';
                apiService.showNotification(errorMessage, 'error');
            }
        }
    }

    async exportUsers() {
        try {
            const params = {};
            if (this.filterRole) params.role = this.filterRole;
            if (this.filterStatus) params.status = this.filterStatus;
            if (this.searchTerm) params.search = this.searchTerm;

            const response = await apiService.exportUsers(params);
            if (response.success) {
                // Create download link
                const blob = new Blob([response.data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                const successMessage = window.adminI18n ? window.adminI18n.t('users.messages.exportSuccess') : 'Users exported successfully';
                apiService.showNotification(successMessage, 'success');
            } else {
                throw new Error(response.error || 'Failed to export users');
            }
        } catch (error) {
            console.error('Failed to export users:', error);
            const errorMessage = window.adminI18n ? window.adminI18n.t('users.messages.exportError') : 'Failed to export users';
            apiService.showNotification(errorMessage, 'error');
        }
    }

    showAddUserModal() {
        // Get translations
        const t = window.adminI18n ? window.adminI18n.t.bind(window.adminI18n) : (key) => key;
        
        const modalHTML = `
            <div class="modal fade" id="addUserModal" tabindex="-1" aria-labelledby="addUserModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="addUserModalLabel" data-i18n="users.modal.addTitle">Add New User</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="add-user-form">
                                <div class="mb-3">
                                    <label for="user-first-name" class="form-label" data-i18n="users.form.firstName">First Name *</label>
                                    <input type="text" class="form-control" id="user-first-name" required>
                                </div>
                                <div class="mb-3">
                                    <label for="user-last-name" class="form-label" data-i18n="users.form.lastName">Last Name *</label>
                                    <input type="text" class="form-control" id="user-last-name" required>
                                </div>
                                <div class="mb-3">
                                    <label for="user-email" class="form-label" data-i18n="users.form.email">Email *</label>
                                    <input type="email" class="form-control" id="user-email" required>
                                </div>
                                <div class="mb-3">
                                    <label for="user-password" class="form-label" data-i18n="users.form.password">Password *</label>
                                    <input type="password" class="form-control" id="user-password" required>
                                    <div class="form-text" data-i18n="users.form.passwordRequirements">Password must contain at least 8 characters with uppercase, lowercase, number, and special character.</div>
                                </div>
                                <div class="mb-3">
                                    <label for="user-role" class="form-label" data-i18n="users.form.role">Role</label>
                                    <select class="form-select" id="user-role">
                                        <option value="editor" data-i18n="users.roles.editor">Editor</option>
                                        <option value="admin" data-i18n="users.roles.admin">Admin</option>
                                    </select>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="user-active" checked>
                                    <label class="form-check-label" for="user-active" data-i18n="users.form.active">
                                        Active User
                                    </label>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="users.modal.cancel">Cancel</button>
                            <button type="button" class="btn btn-primary" id="add-user-confirm">
                                <i class="bi bi-person-plus me-2"></i><span data-i18n="users.modal.add">Add User</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('addUserModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Setup add button
        const addBtn = document.getElementById('add-user-confirm');
        addBtn.addEventListener('click', () => this.addUser());

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('addUserModal'));
        modal.show();
        
        // Apply translations to the newly created modal
        if (window.adminI18n) {
            window.adminI18n.refresh();
        }
    }

    async addUser() {
        try {
            const userData = {
                firstName: document.getElementById('user-first-name').value,
                lastName: document.getElementById('user-last-name').value,
                email: document.getElementById('user-email').value,
                password: document.getElementById('user-password').value,
                role: document.getElementById('user-role').value,
                isActive: document.getElementById('user-active').checked
            };

            if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
                const errorMessage = window.adminI18n ? window.adminI18n.t('users.messages.fillRequiredError') : 'Please fill in all required fields';
                apiService.showNotification(errorMessage, 'error');
                return;
            }

            const response = await apiService.createUser(userData);

            if (response.success) {
                const successMessage = window.adminI18n ? window.adminI18n.t('users.messages.addSuccess') : 'User created successfully';
                apiService.showNotification(successMessage, 'success');
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
                modal.hide();
                
                // Reload data
                await this.loadUsers(this.currentPage);
                await this.loadUserStats();
            } else {
                throw new Error(response.error || 'Failed to create user');
            }
        } catch (error) {
            console.error('Failed to add user:', error);
            const errorMessage = window.adminI18n ? 
                window.adminI18n.t('users.messages.addError') + ': ' + error.message :
                'Failed to create user: ' + error.message;
            apiService.showNotification(errorMessage, 'error');
        }
    }

    showEditUserModal(user) {
        // Get translations
        const t = window.adminI18n ? window.adminI18n.t.bind(window.adminI18n) : (key) => key;
        
        const modalHTML = `
            <div class="modal fade" id="editUserModal" tabindex="-1" aria-labelledby="editUserModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="editUserModalLabel" data-i18n="users.modal.editTitle">Edit User: ${user.firstName} ${user.lastName}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="edit-user-form">
                                <div class="mb-3">
                                    <label for="edit-first-name" class="form-label" data-i18n="users.form.firstName">First Name *</label>
                                    <input type="text" class="form-control" id="edit-first-name" value="${user.firstName}" required>
                                </div>
                                <div class="mb-3">
                                    <label for="edit-last-name" class="form-label" data-i18n="users.form.lastName">Last Name *</label>
                                    <input type="text" class="form-control" id="edit-last-name" value="${user.lastName}" required>
                                </div>
                                <div class="mb-3">
                                    <label for="edit-email" class="form-label" data-i18n="users.form.email">Email *</label>
                                    <input type="email" class="form-control" id="edit-email" value="${user.email}" required>
                                </div>
                                <div class="mb-3">
                                    <label for="edit-password" class="form-label" data-i18n="users.form.newPassword">New Password (leave blank to keep current)</label>
                                    <input type="password" class="form-control" id="edit-password">
                                    <div class="form-text" data-i18n="users.form.passwordRequirements">Password must contain at least 8 characters with uppercase, lowercase, number, and special character.</div>
                                </div>
                                <div class="mb-3">
                                    <label for="edit-role" class="form-label" data-i18n="users.form.role">Role</label>
                                    <select class="form-select" id="edit-role">
                                        <option value="editor" ${user.role === 'editor' ? 'selected' : ''} data-i18n="users.roles.editor">Editor</option>
                                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''} data-i18n="users.roles.admin">Admin</option>
                                    </select>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="edit-active" ${user.isActive ? 'checked' : ''}>
                                    <label class="form-check-label" for="edit-active" data-i18n="users.form.active">
                                        Active User
                                    </label>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="users.modal.cancel">Cancel</button>
                            <button type="button" class="btn btn-primary" id="edit-user-confirm">
                                <i class="bi bi-check me-2"></i><span data-i18n="users.modal.saveChanges">Save Changes</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('editUserModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Setup save button
        const saveBtn = document.getElementById('edit-user-confirm');
        saveBtn.addEventListener('click', () => this.saveUserChanges(user.id));

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
        modal.show();
        
        // Apply translations to the newly created modal
        if (window.adminI18n) {
            window.adminI18n.refresh();
        }
    }

    async saveUserChanges(id) {
        try {
            const userData = {
                firstName: document.getElementById('edit-first-name').value,
                lastName: document.getElementById('edit-last-name').value,
                email: document.getElementById('edit-email').value,
                role: document.getElementById('edit-role').value,
                isActive: document.getElementById('edit-active').checked
            };

            const password = document.getElementById('edit-password').value;
            if (password) {
                userData.password = password;
            }

            if (!userData.firstName || !userData.lastName || !userData.email) {
                const errorMessage = window.adminI18n ? window.adminI18n.t('users.messages.fillRequiredError') : 'Please fill in all required fields';
                apiService.showNotification(errorMessage, 'error');
                return;
            }

            const response = await apiService.updateUser(id, userData);

            if (response.success) {
                const successMessage = window.adminI18n ? window.adminI18n.t('users.messages.updateSuccess') : 'User updated successfully';
                apiService.showNotification(successMessage, 'success');
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
                modal.hide();
                
                // Reload data
                await this.loadUsers(this.currentPage);
            } else {
                throw new Error(response.error || 'Failed to update user');
            }
        } catch (error) {
            console.error('Failed to update user:', error);
            const errorMessage = window.adminI18n ? 
                window.adminI18n.t('users.messages.updateError') + ': ' + error.message :
                'Failed to update user: ' + error.message;
            apiService.showNotification(errorMessage, 'error');
        }
    }

    showResetPasswordModal(id) {
        // Get translations
        const t = window.adminI18n ? window.adminI18n.t.bind(window.adminI18n) : (key) => key;
        
        const modalHTML = `
            <div class="modal fade" id="resetPasswordModal" tabindex="-1" aria-labelledby="resetPasswordModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="resetPasswordModalLabel" data-i18n="users.modal.resetPasswordTitle">Reset User Password</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="reset-password-form">
                                <div class="mb-3">
                                    <label for="new-password" class="form-label" data-i18n="users.form.newPassword">New Password *</label>
                                    <input type="password" class="form-control" id="new-password" required>
                                    <div class="form-text" data-i18n="users.form.passwordRequirements">Password must contain at least 8 characters with uppercase, lowercase, number, and special character.</div>
                                </div>
                                <div class="mb-3">
                                    <label for="confirm-password" class="form-label" data-i18n="users.form.confirmPassword">Confirm Password *</label>
                                    <input type="password" class="form-control" id="confirm-password" required>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="users.modal.cancel">Cancel</button>
                            <button type="button" class="btn btn-warning" id="reset-password-confirm">
                                <i class="bi bi-key me-2"></i><span data-i18n="users.modal.resetPassword">Reset Password</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('resetPasswordModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Setup reset button
        const resetBtn = document.getElementById('reset-password-confirm');
        resetBtn.addEventListener('click', () => this.resetUserPassword(id));

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('resetPasswordModal'));
        modal.show();
        
        // Apply translations to the newly created modal
        if (window.adminI18n) {
            window.adminI18n.refresh();
        }
    }

    async resetUserPassword(id) {
        try {
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (!newPassword || !confirmPassword) {
                const errorMessage = window.adminI18n ? window.adminI18n.t('users.messages.fillRequiredError') : 'Please fill in all fields';
                apiService.showNotification(errorMessage, 'error');
                return;
            }

            if (newPassword !== confirmPassword) {
                const errorMessage = window.adminI18n ? window.adminI18n.t('users.messages.passwordMismatchError') : 'Passwords do not match';
                apiService.showNotification(errorMessage, 'error');
                return;
            }

            const response = await apiService.resetUserPassword(id, newPassword);

            if (response.success) {
                const successMessage = window.adminI18n ? window.adminI18n.t('users.messages.resetPasswordSuccess') : 'Password reset successfully';
                apiService.showNotification(successMessage, 'success');
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('resetPasswordModal'));
                modal.hide();
            } else {
                throw new Error(response.error || 'Failed to reset password');
            }
        } catch (error) {
            console.error('Failed to reset password:', error);
            const errorMessage = window.adminI18n ? 
                window.adminI18n.t('users.messages.resetPasswordError') + ': ' + error.message :
                'Failed to reset password: ' + error.message;
            apiService.showNotification(errorMessage, 'error');
        }
    }

    showUserDetails(user) {
        // Get translations
        const t = window.adminI18n ? window.adminI18n.t.bind(window.adminI18n) : (key) => key;
        
        const modalHTML = `
            <div class="modal fade" id="userDetailsModal" tabindex="-1" aria-labelledby="userDetailsModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="userDetailsModalLabel" data-i18n="users.modal.viewTitle">User Details: ${user.firstName} ${user.lastName}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-header">
                                            <h6 class="mb-0" data-i18n="users.modal.personalInfo">Personal Information</h6>
                                        </div>
                                        <div class="card-body">
                                            <p><strong data-i18n="users.modal.name">Name:</strong> ${user.firstName} ${user.lastName}</p>
                                            <p><strong data-i18n="users.form.email">Email:</strong> ${user.email}</p>
                                            <p><strong data-i18n="users.modal.roleLabel">Role:</strong> <span class="badge ${this.getRoleBadgeClass(user.role)}">${this.formatRole(user.role)}</span></p>
                                            <p><strong data-i18n="users.modal.statusLabel">Status:</strong> <span class="badge ${user.isActive ? 'bg-success' : 'bg-danger'}">${user.isActive ? (window.adminI18n ? window.adminI18n.t('users.status.active') : 'Active') : (window.adminI18n ? window.adminI18n.t('users.status.inactive') : 'Inactive')}</span></p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-header">
                                            <h6 class="mb-0" data-i18n="users.modal.accountInfo">Account Information</h6>
                                        </div>
                                        <div class="card-body">
                                            <p><strong data-i18n="users.modal.created">Created:</strong> ${this.formatDate(user.createdAt)}</p>
                                            <p><strong data-i18n="users.modal.lastUpdated">Last Updated:</strong> ${this.formatDate(user.updatedAt)}</p>
                                            <p><strong data-i18n="users.modal.lastLogin">Last Login:</strong> ${this.formatDate(user.lastLoginAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="users.modal.close">Close</button>
                            <button type="button" class="btn btn-primary" onclick="userManager.editUser(${user.id})">
                                <i class="bi bi-pencil me-2"></i><span data-i18n="users.modal.editUser">Edit User</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('userDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('userDetailsModal'));
        modal.show();
        
        // Apply translations to the newly created modal
        if (window.adminI18n) {
            window.adminI18n.refresh();
        }
    }

    getRoleBadgeClass(role) {
        switch (role) {
            case 'admin': return 'bg-warning';
            case 'editor': return 'bg-info';
            default: return 'bg-secondary';
        }
    }

    formatRole(role) {
        if (window.adminI18n) {
            return window.adminI18n.t(`users.roles.${role}`) || role.charAt(0).toUpperCase() + role.slice(1);
        }
        return role.charAt(0).toUpperCase() + role.slice(1);
    }

    formatDate(dateString) {
        if (!dateString) return window.adminI18n ? window.adminI18n.t('users.messages.never') : 'Never';
        return new Date(dateString).toLocaleDateString();
    }

    showLoading() {
        const loadingState = document.getElementById('loading-state');
        const errorState = document.getElementById('error-state');
        const tableContainer = document.getElementById('users-table-container');
        
        if (loadingState) loadingState.style.display = 'block';
        if (errorState) errorState.style.display = 'none';
        if (tableContainer) tableContainer.style.display = 'none';
    }

    hideLoading() {
        const loadingState = document.getElementById('loading-state');
        const tableContainer = document.getElementById('users-table-container');
        
        if (loadingState) loadingState.style.display = 'none';
        if (tableContainer) tableContainer.style.display = 'block';
    }

    showError(message) {
        const loadingState = document.getElementById('loading-state');
        const errorState = document.getElementById('error-state');
        const errorMessage = document.getElementById('error-message');
        const tableContainer = document.getElementById('users-table-container');
        
        if (loadingState) loadingState.style.display = 'none';
        if (errorState) errorState.style.display = 'block';
        if (errorMessage) errorMessage.textContent = message;
        if (tableContainer) tableContainer.style.display = 'none';
    }
}

// Initialize user manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.userManager = new UserManager();
});
