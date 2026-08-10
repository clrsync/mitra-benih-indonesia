// ==========================================
// GOOGLE APPS SCRIPT API CLIENT
// ==========================================

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
                    image: formatImageUrl(p.imageurl || p.image || 'images/alpukat_miki.webp'),
                    description: p.description || '',
                    instruction: p.instruction || 'Merawat tanaman secara rutin dan menyiram berkala.'
                }));
                if (typeof renderCatalog === 'function') renderCatalog();
            }
            if (res.data.activities && res.data.activities.length > 0) {
                activitiesData = res.data.activities.map(a => ({
                    id: a.id || Date.now(),
                    title: a.title || '',
                    date: a.date || '',
                    image: formatImageUrl(a.imageurl || a.image || ''),
                    description: a.description || ''
                }));
                if (typeof renderActivities === 'function') renderActivities();
            }
            if (res.data.testimonials && res.data.testimonials.length > 0) {
                customTestimonials = res.data.testimonials.map(t => ({
                    id: t.id || Date.now(),
                    name: t.name || '',
                    role: t.role || '',
                    avatar: formatImageUrl(t.avatarurl || t.avatar || ''),
                    text: t.text || '',
                    rating: Number(t.rating) || 5
                }));
                if (typeof renderTestimonials === 'function') renderTestimonials();
            }
            if (res.data.divisions && res.data.divisions.length > 0) {
                divisions = res.data.divisions.map(d => ({
                    id: String(d.id || d.label || '').toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    label: String(d.label || d.id || '').toUpperCase()
                }));
                if (typeof populateJobDivisionSelect === 'function') populateJobDivisionSelect();
                if (typeof renderDivisions === 'function') renderDivisions();
            }

            if (res.data.careers && res.data.careers.length > 0) {
                careersData = res.data.careers.map(c => ({
                    id: c.id || Date.now(),
                    title: c.title || '',
                    division: c.division || '',
                    divisionLabel: c.divisionlabel || c.divisionLabel || '',
                    type: c.type || '',
                    date: c.date || '',
                    status: c.status || 'active',
                    description: c.description || ''
                }));

                if (!res.data.divisions || res.data.divisions.length === 0) {
                    const uniqueDivs = new Map();
                    careersData.forEach(c => {
                        if (c.division) {
                            uniqueDivs.set(c.division, { id: c.division, label: c.divisionLabel || c.division.toUpperCase() });
                        }
                    });
                    divisions = Array.from(uniqueDivs.values());
                }

                if (typeof populateJobDivisionSelect === 'function') populateJobDivisionSelect();
                if (typeof renderDivisions === 'function') renderDivisions();
                if (typeof renderCareers === 'function') renderCareers();
            }
            if (res.data.videos && res.data.videos.length > 0) {
                videosData = res.data.videos.map(v => ({
                    id: v.id || Date.now(),
                    title: v.title || '',
                    category: v.category || '',
                    categoryLabel: v.categorylabel || v.categoryLabel || '',
                    url: v.url || '',
                    type: v.type || 'iframe',
                    description: v.description || ''
                }));
                if (typeof renderVideos === 'function') renderVideos();
            }

            document.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
        }
    } catch (err) {
        console.warn("Error fetching data from Google Sheets:", err);
    }
}
