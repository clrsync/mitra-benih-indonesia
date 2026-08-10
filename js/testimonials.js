// ==========================================
// TESTIMONIALS & CUSTOMER REVIEWS
// ==========================================

function renderTestimonials() {
    const testimonialsGrid = document.getElementById('testimonials-grid');
    if (!testimonialsGrid) return;

    testimonialsGrid.innerHTML = "";

    const allTestimonials = [...baseTestimonials, ...customTestimonials];

    allTestimonials.forEach(testi => {
        let starsHTML = "";
        for (let i = 0; i < 5; i++) {
            if (i < (testi.stars || testi.rating || 5)) {
                starsHTML += `<span style="color: #f59e0b;">★</span>`;
            } else {
                starsHTML += `<span style="color: var(--border);">★</span>`;
            }
        }

        const card = document.createElement('div');
        card.classList.add('testimonial-card');

        const adminActionsHTML = isAdmin ? `
            <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid var(--border); text-align: right;">
                <button class="delete-testimonial-btn" data-id="${testi.id}" style="padding: 4px 10px; background: #ef4444; color: white; border: none; border-radius: var(--radius-sm); font-size: 0.8rem; cursor: pointer;">🗑️ Hapus Testimoni</button>
            </div>
        ` : '';

        card.innerHTML = `
            <div class="testimonial-stars" style="margin-bottom: 12px; font-size: 1.1rem;">
                ${starsHTML}
            </div>
            <p class="testimonial-text">"${testi.text}"</p>
            <div class="testimonial-user">
                <img src="${testi.avatar}" alt="${testi.name}" class="testimonial-avatar" loading="lazy" onerror="this.onerror=null;this.src='images/avatar1.webp';">
                <div class="testimonial-info">
                    <h4 class="testimonial-name">${testi.name}</h4>
                    <span class="testimonial-role">${testi.role}</span>
                </div>
            </div>
            ${adminActionsHTML}
        `;

        if (isAdmin) {
            const delBtn = card.querySelector('.delete-testimonial-btn');
            if (delBtn) {
                delBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm(`Apakah Anda yakin ingin menghapus testimoni dari "${testi.name}"?`)) {
                        customTestimonials = customTestimonials.filter(t => t.id !== testi.id);
                        if (GOOGLE_APPS_SCRIPT_URL) {
                            sendToGoogleAppsScript('DELETE_TESTIMONIAL', { id: testi.id });
                        }
                        renderTestimonials();
                        alert(`Testimoni dari "${testi.name}" berhasil dihapus.`);
                    }
                });
            }
        }

        testimonialsGrid.appendChild(card);
    });
}

function initTestimonials() {
    const toggleTestiFormBtn = document.getElementById('toggle-testi-form-btn');
    const testiFormWrapper = document.getElementById('testi-form-wrapper');
    const submitTestiForm = document.getElementById('submit-testi-form');
    const cancelTestiBtn = document.getElementById('cancel-testi-btn');

    if (toggleTestiFormBtn && testiFormWrapper) {
        toggleTestiFormBtn.addEventListener('click', () => {
            if (testiFormWrapper.style.display === "none") {
                testiFormWrapper.style.display = "block";
                toggleTestiFormBtn.textContent = "Batal Tulis Testimoni";
            } else {
                testiFormWrapper.style.display = "none";
                toggleTestiFormBtn.textContent = "Tulis Testimoni Anda";
            }
        });
    }

    if (cancelTestiBtn && testiFormWrapper) {
        cancelTestiBtn.addEventListener('click', () => {
            testiFormWrapper.style.display = "none";
            if (toggleTestiFormBtn) toggleTestiFormBtn.textContent = "Tulis Testimoni Anda";
            if (submitTestiForm) submitTestiForm.reset();
        });
    }

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
                const newTesti = {
                    id: Date.now(),
                    rating: rating,
                    text: content,
                    name: name,
                    role: city,
                    avatar: avatarSrc
                };

                customTestimonials.push(newTesti);

                if (GOOGLE_APPS_SCRIPT_URL) {
                    sendToGoogleAppsScript('ADD_TESTIMONIAL', newTesti).then(res => {
                        if (res && res.avatarUrl) {
                            newTesti.avatar = res.avatarUrl;
                            renderTestimonials();
                        }
                    });
                }

                renderTestimonials();

                if (testiFormWrapper) testiFormWrapper.style.display = "none";
                if (toggleTestiFormBtn) toggleTestiFormBtn.textContent = "Tulis Testimoni Anda";
                submitTestiForm.reset();

                alert("Testimoni Anda berhasil dikirim untuk review Admin!");
            };

            if (avatarInput && avatarInput.files && avatarInput.files[0]) {
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

    renderTestimonials();
}
