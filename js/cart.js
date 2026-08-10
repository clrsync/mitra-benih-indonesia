// ==========================================
// SHOPPING CART DRAWER & CHECKOUT
// ==========================================

function openCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
    }
}

function closeCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    }
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    updateCartUI();
    openCart();
}

function updateQuantity(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        updateCartUI();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(i => i.id !== productId);
    updateCartUI();
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartFooterDetails = document.getElementById('cart-footer-details');
    const cartTotalPrice = document.getElementById('cart-total-price');

    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalCount;

    if (!cartItemsList) return;

    if (cart.length === 0) {
        cartItemsList.innerHTML = `
            <div class="cart-empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <p>Keranjang belanja Anda masih kosong</p>
            </div>
        `;
        if (cartFooterDetails) cartFooterDetails.style.display = "none";
        return;
    }

    if (cartFooterDetails) cartFooterDetails.style.display = "block";

    let totalBelanja = 0;
    cartItemsList.innerHTML = "";

    cart.forEach(item => {
        const itemSubtotal = item.price * item.quantity;
        totalBelanja += itemSubtotal;

        const cartItemEl = document.createElement('div');
        cartItemEl.classList.add('cart-item');
        cartItemEl.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
                <h4 class="cart-item-title">${item.name}</h4>
                <div class="cart-item-price">${formatRupiah(item.price)}</div>
                <div class="cart-item-qty">
                    <button class="qty-btn btn-minus" data-id="${item.id}">-</button>
                    <span class="qty-val">${item.quantity}</span>
                    <button class="qty-btn btn-plus" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="cart-item-remove" data-id="${item.id}" title="Hapus Barang">✕</button>
        `;

        cartItemsList.appendChild(cartItemEl);
    });

    if (cartTotalPrice) cartTotalPrice.textContent = formatRupiah(totalBelanja);

    // Event Listeners for Cart Buttons
    cartItemsList.querySelectorAll('.btn-minus').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            updateQuantity(id, -1);
        });
    });

    cartItemsList.querySelectorAll('.btn-plus').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            updateQuantity(id, 1);
        });
    });

    cartItemsList.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            removeFromCart(id);
        });
    });
}

function initCart() {
    const cartToggle = document.getElementById('cart-toggle');
    const cartClose = document.getElementById('cart-close');
    const cartOverlay = document.getElementById('cart-overlay');
    const checkoutForm = document.getElementById('checkout-form');

    if (cartToggle) cartToggle.addEventListener('click', openCart);
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('buyer-name').value;
            const address = document.getElementById('buyer-address').value;
            const courier = document.getElementById('buyer-courier').value;

            if (cart.length === 0) return;

            let messageText = "*HALO MITRA BENIH INDONESIA, SAYA INGIN MEMESAN BIBIT TANAMAN:*\n";
            messageText += "====================================\n\n";

            let totalBelanja = 0;
            cart.forEach((item, index) => {
                const subtotal = item.price * item.quantity;
                totalBelanja += subtotal;
                messageText += `${index + 1}. *${item.name}*\n`;
                messageText += `   Kuantitas: ${item.quantity} pcs\n`;
                messageText += `   Harga: ${formatRupiah(item.price)} (Subtotal: ${formatRupiah(subtotal)})\n\n`;
            });

            messageText += "====================================\n";
            messageText += `*Total Belanja:* *${formatRupiah(totalBelanja)}*\n\n`;
            messageText += "*DATA PENERIMA & PENGIRIMAN:*\n";
            messageText += `- *Nama:* ${name}\n`;
            messageText += `- *Alamat Kirim:* ${address}\n`;
            messageText += `- *Kurir Ekspedisi:* ${courier}\n\n`;
            messageText += "Mohon diinfokan nomor rekening transfer dan estimasi biaya ongkos kirim. Terima kasih!";

            const encodedText = encodeURIComponent(messageText);
            const waUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodedText}`;

            if (GOOGLE_APPS_SCRIPT_URL) {
                sendToGoogleAppsScript('ADD_ORDER', {
                    orderId: 'ORD-' + Date.now(),
                    customerName: name,
                    address: address,
                    courier: courier,
                    items: cart.map(i => ({ name: i.name, qty: i.quantity, price: i.price })),
                    total: totalBelanja
                });
            }

            cart = [];
            updateCartUI();
            closeCart();
            window.open(waUrl, '_blank');
        });
    }

    updateCartUI();
}
