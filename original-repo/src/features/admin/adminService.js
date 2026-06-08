import { db } from "../../services/database.js";
import {
    collection,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { auth } from "../../config/firebase.js";

const ADMIN_EMAIL = "miftahilmi15@gmail.com";

const isAdmin = () => {
    const user = auth.currentUser;
    return user && user.email === ADMIN_EMAIL;
};

export const getAllBookings = async () => {
    const querySnapshot = await getDocs(collection(db, "bookings"));
    return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const deleteBooking = async (bookingId) => {
    if (!isAdmin()) throw new Error("Akses ditolak.");
    await deleteDoc(doc(db, "bookings", bookingId));
    return true;
};
