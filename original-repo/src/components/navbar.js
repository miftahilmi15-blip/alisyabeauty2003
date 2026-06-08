/**
 * Navbar Component
 * Mengelola interaksi tombol menu dan status sticky
 */

export const initNavbar = () => {
    const sidebar = document.getElementById('sidebar');
    const sidebarTrigger = document.getElementById('sidebar-trigger');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');
    const closeSidebarBtn = document.getElementById('close-sidebar');

    const toggleSidebar = (isOpen) => {
        if (sidebar) sidebar.classList.toggle('active', isOpen);
        if (sidebarBackdrop) sidebarBackdrop.classList.toggle('active', isOpen);
    };

    if (sidebarTrigger) {
        sidebarTrigger.addEventListener('click', () => toggleSidebar(true));
    }
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', () => toggleSidebar(false));
    }
    if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener('click', () => toggleSidebar(false));
    }
};

export const handleNavbarScroll = () => {
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            if (navbar) navbar.style.background = 'rgba(0,0,0,0.8)';
            if (navbar) navbar.style.backdropFilter = 'blur(10px)';
        } else {
            if (navbar) navbar.style.background = 'rgba(0,0,0,0.3)';
            if (navbar) navbar.style.backdropFilter = 'none';
        }
    });
};
