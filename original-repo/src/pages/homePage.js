import { getUserMembership } from "../features/users/membership.js";
export const renderHomePage = async (user) => {
    const page = document.getElementById('home-page');
    
    page.innerHTML = `
        <header class="home-header">
            <div class="user-greet">
                <span>Welcome,</span>
                <h3>${user.displayName?.split(' ')[0]}</h3>
            </div>
            <img src="${user.photoURL}" class="profile-thumb" onclick="navigateTo('profile-page')">
        </header>

        <section class="hero glass-card">
            <h1>Alisya Beauty</h1>
            <p>Luxury Muslimah Beauty Experience</p>
            <button class="btn-gold" onclick="navigateTo('booking-page')">Book Appointment</button>
        </section>

        <section class="promo-banner glass-card">
            <h4>✨ Special Offer</h4>
            <p>Diskon 20% untuk semua Hair Spa bulan ini!</p>
        </section>

        <section class="services-grid">
            ${['Hair', 'Face', 'Body', 'Spa'].map(s => `
                <div class="glass-card" onclick="navigateTo('booking-page')">
                    <i class="fa-solid fa-sparkles"></i>
                    <h4>${s}</h4>
                </div>
            `).join('')}
        </section>

        <section class="hours-card glass-card">
            <i class="fa-solid fa-clock" style="color:var(--gold)"></i>
            <div>
                <h4>Open Hours</h4>
                <p>Mon - Sun | 09:00 - 21:00</p>
            </div>
        </section>

        <section class="final-cta">
            <p>Ready to Glow with Us?</p>
            <button class="btn-gold" onclick="navigateTo('booking-page')">Book Now</button>
        </section>
    `;
};
