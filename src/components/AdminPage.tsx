import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Calendar, LayoutGrid, Trash2, Check, X, 
  Plus, DollarSign, Clock, FileText, ShoppingBag, Eye, Sparkles, BarChart3,
  MapPin, Gift, Pencil, Images
} from 'lucide-react';
import { 
  fetchBookings, updateBookingStatus, removeBooking,
  fetchTreatments, createTreatment, deleteTreatment, clearAllTreatments,
  fetchProducts, createProduct, deleteProduct, clearAllProducts,
  fetchBranches, createBranch, updateBranch, deleteBranch,
  fetchPromos, createPromo, deletePromo,
  fetchShopOrders, updateShopOrderStatus, removeShopOrder,
  fetchGalleryItems, createGalleryItem, deleteGalleryItem, clearAllGalleryItems
} from '../services/dataService';
import { Booking, Treatment, Product, SalonBranch, Promo, ShopOrder, GalleryItem } from '../types';

interface AdminPageProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function AdminPage({ onShowToast }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState<'bookings' | 'orders' | 'treatments' | 'products' | 'stats' | 'branches' | 'promos' | 'gallery' | null>(null);
  
  // Lists
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<SalonBranch[]>([]);
  const [loading, setLoading] = useState(true);

  // New item modal states
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [treatmentName, setTreatmentName] = useState("");
  const [treatmentDesc, setTreatmentDesc] = useState("");
  const [treatmentPrice, setTreatmentPrice] = useState("");
  const [treatmentDuration, setTreatmentDuration] = useState("60");
  const [treatmentCategory, setTreatmentCategory] = useState("Hair");

  // Promos states
  const [promos, setPromos] = useState<Promo[]>([]);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoTitle, setPromoTitle] = useState("");
  const [promoDesc, setPromoDesc] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoVal, setPromoVal] = useState("");
  const [promoType, setPromoType] = useState<'banner' | 'coupon'>("banner");

  const [showProductModal, setShowProductModal] = useState(false);
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productImage, setProductImage] = useState("");

  // Branch states
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [branchName, setBranchName] = useState("");
  const [branchCodename, setBranchCodename] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [branchGmaps, setBranchGmaps] = useState("");
  const [branchPhone, setBranchPhone] = useState("");
  const [branchWhatsapp, setBranchWhatsapp] = useState("");
  const [branchHours, setBranchHours] = useState("09:00 - 18:00 WIB (Setiap Hari)");
  const [branchFeatures, setBranchFeatures] = useState("Mushola Privat, Bebas Pria, Aman Syariah");
  const [branchImage, setBranchImage] = useState("");
  const [branchCoordX, setBranchCoordX] = useState("50");
  const [branchCoordY, setBranchCoordY] = useState("50");
  const [globalHoursInput, setGlobalHoursInput] = useState("09:00 - 21:00 WIB (Senin - Minggu)");

  const [showBulkPasteModal, setShowBulkPasteModal] = useState(false);
  const [bulkPasteText, setBulkPasteText] = useState("");

  // Gallery states
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryUrl, setGalleryUrl] = useState("");
  const [galleryCategory, setGalleryCategory] = useState<'hair' | 'face' | 'spa' | 'body' | 'interior'>("hair");
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryDesc, setGalleryDesc] = useState("");
  const [galleryLikes, setGalleryLikes] = useState("120");
  const [galleryDuration, setGalleryDuration] = useState("");

  const refreshAll = async () => {
    setLoading(true);
    try {
      const [bookingsData, treatmentsData, productsData, branchesData, promosData, ordersData, galleryData] = await Promise.all([
        fetchBookings(),
        fetchTreatments(),
        fetchProducts(),
        fetchBranches(),
        fetchPromos(),
        fetchShopOrders(),
        fetchGalleryItems()
      ]);
      setBookings(bookingsData);
      setTreatments(treatmentsData);
      setProducts(productsData);
      setBranches(branchesData);
      setPromos(promosData);
      setOrders(ordersData || []);
      setGalleryItems(galleryData || []);
      if (branchesData && branchesData.length > 0) {
        setGlobalHoursInput(branchesData[0].operatingHours || "09:00 - 21:00 WIB (Senin - Minggu)");
      }
    } catch (e) {
      console.error("Gagal refresh data admin:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  // Boutique Order actions
  const handleOrderStatusChange = async (id: string, status: ShopOrder['status']) => {
    try {
      const success = await updateShopOrderStatus(id, status);
      if (success) {
        onShowToast(`Status pesanan butik diperbarui ke: ${status.toUpperCase()}`, "success");
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      }
    } catch {
      onShowToast("Gagal memperbarui status pesanan.", "error");
    }
  };

  const handleOrderDelete = async (id: string) => {
    if (!window.confirm("Beneran mau hapus pesanan butik ini?")) return;
    try {
      const success = await removeShopOrder(id);
      if (success) {
        onShowToast("Pesanan butik berhasil dihapus.", "success");
        setOrders(prev => prev.filter(o => o.id !== id));
      }
    } catch {
      onShowToast("Gagal menghapus pesanan.", "error");
    }
  };

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
        duration: Number(treatmentDuration) || 60,
        category: treatmentCategory
      });
      if (success) {
        onShowToast("✅ Layanan treatment baru berhasil didaftarkan!", "success");
        setShowTreatmentModal(false);
        setTreatmentName("");
        setTreatmentDesc("");
        setTreatmentPrice("");
        setTreatmentDuration("60");
        setTreatmentCategory("Hair");
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
        } else {
          onShowToast("Gagal menghapus layanan perawatan dari server.", "error");
        }
      } catch {
        onShowToast("Gagal menghapus.", "error");
      }
    }
  };

  // Promo adding/removing
  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoTitle || !promoVal) {
      onShowToast("Tolong lengkapi judul promo dan besaran diskon.", "error");
      return;
    }
    try {
      const success = await createPromo({
        title: promoTitle,
        description: promoDesc,
        code: promoCode,
        discountValue: promoVal,
        type: promoType
      });
      if (success) {
        onShowToast("✅ Promo/Kupon baru berhasil ditambahkan!", "success");
        setShowPromoModal(false);
        setPromoTitle("");
        setPromoDesc("");
        setPromoCode("");
        setPromoVal("");
        setPromoType("banner");
        const list = await fetchPromos();
        setPromos(list);
      }
    } catch {
      onShowToast("Gagal menambahkan promo.", "error");
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (confirm("Yakin ingin menghapus promo/kupon ini? Pelanggan tidak akan bisa menggunakannya lagi.")) {
      try {
        const success = await deletePromo(id);
        if (success) {
          onShowToast("Promo/kupon dihapus.", "success");
          setPromos(prev => prev.filter(p => p.id !== id));
        } else {
          onShowToast("Gagal menghapus promo/kupon dari server.", "error");
        }
      } catch {
        onShowToast("Gagal menghapus promo.", "error");
      }
    }
  };

  // Gallery adding/removing
  const handleCreateGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryUrl || !galleryTitle || !galleryDesc) {
      onShowToast("Tolong lengkapi URL Gambar, Judul, dan Deskripsi untuk foto portfolio.", "error");
      return;
    }
    try {
      const success = await createGalleryItem({
        url: galleryUrl,
        category: galleryCategory,
        title: galleryTitle,
        desc: galleryDesc,
        likes: galleryLikes || "120",
        comments: "0",
        duration: galleryDuration || ""
      });
      if (success) {
        onShowToast("✅ Foto portfolio baru berhasil ditambahkan ke Galeri!", "success");
        setShowGalleryModal(false);
        setGalleryUrl("");
        setGalleryCategory("hair");
        setGalleryTitle("");
        setGalleryDesc("");
        setGalleryLikes("120");
        setGalleryDuration("");
        const list = await fetchGalleryItems();
        setGalleryItems(list);
      }
    } catch {
      onShowToast("Gagal menambahkan foto ke galeri.", "error");
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (confirm("Yakin ingin menghapus foto portfolio ini dari galeri?")) {
      try {
        const success = await deleteGalleryItem(id);
        if (success) {
          onShowToast("Foto portfolio berhasil dihapus dari galeri.", "success");
          setGalleryItems(prev => prev.filter(g => g.id !== id));
        } else {
          onShowToast("Gagal menghapus foto dari server.", "error");
        }
      } catch {
        onShowToast("Gagal menghapus foto.", "error");
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
        } else {
          onShowToast("Gagal menghapus produk dari server.", "error");
        }
      } catch {
        onShowToast("Gagal menghapus produk.", "error");
      }
    }
  };

  const handleClearAllTreatments = async () => {
    if (confirm("⚠️ Apakah Anda yakin ingin menghapus SEMUA menu perawatan? Semua data perawatan akan dihapus secara permanen sehingga Anda bisa mengisi data baru secara manual.")) {
      try {
        const success = await clearAllTreatments();
        if (success) {
          onShowToast("Semua menu perawatan berhasil dihapus.", "success");
          setTreatments([]);
        } else {
          onShowToast("Gagal menghapus beberapa menu perawatan dari server.", "error");
        }
      } catch {
        onShowToast("Gagal menghapus semua perawatan.", "error");
      }
    }
  };

  const handleClearAllProducts = async () => {
    if (confirm("⚠️ Apakah Anda yakin ingin menghapus SEMUA katalog produk butik? Semua data produk akan dihapus secara permanen sehingga Anda bisa mengisi data baru secara manual.")) {
      try {
        const success = await clearAllProducts();
        if (success) {
          onShowToast("Semua katalog produk berhasil dihapus.", "success");
          setProducts([]);
        } else {
          onShowToast("Gagal menghapus beberapa produk dari server.", "error");
        }
      } catch {
        onShowToast("Gagal menghapus semua produk.", "error");
      }
    }
  };

  const openAddBranch = () => {
    setEditingBranchId(null);
    setBranchName("");
    setBranchCodename("");
    setBranchAddress("");
    setBranchGmaps("");
    setBranchPhone("");
    setBranchWhatsapp("");
    setBranchHours("09:00 - 21:00 WIB (Senin - Minggu)");
    setBranchFeatures("Mushola Privat, Bebas Pria, Aman Syariah");
    setBranchImage("");
    setBranchCoordX("50");
    setBranchCoordY("50");
    setShowBranchModal(true);
  };

  const openEditBranch = (br: SalonBranch) => {
    setEditingBranchId(br.id);
    setBranchName(br.name);
    setBranchCodename(br.codename || "");
    setBranchAddress(br.address);
    setBranchGmaps(br.googleMapsUrl || "");
    setBranchPhone(br.phone || "");
    setBranchWhatsapp(br.whatsapp || "");
    setBranchHours(br.operatingHours || "09:00 - 21:00 WIB (Senin - Minggu)");
    setBranchFeatures(br.features ? br.features.join(', ') : "");
    setBranchImage(br.branchImage || "");
    setBranchCoordX(String(br.coordinateX || 50));
    setBranchCoordY(String(br.coordinateY || 50));
    setShowBranchModal(true);
  };

  // Branch adding/removing
  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName || !branchAddress) {
      onShowToast("Tolong lengkapi nama dan alamat cabang.", "error");
      return;
    }
    try {
      let success = false;
      const branchFields = {
        name: branchName,
        codename: branchCodename || branchName.split('-')[0].trim(),
        address: branchAddress,
        googleMapsUrl: branchGmaps || `https://maps.google.com/?q=${encodeURIComponent(branchName + ' ' + branchAddress)}`,
        phone: branchPhone || "021-xxxxxx",
        whatsapp: branchWhatsapp || "6285399998888",
        operatingHours: branchHours,
        features: branchFeatures.split(',').map(f => f.trim()).filter(Boolean),
        coordinateX: Number(branchCoordX) || 50,
        coordinateY: Number(branchCoordY) || 50,
        branchImage: branchImage.trim() || "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=400"
      };

      if (editingBranchId) {
        success = await updateBranch(editingBranchId, branchFields);
        if (success) {
          onShowToast("✅ Cabang salon & Jam operasional berhasil diperbarui!", "success");
        }
      } else {
        success = await createBranch({
          ...branchFields,
          rating: 4.8,
          reviewCount: 15,
          distance: "1.0 km",
          estTime: "5 mnt berkendara"
        });
        if (success) {
          onShowToast("✅ Cabang salon berhasil didaftarkan!", "success");
        }
      }

      if (success) {
        setShowBranchModal(false);
        setEditingBranchId(null);
        setBranchName("");
        setBranchCodename("");
        setBranchAddress("");
        setBranchGmaps("");
        setBranchPhone("");
        setBranchWhatsapp("");
        setBranchHours("09:00 - 18:00 WIB (Setiap Hari)");
        setBranchFeatures("Mushola Privat, Bebas Pria, Aman Syariah");
        setBranchImage("");
        setBranchCoordX("50");
        setBranchCoordY("50");
        const list = await fetchBranches();
        setBranches(list);
      }
    } catch {
      onShowToast(editingBranchId ? "Gagal memperbarui cabang." : "Gagal mendaftarkan cabang.", "error");
    }
  };

  const handleSaveGlobalOperatingHours = async () => {
    if (!globalHoursInput.trim()) {
      onShowToast("Teks jam operasional tidak boleh kosong.", "error");
      return;
    }
    try {
      // Find primary branch ID (default is "br-01")
      const targetBranchId = branches[0]?.id || "br-01";
      const success = await updateBranch(targetBranchId, { operatingHours: globalHoursInput });
      if (success) {
        onShowToast("✅ Jam operasional salon berhasil diperbarui secara global!", "success");
        const list = await fetchBranches();
        setBranches(list);
      } else {
        onShowToast("Gagal memperbarui jam operasional.", "error");
      }
    } catch (e) {
      console.error(e);
      onShowToast("Terjadi kesalahan sistem saat memperbarui jam operasional.", "error");
    }
  };

  const handleBulkBranchPaste = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkPasteText.trim()) {
      onShowToast("Tolong isi teks alamat yang ingin di-paste.", "error");
      return;
    }
    try {
      // Split by double newline or blank lines
      const blocks = bulkPasteText.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
      let count = 0;
      for (const block of blocks) {
        const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length >= 2) {
          const name = lines[0];
          const address = lines[1];
          const phone = lines[2] || "021-7195822";
          const whatsapp = lines[3] || "6285399998888";
          const codename = name.split('-')[0].trim();
          
          await createBranch({
            name,
            codename,
            address,
            phone,
            whatsapp,
            googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(name + ' ' + address)}`,
            operatingHours: "09:00 - 18:00 WIB (Setiap Hari)",
            rating: 4.8,
            reviewCount: 22,
            features: ["100% Muslimah", "Partition Hijab VIP", "Mushola Steril"],
            distance: "1.2 km",
            estTime: "6 mnt berkendara",
            coordinateX: 30 + Math.floor(Math.random() * 40),
            coordinateY: 30 + Math.floor(Math.random() * 40),
            branchImage: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=400"
          });
          count++;
        }
      }
      if (count > 0) {
        onShowToast(`✅ Berhasil menambahkan ${count} cabang dari paste alamat!`, "success");
        setShowBulkPasteModal(false);
        setBulkPasteText("");
        const list = await fetchBranches();
        setBranches(list);
      } else {
        onShowToast("Format teks paste tidak sesuai. Pastikan ada nama di baris pertama dan alamat di baris kedua tiap blok.", "error");
      }
    } catch {
      onShowToast("Gagal memproses bulk paste.", "error");
    }
  };

  const handleDeleteBranch = async (id: string) => {
    if (confirm("Hapus cabang ini dari peta penunjuk lokasi?")) {
      try {
        const success = await deleteBranch(id);
        if (success) {
          onShowToast("Cabang dihapus dari daftar.", "success");
          setBranches(prev => prev.filter(b => b.id !== id));
        }
      } catch {
        onShowToast("Gagal menghapus cabang.", "error");
      }
    }
  };

  // Stats calculate
  const totalRevenue = bookings
    .filter(b => b.status === "done")
    .length * 150000; // Average transaction estimate

  return (
    <div className="space-y-5 pb-20 animate-fade-in-up">


      {/* Bento-Style Control Hub (Owner Menu) - Only shown when activeTab is null */}
      {activeTab === null && (
        <div className="space-y-3 font-sans">
          {/* Row 1: Booking - Kotak Sendiri (Full Width) */}
          <button
            onClick={() => setActiveTab('bookings')}
            className="w-full text-left p-4.5 rounded-2xl border border-[#ECE8E1] bg-gradient-to-br from-[#FAF6EE] via-[#FDFBF7] to-[#FAF6EE] hover:bg-[#FAF6EE] text-stone-900 shadow-3xs cursor-pointer flex items-center justify-between group relative overflow-hidden active:scale-[0.98] transition-all duration-200"
          >
            <div className="absolute right-0 top-0 bottom-0 w-36 bg-gradient-to-l from-[#A98436]/10 to-transparent pointer-events-none" />
            <div className="flex items-center gap-3.5 relative z-10 text-left">
              <div className="p-2.5 rounded-xl bg-[#A98436]/10 text-[#A98436] transition-colors duration-250 shadow-3xs">
                <Calendar className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-serif font-black text-sm uppercase tracking-wider text-stone-900">Booking Reservasi</span>
                  {bookings.filter(b => b.status === 'pending').length > 0 && (
                    <span className="bg-[#A98436] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md leading-none animate-pulse">
                      {bookings.filter(b => b.status === 'pending').length} Baru
                    </span>
                  )}
                </div>
                <p className="text-[10px] sm:text-[11px] mt-0.5 font-medium text-stone-500">
                  Konfirmasi jadwal pelanggan & review treatment aktif
                </p>
              </div>
            </div>
            <span className="font-mono text-xs font-black px-3 py-1 rounded-lg shrink-0 bg-[#A98436]/10 text-[#A98436] border border-[#A98436]/20">
              {bookings.length}
            </span>
          </button>

          {/* Rows with 3 columns per row for the rest of the options */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Box 1: Pesanan Butik */}
            <button
              onClick={() => setActiveTab('orders')}
              className="text-left p-3 rounded-2xl border border-[#ECE8E1] bg-[#FDFBF7] hover:bg-[#FAF6EE] text-stone-900 shadow-3xs cursor-pointer flex flex-col justify-between h-[115px] active:scale-95 transition-all duration-200"
            >
              <div className="flex justify-between items-start w-full">
                <div className="p-1.5 rounded-xl bg-[#A98436]/10 text-[#A98436]">
                  <ShoppingBag className="w-4 h-4 stroke-[2]" />
                </div>
                <span className="font-mono text-[9px] font-black px-1.5 py-0.5 rounded-md bg-[#A98436]/15 text-[#A98436]">
                  {orders.length}
                </span>
              </div>
              <div className="mt-2 text-left w-full overflow-hidden">
                <span className="font-serif font-black text-[11px] block leading-tight truncate text-stone-850">Butik</span>
                <span className="text-[9px] font-semibold block mt-0.5 truncate leading-none text-[#A98436]">
                  {orders.filter(o => o.status === 'pending').length > 0 ? `${orders.filter(o => o.status === 'pending').length} Baru` : 'Selesai'}
                </span>
              </div>
            </button>

            {/* Box 2: Treatment */}
            <button
              onClick={() => setActiveTab('treatments')}
              className="text-left p-3 rounded-2xl border border-[#ECE8E1] bg-[#FDFBF7] hover:bg-[#FAF6EE] text-stone-900 shadow-3xs cursor-pointer flex flex-col justify-between h-[115px] active:scale-95 transition-all duration-200"
            >
              <div className="flex justify-between items-start w-full">
                <div className="p-1.5 rounded-xl bg-[#A98436]/10 text-[#A98436]">
                  <Sparkles className="w-4 h-4 stroke-[2]" />
                </div>
                <span className="font-mono text-[9px] font-black px-1.5 py-0.5 rounded-md bg-[#A98436]/15 text-[#A98436]">
                  {treatments.length}
                </span>
              </div>
              <div className="mt-2 text-left w-full overflow-hidden">
                <span className="font-serif font-black text-[11px] block leading-tight truncate text-stone-850">Treatment</span>
                <span className="text-[9px] font-semibold block mt-0.5 truncate leading-none text-[#A98436]">
                  Katalog Jasa
                </span>
              </div>
            </button>

            {/* Box 3: Produk */}
            <button
              onClick={() => setActiveTab('products')}
              className="text-left p-3 rounded-2xl border border-[#ECE8E1] bg-[#FDFBF7] hover:bg-[#FAF6EE] text-stone-900 shadow-3xs cursor-pointer flex flex-col justify-between h-[115px] active:scale-95 transition-all duration-200"
            >
              <div className="flex justify-between items-start w-full">
                <div className="p-1.5 rounded-xl bg-[#A98436]/10 text-[#A98436]">
                  <LayoutGrid className="w-4 h-4 stroke-[2]" />
                </div>
                <span className="font-mono text-[9px] font-black px-1.5 py-0.5 rounded-md bg-[#A98436]/15 text-[#A98436]">
                  {products.length}
                </span>
              </div>
              <div className="mt-2 text-left w-full overflow-hidden">
                <span className="font-serif font-black text-[11px] block leading-tight truncate text-stone-850">Produk</span>
                <span className="text-[9px] font-semibold block mt-0.5 truncate leading-none text-[#A98436]">
                  Stok Butik
                </span>
              </div>
            </button>

            {/* Box 4: Laporan */}
            <button
              onClick={() => setActiveTab('stats')}
              className="text-left p-3 rounded-2xl border border-[#ECE8E1] bg-[#FDFBF7] hover:bg-[#FAF6EE] text-stone-900 shadow-3xs cursor-pointer flex flex-col justify-between h-[115px] active:scale-95 transition-all duration-200"
            >
              <div className="flex justify-between items-start w-full">
                <div className="p-1.5 rounded-xl bg-[#A98436]/10 text-[#A98436]">
                  <BarChart3 className="w-4 h-4 stroke-[2]" />
                </div>
              </div>
              <div className="mt-2 text-left w-full overflow-hidden">
                <span className="font-serif font-black text-[11px] block leading-tight truncate text-stone-850">Laporan</span>
                <span className="text-[9px] font-semibold block mt-0.5 truncate leading-none text-[#A98436]">
                  Kas & Omzet
                </span>
              </div>
            </button>

            {/* Box 5: Cabang */}
            <button
              onClick={() => setActiveTab('branches')}
              className="text-left p-3 rounded-2xl border border-[#ECE8E1] bg-[#FDFBF7] hover:bg-[#FAF6EE] text-stone-900 shadow-3xs cursor-pointer flex flex-col justify-between h-[115px] active:scale-95 transition-all duration-200"
            >
              <div className="flex justify-between items-start w-full">
                <div className="p-1.5 rounded-xl bg-[#A98436]/10 text-[#A98436]">
                  <MapPin className="w-4 h-4 stroke-[2]" />
                </div>
                <span className="font-mono text-[9px] font-black px-1.5 py-0.5 rounded-md bg-[#A98436]/15 text-[#A98436]">
                  {branches.length}
                </span>
              </div>
              <div className="mt-2 text-left w-full overflow-hidden">
                <span className="font-serif font-black text-[11px] block leading-tight truncate text-stone-850">Cabang</span>
                <span className="text-[9px] font-semibold block mt-0.5 truncate leading-none text-[#A98436]">
                  Peta Lokasi
                </span>
              </div>
            </button>

            {/* Box 6: Promo & Kupon */}
            <button
              onClick={() => setActiveTab('promos')}
              className="text-left p-3 rounded-2xl border border-[#ECE8E1] bg-[#FDFBF7] hover:bg-[#FAF6EE] text-stone-900 shadow-3xs cursor-pointer flex flex-col justify-between h-[115px] active:scale-95 transition-all duration-200"
            >
              <div className="flex justify-between items-start w-full">
                <div className="p-1.5 rounded-xl bg-[#A98436]/10 text-[#A98436]">
                  <Gift className="w-4 h-4 stroke-[2]" />
                </div>
                <span className="font-mono text-[9px] font-black px-1.5 py-0.5 rounded-md bg-[#A98436]/15 text-[#A98436]">
                  {promos.length}
                </span>
              </div>
              <div className="mt-2 text-left w-full overflow-hidden">
                <span className="font-serif font-black text-[11px] block leading-tight truncate text-stone-850">Promo</span>
                <span className="text-[9px] font-semibold block mt-0.5 truncate leading-none text-[#A98436]">
                  Diskon & Event
                </span>
              </div>
            </button>

            {/* Box 7: Galeri Portfolio */}
            <button
              onClick={() => setActiveTab('gallery')}
              className="col-span-3 text-left p-4.5 rounded-2xl border border-[#ECE8E1] bg-[#FDFBF7] hover:bg-[#FAF6EE] text-stone-900 shadow-3xs cursor-pointer flex items-center justify-between group relative overflow-hidden active:scale-[0.98] transition-all duration-200"
            >
              <div className="flex items-center gap-3.5 relative z-10 text-left">
                <div className="p-2.5 rounded-xl bg-[#A98436]/10 text-[#A98436]">
                  <Images className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <span className="font-serif font-black text-sm uppercase tracking-wider block text-stone-900">Galeri Portfolio</span>
                  <p className="text-[10px] mt-0.5 font-medium text-stone-500">
                    Koleksi foto salon & portfolio hasil treatment
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs font-black px-3 py-1 rounded-lg shrink-0 bg-[#A98436]/10 text-[#A98436] border border-[#A98436]/20">
                {galleryItems.length}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Selected Tab Page View - Only rendered when activeTab is not null */}
      {activeTab !== null && (
        loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-stone-800 animate-spin" />
            <span className="text-xs text-stone-450 font-medium">Memuat database salon...</span>
          </div>
        ) : (
          <div className="bg-white border-2 border-stone-250/90 shadow-md rounded-[32px] p-5 sm:p-7 space-y-6">
            {/* Navigasi Kembali ke Menu Utama */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 shrink-0">
              <button
                onClick={() => setActiveTab(null)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-750 text-[11px] font-black rounded-xl transition-all cursor-pointer active:scale-95 border border-stone-200"
              >
                <span>← Kembali ke Menu Owner</span>
              </button>
              <span className="font-serif font-black text-xs sm:text-sm text-[#A98436] tracking-wide uppercase">
                {activeTab === 'bookings' && "Kelola Reservasi"}
                {activeTab === 'orders' && "Pesanan Butik"}
                {activeTab === 'treatments' && "Kelola Treatment"}
                {activeTab === 'products' && "Kelola Stok Produk"}
                {activeTab === 'stats' && "Laporan Keuangan"}
                {activeTab === 'branches' && "Cabang & Peta"}
                {activeTab === 'promos' && "Promo & Kupon"}
                {activeTab === 'gallery' && "Kelola Galeri"}
              </span>
            </div>

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
                      className="bg-white border border-stone-300 border-l-[4px] border-l-stone-900 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md hover:border-stone-400 transition-all text-left"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-stone-900">{b.userName || b.userEmail || "Pengunjung"}</span>
                          <span className="text-[9px] uppercase tracking-wider bg-stone-100 text-stone-550 border rounded px-1.5 font-bold">
                            {b.status}
                          </span>
                        </div>
                        <p className="text-xs text-gold-700 font-serif font-semibold">{b.treatment}</p>
                        <div className="flex items-center gap-3 text-[10px] text-stone-500 font-light flex-wrap">
                          <span>📅 {b.date} &middot; 🕒 {b.time}</span>
                          <span className="bg-amber-100 text-stone-900 px-1.5 py-0.5 rounded text-[8.5px] font-bold font-mono">🚪 {b.room || "Ruangan 1"}</span>
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

          {/* TAB: BOUTIQUE ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-stone-900 text-[15px]">Pesanan Butik / Shop ({orders.length})</h3>
                <span className="text-[10px] text-stone-500 italic">*Fulfill pesanan setelah pengiriman / pembayaran</span>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-stone-200 bg-white rounded-3xl">
                  <ShoppingBag className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs text-stone-500 font-medium">Belum ada pesanan butik dari pelanggan.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <div 
                      key={o.id}
                      className="bg-white border border-stone-300 border-l-[4px] border-l-amber-600 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md hover:border-stone-400 transition-all text-left"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-stone-900">{o.userName || o.userEmail || "Pengunjung"}</span>
                          <span className={`text-[9px] uppercase tracking-wider border rounded px-1.5 font-bold ${
                            o.status === 'completed' 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                              : o.status === 'cancelled'
                              ? 'bg-rose-50 border-rose-200 text-rose-700'
                              : 'bg-amber-50 border-amber-200 text-amber-800'
                          }`}>
                            {o.status === 'completed' ? 'Selesai' : o.status === 'cancelled' ? 'Batal' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-xs text-amber-800 font-serif font-semibold">{o.productName}</p>
                        <div className="flex items-center gap-3 text-[10px] text-stone-500 font-light flex-wrap">
                          <span>📅 Tanggal: {o.date}</span>
                          <span className="bg-amber-100 text-stone-950 px-1.5 py-0.5 rounded text-[8.5px] font-bold font-mono">
                            💰 Rp {o.price?.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      {/* Action Triggers */}
                      <div className="flex items-center gap-1.5 border-t border-stone-50 md:border-t-0 pt-2 md:pt-0 justify-end">
                        {o.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleOrderStatusChange(o.id, 'completed')}
                              className="bg-[#A98436] hover:bg-[#b08d25] text-neutral-950 px-2.5 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer text-[10px] font-bold flex items-center gap-1"
                              title="Tandai Selesai"
                            >
                              <Check className="w-3.5 h-3.5" /> Selesaikan
                            </button>
                            <button
                              onClick={() => handleOrderStatusChange(o.id, 'cancelled')}
                              className="bg-rose-100 hover:bg-rose-200 text-rose-700 px-2.5 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer text-[10px] font-bold flex items-center gap-1"
                              title="Batalkan Pesanan"
                            >
                              <X className="w-3.5 h-3.5" /> Batalkan
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleOrderDelete(o.id)}
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowTreatmentModal(true)}
                    className="bg-stone-950 hover:bg-neutral-800 text-gold-300 font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1 cursor-pointer shadow-sm active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4 text-gold-400" /> Tambah Perawatan
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {treatments.map((t) => (
                  <div 
                    key={t.id}
                    className="p-4 bg-white border border-stone-300 border-l-[4px] border-l-gold-500 rounded-2xl flex flex-col justify-between gap-3 shadow-md relative hover:border-stone-400 transition-all text-left"
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowProductModal(true)}
                    className="bg-stone-950 hover:bg-neutral-800 text-gold-300 font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1 cursor-pointer shadow-sm active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4 text-gold-400" /> Tambah Produk
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {products.map((p) => (
                  <div 
                    key={p.id}
                    className="p-4 bg-white border border-stone-300 border-l-[4px] border-l-amber-700 rounded-2xl flex justify-between gap-3 shadow-md relative items-center hover:border-stone-400 transition-all text-left"
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

          {/* TAB 5: BRANCH/LOCATION MANAGER */}
          {activeTab === 'branches' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4 text-left">
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-[15px]">Data Cabang & Lokasi Map ({branches.length})</h3>
                  <p className="text-[11px] text-stone-500 font-light">Cabang-cabang ini otomatis tampil pada rute dan penunjuk peta GPS.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowBulkPasteModal(true)}
                    className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-[11px] py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 transition-all"
                  >
                    🚀 Paste Alamat Sekaligus
                  </button>
                  <button
                    onClick={openAddBranch}
                    className="bg-stone-950 hover:bg-neutral-800 text-gold-300 font-bold text-[11px] py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer shadow-sm active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4 text-gold-400" /> Tambah Cabang
                  </button>
                </div>
              </div>

              {/* QUICK OPERATING HOURS CONTROLLER */}
              <div className="bg-amber-50/70 border-2 border-amber-200/80 rounded-3xl p-5 space-y-3.5 shadow-md text-left">
                <div className="flex items-center gap-2">
                  <div className="p-1 px-1.5 bg-amber-100 border border-amber-200 rounded-lg text-amber-900">
                    <Clock className="w-4.5 h-4.5 text-amber-850 shrink-0" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider leading-none">Kontrol Jam Operasional Salon</h4>
                    <span className="text-[9.5px] text-amber-700/90 font-bold uppercase tracking-wider">Jam Kerja Cabang Utama</span>
                  </div>
                </div>
                <p className="text-[11px] text-stone-605 leading-relaxed font-light">
                  Ketikkan jam operasional salon Anda di bawah ini secara bebas (misal: <code className="bg-amber-100 border font-mono px-1 rounded">Senin - Minggu | 09:00 - 21:00 WIB</code>). Teks ini akan langsung muncul di halaman beranda pelanggan.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-0.5">
                  <input
                    type="text"
                    value={globalHoursInput}
                    onChange={(e) => setGlobalHoursInput(e.target.value)}
                    className="bg-white border-2 border-stone-250 focus:border-gold-500 rounded-xl py-2 px-3 text-xs text-stone-900 font-black flex-1 outline-none font-sans"
                    placeholder="Contoh: Senin - Minggu | 09:00 - 21:00 WIB"
                  />
                  <button
                    type="button"
                    onClick={handleSaveGlobalOperatingHours}
                    className="bg-stone-950 hover:bg-neutral-800 text-gold-300 font-extrabold text-xs py-2 px-4 rounded-xl cursor-pointer shadow-md active:scale-95 transition-all w-full sm:w-auto text-center shrink-0"
                  >
                    Simpan Jam Operasional
                  </button>
                </div>
              </div>

              {branches.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-stone-250 bg-white rounded-3xl">
                  <LayoutGrid className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs text-stone-500 font-medium">Belum ada cabang terdaftar.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-left">
                  {branches.map((br) => (
                    <div 
                      key={br.id}
                      className="p-4 bg-white border border-stone-300 border-l-[4px] border-l-amber-700 rounded-3xl flex flex-col justify-between gap-3.5 shadow-md relative overflow-hidden group hover:border-stone-400 transition-all text-left"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0 pr-14">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 border shrink-0 relative">
                          <img src={br.branchImage} alt={br.name} className="w-full h-full object-cover" />
                          <div className="absolute top-1 left-1 bg-stone-900/80 text-gold-400 text-[8px] px-1 py-0.2 rounded font-mono font-bold leading-none">
                            X:{br.coordinateX} Y:{br.coordinateY}
                          </div>
                        </div>
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-serif font-bold text-xs text-stone-900 line-clamp-1">{br.codename}</h4>
                            <span className="text-[8px] bg-stone-100 text-stone-600 border rounded px-1.5 py-0.2 font-mono font-bold uppercase shrink-0 leading-none">
                              ⭐ {br.rating}
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-505 font-medium line-clamp-2 leading-relaxed">{br.address}</p>
                          <div className="flex items-center gap-3 text-[9px] text-[#8c6d2c] font-black uppercase tracking-wider">
                            <span>📞 {br.phone}</span>
                            <span>•</span>
                            <span>💬 WA: {br.whatsapp}</span>
                          </div>
                          
                          {/* Jam Operasional */}
                          <div className="text-[10px] bg-stone-50 border border-stone-150/40 rounded-xl px-2 py-1 mt-1 font-bold text-stone-800 w-fit flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gold-620 shrink-0" />
                            <span>{br.operatingHours}</span>
                          </div>
                        </div>
                      </div>

                      <div className="absolute right-2 top-2 flex items-center gap-0.5">
                        <button
                          onClick={() => openEditBranch(br)}
                          className="text-stone-400 hover:text-gold-600 p-2 rounded-full cursor-pointer hover:bg-stone-50 transition-all"
                          title="Edit Cabang / Jam Operasional"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBranch(br.id)}
                          className="text-stone-400 hover:text-rose-600 p-2 rounded-full cursor-pointer hover:bg-stone-50 transition-all"
                          title="Hapus Cabang"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: PROMO & DISCOUNT MANAGER */}
          {activeTab === 'promos' && (
            <div className="space-y-4 text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4 text-left">
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-[15px]">Data Promo & Kupon Diskon ({promos.length})</h3>
                  <p className="text-[11px] text-stone-500 font-light">Kelola penawaran bulanan (Home Page) dan kupon kode aktif (Profile Page) dari panel ini.</p>
                </div>
                <button
                  onClick={() => setShowPromoModal(true)}
                  className="bg-stone-950 hover:bg-neutral-800 text-gold-300 font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1 cursor-pointer shadow-sm active:scale-95 transition-all w-fit shrink-0"
                >
                  <Plus className="w-4 h-4 text-gold-400" /> Tambah Promo Baru
                </button>
              </div>

              {promos.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-stone-200 bg-white rounded-3xl">
                  <Gift className="w-8 h-8 text-stone-300 mx-auto mb-2 animate-pulse" />
                  <p className="text-xs text-stone-500 font-medium">Belum ada promo atau voucher terdaftar.</p>
                  <p className="text-[10px] text-stone-400">Silakan tambahkan baru agar promo tampil di halaman beranda & profile pelanggan.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-left">
                  {promos.map((p) => (
                    <div 
                      key={p.id}
                      className="p-4 bg-white border border-stone-300 border-l-[4px] border-l-emerald-600 rounded-3xl flex flex-col justify-between gap-3 shadow-md relative overflow-hidden hover:border-stone-400 transition-all text-left"
                    >
                      <div className="space-y-1.5 pr-8">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] border font-black uppercase tracking-wider rounded px-1.5 py-0.5 leading-none ${
                            p.type === 'banner' ? 'bg-amber-50 text-amber-700 border-amber-250' : 'bg-emerald-50 text-emerald-700 border-emerald-250'
                          }`}>
                            {p.type === 'banner' ? 'Banner Beranda' : 'Kupon Profil'}
                          </span>
                          {p.code && (
                            <code className="text-[9px] bg-stone-100 text-stone-700 border font-mono px-1 py-0.2 rounded font-bold">
                              KODE: {p.code}
                            </code>
                          )}
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-xs text-stone-900">{p.title}</h4>
                          <p className="text-[10px] text-stone-500 leading-relaxed font-light">{p.description}</p>
                        </div>
                        <div className="pt-1 text-xs font-bold text-gold-650 flex items-center gap-1">
                          Nominal Diskon: <span className="text-stone-900 bg-stone-100 p-1 rounded text-[10px] font-mono leading-none">{p.discountValue}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeletePromo(p.id)}
                        className="absolute right-3.5 top-3.5 text-stone-400 hover:text-rose-600 p-1.5 rounded-full cursor-pointer hover:bg-stone-50 transition-all shadow-xs"
                        title="Hapus Promo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: GALLERY PORTFOLIO MANAGER */}
          {activeTab === 'gallery' && (
            <div className="space-y-4 text-left font-sans">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4 text-left">
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-[15px]">Data Galeri Portfolio ({galleryItems.length})</h3>
                  <p className="text-[11px] text-stone-500 font-light font-sans">Kelola foto-foto hasil pengerjaan salon, spa, facial hijabers, dan tata ruang Alisya Muslimah.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={async () => {
                      if (confirm("Apakah Anda yakin ingin mengosongkan semua foto portfolio di galeri?")) {
                        const s = await clearAllGalleryItems();
                        if (s) {
                          onShowToast("Galeri berhasil dikosongkan.", "success");
                          setGalleryItems([]);
                        }
                      }
                    }}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1 cursor-pointer shadow-sm active:scale-95 transition-all w-fit"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Kosongkan Galeri
                  </button>
                  <button
                    onClick={() => setShowGalleryModal(true)}
                    className="bg-stone-950 hover:bg-neutral-800 text-gold-300 font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1 cursor-pointer shadow-sm active:scale-95 transition-all w-fit shrink-0 font-sans"
                  >
                    <Plus className="w-4 h-4 text-gold-400" /> Tambah Foto Galeri
                  </button>
                </div>
              </div>

              {galleryItems.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-stone-200 bg-white rounded-3xl">
                  <LayoutGrid className="w-8 h-8 text-[#A98436] mx-auto mb-2 animate-pulse opacity-75" />
                  <p className="text-xs text-stone-500 font-semibold font-sans">Belum ada foto portfolio dalam galeri.</p>
                  <p className="text-[10px] text-stone-400 mt-1 font-sans">Silakan tambahkan baru agar foto tampil di halaman Galeri pelanggan.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                  {galleryItems.map((g) => (
                    <div 
                      key={g.id}
                      className="group relative bg-[#FAF8F5]/80 border border-stone-200 hover:border-[#A98436]/35 overflow-hidden rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden">
                        <img 
                          src={g.url} 
                          alt={g.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" 
                        />
                        <div className="absolute top-2 right-2 bg-stone-950/85 backdrop-blur-xs text-white text-[8px] font-mono px-1.5 py-0.5 rounded uppercase leading-none font-bold">
                          {g.category === 'hair' ? 'Hair' : g.category === 'face' ? 'Face' : g.category === 'body' ? 'Body' : g.category === 'spa' ? 'Spa' : 'Interior'}
                        </div>
                      </div>
                      
                      <div className="p-3 space-y-1 text-left flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-xs text-stone-900 line-clamp-1 font-serif">{g.title}</h4>
                          <p className="text-[10px] text-stone-500 line-clamp-2 leading-relaxed font-light font-sans">{g.desc}</p>
                        </div>
                        <div className="flex items-center justify-between pt-1.5 border-t border-stone-100/60 mt-2 text-[9px] text-stone-500">
                          <span className="font-mono text-[#A98436] font-bold">★ {g.likes} Suka</span>
                          <span className="text-[8px] bg-stone-100 px-1.5 py-0.5 rounded leading-none font-bold font-mono text-stone-605">{g.duration || "Bebas Aurat"}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteGalleryItem(g.id)}
                        className="absolute right-2 top-2 bg-stone-950/90 text-white hover:text-rose-500 hover:bg-stone-900 p-1.5 rounded-full cursor-pointer transition-all active:scale-90 opacity-0 group-hover:opacity-100 shadow-md"
                        title="Hapus Foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      ))}

      {/* NEW PROMO MODAL */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <form 
            onSubmit={handleCreatePromo}
            className="bg-white rounded-3xl border max-w-sm w-full p-5 space-y-4 shadow-2xl animate-fade-in-up text-left max-h-[90vh] flex flex-col my-auto"
          >
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3 shrink-0">
              <Gift className="w-5 h-5 text-gold-600" />
              <h3 className="font-serif font-bold text-sm text-stone-900">Tambah Promo / Kupon Baru</h3>
            </div>
            
            <div className="space-y-3 text-xs overflow-y-auto pr-1 flex-1 min-h-0 py-1">
              <div className="space-y-1">
                <label className="font-bold text-stone-700">Tipe Promo</label>
                <select 
                  value={promoType}
                  onChange={(e) => setPromoType(e.target.value as 'banner' | 'coupon')}
                  className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2 px-3 outline-none transition-all font-semibold"
                >
                  <option value="banner">Banner Beranda (Monthly Offer)</option>
                  <option value="coupon">Kupon Kode Profil pelanggan</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Judul Promo / Voucher</label>
                <input 
                  type="text"
                  required
                  value={promoTitle}
                  onChange={(e) => setPromoTitle(e.target.value)}
                  placeholder="Contoh: Diskon 20% Ramadhan Sehat"
                  className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2 px-3 outline-none transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Nilai Diskon / Potongan</label>
                <input 
                  type="text"
                  required
                  value={promoVal}
                  onChange={(e) => setPromoVal(e.target.value)}
                  placeholder="Contoh: 20% ATAU Rp 25.000"
                  className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2 px-3 outline-none transition-all font-semibold font-mono text-gold-700"
                />
              </div>

              {promoType === 'coupon' && (
                <div className="space-y-1 animate-fade-in">
                  <label className="font-bold text-stone-700">Kode Kupon (Kapital & Tanpa spasi)</label>
                  <input 
                    type="text"
                    required={promoType === 'coupon'}
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: SHALIHA20"
                    className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2 px-3 outline-none transition-all font-bold font-mono tracking-widest text-[#8c6d2c]"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Keterangan / Aturan Pengerjaan</label>
                <textarea 
                  rows={3}
                  value={promoDesc}
                  onChange={(e) => setPromoDesc(e.target.value)}
                  placeholder="Contoh: Berlaku sepanjang hari libur untuk minimal transaksi 150rb..."
                  className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2 px-3 outline-none transition-all leading-normal"
                />
              </div>
            </div>

            <div className="flex items-center gap-3.5 pt-2 shrink-0 border-t border-stone-100 mt-2">
              <button
                type="button"
                onClick={() => setShowPromoModal(false)}
                className="flex-1 py-1.8 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl font-bold text-xs cursor-pointer active:scale-95 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-1.8 bg-gold-500 hover:bg-gold-400 text-neutral-950 rounded-xl font-bold text-xs cursor-pointer active:scale-95 transition-all"
              >
                Simpan Promo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* NEW TREATMENT MODAL */}
      {showTreatmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <form 
            onSubmit={handleCreateTreatment}
            className="bg-white rounded-3xl border max-w-sm w-full p-5 space-y-4 shadow-2xl animate-fade-in-up max-h-[90vh] flex flex-col my-auto text-left"
          >
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3 shrink-0">
              <Sparkles className="w-5 h-5 text-gold-650" />
              <h3 className="font-serif font-bold text-sm text-stone-900">Tambah Treatment Baru</h3>
            </div>
            
            <div className="space-y-3 text-xs overflow-y-auto pr-1 flex-1 min-h-0 py-1">
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
                <label className="font-bold text-stone-700">Kategori Perawatan</label>
                <select 
                  value={treatmentCategory}
                  onChange={(e) => setTreatmentCategory(e.target.value)}
                  className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2.5 px-3 outline-none transition-all text-xs font-semibold cursor-pointer"
                >
                  <option value="Hair">Hair Treatment</option>
                  <option value="Body">Body Treatment (Bekam & Akupuntur)</option>
                  <option value="Spa">Paket Spa</option>
                  <option value="Facial">Facial Glowing</option>
                  <option value="Microbright">Facial Microbright</option>
                  <option value="Laser">Pico Laser</option>
                </select>
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

            <div className="flex items-center gap-3.5 pt-2 shrink-0 border-t border-stone-100 mt-2">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <form 
            onSubmit={handleCreateProduct}
            className="bg-white rounded-3xl border max-w-sm w-full p-5 space-y-4 shadow-2xl animate-fade-in-up max-h-[90vh] flex flex-col my-auto text-left"
          >
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3 shrink-0">
              <ShoppingBag className="w-5 h-5 text-gold-600" />
              <h3 className="font-serif font-bold text-sm text-stone-900">Tambah Produk Butik</h3>
            </div>
            
            <div className="space-y-3 text-xs overflow-y-auto pr-1 flex-1 min-h-0 py-1">
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

            <div className="flex items-center gap-3.5 pt-2 shrink-0 border-t border-stone-100 mt-2">
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

      {/* NEW BRANCH MODAL */}
      {showBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <form 
            onSubmit={handleCreateBranch}
            className="bg-white rounded-3xl border max-w-sm w-full p-5 space-y-4 shadow-2xl animate-fade-in-up my-8 text-left"
          >
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <MapPin className="w-5 h-5 text-gold-600" />
              <h3 className="font-serif font-bold text-sm text-stone-900 font-sans">
                {editingBranchId ? "Edit Cabang & Jam Operasional" : "Tambah Cabang Baru"}
              </h3>
            </div>
            
            <div className="space-y-2.5 text-xs max-h-[380px] overflow-y-auto pr-1">
              <div className="space-y-1">
                <label className="font-bold text-stone-750">Nama Cabang (Utuh)</label>
                <input 
                  type="text"
                  required
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="Contoh: Alisya Premium Salon - Tebet"
                  className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2 px-3 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-750">Nama Singkat (Codename)</label>
                <input 
                  type="text"
                  value={branchCodename}
                  onChange={(e) => setBranchCodename(e.target.value)}
                  placeholder="Contoh: Alisya Tebet"
                  className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2 px-3 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-750">Alamat Lengkap</label>
                <textarea 
                  rows={2}
                  required
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  placeholder="Jl. Tebet Raya No. 49, Jakarta Selatan"
                  className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2 px-3 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-750">Link Share Google Maps (Opsional)</label>
                <input 
                  type="url"
                  value={branchGmaps}
                  onChange={(e) => setBranchGmaps(e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2 px-3 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-stone-750">No Telepon</label>
                  <input 
                    type="text"
                    value={branchPhone}
                    onChange={(e) => setBranchPhone(e.target.value)}
                    placeholder="021-xxxxxx"
                    className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2 px-3 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-750">No WhatsApp (62xxx)</label>
                  <input 
                    type="text"
                    value={branchWhatsapp}
                    onChange={(e) => setBranchWhatsapp(e.target.value)}
                    placeholder="62853xxxxxxxx"
                    className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2 px-3 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-750">Jam Operasional</label>
                <input 
                  type="text"
                  value={branchHours}
                  onChange={(e) => setBranchHours(e.target.value)}
                  className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2 px-3 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-755">Fitur Unggulan (pisahkan koma)</label>
                <input 
                  type="text"
                  value={branchFeatures}
                  onChange={(e) => setBranchFeatures(e.target.value)}
                  className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2 px-3 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-750">Foto Cabang (Url)</label>
                <input 
                  type="url"
                  value={branchImage}
                  onChange={(e) => setBranchImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2 px-3 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 bg-stone-50 p-2 rounded-xl">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Letak Peta X (0-100)%</label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    value={branchCoordX}
                    onChange={(e) => setBranchCoordX(e.target.value)}
                    className="w-full bg-white border focus:border-gold-500 rounded-lg py-1.5 px-2 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Letak Peta Y (0-100)%</label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    value={branchCoordY}
                    onChange={(e) => setBranchCoordY(e.target.value)}
                    className="w-full bg-white border focus:border-gold-500 rounded-lg py-1.5 px-2 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowBranchModal(false); setEditingBranchId(null); }}
                className="flex-1 py-2 bg-stone-100 text-stone-605 rounded-xl font-bold text-xs hover:bg-stone-250 cursor-pointer active:scale-95 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-gold-500 hover:bg-gold-400 text-neutral-950 rounded-xl font-bold text-xs cursor-pointer active:scale-95 transition-all"
              >
                {editingBranchId ? "Simpan Perubahan" : "Simpan Cabang"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* BULK PASTE BRANCH MODAL */}
      {showBulkPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form 
            onSubmit={handleBulkBranchPaste}
            className="bg-white rounded-3xl border max-w-sm w-full p-5 space-y-4 shadow-2xl animate-fade-in-up text-left"
          >
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <span className="text-xl">🚀</span>
              <h3 className="font-serif font-bold text-sm text-stone-900">Paste Alamat Cabang</h3>
            </div>
            
            <div className="space-y-3.5 text-xs">
              <p className="text-[11px] text-stone-500 leading-relaxed font-light">
                Bos bisa langsung copy-paste beberapa alamat salon sekaligus di bawah ini. Format per blok cabang:
              </p>
              
              <div className="bg-stone-50 p-2.5 rounded-xl border font-mono text-[9px] text-stone-600 block leading-tight">
                Baris 1: Nama Cabang<br />
                Baris 2: Alamat Lengkap<br />
                Baris 3: No Telp Telepon (Opsional)<br />
                Baris 4: No WA (Opsional)<br />
                <br />
                <span className="text-amber-700 italic">*Pisahkan tiap blok dengan 1 baris kosong (tekan enter 2x)*</span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-750">Tempel Teks Alamat Disini</label>
                <textarea 
                  rows={8}
                  required
                  value={bulkPasteText}
                  onChange={(e) => setBulkPasteText(e.target.value)}
                  placeholder="Contoh:&#10;Alisya Tebet Raya&#10;Jl. Tebet Raya No. 49, Jakarta Selatan&#10;021-888999&#10;6285399998888&#10;&#10;Alisya Bekasi Grand&#10;Ruko Grand Galaxy, Bekasi&#10;021-777666&#10;6285399998888"
                  className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2 px-3 outline-none font-mono text-[10px] leading-relaxed transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkPasteModal(false)}
                className="flex-1 py-1.5 bg-stone-100 text-stone-600 rounded-xl font-bold text-xs hover:bg-stone-250 cursor-pointer active:scale-95 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-1.5 bg-gold-500 hover:bg-gold-400 text-neutral-950 rounded-xl font-bold text-xs cursor-pointer active:scale-95 transition-all"
              >
                Proses & Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* NEW GALLERY ITEM MODAL */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <form 
            onSubmit={handleCreateGalleryItem}
            className="bg-white rounded-3xl border max-w-sm w-full p-5 space-y-4 shadow-2xl animate-fade-in-up text-left max-h-[90vh] flex flex-col my-auto"
          >
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3 shrink-0">
              <Images className="w-5 h-5 text-gold-600" />
              <h3 className="font-serif font-bold text-sm text-stone-900 font-serif">Tambah Foto Portfolio Baru</h3>
            </div>
            
            <div className="space-y-3 text-xs overflow-y-auto pr-1 flex-1 min-h-0 py-1 font-sans">
              <div className="space-y-1">
                <label className="font-bold text-stone-700">URL Gambar</label>
                <input 
                  type="url"
                  required
                  value={galleryUrl}
                  onChange={(e) => setGalleryUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2 px-3 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Kategori</label>
                <select 
                  value={galleryCategory}
                  onChange={(e) => setGalleryCategory(e.target.value as any)}
                  className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2 px-3 outline-none transition-all font-semibold"
                >
                  <option value="hair">Hair Care (Rambut)</option>
                  <option value="face">Face Beauty (Wajah)</option>
                  <option value="body">Body Treatment (Tubuh)</option>
                  <option value="spa">Luxury Spa (Spa)</option>
                  <option value="interior">Interior Salon</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Judul Foto / Portofolio</label>
                <input 
                  type="text"
                  required
                  value={galleryTitle}
                  onChange={(e) => setGalleryTitle(e.target.value)}
                  placeholder="Contoh: Totok Aura Wajah Relaksasi"
                  className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2 px-3 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Estimasi Durasi / Keterangan Durasi</label>
                <input 
                  type="text"
                  value={galleryDuration}
                  onChange={(e) => setGalleryDuration(e.target.value)}
                  placeholder="Contoh: 45 Menit ATAU Prosedur Steril"
                  className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2 px-3 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Jumlah Likes Awal</label>
                <input 
                  type="number"
                  value={galleryLikes}
                  onChange={(e) => setGalleryLikes(e.target.value)}
                  placeholder="120"
                  className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2 px-3 outline-none transition-all font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Deskripsi Ringkas</label>
                <textarea 
                  rows={3}
                  required
                  value={galleryDesc}
                  onChange={(e) => setGalleryDesc(e.target.value)}
                  placeholder="Tulis khasiat, kenyamanan sekat privasi, atau ulasan singkat pengerjaan..."
                  className="w-full bg-stone-50 border focus:border-gold-500 focus:bg-white rounded-xl py-2 px-3 outline-none transition-all leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 shrink-0 border-t border-stone-100 mt-2 font-sans">
              <button
                type="button"
                onClick={() => setShowGalleryModal(false)}
                className="flex-1 py-2 bg-stone-100 text-stone-605 rounded-xl font-bold text-xs hover:bg-stone-250 cursor-pointer active:scale-95 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-gold-500 hover:bg-gold-400 text-neutral-950 rounded-xl font-bold text-xs cursor-pointer active:scale-95 transition-all"
              >
                Simpan Foto
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
