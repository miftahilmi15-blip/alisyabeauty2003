// src/features/booking/bookingForm.js
import { saveBooking } from "./bookingService.js";

export const handleBookingSubmit = async (formData) => {
    try {
        await saveBooking(formData);
        alert("Booking berhasil!");
    } catch (error) {
        console.error("Error:", error);
    }
};
