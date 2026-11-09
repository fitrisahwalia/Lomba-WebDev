"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Fish,
  Truck,
  ShoppingCart,
  ShieldCheck,
  Snowflake,
  Wallet,
  Users,
  Store,
  MessageCircle,
  Camera,
  MapPin,
  ChevronDown,
  ArrowRight,
  Check,
  Menu,
  X,
  Send,
  BadgeCheck,
  PackageCheck,
  Clock,
  Search,
  Scale,
} from "lucide-react";

const PERAN = [
  {
    k: "pembeli",
    label: "Pembeli",
    desc: "Restoran, katering, warung makan, atau rumah tangga.",
    Icon: ShoppingCart,
    langkah: ["Daftar dengan email", "Langsung belanja ikan segar"],
  },
  {
    k: "nelayan",
    label: "Nelayan",
    desc: "Nelayan kecil atau pengepul di satu titik kumpul.",
    Icon: Fish,
    langkah: [
      "Daftar dan isi data titik kumpul",
      "Diverifikasi admin JalaLink",
      "Tautkan Telegram, mulai jual",
    ],
  },
  {
    k: "transport",
    label: "Mitra Transport",
    desc: "Pemilik truk atau pickup berpendingin, atau ekspedisi lokal.",
    Icon: Truck,
    langkah: [
      "Ajukan kemitraan sebagai admin transport",
      "Ditinjau dan disetujui admin JalaLink",
      "Buat akun kurir dan supir untuk timmu",
    ],
  },
] as const;

const NAV = [
  ["tentang", "Tentang"],
  ["cara", "Cara Kerja"],
  ["partai", "Belanja"],
  ["keunggulan", "Keunggulan"],
  ["nelayan", "Untuk Nelayan"],
  ["mitra", "Mitra"],
] as const;

const CARA = [
  {
    Icon: Search,
    t: "Pilih ikan",
    d: "Telusuri katalog ikan tangkapan nelayan lokal, lengkap dengan foto, harga, dan estimasi ongkir.",
  },
  {
    Icon: Clock,
    t: "Pre-order hari ini",
    d: "Ikan yang kamu pesan hari ini adalah hasil tangkapan subuh besok, jadi tidak ada stok yang mengendap.",
  },
  {
    Icon: Truck,
    t: "Dijemput cold chain",
    d: "Truk berpendingin menjemput di titik kumpul nelayan dan membawanya ke hub di kotamu.",
  },
  {
    Icon: PackageCheck,
    t: "Diantar ke tujuan",
    d: "Armada tiba di hub pagi hari, lalu kurir area mengantar ke alamatmu. Konfirmasi saat diterima.",
  },
];

const PARTAI = [
  {
    Icon: ShoppingCart,
    t: "Rumah tangga",
    s: "Mulai 1–3 kg per jenis ikan",
    d: "Beli secukupnya untuk keluarga. Tanpa perlu ke pasar subuh-subuh.",
  },
  {
    Icon: Store,
    t: "Warung dan katering",
    s: "Puluhan kilogram per pesanan",
    d: "Stok rutin tiap minggu dengan harga langsung dari nelayan dan chat langsung untuk bertanya.",
  },
  {
    Icon: Scale,
    t: "Restoran dan grosir",
    s: "Partai besar",
    d: "Makin banyak kilogram, ongkir per kilogram makin murah lewat diskon volume otomatis.",
  },
];

const UNGGUL = [
  {
    Icon: Snowflake,
    t: "Segar sampai tujuan",
    d: "Tangkapan subuh, langsung masuk kotak es dan dikirim dengan cold chain.",
  },
  {
    Icon: Wallet,
    t: "Harga adil",
    d: "Dibeli langsung dari nelayan, tanpa rantai perantara yang panjang.",
  },
  {
    Icon: Truck,
    t: "Ongkir hemat",
    d: "Pengiriman digabung per rute, jadi biaya kirim dibagi bersama.",
  },
  {
    Icon: BadgeCheck,
    t: "Terverifikasi",
    d: "Nelayan diverifikasi admin, dan listing berlabel terverifikasi foto.",
  },
  {
    Icon: ShieldCheck,
    t: "Transaksi aman",
    d: "Bayar lewat QRIS atau transfer, ada garansi dan fitur laporan jika bermasalah.",
  },
  {
    Icon: MessageCircle,
    t: "Transparan",
    d: "Rating, review, dan chat dengan nelayan tanpa perlu menukar nomor pribadi.",
  },
];

