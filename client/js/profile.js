document.addEventListener('DOMContentLoaded', () => {
    const token = getToken();
    if (!token) {
        showAlert('Please login to access your profile', 'warning');
        setTimeout(() => { window.location.href = 'login.html'; }, 1000);
        return;
    }

    loadUserProfile();

    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('profileName').value.trim();
            const countryCode = document.getElementById('editCountryCode') ? document.getElementById('editCountryCode').value : '+92';
            const rawPhone = document.getElementById('profilePhone').value.trim();
            const location = document.getElementById('profileLocation').value.trim();

            const phone = `${countryCode} ${rawPhone}`;

            try {
                const res = await fetch(`${API_BASE_URL}/users/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ name, phone, location })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Update failed');

                const user = getUser();
                user.name = data.name;
                user.phone = data.phone;
                user.location = data.location;
                localStorage.setItem('rewear_user', JSON.stringify(user));

                showAlert('Profile updated successfully!', 'success');
                renderNavbar();
                loadUserProfile();

                const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
                if (modal) modal.hide();
            } catch (err) {
                showAlert(err.message, 'danger');
            }
        });
    }
});

async function loadUserProfile() {
    const token = getToken();
    const profileInfoContainer = document.getElementById('profileInfoContainer');
    const myListingsContainer = document.getElementById('myListingsContainer');
    const savedItemsContainer = document.getElementById('savedItemsContainer');

    try {
        const res = await fetch(`${API_BASE_URL}/users/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load profile');

        const { user, myListings, savedItems } = data;

        if (profileInfoContainer) {
            profileInfoContainer.innerHTML = `
                <div class="d-flex align-items-center gap-3">
                    <div class="avatar-circle bg-primary text-white d-flex align-items-center justify-content-center rounded-circle fs-1 shadow-sm" style="width: 80px; height: 80px; font-weight: 700;">
                        ${user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 class="mb-1 fw-bold">${user.name} <span class="badge bg-secondary fs-6 ms-2">${user.role}</span></h3>
                        <p class="mb-1 text-muted"><i class="bi bi-envelope me-1"></i> ${user.email} | <i class="bi bi-telephone-fill me-1 text-success"></i> ${user.phone}</p>
                        <p class="mb-0 text-muted"><i class="bi bi-geo-alt-fill text-danger me-1"></i> ${user.location}</p>
                    </div>
                </div>
            `;
        }

        // Fill Edit Modal Fields
        if (document.getElementById('profileName')) document.getElementById('profileName').value = user.name || '';
        if (document.getElementById('profileLocation')) document.getElementById('profileLocation').value = user.location || '';

        // Parse Phone and Country Code
        if (document.getElementById('profilePhone') && document.getElementById('editCountryCode')) {
            const rawPhoneStr = user.phone || '';
            const match = rawPhoneStr.match(/^(\+\d+)\s*(.*)$/);
            if (match) {
                const code = match[1];
                const number = match[2];
                document.getElementById('editCountryCode').innerHTML = getCountryCodeOptionsHTML(code);
                document.getElementById('profilePhone').value = number;
            } else {
                document.getElementById('editCountryCode').innerHTML = getCountryCodeOptionsHTML('+92');
                document.getElementById('profilePhone').value = rawPhoneStr;
            }
        }

        if (myListingsContainer) {
            if (!myListings || myListings.length === 0) {
                myListingsContainer.innerHTML = `
                    <div class="col-12 empty-state">
                        <i class="bi bi-box-seam"></i>
                        <h5>No listings published yet</h5>
                        <a href="add-product.html" class="btn btn-rewear-primary mt-2">Create Your First Listing</a>
                    </div>
                `;
            } else {
                myListingsContainer.innerHTML = myListings.map(item => {
                    const imgUrl = getImageUrl(item.image);
                    const isSold = item.status === 'sold';
                    const soldBtnText = isSold ? 'Mark Available' : 'Mark Sold';
                    const soldBadge = isSold ? `<span class="badge bg-danger ms-2">SOLD</span>` : `<span class="badge bg-success ms-2">Available</span>`;

                    return `
                        <div class="col-md-6 col-lg-4 mb-4">
                            <div class="card h-100 shadow-sm border-0 rounded-4 overflow-hidden">
                                <div class="position-relative" style="height: 200px;">
                                    <img src="${imgUrl}" class="w-100 h-100" style="object-fit: cover;" alt="${item.title}">
                                </div>
                                <div class="card-body d-flex flex-column">
                                    <h5 class="card-title fw-bold mb-1">${item.title} ${soldBadge}</h5>
                                    <p class="text-primary fw-bold mb-2">Rs. ${item.price.toLocaleString()}</p>
                                    <div class="mt-auto d-flex flex-wrap gap-2 pt-2 border-top">
                                        <a href="add-product.html?id=${item._id}" class="btn btn-sm btn-outline-primary flex-grow-1">
                                            <i class="bi bi-pencil"></i> Edit
                                        </a>
                                        <button class="btn btn-sm btn-outline-warning flex-grow-1" onclick="toggleSoldStatus('${item._id}')">
                                            <i class="bi bi-check-circle"></i> ${soldBtnText}
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" onclick="deleteMyListing('${item._id}')">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        if (savedItemsContainer) {
            if (!savedItems || savedItems.length === 0) {
                savedItemsContainer.innerHTML = `
                    <div class="col-12 empty-state">
                        <i class="bi bi-heart"></i>
                        <h5>Your wishlist is empty</h5>
                        <a href="products.html" class="btn btn-outline-primary mt-2">Discover Items</a>
                    </div>
                `;
            } else {
                savedItemsContainer.innerHTML = savedItems.map(item => {
                    const imgUrl = getImageUrl(item.image);
                    return `
                        <div class="col-md-6 col-lg-4 mb-4">
                            <div class="card h-100 shadow-sm border-0 rounded-4 overflow-hidden">
                                <img src="${imgUrl}" class="card-img-top" style="height: 200px; object-fit: cover;" alt="${item.title}">
                                <div class="card-body d-flex flex-column">
                                    <h5 class="card-title fw-bold">${item.title}</h5>
                                    <p class="text-primary fw-bold">Rs. ${item.price.toLocaleString()}</p>
                                    <div class="mt-auto d-flex justify-content-between align-items-center">
                                        <a href="product-details.html?id=${item._id}" class="btn btn-sm btn-rewear-primary">View Item</a>
                                        <button class="btn btn-sm btn-outline-danger" onclick="removeFromWishlistProfile('${item._id}')">Remove</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
    } catch (err) {
        showAlert(err.message, 'danger');
    }
}

async function toggleSoldStatus(productId) {
    const token = getToken();
    try {
        const res = await fetch(`${API_BASE_URL}/products/${productId}/sold`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Action failed');

        showAlert(data.message, 'success');
        loadUserProfile();
    } catch (err) {
        showAlert(err.message, 'danger');
    }
}

async function deleteMyListing(productId) {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    const token = getToken();
    try {
        const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Delete failed');

        showAlert('Listing deleted successfully', 'info');
        loadUserProfile();
    } catch (err) {
        showAlert(err.message, 'danger');
    }
}

async function removeFromWishlistProfile(productId) {
    const token = getToken();
    try {
        const res = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to update wishlist');

        showAlert('Removed from wishlist', 'info');
        loadUserProfile();
    } catch (err) {
        showAlert(err.message, 'danger');
    }
}
