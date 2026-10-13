document.addEventListener('DOMContentLoaded', () => {
    const token = getToken();
    if (!token) {
        showAlert('Please login to view your saved wishlist items', 'warning');
        setTimeout(() => { window.location.href = 'login.html'; }, 1000);
        return;
    }

    loadWishlistPage();
});

async function loadWishlistPage() {
    const container = document.getElementById('wishlistContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Loading your saved items...</p>
        </div>
    `;

    try {
        const res = await fetch(`${API_BASE_URL}/wishlist`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        const products = await res.json();
        if (!res.ok) throw new Error(products.message || 'Failed to fetch wishlist');

        if (!products || products.length === 0) {
            container.innerHTML = `
                <div class="col-12 empty-state">
                    <i class="bi bi-heart text-danger fs-1"></i>
                    <h4 class="mt-3">Your wishlist is empty</h4>
                    <p class="text-muted">Browse clothes and click the heart icon to save items here.</p>
                    <a href="products.html" class="btn btn-rewear-primary mt-2">Browse Shop</a>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => {
            const imgUrl = getImageUrl(product.image);
            const isSold = product.status === 'sold';
            const badgeSold = isSold ? `<span class="badge bg-danger position-absolute top-0 end-0 m-2">SOLD</span>` : '';

            return `
                <div class="col-6 col-md-4 col-lg-3 mb-4">
                    <div class="product-card">
                        <div class="product-img-wrapper position-relative">
                            <img src="${imgUrl}" class="product-img" alt="${product.title}">
                            <span class="badge-condition">${product.condition}</span>
                            ${badgeSold}
                        </div>
                        <div class="product-body">
                            <h5 class="product-title" title="${product.title}">${product.title}</h5>
                            <p class="product-meta text-muted mb-2"><i class="bi bi-geo-alt"></i> ${product.location}</p>
                            <div class="mt-auto d-flex justify-content-between align-items-center pt-2 border-top">
                                <span class="product-price">Rs. ${product.price.toLocaleString()}</span>
                                <div class="btn-group">
                                    <button class="btn btn-sm btn-outline-danger me-1" onclick="removeWishlistItem('${product._id}')" title="Remove">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                    <a href="product-details.html?id=${product._id}" class="btn btn-sm btn-rewear-primary">View</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        container.innerHTML = `
            <div class="col-12 text-center text-danger py-5">
                <i class="bi bi-exclamation-circle fs-1"></i>
                <p class="mt-2">${err.message}</p>
            </div>
        `;
    }
}

async function removeWishlistItem(productId) {
    try {
        const res = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (!res.ok) throw new Error('Failed to remove item');

        showAlert('Item removed from wishlist', 'info');
        loadWishlistPage();
    } catch (err) {
        showAlert(err.message, 'danger');
    }
}
