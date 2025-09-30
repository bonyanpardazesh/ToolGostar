document.addEventListener("DOMContentLoaded", function () {
    const projectsGrid = document.getElementById('projects-grid');
    const projectModal = new bootstrap.Modal(document.getElementById('projectModal'));
    const projectForm = document.getElementById('project-form');
    const saveProjectBtn = document.getElementById('save-project-btn');
    
    // New modal fields
    const projectIdInput = document.getElementById('project-id');
    const projectTitleEn = document.getElementById('project-title-en');
    const projectTitleFa = document.getElementById('project-title-fa');
    const projectDescEn = document.getElementById('project-description-en');
    const projectDescFa = document.getElementById('project-description-fa');
    const projectClient = document.getElementById('project-client');
    const projectLocation = document.getElementById('project-location');
    const projectCategory = document.getElementById('project-category');
    console.log('🔍 Project category element:', projectCategory);
    const projectStatus = document.getElementById('project-status');
    const projectIsFeatured = document.getElementById('project-is-featured');
    
    // Image management elements
    const featuredImagePreview = document.getElementById('featured-image-preview');
    const selectFeaturedImageBtn = document.getElementById('select-featured-image-btn');
    const uploadFeaturedImageBtn = document.getElementById('upload-featured-image-btn');
    const featuredImageUpload = document.getElementById('featured-image-upload');
    const removeFeaturedImageBtn = document.getElementById('remove-featured-image-btn');
    const galleryImagesGrid = document.getElementById('gallery-images-grid');
    const addGalleryImagesBtn = document.getElementById('add-gallery-images-btn');
    const uploadGalleryImagesBtn = document.getElementById('upload-gallery-images-btn');
    const galleryImagesUpload = document.getElementById('gallery-images-upload');

    let projects = [];
    let filteredProjects = [];
    let currentEditingProject = null;
    let featuredImageUrl = '';
    let galleryImageUrls = [];

    // Load projects and categories on page load
    loadInitialData();

    // Listen for language changes to refresh projects content
    window.addEventListener('languageChanged', () => {
        // Re-render projects with new language
        renderProjects(filteredProjects);
    });

    // Save project button event
    if (saveProjectBtn) {
        saveProjectBtn.addEventListener('click', function() {
            saveProject();
        });
    }

    // Search functionality
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterProjects(this.value);
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            filterProjects(searchInput.value);
        });
    }

    function filterProjects(searchTerm) {
        if (!searchTerm.trim()) {
            filteredProjects = [...projects];
        } else {
            const term = searchTerm.toLowerCase();
            filteredProjects = projects.filter(project => 
                (project.title.en && project.title.en.toLowerCase().includes(term)) ||
                (project.title.fa && project.title.fa.toLowerCase().includes(term)) ||
                (project.description.en && project.description.en.toLowerCase().includes(term)) ||
                (project.description.fa && project.description.fa.toLowerCase().includes(term)) ||
                (project.clientName && project.clientName.toLowerCase().includes(term)) ||
                (project.location && project.location.toLowerCase().includes(term))
            );
        }
        renderProjects(filteredProjects);
    }

    async function loadInitialData() {
        showLoading();
        try {
            console.log('🔄 Loading initial data...');
            console.log('🔑 Token:', localStorage.getItem('toolgostar_token') ? 'Present' : 'Missing');
            
            const [projectsResult, categoriesResult] = await Promise.all([
                apiService.getProjects(),
                apiService.getProjectCategories()
            ]);

            console.log('📊 Projects result:', projectsResult);
            console.log('📂 Categories result:', categoriesResult);

            if (projectsResult.success) {
                projects = projectsResult.data || [];
                filteredProjects = [...projects];
                console.log('✅ Loaded projects:', projects.length);
                renderProjects(filteredProjects);
            } else {
                console.error('❌ Failed to load projects:', projectsResult.error);
                showError('Failed to load projects: ' + (projectsResult.error?.message || 'Unknown error'));
            }

            if (categoriesResult.success) {
                console.log('✅ Loaded categories:', categoriesResult.data.length);
                populateCategories(categoriesResult.data);
            } else {
                console.error('❌ Failed to load categories:', categoriesResult.error);
            }

        } catch (error) {
            console.error('❌ Error loading initial data:', error);
            showError('Network error. Please check your connection and try again.');
        }
    }

    function populateCategories(categories) {
        console.log('📂 Populating categories:', categories);
        console.log('📂 Project category element:', projectCategory);
        
        if (!projectCategory) {
            console.error('❌ Project category element not found!');
            return;
        }
        
        projectCategory.innerHTML = '<option value="">Select Category</option>';
        categories.forEach(cat => {
            console.log('📂 Adding category:', cat.name, 'ID:', cat.id);
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            projectCategory.appendChild(option);
        });
        console.log('✅ Categories populated, total options:', projectCategory.children.length);
    }

    async function loadProjects() {
        try {
            showLoading();
            
            const result = await apiService.getProjects();
            
            if (result.success) {
                projects = result.data || [];
                filteredProjects = [...projects];
                renderProjects(filteredProjects);
            } else {
                showError('Failed to load projects: ' + (result.error?.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error loading projects:', error);
            showError('Network error. Please check your connection and try again.');
        }
    }

    function showLoading() {
        projectsGrid.innerHTML = `
            <div class="col-12 text-center text-muted">
                <div class="spinner-border text-primary mb-3" role="status">
                    <span class="visually-hidden" data-i18n="common.loading">Loading...</span>
                </div>
                <h5 data-i18n="projects.messages.loading">Loading Projects...</h5>
                <p class="text-muted" data-i18n="projects.messages.loadingDesc">Fetching project data from the backend</p>
            </div>
        `;
        
        // Apply translations to the loading state
        if (window.adminI18n) {
            window.adminI18n.refresh();
        }
    }

    function showError(message) {
        projectsGrid.innerHTML = `
            <div class="col-12 text-center text-danger">
                <i class="bi bi-exclamation-triangle fs-1 mb-3"></i>
                <h5 data-i18n="projects.messages.loadError">Failed to Load Projects</h5>
                <p class="text-muted">${message}</p>
                <button class="btn btn-outline-danger" onclick="loadProjects()">
                    <i class="bi bi-arrow-clockwise me-1"></i><span data-i18n="projects.actions.tryAgain">Try Again</span>
                </button>
            </div>
        `;
        
        // Apply translations to the error state
        if (window.adminI18n) {
            window.adminI18n.refresh();
        }
    }

    function renderProjects(projectsToRender) {
        if (projectsToRender.length === 0) {
            projectsGrid.innerHTML = `
                <div class="col-12 text-center text-muted">
                    <i class="bi bi-inbox fs-1 mb-3"></i>
                    <h5 data-i18n="projects.messages.noData">No Projects Found</h5>
                    <p class="text-muted" data-i18n="projects.messages.noDataMessage">Click "Add New Project" to create your first project</p>
                </div>
            `;
            
            // Apply translations to the no data state
            if (window.adminI18n) {
                window.adminI18n.refresh();
            }
            return;
        }

        projectsGrid.innerHTML = projectsToRender.map(project => `
            <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <div class="position-relative">
                        <img src="${project.featuredImage || 'https://via.placeholder.com/300x200?text=Project+Image'}" 
                             class="card-img-top" alt="${project.title?.en || 'Project Image'}" 
                             style="height: 200px; object-fit: cover;">
                        <div class="position-absolute top-0 end-0 m-2">
                            <span class="badge bg-${project.status === 'completed' ? 'success' : 'warning'}">
                                ${project.status || 'completed'}
                            </span>
                        </div>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${project.title?.en || 'No Title'}</h5>
                        <p class="card-text text-muted">${project.description?.en ? 
                            (project.description.en.length > 100 ? project.description.en.substring(0, 100) + '...' : project.description.en) 
                            : 'No description available'}</p>
                        <div class="mt-auto">
                            <div class="row text-sm">
                                <div class="col-6">
                                    <small class="text-muted" data-i18n="projects.grid.client">Client:</small><br>
                                    <strong>${project.clientName || 'N/A'}</strong>
                                </div>
                                <div class="col-6">
                                    <small class="text-muted" data-i18n="projects.grid.location">Location:</small><br>
                                    <strong>${project.location || 'N/A'}</strong>
                                </div>
                            </div>
                            <div class="row text-sm mt-2">
                                <div class="col-6">
                                    <small class="text-muted" data-i18n="projects.grid.capacity">Capacity:</small><br>
                                    <strong>${project.capacity || 'N/A'}</strong>
                                </div>
                                <div class="col-6">
                                    <small class="text-muted" data-i18n="projects.grid.completed">Completed:</small><br>
                                    <strong>${project.completionDate ? new Date(project.completionDate).toLocaleDateString() : 'N/A'}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="btn-group w-100" role="group">
                            <button type="button" class="btn btn-outline-primary btn-sm" onclick="viewProject(${project.id})" data-i18n-title="projects.actions.view">
                                <i class="bi bi-eye me-1"></i><span data-i18n="projects.actions.view">View</span>
                            </button>
                            <button type="button" class="btn btn-outline-success btn-sm" onclick="editProject(${project.id})" data-i18n-title="projects.actions.edit">
                                <i class="bi bi-pencil me-1"></i><span data-i18n="projects.actions.edit">Edit</span>
                            </button>
                            <button type="button" class="btn btn-outline-danger btn-sm" onclick="deleteProject(${project.id})" data-i18n-title="projects.actions.delete">
                                <i class="bi bi-trash me-1"></i><span data-i18n="projects.actions.delete">Delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Apply translations to the rendered projects
        if (window.adminI18n) {
            window.adminI18n.refresh();
        }
    }

    async function saveProject() {
        const formData = {
            title: { 
                en: projectTitleEn.value, 
                fa: projectTitleFa.value || projectTitleEn.value // Use English as fallback for Farsi
            },
            description: { 
                en: projectDescEn.value, 
                fa: projectDescFa.value || projectDescEn.value // Use English as fallback for Farsi
            },
            clientName: projectClient.value,
            location: projectLocation.value,
            categoryId: projectCategory.value,
            status: projectStatus.value,
            isFeatured: projectIsFeatured.checked,
            featuredImage: featuredImageUrl,
            galleryImages: galleryImageUrls,
            completionDate: new Date().toISOString(),
            equipmentUsed: [], // Will be enhanced later
            beforeImages: [], // Will be enhanced later
            afterImages: [] // Will be enhanced later
        };

        // Validate required fields
        if (!formData.title.en || !formData.clientName) {
            const message = window.adminI18n ? window.adminI18n.t('projects.messages.validationError') : 'Please fill in all required fields';
            apiService.showNotification(message, 'error');
            return;
        }

        try {
            saveProjectBtn.disabled = true;
            saveProjectBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

            let result;
            if (currentEditingProject) {
                // Update existing project
                result = await apiService.updateProject(currentEditingProject.id, formData);
            } else {
                // Create new project
                result = await apiService.createProject(formData);
            }

            if (result.success) {
                const successMessage = currentEditingProject ? 
                    (window.adminI18n ? window.adminI18n.t('projects.messages.updateSuccess') : 'Project updated successfully!') :
                    (window.adminI18n ? window.adminI18n.t('projects.messages.saveSuccess') : 'Project created successfully!');
                apiService.showNotification(successMessage, 'success');
                
                // Close modal and reset form
                projectModal.hide();
                projectForm.reset();
                currentEditingProject = null;
                
                // Reload projects
                loadInitialData();
            } else {
                const errorMessage = window.adminI18n ? 
                    window.adminI18n.t('projects.messages.saveError') + ': ' + (result.error?.message || 'Unknown error') :
                    'Failed to save project: ' + (result.error?.message || 'Unknown error');
                apiService.showNotification(errorMessage, 'error');
            }
        } catch (error) {
            console.error('Error saving project:', error);
            const networkMessage = window.adminI18n ? window.adminI18n.t('projects.messages.networkError') : 'Network error. Please try again.';
            apiService.showNotification(networkMessage, 'error');
        } finally {
            saveProjectBtn.disabled = false;
            const buttonText = currentEditingProject ? 
                (window.adminI18n ? window.adminI18n.t('projects.modal.update') : 'Update Project') :
                (window.adminI18n ? window.adminI18n.t('projects.modal.save') : 'Save Project');
            saveProjectBtn.innerHTML = buttonText;
        }
    }

    // Global functions for CRUD operations
    window.viewProject = async function(id) {
        try {
            const result = await apiService.getProject(id);
            if (result.success) {
                const project = result.data;
                showProjectDetails(project);
            } else {
                const errorMessage = window.adminI18n ? window.adminI18n.t('projects.messages.loadDetailsError') : 'Failed to load project details';
                apiService.showNotification(errorMessage, 'error');
            }
        } catch (error) {
            const networkMessage = window.adminI18n ? window.adminI18n.t('projects.messages.networkError') : 'Network error loading project';
            apiService.showNotification(networkMessage, 'error');
        }
    };

    window.editProject = async function(id) {
        try {
            const result = await apiService.getProject(id);
            if (result.success) {
                const project = result.data;
                currentEditingProject = project;
                
                // Populate form with project data
                projectIdInput.value = project.id;
                projectTitleEn.value = project.title?.en || '';
                projectTitleFa.value = project.title?.fa || '';
                projectDescEn.value = project.description?.en || '';
                projectDescFa.value = project.description?.fa || '';
                projectClient.value = project.clientName || '';
                projectLocation.value = project.location || '';
                projectCategory.value = project.categoryId || '';
                projectStatus.value = project.status || 'completed';
                projectIsFeatured.checked = project.isFeatured || false;

                // Populate images
                featuredImageUrl = project.featuredImage || '';
                galleryImageUrls = project.galleryImages || [];
                renderFeaturedImage();
                renderGalleryImages();
                
                // Update modal title and button
                const modalTitle = window.adminI18n ? window.adminI18n.t('projects.modal.editTitle') : 'Edit Project';
                const buttonText = window.adminI18n ? window.adminI18n.t('projects.modal.update') : 'Update Project';
                document.getElementById('projectModalLabel').textContent = modalTitle;
                saveProjectBtn.textContent = buttonText;
                
                // Show modal
                projectModal.show();
            } else {
                const errorMessage = window.adminI18n ? window.adminI18n.t('projects.messages.loadEditError') : 'Failed to load project for editing';
                apiService.showNotification(errorMessage, 'error');
            }
        } catch (error) {
            const networkMessage = window.adminI18n ? window.adminI18n.t('projects.messages.networkError') : 'Network error loading project';
            apiService.showNotification(networkMessage, 'error');
        }
    };

    window.deleteProject = async function(id) {
        const confirmMessage = window.adminI18n ? window.adminI18n.t('projects.messages.deleteConfirm') : 'Are you sure you want to delete this project? This action cannot be undone.';
        if (!confirm(confirmMessage)) {
            return;
        }

        try {
            const result = await apiService.deleteProject(id);
            if (result.success) {
                const successMessage = window.adminI18n ? window.adminI18n.t('projects.messages.deleteSuccess') : 'Project deleted successfully!';
                apiService.showNotification(successMessage, 'success');
                loadInitialData();
            } else {
                const errorMessage = window.adminI18n ? 
                    window.adminI18n.t('projects.messages.deleteError') + ': ' + (result.error?.message || 'Unknown error') :
                    'Failed to delete project: ' + (result.error?.message || 'Unknown error');
                apiService.showNotification(errorMessage, 'error');
            }
        } catch (error) {
            const networkMessage = window.adminI18n ? window.adminI18n.t('projects.messages.networkError') : 'Network error deleting project';
            apiService.showNotification(networkMessage, 'error');
        }
    };

    function showProjectDetails(project) {
        // Get translations
        const t = window.adminI18n ? window.adminI18n.t.bind(window.adminI18n) : (key) => key;
        const na = t('projects.details.na');
        
        const modalHtml = `
            <div class="modal fade" id="projectDetailsModal" tabindex="-1" aria-labelledby="projectDetailsModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="projectDetailsModalLabel" data-i18n="projects.modal.detailsTitle">Project Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-8">
                                    <h4>${project.title?.en || 'No Title'}</h4>
                                    <p class="text-muted">${project.description?.en || t('projects.details.noDescription')}</p>
                                    
                                    <div class="row mt-4">
                                        <div class="col-md-6">
                                            <h6 data-i18n="projects.details.projectInfo">Project Information</h6>
                                            <p><strong data-i18n="projects.details.client">Client:</strong> ${project.clientName || na}</p>
                                            <p><strong data-i18n="projects.details.location">Location:</strong> ${project.location || na}</p>
                                            <p><strong data-i18n="projects.details.capacity">Capacity:</strong> ${project.capacity || na}</p>
                                            <p><strong data-i18n="projects.details.status">Status:</strong> 
                                                <span class="badge bg-${project.status === 'completed' ? 'success' : 'warning'}">
                                                    ${project.status || 'completed'}
                                                </span>
                                            </p>
                                        </div>
                                        <div class="col-md-6">
                                            <h6 data-i18n="projects.details.timeline">Timeline</h6>
                                            <p><strong data-i18n="projects.details.started">Started:</strong> ${project.startDate ? new Date(project.startDate).toLocaleDateString() : na}</p>
                                            <p><strong data-i18n="projects.details.completed">Completed:</strong> ${project.completionDate ? new Date(project.completionDate).toLocaleDateString() : na}</p>
                                            <p><strong data-i18n="projects.details.created">Created:</strong> ${project.createdAt ? new Date(project.createdAt).toLocaleDateString() : na}</p>
                                            <p><strong data-i18n="projects.details.updated">Updated:</strong> ${project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : na}</p>
                                        </div>
                                    </div>
                                    
                                    ${project.equipmentUsed && project.equipmentUsed.length > 0 ? `
                                        <div class="mt-4">
                                            <h6 data-i18n="projects.details.equipmentUsed">Equipment Used</h6>
                                            <ul class="list-group list-group-flush">
                                                ${project.equipmentUsed.map(equipment => `<li class="list-group-item">${equipment}</li>`).join('')}
                                            </ul>
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="col-md-4">
                                    ${project.featuredImage ? `
                                        <div class="mb-3">
                                            <img src="${project.featuredImage}" class="img-fluid rounded" alt="Project Image">
                                        </div>
                                    ` : ''}
                                    
                                    <div class="card">
                                        <div class="card-header">
                                            <h6 class="mb-0" data-i18n="projects.details.projectStatistics">Project Statistics</h6>
                                        </div>
                                        <div class="card-body">
                                            <p><strong data-i18n="projects.details.projectId">Project ID:</strong> ${project.id}</p>
                                            <p><strong data-i18n="projects.details.category">Category:</strong> ${project.categoryName || t('projects.details.general')}</p>
                                            <p><strong data-i18n="projects.details.budget">Budget:</strong> ${project.budget || na}</p>
                                            <p><strong data-i18n="projects.details.duration">Duration:</strong> ${project.duration || na}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="projects.modal.close">Close</button>
                            <button type="button" class="btn btn-primary" onclick="editProject(${project.id}); bootstrap.Modal.getInstance(document.getElementById('projectDetailsModal')).hide();">
                                <i class="bi bi-pencil me-1"></i><span data-i18n="projects.modal.editProject">Edit Project</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('projectDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add new modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('projectDetailsModal'));
        modal.show();
        
        // Apply translations to the newly created modal
        if (window.adminI18n) {
            window.adminI18n.refresh();
        }
        
        // Clean up modal when hidden
        document.getElementById('projectDetailsModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    // Reset form when modal is hidden
    document.getElementById('projectModal').addEventListener('hidden.bs.modal', function() {
        projectForm.reset();
        currentEditingProject = null;
        projectIdInput.value = '';
        featuredImageUrl = '';
        galleryImageUrls = [];
        featuredImageUpload.value = '';
        galleryImagesUpload.value = '';
        renderFeaturedImage();
        renderGalleryImages();

        const modalTitle = window.adminI18n ? window.adminI18n.t('projects.modal.addTitle') : 'Add New Project';
        const buttonText = window.adminI18n ? window.adminI18n.t('projects.modal.save') : 'Save Project';
        document.getElementById('projectModalLabel').textContent = modalTitle;
        saveProjectBtn.textContent = buttonText;
    });

    // --- Image Management Logic ---
    // Featured image upload
    if (uploadFeaturedImageBtn) {
        uploadFeaturedImageBtn.addEventListener('click', () => {
            featuredImageUpload.click();
        });
    }

    if (featuredImageUpload) {
        featuredImageUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                
                const result = await apiService.uploadMedia(formData);
                if (result.success) {
                    featuredImageUrl = result.data.media.fileUrl;
                    renderFeaturedImage();
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

    if (selectFeaturedImageBtn) {
        selectFeaturedImageBtn.addEventListener('click', async () => {
            const selected = await window.mediaLibrarySelector.open({ multi: false });
            if (selected) {
                featuredImageUrl = selected;
                renderFeaturedImage();
            }
        });
    }

    if (removeFeaturedImageBtn) {
        removeFeaturedImageBtn.addEventListener('click', () => {
            featuredImageUrl = '';
            renderFeaturedImage();
        });
    }

    // Gallery images upload
    if (uploadGalleryImagesBtn) {
        uploadGalleryImagesBtn.addEventListener('click', () => {
            galleryImagesUpload.click();
        });
    }

    if (galleryImagesUpload) {
        galleryImagesUpload.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            try {
                const uploadPromises = files.map(async (file) => {
                    const formData = new FormData();
                    formData.append('file', file);
                    return await apiService.uploadMedia(formData);
                });

                const results = await Promise.all(uploadPromises);
                const successfulUploads = results.filter(result => result.success);
                
                if (successfulUploads.length > 0) {
                    successfulUploads.forEach(result => {
                        if (!galleryImageUrls.includes(result.data.media.fileUrl)) {
                            galleryImageUrls.push(result.data.media.fileUrl);
                        }
                    });
                    renderGalleryImages();
                    apiService.showNotification(`${successfulUploads.length} image(s) uploaded successfully!`, 'success');
                }
                
                if (successfulUploads.length < files.length) {
                    apiService.showNotification('Some images failed to upload', 'warning');
                }
            } catch (error) {
                console.error('Upload error:', error);
                apiService.showNotification('Failed to upload images', 'error');
            }
        }
        });
    }

    if (addGalleryImagesBtn) {
        addGalleryImagesBtn.addEventListener('click', async () => {
            const selected = await window.mediaLibrarySelector.open({ multi: true });
            if (selected && selected.length > 0) {
                selected.forEach(url => {
                    if (!galleryImageUrls.includes(url)) {
                        galleryImageUrls.push(url);
                    }
                });
                renderGalleryImages();
            }
        });
    }

    function renderFeaturedImage() {
        console.log('🖼️ renderFeaturedImage called with URL:', featuredImageUrl);
        console.log('🖼️ featuredImagePreview element:', featuredImagePreview);
        
        if (featuredImageUrl) {
            console.log('🖼️ Setting image source to:', featuredImageUrl);
            featuredImagePreview.src = featuredImageUrl;
            removeFeaturedImageBtn.classList.remove('d-none');
        } else {
            console.log('🖼️ No image URL, using placeholder');
            featuredImagePreview.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNlbGVjdCBJbWFnZTwvdGV4dD48L3N2Zz4=';
            removeFeaturedImageBtn.classList.add('d-none');
        }
        
        // Add error handler to see if image fails to load
        featuredImagePreview.onerror = function() {
            console.error('❌ Image failed to load:', featuredImagePreview.src);
        };
        
        featuredImagePreview.onload = function() {
            console.log('✅ Image loaded successfully:', featuredImagePreview.src);
        };
    }

    function renderGalleryImages() {
        galleryImagesGrid.innerHTML = galleryImageUrls.map((url, index) => `
            <div class="gallery-thumbnail">
                <img src="${url}" alt="Gallery image">
                <button type="button" class="btn-close" aria-label="Remove" onclick="removeGalleryImage(${index})"></button>
            </div>
        `).join('');
    }

    window.removeGalleryImage = (index) => {
        galleryImageUrls.splice(index, 1);
        renderGalleryImages();
    };

    // Make loadProjects globally available for retry button
    window.loadProjects = loadInitialData;
}); 
