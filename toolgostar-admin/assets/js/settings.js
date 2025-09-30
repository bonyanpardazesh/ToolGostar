/**
 * Site Settings Management JavaScript
 * Handles all site settings-related functionality in the admin panel
 */

class SettingsManager {
    constructor() {
        this.currentCategory = 'general';
        this.settingsData = {};
        this.originalSettings = {};
        
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
            await this.loadSettings();

            // Setup event listeners
            this.setupEventListeners();

            // Listen for language changes to refresh settings content
            window.addEventListener('languageChanged', () => {
                this.renderSettings();
            });

        } catch (error) {
            console.error('Settings Manager initialization error:', error);
            const errorMessage = window.adminI18n ? window.adminI18n.t('settings.messages.initError') : 'Failed to initialize settings management';
            this.showError(errorMessage);
        }
    }

    setupEventListeners() {
        // Category navigation
        const categoryButtons = document.querySelectorAll('[data-category]');
        categoryButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchCategory(e.target.dataset.category);
            });
        });

        // Form submission
        const settingsForm = document.getElementById('settings-form');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSettings();
            });
        }

        // Export button
        const exportBtn = document.getElementById('export-settings-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportSettings());
        }

        // Import button
        const importBtn = document.getElementById('import-settings-btn');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.showImportModal());
        }

        // Add setting button
        const addBtn = document.getElementById('add-setting-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddSettingModal());
        }

        // Reset button
        const resetBtn = document.getElementById('reset-settings-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetSettings());
        }

        // Retry button
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.loadSettings());
        }
    }

    async loadSettings(category = null) {
        try {
            this.showLoading();
            
            const response = await apiService.getSettings(category || this.currentCategory);
            
            if (response.success) {
                this.settingsData = response.data.settings;
                this.originalSettings = JSON.parse(JSON.stringify(this.settingsData));
                this.renderSettings();
                this.hideLoading();
            } else {
                throw new Error(response.error || 'Failed to load settings');
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            this.showError(error.message);
        }
    }

    switchCategory(category) {
        this.currentCategory = category;
        
        // Update active button
        document.querySelectorAll('[data-category]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        // Update title
        const title = document.getElementById('settings-category-title');
        if (title) {
            title.textContent = this.getCategoryTitle(category);
        }
        
        // Load settings for this category
        this.loadSettings(category);
    }

    getCategoryTitle(category) {
        if (window.adminI18n) {
            return window.adminI18n.t(`settings.categoryTitles.${category}`) || window.adminI18n.t('settings.title');
        }
        const titles = {
            'general': 'General Settings',
            'company': 'Company Information',
            'contact': 'Contact Information',
            'social': 'Social Media Links',
            'seo': 'SEO Settings',
            'analytics': 'Analytics & Tracking',
            'email': 'Email Configuration'
        };
        return titles[category] || 'Settings';
    }

    renderSettings() {
        const container = document.getElementById('settings-fields');
        if (!container) return;

        const categorySettings = this.settingsData[this.currentCategory] || [];
        
        if (categorySettings.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <i class="bi bi-gear fs-1 text-muted mb-3"></i>
                    <h5 class="text-muted" data-i18n="settings.messages.noData">No settings found</h5>
                    <p class="text-muted" data-i18n="settings.messages.noDataMessage">No settings configured for this category yet.</p>
                    <button class="btn btn-primary" onclick="settingsManager.showAddSettingModal()">
                        <i class="bi bi-plus me-2"></i><span data-i18n="settings.actions.addFirst">Add First Setting</span>
                    </button>
                </div>
            `;
            if (window.adminI18n) {
                window.adminI18n.refresh();
            }
            return;
        }

        container.innerHTML = categorySettings.map(setting => `
            <div class="row mb-3">
                <div class="col-md-3">
                    <label class="form-label fw-bold">${this.formatSettingKey(setting.settingKey)}</label>
                    ${setting.description ? `<small class="text-muted d-block">${setting.description}</small>` : ''}
                </div>
                <div class="col-md-6">
                    ${this.renderSettingInput(setting)}
                </div>
                <div class="col-md-3">
                    <div class="d-flex gap-1">
                        <button class="btn btn-sm btn-outline-secondary" onclick="settingsManager.editSetting('${setting.settingKey}')" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="settingsManager.deleteSetting('${setting.settingKey}')" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        if (window.adminI18n) {
            window.adminI18n.refresh();
        }
    }

    renderSettingInput(setting) {
        const value = this.parseSettingValue(setting.settingValue, setting.settingType);
        
        switch (setting.settingType) {
            case 'boolean':
                return `
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" 
                               id="setting-${setting.settingKey}" 
                               name="${setting.settingKey}" 
                               ${value ? 'checked' : ''}>
                        <label class="form-check-label" for="setting-${setting.settingKey}">
                            ${value ? (window.adminI18n ? window.adminI18n.t('settings.boolean.enabled') : 'Enabled') : (window.adminI18n ? window.adminI18n.t('settings.boolean.disabled') : 'Disabled')}
                        </label>
                    </div>
                `;
            
            case 'number':
                return `
                    <input type="number" class="form-control" 
                           id="setting-${setting.settingKey}" 
                           name="${setting.settingKey}" 
                           value="${value}">
                `;
            
            case 'json':
                return `
                    <textarea class="form-control" rows="3" 
                              id="setting-${setting.settingKey}" 
                              name="${setting.settingKey}" 
                              placeholder="Enter JSON data">${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}</textarea>
                `;
            
            case 'string':
            default:
                if (setting.settingKey.includes('email')) {
                    return `
                        <input type="email" class="form-control" 
                               id="setting-${setting.settingKey}" 
                               name="${setting.settingKey}" 
                               value="${value}">
                    `;
                } else if (setting.settingKey.includes('url') || setting.settingKey.includes('link')) {
                    return `
                        <input type="url" class="form-control" 
                               id="setting-${setting.settingKey}" 
                               name="${setting.settingKey}" 
                               value="${value}">
                    `;
                } else {
                    return `
                        <input type="text" class="form-control" 
                               id="setting-${setting.settingKey}" 
                               name="${setting.settingKey}" 
                               value="${value}">
                    `;
                }
        }
    }

    parseSettingValue(value, type) {
        switch (type) {
            case 'boolean':
                return value === 'true';
            case 'number':
                return Number(value);
            case 'json':
                try {
                    return JSON.parse(value);
                } catch (error) {
                    return value;
                }
            default:
                return value;
        }
    }

    formatSettingKey(key) {
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    async saveSettings() {
        try {
            const formData = new FormData(document.getElementById('settings-form'));
            const settings = [];
            
            for (const [key, value] of formData.entries()) {
                const setting = this.settingsData[this.currentCategory].find(s => s.settingKey === key);
                if (setting) {
                    let processedValue = value;
                    
                    // Process value based on type
                    switch (setting.settingType) {
                        case 'boolean':
                            processedValue = value === 'on' ? 'true' : 'false';
                            break;
                        case 'number':
                            processedValue = Number(value).toString();
                            break;
                        case 'json':
                            try {
                                JSON.parse(value);
                                processedValue = value;
                            } catch (error) {
                                throw new Error(`Invalid JSON in ${key}: ${error.message}`);
                            }
                            break;
                    }
                    
                    settings.push({
                        key: key,
                        value: processedValue,
                        type: setting.settingType
                    });
                }
            }

            const response = await apiService.updateBulkSettings(settings);
            
            if (response.success) {
                const successMessage = window.adminI18n ? window.adminI18n.t('settings.messages.saveSuccess') : 'Settings saved successfully';
                apiService.showNotification(successMessage, 'success');
                await this.loadSettings(this.currentCategory);
            } else {
                throw new Error(response.error || 'Failed to save settings');
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            const errorMessage = window.adminI18n ? 
                window.adminI18n.t('settings.messages.saveError') + ': ' + error.message :
                'Failed to save settings: ' + error.message;
            apiService.showNotification(errorMessage, 'error');
        }
    }

    async exportSettings() {
        try {
            const response = await apiService.exportSettings();
            if (response.success) {
                // Create download link
                const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `site-settings-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                const successMessage = window.adminI18n ? window.adminI18n.t('settings.messages.exportSuccess') : 'Settings exported successfully';
                apiService.showNotification(successMessage, 'success');
            } else {
                throw new Error(response.error || 'Failed to export settings');
            }
        } catch (error) {
            console.error('Failed to export settings:', error);
            const errorMessage = window.adminI18n ? window.adminI18n.t('settings.messages.exportError') : 'Failed to export settings';
            apiService.showNotification(errorMessage, 'error');
        }
    }

    showImportModal() {
        // Get translations
        const t = window.adminI18n ? window.adminI18n.t.bind(window.adminI18n) : (key) => key;
        
        const modalHTML = `
            <div class="modal fade" id="importSettingsModal" tabindex="-1" aria-labelledby="importSettingsModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="importSettingsModalLabel" data-i18n="settings.modal.importTitle">Import Settings</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label for="settings-file" class="form-label" data-i18n="settings.modal.selectFile">Select JSON File</label>
                                <input type="file" class="form-control" id="settings-file" accept=".json">
                                <div class="form-text" data-i18n="settings.modal.selectFileDesc">Select a JSON file exported from the settings system.</div>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="overwrite-existing">
                                <label class="form-check-label" for="overwrite-existing" data-i18n="settings.modal.overwriteExisting">
                                    Overwrite existing settings
                                </label>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="settings.modal.cancel">Cancel</button>
                            <button type="button" class="btn btn-primary" id="import-settings-confirm">
                                <i class="bi bi-upload me-2"></i><span data-i18n="settings.modal.import">Import Settings</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('importSettingsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Setup import button
        const importBtn = document.getElementById('import-settings-confirm');
        importBtn.addEventListener('click', () => this.importSettings());

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('importSettingsModal'));
        modal.show();
        
        // Apply translations to the newly created modal
        if (window.adminI18n) {
            window.adminI18n.refresh();
        }
    }

    async importSettings() {
        try {
            const fileInput = document.getElementById('settings-file');
            const overwrite = document.getElementById('overwrite-existing').checked;

            if (!fileInput.files[0]) {
                const errorMessage = window.adminI18n ? window.adminI18n.t('settings.messages.selectFileError') : 'Please select a file to import';
                apiService.showNotification(errorMessage, 'error');
                return;
            }

            const file = fileInput.files[0];
            const text = await file.text();
            const data = JSON.parse(text);

            if (!data.settings || !Array.isArray(data.settings)) {
                const errorMessage = window.adminI18n ? window.adminI18n.t('settings.messages.invalidFileError') : 'Invalid settings file format';
                throw new Error(errorMessage);
            }

            const response = await apiService.importSettings(data.settings, overwrite);

            if (response.success) {
                const successMessage = window.adminI18n ? window.adminI18n.t('settings.messages.importSuccess') : 'Settings imported successfully';
                apiService.showNotification(successMessage, 'success');
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('importSettingsModal'));
                modal.hide();
                
                // Reload settings
                await this.loadSettings(this.currentCategory);
            } else {
                throw new Error(response.error || 'Failed to import settings');
            }
        } catch (error) {
            console.error('Failed to import settings:', error);
            const errorMessage = window.adminI18n ? 
                window.adminI18n.t('settings.messages.importError') + ': ' + error.message :
                'Failed to import settings: ' + error.message;
            apiService.showNotification(errorMessage, 'error');
        }
    }

    showAddSettingModal() {
        // Get translations
        const t = window.adminI18n ? window.adminI18n.t.bind(window.adminI18n) : (key) => key;
        
        const modalHTML = `
            <div class="modal fade" id="addSettingModal" tabindex="-1" aria-labelledby="addSettingModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="addSettingModalLabel" data-i18n="settings.modal.addTitle">Add New Setting</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="add-setting-form">
                                <div class="mb-3">
                                    <label for="setting-key" class="form-label" data-i18n="settings.modal.settingKey">Setting Key *</label>
                                    <input type="text" class="form-control" id="setting-key" required pattern="^[a-z_]+$">
                                    <div class="form-text" data-i18n="settings.modal.settingKeyDesc">Use lowercase letters and underscores only (e.g., site_name)</div>
                                </div>
                                <div class="mb-3">
                                    <label for="setting-value" class="form-label" data-i18n="settings.modal.settingValue">Setting Value *</label>
                                    <input type="text" class="form-control" id="setting-value" required>
                                </div>
                                <div class="mb-3">
                                    <label for="setting-type" class="form-label" data-i18n="settings.modal.settingType">Setting Type</label>
                                    <select class="form-select" id="setting-type">
                                        <option value="string" data-i18n="settings.types.string">String</option>
                                        <option value="number" data-i18n="settings.types.number">Number</option>
                                        <option value="boolean" data-i18n="settings.types.boolean">Boolean</option>
                                        <option value="json" data-i18n="settings.types.json">JSON</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="setting-category" class="form-label" data-i18n="settings.modal.settingCategory">Category</label>
                                    <select class="form-select" id="setting-category">
                                        <option value="general" data-i18n="settings.categories.general">General</option>
                                        <option value="company" data-i18n="settings.categories.company">Company</option>
                                        <option value="contact" data-i18n="settings.categories.contact">Contact</option>
                                        <option value="social" data-i18n="settings.categories.social">Social Media</option>
                                        <option value="seo" data-i18n="settings.categories.seo">SEO</option>
                                        <option value="analytics" data-i18n="settings.categories.analytics">Analytics</option>
                                        <option value="email" data-i18n="settings.categories.email">Email</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="setting-description" class="form-label" data-i18n="settings.modal.settingDescription">Description</label>
                                    <textarea class="form-control" id="setting-description" rows="3"></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="settings.modal.cancel">Cancel</button>
                            <button type="button" class="btn btn-primary" id="add-setting-confirm">
                                <i class="bi bi-plus me-2"></i><span data-i18n="settings.modal.add">Add Setting</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('addSettingModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Setup add button
        const addBtn = document.getElementById('add-setting-confirm');
        addBtn.addEventListener('click', () => this.addSetting());

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('addSettingModal'));
        modal.show();
        
        // Apply translations to the newly created modal
        if (window.adminI18n) {
            window.adminI18n.refresh();
        }
    }

    async addSetting() {
        try {
            const key = document.getElementById('setting-key').value;
            const value = document.getElementById('setting-value').value;
            const type = document.getElementById('setting-type').value;
            const category = document.getElementById('setting-category').value;
            const description = document.getElementById('setting-description').value;

            if (!key || !value) {
                const errorMessage = window.adminI18n ? window.adminI18n.t('settings.messages.fillRequiredError') : 'Please fill in all required fields';
                apiService.showNotification(errorMessage, 'error');
                return;
            }

            const response = await apiService.createSetting(key, value, type, category, description);

            if (response.success) {
                const successMessage = window.adminI18n ? window.adminI18n.t('settings.messages.addSuccess') : 'Setting added successfully';
                apiService.showNotification(successMessage, 'success');
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('addSettingModal'));
                modal.hide();
                
                // Reload settings
                await this.loadSettings(this.currentCategory);
            } else {
                throw new Error(response.error || 'Failed to add setting');
            }
        } catch (error) {
            console.error('Failed to add setting:', error);
            const errorMessage = window.adminI18n ? 
                window.adminI18n.t('settings.messages.addError') + ': ' + error.message :
                'Failed to add setting: ' + error.message;
            apiService.showNotification(errorMessage, 'error');
        }
    }

    async editSetting(key) {
        // This would open an edit modal similar to add setting
        // For now, we'll just show a simple prompt
        const setting = this.settingsData[this.currentCategory].find(s => s.settingKey === key);
        if (!setting) return;

        const newValue = prompt(`Edit ${this.formatSettingKey(key)}:`, setting.settingValue);
        if (newValue !== null && newValue !== setting.settingValue) {
            try {
                const response = await apiService.updateSetting(key, newValue, setting.settingType);
                if (response.success) {
                    const successMessage = window.adminI18n ? window.adminI18n.t('settings.messages.updateSuccess') : 'Setting updated successfully';
                    apiService.showNotification(successMessage, 'success');
                    await this.loadSettings(this.currentCategory);
                } else {
                    throw new Error(response.error || 'Failed to update setting');
                }
            } catch (error) {
                console.error('Failed to update setting:', error);
                const errorMessage = window.adminI18n ? window.adminI18n.t('settings.messages.updateError') : 'Failed to update setting';
                apiService.showNotification(errorMessage, 'error');
            }
        }
    }

    async deleteSetting(key) {
        const confirmMessage = window.adminI18n ? 
            window.adminI18n.t('settings.messages.deleteConfirm').replace('{settingName}', this.formatSettingKey(key)) :
            `Are you sure you want to delete the setting "${this.formatSettingKey(key)}"?`;
        
        if (confirm(confirmMessage)) {
            try {
                const response = await apiService.deleteSetting(key);
                if (response.success) {
                    const successMessage = window.adminI18n ? window.adminI18n.t('settings.messages.deleteSuccess') : 'Setting deleted successfully';
                    apiService.showNotification(successMessage, 'success');
                    await this.loadSettings(this.currentCategory);
                } else {
                    throw new Error(response.error || 'Failed to delete setting');
                }
            } catch (error) {
                console.error('Failed to delete setting:', error);
                const errorMessage = window.adminI18n ? window.adminI18n.t('settings.messages.deleteError') : 'Failed to delete setting';
                apiService.showNotification(errorMessage, 'error');
            }
        }
    }

    async resetSettings() {
        const confirmMessage = window.adminI18n ? 
            window.adminI18n.t('settings.messages.resetConfirm') :
            'Are you sure you want to reset all settings to their default values? This action cannot be undone.';
        
        if (confirm(confirmMessage)) {
            try {
                // This would reset to default values
                // For now, we'll just reload the original settings
                this.settingsData = JSON.parse(JSON.stringify(this.originalSettings));
                this.renderSettings();
                const successMessage = window.adminI18n ? window.adminI18n.t('settings.messages.resetSuccess') : 'Settings reset to original values';
                apiService.showNotification(successMessage, 'success');
            } catch (error) {
                console.error('Failed to reset settings:', error);
                const errorMessage = window.adminI18n ? window.adminI18n.t('settings.messages.resetError') : 'Failed to reset settings';
                apiService.showNotification(errorMessage, 'error');
            }
        }
    }

    showLoading() {
        const loadingState = document.getElementById('loading-state');
        const errorState = document.getElementById('error-state');
        const settingsContainer = document.getElementById('settings-container');
        
        if (loadingState) loadingState.style.display = 'block';
        if (errorState) errorState.style.display = 'none';
        if (settingsContainer) settingsContainer.style.display = 'none';
    }

    hideLoading() {
        const loadingState = document.getElementById('loading-state');
        const settingsContainer = document.getElementById('settings-container');
        
        if (loadingState) loadingState.style.display = 'none';
        if (settingsContainer) settingsContainer.style.display = 'block';
    }

    showError(message) {
        const loadingState = document.getElementById('loading-state');
        const errorState = document.getElementById('error-state');
        const errorMessage = document.getElementById('error-message');
        const settingsContainer = document.getElementById('settings-container');
        
        if (loadingState) loadingState.style.display = 'none';
        if (errorState) errorState.style.display = 'block';
        if (errorMessage) errorMessage.textContent = message;
        if (settingsContainer) settingsContainer.style.display = 'none';
    }
}

// Initialize settings manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
});
