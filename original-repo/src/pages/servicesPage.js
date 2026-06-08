import { getTreatments } from "../features/admin/treatmentManager.js";

export const renderServicesPage = async () => {
    const page = document.getElementById('services-page');
    if (!page) return;

    page.innerHTML = `
        <div class="page-container">
            <h2 class="page-title"><i class="fa-solid fa-spa"></i> Layanan Kami</h2>
            <div id="treatments-list"><div class="page-loading"><div class="spinner-sm"></div> Memuat layanan...</div></div>
        </div>
    `;

    const container = document.getElementById('treatments-list');
    try {
        const treatments = await getTreatments();
        if (!treatments.length) {
            container.innerHTML = '<p class="page-empty">Belum ada layanan tersedia.</p>';
            return;
        }
        container.innerHTML = treatments.map(t => `
            <div class="treatment-item">
                <div class="treatment-item-header" data-id="${t.id}">
                    <div class="treatment-item-name">
                        <i class="fa-solid fa-leaf"></i>
                        <span>${t.name}</span>
                    </div>
                    <div class="treatment-item-right">
                        <span class="treatment-price">Rp ${Number(t.price || 0).toLocaleString('id-ID')}</span>
                        <i class="fa-solid fa-chevron-down chevron-icon"></i>
                    </div>
                </div>
                <div class="treatment-item-body" id="body-${t.id}" style="display:none;">
                    <p>${t.description || 'Layanan perawatan premium untuk muslimah.'}</p>
                    ${t.duration ? `<p><i class="fa-regular fa-clock"></i> Durasi: <strong>${t.duration} menit</strong></p>` : ''}
                    <button class="btn-book-now" data-name="${t.name}" data-id="${t.id}">
                        <i class="fa-solid fa-calendar-plus"></i> Booking Sekarang
                    </button>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.treatment-item-header').forEach(header => {
            header.addEventListener('click', () => {
                const id = header.dataset.id;
                const body = document.getElementById('body-' + id);
                const chevron = header.querySelector('.chevron-icon');
                const isOpen = body.style.display === 'block';
                body.style.display = isOpen ? 'none' : 'block';
                chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
            });
        });

        container.querySelectorAll('.btn-book-now').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.spa-page').forEach(p => { p.style.display = 'none'; p.classList.remove('active'); });
                const bookingPage = document.getElementById('booking-page');
                if (bookingPage) { bookingPage.style.display = 'block'; bookingPage.classList.add('active'); }
                const select = document.getElementById('booking-treatment');
                if (select) select.value = btn.dataset.name;
                document.querySelectorAll('.nav-link').forEach(nl => nl.classList.remove('active'));
                document.querySelector('.nav-link[data-page="booking"]')?.classList.add('active');
            });
        });
    } catch {
        container.innerHTML = '<p class="page-empty">Gagal memuat layanan. Coba lagi nanti.</p>';
    }
};
