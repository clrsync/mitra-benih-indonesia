// ==========================================
// CATALOG & PRODUCT MANAGEMENT
// ==========================================

// Helper: Format Rupiah Currency
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(amount);
}

// Render Catalog Grid
function renderCatalog() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    productsGrid.innerHTML = "";

    const filteredProducts = products.filter(product => {
        const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px;">
                <p style="font-size: 1.2rem; color: var(--text-secondary);">Tidak ada bibit/benih yang sesuai dengan pencarian Anda.</p>
            </div>
        `;
        return;
    }

    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('product-card');

        const badgeHTML = product.badge ? `<span class="product-badge">${product.badge}</span>` : '';
        const adminActionsHTML = isAdmin ? `
            <div class="admin-card-actions" style="margin-top: 10px; display: flex; gap: 8px;">
                <button class="edit-price-btn btn-secondary-sm" data-id="${product.id}" style="flex: 1; padding: 6px 10px; font-size: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-secondary); color: var(--text-primary); cursor: pointer;">✏️ Ubah Harga</button>
            </div>
        ` : '';

        card.innerHTML = `
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy" onerror="this.onerror=null;this.src='images/alpukat_miki.webp';">
                ${badgeHTML}
            </div>
            <div class="product-info">
                <div class="product-meta">
                    <span class="product-category">${product.category.toUpperCase()}</span>
                    <div class="product-rating">
                        <span class="star">★</span>
                        <span>${product.rating} (${product.reviews})</span>
                    </div>
                </div>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-bottom">
                    <div class="product-price">${formatRupiah(product.price)}</div>
                    <button class="add-to-cart-btn btn-primary-sm" data-id="${product.id}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        Beli
                    </button>
                </div>
                ${adminActionsHTML}
            </div>
        `;

        // Click card to open modal detail
        card.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart-btn') || e.target.closest('.edit-price-btn')) {
                return; // Don't open detail if clicking action buttons
            }
            openProductModal(product);
        });

        // Add to cart listener
        const addBtn = card.querySelector('.add-to-cart-btn');
        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart(product.id);
        });

        productsGrid.appendChild(card);
    });

    // Attach Admin Edit Price Event Listeners
    if (isAdmin) {
        const editPriceBtns = productsGrid.querySelectorAll('.edit-price-btn');
        editPriceBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-id'));
                const product = products.find(p => p.id === id);
                if (product) {
                    const newPriceRaw = prompt(`Masukkan harga baru untuk ${product.name} (angka saja):`, product.price);
                    if (newPriceRaw === null) return;

                    const newPrice = parseInt(newPriceRaw);
                    if (isNaN(newPrice) || newPrice <= 0) {
                        alert("Harga tidak valid! Harus berupa angka positif.");
                        return;
                    }

                    product.price = newPrice;
                    if (GOOGLE_APPS_SCRIPT_URL) {
                        sendToGoogleAppsScript('UPDATE_PRODUCT', product);
                    }
                    renderCatalog();
                    alert(`Harga ${product.name} berhasil diperbarui di database menjadi ${formatRupiah(newPrice)}!`);
                }
            });
        });
    }
}

// Modal Detail Product
function openProductModal(product) {
    const productModal = document.getElementById('product-modal');
    const modalContentGrid = document.getElementById('modal-content-grid');
    if (!productModal || !modalContentGrid) return;

    const adminActionsHTML = isAdmin ? `
        <div class="modal-admin-actions" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border); display: flex; gap: 10px;">
            <button class="modal-admin-edit-btn btn-secondary-sm" style="flex: 1; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border); color: var(--text-primary); border-radius: var(--radius-sm); font-weight: 600; cursor: pointer;">✏️ Edit Produk Ini</button>
            <button class="modal-admin-delete-btn btn-secondary-sm" style="padding: 10px; background: #ef4444; border: none; color: white; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer;">🗑️ Hapus</button>
        </div>
    ` : '';

    modalContentGrid.innerHTML = `
        <div class="modal-image-col">
            <img src="${product.image}" alt="${product.name}" class="modal-product-image" onerror="this.onerror=null;this.src='images/alpukat_miki.webp';">
        </div>
        <div class="modal-info-col">
            <span class="product-category">${product.category.toUpperCase()}</span>
            <h2 class="modal-product-title">${product.name}</h2>
            <div class="product-rating" style="margin-bottom: 15px;">
                <span class="star">★</span>
                <span>${product.rating} (${product.reviews} Ulasan Pembeli)</span>
            </div>
            <div class="modal-product-price">${formatRupiah(product.price)}</div>
            <p class="modal-product-desc">${product.description}</p>
            
            <div class="instruction-box">
                <h4>🌱 Panduan Perawatan & Penanaman:</h4>
                <p>${product.instruction || 'Lakukan penyiraman secara teratur pagi dan sore hari. Berikan sinar matahari secukupnya dan pupuk organik secara berkala.'}</p>
            </div>

            <button class="modal-add-cart-btn btn-primary" data-id="${product.id}" style="width: 100%; margin-top: 20px; padding: 14px;">
                Tambah ke Keranjang Belanja
            </button>
            ${adminActionsHTML}
        </div>
    `;

    const modalAddBtn = modalContentGrid.querySelector('.modal-add-cart-btn');
    modalAddBtn.addEventListener('click', () => {
        addToCart(product.id);
        productModal.classList.remove('active');
    });

    if (isAdmin) {
        const editBtn = modalContentGrid.querySelector('.modal-admin-edit-btn');
        const deleteBtn = modalContentGrid.querySelector('.modal-admin-delete-btn');

        if (editBtn) {
            editBtn.addEventListener('click', () => {
                productModal.classList.remove('active');
                openEditProductModal(product.id);
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (confirm(`Apakah Anda yakin ingin menghapus "${product.name}" dari katalog?`)) {
                    products = products.filter(p => p.id !== product.id);
                    if (GOOGLE_APPS_SCRIPT_URL) {
                        sendToGoogleAppsScript('DELETE_PRODUCT', { id: product.id });
                    }
                    productModal.classList.remove('active');
                    renderCatalog();
                    alert(`Produk "${product.name}" berhasil dihapus.`);
                }
            });
        }
    }

    productModal.classList.add('active');
}

// Open Edit Product Modal
function openEditProductModal(productId) {
    const adminProductModal = document.getElementById('admin-product-modal');
    const adminModalTitle = document.getElementById('admin-modal-title');
    const adminProdName = document.getElementById('admin-prod-name');
    const adminProdCategory = document.getElementById('admin-prod-category');
    const adminProdPrice = document.getElementById('admin-prod-price');
    const adminProdBadge = document.getElementById('admin-prod-badge');
    const adminProdDesc = document.getElementById('admin-prod-desc');
    const adminProdInstruction = document.getElementById('admin-prod-instruction');
    const adminProdImageInput = document.getElementById('admin-prod-image');

    const product = products.find(p => p.id === productId);
    if (!product || !adminProductModal) return;

    editingProductId = productId;
    adminModalTitle.textContent = "Edit Produk Catalog";
    adminProdName.value = product.name;
    adminProdCategory.value = product.category;
    adminProdPrice.value = product.price;
    adminProdBadge.value = product.badge || "";
    adminProdDesc.value = product.description;
    adminProdInstruction.value = product.instruction || "";
    if (adminProdImageInput) adminProdImageInput.required = false;

    adminProductModal.classList.add('active');
}

// Initialize Product Event Listeners
function initProducts() {
    const searchInput = document.getElementById('product-search');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const addProductBtn = document.getElementById('add-product-btn');
    const adminProductModal = document.getElementById('admin-product-modal');
    const adminProductForm = document.getElementById('admin-product-form');
    const adminModalTitle = document.getElementById('admin-modal-title');
    const adminProductClose = document.getElementById('admin-product-close');
    const adminProductCancel = document.getElementById('admin-product-cancel');
    const productModal = document.getElementById('product-modal');
    const modalClose = document.getElementById('modal-close');

    if (filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeCategory = btn.getAttribute('data-category');
                renderCatalog();
            });
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderCatalog();
        });
    }

    if (addProductBtn && adminProductModal) {
        addProductBtn.addEventListener('click', () => {
            editingProductId = null;
            if (adminModalTitle) adminModalTitle.textContent = "Tambah Produk Baru";
            if (adminProductForm) adminProductForm.reset();
            const adminProdImageInput = document.getElementById('admin-prod-image');
            if (adminProdImageInput) adminProdImageInput.required = true;
            adminProductModal.classList.add('active');
        });
    }

    if (adminProductClose && adminProductModal) {
        adminProductClose.addEventListener('click', () => adminProductModal.classList.remove('active'));
    }
    if (adminProductCancel && adminProductModal) {
        adminProductCancel.addEventListener('click', () => adminProductModal.classList.remove('active'));
    }

    if (modalClose && productModal) {
        modalClose.addEventListener('click', () => productModal.classList.remove('active'));
    }

    if (adminProductForm) {
        adminProductForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const adminProdName = document.getElementById('admin-prod-name');
            const adminProdCategory = document.getElementById('admin-prod-category');
            const adminProdPrice = document.getElementById('admin-prod-price');
            const adminProdBadge = document.getElementById('admin-prod-badge');
            const adminProdDesc = document.getElementById('admin-prod-desc');
            const adminProdInstruction = document.getElementById('admin-prod-instruction');
            const adminProdImageInput = document.getElementById('admin-prod-image');

            const name = adminProdName.value;
            const category = adminProdCategory.value;
            const price = parseInt(adminProdPrice.value);
            const badge = adminProdBadge.value;
            const desc = adminProdDesc.value;
            const instruction = adminProdInstruction.value;

            const handleSaveProduct = (imageSrc) => {
                if (editingProductId === null) {
                    const newProduct = {
                        id: Date.now(),
                        name: name,
                        category: category,
                        price: price,
                        rating: 5.0,
                        reviews: 0,
                        badge: badge,
                        image: imageSrc || "images/alpukat_miki.webp",
                        description: desc,
                        instruction: instruction
                    };

                    products.push(newProduct);
                    if (GOOGLE_APPS_SCRIPT_URL) {
                        sendToGoogleAppsScript('ADD_PRODUCT', newProduct).then(res => {
                            if (res && res.imageUrl) {
                                newProduct.image = res.imageUrl;
                                renderCatalog();
                            }
                        });
                    }
                    alert(`Produk ${newProduct.name} berhasil disimpan ke database Google Sheets!`);
                } else {
                    const product = products.find(p => p.id === editingProductId);
                    if (product) {
                        product.name = name;
                        product.category = category;
                        product.price = price;
                        product.badge = badge;
                        product.description = desc;
                        product.instruction = instruction;
                        if (imageSrc) {
                            product.image = imageSrc;
                        }
                        if (GOOGLE_APPS_SCRIPT_URL) {
                            sendToGoogleAppsScript('UPDATE_PRODUCT', product).then(res => {
                                if (res && res.imageUrl) {
                                    product.image = res.imageUrl;
                                    renderCatalog();
                                }
                            });
                        }
                        alert(`Produk ${product.name} berhasil diperbarui di database Google Sheets!`);
                    }
                }

                editingProductId = null;
                renderCatalog();
                adminProductModal.classList.remove('active');
                adminProductForm.reset();
            };

            if (adminProdImageInput && adminProdImageInput.files && adminProdImageInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    handleSaveProduct(event.target.result);
                };
                reader.readAsDataURL(adminProdImageInput.files[0]);
            } else {
                handleSaveProduct(null);
            }
        });
    }

    renderCatalog();
}
