"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Home,
  Fish as FishIcon,
  MessageCircle,
  Send,
  User,
  MapPin,
  BadgeCheck,
  Copy,
  Ban,
  Flag,
  ChevronLeft,
  Unlink,
  Check,
  Bell,
  RefreshCw,
  Star,
  X,
  Wallet,
  ArrowUpRight,
  Truck,
  CheckCircle2,
  Clock,
  PackageCheck,
  MessageSquare,
  AlertCircle,
  ShieldCheck,
  Info,
  ShoppingCart
} from "lucide-react";

const rp = (n: number) => "Rp" + n.toLocaleString("id-ID");
const now = () =>
  new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

type Tab = "home" | "stok" | "chat" | "telegram" | "akun";

type ReviewIkan = {
  id: number;
  pembeli: string;
  rating: number;
  tanggal: string;
  komentar: string;
};

type Ikan = {
  id: number;
  nama: string;
  harga: number;
  stok: number;
  habis: boolean;
  sumber: "Telegram" | "Admin" | "Web";
  waktu: string;
  rating: number;
  totalUlasan: number;
  reviews: ReviewIkan[];
};

type StatusPesanan = "Sedang Siap / Menunggu Mendarat" | "Menunggu Kurir" | "Sedang Diantar" | "Selesai";

type PesananMasuk = {
  no: string;
  teks: string;
  pembeli: string;
  titik: string;
  jadwal: string;
  totalHargaIkan: number; // Murni Penjualan Ikan (Gross Nelayan)
  totalOngkirTransport: number; // Terpisah - Langsung Masuk ke Admin Transport
  status: StatusPesanan;
};

type Msg = { me: boolean; text: string };
type Conv = {
  id: number;
  pembeli: string;
  topik: string;
  unread: number;
  blocked: boolean;
  alasanBlokir?: string;
  msgs: Msg[];
};
type Log = { t: string; teks: string };

// KETENTUAN POTONGAN RESMI PLATFORM & HUKUM PERPAJAKAN INDONESIA
const PLATFORM_FEE_PERCENT = 0.10; // 10% Biaya Layanan JalaLink
const PAJAK_PPH_PERCENT = 0.005;   // 0.5% PPh Final UMKM Perikanan
const BIAYA_TRANSFER_BANK = 2500;  // Rp2.500 Biaya BI-FAST

// FUNGSI HITUNG SALDO BERSIH NELAYAN
const calculateNelayanIncome = (grossIkan: number) => {
  const platformFee = Math.round(grossIkan * PLATFORM_FEE_PERCENT);
  const pajakPph = Math.round(grossIkan * PAJAK_PPH_PERCENT);
  const net = grossIkan - platformFee - pajakPph;
  return { grossIkan, platformFee, pajakPph, net: Math.max(0, net) };
};

const REVIEWS_SAMPLE: Record<number, ReviewIkan[]> = {
  1: [
    { id: 101, pembeli: "Ushi", rating: 5, tanggal: "Hari ini", komentar: "Kakap merahnya sangat segar, esnya tebal dan tidak berbau amis." },
    { id: 102, pembeli: "Budi S.", rating: 4, tanggal: "Kemarin", komentar: "Ukuran lumayan besar dan memuaskan." }
  ],
  2: [
    { id: 201, pembeli: "Warung Bu Tini", rating: 5, tanggal: "2 hari lalu", komentar: "Cumi-cumi manis dan kenyal, mantap untuk resto." }
  ]
};

const IKAN0: Ikan[] = [
  { id: 1, nama: "Kakap Merah", harga: 65000, stok: 100, habis: false, sumber: "Admin", waktu: "05.30", rating: 4.8, totalUlasan: 24, reviews: REVIEWS_SAMPLE[1] || [] },
  { id: 2, nama: "Cumi-cumi", harga: 62000, stok: 55, habis: false, sumber: "Admin", waktu: "05.05", rating: 4.9, totalUlasan: 18, reviews: REVIEWS_SAMPLE[2] || [] },
  { id: 3, nama: "Kerapu Macan", harga: 135000, stok: 30, habis: false, sumber: "Admin", waktu: "04.50", rating: 4.7, totalUlasan: 12, reviews: [] },
  { id: 4, nama: "Selar Kuning", harga: 34000, stok: 0, habis: true, sumber: "Admin", waktu: "Kemarin", rating: 4.5, totalUlasan: 8, reviews: [] },
];

const PESANAN_INITIAL: PesananMasuk[] = [
  { no: "JL-1002", teks: "2 kg Kakap Merah", pembeli: "Ushi", titik: "Hub Jatinangor", jadwal: "Besok 07.00 - 10.00 WIB", totalHargaIkan: 130000, totalOngkirTransport: 15000, status: "Sedang Siap / Menunggu Mendarat" },
  { no: "JL-1001", teks: "2 kg Tongkol Segar", pembeli: "Pak Budi", titik: "Hub Jatinangor", jadwal: "Kemarin, 08.30 WIB", totalHargaIkan: 64000, totalOngkirTransport: 8000, status: "Selesai" },
  { no: "JL-1006", teks: "4 kg Kakap Merah", pembeli: "Resto Laut Biru", titik: "Hub Sumedang", jadwal: "Besok 07.30 WIB", totalHargaIkan: 260000, totalOngkirTransport: 20000, status: "Menunggu Kurir" },
];

const CONV0: Conv[] = [
  { id: 1, pembeli: "Ushi", topik: "Kakap Merah", unread: 1, blocked: false, msgs: [{ me: false, text: "Pak, kakap merahnya masih ada?" }] },
  { id: 2, pembeli: "Resto Laut Biru", topik: "Kerapu Macan", unread: 0, blocked: false, msgs: [{ me: false, text: "Bisa kirim besok?" }, { me: true, text: "Bisa, besok pagi saya siapkan." }] },
  { id: 3, pembeli: "Warung Bu Tini", topik: "Cumi-cumi", unread: 2, blocked: false, msgs: [{ me: false, text: "Cumi-cumi 8 kg harganya bisa kurang?" }, { me: false, text: "Kalau langganan tiap minggu gimana?" }] },
];

