// src/features/booking/bookingList.js
import { fetchBookings } from "./bookingService.js";

export const renderBookingList = async (containerId) => {
    const container = document.getElementById(containerId);
    container.innerHTML = "<p>Memuat data...</p>";

    try {
        const bookings = await fetchBookings(); // Panggil service
        if (bookings.length === 0) {
            container.innerHTML = "<p>Belum ada booking.</p>";
            return;
        }

        let html = '<ul class="booking-list">';
        bookings.forEach(b => {
            html += `
                <li class="booking-item" data-id="${b.id}">
                    <span>${b.name} - ${b.service}</span>
                    <button class="btn-detail" onclick="openBookingModal('${b.id}')">Detail</button>
                </li>
            `;
        });
        html += '</ul>';
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = "<p>Gagal memuat daftar booking.</p>";
        console.error(error);
    }
};
