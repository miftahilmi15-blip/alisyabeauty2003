/**
 * Validator Utility
 * Memastikan data memenuhi kriteria sebelum diproses
 */

// 1. Validasi format Email
export const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

// 2. Validasi panjang karakter (misal: password atau nama)
export const isLengthValid = (str, min, max = 255) => {
    return str.length >= min && str.length <= max;
};

// 3. Validasi angka positif (untuk harga atau durasi)
export const isPositiveNumber = (value) => {
    return !isNaN(value) && Number(value) > 0;
};

// 4. Validasi input form tidak kosong
export const isNotEmpty = (value) => {
    return value !== null && value !== undefined && String(value).trim() !== "";
};