const NELAYAN = [
  {
    Icon: Send,
    t: "Jual lewat Telegram",
    d: "Cukup chat dengan bot: pilih ikan, jumlah, harga, foto, lalu konfirmasi. Tidak perlu aplikasi rumit.",
  },
  {
    Icon: Users,
    t: "Pembeli sudah menunggu",
    d: "Sistem pre-order membuatmu tahu kebutuhan sebelum melaut, jadi ikan tidak terbuang.",
  },
  {
    Icon: Truck,
    t: "Tidak urus pengiriman",
    d: "Cukup antar ke titik kumpul. Truk mitra yang menjemput dan mengantar ke pembeli.",
  },
  {
    Icon: ShieldCheck,
    t: "Privasi terjaga",
    d: "Nomor dan akun Telegrammu tidak tampil ke pembeli. Ada tombol blokir dan laporkan.",
  },
  {
    Icon: Camera,
    t: "Profil dan stok di web",
    d: "Pantau stok, harga, pesanan masuk, dan rating tokomu dari dashboard web.",
  },
];

const FAQ = [
  [
    "Berapa minimal pembelian?",
    "Minimal berbeda untuk tiap ikan, umumnya 1–3 kg per jenis. Detailnya tertera di halaman setiap ikan.",
  ],
  [
    "Bagaimana kesegaran ikan dijaga?",
    "Ikan dari tangkapan subuh langsung dimasukkan ke kotak es dan diangkut truk berpendingin. Jika tidak segar, kamu bisa melapor dengan foto atau video pembukaan paket.",
  ],
  [
    "Metode pembayarannya apa saja?",
    "QRIS dan transfer bank. Pembayaran di tempat (COD) tidak tersedia.",
  ],
  [
    "Apakah nelayan harus punya smartphone canggih?",
    "Tidak. Cukup Telegram untuk menjual ikan lewat bot, dan akun nelayan diverifikasi oleh admin JalaLink.",
  ],
  [
    "Saya kurir atau supir, bagaimana cara bergabung?",
    "Ajukan lamaran ke admin transport mitra. Admin transport yang akan membuatkan akunmu setelah kamu disetujui.",
  ],
];

function Logo() {
  return (
    <Image
      src="/logo.png"
      alt="JalaLink"
      width={110}
      height={36}
      className="object-contain"
      priority
    />
  );
}

const wrap = "mx-auto max-w-6xl px-4";
const h2 = "font-heading text-3xl font-bold text-ink md:text-4xl";
const pri =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 font-sub text-base font-semibold text-white transition hover:bg-brand/90";
const out =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-brand bg-white px-6 font-sub text-base font-semibold text-brand transition hover:bg-surface";

