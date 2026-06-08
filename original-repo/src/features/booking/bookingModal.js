// src/features/booking/bookingModal.js

export const openBookingModal = (bookingId) => {
    const modal = document.getElementById('booking-modal');
    if (!modal) return; // Proteksi agar tidak error kalau modal belum di-render
    
    const modalBody = modal.querySelector('.modal-body');
    
    modalBody.innerHTML = `
        <h3>Detail Booking</h3>
        <p>ID: ${bookingId}</p>
    `;
    
    modal.style.display = 'block';
};

export const closeBookingModal = () => {
    const modal = document.getElementById('booking-modal');
    if (modal) modal.style.display = 'none';
};

// --- TAMBAHAN PENTING ---
// Daftarkan ke window agar bisa dipanggil dari atribut onclick di HTML
window.openBookingModal = openBookingModal;
window.closeBookingModal = closeBookingModal;
