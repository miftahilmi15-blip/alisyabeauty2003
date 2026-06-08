/**
 * Schedule Service
 * Menangani komunikasi data reservasi/jadwal dengan Firestore
 */

import { 
    getFirestore, 
    collection, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    orderBy, 
    where 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();
const COLLECTION = "schedules";

// 1. Membuat reservasi baru oleh user
export const createSchedule = async (scheduleData) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION), {
            ...scheduleData,
            status: 'pending', // Default status saat baru booking
            createdAt: new Date()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating schedule:", error);
        throw error;
    }
};

// 2. Mengambil semua jadwal (untuk Admin)
export const fetchAllSchedules = async () => {
    try {
        const q = query(collection(db, COLLECTION), orderBy("date", "asc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching schedules:", error);
        throw error;
    }
};

// 3. Update status jadwal (misal: 'pending' ke 'confirmed')
export const updateScheduleStatus = async (id, status) => {
    try {
        const scheduleRef = doc(db, COLLECTION, id);
        await updateDoc(scheduleRef, { status: status });
    } catch (error) {
        console.error("Error updating status:", error);
        throw error;
    }
};

// 4. Membatalkan reservasi
export const deleteSchedule = async (id) => {
    try {
        await deleteDoc(doc(db, COLLECTION, id));
    } catch (error) {
        console.error("Error deleting schedule:", error);
        throw error;
    }
};
