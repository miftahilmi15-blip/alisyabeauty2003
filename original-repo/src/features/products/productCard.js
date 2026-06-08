/**
 * Product Card Component
 * Mengubah data produk menjadi elemen HTML kartu yang cantik
 */

export const createProductCard = (product) => {
    // Memastikan harga diformat dengan benar (Rp)
    const formattedPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(product.price || 0);

    // Membuat elemen div
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.imageUrl || 'assets/logo/default-product.png'}" alt="${product.name}">
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <p class="price">${formattedPrice}</p>
            <button class="btn-detail" data-id="${product.id}">Lihat Detail</button>
        </div>
    `;

    return card;
};
