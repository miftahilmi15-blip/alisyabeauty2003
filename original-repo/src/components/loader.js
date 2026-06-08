// src/components/loader.js

const loader = document.getElementById('loading-screen');

export const showLoader = () => {
    if (loader) {
        loader.classList.remove('hidden');
        loader.style.display = 'flex';
    }
};

export const hideLoader = () => {
    if (loader) {
        loader.classList.add('hidden');
        loader.style.display = 'none';
    }
};
