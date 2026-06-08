export const renderGalleryPage = () => {
    const page = document.getElementById('gallery-page');
    if (!page) return;

    page.innerHTML = `
        <div class="page-container">
            <h2 class="page-title"><i class="fa-solid fa-images"></i> Gallery</h2>
            <div class="gallery-grid">
                ${Array.from({length: 6}, (_, i) => `
                    <div class="gallery-item">
                        <div class="gallery-placeholder">
                            <i class="fa-solid fa-image"></i>
                            <span>Foto ${i + 1}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            <p class="gallery-note">
                <i class="fa-brands fa-instagram"></i> 
                Follow Instagram kami untuk melihat foto & promo terbaru!
            </p>
        </div>
    `;
};
