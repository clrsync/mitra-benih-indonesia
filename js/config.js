// ==========================================
// CONFIGURATION & GLOBAL STATE
// ==========================================

// Deployed Google Apps Script Web App URL
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzpx49cxhcCIF3W6MwglOqAsX4bBmvhJI2JmE9jIerqukuB441XrEibAP6dHIbxWkFHNg/exec";

// WhatsApp Target Phone Number
const WHATSAPP_PHONE = "6285165658480";

/**
 * Format & Sanitize Image URLs to prevent Google Drive redirect & CSP errors
 */
function formatImageUrl(url) {
    if (!url || typeof url !== 'string') return url || '';
    
    if (url.startsWith('data:') || url.startsWith('images/')) {
        return url;
    }

    const match = url.match(/(?:file\/d\/|id=|\/d\/)([a-zA-Z0-9_-]{20,})/);
    if (match && match[1]) {
        return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    return url;
}

// ==========================================
// DEFAULT FALLBACK DATASETS
// ==========================================
// DEFAULT DATASETS & STATE (LIVE GOOGLE SHEETS DYNAMIC DATA)
// ==========================================

const defaultProducts = [];
const defaultCareersData = [];
const defaultDivisions = [];
const defaultActivities = [];
const defaultVideos = [];
const baseTestimonials = [];

// ==========================================
// SHARED IN-MEMORY STATE
// ==========================================

let products = [];
let careersData = [];
let divisions = [];
let activitiesData = [];
let videosData = [];
let customTestimonials = [];
let cart = [];

let isAdmin = sessionStorage.getItem('mitrabenih_admin_logged_in') === 'true';
let editingProductId = null;
let activeCategory = 'all';
let searchQuery = '';
let activeDivision = 'all';
