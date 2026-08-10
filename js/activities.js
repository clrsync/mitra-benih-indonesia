// ==========================================
// ACTIVITIES & NURSERY GALLERY
// ==========================================

function renderActivities() {
    const activitiesGrid = document.getElementById('activities-grid');
    if (!activitiesGrid) return;

    activitiesGrid.innerHTML = "";

    activitiesData.forEach(act => {
        const card = document.createElement('div');
        card.classList.add('activity-card');
        card.style.cssText = "background: var(--bg-card); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border); display: flex; flex-direction: column; transition: transform 0.3s ease, box-shadow 0.3s ease;";

        const adminActionsHTML = isAdmin ? `
            <div style="padding: 10px 15px; background: var(--bg-secondary); border-top: 1px solid var(--border); text-align: right;">
                <button class="delete-activity-btn" data-id="${act.id}" style="padding: 4px 10px; background: #ef4444; color: white; border: none; border-radius: var(--radius-sm); font-size: 0.8rem; cursor: pointer;">🗑️ Hapus Kegiatan</button>
            </div>
        ` : '';

        card.innerHTML = `
            <div style="position: relative; height: 200px; overflow: hidden;">
                <img src="${act.image}" alt="${act.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null;this.src='images/nursery_view.jpg';">
                <span style="position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; padding: 4px 10px; border-radius: var(--radius-sm); font-size: 0.75rem;">📅 ${act.date}</span>
            </div>
            <div style="padding: 20px; flex-grow: 1; display: flex; flex-direction: column;">
                <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">${act.title}</h3>
                <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; margin: 0; flex-grow: 1;">${act.description}</p>
            </div>
            ${adminActionsHTML}
        `;

        if (isAdmin) {
            const delBtn = card.querySelector('.delete-activity-btn');
            if (delBtn) {
                delBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm(`Apakah Anda yakin ingin menghapus kegiatan "${act.title}"?`)) {
                        activitiesData = activitiesData.filter(a => a.id !== act.id);
                        if (GOOGLE_APPS_SCRIPT_URL) {
                            sendToGoogleAppsScript('DELETE_ACTIVITY', { id: act.id });
                        }
                        renderActivities();
                        alert(`Kegiatan "${act.title}" berhasil dihapus.`);
                    }
                });
            }
        }

        activitiesGrid.appendChild(card);
    });
}

function initActivities() {
    const addActivityBtn = document.getElementById('add-activity-btn');
    const adminActivityModal = document.getElementById('admin-activity-modal');
    const adminActivityForm = document.getElementById('admin-activity-form');
    const adminActivityClose = document.getElementById('admin-activity-close');
    const adminActivityCancel = document.getElementById('admin-activity-cancel');

    if (addActivityBtn && adminActivityModal) {
        addActivityBtn.addEventListener('click', () => {
            if (adminActivityForm) adminActivityForm.reset();
            adminActivityModal.classList.add('active');
        });
    }

    if (adminActivityClose && adminActivityModal) {
        adminActivityClose.addEventListener('click', () => adminActivityModal.classList.remove('active'));
    }
    if (adminActivityCancel && adminActivityModal) {
        adminActivityCancel.addEventListener('click', () => adminActivityModal.classList.remove('active'));
    }

    if (adminActivityForm) {
        adminActivityForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const adminActTitle = document.getElementById('admin-act-title');
            const adminActDate = document.getElementById('admin-act-date');
            const adminActDesc = document.getElementById('admin-act-desc');
            const adminActImage = document.getElementById('admin-act-image');

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

                activitiesData.unshift(newAct);
                if (GOOGLE_APPS_SCRIPT_URL) {
                    sendToGoogleAppsScript('ADD_ACTIVITY', newAct).then(res => {
                        if (res && res.imageUrl) {
                            newAct.image = res.imageUrl;
                            renderActivities();
                        }
                    });
                }
                
                renderActivities();
                if (adminActivityModal) adminActivityModal.classList.remove('active');
                adminActivityForm.reset();
                alert(`Kegiatan "${title}" berhasil ditambahkan!`);
            };
            reader.readAsDataURL(fileInput);
        });
    }

    renderActivities();
}
