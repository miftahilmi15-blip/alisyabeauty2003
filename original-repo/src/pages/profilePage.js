import { auth, db } from "../config/firebase.js";
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { showToast } from "../components/toast.js";

const ADMIN_EMAIL = 'miftahilmi15@gmail.com';

const levelConfig = {
    Bronze:   { color: '#cd7f32', next: 'Silver',   nextPts: 500,  icon: '🥉' },
    Silver:   { color: '#aaaaaa', next: 'Gold',     nextPts: 1500, icon: '🥈' },
    Gold:     { color: '#d4af37', next: 'Platinum', nextPts: 3000, icon: '🥇' },
    Platinum: { color: '#e5e4e2', next: null,       nextPts: null, icon: '💎' },
};

export const renderProfilePage = async (user) => {
    const page = document.getElementById('profile-page');
    if (!page) return;

    page.innerHTML = `
        <div class="profile-page-wrapper">
            <div class="profile-loading-state">
                <div class="spinner-sm"></div>
                <span>Memuat profil...</span>
            </div>
        </div>`;

    try {
        const [userData, bookingStats] = await Promise.all([
            fetchUserData(user),
            fetchBookingStats(user.uid),
        ]);
        renderProfileContent(page, user, userData, bookingStats);
    } catch (err) {
        console.error('renderProfilePage error:', err);
        page.innerHTML = `<div class="page-container"><p class="page-empty">Gagal memuat profil.</p></div>`;
    }
};

const fetchUserData = async (user) => {
    try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) return snap.data();
        const defaultData = {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            level: 'Bronze',
            points: 0,
            whatsapp: '',
            createdAt: new Date(),
        };
        await setDoc(ref, defaultData);
        return defaultData;
    } catch { return { level: 'Bronze', points: 0 }; }
};

const fetchBookingStats = async (uid) => {
    try {
        const q = query(collection(db, 'bookings'), where('userId', '==', uid));
        const snap = await getDocs(q);
        let total = 0, done = 0, active = 0;
        snap.forEach(d => {
            total++;
            if (d.data().status === 'done') done++;
            if (['pending','confirmed'].includes(d.data().status)) active++;
        });
        return { total, done, active };
    } catch { return { total: 0, done: 0, active: 0 }; }
};

