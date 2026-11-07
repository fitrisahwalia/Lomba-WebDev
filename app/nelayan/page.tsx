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
} from "lucide-react";

const rp = (n: number) => "Rp" + n.toLocaleString("id-ID");
const now = () =>
  new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

type Tab = "home" | "stok" | "chat" | "telegram" | "akun";
type Ikan = {
  id: number;
  nama: string;
  harga: number;
  stok: number;
  habis: boolean;
  sumber: "Telegram" | "Admin" | "Web";
  waktu: string;
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

const IKAN0: Ikan[] = [
  { id: 1, nama: "Kakap Merah", harga: 65000, stok: 100, habis: false, sumber: "Admin", waktu: "05.30" },
  { id: 2, nama: "Cumi-cumi", harga: 62000, stok: 55, habis: false, sumber: "Admin", waktu: "05.05" },
  { id: 3, nama: "Kerapu Macan", harga: 135000, stok: 30, habis: false, sumber: "Admin", waktu: "04.50" },
  { id: 4, nama: "Selar Kuning", harga: 34000, stok: 0, habis: true, sumber: "Admin", waktu: "Kemarin" },
];

const PESANAN = [
  { no: "JL-1001", teks: "10 kg Kakap Merah", titik: "TPI Cilacap", jadwal: "Kamis, 5 Nov · 06.00" },
  { no: "JL-1002", teks: "8 kg Cumi-cumi", titik: "TPI Cilacap", jadwal: "Kamis, 5 Nov · 06.00" },
  { no: "JL-1006", teks: "4 kg Kakap Merah", titik: "TPI Cilacap", jadwal: "Kamis, 5 Nov · 06.00" },
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
      setLeft(600); // 10 menit
      flash("Kode tautan berhasil dibuat!");
    } else {
      flash(data.error || "Gagal membuat kode tautan.");
    }
  } catch (err) {
    flash("Terjadi kesalahan koneksi.");
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
            <p className="font-heading text-lg font-bold text-ink">Telegram terhubung</p>
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
          <p className="mb-2 font-sub font-bold">Yang bisa kamu lakukan di bot</p>
          <ul className="list-disc space-y-1 pl-5 text-ink/80">
            <li>Jual ikan: pilih ikan, jumlah, harga, foto, konfirmasi</li>
            <li>Ubah harga dan tandai stok habis</li>
            <li>Balas pertanyaan pembeli dengan tombol, lalu blokir atau laporkan</li>
            <li>Terima notifikasi pesanan masuk</li>
          </ul>
          <p className="mt-3 text-xs text-ink/60">
            Stok yang kamu input di Telegram otomatis tampil di tab Stok dan katalog.
          </p>
        </div>
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-surface p-5">
        <h2 className="font-heading text-lg font-bold text-ink">Hubungkan Telegram</h2>
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
            Demo: anggap kode sudah dimasukkan di Telegram
          </button>
        </div>
      ) : (
        <button
          onClick={gen}
          className="h-12 w-full rounded-xl bg-[#0E7C86] font-sub text-base font-semibold text-white hover:bg-[#0E7C86]/90"
        >
          Buat Kode
        </button>
      )}
      <p className="text-xs text-ink/60">
        Kode hanya bisa dipakai sekali dan akan kedaluwarsa otomatis. Jangan bagikan ke orang lain.
      </p>
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

  // MODAL ALASAN BLOKIR & LAPOR
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
    flash(`Laporan berhasil dikirim ke Admin JalaLink`);
  };

  if (!c)
    return (
      <div className="mx-auto max-w-3xl space-y-3 px-4 py-5 pb-28 md:pb-10">
        <h1 className="font-heading text-2xl font-bold text-ink">Chat Pembeli</h1>
        {convs.map((x) => (
          <button
            key={x.id}
            onClick={() => {
              setActive(x.id);
              patch(x.id, (y) => ({ ...y, unread: 0 }));
            }}
            className="flex w-full items-center gap-3 rounded-2xl bg-surface p-3 text-left hover:shadow-md transition"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#0E7C86] font-sub font-bold text-white">
              {x.pembeli[0]}
            </span>
            <span className="min-w-0 flex-1">
              <b className="block font-sub text-ink">
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
    );

  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem)] max-w-3xl flex-col">
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

      {/* MODAL BLOKIR PEMBELI INI (FIXED TEAL COLOR & GENERIC TITLE) */}
      {modalBlokir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[440px] rounded-[28px] bg-white p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            {/* HEADER MODAL TEAL & UMUM */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-full bg-[#0E7C86]/10 text-[#0E7C86]">
                  <Ban size={22} className="stroke-[2.5]" />
                </div>
                <h3 className="font-sub text-xl font-bold text-[#0E7C86]">
                  Blokir Pembeli Ini
                </h3>
              </div>
              <button
                onClick={() => setModalBlokir(false)}
                className="grid size-9 place-items-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed">
              Pilih alasan diblokirnya pembeli ini. Pembeli yang diblokir tidak dapat lagi mengirimkan
              pesan penawaran kepada kamu.
            </p>

            {/* OPSI RADIO BUTTON */}
            <div className="space-y-3">
              {ALASAN_BLOKIR.map((alasan) => {
                const isSelected = alasanBlokirPilihan === alasan;
                return (
                  <label
                    key={alasan}
                    onClick={() => setAlasanBlokirPilihan(alasan)}
                    className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? "border-[#0E7C86] bg-[#0E7C86]/5 ring-1 ring-[#0E7C86]"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="alasanBlokir"
                        checked={isSelected}
                        onChange={() => setAlasanBlokirPilihan(alasan)}
                        className="sr-only"
                      />
                      <div
                        className={`size-5 rounded-full border-2 flex items-center justify-center transition ${
                          isSelected ? "border-[#0E7C86]" : "border-gray-300"
                        }`}
                      >
                        {isSelected && <div className="size-2.5 rounded-full bg-[#0E7C86]" />}
                      </div>
                    </div>
                    <span className="font-sub text-sm font-semibold text-gray-800">{alasan}</span>
                  </label>
                );
              })}
            </div>

            {alasanBlokirPilihan === "Lainnya" && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Keterangan Alasan Tambahan *
                </label>
                <textarea
                  value={detailBlokir}
                  onChange={(e) => setDetailBlokir(e.target.value)}
                  placeholder="Tuliskan alasan blokir..."
                  className="w-full rounded-2xl border border-gray-300 p-3.5 text-xs outline-none focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/10 h-20 resize-none"
                />
              </div>
            )}

            {/* TOMBOL AKSI MODAL */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setModalBlokir(false)}
                className="h-12 flex-1 rounded-2xl border border-[#0E7C86] font-sub text-sm font-semibold text-[#0E7C86] hover:bg-surface transition"
              >
                Batal
              </button>
              <button
                onClick={eksekusiBlokir}
                className="h-12 flex-1 rounded-2xl bg-[#E50000] font-sub text-sm font-semibold text-white shadow-sm hover:bg-red-700 active:scale-[0.98] transition"
              >
                Konfirmasi Blokir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LAPORKAN PEMBELI INI */}
      {modalLapor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[440px] rounded-[28px] bg-white p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-full bg-[#0E7C86]/10 text-[#0E7C86]">
                  <Flag size={20} className="stroke-[2.5]" />
                </div>
                <h3 className="font-sub text-xl font-bold text-[#0E7C86]">
                  Laporkan Pembeli Ini
                </h3>
              </div>
              <button
                onClick={() => setModalLapor(false)}
                className="grid size-9 place-items-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed">
              Laporan kamu akan ditinjau oleh tim verifikasi JalaLink. Tindakan tegas akan diambil
              apabila pembeli terbukti melanggar aturan platform.
            </p>

            <div className="space-y-3">
              {ALASAN_LAPOR.map((alasan) => {
                const isSelected = alasanLaporPilihan === alasan;
                return (
                  <label
                    key={alasan}
                    onClick={() => setAlasanLaporPilihan(alasan)}
                    className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? "border-[#0E7C86] bg-[#0E7C86]/5 ring-1 ring-[#0E7C86]"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="alasanLapor"
                        checked={isSelected}
                        onChange={() => setAlasanLaporPilihan(alasan)}
                        className="sr-only"
                      />
                      <div
                        className={`size-5 rounded-full border-2 flex items-center justify-center transition ${
                          isSelected ? "border-[#0E7C86]" : "border-gray-300"
                        }`}
                      >
                        {isSelected && <div className="size-2.5 rounded-full bg-[#0E7C86]" />}
                      </div>
                    </div>
                    <span className="font-sub text-sm font-semibold text-gray-800">{alasan}</span>
                  </label>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Deskripsi Kejadian / Bukti Pelaporan
              </label>
              <textarea
                value={detailLapor}
                onChange={(e) => setDetailLapor(e.target.value)}
                placeholder="Jelaskan detail pelanggaran yang dilakukan pembeli..."
                className="w-full rounded-2xl border border-gray-300 p-3.5 text-xs outline-none focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/10 h-20 resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setModalLapor(false)}
                className="h-12 flex-1 rounded-2xl border border-[#0E7C86] font-sub text-sm font-semibold text-[#0E7C86] hover:bg-surface transition"
              >
                Batal
              </button>
              <button
                onClick={eksekusiLapor}
                className="h-12 flex-1 rounded-2xl bg-[#0E7C86] font-sub text-sm font-semibold text-white shadow-sm hover:bg-[#0E7C86]/90 active:scale-[0.98] transition"
              >
                Kirim Laporan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NelayanPage() {
  const [tab, setTab] = useState<Tab>("home");
  const [ikan, setIkan] = useState(IKAN0);
  const [convs, setConvs] = useState(CONV0);
  const [active, setActive] = useState<number | null>(null);
  const [linked, setLinked] = useState(false);
  const [log, setLog] = useState<Log[]>([]);
  const [simN, setSimN] = useState(0);
  const [toast, setToast] = useState("");
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
          sumber: "Telegram" as const, // <-- TAMBAHKAN 'as const' DI SINI
          waktu: item.tanggal_tangkap || now(),
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

  const setHarga = (l: Ikan, h: number) => {
    if (!h || h <= 0 || h === l.harga) return;
    setIkan((a) =>
      a.map((x) => (x.id === l.id ? { ...x, harga: h, sumber: "Web", waktu: now() } : x))
    );
    setLog((g) => [{ t: now(), teks: `Harga ${l.nama} diubah di web jadi ${rp(h)}` }, ...g]);
    flash("Harga diperbarui di katalog");
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
        : [{ id: Date.now(), nama, harga, stok, habis: false, sumber: "Telegram", waktu: t }, ...a]
    );
    setLog((g) => [{ t, teks: `${nama} ${stok} kg @ ${rp(harga)} dari Telegram` }, ...g]);
    flash("Stok dari Telegram sudah tampil di web");
  };

  const aktif = ikan.filter((i) => !i.habis);
  return (
    <div className="min-h-screen bg-white font-body text-ink">
      <header className="sticky top-0 z-30 border-b border-soft/40 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <button onClick={() => go("home")} aria-label="Beranda">
            <Image src="/logo.png" alt="JalaLink" width={110} height={36} className="object-contain" />
          </button>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map(({ k, label }) => (
              <button
                key={k}
                onClick={() => go(k)}
                className={`rounded-full px-4 py-2 font-sub text-sm font-semibold ${
                  tab === k ? "bg-[#0E7C86] text-white" : "text-ink hover:bg-surface"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#0E7C86] px-3 py-1 font-sub text-xs text-white">
              Nelayan
            </span>
            <button
              onClick={() => go("akun")}
              className="grid size-10 place-items-center rounded-full bg-[#0E7C86] font-sub font-bold text-white transition hover:opacity-90"
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
        <main className="mx-auto max-w-5xl space-y-5 px-4 py-5 pb-28 md:pb-10">
          {tab === "home" && (
            <>
              <h1 className="font-heading text-2xl font-bold">Halo, Pak Wayan!</h1>
              {!linked && (
                <button
                  onClick={() => go("telegram")}
                  className="flex w-full items-center gap-3 rounded-2xl bg-[#0E7C86] p-4 text-left text-white shadow-sm hover:opacity-95 transition"
                >
                  <Send />
                  <span className="flex-1">
                    <b className="block font-sub">Hubungkan Telegram</b>
                    <span className="text-sm text-white/80">
                      Supaya bisa jual ikan dan terima pesanan lewat bot.
                    </span>
                  </span>
                </button>
              )}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  ["Ikan aktif", `${aktif.length}`],
                  ["Total stok", `${aktif.reduce((a, i) => a + i.stok, 0)} kg`],
                  ["Pesanan masuk", `${PESANAN.length}`],
                  ["Chat baru", `${unread}`],
                ].map(([l, v]) => (
                  <div key={l} className="rounded-2xl bg-surface p-4">
                    <p className="text-xs text-ink/60">{l}</p>
                    <p className="font-heading text-2xl font-bold text-[#0E7C86]">{v}</p>
                  </div>
                ))}
              </div>
              <section className="space-y-3">
                <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
                  <Bell size={18} className="text-[#0E7C86]" />
                  Pesanan masuk
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {PESANAN.map((p) => (
                    <div key={p.no} className="rounded-2xl bg-surface p-4">
                      <p className="font-sub text-xs font-semibold text-ink/60">{p.no}</p>
                      <p className="font-sub text-lg font-bold">{p.teks}</p>
                      <p className="flex items-center gap-1 text-sm text-ink/70 mt-1">
                        <MapPin size={14} className="text-[#0E7C86]" />
                        Antar ke {p.titik} · {p.jadwal}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-ink/60">
                  Notifikasi yang sama juga dikirim otomatis ke Telegram kamu.
                </p>
              </section>
            </>
          )}

          {tab === "stok" && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="font-heading text-2xl font-bold">Stok & Listing</h1>
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
                  {linked ? "Sinkron dengan Telegram" : "Telegram belum terhubung"}
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {ikan.map((l) => (
                  <div key={l.id} className="space-y-3 rounded-2xl bg-surface p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-heading text-lg font-bold">{l.nama}</h3>
                        <p className="text-xs text-ink/60">
                          Diperbarui {l.waktu} · via {l.sumber}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 font-sub text-xs font-semibold text-white ${
                          l.habis ? "bg-ink" : "bg-[#0E7C86]"
                        }`}
                      >
                        {l.habis ? "Habis" : "Tampil di katalog"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-xs text-ink/60">
                        Harga per kg
                        <input
                          key={l.harga}
                          type="number"
                          defaultValue={l.harga}
                          onBlur={(e) => setHarga(l, Number(e.target.value))}
                          className="mt-1 h-11 w-full rounded-xl border border-soft bg-white px-3 text-ink outline-none"
                        />
                      </label>
                      <div>
                        <p className="text-xs text-ink/60">Stok</p>
                        <p className="mt-2 font-heading text-xl font-bold">{l.stok} kg</p>
                      </div>
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
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-lg font-bold">Log sinkronisasi</h2>
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
                    Belum ada perubahan. Stok yang kamu input di Telegram akan muncul di sini dan di
                    katalog.
                  </p>
                ) : (
                  log.map((g, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl bg-surface p-3 text-sm">
                      <span className="grid size-6 place-items-center rounded-full bg-[#0E7C86] text-white">
                        <Check size={14} />
                      </span>
                      <span className="flex-1">{g.teks}</span>
                      <span className="text-xs text-ink/50">{g.t}</span>
                    </div>
                  ))
                )}
              </section>
            </>
          )}

          {tab === "telegram" && (
            <div className="mx-auto max-w-2xl space-y-4">
              <h1 className="font-heading text-2xl font-bold">Telegram</h1>
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
              <h1 className="font-heading text-2xl font-bold">Akun</h1>
              <div className="flex items-center gap-4 rounded-2xl bg-surface p-5">
                <div className="grid size-16 place-items-center rounded-full bg-[#0E7C86] font-heading text-2xl font-bold text-white">
                  W
                </div>
                <div className="flex-1">
                  <p className="flex items-center gap-1 font-heading text-lg font-bold">
                    Pak Wayan <BadgeCheck size={18} className="text-[#0E7C86]" />
                  </p>
                  <p className="text-sm text-ink/60">Pengepul · Cilacap</p>
                  <p className="flex items-center gap-1 text-sm text-ink/60">
                    <Star size={14} className="fill-[#0E7C86] text-[#0E7C86]" />
                    4,8 · 23 review
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-surface p-4 text-sm">
                <MapPin className="text-[#0E7C86]" />
                <span>
                  <b className="block font-sub">Titik kumpul</b>TPI Cilacap, area dermaga
                </span>
              </div>
              <div className="space-y-3 rounded-2xl bg-surface p-4">
                <p className="font-sub font-bold">Status akun</p>
                {[
                  ["Terdaftar oleh admin", true],
                  ["Diverifikasi admin", true],
                  ["Telegram terhubung", linked],
                ].map(([l, ok]) => (
                  <p key={String(l)} className="flex items-center gap-3 text-sm">
                    <span
                      className={`grid size-6 place-items-center rounded-full ${
                        ok ? "bg-[#0E7C86] text-white" : "border border-soft text-soft"
                      }`}
                    >
                      {ok ? <Check size={14} /> : null}
                    </span>
                    {l}
                  </p>
                ))}
              </div>
              <p className="text-xs text-ink/60">
                Nomor dan akun Telegram kamu tidak ditampilkan ke pembeli. Profil dan listing kamu
                tampil publik di katalog.
              </p>
              <button className="h-12 w-full rounded-xl border border-soft bg-white font-sub font-semibold text-ink hover:bg-surface transition">
                Keluar
              </button>
            </div>
          )}
        </main>
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