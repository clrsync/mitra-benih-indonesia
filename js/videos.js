// ==========================================
// VIDEO DOCUMENTATION & EMBEDS
// ==========================================

function parseVideoUrl(url) {
    if (!url) return { type: 'unknown', url: '' };

    // YouTube Match
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (ytMatch && ytMatch[1]) {
        const ytId = ytMatch[1];
        return { type: 'iframe', url: `https://www.youtube-nocookie.com/embed/${ytId}` };
    }

    // Google Drive Match
    const gdMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (gdMatch && gdMatch[1]) {
        const gdId = gdMatch[1];
        return { type: 'iframe', url: `https://drive.google.com/file/d/${gdId}/preview` };
    }

    // Instagram Match
    const igMatch = url.match(/instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/);
    if (igMatch && igMatch[1]) {
        const igCode = igMatch[1];
        return { type: 'iframe', url: `https://www.instagram.com/p/${igCode}/embed/` };
    }

    // TikTok Match
    const ttMatch = url.match(/tiktok\.com\/.*\/video\/(\d+)/);
    if (ttMatch && ttMatch[1]) {
        const ttId = ttMatch[1];
        return { type: 'iframe', url: `https://www.tiktok.com/embed/v2/${ttId}` };
    }

    // Facebook Match
    if (url.includes('facebook.com') || url.includes('fb.watch')) {
        return { type: 'iframe', url: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0` };
    }

    // Direct MP4 / Video File
    if (url.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
        return { type: 'video', url: url };
    }

    // Default Fallback
    return { type: 'iframe', url: url };
}

function renderVideos() {
    const videoGrid = document.getElementById('video-grid');
    if (!videoGrid) return;

    videoGrid.innerHTML = "";

    videosData.forEach(video => {
        const parsed = parseVideoUrl(video.url);
        const card = document.createElement('div');
        card.classList.add('video-card');
        card.style.cssText = "background: var(--bg-card); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border); box-shadow: var(--shadow-sm); display: flex; flex-direction: column;";

        let embedHTML = "";
        if (parsed.type === 'video') {
            embedHTML = `<video controls style="width:100%; height:220px; object-fit:cover; background:#000;"><source src="${parsed.url}" type="video/mp4">Browser Anda tidak mendukung pemutaran video.</video>`;
        } else {
            let fileNoticeHTML = "";
            if (window.location.protocol === 'file:' && parsed.type === 'iframe') {
                fileNoticeHTML = `
                    <div style="background: #fff3cd; color: #856404; padding: 8px 12px; font-size: 0.75rem; border-bottom: 1px solid #ffeeba; line-height: 1.3;">
                        ⚠️ <strong>Protokol File Lokal:</strong> Pemutaran video iframe dari file:// mungkin diblokir browser. Video akan berfungsi normal saat di-host di Web Server.
                    </div>
                `;
            }

            embedHTML = `
                ${fileNoticeHTML}
                <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; background: #000;">
                    <iframe src="${parsed.url}" style="position: absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
                </div>
            `;
        }

        const adminActionsHTML = isAdmin ? `
            <div style="padding: 10px 15px; background: var(--bg-secondary); border-top: 1px solid var(--border); text-align: right;">
                <button class="delete-video-btn" data-id="${video.id}" style="padding: 4px 10px; background: #ef4444; color: white; border: none; border-radius: var(--radius-sm); font-size: 0.8rem; cursor: pointer;">🗑️ Hapus Video</button>
            </div>
        ` : '';

        card.innerHTML = `
            ${embedHTML}
            <div style="padding: 16px; flex-grow: 1;">
                <h4 style="font-size: 1rem; font-weight: 600; color: var(--text-primary); margin: 0; line-height: 1.4;">${video.title}</h4>
            </div>
            ${adminActionsHTML}
        `;

        if (isAdmin) {
            const delBtn = card.querySelector('.delete-video-btn');
            if (delBtn) {
                delBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm(`Apakah Anda yakin ingin menghapus video "${video.title}"?`)) {
                        videosData = videosData.filter(v => v.id !== video.id);
                        if (GOOGLE_APPS_SCRIPT_URL) {
                            sendToGoogleAppsScript('DELETE_VIDEO', { id: video.id });
                        }
                        renderVideos();
                        alert(`Video "${video.title}" berhasil dihapus.`);
                    }
                });
            }
        }

        videoGrid.appendChild(card);
    });
}

function initVideos() {
    const adminVideoToggle = document.getElementById('admin-video-toggle');
    const adminVideoPanel = document.getElementById('admin-video-panel');
    const adminVideoForm = document.getElementById('admin-video-form');
    const adminVideoCancel = document.getElementById('admin-video-cancel');

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
            if (adminVideoForm) adminVideoForm.reset();
        });
    }

    if (adminVideoForm) {
        adminVideoForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const adminVideoTitle = document.getElementById('admin-video-title');
            const adminVideoUrlInput = document.getElementById('admin-video-url');

            const title = adminVideoTitle.value.trim();
            const rawUrl = adminVideoUrlInput.value.trim();
            if (!rawUrl || !title) return;

            const newVideo = {
                id: Date.now(),
                title: title,
                url: rawUrl
            };

            videosData.unshift(newVideo);
            if (GOOGLE_APPS_SCRIPT_URL) {
                sendToGoogleAppsScript('ADD_VIDEO', newVideo);
            }

            renderVideos();

            if (adminVideoPanel) adminVideoPanel.style.display = "none";
            if (adminVideoToggle) adminVideoToggle.textContent = "⚙️ Kelola Video (Admin)";
            adminVideoForm.reset();

            alert(`Video "${title}" berhasil ditambahkan!`);
        });
    }

    renderVideos();
}
