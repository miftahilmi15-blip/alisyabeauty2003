/**
 * Treatment Service
 * Menangani komunikasi data layanan dengan Firebase Firestore
 */

import { 
    getFirestore, 
    collection, 
    getDocs, 
    doc, 
    getDoc, 
    query, 
    where,
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();
const COLLECTION = "treatments";

// 1. Mengambil semua data layanan
export const fetchAllTreatments = async () => {
    try {
        const q = query(collection(db, COLLECTION), orderBy("name", "asc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching treatments:", error);
        throw error;
    }
};

// 2. Mengambil layanan berdasarkan kategori (misal: 'facial', 'massage')
export const fetchTreatmentsByCategory = async (category) => {
    try {
        const q = query(collection(db, COLLECTION), where("category", "==", category));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching treatments by category:", error);
        throw error;
    }
};

// 3. Mengambil detail satu layanan berdasarkan ID
export const fetchTreatmentById = async (treatmentId) => {
    try {
        const docRef = doc(db, COLLECTION, treatmentId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("Error fetching treatment by ID:", error);
        throw error;
    }
};