const renderProfileContent = (page, user, userData, bookingStats) => {
    const level = userData.level || 'Bronze';
    const points = userData.points || 0;
    const cfg = levelConfig[level] || levelConfig.Bronze;
    const isAdmin = user.email === ADMIN_EMAIL;

    let progress = 0;
    let progressLabel = '';
    if (cfg.next && cfg.nextPts) {
        const prevPts = level === 'Bronze' ? 0 : level === 'Silver' ? 500 : 1500;
        progress = Math.min(100, Math.round(((points - prevPts) / (cfg.nextPts - prevPts)) * 100));
        if (progress < 0) progress = 0;
        progressLabel = `${cfg.nextPts - points > 0 ? cfg.nextPts - points : 0} poin lagi ke ${cfg.next}`;
    } else {
        progress = 100;
        progressLabel = 'Level Tertinggi!';
    }

    page.innerHTML = `
    <div class="profile-page-wrapper">

        <!-- HEADER -->
        <div class="profile-header">
            <div class="profile-avatar-wrap">
                <img src="${user.photoURL || 'assets/logo/default-avatar.png'}" 
                     alt="Avatar" class="profile-avatar"
                     onerror="this.src='assets/logo/default-avatar.png'">
                <div class="profile-avatar-ring" style="border-color:${cfg.color}"></div>
            </div>
            <div class="profile-header-info">
                <h2 class="profile-name">${user.displayName || 'User'}</h2>
                <p class="profile-email">${user.email}</p>
                ${isAdmin ? '<span class="profile-admin-badge"><i class="fa-solid fa-shield-halved"></i> Admin</span>' : ''}
            </div>
        </div>

        <!-- MEMBERSHIP CARD -->
        <div class="membership-card" style="--member-color:${cfg.color}">
            <div class="membership-card-bg"></div>
            <div class="membership-card-content">
                <div class="membership-card-top">
                    <div>
                        <div class="membership-card-label">Member Level</div>
                        <div class="membership-card-level" style="color:${cfg.color}">${cfg.icon} ${level}</div>
                    </div>
                    <div class="membership-points-box">
                        <div class="membership-card-label">Total Poin</div>
                        <div class="membership-points-val" style="color:${cfg.color}">${points.toLocaleString('id-ID')}</div>
                    </div>
                </div>
                <div class="membership-card-mid">
                    <div class="membership-stat">
                        <span class="membership-stat-val">${bookingStats.total}</span>
                        <span class="membership-stat-lbl">Total Booking</span>
                    </div>
                    <div class="membership-stat-divider"></div>
                    <div class="membership-stat">
                        <span class="membership-stat-val">${bookingStats.done}</span>
                        <span class="membership-stat-lbl">Selesai</span>
                    </div>
                    <div class="membership-stat-divider"></div>
                    <div class="membership-stat">
                        <span class="membership-stat-val">${bookingStats.active}</span>
                        <span class="membership-stat-lbl">Aktif</span>
                    </div>
                </div>
                <div class="membership-progress-wrap">
                    <div class="membership-progress-bar">
                        <div class="membership-progress-fill" style="width:${progress}%;background:${cfg.color}"></div>
                    </div>
                    <div class="membership-progress-label">${progressLabel}</div>
                </div>
            </div>
            <div class="membership-card-logo">
                <img src="assets/logo/logo.png" alt="" onerror="this.style.display='none'">
            </div>
        </div>

        <!-- STATISTIK -->
        <div class="profile-section">
            <div class="profile-section-title"><i class="fa-solid fa-chart-simple"></i> Statistik</div>
            <div class="stats-grid">
                <div class="stat-card">
                    <i class="fa-solid fa-calendar-check" style="color:var(--gold)"></i>
                    <div class="stat-val">${bookingStats.total}</div>
                    <div class="stat-lbl">Total Booking</div>
                </div>
                <div class="stat-card">
                    <i class="fa-solid fa-circle-check" style="color:#4caf50"></i>
                    <div class="stat-val">${bookingStats.done}</div>
                    <div class="stat-lbl">Selesai</div>
                </div>
                <div class="stat-card">
                    <i class="fa-solid fa-clock" style="color:#f0a500"></i>
                    <div class="stat-val">${bookingStats.active}</div>
                    <div class="stat-lbl">Aktif</div>
                </div>
                <div class="stat-card">
                    <i class="fa-solid fa-star" style="color:${cfg.color}"></i>
                    <div class="stat-val">${points}</div>
                    <div class="stat-lbl">Poin</div>
                </div>
            </div>
        </div>

        <!-- VOUCHER & PROMO -->
        <div class="profile-section">
            <div class="profile-section-title"><i class="fa-solid fa-ticket"></i> Voucher & Promo</div>
            <div id="voucher-list">
                <div class="voucher-card promo-default">
                    <div class="voucher-icon"><i class="fa-solid fa-gift"></i></div>
                    <div class="voucher-info">
                        <div class="voucher-name">Selamat Datang Member Baru!</div>
                        <div class="voucher-desc">Diskon 10% untuk booking pertamamu</div>
                        <div class="voucher-expire">Berlaku hingga: 31 Des 2026</div>
                    </div>
                    <div class="voucher-badge">10%</div>
                </div>
                ${level === 'Gold' || level === 'Platinum' ? `
                <div class="voucher-card">
                    <div class="voucher-icon" style="color:#d4af37"><i class="fa-solid fa-crown"></i></div>
                    <div class="voucher-info">
                        <div class="voucher-name">Privilege ${level}</div>
                        <div class="voucher-desc">Diskon 15% khusus member ${level}</div>
                        <div class="voucher-expire">Berlaku: setiap booking</div>
                    </div>
                    <div class="voucher-badge" style="background:rgba(212,175,55,0.15);color:#d4af37;border-color:#d4af37">15%</div>
                </div>` : ''}
            </div>
        </div>

        <!-- FAVORIT TREATMENT -->
        <div class="profile-section">
            <div class="profile-section-title"><i class="fa-solid fa-heart"></i> Favorit Treatment</div>
            <div id="fav-treatments">
                <div class="fav-item">
                    <div class="fav-icon"><i class="fa-solid fa-spa"></i></div>
                    <div class="fav-info">
                        <div class="fav-name">Lakukan booking untuk mulai melacak favorit</div>
                        <div class="fav-count">0 kali</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- REWARD & POIN -->
        <div class="profile-section">
            <div class="profile-section-title"><i class="fa-solid fa-gem"></i> Reward & Poin</div>
            <div class="reward-card">
                <div class="reward-balance">
                    <div class="reward-balance-label">Poin Kamu</div>
                    <div class="reward-balance-val" style="color:${cfg.color}">${points.toLocaleString('id-ID')} <span>poin</span></div>
                </div>
                <div class="reward-info-list">
                    <div class="reward-info-item">
                        <i class="fa-solid fa-circle-plus" style="color:#4caf50"></i>
                        <span>Setiap booking = +10 poin</span>
                    </div>
                    <div class="reward-info-item">
                        <i class="fa-solid fa-circle-plus" style="color:#4caf50"></i>
                        <span>Booking selesai = +25 poin bonus</span>
                    </div>
                    <div class="reward-info-item">
                        <i class="fa-solid fa-circle-minus" style="color:#e8a7a1"></i>
                        <span>100 poin = Rp 10.000 diskon</span>
                    </div>
                </div>
                <button class="btn-redeem" id="btn-redeem-points" ${points < 100 ? 'disabled' : ''}>
                    <i class="fa-solid fa-arrow-right-arrow-left"></i>
                    ${points < 100 ? 'Kumpulkan 100 poin untuk menukar' : 'Tukar Poin Sekarang'}
                </button>
            </div>
        </div>

        <!-- PENGATURAN AKUN -->
        <div class="profile-section">
            <div class="profile-section-title"><i class="fa-solid fa-gear"></i> Pengaturan Akun</div>
            <div class="settings-list">
                <div class="settings-item" id="setting-whatsapp">
                    <div class="settings-item-left">
                        <i class="fa-brands fa-whatsapp" style="color:#25d366"></i>
                        <div>
                            <div class="settings-item-label">Nomor WhatsApp</div>
                            <div class="settings-item-value" id="wa-display">${userData.whatsapp || 'Belum diisi'}</div>
                        </div>
                    </div>
                    <i class="fa-solid fa-chevron-right settings-chevron"></i>
                </div>
                <div class="settings-item">
                    <div class="settings-item-left">
                        <i class="fa-solid fa-bell" style="color:var(--gold)"></i>
                        <div>
                            <div class="settings-item-label">Notifikasi Booking</div>
                            <div class="settings-item-value">Aktif</div>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" checked>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="settings-item" id="setting-privacy">
                    <div class="settings-item-left">
                        <i class="fa-solid fa-shield" style="color:#aaa"></i>
                        <div>
                            <div class="settings-item-label">Kebijakan Privasi</div>
                            <div class="settings-item-value">Lihat kebijakan</div>
                        </div>
                    </div>
                    <i class="fa-solid fa-chevron-right settings-chevron"></i>
                </div>
                <div class="settings-item" id="setting-help">
                    <div class="settings-item-left">
                        <i class="fa-solid fa-headset" style="color:#e8a7a1"></i>
                        <div>
                            <div class="settings-item-label">Bantuan</div>
                            <div class="settings-item-value">Hubungi kami</div>
                        </div>
                    </div>
                    <i class="fa-solid fa-chevron-right settings-chevron"></i>
                </div>
            </div>
        </div>

        <!-- SOSIAL MEDIA -->
        <div class="profile-section">
            <div class="profile-section-title"><i class="fa-solid fa-share-nodes"></i> Ikuti Kami</div>
            <div class="social-grid">
                <a href="https://instagram.com/" target="_blank" class="social-btn instagram">
                    <i class="fa-brands fa-instagram"></i><span>Instagram</span>
                </a>
                <a href="https://tiktok.com/" target="_blank" class="social-btn tiktok">
                    <i class="fa-brands fa-tiktok"></i><span>TikTok</span>
                </a>
                <a href="https://facebook.com/" target="_blank" class="social-btn facebook">
                    <i class="fa-brands fa-facebook"></i><span>Facebook</span>
                </a>
                <a href="https://wa.me/" target="_blank" class="social-btn whatsapp-btn">
                    <i class="fa-brands fa-whatsapp"></i><span>WhatsApp</span>
                </a>
            </div>
        </div>

        <!-- ADMIN PANEL (khusus admin) -->
        ${isAdmin ? `
        <div class="profile-section">
            <div class="profile-section-title"><i class="fa-solid fa-user-shield" style="color:var(--gold)"></i> Admin</div>
            <button class="btn-admin-panel" id="btn-go-admin">
                <i class="fa-solid fa-gauge-high"></i> Buka Admin Dashboard
                <i class="fa-solid fa-arrow-right" style="margin-left:auto"></i>
            </button>
        </div>` : ''}

        <!-- LOGOUT -->
        <div class="profile-section">
            <button class="btn-logout-profile" id="profile-logout-btn">
                <i class="fa-solid fa-right-from-bracket"></i> Keluar dari Akun
            </button>
        </div>

        <div style="height: 20px;"></div>
    </div>

    <!-- MODAL WHATSAPP -->
    <div id="wa-modal" class="modal-overlay hidden">
        <div class="modal-card">
            <h3 class="modal-title"><i class="fa-brands fa-whatsapp" style="color:#25d366"></i> Ubah Nomor WhatsApp</h3>
            <div class="form-group" style="margin-top:16px">
                <label>Nomor WhatsApp</label>
                <input type="tel" id="wa-input" placeholder="Contoh: 08123456789" value="${userData.whatsapp || ''}">
            </div>
            <div style="display:flex;gap:10px;margin-top:16px">
                <button class="modal-btn-cancel" id="wa-modal-cancel">Batal</button>
                <button class="modal-btn-save" id="wa-modal-save">Simpan</button>
            </div>
        </div>
    </div>
    `;

    attachProfileEvents(user, userData);
};

