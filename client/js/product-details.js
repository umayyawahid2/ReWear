let currentProduct = null;

async function loadProductDetails() {
    const detailsContainer = document.getElementById('productDetailsContainer');
    if (!detailsContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        detailsContainer.innerHTML = `
            <div class="alert alert-danger text-center my-5 rounded-4 shadow-sm">
                <h4>Product Not Found</h4>
                <a href="products.html" class="btn btn-outline-danger mt-2">Back to Shop</a>
            </div>
        `;
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/products/${productId}`);
        const product = await res.json();

        if (!res.ok) throw new Error(product.message || 'Product not found');

        currentProduct = product;
        renderProductDetails(product, detailsContainer);
        checkWishlist(product._id);
    } catch (err) {
        detailsContainer.innerHTML = `
            <div class="alert alert-danger text-center my-5 rounded-4 shadow-sm">
                <h4>Error Loading Product</h4>
                <p>${err.message}</p>
                <a href="products.html" class="btn btn-outline-primary mt-2">Browse All Products</a>
            </div>
        `;
    }
}

function renderProductDetails(product, container) {
    const imgUrl = getImageUrl(product.image);
    const seller = product.sellerId || {};
    const isSold = product.status === 'sold';
    const statusBadge = isSold 
        ? `<span class="badge bg-danger fs-6 px-3 py-2 rounded-pill">SOLD</span>`
        : `<span class="badge bg-success fs-6 px-3 py-2 rounded-pill">AVAILABLE</span>`;

    const rawPhone = seller.phone || '';
    const cleanPhone = rawPhone.replace(/[^\d+]/g, '');

    container.innerHTML = `
        <div class="row g-4 align-items-center">
            <div class="col-md-6">
                <div class="card shadow-md border-0 rounded-4 overflow-hidden position-relative">
                    <img src="${imgUrl}" class="img-fluid w-100" style="max-height: 520px; object-fit: cover;" alt="${product.title}">
                </div>
            </div>
            <div class="col-md-6">
                <div class="ps-md-3">
                    <div class="d-flex align-items-center gap-2 mb-3">
                        <span class="product-category-tag">${product.category}</span>
                        ${statusBadge}
                    </div>
                    <h1 class="display-6 fw-bold mb-2">${product.title}</h1>
                    <h2 class="text-primary fw-bold mb-4">Rs. ${product.price.toLocaleString()}</h2>

                    <div class="card bg-white border shadow-sm rounded-4 p-3.5 mb-4">
                        <div class="row g-3">
                            <div class="col-6">
                                <span class="text-muted small d-block">Brand</span>
                                <strong class="fs-6">${product.brand || 'Unbranded'}</strong>
                            </div>
                            <div class="col-6">
                                <span class="text-muted small d-block">Size</span>
                                <strong class="fs-6">${product.size}</strong>
                            </div>
                            <div class="col-6">
                                <span class="text-muted small d-block">Condition</span>
                                <strong class="fs-6">${product.condition}</strong>
                            </div>
                            <div class="col-6">
                                <span class="text-muted small d-block">Location</span>
                                <strong class="fs-6"><i class="bi bi-geo-alt-fill text-danger me-1"></i>${product.location}</strong>
                            </div>
                        </div>
                    </div>

                    <div class="d-flex gap-2 mb-4">
                        <button class="btn btn-rewear-primary btn-lg flex-grow-1" data-bs-toggle="modal" data-bs-target="#sellerContactModal">
                            <i class="bi bi-telephone-fill me-2"></i> Contact Seller
                        </button>
                        <button id="btnWishlistDetail" class="btn btn-outline-danger btn-lg" onclick="toggleWishlistDetail('${product._id}')">
                            <i class="bi bi-heart"></i> Wishlist
                        </button>
                    </div>

                    <div class="border-top pt-3">
                        <h5 class="fw-bold mb-2">Description</h5>
                        <p class="text-secondary" style="white-space: pre-line; line-height: 1.6;">${product.description}</p>
                    </div>

                    <div class="border-top pt-3 mt-3 d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center gap-3">
                            <div class="avatar-circle bg-primary text-white d-flex align-items-center justify-content-center rounded-circle fs-4" style="width: 48px; height: 48px; font-weight: 700;">
                                ${(seller.name || 'S').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h6 class="mb-0 fw-bold">${seller.name || 'Anonymous Seller'}</h6>
                                <small class="text-muted"><i class="bi bi-geo-alt"></i> ${seller.location || 'Location not specified'}</small>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-link text-muted text-decoration-none" data-bs-toggle="modal" data-bs-target="#reportModal">
                            <i class="bi bi-flag"></i> Report item
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Contact Seller Modal -->
        <div class="modal fade" id="sellerContactModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4">
                    <div class="modal-header bg-light border-0">
                        <h5 class="modal-title fw-bold"><i class="bi bi-person-lines-fill text-primary me-2"></i> Seller Contact Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body text-center p-4">
                        <div class="avatar-circle mx-auto mb-3 bg-primary text-white d-flex align-items-center justify-content-center rounded-circle fs-2 shadow-sm" style="width: 75px; height: 75px; font-weight: 700;">
                            ${(seller.name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <h4 class="fw-bold mb-1">${seller.name || 'Unknown Seller'}</h4>
                        <p class="text-muted mb-4"><i class="bi bi-geo-alt-fill text-danger me-1"></i> ${seller.location || 'N/A'}</p>

                        <div class="list-group list-group-flush text-start mb-3 rounded-3 border">
                            <div class="list-group-item d-flex justify-content-between align-items-center py-3">
                                <span><i class="bi bi-telephone-fill text-success fs-5 me-2"></i> Phone / WhatsApp</span>
                                <a href="tel:${cleanPhone}" class="fw-bold text-decoration-none fs-6">${seller.phone || 'Not provided'}</a>
                            </div>
                            <div class="list-group-item d-flex justify-content-between align-items-center py-3">
                                <span><i class="bi bi-envelope-fill text-primary fs-5 me-2"></i> Email Address</span>
                                <a href="mailto:${seller.email}?subject=Interested in ${encodeURIComponent(product.title)}" class="fw-bold text-decoration-none fs-6">${seller.email || 'Not provided'}</a>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer bg-light border-0">
                        <a href="tel:${cleanPhone}" class="btn btn-success w-100 py-2.5 fw-semibold"><i class="bi bi-telephone-out me-2"></i> Call Seller Now</a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Report Modal -->
        <div class="modal fade" id="reportModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4">
                    <div class="modal-header border-0">
                        <h5 class="modal-title fw-bold text-danger"><i class="bi bi-flag-fill me-2"></i> Report Listing</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form id="reportForm" onsubmit="submitReport(event, '${product._id}')">
                        <div class="modal-body p-4">
                            <p class="text-muted">Please specify why you are reporting this clothing item:</p>
                            <div class="mb-3">
                                <label class="form-label font-weight-bold">Reason for Report</label>
                                <select id="reportReason" class="form-select" required>
                                    <option value="" selected disabled>Select a reason...</option>
                                    <option value="Prohibited or Illegal Item">Prohibited or Illegal Item</option>
                                    <option value="Fake / Counterfeit Brand">Fake / Counterfeit Brand</option>
                                    <option value="Misleading Information or Wrong Photo">Misleading Information or Wrong Photo</option>
                                    <option value="Offensive Content">Offensive Content</option>
                                    <option value="Suspected Fraud / Spam">Suspected Fraud / Spam</option>
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer border-0">
                            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" class="btn btn-danger">Submit Report</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

async function checkWishlist(productId) {
    const token = getToken();
    if (!token) return;

    try {
        const res = await fetch(`${API_BASE_URL}/wishlist/check/${productId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        const btn = document.getElementById('btnWishlistDetail');
        if (btn && data.wishlisted) {
            btn.classList.remove('btn-outline-danger');
            btn.classList.add('btn-danger');
            btn.innerHTML = `<i class="bi bi-heart-fill"></i> Wishlisted`;
        }
    } catch (e) {
        console.error(e);
    }
}

async function toggleWishlistDetail(productId) {
    const token = getToken();
    if (!token) {
        showAlert('Please login to add items to your wishlist', 'warning');
        setTimeout(() => { window.location.href = 'login.html'; }, 1000);
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        const btn = document.getElementById('btnWishlistDetail');
        if (data.wishlisted) {
            btn.classList.remove('btn-outline-danger');
            btn.classList.add('btn-danger');
            btn.innerHTML = `<i class="bi bi-heart-fill"></i> Wishlisted`;
            showAlert('Added to wishlist ❤️', 'success');
        } else {
            btn.classList.remove('btn-danger');
            btn.classList.add('btn-outline-danger');
            btn.innerHTML = `<i class="bi bi-heart"></i> Wishlist`;
            showAlert('Removed from wishlist', 'info');
        }
    } catch (err) {
        showAlert(err.message, 'danger');
    }
}

async function submitReport(event, productId) {
    event.preventDefault();
    const token = getToken();
    if (!token) {
        showAlert('Please login to report items', 'warning');
        return;
    }

    const reason = document.getElementById('reportReason').value;
    try {
        const res = await fetch(`${API_BASE_URL}/products/${productId}/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ reason })
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Failed to submit report');

        showAlert('Report submitted to admins for review', 'success');
        const reportModalEl = document.getElementById('reportModal');
        const modal = bootstrap.Modal.getInstance(reportModalEl);
        if (modal) modal.hide();
    } catch (err) {
        showAlert(err.message, 'danger');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();
});
