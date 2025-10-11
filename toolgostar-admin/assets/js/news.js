/**
 * News Management JavaScript
 * Handles all news-related functionality in the admin panel
 */

class NewsManager {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 1;
        this.searchTerm = '';
        this.newsData = [];
        this.categories = [];
        this.featuredImageUrl = '';
        
        this.init();
    }

    async init() {
        try {
            // Check authentication (temporarily disabled for testing)
            // if (!apiService.isAuthenticated()) {
            //     window.location.href = 'login.html';
            //     return;
            // }

            // Load initial data
            await this.loadNewsStats();
            await this.loadNewsCategories();
            await this.loadNews();

            // Setup event listeners
            this.setupEventListeners();

            // Listen for language changes to refresh news content
            window.addEventListener('languageChanged', () => {
                this.renderNews();
            });

        } catch (error) {
            console.error('News Manager initialization error:', error);
            const errorMessage = window.adminI18n ? window.adminI18n.t('news.messages.loadError') : 'Failed to initialize news management';
            this.showError(errorMessage);
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-news');
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

        // Add news button
        const addNewsBtn = document.getElementById('add-news-btn');
        if (addNewsBtn) {
            addNewsBtn.addEventListener('click', () => this.showAddNewsModal());
        }

        // Retry button
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.loadNews());
        }
    }

    async loadNewsStats() {
        try {
            const response = await apiService.getNewsStats();
            if (response.success) {
                this.updateStatsDisplay(response.data.stats);
            }
        } catch (error) {
            console.error('Failed to load news stats:', error);
        }
    }

    async loadNewsCategories() {
        try {
            const response = await apiService.getNewsCategories();
            if (response.success) {
                this.categories = response.data.categories;
            }
        } catch (error) {
            console.error('Failed to load news categories:', error);
        }
    }

    async loadNews(page = 1) {
        try {
            console.log('🔄 Loading news articles...');
            this.showLoading();
            
            const params = {
                page,
                limit: 10,
                sortBy: 'createdAt',
                sortOrder: 'DESC'
            };

            if (this.searchTerm) {
                params.search = this.searchTerm;
            }

            console.log('📡 Making API call with params:', params);
            const response = await apiService.getNews(params);
            console.log('📡 API response:', response);
            
            if (response.success) {
                this.newsData = response.data.news;
                this.currentPage = response.data.pagination.currentPage;
                this.totalPages = response.data.pagination.totalPages;
                
                console.log('✅ Loaded news data:', this.newsData.length, 'articles');
                this.renderNews();
                this.renderPagination();
                this.hideLoading();
            } else {
                throw new Error(response.error || 'Failed to load news');
            }
        } catch (error) {
            console.error('❌ Failed to load news:', error);
            this.showError(error.message);
        }
    }

    renderNews() {
        console.log('🎨 renderNews called with', this.newsData.length, 'articles');
        const tbody = document.getElementById('news-tbody');
        if (!tbody) {
            console.error('❌ news-tbody element not found!');
            return;
        }

        if (this.newsData.length === 0) {
            console.log('📭 No news articles to display');
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <i class="bi bi-newspaper fs-1 text-muted mb-3"></i>
                        <h5 class="text-muted" data-i18n="news.messages.noData">No news articles found</h5>
                        <p class="text-muted" data-i18n="news.messages.noDataMessage">Start by creating your first news article.</p>
                        <button class="btn btn-primary" onclick="newsManager.showAddNewsModal()">
                            <i class="bi bi-plus-circle me-2"></i><span data-i18n="news.actions.addNew">Add News Article</span>
                        </button>
                    </td>
                </tr>
            `;
            
            // Apply translations to the no data state
            if (window.adminI18n) {
                window.adminI18n.refresh();
            }
            return;
        }

        tbody.innerHTML = this.newsData.map(news => `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        ${news.featuredImage ? 
                            `<img src="${news.featuredImage}" alt="${news.title?.en || news.title || 'News image'}" class="me-3" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">` :
                            `<div class="me-3 bg-light d-flex align-items-center justify-content-center" style="width: 50px; height: 50px; border-radius: 4px;">
                                <i class="bi bi-image text-muted"></i>
                            </div>`
                        }
                        <div>
                            <h6 class="mb-1">${news.title?.en || news.title || 'Untitled'}</h6>
                            <small class="text-muted">${news.slug}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge bg-secondary">${news.category?.name?.en || news.category?.name || 'Uncategorized'}</span>
                </td>
                <td>
                    <span class="badge ${this.getStatusBadgeClass(news.status)}">${this.getStatusText(news.status)}</span>
                    ${news.isFeatured ? '<i class="bi bi-star-fill text-warning ms-1" title="Featured"></i>' : ''}
                </td>
                <td>
                    <div>
                        <div class="fw-bold">${news.author?.firstName || ''} ${news.author?.lastName || ''}</div>
                        <small class="text-muted">${news.author?.email || ''}</small>
                    </div>
                </td>
                <td>
                    <span class="badge bg-info">${news.viewsCount || 0}</span>
                </td>
                <td>
                    <div>
                        <div>${this.formatDate(news.createdAt)}</div>
                        <small class="text-muted">${this.formatTime(news.createdAt)}</small>
                    </div>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="newsManager.viewNews(${news.id})" title="View">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="newsManager.editNews(${news.id})" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="newsManager.deleteNews(${news.id})" title="Delete">
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
        const prevText = window.adminI18n ? window.adminI18n.t('news.pagination.previous') : 'Previous';
        paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="newsManager.loadNews(${this.currentPage - 1})" data-i18n="news.pagination.previous">${prevText}</a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= this.totalPages; i++) {
            if (i === 1 || i === this.totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="newsManager.loadNews(${i})">${i}</a>
                    </li>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }

        // Next button
        const nextText = window.adminI18n ? window.adminI18n.t('news.pagination.next') : 'Next';
        paginationHTML += `
            <li class="page-item ${this.currentPage === this.totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="newsManager.loadNews(${this.currentPage + 1})" data-i18n="news.pagination.next">${nextText}</a>
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
            'total-news': stats.totalNews || 0,
            'published-news': stats.publishedNews || 0,
            'draft-news': stats.draftNews || 0,
            'total-views': stats.totalViews || 0
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value.toLocaleString();
            }
        });
    }

    handleSearch() {
        const searchInput = document.getElementById('search-news');
        if (searchInput) {
            this.searchTerm = searchInput.value.trim();
            this.currentPage = 1;
            this.loadNews();
        }
    }

    async viewNews(id) {
        try {
            const response = await apiService.getNewsById(id);
            if (response.success) {
                this.showNewsDetails(response.data.news);
            } else {
                throw new Error(response.error || 'Failed to load news details');
            }
        } catch (error) {
            console.error('Failed to view news:', error);
            const errorMessage = window.adminI18n ? window.adminI18n.t('news.messages.loadDetailsError') : 'Failed to load news details';
            apiService.showNotification(errorMessage, 'error');
        }
    }

    async editNews(id) {
        try {
            const response = await apiService.getNewsById(id);
            if (response.success) {
                this.showEditNewsModal(response.data.news);
            } else {
                throw new Error(response.error || 'Failed to load news for editing');
            }
        } catch (error) {
            console.error('Failed to edit news:', error);
            const errorMessage = window.adminI18n ? window.adminI18n.t('news.messages.loadEditError') : 'Failed to load news for editing';
            apiService.showNotification(errorMessage, 'error');
        }
    }

    async deleteNews(id) {
        const news = this.newsData.find(n => n.id === id);
        if (!news) return;

        const confirmMessage = window.adminI18n ? 
            window.adminI18n.t('news.messages.deleteConfirm', { title: news.title?.en || news.title || 'this article' }) : 
            `Are you sure you want to delete "${news.title?.en || news.title || 'this article'}"? This action cannot be undone.`;
        if (confirm(confirmMessage)) {
            try {
                const response = await apiService.deleteNews(id);
                if (response.success) {
                    const successMessage = window.adminI18n ? window.adminI18n.t('news.messages.deleteSuccess') : 'News article deleted successfully';
                    apiService.showNotification(successMessage, 'success');
                    await this.loadNews(this.currentPage);
                    await this.loadNewsStats();
                } else {
                    throw new Error(response.error || 'Failed to delete news');
                }
            } catch (error) {
                console.error('Failed to delete news:', error);
                const errorMessage = window.adminI18n ? window.adminI18n.t('news.messages.deleteError') : 'Failed to delete news article';
                apiService.showNotification(errorMessage, 'error');
            }
        }
    }

    showAddNewsModal() {
        this.showNewsModal();
    }

    showEditNewsModal(news) {
        this.showNewsModal(news);
    }

    showNewsModal(news = null) {
        // Get translations
        const t = window.adminI18n ? window.adminI18n.t.bind(window.adminI18n) : (key) => key;
        
        // Create modal HTML
        const modalHTML = `
            <div class="modal fade" id="newsModal" tabindex="-1" aria-labelledby="newsModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="newsModalLabel" data-i18n="${news ? 'news.modal.editTitle' : 'news.modal.addTitle'}">
                                ${news ? t('news.modal.editTitle') : t('news.modal.addTitle')}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="news-form">
                                <div class="row">
                                    <div class="col-md-8">
                                        <div class="mb-3">
                                            <label for="news-title-en" class="form-label">Title (English) *</label>
                                            <input type="text" class="form-control" id="news-title-en" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="news-title-fa" class="form-label">Title (Farsi)</label>
                                            <input type="text" class="form-control" id="news-title-fa" dir="rtl">
                                        </div>
                                        <div class="mb-3">
                                            <label for="news-slug" class="form-label" data-i18n="news.form.slug">Slug</label>
                                            <input type="text" class="form-control" id="news-slug" placeholder="auto-generated" data-i18n-placeholder="news.form.autoGenerated">
                                        </div>
                                        <div class="mb-3">
                                            <label for="news-excerpt-en" class="form-label">Excerpt (English)</label>
                                            <textarea class="form-control" id="news-excerpt-en" rows="3"></textarea>
                                        </div>
                                        <div class="mb-3">
                                            <label for="news-excerpt-fa" class="form-label">Excerpt (Farsi)</label>
                                            <textarea class="form-control" id="news-excerpt-fa" rows="3" dir="rtl"></textarea>
                                        </div>
                                        <div class="mb-3">
                                            <label for="news-content-en" class="form-label">Content (English) *</label>
                                            <textarea class="form-control" id="news-content-en" rows="8" required></textarea>
                                        </div>
                                        <div class="mb-3">
                                            <label for="news-content-fa" class="form-label">Content (Farsi)</label>
                                            <textarea class="form-control" id="news-content-fa" rows="8" dir="rtl"></textarea>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label for="news-category" class="form-label" data-i18n="news.form.category">Category *</label>
                                            <select class="form-select" id="news-category" required>
                                                <option value="" data-i18n="news.form.selectCategory">Select Category</option>
                                                ${this.categories.map(cat => 
                                                    `<option value="${cat.id}">${cat.name?.en || cat.name}</option>`
                                                ).join('')}
                                            </select>
                                        </div>
                                        <div class="mb-3">
                                            <label for="news-status" class="form-label" data-i18n="news.form.status">Status</label>
                                            <select class="form-select" id="news-status">
                                                <option value="draft" data-i18n="news.status.draft">Draft</option>
                                                <option value="published" data-i18n="news.status.published">Published</option>
                                                <option value="archived" data-i18n="news.status.archived">Archived</option>
                                            </select>
                                        </div>
                                        <div class="mb-3">
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="news-featured">
                                                <label class="form-check-label" for="news-featured" data-i18n="news.form.featuredArticle">
                                                    Featured Article
                                                </label>
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label" data-i18n="news.form.featuredImage">Featured Image</label>
                                            <div id="featured-image-container" class="text-center">
                                                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNlbGVjdCBJbWFnZTwvdGV4dD48L3N2Zz4=" id="news-featured-image-preview" class="img-fluid rounded mb-2" style="max-height: 200px;">
                                                <div id="featured-image-actions">
                                                    <input type="file" id="news-featured-image-upload" accept="image/*" class="d-none">
                                                    <button type="button" class="btn btn-primary btn-sm" id="upload-news-featured-image-btn">Upload Image</button>
                                                    <button type="button" class="btn btn-outline-secondary btn-sm" id="select-news-featured-image-btn">From Library</button>
                                                    <button type="button" class="btn btn-outline-danger btn-sm d-none" id="remove-news-featured-image-btn">Remove</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="news.modal.cancel">Cancel</button>
                            <button type="button" class="btn btn-primary" id="save-news-btn" data-i18n="${news ? 'news.modal.update' : 'news.modal.save'}">
                                ${news ? t('news.modal.update') : t('news.modal.save')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('newsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Populate form if editing
        if (news) {
            document.getElementById('news-title-en').value = news.title?.en || news.title || '';
            document.getElementById('news-title-fa').value = news.title?.fa || '';
            document.getElementById('news-slug').value = news.slug || '';
            document.getElementById('news-excerpt-en').value = news.excerpt?.en || news.excerpt || '';
            document.getElementById('news-excerpt-fa').value = news.excerpt?.fa || '';
            document.getElementById('news-content-en').value = news.content?.en || news.content || '';
            document.getElementById('news-content-fa').value = news.content?.fa || '';
            document.getElementById('news-category').value = news.categoryId || '';
            document.getElementById('news-status').value = news.status || 'draft';
            document.getElementById('news-featured').checked = news.isFeatured || false;
            this.featuredImageUrl = news.featuredImage || '';
            this.renderFeaturedImage();
        }

        // Setup save button
        const saveBtn = document.getElementById('save-news-btn');
        saveBtn.addEventListener('click', () => this.saveNews(news?.id));

        // Setup image upload functionality
        this.setupImageUpload();

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('newsModal'));
        modal.show();
        
        // Apply translations to the newly created modal
        if (window.adminI18n) {
            window.adminI18n.refresh();
        }
    }

    async saveNews(id = null) {
        try {
            const formData = {
                title: { 
                    en: document.getElementById('news-title-en').value, 
                    fa: document.getElementById('news-title-fa').value || document.getElementById('news-title-en').value // Use English as fallback for Farsi
                },
                excerpt: { 
                    en: document.getElementById('news-excerpt-en').value, 
                    fa: document.getElementById('news-excerpt-fa').value || document.getElementById('news-excerpt-en').value // Use English as fallback for Farsi
                },
                content: { 
                    en: document.getElementById('news-content-en').value, 
                    fa: document.getElementById('news-content-fa').value || document.getElementById('news-content-en').value // Use English as fallback for Farsi
                },
                categoryId: parseInt(document.getElementById('news-category').value),
                status: document.getElementById('news-status').value,
                isFeatured: document.getElementById('news-featured').checked,
                featuredImage: this.featuredImageUrl || ''
            };

            // Add slug only if it has a value
            const slugValue = document.getElementById('news-slug').value;
            if (slugValue && slugValue.trim() !== '') {
                formData.slug = slugValue;
            }

            console.log('📝 Form data being sent:', JSON.stringify(formData, null, 2));

            // Validate required fields
            if (!formData.title.en || !formData.content.en || !formData.categoryId) {
                const errorMessage = window.adminI18n ? window.adminI18n.t('news.messages.validationError') : 'Please fill in all required fields';
                apiService.showNotification(errorMessage, 'error');
                return;
            }

            let response;
            if (id) {
                response = await apiService.updateNews(id, formData);
            } else {
                response = await apiService.createNews(formData);
            }

            if (response.success) {
                const successMessage = id ? 
                    (window.adminI18n ? window.adminI18n.t('news.messages.updateSuccess') : 'News article updated successfully') :
                    (window.adminI18n ? window.adminI18n.t('news.messages.saveSuccess') : 'News article created successfully');
                apiService.showNotification(successMessage, 'success');
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('newsModal'));
                modal.hide();
                
                // Reload data
                await this.loadNews(this.currentPage);
                await this.loadNewsStats();
            } else {
                throw new Error(response.error || 'Failed to save news');
            }
        } catch (error) {
            console.error('❌ Failed to save news:', error);
            console.error('❌ Error details:', error.response?.data || error.message);
            const errorMessage = window.adminI18n ? window.adminI18n.t('news.messages.saveError') : 'Failed to save news article';
            apiService.showNotification(errorMessage, 'error');
        }
    }

    showNewsDetails(news) {
        // Get translations
        const t = window.adminI18n ? window.adminI18n.t.bind(window.adminI18n) : (key) => key;
        
        // Create modal HTML for viewing news details
        const modalHTML = `
            <div class="modal fade" id="newsDetailsModal" tabindex="-1" aria-labelledby="newsDetailsModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="newsDetailsModalLabel" data-i18n="news.modal.detailsTitle">${news.title?.en || news.title || 'News Article'}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-8">
                                    ${news.featuredImage ? 
                                        `<img src="${news.featuredImage}" alt="${news.title?.en || news.title || 'News image'}" class="img-fluid mb-3 rounded">` : ''
                                    }
                                    <div class="mb-3">
                                        <h6 data-i18n="news.details.content">Content:</h6>
                                        <div class="border p-3 rounded bg-light">
                                            ${news.content || t('news.details.noContent')}
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="card">
                                        <div class="card-body">
                                            <h6 class="card-title" data-i18n="news.details.articleDetails">Article Details</h6>
                                            <p><strong data-i18n="news.details.status">Status:</strong> <span class="badge ${this.getStatusBadgeClass(news.status)}">${this.getStatusText(news.status)}</span></p>
                                            <p><strong data-i18n="news.details.category">Category:</strong> ${news.category?.name?.en || news.category?.name || t('news.table.uncategorized')}</p>
                                            <p><strong data-i18n="news.details.author">Author:</strong> ${news.author?.firstName || ''} ${news.author?.lastName || ''}</p>
                                            <p><strong data-i18n="news.details.views">Views:</strong> ${news.viewsCount || 0}</p>
                                            <p><strong data-i18n="news.details.created">Created:</strong> ${this.formatDate(news.createdAt)}</p>
                                            <p><strong data-i18n="news.details.updated">Updated:</strong> ${this.formatDate(news.updatedAt)}</p>
                                            ${news.isFeatured ? `<p><strong data-i18n="news.details.featured">Featured:</strong> <i class="bi bi-star-fill text-warning"></i> ${t('news.details.yes')}</p>` : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="news.modal.close">Close</button>
                            <button type="button" class="btn btn-primary" onclick="newsManager.editNews(${news.id})">
                                <i class="bi bi-pencil me-2"></i><span data-i18n="news.modal.editArticle">Edit Article</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('newsDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('newsDetailsModal'));
        modal.show();
        
        // Apply translations to the newly created modal
        if (window.adminI18n) {
            window.adminI18n.refresh();
        }
    }

    getStatusBadgeClass(status) {
        switch (status) {
            case 'published': return 'bg-success';
            case 'draft': return 'bg-warning';
            case 'archived': return 'bg-secondary';
            default: return 'bg-secondary';
        }
    }

    getStatusText(status) {
        if (window.adminI18n) {
            switch (status) {
                case 'published': return window.adminI18n.t('news.status.published');
                case 'draft': return window.adminI18n.t('news.status.draft');
                case 'archived': return window.adminI18n.t('news.status.archived');
                default: return window.adminI18n.t('news.status.unknown');
            }
        } else {
            switch (status) {
                case 'published': return 'Published';
                case 'draft': return 'Draft';
                case 'archived': return 'Archived';
                default: return 'Unknown';
            }
        }
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    }

    formatTime(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleTimeString();
    }

    showLoading() {
        const loadingState = document.getElementById('loading-state');
        const errorState = document.getElementById('error-state');
        const tableContainer = document.getElementById('news-table-container');
        
        if (loadingState) loadingState.style.display = 'block';
        if (errorState) errorState.style.display = 'none';
        if (tableContainer) tableContainer.style.display = 'none';
    }

    hideLoading() {
        const loadingState = document.getElementById('loading-state');
        const tableContainer = document.getElementById('news-table-container');
        
        if (loadingState) loadingState.style.display = 'none';
        if (tableContainer) tableContainer.style.display = 'block';
    }

    showError(message) {
        const loadingState = document.getElementById('loading-state');
        const errorState = document.getElementById('error-state');
        const errorMessage = document.getElementById('error-message');
        const tableContainer = document.getElementById('news-table-container');
        
        if (loadingState) loadingState.style.display = 'none';
        if (errorState) errorState.style.display = 'block';
        if (errorMessage) errorMessage.textContent = message;
        if (tableContainer) tableContainer.style.display = 'none';
    }

    // Image upload functionality
    setupImageUpload() {
        const uploadBtn = document.getElementById('upload-news-featured-image-btn');
        const fileInput = document.getElementById('news-featured-image-upload');
        const preview = document.getElementById('news-featured-image-preview');
        const removeBtn = document.getElementById('remove-news-featured-image-btn');
        const selectBtn = document.getElementById('select-news-featured-image-btn');

        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => {
                fileInput.click();
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    try {
                        const formData = new FormData();
                        formData.append('file', file);
                        
                        const result = await apiService.uploadMedia(formData);
                        if (result.success) {
                            this.featuredImageUrl = result.data.media.fileUrl;
                            this.renderFeaturedImage();
                            apiService.showNotification('Image uploaded successfully!', 'success');
                        } else {
                            apiService.showNotification('Failed to upload image: ' + (result.error?.message || 'Unknown error'), 'error');
                        }
                    } catch (error) {
                        console.error('Upload error:', error);
                        apiService.showNotification('Failed to upload image', 'error');
                    }
                }
            });
        }

        if (selectBtn) {
            selectBtn.addEventListener('click', async () => {
                const selected = await window.mediaLibrarySelector.open({ multi: false });
                if (selected) {
                    this.featuredImageUrl = selected;
                    this.renderFeaturedImage();
                }
            });
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                this.featuredImageUrl = '';
                this.renderFeaturedImage();
            });
        }
    }

    renderFeaturedImage() {
        const preview = document.getElementById('news-featured-image-preview');
        const removeBtn = document.getElementById('remove-news-featured-image-btn');
        
        if (preview) {
            if (this.featuredImageUrl) {
                preview.src = this.featuredImageUrl;
                if (removeBtn) removeBtn.classList.remove('d-none');
            } else {
                preview.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNlbGVjdCBJbWFnZTwvdGV4dD48L3N2Zz4=';
                if (removeBtn) removeBtn.classList.add('d-none');
            }
        }
    }
}

// Initialize news manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.newsManager = new NewsManager();
});
