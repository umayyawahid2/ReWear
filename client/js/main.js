// Main utility functions for ReWear Client

const API_BASE_URL = '/api';

// Country Codes dataset
const COUNTRY_CODES = [
    { code: '+92', name: 'Pakistan', flag: '🇵🇰' },
    { code: '+1', name: 'USA / Canada', flag: '🇺🇸' },
    { code: '+44', name: 'UK', flag: '🇬🇧' },
    { code: '+971', name: 'UAE', flag: '🇦🇪' },
    { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+91', name: 'India', flag: '🇮🇳' },
    { code: '+61', name: 'Australia', flag: '🇦🇺' },
    { code: '+49', name: 'Germany', flag: '🇩🇪' },
    { code: '+33', name: 'France', flag: '🇫🇷' },
    { code: '+90', name: 'Turkey', flag: '🇹🇷' },
    { code: '+60', name: 'Malaysia', flag: '🇲🇾' },
    { code: '+86', name: 'China', flag: '🇨🇳' },
    { code: '+81', name: 'Japan', flag: '🇯🇵' },
    { code: '+00', name: 'Other', flag: '🌐' }
];

function getCountryCodeOptionsHTML(selectedCode = '+92') {
    return COUNTRY_CODES.map(c => `
        <option value="${c.code}" ${c.code === selectedCode ? 'selected' : ''}>
            ${c.flag} ${c.code} (${c.name})
        </option>
    `).join('');
}

// Authentication storage helpers
function getToken() {
    return localStorage.getItem('rewear_token');
}

function getUser() {
    const userStr = localStorage.getItem('rewear_user');
    try {
        return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
        return null;
    }
}

function setAuthData(token, user) {
    localStorage.setItem('rewear_token', token);
    localStorage.setItem('rewear_user', JSON.stringify(user));
}

function logout() {
    localStorage.removeItem('rewear_token');
    localStorage.removeItem('rewear_user');
    showAlert('Logged out successfully', 'info');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 800);
}

// Alert helper using Bootstrap Toast / Alert container
function showAlert(message, type = 'danger', containerId = 'alertContainer') {
    let container = document.getElementById(containerId);
    if (!container) {
        container = document.createElement('div');
        container.id = 'alertContainer';
        container.className = 'position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }

    const alertEl = document.createElement('div');
    alertEl.className = `alert alert-${type} alert-dismissible fade show shadow-sm border-0 rounded-3`;
    alertEl.role = 'alert';
    alertEl.innerHTML = `
        <div class="d-flex align-items-center gap-2 fw-semibold">
            <span>${message}</span>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    container.appendChild(alertEl);

    setTimeout(() => {
        if (alertEl.parentNode) {
            alertEl.classList.remove('show');
            setTimeout(() => alertEl.remove(), 200);
        }
    }, 4000);
}

// Dynamic Navbar rendering based on Auth state
function renderNavbar() {
    const navAuthContainer = document.getElementById('navAuthContainer');
    if (!navAuthContainer) return;

    const user = getUser();
    const token = getToken();

    if (user && token) {
        let adminNavItem = '';
        if (user.role === 'admin') {
            adminNavItem = `
                <li class="nav-item">
                    <a class="nav-link text-warning font-weight-bold" href="admin.html">
                        <i class="bi bi-shield-lock-fill me-1"></i> Admin
                    </a>
                </li>
            `;
        }

        navAuthContainer.innerHTML = `
            ${adminNavItem}
            <li class="nav-item">
                <a class="nav-link" href="wishlist.html"><i class="bi bi-heart-fill text-danger me-1"></i> Wishlist</a>
            </li>
            <li class="nav-item">
                <a class="btn btn-rewear-primary btn-sm ms-2 me-2" href="add-product.html"><i class="bi bi-plus-lg me-1"></i> Sell Item</a>
            </li>
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle fw-bold" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-person-circle me-1"></i> ${user.name}
                </a>
                <ul class="dropdown-menu dropdown-menu-end border-0 shadow-lg rounded-3" aria-labelledby="userDropdown">
                    <li><a class="dropdown-item py-2 fw-semibold" href="profile.html"><i class="bi bi-person me-2 text-primary"></i> My Profile</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><button class="dropdown-item py-2 text-danger fw-semibold" onclick="logout()"><i class="bi bi-box-arrow-right me-2"></i> Logout</button></li>
                </ul>
            </li>
        `;
    } else {
        navAuthContainer.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="login.html">Login</a>
            </li>
            <li class="nav-item">
                <a class="btn btn-rewear-primary btn-sm ms-2" href="register.html">Register</a>
            </li>
        `;
    }
}

// Helper to resolve product image URL
function getImageUrl(imagePath) {
    if (!imagePath || imagePath === 'placeholder.jpg') {
        return 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=600&auto=format&fit=crop';
    }
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    return `/uploads/${imagePath}`;
}

document.addEventListener('DOMContentLoaded', () => {
    renderNavbar();
});
