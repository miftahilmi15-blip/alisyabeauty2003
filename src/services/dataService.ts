import { db, auth } from "../config/firebase";
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  setDoc,
  updateDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FbUser
} from "firebase/auth";
import { Treatment, Product, Booking, UserProfile, Review } from "../types";

// Default pre-populated data for a premium experience
const DEFAULT_TREATMENTS: Treatment[] = [
  {
    id: "t1",
    name: "Alisya Royal Hair Spa & Hijab Care",
    description: "Perawatan rambut & kulit kepala menyeluruh khusus wanita berhijab menggunakan bahan botanical premium dan uap uap hangat untuk relaksasi maksimal.",
    price: 180000,
    duration: 60
  },
  {
    id: "t2",
    name: "Creambath Ginseng & Aloe Vera",
    description: "Creambath tradisional menggunakan racikan lidah buaya segar dan tonik ginseng untuk menutrisi akar rambut, merawat rambut rontok, dan memberikan kesegaran.",
    price: 125000,
    duration: 45
  },
  {
    id: "t3",
    name: "Royal Facial Glow Kolagen",
    description: "Facial wajah lengkap mulai dari pembersihan komedo, pijat totok sirkulasi wajah, uap herbal, hingga masker kolagen murni untuk kulit elastis, cerah, dan tampak bersinar.",
    price: 250000,
    duration: 75
  },
  {
    id: "t4",
    name: "Traditional Indonesian Massage & Lulur Rempah",
    description: "Pijat relaksasi seluruh tubuh dengan rempah aromatherapy berkualitas tinggi, dipadu dengan pijatan lembut penekan stres dan lulur rempah tradisional untuk mencerahkan sel kulit.",
    price: 220000,
    duration: 90
  },
  {
    id: "t5",
    name: "Totok Wajah Aura & Bio-Lifting",
    description: "Akupresur pada titik aura wajah untuk melancarkan sirkulasi darah, meredakan sakit kepala, mengurangi ketegangan wajah, dan memberikan tampilan alami yang segar.",
    price: 95000,
    duration: 30
  },
  {
    id: "t6",
    name: "Manicure & Pedicure Aromatherapy + Scrub",
    description: "Spa perawatan kuku tangan dan kaki dengan rendaman garam aromaterapi, pemotongan kutikula berkala, pijatan relaksasi jari, serta scrub organik lemon murni.",
    price: 110000,
    duration: 50
  }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Alisya Hair Growth Tonic Serum",
    description: "Tonik konsentrat dengan ekstrak ginkgo biloba dan kemiri bakar murni untuk menghentikan kerontokan rambut serta merangsang pertumbuhan folikel baru.",
    price: 85000,
    imageUrl: "https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "p2",
    name: "Hijab Refresh Herbal Hair Mist",
    description: "Penyegar rambut praktis berformula lembut dengan ekstrak teh hijau dan lidah buaya. Memberikan aroma segar feminin dan mengurangi lembap pada rambut tertutup hijab.",
    price: 45000,
    imageUrl: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "p3",
    name: "Organic Javanese Cocoa Body Scrub",
    description: "Lulur mandi berbahan cokelat Jawa asli dan serpihan kelapa organik manis untuk mengangkat sel kulit mati, melembutkan, dan menyamarkan noda hitam.",
    price: 65000,
    imageUrl: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "p4",
    name: "Pure Distilled Damask Rose Mist",
    description: "Air mawar distilasi murni tanpa alkohol untuk hydrating toner harian, menenangkan kulit sensitif kemerahan, serta mengunci kelembapan wajah sebelum makeup.",
    price: 40000,
    imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "p5",
    name: "Sulfate-Free Scalp Therapy Shampoo",
    description: "Sampo bebas busa kimia berlebih dengan minyak rosemary dan tea tree untuk mengontrol produksi sebum kulit kepala, gatal-gatal, dan inflamasi ketombe.",
    price: 75000,
    imageUrl: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=600"
  }
];

