// src/features/booking/bookingService.js
import { db } from "../../services/database.js";
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";

export const saveBooking = async (bookingData) => {
    try {
        const docRef = await addDoc(collection(db, "bookings"), {
            ...bookingData,
            createdAt: new Date() // Tips: selalu simpan waktu buat sort data
        });
        return docRef;
    } catch (error) {
        console.error("Error saving booking: ", error);
        throw error;
    }
};

export const fetchBookings = async () => {
    try {
        // Kita buat query agar data terbaru muncul di atas
        const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        // Kita ubah data dari format Firebase menjadi array objek biasa
        const bookings = [];
        querySnapshot.forEach((doc) => {
            bookings.push({ id: doc.id, ...doc.data() });
        });
        
        return bookings;
    } catch (error) {
        console.error("Error fetching bookings: ", error);
        throw error;
    }
};
