/**
 * Global Modal Component
 * Digunakan untuk konfirmasi atau notifikasi penting kepada user.
 */

export const showModal = (title, message, onConfirm) => {
    // 1. Cek apakah modal sudah ada di DOM, jika belum buat elemennya
    let modal = document.getElementById('global-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'global-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h3 id="modal-title" style="color: var(--gold); margin-bottom: 10px;"></h3>
                <p id="modal-message" style="margin-bottom: 20px; line-height: 1.4; color: #ccc;"></p>
                <div style="display: flex; gap: 10px;">
                    <button id="modal-cancel" style="flex:1; padding: 12px; background: #222; border:none; color:white; border-radius:8px; cursor:pointer;">Batal</button>
                    <button id="modal-confirm" style="flex:1; padding: 12px; background: var(--gold); border:none; color:#000; border-radius:8px; font-weight:bold; cursor:pointer;">Ya</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // 2. Referensi elemen di dalam modal
    const titleEl = document.getElementById('modal-title');
    const msgEl = document.getElementById('modal-message');
    const btnCancel = document.getElementById('modal-cancel');
    const btnConfirm = document.getElementById('modal-confirm');

    // 3. Isi konten modal
    titleEl.textContent = title;
    msgEl.textContent = message;

    // 4. Fungsi untuk menutup modal
    const closeModal = () => modal.classList.remove('active');

    // 5. Setup event listener tombol
    btnCancel.onclick = closeModal;
    btnConfirm.onclick = () => {
        if (onConfirm) onConfirm();
        closeModal();
    };

    // 6. Tampilkan modal dengan animasi
    // Gunakan requestAnimationFrame untuk memastikan transisi CSS berjalan
    requestAnimationFrame(() => {
        modal.classList.add('active');
    });
};
