export interface Treatment {
  id: string;
  name: string;
  description: string;
  price: number;
  duration?: number;
  category?: string;
  createdAt?: any;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  createdAt?: any;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  treatment: string;
  date: string;
  time: string;
  customerName?: string;
  whatsapp?: string;
  email?: string;
  service?: string;
  bookingDate?: string;
  bookingTime?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'done' | 'cancelled';
  room?: string;
  therapist?: string;
  createdAt?: any;
  appliedPromoId?: string;
  appliedPromoTitle?: string;
  originalPrice?: number;
  discountAmount?: number;
  finalPrice?: number;
}

export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number; // 1 - 5
  comment?: string;
  createdAt: string; // ISO date or localized string
  service: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  points: number;
  whatsapp?: string;
  address?: string;
  gpsLocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    mapsUrl?: string;
  };
  createdAt?: any;
}

export interface LevelThreshold {
  color: string;
  next: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | null;
  nextPts: number | null;
  icon: string;
}

export interface SalonBranch {
  id: string;
  name: string;
  codename: string;
  address: string;
  googleMapsUrl: string;
  phone: string;
  whatsapp: string;
  operatingHours: string;
  rating: number;
  reviewCount: number;
  features: string[];
  distance: string;
  estTime: string;
  coordinateX: number;
  coordinateY: number;
  branchImage: string;
}

export const levelConfig: Record<string, LevelThreshold> = {
  Bronze: { color: '#CD7F32', next: 'Silver', nextPts: 500, icon: '🥉' },
  Silver: { color: '#A0A0A0', next: 'Gold', nextPts: 1500, icon: '🥈' },
  Gold: { color: '#D4AF37', next: 'Platinum', nextPts: 3000, icon: '🥇' },
  Platinum: { color: '#E5E4E2', next: null, nextPts: null, icon: '💎' },
};

export interface Promo {
  id: string;
  title: string;
  description: string;
  code?: string;
  discountValue: string; // e.g., "20%" or "Rp 15.000"
  type: 'banner' | 'coupon'; // banner showing on Home Page, coupon showing on Profile Page
  createdAt?: any;
}

export interface ShopOrder {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  productName: string;
  price: number;
  quantity: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt?: any;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface GalleryItem {
  id: string;
  url: string;
  category: 'hair' | 'face' | 'spa' | 'body' | 'interior';
  title: string;
  desc: string;
  likes: string;
  comments?: string;
  duration?: string;
  createdAt?: any;
}


