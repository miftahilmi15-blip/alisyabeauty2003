export interface Treatment {
  id: string;
  name: string;
  description: string;
  price: number;
  duration?: number;
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
  createdAt?: any;
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
  createdAt?: any;
}

export interface LevelThreshold {
  color: string;
  next: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | null;
  nextPts: number | null;
  icon: string;
}

export const levelConfig: Record<string, LevelThreshold> = {
  Bronze: { color: '#CD7F32', next: 'Silver', nextPts: 500, icon: '🥉' },
  Silver: { color: '#A0A0A0', next: 'Gold', nextPts: 1500, icon: '🥈' },
  Gold: { color: '#D4AF37', next: 'Platinum', nextPts: 3000, icon: '🥇' },
  Platinum: { color: '#E5E4E2', next: null, nextPts: null, icon: '💎' },
};
