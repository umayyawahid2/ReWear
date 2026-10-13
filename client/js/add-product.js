document.addEventListener('DOMContentLoaded', async () => {
    const token = getToken();
    if (!token) {
        showAlert('You must be logged in to post a listing', 'warning');
        setTimeout(() => { window.location.href = 'login.html'; }, 1000);
        return;
    }

    const productForm = document.getElementById('productForm');
    const formTitle = document.getElementById('formTitle');
    const submitBtn = document.getElementById('submitBtn');

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const isEditMode = !!productId;

    if (isEditMode && formTitle && submitBtn) {
        formTitle.textContent = 'Edit Listing';
        submitBtn.textContent = 'Update Listing';
        loadProductForEdit(productId);
    }

    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(productForm);

            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status"></span> Saving...`;

            const url = isEditMode ? `${API_BASE_URL}/products/${productId}` : `${API_BASE_URL}/products`;
            const method = isEditMode ? 'PUT' : 'POST';

            try {
                const res = await fetch(url, {
                    method: method,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                const data = await res.json();

                if (!res.ok) throw new Error(data.message || 'Error saving listing');

                showAlert(isEditMode ? 'Listing updated successfully!' : 'Listing published successfully!', 'success');
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 1000);
            } catch (err) {
                showAlert(err.message, 'danger');
                submitBtn.disabled = false;
                submitBtn.textContent = isEditMode ? 'Update Listing' : 'List Item Now';
            }
        });
    }
});

async function loadProductForEdit(productId) {
    try {
        const res = await fetch(`${API_BASE_URL}/products/${productId}`);
        const product = await res.json();

        if (!res.ok) throw new Error(product.message || 'Product not found');

        document.getElementById('title').value = product.title || '';
        document.getElementById('category').value = product.category || 'Dresses';
        document.getElementById('size').value = product.size || 'M';
        document.getElementById('brand').value = product.brand || '';
        document.getElementById('condition').value = product.condition || 'Like New';
        document.getElementById('price').value = product.price || '';
        document.getElementById('location').value = product.location || '';
        document.getElementById('description').value = product.description || '';

        const imageInput = document.getElementById('image');
        if (imageInput) imageInput.removeAttribute('required');
    } catch (err) {
        showAlert(err.message, 'danger');
    }
}
