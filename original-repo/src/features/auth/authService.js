import { auth } from "../../config/firebase.js";
import {
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { initAdminDashboard } from "../admin/adminDashboard.js";
import { renderHomePage } from "../../pages/homePage.js";
import { renderShopPage } from "../../pages/shopPage.js";
import { renderBookingPage } from "../../pages/bookingPage.js";
import { renderGalleryPage } from "../../pages/galleryPage.js";
import { renderProfilePage } from "../../pages/profilePage.js";

const provider = new GoogleAuthProvider();

let appInitialized = false;

export const showApp = (user) => {
    document.getElementById('loading-screen')?.style.setProperty('display', 'none', 'important');
    document.getElementById('login-overlay')?.classList.add('hidden');

    const appContainer = document.getElementById('app-container');
    if (appContainer) {
        appContainer.classList.remove('hidden');
        appContainer.style.display = 'block';
    }

    const navbar = document.querySelector('.navbar');
    if (navbar) { navbar.classList.remove('hidden'); navbar.style.display = 'flex'; }

    const bottomNav = document.getElementById('bottom-nav');
    if (bottomNav) { bottomNav.classList.remove('hidden'); bottomNav.style.display = 'flex'; }

    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('hidden');

    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    if (userAvatar) userAvatar.src = user.photoURL || 'assets/logo/default-avatar.png';
    if (userName) userName.textContent = user.displayName || 'User';
    if (userEmail) userEmail.textContent = user.email;
};

const showLogin = () => {
    document.getElementById('loading-screen')?.style.setProperty('display', 'none', 'important');
    const overlay = document.getElementById('login-overlay');
    if (overlay) { overlay.classList.remove('hidden'); overlay.style.display = 'flex'; }
    document.getElementById('app-container')?.classList.add('hidden');
    document.querySelector('.navbar')?.classList.add('hidden');
    document.getElementById('bottom-nav')?.classList.add('hidden');
};

const renderAllPages = async (user) => {
    if (appInitialized) return;
    appInitialized = true;

    const tasks = [
        renderHomePage(user).catch(e => console.error('homePage:', e)),
        Promise.resolve(renderGalleryPage()).catch(e => console.error('galleryPage:', e)),
        renderShopPage().catch(e => console.error('shopPage:', e)),
        renderBookingPage().catch(e => console.error('bookingPage:', e)),
        renderProfilePage(user).catch(e => console.error('profilePage:', e)),
    ];
    await Promise.allSettled(tasks);
    try { initAdminDashboard(user); } catch (e) { console.error('adminDashboard:', e); }
};

export const initializeAuth = () => {
    const loginBtn = document.getElementById('btnLogin');
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Masuk...';
            try {
                const result = await signInWithPopup(auth, provider);
                console.log('Login success:', result.user.email);
                showApp(result.user);
                await renderAllPages(result.user);
            } catch (error) {
                console.error('Login error:', error.code, error.message);
                alert('Gagal login: ' + error.code);
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<i class="fa-brands fa-google"></i> Login dengan Google';
            }
        });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try { await signOut(auth); window.location.reload(); }
            catch (error) { console.error('Logout error:', error); }
        });
    }

    onAuthStateChanged(auth, async (user) => {
        console.log('Auth state changed:', user ? user.email : 'signed out');
        if (user) {
            showApp(user);
            await renderAllPages(user);
        } else {
            showLogin();
        }
    });
};