// Helper to check if Firebase is available
const isFirebaseWorking = () => {
  return !!db && !!auth;
};

// ------------------------------------------------------------
// LOCAL STORAGE IN-MEMORY BACKUP ENGINES
// ------------------------------------------------------------
const getLocalStorageData = <T>(key: string, defaults: T[]): T[] => {
  try {
    const val = localStorage.getItem(`alisya_${key}`);
    if (!val) {
      localStorage.setItem(`alisya_${key}`, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(val);
  } catch {
    return defaults;
  }
};

const saveLocalStorageData = <T>(key: string, data: T[]) => {
  try {
    localStorage.setItem(`alisya_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error("Local storage error:", e);
  }
};

// ------------------------------------------------------------
// TREATMENTS SERVICE API
// ------------------------------------------------------------
export const fetchTreatments = async (): Promise<Treatment[]> => {
  if (isFirebaseWorking()) {
    try {
      const snap = await getDocs(collection(db, "treatments"));
      if (!snap.empty) {
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any } as Treatment));
      }
    } catch (e) {
      console.warn("Firestore fetchTreatments failed, using localStorage fallback:", e);
    }
  }
  return getLocalStorageData<Treatment>("treatments", DEFAULT_TREATMENTS);
};

export const createTreatment = async (t: Omit<Treatment, "id">): Promise<boolean> => {
  const newT: Treatment = {
    ...t,
    id: `t_${Date.now()}`
  };

  if (isFirebaseWorking()) {
    try {
      await addDoc(collection(db, "treatments"), {
        name: t.name,
        description: t.description,
        price: t.price,
        duration: t.duration || 60,
        createdAt: new Date()
      });
      return true;
    } catch (e) {
      console.error("Firestore createTreatment failed:", e);
    }
  }

  // Fallback / local
  const current = getLocalStorageData<Treatment>("treatments", DEFAULT_TREATMENTS);
  current.push(newT);
  saveLocalStorageData("treatments", current);
  return true;
};

export const deleteTreatment = async (id: string): Promise<boolean> => {
  if (isFirebaseWorking() && !id.startsWith("t_")) {
    try {
      await deleteDoc(doc(db, "treatments", id));
      return true;
    } catch (e) {
      console.error("Firestore deleteTreatment failed:", e);
    }
  }

  const current = getLocalStorageData<Treatment>("treatments", DEFAULT_TREATMENTS);
  const updated = current.filter(t => t.id !== id);
  saveLocalStorageData("treatments", updated);
  return true;
};

// ------------------------------------------------------------
// PRODUCTS SERVICE API
// ------------------------------------------------------------
export const fetchProducts = async (): Promise<Product[]> => {
  if (isFirebaseWorking()) {
    try {
      const snap = await getDocs(collection(db, "products"));
      if (!snap.empty) {
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any } as Product));
      }
    } catch (e) {
      console.warn("Firestore fetchProducts failed, using localStorage fallback:", e);
    }
  }
  return getLocalStorageData<Product>("products", DEFAULT_PRODUCTS);
};

export const createProduct = async (p: Omit<Product, "id">): Promise<boolean> => {
  const newP: Product = {
    ...p,
    id: `p_${Date.now()}`
  };

  if (isFirebaseWorking()) {
    try {
      await addDoc(collection(db, "products"), {
        name: p.name,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl || "",
        createdAt: new Date()
      });
      return true;
    } catch (e) {
      console.error("Firestore createProduct failed:", e);
    }
  }

  const current = getLocalStorageData<Product>("products", DEFAULT_PRODUCTS);
  current.push(newP);
  saveLocalStorageData("products", current);
  return true;
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  if (isFirebaseWorking() && !id.startsWith("p_")) {
    try {
      await deleteDoc(doc(db, "products", id));
      return true;
    } catch (e) {
      console.error("Firestore deleteProduct failed:", e);
    }
  }

  const current = getLocalStorageData<Product>("products", DEFAULT_PRODUCTS);
  const updated = current.filter(p => p.id !== id);
  saveLocalStorageData("products", updated);
  return true;
};

// ------------------------------------------------------------
// BOOKINGS SERVICE API
// ------------------------------------------------------------
export const fetchBookings = async (userId?: string): Promise<Booking[]> => {
  if (isFirebaseWorking()) {
    try {
      let q;
      if (userId) {
        q = query(
          collection(db, "bookings"),
          where("userId", "==", userId),
          orderBy("createdAt", "desc")
        );
      } else {
        q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
      }
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any } as Booking));
    } catch (e) {
      console.warn("Firestore fetchBookings failed, fallback to local:", e);
    }
  }

  const allBookings = getLocalStorageData<Booking>("bookings", []);
  if (userId) {
    return allBookings.filter(b => b.userId === userId);
  }
  return allBookings;
};

export const createBooking = async (b: Omit<Booking, "id" | "status" | "createdAt">): Promise<boolean> => {
  const customerName = b.customerName || b.userName || "Customer";
  const whatsapp = b.whatsapp || "";
  const email = b.email || b.userEmail || "";
  const service = b.service || b.treatment || "";
  const bookingDate = b.bookingDate || b.date || "";
  const bookingTime = b.bookingTime || b.time || "";

  const newBooking: Booking = {
    ...b,
    customerName,
    whatsapp,
    email,
    service,
    bookingDate,
    bookingTime,
    id: `b_${Date.now()}`,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  if (isFirebaseWorking()) {
    try {
      await addDoc(collection(db, "bookings"), {
        ...b,
        customerName,
        whatsapp,
        email,
        service,
        bookingDate,
        bookingTime,
        status: "pending",
        createdAt: new Date()
      });
      return true;
    } catch (e) {
      console.error("Firestore createBooking failed:", e);
    }
  }

  const current = getLocalStorageData<Booking>("bookings", []);
  current.push(newBooking);
  saveLocalStorageData("bookings", current);

  // Add points to user profile on new booking (+10 point)
  await updateUserPoints(b.userId, 10);
  return true;
};

// Real-time booking listeners
export const subscribeBookings = (userId: string, callback: (bookings: Booking[]) => void): (() => void) => {
  if (isFirebaseWorking()) {
    const q = query(
      collection(db, "bookings"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any } as Booking));
      callback(list);
    }, (err) => {
      console.warn("Real-time bookings snapshot subscription failed, using fallback:", err);
    });
  }
  
  // Fallback / local polling or immediate trigger
  const localList = getLocalStorageData<Booking>("bookings", []).filter(b => b.userId === userId);
  callback(localList);
  return () => {};
};

export const subscribeAllBookings = (callback: (bookings: Booking[]) => void): (() => void) => {
  if (isFirebaseWorking()) {
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any } as Booking));
      callback(list);
    }, (err) => {
      console.warn("Real-time bookings snapshot sub failed:", err);
    });
  }
  
  const localList = getLocalStorageData<Booking>("bookings", []);
  callback(localList);
  return () => {};
};

export const updateBookingStatus = async (id: string, status: Booking["status"]): Promise<boolean> => {
  if (isFirebaseWorking() && !id.startsWith("b_")) {
    try {
      await updateDoc(doc(db, "bookings", id), { status });
      return true;
    } catch (e) {
      console.error("Firestore updateBookingStatus failed:", e);
    }
  }

  const current = getLocalStorageData<Booking>("bookings", []);
  const bookingIdx = current.findIndex(b => b.id === id);
  if (bookingIdx !== -1) {
    const booking = current[bookingIdx];
    const prevStatus = booking.status;
    booking.status = status;
    saveLocalStorageData("bookings", current);

    // If booking completes (status 'done'), reward +25 points
    if (status === "done" && prevStatus !== "done") {
      await updateUserPoints(booking.userId, 25);
    }
    return true;
  }
  return false;
};

export const removeBooking = async (id: string): Promise<boolean> => {
  if (isFirebaseWorking() && !id.startsWith("b_")) {
    try {
      await deleteDoc(doc(db, "bookings", id));
      return true;
    } catch (e) {
      console.error("Firestore removeBooking failed:", e);
    }
  }

  const current = getLocalStorageData<Booking>("bookings", []);
  const updated = current.filter(b => b.id !== id);
  saveLocalStorageData("bookings", updated);
  return true;
};

// ------------------------------------------------------------
// USER SERVICES & MEMBERSHIP API
// ------------------------------------------------------------
const calculateLevel = (points: number): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' => {
  if (points >= 3000) return 'Platinum';
  if (points >= 1500) return 'Gold';
  if (points >= 500) return 'Silver';
  return 'Bronze';
};

export const fetchUserProfile = async (userId: string, defaultUser?: { displayName: string, email: string, photoURL?: string | null }): Promise<UserProfile> => {
  if (isFirebaseWorking()) {
    try {
      const snap = await getDoc(doc(db, "users", userId));
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        // If the user matches existing data but does not have a photoURL or we want to keep it sync:
        if (defaultUser?.photoURL && data.photoURL !== defaultUser.photoURL) {
          await updateDoc(doc(db, "users", userId), { photoURL: defaultUser.photoURL });
          data.photoURL = defaultUser.photoURL;
        }
        return data;
      } else if (defaultUser) {
        const defaultProfile: UserProfile = {
          uid: userId,
          displayName: defaultUser.displayName || "User",
          email: defaultUser.email,
          photoURL: defaultUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${defaultUser.displayName}`,
          level: "Bronze",
          points: 15, // Welcome gift points
          whatsapp: "",
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, "users", userId), defaultProfile);
        return defaultProfile;
      }
    } catch (e) {
      console.warn("Firestore fetchUserProfile failed, fallback to local:", e);
    }
  }

  // Local Fallback
  const profiles = getLocalStorageData<UserProfile>("user_profiles", []);
  let found = profiles.find(p => p.uid === userId);
  if (!found && defaultUser) {
    found = {
      uid: userId,
      displayName: defaultUser.displayName || "User",
      email: defaultUser.email,
      photoURL: defaultUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${defaultUser.displayName}`,
      level: "Bronze",
      points: 15,
      whatsapp: "",
      createdAt: new Date().toISOString()
    };
    profiles.push(found);
    saveLocalStorageData("user_profiles", profiles);
  } else if (found && defaultUser?.photoURL && found.photoURL !== defaultUser.photoURL) {
    found.photoURL = defaultUser.photoURL;
    saveLocalStorageData("user_profiles", profiles);
  }
  return found || {
    uid: userId,
    displayName: "Pengunjung",
    email: "guest@alisyabeauty.com",
    photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=guest",
    level: "Bronze",
    points: 0,
    whatsapp: ""
  };
};

export const updateUserWhatsapp = async (userId: string, whatsapp: string): Promise<boolean> => {
  if (isFirebaseWorking()) {
    try {
      await updateDoc(doc(db, "users", userId), { whatsapp });
      return true;
    } catch (e) {
      console.error("Firestore updateUserWhatsapp failed:", e);
    }
  }

  const profiles = getLocalStorageData<UserProfile>("user_profiles", []);
  const profile = profiles.find(p => p.uid === userId);
  if (profile) {
    profile.whatsapp = whatsapp;
    saveLocalStorageData("user_profiles", profiles);
    return true;
  }
  return false;
};

export const updateUserPoints = async (userId: string, pointsDelta: number): Promise<number> => {
  let finalPoints = 15;

  if (isFirebaseWorking()) {
    try {
      const ref = doc(db, "users", userId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const u = snap.data() as UserProfile;
        const pts = (u.points || 0) + pointsDelta;
        const level = calculateLevel(pts);
        await updateDoc(ref, { points: pts, level });
        return pts;
      }
    } catch (e) {
      console.error("Firestore updateUserPoints failed:", e);
    }
  }

  const profiles = getLocalStorageData<UserProfile>("user_profiles", []);
  const profile = profiles.find(p => p.uid === userId);
  if (profile) {
    profile.points = Math.max(0, (profile.points || 0) + pointsDelta);
    profile.level = calculateLevel(profile.points);
    saveLocalStorageData("user_profiles", profiles);
    finalPoints = profile.points;
  }
  return finalPoints;
};

// ------------------------------------------------------------
// REVIEWS SERVICE API
// ------------------------------------------------------------
const DEFAULT_REVIEWS: Review[] = [
  {
    id: "r1",
    bookingId: "b_sample_1",
    userId: "guest_99",
    userName: "Zulfa Shaliha",
    userPhoto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
    rating: 5,
    comment: "Sangat puas dengan Alisya Royal Hair Spa! Rambut jadi wangi, halus, dan lepek berkurang jauh setelah rutin perawatan di sini. Terapisnya sangat ramah & sopan.",
    createdAt: "2026-06-05T09:30:00.000Z",
    service: "Alisya Royal Hair Spa & Hijab Care"
  },
  {
    id: "r2",
    bookingId: "b_sample_2",
    userId: "guest_sample_a",
    userName: "Nadia Rahma",
    userPhoto: "https://api.dicebear.com/7.x/adventurer/svg?seed=Nadia",
    rating: 5,
    comment: "Ruang perawatannya benar-benar tertutup rapat, privat sekali jadi tenang sebagai muslimah. Facial kolagennya segar dan wajah langsung cerah glowing seketika!",
    createdAt: "2026-06-03T14:15:00.000Z",
    service: "Royal Facial Glow Kolagen"
  },
  {
    id: "r3",
    bookingId: "b_sample_3",
    userId: "guest_sample_b",
    userName: "Aisyah Zahra",
    userPhoto: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aisyah",
    rating: 4,
    comment: "Pijat tradisional dan lulurnya super mantap. Pegal-pegal hilang semua, aroma lulur rempahnya wangi sekali dan menenangkan pikiran. Tempat bersih sekali.",
    createdAt: "2026-06-01T11:00:00.000Z",
    service: "Traditional Indonesian Massage & Lulur Rempah"
  }
];

export const fetchReviews = async (): Promise<Review[]> => {
  if (isFirebaseWorking()) {
    try {
      const snap = await getDocs(query(collection(db, "reviews"), orderBy("createdAt", "desc")));
      if (!snap.empty) {
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any } as Review));
      }
    } catch (e) {
      console.warn("Firestore fetchReviews failed, using localStorage fallback:", e);
    }
  }
  return getLocalStorageData<Review>("reviews", DEFAULT_REVIEWS);
};

export const createReview = async (r: Omit<Review, "id">): Promise<boolean> => {
  const newReview: Review = {
    ...r,
    id: `r_${Date.now()}`
  };

  if (isFirebaseWorking()) {
    try {
      await addDoc(collection(db, "reviews"), {
        ...r,
        createdAt: new Date().toISOString()
      });
      return true;
    } catch (e) {
      console.error("Firestore createReview failed:", e);
    }
  }

  // Fallback to local
  const current = getLocalStorageData<Review>("reviews", DEFAULT_REVIEWS);
  current.unshift(newReview); // put newest on top
  saveLocalStorageData("reviews", current);
  return true;
};

export const fetchReviewedBookingIds = async (userId: string): Promise<string[]> => {
  if (isFirebaseWorking()) {
    try {
      const q = query(collection(db, "reviews"), where("userId", "==", userId));
      const snap = await getDocs(q);
      return snap.docs.map(doc => doc.data().bookingId);
    } catch (e) {
      console.warn("Firestore fetchReviewedBookingIds failed:", e);
    }
  }

  const current = getLocalStorageData<Review>("reviews", DEFAULT_REVIEWS);
  return current.filter(r => r.userId === userId).map(r => r.bookingId);
};
