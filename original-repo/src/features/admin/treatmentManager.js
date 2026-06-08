/**
 * Treatment Manager
 * Mengelola data jenis treatment/perawatan di Salon
 */

import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { showToast } from "../../components/toast.js";

const db = getFirestore();
const COLLECTION_NAME = "treatments";

// 1. Mengambil daftar treatment (untuk ditampilkan di Services Page)
export const getTreatments = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching treatments:", error);
        return [];
    }
};

// 2. Menambah treatment baru (Fitur Admin)
export const addTreatment = async (treatmentData) => {
    try {
        await addDoc(collection(db, COLLECTION_NAME), {
            ...treatmentData,
            createdAt: new Date()
        });
        showToast("Treatment berhasil ditambahkan!");
        return true;
    } catch (error) {
        showToast("Gagal menambah treatment.");
        return false;
    }
};

// 3. Update informasi treatment
export const updateTreatment = async (id, updatedData) => {
    try {
        await updateDoc(doc(db, COLLECTION_NAME, id), updatedData);
        showToast("Data berhasil diperbarui.");
    } catch (error) {
        showToast("Gagal memperbarui data.");
    }
};

// 4. Hapus treatment
export const removeTreatment = async (id) => {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
        showToast("Treatment dihapus.");
    } catch (error) {
        showToast("Gagal menghapus treatment.");
    }
};
