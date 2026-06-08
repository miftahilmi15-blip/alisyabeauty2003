import React, { useState, useEffect } from 'react';
import { ShoppingBag, Box, ShoppingCart, Percent, ShieldCheck, Sparkles, CheckCircle } from 'lucide-react';
import { fetchProducts } from '../services/dataService';
import { Product } from '../types';

interface ShopPageProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function ShopPage({ onShowToast }: ShopPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (e) {
        console.error("Gagal memuat produk:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleBuy = (name: string) => {
    onShowToast(`🛍️ ${name} ditambahkan ke keranjang! Hubungi WhatsApp kami untuk pengiriman.`, "success");
    
    // Auto-generate WhatsApp checkout text
    const checkoutMessage = `Assalamu'alaikum Alisya Beauty Admin, saya ingin memesan barang butik berikut:

Produk:
${name}

Mohon konfirmasi ketersediaan stok & ongkos kirim. Terima kasih!`;

    const adminWhatsApp = "628123456789";
    const waURL = `https://api.whatsapp.com/send?phone=${adminWhatsApp}&text=${encodeURIComponent(checkoutMessage)}`;
    
    setTimeout(() => {
      window.open(waURL, '_blank');
    }, 1100);
  };

  return (
    <div className="space-y-6 pb-20 text-stone-800 animate-fade-in-up text-left">
      {/* Header */}
      <div className="border-b border-stone-150 pb-4">
        <span className="text-[10px] text-gold-600 uppercase tracking-widest font-black block">Alisya Boutique Shop</span>
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 flex items-center gap-2 mt-0.5">
          <ShoppingBag className="w-5.5 h-5.5 text-gold-500" /> Produk Perawatan Premium
        </h2>
        <p className="text-xs text-stone-650 mt-1.5 max-w-xl font-sans leading-relaxed font-light">
          Hadirkan rahasia perawatan salon Muslimah ke rumah Anda. Rangkaian produk organik halal berizin BPOM, wangi tahan lama, serta ramah untuk pemakaian harian.
        </p>
      </div>

      {/* Info Badge */}
      <div className="bg-stone-50 text-stone-800 rounded-2xl p-4.5 flex items-center gap-4 shadow-sm border border-stone-150 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 blur-xl rounded-full" />
        <ShieldCheck className="w-9 h-9 text-gold-550 shrink-0" />
        <div className="space-y-0.5 font-sans">
          <h4 className="text-xs font-black uppercase tracking-wider text-stone-950">Sertifikat Halal & Keaslian Teruji</h4>
          <p className="text-[10px] text-stone-600 font-light leading-relaxed">
            Semua produk berizin BPOM, aman untuk ibu hamil/menyusui, dan teruji klinis bebas karsinogenik, pewarna sintetis berat, serta alkohol.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-stone-50 rounded-3xl border border-stone-200">
          <div className="w-8 h-8 rounded-full border-2 border-gold-300 border-t-gold-600 animate-spin" />
          <span className="text-xs text-stone-500 font-medium font-sans">Mengambil list produk butik...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-stone-200 bg-stone-50 rounded-2xl">
          <Box className="w-8 h-8 text-stone-450 mx-auto mb-2" />
          <p className="text-sm text-stone-500 font-medium font-sans">Stok butik kosong sementara.</p>
        </div>
      ) : (
        /* ADAPTIVE MULTI-COLUMN PRODUCTS GRID: 1 col on mobile, 2 cols on tablet, 3 cols on desktop */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <div 
              key={p.id}
              className="group bg-white rounded-3xl border border-stone-100 overflow-hidden shadow-sm hover:border-gold-300 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Product Image Stage */}
              <div className="h-48 w-full bg-stone-50/50 relative overflow-hidden flex items-center justify-center border-b border-stone-100">
                {p.imageUrl ? (
                  <img 
                    src={p.imageUrl} 
                    alt={p.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 animate-fade-in-up"
                  />
                ) : (
                  <div className="p-4 flex flex-col items-center justify-center text-stone-400 gap-1.5">
                    <Box className="w-9 h-9 text-gold-550/20" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">No Image Preview</span>
                  </div>
                )}
                
                {/* Premium gold tag badge */}
                <span className="absolute top-3 right-3 bg-gold-200/20 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-gold-500/10 text-[8.5px] font-mono font-bold text-gold-700 flex items-center gap-0.5 shadow-sm">
                  <Percent className="w-2.5 h-2.5 text-gold-600" /> Best Choice
                </span>
              </div>

              {/* Product Details Area */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h3 className="font-serif font-extrabold text-[14px] text-stone-900 group-hover:text-gold-600 transition-colors line-clamp-1 leading-snug">
                    {p.name}
                  </h3>
                  <p className="text-[11px] text-stone-650 font-sans font-light leading-relaxed line-clamp-2">
                    {p.description || "Formula kecantikan alami berkualitas tinggi eksklusif ramah muslimah dari Alisya Pure."}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-stone-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-stone-500 uppercase font-mono tracking-wider">HARGA MEMBER</span>
                    <span className="text-[13px] font-black text-stone-950 font-mono">
                      Rp {Number(p.price || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleBuy(p.name)}
                    className="w-full bg-gold-500 hover:bg-gold-400 text-neutral-950 text-xs font-black py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-md uppercase tracking-wider"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-neutral-950" /> Beli via WhatsApp
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
