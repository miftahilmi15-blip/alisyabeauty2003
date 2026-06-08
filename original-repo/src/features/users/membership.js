/**
 * Membership Manager
 * Mengelola status keanggotaan dan poin pelanggan
 */

import { getFirestore, doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { showToast } from "../../components/toast.js";

const db = getFirestore();

// 1. Mengambil data membership user
export const getUserMembership = async (userId) => {
    try {
        const userRef = doc(db, "users", userId);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
            return docSnap.data().membership || { level: 'Bronze', points: 0 };
        }
        return null;
    } catch (error) {
        console.error("Error fetching membership:", error);
        return null;
    }
};

// 2. Menambah poin setelah transaksi sukses
export const addPoints = async (userId, amount) => {
    try {
        const userRef = doc(db, "users", userId);
        // Menambah poin secara atomik di database
        await updateDoc(userRef, {
            "membership.points": increment(amount)
        });
        showToast(`Selamat! Anda mendapatkan ${amount} poin.`);
    } catch (error) {
        console.error("Error updating points:", error);
    }
};

// 3. Upgrade level member (Logika sederhana)
export const checkUpgradeLevel = (currentPoints) => {
    if (currentPoints > 1000) return 'Gold';
    if (currentPoints > 500) return 'Silver';
    return 'Bronze';
};
