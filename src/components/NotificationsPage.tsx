import React, { useState, useEffect } from 'react';
import { Bell, CalendarCheck2, ShoppingBag } from 'lucide-react';
import { UserProfile, Booking, ShopOrder } from '../types';
import { subscribeBookings, fetchShopOrders } from '../services/dataService';

interface NotificationsPageProps {
  userProfile: UserProfile | null;
  onNavigate: (tabId: string) => void;
}

export default function NotificationsPage({ userProfile, onNavigate }: NotificationsPageProps) {
  interface LayoutNotification {
    id: string;
    title: string;
    description: string;
    date: string;
    type: 'treatment' | 'shop';
    createdAt: number;
    price?: number;
  }

  const [notifications, setNotifications] = useState<LayoutNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = userProfile?.uid;
    if (!uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    let activeBookings: Booking[] = [];
    let activeOrders: ShopOrder[] = [];

    const handleSync = (userBookings: Booking[], userOrders: ShopOrder[]) => {
      const list: LayoutNotification[] = [];

      // 1. Process Completed Treatments
      userBookings
        .filter(b => b.status !== 'pending')
        .forEach(b => {
          const bookingTime = b.bookingDate ? `${b.bookingDate} pukul ${b.bookingTime || ''}` : `${b.date} pukul ${b.time || ''}`;
          let ts = Date.now();
          if (b.createdAt) {
            ts = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : (b.createdAt.seconds ? b.createdAt.seconds * 1000 : Date.now());
          }

          let title = "🌸 Treatment Kecantikan";
          let description = `Treatment kecantikan "${b.treatment || b.service || 'Treatment Alisya'}" Anda saat ini berstatus ${b.status || ''}.`;

          if (b.status === 'confirmed') {
            title = "📅 Booking Dikonfirmasi";
            description = `Booking perawatan kecantikan "${b.treatment || b.service || 'Treatment Alisya'}" Anda telah dikonfirmasi oleh Admin. Cek jadwal Anda untuk hadir tepat waktu!`;
          } else if (b.status === 'done') {
            title = "🌸 Treatment Selesai";
            description = `Perawatan kecantikan "${b.treatment || b.service || 'Treatment Alisya'}" Anda telah selesai diproses. Terima kasih atas kepercayaan Anda di Alisya Beauty!`;
          } else if (b.status === 'cancelled') {
            title = "❌ Booking Dibatalkan";
            description = `Booking perawatan kecantikan "${b.treatment || b.service || 'Treatment Alisya'}" Anda pada tanggal ${b.date || b.bookingDate || ''} telah dibatalkan. Silakan hubungi kami jika diperlukan.`;
          }

          list.push({
            id: `b_${b.id}`,
            title,
            description,
            date: bookingTime,
            type: 'treatment',
            createdAt: ts
          });
        });

      // 2. Process Completed Shop Orders
      userOrders
        .filter(o => o.status !== 'pending')
        .forEach(o => {
          let ts = Date.now();
          if (o.createdAt) {
            ts = typeof o.createdAt === 'string' ? new Date(o.createdAt).getTime() : Date.now();
          }

          let title = "🛍️ Pesanan Butik";
          let description = `Pesanan produk butik "${o.productName}" Anda saat ini berstatus ${o.status || ''}.`;

          if (o.status === 'completed') {
            title = "🛍️ Pesanan Butik Selesai";
            description = `Pesanan produk butik "${o.productName}" Anda telah selesai diproses dan siap dikirim / diserahkan.`;
          } else if (o.status === 'cancelled') {
            title = "❌ Pesanan Butik Dibatalkan";
            description = `Pesanan produk butik "${o.productName}" Anda telah dibatalkan karena suatu hal. Silakan hubungi admin kami untuk detailnya.`;
          }

          list.push({
            id: `o_${o.id}`,
            title,
            description,
            date: o.date || "Baru saja",
            type: 'shop',
            createdAt: ts,
            price: o.price
          });
        });

      // Sort newest first
      list.sort((a, b) => b.createdAt - a.createdAt);
      setNotifications(list);
      setLoading(false);

      // Save as read
      localStorage.setItem(`alisya_last_read_${uid}`, String(Date.now()));
    };

    const unsubBookings = subscribeBookings(uid, (userBookings) => {
      activeBookings = userBookings;
      handleSync(activeBookings, activeOrders);
    });

    const loadOrders = async () => {
      try {
        const orderData = await fetchShopOrders(uid);
        activeOrders = orderData;
        handleSync(activeBookings, activeOrders);
      } catch (e) {
        console.error("Failed to load shop orders in NotificationsPage:", e);
        setLoading(false);
      }
    };

    loadOrders();
    const intv = setInterval(loadOrders, 10000);

    return () => {
      unsubBookings();
      clearInterval(intv);
    };
  }, [userProfile?.uid]);

  return (
    <div className="space-y-6 pb-20 text-stone-800 animate-fade-in-up text-left max-w-2xl mx-auto">
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-stone-100 shadow-sm">
          <div className="w-8 h-8 rounded-full border-2 border-gold-300 border-t-gold-600 animate-spin" />
          <span className="text-xs text-stone-450 font-medium">Memuat pemberitahuan...</span>
        </div>
      ) : notifications.length === 0 ? (
        /* ELEGANT EMPTY STATE PAGE FOR NOTIFICATIONS WITHOUT BUTTONS */
        <div className="text-center py-20 px-6 border border-dashed border-[#A98436]/20 bg-white rounded-3xl space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-[#FBF9F4] text-[#A98436]/80 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Bell className="w-8 h-8 stroke-[1.2]" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-serif font-bold text-stone-900 text-[15px]">Belum Ada Notifikasi Saat Ini</h3>
            <p className="text-xs text-stone-500 font-normal leading-relaxed">
              Catatan penyelesaian treatment kecantikan dan status belanja butik Anda akan tampil di halaman ini setelah dikonfirmasi oleh Admin.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => (
            <div 
              key={n.id}
              className="bg-white border border-stone-200/80 border-l-[4px] border-l-[#A98436] rounded-3xl p-5 shadow-xs hover:shadow-md hover:border-stone-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-[#A98436]">
                    {n.type === 'treatment' ? <CalendarCheck2 className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                  </div>
                  <span className="font-serif font-bold text-stone-900 text-[14px]">
                    {n.title}
                  </span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 border border-stone-200/50 rounded-lg px-2.5 py-0.5">
                  {n.type === 'treatment' ? 'Treatment' : 'Butik'}
                </span>
              </div>

              <p className="text-xs text-stone-650 leading-relaxed font-sans pr-2">
                {n.description}
              </p>

              <div className="flex items-center justify-between border-t border-stone-100 pt-3.5 flex-wrap gap-2 text-[10px]">
                <span className="text-stone-400 font-light block">
                  📅 Waktu: <strong className="text-stone-700 font-semibold">{n.date}</strong>
                </span>

                {n.price !== undefined && (
                  <span className="text-[10px] font-bold font-mono text-gold-700 bg-gold-200/20 backdrop-blur-sm px-2 py-0.5 rounded-md border border-gold-500/10">
                    Rp {n.price.toLocaleString('id-ID')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
