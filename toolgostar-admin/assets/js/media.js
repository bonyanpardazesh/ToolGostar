/**
 * Media Library Management JavaScript
 * Handles all media-related functionality in the admin panel
 */

class MediaManager {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 1;
        this.searchTerm = '';
        this.filterType = '';
        this.mediaData = [];
        
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
            await this.loadMediaStats();
            await this.loadMedia();

            // Setup event listeners
            this.setupEventListeners();

            // Listen for language changes to refresh media content
            window.addEventListener('languageChanged', () => {
                this.renderMedia();
            });

        } catch (error) {
            console.error('Media Manager initialization error:', error);
            const errorMessage = window.adminI18n ? window.adminI18n.t('media.messages.initError') : 'Failed to initialize media management';
            this.showError(errorMessage);
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-media');
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

        // Filter by type
        const filterItems = document.querySelectorAll('.dropdown-item[data-type]');
        filterItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterType = e.target.dataset.type;
                this.currentPage = 1;
                this.loadMedia();
                
                // Update dropdown button text
                const dropdownBtn = document.getElementById('filter-type');
                dropdownBtn.innerHTML = `<i class="bi bi-funnel me-2"></i>${e.target.textContent}`;
            });
        });

        // Upload media button
        const uploadBtn = document.getElementById('upload-media-btn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => this.showUploadModal());
        }

        // Retry button
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.loadMedia());
        }
    }

    async loadMediaStats() {
        try {
            const response = await apiService.getMediaStats();
            if (response.success) {
                this.updateStatsDisplay(response.data.stats);
            }
        } catch (error) {
            console.error('Failed to load media stats:', error);
        }
    }

    async loadMedia(page = 1) {
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

            if (this.filterType) {
                params.type = this.filterType;
            }

            const response = await apiService.getMedia(params);
            
            if (response.success) {
                this.mediaData = response.data.media;
                this.currentPage = response.data.pagination.currentPage;
                this.totalPages = response.data.pagination.totalPages;
                
                this.renderMedia();
                this.renderPagination();
                this.hideLoading();
            } else {
                throw new Error(response.error || 'Failed to load media');
            }
        } catch (error) {
            console.error('Failed to load media:', error);
            this.showError(error.message);
        }
    }

    renderMedia() {
        const grid = document.getElementById('media-grid');
        if (!grid) return;

        if (this.mediaData.length === 0) {
            grid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-images fs-1 text-muted mb-3"></i>
                    <h5 class="text-muted" data-i18n="media.messages.noData">No media files found</h5>
                    <p class="text-muted" data-i18n="media.messages.noDataMessage">Start by uploading your first media file.</p>
                    <button class="btn btn-primary" onclick="mediaManager.showUploadModal()">
                        <i class="bi bi-upload me-2"></i><span data-i18n="media.actions.upload">Upload Media</span>
                    </button>
                </div>
            `;
            if (window.adminI18n) {
                window.adminI18n.refresh();
            }
            return;
        }

        grid.innerHTML = this.mediaData.map(media => `
            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <div class="card h-100 media-card" data-media-id="${media.id}">
                    <div class="card-img-top media-preview" style="height: 200px; background: #f8f9fa; display: flex; align-items: center; justify-content: center;">
                        ${this.getMediaPreview(media)}
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h6 class="card-title text-truncate" title="${media.originalName}">${media.originalName}</h6>
                        <p class="card-text small text-muted mb-2">
                            <span class="badge ${this.getTypeBadgeClass(media.fileType)}">${media.fileType}</span>
                            <span class="ms-2">${this.formatFileSize(media.fileSize)}</span>
                        </p>
                        <p class="card-text small text-muted">
                            Uploaded by ${media.uploader?.firstName || ''} ${media.uploader?.lastName || ''}
                        </p>
                        <div class="mt-auto">
                            <div class="btn-group w-100" role="group">
                                <button class="btn btn-sm btn-outline-primary" onclick="mediaManager.viewMedia(${media.id})" title="View">
                                    <i class="bi bi-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-secondary" onclick="mediaManager.editMedia(${media.id})" title="Edit">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="mediaManager.deleteMedia(${media.id})" title="Delete">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        if (window.adminI18n) {
            window.adminI18n.refresh();
        }
    }

    getMediaPreview(media) {
        if (media.fileType === 'image') {
            return `<img src="${media.fileUrl}" alt="${media.altText || media.originalName}" style="max-width: 100%; max-height: 100%; object-fit: cover;">`;
        } else if (media.fileType === 'video') {
            const videoText = window.adminI18n ? window.adminI18n.t('media.fileTypes.video') : 'Video';
            return `<i class="bi bi-play-circle fs-1 text-primary"></i><br><small class="text-muted">${videoText}</small>`;
        } else if (media.fileType === 'audio') {
            const audioText = window.adminI18n ? window.adminI18n.t('media.fileTypes.audio') : 'Audio';
            return `<i class="bi bi-music-note-beamed fs-1 text-success"></i><br><small class="text-muted">${audioText}</small>`;
        } else if (media.fileType === 'document') {
            const documentText = window.adminI18n ? window.adminI18n.t('media.fileTypes.document') : 'Document';
            return `<i class="bi bi-file-earmark-text fs-1 text-warning"></i><br><small class="text-muted">${documentText}</small>`;
        } else {
            const fileText = window.adminI18n ? window.adminI18n.t('media.fileTypes.file') : 'File';
            return `<i class="bi bi-file fs-1 text-secondary"></i><br><small class="text-muted">${fileText}</small>`;
        }
    }

    getTypeBadgeClass(type) {
        switch (type) {
            case 'image': return 'bg-success';
            case 'video': return 'bg-primary';
            case 'audio': return 'bg-info';
            case 'document': return 'bg-warning';
            default: return 'bg-secondary';
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
        const prevText = window.adminI18n ? window.adminI18n.t('media.pagination.previous') : 'Previous';
        paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="mediaManager.loadMedia(${this.currentPage - 1})" data-i18n="media.pagination.previous">${prevText}</a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= this.totalPages; i++) {
            if (i === 1 || i === this.totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="mediaManager.loadMedia(${i})">${i}</a>
                    </li>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }

        // Next button
        const nextText = window.adminI18n ? window.adminI18n.t('media.pagination.next') : 'Next';
        paginationHTML += `
            <li class="page-item ${this.currentPage === this.totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="mediaManager.loadMedia(${this.currentPage + 1})" data-i18n="media.pagination.next">${nextText}</a>
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
            'total-media': stats.totalMedia || 0,
            'image-count': stats.imageCount || 0,
            'document-count': stats.documentCount || 0,
            'total-size': stats.totalSize || '0 MB'
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    handleSearch() {
        const searchInput = document.getElementById('search-media');
        if (searchInput) {
            this.searchTerm = searchInput.value.trim();
            this.currentPage = 1;
            this.loadMedia();
        }
    }

    async viewMedia(id) {
        try {
            const response = await apiService.getMediaById(id);
            if (response.success) {
                this.showMediaDetails(response.data.media);
            } else {
                throw new Error(response.error || 'Failed to load media details');
            }
        } catch (error) {
            console.error('Failed to view media:', error);
            const errorMessage = window.adminI18n ? window.adminI18n.t('media.messages.viewError') : 'Failed to load media details';
            apiService.showNotification(errorMessage, 'error');
        }
    }

    async editMedia(id) {
        try {
            const response = await apiService.getMediaById(id);
            if (response.success) {
                this.showEditMediaModal(response.data.media);
            } else {
                throw new Error(response.error || 'Failed to load media for editing');
            }
        } catch (error) {
            console.error('Failed to edit media:', error);
            const errorMessage = window.adminI18n ? window.adminI18n.t('media.messages.editError') : 'Failed to load media for editing';
            apiService.showNotification(errorMessage, 'error');
        }
    }

    async deleteMedia(id) {
        const media = this.mediaData.find(m => m.id === id);
        if (!media) return;

        const confirmMessage = window.adminI18n ? 
            window.adminI18n.t('media.messages.deleteConfirm').replace('{fileName}', media.originalName) :
            `Are you sure you want to delete "${media.originalName}"? This action cannot be undone.`;
        
        if (confirm(confirmMessage)) {
            try {
                const response = await apiService.deleteMedia(id);
                if (response.success) {
                    const successMessage = window.adminI18n ? window.adminI18n.t('media.messages.deleteSuccess') : 'Media file deleted successfully';
                    apiService.showNotification(successMessage, 'success');
                    await this.loadMedia(this.currentPage);
                    await this.loadMediaStats();
                } else {
                    throw new Error(response.error || 'Failed to delete media');
                }
            } catch (error) {
                console.error('Failed to delete media:', error);
                const errorMessage = window.adminI18n ? window.adminI18n.t('media.messages.deleteError') : 'Failed to delete media file';
                apiService.showNotification(errorMessage, 'error');
            }
        }
    }

    showUploadModal() {
        // Get translations
        const t = window.adminI18n ? window.adminI18n.t.bind(window.adminI18n) : (key) => key;
        
        // Create modal HTML
        const modalHTML = `
            <div class="modal fade" id="uploadModal" tabindex="-1" aria-labelledby="uploadModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="uploadModalLabel" data-i18n="media.modal.uploadTitle">Upload Media File</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="upload-form" enctype="multipart/form-data">
                                <div class="mb-3">
                                    <label for="media-file" class="form-label" data-i18n="media.modal.selectFile">Select File *</label>
                                    <input type="file" class="form-control" id="media-file" required accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt">
                                    <div class="form-text" data-i18n="media.modal.supportedFormats">Supported formats: Images, Videos, Audio, PDF, Word, Excel, PowerPoint, Text files. Max size: 10MB</div>
                                </div>
                                <div class="mb-3">
                                    <label for="media-alt-text" class="form-label" data-i18n="media.modal.altText">Alt Text</label>
                                    <input type="text" class="form-control" id="media-alt-text" placeholder="Describe the media for accessibility" data-i18n-placeholder="media.modal.altTextPlaceholder">
                                </div>
                                <div class="mb-3">
                                    <label for="media-caption" class="form-label" data-i18n="media.modal.caption">Caption</label>
                                    <textarea class="form-control" id="media-caption" rows="3" placeholder="Optional caption for the media" data-i18n-placeholder="media.modal.captionPlaceholder"></textarea>
                                </div>
                                <div class="mb-3">
                                    <label for="media-tags" class="form-label" data-i18n="media.modal.tags">Tags</label>
                                    <input type="text" class="form-control" id="media-tags" placeholder="Enter tags separated by commas" data-i18n-placeholder="media.modal.tagsPlaceholder">
                                    <div class="form-text" data-i18n="media.modal.tagsExample">Example: product, showcase, featured</div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="media.modal.cancel">Cancel</button>
                            <button type="button" class="btn btn-primary" id="upload-btn">
                                <i class="bi bi-upload me-2"></i><span data-i18n="media.modal.upload">Upload File</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('uploadModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Setup upload button
        const uploadBtn = document.getElementById('upload-btn');
        uploadBtn.addEventListener('click', () => this.uploadMedia());

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('uploadModal'));
        modal.show();
        
        // Apply translations to the newly created modal
        if (window.adminI18n) {
            window.adminI18n.refresh();
        }
    }

    async uploadMedia() {
        try {
            const fileInput = document.getElementById('media-file');
            const altText = document.getElementById('media-alt-text').value;
            const caption = document.getElementById('media-caption').value;
            const tags = document.getElementById('media-tags').value;

            if (!fileInput.files[0]) {
                const errorMessage = window.adminI18n ? window.adminI18n.t('media.messages.selectFileError') : 'Please select a file to upload';
                apiService.showNotification(errorMessage, 'error');
                return;
            }

            // Create FormData
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);
            if (altText) formData.append('altText', altText);
            if (caption) formData.append('caption', caption);
            if (tags) formData.append('tags', tags);

            // Show loading state
            const uploadBtn = document.getElementById('upload-btn');
            const originalText = uploadBtn.innerHTML;
            const uploadingText = window.adminI18n ? window.adminI18n.t('media.modal.uploading') : 'Uploading...';
            uploadBtn.innerHTML = `<i class="bi bi-hourglass-split me-2"></i>${uploadingText}`;
            uploadBtn.disabled = true;

            const response = await apiService.uploadMedia(formData);

            if (response.success) {
                const successMessage = window.adminI18n ? window.adminI18n.t('media.messages.uploadSuccess') : 'Media file uploaded successfully';
                apiService.showNotification(successMessage, 'success');
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('uploadModal'));
                modal.hide();
                
                // Reload data
                await this.loadMedia(this.currentPage);
                await this.loadMediaStats();
            } else {
                throw new Error(response.error || 'Failed to upload media');
            }
        } catch (error) {
            console.error('Failed to upload media:', error);
            const errorMessage = window.adminI18n ? window.adminI18n.t('media.messages.uploadError') : 'Failed to upload media file';
            apiService.showNotification(errorMessage, 'error');
        } finally {
            // Reset button state
            const uploadBtn = document.getElementById('upload-btn');
            if (uploadBtn) {
                const uploadText = window.adminI18n ? window.adminI18n.t('media.modal.upload') : 'Upload File';
                uploadBtn.innerHTML = `<i class="bi bi-upload me-2"></i>${uploadText}`;
                uploadBtn.disabled = false;
            }
        }
    }

    showEditMediaModal(media) {
        // Get translations
        const t = window.adminI18n ? window.adminI18n.t.bind(window.adminI18n) : (key) => key;
        
        // Create modal HTML for editing media metadata
        const modalHTML = `
            <div class="modal fade" id="editMediaModal" tabindex="-1" aria-labelledby="editMediaModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="editMediaModalLabel" data-i18n="media.modal.editTitle">Edit Media Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="edit-media-form">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label" data-i18n="media.modal.fileName">File Name</label>
                                            <input type="text" class="form-control" value="${media.originalName}" readonly>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label" data-i18n="media.modal.fileType">File Type</label>
                                            <input type="text" class="form-control" value="${media.fileType}" readonly>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label" data-i18n="media.modal.fileSize">File Size</label>
                                            <input type="text" class="form-control" value="${this.formatFileSize(media.fileSize)}" readonly>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="edit-alt-text" class="form-label" data-i18n="media.modal.altText">Alt Text</label>
                                            <input type="text" class="form-control" id="edit-alt-text" value="${media.altText || ''}">
                                        </div>
                                        <div class="mb-3">
                                            <label for="edit-caption" class="form-label" data-i18n="media.modal.caption">Caption</label>
                                            <textarea class="form-control" id="edit-caption" rows="3">${media.caption || ''}</textarea>
                                        </div>
                                        <div class="mb-3">
                                            <label for="edit-tags" class="form-label" data-i18n="media.modal.tags">Tags</label>
                                            <input type="text" class="form-control" id="edit-tags" value="${this.getTagsAsString(media.tags)}">
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="media.modal.cancel">Cancel</button>
                            <button type="button" class="btn btn-primary" id="save-media-btn">
                                <i class="bi bi-check me-2"></i><span data-i18n="media.modal.saveChanges">Save Changes</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('editMediaModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Setup save button
        const saveBtn = document.getElementById('save-media-btn');
        saveBtn.addEventListener('click', () => this.saveMediaChanges(media.id));

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('editMediaModal'));
        modal.show();
        
        // Apply translations to the newly created modal
        if (window.adminI18n) {
            window.adminI18n.refresh();
        }
    }

    async saveMediaChanges(id) {
        try {
            const updateData = {
                altText: document.getElementById('edit-alt-text').value,
                caption: document.getElementById('edit-caption').value,
                tags: document.getElementById('edit-tags').value
            };

            const response = await apiService.updateMedia(id, updateData);

            if (response.success) {
                const successMessage = window.adminI18n ? window.adminI18n.t('media.messages.updateSuccess') : 'Media details updated successfully';
                apiService.showNotification(successMessage, 'success');
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('editMediaModal'));
                modal.hide();
                
                // Reload data
                await this.loadMedia(this.currentPage);
            } else {
                throw new Error(response.error || 'Failed to update media');
            }
        } catch (error) {
            console.error('Failed to update media:', error);
            const errorMessage = window.adminI18n ? window.adminI18n.t('media.messages.updateError') : 'Failed to update media details';
            apiService.showNotification(errorMessage, 'error');
        }
    }

    showMediaDetails(media) {
        // Get translations
        const t = window.adminI18n ? window.adminI18n.t.bind(window.adminI18n) : (key) => key;
        
        // Create modal HTML for viewing media details
        const modalHTML = `
            <div class="modal fade" id="mediaDetailsModal" tabindex="-1" aria-labelledby="mediaDetailsModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="mediaDetailsModalLabel" data-i18n="media.modal.viewTitle">${t('media.modal.viewTitle').replace('{fileName}', media.originalName)}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-8">
                                    <div class="media-preview-large mb-3" style="height: 300px; background: #f8f9fa; display: flex; align-items: center; justify-content: center;">
                                        ${this.getMediaPreview(media)}
                                    </div>
                                    ${media.caption ? `<p class="text-muted">${media.caption}</p>` : ''}
                                </div>
                                <div class="col-md-4">
                                    <div class="card">
                                        <div class="card-body">
                                            <h6 class="card-title" data-i18n="media.modal.fileInfo">File Details</h6>
                                            <p><strong data-i18n="media.modal.fileType">Type:</strong> <span class="badge ${this.getTypeBadgeClass(media.fileType)}">${media.fileType}</span></p>
                                            <p><strong data-i18n="media.modal.fileSize">Size:</strong> ${this.formatFileSize(media.fileSize)}</p>
                                            <p><strong data-i18n="media.modal.uploaded">Uploaded:</strong> ${this.formatDate(media.createdAt)}</p>
                                            <p><strong data-i18n="media.modal.uploadedBy">Uploaded by:</strong> ${media.uploader?.firstName || ''} ${media.uploader?.lastName || ''}</p>
                                            ${media.altText ? `<p><strong data-i18n="media.modal.altTextLabel">Alt Text:</strong> ${media.altText}</p>` : ''}
                                            ${this.getTagsAsString(media.tags) ? `<p><strong data-i18n="media.modal.tagsLabel">Tags:</strong> ${this.getTagsAsString(media.tags)}</p>` : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="media.modal.close">Close</button>
                            <button type="button" class="btn btn-primary" onclick="mediaManager.editMedia(${media.id})">
                                <i class="bi bi-pencil me-2"></i><span data-i18n="media.modal.editDetails">Edit Details</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('mediaDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('mediaDetailsModal'));
        modal.show();
        
        // Apply translations to the newly created modal
        if (window.adminI18n) {
            window.adminI18n.refresh();
        }
    }

    getTagsAsString(tags) {
        if (!tags) return '';
        try {
            const tagsArray = typeof tags === 'string' ? JSON.parse(tags) : tags;
            return Array.isArray(tagsArray) ? tagsArray.join(', ') : '';
        } catch (error) {
            return '';
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    }

    showLoading() {
        const loadingState = document.getElementById('loading-state');
        const errorState = document.getElementById('error-state');
        const gridContainer = document.getElementById('media-grid-container');
        
        if (loadingState) loadingState.style.display = 'block';
        if (errorState) errorState.style.display = 'none';
        if (gridContainer) gridContainer.style.display = 'none';
    }

    hideLoading() {
        const loadingState = document.getElementById('loading-state');
        const gridContainer = document.getElementById('media-grid-container');
        
        if (loadingState) loadingState.style.display = 'none';
        if (gridContainer) gridContainer.style.display = 'block';
    }

    showError(message) {
        const loadingState = document.getElementById('loading-state');
        const errorState = document.getElementById('error-state');
        const errorMessage = document.getElementById('error-message');
        const gridContainer = document.getElementById('media-grid-container');
        
        if (loadingState) loadingState.style.display = 'none';
        if (errorState) errorState.style.display = 'block';
        if (errorMessage) {
            // Use translation key for error message
            errorMessage.innerHTML = `
                <i class="bi bi-exclamation-triangle text-danger fs-1 mb-3"></i>
                <h5 class="text-danger" data-i18n="media.messages.loadError">Error Loading Media</h5>
                <p class="text-muted">${message}</p>
                <button class="btn btn-outline-danger" onclick="mediaManager.loadMedia()">
                    <i class="bi bi-arrow-clockwise me-1"></i><span data-i18n="media.messages.retry">Retry</span>
                </button>
            `;
            // Apply translations to the error state
            if (window.adminI18n) {
                window.adminI18n.refresh();
            }
        }
        if (gridContainer) gridContainer.style.display = 'none';
    }
}

// Initialize media manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mediaManager = new MediaManager();
});


