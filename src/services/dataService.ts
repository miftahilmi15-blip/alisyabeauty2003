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
  onSnapshot,
  runTransaction,
  serverTimestamp
} from "firebase/firestore";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FbUser
} from "firebase/auth";
import { Treatment, Product, Booking, UserProfile, Review, SalonBranch, Promo, ShopOrder, GalleryItem } from "../types";
import alisyaStorefront from "../assets/images/alisya_storefront_1781047413956.png";

export const convertTimestampsToStrings = (data: any): any => {
  if (data === null || data === undefined) return data;
  
  if (typeof data.toDate === "function") {
    return data.toDate().toISOString();
  }
  
  if (typeof data === "object") {
    if (data.seconds !== undefined && data.nanoseconds !== undefined && typeof data.seconds === 'number' && typeof data.nanoseconds === 'number') {
      return new Date(data.seconds * 1000 + Math.floor(data.nanoseconds / 1000000)).toISOString();
    }
    if (Array.isArray(data)) {
      return data.map(convertTimestampsToStrings);
    }
    if (Object.prototype.toString.call(data) === "[object Object]") {
      const result: any = {};
      for (const key of Object.keys(data)) {
        result[key] = convertTimestampsToStrings(data[key]);
      }
      return result;
    }
  }
  
  return data;
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Default pre-populated data for a premium experience
const DEFAULT_TREATMENTS: Treatment[] = [];

const DEFAULT_PRODUCTS: Product[] = [];

// Programmatic cache-clear migration to ensure legacy pre-filled data is deleted for the user immediately
try {
  const isCleanSlate = localStorage.getItem("alisya_cleanslate_v4");
  if (!isCleanSlate) {
    localStorage.removeItem("alisya_treatments");
    localStorage.removeItem("alisya_products");
    localStorage.removeItem("alisya_local_user");
    localStorage.removeItem("alisya_user_profiles");
    localStorage.removeItem("alisya_deleted_treatments");
    localStorage.removeItem("alisya_deleted_products");
    localStorage.setItem("alisya_cleanslate_v4", "true");
  }
} catch (e) {
  console.warn("Cleanup migration failed:", e);
}

// Helper to check if a user is a local/demo user (offline bypass)
export const checkIsLocalUser = (userId: string | null | undefined): boolean => {
  if (!userId) return true;
  const id = userId.toLowerCase();
  return id.startsWith("u_") || 
         id.startsWith("temp_") || 
         id.startsWith("demo") || 
         id.startsWith("guest") || 
         id.startsWith("adm");
};

// Helper to check if Firebase is available
const isFirebaseWorking = () => {
  return !!db && !!auth;
};

// Recursive helper to clean undefined fields before saving to Firestore
const removeUndefinedFields = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map(removeUndefinedFields);
  
  const clean: any = {};
  Object.keys(obj).forEach(key => {
    const val = obj[key];
    if (val !== undefined) {
      clean[key] = removeUndefinedFields(val);
    }
  });
  return clean;
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

const getDeletedIds = (key: string): string[] => {
  try {
    const val = localStorage.getItem(`alisya_deleted_${key}`);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
};

const addDeletedId = (key: string, id: string) => {
  try {
    const ids = getDeletedIds(key);
    if (!ids.includes(id)) {
      ids.push(id);
      localStorage.setItem(`alisya_deleted_${key}`, JSON.stringify(ids));
    }
  } catch (e) {
    console.error("Failed to save deleted ID:", e);
  }
};

// ------------------------------------------------------------
// TREATMENTS SERVICE API
// ------------------------------------------------------------
export const fetchTreatments = async (): Promise<Treatment[]> => {
  const deletedIds = getDeletedIds("treatments");
  let list: Treatment[] = [];
  if (isFirebaseWorking()) {
    try {
      const snap = await getDocs(collection(db, "treatments"));
      list = snap.docs.map(doc => convertTimestampsToStrings({ id: doc.id, ...doc.data() as any }) as Treatment);
    } catch (e) {
      console.warn("Firestore fetchTreatments failed, using localStorage fallback:", e);
      list = getLocalStorageData<Treatment>("treatments", DEFAULT_TREATMENTS);
    }
  } else {
    list = getLocalStorageData<Treatment>("treatments", DEFAULT_TREATMENTS);
  }
  return list.filter(t => !deletedIds.includes(t.id));
};

export const createTreatment = async (t: Omit<Treatment, "id">): Promise<boolean> => {
  let finalId = `t_${Date.now()}`;

  if (isFirebaseWorking()) {
    try {
      const docRef = await addDoc(collection(db, "treatments"), {
        name: t.name,
        description: t.description,
        price: t.price,
        duration: t.duration || 60,
        category: t.category || "Hair",
        createdAt: serverTimestamp()
      });
      finalId = docRef.id;
    } catch (e) {
      console.warn("Firestore createTreatment failed, using local storage fallback:", e);
    }
  }

  const newT: Treatment = {
    ...t,
    id: finalId
  };

  const current = getLocalStorageData<Treatment>("treatments", DEFAULT_TREATMENTS);
  current.push(newT);
  saveLocalStorageData("treatments", current);
  return true;
};

export const deleteTreatment = async (id: string): Promise<boolean> => {
  let success = true;
  addDeletedId("treatments", id);

  if (isFirebaseWorking() && !id.startsWith("t_")) {
    try {
      await deleteDoc(doc(db, "treatments", id));
    } catch (e) {
      console.warn("Firestore deleteTreatment failed, falling back to local deletion:", e);
    }
  }

  const current = getLocalStorageData<Treatment>("treatments", DEFAULT_TREATMENTS);
  const updated = current.filter(t => t.id !== id);
  saveLocalStorageData("treatments", updated);
  return success;
};

// ------------------------------------------------------------
// PRODUCTS SERVICE API
// ------------------------------------------------------------
export const fetchProducts = async (): Promise<Product[]> => {
  const deletedIds = getDeletedIds("products");
  let list: Product[] = [];
  if (isFirebaseWorking()) {
    try {
      const snap = await getDocs(collection(db, "products"));
      list = snap.docs.map(doc => convertTimestampsToStrings({ id: doc.id, ...doc.data() as any }) as Product);
    } catch (e) {
      console.warn("Firestore fetchProducts failed, using localStorage fallback:", e);
      list = getLocalStorageData<Product>("products", DEFAULT_PRODUCTS);
    }
  } else {
    list = getLocalStorageData<Product>("products", DEFAULT_PRODUCTS);
  }
  return list.filter(p => !deletedIds.includes(p.id));
};

export const createProduct = async (p: Omit<Product, "id">): Promise<boolean> => {
  let finalId = `p_${Date.now()}`;

  if (isFirebaseWorking()) {
    try {
      const docRef = await addDoc(collection(db, "products"), {
        name: p.name,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl || "",
        createdAt: serverTimestamp()
      });
      finalId = docRef.id;
    } catch (e) {
      console.warn("Firestore createProduct failed, using local storage fallback:", e);
    }
  }

  const newP: Product = {
    ...p,
    id: finalId
  };

  const current = getLocalStorageData<Product>("products", DEFAULT_PRODUCTS);
  current.push(newP);
  saveLocalStorageData("products", current);
  return true;
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  let success = true;
  addDeletedId("products", id);

  if (isFirebaseWorking() && !id.startsWith("p_")) {
    try {
      await deleteDoc(doc(db, "products", id));
    } catch (e) {
      console.warn("Firestore deleteProduct failed, falling back to local deletion:", e);
    }
  }

  const current = getLocalStorageData<Product>("products", DEFAULT_PRODUCTS);
  const updated = current.filter(p => p.id !== id);
  saveLocalStorageData("products", updated);
  return success;
};

// ------------------------------------------------------------
// BOOKINGS SERVICE API
// ------------------------------------------------------------
export const fetchBookings = async (userId?: string): Promise<Booking[]> => {
  const isLocal = checkIsLocalUser(userId);
  if (isFirebaseWorking() && !isLocal && auth?.currentUser) {
    try {
      let q;
      let shouldSort = false;
      if (userId) {
        q = query(
          collection(db, "bookings"),
          where("userId", "==", userId)
        );
        shouldSort = true;
      } else {
        q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
      }
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => convertTimestampsToStrings({ id: doc.id, ...doc.data() as any }) as Booking);
      if (shouldSort) {
        list.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      }
      return list;
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

export const timeToMinutes = (time: string): number => {
  if (!time) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

export const minutesToTime = (mins: number): string => {
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const isTimeOverlap = (start1: number, end1: number, start2: number, end2: number): boolean => {
  return start1 < end2 && end1 > start2;
};

export const createBooking = async (b: Omit<Booking, "id" | "status" | "createdAt">): Promise<boolean> => {
  const customerName = b.customerName || b.userName || "Customer";
  const whatsapp = b.whatsapp || "";
  const email = b.email || b.userEmail || "";
  const service = b.service || b.treatment || "";
  const bookingDate = b.bookingDate || b.date || "";
  const bookingTime = b.bookingTime || b.time || "";
  const room = b.room || "Ruangan 1";
  const therapist = b.therapist || "any";

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

  // Perform operational & scheduling validations
  const startMin = timeToMinutes(bookingTime);
  const openMin = timeToMinutes("09:00");
  const closeMin = timeToMinutes("21:00");

  const todayStr = new Date().toISOString().split('T')[0];
  if (bookingDate < todayStr) {
    throw new Error("Tanggal booking di masa lalu tidak diperbolehkan.");
  }

  if (bookingDate === todayStr) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    if (startMin < currentMinutes) {
      throw new Error("Waktu booking untuk hari ini sudah lewat.");
    }
  }

  if (startMin < openMin || startMin > closeMin) {
    throw new Error("Jam pemesanan berada di luar jam operasional (09:00 - 21:00 WIB).");
  }

  const isLocal = checkIsLocalUser(b.userId);
  if (isFirebaseWorking() && !isLocal && auth?.currentUser) {
    try {
      // 1. Fetch treatments to find duration of current service
      let duration = 60; // Default fallback to 60 Minutes
      const treatmentsSnap = await getDocs(collection(db, "treatments"));
      const treatmentDurations = new Map<string, number>();
      
      treatmentsSnap.docs.forEach(docSnap => {
        const data = docSnap.data();
        if (data.name) {
          treatmentDurations.set(data.name, Number(data.duration) || 60);
        }
      });

      const matchedDuration = treatmentDurations.get(service);
      if (matchedDuration) {
        duration = matchedDuration;
      }

      // Check if duration exceeds operational closing time
      const endMin = startMin + duration;
      if (endMin > closeMin) {
        throw new Error(`Durasi perawatan (${duration} Menit) melebihi jam operasional salon (Tutup pukul 21:00 WIB). Silakan pilih jam lebih awal.`);
      }

      // Check therapist holiday (libur)
      const dateObj = new Date(bookingDate);
      const bookingDay = dateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.
      if (therapist === "Siti Farida" && bookingDay === 1) {
        throw new Error("Ustadzah Siti Farida tidak bertugas (Libur) pada hari Senin.");
      }
      if (therapist === "Rania Safitri" && bookingDay === 0) {
        throw new Error("Rania Safitri tidak bertugas (Libur) pada hari Minggu.");
      }

      // Check room maintenance
      if (room === "Ruangan 3" && bookingDay === 3) {
        throw new Error("Ruangan 3 sedang dalam pemeliharaan berkala (Maintenance) setiap hari Rabu.");
      }

      // Check therapist break time (12:00 - 13:00)
      const breakStart = 12 * 60;
      const breakEnd = 13 * 60;
      if (therapist !== "any" && isTimeOverlap(startMin, endMin, breakStart, breakEnd)) {
        throw new Error("Terapis sedang dalam jam istirahat (12:00 - 13:00 WIB). Silakan pilih jam lain.");
      }

      // 2. Fetch all bookings for this date first (to find document references for the transaction)
      const bookingsQuery = query(
        collection(db, "booked_slots"),
        where("bookingDate", "==", bookingDate)
      );
      const bookingsSnap = await getDocs(bookingsQuery);

      // 3. Perform Firestore transaction to lock the date and write the booking
      await runTransaction(db, async (transaction) => {
        // Read and write the date lock to serialize transactions for this date
        const lockRef = doc(db, "booking_locks", bookingDate);
        const lockSnap = await transaction.get(lockRef);

        // Track each of the existing booking documents to ensure they haven't changed status
        const bookingsData: Booking[] = [];
        for (const docSnap of bookingsSnap.docs) {
          const bSnap = await transaction.get(docSnap.ref);
          if (bSnap.exists()) {
            bookingsData.push({ id: bSnap.id, ...bSnap.data() } as Booking);
          }
        }

        // Check overlapping bookings
        for (const b of bookingsData) {
          const bStatus = b.status || "pending";
          if (bStatus === "cancelled") continue;

          const isSameRoom = (b.room || "Ruangan 1") === room;
          const isSameTherapist = therapist !== "any" && b.therapist === therapist;

          if (isSameRoom || isSameTherapist) {
            const bTime = b.bookingTime || b.time || "";
            const bService = b.service || b.treatment || "";
            const bDuration = treatmentDurations.get(bService) || 60;
            const bStart = timeToMinutes(bTime);
            const bEnd = bStart + bDuration;

            if (isTimeOverlap(startMin, endMin, bStart, bEnd)) {
              if (isSameRoom) {
                throw new Error("Maaf, slot ini baru saja dipesan oleh pelanggan lain. Silakan pilih jadwal yang berbeda.");
              } else {
                throw new Error(`Terapis ${therapist} baru saja dipesan untuk layanan lain pada jam tersebut.`);
              }
            }
          }
        }

        // Create locks entry/increment logic
        if (!lockSnap.exists()) {
          transaction.set(lockRef, { createdAt: serverTimestamp(), updatedCount: 1 });
        } else {
          const currentCount = lockSnap.data()?.updatedCount || 0;
          transaction.update(lockRef, { updatedCount: currentCount + 1, lastUpdatedAt: serverTimestamp() });
        }

        // Complete the writing of the booking
        const cleanDataWithoutTimestamp = removeUndefinedFields({
          ...b,
          customerName,
          whatsapp,
          email,
          service,
          bookingDate,
          bookingTime,
          status: "pending"
        });
        const cleanData = {
          ...cleanDataWithoutTimestamp,
          createdAt: serverTimestamp()
        };

        const newBookingRef = doc(collection(db, "bookings"));
        transaction.set(newBookingRef, cleanData);

        // Also create a public slot shadow entry
        const slotRef = doc(db, "booked_slots", newBookingRef.id);
        transaction.set(slotRef, {
          id: newBookingRef.id,
          bookingDate,
          bookingTime,
          room: room || "Ruangan 1",
          therapist: therapist || "any",
          status: "pending",
          service: service || "",
          createdAt: serverTimestamp()
        });
      });

      // Add loyalty points
      await updateUserPoints(b.userId, 10);
      return true;

    } catch (e: any) {
      console.error("Firestore createBooking transaction failed:", e);
      // Propagate explicit business/validation exceptions to UI
      const msg = e?.message || "";
      if (
        msg.includes("Maaf, slot ini") ||
        msg.includes("Terapis") ||
        msg.includes("Ruangan") ||
        msg.includes("Tanggal") ||
        msg.includes("Jam") ||
        msg.includes("Waktu") ||
        msg.includes("Durasi")
      ) {
        throw e;
      }
      if (navigator.onLine) {
        throw e;
      }
    }
  }

  if (navigator.onLine) {
    throw new Error("Koneksi gagal saat melakukan pemesanan online.");
  }

  addToSyncQueue('createBooking', b);

  // Fallback pattern if Firebase is not working and user is truly offline
  const current = getLocalStorageData<Booking>("bookings", []);
  current.push(newBooking);
  saveLocalStorageData("bookings", current);

  await updateUserPoints(b.userId, 10);
  return true;
};

// Real-time booking listeners
export const subscribeBookings = (userId: string, callback: (bookings: Booking[]) => void): (() => void) => {
  let unsubFirestore: (() => void) | null = null;
  let interval: any = null;

  const startLocalFallback = () => {
    if (interval) return;
    let lastValString = "";
    interval = setInterval(() => {
      const current = getLocalStorageData<Booking>("bookings", []);
      const filtered = current.filter(b => b.userId === userId);
      const valString = JSON.stringify(filtered);
      if (valString !== lastValString) {
        lastValString = valString;
        callback(filtered);
      }
    }, 1000);
  };

  const isLocal = checkIsLocalUser(userId);
  if (isFirebaseWorking() && userId && !isLocal && auth?.currentUser) {
    try {
      const q = query(
        collection(db, "bookings"),
        where("userId", "==", userId)
      );
      unsubFirestore = onSnapshot(q, (snap) => {
        const list = snap.docs.map(doc => convertTimestampsToStrings({ id: doc.id, ...doc.data() as any }) as Booking);
        list.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        callback(list);
      }, (err) => {
        console.warn("Real-time bookings snapshot subscription failed, using local fallback:", err);
        startLocalFallback();
      });
    } catch (err) {
      console.warn("Failed to attach bookings snapshot listener, fallback to local:", err);
      startLocalFallback();
    }
  } else {
    // Immediate callback + fallback interval
    const current = getLocalStorageData<Booking>("bookings", []);
    const filtered = current.filter(b => b.userId === userId);
    callback(filtered);
    startLocalFallback();
  }

  return () => {
    if (unsubFirestore) {
      unsubFirestore();
    }
    if (interval) {
      clearInterval(interval);
    }
  };
};

export const subscribeAllBookings = (callback: (bookings: Booking[]) => void): (() => void) => {
  let unsubFirestore: (() => void) | null = null;
  let interval: any = null;

  const startLocalFallback = () => {
    if (interval) return;
    let lastValString = "";
    interval = setInterval(() => {
      const current = getLocalStorageData<Booking>("bookings", []);
      const valString = JSON.stringify(current);
      if (valString !== lastValString) {
        lastValString = valString;
        callback(current);
      }
    }, 1000);
  };

  if (isFirebaseWorking()) {
    try {
      const q = query(collection(db, "booked_slots"), orderBy("createdAt", "desc"));
      unsubFirestore = onSnapshot(q, (snap) => {
        const list = snap.docs.map(doc => convertTimestampsToStrings({ id: doc.id, ...doc.data() as any }) as Booking);
        callback(list);
      }, (err) => {
        console.warn("Real-time all bookings snapshot failed, fallback to local:", err);
        startLocalFallback();
      });
    } catch (err) {
      console.warn("Failed to attach all bookings snapshot listener, fallback to local:", err);
      startLocalFallback();
    }
  } else {
    // Immediate fallback + fallback interval
    const current = getLocalStorageData<Booking>("bookings", []);
    callback(current);
    startLocalFallback();
  }

  return () => {
    if (unsubFirestore) {
      unsubFirestore();
    }
    if (interval) {
      clearInterval(interval);
    }
  };
};

export const updateBookingStatus = async (id: string, status: Booking["status"]): Promise<boolean> => {
  if (isFirebaseWorking() && !id.startsWith("b_")) {
    try {
      const bookingRef = doc(db, "bookings", id);
      const snap = await getDoc(bookingRef);
      if (snap.exists()) {
        const booking = convertTimestampsToStrings(snap.data()) as Booking;
        const prevStatus = booking.status;
        await updateDoc(bookingRef, { status });
        
        // Propagate status change to booked_slots
        try {
          await updateDoc(doc(db, "booked_slots", id), { status });
        } catch (err) {
          console.warn("Failed to update status in booked_slots:", err);
        }
        
        if (status === "done" && prevStatus !== "done" && booking.userId) {
          await updateUserPoints(booking.userId, 25);
        }
      } else {
        await updateDoc(bookingRef, { status });
        try {
          await updateDoc(doc(db, "booked_slots", id), { status });
        } catch (err) {
          // ignore if slot doesn't exist
        }
      }
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
      try {
        await deleteDoc(doc(db, "booked_slots", id));
      } catch (err) {
        // ignore if slot doesn't exist
      }
      return true;
    } catch (e) {
      console.error("Firestore removeBooking failed:", e);
      return false;
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

// ------------------------------------------------------------
// OFFLINE SYNC QUEUE ENGINE
// ------------------------------------------------------------
export interface SyncTask {
  id: string;
  type: 'createBooking' | 'createShopOrder' | 'createReview' | 'createUserProfile' | 'updateUserWhatsapp' | 'updateUserPoints' | 'createPromo';
  payload: any;
  createdAt: string;
}

export const addToSyncQueue = (type: SyncTask['type'], payload: any) => {
  try {
    const queue = getLocalStorageData<SyncTask>("sync_queue", []);
    const newTask: SyncTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      type,
      payload,
      createdAt: new Date().toISOString()
    };
    queue.push(newTask);
    saveLocalStorageData("sync_queue", queue);
    console.log(`[Sync Queue] Enqueued offline task: ${type}`, newTask);
  } catch (err) {
    console.error("Failed to enqueue offline task:", err);
  }
};

let isSyncing = false;

export const syncOfflineQueue = async (): Promise<void> => {
  if (isSyncing) return;
  if (!navigator.onLine || !isFirebaseWorking()) return;

  const queue = getLocalStorageData<SyncTask>("sync_queue", []);
  if (queue.length === 0) return;

  isSyncing = true;
  console.log(`[Sync Queue] Initiating upload flow for ${queue.length} pending offline tasks...`);

  const failedTasks: SyncTask[] = [];

  for (const task of queue) {
    try {
      // Preemptively check if the task belongs to a specific user and ensure they are authenticated
      const taskUserId = task.payload?.userId || task.payload?.uid;
      if (taskUserId) {
        if (!auth?.currentUser) {
          console.warn(`[Sync Queue] Delaying task ${task.id} (${task.type}) because no user is currently authenticated.`);
          failedTasks.push(task);
          continue;
        }
        if (auth.currentUser.uid !== taskUserId) {
          console.warn(`[Sync Queue] Delaying task ${task.id} (${task.type}) because current authenticated user (${auth.currentUser.uid}) does not match task owner (${taskUserId}).`);
          failedTasks.push(task);
          continue;
        }
      }

      switch (task.type) {
        case 'createBooking': {
          const cleanData = removeUndefinedFields({
            ...task.payload,
            status: "pending",
            createdAt: serverTimestamp()
          });
          const newDocRef = doc(collection(db, "bookings"));
          await setDoc(newDocRef, cleanData);

          const slotRef = doc(db, "booked_slots", newDocRef.id);
          await setDoc(slotRef, {
            id: newDocRef.id,
            bookingDate: task.payload.bookingDate || task.payload.date || "",
            bookingTime: task.payload.bookingTime || task.payload.time || "",
            room: task.payload.room || "Ruangan 1",
            therapist: task.payload.therapist || "any",
            status: "pending",
            service: task.payload.service || task.payload.treatment || "",
            createdAt: serverTimestamp()
          });
          break;
        }
        case 'createShopOrder': {
          const cleanData = removeUndefinedFields({
            ...task.payload,
            status: "pending",
            createdAt: serverTimestamp()
          });
          await addDoc(collection(db, "shop_orders"), cleanData);
          break;
        }
        case 'createReview': {
          const cleanData = removeUndefinedFields({
            ...task.payload,
            createdAt: serverTimestamp()
          });
          await addDoc(collection(db, "reviews"), cleanData);
          break;
        }
        case 'createUserProfile': {
          const { userId, defaultUser } = task.payload;
          const defaultProfile: any = removeUndefinedFields({
            uid: userId,
            displayName: defaultUser.displayName || "User",
            email: defaultUser.email,
            photoURL: defaultUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${defaultUser.displayName}`,
            role: "user",
            level: "Bronze",
            points: 0,
            whatsapp: "",
            createdAt: serverTimestamp()
          });
          await setDoc(doc(db, "users", userId), defaultProfile);
          break;
        }
        case 'updateUserWhatsapp': {
          const { userId, whatsapp } = task.payload;
          await updateDoc(doc(db, "users", userId), { whatsapp });
          break;
        }
        case 'updateUserPoints': {
          const { userId, pointsDelta } = task.payload;
          const ref = doc(db, "users", userId);
          await runTransaction(db, async (tx) => {
            const snap = await tx.get(ref);
            if (snap.exists()) {
              const u = snap.data();
              const pts = (u.points || 0) + pointsDelta;
              const lvl = calculateLevel(pts);
              tx.update(ref, { points: pts, level: lvl });
            }
          });
          break;
        }
        case 'createPromo': {
          await addDoc(collection(db, "promos"), {
            title: task.payload.title,
            description: task.payload.description,
            code: task.payload.code || "",
            discountValue: task.payload.discountValue,
            type: task.payload.type,
            createdAt: serverTimestamp()
          });
          break;
        }
      }
      console.log(`[Sync Queue] Successfully uploaded enqueued task: ${task.id} (${task.type})`);
    } catch (err: any) {
      console.error(`[Sync Queue] Upload failed for task: ${task.id} (${task.type})`, err);
      const errMsg = err?.message || String(err);
      if (!navigator.onLine || errMsg.includes("offline") || errMsg.includes("network")) {
        failedTasks.push(task);
      }
    }
  }

  saveLocalStorageData("sync_queue", failedTasks);
  isSyncing = false;
};

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log("[Sync Queue] Connectivity re-established. Syncing offline tasks...");
    syncOfflineQueue().catch(err => console.error("Auto-sync error on online transition:", err));
  });

  setTimeout(() => {
    if (navigator.onLine) {
      syncOfflineQueue().catch(err => console.error("Startup auto-sync error:", err));
    }
  }, 4000);
}

export const fetchUserProfile = async (userId: string, defaultUser?: { displayName: string, email: string, photoURL?: string | null }): Promise<UserProfile> => {
  const isLocal = checkIsLocalUser(userId);
  if (isFirebaseWorking() && !isLocal && auth?.currentUser) {
    try {
      const snap = await getDoc(doc(db, "users", userId));
      if (snap.exists()) {
        const data = convertTimestampsToStrings(snap.data()) as UserProfile;
        // If the user matches existing data but does not have a photoURL or we want to keep it sync:
        if (defaultUser?.photoURL && data.photoURL !== defaultUser.photoURL) {
          await updateDoc(doc(db, "users", userId), { photoURL: defaultUser.photoURL });
          data.photoURL = defaultUser.photoURL;
        }
        return data;
      } else if (defaultUser) {
        const defaultProfile: any = removeUndefinedFields({
          uid: userId,
          displayName: defaultUser.displayName || "User",
          email: defaultUser.email,
          photoURL: defaultUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${defaultUser.displayName}`,
          role: "user",
          level: "Bronze",
          points: 0, // Initial points start from 0 representing 0 appointments
          whatsapp: "",
          createdAt: serverTimestamp()
        });
        await setDoc(doc(db, "users", userId), defaultProfile);
        return {
          ...defaultProfile,
          createdAt: new Date().toISOString()
        } as UserProfile;
      }
    } catch (e) {
      console.warn("Firestore fetchUserProfile failed, fallback to local:", e);
    }
  }

  if (defaultUser && !isLocal && navigator.onLine) {
    addToSyncQueue('createUserProfile', { userId, defaultUser });
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
      points: 0, // Initial points start from 0
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

export const subscribeUserProfile = (userId: string, callback: (profile: UserProfile) => void): (() => void) => {
  let unsubFirestore: (() => void) | null = null;
  let interval: any = null;

  const startLocalFallback = () => {
    if (interval) return;
    let lastValString = "";
    interval = setInterval(() => {
      const profiles = getLocalStorageData<UserProfile>("user_profiles", []);
      const found = profiles.find(p => p.uid === userId);
      if (found) {
        const valString = JSON.stringify(found);
        if (valString !== lastValString) {
          lastValString = valString;
          callback(found);
        }
      }
    }, 1000);
  };

  const isLocal = checkIsLocalUser(userId);
  if (isFirebaseWorking() && userId && !isLocal && auth?.currentUser) {
    try {
      unsubFirestore = onSnapshot(doc(db, "users", userId), (snap) => {
        if (snap.exists()) {
          callback(convertTimestampsToStrings({ uid: userId, ...snap.data() as any }) as UserProfile);
        }
      }, (err) => {
        console.warn("Real-time userProfile snapshot failed, fallback to local:", err);
        startLocalFallback();
      });
    } catch (err) {
      console.warn("Failed to attach userProfile snapshot listener, fallback to local:", err);
      startLocalFallback();
    }
  } else {
    // Set immediate callback if local profile exists
    const profiles = getLocalStorageData<UserProfile>("user_profiles", []);
    const found = profiles.find(p => p.uid === userId);
    if (found) {
      callback(found);
    }
    startLocalFallback();
  }

  return () => {
    if (unsubFirestore) {
      unsubFirestore();
    }
    if (interval) {
      clearInterval(interval);
    }
  };
};

export const updateUserWhatsapp = async (userId: string, whatsapp: string): Promise<boolean> => {
  const isLocal = checkIsLocalUser(userId);
  if (isFirebaseWorking() && !isLocal && auth?.currentUser) {
    try {
      await updateDoc(doc(db, "users", userId), { whatsapp });
      return true;
    } catch (e) {
      console.error("Firestore updateUserWhatsapp failed:", e);
      if (navigator.onLine) {
        throw e;
      }
    }
  }

  if (navigator.onLine) {
    throw new Error("Gagal memperbarui nomor WhatsApp saat online.");
  }

  addToSyncQueue('updateUserWhatsapp', { userId, whatsapp });

  const profiles = getLocalStorageData<UserProfile>("user_profiles", []);
  const profile = profiles.find(p => p.uid === userId);
  if (profile) {
    profile.whatsapp = whatsapp;
    saveLocalStorageData("user_profiles", profiles);
    return true;
  }
  return false;
};

export const updateUserAddress = async (
  userId: string, 
  address: string, 
  gpsLocation?: { latitude: number; longitude: number; accuracy?: number; mapsUrl?: string }
): Promise<boolean> => {
  const isLocal = checkIsLocalUser(userId);
  if (isFirebaseWorking() && !isLocal && auth?.currentUser) {
    try {
      await updateDoc(doc(db, "users", userId), { 
        address,
        gpsLocation: gpsLocation || null
      });
      return true;
    } catch (e) {
      console.error("Firestore updateUserAddress failed:", e);
      if (navigator.onLine) {
        throw e;
      }
    }
  }

  const profiles = getLocalStorageData<UserProfile>("user_profiles", []);
  const profile = profiles.find(p => p.uid === userId);
  if (profile) {
    profile.address = address;
    profile.gpsLocation = gpsLocation;
    saveLocalStorageData("user_profiles", profiles);
    return true;
  }
  return false;
};

export const updateUserPoints = async (userId: string, pointsDelta: number): Promise<number> => {
  let finalPoints = 0;

  const isLocal = checkIsLocalUser(userId);
  if (isFirebaseWorking() && !isLocal && auth?.currentUser) {
    try {
      const ref = doc(db, "users", userId);
      const updatedPtsFromTx = await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(ref);
        if (snap.exists()) {
          const u = snap.data() as UserProfile;
          const pts = (u.points || 0) + pointsDelta;
          const level = calculateLevel(pts);
          transaction.update(ref, { points: pts, level });
          return pts;
        }
        return 0;
      });
      if (updatedPtsFromTx > 0) {
        return updatedPtsFromTx;
      }
    } catch (e) {
      console.error("Firestore updateUserPoints failed:", e);
      if (navigator.onLine) {
        throw e;
      }
    }
  }

  if (navigator.onLine) {
    throw new Error("Gagal memperbarui poin loyalitas saat online.");
  }

  addToSyncQueue('updateUserPoints', { userId, pointsDelta });

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

export const resetUserProgress = async (userId: string): Promise<boolean> => {
  if (isFirebaseWorking()) {
    try {
      const q = query(
        collection(db, "bookings"),
        where("userId", "==", userId)
      );
      const snap = await getDocs(q);
      const promises = snap.docs.map(docRef => deleteDoc(doc(db, "bookings", docRef.id)));
      await Promise.all(promises);
      
      const userRef = doc(db, "users", userId);
      const snapUser = await getDoc(userRef);
      if (snapUser.exists()) {
        await updateDoc(userRef, { points: 0, level: 'Bronze' });
      }
    } catch (e) {
      console.warn("Firestore resetUserProgress failed, falling back to local:", e);
    }
  }

  const currentBookings = getLocalStorageData<Booking>("bookings", []);
  const updatedBookings = currentBookings.filter(b => b.userId !== userId);
  saveLocalStorageData("bookings", updatedBookings);

  const profiles = getLocalStorageData<UserProfile>("user_profiles", []);
  const profile = profiles.find(p => p.uid === userId);
  if (profile) {
    profile.points = 0;
    profile.level = 'Bronze';
    saveLocalStorageData("user_profiles", profiles);
  }

  try {
    const localUserStr = localStorage.getItem('alisya_local_user');
    if (localUserStr) {
      const u = JSON.parse(localUserStr);
      if (u.uid === userId) {
        u.points = 0;
        u.level = 'Bronze';
        localStorage.setItem('alisya_local_user', JSON.stringify(u));
      }
    }
  } catch (err) {
    console.warn("Local user update fail on reset:", err);
  }

  return true;
};

// ------------------------------------------------------------
// REVIEWS SERVICE API
// ------------------------------------------------------------
const DEFAULT_REVIEWS: Review[] = [];

export const fetchReviews = async (): Promise<Review[]> => {
  if (isFirebaseWorking()) {
    try {
      const snap = await getDocs(query(collection(db, "reviews"), orderBy("createdAt", "desc")));
      return snap.docs.map(doc => convertTimestampsToStrings({ id: doc.id, ...doc.data() as any }) as Review);
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

  const isLocal = checkIsLocalUser(r.userId);
  if (isFirebaseWorking() && !isLocal && auth?.currentUser) {
    try {
      const cleanData = removeUndefinedFields({
        ...r,
        createdAt: serverTimestamp()
      });
      await addDoc(collection(db, "reviews"), cleanData);
      return true;
    } catch (e) {
      console.error("Firestore createReview failed:", e);
      if (navigator.onLine) {
        throw e;
      }
    }
  }

  if (navigator.onLine) {
    throw new Error("Gagal mengirim ulasan saat online.");
  }

  addToSyncQueue('createReview', r);

  // Fallback to local
  const current = getLocalStorageData<Review>("reviews", DEFAULT_REVIEWS);
  current.unshift(newReview); // put newest on top
  saveLocalStorageData("reviews", current);
  return true;
};

export const fetchReviewedBookingIds = async (userId: string): Promise<string[]> => {
  const isLocal = checkIsLocalUser(userId);
  if (isFirebaseWorking() && !isLocal && auth?.currentUser) {
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

const DEFAULT_BRANCHES: SalonBranch[] = [
  {
    id: "br-01",
    name: "Alisya Premium Salon & Spa - Cirebon Arjawinangun",
    codename: "Alisya Arjawinangun",
    address: "Perumahan Grand Lavanda, Blok A No.1, Arjawinangun, Kec. Arjawinangun, Kabupaten Cirebon, Jawa Barat 45161",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Alisya+Premium+Salon+%26+Spa+Arjawinangun+Cirebon+Grand+Lavanda",
    phone: "0853-9999-8888",
    whatsapp: "6285399998888",
    operatingHours: "09:00 - 21:00 WIB (Senin - Minggu)",
    rating: 5.0,
    reviewCount: 154,
    features: ["Kamar Privat Muslimah", "Sangat Higienis", "100% Bebas Laki-Laki", "Free Fresh Drink"],
    distance: "0.1 km",
    estTime: "1 mnt jalan kaki",
    coordinateX: 45,
    coordinateY: 40,
    branchImage: alisyaStorefront
  }
];

export const fetchBranches = async (): Promise<SalonBranch[]> => {
  if (isFirebaseWorking()) {
    try {
      const snap = await getDocs(collection(db, "branches"));
      if (snap.docs.length > 0) {
        return snap.docs.map(doc => convertTimestampsToStrings({ id: doc.id, ...doc.data() as any }) as SalonBranch);
      }
    } catch (e) {
      console.warn("Firestore fetchBranches failed, using localStorage fallback:", e);
    }
  }
  return getLocalStorageData<SalonBranch>("branches", DEFAULT_BRANCHES);
};

export const createBranch = async (b: Omit<SalonBranch, "id">): Promise<boolean> => {
  const newB: SalonBranch = {
    ...b,
    id: `br_${Date.now()}`
  };

  if (isFirebaseWorking()) {
    try {
      await addDoc(collection(db, "branches"), {
        name: b.name,
        codename: b.codename,
        address: b.address,
        googleMapsUrl: b.googleMapsUrl,
        phone: b.phone,
        whatsapp: b.whatsapp,
        operatingHours: b.operatingHours,
        rating: b.rating || 5.0,
        reviewCount: b.reviewCount || 1,
        features: b.features,
        distance: b.distance || "1.0 km",
        estTime: b.estTime || "5 mnt berkendara",
        coordinateX: b.coordinateX || 50,
        coordinateY: b.coordinateY || 50,
        branchImage: b.branchImage || "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=400",
        createdAt: serverTimestamp()
      });
      return true;
    } catch (e) {
      console.error("Firestore createBranch failed:", e);
    }
  }

  const current = getLocalStorageData<SalonBranch>("branches", DEFAULT_BRANCHES);
  current.push(newB);
  saveLocalStorageData("branches", current);
  return true;
};

export const updateBranch = async (id: string, b: Partial<SalonBranch>): Promise<boolean> => {
  if (isFirebaseWorking()) {
    try {
      const ref = doc(db, "branches", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await updateDoc(ref, {
          ...b
        });
      } else {
        await setDoc(ref, {
          id,
          name: b.name || "Alisya Premium Salon & Spa - Cirebon Arjawinangun",
          codename: b.codename || "Alisya Arjawinangun",
          address: b.address || "Perumahan Grand Lavanda, Blok A No.1, Arjawinangun, Kec. Arjawinangun, Kabupaten Cirebon, Jawa Barat 45161",
          googleMapsUrl: b.googleMapsUrl || "https://www.google.com/maps/search/?api=1&query=Alisya+Premium+Salon+%26+Spa+Arjawinangun+Cirebon+Grand+Lavanda",
          phone: b.phone || "0853-9999-8888",
          whatsapp: b.whatsapp || "6285399998888",
          operatingHours: b.operatingHours || "09:00 - 21:00 WIB (Senin - Minggu)",
          rating: b.rating || 5.0,
          reviewCount: b.reviewCount || 154,
          features: b.features || ["Kamar Privat Muslimah", "Sangat Higienis", "100% Bebas Laki-Laki", "Free Fresh Drink"],
          distance: b.distance || "0.1 km",
          estTime: b.estTime || "1 mnt jalan kaki",
          coordinateX: b.coordinateX || 45,
          coordinateY: b.coordinateY || 40,
          branchImage: b.branchImage || "",
          ...b
        });
      }
    } catch (e) {
      console.error("Firestore updateBranch failed, continuing local update:", e);
    }
  }

  const current = getLocalStorageData<SalonBranch>("branches", DEFAULT_BRANCHES);
  const updated = current.map(item => item.id === id ? { ...item, ...b } : item);
  saveLocalStorageData("branches", updated);
  return true;
};

export const deleteBranch = async (id: string): Promise<boolean> => {
  let success = true;
  if (isFirebaseWorking() && id !== "br-01") {
    try {
      await deleteDoc(doc(db, "branches", id));
    } catch (e) {
      console.error("Firestore deleteBranch failed:", e);
      success = false;
    }
  }

  const current = getLocalStorageData<SalonBranch>("branches", DEFAULT_BRANCHES);
  const updated = current.filter(b => b.id !== id);
  saveLocalStorageData("branches", updated);
  return success;
};

// ------------------------------------------------------------
// PROMOS & DISCOUNTS SERVICE API
// ------------------------------------------------------------
const DEFAULT_PROMOS: Promo[] = [
  {
    id: "promo_1",
    title: "Promo Perawatan Premium",
    description: "Nikmati diskon eksklusif hingga 40% untuk facial kolagen, totok aura, dan pijat relaksasi tubuh.",
    discountValue: "Diskon 40%",
    type: "banner"
  },
  {
    id: "promo_2",
    title: "Royal Hair Spa & Creambath",
    description: "Perawatan rambut syariah premium di dalam ruangan privat yang steril dengan herba berkhasiat.",
    discountValue: "Potongan Rp 35.000",
    code: "ALISYASPA35",
    type: "banner"
  },
  {
    id: "promo_3",
    title: "Syariah Aesthetic Glow",
    description: "Facial microdermabrasion menyeluruh untuk mencerahkan wajah secara higienis, halal, dan aman.",
    discountValue: "Hemat 25%",
    code: "GLOWSHALIHA",
    type: "banner"
  },
  {
    id: "promo_4",
    title: "Spesial Member Baru",
    description: "Potongan harga langsung pada kunjungan pertamamu untuk semua menu pelayanan salon kecantikan kami.",
    discountValue: "Potongan 15%",
    code: "WELCOMEALISYA",
    type: "coupon"
  }
];

export const fetchPromos = async (): Promise<Promo[]> => {
  let promosList: Promo[] = [];
  if (isFirebaseWorking()) {
    try {
      const snap = await getDocs(collection(db, "promos"));
      promosList = snap.docs.map(doc => convertTimestampsToStrings({ id: doc.id, ...doc.data() as any }) as Promo);
    } catch (e) {
      console.warn("Firestore fetchPromos failed, fallback to local:", e);
    }
  } else {
    promosList = getLocalStorageData<Promo>("promos", []);
  }

  // If the returned list is empty or has fewer than our default items, merge or return defaults to guarantee stacking
  if (promosList.length < DEFAULT_PROMOS.length) {
    // Merge or use DEFAULT_PROMOS directly to guarantee all 4 cards appear
    const mergedList = [...promosList];
    DEFAULT_PROMOS.forEach(defPromo => {
      if (!mergedList.some(p => p.title === defPromo.title || p.id === defPromo.id)) {
        mergedList.push(defPromo);
      }
    });
    return mergedList;
  }

  return promosList;
};

export const createPromo = async (p: Omit<Promo, "id">): Promise<boolean> => {
  const newP: Promo = {
    ...p,
    id: `promo_${Date.now()}`
  };

  if (isFirebaseWorking()) {
    try {
      await addDoc(collection(db, "promos"), {
        title: p.title,
        description: p.description,
        code: p.code || "",
        discountValue: p.discountValue,
        type: p.type,
        createdAt: serverTimestamp()
      });
      return true;
    } catch (e) {
      console.error("Firestore createPromo failed:", e);
      if (navigator.onLine) {
        throw e;
      }
    }
  }

  if (navigator.onLine) {
    throw new Error("Gagal membuat promo baru saat online.");
  }

  addToSyncQueue('createPromo', p);

  const current = getLocalStorageData<Promo>("promos", DEFAULT_PROMOS);
  current.push(newP);
  saveLocalStorageData("promos", current);
  return true;
};

export const deletePromo = async (id: string): Promise<boolean> => {
  let success = true;
  if (isFirebaseWorking()) {
    try {
      await deleteDoc(doc(db, "promos", id));
    } catch (e) {
      console.error("Firestore deletePromo failed:", e);
      success = false;
    }
  }

  const current = getLocalStorageData<Promo>("promos", DEFAULT_PROMOS);
  const updated = current.filter(p => p.id !== id);
  saveLocalStorageData("promos", updated);
  return success;
};

// Bulk Clear APIs
export const clearAllTreatments = async (): Promise<boolean> => {
  let success = true;
  if (isFirebaseWorking()) {
    try {
      const snap = await getDocs(collection(db, "treatments"));
      const promises = snap.docs.map(d => deleteDoc(doc(db, "treatments", d.id)));
      await Promise.all(promises);
    } catch (e) {
      console.error("Firestore clearAllTreatments failed:", e);
      success = false;
    }
  }
  saveLocalStorageData("treatments", []);
  return success;
};

export const clearAllProducts = async (): Promise<boolean> => {
  let success = true;
  if (isFirebaseWorking()) {
    try {
      const snap = await getDocs(collection(db, "products"));
      const promises = snap.docs.map(d => deleteDoc(doc(db, "products", d.id)));
      await Promise.all(promises);
    } catch (e) {
      console.error("Firestore clearAllProducts failed:", e);
      success = false;
    }
  }
  saveLocalStorageData("products", []);
  return success;
};

// ------------------------------------------------------------
// SHOP ORDERS SERVICE API (Boutique Orders)
// ------------------------------------------------------------
export const fetchShopOrders = async (userId?: string): Promise<ShopOrder[]> => {
  const isLocal = checkIsLocalUser(userId);
  if (isFirebaseWorking() && !isLocal && auth?.currentUser) {
    try {
      let q;
      if (userId) {
        q = query(
          collection(db, "shop_orders"),
          where("userId", "==", userId),
          orderBy("createdAt", "desc")
        );
      } else {
        q = query(collection(db, "shop_orders"), orderBy("createdAt", "desc"));
      }
      const snap = await getDocs(q);
      return snap.docs.map(doc => convertTimestampsToStrings({ id: doc.id, ...doc.data() as any }) as ShopOrder);
    } catch (e) {
      console.warn("Firestore fetchShopOrders failed, fallback to local:", e);
    }
  }

  const allOrders = getLocalStorageData<ShopOrder>("shop_orders", []);
  if (userId) {
    return allOrders.filter(o => o.userId === userId);
  }
  return allOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const subscribeShopOrders = (userId: string, callback: (orders: ShopOrder[]) => void): (() => void) => {
  let unsubFirestore: (() => void) | null = null;
  let interval: any = null;

  const startLocalFallback = () => {
    if (interval) return;
    let lastValString = "";
    interval = setInterval(() => {
      const current = getLocalStorageData<ShopOrder>("shop_orders", []);
      const filtered = current.filter(o => o.userId === userId);
      // Sort descending by date
      const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const valString = JSON.stringify(sorted);
      if (valString !== lastValString) {
        lastValString = valString;
        callback(sorted);
      }
    }, 1000);
  };

  const isLocal = checkIsLocalUser(userId);
  if (isFirebaseWorking() && userId && !isLocal && auth?.currentUser) {
    try {
      const q = query(
        collection(db, "shop_orders"),
        where("userId", "==", userId)
      );
      unsubFirestore = onSnapshot(q, (snap) => {
        const list = snap.docs.map(doc => convertTimestampsToStrings({ id: doc.id, ...doc.data() as any }) as ShopOrder);
        list.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        callback(list);
      }, (err) => {
        console.warn("Real-time shop orders snapshot subscription failed, using local fallback:", err);
        startLocalFallback();
      });
    } catch (err) {
      console.warn("Failed to attach shop orders snapshot listener, fallback to local:", err);
      startLocalFallback();
    }
  } else {
    // Immediate fallback + fallback interval
    const current = getLocalStorageData<ShopOrder>("shop_orders", []);
    const filtered = current.filter(o => o.userId === userId);
    const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    callback(sorted);
    startLocalFallback();
  }

  return () => {
    if (unsubFirestore) {
      unsubFirestore();
    }
    if (interval) {
      clearInterval(interval);
    }
  };
};

export const createShopOrder = async (order: Omit<ShopOrder, "id" | "status" | "createdAt">): Promise<boolean> => {
  const newOrder: ShopOrder = {
    ...order,
    id: `o_${Date.now()}`,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  const isLocal = checkIsLocalUser(order.userId);
  if (isFirebaseWorking() && !isLocal && auth?.currentUser) {
    try {
      const cleanData = removeUndefinedFields({
        ...order,
        status: "pending",
        createdAt: serverTimestamp()
      });
      await addDoc(collection(db, "shop_orders"), cleanData);
      
      // Add points to user profile on Boutique checkout too (+5 point)
      await updateUserPoints(order.userId, 5);
      return true;
    } catch (e) {
      console.error("Firestore createShopOrder failed:", e);
      if (navigator.onLine) {
        throw e;
      }
    }
  }

  if (navigator.onLine) {
    throw new Error("Gagal memproses pesanan saat online.");
  }

  addToSyncQueue('createShopOrder', order);

  const current = getLocalStorageData<ShopOrder>("shop_orders", []);
  current.push(newOrder);
  saveLocalStorageData("shop_orders", current);

  // Add points to user profile on Boutique checkout too (+5 point)
  await updateUserPoints(order.userId, 5);
  return true;
};

export const updateShopOrderStatus = async (id: string, status: ShopOrder["status"]): Promise<boolean> => {
  if (isFirebaseWorking() && !id.startsWith("o_")) {
    try {
      const orderRef = doc(db, "shop_orders", id);
      const snap = await getDoc(orderRef);
      if (snap.exists()) {
        const oObj = snap.data() as ShopOrder;
        const prevStatus = oObj.status;
        await updateDoc(orderRef, { status });
        
        if (status === "completed" && prevStatus !== "completed" && oObj.userId) {
          await updateUserPoints(oObj.userId, 15);
        }
      } else {
        await updateDoc(orderRef, { status });
      }
      return true;
    } catch (e) {
      console.error("Firestore updateShopOrderStatus failed:", e);
    }
  }

  const current = getLocalStorageData<ShopOrder>("shop_orders", []);
  const idx = current.findIndex(o => o.id === id);
  if (idx !== -1) {
    const oObj = current[idx];
    const prevStatus = oObj.status;
    oObj.status = status;
    saveLocalStorageData("shop_orders", current);

    // If order completes (status 'completed'), reward user points
    if (status === "completed" && prevStatus !== "completed") {
      await updateUserPoints(oObj.userId, 15);
    }
    return true;
  }
  return false;
};

export const removeShopOrder = async (id: string): Promise<boolean> => {
  if (isFirebaseWorking() && !id.startsWith("o_")) {
    try {
      await deleteDoc(doc(db, "shop_orders", id));
      return true;
    } catch (e) {
      console.error("Firestore removeShopOrder failed:", e);
      return false;
    }
  }

  const current = getLocalStorageData<ShopOrder>("shop_orders", []);
  const updated = current.filter(o => o.id !== id);
  saveLocalStorageData("shop_orders", updated);
  return true;
};

// ------------------------------------------------------------
// GALLERY / PORTFOLIO SERVICE API
// ------------------------------------------------------------
export const fetchGalleryItems = async (): Promise<GalleryItem[]> => {
  let galleryList: GalleryItem[] = [];
  if (isFirebaseWorking()) {
    try {
      const snap = await getDocs(collection(db, "gallery"));
      galleryList = snap.docs.map(doc => convertTimestampsToStrings({ id: doc.id, ...doc.data() as any }) as GalleryItem);
    } catch (e) {
      console.warn("Firestore fetchGalleryItems failed, fallback to local:", e);
    }
  } else {
    galleryList = getLocalStorageData<GalleryItem>("gallery", []);
  }
  return galleryList;
};

export const createGalleryItem = async (item: Omit<GalleryItem, "id">): Promise<boolean> => {
  const newItem: GalleryItem = {
    ...item,
    id: `gallery_${Date.now()}`
  };

  if (isFirebaseWorking()) {
    try {
      await addDoc(collection(db, "gallery"), {
        url: item.url,
        category: item.category,
        title: item.title,
        desc: item.desc,
        likes: item.likes || "0",
        comments: item.comments || "0",
        duration: item.duration || "",
        createdAt: serverTimestamp()
      });
      return true;
    } catch (e) {
      console.error("Firestore createGalleryItem failed:", e);
    }
  }

  const current = getLocalStorageData<GalleryItem>("gallery", []);
  current.push(newItem);
  saveLocalStorageData("gallery", current);
  return true;
};

export const deleteGalleryItem = async (id: string): Promise<boolean> => {
  let success = true;
  if (isFirebaseWorking()) {
    try {
      await deleteDoc(doc(db, "gallery", id));
    } catch (e) {
      console.error("Firestore deleteGalleryItem failed:", e);
      success = false;
    }
  }

  const current = getLocalStorageData<GalleryItem>("gallery", []);
  const updated = current.filter(item => item.id !== id);
  saveLocalStorageData("gallery", updated);
  return success;
};

export const clearAllGalleryItems = async (): Promise<boolean> => {
  let success = true;
  if (isFirebaseWorking()) {
    try {
      const snap = await getDocs(collection(db, "gallery"));
      const promises = snap.docs.map(d => deleteDoc(doc(db, "gallery", d.id)));
      await Promise.all(promises);
    } catch (e) {
      console.error("Firestore clearAllGalleryItems failed:", e);
      success = false;
    }
  }
  saveLocalStorageData("gallery", []);
  return success;
};


