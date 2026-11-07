"use client";

import { useState } from "react";
import { Truck, MapPin, AlertTriangle, PackageCheck, ArrowRight, Search, X, Filter, Warehouse, Box, User, ChevronDown, LogOut, Info, CheckCircle2 } from "lucide-react";
import Image from "next/image";

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image alt="JalaLink Logo" className="object-contain" height={36} src="/logo.png" width={110} priority />
    </div>
  );
}

function Button({ children, className = "", ...props }: any) {
  return (
    <button className={`inline-flex items-center justify-center rounded-xl font-sub font-semibold transition active:scale-95 disabled:pointer-events-none ${className}`} {...props}>
      {children}
    </button>
  );
}

function Badge({ children, className = "", ...props }: any) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-semibold ${className}`} {...props}>
      {children}
    </span>
  );
}

const KAP = 3000;

type Status = "Menunggu Penjemputan" | "Di Truk" | "Tiba di Gudang";
type Ord = { idBox: string; idBuyer: string; kg: number; titik: string; status: Status; masalah?: string };

const RUTE = { 
  nama: "Logistik Pesisir → Hub Gudang Bandung", 
  hari: "Kamis, 5 November", 
  kendaraan: "Truk Pendingin Besar - B 9999 XX", 
  titik: [{ nama: "TPI Cilacap", jam: "06.00" }, { nama: "TPI Pangandaran", jam: "08.30" }, { nama: "TPI Pelabuhan Ratu", jam: "11.00" }] 
};

const RAW_DATA: Ord[] = [
  { idBox: "BOX-CIL-001", idBuyer: "BUYER-88A", kg: 150, titik: "TPI Cilacap", status: "Menunggu Penjemputan" },
  { idBox: "BOX-CIL-002", idBuyer: "BUYER-12C", kg: 200, titik: "TPI Cilacap", status: "Menunggu Penjemputan" },
  { idBox: "BOX-PAN-001", idBuyer: "BUYER-45B", kg: 180, titik: "TPI Pangandaran", status: "Menunggu Penjemputan" },
  { idBox: "BOX-PAN-002", idBuyer: "BUYER-88A", kg: 130, titik: "TPI Pangandaran", status: "Menunggu Penjemputan", masalah: "Box segel terbuka di TPI" },
  { idBox: "BOX-RATU-01", idBuyer: "BUYER-99X", kg: 300, titik: "TPI Pelabuhan Ratu", status: "Menunggu Penjemputan" },
  { idBox: "BOX-CIL-003", idBuyer: "BUYER-99X", kg: 250, titik: "TPI Cilacap", status: "Di Truk" },
  { idBox: "BOX-PAN-003", idBuyer: "BUYER-77K", kg: 140, titik: "TPI Pangandaran", status: "Di Truk" },
  { idBox: "BOX-CIL-000", idBuyer: "BUYER-10A", kg: 100, titik: "TPI Cilacap", status: "Tiba di Gudang" },
  { idBox: "BOX-PAN-000", idBuyer: "BUYER-22B", kg: 120, titik: "TPI Pangandaran", status: "Tiba di Gudang" },
];

const MASALAH_TEMPLATES = [
  "Box rusak / segel terbuka",
  "Timbangan tidak sesuai muatan",
  "Box tertinggal / tidak ada di TPI",
  "Lainnya"
];

export default function SupirAntarKota() {
  const [orders, setOrders] = useState<Ord[]>(RAW_DATA);
  const [tab, setTab] = useState<"jemput" | "gudang" | "selesai">("jemput");
  const [search, setSearch] = useState("");
  const [filterTPI, setFilterTPI] = useState("Semua");
  
  const [issueModal, setIssueModal] = useState<string | null>(null);
  const [showCustomIssue, setShowCustomIssue] = useState(false);
  const [customIssueText, setCustomIssueText] = useState("");

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [dialogConfirm, setDialogConfirm] = useState<{
    type: "muat_semua" | "bongkar_box";
    titikNama?: string;
    idBox?: string;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const upd = (where: (o: Ord) => boolean, f: (o: Ord) => Ord) => setOrders((os) => os.map((o) => (where(o) ? f(o) : o)));

  const handleKonfirmasiAksi = () => {
    if (!dialogConfirm) return;

    if (dialogConfirm.type === "muat_semua" && dialogConfirm.titikNama) {
      upd((o) => o.titik === dialogConfirm.titikNama && o.status === "Menunggu Penjemputan", (o) => ({ ...o, status: "Di Truk" }));
      showToast(`Berhasil memuat semua box dari ${dialogConfirm.titikNama} ke truk.`);
    } else if (dialogConfirm.type === "bongkar_box" && dialogConfirm.idBox) {
      upd((x) => x.idBox === dialogConfirm.idBox, (x) => ({ ...x, status: "Tiba di Gudang" }));
      showToast(`Box ${dialogConfirm.idBox} masuk ke tab Selesai.`);
    }

    setDialogConfirm(null);
  };

  const kg = orders.filter(o => o.status !== "Menunggu Penjemputan").reduce((a, o) => a + o.kg, 0);
  const dijemput = orders.filter((o) => o.status === "Di Truk").length;
  const tiba = orders.filter((o) => o.status === "Tiba di Gudang").length;
  const sisaJemput = orders.filter((o) => o.status === "Menunggu Penjemputan").length;
  
  const stat = [
    { l: "Muatan di Truk", v: `${kg} / ${KAP} kg`, Icon: Truck },
    { l: "Perlu Dijemput", v: `${sisaJemput} Box`, Icon: PackageCheck },
    { l: "Dalam Perjalanan", v: `${dijemput} Box`, Icon: Warehouse },
    { l: "Selesai di Gudang", v: `${tiba} Box`, Icon: CheckCircle2 },
  ];

  const btn = "h-11 sm:h-12 w-full bg-brand font-sub text-sm sm:text-base font-semibold text-white hover:bg-brand/90 disabled:bg-slate-200 disabled:text-slate-400";

  const handleLaporkanMasalah = (alasan: string) => {
    if (issueModal) {
      upd((x) => x.idBox === issueModal, (x) => ({ ...x, masalah: alasan }));
      setIssueModal(null);
      setShowCustomIssue(false);
      setCustomIssueText("");
      showToast(`Kendala berhasil dilaporkan.`);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchSearch = o.idBox.toLowerCase().includes(search.toLowerCase()) || o.idBuyer.toLowerCase().includes(search.toLowerCase());
    const matchTPI = filterTPI === "Semua" || o.titik === filterTPI;
    return matchSearch && matchTPI;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-body text-ink relative">
      <header className="sticky top-0 z-30 border-b border-soft/40 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Logo/>
          
          <div className="flex items-center gap-4">
            <Badge className="bg-brand/10 font-sub text-xs text-brand hidden sm:inline-flex">Logistik TPI</Badge>

            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pr-3 transition hover:bg-slate-50 focus:ring-2 focus:ring-brand/20 outline-none"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white">
                  <User size={16} />
                </div>
                <span className="hidden text-sm font-bold text-ink sm:block">Budi Santoso</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {isProfileOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
              )}

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 animate-in fade-in slide-in-from-top-2 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl z-50">
                  <div className="px-3 py-2 border-b border-slate-100 mb-2">
                    <p className="text-sm font-bold text-ink">Budi Santoso</p>
                    <p className="text-xs font-medium text-slate-500">ID: SPR-4412</p>
                  </div>
                  <button onClick={() => { setIsProfileOpen(false); showToast("Membuka Info Akun..."); }} className="flex w-full items-center gap-2 rounded-xl p-2.5 text-sm font-semibold text-slate-600 hover:bg-brand/5 hover:text-brand transition-colors">
                    <User size={16} /> Info Akun
                  </button>
                  <div className="my-1 h-px bg-slate-100" />
                  <button onClick={() => { setIsProfileOpen(false); showToast("Logout berhasil. Mengalihkan..."); }} className="flex w-full items-center gap-2 rounded-xl p-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut size={16} /> Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 sm:space-y-5 px-3 sm:px-4 py-4 sm:py-5 pb-20">
        {/* Banner Rute Responsif */}
        <section className="rounded-2xl sm:rounded-3xl bg-white shadow-sm border border-slate-200 p-4 sm:p-5">
          <p className="font-sub text-xs sm:text-sm font-semibold text-brand">{RUTE.hari} · {RUTE.kendaraan}</p>
          <h1 className="font-heading text-lg sm:text-2xl md:text-3xl font-bold text-ink mt-0.5 sm:mt-1">{RUTE.nama}</h1>
          <div className="mt-2.5 sm:mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2 font-sub text-[11px] sm:text-sm font-semibold text-ink">
            {RUTE.titik.map((t) => (
              <span key={t.nama} className="flex items-center gap-1 sm:gap-2">
                <span className="flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs">
                  <MapPin className="text-brand shrink-0" size={12}/>{t.nama}
                </span>
                <ArrowRight className="text-slate-400 shrink-0" size={12}/>
              </span>
            ))}
            <span className="flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 sm:px-3 sm:py-1.5 text-white text-[10px] sm:text-xs">
              <Warehouse size={12}/> Hub Bandung
            </span>
          </div>
        </section>

        {/* Statistik Responsif */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4">
          {stat.map(({ l, v, Icon }) => (
            <div key={l} className="rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-sm p-3 sm:p-4">
              <Icon className="mb-1 sm:mb-2 text-brand" size={18}/>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500">{l}</p>
              <p className="font-heading text-sm sm:text-lg md:text-xl font-bold text-ink">{v}</p>
            </div>
          ))}
        </div>
        
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full bg-brand transition-all" style={{ width: `${Math.min(100, (kg / KAP) * 100)}%` }} />
        </div>

        {/* Controls & Filter Section */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <button onClick={() => setTab("jemput")} className={`rounded-full border px-3 py-1.5 sm:px-4 sm:py-2 font-sub text-xs sm:text-sm font-bold transition-all ${tab === "jemput" ? "border-brand bg-brand text-white shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}>
              Penjemputan ({orders.filter(o => o.status === "Menunggu Penjemputan").length})
            </button>
            <button onClick={() => setTab("gudang")} className={`rounded-full border px-3 py-1.5 sm:px-4 sm:py-2 font-sub text-xs sm:text-sm font-bold transition-all ${tab === "gudang" ? "border-brand bg-brand text-white shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}>
              Bongkar ({orders.filter(o => o.status === "Di Truk").length})
            </button>
            <button onClick={() => setTab("selesai")} className={`rounded-full border px-3 py-1.5 sm:px-4 sm:py-2 font-sub text-xs sm:text-sm font-bold transition-all ${tab === "selesai" ? "border-brand bg-brand text-white shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}>
              Selesai ({orders.filter(o => o.status === "Tiba di Gudang").length})
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-44">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
              <input type="text" placeholder="Cari ID / Buyer..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-full border border-slate-200 bg-white py-1.5 pl-8 pr-3 font-sub text-xs outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all" />
            </div>
            {tab === "jemput" && (
              <div className="relative">
                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12}/>
                <select value={filterTPI} onChange={(e) => setFilterTPI(e.target.value)} className="w-full appearance-none rounded-full border border-slate-200 bg-white py-1.5 pl-7 pr-6 font-sub text-xs outline-none focus:border-brand transition-all font-semibold">
                  <option value="Semua">Semua TPI</option>
                  {RUTE.titik.map(t => <option key={t.nama} value={t.nama}>{t.nama}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* TAB 1: PENJEMPUTAN */}
        {tab === "jemput" && (
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            {RUTE.titik.map((t) => {
              if (filterTPI !== "Semua" && filterTPI !== t.nama) return null;
              
              const list = filteredOrders.filter((o) => o.titik === t.nama && o.status === "Menunggu Penjemputan");
              if (list.length === 0) return null;

              return (
                <section key={t.nama} className="space-y-3 rounded-2xl sm:rounded-3xl bg-white shadow-sm border border-slate-200 p-4 sm:p-5">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-2.5 mb-3">
                    <div>
                      <h2 className="flex items-center gap-1.5 font-heading text-base sm:text-lg font-bold text-ink"><MapPin className="text-brand" size={16}/>{t.nama}</h2>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">Jadwal: {t.jam} · {list.length} Box · {list.reduce((a, o) => a + o.kg, 0)} kg</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2.5">
                    {list.map((o) => (
                      <div key={o.idBox} className={`flex items-center justify-between gap-2.5 rounded-xl sm:rounded-2xl border p-3 transition-all ${o.masalah ? "border-red-200 bg-red-50/50" : "border-slate-200 hover:border-brand/30 hover:bg-slate-50"}`}>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] sm:text-xs font-bold text-ink bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200"><Box className="inline mr-1" size={10}/>{o.idBox}</span>
                          </div>
                          <p className="font-sub text-base sm:text-lg font-bold text-brand">{o.kg} kg</p>
                          <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Tujuan: {o.idBuyer}</p>
                          {o.masalah && <p className="mt-1 text-[10px] sm:text-xs font-bold text-red-600 flex items-center gap-1"><AlertTriangle size={11}/> {o.masalah}</p>}
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          {o.masalah ? (
                            <button onClick={() => upd((x) => x.idBox === o.idBox, (x) => ({ ...x, masalah: undefined }))} className="rounded-lg border border-red-200 bg-white px-2.5 py-1.5 font-sub text-[11px] font-bold text-red-600 hover:bg-red-50 transition-colors">Batal Lapor</button>
                          ) : (
                            <button onClick={() => setIssueModal(o.idBox)} className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-sub text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition-colors"><AlertTriangle size={12}/> Lapor</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-1.5">
                    <Button 
                      onClick={() => setDialogConfirm({ type: "muat_semua", titikNama: t.nama })} 
                      className={btn}
                    >
                      Muat Semua Box ke Truk
                    </Button>
                  </div>
                </section>
              );
            })}
            
            {filteredOrders.filter((o) => o.status === "Menunggu Penjemputan").length === 0 && (
              <div className="col-span-full py-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs sm:text-sm font-semibold">
                Semua muatan TPI telah berhasil diambil & dimuat ke truk.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BONGKAR */}
        {tab === "gudang" && (
          <div className="grid gap-2.5 sm:gap-3 md:grid-cols-3">
            {filteredOrders.filter((o) => o.status === "Di Truk").map((o) => (
              <div key={o.idBox} className="space-y-2.5 rounded-2xl sm:rounded-3xl bg-white shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-1.5 mb-1.5">
                    <span className="text-[10px] sm:text-xs font-bold text-ink bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{o.idBox}</span>
                    <Badge className="font-sub shadow-sm text-[10px] sm:text-xs whitespace-nowrap bg-brand text-white">
                      Di Truk
                    </Badge>
                  </div>
                  <h3 className="font-sub text-xl sm:text-2xl font-bold text-brand">{o.kg} kg</h3>
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">ID Buyer: {o.idBuyer}</p>
                  <p className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 mt-1.5"><MapPin size={11}/> Asal: {o.titik}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 mt-1">
                  <Button 
                    onClick={() => setDialogConfirm({ type: "bongkar_box", idBox: o.idBox })} 
                    className={btn}
                  >
                    Bongkar Muatan
                  </Button>
                </div>
              </div>
            ))}

            {filteredOrders.filter((o) => o.status === "Di Truk").length === 0 && (
              <div className="col-span-full py-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs sm:text-sm font-semibold">
                Tidak ada box aktif di dalam truk yang perlu dibongkar.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SELESAI */}
        {tab === "selesai" && (
          <div className="grid gap-2.5 sm:gap-3 md:grid-cols-3">
            {filteredOrders.filter((o) => o.status === "Tiba di Gudang").map((o) => (
              <div key={o.idBox} className="space-y-2.5 rounded-2xl sm:rounded-3xl bg-brand/5 shadow-sm border border-brand/20 p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-1.5 mb-1.5">
                    <span className="text-[10px] sm:text-xs font-bold text-ink bg-white px-2 py-0.5 rounded border border-brand/20">{o.idBox}</span>
                    <Badge className="font-sub shadow-sm text-[10px] sm:text-xs whitespace-nowrap bg-brand text-white">
                      Selesai
                    </Badge>
                  </div>
                  <h3 className="font-sub text-xl sm:text-2xl font-bold text-brand">{o.kg} kg</h3>
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">ID Buyer: {o.idBuyer}</p>
                  <p className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 mt-1.5"><MapPin size={11}/> Asal: {o.titik}</p>
                </div>
                <div className="pt-2 border-t border-brand/10 mt-1">
                  <div className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-white border border-brand/30 py-2.5 text-xs sm:text-sm font-bold text-brand">
                    <CheckCircle2 size={15} /> Berhasil Masuk Gudang
                  </div>
                </div>
              </div>
            ))}

            {filteredOrders.filter((o) => o.status === "Tiba di Gudang").length === 0 && (
              <div className="col-span-full py-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs sm:text-sm font-semibold">
                Belum ada box yang diselesaikan / dibongkar ke gudang.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal Konfirmasi Tindakan */}
      {dialogConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-bold text-ink">
                {dialogConfirm.type === "muat_semua" ? "Konfirmasi Memuat Box" : "Konfirmasi Bongkar Muatan"}
              </h3>
              <button onClick={() => setDialogConfirm(null)} className="rounded-full p-1 hover:bg-slate-100 text-slate-500 transition"><X size={20} /></button>
            </div>
            
            <p className="text-sm font-medium text-slate-600 mb-6">
              {dialogConfirm.type === "muat_semua" 
                ? `Apakah Anda yakin ingin memuat seluruh box dari ${dialogConfirm.titikNama} ke dalam truk?`
                : `Apakah Anda yakin ingin membongkar box ${dialogConfirm.idBox} dan menyerahkannya ke gudang?`}
            </p>

            <div className="flex gap-3">
              <button onClick={() => setDialogConfirm(null)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
                Batal
              </button>
              <button onClick={handleKonfirmasiAksi} className="flex-1 rounded-xl bg-brand py-2.5 text-sm font-bold text-white transition-transform active:scale-95 hover:bg-brand/90">
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Laporan Kendala */}
      {issueModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 backdrop-blur-sm p-4 sm:items-center animate-in fade-in duration-200">
          <div className="w-full max-w-md animate-in slide-in-from-bottom-10 rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-heading text-xl font-bold text-ink">Lapor Kendala Box</h3>
              <button onClick={() => { setIssueModal(null); setShowCustomIssue(false); }} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 transition"><X size={20}/></button>
            </div>
            
            {!showCustomIssue ? (
              <>
                <p className="mb-4 text-sm font-semibold text-slate-600">Pilih masalah pada <span className="text-brand font-bold">{issueModal}</span>:</p>
                <div className="space-y-2.5">
                  {MASALAH_TEMPLATES.map((alasan) => (
                    <button key={alasan} onClick={() => { alasan === "Lainnya" ? setShowCustomIssue(true) : handleLaporkanMasalah(alasan); }} className="w-full rounded-2xl border border-slate-200 p-3.5 text-left font-sub text-sm font-bold text-ink hover:border-brand hover:text-brand hover:bg-brand/5 transition-all">
                      {alasan}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-slate-600">Detail masalah untuk <span className="text-brand font-bold">{issueModal}</span>:</p>
                <textarea autoFocus className="w-full resize-none rounded-2xl border border-slate-200 p-4 font-sub text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all" rows={4} placeholder="Contoh: Box remuk tertimpa..." value={customIssueText} onChange={(e) => setCustomIssueText(e.target.value)} />
                <div className="flex gap-3 pt-2">
                  <Button onClick={() => setShowCustomIssue(false)} className="h-12 flex-1 border border-slate-200 bg-white text-ink hover:bg-slate-50 transition-colors">Kembali</Button>
                  <Button disabled={!customIssueText.trim()} onClick={() => handleLaporkanMasalah(customIssueText.trim())} className="h-12 flex-1 bg-brand text-white disabled:bg-slate-300 transition-colors">Kirim Laporan</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notifikasi */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-bold text-white shadow-xl animate-in slide-in-from-bottom-5 fade-in duration-300">
          <Info size={18} className="text-brand" />
          {toastMsg}
        </div>
      )}
    </div>
  );
}