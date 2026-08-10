// ==========================================
// MAIN ENTRY POINT, NAVIGATION, & AUTHENTICATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initial fetch from Google Sheets if configured
    loadDataFromGoogleSheets();

    // Elements
    const header = document.getElementById('header');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const themeToggle = document.getElementById('theme-toggle');

    // Admin Elements
    const adminPortalLink = document.getElementById('admin-portal-link');
    const adminLoginModal = document.getElementById('admin-login-modal');
    const adminLoginClose = document.getElementById('admin-login-close');
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminPasswordInput = document.getElementById('admin-password');
    const adminTopBanner = document.getElementById('admin-top-banner');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    const addProductBtn = document.getElementById('add-product-btn');
    const addActivityBtn = document.getElementById('add-activity-btn');
    const addCareerBtn = document.getElementById('add-career-btn');
    const adminVideoToggle = document.getElementById('admin-video-toggle');
    const adminVideoPanel = document.getElementById('admin-video-panel');

    // Header Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Navigation Toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close Mobile Nav on Link Click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (hamburger && navMenu) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });

    // Dark / Light Theme Toggle
    if (themeToggle) {
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
    }

    // Admin Interface Toggle Logic
    function initAdminUI() {
        if (isAdmin) {
            if (adminTopBanner) adminTopBanner.style.display = "block";
            if (adminVideoToggle) adminVideoToggle.style.display = "inline-block";
            if (addProductBtn) addProductBtn.style.display = "inline-flex";
            if (addActivityBtn) addActivityBtn.style.display = "inline-flex";
            if (addCareerBtn) addCareerBtn.style.display = "inline-flex";
        } else {
            if (adminTopBanner) adminTopBanner.style.display = "none";
            if (adminVideoToggle) adminVideoToggle.style.display = "none";
            if (adminVideoPanel) adminVideoPanel.style.display = "none";
            if (addProductBtn) addProductBtn.style.display = "none";
            if (addActivityBtn) addActivityBtn.style.display = "none";
            if (addCareerBtn) addCareerBtn.style.display = "none";
        }
    }

    // Toggle Login Admin Modal
    if (adminPortalLink) {
        adminPortalLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (adminLoginModal) adminLoginModal.classList.add('active');
        });
    }

    if (adminLoginClose && adminLoginModal) {
        adminLoginClose.addEventListener('click', () => {
            adminLoginModal.classList.remove('active');
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
        }, 1200);

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

    // Admin Password Login Submit
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
                renderDivisions();
                renderCareers();
                renderActivities();
                renderVideos();
                alert("Berhasil masuk sebagai Admin!");
            } else {
                alert("Kata sandi salah! Sandi default adalah: Prawira123");
            }
        });
    }

    // Admin Logout
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            isAdmin = false;
            sessionStorage.removeItem('mitrabenih_admin_logged_in');
            initAdminUI();
            renderCatalog();
            renderDivisions();
            renderCareers();
            renderActivities();
            renderVideos();
            alert("Anda telah keluar dari mode Admin.");
        });
    }

    // Initialize All Submodules
    initProducts();
    initCart();
    initActivities();
    initCareers();
    initTestimonials();
    initVideos();
    initAdminUI();
});
