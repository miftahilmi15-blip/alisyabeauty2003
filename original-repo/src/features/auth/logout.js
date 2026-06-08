import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth } from "../../config/firebase.js";

export const logoutUser = async () => {
    try {
        await signOut(auth);
        console.log("User telah logout");
        window.location.reload(); 
    } catch (error) {
        console.error("Gagal logout:", error);
    }
};
