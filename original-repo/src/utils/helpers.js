/**
 * Helpers Utility
 * Fungsi bantu umum untuk logika operasional aplikasi
 */

// 1. Memeriksa apakah sebuah object kosong
export const isEmpty = (obj) => {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
};

// 2. Generate ID unik sederhana (untuk keperluan demo atau testing)
export const generateId = () => {
    return '_' + Math.random().toString(36).substr(2, 9);
};

// 3. Debounce (untuk menunda eksekusi fungsi, misal saat user mengetik di search bar)
export const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
};

// 4. Salin teks ke clipboard
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        return false;
    }
};
