/**
 * Global Toast Component
 * Digunakan untuk menampilkan notifikasi singkat ke user.
 */

export const showToast = (message, duration = 3000) => {
    // 1. Cek atau buat container toast
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // 2. Buat elemen toast baru
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    // 3. Masukkan ke container
    container.appendChild(toast);

    // 4. Hapus otomatis setelah durasi habis
    setTimeout(() => {
        toast.remove();
    }, duration);
};
