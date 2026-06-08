// src/components/bottomNav.js

export const initBottomNav = () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.spa-page');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // 1. Hapus class 'active' dari semua link dan sembunyikan semua halaman
            navLinks.forEach(item => item.classList.remove('active'));
            pages.forEach(page => page.classList.remove('active'));

            // 2. Tambahkan class 'active' ke link yang diklik
            link.classList.add('active');

            // 3. Tampilkan halaman yang sesuai
            const pageId = link.getAttribute('data-page');
            const targetPage = document.getElementById(`${pageId}-page`);
            
            if (targetPage) {
                targetPage.classList.add('active');
            }
        });
    });
};