const SIM: [string, number, number][] = [
  ["Tongkol Segar", 32000, 40],
  ["Kembung", 28000, 60],
  ["Tenggiri", 72000, 25],
];
const QUICK = ["Masih ada", "Habis", "Besok bisa"];

const ALASAN_BLOKIR = [
  "Penawaran harga tidak masuk akal / Sadis",
  "Spam / Chat bertubi-tubi tidak sopan",
  "Sudah janji beli tapi tidak ada kejelasan",
  "Terindikasi penipuan / Akun fiktif",
  "Lainnya",
];

const ALASAN_LAPOR = [
  "Pembeli meminta transaksi di luar platform",
  "Bahasa tidak sopan / Mengandung pelecehan",
  "Modus penipuan atau bukti transfer palsu",
  "Pembeli fiktif / Batas bayar habis berulang kali",
  "Lainnya",
];

const NAV: { k: Tab; label: string; Icon: typeof Home }[] = [
  { k: "home", label: "Beranda", Icon: Home },
  { k: "stok", label: "Stok", Icon: FishIcon },
  { k: "chat", label: "Chat", Icon: MessageCircle },
  { k: "telegram", label: "Telegram", Icon: Send },
  { k: "akun", label: "Akun", Icon: User },
];

function TelegramView({
  linked,
  onLink,
  onUnlink,
  flash,
}: {
  linked: boolean;
  onLink: () => void;
  onUnlink: () => void;
  flash: (m: string) => void;
}) {
  const [code, setCode] = useState<string | null>(null);
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (!code) return;
    const t = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          setCode(null);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [code]);

  const gen = async () => {
    try {
      const res = await fetch("/api/nelayan/generate-code", { method: "POST" });
      const data = await res.json();

      if (data.kode) {
        setCode(data.kode);
        setLeft(600);
        flash("Kode tautan berhasil dibuat!");
      } else {
        flash(data.error || "Gagal membuat kode tautan.");
      }
    } catch {
      setCode("789123");
      setLeft(600);
      flash("Kode tautan demo berhasil dibuat!");
    }
  };
  const mmss = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;

  if (linked)
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 rounded-2xl bg-[#0E7C86]/10 p-5">
          <span className="grid size-12 place-items-center rounded-full bg-[#0E7C86] text-white">
            <Check />
          </span>
          <div className="flex-1">
            <p className="font-heading text-lg font-bold text-ink">Telegram Terhubung</p>
            <p className="text-sm text-ink/60">Akun @pakwayan · bot @JalaLinkBot</p>
          </div>
          <button
            onClick={onUnlink}
            className="inline-flex items-center gap-2 rounded-xl border border-[#0E7C86] bg-white px-4 py-2 font-sub text-sm font-semibold text-[#0E7C86] hover:bg-surface"
          >
            <Unlink size={16} />
            Putuskan
          </button>
        </div>
        <div className="rounded-2xl bg-surface p-5 text-sm text-ink">
          <p className="mb-2 font-sub font-bold">Fitur Otomatisasi Bot Telegram</p>
          <ul className="list-disc space-y-1 pl-5 text-ink/80">
            <li>Update stok ikan tangkapan & harga terbaru secara instan.</li>
            <li>Terima notifikasi pesanan masuk & penyerahan kurir.</li>
            <li>Status pencairan saldo otomatis dikirim via notifikasi pesan bot.</li>
          </ul>
        </div>
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-surface p-5">
        <h2 className="font-heading text-lg font-bold text-ink">Hubungkan Bot Telegram Nelayan</h2>
        <ol className="mt-3 space-y-2 text-sm text-ink">
          {[
            "Klik “Buat Kode” di bawah.",
            "Buka bot @JalaLinkBot di Telegram.",
            "Kirim pesan /tautkan lalu kodenya, sebelum kode kedaluwarsa.",
          ].map((s, i) => (
            <li key={s} className="flex gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#0E7C86] font-sub text-xs font-bold text-white">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </div>
      {code ? (
        <div className="space-y-3 rounded-2xl border-2 border-[#0E7C86] p-5 text-center">
          <p className="text-sm text-ink/60">
            Kode tautan kamu · berlaku <b className="text-[#0E7C86]">{mmss}</b>
          </p>
          <p className="font-heading text-4xl font-bold tracking-[0.3em] text-ink">{code}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(`/tautkan ${code}`);
                flash("Perintah disalin");
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-[#0E7C86] bg-white px-4 py-2 font-sub text-sm font-semibold text-[#0E7C86] hover:bg-surface"
            >
              <Copy size={16} />
              Salin /tautkan {code}
            </button>
            <a
              href={`https://t.me/JalaLinkBot?start=${code}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0E7C86] px-4 font-sub text-sm font-semibold text-white"
            >
              <Send size={16} />
              Buka Telegram
            </a>
          </div>
          <button onClick={onLink} className="block mx-auto text-xs text-ink/50 underline mt-2">
            Demo: Anggap kode sudah dimasukkan di Telegram
          </button>
        </div>
      ) : (
        <button
          onClick={gen}
          className="h-12 w-full rounded-xl bg-[#0E7C86] font-sub text-base font-semibold text-white hover:bg-[#0E7C86]/90 shadow-sm"
        >
          Buat Kode Tautan
        </button>
      )}
    </div>
  );
}

function ChatView({
  convs,
  setConvs,
  active,
  setActive,
  flash,
}: {
  convs: Conv[];
  setConvs: React.Dispatch<React.SetStateAction<Conv[]>>;
  active: number | null;
  setActive: (n: number | null) => void;
  flash: (m: string) => void;
}) {
  const c = convs.find((x) => x.id === active);
  const [t, setT] = useState("");
  const end = useRef<HTMLDivElement>(null);

  const [modalBlokir, setModalBlokir] = useState(false);
  const [alasanBlokirPilihan, setAlasanBlokirPilihan] = useState(ALASAN_BLOKIR[0]);
  const [detailBlokir, setDetailBlokir] = useState("");

  const [modalLapor, setModalLapor] = useState(false);
  const [alasanLaporPilihan, setAlasanLaporPilihan] = useState(ALASAN_LAPOR[0]);
  const [detailLapor, setDetailLapor] = useState("");

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [c?.msgs.length]);

  const patch = (id: number, f: (x: Conv) => Conv) =>
    setConvs((cs) => cs.map((x) => (x.id === id ? f(x) : x)));

  const send = (text: string) => {
    if (!c || c.blocked || !text.trim()) return;
    patch(c.id, (x) => ({
      ...x,
      msgs: [...x.msgs, { me: true, text: text.trim() }],
    }));
    setT("");
  };

  const eksekusiBlokir = () => {
    if (!c) return;
    const finalAlasan =
      alasanBlokirPilihan === "Lainnya"
        ? detailBlokir.trim() || "Tanpa alasan tambahan"
        : alasanBlokirPilihan;

    patch(c.id, (x) => ({
      ...x,
      blocked: true,
      alasanBlokir: finalAlasan,
    }));

    setModalBlokir(false);
    setDetailBlokir("");
    flash(`Pembeli berhasil diblokir`);
  };

  const eksekusiBukaBlokir = () => {
    if (!c) return;
    patch(c.id, (x) => ({
      ...x,
      blocked: false,
      alasanBlokir: undefined,
    }));
    flash(`Blokir telah dibuka`);
  };

  const eksekusiLapor = () => {
    if (!c) return;
    const finalDetail = detailLapor.trim();
    if (alasanLaporPilihan === "Lainnya" && !finalDetail) {
      flash("Mohon isi deskripsi laporan jika memilih Lainnya!");
      return;
    }

    setModalLapor(false);
    setDetailLapor("");
    flash(`Laporan berhasil dikirim ke Admin CS JalaLink`);
  };

  if (!c)
    return (
      <div className="mx-auto max-w-5xl space-y-3 px-4 py-5 pb-28 md:pb-10">
        <h1 className="font-heading text-2xl font-bold text-ink">Chat Pembeli</h1>
        <div className="grid gap-3 md:grid-cols-2">
          {convs.map((x) => (
            <button
              key={x.id}
              onClick={() => {
                setActive(x.id);
                patch(x.id, (y) => ({ ...y, unread: 0 }));
              }}
              className="flex w-full items-center gap-3 rounded-2xl bg-surface p-4 text-left hover:shadow-md transition border border-soft/30"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#0E7C86] font-sub font-bold text-white">
                {x.pembeli[0]}
              </span>
              <span className="min-w-0 flex-1">
                <b className="block font-sub text-ink text-base">
                  {x.pembeli} · {x.topik}
                </b>
                <span className="block truncate text-sm text-ink/60">
                  {x.blocked ? "Diblokir" : x.msgs[x.msgs.length - 1].text}
                </span>
              </span>
              {x.unread > 0 && (
                <span className="grid size-6 place-items-center rounded-full bg-[#0E7C86] text-xs font-bold text-white">
                  {x.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    );

  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem)] max-w-5xl flex-col">
      <div className="flex items-center gap-2 border-b border-soft/30 px-4 py-3 bg-white">
        <button
          onClick={() => setActive(null)}
          className="grid size-10 place-items-center rounded-full bg-[#0E7C86] text-white"
          aria-label="Kembali"
        >
          <ChevronLeft />
        </button>
        <div className="flex-1">
          <p className="font-sub font-bold text-ink">{c.pembeli}</p>
          <p className="text-xs text-ink/60">Tentang {c.topik}</p>
        </div>

        {c.blocked ? (
          <button
            onClick={eksekusiBukaBlokir}
            className="flex items-center gap-1 rounded-full border border-[#0E7C86] px-3 py-1.5 font-sub text-xs font-semibold text-[#0E7C86] hover:bg-surface"
          >
            <Ban size={14} /> Buka Blokir
          </button>
        ) : (
          <button
            onClick={() => setModalBlokir(true)}
            className="flex items-center gap-1 rounded-full px-3 py-1.5 font-sub text-xs font-semibold text-[#0E7C86] hover:bg-surface border border-[#0E7C86]/30"
          >
            <Ban size={14} /> Blokir
          </button>
        )}

        <button
          onClick={() => setModalLapor(true)}
          className="flex items-center gap-1 rounded-full px-3 py-1.5 font-sub text-xs font-semibold text-ink/70 hover:bg-surface border border-soft/60"
        >
          <Flag size={14} /> Laporkan
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-surface/60 p-4">
        {c.msgs.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.me ? "items-end" : "items-start"}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                m.me
                  ? "rounded-br-sm bg-[#0E7C86] text-white"
                  : "rounded-bl-sm bg-white text-ink"
              }`}
            >
              <p className="break-words">{m.text}</p>
              <div
                className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                  m.me ? "text-white/80" : "text-ink/50"
                }`}
              >
                <span>05.30</span>
                {m.me && <span className="font-bold">✓✓</span>}
              </div>
            </div>
          </div>
        ))}
        <div ref={end} />
      </div>

      <div className="space-y-2 border-t border-soft/30 bg-white p-3">
        {c.blocked && (
          <div className="rounded-xl bg-surface p-2.5 text-center text-xs text-ink/70 font-medium">
            Pembeli ini diblokir. Alasan: &quot;{c.alasanBlokir || "Tanpa alasan"}&quot;. Buka blokir
            untuk mengirim pesan.
          </div>
        )}
        <div className="flex gap-2 overflow-x-auto">
          {QUICK.map((q) => (
            <button
              key={q}
              disabled={c.blocked}
              onClick={() => send(q)}
              className="shrink-0 rounded-full border border-[#0E7C86] bg-white px-4 py-1.5 font-sub text-sm font-semibold text-[#0E7C86] hover:bg-surface disabled:opacity-40"
            >
              {q}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={t}
            disabled={c.blocked}
            onChange={(e) => setT(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(t)}
            placeholder="Tulis balasan..."
            className="h-11 flex-1 rounded-xl border border-soft px-3 text-sm text-ink outline-none placeholder:text-soft disabled:bg-surface"
          />
          <button
            onClick={() => send(t)}
            disabled={c.blocked}
            className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#0E7C86] text-white hover:bg-[#0E7C86]/90 disabled:opacity-40"
            aria-label="Kirim"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {modalBlokir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[440px] rounded-[28px] bg-white p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-full bg-[#0E7C86]/10 text-[#0E7C86]">
                  <Ban size={22} />
                </div>
                <h3 className="font-sub text-xl font-bold text-[#0E7C86]">
                  Blokir Pembeli Ini
                </h3>
              </div>
              <button onClick={() => setModalBlokir(false)} className="grid size-9 place-items-center rounded-full bg-gray-100 text-gray-500">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {ALASAN_BLOKIR.map((alasan) => (
                <label
                  key={alasan}
                  onClick={() => setAlasanBlokirPilihan(alasan)}
                  className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition cursor-pointer ${
                    alasanBlokirPilihan === alasan ? "border-[#0E7C86] bg-[#0E7C86]/5 ring-1 ring-[#0E7C86]" : "border-gray-200"
                  }`}
                >
                  <span className="font-sub text-sm font-semibold text-gray-800">{alasan}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button onClick={() => setModalBlokir(false)} className="h-12 flex-1 rounded-2xl border border-[#0E7C86] font-sub text-sm font-semibold text-[#0E7C86]">Batal</button>
              <button onClick={eksekusiBlokir} className="h-12 flex-1 rounded-2xl bg-red-600 font-sub text-sm font-semibold text-white">Konfirmasi Blokir</button>
            </div>
          </div>
        </div>
      )}

      {modalLapor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[440px] rounded-[28px] bg-white p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-sub text-xl font-bold text-[#0E7C86]">Laporkan Pembeli</h3>
              <button onClick={() => setModalLapor(false)} className="grid size-9 place-items-center rounded-full bg-gray-100"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              {ALASAN_LAPOR.map((alasan) => (
                <label key={alasan} onClick={() => setAlasanLaporPilihan(alasan)} className={`flex items-center gap-3.5 p-3.5 rounded-2xl border cursor-pointer ${alasanLaporPilihan === alasan ? "border-[#0E7C86] bg-[#0E7C86]/5" : "border-gray-200"}`}>
                  <span className="font-sub text-sm font-semibold text-gray-800">{alasan}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button onClick={() => setModalLapor(false)} className="h-12 flex-1 rounded-2xl border border-[#0E7C86] text-[#0E7C86]">Batal</button>
              <button onClick={eksekusiLapor} className="h-12 flex-1 rounded-2xl bg-[#0E7C86] text-white">Kirim Laporan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// MODAL CAIRKAN SALDO PENJUALAN IKAN
function ModalCairkanSaldo({ grossIkanTotal, onClose, onConfirm }: { grossIkanTotal: number; onClose: () => void; onConfirm: () => void }) {
  const [bank, setBank] = useState("BCA");
  const [rekening, setRekening] = useState("7820198821");

  const calc = calculateNelayanIncome(grossIkanTotal);
  const totalNet = Math.max(0, calc.net - BIAYA_TRANSFER_BANK);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-xl font-bold text-ink flex items-center gap-2">
            <Wallet className="text-[#0E7C86]" /> Pencairan Saldo Nelayan
          </h3>
          <button onClick={onClose} className="grid size-9 place-items-center rounded-full bg-surface text-ink/60"><X size={18} /></button>
        </div>

        <div className="rounded-2xl bg-[#0E7C86]/10 p-4 text-center border border-[#0E7C86]/20">
          <span className="text-xs text-ink/70 block font-sub font-semibold">Saldo Bersih Masuk Rekening (Net)</span>
          <span className="font-heading text-3xl font-bold text-[#0E7C86]">{rp(totalNet)}</span>
          <span className="text-[10px] text-ink/50 block mt-0.5">Sudah dipotong Biaya Platform (10%), PPh (0,5%) & BI-FAST</span>
        </div>

        <div className="rounded-2xl bg-surface p-4 space-y-2 text-xs font-sub text-ink border border-soft/40">
          <div className="flex justify-between items-center font-bold border-b border-soft/40 pb-2">
            <span>Total Hasil Jual Ikan (Escrow Produk)</span>
            <span>{rp(grossIkanTotal)}</span>
          </div>

          <div className="flex justify-between items-center text-ink/70">
            <span>- Biaya Layanan JalaLink (10%)</span>
            <span className="text-red-600 font-semibold">-{rp(calc.platformFee)}</span>
          </div>

          <div className="flex justify-between items-center text-ink/70">
            <span className="flex items-center gap-1">
              - PPh Final UMKM Perikanan (0,5%)
              <span title="Disetor ke Pajak Indonesia" className="inline-flex items-center">
                <ShieldCheck size={13} className="text-emerald-700" />
              </span>
            </span>
            <span className="text-red-600 font-semibold">-{rp(calc.pajakPph)}</span>
          </div>

          <div className="flex justify-between items-center text-ink/70">
            <span>- Biaya Transfer Bank (BI-FAST)</span>
            <span className="text-red-600 font-semibold">-{rp(BIAYA_TRANSFER_BANK)}</span>
          </div>

          <div className="border-t border-soft/40 pt-2 flex justify-between items-center font-bold text-ink text-sm">
            <span>Transfer Bersih ke Nelayan</span>
            <span className="text-[#0E7C86]">{rp(totalNet)}</span>
          </div>
        </div>

        <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-[11px] text-blue-900 flex items-start gap-2">
          <Info size={16} className="text-blue-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <b>Info Transport & Kurir:</b> Ongkos kirim tidak termasuk di dalam saldo ini. 100% ongkir disalurkan langsung ke Admin Transportasi & dikelola internal armada supir.
          </p>
        </div>

        <div className="space-y-3 text-xs font-semibold text-ink">
          <div>
            <label className="block mb-1">Bank / E-Wallet Tujuan</label>
            <select value={bank} onChange={(e) => setBank(e.target.value)} className="w-full h-11 rounded-xl border border-soft px-3 bg-white font-sub text-sm outline-none">
              <option value="BCA">Bank BCA</option>
              <option value="BRI">Bank BRI</option>
              <option value="Mandiri">Bank Mandiri</option>
              <option value="DANA">DANA (E-Wallet)</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Nomor Rekening / HP DANA Target</label>
            <input value={rekening} onChange={(e) => setRekening(e.target.value)} className="w-full h-11 rounded-xl border border-soft px-3 font-sub text-sm outline-none" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-soft font-sub text-sm font-semibold text-ink">Batal</button>
          <button onClick={onConfirm} className="flex-1 h-11 rounded-xl bg-[#0E7C86] font-sub text-sm font-semibold text-white shadow-sm hover:bg-[#0E7C86]/90">Tarik ke Rekening</button>
        </div>
      </div>
    </div>
  );
}

// MODAL LIHAT ULASAN PRODUK IKAN
function ModalUlasanIkan({ ikan, onClose }: { ikan: Ikan; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-soft/40 pb-3">
          <div>
            <h3 className="font-heading text-xl font-bold text-ink">Ulasan Tangkapan: {ikan.nama}</h3>
            <p className="flex items-center gap-1 text-xs text-ink/70">
              <Star size={14} className="fill-[#0E7C86] text-[#0E7C86]" /> <b>{ikan.rating}</b> dari {ikan.totalUlasan} Ulasan Pembeli
            </p>
          </div>
          <button onClick={onClose} className="grid size-9 place-items-center rounded-full bg-surface text-ink/60"><X size={18} /></button>
        </div>

        {ikan.reviews.length > 0 ? (
          <div className="space-y-3">
            {ikan.reviews.map((rev) => (
              <div key={rev.id} className="rounded-2xl bg-surface p-4 space-y-1.5 border border-soft/30">
                <div className="flex items-center justify-between">
                  <span className="font-sub text-sm font-bold text-ink">{rev.pembeli}</span>
                  <span className="text-xs text-ink/50">{rev.tanggal}</span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < rev.rating ? "fill-[#0E7C86] text-[#0E7C86]" : "text-soft"} />
                  ))}
                </div>
                <p className="text-sm text-ink/80">{rev.komentar}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-ink/60 space-y-2">
            <MessageSquare className="mx-auto text-soft" size={36} />
            <p className="text-sm">Belum ada ulasan pembeli khusus untuk {ikan.nama}.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NelayanPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("home");
  const [ikan, setIkan] = useState<Ikan[]>(IKAN0);
  const [pesananList, setPesananList] = useState<PesananMasuk[]>(PESANAN_INITIAL);
  const [convs, setConvs] = useState(CONV0);
  const [active, setActive] = useState<number | null>(null);
  const [linked, setLinked] = useState(false);
  const [log, setLog] = useState<Log[]>([]);
  const [simN, setSimN] = useState(0);
  const [toast, setToast] = useState("");
  
  const [modalCairkan, setModalCairkan] = useState(false);
  const [selectedIkanReview, setSelectedIkanReview] = useState<Ikan | null>(null);

  useEffect(() => {
    async function fetchStokReal() {
      try {
        const res = await fetch("/api/listing");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const listIkan = data.map((item: any) => ({
            id: item.id,
            nama: item.ikan?.nama_baku || "Ikan Tangkapan",
            harga: item.harga_per_kg,
            stok: item.stok_kg,
            habis: item.status === "habis",
            sumber: "Telegram" as const,
            waktu: item.tanggal_tangkap || now(),
            rating: 4.8,
            totalUlasan: 10,
            reviews: REVIEWS_SAMPLE[1] || []
          }));
          setIkan(listIkan);
        }
      } catch (err) {
        console.error("Gagal mengambil data dari Supabase:", err);
      }
    }
    fetchStokReal();
  }, []);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 3000);
  };

  const go = (t: Tab) => {
    setTab(t);
    setActive(null);
    window.scrollTo({ top: 0 });
  };
  const unread = convs.reduce((a, c) => a + c.unread, 0);

  // SALDO GROSS SELESAI
  const grossIkanSelesai = pesananList
    .filter((p) => p.status === "Selesai")
    .reduce((acc, p) => acc + p.totalHargaIkan, 0);

  // SALDO TERTAHAN ESCROW PROSES
  const grossIkanProses = pesananList
    .filter((p) => p.status !== "Selesai")
    .reduce((acc, p) => acc + p.totalHargaIkan, 0);

  // HITUNG SALDO NET BERSIH
  const netSelesai = calculateNelayanIncome(grossIkanSelesai).net;

  // UBAH HARGA MANUAL (SINKRON DENGAN TELEGRAM & KATALOG)
  const setHarga = (l: Ikan, h: number) => {
    if (!h || h <= 0 || h === l.harga) return;
    setIkan((a) =>
      a.map((x) => (x.id === l.id ? { ...x, harga: h, sumber: "Web", waktu: now() } : x))
    );
    setLog((g) => [{ t: now(), teks: `Harga ${l.nama} diubah di web jadi ${rp(h)} (Sync Bot Tele)` }, ...g]);
    flash("Harga diperbarui di katalog & Bot Telegram");
  };

  // EDIT STOK MANUAL OLEH NELAYAN (SINKRON TELEGRAM)
  const setStokManual = (l: Ikan, stokBaru: number) => {
    if (stokBaru < 0 || stokBaru === l.stok) return;
    const isHabis = stokBaru === 0;
    setIkan((a) =>
      a.map((x) => (x.id === l.id ? { ...x, stok: stokBaru, habis: isHabis, sumber: "Web", waktu: now() } : x))
    );
    setLog((g) => [{ t: now(), teks: `Stok ${l.nama} diubah di web menjadi ${stokBaru} kg` }, ...g]);
    flash(`Stok ${l.nama} berhasil diperbarui (${stokBaru} kg)`);
  };

  // PENGURANGAN STOK OTOMATIS SAAT PEMBELI CHECKOUT
  const kurangiStokOtomatis = (ikanId: number, jumlahKg: number) => {
    setIkan((prev) =>
      prev.map((item) => {
        if (item.id === ikanId) {
          const sisaStok = Math.max(0, item.stok - jumlahKg);
          const isHabis = sisaStok === 0;
          setLog((g) => [{ t: now(), teks: `Pembeli checkout ${jumlahKg} kg ${item.nama}. Stok sisa ${sisaStok} kg` }, ...g]);
          return {
            ...item,
            stok: sisaStok,
            habis: isHabis,
            waktu: now()
          };
        }
        return item;
      })
    );
    flash(`Stok otomatis berkurang karena checkout pembeli`);
  };

  const toggleHabis = (l: Ikan) => {
    setIkan((a) =>
      a.map((x) => (x.id === l.id ? { ...x, habis: !x.habis, sumber: "Web", waktu: now() } : x))
    );
    setLog((g) => [
      { t: now(), teks: `${l.nama} ${l.habis ? "diaktifkan lagi" : "ditandai habis"} di web` },
      ...g,
    ]);
  };

  const updateStatusPesanan = (no: string, newStatus: StatusPesanan) => {
    setPesananList((prev) => prev.map((p) => (p.no === no ? { ...p, status: newStatus } : p)));
    flash(`Status pesanan ${no} diperbarui ke "${newStatus}"`);
  };

  const simulate = () => {
    const [nama, harga, stok] = SIM[simN % SIM.length];
    setSimN(simN + 1);
    const t = now();
    setIkan((a) =>
      a.some((x) => x.nama === nama)
        ? a.map((x) =>
            x.nama === nama
              ? { ...x, stok: x.stok + stok, habis: false, sumber: "Telegram", waktu: t }
              : x
          )
        : [{ id: Date.now(), nama, harga, stok, habis: false, sumber: "Telegram", waktu: t, rating: 5.0, totalUlasan: 0, reviews: [] }, ...a]
    );
    setLog((g) => [{ t, teks: `${nama} +${stok} kg @ ${rp(harga)} diinput dari Bot Telegram` }, ...g]);
    flash("Stok baru dari Telegram otomatis ter-sync di web!");
  };

  const aktif = ikan.filter((i) => !i.habis);

  return (
    <div className="min-h-screen bg-white font-body text-ink">
      <header className="sticky top-0 z-30 border-b border-soft/40 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <button onClick={() => go("home")} aria-label="Beranda">
            <Image src="/logo.png" alt="JalaLink" width={110} height={36} className="object-contain" priority />
          </button>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map(({ k, label }) => (
              <button
                key={k}
                onClick={() => go(k)}
                className={`rounded-full px-4 py-2 font-sub text-sm font-semibold transition ${
                  tab === k ? "bg-[#0E7C86] text-white shadow-sm" : "text-ink hover:bg-surface"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#0E7C86] px-3 py-1 font-sub text-xs text-white font-bold">
              Nelayan
            </span>
            <button
              onClick={() => go("akun")}
              className="grid size-10 place-items-center rounded-full bg-[#0E7C86] font-sub font-bold text-white transition hover:opacity-90 shadow-sm"
            >
              W
            </button>
          </div>
        </div>
      </header>

      {toast && (
        <div className="fixed left-1/2 top-4 z-[60] -translate-x-1/2 rounded-xl bg-ink px-4 py-3 font-sub text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      {tab === "chat" ? (
        <ChatView
          convs={convs}
          setConvs={setConvs}
          active={active}
          setActive={setActive}
          flash={flash}
        />
      ) : (
        <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 pb-28 md:pb-10">
          {tab === "home" && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="font-heading text-2xl font-bold md:text-3xl">Halo, Pak Wayan!</h1>
                  <p className="text-xs text-ink/60">Dashboard Penjualan Ikan & Status Escrow</p>
                </div>
                
                {/* WIDGET CAIRKAN UANG NET BERSIH */}
                <div className="flex items-center gap-3 rounded-2xl bg-surface p-3.5 border border-soft/40 shadow-sm">
                  <div>
                    <span className="text-[11px] text-ink/60 font-sub font-semibold block">Net Penjualan Ikan</span>
                    <span className="font-heading text-xl font-bold text-[#0E7C86]">{rp(netSelesai)}</span>
                  </div>
                  <button 
                    onClick={() => setModalCairkan(true)} 
                    disabled={grossIkanSelesai <= 0}
                    className="flex items-center gap-1 rounded-xl bg-[#0E7C86] px-4 py-2 font-sub text-xs font-bold text-white shadow-sm hover:bg-[#0E7C86]/90 disabled:opacity-40 transition"
                  >
                    <ArrowUpRight size={16} /> Cairkan
                  </button>
                </div>
              </div>

              {!linked && (
                <button
                  onClick={() => go("telegram")}
                  className="flex w-full items-center gap-3 rounded-2xl bg-[#0E7C86] p-4 text-left text-white shadow-sm hover:opacity-95 transition"
                >
                  <Send />
                  <span className="flex-1">
                    <b className="block font-sub">Hubungkan Telegram Bot</b>
                    <span className="text-sm text-white/80">
                      Supaya bisa jual ikan dan terima pesanan langsung via HP.
                    </span>
                  </span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  ["Ikan Aktif", `${aktif.length}`],
                  ["Total Stok", `${aktif.reduce((a, i) => a + i.stok, 0)} kg`],
                  ["Pesanan Masuk", `${pesananList.length}`],
                  ["Nilai Escrow Ikan", rp(grossIkanProses)],
                ].map(([l, v]) => (
                  <div key={l} className="rounded-2xl bg-surface p-4 border border-soft/30 shadow-sm">
                    <p className="text-xs text-ink/60 font-semibold">{l}</p>
                    <p className="font-heading text-xl md:text-2xl font-bold text-[#0E7C86] mt-0.5">{v}</p>
                  </div>
                ))}
              </div>

              {/* TABEL TRACKING PESANAN TERKINI */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
                    <Bell size={18} className="text-[#0E7C86]" />
                    Status Pesanan Masuk & Tracking Escrow
                  </h2>
                  <span className="text-xs text-ink/60 font-semibold">Terkoneksi Sistem Platform JalaLink</span>
                </div>

                <div className="overflow-hidden rounded-2xl border border-soft/40 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sub">
                      <thead className="bg-surface text-ink/70 border-b border-soft/40 uppercase font-bold">
                        <tr>
                          <th className="p-3.5">No. Pesanan</th>
                          <th className="p-3.5">Detail Tangkapan</th>
                          <th className="p-3.5">Pembeli</th>
                          <th className="p-3.5">Harga Ikan (Gross)</th>
                          <th className="p-3.5">Ongkir (Transport Admin)</th>
                          <th className="p-3.5">Net Nelayan</th>
                          <th className="p-3.5">Status Alur</th>
                          <th className="p-3.5 text-right">Aksi Nelayan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-soft/30 text-ink">
                        {pesananList.map((p) => {
                          const calc = calculateNelayanIncome(p.totalHargaIkan);
                          return (
                            <tr key={p.no} className="hover:bg-surface/50 transition">
                              <td className="p-3.5 font-bold text-[#0E7C86] whitespace-nowrap">{p.no}</td>
                              <td className="p-3.5 font-semibold">{p.teks}</td>
                              <td className="p-3.5">{p.pembeli}</td>
                              <td className="p-3.5 font-bold">{rp(p.totalHargaIkan)}</td>
                              <td className="p-3.5 text-ink/60 italic">{rp(p.totalOngkirTransport)}</td>
                              <td className="p-3.5 font-bold text-emerald-700">{rp(calc.net)}</td>
                              <td className="p-3.5">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                  p.status === "Selesai" 
                                    ? "bg-emerald-100 text-emerald-800" 
                                    : p.status === "Sedang Diantar" 
                                    ? "bg-blue-100 text-blue-800" 
                                    : "bg-amber-100 text-amber-800"
                                }`}>
                                  {p.status === "Selesai" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                  {p.status}
                                </span>
                              </td>
                              <td className="p-3.5 text-right whitespace-nowrap">
                                {p.status === "Sedang Siap / Menunggu Mendarat" && (
                                  <button
                                    onClick={() => updateStatusPesanan(p.no, "Menunggu Kurir")}
                                    className="rounded-xl bg-[#0E7C86] px-3 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-[#0E7C86]/90 transition"
                                  >
                                    Konfirmasi Siap Diambil Kurir
                                  </button>
                                )}
                                {p.status === "Menunggu Kurir" && (
                                  <span className="text-[11px] text-ink/60 italic font-medium">Menunggu Armada CS</span>
                                )}
                                {p.status === "Sedang Diantar" && (
                                  <span className="text-[11px] text-blue-700 font-semibold">Diantar Kurir</span>
                                )}
                                {p.status === "Selesai" && (
                                  <span className="text-[11px] text-emerald-700 font-bold">Dana Masuk Saldo</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </>
          )}

          {tab === "stok" && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h1 className="font-heading text-2xl font-bold">Stok & Listing Tangkapan</h1>
                  <p className="text-xs text-ink/60">Edit harga, stok, dan lihat ulasan pembeli per produk</p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-sub text-xs font-semibold ${
                      linked ? "bg-[#0E7C86]/10 text-[#0E7C86]" : "bg-surface text-ink/60"
                    }`}
                  >
                    <span
                      className={`size-2 rounded-full ${
                        linked ? "animate-pulse bg-[#0E7C86]" : "bg-soft"
                      }`}
                    />
                    {linked ? "Sync Bot Telegram" : "Telegram Belum Terhubung"}
                  </span>
                </div>
              </div>

              {/* TOMBOL TEST SIMULASI CHECKOUT PEMBELI OTOMATIS KURANGI STOK */}
              <div className="rounded-2xl bg-surface p-4 border border-soft/40 flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="font-sub font-semibold text-ink flex items-center gap-2">
                  <ShoppingCart size={16} className="text-[#0E7C86]" /> Uji Alur Pengurangan Stok Otomatis Saat Pembeli Beli:
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => kurangiStokOtomatis(1, 5)} 
                    className="rounded-xl border border-[#0E7C86] bg-white px-3 py-1.5 font-bold text-[#0E7C86] hover:bg-surface"
                  >
                    Simulasi Pembeli Checkout 5 kg Kakap
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {ikan.map((l) => (
                  <div key={l.id} className="space-y-3 rounded-3xl bg-surface p-5 border border-soft/40 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-heading text-xl font-bold">{l.nama}</h3>
                        <p className="text-xs text-ink/60 mt-0.5">
                          Diperbarui {l.waktu} · via {l.sumber}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 font-sub text-xs font-semibold text-white ${
                          l.habis ? "bg-ink" : "bg-[#0E7C86]"
                        }`}
                      >
                        {l.habis ? "Habis" : "Tampil di katalog"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-y border-soft/30 py-2">
                      <button 
                        onClick={() => setSelectedIkanReview(l)} 
                        className="flex items-center gap-1.5 text-xs font-sub font-bold text-[#0E7C86] hover:underline"
                      >
                        <Star size={14} className="fill-[#0E7C86]" /> {l.rating} ({l.totalUlasan} Ulasan Pembeli) &rsaquo;
                      </button>
                      <span className="text-xs text-ink/60">Ulasan & Rating</span>
                    </div>

                    {/* INPUT EDIT HARGA DAN INPUT EDIT STOK */}
                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-xs text-ink/60 font-semibold">
                        Harga per kg
                        <input
                          key={`harga-${l.id}-${l.harga}`}
                          type="number"
                          defaultValue={l.harga}
                          onBlur={(e) => setHarga(l, Number(e.target.value))}
                          className="mt-1 h-11 w-full rounded-xl border border-soft bg-white px-3 text-ink outline-none focus:border-[#0E7C86] font-bold"
                        />
                      </label>
                      <label className="text-xs text-ink/60 font-semibold">
                        Sisa Stok (kg)
                        <input
                          key={`stok-${l.id}-${l.stok}`}
                          type="number"
                          defaultValue={l.stok}
                          onBlur={(e) => setStokManual(l, Number(e.target.value))}
                          className="mt-1 h-11 w-full rounded-xl border border-soft bg-white px-3 text-ink outline-none focus:border-[#0E7C86] font-bold"
                        />
                      </label>
                    </div>

                    <button
                      onClick={() => toggleHabis(l)}
                      className="h-11 w-full rounded-xl border border-[#0E7C86] bg-white font-sub font-semibold text-[#0E7C86] hover:bg-surface transition"
                    >
                      {l.habis ? "Aktifkan lagi" : "Tandai stok habis"}
                    </button>
                  </div>
                ))}
              </div>

              {/* LOG SINKRONISASI */}
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-lg font-bold">Log Sinkronisasi Telegram & Web</h2>
                  {linked && (
                    <button
                      onClick={simulate}
                      className="flex items-center gap-1 font-sub text-xs font-semibold text-[#0E7C86]"
                    >
                      <RefreshCw size={14} />
                      Demo: input dari Telegram
                    </button>
                  )}
                </div>
                {log.length === 0 ? (
                  <p className="rounded-2xl bg-surface p-4 text-sm text-ink/60">
                    Belum ada perubahan. Stok yang diubah di web, dibeli pembeli, atau diinput via Telegram akan terekam di sini.
                  </p>
                ) : (
                  log.map((g, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl bg-surface p-3 text-sm border border-soft/30">
                      <span className="grid size-6 place-items-center rounded-full bg-[#0E7C86] text-white">
                        <Check size={14} />
                      </span>
                      <span className="flex-1 font-sub text-xs text-ink">{g.teks}</span>
                      <span className="text-[10px] text-ink/50">{g.t}</span>
                    </div>
                  ))
                )}
              </section>
            </>
          )}

          {tab === "telegram" && (
            <div className="mx-auto max-w-2xl space-y-4">
              <h1 className="font-heading text-2xl font-bold">Telegram Integration</h1>
              <TelegramView
                linked={linked}
                onLink={() => {
                  setLinked(true);
                  flash("Telegram berhasil terhubung");
                }}
                onUnlink={() => setLinked(false)}
                flash={flash}
              />
            </div>
          )}

          {tab === "akun" && (
            <div className="mx-auto max-w-2xl space-y-4">
              <h1 className="font-heading text-2xl font-bold">Akun Toko Nelayan</h1>
              <div className="flex items-center gap-4 rounded-3xl bg-surface p-5 border border-soft/40 shadow-sm">
                <div className="grid size-16 place-items-center rounded-full bg-[#0E7C86] font-heading text-2xl font-bold text-white shadow-md">
                  W
                </div>
                <div className="flex-1">
                  <p className="flex items-center gap-1 font-heading text-lg font-bold">
                    Pak Wayan <BadgeCheck size={18} className="text-[#0E7C86]" />
                  </p>
                  <p className="text-sm text-ink/60">Pengepul / Nelayan Tangkap · Cilacap</p>
                  <p className="flex items-center gap-1 text-sm text-ink/60 mt-0.5">
                    <Star size={14} className="fill-[#0E7C86] text-[#0E7C86]" />
                    <b>4,8</b> · 23 ulasan pembeli toko
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-surface p-4 text-sm border border-soft/40">
                <MapPin className="text-[#0E7C86]" />
                <span>
                  <b className="block font-sub">Titik Kumpul Penjemputan Armada CS</b>TPI Cilacap, Area Dermaga Utama
                </span>
              </div>

              <button 
                onClick={() => router.push("/login")}
                className="h-12 w-full rounded-xl border border-soft bg-white font-sub font-semibold text-ink hover:bg-surface transition"
              >
                Keluar Akun
              </button>
            </div>
          )}
        </main>
      )}

      {/* MODAL CAIRKAN SALDO GROSS VS NET */}
      {modalCairkan && (
        <ModalCairkanSaldo 
          grossIkanTotal={grossIkanSelesai} 
          onClose={() => setModalCairkan(false)} 
          onConfirm={() => {
            setModalCairkan(false);
            setPesananList((prev) => prev.map((p) => (p.status === "Selesai" ? { ...p, totalHargaIkan: 0 } : p)));
            flash("Permintaan pencairan bersih berhasil ditransfer ke rekening bank tujuan!");
          }} 
        />
      )}

      {/* MODAL DETAIL ULASAN IKAN */}
      {selectedIkanReview && (
        <ModalUlasanIkan 
          ikan={selectedIkanReview} 
          onClose={() => setSelectedIkanReview(null)} 
        />
      )}

      {!(tab === "chat" && active !== null) && (
        <nav className="fixed inset-x-0 bottom-0 z-30 rounded-t-3xl border-t border-soft/30 bg-white px-2 pb-2 pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden">
          <ul className="grid grid-cols-5">
            {NAV.map(({ k, label, Icon }) => {
              const on = tab === k;
              return (
                <li key={k}>
                  <button
                    onClick={() => go(k)}
                    aria-current={on ? "page" : undefined}
                    className="flex w-full flex-col items-center"
                  >
                    <span className="grid h-10 w-full place-items-center">
                      <span
                        className={`relative grid place-items-center rounded-full transition-all duration-300 ease-out ${
                          on
                            ? "size-14 -translate-y-4 bg-[#0E7C86] text-white shadow-lg ring-4 ring-white"
                            : "size-10 text-ink/50"
                        }`}
                      >
                        <Icon size={24} />
                        {k === "chat" && unread > 0 && !on && (
                          <span className="absolute right-0 top-0 size-3 rounded-full bg-[#0E7C86] ring-2 ring-white" />
                        )}
                      </span>
                    </span>
                    <span
                      className={`font-sub text-[11px] font-semibold ${
                        on ? "text-[#0E7C86]" : "text-ink/50"
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}