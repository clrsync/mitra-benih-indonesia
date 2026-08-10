// ==========================================
// GOOGLE DRIVE & GOOGLE SHEETS BACKEND CONFIG
// ==========================================
// Paste your deployed Google Apps Script Web App URL below to enable Google Sheets & Google Drive syncing.
// If left empty (""), the app automatically falls back to browser localStorage.
const GOOGLE_APPS_SCRIPT_URL = "";

/**
 * Send POST request to Google Apps Script Web App
 */
async function sendToGoogleAppsScript(action, payload) {
    if (!GOOGLE_APPS_SCRIPT_URL) return null;
    try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify({ action: action, payload: payload })
        });
        return await response.json();
    } catch (err) {
        console.warn("Google Apps Script sync warning:", err);
        return null;
    }
}

/**
 * Fetch database rows from Google Sheets on page load
 */
async function loadDataFromGoogleSheets() {
    if (!GOOGLE_APPS_SCRIPT_URL) return;
    try {
        const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=FETCH_ALL`);
        const res = await response.json();
        if (res.status === 'success' && res.data) {
            if (res.data.products && res.data.products.length > 0) {
                products = res.data.products.map(p => ({
                    id: p.id || Date.now(),
                    name: p.name || '',
                    category: p.category || 'buah',
                    price: Number(p.price) || 0,
                    rating: 5.0,
                    reviews: 0,
                    badge: p.badge || '',
                    image: p.imageurl || p.image || 'images/alpukat_miki.webp',
                    description: p.description || '',
                    instruction: 'Merawat tanaman secara rutin dan menyiram berkala.'
                }));
                localStorage.setItem('mitrabenih_custom_products', JSON.stringify(products));
                if (typeof renderCatalog === 'function') renderCatalog();
            }
            if (res.data.activities && res.data.activities.length > 0) {
                activitiesData = res.data.activities.map(a => ({
                    id: a.id || Date.now(),
                    title: a.title || '',
                    date: a.date || '',
                    image: a.imageurl || a.image || '',
                    description: a.description || ''
                }));
                localStorage.setItem('mitrabenih_custom_activities', JSON.stringify(activitiesData));
                if (typeof renderActivities === 'function') renderActivities();
            }
            if (res.data.testimonials && res.data.testimonials.length > 0) {
                customTestimonials = res.data.testimonials.map(t => ({
                    id: t.id || Date.now(),
                    name: t.name || '',
                    role: t.role || '',
                    avatar: t.avatarurl || t.avatar || '',
                    text: t.text || '',
                    rating: Number(t.rating) || 5
                }));
                localStorage.setItem('mitrabenih_testimonials', JSON.stringify(customTestimonials));
                if (typeof renderTestimonials === 'function') renderTestimonials();
            }
        }
    } catch (err) {
        console.warn("Error fetching data from Google Sheets:", err);
    }
}

// ==========================================
// DATA PRODUK (BIBIT & BENIH TANAMAN)
// ==========================================
const defaultProducts = [
    {
        id: 1,
        name: "Bibit Alpukat Miki Unggul",
        category: "buah",
        price: 75000,
        rating: 4.9,
        reviews: 142,
        badge: "Bestseller",
        image: "images/alpukat_miki.webp",
        description: "Bibit Alpukat Miki hasil okulasi premium. Memiliki sifat genjah (sangat cepat berbuah), kulit tipis tahan ulat daun, serta daging buah yang sangat tebal, pulen, dan manis mentega tanpa serat.",
        instruction: "Sinar matahari penuh. Siram 1-2 kali sehari. Pemupukan NPK 1 bulan sekali setelah usia tanam 3 bulan. Mulai belajar berbuah pada usia 2-3 tahun setelah tanam."
    },
    {
        id: 2,
        name: "Bibit Durian Musang King Kaki 3",
        category: "buah",
        price: 120000,
        rating: 4.8,
        reviews: 98,
        badge: "Terpopuler",
        image: "images/durian_musang_king.webp",
        description: "Bibit Durian Musang King asli dengan sistem kaki tiga (triple rootstock) untuk mempercepat penyerapan nutrisi dan membuat pohon lebih kokoh. Rasa buah manis legit berpadu sedikit pahit khas durian premium.",
        instruction: "Gunakan lubang tanam 60x60x60 cm dengan campuran kompos. Siram pagi hari. Lakukan pemangkasan cabang air secara berkala untuk merangsang pembuahan cepat."
    },
    {
        id: 3,
        name: "Benih Cabai Rawit Bara (Isi 50)",
        category: "sayur",
        price: 15000,
        rating: 4.7,
        reviews: 215,
        badge: "Diskon",
        image: "images/cabai_rawit.webp",
        description: "Benih cabai rawit tipe tegak varietas Bara unggul dari cap panah merah. Daya tumbuh sangat tinggi, sangat pedas, dan memiliki daya tahan ekstra terhadap penyakit layu bakteri serta antraknosa.",
        instruction: "Semai benih pada media cocopeat campur kompos. Setelah tumbuh 4 daun (usia 21 hari), pindahkan ke pot/polibag. Panen mulai dilakukan pada hari ke 75-80 setelah tanam."
    },
    {
        id: 4,
        name: "Benih Tomat Cherry Golden (Isi 30)",
        category: "sayur",
        price: 18000,
        rating: 4.8,
        reviews: 64,
        badge: "Terbaru",
        image: "images/tomat_cherry.webp",
        description: "Benih Tomat Cherry warna kuning emas cerah yang sangat produktif. Rasa buah sangat manis segar dan renyah. Sangat cocok ditanam di pekarangan rumah menggunakan pot/polibag maupun sistem hidroponik.",
        instruction: "Semai benih selama 10-14 hari. Berikan ajir/tiang penyangga setinggi 1.5 meter untuk rambatan pohon. Siram secukupnya jangan sampai tergenang air."
    },
    {
        id: 5,
        name: "Tanaman Hias Janda Bolong Rimbun",
        category: "hias",
        price: 45000,
        rating: 4.9,
        reviews: 189,
        badge: "Bestseller",
        image: "images/monstera.webp",
        description: "Tanaman hias indoor Monstera Adansonii (Janda Bolong) yang sudah rimbun dalam pot beserta turus penyangga kelapa. Berfungsi mempercantik sudut ruangan sekaligus menyaring polusi udara dalam rumah.",
        instruction: "Letakkan di tempat teduh (cahaya tidak langsung). Siram hanya ketika media tanam bagian atas mulai mengering (sekitar 2-3 hari sekali). Bersihkan daun dengan lap basah."
    },
    {
        id: 6,
        name: "Calathea Orbifolia Premium",
        category: "hias",
        price: 65000,
        rating: 4.6,
        reviews: 37,
        badge: "",
        image: "images/calathea.webp",
        description: "Calathea Orbifolia berdaun lebar bulat eksotis dengan garis/corak perak metalik yang sangat kontras. Tanaman hias mewah yang sangat digemari desainer interior untuk dekorasi ruang tamu minimalis.",
        instruction: "Sangat sensitif terhadap matahari langsung yang membakar daun. Jaga kelembaban udara dengan melakukan misting air secara berkala. Gunakan air bersih non-klorin."
    },
    {
        id: 7,
        name: "Benih Bunga Matahari Giant (Isi 20)",
        category: "bunga",
        price: 12000,
        rating: 4.7,
        reviews: 83,
        badge: "",
        image: "images/bunga_matahari.webp",
        description: "Benih Bunga Matahari tipe raksasa (Helianthus annuus Giant Single). Dapat tumbuh hingga setinggi 2 - 2.5 meter dengan kelopak bunga tunggal berwarna kuning cerah berdiameter hingga 30 cm.",
        instruction: "Tanam langsung benih ke tanah sedalam 1 cm di lokasi yang terkena paparan sinar matahari langsung minimal 6 jam sehari. Jaga tanah tetap lembab hingga berkecambah."
    },
    {
        id: 8,
        name: "Benih Lavender Vera Wangi (Isi 40)",
        category: "bunga",
        price: 20000,
        rating: 4.5,
        reviews: 52,
        badge: "Rekomendasi",
        image: "images/lavender.webp",
        description: "Benih Bunga Lavender Vera asli (English Lavender) yang kaya akan minyak esensial linalool beraroma wangi menenangkan. Sangat berguna sebagai pengusir nyamuk alami di pekarangan rumah.",
        instruction: "Taburkan benih di atas media semai steril, tutup sangat tipis dengan tanah. Butuh waktu kecambah agak lama (2-4 minggu). Jaga suhu tetap sejuk dan tidak tergenang air."
    }
];

let products = localStorage.getItem('mitrabenih_custom_products') ? JSON.parse(localStorage.getItem('mitrabenih_custom_products')) : defaultProducts;
if (!localStorage.getItem('mitrabenih_custom_products')) {
    localStorage.setItem('mitrabenih_custom_products', JSON.stringify(defaultProducts));
}

// ==========================================
// DATA KARIR / LOWONGAN KERJA
// ==========================================
const defaultCareersData = [
    {
        id: 1,
        title: "BUSINESS DEVELOPMENT",
        division: "marketing",
        divisionLabel: "MARKETING",
        type: "BUSINESS DEVELOPMENT",
        date: "01 Juli 2026",
        status: "active",
        description: "Mencari individu yang kompeten untuk mengembangkan kemitraan bisnis benih tanaman di berbagai wilayah Indonesia.",
        requirements: [
            "Pendidikan minimal D3/S1 Pemasaran, Agribisnis, atau bidang relevan.",
            "Pengalaman kerja minimal 1-2 tahun di bidang penjualan/business development (diutamakan sektor agro/ritel).",
            "Memiliki kemampuan negosiasi dan komunikasi yang sangat baik.",
            "Siap melakukan perjalanan dinas untuk perluasan area distribusi."
        ]
    },
    {
        id: 2,
        title: "TECHNICAL ASSISTANT",
        division: "marketing",
        divisionLabel: "MARKETING",
        type: "TECHNICAL ASSISTANT",
        date: "01 Juli 2026",
        status: "active",
        description: "Membantu tim pemasaran dalam memberikan konsultasi teknis budidaya tanaman kepada calon pembeli.",
        requirements: [
            "Pendidikan D3/S1 Agroteknologi, Agronomi, atau bidang pertanian sejenis.",
            "Memahami teknik budidaya bibit buah-buahan, benih sayur, dan pemupukan modern.",
            "Mampu membuat materi edukasi budidaya (tulisan maupun video singkat).",
            "Ramah, sabar, dan memiliki kemampuan pelayanan konsumen yang baik."
        ]
    },
    {
        id: 3,
        title: "STAF KEUANGAN & ADMINISTRASI",
        division: "keuangan",
        divisionLabel: "KEUANGAN",
        type: "FINANCE & ADMIN",
        date: "02 Juli 2026",
        status: "active",
        description: "Mengelola pembukuan, transaksi penjualan harian, dan administrasi pengiriman bibit tanaman.",
        requirements: [
            "Pendidikan minimal SMK/D3 Akuntansi atau Keuangan.",
            "Menguasai aplikasi spreadsheet (MS Excel/Google Sheets) dan software akuntansi dasar.",
            "Teliti, jujur, bertanggung jawab, dan terbiasa dengan tenggat waktu.",
            "Memahami administrasi logistik/ekspedisi pengiriman barang."
        ]
    },
    {
        id: 4,
        title: "OPERASIONAL NURSERY (KEBUN)",
        division: "kebun",
        divisionLabel: "KEBUN",
        type: "NURSERY OPERATIONS",
        date: "03 Juli 2026",
        status: "active",
        description: "Bertanggung jawab dalam perawatan tanaman, penyiraman, okulasi, dan pemeliharaan stok bibit di kebun pembibitan.",
        requirements: [
            "Pendidikan minimal SMK Pertanian atau memiliki pengalaman budidaya tanaman.",
            "Menguasai teknik perbanyakan tanaman (okulasi, sambung pucuk, stek).",
            "Fisik kuat, jujur, menyukai pekerjaan lapangan/kebun.",
            "Siap ditempatkan di kebun pembibitan Sleman, Yogyakarta."
        ]
    },
    {
        id: 5,
        title: "DIGITAL MARKETING SPECIALIST",
        division: "marketing",
        divisionLabel: "MARKETING",
        type: "DIGITAL MARKETING",
        date: "04 Juli 2026",
        status: "active",
        description: "Mengelola media sosial, membuat konten video edukasi tanaman, dan menjalankan iklan digital untuk meningkatkan penjualan benih.",
        requirements: [
            "Pendidikan minimal D3/S1 Ilmu Komunikasi, Pemasaran Digital, atau Desain Grafis.",
            "Menguasai tools editing video/foto (CapCut, Canva, Photoshop).",
            "Memahami cara kerja media sosial (TikTok, Instagram, YouTube) dan optimasi SEO/SEM.",
            "Memiliki ketertarikan tinggi di dunia tanaman/berkebun menjadi nilai tambah."
        ]
    }
];

let careersData = localStorage.getItem('mitrabenih_custom_careers') ? JSON.parse(localStorage.getItem('mitrabenih_custom_careers')) : defaultCareersData;
if (!localStorage.getItem('mitrabenih_custom_careers')) {
    localStorage.setItem('mitrabenih_custom_careers', JSON.stringify(defaultCareersData));
}

// ==========================================
// DATA DIVISI LOWONGAN KERJA
// ==========================================
const defaultDivisions = [
    { id: "keuangan", label: "KEUANGAN" },
    { id: "marketing", label: "MARKETING" },
    { id: "pt-mbi", label: "PT MBI" }
];

let divisions = localStorage.getItem('mitrabenih_custom_divisions') ? JSON.parse(localStorage.getItem('mitrabenih_custom_divisions')) : defaultDivisions;
if (!localStorage.getItem('mitrabenih_custom_divisions')) {
    localStorage.setItem('mitrabenih_custom_divisions', JSON.stringify(defaultDivisions));
}

// ==========================================
// DATA KEGIATAN & GALERI NURSERY
// ==========================================
const defaultActivities = [
    {
        id: 1,
        title: "Pengiriman Bibit ke Sumatra",
        date: "10 Juli 2026",
        image: "images/nursery_view.jpg",
        description: "Proses pengemasan dan pengiriman ratusan bibit alpukat aligator dan durian bawor kaki tiga pesanan kelompok tani di Sumatra."
    },
    {
        id: 2,
        title: "Pemeriksaan Mutu Okulasi",
        date: "05 Juli 2026",
        image: "images/quality_check.webp",
        description: "Tim ahli agronomi kami memverifikasi hasil sambung pucuk (okulasi) durian musang king untuk memastikan tingkat keberhasilan tumbuh."
    },
    {
        id: 3,
        title: "Kunjungan Lapangan & Edukasi",
        date: "28 Juni 2026",
        image: "images/nursery_view.jpg",
        description: "Menerima kunjungan rombongan mahasiswa pertanian Sleman untuk praktik langsung teknik grafting dan budidaya bibit buah."
    }
];

let activitiesData = localStorage.getItem('mitrabenih_custom_activities') ? JSON.parse(localStorage.getItem('mitrabenih_custom_activities')) : defaultActivities;
if (!localStorage.getItem('mitrabenih_custom_activities')) {
    localStorage.setItem('mitrabenih_custom_activities', JSON.stringify(defaultActivities));
}

// ==========================================
// DATA VIDEO DOKUMENTASI
// ==========================================
const defaultVideos = [
    {
        id: 1,
        title: "Tur Kebun Pembibitan Mitra Benih Indonesia",
        url: "https://drive.google.com/file/d/17vY1JLI3UncvWGU_QNKcnsWUOj6cUo98/preview"
    },
    {
        id: 2,
        title: "Tutorial Teknik Okulasi & Grafting Unggul",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    }
];

let videosData = localStorage.getItem('mitrabenih_custom_videos') ? JSON.parse(localStorage.getItem('mitrabenih_custom_videos')) : defaultVideos;
if (!localStorage.getItem('mitrabenih_custom_videos')) {
    localStorage.setItem('mitrabenih_custom_videos', JSON.stringify(defaultVideos));
}

// WhatsApp Target Phone Number
const WHATSAPP_PHONE = "6285165658480";

// ==========================================
// STATE MANAGEMENT (KERANJANG BELANJA)
// ==========================================
let cart = [];

// Load cart from localStorage if exists
function loadCart() {
    const savedCart = localStorage.getItem('mitrabenih_cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            updateCartUI();
        } catch (e) {
            cart = [];
        }
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('mitrabenih_cart', JSON.stringify(cart));
}

// ==========================================
// DOM SELECTORS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Initial fetch from Google Sheets if configured
    loadDataFromGoogleSheets();

    // Header & Mobile Nav Elements
    const header = document.getElementById('header');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Theme Elements
    const themeToggle = document.getElementById('theme-toggle');

    // Catalog Elements
    const productsGrid = document.getElementById('products-grid');
    const searchInput = document.getElementById('product-search');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Cart Elements
    const cartToggle = document.getElementById('cart-toggle');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartClose = document.getElementById('cart-close');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartCount = document.getElementById('cart-count');
    const cartFooterDetails = document.getElementById('cart-footer-details');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const checkoutForm = document.getElementById('checkout-form');

    // Modal Elements
    const productModal = document.getElementById('product-modal');
    const modalClose = document.getElementById('modal-close');
    const modalContentGrid = document.getElementById('modal-content-grid');

    // Video Elements
    const videoIframe = document.getElementById('video-iframe');
    const adminVideoToggle = document.getElementById('admin-video-toggle');
    const adminVideoPanel = document.getElementById('admin-video-panel');
    const adminVideoForm = document.getElementById('admin-video-form');
    const adminVideoUrlInput = document.getElementById('admin-video-url');

    // Forms
    const contactForm = document.getElementById('contact-form-direct');
    const newsletterForm = document.getElementById('newsletter-form');

    // ==========================================
    // ADMIN MODE LOGIC & SELECTORS
    // ==========================================
    let isAdmin = sessionStorage.getItem('mitrabenih_admin_logged_in') === 'true';
    let editingProductId = null;

    const adminTopBanner = document.getElementById('admin-top-banner');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    const adminPortalLink = document.getElementById('admin-portal-link');
    const adminLoginModal = document.getElementById('admin-login-modal');
    const adminLoginClose = document.getElementById('admin-login-close');
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminPasswordInput = document.getElementById('admin-password');

    const adminProductModal = document.getElementById('admin-product-modal');
    const adminProductClose = document.getElementById('admin-product-close');
    const adminProductForm = document.getElementById('admin-product-form');

    const adminProdName = document.getElementById('admin-prod-name');
    const adminProdCategory = document.getElementById('admin-prod-category');
    const adminProdPrice = document.getElementById('admin-prod-price');
    const adminProdBadge = document.getElementById('admin-prod-badge');
    const adminProdDesc = document.getElementById('admin-prod-desc');
    const adminProdInstruction = document.getElementById('admin-prod-instruction');

    function initAdminUI() {
        if (isAdmin) {
            if (adminTopBanner) adminTopBanner.style.display = "block";
            if (adminVideoToggle) adminVideoToggle.style.display = "inline-block";
        } else {
            if (adminTopBanner) adminTopBanner.style.display = "none";
            if (adminVideoToggle) adminVideoToggle.style.display = "none";
            if (adminVideoPanel) adminVideoPanel.style.display = "none";
        }
    }

    // Toggle login admin modal
    if (adminPortalLink) {
        adminPortalLink.addEventListener('click', (e) => {
            e.preventDefault();
            adminLoginModal.classList.add('active');
        });
    }

    // Secret Backdoor: Triple click MBI Logo to open Admin Login Modal
    let logoClickCount = 0;
    let logoClickTimeout;

    function handleLogoClick(e) {
        e.preventDefault();
        logoClickCount++;
        clearTimeout(logoClickTimeout);
        
        logoClickTimeout = setTimeout(() => {
            logoClickCount = 0;
        }, 1200); // Reset count if no click for 1.2s

        if (logoClickCount === 3) {
            logoClickCount = 0;
            if (adminLoginModal) {
                adminLoginModal.classList.add('active');
            }
        }
    }

    const navLogo = document.getElementById('nav-logo');
    if (navLogo) {
        navLogo.addEventListener('click', handleLogoClick);
    }

    const footerLogoImg = document.querySelector('.footer-logo img');
    if (footerLogoImg) {
        footerLogoImg.style.cursor = 'pointer';
        footerLogoImg.addEventListener('click', handleLogoClick);
    }

    if (adminLoginClose) {
        adminLoginClose.addEventListener('click', () => {
            adminLoginModal.classList.remove('active');
        });
    }

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const password = adminPasswordInput.value;
            if (password === 'Prawira123') {
                isAdmin = true;
                sessionStorage.setItem('mitrabenih_admin_logged_in', 'true');
                adminLoginModal.classList.remove('active');
                adminLoginForm.reset();
                initAdminUI();
                renderCatalog();
                if (typeof renderDivisions === 'function') renderDivisions();
                if (typeof renderCareers === 'function') renderCareers();
                if (typeof renderActivities === 'function') renderActivities();
                if (typeof renderVideos === 'function') renderVideos();
                alert("Berhasil masuk sebagai Admin!");
            } else {
                alert("Kata sandi salah! Sandi default adalah: admin123");
            }
        });
    }

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            isAdmin = false;
            sessionStorage.setItem('mitrabenih_admin_logged_in', 'false');
            initAdminUI();
            renderCatalog();
            if (typeof renderDivisions === 'function') renderDivisions();
            if (typeof renderCareers === 'function') renderCareers();
            if (typeof renderActivities === 'function') renderActivities();
            if (typeof renderVideos === 'function') renderVideos();
            alert("Keluar dari Mode Admin.");
        });
    }

    // Add Product Modal Close
    if (adminProductClose) {
        adminProductClose.addEventListener('click', () => {
            adminProductModal.classList.remove('active');
        });
    }

    // Open product modal in edit mode
    function openEditProductModal(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        editingProductId = productId;

        const modalTitle = document.getElementById('admin-product-modal-title');
        if (modalTitle) modalTitle.textContent = "✏️ Edit Detail Bibit / Benih";

        const imgInput = document.getElementById('admin-prod-image');
        if (imgInput) imgInput.required = false; // Not required for editing (retains old photo if empty)

        // Pre-fill form fields
        adminProdName.value = product.name;
        adminProdCategory.value = product.category;
        adminProdPrice.value = product.price;
        adminProdBadge.value = product.badge || "";
        adminProdDesc.value = product.description;
        adminProdInstruction.value = product.instruction;

        adminProductModal.classList.add('active');
    }

    // Add / Edit Product Form Submission
    if (adminProductForm) {
        adminProductForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const adminProdImageInput = document.getElementById('admin-prod-image');

            const name = adminProdName.value;
            const category = adminProdCategory.value;
            const price = parseInt(adminProdPrice.value);
            const badge = adminProdBadge.value;
            const desc = adminProdDesc.value;
            const instruction = adminProdInstruction.value;

            const handleSaveProduct = (imageSrc) => {
                if (editingProductId === null) {
                    // ADD PRODUCT MODE
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
                    alert(`Produk ${newProduct.name} berhasil disimpan ke katalog secara lokal!`);
                } else {
                    // EDIT PRODUCT MODE
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
                        alert(`Produk ${product.name} berhasil diperbarui secara lokal!`);
                    }
                }

                localStorage.setItem('mitrabenih_custom_products', JSON.stringify(products));

                if (GOOGLE_APPS_SCRIPT_URL) {
                    const targetProd = editingProductId ? products.find(p => p.id === editingProductId) : products[products.length - 1];
                    if (targetProd) {
                        sendToGoogleAppsScript('ADD_PRODUCT', targetProd).then(res => {
                            if (res && res.imageUrl) {
                                targetProd.image = res.imageUrl;
                                localStorage.setItem('mitrabenih_custom_products', JSON.stringify(products));
                                renderCatalog();
                            }
                        });
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
                handleSaveProduct(null); // Save without modifying image (retains old photo in edit mode)
            }
        });
    }

    // Initialize Admin Interface
    initAdminUI();

    // ==========================================
    // THEME TOGGLE (DARK / LIGHT MODE)
    // ==========================================
    // Check local storage for dark mode preference
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });

    // ==========================================
    // SCROLL EVENTS (HEADER & REVEAL)
    // ==========================================
    window.addEventListener('scroll', () => {
        // Sticky Header Class
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active Link Spy
        let current = "";
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });

        // Reveal Elements on Scroll
        const reveals = document.querySelectorAll('.reveal');
        reveals.forEach(reveal => {
            const windowHeight = window.innerHeight;
            const elementTop = reveal.getBoundingClientRect().top;
            const elementVisible = 100;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    });

    // Trigger scroll event once to reveal items in viewport initially
    window.dispatchEvent(new Event('scroll'));

    // ==========================================
    // MOBILE NAVIGATION
    // ==========================================
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        navMenu.classList.toggle('open');
    });

    // Close menu when link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            navMenu.classList.remove('open');
        });
    });

    // ==========================================
    // PRODUCT CATALOG RENDERING & FILTERING
    // ==========================================
    let activeCategory = "all";
    let searchQuery = "";

    function renderCatalog() {
        // Filter products based on category and search query
        const filteredProducts = products.filter(product => {
            const matchesCategory = activeCategory === "all" || product.category === activeCategory;
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        // Clear previous grid items
        productsGrid.innerHTML = "";

        // 1. Render Admin Add Card first if in admin mode
        if (isAdmin) {
            const addCard = document.createElement('div');
            addCard.className = "product-card admin-add-card";
            addCard.style.display = "flex";
            addCard.style.flexDirection = "column";
            addCard.style.alignItems = "center";
            addCard.style.justifyContent = "center";
            addCard.style.cursor = "pointer";
            addCard.style.minHeight = "350px";
            addCard.style.border = "3px dashed var(--primary)";
            addCard.style.borderRadius = "var(--radius-md)";
            addCard.style.background = "var(--bg-primary)";
            addCard.innerHTML = `
                <div style="text-align: center; color: var(--primary); padding: 20px;">
                    <span style="font-size: 3.5rem;">➕</span>
                    <h3 style="margin-top: 12px; font-size: 1.25rem;">Tambah Produk</h3>
                    <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 6px;">Katalog Baru</p>
                </div>
            `;
            addCard.addEventListener('click', () => {
                adminProductModal.classList.add('active');
            });
            productsGrid.appendChild(addCard);
        }

        if (filteredProducts.length === 0) {
            const noMsg = document.createElement('div');
            noMsg.className = "no-products-msg";
            noMsg.innerHTML = `
                <span style="font-size: 3rem;">🔍</span>
                <h3 style="margin-top: 16px;">Bibit tidak ditemukan</h3>
                <p>Coba gunakan kata kunci lain atau pilih kategori yang berbeda.</p>
            `;
            productsGrid.appendChild(noMsg);
            return;
        }

        // Render card for each filtered product
        filteredProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = "product-card";

            // If admin is active, render price with edit icon
            const priceHTML = isAdmin
                ? `<span class="product-price" style="display: inline-flex; align-items: center; gap: 4px;">
                     ${formatRupiah(product.price)}
                     <button class="admin-price-edit" data-id="${product.id}" title="Edit Harga" style="font-size: 0.85rem; cursor: pointer; background: none; border: none; padding: 2px;">✏️</button>
                   </span>`
                : `<span class="product-price">${formatRupiah(product.price)}</span>`;

            card.innerHTML = `
                <div class="product-img-container" data-id="${product.id}">
                    ${product.badge ? `<span class="badge badge-accent product-badge">${product.badge}</span>` : ''}
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <span class="product-cat">${getCategoryLabel(product.category)}</span>
                    <h3 class="product-title" data-id="${product.id}">${product.name}</h3>
                    <div class="product-rating">
                        ★★★★★ <span>(${product.reviews})</span>
                    </div>
                    <div class="product-footer">
                        ${priceHTML}
                        <button class="add-cart-btn" data-id="${product.id}" aria-label="Tambah ke keranjang">
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
            productsGrid.appendChild(card);
        });

        // Attach event listeners for product image & title (to open modal)
        const clickables = productsGrid.querySelectorAll('.product-img-container, .product-title');
        clickables.forEach(elem => {
            elem.addEventListener('click', (e) => {
                const id = parseInt(elem.getAttribute('data-id'));
                openProductModal(id);
            });
        });

        // Attach event listeners for add to cart buttons
        const cartBtns = productsGrid.querySelectorAll('.add-cart-btn');
        cartBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-id'));
                addToCart(id);
            });
        });

        // Attach event listeners for price edit
        if (isAdmin) {
            const priceEditBtns = productsGrid.querySelectorAll('.admin-price-edit');
            priceEditBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = parseInt(btn.getAttribute('data-id'));
                    const product = products.find(p => p.id === id);
                    if (!product) return;

                    const newPriceRaw = prompt(`Masukkan harga baru untuk ${product.name} (angka saja):`, product.price);
                    if (newPriceRaw === null) return; // Cancel

                    const newPrice = parseInt(newPriceRaw);
                    if (isNaN(newPrice) || newPrice <= 0) {
                        alert("Harga tidak valid! Harus berupa angka positif.");
                        return;
                    }

                    product.price = newPrice;
                    localStorage.setItem('mitrabenih_custom_products', JSON.stringify(products));
                    renderCatalog();
                    alert(`Harga ${product.name} berhasil diperbarui secara lokal menjadi ${formatRupiah(newPrice)}!`);
                });
            });
        }
    }

    // Category button filter trigger
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = btn.getAttribute('data-category');
            renderCatalog();
        });
    });

    // Real-time Search input trigger
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderCatalog();
    });

    // Start with catalog rendering
    renderCatalog();

    // ==========================================
    // SHOPPING CART DRAWER ACTIONS
    // ==========================================
    function openCart() {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
    }

    function closeCart() {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    }

    cartToggle.addEventListener('click', openCart);
    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // ==========================================
    // CARTS LOGIC (ADD, UPDATE, DELETE)
    // ==========================================
    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        // Check if item is already in cart
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

        saveCart();
        updateCartUI();
        openCart(); // Show cart after adding
    }

    function updateQuantity(productId, amount) {
        const item = cart.find(i => i.id === productId);
        if (!item) return;

        item.quantity += amount;
        if (item.quantity <= 0) {
            // Remove item
            cart = cart.filter(i => i.id !== productId);
        }

        saveCart();
        updateCartUI();
    }

    function removeFromCart(productId) {
        cart = cart.filter(i => i.id !== productId);
        saveCart();
        updateCartUI();
    }

    function updateCartUI() {
        // Calculate totals
        let totalCount = 0;
        let totalPrice = 0;

        cartItemsList.innerHTML = "";

        if (cart.length === 0) {
            cartItemsList.innerHTML = `
                <div class="cart-empty-message">
                    <span style="font-size: 3rem;">🛒</span>
                    <p>Keranjang Anda masih kosong.<br>Pilih bibit terbaik di katalog kami!</p>
                </div>
            `;
            cartCount.textContent = "0";
            cartFooterDetails.style.display = "none";
            return;
        }

        // Render each cart item
        cart.forEach(item => {
            totalCount += item.quantity;
            totalPrice += item.price * item.quantity;

            const itemDiv = document.createElement('div');
            itemDiv.className = "cart-item";
            itemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-price">${formatRupiah(item.price)}</p>
                    <div class="cart-item-control">
                        <div class="quantity-picker">
                            <button type="button" class="qty-btn dec-btn" data-id="${item.id}">-</button>
                            <span class="qty-val">${item.quantity}</span>
                            <button type="button" class="qty-btn inc-btn" data-id="${item.id}">+</button>
                        </div>
                        <button type="button" class="cart-item-remove" data-id="${item.id}">Hapus</button>
                    </div>
                </div>
            `;
            cartItemsList.appendChild(itemDiv);
        });

        // Set cart counts and totals
        cartCount.textContent = totalCount;
        cartTotalPrice.textContent = formatRupiah(totalPrice);
        cartFooterDetails.style.display = "block";

        // Attach event listeners to quantity controls inside cart
        cartItemsList.querySelectorAll('.dec-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                updateQuantity(id, -1);
            });
        });

        cartItemsList.querySelectorAll('.inc-btn').forEach(btn => {
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

    // ==========================================
    // WHATSAPP CHECKOUT FORM
    // ==========================================
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('buyer-name').value;
        const address = document.getElementById('buyer-address').value;
        const courier = document.getElementById('buyer-courier').value;

        if (cart.length === 0) return;

        // Build WhatsApp Message text
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

        // Encode URI
        const encodedText = encodeURIComponent(messageText);
        const waUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodedText}`;

        // Log Order to Google Sheets if configured
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

        // Clear cart
        cart = [];
        saveCart();
        updateCartUI();
        closeCart();

        // Redirect to WhatsApp
        window.open(waUrl, '_blank');
    });

    // ==========================================
    // CONTACT DIRECT FORM (SEND TO WHATSAPP)
    // ==========================================
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        const message = document.getElementById('contact-message').value;

        let messageText = "*HALO MITRA BENIH INDONESIA, SAYA INGIN BERTANYA:*\n";
        messageText += "--------------------------------------\n";
        messageText += `- *Nama:* ${name}\n`;
        messageText += `- *Email:* ${email}\n`;
        messageText += `- *Pertanyaan:* \n"${message}"\n`;
        messageText += "--------------------------------------";

        const encodedText = encodeURIComponent(messageText);
        const waUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodedText}`;

        // Reset Form
        contactForm.reset();

        // Open WA
        window.open(waUrl, '_blank');
    });

    // ==========================================
    // NEWSLETTER FORM SUBMIT
    // ==========================================
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert("Terima kasih telah mendaftar! Tips berkebun bulanan akan dikirimkan ke email Anda.");
        newsletterForm.reset();
    });

    // ==========================================
    // DETAIL PRODUCT MODAL ACTIONS
    // ==========================================
    function openProductModal(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        let adminActionsHTML = "";
        if (isAdmin) {
            adminActionsHTML = `
                <div class="modal-admin-actions" style="display: flex; gap: 12px; margin-top: 10px; width: 100%;">
                    <button class="btn btn-secondary modal-admin-edit-btn" data-id="${product.id}" style="flex-grow: 1; padding: 12px; font-size: 0.9rem; background-color: var(--secondary); color: var(--text-primary);">✏️ Edit Detail</button>
                    <button class="btn modal-admin-delete-btn" data-id="${product.id}" style="background-color: #ef4444; color: white; flex-grow: 1; padding: 12px; font-size: 0.9rem; border: none; border-radius: var(--radius-sm); cursor: pointer; font-weight: 600;">🗑️ Hapus Produk</button>
                </div>
            `;
        }

        modalContentGrid.innerHTML = `
            <div class="modal-img-side">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="modal-info-side">
                <span class="modal-cat">${getCategoryLabel(product.category)}</span>
                <h3 class="modal-title">${product.name}</h3>
                <div class="modal-rating">
                    ★★★★★ <span>4.9 / 5.0 (dari ${product.reviews} ulasan)</span>
                </div>
                <div class="modal-price">${formatRupiah(product.price)}</div>
                
                <p class="modal-desc">${product.description}</p>
                
                <div class="modal-instruction">
                    <h4>🌱 Petunjuk Singkat Budidaya:</h4>
                    <p>${product.instruction}</p>
                </div>
                
                <div class="modal-actions" style="display: flex; flex-direction: column; gap: 8px;">
                    <button class="btn btn-primary modal-add-cart-btn" data-id="${product.id}" style="width: 100%;">
                        Tambah ke Keranjang
                    </button>
                    ${adminActionsHTML}
                </div>
            </div>
        `;

        productModal.classList.add('active');

        // Attach event listener inside modal add cart btn
        const modalCartBtn = modalContentGrid.querySelector('.modal-add-cart-btn');
        if (modalCartBtn) {
            modalCartBtn.addEventListener('click', () => {
                addToCart(product.id);
                closeProductModal();
            });
        }

        // Attach admin edit and delete handlers
        if (isAdmin) {
            const editBtn = modalContentGrid.querySelector('.modal-admin-edit-btn');
            const deleteBtn = modalContentGrid.querySelector('.modal-admin-delete-btn');

            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    closeProductModal();
                    openEditProductModal(product.id);
                });
            }

            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    if (confirm(`Apakah Anda yakin ingin menghapus "${product.name}" dari katalog?`)) {
                        products = products.filter(p => p.id !== product.id);
                        localStorage.setItem('mitrabenih_custom_products', JSON.stringify(products));
                        closeProductModal();
                        renderCatalog();
                        alert(`Produk "${product.name}" berhasil dihapus.`);
                    }
                });
            }
        }
    }

    function closeProductModal() {
        productModal.classList.remove('active');
    }

    modalClose.addEventListener('click', closeProductModal);

    // Close modal when clicking outside modal container
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) {
            closeProductModal();
        }
    });

    // ==========================================
    // FAQ ACCORDION ACTIONS
    // ==========================================
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all first
            faqItems.forEach(i => i.classList.remove('active'));

            // Toggle clicked
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // ==========================================
    // TESTIMONIALS STATE & LOGIC
    // ==========================================
    const testimonialsGrid = document.getElementById('testimonials-grid');
    const toggleTestiFormBtn = document.getElementById('toggle-testimonial-form-btn');
    const testiFormWrapper = document.getElementById('testimonial-form-wrapper');
    const submitTestiForm = document.getElementById('submit-testimonial-form');

    const baseTestimonials = [
        {
            id: 1,
            stars: 5,
            text: "Pesan bibit durian montong dan alpukat mentega. Paket sampai di Surabaya dalam 3 hari, daun masih segar banget dan medianya masih lembab. Sekarang umur 1 tahun sudah mulai berbunga!",
            name: "Bpk. Joko Susilo",
            role: "Pecinta Tanaman Buah - Surabaya",
            avatar: "images/avatar1.webp"
        },
        {
            id: 2,
            stars: 5,
            text: "Benih cabai rawit setan dan tomat cherry daya tumbuh luar biasa! Dari 50 benih yang saya semai di tray, tumbuh 46 bibit sehat. Panduan menanamnya sangat detail dan membantu untuk pemula.",
            name: "Ibu Rini Wahyuni",
            role: "Urban Farmer - Jakarta Selatan",
            avatar: "images/avatar2.webp"
        },
        {
            id: 3,
            stars: 5,
            text: "Pelayanan konsultasinya ramah sekali. Bibit monstera saya sempat layu karena ekspedisi lambat, tapi langsung diganti baru gratis setelah kirim video unboxing. Sangat terpercaya!",
            name: "Andy Wijaya",
            role: "Kolektor Tanaman Hias - Bandung",
            avatar: "images/avatar3.webp"
        }
    ];

    function renderTestimonials() {
        if (!testimonialsGrid) return;

        testimonialsGrid.innerHTML = "";

        // Load custom testimonials from localStorage
        let customTestimonials = [];
        const savedTesti = localStorage.getItem('mitrabenih_testimonials');
        if (savedTesti) {
            try {
                customTestimonials = JSON.parse(savedTesti);
            } catch (e) {
                customTestimonials = [];
            }
        }

        // Combine base and custom testimonials
        const allTestimonials = [...baseTestimonials, ...customTestimonials];

        // Render
        allTestimonials.forEach(testi => {
            const card = document.createElement('div');
            card.className = "testimonial-card";

            let starString = "";
            for (let i = 0; i < testi.stars; i++) {
                starString += "★";
            }
            for (let i = testi.stars; i < 5; i++) {
                starString += "☆";
            }

            card.innerHTML = `
                <div class="stars" style="color: #f59e0b; margin-bottom: 20px;">${starString}</div>
                <p class="testimonial-text" style="font-style: italic; color: var(--text-secondary); margin-bottom: 24px;">"${testi.text}"</p>
                <div class="testimonial-user" style="display: flex; align-items: center; gap: 16px;">
                    <img src="${testi.avatar}" alt="Avatar ${testi.name}" class="user-avatar" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">
                    <div class="user-info">
                        <h4 style="font-size: 1rem; font-weight: 700;">${testi.name}</h4>
                        <p style="font-size: 0.85rem; color: var(--text-light);">${testi.role}</p>
                    </div>
                </div>
            `;
            testimonialsGrid.appendChild(card);
        });
    }

    // Toggle testimonial form visibility
    if (toggleTestiFormBtn && testiFormWrapper) {
        toggleTestiFormBtn.addEventListener('click', () => {
            if (testiFormWrapper.style.display === "none") {
                testiFormWrapper.style.display = "block";
                toggleTestiFormBtn.textContent = "Batal Menulis";
            } else {
                testiFormWrapper.style.display = "none";
                toggleTestiFormBtn.textContent = "Tulis Testimoni Anda";
            }
        });
    }

    // Handle form submission
    if (submitTestiForm) {
        submitTestiForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('testi-name').value;
            const city = document.getElementById('testi-city').value;
            const rating = parseInt(document.getElementById('testi-rating').value);
            const content = document.getElementById('testi-content').value;
            const avatarInput = document.getElementById('testi-avatar');

            const defaultAvatar = `data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="%235cb811"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-8 4-8 4h16s-1.9-4-8-4z"/></svg>`;

            const handleAdd = (avatarSrc) => {
                // Get custom testimonials
                let customTestimonials = [];
                const savedTesti = localStorage.getItem('mitrabenih_testimonials');
                if (savedTesti) {
                    try {
                        customTestimonials = JSON.parse(savedTesti);
                    } catch (e) {
                        customTestimonials = [];
                    }
                }

                // Create new testimonial
                const newTesti = {
                    id: Date.now(),
                    stars: rating,
                    text: content,
                    name: name,
                    role: city,
                    avatar: avatarSrc
                };

                customTestimonials.push(newTesti);
                localStorage.setItem('mitrabenih_testimonials', JSON.stringify(customTestimonials));

                if (GOOGLE_APPS_SCRIPT_URL) {
                    sendToGoogleAppsScript('ADD_TESTIMONIAL', newTesti).then(res => {
                        if (res && res.avatarUrl) {
                            newTesti.avatar = res.avatarUrl;
                            localStorage.setItem('mitrabenih_testimonials', JSON.stringify(customTestimonials));
                            renderTestimonials();
                        }
                    });
                }

                // Re-render testimonials
                renderTestimonials();

                // Hide and reset form
                testiFormWrapper.style.display = "none";
                toggleTestiFormBtn.textContent = "Tulis Testimoni Anda";
                submitTestiForm.reset();

                // Format star text for WhatsApp
                let starText = "";
                for (let i = 0; i < rating; i++) starText += "★";

                // Open WhatsApp checkout message to Admin
                let messageText = "*KIRIM TESTIMONI PENGUNJUNG WEBSITE MITRA BENIH INDONESIA:*\n";
                messageText += "====================================\n\n";
                messageText += `- *Nama:* ${name}\n`;
                messageText += `- *Pekerjaan/Kota:* ${city}\n`;
                messageText += `- *Rating:* ${starText} (${rating}/5)\n`;
                messageText += `- *Isi Ulasan:*\n"${content}"\n\n`;
                messageText += "====================================\n";
                messageText += "Mohon untuk disimpan permanen di dalam source code website. Terima kasih!";

                const encodedText = encodeURIComponent(messageText);
                const waUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodedText}`;

                alert("Testimoni Anda berhasil ditambahkan di web ini! Tekan OK untuk mengirim salinannya ke Admin via WhatsApp.");
                window.open(waUrl, '_blank');
            };

            if (avatarInput.files && avatarInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    handleAdd(e.target.result);
                };
                reader.readAsDataURL(avatarInput.files[0]);
            } else {
                handleAdd(defaultAvatar);
            }
        });
    }

    // Render testimonials initially
    renderTestimonials();

    // ==========================================
    // ADMIN VIDEO CONFIGURATION LOGIC
    // ==========================================

    // Load saved video URL from localStorage if exists
    // ==========================================
    // ADMIN VIDEO CONFIGURATION LOGIC (GALERI VIDEO MULTI-PLATFORM)
    // ==========================================
    const videoGrid = document.getElementById('video-grid');
    const adminVideoTitle = document.getElementById('admin-video-title');
    const adminVideoCancel = document.getElementById('admin-video-cancel');

    function getYouTubeId(url) {
        try {
            const parsed = new URL(url);
            if (parsed.hostname.includes('youtu.be')) {
                return parsed.pathname.substring(1);
            }
            if (parsed.hostname.includes('youtube.com')) {
                if (parsed.pathname.includes('/shorts/')) {
                    return parsed.pathname.split('/shorts/')[1].split('/')[0].split('?')[0];
                }
                if (parsed.pathname.includes('/embed/')) {
                    return parsed.pathname.split('/embed/')[1].split('/')[0].split('?')[0];
                }
                return parsed.searchParams.get('v');
            }
        } catch (e) {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? match[2] : null;
        }
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    function getGoogleDriveId(url) {
        const gdMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
        return gdMatch ? gdMatch[1] : null;
    }

    function getInstagramCode(url) {
        const igMatch = url.match(/instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/);
        return igMatch ? igMatch[1] : null;
    }

    function getTikTokId(url) {
        const ttMatch = url.match(/tiktok\.com\/@[a-zA-Z0-9._-]+\/video\/([0-9]+)/);
        return ttMatch ? ttMatch[1] : null;
    }

    function parseVideoUrl(rawUrl) {
        const url = rawUrl.trim();
        const ytId = getYouTubeId(url);
        if (ytId) {
            return { type: 'iframe', url: `https://www.youtube-nocookie.com/embed/${ytId}` };
        }

        // 2. Google Drive
        const gdId = getGoogleDriveId(url);
        if (gdId) {
            return { type: 'iframe', url: `https://drive.google.com/file/d/${gdId}/preview` };
        }

        // 3. Instagram
        const igCode = getInstagramCode(url);
        if (igCode) {
            return { type: 'iframe', url: `https://www.instagram.com/p/${igCode}/embed/` };
        }

        // 4. TikTok
        const ttId = getTikTokId(url);
        if (ttId) {
            return { type: 'iframe', url: `https://www.tiktok.com/embed/v2/${ttId}` };
        }

        // 5. Facebook Video
        const fbMatch = url.match(/facebook\.com\/.*\/videos\/([0-9]+)/) || url.match(/fb\.watch\/([a-zA-Z0-9_-]+)/);
        if (fbMatch) {
            return { type: 'iframe', url: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0` };
        }

        // 6. Direct Video link (mp4, webm, ogg)
        if (url.match(/\.(mp4|webm|ogg)$/i) || url.includes('video/mp4') || url.includes('stream')) {
            return { type: 'video', url: url };
        }

        // Fallback
        return { type: 'iframe', url: url };
    }

    function renderVideos() {
        if (!videoGrid) return;
        videoGrid.innerHTML = "";

        // 1. Render dashed card "Tambah Video Baru" first if in admin mode
        if (isAdmin) {
            const addCard = document.createElement('div');
            addCard.className = "video-card admin-add-video-card";
            addCard.style.border = "2px dashed var(--primary)";
            addCard.style.borderRadius = "var(--radius-md)";
            addCard.style.display = "flex";
            addCard.style.flexDirection = "column";
            addCard.style.alignItems = "center";
            addCard.style.justifyContent = "center";
            addCard.style.padding = "40px 20px";
            addCard.style.minHeight = "280px";
            addCard.style.cursor = "pointer";
            addCard.style.background = "var(--bg-secondary)";
            addCard.innerHTML = `
                <span style="font-size: 3rem; color: var(--primary);">➕</span>
                <span style="color: var(--primary); font-weight: bold; font-size: 1.1rem; margin-top: 15px;">Tambah Video Baru</span>
            `;
            addCard.addEventListener('click', () => {
                adminVideoForm.reset();
                if (adminVideoPanel) {
                    adminVideoPanel.style.display = "block";
                    adminVideoPanel.scrollIntoView({ behavior: 'smooth' });
                }
            });
            videoGrid.appendChild(addCard);
        }

        videosData.forEach(video => {
            const card = document.createElement('div');
            card.className = "video-card";
            card.style.backgroundColor = "var(--bg-secondary)";
            card.style.border = "1px solid var(--border)";
            card.style.borderRadius = "var(--radius-md)";
            card.style.overflow = "hidden";
            card.style.boxShadow = "var(--shadow-sm)";
            card.style.display = "flex";
            card.style.flexDirection = "column";

            const parsed = parseVideoUrl(video.url);
            let playerHTML = "";

            if (parsed.type === 'video') {
                playerHTML = `
                    <video controls style="width: 100%; height: 220px; object-fit: cover;" src="${parsed.url}"></video>
                `;
            } else {
                playerHTML = `
                    <iframe src="${parsed.url}" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="width: 100%; height: 220px; border: none;"></iframe>
                `;
            }

            let protocolWarningHTML = "";
            if (window.location.protocol === 'file:' && parsed.type === 'iframe') {
                protocolWarningHTML = `
                    <div style="font-size: 0.75rem; color: #d97706; background-color: #fef3c7; border: 1px solid #fde68a; padding: 8px 12px; border-radius: var(--radius-sm); margin: 10px 15px 0 15px; line-height: 1.4;">
                        ⚠️ <strong>Protokol File Lokal Aktif:</strong> YouTube memblokir pemutaran video langsung dari file komputer (file://). Video ini akan <strong>berfungsi normal</strong> setelah website di-upload ke server hosting (online) atau dijalankan dengan Live Server.
                    </div>
                `;
            }

            let adminActionsHTML = "";
            if (isAdmin) {
                adminActionsHTML = `
                    <div style="padding: 10px 15px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; background: var(--bg-primary);">
                        <button class="btn delete-video-btn" data-id="${video.id}" style="padding: 6px 12px; font-size: 0.8rem; background-color: #ef4444; color: white; border: none; border-radius: var(--radius-sm); cursor: pointer; font-weight: 600;">🗑️ Hapus</button>
                    </div>
                `;
            }

            card.innerHTML = `
                <div style="width: 100%; height: 220px; background-color: #000; position: relative;">
                    ${playerHTML}
                </div>
                ${protocolWarningHTML}
                <div style="padding: 15px; flex-grow: 1; display: flex; flex-direction: column; justify-content: center;">
                    <h4 style="font-size: 1rem; font-weight: 600; color: var(--text-primary); margin: 0; line-height: 1.4;">${video.title}</h4>
                </div>
                ${adminActionsHTML}
            `;

            // Attach delete listener
            if (isAdmin) {
                const delBtn = card.querySelector('.delete-video-btn');
                if (delBtn) {
                    delBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (confirm(`Apakah Anda yakin ingin menghapus video "${video.title}"?`)) {
                            videosData = videosData.filter(v => v.id !== video.id);
                            localStorage.setItem('mitrabenih_custom_videos', JSON.stringify(videosData));
                            renderVideos();
                            alert(`Video "${video.title}" berhasil dihapus.`);
                        }
                    });
                }
            }

            videoGrid.appendChild(card);
        });
    }

    if (adminVideoToggle && adminVideoPanel) {
        adminVideoToggle.addEventListener('click', () => {
            if (adminVideoPanel.style.display === "none") {
                adminVideoPanel.style.display = "block";
                adminVideoToggle.textContent = "Batal Kelola Video";
            } else {
                adminVideoPanel.style.display = "none";
                adminVideoToggle.textContent = "⚙️ Kelola Video (Admin)";
            }
        });
    }

    if (adminVideoCancel && adminVideoPanel) {
        adminVideoCancel.addEventListener('click', () => {
            adminVideoPanel.style.display = "none";
            if (adminVideoToggle) adminVideoToggle.textContent = "⚙️ Kelola Video (Admin)";
            adminVideoForm.reset();
        });
    }

    if (adminVideoForm) {
        adminVideoForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = adminVideoTitle.value.trim();
            const rawUrl = adminVideoUrlInput.value.trim();
            if (!rawUrl || !title) return;

            const newVideo = {
                id: Date.now(),
                title: title,
                url: rawUrl
            };

            videosData.unshift(newVideo);
            localStorage.setItem('mitrabenih_custom_videos', JSON.stringify(videosData));

            renderVideos();

            // Reset and close panel
            adminVideoPanel.style.display = "none";
            if (adminVideoToggle) adminVideoToggle.textContent = "⚙️ Kelola Video (Admin)";
            adminVideoForm.reset();

            // Notify Admin
            alert(`Video "${title}" berhasil ditambahkan!`);
        });
    }

    // Load saved videos initially
    renderVideos();

    // ==========================================
    // CAREERS / LOWONGAN KERJA LOGIC
    // ==========================================
    const careerJobList = document.getElementById('career-job-list');
    const careerSearchInput = document.getElementById('career-search-input');
    const careerSearchBtn = document.getElementById('career-search-btn');
    const careerJobCount = document.getElementById('career-job-count');
    const careerDivisionList = document.getElementById('career-division-list');

    // Admin Career Selectors
    const adminCareerModal = document.getElementById('admin-career-modal');
    const adminCareerClose = document.getElementById('admin-career-close');
    const adminCareerForm = document.getElementById('admin-career-form');
    const adminJobTitle = document.getElementById('admin-job-title');
    const adminJobDivision = document.getElementById('admin-job-division');
    const adminJobType = document.getElementById('admin-job-type');
    const adminJobDate = document.getElementById('admin-job-date');
    const adminJobDesc = document.getElementById('admin-job-desc');
    const adminJobReqs = document.getElementById('admin-job-reqs');

    let activeDivision = "all";
    let careerSearchQuery = "";
    let editingCareerId = null;

    // Populate the dropdown inside Add/Edit Job modal dynamically
    function populateJobDivisionSelect() {
        if (!adminJobDivision) return;
        adminJobDivision.innerHTML = "";
        divisions.forEach(div => {
            const opt = document.createElement('option');
            opt.value = div.id;
            opt.textContent = div.label;
            adminJobDivision.appendChild(opt);
        });
    }

    // Render Division Sidebar dynamically
    function renderDivisions() {
        if (!careerDivisionList) return;
        careerDivisionList.innerHTML = "";

        // Add 'Semua Divisi' first
        const allLi = document.createElement('li');
        allLi.className = `career-division-item ${activeDivision === "all" ? "active" : ""}`;
        allLi.setAttribute('data-division', 'all');
        allLi.style.cursor = "pointer";
        allLi.style.display = "flex";
        allLi.style.alignItems = "center";
        allLi.style.justifyContent = "space-between";
        allLi.style.gap = "8px";
        allLi.style.padding = "8px 12px";
        allLi.style.borderRadius = "var(--radius-sm)";
        allLi.style.transition = "all var(--transition-fast)";
        
        allLi.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 0.8rem; color: ${activeDivision === 'all' ? 'var(--primary)' : 'var(--text-light)'};">&gt;</span>
                <span>Semua Divisi</span>
            </div>
        `;
        allLi.addEventListener('click', () => {
            activeDivision = "all";
            renderDivisions();
            renderCareers();
        });
        careerDivisionList.appendChild(allLi);

        // Add each custom division
        divisions.forEach(div => {
            const li = document.createElement('li');
            li.className = `career-division-item ${activeDivision === div.id ? "active" : ""}`;
            li.setAttribute('data-division', div.id);
            li.style.cursor = "pointer";
            li.style.display = "flex";
            li.style.alignItems = "center";
            li.style.justifyContent = "space-between";
            li.style.gap = "8px";
            li.style.padding = "8px 12px";
            li.style.borderRadius = "var(--radius-sm)";
            li.style.transition = "all var(--transition-fast)";

            let deleteBtnHTML = "";
            if (isAdmin) {
                deleteBtnHTML = `<span class="delete-div-btn" data-id="${div.id}" style="color: #ef4444; font-size: 0.9rem; font-weight: bold; cursor: pointer; padding: 2px 6px; border-radius: 4px;" title="Hapus Divisi">✕</span>`;
            }

            li.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 0.8rem; color: ${activeDivision === div.id ? 'var(--primary)' : 'var(--text-light)'};">&gt;</span>
                    <span>${div.label}</span>
                </div>
                ${deleteBtnHTML}
            `;

            li.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-div-btn')) return;
                activeDivision = div.id;
                renderDivisions();
                renderCareers();
            });

            if (isAdmin) {
                const delBtn = li.querySelector('.delete-div-btn');
                if (delBtn) {
                    delBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (confirm(`Apakah Anda yakin ingin menghapus divisi "${div.label}"?\n\nSemua lowongan di bawah divisi ini akan diubah kategorinya menjadi Lainnya.`)) {
                            // Update jobs in this division
                            careersData.forEach(job => {
                                if (job.division === div.id) {
                                    job.division = "all";
                                    job.divisionLabel = "LAINNYA";
                                }
                            });
                            localStorage.setItem('mitrabenih_custom_careers', JSON.stringify(careersData));

                            // Remove division
                            divisions = divisions.filter(d => d.id !== div.id);
                            localStorage.setItem('mitrabenih_custom_divisions', JSON.stringify(divisions));
                            
                            if (activeDivision === div.id) {
                                activeDivision = "all";
                            }

                            populateJobDivisionSelect();
                            renderDivisions();
                            renderCareers();
                            alert(`Divisi "${div.label}" berhasil dihapus.`);
                        }
                    });
                }
            }

            careerDivisionList.appendChild(li);
        });

        // Add "➕ Tambah Divisi" button for admin at the bottom of the sidebar
        if (isAdmin) {
            const addLi = document.createElement('li');
            addLi.className = "career-division-item";
            addLi.style.cursor = "pointer";
            addLi.style.border = "1px dashed var(--primary)";
            addLi.style.marginTop = "12px";
            addLi.style.textAlign = "center";
            addLi.style.padding = "8px 12px";
            addLi.style.borderRadius = "var(--radius-sm)";
            addLi.style.display = "flex";
            addLi.style.justifyContent = "center";
            addLi.style.alignItems = "center";
            addLi.innerHTML = `
                <span style="color: var(--primary); font-weight: 600; font-size: 0.9rem;">➕ Tambah Divisi</span>
            `;
            addLi.addEventListener('click', () => {
                const newDivName = prompt("Masukkan nama divisi baru (misalnya: TEKNOLOGI, HUMAN RESOURCES):");
                if (newDivName && newDivName.trim().length > 0) {
                    const cleanName = newDivName.trim();
                    const newId = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    
                    // Check if already exists
                    if (divisions.some(d => d.id === newId || d.label.toUpperCase() === cleanName.toUpperCase())) {
                        alert("Divisi tersebut sudah ada!");
                        return;
                    }

                    divisions.push({ id: newId, label: cleanName.toUpperCase() });
                    localStorage.setItem('mitrabenih_custom_divisions', JSON.stringify(divisions));

                    populateJobDivisionSelect();
                    renderDivisions();
                    alert(`Divisi "${cleanName.toUpperCase()}" berhasil ditambahkan!`);
                }
            });
            careerDivisionList.appendChild(addLi);
        }
    }

    function renderCareers() {
        if (!careerJobList) return;

        // Filter careers
        const filteredJobs = careersData.filter(job => {
            const matchesDivision = activeDivision === "all" || job.division === activeDivision;
            const matchesSearch = job.title.toLowerCase().includes(careerSearchQuery.toLowerCase()) ||
                job.description.toLowerCase().includes(careerSearchQuery.toLowerCase());
            return matchesDivision && matchesSearch;
        });

        // Set count label
        if (careerJobCount) {
            careerJobCount.textContent = `${filteredJobs.length} Posisi Tersedia`;
        }

        // Render listings
        careerJobList.innerHTML = "";

        // 1. Render Admin Add Card first if in admin mode
        if (isAdmin) {
            const addCard = document.createElement('div');
            addCard.className = "career-job-card admin-add-career-card";
            addCard.style.border = "2px dashed var(--primary)";
            addCard.style.textAlign = "center";
            addCard.style.display = "flex";
            addCard.style.alignItems = "center";
            addCard.style.justifyContent = "center";
            addCard.style.padding = "20px";
            addCard.style.cursor = "pointer";
            addCard.style.background = "var(--bg-primary)";
            addCard.innerHTML = `
                <span style="color: var(--primary); font-weight: bold; font-size: 1.1rem;">➕ Tambah Lowongan Baru</span>
            `;
            addCard.addEventListener('click', () => {
                editingCareerId = null;
                const modalTitle = document.getElementById('admin-career-modal-title');
                if (modalTitle) modalTitle.textContent = "➕ Tambah Lowongan Baru";
                adminCareerForm.reset();

                // Set default date
                const today = new Date();
                const day = String(today.getDate()).padStart(2, '0');
                const monthsID = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
                const monthName = monthsID[today.getMonth()];
                const year = today.getFullYear();
                adminJobDate.value = `${day} ${monthName} ${year}`;

                adminCareerModal.classList.add('active');
            });
            careerJobList.appendChild(addCard);
        }

        if (filteredJobs.length === 0) {
            if (!isAdmin) {
                careerJobList.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                        <span style="font-size: 2.5rem;">🔍</span>
                        <h4 style="margin-top: 15px;">Lowongan tidak ditemukan</h4>
                        <p style="font-size: 0.9rem; margin-top: 6px;">Coba gunakan kata kunci lain atau pilih divisi berbeda.</p>
                    </div>
                `;
            }
            return;
        }

        filteredJobs.forEach(job => {
            const card = document.createElement('div');
            card.className = "career-job-card";
            card.setAttribute('data-id', job.id);

            // Handle closed status style
            const isClosed = job.status === 'closed';
            if (isClosed) {
                card.style.opacity = "0.7";
            }

            // Build requirements HTML
            let reqsHTML = "";
            if (job.requirements && Array.isArray(job.requirements)) {
                job.requirements.forEach(req => {
                    reqsHTML += `<li style="margin-bottom: 6px;">${req}</li>`;
                });
            }

            // Status Badge HTML
            const statusBadgeHTML = isClosed
                ? `<span style="background-color: #ef4444; color: white; padding: 4px 8px; border-radius: var(--radius-sm); font-size: 0.7rem; font-weight: 700; margin-left: auto;">DITUTUP</span>`
                : `<span style="background-color: #10b981; color: white; padding: 4px 8px; border-radius: var(--radius-sm); font-size: 0.7rem; font-weight: 700; margin-left: auto;">BUKA</span>`;

            // Admin controls HTML
            let adminActionsHTML = "";
            if (isAdmin) {
                adminActionsHTML = `
                    <div class="modal-admin-actions" style="display: flex; gap: 12px; margin-top: 20px; border-top: 1px dashed var(--border); padding-top: 15px;">
                        <button class="btn btn-secondary edit-career-btn" data-id="${job.id}" style="font-size: 0.85rem; padding: 8px 16px; background-color: var(--secondary); color: var(--text-primary);">✏️ Edit</button>
                        <button class="btn toggle-status-career-btn" data-id="${job.id}" style="font-size: 0.85rem; padding: 8px 16px; background-color: ${isClosed ? '#10b981' : '#f59e0b'}; color: white; border: none; border-radius: var(--radius-sm); cursor: pointer; font-weight: 600;">
                            ${isClosed ? '🔓 Buka Lowongan' : '🔒 Tutup Lowongan'}
                        </button>
                        <button class="btn delete-career-btn" data-id="${job.id}" style="font-size: 0.85rem; padding: 8px 16px; background-color: #ef4444; color: white; border: none; border-radius: var(--radius-sm); cursor: pointer; font-weight: 600;">🗑️ Hapus</button>
                    </div>
                `;
            }

            // Lamar Button HTML
            const lamarBtnHTML = isClosed
                ? `<button class="btn" style="padding: 10px 20px; font-size: 0.9rem; background-color: #9ca3af; color: white; cursor: not-allowed;" disabled>Pendaftaran Ditutup</button>`
                : `<button class="btn btn-primary lamar-job-btn" data-title="${job.title}" style="padding: 10px 20px; font-size: 0.9rem;">Lamar Sekarang</button>`;

            card.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <h4 class="career-job-title" style="margin: 0;">${job.title}</h4>
                    ${statusBadgeHTML}
                </div>
                <div class="career-job-meta" style="margin-top: 12px;">
                    <div class="career-job-meta-item">
                        <span>💼</span>
                        <span>${job.divisionLabel}</span>
                    </div>
                    <div class="career-job-meta-item">
                        <span>🤝</span>
                        <span>${job.type}</span>
                    </div>
                    <div class="career-job-meta-item">
                        <span>📅</span>
                        <span>${job.date}</span>
                    </div>
                </div>
                
                <!-- Expandable detail wrapper -->
                <div class="career-job-details" style="display: none;">
                    <p style="margin-bottom: 16px;"><strong>Deskripsi Pekerjaan:</strong><br>${job.description}</p>
                    <p style="margin-bottom: 20px;"><strong>Persyaratan / Kualifikasi:</strong></p>
                    <ul style="padding-left: 20px; margin-bottom: 24px;">
                        ${reqsHTML}
                    </ul>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <div>
                            ${lamarBtnHTML}
                        </div>
                        ${adminActionsHTML}
                    </div>
                </div>
            `;

            // Attach toggle click to the card (excluding buttons/inputs)
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('lamar-job-btn') ||
                    e.target.classList.contains('edit-career-btn') ||
                    e.target.classList.contains('toggle-status-career-btn') ||
                    e.target.classList.contains('delete-career-btn')) return;

                const details = card.querySelector('.career-job-details');
                const isExpanded = details.style.display === "block";

                // Close all details first
                careerJobList.querySelectorAll('.career-job-details').forEach(d => {
                    d.style.display = "none";
                });

                // Toggle clicked details
                if (!isExpanded) {
                    details.style.display = "block";
                }
            });

            // Lamar button action
            const lamarBtn = card.querySelector('.lamar-job-btn');
            if (lamarBtn) {
                lamarBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const jobTitle = lamarBtn.getAttribute('data-title');

                    let messageText = `*LAMARAN PEKERJAAN - MITRA BENIH INDONESIA*\n`;
                    messageText += `====================================\n\n`;
                    messageText += `Halo Admin Mitra Benih Indonesia, saya ingin melamar posisi:\n`;
                    messageText += `*Posisi:* ${jobTitle}\n\n`;
                    messageText += `Berikut adalah ketertarikan saya terhadap lowongan ini. Mohon info mengenai alamat pengiriman berkas CV dan tahapan wawancara selanjutnya. Terima kasih!`;

                    const encodedText = encodeURIComponent(messageText);
                    const waUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodedText}`;

                    window.open(waUrl, '_blank');
                });
            }

            // Admin Actions event listeners
            if (isAdmin) {
                const editBtn = card.querySelector('.edit-career-btn');
                const toggleStatusBtn = card.querySelector('.toggle-status-career-btn');
                const deleteBtn = card.querySelector('.delete-career-btn');

                if (editBtn) {
                    editBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openEditCareerModal(job.id);
                    });
                }

                if (toggleStatusBtn) {
                    toggleStatusBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const nextStatus = job.status === 'closed' ? 'active' : 'closed';
                        job.status = nextStatus;
                        localStorage.setItem('mitrabenih_custom_careers', JSON.stringify(careersData));
                        renderCareers();
                        alert(`Status lowongan "${job.title}" diubah menjadi ${nextStatus === 'closed' ? 'DITUTUP' : 'AKTIF'}.`);
                    });
                }

                if (deleteBtn) {
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (confirm(`Apakah Anda yakin ingin menghapus lowongan "${job.title}"?`)) {
                            careersData = careersData.filter(c => c.id !== job.id);
                            localStorage.setItem('mitrabenih_custom_careers', JSON.stringify(careersData));
                            renderCareers();
                            alert(`Lowongan "${job.title}" berhasil dihapus.`);
                        }
                    });
                }
            }

            careerJobList.appendChild(card);
        });
    }

    // Open career modal in edit mode
    function openEditCareerModal(careerId) {
        const job = careersData.find(c => c.id === careerId);
        if (!job) return;

        editingCareerId = careerId;

        const modalTitle = document.getElementById('admin-career-modal-title');
        if (modalTitle) modalTitle.textContent = "✏️ Edit Detail Lowongan";

        adminJobTitle.value = job.title;
        adminJobDivision.value = job.division;
        adminJobType.value = job.type;
        adminJobDate.value = job.date;
        adminJobDesc.value = job.description;
        adminJobReqs.value = job.requirements.join('\n');

        adminCareerModal.classList.add('active');
    }

    // Add / Edit Career Form Submission
    if (adminCareerForm) {
        adminCareerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = adminJobTitle.value.trim();
            const division = adminJobDivision.value;
            const selectedDiv = divisions.find(d => d.id === division);
            const divisionLabel = selectedDiv ? selectedDiv.label : "LAINNYA";

            const type = adminJobType.value.trim();
            const date = adminJobDate.value.trim();
            const description = adminJobDesc.value.trim();
            const requirements = adminJobReqs.value.split('\n').map(r => r.trim()).filter(r => r.length > 0);

            if (editingCareerId === null) {
                // Add Mode
                const newJob = {
                    id: Date.now(),
                    title: title,
                    division: division,
                    divisionLabel: divisionLabel,
                    type: type,
                    date: date,
                    status: "active",
                    description: description,
                    requirements: requirements
                };
                careersData.push(newJob);
                alert(`Lowongan "${title}" berhasil diposting!`);
            } else {
                // Edit Mode
                const job = careersData.find(c => c.id === editingCareerId);
                if (job) {
                    job.title = title;
                    job.division = division;
                    job.divisionLabel = divisionLabel;
                    job.type = type;
                    job.date = date;
                    job.description = description;
                    job.requirements = requirements;
                    alert(`Lowongan "${title}" berhasil diperbarui!`);
                }
            }

            localStorage.setItem('mitrabenih_custom_careers', JSON.stringify(careersData));

            editingCareerId = null;
            renderCareers();
            adminCareerModal.classList.remove('active');
            adminCareerForm.reset();
        });
    }

    if (adminCareerClose) {
        adminCareerClose.addEventListener('click', () => {
            adminCareerModal.classList.remove('active');
        });
    }

    // Attach Search handler
    if (careerSearchInput) {
        // Real-time search
        careerSearchInput.addEventListener('input', (e) => {
            careerSearchQuery = e.target.value;
            renderCareers();
        });
    }

    if (careerSearchBtn && careerSearchInput) {
        careerSearchBtn.addEventListener('click', () => {
            careerSearchQuery = careerSearchInput.value;
            renderCareers();
        });
    }

    // Initialize Divisions rendering and select options list
    populateJobDivisionSelect();
    renderDivisions();
    renderCareers();

    // ==========================================
    // ACTIVITIES / KEGIATAN LOGIC
    // ==========================================
    const activitiesGrid = document.getElementById('activities-grid');
    const adminActivityModal = document.getElementById('admin-activity-modal');
    const adminActivityClose = document.getElementById('admin-activity-close');
    const adminActivityForm = document.getElementById('admin-activity-form');
    const adminActTitle = document.getElementById('admin-act-title');
    const adminActDate = document.getElementById('admin-act-date');
    const adminActImage = document.getElementById('admin-act-image');
    const adminActDesc = document.getElementById('admin-act-desc');

    function renderActivities() {
        if (!activitiesGrid) return;
        activitiesGrid.innerHTML = "";

        // 1. Render Admin Add Card first if in admin mode
        if (isAdmin) {
            const addCard = document.createElement('div');
            addCard.className = "activity-card admin-add-activity-card";
            addCard.style.border = "2px dashed var(--primary)";
            addCard.style.borderRadius = "var(--radius-md)";
            addCard.style.display = "flex";
            addCard.style.flexDirection = "column";
            addCard.style.alignItems = "center";
            addCard.style.justifyContent = "center";
            addCard.style.padding = "40px 20px";
            addCard.style.minHeight = "320px";
            addCard.style.cursor = "pointer";
            addCard.style.background = "var(--bg-primary)";
            addCard.innerHTML = `
                <span style="font-size: 3rem; color: var(--primary);">➕</span>
                <span style="color: var(--primary); font-weight: bold; font-size: 1.1rem; margin-top: 15px;">Tambah Kegiatan Baru</span>
            `;
            addCard.addEventListener('click', () => {
                adminActivityForm.reset();
                // Set default date
                const today = new Date();
                const day = String(today.getDate()).padStart(2, '0');
                const monthsID = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
                const monthName = monthsID[today.getMonth()];
                const year = today.getFullYear();
                adminActDate.value = `${day} ${monthName} ${year}`;
                
                adminActivityModal.classList.add('active');
            });
            activitiesGrid.appendChild(addCard);
        }

        activitiesData.forEach(act => {
            const card = document.createElement('div');
            card.className = "activity-card";
            card.style.backgroundColor = "var(--bg-primary)";
            card.style.border = "1px solid var(--border)";
            card.style.borderRadius = "var(--radius-md)";
            card.style.overflow = "hidden";
            card.style.boxShadow = "var(--shadow-sm)";
            card.style.transition = "transform var(--transition-normal), box-shadow var(--transition-normal)";
            card.style.display = "flex";
            card.style.flexDirection = "column";
            
            // Add hover effects
            card.addEventListener('mouseenter', () => {
                card.style.transform = "translateY(-5px)";
                card.style.boxShadow = "var(--shadow-md)";
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = "translateY(0)";
                card.style.boxShadow = "var(--shadow-sm)";
            });

            let adminActionsHTML = "";
            if (isAdmin) {
                adminActionsHTML = `
                    <div style="padding: 10px 20px; background: var(--bg-secondary); border-top: 1px solid var(--border); display: flex; justify-content: flex-end;">
                        <button class="btn delete-activity-btn" data-id="${act.id}" style="padding: 6px 12px; font-size: 0.8rem; background-color: #ef4444; color: white; border: none; border-radius: var(--radius-sm); cursor: pointer; font-weight: 600;">🗑️ Hapus</button>
                    </div>
                `;
            }

            card.innerHTML = `
                <div style="height: 200px; width: 100%; overflow: hidden;">
                    <img src="${act.image}" alt="${act.title}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div style="padding: 24px; flex-grow: 1; display: flex; flex-direction: column; gap: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.75rem; color: var(--text-light); font-weight: 600;">📅 ${act.date}</span>
                    </div>
                    <h4 style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary); margin: 0;">${act.title}</h4>
                    <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; margin: 0; flex-grow: 1;">${act.description}</p>
                </div>
                ${adminActionsHTML}
            `;

            // Attach delete listener
            if (isAdmin) {
                const delBtn = card.querySelector('.delete-activity-btn');
                if (delBtn) {
                    delBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (confirm(`Apakah Anda yakin ingin menghapus kegiatan "${act.title}"?`)) {
                            activitiesData = activitiesData.filter(a => a.id !== act.id);
                            localStorage.setItem('mitrabenih_custom_activities', JSON.stringify(activitiesData));
                            renderActivities();
                            alert(`Kegiatan "${act.title}" berhasil dihapus.`);
                        }
                    });
                }
            }

            activitiesGrid.appendChild(card);
        });
    }

    // Modal Close
    if (adminActivityClose) {
        adminActivityClose.addEventListener('click', () => {
            adminActivityModal.classList.remove('active');
        });
    }

    // Form Submission
    if (adminActivityForm) {
        adminActivityForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const title = adminActTitle.value.trim();
            const date = adminActDate.value.trim();
            const desc = adminActDesc.value.trim();
            const fileInput = adminActImage.files[0];

            if (!fileInput) {
                alert("Harap unggah foto kegiatan.");
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                const base64Image = event.target.result;
                
                const newAct = {
                    id: Date.now(),
                    title: title,
                    date: date,
                    image: base64Image,
                    description: desc
                };

                activitiesData.unshift(newAct); // Add to the beginning of list
                localStorage.setItem('mitrabenih_custom_activities', JSON.stringify(activitiesData));

                if (GOOGLE_APPS_SCRIPT_URL) {
                    sendToGoogleAppsScript('ADD_ACTIVITY', newAct).then(res => {
                        if (res && res.imageUrl) {
                            newAct.image = res.imageUrl;
                            localStorage.setItem('mitrabenih_custom_activities', JSON.stringify(activitiesData));
                            renderActivities();
                        }
                    });
                }
                
                renderActivities();
                adminActivityModal.classList.remove('active');
                adminActivityForm.reset();
                alert(`Kegiatan "${title}" berhasil ditambahkan!`);
            };
            reader.readAsDataURL(fileInput);
        });
    }

    // Call render initially
    renderActivities();

    // ==========================================
    // INITIAL CARTS LOADING
    // ==========================================
    loadCart();

});

// ==========================================
// HELPERS UTILITY FUNCTIONS
// ==========================================
function getCategoryLabel(cat) {
    switch (cat) {
        case 'buah': return 'Bibit Buah';
        case 'sayur': return 'Benih Sayur';
        case 'hias': return 'Tanaman Hias';
        case 'bunga': return 'Benih Bunga';
        default: return 'Lainnya';
    }
}

function formatRupiah(num) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num);
}
