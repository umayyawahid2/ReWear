document.addEventListener('DOMContentLoaded', () => {
    const user = getUser();
    const token = getToken();

    if (!user || !token || user.role !== 'admin') {
        showAlert('Access Denied: Admin privilege required', 'danger');
        setTimeout(() => { window.location.href = 'index.html'; }, 1200);
        return;
    }

    loadAdminStats();
    loadAdminUsers();
    loadAdminProducts();
    loadAdminReports();
});

async function loadAdminStats() {
    try {
        const res = await fetch(`${API_BASE_URL}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        if (document.getElementById('statsUsers')) document.getElementById('statsUsers').textContent = data.users || 0;
        if (document.getElementById('statsProducts')) document.getElementById('statsProducts').textContent = data.products || 0;
        if (document.getElementById('statsReports')) document.getElementById('statsReports').textContent = data.reports || 0;
    } catch (err) {
        console.error('Error fetching admin stats:', err);
    }
}

async function loadAdminUsers() {
    const usersTableBody = document.getElementById('adminUsersTableBody');
    if (!usersTableBody) return;

    try {
        const res = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const users = await res.json();
        if (!res.ok) throw new Error(users.message);

        usersTableBody.innerHTML = users.map((u, index) => `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${u.name}</strong></td>
                <td>${u.email}</td>
                <td>${u.phone || 'N/A'}</td>
                <td>${u.location || 'N/A'}</td>
                <td><span class="badge ${u.role === 'admin' ? 'bg-danger' : 'bg-primary'}">${u.role}</span></td>
                <td>
                    ${u.role !== 'admin' ? `
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteUserAdmin('${u._id}')">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    ` : '<span class="text-muted fs-7">Protected</span>'}
                </td>
            </tr>
        `).join('');
    } catch (err) {
        usersTableBody.innerHTML = `<tr><td colspan="7" class="text-danger text-center">${err.message}</td></tr>`;
    }
}

async function loadAdminProducts() {
    const productsTableBody = document.getElementById('adminProductsTableBody');
    if (!productsTableBody) return;

    try {
        const res = await fetch(`${API_BASE_URL}/admin/products`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const products = await res.json();
        if (!res.ok) throw new Error(products.message);

        productsTableBody.innerHTML = products.map((p, index) => `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${p.title}</strong></td>
                <td>${p.category}</td>
                <td>Rs. ${p.price.toLocaleString()}</td>
                <td>${p.sellerId ? p.sellerId.name : 'Unknown'}</td>
                <td><span class="badge ${p.status === 'sold' ? 'bg-danger' : 'bg-success'}">${p.status}</span></td>
                <td>
                    <a href="product-details.html?id=${p._id}" class="btn btn-sm btn-outline-secondary me-1" target="_blank">View</a>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteProductAdmin('${p._id}')">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        productsTableBody.innerHTML = `<tr><td colspan="7" class="text-danger text-center">${err.message}</td></tr>`;
    }
}

async function loadAdminReports() {
    const reportsTableBody = document.getElementById('adminReportsTableBody');
    if (!reportsTableBody) return;

    try {
        const res = await fetch(`${API_BASE_URL}/admin/reports`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const reports = await res.json();
        if (!res.ok) throw new Error(reports.message);

        if (!reports || reports.length === 0) {
            reportsTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No reported items found.</td></tr>`;
            return;
        }

        reportsTableBody.innerHTML = reports.map((r, index) => {
            const product = r.productId || {};
            const reporter = r.reportedBy || {};

            return `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${product.title || 'Deleted Item'}</strong></td>
                    <td><span class="badge bg-warning text-dark">${r.reason}</span></td>
                    <td>${reporter.name || 'Anonymous'} (${reporter.email || ''})</td>
                    <td>${new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                        <div class="btn-group">
                            ${product._id ? `
                                <button class="btn btn-sm btn-danger" onclick="deleteProductAdmin('${product._id}')">Remove Product</button>
                            ` : ''}
                            <button class="btn btn-sm btn-outline-secondary" onclick="dismissReport('${r._id}')">Dismiss</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        reportsTableBody.innerHTML = `<tr><td colspan="6" class="text-danger text-center">${err.message}</td></tr>`;
    }
}

async function deleteUserAdmin(userId) {
    if (!confirm('Are you sure? This will delete the user and all their active listings.')) return;

    try {
        const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        showAlert('User deleted', 'info');
        loadAdminStats();
        loadAdminUsers();
        loadAdminProducts();
    } catch (err) {
        showAlert(err.message, 'danger');
    }
}

async function deleteProductAdmin(productId) {
    if (!confirm('Are you sure you want to remove this product?')) return;

    try {
        const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        showAlert('Product removed', 'info');
        loadAdminStats();
        loadAdminProducts();
        loadAdminReports();
    } catch (err) {
        showAlert(err.message, 'danger');
    }
}

async function dismissReport(reportId) {
    try {
        const res = await fetch(`${API_BASE_URL}/admin/reports/${reportId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        showAlert('Report dismissed', 'info');
        loadAdminStats();
        loadAdminReports();
    } catch (err) {
        showAlert(err.message, 'danger');
    }
}
