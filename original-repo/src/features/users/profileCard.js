/**
 * Profile Card Component
 * Menampilkan ringkasan profil pelanggan termasuk status membership
 */

export const createProfileCard = (user) => {
    const card = document.createElement('div');
    card.className = 'profile-card';
    
    // Fallback jika data membership belum ada
    const level = user.membership?.level || 'Bronze';
    const points = user.membership?.points || 0;

    card.innerHTML = `
        <div class="profile-header">
            <img src="${user.photoUrl || 'assets/images/default-avatar.png'}" alt="Avatar">
            <h2>${user.name}</h2>
        </div>
        <div class="profile-body">
            <p><strong>Email:</strong> ${user.email}</p>
            <div class="membership-badge">
                <span>Status: ${level}</span>
                <span>Poin: ${points}</span>
            </div>
        </div>
        <div class="profile-footer">
            <button id="btn-edit-profile">Edit Profil</button>
            <button id="btn-logout" class="danger">Keluar</button>
        </div>
    `;

    return card;
};
