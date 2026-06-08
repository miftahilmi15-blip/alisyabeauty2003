import { initRouter, navigateTo } from "../router/router.js";
import { initializeAuth } from "../features/auth/authService.js";
import { initNavbar } from "../components/navbar.js";

const initApp = () => {
    console.log("Aplikasi sedang dimuat...");
    try {
        initNavbar();
        initializeAuth();
        initRouter();
        navigateTo('home-page');
    } catch (error) {
        console.error("Initialization error:", error);
    }
};

document.addEventListener('DOMContentLoaded', initApp);
