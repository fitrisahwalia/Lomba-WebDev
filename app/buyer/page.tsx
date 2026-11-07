"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  Search,
  ShoppingCart,
  MessageCircle,
  User,
  MapPin,
  Star,
  Plus,
  Minus,
  Check,
  ChevronRight,
  Filter,
  ArrowRight,
} from "lucide-react";

// Inisialisasi Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kewjzlhgrkacyrjlboaa.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_1ygn0KH_eqk53JVTLib-gQ_NfcJyZNm"
);

type Tab = "katalog" | "toko" | "pesanan" | "chat" | "akun";

type Ikan = {
  id: number;
  nama: string;
  nelayan: string;
  lokasi: string;
  harga: number;
  stok: number;
  min: number;
  habis: boolean;
  rating: number;
  terjual: number;
  foto: string;
};

const IKAN0: Ikan[] = [
  {
    id: 1,
    nama: "Kakap Merah Segar",
    nelayan: "Pak Wayan",
    lokasi: "Cilacap",
    harga: 65000,
    stok: 100,
    min: 1,
    habis: false,
    rating: 4.9,
    terjual: 230,
    foto: "/kakap.jpg",
  },
  {
    id: 2,
    nama: "Cumi-cumi Sero",
    nelayan: "Pak Wayan",
    lokasi: "Cilacap",
    harga: 62000,
    stok: 55,
    min: 1,
    habis: false,
    rating: 4.8,
    terjual: 180,
    foto: "/cumi.jpg",
  },
  {
    id: 3,
    nama: "Kerapu Macan Live",
    nelayan: "Pak Wayan",
    lokasi: "Cilacap",
    harga: 135000,
    stok: 30,
    min: 1,
    habis: false,
    rating: 5.0,
    terjual: 95,
    foto: "/kerapu.jpg",
  },
];

const rp = (n: number) => "Rp" + n.toLocaleString("id-ID");

export default function BuyerPage() {
  const [tab, setTab] = useState<Tab>("katalog");
  const [ikan, setIkan] = useState<Ikan[]>(IKAN0);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<{ [id: number]: number }>({});
  const [toast, setToast] = useState("");

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 3000);
  };

  // --- AMBIL DATA KATALOG DARI SUPABASE DATABASE ---
  useEffect(() => {
    async function fetchListingReal() {
      try {
        const res = await fetch("/api/listing");
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          const listIkan = data.map((item: any) => ({
            id: item.id,
            nama: item.ikan?.nama_baku || "Ikan Tangkapan",
            nelayan: item.nelayan?.nama || "Pengepul Cilacap",
            lokasi: item.nelayan?.daerah || "Cilacap",
            harga: item.harga_per_kg,
            stok: item.stok_kg,
            min: 1,
            habis: item.status === "habis",
            rating: 4.8,
            terjual: 120,
            foto: item.foto_url || "/kakap.jpg",
          }));
          setIkan(listIkan);
        }
      } catch (err) {
        console.error("Gagal mengambil katalog dari Supabase:", err);
      }
    }
    fetchListingReal();
  }, []);

  const updateCart = (id: number, delta: number) => {
    setCart((prev) => {
      const cur = prev[id] || 0;
      const next = cur + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const totalCartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const filteredIkan = ikan.filter((item) =>
    item.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface font-body text-ink pb-24 md:pb-10">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-soft/40 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="JalaLink"
              width={110}
              height={36}
              className="object-contain"
            />
          </Link>
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-soft"
              />
              <input
                type="text"
                placeholder="Cari ikan segar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-full border border-soft bg-surface pl-10 pr-4 text-sm outline-none focus:border-brand"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => flash("Fitur keranjang dibuka")}
              className="relative p-2 text-ink hover:text-brand"
            >
              <ShoppingCart size={22} />
              {totalCartCount > 0 && (
                <span className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-brand text-[10px] font-bold text-white">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notifikasi */}
      {toast && (
        <div className="fixed left-1/2 top-4 z-[60] -translate-x-1/2 rounded-xl bg-ink px-4 py-3 font-sub text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Katalog Ikan Segar</h1>
            <p className="text-sm text-ink/60">
              Langsung dari nelayan dan pengepul lokal terpercaya.
            </p>
          </div>
        </div>

        {/* List Grid Katalog */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredIkan.map((item) => {
            const qty = cart[item.id] || 0;
            return (
              <div
                key={item.id}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-soft/50 bg-white p-4 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">
                        <MapPin size={12} /> {item.lokasi}
                      </span>
                      <h3 className="mt-2 font-heading text-lg font-bold">
                        {item.nama}
                      </h3>
                      <p className="text-xs text-ink/60">Oleh {item.nelayan}</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star size={14} className="fill-amber-400" /> {item.rating}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-2">
                    <div>
                      <p className="font-heading text-xl font-bold text-brand">
                        {rp(item.harga)}
                        <span className="text-xs font-normal text-ink/60">/kg</span>
                      </p>
                      <p className="text-xs text-ink/60">Stok: {item.stok} kg</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-soft/30">
                  {qty > 0 ? (
                    <div className="flex items-center justify-between rounded-xl bg-surface p-1">
                      <button
                        onClick={() => updateCart(item.id, -1)}
                        className="grid size-9 place-items-center rounded-lg bg-white text-ink shadow-sm hover:bg-gray-50"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-sub text-sm font-bold">{qty} kg</span>
                      <button
                        onClick={() => updateCart(item.id, 1)}
                        className="grid size-9 place-items-center rounded-lg bg-brand text-white shadow-sm hover:bg-brand/90"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      disabled={item.habis}
                      onClick={() => updateCart(item.id, 1)}
                      className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand font-sub text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-50"
                    >
                      <Plus size={16} /> Beli Sekarang
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}