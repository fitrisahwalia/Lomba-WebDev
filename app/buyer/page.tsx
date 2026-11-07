"use client";

import React, { useEffect, useMemo, useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Home, ClipboardList, MessageCircle, User, ShoppingCart, ChevronLeft, Star, BadgeCheck, Minus, Plus, Trash2, X, PackageCheck, Send, Flag, LogOut, LifeBuoy, Snowflake, Camera, CheckSquare, Square, Store, ShieldAlert, ChevronDown, HelpCircle, LocateFixed, Ticket, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
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
      <div className="grid h-48 w-full place-items-center rounded-2xl bg-surface text-xs text-ink/60">
        Memuat peta OpenStreetMap...
      </div>
    )
  }
);

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image 
        src="/logo.png" 
        alt="JalaLink Logo" 
        width={110} 
        height={36} 
        className="object-contain"
        priority
      />
    </div>
  );
}

function Button({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return (
    <button className={`inline-flex items-center justify-center font-sub font-semibold transition active:scale-95 disabled:pointer-events-none ${className}`} {...props}>
      {children}
    </button>
  );
}

function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { className?: string }) {
  return (
    <input className={`w-full outline-none transition ${className}`} {...props} />
  );
}

function Badge({ children, className = "", ...props }: React.HTMLAttributes<HTMLSpanElement> & { className?: string; variant?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`} {...props}>
      {children}
    </span>
  );
}

function CustomSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label || value;

  return (
    <div className="relative min-w-[140px] flex-1 md:flex-none">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center justify-between rounded-xl border border-soft/80 bg-white px-3 font-sub text-sm font-medium text-ink shadow-sm transition hover:bg-surface"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronLeft size={16} className={`shrink-0 text-soft transition-transform duration-200 ${open ? "rotate-90" : "-rotate-90"}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <ul className="absolute left-0 top-12 z-30 max-h-56 w-full overflow-y-auto rounded-2xl border border-soft/40 bg-white p-1.5 shadow-lg">
            {options.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`w-full rounded-xl px-3 py-2 text-left font-sub text-sm transition ${
                    value === o.value ? "bg-brand/10 font-bold text-brand" : "text-ink hover:bg-surface"
                  }`}
                >
                  {o.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

const rp = (n: number) => "Rp" + n.toLocaleString("id-ID");

const calculateTotalOngkir = (ongkirFlatPerKg: number, totalQtyInRoute: number) => {
  if (totalQtyInRoute <= 0) return 0;
  if (totalQtyInRoute <= 1) return ongkirFlatPerKg;
  const baseRate = ongkirFlatPerKg;
  const incrementalRate = ongkirFlatPerKg * 0.75; 
  return Math.round(baseRate + (totalQtyInRoute - 1) * incrementalRate);
};

type ReviewItem = {
  id: number;
  user: string;
  rating: number;
  date: string;
  comment: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
};

type Listing = { 
  id: number; 
  nama: string; 
  nelayan: string; 
  daerah: string; 
  harga: number; 
  stok: number; 
  min: number; 
  ongkirFlat: number; 
  jamTibaHub: string; 
  jamAntarRumah: string; 
  jam: string; 
  rating: number;
  ulasanCount: number;
  alias: string[]; 
  desc: string;
  reviews: ReviewItem[];
};

type CartItem = {
  id: number;
  qty: number;
  checked: boolean;
};

type UserProfile = {
  nama: string;
  email: string;
  phone: string;
  jalanNo: string;
  rt: string;
  rw: string;
  kotaKecamatan: string;
  patokan: string;
  lat: number;
  lng: number;
  photoUrl?: string;
};

type FAQItem = {
  id: number;
  kategori: string;
  pertanyaan: string;
  jawaban: string;
};

type HelpTicket = {
  id: string;
  topik: string;
  subjek: string;
  status: "Sedang Diproses" | "Selesai";
  tanggal: string;
  messages: Msg[];
};

const FAQ_LIST: FAQItem[] = [
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

const SPECIFIC_REVIEWS: Record<number, ReviewItem[]> = {
  1: [
    { id: 101, user: "Budi S.", rating: 5, date: "Kemarin", comment: "Kakap merah Pak Wayan tebal dan manis, dibakar bumbu kecap mantap!", mediaUrl: "/logo.png", mediaType: "image" },
    { id: 102, user: "Siti A.", rating: 4, date: "3 hari lalu", comment: "Segar pas nyampe Jatinangor, esnya masih utuh." }
  ],
  2: [
    { id: 201, user: "Rina M.", rating: 5, date: "2 hari lalu", comment: "Tongkol Pak Darmo juara, gak amis sama sekali dibuat balado." },
    { id: 202, user: "Eko P.", rating: 4, date: "5 hari lalu", comment: "Ukuran sesuai, pengiriman subuh tepat waktu." }
  ]
};

const RAW: [string, string, string, number, number, number, number, string, string, string, number, number, string[]][] = [
  ["Kakap Merah", "Pak Wayan", "Cilacap", 65000, 100, 2, 8000, "Besok 06.00 WIB", "07.00 - 10.00 WIB", "05.30 WIB", 4.8, 24, ["kakap"]],
  ["Tongkol Segar", "Pak Darmo", "Pangandaran", 32000, 120, 2, 8000, "Besok 05.30 WIB", "07.00 - 10.00 WIB", "05.10 WIB", 4.7, 40, ["tongkol"]],
  ["Cakalang", "Pak Hasan", "Sukabumi", 36000, 90, 2, 9000, "Besok 06.30 WIB", "07.30 - 10.30 WIB", "05.20 WIB", 4.6, 18, ["tongkol kecil", "skipjack"]],
  ["Tuna Sirip Kuning", "Pak Darmo", "Pangandaran", 78000, 60, 3, 8000, "Besok 05.30 WIB", "07.00 - 10.00 WIB", "05.00 WIB", 4.9, 31, ["tuna"]],
  ["Kembung Segar", "Bu Sari", "Indramayu", 28000, 150, 3, 7000, "Hari ini 15.00 WIB", "16.00 - 18.00 WIB", "04.50 WIB", 4.8, 55, ["banyar"]],
  ["Tenggiri", "Pak Joko", "Cirebon", 72000, 70, 2, 7500, "Besok 06.00 WIB", "07.00 - 10.00 WIB", "05.15 WIB", 4.7, 22, ["spanish mackerel"]],
  ["Bawal Putih", "Pak Rahmat", "Pelabuhan Ratu", 85000, 45, 2, 9000, "Besok 07.00 WIB", "08.00 - 11.00 WIB", "05.40 WIB", 4.9, 15, ["bawal"]],
  ["Layur", "Pak Eman", "Pelabuhan Ratu", 38000, 80, 2, 9000, "Besok 07.00 WIB", "08.00 - 11.00 WIB", "05.25 WIB", 4.5, 12, ["beltfish"]],
  ["Gurame Laut", "Pak Wayan", "Cilacap", 48000, 85, 2, 8000, "Besok 06.00 WIB", "07.00 - 10.00 WIB", "05.35 WIB", 4.6, 19, ["gurame"]],
  ["Udang Vaname", "Bu Ani", "Indramayu", 95000, 50, 1, 7000, "Hari ini 15.00 WIB", "16.00 - 18.00 WIB", "04.30 WIB", 4.9, 42, ["udang"]],
];

const INIT: Listing[] = RAW.map(([nama, nelayan, daerah, harga, stok, min, ongkirFlat, jamTibaHub, jamAntarRumah, jam, rating, ulasanCount, alias], i) => {
  const id = i + 1;
  return {
    id, nama, nelayan, daerah, harga, stok, min, ongkirFlat, jamTibaHub, jamAntarRumah, jam, rating, ulasanCount, alias,
    reviews: SPECIFIC_REVIEWS[id] || [],
    desc: i === 0
      ? "Daging tebal, padat, dan memiliki tekstur kenyal alami dengan rasa gurih khas ikan laut segar. Sangat ideal diolah menjadi menu kuah kuning, tim jahe, gulai, atau dibakar dengan bumbu kecap. Dijamin tanpa bahan pengawet dan langsung masuk kotak es higienis saat mendarat di pelabuhan."
      : `${nama} kualitas premium dari ${nelayan} di perairan ${daerah}. Tekstur daging segar tanpa pengawet, siap diolah untuk berbagai hidangan lezat keluarga.`,
  };
});

const KATEGORI = ["Semua", "Kakap", "Tongkol", "Tuna", "Cakalang", "Kembung", "Tenggiri", "Bawal", "Udang"];
const match = (l: Listing, s: string) => [l.nama, l.nelayan, l.daerah, ...l.alias].some((x) => x.toLowerCase().includes(s.toLowerCase()));

type Tab = "home" | "pesanan" | "chat" | "akun";
type OrderItem = {
  nama: string;
  qty: number;
  harga: number;
  nelayan: string;
};

type Order = {
  no: string;
  itemsSummary: string;
  items: OrderItem[];
  totalIkan: number;
  totalOngkir: number;
  status: "Sedang Diantar" | "Menunggu Penjemputan" | "Selesai";
  kurirNama?: string;
  kurirPlat?: string;
  ratingPesanan?: number;
  ratingToko?: number;
  ratingKurir?: number;
  bayar?: Metode;
  tanggal?: string;
};
type Metode = "QRIS" | "Transfer";
type Msg = { me: boolean; text: string };

const INITIAL_ORDERS: Order[] = [
  {
    no: "JL-1002",
    itemsSummary: "2 kg Kakap Merah, 1 kg Udang Vaname",
    items: [
      { nama: "Kakap Merah", qty: 2, harga: 65000, nelayan: "Pak Wayan" },
      { nama: "Udang Vaname", qty: 1, harga: 95000, nelayan: "Bu Ani" }
    ],
    totalIkan: 225000,
    totalOngkir: 15000,
    status: "Sedang Diantar",
    kurirNama: "Ahmad Subagja",
    kurirPlat: "D 4512 AB",
    bayar: "QRIS",
    tanggal: "Hari ini, 07:15 WIB"
  },
  {
    no: "JL-1001",
    itemsSummary: "2 kg Tongkol Segar",
    items: [
      { nama: "Tongkol Segar", qty: 2, harga: 32000, nelayan: "Pak Darmo" }
    ],
    totalIkan: 64000,
    totalOngkir: 8000,
    status: "Selesai",
    kurirNama: "Dedi Setiadi",
    kurirPlat: "D 3311 BK",
    ratingPesanan: 5,
    ratingToko: 5,
    ratingKurir: 5,
    bayar: "Transfer",
    tanggal: "Kemarin, 08:30 WIB"
  }
];

function FishArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 70" className={className} aria-hidden>
      <ellipse cx="55" cy="36" rx="40" ry="20" fill="#E6F2F8" />
      <path d="M92 36 L116 18 L116 54 Z" fill="#CFE6F1" />
      <path d="M40 18 L58 6 L66 20 Z" fill="#CFE6F1" />
      <path d="M28 33 Q55 26 85 33 M28 40 Q55 33 85 40" stroke="#7FB5CF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="30" cy="30" r="4.5" fill="#1b1b1b" />
    </svg>
  );
}

function Photo({ jam, className = "", hideTime = false }: { jam: string; className?: string; hideTime?: boolean }) {
  return (
    <div className={`relative grid place-items-center overflow-hidden bg-gradient-to-b from-[#0B6E99] to-[#064663] ${className}`}>
      {!hideTime && (
        <>
          <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
          <span className="absolute top-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-white/90 z-10">{jam}</span>
        </>
      )}
      <FishArt className="w-3/4" />
    </div>
  );
}

const NAV: { k: Tab; label: string; Icon: typeof Home }[] = [
  { k: "home", label: "Beranda", Icon: Home },
  { k: "pesanan", label: "Pesanan", Icon: ClipboardList },
  { k: "chat", label: "Chat", Icon: MessageCircle },
  { k: "akun", label: "Akun", Icon: User },
];

function TopNav({ tab, go, cartCount, onCart, user, onEditAddress }: { tab: Tab; go: (t: Tab) => void; cartCount: number; onCart: () => void; user: UserProfile; onEditAddress: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-soft/40 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <button onClick={() => go("home")} aria-label="Beranda"><Logo /></button>
        <nav className="hidden items-center gap-2 md:flex">
          {NAV.map(({ k, label }) => (
            <button key={k} onClick={() => go(k)} className={`rounded-full px-5 py-2 font-sub text-sm font-semibold transition-colors ${tab === k ? "bg-brand text-white shadow-sm" : "text-ink hover:bg-surface"}`}>{label}</button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={onEditAddress}
            className="flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-1.5 font-sub text-xs font-semibold text-white transition hover:bg-brand/90 shadow-sm"
            title="Klik untuk ubah alamat & titik lokasi"
          >
            <MapPin size={14} />
            <span className="max-w-[120px] truncate sm:max-w-none">{user.kotaKecamatan || "Jatinangor, Sumedang"}</span>
          </button>
          <button onClick={onCart} className="relative grid size-10 place-items-center rounded-full hover:bg-surface transition" aria-label="Keranjang">
            <ShoppingCart size={22} className="text-ink" />
            {cartCount > 0 && <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-brand text-[11px] font-bold text-white shadow-sm">{cartCount}</span>}
          </button>
          <button onClick={() => go("akun")} className="grid size-10 place-items-center rounded-full bg-brand font-sub font-bold text-white transition hover:opacity-90 active:scale-95 shadow-sm" aria-label="Akun Saya">
            {user.nama ? user.nama[0].toUpperCase() : "U"}
          </button>
        </div>
      </div>
    </header>
  );
}

function BottomNav({ tab, go }: { tab: Tab; go: (t: Tab) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 h-16 border-t border-soft/30 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-2">
        {NAV.map(({ k, label, Icon }) => {
          const on = tab === k;
          return (
            <button
              key={k}
              onClick={() => go(k)}
              className="relative flex h-full w-1/4 flex-col items-center justify-center"
              aria-current={on ? "page" : undefined}
            >
              <div className={`flex items-center justify-center transition-all duration-300 ${on ? "-translate-y-1" : ""}`}>
                <div className={`grid place-items-center rounded-full transition-all duration-300 ${on ? "size-10 bg-brand text-white shadow-md ring-4 ring-white" : "size-6 text-ink/50"}`}>
                  <Icon size={on ? 18 : 22} />
                </div>
              </div>
              <span className={`text-[11px] font-sub font-semibold transition-colors mt-0.5 ${on ? "text-brand font-bold" : "text-ink/50"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function ListingCard({ l, onClick, onOpenFisher }: { l: Listing; onClick: () => void; onOpenFisher: (fisherName: string) => void }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl bg-surface p-4 transition hover:shadow-md border border-soft/30">
      <button onClick={onClick} className="flex w-full gap-4 text-left">
        <Photo jam={l.jam} className="size-24 shrink-0 rounded-xl sm:size-28 md:size-32" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <h3 className="truncate font-heading text-lg font-bold text-ink md:text-xl">{l.nama}</h3>
          <p className="font-heading text-lg font-bold text-brand md:text-xl">{rp(l.harga)}<span className="font-sub text-sm font-medium text-ink/60">/kg</span></p>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1 border-brand bg-white font-sub text-brand"><BadgeCheck size={12} />Terverifikasi foto</Badge>
            <span className="font-sub text-xs text-ink/70">Stok {l.stok} kg</span>
          </div>
          <div className="pt-0.5">
            <span className="inline-flex items-center gap-1 font-sub text-xs font-semibold text-brand bg-brand/10 px-2.5 py-0.5 rounded-md">
              Ongkir Rute {rp(l.ongkirFlat)}/kg
            </span>
          </div>
        </div>
      </button>
      
      <div className="mt-3 border-t border-soft/30 pt-2.5 flex items-center justify-between">
        <button onClick={() => onOpenFisher(l.nelayan)} className="flex items-center gap-1.5 text-xs font-sub font-bold text-ink hover:text-brand transition">
          <Store size={14} className="text-brand" /> {l.nelayan} ({l.daerah})
        </button>
        <button onClick={() => onOpenFisher(l.nelayan)} className="text-[11px] font-bold text-brand hover:underline">
          Lihat Toko &rsaquo;
        </button>
      </div>
    </div>
  );
}

function HomeView({ listings, userName, onOpen, onOpenFisher }: { listings: Listing[]; userName: string; onOpen: (id: number) => void; onOpenFisher: (fisherName: string) => void }) {
  const [q, setQ] = useState("");
  const [kat, setKat] = useState("Semua");
  const [focus, setFocus] = useState(false);
  const [daerah, setDaerah] = useState("Semua");
  const [sort, setSort] = useState("terbaru");

  const sugg = useMemo(() => (q ? listings.filter((l) => match(l, q)).slice(0, 5) : []), [q, listings]);
  const list = listings
    .filter((l) => (q ? match(l, q) : true) && (kat === "Semua" || match(l, kat)) && (daerah === "Semua" || l.daerah === daerah))
    .sort((a, b) => (sort === "murah" ? a.harga - b.harga : sort === "mahal" ? b.harga - a.harga : a.id - b.id));

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 pb-28 md:pb-10">
      <h1 className="font-heading text-2xl font-bold text-ink md:text-3xl">Halo, {userName}!</h1>

      <section className="rounded-3xl bg-surface p-6 md:p-10 shadow-sm border border-soft/40">
        <div className="flex items-start justify-between gap-4">
          <h2 className="max-w-xl font-heading text-2xl font-bold leading-tight text-ink md:text-4xl">Ikan segar, tangkapan nelayan lokal!</h2>
          <div className="grid size-20 shrink-0 place-items-center rounded-full bg-brand md:size-28 shadow-md">
            <svg viewBox="0 0 60 40" className="w-3/5" fill="white"><ellipse cx="26" cy="20" rx="20" ry="12" /><path d="M44 20 L58 8 L58 32 Z" /><circle cx="14" cy="17" r="2.5" className="fill-brand" /></svg>
          </div>
        </div>
        <div className="relative mt-6 max-w-2xl">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-soft" />
              <Input 
                value={q} 
                onChange={(e) => setQ(e.target.value)} 
                onFocus={() => setFocus(true)} 
                onBlur={() => setTimeout(() => setFocus(false), 150)} 
                placeholder="Cari ikan, nama nelayan, atau daerah..." 
                className="h-12 rounded-2xl border border-soft/80 bg-white pl-11 pr-9 text-ink shadow-sm placeholder:text-soft focus:border-brand" 
              />
              {q && <button onClick={() => setQ("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-soft" aria-label="Hapus pencarian"><X size={18} /></button>}
            </div>
            <Button className="h-12 rounded-2xl bg-brand px-8 font-sub text-base font-semibold text-white hover:bg-brand/90 shadow-sm">Cari</Button>
          </div>
          {focus && sugg.length > 0 && (
            <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-soft/40 bg-white shadow-xl">
              {sugg.map((s) => (
                <li key={s.id}>
                  <button onMouseDown={() => setQ(s.nama)} className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-surface">
                    <div>
                      <span className="font-sub font-semibold text-ink block">{s.nama}</span>
                      <span className="text-xs text-soft">{s.nelayan} · {s.daerah}</span>
                    </div>
                    <span className="text-xs font-semibold text-brand">{rp(s.harga)}/kg</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {KATEGORI.map((k) => (
          <button key={k} onClick={() => setKat(k)} className={`shrink-0 rounded-full border px-5 py-2 font-sub text-sm font-semibold transition-colors ${kat === k ? "border-brand bg-brand text-white shadow-sm" : "border-soft bg-white text-ink hover:bg-surface"}`}>{k}</button>
        ))}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-ink">{q ? <>Hasil untuk "{q}"</> : "Ikan Segar Hari Ini"}</h2>
          <span className="font-sub text-sm font-semibold text-brand">{list.length} ikan ditemukan</span>
        </div>
        <div className="mb-4 flex gap-3">
          <CustomSelect
            value={daerah}
            onChange={setDaerah}
            options={[
              { label: "Semua daerah", value: "Semua" },
              ...Array.from(new Set(listings.map((l) => l.daerah))).map((d) => ({ label: d, value: d })),
            ]}
          />
          <CustomSelect
            value={sort}
            onChange={setSort}
            options={[
              { label: "Terbaru", value: "terbaru" },
              { label: "Harga termurah", value: "murah" },
              { label: "Harga termahal", value: "mahal" },
            ]}
          />
        </div>
        {list.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{list.map((l) => <ListingCard key={l.id} l={l} onClick={() => onOpen(l.id)} onOpenFisher={onOpenFisher} />)}</div>
        ) : <p className="py-12 text-center text-ink/60">Ikan tidak ditemukan.</p>}
      </section>
    </div>
  );
}

function FisherProfileView({ fisherName, listings, onBack, onOpenDetail, onChat }: { fisherName: string; listings: Listing[]; onBack: () => void; onOpenDetail: (id: number) => void; onChat: () => void }) {
  const fisherListings = listings.filter((l) => l.nelayan === fisherName);
  const sample = fisherListings[0];
  if (!sample) return null;

  const allReviews = fisherListings.flatMap((l) => l.reviews.map((r) => ({ ...r, fishName: l.nama })));
  const avgRating = fisherListings.length 
    ? (fisherListings.reduce((sum, l) => sum + l.rating, 0) / fisherListings.length).toFixed(1)
    : "5.0";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 pb-32 md:pb-10 space-y-6">
      <button onClick={onBack} className="grid size-10 place-items-center rounded-full bg-brand text-white shadow-sm" aria-label="Kembali"><ChevronLeft /></button>
      
      <div className="rounded-3xl bg-surface p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-soft/40 shadow-sm">
        <div className="flex items-center gap-5 text-center md:text-left">
          <div className="grid size-20 md:size-24 place-items-center rounded-full bg-brand font-heading text-3xl md:text-4xl font-bold text-white shadow-md">
            {fisherName.split(" ")[1]?.[0] || "N"}
          </div>
          <div className="space-y-1">
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-ink">{fisherName}</h1>
            <p className="flex items-center justify-center md:justify-start gap-1 text-sm text-ink/70"><MapPin size={14} className="text-brand" /> Perairan {sample.daerah} · Rute Terjadwal</p>
            <div className="flex items-center justify-center md:justify-start gap-2 pt-1">
              <span className="flex items-center gap-1 text-xs font-bold text-brand bg-brand/10 px-3 py-1 rounded-full">
                <Star size={12} className="fill-brand" /> {avgRating} Rating Toko
              </span>
              <span className="text-xs text-ink/60">{fisherListings.length} Produk Ikan Segar · {allReviews.length} Ulasan</span>
            </div>
          </div>
        </div>

        <Button onClick={onChat} className="h-12 rounded-full bg-brand px-8 font-sub text-sm font-semibold text-white hover:bg-brand/90 transition shadow-sm gap-2">
          <MessageCircle size={18} /> Chat Nelayan
        </Button>
      </div>

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-bold text-ink">Semua Tangkapan Segar dari {fisherName}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {fisherListings.map((l) => (
            <div key={l.id} className="flex flex-col justify-between rounded-2xl bg-surface p-4 transition hover:shadow-md border border-soft/30">
              <button onClick={() => onOpenDetail(l.id)} className="flex w-full gap-3 text-left">
                <Photo jam={l.jam} className="size-24 shrink-0 rounded-xl sm:size-28" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <h3 className="truncate font-heading text-lg font-bold text-ink">{l.nama}</h3>
                  <p className="font-heading text-lg font-bold text-brand">{rp(l.harga)}<span className="font-sub text-sm font-medium text-ink/60">/kg</span></p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="gap-1 border-brand bg-white font-sub text-brand"><BadgeCheck size={12} />Terverifikasi foto</Badge>
                    <span className="font-sub text-xs text-ink/70">Stok {l.stok} kg</span>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 pt-6 border-t border-soft/40">
        <h2 className="font-heading text-xl font-bold text-ink">Ulasan Pembeli Toko ({allReviews.length})</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allReviews.map((rev, idx) => (
            <div key={idx} className="rounded-2xl bg-surface p-4 space-y-2 border border-soft/30">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-sub text-sm font-bold text-ink block">{rev.user}</span>
                  <span className="text-[11px] text-brand font-semibold">Produk: {rev.fishName}</span>
                </div>
                <span className="text-xs text-ink/50">{rev.date}</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < rev.rating ? "fill-brand text-brand" : "text-soft"} />
                ))}
              </div>
              <p className="text-sm text-ink/80">{rev.comment}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function DetailView({ l, onBack, onAdd, fav, onFav, onChat, onOpenReview, onOpenFisher }: { l: Listing; onBack: () => void; onAdd: (qty: number, langsungBeli: boolean) => void; fav: boolean; onFav: () => void; onChat: () => void; onOpenReview: () => void; onOpenFisher: (fisher: string) => void }) {
  const [qty, setQty] = useState(l.min);
  const ongkirEstimasi = calculateTotalOngkir(l.ongkirFlat, qty);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 pb-32 md:pb-10">
      <button onClick={onBack} className="mb-6 grid size-10 place-items-center rounded-full bg-brand text-white shadow-sm" aria-label="Kembali"><ChevronLeft /></button>
      <div className="grid gap-8 lg:grid-cols-2">
        
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-gradient-to-b from-[#0B6E99] to-[#064663] shadow-md">
          <Photo jam={l.jam} className="absolute inset-0 size-full" />
          <span className="absolute bottom-4 left-4 flex items-center gap-1 rounded-full bg-white/90 px-3.5 py-1.5 font-sub text-xs font-semibold text-brand shadow-md backdrop-blur">
            <BadgeCheck size={16} /> Terverifikasi foto
          </span>
          <span className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white shadow-md">
            1/3
          </span>
        </div>

        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="font-heading text-3xl font-bold text-ink">{l.nama}</h1>
              <div className="flex items-center gap-2">
                <Badge className="bg-brand font-sub text-white">Min. {l.min} kg</Badge>
                <Badge className="bg-brand font-sub text-white">Stok {l.stok} kg</Badge>
              </div>
              <p className="font-heading text-3xl font-bold text-brand">{rp(l.harga)}<span className="font-sub text-base font-medium text-ink/60">/kg</span></p>
            </div>
            <button onClick={onFav} className="grid size-12 place-items-center rounded-full bg-brand text-white shadow-md transition hover:scale-105" aria-label="Simpan ke favorit" aria-pressed={fav}><Star size={20} className={fav ? "fill-white" : ""} /></button>
          </div>

          <div className="rounded-2xl border border-soft/80 bg-surface p-5 space-y-4">
            <h3 className="font-sub text-base font-bold text-ink flex items-center gap-2">
              <MapPin size={18} className="text-brand" /> Pengiriman Rute {l.daerah} – Bandung
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white p-4 border border-soft/60 shadow-sm">
                <p className="text-xs text-ink/70">Estimasi Ongkir ({qty} kg)</p>
                <p className="font-heading text-xl font-bold text-brand">{rp(ongkirEstimasi)}</p>
                {qty > 1 && <p className="text-[11px] text-brand/80 font-semibold">Diskon volume aktif</p>}
              </div>
              <div className="rounded-2xl bg-white p-4 border border-soft/60 shadow-sm">
                <p className="text-xs text-ink/70">Kirim ke Rumah</p>
                <p className="font-heading text-base font-bold text-ink">{l.jamAntarRumah}</p>
                <p className="text-[11px] text-ink/60 mt-0.5">Tiba Hub: {l.jamTibaHub}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-ink/70 pt-1">
              <Snowflake size={16} className="text-brand shrink-0" />
              <span>Ikan langsung masuk <i>cold box</i> es higienis subuh ini & dikirim via armada berpendingin.</span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-surface p-4 border border-soft/60">
            <span className="font-sub font-semibold text-ink text-base">Atur Jumlah Pembelian</span>
            <div className="flex h-11 items-center gap-4 rounded-xl bg-white px-4 text-brand border border-soft/80 shadow-sm">
              <button onClick={() => setQty(Math.max(l.min, qty - 1))} aria-label="Kurang"><Minus size={16} /></button>
              <span className="font-heading text-lg font-bold text-ink">{qty} <span className="text-xs font-normal text-ink/60">kg</span></span>
              <button onClick={() => setQty(Math.min(l.stok, qty + 1))} aria-label="Tambah"><Plus size={16} /></button>
            </div>
          </div>

          <div className="fixed inset-x-0 bottom-0 z-20 flex gap-3 border-t border-soft/30 bg-white p-4 md:static md:border-0 md:bg-transparent md:p-0 md:pt-2">
            <Button onClick={() => onAdd(qty, false)} className="h-13 flex-1 rounded-2xl border-2 border-brand bg-white text-brand hover:bg-surface font-sub font-semibold flex items-center justify-center gap-2 text-base shadow-sm">
              <ShoppingCart size={20} /> Keranjang
            </Button>
            <Button onClick={() => onAdd(qty, true)} className="h-13 flex-1 rounded-2xl bg-brand text-white hover:bg-brand/90 font-sub font-semibold text-base shadow-sm">
              Beli Sekarang
            </Button>
          </div>

          <div className="flex items-center gap-4 border-t border-soft/30 pt-5">
            <button onClick={() => onOpenFisher(l.nelayan)} className="grid size-12 shrink-0 place-items-center rounded-full bg-brand font-sub font-bold text-white hover:opacity-90 transition shadow-sm">
              {l.nelayan.split(" ")[1]?.[0] || "N"}
            </button>
            <div className="min-w-0 flex-1 text-left">
              <button onClick={() => onOpenFisher(l.nelayan)} className="font-sub font-bold text-ink hover:text-brand transition block truncate text-base">
                {l.nelayan} <span className="text-xs font-bold text-brand hover:underline ml-1">Lihat Toko &rsaquo;</span>
              </button>
              <p className="flex items-center gap-1 text-sm text-ink/60"><MapPin size={14} />{l.daerah}</p>
            </div>
            <Button onClick={onChat} className="size-12 shrink-0 rounded-full border border-brand bg-white text-brand hover:bg-surface p-0 shadow-sm" aria-label="Chat"><MessageCircle size={20} /></Button>
          </div>

          <div>
            <h3 className="mb-2 font-sub font-bold text-ink text-lg">Deskripsi Produk</h3>
            <p className="text-ink/80 text-sm leading-relaxed">{l.desc}</p>
          </div>

          <div className="border-t border-soft/40 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-xl font-bold text-ink">Ulasan Pembeli ({l.reviews.length})</h3>
              <Button onClick={onOpenReview} className="rounded-full bg-brand px-5 py-2 font-sub text-xs font-semibold text-white hover:bg-brand/90 transition shadow-sm">
                + Tulis Ulasan
              </Button>
            </div>

            <div className="space-y-3">
              {l.reviews.map((rev) => (
                <div key={rev.id} className="rounded-2xl bg-surface p-4 space-y-2 border border-soft/30">
                  <div className="flex items-center justify-between">
                    <span className="font-sub text-sm font-bold text-ink">{rev.user}</span>
                    <span className="text-xs text-ink/50">{rev.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < rev.rating ? "fill-brand text-brand" : "text-soft"} />
                    ))}
                  </div>
                  <p className="text-sm text-ink/80">{rev.comment}</p>
                  {rev.mediaUrl && (
                    <div className="pt-1">
                      {rev.mediaType === "video" ? (
                        <video src={rev.mediaUrl} controls className="h-24 w-40 rounded-xl object-cover border border-soft bg-black" />
                      ) : (
                        <div className="relative size-20 overflow-hidden rounded-xl border border-soft bg-white">
                          <Image src={rev.mediaUrl} alt="Foto Ulasan" fill className="object-cover" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function CartSheet({ open, onClose, cartItems, listings, userAddress, onQtyChange, onToggleCheck, onRemoveItem, onCheckout }: { 
  open: boolean; 
  onClose: () => void; 
  cartItems: CartItem[]; 
  listings: Listing[]; 
  userAddress: string;
  onQtyChange: (id: number, qty: number) => void; 
  onToggleCheck: (id: number) => void;
  onRemoveItem: (id: number) => void; 
  onCheckout: (metode: Metode, checkedListings: { listing: Listing; qty: number }[], totalIkan: number, totalOngkir: number) => void 
}) {
  const [step, setStep] = useState<"cart" | "bayar">("cart");
  const [metode, setMetode] = useState<Metode>("QRIS");

  useEffect(() => {
    if (!open) { setStep("cart"); return; }
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  const enrichedCart = cartItems.map((item) => {
    const l = listings.find((x) => x.id === item.id)!;
    return { ...item, listing: l };
  });

  const checkedItems = enrichedCart.filter((item) => item.checked);
  const totalIkanPrice = checkedItems.reduce((sum, item) => sum + (item.listing.harga * item.qty), 0);

  const groupedByFisher = checkedItems.reduce((acc, item) => {
    const key = item.listing.nelayan;
    if (!acc[key]) {
      acc[key] = { ongkirFlat: item.listing.ongkirFlat, totalQty: 0 };
    }
    acc[key].totalQty += item.qty;
    return acc;
  }, {} as Record<string, { ongkirFlat: number; totalQty: number }>);

  const totalOngkir = Object.values(groupedByFisher).reduce((sum, group) => {
    return sum + calculateTotalOngkir(group.ongkirFlat, group.totalQty);
  }, 0);

  const grandTotal = totalIkanPrice + totalOngkir;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Keranjang" onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-ink">{step === "bayar" ? "Pembayaran" : "Keranjang Belanja"}</h2>
          <button onClick={onClose} className="grid size-10 place-items-center rounded-full border border-soft text-ink" aria-label="Tutup"><X size={18} /></button>
        </div>

        {step === "bayar" ? (
          <>
            <button onClick={() => setStep("cart")} className="flex items-center gap-1 font-sub text-sm font-semibold text-brand"><ChevronLeft size={16} />Kembali ke keranjang</button>
            <div className="grid grid-cols-2 gap-2">
              {(["QRIS", "Transfer"] as Metode[]).map((m) => (
                <button key={m} onClick={() => setMetode(m)} aria-pressed={metode === m} className={`rounded-xl border-2 p-3 text-left font-sub font-semibold ${metode === m ? "border-brand bg-brand/10 text-brand" : "border-soft/50 text-ink"}`}>
                  {m === "QRIS" ? "QRIS" : "Transfer Bank"}<span className="block text-xs font-normal text-ink/60">{m === "QRIS" ? "E-wallet & m-banking" : "BCA / BRI / Mandiri"}</span>
                </button>
              ))}
            </div>
            <div className="rounded-2xl bg-surface p-4 text-center text-sm text-ink">
              {metode === "QRIS"
                ? <><div className="mx-auto mb-2 grid size-40 place-items-center rounded-xl border-2 border-dashed border-soft text-soft">QR code</div>Scan QRIS lalu bayar tepat sesuai total.</>
                : <>Transfer ke<br /><b className="font-heading text-lg">1234 5678 90</b><br />Bank BCA a.n. JalaLink</>}
            </div>
            <div className="flex items-end justify-between"><b className="font-heading text-lg text-ink">Total Bayar</b><b className="font-heading text-2xl text-brand">{rp(grandTotal)}</b></div>
            <Button onClick={() => onCheckout(metode, checkedItems.map(i => ({ listing: i.listing, qty: i.qty })), totalIkanPrice, totalOngkir)} className="h-12 w-full rounded-xl bg-brand font-sub text-base font-semibold text-white hover:bg-brand/90">Saya Sudah Bayar</Button>
          </>
        ) : enrichedCart.length > 0 ? (
          <>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {enrichedCart.map((item) => {
                const l = item.listing;
                const itemTotalIkan = l.harga * item.qty;
                return (
                  <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-surface p-3 border border-soft/40">
                    <button onClick={() => onToggleCheck(item.id)} className="text-brand shrink-0">
                      {item.checked ? <CheckSquare size={22} className="fill-brand text-white" /> : <Square size={22} className="text-soft" />}
                    </button>
                    <Photo jam={l.jam} className="size-16 shrink-0 rounded-xl" hideTime/>
                    <div className="flex-1 min-w-0">
                      <p className="font-sub font-bold text-ink truncate">{l.nama}</p>
                      <p className="text-xs text-ink/60 truncate">{l.nelayan} | {l.daerah}</p>
                      <p className="text-sm font-bold text-brand mt-0.5">{rp(itemTotalIkan)}</p>                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-3 rounded-xl border border-brand bg-white px-2 py-1 text-brand">
                          <button onClick={() => onQtyChange(item.id, Math.max(l.min, item.qty - 1))} aria-label="Kurang"><Minus size={14} /></button>
                          <span className="font-sub text-xs font-bold text-ink">{item.qty} kg</span>
                          <button onClick={() => onQtyChange(item.id, Math.min(l.stok, item.qty + 1))} aria-label="Tambah"><Plus size={14} /></button>
                        </div>
                        <button onClick={() => onRemoveItem(item.id)} className="text-ink/40 hover:text-ink" aria-label="Hapus"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-surface p-3 text-xs text-ink"><MapPin size={16} className="text-brand shrink-0" />Dikirim ke <b>{userAddress}</b></div>

            <div className="space-y-2 text-ink text-sm border-t border-soft/40 pt-3">
              <div className="flex justify-between"><span>Harga Ikan ({checkedItems.length} item)</span><b>{rp(totalIkanPrice)}</b></div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Ongkir Rute (Gabungan)</span>
                  <b>{rp(totalOngkir)}</b>
                </div>
                {Object.entries(groupedByFisher).map(([nelayan, data]) => (
                  <div key={nelayan} className="flex justify-between text-xs text-ink/60">
                    <span>- {nelayan} ({data.totalQty} kg)</span>
                    <span>{rp(calculateTotalOngkir(data.ongkirFlat, data.totalQty))}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-end justify-between border-t border-soft/40 pt-3">
                <div>
                  <b className="font-heading text-base block">Total Bayar</b>
                  <span className="text-[10px] text-ink/60">Termasuk pajak & ongkir</span>
                </div>
                <b className="font-heading text-2xl text-brand">{rp(grandTotal)}</b>
              </div>
            </div>

            <Button 
              disabled={checkedItems.length === 0} 
              onClick={() => setStep("bayar")} 
              className="h-12 w-full rounded-xl bg-brand font-sub text-base font-semibold text-white hover:bg-brand/90 disabled:opacity-40"
            >
              {checkedItems.length > 0 ? `Beli Sekarang (${checkedItems.length})` : "Pilih Minimal 1 Barang"}
            </Button>
          </>
        ) : (
          <div className="py-10 text-center space-y-2">
            <ShoppingCart className="mx-auto text-soft" size={40} />
            <p className="text-ink/60 text-sm">Keranjang belanjamu masih kosong.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PesananView({ orders, onDone, onReview, onBrowse }: { orders: Order[]; onDone: (no: string) => void; onReview: (no: string) => void; onBrowse: () => void }) {
  const [activeTab, setActiveTab] = useState<"aktif" | "riwayat">("aktif");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const activeOrders = orders.filter((o) => o.status !== "Selesai");
  const historyOrders = orders.filter((o) => o.status === "Selesai");

  const toggleExpand = (no: string) => {
    setExpandedOrder((prev) => (prev === no ? null : no));
  };

  const listToDisplay = activeTab === "aktif" ? activeOrders : historyOrders;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 pb-28 md:pb-10">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-ink md:text-3xl">Pesanan Saya</h1>
      </div>

      <div className="flex border-b border-soft/40 max-w-md">
        <button
          onClick={() => setActiveTab("aktif")}
          className={`flex-1 pb-3 font-sub text-sm font-bold transition-all border-b-2 ${
            activeTab === "aktif" ? "border-brand text-brand" : "border-transparent text-ink/50 hover:text-ink"
          }`}
        >
          Dalam Proses ({activeOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("riwayat")}
          className={`flex-1 pb-3 font-sub text-sm font-bold transition-all border-b-2 ${
            activeTab === "riwayat" ? "border-brand text-brand" : "border-transparent text-ink/50 hover:text-ink"
          }`}
        >
          Riwayat Selesai ({historyOrders.length})
        </button>
      </div>

      {listToDisplay.length === 0 ? (
        <div className="rounded-3xl bg-surface p-12 text-center border border-soft/30 max-w-xl mx-auto">
          <PackageCheck className="mx-auto mb-3 text-soft" size={48} />
          <p className="mb-4 text-ink/70 font-sub text-sm">
            {activeTab === "aktif" ? "Belum ada pesanan yang berlangsung." : "Belum ada riwayat pesanan selesai."}
          </p>
          {activeTab === "aktif" && (
            <Button 
              onClick={onBrowse} 
              className="rounded-xl bg-brand px-6 py-2.5 font-sub text-sm font-semibold text-white shadow-sm hover:bg-brand/90 transition"
            >
              Cari Ikan Segar
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listToDisplay.map((o) => {
            const isExpanded = expandedOrder === o.no;
            return (
              <div key={o.no} className="flex flex-col justify-between rounded-3xl bg-surface p-5 space-y-3 border border-soft/40 shadow-sm transition">
                <div>
                  <div className="flex items-center justify-between border-b border-soft/30 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-sub text-xs font-bold text-ink">{o.no}</span>
                      {o.bayar && <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-ink/60 border border-soft/60">{o.bayar}</span>}
                      {o.tanggal && <span className="text-[11px] text-ink/50">· {o.tanggal}</span>}
                    </div>
                    <Badge className={`font-sub ${o.status === "Selesai" ? "bg-emerald-600 text-white" : "bg-brand text-white"}`}>
                      {o.status}
                    </Badge>
                  </div>

                  <div>
                    <p className="font-sub text-base font-bold text-ink leading-snug">{o.itemsSummary}</p>
                    <button 
                      onClick={() => toggleExpand(o.no)} 
                      className="mt-2 flex items-center gap-1 text-xs font-bold text-brand hover:underline"
                    >
                      {isExpanded ? "Sembunyikan Rincian ^" : "Lihat Rincian Pesanan v"}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 rounded-2xl bg-white p-4 space-y-2 border border-soft/60 text-xs">
                      <p className="font-bold text-ink border-b border-soft/30 pb-1">Detail Item Tangkapan:</p>
                      {o.items && o.items.length > 0 ? (
                        o.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-ink/80">
                            <span>{item.qty} kg {item.nama} <span className="text-[10px] text-ink/50">({item.nelayan})</span></span>
                            <span className="font-semibold">{rp(item.harga * item.qty)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-ink/60 italic">{o.itemsSummary}</p>
                      )}
                      <div className="border-t border-soft/30 pt-2 space-y-1">
                        <div className="flex justify-between text-ink/70">
                          <span>Subtotal Ikan</span>
                          <span>{rp(o.totalIkan)}</span>
                        </div>
                        <div className="flex justify-between text-ink/70">
                          <span>Total Ongkir Rute</span>
                          <span>{rp(o.totalOngkir)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-soft/30 pt-3">
                  <div>
                    <span className="text-[11px] text-ink/60 block">Total Pembayaran</span>
                    <b className="font-heading text-lg text-brand">{rp(o.totalIkan + o.totalOngkir)}</b>
                  </div>

                  {o.status !== "Selesai" ? (
                    <Button 
                      onClick={() => onDone(o.no)} 
                      className="rounded-xl bg-brand px-5 py-2.5 font-sub text-xs font-bold text-white hover:bg-brand/90 shadow-sm shrink-0 whitespace-nowrap"
                    >
                      Konfirmasi Diterima
                    </Button>
                  ) : o.ratingPesanan ? (
                    <div className="flex flex-col items-end gap-1">
                      <span className="flex items-center gap-1 font-sub text-xs font-bold text-brand bg-brand/10 px-3 py-1 rounded-xl">
                        <Star size={13} className="fill-brand" /> Ikan: {o.ratingPesanan}/5
                      </span>
                      <span className="text-[10px] text-ink/60 font-semibold">
                        Toko {o.ratingToko}/5 · Kurir {o.ratingKurir}/5
                      </span>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => onReview(o.no)} 
                      className="rounded-xl border border-brand bg-white px-4 py-2 font-sub text-xs font-bold text-brand hover:bg-surface shadow-sm shrink-0 whitespace-nowrap"
                    >
                      Beri Ulasan Lengkap
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const QUICK_NELAYAN = ["Masih ada stok?", "Bisa kirim besok?", "Hasil tangkapan hari ini?"];
const QUICK_ADMIN = ["Bagaimana status kendala saya?", "Bisa bantu lacak posisi pengiriman?", "Saya ingin mengajukan komplain pesanan"];
const initial = (n: string) => n.split(" ")[1]?.[0] || (n ? n[0] : "N");

function ChatList({ fishers, msgs, onOpen }: { fishers: { nama: string; daerah: string }[]; msgs: Record<string, Msg[]>; onOpen: (n: string) => void }) {
  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6 pb-28 md:pb-10">
      <h1 className="font-heading text-2xl font-bold text-ink md:text-3xl">Chat Nelayan</h1>
      <p className="text-sm text-ink/60">Maksimal 20 pesan per hari per nelayan. Kontak pribadi nelayan tidak ditampilkan.</p>
      
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {fishers.map((f) => {
          const arr = msgs[f.nama] ?? [], last = arr[arr.length - 1];
          return (
            <button key={f.nama} onClick={() => onOpen(f.nama)} className="flex w-full items-center gap-4 rounded-2xl bg-surface p-4 text-left transition hover:shadow-md border border-soft/40">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand font-sub font-bold text-white shadow-sm">{initial(f.nama)}</span>
              <span className="min-w-0 flex-1"><b className="block font-sub text-ink text-base">{f.nama} · {f.daerah}</b><span className="block truncate text-sm text-ink/60">{last ? last.text : "Mulai percakapan"}</span></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChatRoom({ nama, daerah, msgs, used, onSend, onBack, onReport, isAdmin = false }: { nama: string; daerah: string; msgs: Msg[]; used: number; onSend: (t: string) => void; onBack: () => void; onReport?: (reason: string) => void; isAdmin?: boolean }) {
  const [t, setT] = useState("");
  const [isReportOpen, setIsReportOpen] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs.length]);
  const full = !isAdmin && used >= 20;
  const send = (x: string) => { if (!x.trim() || full) return; onSend(x.trim()); setT(""); };
  const quickList = isAdmin ? QUICK_ADMIN : QUICK_NELAYAN;

  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem)] max-w-5xl flex-col relative">
      <div className="flex items-center gap-3 border-b border-soft/30 px-4 py-3 bg-white z-10">
        <button onClick={onBack} className="grid size-10 place-items-center rounded-full bg-brand text-white shadow-sm" aria-label="Kembali"><ChevronLeft /></button>
        <span className="grid size-10 place-items-center rounded-full bg-brand font-sub font-bold text-white shadow-sm">{initial(nama)}</span>
        <div className="flex-1">
          <p className="font-sub font-bold text-ink text-base">{nama}</p>
          <p className="text-xs text-ink/60">{isAdmin ? "Customer Service Platform" : `${daerah} · ${used}/20 pesan hari ini`}</p>
        </div>
        
        {!isAdmin && onReport && (
          <button 
            onClick={() => setIsReportOpen(true)} 
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-sub text-xs font-semibold text-brand bg-brand/10 border border-brand/20 hover:bg-brand/20 transition"
          >
            <Flag size={14} className="text-brand" /> Lapor
          </button>
        )}
      </div>
      
      {!isAdmin && (
        <div className="mx-4 mt-3 rounded-2xl bg-brand/5 border border-brand/20 p-3.5 text-xs text-ink flex items-start gap-3 shadow-sm">
          <ShieldAlert size={18} className="text-brand shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block text-brand">Peringatan Keamanan Platform</span>
            <p className="leading-relaxed text-ink/80">
              Selalu bertransaksi melalui aplikasi JalaLink. Transaksi di luar sistem (COD/Transfer Pribadi) tidak dijamin oleh standar kualitas cold-chain & garansi platform.
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto bg-surface/60 p-4 sm:p-6">
        {msgs.length === 0 && (
          <p className="py-12 text-center text-sm text-ink/60">
            {isAdmin ? "Silakan sampaikan pertanyaan atau kendala transaksi Anda kepada Admin CS JalaLink." : "Tanyakan stok atau jadwal kirim lewat pesan cepat di bawah."}
          </p>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.me ? "items-end" : "items-start"}`}>
            <div className={`max-w-[80%] md:max-w-[65%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${m.me ? "rounded-br-sm bg-brand text-white" : "rounded-bl-sm bg-white text-ink"}`}>
              <p className="break-words leading-relaxed">{m.text}</p>
              <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${m.me ? "text-white/80" : "text-ink/50"}`}>
                <span>05.30</span>
                {m.me && <span className="font-bold">v</span>}
              </div>
            </div>
          </div>
        ))}
        <div ref={end} />
      </div>

      <div className="space-y-2.5 border-t border-soft/30 bg-white p-4 z-10">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {quickList.map((c) => (
            <button key={c} disabled={full} onClick={() => send(c)} className="shrink-0 rounded-full border border-brand bg-white px-4 py-1.5 font-sub text-xs font-semibold text-brand hover:bg-surface disabled:opacity-40">{c}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={t} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setT(e.target.value)} onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && send(t)} disabled={full} placeholder={full ? "Batas 20 pesan hari ini tercapai" : "Tulis pesan..."} className="h-12 rounded-2xl border border-soft px-4 text-ink placeholder:text-soft focus:border-brand" />
          <Button onClick={() => send(t)} disabled={full} className="size-12 rounded-2xl bg-brand text-white hover:bg-brand/90 shadow-sm" aria-label="Kirim"><Send size={18} /></Button>
        </div>
      </div>

      {isReportOpen && onReport && (
        <ReportSheet 
          fisherName={nama} 
          onClose={() => setIsReportOpen(false)} 
          onSubmit={(reason) => {
            onReport(reason);
          }} 
        />
      )}
    </div>
  );
}

function HelpCenterView({ 
  onBack, 
  tickets, 
  onCreateTicket,
  onOpenTicketChat
}: { 
  onBack: () => void; 
  tickets: HelpTicket[];
  onCreateTicket: (topik: string, subjek: string, pesan: string) => void;
  onOpenTicketChat: (ticketId: string) => void;
}) {
  const [searchFaq, setSearchFaq] = useState("");
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);

  const filteredFaqs = useMemo(() => {
    if (!searchFaq.trim()) return FAQ_LIST;
    const q = searchFaq.toLowerCase();
    return FAQ_LIST.filter((f) => f.pertanyaan.toLowerCase().includes(q) || f.jawaban.toLowerCase().includes(q) || f.kategori.toLowerCase().includes(q));
  }, [searchFaq]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 pb-28 md:pb-10">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="grid size-10 place-items-center rounded-full bg-brand text-white shadow-sm" aria-label="Kembali"><ChevronLeft /></button>
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink md:text-3xl">Pusat Bantuan & Tiket CS</h1>
          <p className="text-xs text-ink/60">Temukan jawaban FAQ atau kelola tiket bantuan transaksi Anda</p>
        </div>
      </div>

      <div className="rounded-3xl bg-surface border border-soft/40 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-ink flex items-center gap-2">
            <Ticket size={22} className="text-brand" /> Tiket Bantuan Saya ({tickets.length})
          </h2>
          <Button 
            onClick={() => setIsNewTicketOpen(true)}
            className="rounded-full bg-brand px-5 py-2 font-sub text-xs font-semibold text-white hover:bg-brand/90 transition shadow-sm"
          >
            + Buat Tiket Baru
          </Button>
        </div>

        {tickets.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {tickets.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-2xl bg-white p-4 border border-soft/50 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-md">{t.id}</span>
                    <span className="text-xs font-semibold text-ink/50">{t.tanggal}</span>
                  </div>
                  <p className="font-sub text-sm font-bold text-ink">{t.subjek}</p>
                  <p className="text-xs text-ink/60">Topik: {t.topik}</p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                    t.status === "Selesai" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"
                  }`}>
                    {t.status === "Selesai" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {t.status}
                  </span>
                  <Button 
                    onClick={() => onOpenTicketChat(t.id)}
                    className="h-8 rounded-xl border border-brand bg-white px-3 font-sub text-xs font-bold text-brand hover:bg-surface"
                  >
                    Buka Chat CS
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-ink/60 py-2 italic text-center">Belum ada tiket kendala aktif. Klik "+ Buat Tiket Baru" jika butuh bantuan khusus Admin.</p>
        )}
      </div>

      <div className="relative max-w-2xl">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-soft" />
        <Input 
          value={searchFaq} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchFaq(e.target.value)} 
          placeholder="Cari kendala, pengiriman, atau pembayaran..." 
          className="h-12 rounded-2xl border border-soft bg-surface pl-11 pr-4 text-ink placeholder:text-soft shadow-sm focus:border-brand"
        />
        {searchFaq && (
          <button onClick={() => setSearchFaq("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-soft">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="font-heading text-xl font-bold text-ink">Pertanyaan Sering Diajukan (FAQ)</h2>

        {filteredFaqs.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div key={faq.id} className="rounded-2xl border border-soft/50 bg-white overflow-hidden transition shadow-sm h-fit">
                  <button 
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between p-4 text-left font-sub font-semibold text-ink hover:bg-surface/50 transition gap-3"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-md uppercase tracking-wider">{faq.kategori}</span>
                      <p className="text-sm font-bold text-ink pt-1">{faq.pertanyaan}</p>
                    </div>
                    <ChevronDown size={18} className={`shrink-0 text-soft transition-transform duration-200 ${isOpen ? "rotate-180 text-brand" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-sm text-ink/80 leading-relaxed border-t border-soft/30 bg-surface/30">
                      {faq.jawaban}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-surface p-8 text-center space-y-2 border border-soft/40 max-w-md mx-auto">
            <HelpCircle size={36} className="mx-auto text-soft" />
            <p className="text-ink/70 font-sub text-sm">Jawaban tidak ditemukan untuk "{searchFaq}"</p>
          </div>
        )}
      </div>

      {isNewTicketOpen && (
        <CreateTicketSheet 
          onClose={() => setIsNewTicketOpen(false)}
          onSubmit={(topik, subjek, pesan) => {
            onCreateTicket(topik, subjek, pesan);
            setIsNewTicketOpen(false);
          }}
        />
      )}
    </div>
  );
}

function CreateTicketSheet({ onClose, onSubmit }: { onClose: () => void; onSubmit: (topik: string, subjek: string, pesan: string) => void }) {
  const [topik, setTopik] = useState("Kendala Pesanan & Ikan");
  const [subjek, setSubjek] = useState("");
  const [pesan, setPesan] = useState("");

  const topiks = [
    "Kendala Pesanan & Ikan",
    "Pengiriman & Kurir",
    "Pembayaran & QRIS",
    "Akun & Keamanan"
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!subjek.trim() || !pesan.trim()) return;
    onSubmit(topik, subjek.trim(), pesan.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <form role="dialog" aria-modal="true" onSubmit={handleSubmit} onClick={(e: React.MouseEvent<HTMLFormElement>) => e.stopPropagation()} className="w-full max-w-md space-y-4 rounded-t-3xl bg-white p-5 sm:rounded-3xl shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-ink">Buat Tiket Bantuan CS</h2>
          <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full border border-soft text-ink" aria-label="Tutup"><X size={18} /></button>
        </div>

        <div className="space-y-3 text-xs font-semibold text-ink">
          <div>
            <label className="block mb-1">Topik Masalah</label>
            <div className="grid grid-cols-2 gap-2">
              {topiks.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTopik(t)}
                  className={`rounded-xl border p-2.5 text-left font-sub text-xs font-bold transition ${
                    topik === t ? "border-brand bg-brand/10 text-brand" : "border-soft/60 bg-white text-ink hover:bg-surface"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-1">Judul Ringkas / Nomor Pesanan</label>
            <Input 
              value={subjek} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubjek(e.target.value)} 
              required 
              placeholder="Contoh: Pesanan JL-1002 Belum Tiba" 
              className="h-11 rounded-xl border border-soft px-3 text-sm text-ink placeholder:text-soft" 
            />
          </div>

          <div>
            <label className="block mb-1">Penjelasan Kendala</label>
            <textarea 
              value={pesan} 
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPesan(e.target.value)} 
              required
              rows={4} 
              placeholder="Jelaskan detail pertanyaan atau masalah yang dihadapi..." 
              className="w-full rounded-xl border border-soft p-3 text-sm text-ink placeholder:text-soft outline-none focus:border-brand" 
            />
          </div>
        </div>

        <Button type="submit" className="h-12 w-full rounded-xl bg-brand font-sub text-base font-semibold text-white hover:bg-brand/90 shadow-sm">
          Kirim Tiket & Buka Chat
        </Button>
      </form>
    </div>
  );
}

function AkunView({ 
  user, 
  favs, 
  onOpen, 
  onOpenFisher, 
  onEditProfile, 
  onEditAddress, 
  onHelp,
  onLogout,
  onDeleteAccount
}: { 
  user: UserProfile; 
  favs: Listing[]; 
  onOpen: (id: number) => void; 
  onOpenFisher: (fisher: string) => void; 
  onEditProfile: () => void; 
  onEditAddress: () => void; 
  onHelp: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}) {
  const row = "flex w-full items-center gap-3.5 rounded-2xl bg-surface p-4 text-left font-sub font-semibold text-ink hover:shadow-md transition border border-soft/30";

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 pb-28 md:pb-10">
      <h1 className="font-heading text-2xl font-bold text-ink md:text-3xl">Akun Saya</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div className="flex items-center gap-4 rounded-3xl bg-surface p-5 border border-soft/40 shadow-sm">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-brand font-heading text-2xl font-bold text-white grid place-items-center shadow-md">
              {user.photoUrl ? (
                <Image src={user.photoUrl} alt={user.nama} fill className="object-cover" />
              ) : (
                user.nama ? user.nama[0].toUpperCase() : "U"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-heading text-xl font-bold text-ink truncate">{user.nama}</p>
              <p className="text-sm text-ink/60 truncate">{user.email} · {user.phone}</p>
            </div>
            <Button onClick={onEditProfile} className="rounded-xl border border-brand bg-white px-4 py-2 font-sub text-xs text-brand hover:bg-surface shrink-0 shadow-sm">
              Edit Profil
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-3xl bg-surface p-5 text-sm text-ink border border-soft/40 shadow-sm">
            <div className="flex items-start gap-3 min-w-0 flex-1 pr-2">
              <MapPin className="text-brand shrink-0 mt-0.5" size={20} />
              <div className="min-w-0 flex-1 space-y-1">
                <b className="block font-sub text-xs text-ink/60">Alamat Pengiriman Utama</b>
                <span className="font-bold text-ink block truncate text-base">{user.jalanNo}</span>
                <span className="text-xs text-ink/70 block truncate">{user.kotaKecamatan}</span>
                {user.patokan && <span className="text-[11px] text-brand font-semibold block truncate">Patokan: {user.patokan}</span>}
                <span className="text-[10px] text-ink/50 block font-mono">Pin Lokasi: {user.lat.toFixed(4)}, {user.lng.toFixed(4)}</span>
              </div>
            </div>
            <button onClick={onEditAddress} className="font-sub text-xs font-bold text-brand hover:underline shrink-0">
              Ubah
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-ink">Pengaturan & Bantuan</h2>
          <button onClick={onHelp} className={row}>
            <LifeBuoy size={20} className="text-brand" />
            <span>Pusat Bantuan & Tiket CS</span>
          </button>
          
          <button onClick={onLogout} className={row}>
            <LogOut size={20} className="text-brand" />
            <span>Keluar Akun</span>
          </button>

          <button 
            onClick={onDeleteAccount} 
            className="flex w-full items-center gap-3.5 rounded-2xl bg-red-50 p-4 text-left font-sub font-semibold text-red-600 hover:bg-red-100 hover:shadow-md transition border border-red-200"
          >
            <Trash2 size={20} className="text-red-600" />
            <span>Hapus Akun Permanen</span>
          </button>
        </div>
      </div>

      <section className="pt-4 border-t border-soft/40">
        <h2 className="mb-4 font-heading text-xl font-bold text-ink">Ikan Favorit Saya ({favs.length})</h2>
        {favs.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{favs.map((l) => <ListingCard key={l.id} l={l} onClick={() => onOpen(l.id)} onOpenFisher={onOpenFisher} />)}</div>
        ) : (
          <p className="rounded-3xl bg-surface p-8 text-center text-sm text-ink/60 border border-soft/30 max-w-md">Belum ada favorit. Tekan bintang di halaman detail ikan.</p>
        )}
      </section>
    </div>
  );
}

function EditProfileSheet({ user, onClose, onSave }: { user: UserProfile; onClose: () => void; onSave: (updated: UserProfile) => void }) {
  const [nama, setNama] = useState(user.nama);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(user.photoUrl);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onSave({ ...user, nama, email, phone, photoUrl });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <form role="dialog" aria-modal="true" onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md space-y-4 rounded-t-3xl bg-white p-5 sm:rounded-3xl shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-ink">Edit Profil Pembeli</h2>
          <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full border border-soft text-ink" aria-label="Tutup"><X size={18} /></button>
        </div>

        <div className="flex flex-col items-center gap-2 py-2">
          <div className="relative size-20 overflow-hidden rounded-full border-2 border-brand bg-brand font-heading text-3xl font-bold text-white grid place-items-center shadow-sm">
            {photoUrl ? (
              <Image src={photoUrl} alt="Foto Profil" fill className="object-cover" />
            ) : (
              nama ? nama[0].toUpperCase() : "U"
            )}
          </div>
          <label className="cursor-pointer font-sub text-xs font-bold text-brand hover:underline">
            Ubah Foto Profil
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </label>
        </div>

        <div className="space-y-3 text-xs font-semibold text-ink">
          <div>
            <label className="block mb-1">Nama Lengkap</label>
            <Input value={nama} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNama(e.target.value)} required className="h-11 rounded-xl border border-soft px-3 text-sm text-ink placeholder:text-soft" />
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <Input type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} required className="h-11 rounded-xl border border-soft px-3 text-sm text-ink placeholder:text-soft" />
          </div>
          <div>
            <label className="block mb-1">Nomor WhatsApp / HP</label>
            <Input type="tel" value={phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)} required className="h-11 rounded-xl border border-soft px-3 text-sm text-ink placeholder:text-soft" />
          </div>
        </div>

        <Button type="submit" className="h-12 w-full rounded-xl bg-brand font-sub text-base font-semibold text-white hover:bg-brand/90 shadow-sm mt-2">
          Simpan Perubahan
        </Button>
      </form>
    </div>
  );
}

function EditAddressSheet({ user, onClose, onSave }: { user: UserProfile; onClose: () => void; onSave: (updated: Partial<UserProfile>) => void }) {
  const [alamatPeta, setAlamatPeta] = useState(user.kotaKecamatan ? `${user.jalanNo}, ${user.kotaKecamatan}` : user.jalanNo);
  const [detailRumah, setDetailRumah] = useState(user.rt ? `No. ${user.rt}/${user.rw}` : "");
  const [patokan, setPatokan] = useState(user.patokan);
  const [lat, setLat] = useState(user.lat);
  const [lng, setLng] = useState(user.lng);
  const [isLocating, setIsLocating] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);

  const handleCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const newLat = Number(pos.coords.latitude.toFixed(4));
          const newLng = Number(pos.coords.longitude.toFixed(4));
          setLat(newLat);
          setLng(newLng);

          try {
            setLoadingAddress(true);
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${newLat}&lon=${newLng}&format=json&zoom=18&addressdetails=1`);
            const data = await res.json();
            if (data.display_name) {
              setAlamatPeta(data.display_name);
            }
          } catch {
            // abaikan error
          } finally {
            setLoadingAddress(false);
            setIsLocating(false);
          }
        },
        () => {
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({ 
      jalanNo: alamatPeta, 
      rt: "", 
      rw: "", 
      kotaKecamatan: detailRumah ? `(${detailRumah})` : "", 
      patokan, 
      lat, 
      lng 
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <form role="dialog" aria-modal="true" onSubmit={handleSubmit} onClick={(e: React.MouseEvent<HTMLFormElement>) => e.stopPropagation()} className="w-full max-w-lg max-h-[90vh] space-y-4 overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-ink">Ubah Lokasi Pengiriman</h2>
          <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full border border-soft text-ink" aria-label="Tutup"><X size={18} /></button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-ink">Klik Titik Pin di Peta (Auto-Fill Alamat)</label>
            <button 
              type="button" 
              onClick={handleCurrentLocation} 
              disabled={isLocating}
              className="flex items-center gap-1 font-sub text-xs font-bold text-brand hover:underline"
            >
              <LocateFixed size={14} /> {isLocating ? "Mencari GPS..." : "Gunakan Lokasi HP"}
            </button>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-soft/80 shadow-inner">
            <MapPicker 
              lat={lat} 
              lng={lng} 
              onChange={(newLat, newLng, addressDetails) => {
                setLat(newLat);
                setLng(newLng);
                if (addressDetails) {
                  const parts = [addressDetails.road, addressDetails.district, addressDetails.city].filter(Boolean);
                  if (parts.length > 0) {
                    setAlamatPeta(parts.join(", "));
                  }
                }
              }} 
            />

            <span className="absolute bottom-2 left-2 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-mono font-bold text-ink shadow-sm z-10 pointer-events-none">
              Pin: {lat}, {lng}
            </span>
          </div>
          {loadingAddress && <p className="text-[11px] text-brand font-semibold animate-pulse">Mengambil alamat lengkap dari peta...</p>}
        </div>

        <div className="space-y-3 text-xs font-semibold text-ink border-t border-soft/40 pt-3">
          <div>
            <label className="block mb-1 text-ink/70">Alamat Utama dari Peta (Otomatis)</label>
            <Input 
              value={alamatPeta} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAlamatPeta(e.target.value)} 
              required 
              placeholder="Klik peta di atas..." 
              className="h-11 rounded-xl border border-soft bg-surface/50 px-3 text-sm font-medium text-ink focus:bg-white" 
            />
          </div>

          <div>
            <label className="block mb-1 text-ink/70">Detail Nomor Rumah / Blok / Gang (Opsional)</label>
            <Input 
              value={detailRumah} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDetailRumah(e.target.value)} 
              placeholder="Contoh: No. 12B, Gang Gapura Merah, Lantai 2" 
              className="h-11 rounded-xl border border-soft px-3 text-sm text-ink placeholder:text-soft" 
            />
          </div>

          <div>
            <label className="block mb-1 text-brand font-bold">Patokan Khusus Kurir (Sangat Membantu)</label>
            <Input 
              value={patokan} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPatokan(e.target.value)} 
              placeholder="Contoh: Pagar hitam, samping warung madura, cat tembok hijau" 
              className="h-11 rounded-xl border border-brand/40 bg-brand/5 px-3 text-sm text-ink placeholder:text-soft focus:border-brand" 
            />
          </div>
        </div>

        <Button type="submit" className="h-12 w-full rounded-xl bg-brand font-sub text-base font-semibold text-white hover:bg-brand/90 shadow-sm">
          Simpan Lokasi Ini
        </Button>
      </form>
    </div>
  );
}

function ReportSheet({ fisherName, onClose, onSubmit }: { fisherName: string; onClose: () => void; onSubmit: (reason: string) => void }) {
  const [selectedReason, setSelectedReason] = useState("Mengajak transaksi di luar aplikasi");
  const [customNote, setCustomNote] = useState("");

  const templates = [
    "Mengajak transaksi di luar aplikasi",
    "Nelayan tidak responsif / fiktif",
    "Meminta harga di luar sistem JalaLink",
    "Bahasa atau perilaku tidak sopan"
  ];

  const handleSubmit = () => {
    const finalReason = selectedReason === "Lainnya" ? (customNote.trim() || "Lainnya") : `${selectedReason}${customNote ? ` - ${customNote}` : ""}`;
    onSubmit(finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()} className="w-full max-w-md space-y-4 rounded-t-3xl bg-white p-5 sm:rounded-3xl shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-ink">Laporkan Percakapan</h2>
          <button onClick={onClose} className="grid size-10 place-items-center rounded-full border border-soft text-ink" aria-label="Tutup"><X size={18} /></button>
        </div>
        <p className="text-sm text-ink/70">Pilih alasan laporan untuk peninjauan keamanan toko <b>{fisherName}</b>:</p>
        
        <div className="space-y-2">
          {templates.map((tpl) => (
            <button
              key={tpl}
              type="button"
              onClick={() => setSelectedReason(tpl)}
              className={`w-full rounded-xl border p-3 text-left font-sub text-xs font-semibold transition ${
                selectedReason === tpl ? "border-brand bg-brand/10 text-brand" : "border-soft/60 bg-white text-ink hover:bg-surface"
              }`}
            >
              {tpl}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSelectedReason("Lainnya")}
            className={`w-full rounded-xl border p-3 text-left font-sub text-xs font-semibold transition ${
              selectedReason === "Lainnya" ? "border-brand bg-brand/10 text-brand" : "border-soft/60 bg-white text-ink hover:bg-surface"
            }`}
          >
            Lainnya (Tuliskan sendiri)
          </button>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-ink">Detail Laporan (Opsional / Wajib jika Lainnya)</label>
          <textarea 
            value={customNote} 
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomNote(e.target.value)} 
            rows={3} 
            placeholder="Jelaskan kronologi atau alasan detail pelaporan..." 
            className="w-full rounded-xl border border-soft p-3 text-sm text-ink placeholder:text-soft outline-none focus:border-brand" 
          />
        </div>

        <Button onClick={handleSubmit} className="h-12 w-full rounded-xl bg-brand font-sub text-base font-semibold text-white hover:bg-brand/90 shadow-sm">
          Kirim Laporan
        </Button>
      </div>
    </div>
  );
}

function ReviewSheet({ productName, fisherName, onClose, onSubmit }: { productName: string; fisherName: string; onClose: () => void; onSubmit: (rPesanan: number, rToko: number, rKurir: number, note: string, mediaUrl?: string, mediaType?: "image" | "video") => void }) {
  const [rPesanan, setRPesanan] = useState(5);
  const [rToko, setRToko] = useState(5);
  const [rKurir, setRKurir] = useState(5);
  const [note, setNote] = useState("");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVid = file.type.startsWith("video/");
      setMediaType(isVid ? "video" : "image");
      setMediaUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()} className="w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-ink">Beri Ulasan Pesanan</h2>
          <button onClick={onClose} className="grid size-10 place-items-center rounded-full border border-soft text-ink" aria-label="Tutup"><X size={18} /></button>
        </div>
        <p className="text-xs text-ink/70">Penilaianmu membantu meningkatkan kualitas nelayan & kurir JalaLink.</p>
        
        <div className="rounded-2xl bg-surface p-3 space-y-1.5 border border-soft/40">
          <span className="font-sub text-xs font-bold text-ink block">1. Kualitas Pesanan Ikan ({productName})</span>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRPesanan(n)} className="transition hover:scale-110">
                <Star size={26} className={n <= rPesanan ? "fill-brand text-brand" : "text-soft"} />
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-surface p-3 space-y-1.5 border border-soft/40">
          <span className="font-sub text-xs font-bold text-ink block">2. Pelayanan Toko Nelayan ({fisherName})</span>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRToko(n)} className="transition hover:scale-110">
                <Star size={26} className={n <= rToko ? "fill-brand text-brand" : "text-soft"} />
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-surface p-3 space-y-1.5 border border-soft/40">
          <span className="font-sub text-xs font-bold text-ink block">3. Ketepatan & Keramahan Kurir</span>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRKurir(n)} className="transition hover:scale-110">
                <Star size={26} className={n <= rKurir ? "fill-brand text-brand" : "text-soft"} />
              </button>
            ))}
          </div>
        </div>

        <textarea 
          value={note} 
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)} 
          rows={3} 
          placeholder="Ceritakan kesegaran ikan, packing es, atau pengalaman pengiriman..." 
          className="w-full rounded-xl border border-soft p-3 text-sm text-ink placeholder:text-soft outline-none focus:border-brand" 
        />

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-ink">Foto / Video Ulasan (Opsional)</label>
          <div className="flex items-center gap-3">
            <label className="flex h-16 w-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-soft/80 text-soft hover:border-brand hover:text-brand transition">
              <Camera size={18} />
              <span className="text-[10px] mt-0.5 font-semibold">Upload</span>
              <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
            </label>

            {mediaUrl && (
              <div className="relative h-16 w-24 overflow-hidden rounded-xl border border-brand bg-black">
                {mediaType === "video" ? (
                  <video src={mediaUrl} className="h-full w-full object-cover" />
                ) : (
                  <Image src={mediaUrl} alt="Preview Media" fill className="object-cover" />
                )}
                <button onClick={() => setMediaUrl(null)} className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"><X size={12} /></button>
              </div>
            )}
          </div>
        </div>

        <Button onClick={() => { onSubmit(rPesanan, rToko, rKurir, note, mediaUrl || undefined, mediaType); onClose(); }} className="h-12 w-full rounded-xl bg-brand font-sub text-base font-semibold text-white hover:bg-brand/90">
          Kirim Ulasan Lengkap
        </Button>
      </div>
    </div>
  );
}

// Modal Konfirmasi Hapus Akun
function DeleteAccountModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200 space-y-4">
        <div className="flex items-center justify-center size-14 rounded-full bg-red-100 text-red-600 mx-auto">
          <AlertTriangle size={28} />
        </div>
        
        <div className="text-center space-y-1">
          <h3 className="font-heading text-xl font-bold text-ink">Hapus Akun Permanen?</h3>
          <p className="text-xs text-ink/70 leading-relaxed">
            Tindakan ini <b>tidak bisa dibatalkan</b>. Seluruh riwayat pesanan, favorit, dan informasi alamat Anda akan dihapus secara permanen dari platform JalaLink.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={onClose} className="flex-1 h-11 rounded-xl border border-soft text-ink font-bold hover:bg-surface transition">
            Batal
          </Button>
          <Button onClick={onConfirm} className="flex-1 h-11 rounded-xl bg-red-600 font-bold text-white hover:bg-red-700 transition shadow-sm">
            Ya, Hapus Akun
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("home");
  const [listings, setListings] = useState(INIT);
  const [openId, setOpenId] = useState<number | null>(null);
  
  const [selectedFisher, setSelectedFisher] = useState<string | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    nama: "Ushi",
    email: "ushi@email.com",
    phone: "+62 812-3456-7890",
    jalanNo: "Jl. Melati No. 12",
    rt: "",
    rw: "",
    kotaKecamatan: "Jatinangor, Sumedang",
    patokan: "Pagar hitam depan warung kelontong",
    lat: -6.9312,
    lng: 107.7735
  });

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // TIKET BANTUAN FAQ
  const [helpTickets, setHelpTickets] = useState<HelpTicket[]>([
    {
      id: "#TCK-8821",
      topik: "Kendala Pesanan & Ikan",
      subjek: "Pesanan JL-1002 Belum Tiba",
      status: "Sedang Diproses",
      tanggal: "Hari ini",
      messages: [
        { me: true, text: "Halo admin, pesanan JL-1002 statusnya sedang diantar dari pagi tapi belum sampai." },
        { me: false, text: "Halo Ushi! Tim CS kami sedang mengonfirmasi posisi kurir Ahmad di lapangan. Ikan Anda dipastikan tetap aman dalam cold box beres." }
      ]
    }
  ]);

  const [activeTicketChatId, setActiveTicketChatId] = useState<string | null>(null);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [toast, setToast] = useState("");
  const [favs, setFavs] = useState<number[]>([]);
  const [chatWith, setChatWith] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Record<string, Msg[]>>({});
  const [reviewForOrder, setReviewForOrder] = useState<string | null>(null);
  const [isDetailReviewOpen, setIsDetailReviewOpen] = useState(false);

  const fishers = useMemo(() => Array.from(new Map(listings.map((l) => [l.nelayan, { nama: l.nelayan, daerah: l.daerah }])).values()), [listings]);
  const used = Object.values(msgs).flat().filter((m) => m.me).length;

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };
  
  const go = (t: Tab) => { 
    setTab(t); 
    setOpenId(null); 
    setSelectedFisher(null); 
    setChatWith(null); 
    setIsHelpCenterOpen(false);
    setActiveTicketChatId(null);
    window.scrollTo({ top: 0 }); 
  };

  // KELUAR -> DIRECT TO LOGIN
  const handleLogout = () => {
    flash("Berhasil keluar. Mengalihkan ke halaman login...");
    setTimeout(() => {
      router.push("/login");
    }, 800);
  };

  // HAPUS AKUN -> CONFIRM -> DIRECT TO LOGIN
  const handleConfirmDeleteAccount = () => {
    setIsDeleteModalOpen(false);
    flash("Akun Anda berhasil dihapus dari sistem.");
    setTimeout(() => {
      router.push("/login");
    }, 1200);
  };

  const detail = listings.find((l) => l.id === openId);

  const openChat = (nama: string) => { setChatWith(nama); setTab("chat"); setOpenId(null); setSelectedFisher(null); setIsHelpCenterOpen(false); setActiveTicketChatId(null); window.scrollTo({ top: 0 }); };
  const toggleFav = (id: number) => setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  
  const send = (text: string) => {
    if (!chatWith) return;
    const who = chatWith, t = text.toLowerCase();
    setMsgs((m) => ({ ...m, [who]: [...(m[who] ?? []), { me: true, text }] }));
    
    let reply = "Stok aman, silakan langsung pesan lewat aplikasi JalaLink ya demi keamanan dan garansi kesegaran.";
    
    if (t.includes("besok")) {
      reply = "Bisa, besok pagi ikan langsung masuk cold box dan dikirim ke titik kumpul Jatinangor.";
    } else if (t.includes("tangkapan") || t.includes("hari ini")) {
      reply = "Tangkapan subuh ini segar-segar dan berkualitas tinggi, langsung dari perairan lokal siap kirim.";
    } else if (t.includes("stok")) {
      reply = "Stok masih tersedia di aplikasi, silakan diamankan sebelum kehabisan ya.";
    }

    setTimeout(() => setMsgs((m) => ({ ...m, [who]: [...(m[who] ?? []), { me: false, text: reply }] })), 900);
  };

  const sendTicketMsg = (text: string) => {
    if (!activeTicketChatId) return;
    setHelpTickets((prev) => prev.map((t) => {
      if (t.id === activeTicketChatId) {
        return {
          ...t,
          messages: [...t.messages, { me: true, text }]
        };
      }
      return t;
    }));

    setTimeout(() => {
      setHelpTickets((prev) => prev.map((t) => {
        if (t.id === activeTicketChatId) {
          return {
            ...t,
            messages: [...t.messages, { me: false, text: "Terima kasih atas rinciannya. Tim Admin sedang menindaklanjuti tiket ini." }]
          };
        }
        return t;
      }));
    }, 1000);
  };

  const handleCreateTicket = (topik: string, subjek: string, pesan: string) => {
    const newId = `#TCK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: HelpTicket = {
      id: newId,
      topik,
      subjek,
      status: "Sedang Diproses",
      tanggal: "Hari ini",
      messages: [
        { me: true, text: pesan },
        { me: false, text: `Halo ${userProfile.nama}, tiket ${newId} berhasil dibuat. Tim CS JalaLink akan membalas segera.` }
      ]
    };
    setHelpTickets((prev) => [newTicket, ...prev]);
    setActiveTicketChatId(newId);
    flash(`Tiket ${newId} berhasil dibuat`);
  };
  
  const addToCart = (qty: number, langsungBeli: boolean) => {
    if (!detail) return;
    setCartItems((prev) => {
      const exist = prev.find((item) => item.id === detail.id);
      if (exist) {
        return prev.map((item) => item.id === detail.id ? { ...item, qty: item.qty + qty, checked: true } : item);
      }
      return [...prev, { id: detail.id, qty, checked: true }];
    });
    
    if (langsungBeli) {
      setCartOpen(true);
    } else {
      flash(`${qty} kg ${detail.nama} berhasil masuk keranjang`);
    }
  };

  const handleQtyChange = (id: number, qty: number) => {
    setCartItems((prev) => prev.map((item) => item.id === id ? { ...item, qty } : item));
  };

  const handleToggleCheck = (id: number) => {
    setCartItems((prev) => prev.map((item) => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleRemoveItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const checkout = (bayar: Metode, checkedItemsList: { listing: Listing; qty: number }[], totalIkan: number, totalOngkir: number) => {
    const summary = checkedItemsList.map(i => `${i.qty} kg ${i.listing.nama}`).join(", ");
    const itemsDetail: OrderItem[] = checkedItemsList.map(i => ({
      nama: i.listing.nama,
      qty: i.qty,
      harga: i.listing.harga,
      nelayan: i.listing.nelayan,
    }));
    
    setOrders((o) => [{
      no: `JL-${1001 + o.length}`,
      itemsSummary: summary,
      items: itemsDetail,
      totalIkan,
      totalOngkir,
      status: "Sedang Diantar",
      kurirNama: "Ahmad Subagja",
      kurirPlat: "D 4512 AB",
      bayar,
      tanggal: "Hari ini"
    }, ...o]);

    setListings((ls) => ls.map((x) => {
      const found = checkedItemsList.find(c => c.listing.id === x.id);
      return found ? { ...x, stok: x.stok - found.qty } : x;
    }));

    setCartItems((prev) => prev.filter((item) => !item.checked));
    setCartOpen(false); 
    go("pesanan"); 
    flash("Pesanan berhasil dibuat");
  };

  const currentTicket = helpTickets.find((t) => t.id === activeTicketChatId);

  return (
    <div className="min-h-screen bg-white font-body text-ink">
      <TopNav 
        tab={tab} 
        go={go} 
        cartCount={cartItems.length} 
        onCart={() => setCartOpen(true)} 
        user={userProfile} 
        onEditAddress={() => setIsEditAddressOpen(true)}
      />
      {toast && <div className="fixed left-1/2 top-4 z-[60] -translate-x-1/2 rounded-xl bg-ink px-4 py-3 font-sub text-sm font-medium text-white shadow-lg">{toast}</div>}

      {tab === "home" && (
        selectedFisher ? (
          <FisherProfileView 
            fisherName={selectedFisher} 
            listings={listings} 
            onBack={() => setSelectedFisher(null)} 
            onOpenDetail={(id) => { setSelectedFisher(null); setOpenId(id); window.scrollTo({ top: 0 }); }} 
            onChat={() => openChat(selectedFisher)}
          />
        ) : detail ? (
          <DetailView 
            key={detail.id} 
            l={detail} 
            onBack={() => setOpenId(null)} 
            onAdd={addToCart} 
            fav={favs.includes(detail.id)} 
            onFav={() => toggleFav(detail.id)} 
            onChat={() => openChat(detail.nelayan)} 
            onOpenReview={() => setIsDetailReviewOpen(true)}
            onOpenFisher={(fisher) => setSelectedFisher(fisher)}
          />
        ) : (
          <HomeView 
            listings={listings} 
            userName={userProfile.nama}
            onOpen={(id) => { setOpenId(id); window.scrollTo({ top: 0 }); }} 
            onOpenFisher={(fisher) => { setSelectedFisher(fisher); window.scrollTo({ top: 0 }); }}
          />
        )
      )}
      
      {tab === "pesanan" && (
        <PesananView 
          orders={orders} 
          onBrowse={() => go("home")} 
          onReview={setReviewForOrder} 
          onDone={(no) => { setOrders((os) => os.map((o) => (o.no === no ? { ...o, status: "Selesai" } : o))); setReviewForOrder(no); }} 
        />
      )}

      {tab === "chat" && (chatWith
        ? <ChatRoom 
            key={chatWith} 
            nama={chatWith} 
            daerah={fishers.find((f) => f.nama === chatWith)?.daerah ?? ""} 
            msgs={msgs[chatWith] ?? []} 
            used={used} 
            onSend={send} 
            onBack={() => setChatWith(null)} 
            onReport={(reason) => flash(`Laporan terkirim: "${reason}". Tim JalaLink akan meninjau.`)} 
          />
        : <ChatList fishers={fishers} msgs={msgs} onOpen={openChat} />)}

      {tab === "akun" && (
        activeTicketChatId && currentTicket ? (
          <ChatRoom 
            nama={`Admin JalaLink (${currentTicket.id})`}
            daerah={currentTicket.topik}
            msgs={currentTicket.messages}
            used={0}
            onSend={sendTicketMsg}
            onBack={() => setActiveTicketChatId(null)}
            isAdmin={true}
          />
        ) : isHelpCenterOpen ? (
          <HelpCenterView 
            onBack={() => setIsHelpCenterOpen(false)} 
            tickets={helpTickets}
            onCreateTicket={handleCreateTicket}
            onOpenTicketChat={(tId) => setActiveTicketChatId(tId)}
          />
        ) : (
          <AkunView 
            user={userProfile}
            favs={listings.filter((l) => favs.includes(l.id))} 
            onOpen={(id) => { setTab("home"); setOpenId(id); window.scrollTo({ top: 0 }); }} 
            onOpenFisher={(fisher) => { setTab("home"); setSelectedFisher(fisher); window.scrollTo({ top: 0 }); }}
            onEditProfile={() => setIsEditProfileOpen(true)}
            onEditAddress={() => setIsEditAddressOpen(true)}
            onHelp={() => setIsHelpCenterOpen(true)}
            onLogout={handleLogout}
            onDeleteAccount={() => setIsDeleteModalOpen(true)}
          />
        )
      )}

      {!(tab === "home" && (detail || selectedFisher)) && !(tab === "chat" && chatWith) && !(tab === "akun" && activeTicketChatId) && <BottomNav tab={tab} go={go} />}
      
      {isEditProfileOpen && (
        <EditProfileSheet 
          user={userProfile} 
          onClose={() => setIsEditProfileOpen(false)} 
          onSave={(updated) => {
            setUserProfile(updated);
            flash("Profil berhasil diperbarui");
          }} 
        />
      )}

      {isEditAddressOpen && (
        <EditAddressSheet 
          user={userProfile}
          onClose={() => setIsEditAddressOpen(false)} 
          onSave={(updatedFields) => {
            setUserProfile((prev) => ({ ...prev, ...updatedFields }));
            flash("Alamat pengiriman & titik lokasi berhasil diperbarui");
          }} 
        />
      )}

      {isDeleteModalOpen && (
        <DeleteAccountModal 
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDeleteAccount}
        />
      )}

      {isDetailReviewOpen && detail && (
        <ReviewSheet 
          productName={detail.nama} 
          fisherName={detail.nelayan} 
          onClose={() => setIsDetailReviewOpen(false)} 
          onSubmit={(rPesanan, rToko, rKurir, note, mediaUrl, mediaType) => {
            const newRev: ReviewItem = { id: Date.now(), user: userProfile.nama, rating: rPesanan, date: "Baru saja", comment: note, mediaUrl, mediaType };
            setListings((ls) => ls.map((x) => x.id === detail.id ? { ...x, rating: Number(((x.rating * x.ulasanCount + rPesanan) / (x.ulasanCount + 1)).toFixed(1)), ulasanCount: x.ulasanCount + 1, reviews: [newRev, ...x.reviews] } : x));
            flash("Terima kasih! Ulasanmu berhasil dikirim.");
          }} 
        />
      )}

      {reviewForOrder && (
        <ReviewSheet 
          productName={orders.find((o) => o.no === reviewForOrder)?.itemsSummary ?? "Ikan"} 
          fisherName={orders.find((o) => o.no === reviewForOrder)?.items[0]?.nelayan ?? "Nelayan"} 
          onClose={() => setReviewForOrder(null)} 
          onSubmit={(rPesanan, rToko, rKurir) => {
            setOrders((os) => os.map((o) => (o.no === reviewForOrder ? { ...o, ratingPesanan: rPesanan, ratingToko: rToko, ratingKurir: rKurir } : o)));
            flash("Terima kasih atas ulasan lengkapmu!");
          }} 
        />
      )}

      <CartSheet 
        open={cartOpen} 
        onClose={() => setCartOpen(false)} 
        cartItems={cartItems} 
        listings={listings}
        userAddress={`${userProfile.jalanNo}, ${userProfile.kotaKecamatan}`}
        onQtyChange={handleQtyChange}
        onToggleCheck={handleToggleCheck}
        onRemoveItem={handleRemoveItem}
        onCheckout={checkout} 
      />
    </div>
  );
}