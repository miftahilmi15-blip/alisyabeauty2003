/**
 * Treatment Card Component
 * Kartu visual untuk menampilkan detail layanan dengan tombol aksi
 */

export const createTreatmentCard = (treatment) => {
    const card = document.createElement('div');
    card.className = 'treatment-card';
    
    // Format harga ke Rupiah
    const priceFormatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(treatment.price);

    card.innerHTML = `
        <div class="treatment-image">
            <img src="${treatment.imageUrl || 'assets/images/placeholder-service.jpg'}" alt="${treatment.name}">
        </div>
        <div class="treatment-info">
            <h3>${treatment.name}</h3>
            <p class="duration"><i class="icon-clock"></i> ${treatment.duration} menit</p>
            <p class="price">${priceFormatted}</p>
        </div>
        <div class="treatment-footer">
            <button class="btn-book" data-id="${treatment.id}">Booking</button>
        </div>
    `;

    return card;
};
