"use client";

import { useState } from "react";
import { MapPin, Package, MessageCircle, CheckCircle, Check, ChevronDown, LogOut, User, Search, Info, AlertTriangle, X, Navigation, Calendar, Star, Bike, History, ArrowRight } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";

interface MapPickerProps {
  lat: number;
  lng: number;
  onChange: (
    lat: number,
    lng: number,
    addressDetails?: { road?: string; city?: string; district?: string }
  ) => void;
}

const MapPicker = dynamic<MapPickerProps>(
  () => import("@/components/MapPicker"),
  { 
    ssr: false,
    loading: () => (
      <div className="grid h-72 w-full place-items-center rounded-2xl bg-slate-100 text-xs font-semibold text-slate-500">
        Memuat peta OpenStreetMap...
      </div>
    )
  }
);

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image alt="JalaLink Logo" className="object-contain" height={36} src="/logo.png" width={110} priority />
    </div>
  );
}

type StatusPaket = "Di Gudang" | "Sedang Diantar" | "Selesai";

type Paket = {
  id: string;
  pembeli: string;
  isi: string;
  areaAmbil: string;
  areaAntar: string;
  alamatLengkap: string;
  patokan: string;
  jarak: string;
  status: StatusPaket;
  noHp: string;
  lat: number;
  lng: number;
  masalah?: string;
};

const DATA_AWAL: Paket[] = [
  { 
    id: "JL-1001-A", 
    pembeli: "Ibu Ani", 
    isi: "2 kg Kakap Merah", 
    areaAmbil: "Hub Jatinangor",
    areaAntar: "Sukamiskin, Arcamanik",
    alamatLengkap: "Jl. Melati No 12, Kel. Sukamiskin, Kec. Arcamanik, Kota Bandung", 
    patokan: "Gang Gapura Merah, pagar hitam cat tembok hijau",
    jarak: "2.5 km", 
    status: "Di Gudang", 
    noHp: "08123456789", 
    lat: -6.9147, 
    lng: 107.6841 
  },
  { 
    id: "JL-1002-B", 
    pembeli: "Bapak Budi", 
    isi: "1 kg Cumi-cumi", 
    areaAmbil: "Hub Jatinangor",
    areaAntar: "Batununggal, Bandung Kidul",
    alamatLengkap: "Perumahan Indah Blok C4 No 10, Jl. Soekarno Hatta No 72, Kota Bandung", 
    patokan: "Depan taman komplek, mobil putih parkir di garasi",
    jarak: "4.1 km", 
    status: "Di Gudang", 
    noHp: "08987654321", 
    lat: -6.9532, 
    lng: 107.6298 
  },
  { 
    id: "JL-1004-A", 
    pembeli: "Warung Nasi Padang", 
    isi: "5 kg Tongkol Segar", 
    areaAmbil: "Hub Jatinangor",
    areaAntar: "Braga, Sumur Bandung",
    alamatLengkap: "Jl. Asia Afrika No 99, Kel. Braga, Kec. Sumur Bandung", 
    patokan: "Sebelah Bank BJB, spanduk Rumah Makan Padang",
    jarak: "1.2 km", 
    status: "Sedang Diantar", 
    noHp: "08111222333", 
    lat: -6.9211, 
    lng: 107.6110 
  },
  { 
    id: "JL-1005-C", 
    pembeli: "Restoran Seafood 88", 
    isi: "10 kg Udang Windu", 
    areaAmbil: "Hub Jatinangor",
    areaAntar: "Braga, Sumur Bandung",
    alamatLengkap: "Jl. Braga No 15, Kel. Braga, Kec. Sumur Bandung", 
    patokan: "Ruko cat putih 3 lantai, samping toko kue",
    jarak: "3.8 km", 
    status: "Selesai", 
    noHp: "08555666777", 
    lat: -6.9175, 
    lng: 107.6092 
  },
];

const RIWAYAT_DATA = [
  { tanggal: "Kemarin, 6 November", area: "Bandung Tengah", selesai: 18, rating: 5.0 },
  { tanggal: "Rabu, 5 November", area: "Bandung Timur", selesai: 22, rating: 4.8 },
  { tanggal: "Selasa, 4 November", area: "Bandung Selatan", selesai: 15, rating: 5.0 },
  { tanggal: "Senin, 3 November", area: "Bandung Barat", selesai: 20, rating: 4.9 },
];

