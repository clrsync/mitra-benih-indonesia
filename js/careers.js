// ==========================================
// CAREERS & DIVISION MANAGEMENT
// ==========================================

let editingCareerId = null;

function renderDivisions() {
    const careerDivisionNav = document.getElementById('career-division-nav');
    if (!careerDivisionNav) return;

    careerDivisionNav.innerHTML = "";

    const allBtn = document.createElement('button');
    allBtn.classList.add('division-btn');
    if (activeDivision === 'all') allBtn.classList.add('active');
    allBtn.setAttribute('data-division', 'all');
    allBtn.textContent = "SEMUA DIVISI";
    careerDivisionNav.appendChild(allBtn);

    divisions.forEach(div => {
        const btnContainer = document.createElement('div');
        btnContainer.style.cssText = "display: inline-flex; align-items: center; gap: 4px;";

        const btn = document.createElement('button');
        btn.classList.add('division-btn');
        if (activeDivision === div.id) btn.classList.add('active');
        btn.setAttribute('data-division', div.id);
        btn.textContent = div.label;
        btnContainer.appendChild(btn);

        if (isAdmin) {
            const delDivBtn = document.createElement('button');
            delDivBtn.innerHTML = "✕";
            delDivBtn.title = "Hapus Divisi Ini";
            delDivBtn.style.cssText = "background: #ef4444; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 10px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; margin-left: -6px; z-index: 2;";
            
            delDivBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Apakah Anda yakin ingin menghapus divisi "${div.label}"?`)) {
                    careersData.forEach(job => {
                        if (job.division === div.id) {
                            job.division = "lainnya";
                            job.divisionLabel = "LAINNYA";
                        }
                    });
                    
                    divisions = divisions.filter(d => d.id !== div.id);
                    
                    if (activeDivision === div.id) {
                        activeDivision = "all";
                    }
                    
                    populateJobDivisionSelect();
                    renderDivisions();
                    renderCareers();
                    alert(`Divisi "${div.label}" berhasil dihapus.`);
                }
            });
            btnContainer.appendChild(delDivBtn);
        }

        careerDivisionNav.appendChild(btnContainer);
    });

    if (isAdmin) {
        const addDivBtn = document.createElement('button');
        addDivBtn.classList.add('division-btn');
        addDivBtn.style.cssText = "background: var(--bg-secondary); border: 1px dashed var(--accent-primary); color: var(--accent-primary); font-weight: 700;";
        addDivBtn.textContent = "+ DIVISI BARU";

        addDivBtn.addEventListener('click', () => {
            const divNameRaw = prompt("Masukkan nama Divisi baru (contoh: LOGISTIK & GUDANG):");
            if (!divNameRaw) return;

            const cleanName = divNameRaw.trim();
            if (cleanName.length === 0) return;

            const newId = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const exists = divisions.some(d => d.id === newId);
            if (exists) {
                alert("Divisi dengan nama tersebut sudah ada!");
                return;
            }

            divisions.push({ id: newId, label: cleanName.toUpperCase() });

            populateJobDivisionSelect();
            renderDivisions();
            alert(`Divisi baru "${cleanName.toUpperCase()}" berhasil ditambahkan!`);
        });

        careerDivisionNav.appendChild(addDivBtn);
    }

    const divisionBtns = careerDivisionNav.querySelectorAll('.division-btn');
    divisionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const div = btn.getAttribute('data-division');
            if (div) {
                activeDivision = div;
                renderDivisions();
                renderCareers();
            }
        });
    });
}

function renderCareers() {
    const careerJobList = document.getElementById('career-job-list');
    if (!careerJobList) return;

    careerJobList.innerHTML = "";

    const filteredJobs = careersData.filter(job => {
        return activeDivision === 'all' || job.division === activeDivision;
    });

    if (filteredJobs.length === 0) {
        careerJobList.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border);">
                <p style="font-size: 1.1rem; color: var(--text-secondary);">Saat ini belum ada lowongan kerja terbuka untuk divisi ini.</p>
            </div>
        `;
        return;
    }

    filteredJobs.forEach(job => {
        const card = document.createElement('div');
        card.classList.add('career-job-card');

        const statusBadgeHTML = job.status === 'closed' 
            ? `<span class="job-status-badge closed" style="background: #ef4444; color: white; padding: 4px 10px; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600;">DITUTUP</span>` 
            : `<span class="job-status-badge active" style="background: var(--accent-primary); color: white; padding: 4px 10px; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600;">AKTIF</span>`;

        const adminActionsHTML = isAdmin ? `
            <div class="career-admin-actions" style="margin-top: 15px; padding-top: 12px; border-top: 1px solid var(--border); display: flex; gap: 8px;">
                <button class="toggle-status-btn btn-secondary-sm" style="flex: 1; padding: 6px; font-size: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-secondary); color: var(--text-primary); cursor: pointer;">
                    ${job.status === 'closed' ? '🟢 Buka Lowongan' : '🔴 Tutup Lowongan'}
                </button>
                <button class="edit-career-btn btn-secondary-sm" style="flex: 1; padding: 6px; font-size: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-secondary); color: var(--text-primary); cursor: pointer;">
                    ✏️ Edit
                </button>
                <button class="delete-career-btn btn-secondary-sm" style="padding: 6px 10px; font-size: 0.8rem; border-radius: var(--radius-sm); border: none; background: #ef4444; color: white; cursor: pointer;">
                    🗑️
                </button>
            </div>
        ` : '';

        card.innerHTML = `
            <div class="career-job-header">
                <div>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                        <span class="job-type-tag">${job.divisionLabel || job.division.toUpperCase()}</span>
                        ${statusBadgeHTML}
                    </div>
                    <h3 class="job-title">${job.title}</h3>
                </div>
                <span class="job-date">Diposting: ${job.date}</span>
            </div>
            <p class="job-description">${job.description}</p>
            <div class="job-bottom">
                <button class="detail-job-btn btn-secondary-sm">Detail & Syarat Pelamar</button>
                <a href="https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent('Halo Admin MBI, saya berminat melamar posisi: ' + job.title)}" target="_blank" class="apply-job-btn btn-primary-sm ${job.status === 'closed' ? 'disabled' : ''}" style="${job.status === 'closed' ? 'pointer-events: none; opacity: 0.5;' : ''}">
                    Lamar Sekarang
                </a>
            </div>
            ${adminActionsHTML}
        `;

        const detailBtn = card.querySelector('.detail-job-btn');
        if (detailBtn) {
            detailBtn.addEventListener('click', () => {
                openCareerModal(job);
            });
        }

        if (isAdmin) {
            const toggleBtn = card.querySelector('.toggle-status-btn');
            const editBtn = card.querySelector('.edit-career-btn');
            const deleteBtn = card.querySelector('.delete-career-btn');

            if (toggleBtn) {
                toggleBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const nextStatus = job.status === 'closed' ? 'active' : 'closed';
                    job.status = nextStatus;
                    if (GOOGLE_APPS_SCRIPT_URL) {
                        sendToGoogleAppsScript('UPDATE_CAREER', job);
                    }
                    renderCareers();
                    alert(`Status lowongan "${job.title}" diubah menjadi ${nextStatus === 'closed' ? 'DITUTUP' : 'AKTIF'}.`);
                });
            }

            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openEditCareerModal(job);
                });
            }

            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm(`Apakah Anda yakin ingin menghapus lowongan "${job.title}"?`)) {
                        careersData = careersData.filter(c => c.id !== job.id);
                        if (GOOGLE_APPS_SCRIPT_URL) {
                            sendToGoogleAppsScript('DELETE_CAREER', { id: job.id });
                        }
                        renderCareers();
                        alert(`Lowongan "${job.title}" berhasil dihapus.`);
                    }
                });
            }
        }

        careerJobList.appendChild(card);
    });
}