/**
 * Reusable Media Library Selector
 * --------------------------------
 * This class provides a way to open the media library as a selector modal
 * from other parts of the admin panel (e.g., to select a featured image).
 * 
 * Usage:
 * const selector = new MediaLibrarySelector();
 * const selectedMedia = await selector.open({ multi: false });
 * if (selectedMedia) {
 *   // Do something with the selected media item(s)
 * }
 */
class MediaLibrarySelector {
    constructor() {
        this.modalElement = document.getElementById('mediaLibraryModal');
        if (!this.modalElement) {
            console.error('Media Library Selector modal element not found in the DOM.');
            return;
        }
        this.modal = new bootstrap.Modal(this.modalElement);
        this.grid = document.getElementById('media-modal-grid');
        this.loading = document.getElementById('media-modal-loading');
        this.selectBtn = document.getElementById('select-media-btn');
        this.selectionCount = document.getElementById('media-modal-selection-count');
        
        this.selected = [];
        this.resolvePromise = null;
        this.options = {};

        this.setupEventListeners();
        this.loadMedia();
    }

    setupEventListeners() {
        this.selectBtn.addEventListener('click', () => this.handleSelect());
        
        // Add event listener for media item clicks
        this.grid.addEventListener('click', (e) => {
            const card = e.target.closest('.media-card-selectable');
            if (card) {
                this.toggleSelection(card);
            }
        });

        // Search functionality
        const searchInput = document.getElementById('media-modal-search');
        const searchBtn = document.getElementById('media-modal-search-btn');
        searchInput.addEventListener('keypress', (e) => e.key === 'Enter' && this.loadMedia(searchInput.value));
        searchBtn.addEventListener('click', () => this.loadMedia(searchInput.value));
    }
    
