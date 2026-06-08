/**
 * User Service
 * Menangani operasi CRUD untuk data pengguna di Firestore
 */

import { 
    getFirestore, 
    doc, 
    getDoc, 
    updateDoc, 
    setDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();

// 1. Mengambil data profil lengkap user
export const fetchUserProfile = async (userId) => {
    try {
        const userRef = doc(db, "users", userId);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("Error fetching profile:", error);
        throw error;
    }
};

// 2. Mengupdate profil user (nama, foto, dll)
export const updateUserProfile = async (userId, data) => {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, data);
        return true;
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};

// 3. Inisialisasi data user baru saat pertama kali daftar
export const createUserDocument = async (userId, userData) => {
    try {
        const userRef = doc(db, "users", userId);
        await setDoc(userRef, {
            ...userData,
            membership: { level: 'Bronze', points: 0 },
            createdAt: new Date()
        }, { merge: true });
    } catch (error) {
        console.error("Error creating user doc:", error);
        throw error;
    }
};
