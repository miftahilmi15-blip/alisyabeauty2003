/**
 * Product Service
 * Menangani komunikasi langsung dengan Firebase Firestore
 */

import { 
    getFirestore, 
    collection, 
    getDocs, 
    doc, 
    getDoc, 
    query, 
    where 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();
const COLLECTION = "products";

// 1. Mengambil semua produk
export const fetchAllProducts = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, COLLECTION));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching all products:", error);
        throw error;
    }
};

// 2. Mengambil produk berdasarkan kategori (misal: 'hair', 'face')
export const fetchProductsByCategory = async (category) => {
    try {
        const q = query(collection(db, COLLECTION), where("category", "==", category));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching products by category:", error);
        throw error;
    }
};

// 3. Mengambil detail produk tunggal berdasarkan ID
export const fetchProductById = async (productId) => {
    try {
        const docRef = doc(db, COLLECTION, productId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        throw error;
    }
};
