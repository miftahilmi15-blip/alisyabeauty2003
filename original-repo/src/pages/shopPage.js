import { getProducts } from "../features/admin/productManager.js";

export const renderShopPage = async () => {
    const page = document.getElementById('shop-page');
    if (!page) return;

    page.innerHTML = `
        <div class="page-container">
            <h2 class="page-title"><i class="fa-solid fa-cart-shopping"></i> Produk</h2>
            <div id="products-grid" class="products-grid"><div class="page-loading"><div class="spinner-sm"></div> Memuat produk...</div></div>
        </div>
    `;

    const container = document.getElementById('products-grid');
    try {
        const products = await getProducts();
        if (!products.length) {
            container.innerHTML = '<p class="page-empty" style="grid-column:1/-1">Belum ada produk tersedia.</p>';
            return;
        }
        container.innerHTML = products.map(p => `
            <div class="product-card">
                <div class="product-img-wrapper">
                    <img src="${p.imageUrl || ''}" alt="${p.name}" onerror="this.parentElement.innerHTML='<div class=\\'product-img-placeholder\\'><i class=\\"fa-solid fa-box-open\\"></i></div>'">
                </div>
                <div class="product-info">
                    <h3>${p.name}</h3>
                    ${p.description ? `<p class="product-desc">${p.description}</p>` : ''}
                    <p class="product-price">Rp ${Number(p.price || 0).toLocaleString('id-ID')}</p>
                </div>
            </div>
        `).join('');
    } catch {
        container.innerHTML = '<p class="page-empty" style="grid-column:1/-1">Gagal memuat produk.</p>';
    }
};