const attachProfileEvents = (user, userData) => {
    document.getElementById('profile-logout-btn')?.addEventListener('click', async () => {
        if (confirm('Yakin ingin keluar?')) {
            try { await signOut(auth); window.location.reload(); }
            catch (e) { console.error(e); }
        }
    });

    document.getElementById('btn-go-admin')?.addEventListener('click', () => {
        document.querySelectorAll('.spa-page').forEach(p => { p.style.display = 'none'; p.classList.remove('active'); });
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        const adminPage = document.getElementById('admin-page');
        if (adminPage) { adminPage.style.display = 'block'; adminPage.classList.add('active'); }
    });

    document.getElementById('btn-redeem-points')?.addEventListener('click', () => {
        showToast('Fitur penukaran poin segera hadir!');
    });

    document.getElementById('setting-whatsapp')?.addEventListener('click', () => {
        document.getElementById('wa-modal')?.classList.remove('hidden');
    });

    document.getElementById('wa-modal-cancel')?.addEventListener('click', () => {
        document.getElementById('wa-modal')?.classList.add('hidden');
    });

    document.getElementById('wa-modal-save')?.addEventListener('click', async () => {
        const val = document.getElementById('wa-input')?.value?.trim();
        if (!val) return;
        try {
            await updateDoc(doc(db, 'users', user.uid), { whatsapp: val });
            const display = document.getElementById('wa-display');
            if (display) display.textContent = val;
            document.getElementById('wa-modal')?.classList.add('hidden');
            showToast('✅ Nomor WhatsApp disimpan!');
        } catch (e) {
            showToast('Gagal menyimpan.');
            console.error(e);
        }
    });

    document.getElementById('setting-privacy')?.addEventListener('click', () => {
        showToast('Kebijakan Privasi sedang disiapkan.');
    });

    document.getElementById('setting-help')?.addEventListener('click', () => {
        window.open('https://wa.me/', '_blank');
    });
};