    open(options = { multi: false }) {
        this.options = options;
        this.reset();
        this.modal.show();
        return new Promise((resolve) => {
            this.resolvePromise = resolve;
        });
    }

    async loadMedia(searchTerm = '') {
        this.loading.style.display = 'block';
        this.grid.innerHTML = '';
        
        try {
            const params = { limit: 100, search: searchTerm };
            const response = await apiService.getMedia(params);
            if (response.success) {
                this.renderMedia(response.data.media);
            }
        } catch (error) {
            this.grid.innerHTML = '<p class="text-danger">Failed to load media.</p>';
        } finally {
            this.loading.style.display = 'none';
        }
    }

    renderMedia(mediaItems) {
        if (mediaItems.length === 0) {
            this.grid.innerHTML = '<p class="text-muted">No media found.</p>';
            return;
        }
        this.grid.innerHTML = mediaItems.map(media => `
            <div class="col-lg-2 col-md-3 col-sm-4 mb-3">
                <div class="card h-100 media-card-selectable" data-media-url="${media.fileUrl}" data-media-id="${media.id}">
                    <div class="card-img-top" style="height: 120px; background: #f8f9fa; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                        ${media.fileType === 'image' ? 
                          `<img src="${media.fileUrl}" alt="${media.altText || media.originalName}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                          `<i class="bi bi-file-earmark-text" style="font-size: 2rem;"></i>`
                        }
                    </div>
                    <div class="card-body p-2">
                        <p class="card-text small text-truncate" title="${media.originalName}">${media.originalName}</p>
                    </div>
                    <div class="selected-overlay"><i class="bi bi-check-circle-fill"></i></div>
                </div>
            </div>
        `).join('');
    }

    toggleSelection(card) {
        const mediaUrl = card.dataset.mediaUrl;
        const index = this.selected.indexOf(mediaUrl);

        if (index > -1) {
            // Deselect
            this.selected.splice(index, 1);
            card.classList.remove('selected');
        } else {
            // Select
            if (!this.options.multi) {
                // Single selection mode
                this.selected = [mediaUrl];
                this.grid.querySelectorAll('.media-card-selectable.selected').forEach(el => el.classList.remove('selected'));
            } else {
                // Multi selection mode
                this.selected.push(mediaUrl);
            }
            card.classList.add('selected');
        }
        this.updateSelectionState();
    }

    updateSelectionState() {
        this.selectionCount.textContent = `${this.selected.length} item(s) selected`;
        this.selectBtn.disabled = this.selected.length === 0;
    }

    handleSelect() {
        if (this.resolvePromise) {
            const result = this.options.multi ? this.selected : (this.selected[0] || null);
            this.resolvePromise(result);
        }
        this.modal.hide();
    }

    reset() {
        this.selected = [];
        this.grid.querySelectorAll('.media-card-selectable.selected').forEach(el => el.classList.remove('selected'));
        this.updateSelectionState();
        this.resolvePromise = null;
    }
}

// Instantiate the selector so it's ready to be used
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('mediaLibraryModal')) {
        window.mediaLibrarySelector = new MediaLibrarySelector();
    }
});