function openCareerModal(job) {
    const careerModal = document.getElementById('career-modal');
    const careerModalTitle = document.getElementById('career-modal-title');
    const careerModalMeta = document.getElementById('career-modal-meta');
    const careerModalDesc = document.getElementById('career-modal-desc');
    const careerModalReqs = document.getElementById('career-modal-reqs');
    const careerModalApplyBtn = document.getElementById('career-modal-apply-btn');

    if (!careerModal) return;

    if (careerModalTitle) careerModalTitle.textContent = job.title;
    if (careerModalMeta) careerModalMeta.textContent = `Divisi: ${job.divisionLabel || job.division.toUpperCase()} | Diposting: ${job.date}`;
    if (careerModalDesc) careerModalDesc.textContent = job.description;

    if (careerModalReqs) {
        careerModalReqs.innerHTML = "";
        const reqsList = job.requirements || ["Pendidikan dan pengalaman relevan.", "Kemampuan komunikasi dan integritas yang baik."];
        reqsList.forEach(req => {
            const li = document.createElement('li');
            li.textContent = req;
            careerModalReqs.appendChild(li);
        });
    }

    if (careerModalApplyBtn) {
        careerModalApplyBtn.href = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent('Halo Admin MBI, saya berminat melamar posisi: ' + job.title)}`;
    }

    careerModal.classList.add('active');
}

function openEditCareerModal(job) {
    const adminCareerModal = document.getElementById('admin-career-modal');
    const adminCareerModalTitle = document.getElementById('admin-career-modal-title');
    const adminJobTitle = document.getElementById('admin-job-title');
    const adminJobDivision = document.getElementById('admin-job-division');
    const adminJobDate = document.getElementById('admin-job-date');
    const adminJobDesc = document.getElementById('admin-job-desc');
    const adminJobReqs = document.getElementById('admin-job-reqs');

    if (!adminCareerModal) return;

    editingCareerId = job.id;
    if (adminCareerModalTitle) adminCareerModalTitle.textContent = "Edit Lowongan Kerja";
    if (adminJobTitle) adminJobTitle.value = job.title;
    if (adminJobDivision) adminJobDivision.value = job.division;
    if (adminJobDate) adminJobDate.value = job.date;
    if (adminJobDesc) adminJobDesc.value = job.description;
    if (adminJobReqs) adminJobReqs.value = (job.requirements || []).join('\n');

    adminCareerModal.classList.add('active');
}

function populateJobDivisionSelect() {
    const adminJobDivision = document.getElementById('admin-job-division');
    if (!adminJobDivision) return;

    adminJobDivision.innerHTML = "";
    divisions.forEach(div => {
        const opt = document.createElement('option');
        opt.value = div.id;
        opt.textContent = div.label;
        adminJobDivision.appendChild(opt);
    });
}

function initCareers() {
    const addCareerBtn = document.getElementById('add-career-btn');
    const adminCareerModal = document.getElementById('admin-career-modal');
    const adminCareerForm = document.getElementById('admin-career-form');
    const adminCareerModalTitle = document.getElementById('admin-career-modal-title');
    const adminCareerClose = document.getElementById('admin-career-close');
    const adminCareerCancel = document.getElementById('admin-career-cancel');
    const careerModal = document.getElementById('career-modal');
    const careerModalClose = document.getElementById('career-modal-close');

    if (addCareerBtn && adminCareerModal) {
        addCareerBtn.addEventListener('click', () => {
            editingCareerId = null;
            if (adminCareerModalTitle) adminCareerModalTitle.textContent = "Posting Lowongan Kerja Baru";
            if (adminCareerForm) adminCareerForm.reset();
            populateJobDivisionSelect();
            adminCareerModal.classList.add('active');
        });
    }

    if (adminCareerClose && adminCareerModal) {
        adminCareerClose.addEventListener('click', () => adminCareerModal.classList.remove('active'));
    }
    if (adminCareerCancel && adminCareerModal) {
        adminCareerCancel.addEventListener('click', () => adminCareerModal.classList.remove('active'));
    }
    if (careerModalClose && careerModal) {
        careerModalClose.addEventListener('click', () => careerModal.classList.remove('active'));
    }

    if (adminCareerForm) {
        adminCareerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const adminJobTitle = document.getElementById('admin-job-title');
            const adminJobDivision = document.getElementById('admin-job-division');
            const adminJobDate = document.getElementById('admin-job-date');
            const adminJobDesc = document.getElementById('admin-job-desc');
            const adminJobReqs = document.getElementById('admin-job-reqs');

            const title = adminJobTitle.value.trim();
            const divisionId = adminJobDivision.value;
            const date = adminJobDate.value.trim();
            const description = adminJobDesc.value.trim();
            const requirements = adminJobReqs.value.split('\n').map(r => r.trim()).filter(r => r.length > 0);

            const divObj = divisions.find(d => d.id === divisionId);
            const divisionLabel = divObj ? divObj.label : divisionId.toUpperCase();

            if (editingCareerId === null) {
                const newJob = {
                    id: Date.now(),
                    title: title,
                    division: divisionId,
                    divisionLabel: divisionLabel,
                    type: title.toUpperCase(),
                    date: date || new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'Long', year: 'numeric' }),
                    status: 'active',
                    description: description,
                    requirements: requirements
                };
                careersData.unshift(newJob);
                if (GOOGLE_APPS_SCRIPT_URL) {
                    sendToGoogleAppsScript('ADD_CAREER', newJob);
                }
                alert(`Lowongan "${title}" berhasil diposting!`);
            } else {
                const job = careersData.find(c => c.id === editingCareerId);
                if (job) {
                    job.title = title;
                    job.division = divisionId;
                    job.divisionLabel = divisionLabel;
                    job.date = date;
                    job.description = description;
                    job.requirements = requirements;
                    if (GOOGLE_APPS_SCRIPT_URL) {
                        sendToGoogleAppsScript('UPDATE_CAREER', job);
                    }
                    alert(`Lowongan "${title}" berhasil diperbarui!`);
                }
            }

            editingCareerId = null;
            renderCareers();
            if (adminCareerModal) adminCareerModal.classList.remove('active');
            adminCareerForm.reset();
        });
    }

    populateJobDivisionSelect();
    renderDivisions();
    renderCareers();
}
