import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Calendar, LayoutGrid, Scissors, Trash2, Check, X, 
  Plus, DollarSign, Clock, FileText, ShoppingBag, Eye, Sparkles, BarChart3
} from 'lucide-react';
import { 
  fetchBookings, updateBookingStatus, removeBooking,
  fetchTreatments, createTreatment, deleteTreatment,
  fetchProducts, createProduct, deleteProduct 
} from '../services/dataService';
import { Booking, Treatment, Product } from '../types';

interface AdminPageProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function AdminPage({ onShowToast }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState<'bookings' | 'treatments' | 'products' | 'stats'>('bookings');
  
  // Lists
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // New item modal states
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [treatmentName, setTreatmentName] = useState("");
  const [treatmentDesc, setTreatmentDesc] = useState("");
  const [treatmentPrice, setTreatmentPrice] = useState("");
  const [treatmentDuration, setTreatmentDuration] = useState("60");

  const [showProductModal, setShowProductModal] = useState(false);
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productImage, setProductImage] = useState("");

  const refreshAll = async () => {
    setLoading(true);
    try {
      const [bookingsData, treatmentsData, productsData] = await Promise.all([
        fetchBookings(),
        fetchTreatments(),
        fetchProducts()
      ]);
      setBookings(bookingsData);
      setTreatments(treatmentsData);
      setProducts(productsData);
    } catch (e) {
      console.error("Gagal refresh data admin:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  // Booking actions
  const handleStatusChange = async (id: string, status: Booking['status']) => {
    try {
      const success = await updateBookingStatus(id, status);
      if (success) {
        onShowToast(`Status booking diperbarui ke: ${status.toUpperCase()}`, "success");
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      }
    } catch {
      onShowToast("Gagal memperbarui status.", "error");
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (confirm("Hapus catatan booking ini secara permanen dari sistem?")) {
      try {
        const success = await removeBooking(id);
        if (success) {
          onShowToast("Booking berhasil dihapus dari arsip.", "success");
          setBookings(prev => prev.filter(b => b.id !== id));
        }
      } catch {
        onShowToast("Gagal menghapus booking.", "error");
      }
    }
  };

  // Treatment adding/removing
  const handleCreateTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!treatmentName || !treatmentPrice) {
      onShowToast("Tolong lengkapi nama dan harga perawatan.", "error");
      return;
    }
    try {
      const success = await createTreatment({
        name: treatmentName,
        description: treatmentDesc,
        price: Number(treatmentPrice),
        duration: Number(treatmentDuration) || 60
      });
      if (success) {
        onShowToast("✅ Layanan treatment baru berhasil didaftarkan!", "success");
        setShowTreatmentModal(false);
        setTreatmentName("");
        setTreatmentDesc("");
        setTreatmentPrice("");
        setTreatmentDuration("60");
        const list = await fetchTreatments();
        setTreatments(list);
      }
    } catch {
      onShowToast("Gagal menambahkan treatment.", "error");
    }
  };

  const handleDeleteTreatment = async (id: string) => {
    if (confirm("Yakin ingin menghapus layanan perawatan ini? Pelanggan tidak akan bisa memesannya lagi.")) {
      try {
        const success = await deleteTreatment(id);
        if (success) {
          onShowToast("Layanan perawatan dihapus.", "success");
          setTreatments(prev => prev.filter(t => t.id !== id));
        }
      } catch {
        onShowToast("Gagal menghapus.", "error");
      }
    }
  };

  // Product adding/removing
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !productPrice) {
      onShowToast("Tolong lengkapi nama dan harga produk.", "error");
      return;
    }
    try {
      const imgFallback = productImage.trim() || "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=300";
      const success = await createProduct({
        name: productName,
        description: productDesc,
        price: Number(productPrice),
        imageUrl: imgFallback
      });
      if (success) {
        onShowToast("✅ Produk kecantikan butik berhasil ditambahkan!", "success");
        setShowProductModal(false);
        setProductName("");
        setProductDesc("");
        setProductPrice("");
        setProductImage("");
        const list = await fetchProducts();
        setProducts(list);
      }
    } catch {
      onShowToast("Gagal mendaftarkan produk.", "error");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Hapus produk ini dari katalog butik?")) {
      try {
        const success = await deleteProduct(id);
        if (success) {
          onShowToast("Produk dihapus dari katalog.", "success");
          setProducts(prev => prev.filter(p => p.id !== id));
        }
      } catch {
        onShowToast("Gagal menghapus produk.", "error");
      }
    }
  };

  // Stats calculate
  const totalRevenue = bookings
    .filter(b => b.status === "done")
    .length * 150000; // Average transaction estimate

  return (
    <div className="space-y-5 pb-20 animate-fade-in-up">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-xs text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold font-sans">Akses Owner</span>
          <h2 className="text-2xl font-serif font-semibold text-stone-900 flex items-center gap-1.5 pt-1">
            <ShieldAlert className="w-5.5 h-5.5 text-stone-800" /> Admin Dashboard
          </h2>
        </div>
        <button 
          onClick={refreshAll} 
          className="text-xs font-semibold px-3 py-1 bg-stone-100 border rounded-lg hover:bg-stone-200 active:scale-95 transition-all text-stone-700 cursor-pointer"
        >
          Muat Ulang Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-stone-100 p-1 rounded-2xl border border-stone-200 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex-1 text-center py-2 rounded-xl text-xs font-semibold select-none cursor-pointer tracking-wider ${
            activeTab === 'bookings' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Booking
        </button>
        <button
          onClick={() => setActiveTab('treatments')}
          className={`flex-1 text-center py-2 rounded-xl text-xs font-semibold select-none cursor-pointer tracking-wider ${
            activeTab === 'treatments' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Treatment
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 text-center py-2 rounded-xl text-xs font-semibold select-none cursor-pointer tracking-wider ${
            activeTab === 'products' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Produk
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 text-center py-2 rounded-xl text-xs font-semibold select-none cursor-pointer tracking-wider ${
            activeTab === 'stats' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Laporan
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-stone-800 animate-spin" />
          <span className="text-xs text-stone-450 font-medium">Memuat database salon...</span>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* TAB 1: BOOKING MANAGEMENT */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-stone-900 text-[15px]">Arsip Pemesanan Reservasi ({bookings.length})</h3>
                <span className="text-[10px] text-stone-500 italic">*Klik centang hijau untuk konfirmasi</span>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-stone-200 bg-white rounded-3xl">
                  <Calendar className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs text-stone-500 font-medium">Tidak ada data booking masuk harian.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div 
                      key={b.id}
                      className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm hover:border-stone-300"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-stone-900">{b.userName || b.userEmail || "Pengunjung"}</span>
                          <span className="text-[9px] uppercase tracking-wider bg-stone-100 text-stone-550 border rounded px-1.5 font-bold">
                            {b.status}
                          </span>
                        </div>
                        <p className="text-xs text-gold-700 font-serif font-semibold">{b.treatment}</p>
                        <div className="flex items-center gap-3 text-[10px] text-stone-500 font-light">
                          <span>📅 {b.date} &middot; 🕒 {b.time}</span>
                          {b.notes && <span className="text-stone-400">&ldquo;{b.notes}&rdquo;</span>}
                        </div>
                      </div>

                      {/* Action Triggers */}
                      <div className="flex items-center gap-1.5 border-t border-stone-50 md:border-t-0 pt-2 md:pt-0 justify-end">
                        {b.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(b.id, 'confirmed')}
                            className="bg-emerald-500 hover:bg-emerald-400 text-white p-1.5 rounded-lg active:scale-95 transition-all cursor-pointer"
                            title="Konfirmasi"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusChange(b.id, 'done')}
                            className="bg-stone-900 hover:bg-neutral-800 text-gold-350 p-1.5 rounded-lg active:scale-95 transition-all cursor-pointer flex items-center gap-1 text-[10px] px-2.5 font-bold"
                          >
                            <Check className="w-3.5 h-3.5 text-gold-400" /> Selesai
                          </button>
                        )}
                        {b.status !== 'cancelled' && b.status !== 'done' && (
                          <button
                            onClick={() => handleStatusChange(b.id, 'cancelled')}
                            className="bg-stone-100 hover:bg-rose-50 text-rose-600 p-1.5 rounded-lg active:scale-95 transition-all cursor-pointer"
                            title="Batalkan"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteBooking(b.id)}
                          className="bg-stone-50 hover:bg-stone-100 text-stone-400 hover:text-stone-600 p-1.5 rounded-lg active:scale-95 transition-all cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TREATMENT/SERVICES MANAGER */}
          {activeTab === 'treatments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-stone-900 text-[15px]">Data Menu Treatment ({treatments.length})</h3>
                <button
                  onClick={() => setShowTreatmentModal(true)}
                  className="bg-stone-950 hover:bg-neutral-800 text-gold-300 font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1 cursor-pointer shadow-sm active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4 text-gold-400" /> Tambah Perawatan
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {treatments.map((t) => (
                  <div 
                    key={t.id}
                    className="p-4 bg-white border border-stone-200 rounded-2xl flex flex-col justify-between gap-3 shadow-xs relative"
                  >
                    <div className="space-y-1 pr-6">
                      <h4 className="font-serif font-bold text-[14px] text-stone-900">{t.name}</h4>
                      <p className="text-[10px] text-stone-500 line-clamp-2 leading-relaxed">{t.description}</p>
                      <div className="flex items-center gap-3 pt-1">
                        <span className="text-[11px] font-extrabold text-gold-600">Rp {Number(t.price).toLocaleString('id-ID')}</span>
                        {t.duration && <span className="text-[9px] text-stone-400 bg-stone-150 py-0.5 px-2 rounded-full font-medium">{t.duration} Menit</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTreatment(t.id)}
                      className="absolute right-3.5 top-3.5 text-stone-400 hover:text-rose-600 p-1 rounded-full cursor-pointer hover:bg-stone-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCT CATALOG MANAGER */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-stone-900 text-[15px]">Katalog Produk Butik ({products.length})</h3>
                <button
                  onClick={() => setShowProductModal(true)}
                  className="bg-stone-950 hover:bg-neutral-800 text-gold-300 font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1 cursor-pointer shadow-sm active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4 text-gold-400" /> Tambah Produk
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {products.map((p) => (
                  <div 
                    key={p.id}
                    className="p-4 bg-white border border-stone-200 rounded-2xl flex justify-between gap-3 shadow-xs relative items-center"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0 pr-6">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 border shrink-0">
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="font-serif font-bold text-xs text-stone-900 line-clamp-1">{p.name}</h4>
                        <p className="text-[10px] text-stone-500 line-clamp-1 truncate">{p.description}</p>
                        <span className="text-[10px] font-bold text-stone-950">Rp {Number(p.price).toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-rose-600 p-1 rounded-full cursor-pointer hover:bg-stone-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: LAPORAN & STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-5">
              <h3 className="font-serif font-bold text-stone-900 text-[15px]">Ringkasan Bisnis & Performa</h3>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-stone-900 text-gold-200 p-5 rounded-2xl border flex flex-col justify-between min-h-[90px]">
                  <BarChart3 className="w-5 h-5 text-gold-400" />
                  <div className="pt-2">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wide">Omset Selesai (Est)</span>
                    <div className="text-xl font-bold text-gold-100">Rp {totalRevenue.toLocaleString('id-ID')}</div>
                  </div>
                </div>
                <div className="bg-white border p-5 rounded-2xl flex flex-col justify-between min-h-[90px]">
                  <Calendar className="w-5 h-5 text-gold-500 font-bold" />
                  <div className="pt-2">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wide">Konfirmasi Booking</span>
                    <div className="text-xl font-bold text-stone-900">
                      {bookings.filter(b => b.status === "confirmed").length} Booking
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking status distribution */}
              <div className="bg-white border rounded-2xl p-4.5 space-y-3 shadow-xs">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-widest text-center border-b pb-2">Distribusi Layanan Terpopuler</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span>Menunggu (Pending)</span>
                    <span className="font-bold">{bookings.filter(b => b.status === "pending").length}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-stone-50 pt-1.5">
                    <span>Selesai (Completed)</span>
                    <span className="font-bold text-emerald-600">{bookings.filter(b => b.status === "done").length}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-stone-50 pt-1.5">
                    <span>Dibatalkan (Cancelled)</span>
                    <span className="font-bold text-rose-600">{bookings.filter(b => b.status === "cancelled").length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* NEW TREATMENT MODAL */}
      {showTreatmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form 
            onSubmit={handleCreateTreatment}
            className="bg-white rounded-3xl border max-w-sm w-full p-5 space-y-4 shadow-2xl animate-fade-in-up"
          >
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <Scissors className="w-5 h-5 text-gold-600" />
              <h3 className="font-serif font-bold text-sm text-stone-900">Tambah Treatment Baru</h3>
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-700">Nama Perawatan</label>
                <input 
                  type="text"
                  required
                  value={treatmentName}
                  onChange={(e) => setTreatmentName(e.target.value)}
                  placeholder="Contoh: Royal Hair Spa Lidah Buaya"
                  className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2 px-3 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Harga (Rp)</label>
                <input 
                  type="number"
                  required
                  value={treatmentPrice}
                  onChange={(e) => setTreatmentPrice(e.target.value)}
                  placeholder="Contoh: 180000"
                  className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2 px-3 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Durasi (Menit)</label>
                <input 
                  type="number"
                  required
                  value={treatmentDuration}
                  onChange={(e) => setTreatmentDuration(e.target.value)}
                  placeholder="Contoh: 60"
                  className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2 px-3 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Deskripsi Lengkap</label>
                <textarea 
                  rows={3}
                  value={treatmentDesc}
                  onChange={(e) => setTreatmentDesc(e.target.value)}
                  placeholder="Tuliskan ulasan ringkas mengenai khasiat, teknik pengerjaan..."
                  className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2 px-3 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => setShowTreatmentModal(false)}
                className="flex-1 py-2 bg-stone-100 text-stone-600 rounded-xl font-bold text-xs hover:bg-stone-250 cursor-pointer active:scale-95 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-gold-500 hover:bg-gold-400 text-neutral-950 rounded-xl font-bold text-xs cursor-pointer active:scale-95 transition-all"
              >
                Simpan Perawatan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* NEW PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form 
            onSubmit={handleCreateProduct}
            className="bg-white rounded-3xl border max-w-sm w-full p-5 space-y-4 shadow-2xl animate-fade-in-up"
          >
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <ShoppingBag className="w-5 h-5 text-gold-600" />
              <h3 className="font-serif font-bold text-sm text-stone-900">Tambah Produk Butik</h3>
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-700">Nama Produk</label>
                <input 
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Contoh: Alisya Virgin Coconut Oil"
                  className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2 px-3 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Harga Jual (Rp)</label>
                <input 
                  type="number"
                  required
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  placeholder="Contoh: 65000"
                  className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2 px-3 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Url Foto Produk (Opsional)</label>
                <input 
                  type="url"
                  value={productImage}
                  onChange={(e) => setProductImage(e.target.value)}
                  placeholder="Contoh: https://images.unsplash..."
                  className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2 px-3 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Deksripsi Produk</label>
                <textarea 
                  rows={3}
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                  placeholder="Deskripsi kandungan, takaran bersih botol, khasiat..."
                  className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2 px-3 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="flex-1 py-2 bg-stone-100 text-stone-600 rounded-xl font-bold text-xs hover:bg-stone-250 cursor-pointer active:scale-95 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-gold-500 hover:bg-gold-400 text-neutral-950 rounded-xl font-bold text-xs cursor-pointer active:scale-95 transition-all"
              >
                Simpan Produk
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
