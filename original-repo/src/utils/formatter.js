/**
 * Formatter Utility
 * Menangani konversi data mentah menjadi format yang ramah pengguna
 */

// 1. Format mata uang Rupiah
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount || 0);
};

// 2. Format tanggal (Contoh: "Jumat, 5 Juni 2026")
export const formatDate = (dateValue) => {
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

// 3. Format durasi dalam menit
export const formatDuration = (minutes) => {
    return `${minutes} menit`;
};

// 4. Format status (Capitalize string)
export const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
};
