export const navigateTo = (pageId) => {
    document.querySelectorAll('.spa-page').forEach(page => {
        page.style.display = 'none';
        page.classList.remove('active');
    });
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.style.display = 'block';
        targetPage.classList.add('active');
        window.history.pushState({ page: pageId }, '', `#${pageId}`);
    }
};

export const initRouter = () => {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-page');
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            navigateTo(target + '-page');
        });
    });

    window.addEventListener('popstate', (e) => {
        if (e.state?.page) navigateTo(e.state.page);
    });
};