export default function HomePage() {
  const [menu, setMenu] = useState(false);
  const [daftar, setDaftar] = useState(false);

  const go = (id: string) => {
    setMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const DaftarList = () => (
    <ul className="space-y-1">
      {PERAN.map(({ k, label, desc, Icon }) => (
        <li key={k}>
          <Link
            href={`/daftar?peran=${k}`}
            className="flex items-start gap-3 rounded-xl p-3 hover:bg-surface"
          >
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
              <Icon size={18} />
            </span>
            <span>
              <b className="block font-sub text-sm text-ink">
                Daftar sebagai {label}
              </b>
              <span className="text-xs text-ink/60">{desc}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="min-h-screen bg-white font-body text-ink">
      {/* header */}
      <header className="sticky top-0 z-40 border-b border-soft/40 bg-white/90 backdrop-blur">
        <div className={`${wrap} flex h-16 items-center justify-between`}>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Ke atas"
          >
            <Logo />
          </button>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map(([id, l]) => (
              <button
                key={id}
                onClick={() => go(id)}
                className="rounded-full px-3 py-2 font-sub text-sm font-semibold text-ink hover:bg-surface"
              >
                {l}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex h-10 items-center rounded-full border border-brand px-5 font-sub text-sm font-semibold text-brand hover:bg-surface"
            >
              Masuk
            </Link>
            <div className="relative hidden sm:block">
              <button
                onClick={() => setDaftar(!daftar)}
                aria-expanded={daftar}
                className="inline-flex h-10 items-center gap-1 rounded-full bg-brand px-5 font-sub text-sm font-semibold text-white hover:bg-brand/90"
              >
                Daftar
                <ChevronDown
                  size={16}
                  className={daftar ? "rotate-180" : ""}
                />
              </button>
              {daftar && (
                <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-soft/40 bg-white p-2 shadow-xl">
                  <DaftarList />
                </div>
              )}
            </div>
            <button
              onClick={() => setMenu(!menu)}
              className="grid size-10 place-items-center rounded-full hover:bg-surface lg:hidden"
              aria-label="Menu"
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {menu && (
          <div className="space-y-2 border-t border-soft/30 bg-white px-4 pb-4 lg:hidden">
            {NAV.map(([id, l]) => (
              <button
                key={id}
                onClick={() => go(id)}
                className="block w-full rounded-xl px-3 py-3 text-left font-sub font-semibold hover:bg-surface"
              >
                {l}
              </button>
            ))}
            <p className="px-3 pt-2 font-sub text-xs font-bold uppercase text-ink/50">
              Daftar
            </p>
            <DaftarList />
          </div>
        )}
      </header>

      {/* hero */}
      <section
        className={`${wrap} grid items-center gap-10 py-12 md:py-20 lg:grid-cols-2`}
      >
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-4 py-1.5 font-sub text-sm font-semibold text-brand">
            <Fish size={16} />
            Marketplace ikan nelayan lokal
          </span>
          <h1 className="font-heading text-4xl font-bold leading-tight text-ink md:text-6xl">
            Ikan segar, langsung dari nelayan ke dapurmu.
          </h1>
          <p className="max-w-xl font-sub text-lg text-ink/70">
            JalaLink menghubungkan nelayan kecil dengan pembeli, dari rumah
            tangga sampai restoran, lewat pre-order tangkapan subuh dan
            pengiriman cold chain gabungan.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/katalog" className={pri}>
              Mulai Belanja
              <ArrowRight size={18} />
            </Link>
            <button onClick={() => go("nelayan")} className={out}>
              Saya Nelayan
            </button>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 font-sub text-sm font-semibold text-ink/70">
            {["Pre-order next day", "Cold chain", "Mulai dari 1 kg"].map(
              (x) => (
                <li key={x} className="flex items-center gap-1.5">
                  <Check size={16} className="text-brand" />
                  {x}
                </li>
              )
            )}
          </ul>
        </div>
        <div className="relative">
          <div className="grid aspect-[5/4] place-items-center overflow-hidden rounded-[2rem] bg-brand">
            <svg viewBox="0 0 120 70" className="w-4/5" aria-hidden>
              <ellipse cx="55" cy="36" rx="40" ry="20" fill="#E6F2F8" />
              <path d="M92 36 L116 18 L116 54 Z" fill="#CFE6F1" />
              <path d="M40 18 L58 6 L66 20 Z" fill="#CFE6F1" />
              <path
                d="M28 33 Q55 26 85 33 M28 40 Q55 33 85 40"
                stroke="#7FB5CF"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="30" cy="30" r="4.5" fill="#1D1D1F" />
            </svg>
          </div>
          <div className="absolute -bottom-4 left-4 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-lg">
            <BadgeCheck className="text-brand" />
            <span className="font-sub text-sm font-bold">
              Terverifikasi foto
            </span>
          </div>
          <div className="absolute -top-4 right-4 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-lg">
            <Snowflake className="text-brand" />
            <span className="font-sub text-sm font-bold">Cold chain</span>
          </div>
        </div>
      </section>

      {/* tentang */}
      <section id="tentang" className="scroll-mt-20 bg-surface py-16">
        <div className={`${wrap} grid gap-8 lg:grid-cols-2`}>
          <div className="space-y-4">
            <h2 className={h2}>Apa itu JalaLink?</h2>
            <p className="font-sub text-lg text-ink/70">
              JalaLink adalah platform yang mempertemukan nelayan lokal dengan
              pembeli secara langsung. Nelayan menjual lewat Telegram, pembeli
              memesan lewat web, dan armada mitra membawa ikan dengan
              pengiriman gabungan sehingga lebih segar dan lebih murah.
            </p>
          </div>
          <ul className="space-y-3">
            {[
              [
                Fish,
                "Menghubungkan",
                "Nelayan dan pembeli bertransaksi langsung tanpa perantara berlapis.",
              ],
              [
                Truck,
                "Mengirim bersama",
                "Pesanan satu rute digabung dalam satu truk berpendingin.",
              ],
              [
                ShieldCheck,
                "Menjaga kepercayaan",
                "Verifikasi, review, garansi kesegaran, dan tim admin yang siap membantu.",
              ],
            ].map(([I, t, d]) => {
              const Icon = I as typeof Fish;
              return (
                <li
                  key={t as string}
                  className="flex gap-4 rounded-2xl bg-white p-4"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-white">
                    <Icon size={20} />
                  </span>
                  <div>
                    <p className="font-heading text-lg font-bold">
                      {t as string}
                    </p>
                    <p className="text-sm text-ink/70">{d as string}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* cara kerja */}
      <section id="cara" className={`${wrap} scroll-mt-20 py-16`}>
        <h2 className={`${h2} mb-8`}>Cara kerjanya</h2>
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {CARA.map(({ Icon, t, d }, i) => (
            <li key={t} className="relative rounded-2xl bg-surface p-5">
              <span className="absolute right-4 top-4 font-heading text-4xl font-bold text-brand/15">
                {i + 1}
              </span>
              <span className="mb-3 grid size-11 place-items-center rounded-full bg-brand text-white">
                <Icon size={20} />
              </span>
              <p className="font-heading text-lg font-bold">{t}</p>
              <p className="mt-1 text-sm text-ink/70">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* partai kecil - besar */}
      <section id="partai" className="scroll-mt-20 bg-surface py-16">
        <div className={wrap}>
          <h2 className={h2}>Belanja dari partai kecil sampai besar</h2>
          <p className="mb-8 mt-2 max-w-2xl font-sub text-lg text-ink/70">
            Satu platform untuk semua kebutuhan, dari beberapa kilo untuk dapur
            rumah sampai pasokan rutin untuk restoran.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {PARTAI.map(({ Icon, t, s, d }) => (
              <div key={t} className="rounded-2xl bg-white p-6">
                <Icon className="mb-3 text-brand" size={28} />
                <p className="font-heading text-xl font-bold">{t}</p>
                <p className="mb-2 font-sub text-sm font-semibold text-brand">
                  {s}
                </p>
                <p className="text-sm text-ink/70">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* keunggulan */}
      <section id="keunggulan" className={`${wrap} scroll-mt-20 py-16`}>
        <h2 className={`${h2} mb-8`}>Kenapa JalaLink?</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {UNGGUL.map(({ Icon, t, d }) => (
            <div
              key={t}
              className="rounded-2xl border border-soft/40 p-5 transition hover:shadow-md"
            >
              <span className="mb-3 grid size-11 place-items-center rounded-full bg-brand/10 text-brand">
                <Icon size={22} />
              </span>
              <p className="font-heading text-lg font-bold">{t}</p>
              <p className="mt-1 text-sm text-ink/70">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* untuk nelayan */}
      <section id="nelayan" className="scroll-mt-20 bg-brand py-16 text-white">
        <div className={`${wrap} grid gap-10 lg:grid-cols-[1fr_1.2fr]`}>
          <div className="space-y-4">
            <h2 className="font-heading text-3xl font-bold md:text-4xl">
              Untuk nelayan: jual lebih mudah, untung lebih adil.
            </h2>
            <p className="font-sub text-lg text-white/85">
              Fokus melaut dan menangkap ikan. Urusan pembeli, pengiriman, dan
              pembayaran dibantu JalaLink.
            </p>
            <Link
              href="/daftar?peran=nelayan"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 font-sub text-base font-semibold text-brand hover:bg-surface"
            >
              Daftar Sebagai Nelayan
              <ArrowRight size={18} />
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {NELAYAN.map(({ Icon, t, d }) => (
              <li key={t} className="rounded-2xl bg-white/10 p-4">
                <Icon size={22} className="mb-2" />
                <p className="font-heading text-lg font-bold">{t}</p>
                <p className="text-sm text-white/85">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* mitra transport + daftar */}
      <section id="mitra" className={`${wrap} scroll-mt-20 py-16`}>
        <h2 className={h2}>Bergabung bersama JalaLink</h2>
        <p className="mb-8 mt-2 max-w-2xl font-sub text-lg text-ink/70">
          Pilih peranmu. Akun nelayan dan mitra transport ditinjau dulu oleh
          admin JalaLink demi keamanan semua pihak.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {PERAN.map(({ k, label, desc, Icon, langkah }) => (
            <div key={k} className="flex flex-col rounded-3xl bg-surface p-6">
              <span className="mb-3 grid size-12 place-items-center rounded-full bg-brand text-white">
                <Icon size={22} />
              </span>
              <h3 className="font-heading text-xl font-bold">{label}</h3>
              <p className="mb-4 text-sm text-ink/70">{desc}</p>
              <ol className="mb-6 flex-1 space-y-2">
                {langkah.map((l, i) => (
                  <li key={l} className="flex gap-3 text-sm">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand font-sub text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    {l}
                  </li>
                ))}
              </ol>
              <Link href={`/daftar?peran=${k}`} className={pri}>
                Daftar {label}
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-brand/30 bg-brand/5 p-4 text-sm text-ink/80">
          <MapPin className="mt-0.5 shrink-0 text-brand" size={18} />
          <p>
            <b className="font-sub text-ink">Kurir dan supir?</b> Kamu tidak
            mendaftar di sini. Ajukan lamaran ke admin transport mitra; setelah
            disetujui, admin transport yang membuatkan akunmu.
          </p>
        </div>
      </section>

      {/* faq */}
      <section className="bg-surface py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className={`${h2} mb-6 text-center`}>Pertanyaan umum</h2>
          <div className="space-y-3">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group rounded-2xl bg-white p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-sub font-bold">
                  {q}
                  <ChevronDown
                    size={18}
                    className="shrink-0 text-brand transition group-open:rotate-180"
                  />
                </summary>
                <p className="mt-2 text-sm text-ink/70">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* cta + footer */}
      <section className={`${wrap} py-16`}>
        <div className="rounded-[2rem] bg-brand p-8 text-center text-white md:p-12">
          <h2 className="font-heading text-3xl font-bold md:text-4xl">
            Siap merasakan ikan segar dari nelayan lokal?
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/katalog"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 font-sub font-semibold text-brand hover:bg-surface"
            >
              Lihat Katalog
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center rounded-xl border border-white px-6 font-sub font-semibold text-white hover:bg-white/10"
            >
              Masuk ke Akun
            </Link>
          </div>
        </div>
      </section>
      <footer className="border-t border-soft/40 py-8">
        <div
          className={`${wrap} flex flex-wrap items-center justify-between gap-4`}
        >
          <Logo />
          <nav className="flex gap-4 font-sub text-sm font-semibold text-ink/70">
            <Link href="/katalog" className="hover:text-brand">
              Katalog
            </Link>
            <Link href="/login" className="hover:text-brand">
              Masuk
            </Link>
            <Link href="/daftar?peran=pembeli" className="hover:text-brand">
              Daftar
            </Link>
          </nav>
          <p className="text-xs text-ink/60">
            © JalaLink. Ikan segar dari nelayan lokal.
          </p>
        </div>
      </footer>
    </div>
  );
}