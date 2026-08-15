import React, { useState, useEffect } from 'react';
import { 
  Sparkles, ShieldCheck, Heart, HelpCircle, Loader2, Play, 
  CheckCircle, Info, Lock, ChevronRight, User, AlertTriangle,
  Eye, EyeOff, ShoppingCart, Clock, ShoppingBag, X, Plus, Minus, Trash2, Box
} from 'lucide-react';
import { auth, provider } from './config/firebase';
import { signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
import { fetchUserProfile, updateUserWhatsapp, subscribeBookings, subscribeUserProfile, createShopOrder, updateUserAddress } from './services/dataService';
import { UserProfile, CartItem } from './types';
import { motion, AnimatePresence } from 'motion/react';

// Importing subcomposed components
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import ServicesPage from './components/ServicesPage';
import BookingPage from './components/BookingPage';
import ShopPage from './components/ShopPage';
import LivePage from './components/LivePage';
import GalleryPage from './components/GalleryPage';
import ProfilePage from './components/ProfilePage';
import AdminPage from './components/AdminPage';
import MapsPage from './components/MapsPage';
import NotificationsPage from './components/NotificationsPage';
import ReviewsPage from './components/ReviewsPage';
import Toast from './components/Toast';
import AlyaAmbassador from './components/AlyaAmbassador';
import logoImg from './assets/images/logo.png';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [preselectedTreatment, setPreselectedTreatment] = useState("");
  const [preselectedPromoId, setPreselectedPromoId] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [whatsappNum, setWhatsappNum] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [doneBookingsCount, setDoneBookingsCount] = useState(0);
  const [myBookingsCount, setMyBookingsCount] = useState(0);
  const [isAlyaOpen, setIsAlyaOpen] = useState(false);
  const [isBookingHistoryOpen, setIsBookingHistoryOpen] = useState(false);

  // Shopping Cart States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('alisya_cart');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  // Sync Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('alisya_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Shared Cart helper functions
  const handleRemoveFromCart = (productId: string) => {
    setCartItems(prev => {
      const item = prev.find(i => i.product.id === productId);
      if (item) {
        showToast(`🗑️ "${item.product.name}" dihapus dari keranjang.`, "info");
      }
      return prev.filter(i => i.product.id !== productId);
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: Math.max(1, newQty) };
        }
        return item;
      });
    });
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    if (!userProfile) {
      showToast("🔒 Silakan masuk (login) terlebih dahulu untuk memproses pesanan butik Anda!", "error");
      return;
    }

    try {
      showToast("⏳ Sedang memproses pembelian dan merekam transaksi...", "info");

      for (const item of cartItems) {
        await createShopOrder({
          userId: userProfile.uid,
          userName: userProfile.displayName,
          userEmail: userProfile.email,
          productName: `${item.product.name} (x${item.quantity})`,
          price: item.product.price * item.quantity,
          quantity: item.quantity,
          date: new Date().toLocaleDateString('id-ID')
        });
      }

      const totalPembayaran = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
      
      const itemDetails = cartItems.map((item, idx) => 
        `${idx + 1}. *${item.product.name}*\n   Jumlah: ${item.quantity}x\n   Subtotal: Rp ${(item.product.price * item.quantity).toLocaleString('id-ID')}`
      ).join('\n\n');

      const addressString = userProfile.address ? `- Alamat Pengiriman: ${userProfile.address}` : '- Alamat Pengiriman: Belum diisi (Mohon isi Alamat di Pengaturan Profil Anda)';
      const gpsString = userProfile.gpsLocation 
        ? `- Koordinat GPS: ${userProfile.gpsLocation.latitude}, ${userProfile.gpsLocation.longitude}\n- Link Peta Google Maps: ${userProfile.gpsLocation.mapsUrl || `https://www.google.com/maps?q=${userProfile.gpsLocation.latitude},${userProfile.gpsLocation.longitude}`}` 
        : '- Akurasi GPS: Belum dikalibrasi (Gunakan fitur Deteksi GPS di profil)';

      const checkoutMessage = `Assalamu'alaikum Alisya Beauty Admin, saya ingin memesan produk butik dari keranjang belanja saya:

${itemDetails}

=========================
*Total Pembayaran: Rp ${totalPembayaran.toLocaleString('id-ID')}*
=========================

*Data Pemesan & Pengiriman:*
- Nama: ${userProfile.displayName}
- Email: ${userProfile.email}
${addressString}
${gpsString}

Mohon konfirmasi ketersediaan stok & ongkos kirim. Terima kasih banyak!`;

      const adminWhatsApp = "6289661946783";
      const waURL = `https://api.whatsapp.com/send?phone=${adminWhatsApp}&text=${encodeURIComponent(checkoutMessage)}`;

      showToast("🎉 Checkout berhasil! Membuka WhatsApp untuk konfirmasi pengiriman...", "success");
      setCartItems([]);
      setIsCartOpen(false);

      setTimeout(() => {
        window.open(waURL, '_blank');
      }, 1100);

    } catch (e) {
      console.error(e);
      showToast("Gagal memproses checkout pesanan.", "error");
    }
  };

  // Toast State
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  
  // Login input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<{ code: string; message: string; title: string; hint: string } | null>(null);

  // Email Registration states
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [registerName, setRegisterName] = useState("");
  const [registerWhatsapp, setRegisterWhatsapp] = useState("");

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (userProfile) {
      document.body.className = 'app-page';
      localStorage.setItem('alisya_local_user', JSON.stringify(userProfile));
    } else {
      document.body.className = 'login-page';
    }
  }, [userProfile]);

  useEffect(() => {
    const uid = userProfile?.uid;
    if (!uid) {
      setDoneBookingsCount(0);
      setMyBookingsCount(0);
      return;
    }
    const unsubscribe = subscribeBookings(uid, (userBookings) => {
      const doneCount = userBookings.filter(b => b.status === 'done').length;
      setDoneBookingsCount(doneCount);
      setMyBookingsCount(userBookings.length);
    });
    return () => unsubscribe();
  }, [userProfile?.uid]);

  useEffect(() => {
    const uid = userProfile?.uid;
    if (!uid) return;
    const unsubscribe = subscribeUserProfile(uid, (profileData) => {
      setUserProfile(profileData);
    });
    return () => unsubscribe();
  }, [userProfile?.uid]);

  useEffect(() => {
    // 1. Check local storage for active local/demo user first
    const localUser = localStorage.getItem('alisya_local_user');
    if (localUser) {
      try {
        const u = JSON.parse(localUser);
        setUserProfile(u);
        setWhatsappNum(u.whatsapp || "");
        setLoading(false);
        return;
      } catch {
        // Continue to firebase if parse fails
      }
    }

    // 2. Firebase auth state listener
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          const profile = await fetchUserProfile(fbUser.uid, {
            displayName: fbUser.displayName || 'Shaliha Member',
            email: fbUser.email || 'guest@alisyabeauty.com',
            photoURL: fbUser.photoURL
          });
          setUserProfile(profile);
          setWhatsappNum(profile.whatsapp || "");
        } else {
          setUserProfile(null);
        }
      } catch (e) {
        console.warn("Firebase Auth error:", e);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Standard Login via Google Popup
  const handleGoogleLogin = async () => {
    if (!auth || !provider) {
      showToast("Firebase Auth belum sepenuhnya terkonfigurasi. Gunakan Demo Mode.", "info");
      return;
    }
    setAuthError(null);
    try {
      const res = await signInWithPopup(auth, provider);
      const googleUser = res.user;
      const profile = await fetchUserProfile(googleUser.uid, {
        displayName: googleUser.displayName || 'Member Alisya',
        email: googleUser.email || 'customer@gmail.com',
        photoURL: googleUser.photoURL
      });
      setUserProfile(profile);
      showToast(`Assalamu'alaikum, ${profile.displayName}!`, "success");
    } catch (e: any) {
      console.error("Popup login error:", e);
      const errCode = e.code || "";
      const errMsg = e.message || "";
      
      let title = "Gagal Menghubungkan Google";
      let hint = "Pastikan koneksi internet stabil dan konfigurasi di Firebase Console sudah diaktifkan.";

      if (errCode === "auth/popup-blocked") {
        title = "Popup Diblokir Browser";
        hint = "Browser Anda memblokir jendela popup Google Login. Silakan izinkan popup untuk situs ini atau klik tombol 'buka di tab baru' di pojok kanan atas AI Studio.";
        showToast("Popup login diblokir browser. Pastikan Anda mengizinkan popup atau buka aplikasi di tab baru.", "error");
      } else if (errCode === "auth/unauthorized-domain") {
        title = "Domain Belum Terdaftar (Nama Domain Tidak Diizinkan)";
        hint = "Domain web latihan Anda belum ditambahkan ke daftar 'Authorized Domains' di Firebase Console Anda. Anda HARUS menyalin domain ini dan menambahkannya di menu Firebase Console: Authentication -> Settings -> Authorized Domains.";
        showToast(`Domain ini belum didaftarkan di Firebase Console Anda. Harap tambahkan domain ini ke 'Authorized Domains' di Firebase.`, "error");
      } else if (errCode === "auth/operation-not-allowed") {
        title = "Metode Google Sign-In Belum Aktif";
        hint = "Provider login Google belum diaktifkan di Firebase Console. Masuk ke Firebase Console Anda -> klik menu Authentication -> klik tab Sign-in method -> aktifkan 'Google' dan isi email dukungan.";
        showToast("Provider Google belum diaktifkan di Firebase Console Anda (Authentication -> Sign-in method).", "error");
      } else {
        showToast(`Gagal menghubungkan ke Google: ${errCode || errMsg || 'Koneksi ditolak'}. Gunakan Demo Mode terlebih dahulu.`, "error");
      }

      setAuthError({
        code: errCode,
        message: errMsg,
        title,
        hint
      });
    }
  };

  const handlePasswordRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName.trim() || !email.trim() || !password.trim()) {
      showToast("Nama, Email, dan Password wajib diisi.", "error");
      return;
    }

    if (password.length < 6) {
      showToast("Password minimal 6 karakter.", "error");
      return;
    }

    let registeredWithFirebase = false;
    let registeredUid = "";
    if (auth) {
      try {
        const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: registerName });
        
        await fetchUserProfile(userCredential.user.uid, {
          displayName: registerName,
          email: email
        });
        if (registerWhatsapp) {
          await updateUserWhatsapp(userCredential.user.uid, registerWhatsapp);
        }
        registeredWithFirebase = true;
        registeredUid = userCredential.user.uid;
      } catch (err: any) {
        console.warn("Firebase email registration failed, continuing local store fallback:", err);
      }
    }

    if (registeredWithFirebase) {
      try {
        const localUsersStr = localStorage.getItem('alisya_registered_users') || '[]';
        const localUsers = JSON.parse(localUsersStr);
        if (!localUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
          localUsers.push({
            uid: registeredUid,
            email: email.toLowerCase(),
            password: password,
            displayName: registerName,
            whatsapp: registerWhatsapp
          });
          localStorage.setItem('alisya_registered_users', JSON.stringify(localUsers));

          const sampleProfile: UserProfile = {
            uid: registeredUid,
            displayName: registerName,
            email: email.toLowerCase(),
            photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
            level: 'Bronze',
            points: 0,
            whatsapp: registerWhatsapp,
            createdAt: new Date().toISOString()
          };
          const profilesStr = localStorage.getItem('alisya_user_profiles') || '[]';
          const profiles = JSON.parse(profilesStr);
          profiles.push(sampleProfile);
          localStorage.setItem('alisya_user_profiles', JSON.stringify(profiles));
        }
      } catch (e) {
        // quiet fallback
      }
      showToast("Pendaftaran berhasil! Akun Anda aktif. Selamat datang di Alisya Beauty.", "success");
      setPassword("");
      return;
    }

    try {
      const localUsersStr = localStorage.getItem('alisya_registered_users') || '[]';
      const localUsers = JSON.parse(localUsersStr);
      
      if (localUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
        showToast("Email ini sudah terdaftar. Silakan masuk.", "error");
        return;
      }

      const newUid = `u_${Date.now()}`;
      localUsers.push({
        uid: newUid,
        email: email.toLowerCase(),
        password: password,
        displayName: registerName,
        whatsapp: registerWhatsapp
      });

      localStorage.setItem('alisya_registered_users', JSON.stringify(localUsers));

      // Seed profile in user_profiles
      const sampleProfile: UserProfile = {
        uid: newUid,
        displayName: registerName,
        email: email.toLowerCase(),
        photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
        level: 'Bronze',
        points: 0,
        whatsapp: registerWhatsapp,
        createdAt: new Date().toISOString()
      };
      const profilesStr = localStorage.getItem('alisya_user_profiles') || '[]';
      const profiles = JSON.parse(profilesStr);
      profiles.push(sampleProfile);
      localStorage.setItem('alisya_user_profiles', JSON.stringify(profiles));
      
      showToast("Pendaftaran berhasil! Akun Anda aktif. Silakan masuk sekarang.", "success");
      setAuthMode('login');
      setPassword("");
    } catch {
      showToast("Gagal mendaftarkan akun.", "error");
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast("Email dan password wajib diisi.", "error");
      return;
    }

    const localUsersStr = localStorage.getItem('alisya_registered_users') || '[]';
    const localUsers = JSON.parse(localUsersStr);
    
    const matchedLocalUser = localUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    const isAdminUser = email === 'miftahilmi15@gmail.com' || email.toLowerCase().includes('admin');

    // 1. Try Firebase Auth sign-in first if Firebase is available
    if (auth) {
      try {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const profile = await fetchUserProfile(userCredential.user.uid);
        setUserProfile(profile);
        setWhatsappNum(profile.whatsapp || "");
        
        // Keep local cache updated
        try {
          if (matchedLocalUser) {
            matchedLocalUser.uid = userCredential.user.uid;
            localStorage.setItem('alisya_registered_users', JSON.stringify(localUsers));
          } else {
            localUsers.push({
              uid: userCredential.user.uid,
              email: email.toLowerCase(),
              password: password,
              displayName: profile.displayName,
              whatsapp: profile.whatsapp || ""
            });
            localStorage.setItem('alisya_registered_users', JSON.stringify(localUsers));
          }

          const profilesStr = localStorage.getItem('alisya_user_profiles') || '[]';
          const profiles = JSON.parse(profilesStr);
          const existingLocalProfileIdx = profiles.findIndex((p: any) => p.uid === userCredential.user.uid);
          if (existingLocalProfileIdx !== -1) {
            profiles[existingLocalProfileIdx] = profile;
          } else {
            profiles.push(profile);
          }
          localStorage.setItem('alisya_user_profiles', JSON.stringify(profiles));
          localStorage.setItem('alisya_local_user', JSON.stringify(profile));
        } catch {
          // ignore cache error
        }

        showToast(`Assalamu'alaikum, ${profile.displayName}!`, "success");
        return;
      } catch (fbErr: any) {
        console.warn("Firebase login failed:", fbErr);
        const code = fbErr.code || "";
        
        if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
          showToast("Password yang Anda masukkan salah atau email salah.", "error");
          return;
        } else if (code === 'auth/user-disabled') {
          showToast("Akun Anda telah dinonaktifkan.", "error");
          return;
        } else if (code === 'auth/too-many-requests') {
          showToast("Terlalu banyak percobaan masuk gagal. Coba lagi nanti.", "error");
          return;
        }
        // For auth/user-not-found or other connection issues, we fall back to local storage matching
      }
    }

    // 2. Local fallback if offline / legacy user
    if (matchedLocalUser) {
      if (matchedLocalUser.password !== password) {
        showToast("Password yang Anda masukkan salah.", "error");
        return;
      }
      
      const userUid = matchedLocalUser.uid || `u_${Date.now()}`;
      if (!matchedLocalUser.uid) {
        matchedLocalUser.uid = userUid;
        localStorage.setItem('alisya_registered_users', JSON.stringify(localUsers));
      }

      const profilesStr = localStorage.getItem('alisya_user_profiles') || '[]';
      const profiles = JSON.parse(profilesStr);
      let sampleUser = profiles.find((p: any) => p.uid === userUid);

      if (!sampleUser) {
        sampleUser = {
          uid: userUid,
          displayName: matchedLocalUser.displayName,
          email: matchedLocalUser.email,
          photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
          level: 'Bronze',
          points: 0,
          whatsapp: matchedLocalUser.whatsapp,
          createdAt: new Date().toISOString()
        };
        profiles.push(sampleUser);
        localStorage.setItem('alisya_user_profiles', JSON.stringify(profiles));
      } else {
        if (matchedLocalUser.whatsapp && sampleUser.whatsapp !== matchedLocalUser.whatsapp) {
          sampleUser.whatsapp = matchedLocalUser.whatsapp;
          localStorage.setItem('alisya_user_profiles', JSON.stringify(profiles));
        }
      }

      try {
        localStorage.setItem('alisya_local_user', JSON.stringify(sampleUser));
        setUserProfile(sampleUser);
        setWhatsappNum(sampleUser.whatsapp || "");
        showToast(`Assalamu'alaikum, ${sampleUser.displayName}! (Offline Mode)`, "success");
      } catch {
        showToast("Gagal memproses login.", "error");
      }
      return;
    }

    if (isAdminUser) {
      handleLocalDemoLogin('admin');
      return;
    }

    showToast("Email belum terdaftar. Silakan daftar terlebih dahulu sebelum masuk.", "error");
    setAuthMode('register');
  };

  // Demo Login flows to bypass blocked frame environments
  const handleLocalDemoLogin = async (role: 'guest' | 'admin') => {
    setLoading(true);
    let sampleUser: UserProfile;

    if (role === 'admin') {
      sampleUser = {
        uid: 'adm_15',
        displayName: 'Miftah Ilmi (Admin)',
        email: 'miftahilmi15@gmail.com',
        photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
        level: 'Platinum',
        points: 3500,
        whatsapp: '08123456789',
        createdAt: new Date().toISOString()
      };
    } else {
      sampleUser = {
        uid: 'guest_99',
        displayName: 'Zulfa Shaliha',
        email: 'shaliha.beauty@gmail.com',
        photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
        level: 'Bronze',
        points: 0,
        whatsapp: '085399998888',
        createdAt: new Date().toISOString()
      };
      
      // Empty local caches to start fresh as requested
      try {
        localStorage.removeItem('alisya_bookings');
        localStorage.removeItem('alisya_reviews');
        localStorage.removeItem('reviews');
        // Let's seed the fallback profile on-the-fly to keep local triggers connected
        localStorage.setItem('alisya_user_profiles', JSON.stringify([sampleUser]));
      } catch (err) {
        console.warn("Storage item clear error:", err);
      }
    }

    try {
      localStorage.setItem('alisya_local_user', JSON.stringify(sampleUser));
      setUserProfile(sampleUser);
      setWhatsappNum(sampleUser.whatsapp || "");
      showToast(`Assalamu'alaikum, ${sampleUser.displayName} (Demo Mode)`, "success");
    } catch {
      showToast("Gagal memulai demo.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      localStorage.removeItem('alisya_local_user');
      if (auth) {
        await fbSignOut(auth);
      }
      setUserProfile(null);
      setActiveTab('home');
      showToast("Anda telah keluar dari keanggotaan.", "info");
    } catch {
      showToast("Gagal logout.", "error");
    }
  };

  const handleNavigateToBooking = (treatmentName: string, promoId?: string) => {
    setPreselectedTreatment(treatmentName);
    if (promoId) {
      setPreselectedPromoId(promoId);
    }
    setActiveTab('booking');
  };

  const handleNavigateToCategory = (categoryName: string) => {
    let mappedCat = "All";
    if (categoryName === "Hair Treatment") mappedCat = "Hair";
    else if (categoryName === "Facial Treatment") mappedCat = "Facial";
    else if (categoryName === "Body Treatment") mappedCat = "Body";
    else if (categoryName === "Spa") mappedCat = "Spa";
    
    setActiveCategory(mappedCat);
    setActiveTab('services');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center p-6 text-center gap-4">
        <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
        <div className="space-y-1">
          <p className="font-serif font-bold text-lg text-white tracking-wide">Alisya Beauty</p>
          <p className="text-xs text-stone-400 font-light max-w-xs">Menghubungkan dengan sistem member kecantikan Anda...</p>
        </div>
      </div>
    );
  }

  // ========================================================
  // LOGIN SCREEN (IF NO USER LOGGED IN) - PREMIUM GOLD & CREAM THEME
  // ========================================================
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center relative px-4 py-8 overflow-hidden font-sans">
        
        {/* Luxury Background Ambient Lights */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-gold-400/8 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-gold-500/5 blur-3xl pointer-events-none" />
        
        {/* Ambient background picture opacity */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=900')] bg-cover bg-center opacity-5 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F6] via-[#FAF9F6]/94 to-[#FAF9F6]" />

        <div className="relative z-10 max-w-md w-full space-y-7 animate-fade-in-up">
          
          {/* Brand Logo & Presentation */}
          <div className="space-y-3 text-center">
            <div className="w-28 h-28 mx-auto relative group animate-fade-in-up">
              <img 
                src={logoImg || "logo.png"} 
                alt="Alisya Beauty Logo" 
                className="w-full h-full object-contain rounded-full shadow-lg border border-[#be9741]/45 p-1 bg-white hover:border-gold-500 transition-all duration-500 transform hover:scale-105"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.onerror = null;
                  target.src = "logo.png";
                }}
              />
            </div>
            <div className="space-y-1">
              <h1 className="text-3.5xl font-serif font-black tracking-widest text-[#3c2a13] leading-tight">
                Alisya Beauty
              </h1>
            </div>
          </div>

          {/* Interactive Login Card - Glassmorphism, Gold glow border, smooth layout */}
          <div className="liquid-glass rounded-3xl p-6.5 border border-[#be9741]/25 shadow-[0_16px_40px_rgba(167,134,59,0.08)] text-left space-y-5 animate-fade-in-up relative">
            
            {/* Auth Switcher Tabs (Daftar / Masuk) */}
            <div className="flex border-b border-stone-200/60 pb-4.5 gap-2">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setAuthError(null); }}
                className={`flex-1 text-center pb-2 text-xs font-black tracking-widest uppercase transition-all duration-350 cursor-pointer ${
                  authMode === 'login' 
                    ? 'text-gold-750 border-b-2 border-gold-500 scale-102 font-black' 
                    : 'text-stone-400 hover:text-stone-600 font-bold'
                }`}
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setAuthError(null); }}
                className={`flex-1 text-center pb-2 text-xs font-black tracking-widest uppercase transition-all duration-350 cursor-pointer ${
                  authMode === 'register' 
                    ? 'text-gold-750 border-b-2 border-gold-500 scale-102 font-black' 
                    : 'text-stone-400 hover:text-stone-600 font-bold'
                }`}
              >
                Daftar
              </button>
            </div>

            {/* Email-Password Login Form */}
            <form onSubmit={authMode === 'login' ? handlePasswordLogin : handlePasswordRegister} className="space-y-4">
              
              {authMode === 'register' && (
                <>
                  <div className="space-y-1.5 text-left animate-fade-in-up">
                    <label className="text-[10px] font-black tracking-widest text-gold-700 uppercase block">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      required
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="Nama Lengkap Anda"
                      className="w-full bg-white border border-stone-200 focus:border-gold-500 text-stone-800 rounded-xl py-3 px-4 text-xs outline-none transition-all placeholder:text-stone-400 focus:shadow-[0_0_10px_rgba(190,151,65,0.08)] focus:ring-1 focus:ring-gold-500/20"
                    />
                  </div>
                  
                  <div className="space-y-1.5 text-left animate-fade-in-up">
                    <label className="text-[10px] font-black tracking-widest text-gold-700 uppercase block">
                      Nomor WhatsApp
                    </label>
                    <input
                      type="tel"
                      required
                      value={registerWhatsapp}
                      onChange={(e) => setRegisterWhatsapp(e.target.value)}
                      placeholder="Contoh: 08123456789"
                      className="w-full bg-white border border-stone-200 focus:border-gold-500 text-stone-800 rounded-xl py-3 px-4 text-xs outline-none transition-all placeholder:text-stone-400 focus:shadow-[0_0_10px_rgba(190,151,65,0.08)] focus:ring-1 focus:ring-gold-500/20"
                    />
                  </div>
                </>
              )}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black tracking-widest text-gold-700 uppercase block">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@shaliha.com"
                  className="w-full bg-white border border-stone-200 focus:border-gold-500 text-stone-800 rounded-xl py-3 px-4 text-xs outline-none transition-all placeholder:text-stone-400 focus:shadow-[0_0_10px_rgba(190,151,65,0.08)] focus:ring-1 focus:ring-gold-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black tracking-widest text-gold-700 uppercase block">
                    Password
                  </label>
                  <span className="text-[9px] text-stone-500 hover:text-gold-600 cursor-pointer">Lupa?</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-stone-200 focus:border-gold-500 text-stone-800 rounded-xl py-3 pl-4 pr-11 text-xs outline-none transition-all placeholder:text-stone-400 focus:shadow-[0_0_10px_rgba(190,151,65,0.08)] focus:ring-1 focus:ring-gold-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-gold-600 focus:outline-none p-1 rounded-md transition-colors cursor-pointer select-none"
                    title={showPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Main Login Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 hover:from-gold-500 hover:to-gold-700 text-white font-extrabold py-3 rounded-xl shadow-md shadow-gold-500/10 text-xs uppercase tracking-widest cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-1.5 hover:shadow-[0_6px_15px_rgba(190,151,65,0.25)] mt-2 animate-fade-in-up"
              >
                {authMode === 'login' ? 'Masuk Keanggotaan' : 'Daftar Keanggotaan'}
              </button>
            </form>

            {/* Separator */}
            <div className="relative flex items-center justify-center my-4.5">
              <div className="border-t border-stone-200/80 w-full" />
              <span className="absolute bg-[#fdfbf7] px-3.5 text-[9px] uppercase tracking-widest font-bold text-stone-400 font-mono">
                Atau
              </span>
            </div>

            {/* Google official button */}
            <button
               onClick={handleGoogleLogin}
               className="w-full bg-white hover:bg-stone-50 text-stone-700 font-bold py-3 px-4 border border-stone-200 hover:border-gold-500/40 rounded-xl flex items-center justify-center gap-2.5 active:scale-98 transition-all uppercase tracking-wider text-[10.5px] cursor-pointer shadow-sm hover:shadow-md"
            >
               <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                 <path
                   fill="#EA4335"
                   d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.92 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.86 3c.9-2.7 3.4-4.46 6.64-4.46z"
                 />
                 <path
                   fill="#4285F4"
                   d="M23.49 12.27c0-.8-.07-1.56-.2-2.3H12v4.4h6.44c-.28 1.44-1.1 2.66-2.33 3.47l3.6 2.8c2.1-1.94 3.3-4.8 3.3-8.37z"
                 />
                 <path
                   fill="#FBBC05"
                   d="M5.36 14.5c-.24-.7-.36-1.46-.36-2.25s.12-1.55.36-2.25L1.5 7.01C.54 8.93 0 11.07 0 13.33s.54 4.4 1.5 6.32l3.86-3.15z"
                 />
                 <path
                   fill="#34A853"
                   d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.6-2.8c-1.1.74-2.5 1.18-4.36 1.18-3.24 0-5.74-1.76-6.64-4.46L1.5 17c1.9 3.85 5.85 6.5 10.5 6.5z"
                 />
               </svg>
               <span>Google Authentication</span>
             </button>

          </div>

        </div>
      </div>
    );
  }

  // ========================================================
  // RENDER MAIN APPLICATION ROUTER IN SHELL
  // ========================================================
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const headerAction = activeTab === 'shop' ? (
    <button
      onClick={() => setIsCartOpen(true)}
      className="relative hover:text-[#A98436] hover:bg-white/80 active:scale-90 transition-all cursor-pointer p-2 bg-white/50 border border-[#EBE7DF] rounded-full text-stone-600 shadow-3xs flex items-center justify-center shrink-0"
      title="Keranjang Belanja"
    >
      <div className="w-4 h-4 relative flex items-center justify-center text-[13px] leading-none">
        🛒
      </div>
      {totalCartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#A98436] text-white text-[8px] font-extrabold px-1 py-0.2 rounded-full min-w-4 border border-white shadow-3xs animate-pulse text-center">
          {totalCartCount}
        </span>
      )}
    </button>
  ) : activeTab === 'booking' ? (
    <button
      onClick={() => setIsBookingHistoryOpen(true)}
      className="hover:text-[#A98436] hover:bg-white/80 active:scale-90 transition-all cursor-pointer p-2 bg-white/50 border border-[#EBE7DF] rounded-full text-stone-600 shadow-3xs flex items-center justify-center shrink-0"
      title="Riwayat Reservasi"
    >
      <Clock className="w-4 h-4 text-[#A98436]" />
    </button>
  ) : null;

  return (
    <Layout 
      activeTab={activeTab} 
      onNavigate={(tabId) => {
        setActiveTab(tabId);
        if (tabId !== 'services') {
          setActiveCategory('All');
        }
      }} 
      userProfile={userProfile}
      onLogout={handleLogout}
      whatsappNum={whatsappNum}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      doneBookingsCount={doneBookingsCount}
      activeCategory={activeCategory}
      setActiveCategory={setActiveCategory}
      headerAction={headerAction}
      onOpenAlya={() => setIsAlyaOpen(true)}
    >
      {/* Dynamic screen routing */}
      {activeTab === 'home' && (
        <HomePage 
          userProfile={userProfile} 
          onNavigate={setActiveTab} 
          onNavigateToBooking={handleNavigateToBooking}
          onShowToast={showToast}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onNavigateToCategory={handleNavigateToCategory}
        />
      )}

      {activeTab === 'services' && (
        <ServicesPage 
          onNavigateToBooking={handleNavigateToBooking}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
      )}
      
      {activeTab === 'booking' && (
        <BookingPage 
          userProfile={userProfile} 
          preselectedTreatment={preselectedTreatment}
          clearPreselectedTreatment={() => setPreselectedTreatment("")}
          preselectedPromoId={preselectedPromoId}
          clearPreselectedPromoId={() => setPreselectedPromoId("")}
          onShowToast={showToast}
          onNavigate={setActiveTab}
          showHistoryDirectly={isBookingHistoryOpen}
          onCloseHistory={() => setIsBookingHistoryOpen(false)}
        />
      )}
      
      {activeTab === 'shop' && (
        <ShopPage 
          userProfile={userProfile}
          onShowToast={showToast} 
          cartItems={cartItems}
          setCartItems={setCartItems}
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
          searchQuery={searchQuery}
        />
      )}
      
      {activeTab === 'gallery' && (
        <GalleryPage />
      )}

      {activeTab === 'live' && (
        <LivePage 
          userProfile={userProfile}
          onShowToast={showToast}
          cartItems={cartItems}
          setCartItems={setCartItems}
          onOpenCart={() => setIsCartOpen(true)}
        />
      )}
      
      {activeTab === 'profile' && (
        <ProfilePage 
          userProfile={userProfile}
          onLogout={handleLogout}
          onNavigateToAdmin={() => setActiveTab('admin')}
          onShowToast={showToast}
          onUpdatewhatsapp={setWhatsappNum}
          onNavigate={setActiveTab}
          cartItems={cartItems}
          onOpenCart={() => setIsCartOpen(true)}
        />
      )}

      {activeTab === 'notifications' && (
        <NotificationsPage 
          userProfile={userProfile}
          onNavigate={setActiveTab}
        />
      )}

      {activeTab === 'reviews' && (
        <ReviewsPage 
          userProfile={userProfile}
          onNavigate={setActiveTab}
        />
      )}

      {activeTab === 'admin' && (
        <AdminPage 
          onShowToast={showToast} 
        />
      )}

      {/* Shared Shopping Cart Sliding Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end font-sans">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-stone-950/40 backdrop-blur-xs cursor-pointer"
            />

            {/* Sliding Drawer Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col justify-between z-55 text-stone-800"
            >
              {/* Header */}
              <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 relative flex items-center justify-center text-[14px] leading-none">
                    🛒
                  </div>
                  <h3 className="font-serif font-extrabold text-base text-stone-900 leading-none">Keranjang Belanja</h3>
                  {totalCartCount > 0 && (
                    <span className="bg-[#A98436] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {totalCartCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-700 transition-colors cursor-pointer border-0 bg-transparent animate-fade-in"
                  title="Tutup"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Scrollable Cart List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-3.5 h-full animate-fade-in">
                    <div className="w-14 h-14 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-300">
                      <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <div>
                      <p className="font-serif font-extrabold text-stone-800 text-sm">Keranjang Belanja Kosong</p>
                      <p className="text-[11px] text-stone-500 max-w-xs mx-auto leading-relaxed mt-1">
                        Pilih berbagai produk formula kecantikan ramah muslimah premium kami untuk diisi ke keranjang Anda.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="bg-[#A98436] hover:bg-[#93722E] text-white text-xs font-bold py-2.5 px-6 rounded-full transition-all cursor-pointer border-0 active:scale-95"
                    >
                      Mulai Berbelanja
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div 
                      key={item.product.id} 
                      className="flex gap-3 bg-stone-50/50 p-3.5 rounded-2xl border border-stone-100 items-center justify-between animate-fade-in-up"
                    >
                      {/* Left: Info & Thumbnail */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-white border border-stone-100 overflow-hidden shrink-0 flex items-center justify-center shadow-3xs">
                          {item.product.imageUrl ? (
                            <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Box className="w-5 h-5 text-stone-300" />
                          )}
                        </div>
                        
                        <div className="min-w-0 text-left">
                          <h4 className="font-extrabold text-[12.5px] text-stone-900 truncate leading-tight">{item.product.name}</h4>
                          <p className="text-[11px] font-mono font-bold text-[#A98436] mt-1">
                            Rp {item.product.price.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>

                      {/* Right: Quantity Adjuster & Action */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg p-0.5">
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, -1)}
                            className="w-5.5 h-5.5 rounded-md hover:bg-stone-50 flex items-center justify-center text-stone-500 cursor-pointer text-[10px] border-0 bg-transparent active:scale-90"
                            title="Kurang"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="w-5 text-center text-xs font-extrabold font-mono text-stone-850">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, 1)}
                            className="w-5.5 h-5.5 rounded-md hover:bg-stone-50 flex items-center justify-center text-stone-500 cursor-pointer text-[10px] border-0 bg-transparent active:scale-90"
                            title="Tambah"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveFromCart(item.product.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-500 hover:bg-rose-50/50 rounded-lg transition-colors cursor-pointer border-0 bg-transparent active:scale-90"
                          title="Hapus Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Summary & Checkout */}
              {cartItems.length > 0 && (
                <div className="p-5 border-t border-stone-100 bg-stone-50/40 space-y-4 text-left">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-stone-600">Total Belanja:</span>
                    <span className="font-mono font-black text-stone-950 text-base">
                      Rp {cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-[#A98436] to-[#D3B674] hover:from-[#c29f2e] hover:to-[#A98436] text-stone-950 font-black py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shadow-md uppercase tracking-wider text-xs border-0"
                  >
                    <div className="w-4 h-4 relative flex items-center justify-center text-[13px] leading-none">
                      🛒
                    </div>
                    Kirim Pembelian via WhatsApp
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Render Single Micro Toast Dialog */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Global Brand Ambassador Alya */}
      <AlyaAmbassador 
        activeTab={activeTab} 
        userProfile={userProfile} 
        onNavigate={setActiveTab} 
        onShowToast={showToast} 
        isOpen={isAlyaOpen}
        onClose={() => setIsAlyaOpen(false)}
        cartItems={cartItems}
        setCartItems={setCartItems}
        onOpenCart={() => setIsCartOpen(true)}
      />
    </Layout>
  );
}
