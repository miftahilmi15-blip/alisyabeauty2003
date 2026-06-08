/**
 * Product Grid Component
 * Mengelola kontainer grid dan merender daftar produk
 */

import { createProductCard } from "./productCard.js";

export const renderProductGrid = (containerElement, products) => {
    // 1. Bersihkan kontainer
    containerElement.innerHTML = '';

    // 2. Buat wrapper grid
    const grid = document.createElement('div');
    grid.className = 'product-grid';

    // 3. Loop data dan masukkan kartu ke dalam grid
    products.forEach(product => {
        const card = createProductCard(product);
        grid.appendChild(card);
    });

    // 4. Masukkan grid ke dalam container utama
    containerElement.appendChild(grid);
};
