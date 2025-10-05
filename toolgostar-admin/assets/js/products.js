document.addEventListener("DOMContentLoaded", function () {
    const productsTableBody = document.getElementById('products-table-body');
    const addProductForm = document.getElementById('add-product-form');
    const saveProductBtn = document.getElementById('save-product-btn');

    let products = [];
    let filteredProducts = [];
    let currentEditingProduct = null;

    // Load categories and products on page load
    loadCategories();
    loadProducts();

    // Listen for language changes to refresh products content
    window.addEventListener('languageChanged', () => {
        // Re-render products with new language
        renderProducts(filteredProducts);
    });

    // Save product button event
    if (saveProductBtn) {
        saveProductBtn.addEventListener('click', function() {
            saveProduct();
        });
    }

    // Search functionality
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterProducts(this.value);
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            filterProducts(searchInput.value);
        });
    }

    function filterProducts(searchTerm) {
        if (!searchTerm.trim()) {
            filteredProducts = [...products];
        } else {
            const term = searchTerm.toLowerCase();
            filteredProducts = products.filter(product => {
                // Handle multilingual name search
                let productName = product.name;
                if (typeof product.name === 'string' && product.name.startsWith('{')) {
                    try {
                        const nameObj = JSON.parse(product.name);
                        productName = (nameObj.en || '') + ' ' + (nameObj.fa || '');
                    } catch (e) {
                        productName = product.name;
                    }
                } else if (typeof product.name === 'object') {
                    productName = (product.name.en || '') + ' ' + (product.name.fa || '');
                }
                
                // Handle multilingual description search
                let productDescription = product.shortDescription;
                if (typeof product.shortDescription === 'string' && product.shortDescription.startsWith('{')) {
                    try {
                        const descObj = JSON.parse(product.shortDescription);
                        productDescription = (descObj.en || '') + ' ' + (descObj.fa || '');
                    } catch (e) {
                        productDescription = product.shortDescription || '';
                    }
                } else if (typeof product.shortDescription === 'object') {
                    productDescription = (product.shortDescription.en || '') + ' ' + (product.shortDescription.fa || '');
                }
                
                return productName.toLowerCase().includes(term) ||
                       productDescription.toLowerCase().includes(term) ||
                       (product.category && product.category.name.toLowerCase().includes(term));
            });
        }
        renderProducts(filteredProducts);
    }

    async function loadProducts() {
        try {
            showLoading();
            
            const result = await apiService.getProducts();
            
            if (result.success) {
                products = result.data || [];
                filteredProducts = [...products];
                renderProducts(filteredProducts);
            } else {
                showError('Failed to load products: ' + (result.error?.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error loading products:', error);
            showError('Network error. Please check your connection and try again.');
        }
    }

    function showLoading() {
        productsTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    <div class="spinner-border spinner-border-sm me-2" role="status">
                        <span class="visually-hidden" data-i18n="common.loading">Loading...</span>
                    </div>
                    <span data-i18n="products.messages.loading">Loading products...</span>
                </td>
            </tr>
        `;
        
        // Apply translations to the loading state
        if (window.adminI18n) {
            window.adminI18n.refresh();
        }
    }

    function showError(message) {
        productsTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>${message}
                    <br><button class="btn btn-outline-danger btn-sm mt-2" onclick="loadProducts()">
                        <i class="bi bi-arrow-clockwise me-1"></i><span data-i18n="products.actions.tryAgain">Try Again</span>
                    </button>
                </td>
            </tr>
        `;
        
        // Apply translations to the error state
        if (window.adminI18n) {
            window.adminI18n.refresh();
        }
    }

    function renderProducts(productsToRender) {
        if (productsToRender.length === 0) {
            productsTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">
                        <i class="bi bi-inbox me-2"></i><span data-i18n="products.messages.noData">No products found</span>
                        <br><small data-i18n="products.messages.noDataMessage">Click "Add New Product" to create your first product</small>
                    </td>
                </tr>
            `;
            
            // Apply translations to the no data state
            if (window.adminI18n) {
                window.adminI18n.refresh();
            }
            return;
        }

        productsTableBody.innerHTML = productsToRender.map(product => {
            // Handle multilingual name
            let displayName = product.name;
            if (typeof product.name === 'string' && product.name.startsWith('{')) {
                try {
                    const nameObj = JSON.parse(product.name);
                    displayName = nameObj.en || nameObj.fa || product.name;
                } catch (e) {
                    displayName = product.name;
                }
            } else if (typeof product.name === 'object') {
                displayName = product.name.en || product.name.fa || 'Unnamed Product';
            }
            
            // Handle multilingual description
            let displayDescription = product.shortDescription;
            if (typeof product.shortDescription === 'string' && product.shortDescription.startsWith('{')) {
                try {
                    const descObj = JSON.parse(product.shortDescription);
                    displayDescription = descObj.en || descObj.fa || product.shortDescription;
                } catch (e) {
                    displayDescription = product.shortDescription;
                }
            } else if (typeof product.shortDescription === 'object') {
                displayDescription = product.shortDescription.en || product.shortDescription.fa || '';
            }
            
            return `
            <tr>
                <td>${product.id}</td>
                <td>
                    <div>
                        <strong>${displayName}</strong>
                        ${displayDescription ? `<br><small class="text-muted">${displayDescription.substring(0, 50)}${displayDescription.length > 50 ? '...' : ''}</small>` : ''}
                    </div>
                </td>
                <td>
                    <span class="badge bg-secondary">${product.category ? product.category.name : (window.adminI18n ? window.adminI18n.t('products.table.uncategorized') : 'Uncategorized')}</span>
                </td>
                <td>
                    <span class="badge bg-${product.status === 'active' ? 'success' : product.status === 'inactive' ? 'danger' : 'warning'}">
                        ${product.status === 'active' ? 'Active' : product.status === 'inactive' ? 'Inactive' : 'Draft'}
                    </span>
                </td>
                <td>${product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button type="button" class="btn btn-outline-primary" onclick="viewProduct(${product.id})" data-i18n-title="products.actions.view">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button type="button" class="btn btn-outline-success" onclick="editProduct(${product.id})" data-i18n-title="products.actions.edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button type="button" class="btn btn-outline-danger" onclick="deleteProduct(${product.id})" data-i18n-title="products.actions.delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
        }).join('');
        
        // Apply translations to the rendered products
        if (window.adminI18n) {
            window.adminI18n.refresh();
        }
    }

    async function saveProduct() {
        // Collect specifications
        const specifications = {};
        document.querySelectorAll('#specifications-container .row').forEach(row => {
            const key = row.querySelector('.spec-key').value.trim();
            const value = row.querySelector('.spec-value').value.trim();
            if (key && value) {
                specifications[key] = value;
            }
        });

        const formData = new FormData();
        
        // Handle multilingual name
        const nameEn = document.getElementById('product-name-en').value;
        const nameFa = document.getElementById('product-name-fa').value;
        formData.append('name', JSON.stringify({ en: nameEn, fa: nameFa }));
        
        formData.append('categoryId', document.getElementById('product-category').value);
        formData.append('status', document.getElementById('product-status').value);
        
        // Handle multilingual description
        const descriptionEn = document.getElementById('product-description-en').value;
        const descriptionFa = document.getElementById('product-description-fa').value;
        formData.append('shortDescription', JSON.stringify({ en: descriptionEn, fa: descriptionFa }));
        
        // Handle icon
        formData.append('icon', document.getElementById('product-icon').value);
        
        // Handle multilingual features
        const featuresEn = document.getElementById('product-features-en').value.split('\n').filter(f => f.trim() !== '');
        const featuresFa = document.getElementById('product-features-fa').value.split('\n').filter(f => f.trim() !== '');
        formData.append('features', JSON.stringify({ en: featuresEn, fa: featuresFa }));
        
        // Handle multilingual applications
        const applicationsEn = document.getElementById('product-applications-en').value.split('\n').filter(a => a.trim() !== '');
        const applicationsFa = document.getElementById('product-applications-fa').value.split('\n').filter(a => a.trim() !== '');
        formData.append('applications', JSON.stringify({ en: applicationsEn, fa: applicationsFa }));
        
        formData.append('specifications', JSON.stringify(specifications));

        // Append files if they exist
        const featuredImage = document.getElementById('product-featured-image').files[0];
        if (featuredImage) {
            formData.append('featuredImage', featuredImage);
        }

        const catalog = document.getElementById('product-catalog').files[0];
        if (catalog) {
            formData.append('catalog', catalog);
        }

        // Validate required fields
        if (!nameEn || !nameFa || !formData.get('categoryId')) {
            const message = window.adminI18n ? window.adminI18n.t('products.messages.validationError') : 'Please fill in all required fields (name in both languages and category)';
            apiService.showNotification(message, 'error');
            return;
        }

        try {
            saveProductBtn.disabled = true;
            saveProductBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

            let result;
            if (currentEditingProduct) {
                // Update existing product
                result = await apiService.updateProduct(currentEditingProduct.id, formData);
            } else {
                // Create new product
                result = await apiService.createProduct(formData);
            }

            if (result.success) {
                const successMessage = currentEditingProduct ? 
                    (window.adminI18n ? window.adminI18n.t('products.messages.updateSuccess') : 'Product updated successfully!') :
                    (window.adminI18n ? window.adminI18n.t('products.messages.saveSuccess') : 'Product created successfully!');
                apiService.showNotification(successMessage, 'success');
                
                // Close modal and reset form
                const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
                modal.hide();
                addProductForm.reset();
                document.getElementById('specifications-container').innerHTML = ''; // Also clear specs
                document.getElementById('product-applications-en').value = ''; // Clear applications
                document.getElementById('product-applications-fa').value = ''; // Clear applications
                currentEditingProduct = null;
                
                // Reload products
                loadProducts();
            } else {
                const errorMessage = window.adminI18n ? 
                    window.adminI18n.t('products.messages.saveError') + ': ' + (result.error?.message || 'Unknown error') :
                    'Failed to save product: ' + (result.error?.message || 'Unknown error');
                apiService.showNotification(errorMessage, 'error');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            const networkMessage = window.adminI18n ? window.adminI18n.t('products.messages.networkError') : 'Network error. Please try again.';
            apiService.showNotification(networkMessage, 'error');
        } finally {
            saveProductBtn.disabled = false;
            const buttonText = currentEditingProduct ? 
                (window.adminI18n ? window.adminI18n.t('products.modal.update') : 'Update Product') :
                (window.adminI18n ? window.adminI18n.t('products.modal.save') : 'Save Product');
            saveProductBtn.innerHTML = buttonText;
        }
    }

    // Global functions for CRUD operations
    async function editProduct(id) {
        try {
            const result = await apiService.getProduct(id);
            if (result.success) {
                const product = result.data; // Corrected: data is the product object
                currentEditingProduct = product;
                
                // Populate form with product data
                // Handle multilingual name
                if (typeof product.name === 'object') {
                    document.getElementById('product-name-en').value = product.name.en || '';
                    document.getElementById('product-name-fa').value = product.name.fa || '';
                } else {
                    document.getElementById('product-name-en').value = product.name || '';
                    document.getElementById('product-name-fa').value = product.name || '';
                }
                
                document.getElementById('product-category').value = product.categoryId || '';
                document.getElementById('product-status').value = product.status || 'active';
                
                // Handle multilingual description
                if (typeof product.shortDescription === 'object') {
                    document.getElementById('product-description-en').value = product.shortDescription.en || '';
                    document.getElementById('product-description-fa').value = product.shortDescription.fa || '';
                } else {
                    document.getElementById('product-description-en').value = product.shortDescription || '';
                    document.getElementById('product-description-fa').value = product.shortDescription || '';
                }
                
                // Handle icon
                document.getElementById('product-icon').value = product.icon || '';
                
                // Handle multilingual features
                if (typeof product.features === 'object') {
                    document.getElementById('product-features-en').value = (product.features.en || []).join('\n');
                    document.getElementById('product-features-fa').value = (product.features.fa || []).join('\n');
                } else {
                    const features = product.features || [];
                    document.getElementById('product-features-en').value = features.join('\n');
                    document.getElementById('product-features-fa').value = features.join('\n');
                }
                
                // Handle multilingual applications
                if (typeof product.applications === 'object') {
                    document.getElementById('product-applications-en').value = (product.applications.en || []).join('\n');
                    document.getElementById('product-applications-fa').value = (product.applications.fa || []).join('\n');
                } else {
                    const applications = product.applications || [];
                    document.getElementById('product-applications-en').value = applications.join('\n');
                    document.getElementById('product-applications-fa').value = applications.join('\n');
                }
                
                // Show current file names
                document.getElementById('current-featured-image').textContent = product.featuredImage ? `Current: ${product.featuredImage.split('/').pop()}` : '';
                document.getElementById('current-catalog').textContent = product.catalogUrl ? `Current: ${product.catalogUrl.split('/').pop()}` : '';


                // Populate specifications
                const specsContainer = document.getElementById('specifications-container');
                specsContainer.innerHTML = ''; // Clear existing
                if (product.specifications) {
                    for (const [key, value] of Object.entries(product.specifications)) {
                        addSpecificationRow(key, value);
                    }
                }
                
                // Update modal title and button
                const modalTitle = window.adminI18n ? window.adminI18n.t('products.modal.editTitle') : 'Edit Product';
                const buttonText = window.adminI18n ? window.adminI18n.t('products.modal.update') : 'Update Product';
                document.getElementById('addProductModalLabel').textContent = modalTitle;
                saveProductBtn.textContent = buttonText;
                
                // Show modal
                const modal = new bootstrap.Modal(document.getElementById('addProductModal'));
                modal.show();
            } else {
                const errorMessage = window.adminI18n ? window.adminI18n.t('products.messages.loadEditError') : 'Failed to load product for editing';
                apiService.showNotification(errorMessage, 'error');
            }
        } catch (error) {
            const networkMessage = window.adminI18n ? window.adminI18n.t('products.messages.networkError') : 'Network error loading product';
            apiService.showNotification(networkMessage, 'error');
        }
    }

    window.editProduct = editProduct;
    window.deleteProduct = deleteProduct;
    window.viewProduct = viewProduct;

    function viewProduct(id) {
        // Find the product in the local array to avoid a new API call
        const product = products.find(p => p.id === id);
        if (product) {
            // Using alert for simplicity. A modal would be better for UX.
            const details = `
                Product Details:
                --------------------
                ID: ${product.id}
                Name: ${product.name}
                Category: ${product.category?.name || 'N/A'}
                Status: ${product.isActive ? 'Active' : 'Inactive'}
                Description: ${product.shortDescription || 'N/A'}
                Features: ${product.features?.join(', ') || 'N/A'}
                Applications: ${product.applications?.join(', ') || 'N/A'}
            `;
            alert(details);
        } else {
            apiService.showNotification('Could not find product details.', 'error');
        }
    }

    async function deleteProduct(id) {
        const confirmMessage = window.adminI18n ? window.adminI18n.t('products.messages.confirmDelete') : 'Are you sure you want to delete this product?';
        if (!confirm(confirmMessage)) {
            return;
        }

        try {
            const result = await apiService.deleteProduct(id);
            if (result.success) {
                const successMessage = window.adminI18n ? window.adminI18n.t('products.messages.deleteSuccess') : 'Product deleted successfully';
                apiService.showNotification(successMessage, 'success');
                loadProducts(); // Refresh the list
            } else {
                 const errorMessage = result.error?.message || (window.adminI18n ? window.adminI18n.t('products.messages.deleteError') : 'Failed to delete product');
                apiService.showNotification(errorMessage, 'error');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            const networkErrorMessage = window.adminI18n ? window.adminI18n.t('products.messages.networkError') : 'Network error. Please try again.';
            apiService.showNotification(networkErrorMessage, 'error');
        }
    }

    function showProductDetails(product) {
        // Get translations
        const t = window.adminI18n ? window.adminI18n.t.bind(window.adminI18n) : (key) => key;
        const na = t('products.details.na');
        
        const modalHtml = `
            <div class="modal fade" id="productDetailsModal" tabindex="-1" aria-labelledby="productDetailsModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="productDetailsModalLabel" data-i18n="products.modal.detailsTitle">Product Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6 data-i18n="products.details.basicInfo">Basic Information</h6>
                                    <p><strong data-i18n="products.details.name">Name:</strong> ${product.name}</p>
                                    <p><strong data-i18n="products.details.category">Category:</strong> ${product.category || na}</p>
                                    <p><strong data-i18n="products.details.status">Status:</strong> 
                                        <span class="badge bg-${product.status === 'active' ? 'success' : 'secondary'}">
                                            ${product.status || 'active'}
                                        </span>
                                    </p>
                                    <p><strong data-i18n="products.details.capacity">Capacity:</strong> ${product.capacity || na}</p>
                                    <p><strong data-i18n="products.details.powerRange">Power Range:</strong> ${product.powerRange || na}</p>
                                </div>
                                <div class="col-md-6">
                                    <h6 data-i18n="products.details.additionalInfo">Additional Information</h6>
                                    <p><strong data-i18n="products.details.created">Created:</strong> ${product.createdAt ? new Date(product.createdAt).toLocaleDateString() : na}</p>
                                    <p><strong data-i18n="products.details.updated">Updated:</strong> ${product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : na}</p>
                                </div>
                            </div>
                            ${product.description ? `
                                <div class="row mt-3">
                                    <div class="col-12">
                                        <h6 data-i18n="products.details.description">Description</h6>
                                        <p>${product.description}</p>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="products.modal.close">Close</button>
                            <button type="button" class="btn btn-primary" onclick="editProduct(${product.id}); bootstrap.Modal.getInstance(document.getElementById('productDetailsModal')).hide();">
                                <i class="bi bi-pencil me-1"></i><span data-i18n="products.modal.editProduct">Edit Product</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('productDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add new modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('productDetailsModal'));
        modal.show();
        
        // Apply translations to the newly created modal
        if (window.adminI18n) {
            window.adminI18n.refresh();
        }
        
        // Clean up modal when hidden
        document.getElementById('productDetailsModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    // Reset form when modal is hidden
    document.getElementById('addProductModal').addEventListener('hidden.bs.modal', function() {
        addProductForm.reset();
        document.getElementById('specifications-container').innerHTML = ''; // Also clear specs
        document.getElementById('product-applications-en').value = ''; // Clear applications
        document.getElementById('product-applications-fa').value = ''; // Clear applications
        currentEditingProduct = null;
        const modalTitle = window.adminI18n ? window.adminI18n.t('products.modal.addTitle') : 'Add New Product';
        const buttonText = window.adminI18n ? window.adminI18n.t('products.modal.save') : 'Save Product';
        document.getElementById('addProductModalLabel').textContent = modalTitle;
        saveProductBtn.textContent = buttonText;
    });

    // Make loadProducts globally available for retry button
    window.loadProducts = loadProducts;

    // Handle icon language checkboxes
    function setupIconCheckboxes() {
        const iconEnCheckbox = document.getElementById('icon-lang-en');
        const iconFaCheckbox = document.getElementById('icon-lang-fa');
        const iconNote = document.getElementById('icon-note');

        function updateIconNote() {
            if (iconEnCheckbox && iconFaCheckbox && iconNote) {
                if (iconEnCheckbox.checked && iconFaCheckbox.checked) {
                    iconNote.style.display = 'block';
                } else {
                    iconNote.style.display = 'none';
                }
            }
        }

        if (iconEnCheckbox) {
            iconEnCheckbox.addEventListener('change', updateIconNote);
        }
        if (iconFaCheckbox) {
            iconFaCheckbox.addEventListener('change', updateIconNote);
        }
    }

    // Initialize icon checkboxes when DOM is loaded
    setupIconCheckboxes();

    // Handle dynamic specifications in the modal
    const addSpecBtn = document.getElementById('add-spec-btn');
    const specsContainer = document.getElementById('specifications-container');

    if (addSpecBtn) {
        addSpecBtn.addEventListener('click', () => {
            addSpecificationRow();
        });
    }

    function addSpecificationRow(key = '', value = '') {
        const specRow = document.createElement('div');
        specRow.className = 'row mb-2 align-items-center';
        specRow.innerHTML = `
            <div class="col-5">
                <input type="text" class="form-control form-control-sm spec-key" placeholder="Specification Name (e.g., Material)" value="${key}">
            </div>
            <div class="col-5">
                <input type="text" class="form-control form-control-sm spec-value" placeholder="Value (e.g., Stainless Steel)" value="${value}">
            </div>
            <div class="col-2">
                <button type="button" class="btn btn-outline-danger btn-sm remove-spec-btn">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        specsContainer.appendChild(specRow);

        specRow.querySelector('.remove-spec-btn').addEventListener('click', function() {
            this.closest('.row').remove();
        });
    }

    // Load categories from backend
    async function loadCategories() {
        try {
            const result = await apiService.getProductCategories();
            if (result.success && result.data) {
                const categorySelect = document.getElementById('product-category');
                if (categorySelect) {
                    // Clear existing options except the first one
                    categorySelect.innerHTML = '<option value="" data-i18n="products.form.selectCategory">Select Category</option>';
                    
                    // Add categories from backend
                    result.data.forEach(category => {
                        const option = document.createElement('option');
                        option.value = category.id;
                        option.textContent = category.name;
                        categorySelect.appendChild(option);
                    });
                }
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }
});
