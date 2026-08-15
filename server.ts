import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API endpoint for AI Live Chat responses
  app.post("/api/live/chat", async (req, res) => {
    const { message, productContext } = req.body;

    // Use 100% offline contextual response builder directly to ensure data isolation and zero external dependencies
    const msg = (message || "").toLowerCase();
    const isAmbassador = productContext?.isAlyaAmbassadorMode === true;
    let reply = "";

    if (isAmbassador) {
      // High-end, gentle Ambassador persona ("Alya")
      if (msg.includes("promo") || msg.includes("diskon") || msg.includes("potongan") || msg.includes("voucher") || msg.includes("hemat") || msg.includes("murah")) {
        reply = "Tentu saja sista cantik! Hari ini kami ada promo spesial Double Glow Booster dengan potongan 20%, dan diskon 15% untuk butik sutra kami. Yuk segera sista klaim promonya!";
      } else if (msg.includes("facial") || msg.includes("muka") || msg.includes("wajah") || msg.includes("kusam") || msg.includes("glowing")) {
        reply = "Untuk wajah cerah mempesona, Alya sangat merekomendasikan Facial Microbright Shaliha kami. Menggunakan mikro-eksfoliasi lembut dan masker mawar organik agar glowing berseri sista!";
      } else if (msg.includes("rambut") || msg.includes("hair") || msg.includes("rontok") || msg.includes("spa") || msg.includes("hijab")) {
        reply = "Rambut sista yang berhijab butuh nutrisi ekstra lho. Luxury Hair Spa kami menggunakan sari mawar alami untuk menyegarkan kulit kepala dan mengatasi rambut rontok sista.";
      } else if (msg.includes("gamis") || msg.includes("baju") || msg.includes("sutra") || msg.includes("silk") || msg.includes("pakaian") || msg.includes("busana")) {
        reply = "Masya Allah, Gamis Silk Premium kami terbuat dari sutra murni pilihan yang adem, jatuh anggun, dan terlihat sangat mewah. Ada diskon 15% khusus pemesanan hari ini sista!";
      } else if (msg.includes("halal") || msg.includes("bumil") || msg.includes("aman") || msg.includes("bahan") || msg.includes("organik")) {
        reply = "Tenang saja sista shaliha, seluruh treatment dan kosmetik di Alisya Beauty menggunakan 100% bahan organik bersertifikat halal MUI, sangat aman sekali bagi ibu hamil dan menyusui.";
      } else if (msg.includes("booking") || msg.includes("jadwal") || msg.includes("reservasi") || msg.includes("pesan")) {
        reply = "Melakukan booking salon di Alisya sangat praktis sista. Sista tinggal beralih ke menu Booking, pilih treatment dan jam yang diinginkan, jadwal reservasi langsung tercatat otomatis!";
      } else if (msg.includes("member") || msg.includes("poin") || msg.includes("loyalitas") || msg.includes("level")) {
        reply = "Gabung menjadi member Alisya itu gratis sista! Setiap treatment akan menambah poin loyalitas sista untuk ditukarkan dengan voucher diskon melimpah atau gift kecantikan eksklusif.";
      } else if (msg.includes("alamat") || msg.includes("salon") || msg.includes("cabang") || msg.includes("lokasi") || msg.includes("dimana")) {
        reply = "Salon utama kami berada di kawasan premium kota Solo sista cantik, bernuansa asri, mewah, dan khusus wanita agar sista bisa memanjakan diri dengan tenang dan nyaman.";
      } else {
        reply = "Pertanyaan yang sangat bagus sista! Semua layanan premium kami dirancang khusus oleh terapis profesional untuk memanjakan diri sista. Yuk, silakan dicoba treatment hari ini!";
      }
    } else {
      // Energetic Live Selling host persona ("Alisya")
      if (msg.includes("promo") || msg.includes("diskon") || msg.includes("harga") || msg.includes("spill") || msg.includes("murah")) {
        reply = "Masya Allah sista cantik! Khusus hari ini promonya luar biasa menguntungkan, ada diskon live melimpah! Yuk langsung klik keranjang kuning dan checkout sekarang juga sebelum kehabisan slot!";
      } else if (msg.includes("gamis") || msg.includes("baju") || msg.includes("sutra") || msg.includes("silk") || msg.includes("ukuran") || msg.includes("size")) {
        reply = "Gamis Premium Silk Sage Green ini bahannya jatuh mewah sekali sista! Ukurannya ready dari S sampai XL, langsung klik tombol 'Beli' ya sis biar gak direbut sista lainnya!";
      } else if (msg.includes("kering") || msg.includes("bibir") || msg.includes("lip cream") || msg.includes("lipcream") || msg.includes("halal")) {
        reply = "Lip cream Luxury velvet kita dijamin super lembab sista, karena mengandung Vitamin E murni dan berlabel halal MUI. Warnanya tahan seharian dan anti crack di bibir sista!";
      } else if (msg.includes("facial") || msg.includes("muka") || msg.includes("wajah") || msg.includes("glowing") || msg.includes("treatment")) {
        reply = "Wah, Facial Microbright ini beneran rebutan sista! Bikin wajah instan glowing dan bersih bebas komedo kotor. Yuk booking sekarang mumpung live diskonnya masih aktif!";
      } else if (msg.includes("alamat") || msg.includes("lokasi") || msg.includes("cabang") || msg.includes("dimana")) {
        reply = "Studio kecantikan kita beralamat di pusat kota Solo sista. Tempatnya super cozy, aesthetic, dan privat khusus wanita Muslimah. Yuk langsung amankan jadwal kedatangan sista!";
      } else if (msg.includes("cod") || msg.includes("bayar") || msg.includes("kirim") || msg.includes("ongkir")) {
        reply = "Bisa banget dong sista shaliha! Kita melayani kiriman ke seluruh Indonesia dan mendukung pembayaran COD agar sista bisa berbelanja dengan sangat tenang dan aman!";
      } else {
        reply = "Aduh sista cantik, produk ini beneran favorit banget lho di studio! Jangan sampai terlewatkan ya sista, yuk langsung dimasukkan keranjang belanja sekarang juga!";
      }
    }

    res.json({ reply });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
