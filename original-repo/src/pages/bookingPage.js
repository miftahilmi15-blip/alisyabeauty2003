import { auth, db } from "../config/firebase.js";
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getTreatments } from "../features/admin/treatmentManager.js";
import { showToast } from "../components/toast.js";

export const renderBookingPage = async () => {
    const page = document.getElementById('booking-page');
    if (!page) return;

    let treatments = [];
    try { treatments = await getTreatments(); } catch (e) { console.error('getTreatments error:', e); }

    const treatmentOptions = treatments.length
        ? treatments.map(t => `<option value="${t.name}">${t.name} — Rp ${Number(t.price || 0).toLocaleString('id-ID')}</option>`).join('')
        : '<option value="">Belum ada layanan</option>';

    const today = new Date().toISOString().split('T')[0];

    page.innerHTML = `
        <div class="page-container">
            <h2 class="page-title"><i class="fa-solid fa-calendar-check"></i> Booking</h2>
            <div id="booking-list-section">
                <h3 class="section-subtitle">Booking Saya</h3>
                <div id="my-bookings"><div class="page-loading"><div class="spinner-sm"></div></div></div>
            </div>
            <div class="booking-form-card">
                <h3 class="section-subtitle">Buat Booking Baru</h3>
                <form id="booking-form">
                    <div class="form-group">
                        <label>Layanan</label>
                        <select id="booking-treatment" required>
                            <option value="">-- Pilih Layanan --</option>
                            ${treatmentOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Tanggal</label>
                        <input type="date" id="booking-date" min="${today}" required>
                    </div>
                    <div class="form-group">
                        <label>Waktu</label>
                        <select id="booking-time" required>
                            <option value="">-- Pilih Waktu --</option>
                            <option>08:00</option><option>09:00</option><option>10:00</option>
                            <option>11:00</option><option>13:00</option><option>14:00</option>
                            <option>15:00</option><option>16:00</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Catatan (opsional)</label>
                        <textarea id="booking-notes" rows="3" placeholder="Tulis catatan khusus..."></textarea>
                    </div>
                    <button type="submit" class="btn-submit" id="btn-submit-booking">
                        <i class="fa-solid fa-paper-plane"></i> Kirim Booking
                    </button>
                </form>
            </div>
        </div>
    `;

    loadMyBookings();

    document.getElementById('booking-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) { showToast('Silakan login terlebih dahulu.'); return; }

        const btn = document.getElementById('btn-submit-booking');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...';

        const treatment = document.getElementById('booking-treatment').value;
        const date = document.getElementById('booking-date').value;
        const time = document.getElementById('booking-time').value;
        const notes = document.getElementById('booking-notes').value;

        try {
            await addDoc(collection(db, 'bookings'), {
                userId: user.uid,
                userName: user.displayName,
                userEmail: user.email,
                treatment, date, time, notes,
                status: 'pending',
                createdAt: new Date()
            });
            showToast('✅ Booking berhasil dikirim!');
            document.getElementById('booking-form').reset();
            loadMyBookings();
        } catch (err) {
            showToast('❌ Gagal booking. Coba lagi.');
            console.error('Booking error:', err);
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Kirim Booking';
        }
    });
};

const loadMyBookings = async () => {
    const container = document.getElementById('my-bookings');
    if (!container) return;
    const user = auth.currentUser;
    if (!user) return;

    try {
        const q = query(
            collection(db, 'bookings'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        if (snap.empty) {
            container.innerHTML = '<p class="page-empty">Belum ada booking.</p>';
            return;
        }
        const statusColor = { pending: '#f0a500', confirmed: '#4caf50', done: '#aaa', cancelled: '#f44336' };
        container.innerHTML = snap.docs.map(d => {
            const b = d.data();
            const color = statusColor[b.status] || '#aaa';
            return `
                <div class="booking-card">
                    <div class="booking-card-info">
                        <strong>${b.treatment}</strong>
                        <span>${b.date} · ${b.time}</span>
                        ${b.notes ? `<span style="opacity:0.6">${b.notes}</span>` : ''}
                    </div>
                    <span class="booking-status" style="color:${color};border-color:${color}">${b.status}</span>
                </div>
            `;
        }).join('');
    } catch (err) {
        container.innerHTML = '<p class="page-empty">Gagal memuat booking.</p>';
        console.error('loadMyBookings error:', err);
    }
};
