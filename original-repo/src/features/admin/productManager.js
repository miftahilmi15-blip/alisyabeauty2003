/**
 * Product Manager
 * Mengelola operasi CRUD (Create, Read, Update, Delete) untuk Produk/Layanan
 */

import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { showToast } from "../../components/toast.js";

const db = getFirestore();
const PRODUCTS_COLLECTION = "products";

// 1. Mengambil semua daftar produk
export const getProducts = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        showToast("Gagal memuat produk.");
        console.error(error);
        return [];
    }
};

// 2. Menambah produk baru (Fitur Admin)
export const addProduct = async (productData) => {
    try {
        await addDoc(collection(db, PRODUCTS_COLLECTION), {
            ...productData,
            createdAt: new Date()
        });
        showToast("Produk berhasil ditambahkan.");
    } catch (error) {
        showToast("Gagal menambah produk.");
        console.error(error);
    }
};

// 3. Menghapus produk
export const deleteProduct = async (productId) => {
    try {
        await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
        showToast("Produk berhasil dihapus.");
    } catch (error) {
        showToast("Gagal menghapus produk.");
    }
};
