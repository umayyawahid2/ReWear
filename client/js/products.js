let currentProducts = [];

async function fetchProducts(filters = {}) {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;

    productGrid.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Loading clothing items...</p>
        </div>
    `;

    try {
        const queryParams = new URLSearchParams();
        for (const key in filters) {
            if (filters[key] !== undefined && filters[key] !== '' && filters[key] !== 'All') {
                queryParams.append(key, filters[key]);
            }
        }

        const res = await fetch(`${API_BASE_URL}/products?${queryParams.toString()}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Failed to fetch products');

        currentProducts = data;
        renderProductGrid(currentProducts, productGrid);
    } catch (err) {
        productGrid.innerHTML = `
            <div class="col-12 text-center text-danger py-5">
                <i class="bi bi-exclamation-triangle fs-1"></i>
                <p class="mt-2">${err.message}</p>
            </div>
        `;
    }
}

function renderProductGrid(products, container) {
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="col-12 empty-state">
                <i class="bi bi-bag-x"></i>
                <h4>No items found</h4>
                <p>Try adjusting your search query or filters.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(product => {
        const imgUrl = getImageUrl(product.image);
        const isSold = product.status === 'sold';
        const badgeSold = isSold ? `<span class="badge-sold">SOLD</span>` : '';

        return `
            <div class="col-6 col-md-4 col-lg-3 mb-4">
                <div class="product-card">
                    <div class="product-img-wrapper">
                        <img src="${imgUrl}" class="product-img" alt="${product.title}" onerror="this.src='https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=600&auto=format&fit=crop'">
                        <span class="badge-condition">${product.condition}</span>
                        ${badgeSold}
                    </div>
                    <div class="product-body">
                        <div class="d-flex justify-content-between align-items-start mb-1">
                            <span class="badge bg-light text-dark border">${product.category}</span>
                            <span class="badge bg-secondary">${product.size}</span>
                        </div>
                        <h5 class="product-title" title="${product.title}">${product.title}</h5>
                        <p class="product-meta text-muted mb-2">
                            <i class="bi bi-geo-alt"></i> ${product.location || 'Unknown'}
                        </p>
                        <div class="mt-auto d-flex justify-content-between align-items-center pt-2 border-top">
                            <span class="product-price">Rs. ${product.price.toLocaleString()}</span>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-danger me-1" title="Add to Wishlist" onclick="handleWishlistToggle('${product._id}', event)">
                                    <i class="bi bi-heart"></i>
                                </button>
                                <a href="product-details.html?id=${product._id}" class="btn btn-sm btn-rewear-primary">View</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function handleWishlistToggle(productId, event) {
    if (event) event.stopPropagation();

    const token = getToken();
    if (!token) {
        showAlert('Please login to save items to your wishlist', 'warning');
        setTimeout(() => { window.location.href = 'login.html'; }, 1000);
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Wishlist update failed');

        if (data.wishlisted) {
            showAlert('Added to your Wishlist ❤️', 'success');
        } else {
            showAlert('Removed from your Wishlist', 'info');
        }
    } catch (err) {
        showAlert(err.message, 'danger');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    const filterCategory = document.getElementById('filterCategory');
    const filterSize = document.getElementById('filterSize');
    const filterCondition = document.getElementById('filterCondition');
    const filterLocation = document.getElementById('filterLocation');
    const filterMinPrice = document.getElementById('filterMinPrice');
    const filterMaxPrice = document.getElementById('filterMaxPrice');

    const applyFilters = () => {
        const filters = {
            search: document.getElementById('searchInput') ? document.getElementById('searchInput').value.trim() : '',
            category: filterCategory ? filterCategory.value : '',
            size: filterSize ? filterSize.value : '',
            condition: filterCondition ? filterCondition.value : '',
            location: filterLocation ? filterLocation.value.trim() : '',
            minPrice: filterMinPrice ? filterMinPrice.value : '',
            maxPrice: filterMaxPrice ? filterMaxPrice.value : ''
        };
        fetchProducts(filters);
    };

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            applyFilters();
        });
    }

    [filterCategory, filterSize, filterCondition].forEach(el => {
        if (el) el.addEventListener('change', applyFilters);
    });

    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            if (document.getElementById('searchInput')) document.getElementById('searchInput').value = '';
            if (filterCategory) filterCategory.value = 'All';
            if (filterSize) filterSize.value = 'All';
            if (filterCondition) filterCondition.value = 'All';
            if (filterLocation) filterLocation.value = '';
            if (filterMinPrice) filterMinPrice.value = '';
            if (filterMaxPrice) filterMaxPrice.value = '';
            fetchProducts();
        });
    }

    if (document.getElementById('productGrid')) {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        if (categoryParam && filterCategory) {
            filterCategory.value = categoryParam;
            fetchProducts({ category: categoryParam });
        } else {
            fetchProducts();
        }
    }
});
