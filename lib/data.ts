// lib/data.ts — data awal yang dipakai bersama (FAQ dipakai halaman pembeli & admin)
export type FAQItem = { id: number; kategori: string; pertanyaan: string; jawaban: string };
export const FAQ_LIST: FAQItem[] = [
  {
    id: 1,
    kategori: "Pemesanan & Cold Chain",
    pertanyaan: "Bagaimana sistem Pre-Order Next Day di JalaLink bekerja?",
    jawaban: "Ikan yang Anda pesan hari ini merupakan hasil tangkapan nelayan subuh besoknya. Setelah mendarat di tempat pelelangan, ikan langsung dimasukkan ke dalam kotak es higienis (cold chain) dan dikirim pada hari yang sama ke alamat Anda."
  },
  {
    id: 2,
    kategori: "Pemesanan & Cold Chain",
    pertanyaan: "Apakah ada batas minimal pembelian ikan?",
    jawaban: "Setiap jenis ikan memiliki batas minimal pembelian bervariasi (mulai dari 1 kg hingga 3 kg) tergantung kebijakan nelayan demi menjaga efisiensi penanganan standar kesegaran cold chain."
  },
  {
    id: 3,
    kategori: "Pengiriman & Ongkir",
    pertanyaan: "Bagaimana perhitungan ongkos kirim gabungan per nelayan?",
    jawaban: "Ongkir dihitung berbasis Flat Rate per rute nelayan. Kilogram pertama dikenakan tarif penuh, sedangkan kilogram berikutnya mendapatkan diskon volume otomatis (25% hingga 75%) dalam satu rute nelayan yang sama."
  },
  {
    id: 4,
    kategori: "Pengiriman & Ongkir",
    pertanyaan: "Kapan pesanan ikan saya akan sampai di rumah?",
    jawaban: "Armada pengiriman berpendingin tiba di Hub lokal pukul 05.30 - 07.00 WIB. Kurir area kemudian akan mengantarkan pesanan ke rumah Anda dalam rentang waktu pukul 07.00 - 10.00 WIB."
  },
  {
    id: 5,
    kategori: "Pembayaran & Keamanan",
    pertanyaan: "Metode pembayaran apa saja yang didukung?",
    jawaban: "Saat ini JalaLink mendukung pembayaran instan via QRIS (semua e-wallet dan m-banking) serta Transfer Bank Manual (BCA, BRI, Mandiri)."
  },
  {
    id: 6,
    kategori: "Pembayaran & Keamanan",
    pertanyaan: "Mengapa dilarang bertransaksi di luar aplikasi?",
    jawaban: "Transaksi di luar sistem JalaLink tidak terjamin oleh standar keamanan cold chain platform. Kerugian akibat ketidaksesuaian barang atau kegagalan pengiriman di luar sistem tidak menjadi tanggung jawab JalaLink."
  },
  {
    id: 7,
    kategori: "Kualitas & Garansi",
    pertanyaan: "Bagaimana jika ikan yang saya terima tidak segar?",
    jawaban: "Jika ikan diterima dalam kondisi rusak atau tidak segar, Anda dapat menggunakan tombol 'Laporkan' pada halaman pesanan atau menghubungi Admin dengan menyertakan bukti foto/video pembukaan paket."
  }
];

// Tarif rute (dipakai admin JalaLink & admin transport)
export type Tarif = { 
  id: number; 
  rute: string; 
  aktif: number; 
  tarifNormalMin: number; 
  tarifNormalMax: number; 
  usulan?: number; 
  pengaju?: string; 
  statusUsulan?: "Menunggu" | "Disetujui" | "Ditolak" | "Banding";
  alasanPenolakan?: string;
  alasanBanding?: string;
  adminVerif?: string;
};
export const TARIF0: Tarif[] = [
  { id: 1, rute: "Cilacap → Bandung", aktif: 8000, tarifNormalMin: 7500, tarifNormalMax: 9000 }, 
  { id: 2, rute: "Pangandaran → Bandung", aktif: 8000, tarifNormalMin: 7500, tarifNormalMax: 9500, usulan: 12000, pengaju: "CV Bahari Cold Chain", statusUsulan: "Menunggu" },
  { id: 3, rute: "Indramayu → Jakarta", aktif: 10000, tarifNormalMin: 9500, tarifNormalMax: 11000, usulan: 6000, pengaju: "PT Cold Logistic", statusUsulan: "Menunggu" },
  { id: 4, rute: "Pelabuhan Ratu → Bogor", aktif: 8500, tarifNormalMin: 8000, tarifNormalMax: 9500, usulan: 9000, pengaju: "CV Express Bahari", statusUsulan: "Banding", alasanPenolakan: "Tarif dinilai terlalu tinggi tanpa justifikasi armada.", alasanBanding: "Ada kenaikan tol operasional baru sebesar 15%." },
];

// Data nelayan (verifikasi super admin)
export type Nel = { id: number; nama: string; daerah: string; titik: string; dok: string; selfie?: string; rek?: string; geotag?: string; status: "Menunggu" | "Aktif" | "Ditolak" | "Dinonaktifkan" | "Banding"; listing: number; keterangan?: string; adminVerif?: string };
export const NEL0: Nel[] = [
  { id: 1, nama: "Pak Rizal", daerah: "Pangandaran", titik: "TPI Pangandaran", dok: "Foto TPI Pangandaran + Surat Pengepul", selfie: "Selfie dengan KTP valid", rek: "Nama Rek. BRI Sesuai KTP", geotag: "Lokasi GPS Sesuai TPI", status: "Menunggu", listing: 0 },
  { id: 2, nama: "Bu Wati", daerah: "Indramayu", titik: "TPI Indramayu", dok: "KTP + Surat Pengepul (Revisi)", selfie: "Selfie KTP agak blur", rek: "Nama Rek. BCA BEDA dengan KTP", geotag: "Lokasi GPS 15km dari TPI", status: "Banding", listing: 0, keterangan: "KTP sebelumnya blur dan tidak terbaca jelas.", adminVerif: "Admin Utama (ADM-01)" },
  { id: 3, nama: "Pak Wayan", daerah: "Cilacap", titik: "TPI Cilacap", dok: "Lengkap (Terverifikasi 2024)", selfie: "Selfie dengan KTP valid", rek: "Nama Rek. Mandiri Sesuai KTP", geotag: "Lokasi GPS Sesuai TPI", status: "Aktif", listing: 4, adminVerif: "Admin Utama (ADM-01)" },
];