import { loginWithGoogle } from "./authService.js";

export const initLogin = () => {
    const loginBtn = document.getElementById('btnLogin');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            try {
                await loginWithGoogle();
                // Sembunyikan overlay setelah sukses
                document.getElementById('login-overlay').style.display = 'none';
            } catch (error) {
                alert("Gagal login: " + error.message);
            }
        });
    }
};