const MASALAH_TEMPLATES = [
  "Pembeli tidak bisa dihubungi",
  "Alamat tidak ditemukan / salah pin",
  "Pembeli menolak menerima paket",
  "Paket rusak / bocor",
  "Lainnya"
];

export default function KurirDashboard() {
  const [mainTab, setMainTab] = useState<"beranda" | "riwayat">("beranda");
  
  const [paketList, setPaketList] = useState<Paket[]>(DATA_AWAL);
  const [tabAktif, setTabAktif] = useState<StatusPaket | "Semua">("Semua");
  const [search, setSearch] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ type: "ambil" | "selesai"; paketId: string } | null>(null);
  
  const [issueModal, setIssueModal] = useState<string | null>(null);
  const [showCustomIssue, setShowCustomIssue] = useState(false);
  const [customIssueText, setCustomIssueText] = useState("");

  const [mapModal, setMapModal] = useState<Paket | null>(null);
  const [infoAkunModal, setInfoAkunModal] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleKonfirmasi = () => {
    if (!dialog) return;
    if (dialog.type === "ambil") {
      setPaketList((prev) => prev.map((p) => (p.id === dialog.paketId ? { ...p, status: "Sedang Diantar" } : p)));
      showToast(`Paket ${dialog.paketId} berhasil diambil dari hub.`);
    } else if (dialog.type === "selesai") {
      setPaketList((prev) => prev.map((p) => (p.id === dialog.paketId ? { ...p, status: "Selesai", masalah: undefined } : p)));
      showToast(`Pesanan ${dialog.paketId} berhasil diselesaikan!`);
    }
    setDialog(null);
  };

  const handleLaporkanMasalah = (alasan: string) => {
    if (issueModal) {
      setPaketList((prev) => prev.map((p) => (p.id === issueModal ? { ...p, masalah: alasan } : p)));
      showToast(`Kendala pada paket ${issueModal} dilaporkan ke sistem.`);
      tutupModalLapor();
    }
  };

  const tutupModalLapor = () => {
    setIssueModal(null);
    setShowCustomIssue(false);
    setCustomIssueText("");
  };

  const batalLapor = (id: string) => {
    setPaketList((prev) => prev.map((p) => (p.id === id ? { ...p, masalah: undefined } : p)));
    showToast(`Laporan kendala dibatalkan.`);
  };

  const handleBukaWA = (nama: string, noHp: string) => {
    showToast(`Membuka WhatsApp untuk chat dengan ${nama}...`);
    const formatNoHp = noHp.startsWith("0") ? "62" + noHp.slice(1) : noHp;
    window.open(`https://wa.me/${formatNoHp}`, "_blank");
  };

  const filteredPaket = paketList.filter((p) => {
    const matchTab = tabAktif === "Semua" || p.status === tabAktif;
    const matchSearch = p.pembeli.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()) || p.areaAntar.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const totalSelesai = paketList.filter((p) => p.status === "Selesai").length;
  const totalAktif = paketList.filter((p) => p.status !== "Selesai").length;

  return (
    <div className="min-h-screen bg-slate-50 font-body text-ink relative">
      <header className="sticky top-0 z-40 border-b border-soft/40 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />
          
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">
              Kurir Last-Mile (Motor)
            </span>
            
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pr-3 transition hover:bg-slate-50 focus:ring-2 focus:ring-brand/20 outline-none"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white">
                  <User size={16} />
                </div>
                <span className="hidden text-sm font-bold text-ink sm:block">Agus Kurir</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {isProfileOpen && <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />}

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 animate-in fade-in slide-in-from-top-2 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl z-50">
                  <div className="px-3 py-2 border-b border-slate-100 mb-2">
                    <p className="text-sm font-bold text-ink">Agus Setiawan</p>
                    <p className="text-xs font-medium text-slate-500">ID: KRR-9921</p>
                  </div>
                  <button onClick={() => { setIsProfileOpen(false); setInfoAkunModal(true); }} className="flex w-full items-center gap-2 rounded-xl p-2.5 text-sm font-semibold text-slate-600 hover:bg-brand/5 hover:text-brand transition-colors">
                    <User size={16} /> Info Akun
                  </button>
                  <div className="my-1 h-px bg-slate-100" />
                  <button onClick={() => { setIsProfileOpen(false); showToast("Logout berhasil."); }} className="flex w-full items-center gap-2 rounded-xl p-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut size={16} /> Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6">
          <div className="mx-auto max-w-7xl flex gap-6">
            <button 
              onClick={() => setMainTab("beranda")}
              className={`py-4 font-bold text-sm border-b-2 transition-colors ${mainTab === "beranda" ? "border-brand text-brand" : "border-transparent text-slate-500 hover:text-ink"}`}
            >
              Beranda Tugas Pengantaran
            </button>
            <button 
              onClick={() => setMainTab("riwayat")}
              className={`py-4 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${mainTab === "riwayat" ? "border-brand text-brand" : "border-transparent text-slate-500 hover:text-ink"}`}
            >
              Riwayat Pengiriman
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 pb-20">
        {mainTab === "beranda" && (
          <div className="animate-in fade-in duration-300">
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-brand/10 text-brand rounded-xl"><Package size={24}/></div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Tugas Aktif</p>
                  <p className="font-heading text-xl font-bold text-ink">{totalAktif} Paket</p>
                </div>
              </div>
              <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-ink/5 text-ink rounded-xl"><CheckCircle size={24}/></div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Selesai Hari Ini</p>
                  <p className="font-heading text-xl font-bold text-ink">{totalSelesai} Paket</p>
                </div>
              </div>
              <div className="col-span-2 relative flex items-center">
                <Search className="absolute left-4 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Cari daerah, nama pembeli, atau resi..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-full min-h-[4rem] rounded-2xl border border-slate-200 bg-white pl-12 pr-4 font-sub text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                />
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
              {(["Semua", "Di Gudang", "Sedang Diantar", "Selesai"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTabAktif(tab)}
                  className={`rounded-full px-5 py-2 text-sm font-bold transition-all ${
                    tabAktif === tab 
                    ? "bg-brand text-white shadow-md" 
                    : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPaket.map((paket) => (
                <div key={paket.id} className={`flex flex-col justify-between rounded-3xl bg-white p-5 border shadow-sm transition-all ${paket.masalah ? "border-red-200 bg-red-50/30" : "border-slate-200 hover:border-brand/30"}`}>
                  <div>
                    <div className="mb-3 flex items-start justify-between">
                      <span className="text-xs font-bold text-ink bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                        {paket.id}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        paket.status === "Selesai" ? "bg-emerald-600 text-white" :
                        paket.status === "Sedang Diantar" ? "bg-brand text-white" :
                        "bg-amber-500 text-white"
                      }`}>
                        {paket.status}
                      </span>
                    </div>

                    {/* ROUTE INFORMASI AMBIL -> TUJUAN */}
                    <div className="rounded-2xl bg-slate-100/80 p-3 mb-4 space-y-1.5 border border-slate-200/60">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <span className="size-2 rounded-full bg-amber-500 shrink-0" />
                        <span>Ambil: <b className="text-ink">{paket.areaAmbil}</b></span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-brand pl-0.5">
                        <ArrowRight size={14} className="shrink-0" />
                        <span>Tujuan: <b className="text-brand">{paket.areaAntar}</b></span>
                      </div>
                    </div>
                    
                    <h3 className="font-heading text-lg font-bold text-ink mb-1">{paket.pembeli}</h3>
                    
                    {paket.masalah && (
                      <div className="mt-1 mb-2 inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-2.5 py-1.5 text-xs font-bold text-red-700">
                        <AlertTriangle size={14} /> Kendala: {paket.masalah}
                      </div>
                    )}

                    <div className="space-y-3 mt-3 text-xs font-semibold text-slate-600">
                      <div className="flex items-start gap-2">
                        <Package size={16} className="text-brand shrink-0 mt-0.5" />
                        <span className="text-sm font-bold text-ink">{paket.isi}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="leading-relaxed text-slate-800">{paket.alamatLengkap}</p>
                          <span className="text-[11px] font-bold text-brand block mt-1">Patokan: {paket.patokan}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    {paket.status === "Di Gudang" && (
                      <button 
                        onClick={() => setDialog({ type: "ambil", paketId: paket.id })}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-bold text-white transition-transform active:scale-95 hover:bg-brand/90"
                      >
                        <Package size={18} /> Ambil Paket dari Hub
                      </button>
                    )}

                    {paket.status === "Sedang Diantar" && (
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setMapModal(paket)}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-ink hover:bg-slate-50 transition-all"
                          >
                            <MapPin size={15} className="text-red-500" /> Cek Titik
                          </button>
                          
                          <button 
                            onClick={() => handleBukaWA(paket.pembeli, paket.noHp)}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-ink hover:bg-slate-50 transition-all"
                          >
                            <MessageCircle size={15} className="text-brand" /> Chat Buyer
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => setDialog({ type: "selesai", paketId: paket.id })}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-bold text-white transition-transform active:scale-95 hover:bg-black mt-1"
                        >
                          <Check size={16} /> Konfirmasi Terkirim
                        </button>

                        {paket.masalah ? (
                          <button 
                            onClick={() => batalLapor(paket.id)}
                            className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors mt-1"
                          >
                            <X size={14} /> Batal Lapor
                          </button>
                        ) : (
                          <button 
                            onClick={() => setIssueModal(paket.id)}
                            className="w-full flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold text-slate-500 hover:text-ink hover:bg-slate-100 transition-colors mt-1"
                          >
                            <AlertTriangle size={14} /> Laporkan Kendala
                          </button>
                        )}
                      </div>
                    )}

                    {paket.status === "Selesai" && (
                      <div className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 py-3 text-sm font-bold text-emerald-700">
                        <CheckCircle size={18} /> Sukses Diterima Pembeli
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {mainTab === "riwayat" && (
          <div className="animate-in fade-in duration-300 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
                <p className="text-sm font-semibold text-slate-500 mb-1">Total Selesai Bulan Ini</p>
                <h2 className="font-heading text-3xl font-bold text-ink flex items-center gap-2">
                  <Package size={28} className="text-brand" /> 142 Paket
                </h2>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
                <p className="text-sm font-semibold text-slate-500 mb-1">Rating Performa</p>
                <h2 className="font-heading text-3xl font-bold text-ink flex items-center gap-2">
                  <Star size={28} className="fill-brand text-brand" /> 4.9 <span className="text-sm font-medium text-slate-400">/ 5.0</span>
                </h2>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center gap-3">
                <History size={20} className="text-brand" />
                <h3 className="font-heading text-lg font-bold text-ink">Catatan Aktivitas Harian</h3>
              </div>
              
              <div className="divide-y divide-slate-100">
                {RIWAYAT_DATA.map((item, idx) => (
                  <div key={idx} className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-ink text-base">{item.tanggal}</h4>
                        <p className="text-sm font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={14} /> Area: {item.area}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className="bg-slate-900 text-white px-3 py-1.5 rounded-xl text-sm font-bold shadow-sm">
                        {item.selesai} Selesai
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Modal Detail Titik Lokasi Peta (Leaflet MapPicker) */}
      {mapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="font-heading text-lg font-bold text-ink flex items-center gap-2">
                  <MapPin size={20} className="text-red-500" />
                  Titik Lokasi Pembeli
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">{mapModal.pembeli} ({mapModal.id})</p>
              </div>
              <button onClick={() => setMapModal(null)} className="rounded-full p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="w-full relative overflow-hidden">
              <MapPicker 
                lat={mapModal.lat} 
                lng={mapModal.lng} 
                onChange={(newLat, newLng) => {
                  setPaketList((prev) => 
                    prev.map((p) => p.id === mapModal.id ? { ...p, lat: newLat, lng: newLng } : p)
                  );
                  setMapModal((prev) => prev ? { ...prev, lat: newLat, lng: newLng } : null);
                }} 
              />
              <span className="absolute bottom-2 left-2 rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-mono font-bold text-ink shadow-sm z-10 pointer-events-none">
                Pin GPS: {mapModal.lat.toFixed(4)}, {mapModal.lng.toFixed(4)}
              </span>
            </div>

            <div className="p-5 bg-white space-y-3">
              <div>
                <p className="text-xs font-bold text-slate-400">Alamat Lengkap:</p>
                <p className="text-sm font-semibold text-slate-800">{mapModal.alamatLengkap}</p>
              </div>
              <div className="rounded-xl bg-brand/10 p-3 text-xs font-bold text-brand">
                Patokan Rumah: {mapModal.patokan}
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setMapModal(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Tutup
                </button>
                <button 
                  onClick={() => {
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${mapModal.lat},${mapModal.lng}`, "_blank");
                  }}
                  className="flex-1 flex justify-center items-center gap-2 rounded-xl bg-brand py-3 text-sm font-bold text-white hover:bg-brand/90 transition shadow-sm"
                >
                  <Navigation size={16} /> Buka Google Maps
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Lapor Kendala */}
      {issueModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-heading text-xl font-bold text-ink">Laporkan Kendala</h3>
              <button onClick={tutupModalLapor} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"><X size={20} /></button>
            </div>
            
            {!showCustomIssue ? (
              <>
                <p className="mb-4 text-sm font-semibold text-slate-600">Pilih masalah untuk <span className="text-brand font-bold">{issueModal}</span>:</p>
                <div className="space-y-2.5">
                  {MASALAH_TEMPLATES.map((alasan) => (
                    <button 
                      key={alasan} 
                      onClick={() => { alasan === "Lainnya" ? setShowCustomIssue(true) : handleLaporkanMasalah(alasan); }} 
                      className="w-full rounded-2xl border border-slate-200 p-3.5 text-left font-sub text-sm font-bold text-ink hover:border-brand hover:text-brand hover:bg-brand/5 focus:ring-2 focus:ring-brand/20 transition-all"
                    >
                      {alasan}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-slate-600">Detail kendala pengantaran <span className="text-brand font-bold">{issueModal}</span>:</p>
                <textarea 
                  autoFocus 
                  className="w-full resize-none rounded-2xl border border-slate-200 p-4 font-sub text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all" 
                  rows={4} 
                  placeholder="Contoh: Pembeli minta diantar sore..." 
                  value={customIssueText} 
                  onChange={(e) => setCustomIssueText(e.target.value)} 
                />
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowCustomIssue(false)} className="h-12 flex-1 rounded-xl border border-slate-200 bg-white font-bold text-slate-600 hover:bg-slate-50 transition-colors">Kembali</button>
                  <button disabled={!customIssueText.trim()} onClick={() => handleLaporkanMasalah(customIssueText.trim())} className="h-12 flex-1 rounded-xl bg-brand font-bold text-white disabled:bg-slate-300 transition-colors">Kirim</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Dialog Konfirmasi */}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-bold text-ink">
                {dialog.type === "ambil" && "Ambil Paket Hub"}
                {dialog.type === "selesai" && "Konfirmasi Pesanan Selesai"}
              </h3>
              <button onClick={() => setDialog(null)} className="rounded-full p-1 hover:bg-slate-100 text-slate-500 transition"><X size={20} /></button>
            </div>
            
            <p className="text-sm font-medium text-slate-600 mb-6">
              {dialog.type === "ambil" && `Apakah Anda telah mengambil fisik paket ${dialog.paketId} dari Hub Jatinangor?`}
              {dialog.type === "selesai" && `Apakah paket ${dialog.paketId} telah diserahkan langsung ke tangan pembeli?`}
            </p>

            <div className="flex gap-3">
              <button onClick={() => setDialog(null)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">Batal</button>
              <button onClick={handleKonfirmasi} className={`flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition-transform active:scale-95 ${dialog.type === "ambil" ? "bg-brand hover:bg-brand/90" : "bg-slate-900 hover:bg-black"}`}>
                Ya, Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-xl animate-in slide-in-from-bottom-5 fade-in duration-300">
          <Info size={18} className="text-brand" />
          {toastMsg}
        </div>
      )}
    </div>
  );
}