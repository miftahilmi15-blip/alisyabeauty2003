/**
 * Schedule Card Component
 * Mengubah data jadwal menjadi elemen kartu yang informatif
 */

export const createScheduleCard = (schedule) => {
    // Format tanggal agar lebih mudah dibaca
    const date = new Date(schedule.date).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    const card = document.createElement('div');
    card.className = 'schedule-card';
    card.innerHTML = `
        <div class="schedule-header">
            <span class="status-badge ${schedule.status}">${schedule.status}</span>
            <span class="date">${date}</span>
        </div>
        <div class="schedule-body">
            <h3>${schedule.customerName}</h3>
            <p><strong>Layanan:</strong> ${schedule.treatmentName}</p>
            <p><strong>Waktu:</strong> ${schedule.time}</p>
        </div>
        <div class="schedule-footer">
            <button class="btn-cancel" data-id="${schedule.id}">Batalkan</button>
            <button class="btn-confirm" data-id="${schedule.id}">Selesai</button>
        </div>
    `;

    return card;
};
