import { showToast } from "../../components/toast.js";
import { getAllBookings, deleteBooking } from "./adminService.js";
import { getTreatments, addTreatment, removeTreatment } from "./treatmentManager.js";
import { getProducts, addProduct, deleteProduct } from "./productManager.js";

const ADMIN_EMAIL = "miftahilmi15@gmail.com";

export const initAdminDashboard = (user) => {
    const isAdmin = user && user.email === ADMIN_EMAIL;
    if (!isAdmin) return;

    const adminMenu = document.getElementById('admin-menu');
    if (adminMenu) {
        adminMenu.classList.remove('hidden');
        adminMenu.addEventListener('click', (e) => {
            e.preventDefault();
            loadAdminPage();
            const sidebar = document.getElementById('sidebar');
            const backdrop = document.getElementById('sidebar-backdrop');
            if (sidebar) sidebar.classList.remove('active');
            if (backdrop) backdrop.classList.remove('active');
        });
    }
};

const loadAdminPage = async () => {
    document.querySelectorAll('.spa-page').forEach(p => {
        p.style.display = 'none';
        p.classList.remove('active');
    });

    const adminPage = document.getElementById('admin-page');
    if (!adminPage) return;

    adminPage.style.display = 'block';
    adminPage.classList.add('active');
    adminPage.innerHTML = `
        <div class="admin-container">
            <h2 class="admin-title"><i class="fa-solid fa-user-shield"></i> Admin Dashboard</h2>

            <div class="admin-tabs">
                <button class="admin-tab active" data-tab="bookings">Booking</button>
                <button class="admin-tab" data-tab="treatments">Treatment</button>
                <button class="admin-tab" data-tab="products">Produk</button>
            </div>

            <div id="tab-bookings" class="admin-tab-content active">
                <p class="admin-loading">Memuat data booking...</p>
            </div>
            <div id="tab-treatments" class="admin-tab-content" style="display:none;">
                <button class="btn-admin-add" id="btn-add-treatment">+ Tambah Treatment</button>
                <p class="admin-loading">Memuat data treatment...</p>
            </div>
            <div id="tab-products" class="admin-tab-content" style="display:none;">
                <button class="btn-admin-add" id="btn-add-product">+ Tambah Produk</button>
                <p class="admin-loading">Memuat data produk...</p>
            </div>
        </div>
    `;

    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');
            tab.classList.add('active');
            document.getElementById('tab-' + tab.dataset.tab).style.display = 'block';
        });
    });

    loadBookings();
    loadTreatments();
    loadProducts();
};

const loadBookings = async () => {
    const container = document.getElementById('tab-bookings');
    try {
        const bookings = await getAllBookings();
        if (!bookings.length) {
            container.innerHTML = '<p class="admin-empty">Belum ada data booking.</p>';
            return;
        }
        container.innerHTML = bookings.map(b => `
            <div class="admin-card">
                <div class="admin-card-info">
                    <strong>${b.userName || b.userId || '-'}</strong>
                    <span>${b.treatment || '-'} — ${b.date || '-'}</span>
                    <span style="opacity:0.6; font-size:0.8rem;">${b.status || 'pending'}</span>
                </div>
                <button class="btn-admin-delete" data-id="${b.id}" data-type="booking">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `).join('');
    } catch {
        container.innerHTML = '<p class="admin-empty">Gagal memuat booking.</p>';
    }

    container.addEventListener('click', async (e) => {
        const btn = e.target.closest('.btn-admin-delete');
        if (btn && btn.dataset.type === 'booking') {
            if (confirm('Hapus booking ini?')) {
                await deleteBooking(btn.dataset.id);
                loadBookings();
            }
        }
    });
};

const loadTreatments = async () => {
    const container = document.getElementById('tab-treatments');
    try {
        const treatments = await getTreatments();
        const list = treatments.length
            ? treatments.map(t => `
                <div class="admin-card">
                    <div class="admin-card-info">
                        <strong>${t.name || '-'}</strong>
                        <span>${t.description || ''}</span>
                        <span style="color:var(--gold)">Rp ${Number(t.price || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <button class="btn-admin-delete" data-id="${t.id}" data-type="treatment">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `).join('')
            : '<p class="admin-empty">Belum ada treatment.</p>';

        container.innerHTML = `
            <button class="btn-admin-add" id="btn-add-treatment">+ Tambah Treatment</button>
            ${list}
        `;
    } catch {
        container.innerHTML = '<button class="btn-admin-add" id="btn-add-treatment">+ Tambah Treatment</button><p class="admin-empty">Gagal memuat treatment.</p>';
    }

    document.getElementById('btn-add-treatment')?.addEventListener('click', () => showTreatmentForm());

    container.addEventListener('click', async (e) => {
        const btn = e.target.closest('.btn-admin-delete');
        if (btn && btn.dataset.type === 'treatment') {
            if (confirm('Hapus treatment ini?')) {
                await removeTreatment(btn.dataset.id);
                loadTreatments();
            }
        }
    });
};

const loadProducts = async () => {
    const container = document.getElementById('tab-products');
    try {
        const products = await getProducts();
        const list = products.length
            ? products.map(p => `
                <div class="admin-card">
                    <div class="admin-card-info">
                        <strong>${p.name || '-'}</strong>
                        <span>${p.description || ''}</span>
                        <span style="color:var(--gold)">Rp ${Number(p.price || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <button class="btn-admin-delete" data-id="${p.id}" data-type="product">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `).join('')
            : '<p class="admin-empty">Belum ada produk.</p>';

        container.innerHTML = `
            <button class="btn-admin-add" id="btn-add-product">+ Tambah Produk</button>
            ${list}
        `;
    } catch {
        container.innerHTML = '<button class="btn-admin-add" id="btn-add-product">+ Tambah Produk</button><p class="admin-empty">Gagal memuat produk.</p>';
    }

    document.getElementById('btn-add-product')?.addEventListener('click', () => showProductForm());

    container.addEventListener('click', async (e) => {
        const btn = e.target.closest('.btn-admin-delete');
        if (btn && btn.dataset.type === 'product') {
            if (confirm('Hapus produk ini?')) {
                await deleteProduct(btn.dataset.id);
                loadProducts();
            }
        }
    });
};

const showTreatmentForm = () => {
    const name = prompt('Nama Treatment:');
    if (!name) return;
    const description = prompt('Deskripsi:') || '';
    const price = prompt('Harga (angka):') || '0';
    addTreatment({ name, description, price: Number(price) }).then(() => loadTreatments());
};

const showProductForm = () => {
    const name = prompt('Nama Produk:');
    if (!name) return;
    const description = prompt('Deskripsi:') || '';
    const price = prompt('Harga (angka):') || '0';
    addProduct({ name, description, price: Number(price) }).then(() => loadProducts());
};
