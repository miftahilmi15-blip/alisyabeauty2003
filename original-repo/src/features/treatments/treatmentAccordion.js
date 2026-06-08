/**
 * Treatment Accordion Component
 * Membuat daftar layanan yang bisa dilipat (expand/collapse)
 */

export const createTreatmentAccordion = (treatment) => {
    const accordion = document.createElement('div');
    accordion.className = 'accordion-item';
    
    accordion.innerHTML = `
        <div class="accordion-header" style="cursor: pointer; display: flex; justify-content: space-between; padding: 15px; background: #222; border-radius: 8px;">
            <span>${treatment.name}</span>
            <span>▼</span>
        </div>
        <div class="accordion-content" style="display: none; padding: 15px; border: 1px solid #333; border-top: none; border-radius: 0 0 8px 8px;">
            <p><strong>Durasi:</strong> ${treatment.duration} menit</p>
            <p><strong>Harga:</strong> Rp ${treatment.price.toLocaleString()}</p>
            <p>${treatment.description || 'Layanan perawatan premium untuk Anda.'}</p>
            <button class="btn-book" style="margin-top: 10px;">Booking Sekarang</button>
        </div>
    `;

    // Event Listener untuk expand/collapse
    const header = accordion.querySelector('.accordion-header');
    const content = accordion.querySelector('.accordion-content');

    header.addEventListener('click', () => {
        const isOpen = content.style.display === 'block';
        content.style.display = isOpen ? 'none' : 'block';
        header.querySelector('span:last-child').textContent = isOpen ? '▼' : '▲';
    });

    return accordion;
};
