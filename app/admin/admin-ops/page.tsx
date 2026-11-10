"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Send,
  Check,
  X,
  Plus,
  Trash2,
  ChevronLeft,
  Search,
  FileText,
  User,
  LogOut,
  KeyRound,
  AlertTriangle,
  SlidersHorizontal,
  Eye,
  Laptop,
  Mail,
  MapPin,
  Lock,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const inp =
  "h-11 w-full rounded-2xl border border-soft/60 bg-white px-3.5 text-sm text-ink outline-none placeholder:text-soft focus:border-[#0d7a87] focus:ring-2 focus:ring-[#0d7a87]/10 transition-all";
const pri =
  "h-11 rounded-2xl bg-[#0d7a87] px-5 font-sub text-sm font-semibold text-white shadow-sm hover:bg-[#0b6873] active:scale-[0.98] transition-all disabled:opacity-40";
const out =
  "h-11 rounded-2xl border border-[#0d7a87] bg-white px-5 font-sub text-sm font-semibold text-[#0d7a87] hover:bg-surface active:scale-[0.98] transition-all";
const card =
  "rounded-3xl bg-surface/70 border border-soft/50 p-5 shadow-sm hover:shadow-md transition-shadow";

const Pill = ({
  children,
  dark,
  color,
}: {
  children: React.ReactNode;
  dark?: boolean;
  color?: string;
}) => (
  <span
    className={`rounded-full px-2.5 py-0.5 font-sub text-[11px] font-semibold leading-tight ${
      color
        ? color
        : dark
        ? "bg-ink text-white"
        : "bg-[#0d7a87] text-white"
    }`}
  >
    {children}
  </span>
);

type Tab = "ringkasan" | "bantuan" | "laporan" | "nelayan";
type SubTabVerif = "nelayan" | "foto";
type Msg = { me: boolean; text: string };
type Tiket = { id: number; pembeli: string; topik: string; selesai: boolean; msgs: Msg[] };
type FAQ = { id: number; kategori: string; pertanyaan: string; jawaban: string };

type PeranUser = "Pembeli" | "Nelayan" | "Kurir Hub" | "Mitra Transport";
type Prioritas = "Tinggi" | "Sedang" | "Rendah";

type Laporan = {
  id: number;
  jenis: "Percakapan" | "Pesanan" | "Pengiriman / Logistics" | "Kualitas Ikan";
  pelaporRole: PeranUser;
  pelapor: string;
  terlaporRole: PeranUser;
  terlapor: string;
  alasan: string;
  bukti?: string[];
  prioritas: Prioritas;
  tanggal: string;
  selesai: boolean;
  tindakan?: string;
  alasanTindakan?: string;
  adminVerif?: string;
  chatLog?: { sender: string; text: string }[];
};

type Nel = {
  id: number;
  nama: string;
  daerah: string;
  titik: string;
  dok: string;
  selfie?: string;
  rek?: string;
  geotag?: string;
  status: "Menunggu" | "Aktif" | "Ditolak" | "Dinonaktifkan" | "Banding";
  listing: number;
  keterangan?: string;
  adminVerif?: string;
};

type FotoIkan = {
  id: number;
  nelayan: string;
  ikan: string;
  foto: string;
  status: "Menunggu" | "Disetujui" | "Ditolak";
  keterangan?: string;
  adminVerif?: string;
};

const KAT = [
  "Pemesanan & Cold Chain",
  "Pengiriman & Ongkir",
  "Pembayaran & Keamanan",
  "Kualitas & Garansi",
  "Lainnya",
];

const FAQ0: FAQ[] = [
  {
    id: 1,
    kategori: KAT[0],
    pertanyaan: "Bagaimana sistem Pre-Order Next Day di JalaLink bekerja?",
    jawaban:
      "Ikan dipesan hari ini, hasil tangkapan subuh besoknya langsung dikirim (cold chain).",
  },
];

const TIKET0: Tiket[] = [
  {
    id: 1,
    pembeli: "Ushi",
    topik: "Ikan kurang segar (JL-1001)",
    selesai: false,
    msgs: [
      {
        me: false,
        text: "Halo admin, kakap merah yang datang tadi esnya sudah mencair.",
      },
    ],
  },
];

const LAP0: Laporan[] = [
  {
    id: 1,
    jenis: "Percakapan",
    pelaporRole: "Pembeli",
    pelapor: "Ushi (Pembeli)",
    terlaporRole: "Nelayan",
    terlapor: "Pak Hasan (Nelayan)",
    alasan: "Mengajak transaksi di luar aplikasi JalaLink",
    prioritas: "Tinggi",
    tanggal: "2026-03-29 10:30",
    selesai: false,
    chatLog: [
      { sender: "Pak Hasan (Nelayan)", text: "Tf langsung aja ya kak biar ga kena admin." },
      { sender: "Ushi (Pembeli)", text: "Maaf pak maunya lewat aplikasi aja." },
    ],
  },
  {
    id: 2,
    jenis: "Pengiriman / Logistics",
    pelaporRole: "Kurir Hub",
    pelapor: "Joko (Kurir Hub Cilacap)",
    terlaporRole: "Mitra Transport",
    terlapor: "CV Trans Samudera Cold",
    alasan: "Truck terlambat penjemputan Cold Storage 3 jam dari jadwal subuh",
    bukti: ["surat-jalan-logistics.pdf", "foto-jam-titik.jpg"],
    prioritas: "Tinggi",
    tanggal: "2026-03-29 08:15",
    selesai: false,
  },
  {
    id: 3,
    jenis: "Kualitas Ikan",
    pelaporRole: "Mitra Transport",
    pelapor: "CV Bahari Cold Chain",
    terlaporRole: "Nelayan",
    terlapor: "Pak Udin (Nelayan)",
    alasan: "Kotak es styrofoam bocor dan tidak memenuhi standar suhu transit",
    bukti: ["foto-styrofoam-rusak.jpg"],
    prioritas: "Sedang",
    tanggal: "2026-03-28 16:45",
    selesai: false,
  },
  {
    id: 4,
    jenis: "Pesanan",
    pelaporRole: "Pembeli",
    pelapor: "Warung Bu Tini",
    terlaporRole: "Kurir Hub",
    terlapor: "Bambang (Kurir Antar Terakhir)",
    alasan: "Pesanan diserahkan tanpa ice pack tambahan di lokasi penerima",
    bukti: ["foto-paket-tanpa-icepack.png"],
    prioritas: "Rendah",
    tanggal: "2026-03-27 14:20",
    selesai: true,
    tindakan: "Peringatan Dikirim",
    alasanTindakan: "Kurir lalai tidak memeriksa es pendingin tambahan saat penyerahan barang.",
    adminVerif: "Budi Santoso (ADM-OPS-02)",
  },
];

const NEL0: Nel[] = [
  {
    id: 1,
    nama: "Pak Rizal",
    daerah: "Pangandaran",
    titik: "TPI Pangandaran",
    dok: "KTP_Pak_Rizal_Pangandaran.pdf",
    selfie: "Selfie_KTP_Rizal.jpg",
    rek: "BRI - 4100-01-002931-50-2 (Sesuai KTP)",
    geotag: "GPS Lat -7.6971, Long 108.6541 (Radius 50m TPI)",
    status: "Menunggu",
    listing: 0,
  },
  {
    id: 2,
    nama: "Bu Wati",
    daerah: "Indramayu",
    titik: "TPI Indramayu",
    dok: "KTP_Revisi_Bu_Wati.pdf",
    selfie: "Selfie_KTP_Wati_Revisi.jpg",
    rek: "BCA - 8921038192 (Sesuai KTP)",
    geotag: "GPS Lat -6.3271, Long 108.3241 (Sesuai TPI)",
    status: "Banding",
    listing: 0,
    keterangan: "KTP sebelumnya blur dan tidak terbaca jelas.",
    adminVerif: "Budi Santoso (ADM-OPS-02)",
  },
  {
    id: 3,
    nama: "Pak Wayan",
    daerah: "Cilacap",
    titik: "TPI Cilacap",
    dok: "KTP_Pak_Wayan_Cilacap.pdf",
    selfie: "Selfie_KTP_Wayan.jpg",
    rek: "Mandiri - 138001928301 (Sesuai KTP)",
    geotag: "GPS Lat -7.7312, Long 109.0089 (Sesuai TPI)",
    status: "Aktif",
    listing: 4,
    adminVerif: "Budi Santoso (ADM-OPS-02)",
  },
];

const FOTO0: FotoIkan[] = [
  { id: 101, nelayan: "Pak Rizal", ikan: "Kakap Merah (2kg)", foto: "kakap-merah-tangkapan.jpg", status: "Menunggu" },
  { id: 102, nelayan: "Bu Wati", ikan: "Tenggiri Segar (5kg)", foto: "tenggiri-segar-indramayu.jpg", status: "Menunggu" },
];

export default function AdminOpsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("ringkasan");
  const [subTabVerif, setSubTabVerif] = useState<SubTabVerif>("nelayan");

  const [tiket, setTiket] = useState(TIKET0);
  const [sel, setSel] = useState<number | null>(null);
  const [bsub, setBsub] = useState<"chat" | "faq">("chat");
  const [reply, setReply] = useState("");
  const [faq, setFaq] = useState(FAQ0);
  const [lap, setLap] = useState<Laporan[]>([]);
  const [nel, setNel] = useState<Nel[]>([]);
  const [loading, setLoading] = useState(true);
  const [fotoIkan, setFotoIkan] = useState(FOTO0);

  useEffect(() => {
  async function fetchDataOps() {
    setLoading(true);
    try {
      // 1. Fetch Data Nelayan dari Supabase
      const { data: dataNelayan, error: errNel } = await supabase
        .from("nelayan")
        .select("*");

      if (!errNel && dataNelayan && dataNelayan.length > 0) {
        // Map kolom Supabase ke tipe data React
        const mappedNel: Nel[] = dataNelayan.map((n: any) => ({
          id: n.id,
          nama: n.nama,
          daerah: n.daerah,
          titik: n.titik,
          dok: n.dok || n.dokumen,
          selfie: n.selfie,
          rek: n.rek || n.rekening,
          geotag: n.geotag,
          status: n.status,
          listing: n.listing || 0,
          keterangan: n.keterangan,
          adminVerif: n.admin_verif || n.adminVerif,
        }));
        setNel(mappedNel);
      } else {
        setNel(NEL0); // Fallback ke dummy jika DB kosong
      }

      // 2. Fetch Data Laporan dari Supabase
      const { data: dataLaporan, error: errLap } = await supabase
        .from("laporan")
        .select("*");

      if (!errLap && dataLaporan && dataLaporan.length > 0) {
        const mappedLap: Laporan[] = dataLaporan.map((l: any) => ({
          id: l.id,
          jenis: l.jenis,
          pelaporRole: l.pelapor_role || l.pelaporRole,
          pelapor: l.pelapor,
          terlaporRole: l.terlapor_role || l.terlaporRole,
          terlapor: l.terlapor,
          alasan: l.alasan,
          bukti: l.bukti,
          prioritas: l.prioritas,
          tanggal: l.tanggal,
          selesai: l.selesai,
          tindakan: l.tindakan,
          alasanTindakan: l.alasan_tindakan || l.alasanTindakan,
          adminVerif: l.admin_verif || l.adminVerif,
          chatLog: l.chat_log || l.chatLog,
        }));
        setLap(mappedLap);
      } else {
        setLap(LAP0); // Fallback ke dummy jika DB kosong
      }
    } catch (err) {
      console.error("Gagal ambil data Supabase:", err);
      setNel(NEL0);
      setLap(LAP0);
    } finally {
      setLoading(false);
    }
  }

  fetchDataOps();
  }, []);

  const [adminProfile, setAdminProfile] = useState({
    nama: "Budi Santoso (Temporary Ops)",
    email: "budi.ops@jalalink.id",
    role: "Admin Ops",
    kode: "ADM-OPS-02",
  });

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [modalEditProfil, setModalEditProfil] = useState(false);
  const [modalKeamanan, setModalKeamanan] = useState(false);
  const [tempProfile, setTempProfile] = useState({ ...adminProfile });
  const [formSandi, setFormSandi] = useState({ lama: "", baru: "", konfirmasi: "" });

  const [deviceInfo, setDeviceInfo] = useState({
    browser: "Mendeteksi browser...",
    ip: "Mendeteksi IP...",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent;
      let browserName = "Unknown Browser";
      let osName = "Unknown OS";

      if (ua.indexOf("Win") !== -1) osName = "Windows";
      else if (ua.indexOf("Mac") !== -1) osName = "macOS";
      else if (ua.indexOf("Linux") !== -1) osName = "Linux";
      else if (ua.indexOf("Android") !== -1) osName = "Android";
      else if (ua.indexOf("like Mac") !== -1) osName = "iOS";

      if (ua.indexOf("Chrome") !== -1 && ua.indexOf("Edg") === -1) browserName = "Chrome";
      else if (ua.indexOf("Safari") !== -1 && ua.indexOf("Chrome") === -1) browserName = "Safari";
      else if (ua.indexOf("Firefox") !== -1) browserName = "Firefox";
      else if (ua.indexOf("Edg") !== -1) browserName = "Edge";

      setDeviceInfo((prev) => ({
        ...prev,
        browser: `${browserName} pada ${osName}`,
      }));

      fetch("https://api.ipify.org?format=json")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.ip) {
            setDeviceInfo((prev) => ({ ...prev, ip: data.ip }));
          }
        })
        .catch(() => {
          setDeviceInfo((prev) => ({ ...prev, ip: "Terhubung (Localhost)" }));
        });
    }
  }, []);

  const menuRef = useRef<HTMLDivElement>(null);

  const [detailNel, setDetailNel] = useState<number | null>(null);
  const [detailFoto, setDetailFoto] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<{
    id: number;
    type: "nelayan" | "foto" | "laporan";
    aksi: string;
    targetStatus: string;
  } | null>(null);
  const [alasanInput, setAlasanInput] = useState("");
  const [bukaChat, setBukaChat] = useState<number | null>(null);
  const [previewBukti, setPreviewBukti] = useState<string | null>(null);

  const [selNel, setSelNel] = useState<number[]>([]);
  const [selFoto, setSelFoto] = useState<number[]>([]);

  const [searchNel, setSearchNel] = useState("");
  const [filterNel, setFilterNel] = useState("Semua");
  const [searchFoto, setSearchFoto] = useState("");
  const [filterFoto, setFilterFoto] = useState("Semua");

  const [searchLap, setSearchLap] = useState("");
  const [filterLapRole, setFilterLapRole] = useState("Semua");
  const [sortLap, setSortLap] = useState<"terbaru" | "terlama" | "prioritas">("terbaru");

  const [toast, setToast] = useState("");
  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 4000);
  };
  const ADMIN_ID = `${adminProfile.nama} (${adminProfile.kode})`;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const nTiket = tiket.filter((t) => !t.selesai).length;
  const nLap = lap.filter((l) => !l.selesai).length;
  const nNel = nel.filter((n) => n.status === "Menunggu" || n.status === "Banding").length;
  const nFoto = fotoIkan.filter((f) => f.status === "Menunggu").length;

  const NAV = [
    ["ringkasan", "Beranda", 0],
    ["bantuan", "Bantuan", nTiket],
    ["laporan", "Laporan Multi-Pihak", nLap],
    ["nelayan", "Verifikasi Nelayan", nNel + nFoto],
  ] as const;

  const t = tiket.find((x) => x.id === sel);
  const patchT = (id: number, f: (x: Tiket) => Tiket) => setTiket((ts) => ts.map((x) => (x.id === id ? f(x) : x)));
  const kirim = () => {
    if (!t || !reply.trim()) return;
    patchT(t.id, (x) => ({ ...x, msgs: [...x.msgs, { me: true, text: reply.trim() }] }));
    setReply("");
  };

  const jadikanFaq = () => {
    const q = t?.msgs.find((m) => !m.me)?.text,
      a = [...(t?.msgs ?? [])].reverse().find((m) => m.me)?.text;
    if (!q || !a) return flash("Perlu pertanyaan pembeli dan jawaban admin dulu");
    setFaq((f) => [...f, { id: Date.now(), kategori: KAT[4], pertanyaan: q, jawaban: a }]);
    flash("Ditambahkan ke FAQ");
  };

  const displayedNel = nel.filter((n) => {
    const matchSearch =
      n.nama.toLowerCase().includes(searchNel.toLowerCase()) ||
      n.titik.toLowerCase().includes(searchNel.toLowerCase());
    const matchFilter =
      filterNel === "Semua"
        ? true
        : filterNel === "Perlu Aksi"
        ? n.status === "Menunggu" || n.status === "Banding"
        : n.status === filterNel;
    return matchSearch && matchFilter;
  });

  const displayedFoto = fotoIkan.filter((f) => {
    const matchSearch =
      f.ikan.toLowerCase().includes(searchFoto.toLowerCase()) ||
      f.nelayan.toLowerCase().includes(searchFoto.toLowerCase());
    const matchFilter = filterFoto === "Semua" ? true : filterFoto === "Menunggu" ? f.status === "Menunggu" : f.status === filterFoto;
    return matchSearch && matchFilter;
  });

  const displayedLap = lap
    .filter((l) => {
      const q = searchLap.toLowerCase();
      const matchSearch =
        l.pelapor.toLowerCase().includes(q) ||
        l.terlapor.toLowerCase().includes(q) ||
        l.alasan.toLowerCase().includes(q) ||
        l.jenis.toLowerCase().includes(q);

      const matchRole =
        filterLapRole === "Semua"
          ? true
          : filterLapRole === "Perlu Tindakan"
          ? !l.selesai
          : filterLapRole === "Selesai"
          ? l.selesai
          : l.pelaporRole === filterLapRole || l.terlaporRole === filterLapRole;

      return matchSearch && matchRole;
    })
    .sort((a, b) => {
      if (sortLap === "terbaru") return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
      if (sortLap === "terlama") return new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
      if (sortLap === "prioritas") {
        const pMap: Record<Prioritas, number> = { Tinggi: 3, Sedang: 2, Rendah: 1 };
        return pMap[b.prioritas] - pMap[a.prioritas];
      }
      return 0;
    });

  const toggleNel = (id: number) =>
    setSelNel((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleFoto = (id: number) =>
    setSelFoto((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleSemuaNel = () =>
    setSelNel(
      selNel.length > 0
        ? []
        : displayedNel.filter((n) => n.status === "Menunggu" || n.status === "Banding").map((n) => n.id)
    );

  const toggleSemuaFoto = () =>
    setSelFoto(selFoto.length > 0 ? [] : displayedFoto.filter((f) => f.status === "Menunggu").map((f) => f.id));

  const bulkSetujuNel = () => {
    setNel((ns) => ns.map((n) => (selNel.includes(n.id) ? { ...n, status: "Aktif", adminVerif: ADMIN_ID } : n)));
    setSelNel([]);
    flash(`${selNel.length} Akun Nelayan disetujui`);
  };

  const bulkSetujuFoto = () => {
    setFotoIkan((fs) => fs.map((f) => (selFoto.includes(f.id) ? { ...f, status: "Disetujui", adminVerif: ADMIN_ID } : f)));
    setSelFoto([]);
    flash(`${selFoto.length} Foto Ikan disetujui`);
  };

  const eksekusiKonfirmasi = async () => {
  if (!confirm) return;
  const alasan = alasanInput.trim();

  if (!alasan) {
    flash("Catatan/Alasan tindakan wajib diisi!");
    return;
  }

  try {
    if (confirm.type === "nelayan") {
      // Update ke Tabel Supabase 'nelayan'
      const { error } = await supabase
        .from("nelayan")
        .update({
          status: confirm.targetStatus,
          keterangan: alasan,
          admin_verif: ADMIN_ID,
        })
        .eq("id", confirm.id);

      if (error) console.warn("Supabase Warning (Nelayan):", error.message);

      // Update Tampilan UI Lokal
      setNel((ns) =>
        ns.map((n) =>
          n.id === confirm.id
            ? { ...n, status: confirm.targetStatus as Nel["status"], adminVerif: ADMIN_ID, keterangan: alasan }
            : n
        )
      );
      setDetailNel(null);
    } else if (confirm.type === "foto") {
      // Update ke Tabel Supabase 'foto_ikan' (opsional jika ada tabelnya)
      await supabase
        .from("foto_ikan")
        .update({
          status: confirm.targetStatus,
          keterangan: alasan,
          admin_verif: ADMIN_ID,
        })
        .eq("id", confirm.id);

      setFotoIkan((fs) =>
        fs.map((f) =>
          f.id === confirm.id
            ? { ...f, status: confirm.targetStatus as FotoIkan["status"], adminVerif: ADMIN_ID, keterangan: alasan }
            : f
        )
      );
      setDetailFoto(null);
    } else if (confirm.type === "laporan") {
      // Update ke Tabel Supabase 'laporan'
      const { error } = await supabase
        .from("laporan")
        .update({
          selesai: true,
          tindakan: confirm.targetStatus,
          alasan_tindakan: alasan,
          admin_verif: ADMIN_ID,
        })
        .eq("id", confirm.id);

      if (error) console.warn("Supabase Warning (Laporan):", error.message);

      setLap((ls) =>
        ls.map((l) =>
          l.id === confirm.id
            ? {
                ...l,
                selesai: true,
                tindakan: confirm.targetStatus,
                alasanTindakan: alasan,
                adminVerif: ADMIN_ID,
              }
            : l
        )
      );
    }

    flash(`Tindakan berhasil disimpan oleh ${ADMIN_ID}`);
  } catch (err) {
    console.error("Error eksekusi:", err);
    flash("Gagal memperbarui database!");
  } finally {
    setConfirm(null);
    setAlasanInput("");
  }
};

  const simpanSandiBaru = () => {
    if (!formSandi.lama || !formSandi.baru || !formSandi.konfirmasi) {
      flash("Semua kolom kata sandi wajib diisi!");
      return;
    }
    if (formSandi.baru !== formSandi.konfirmasi) {
      flash("Konfirmasi kata sandi baru tidak cocok!");
      return;
    }
    setFormSandi({ lama: "", baru: "", konfirmasi: "" });
    setModalKeamanan(false);
    flash("Kata sandi berhasil diperbarui!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-surface/30 to-white font-body text-ink">
      <header className="sticky top-0 z-30 border-b border-soft/40 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="JalaLink" width={110} height={36} className="object-contain" />
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map(([k, l, n]) => (
              <button
                key={k}
                onClick={() => {
                  setTab(k as Tab);
                  setSel(null);
                }}
                className={`flex items-center gap-2 rounded-full px-4 py-2 font-sub text-sm font-semibold transition-all ${
                  tab === k ? "bg-[#0d7a87] text-white shadow-sm" : "text-ink hover:bg-surface"
                }`}
              >
                <span>{l}</span>
                {n > 0 && (
                  <span
                    className={`grid size-5 place-items-center rounded-full text-[11px] font-bold ${
                      tab === k ? "bg-white text-[#0d7a87]" : "bg-[#0d7a87] text-white"
                    }`}
                  >
                    {n}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="relative flex items-center" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1 transition-transform active:scale-95 cursor-pointer"
            >
              <span className="rounded-full bg-[#0d7a87] px-4 py-1.5 font-sub text-sm font-bold text-white shadow-sm">
                {adminProfile.role}
              </span>
              <div className="grid size-10 place-items-center rounded-full bg-[#0d7a87] font-sub text-base font-bold text-white shadow-md">
                {adminProfile.nama.charAt(0).toUpperCase()}
              </div>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-3xl border border-soft/60 bg-white p-2 shadow-2xl z-50">
                <div className="border-b border-soft/40 p-3">
                  <p className="font-sub text-sm font-bold text-ink">{adminProfile.nama}</p>
                  <p className="text-xs text-ink/60 truncate">{adminProfile.email}</p>
                  <span className="mt-1 inline-block rounded bg-ink/10 px-2 py-0.5 text-[10px] font-bold text-ink">
                    ID: {adminProfile.kode}
                  </span>
                </div>
                <div className="py-1 text-xs font-semibold">
                  <button
                    onClick={() => {
                      setTempProfile({ ...adminProfile });
                      setModalEditProfil(true);
                      setUserMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-ink hover:bg-surface"
                  >
                    <User size={16} /> Profil Staf
                  </button>

                  <button
                    onClick={() => {
                      setModalKeamanan(true);
                      setUserMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-ink hover:bg-surface"
                  >
                    <KeyRound size={16} /> Keamanan & Sandi
                  </button>
                </div>
                <div className="border-t border-soft/40 pt-1">
                  <button
                    onClick={() => router.push("/login")}
                    className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} /> Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {toast && (
        <div className="fixed left-1/2 top-4 z-[60] -translate-x-1/2 rounded-2xl bg-ink/95 px-5 py-3 font-sub text-sm font-medium text-white shadow-2xl">
          {toast}
        </div>
      )}

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 pb-28 md:pb-10">
        {tab === "ringkasan" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-heading text-2xl font-bold">Dashboard Admin Operasional</h1>
              <p className="text-sm text-ink/60">
                Pusat verifikasi pendaftaran nelayan, validasi foto ikan, laporan pelanggaran, dan bantuan.
              </p>
            </div>

            <div className="rounded-2xl border border-soft/60 bg-surface/50 p-4 text-xs space-y-1">
              <span className="font-bold text-[#0d7a87] uppercase text-[11px] block">Akses Otorisasi Sistem:</span>
              <p className="text-ink/80">
                1. <b>Admin Ops ({adminProfile.nama})</b> - Pengelolaan Verifikasi, Laporan Multi-Pihak, dan Bantuan.
              </p>
              <p className="text-ink/80">
                2. <b>Super Admin (Owner)</b> - Pengelolaan Tarif, Komisi Margin, Titik Hub, dan Mitra Transport.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {[
                ["Tiket Bantuan Aktif", nTiket, "bantuan"],
                ["Laporan Multi-Pihak Pending", nLap, "laporan"],
                ["Antrean Verifikasi Nelayan", nNel + nFoto, "nelayan"],
              ].map(([l, v, k]) => (
                <button
                  key={l}
                  onClick={() => setTab(k as Tab)}
                  className="rounded-3xl border border-soft/60 bg-white p-5 text-left transition-all hover:border-[#0d7a87] hover:shadow-lg"
                >
                  <p className="text-sm font-medium text-ink/70">{l}</p>
                  <p className="mt-3 font-heading text-3xl font-bold text-[#0d7a87]">{v}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "bantuan" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="font-heading text-2xl font-bold">Bantuan & FAQ</h1>
              <div className="flex gap-2">
                {([["chat", "Chat Pembeli"], ["faq", "Kelola FAQ"]] as const).map(([k, l]) => (
                  <button
                    key={k}
                    onClick={() => setBsub(k)}
                    className={`rounded-full border px-4 py-2 font-sub text-sm font-semibold transition-all ${
                      bsub === k ? "border-[#0d7a87] bg-[#0d7a87] text-white" : "border-soft bg-white text-ink"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {bsub === "chat" ? (
              <div className="grid gap-4 md:grid-cols-[300px_1fr]">
                <div className={`space-y-2 ${sel !== null ? "hidden md:block" : ""}`}>
                  {tiket.map((x) => (
                    <button
                      key={x.id}
                      onClick={() => setSel(x.id)}
                      className={`w-full rounded-2xl p-3.5 text-left transition-all ${
                        sel === x.id ? "bg-[#0d7a87]/10 ring-2 ring-[#0d7a87]" : "bg-surface/70 hover:bg-surface"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <b className="font-sub">{x.pembeli}</b>
                        {x.selesai ? <Pill dark>Selesai</Pill> : <Pill>Terbuka</Pill>}
                      </div>
                      <p className="truncate text-sm text-ink/60 mt-1">{x.topik}</p>
                    </button>
                  ))}
                </div>

                <div
                  className={`h-[65vh] flex-col overflow-hidden rounded-3xl border border-soft/60 bg-white ${
                    sel === null ? "hidden md:flex" : "flex"
                  }`}
                >
                  {!t ? (
                    <p className="m-auto text-sm text-ink/60">Pilih tiket untuk membalas.</p>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 border-b border-soft/30 p-3.5 bg-surface/30">
                        <button
                          onClick={() => setSel(null)}
                          className="grid size-9 place-items-center rounded-full bg-[#0d7a87] text-white md:hidden"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <div className="flex-1">
                          <p className="font-sub font-bold">{t.pembeli}</p>
                          <p className="text-xs text-ink/60">{t.topik}</p>
                        </div>
                        <button onClick={jadikanFaq} className={out}>
                          Jadikan FAQ
                        </button>
                        <button
                          onClick={() => patchT(t.id, (x) => ({ ...x, selesai: !x.selesai }))}
                          className={pri}
                        >
                          {t.selesai ? "Buka lagi" : "Selesaikan"}
                        </button>
                      </div>

                      <div className="flex-1 space-y-2.5 overflow-y-auto bg-surface/40 p-4">
                        {t.msgs.map((m, i) => (
                          <div
                            key={i}
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                              m.me
                                ? "ml-auto rounded-br-sm bg-[#0d7a87] text-white"
                                : "rounded-bl-sm bg-white border border-soft/40"
                            }`}
                          >
                            {m.text}
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2 border-t border-soft/30 p-3.5">
                        <select
                          value=""
                          onChange={(e) =>
                            setReply(faq.find((f) => f.id === Number(e.target.value))?.jawaban ?? "")
                          }
                          className={inp}
                        >
                          <option value="">Sisipkan jawaban dari FAQ...</option>
                          {faq.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.pertanyaan}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <input
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && kirim()}
                            placeholder="Tulis balasan..."
                            className={inp}
                          />
                          <button onClick={kirim} className={`${pri} px-4`}>
                            <Send size={18} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {faq.map((f) => (
                  <div key={f.id} className={`${card} space-y-2`}>
                    <div className="flex gap-2">
                      <select
                        value={f.kategori}
                        onChange={(e) =>
                          setFaq((a) => a.map((x) => (x.id === f.id ? { ...x, kategori: e.target.value } : x)))
                        }
                        className={inp}
                      >
                        {KAT.map((k) => (
                          <option key={k}>{k}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setFaq((a) => a.filter((x) => x.id !== f.id))}
                        className="grid size-11 shrink-0 place-items-center rounded-2xl border border-soft/60 bg-white text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <input
                      value={f.pertanyaan}
                      onChange={(e) =>
                        setFaq((a) => a.map((x) => (x.id === f.id ? { ...x, pertanyaan: e.target.value } : x)))
                      }
                      className={inp}
                      placeholder="Pertanyaan"
                    />
                    <textarea
                      value={f.jawaban}
                      rows={2}
                      onChange={(e) =>
                        setFaq((a) => a.map((x) => (x.id === f.id ? { ...x, jawaban: e.target.value } : x)))
                      }
                      className={`${inp} h-auto py-2.5`}
                      placeholder="Jawaban"
                    />
                  </div>
                ))}
                <button
                  onClick={() =>
                    setFaq((a) => [...a, { id: Date.now(), kategori: KAT[0], pertanyaan: "", jawaban: "" }])
                  }
                  className={`${out} flex items-center gap-2`}
                >
                  <Plus size={16} /> Tambah FAQ
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB LAPORAN MULTI-PIHAK (UI PROPORSI DAN TRANSPARANSI TINDAKAN ADMIN) */}
        {tab === "laporan" && (
          <div className="space-y-4">
            <div>
              <h1 className="font-heading text-2xl font-bold">Laporan Pelanggaran Multi-Pihak</h1>
              <p className="text-sm text-ink/60">
                Menerima laporan dari Kurir Hub, Mitra Transport, Nelayan, dan Pembeli.
              </p>
            </div>

            {/* FILTER DAN SORTING DENGAN IKON FILTER YANG TEPAT */}
            <div className="flex flex-col gap-3 rounded-3xl bg-surface/80 p-4 border border-soft/60 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 md:max-w-xs">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
                <input
                  type="text"
                  placeholder="Cari pelapor, terlapor, keluhan..."
                  value={searchLap}
                  onChange={(e) => setSearchLap(e.target.value)}
                  className={`${inp} h-10 pl-9 text-xs`}
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto hide-scrollbar">
                {["Semua", "Perlu Tindakan", "Kurir Hub", "Mitra Transport", "Nelayan", "Pembeli", "Selesai"].map(
                  (f) => (
                    <button
                      key={f}
                      onClick={() => setFilterLapRole(f)}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                        filterLapRole === f
                          ? "bg-[#0d7a87] text-white shadow-sm"
                          : "bg-white text-ink border border-soft/60 hover:bg-surface"
                      }`}
                    >
                      {f}
                    </button>
                  )
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 border-t border-soft/40 pt-2 md:border-t-0 md:pt-0">
                <SlidersHorizontal size={15} className="text-ink/60" />
                <select
                  value={sortLap}
                  onChange={(e) => setSortLap(e.target.value as any)}
                  className={`${inp} h-9 w-36 text-xs font-semibold py-0`}
                >
                  <option value="terbaru">Terbaru</option>
                  <option value="terlama">Terlama</option>
                  <option value="prioritas">Prioritas Tinggi</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {displayedLap.length === 0 ? (
                <div className="col-span-full py-12 text-center text-sm text-ink/50 bg-white rounded-3xl border border-soft/60">
                  Tidak ada laporan yang sesuai dengan pencarian atau filter saat ini.
                </div>
              ) : (
                displayedLap.map((l) => {
                  const pColor =
                    l.prioritas === "Tinggi"
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : l.prioritas === "Sedang"
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-blue-100 text-blue-700 border border-blue-200";

                  return (
                    <div key={l.id} className={`${card} space-y-3 bg-white`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Pill>{l.jenis}</Pill>
                          {/* UKURAN BADGE PRIORITAS PROPORSI RAPI (TIDAK JUMBO) */}
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${pColor}`}>
                            Prioritas: {l.prioritas}
                          </span>
                        </div>
                        {l.selesai ? (
                          <Pill dark>{l.tindakan || "Selesai"}</Pill>
                        ) : (
                          <span className="text-[11px] font-bold text-[#0d7a87] bg-[#0d7a87]/10 px-2.5 py-0.5 rounded-full">
                            Perlu Tindakan
                          </span>
                        )}
                      </div>

                      <div>
                        <b className="font-heading text-base text-ink block">{l.alasan}</b>
                        <div className="mt-1 text-xs text-ink/70 space-y-0.5">
                          <p>
                            Pelapor ({l.pelaporRole}): <b>{l.pelapor}</b>
                          </p>
                          <p>
                            Terlapor ({l.terlaporRole}): <b>{l.terlapor}</b>
                          </p>
                          <p className="text-[11px] text-ink/40">Waktu Laporan: {l.tanggal}</p>
                        </div>
                      </div>

                      {/* KHUSUS BUKTI FILE HANYA JIKA ADA (LOGISTIK/DOKUMEN) */}
                      {l.bukti && l.bukti.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-ink/50 uppercase">Bukti Terlampir:</span>
                          <div className="flex flex-wrap gap-2">
                            {l.bukti.map((b) => (
                              <button
                                key={b}
                                onClick={() => setPreviewBukti(b)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-soft/80 bg-surface px-3 py-1 text-xs font-medium text-[#0d7a87] hover:border-[#0d7a87] hover:bg-[#0d7a87]/5 transition-colors"
                              >
                                <FileText size={14} />
                                <span>{b}</span>
                                <Eye size={12} className="text-[#0d7a87]/60" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* CHAT LOG HANYA MENAMPILKAN TEKS "LIHAT PERCAKAPAN" */}
                      {l.chatLog && (
                        <div className="rounded-2xl border border-soft/60 bg-surface/50 p-3">
                          <button
                            onClick={() => setBukaChat(bukaChat === l.id ? null : l.id)}
                            className="text-xs font-bold text-[#0d7a87] hover:underline"
                          >
                            {bukaChat === l.id ? "Sembunyikan Percakapan" : "Lihat Percakapan"}
                          </button>
                          {bukaChat === l.id && (
                            <div className="mt-2 space-y-2 border-t border-soft/40 pt-2">
                              {l.chatLog.map((chat, idx) => (
                                <div key={idx} className="text-xs">
                                  <b className="text-ink">{chat.sender}:</b>{" "}
                                  <span className="text-ink/80">{chat.text}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* INFORMASI TRANSAKSI DAN CATATAN ALASAN TINDAKAN ADMIN (DILIHAT PELAPOR & TERLAPOR) */}
                      {l.selesai ? (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs space-y-1">
                          <p className="font-bold text-emerald-800">
                            Tindakan Admin: {l.tindakan} oleh {l.adminVerif}
                          </p>
                          <p className="text-emerald-700 italic">
                            &quot;Catatan Alasan: {l.alasanTindakan || "Telah ditindaklanjuti sesuai regulasi."}&quot;
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-soft/40">
                          <button
                            onClick={() =>
                              setConfirm({
                                id: l.id,
                                type: "laporan",
                                aksi: "Peringatkan Pihak Terlapor",
                                targetStatus: "Peringatan Dikirim",
                              })
                            }
                            className={`${out} text-xs h-9 px-3`}
                          >
                            Peringatkan Terlapor
                          </button>
                          <button
                            onClick={() =>
                              setConfirm({
                                id: l.id,
                                type: "laporan",
                                aksi: "Sanksi Pihak Terlapor",
                                targetStatus: "Akun Dibekukan",
                              })
                            }
                            className={`${out} text-xs h-9 px-3 border-red-300 text-red-600 hover:bg-red-50`}
                          >
                            Sanksi Terlapor
                          </button>
                          <button
                            onClick={() =>
                              setConfirm({
                                id: l.id,
                                type: "laporan",
                                aksi: "Selesaikan Laporan",
                                targetStatus: "Selesai (Refund/Kompensasi)",
                              })
                            }
                            className={`${pri} text-xs h-9 px-4 ml-auto`}
                          >
                            Selesaikan Laporan
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {tab === "nelayan" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-heading text-2xl font-bold">Verifikasi Operasional</h1>
              <p className="text-sm text-ink/60">
                Verifikasi pendaftaran nelayan baru dan validasi foto tangkapan sebelum disetujui publik.
              </p>
            </div>

            <div className="flex border-b border-soft/60 gap-4">
              <button
                onClick={() => setSubTabVerif("nelayan")}
                className={`pb-3 font-sub text-sm font-bold transition-all relative ${
                  subTabVerif === "nelayan"
                    ? "text-[#0d7a87] border-b-2 border-[#0d7a87]"
                    : "text-ink/50 hover:text-ink"
                }`}
              >
                Pendaftaran Akun Nelayan ({nNel})
              </button>
              <button
                onClick={() => setSubTabVerif("foto")}
                className={`pb-3 font-sub text-sm font-bold transition-all relative ${
                  subTabVerif === "foto"
                    ? "text-[#0d7a87] border-b-2 border-[#0d7a87]"
                    : "text-ink/50 hover:text-ink"
                }`}
              >
                Validasi Foto Tangkapan ({nFoto})
              </button>
            </div>

            {subTabVerif === "nelayan" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative flex-1 sm:max-w-xs">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
                    <input
                      type="text"
                      placeholder="Cari nama atau titik..."
                      value={searchNel}
                      onChange={(e) => setSearchNel(e.target.value)}
                      className={`${inp} h-10 pl-9 text-xs`}
                    />
                  </div>

                  {displayedNel.filter((n) => n.status === "Menunggu" || n.status === "Banding").length > 0 && (
                    <div className="flex gap-2">
                      <button onClick={toggleSemuaNel} className={`${out} text-xs h-9 px-3`}>
                        {selNel.length ? "Batal" : "Pilih Semua"}
                      </button>
                      {selNel.length > 0 && (
                        <button onClick={bulkSetujuNel} className={`${pri} text-xs h-9 px-3`}>
                          <Check size={14} /> Setujui ({selNel.length})
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {displayedNel.map((n) => (
                    <div key={n.id} className={`${card} bg-white space-y-3`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {(n.status === "Menunggu" || n.status === "Banding") && (
                            <input
                              type="checkbox"
                              checked={selNel.includes(n.id)}
                              onChange={() => toggleNel(n.id)}
                              className="size-4 accent-[#0d7a87] cursor-pointer"
                            />
                          )}
                          <b className="font-heading text-lg">{n.nama}</b>
                        </div>
                        <Pill dark={n.status !== "Menunggu" && n.status !== "Banding"}>{n.status}</Pill>
                      </div>

                      <p className="text-xs text-ink/70 flex items-center gap-1">
                        <MapPin size={14} className="text-[#0d7a87]" />
                        {n.titik} · {n.daerah}
                      </p>

                      <div className="rounded-2xl bg-surface/80 p-3 border border-soft/60 text-xs space-y-1">
                        <p className="text-ink/60">
                          Status Dokumen: <b>{n.dok}</b>
                        </p>
                        <p className="text-[11px] text-[#0d7a87] font-semibold">
                          Wajib buka dan tinjau berkas fisik di bawah sebelum melakukan persetujuan.
                        </p>
                      </div>

                      <button
                        onClick={() => setDetailNel(n.id)}
                        className={`${pri} w-full text-xs h-10 flex items-center justify-center gap-2`}
                      >
                        <Eye size={16} /> Lihat & Periksa Dokumen Fisik/KTP
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {subTabVerif === "foto" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative flex-1 sm:max-w-xs">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
                    <input
                      type="text"
                      placeholder="Cari ikan atau nelayan..."
                      value={searchFoto}
                      onChange={(e) => setSearchFoto(e.target.value)}
                      className={`${inp} h-10 pl-9 text-xs`}
                    />
                  </div>

                  {displayedFoto.filter((f) => f.status === "Menunggu").length > 0 && (
                    <div className="flex gap-2">
                      <button onClick={toggleSemuaFoto} className={`${out} text-xs h-9 px-3`}>
                        {selFoto.length ? "Batal" : "Pilih Semua"}
                      </button>
                      {selFoto.length > 0 && (
                        <button onClick={bulkSetujuFoto} className={`${pri} text-xs h-9 px-3`}>
                          <Check size={14} /> Setujui ({selFoto.length})
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {displayedFoto.map((f) => (
                    <div key={f.id} className={`${card} bg-white space-y-3`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <b className="font-heading text-lg block">{f.ikan}</b>
                          <span className="text-xs text-ink/60">Nelayan: {f.nelayan}</span>
                        </div>
                        <Pill dark={f.status !== "Menunggu"}>{f.status}</Pill>
                      </div>

                      <div className="rounded-2xl border border-soft/60 bg-surface/50 p-4 text-center space-y-2">
                        <FileText size={32} className="mx-auto text-[#0d7a87]" />
                        <b className="text-xs text-ink block">{f.foto}</b>
                        <span className="text-[11px] text-ink/50 block">
                          Disertai Geotag Waktu Subuh & Kebersihan Mata Ikan
                        </span>
                      </div>

                      <button
                        onClick={() => setDetailFoto(f.id)}
                        className={`${pri} w-full text-xs h-10 flex items-center justify-center gap-2`}
                      >
                        <Eye size={16} /> Pratinjau Foto & Validasi Kesegaran
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL VERIFIKASI DOKUMEN NELAYAN */}
      {detailNel !== null && nel.find((n) => n.id === detailNel) && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/75 p-4 backdrop-blur-sm">
          {(() => {
            const d = nel.find((n) => n.id === detailNel)!;
            const perluAksi = d.status === "Menunggu" || d.status === "Banding";
            return (
              <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-soft/40 bg-surface/50 p-4">
                  <h3 className="font-heading text-lg font-bold">Pemeriksaan Berkas Nelayan</h3>
                  <button
                    onClick={() => setDetailNel(null)}
                    className="rounded-full bg-white p-1 text-ink/50 shadow-sm border border-soft/50"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-sub text-lg font-bold">{d.nama}</p>
                      <p className="text-xs text-ink/60">{d.titik} · {d.daerah}</p>
                    </div>
                    <Pill dark={!perluAksi}>{d.status}</Pill>
                  </div>

                  <div className="space-y-2 rounded-2xl bg-surface/60 p-4 border border-soft/60 text-xs">
                    <b className="font-bold text-[#0d7a87] uppercase text-[11px] block">Rincian Hasil Pengecekan Sistem:</b>
                    <p>Identitas KTP & Surat: {d.dok}</p>
                    <p>Selfie Wajah KTP: {d.selfie || "Terlampir"}</p>
                    <p>Rekening Bank: {d.rek || "Sesuai"}</p>
                    <p>Geotag Koordinat TPI: {d.geotag || "Radius Sesuai"}</p>
                  </div>

                  <div className="rounded-2xl border-2 border-dashed border-[#0d7a87]/40 bg-[#0d7a87]/5 p-6 text-center space-y-2">
                    <FileText size={36} className="mx-auto text-[#0d7a87]" />
                    <b className="text-sm font-sub text-ink block">{d.dok}</b>
                    <span className="text-[11px] text-ink/60 block">
                      Dokumen KTP & Surat Pengepul Terverifikasi Digital
                    </span>
                  </div>

                  {perluAksi && (
                    <div className="flex gap-3 pt-3 border-t border-soft/40">
                      <button
                        onClick={() =>
                          setConfirm({
                            id: d.id,
                            type: "nelayan",
                            aksi: "Tolak Pendaftaran",
                            targetStatus: "Ditolak",
                          })
                        }
                        className={`${out} flex-1 border-red-300 text-red-600 hover:bg-red-50`}
                      >
                        Tolak Akun
                      </button>
                      <button
                        onClick={() =>
                          setConfirm({
                            id: d.id,
                            type: "nelayan",
                            aksi: "Setujui Akun Nelayan",
                            targetStatus: "Aktif",
                          })
                        }
                        className={`${pri} flex-1`}
                      >
                        Setujui Akun (ACC)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* MODAL VERIFIKASI FOTO IKAN */}
      {detailFoto !== null && fotoIkan.find((f) => f.id === detailFoto) && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/75 p-4 backdrop-blur-sm">
          {(() => {
            const f = fotoIkan.find((f) => f.id === detailFoto)!;
            const perluAksi = f.status === "Menunggu";
            return (
              <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-soft/40 bg-surface/50 p-4">
                  <h3 className="font-heading text-lg font-bold">Validasi Foto Ikan Segar</h3>
                  <button
                    onClick={() => setDetailFoto(null)}
                    className="rounded-full bg-white p-1 text-ink/50 shadow-sm border border-soft/50"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-sub text-lg font-bold">{f.ikan}</p>
                      <p className="text-xs text-ink/60">Nelayan: {f.nelayan}</p>
                    </div>
                    <Pill dark={!perluAksi}>{f.status}</Pill>
                  </div>

                  <div className="flex h-52 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#0d7a87]/40 bg-surface/50 p-4 text-center space-y-2">
                    <FileText size={40} className="text-[#0d7a87]" />
                    <p className="text-sm font-bold text-ink">{f.foto}</p>
                  </div>
                  <p className="text-xs text-center text-ink/60">
                    Pastikan insang merah segar, mata jernih, dan tidak menggunakan stok foto internet.
                  </p>

                  {perluAksi && (
                    <div className="flex gap-3 pt-2 border-t border-soft/40">
                      <button
                        onClick={() =>
                          setConfirm({
                            id: f.id,
                            type: "foto",
                            aksi: "Tolak Foto Tangkapan",
                            targetStatus: "Ditolak",
                          })
                        }
                        className={`${out} flex-1 border-red-300 text-red-600 hover:bg-red-50`}
                      >
                        Tolak Foto
                      </button>
                      <button
                        onClick={() =>
                          setConfirm({
                            id: f.id,
                            type: "foto",
                            aksi: "Setujui Foto Tangkapan",
                            targetStatus: "Disetujui",
                          })
                        }
                        className={`${pri} flex-1`}
                      >
                        Setujui Foto
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* MODAL PRATINJAU BUKTI FILE (LOGISTIK) */}
      {previewBukti !== null && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-ink/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-soft/40 pb-3">
              <h3 className="font-heading text-lg font-bold flex items-center gap-2 text-[#0d7a87]">
                <FileText size={20} /> Pratinjau Dokumen Laporan
              </h3>
              <button
                onClick={() => setPreviewBukti(null)}
                className="rounded-full bg-surface p-1 text-ink/50 hover:bg-soft/40"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center space-y-3 rounded-2xl border-2 border-dashed border-soft/80 bg-surface/50 p-8 text-center">
              <div className="grid size-16 place-items-center rounded-2xl bg-[#0d7a87]/10 text-[#0d7a87]">
                <FileText size={36} />
              </div>
              <div>
                <b className="font-sub text-base text-ink block">{previewBukti}</b>
                <span className="text-xs text-ink/50 mt-1 block">
                  Format Berkas: {previewBukti.endsWith(".pdf") ? "Dokumen Resmi PDF" : "Tangkapan Gambar JPG/PNG"}
                </span>
              </div>
              <p className="text-xs text-ink/60 max-w-xs">
                File ini diunggah secara resmi oleh pelapor sebagai bukti validasi operasional JalaLink.
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-soft/40">
              <button onClick={() => setPreviewBukti(null)} className={`${pri} h-9 text-xs px-5`}>
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KEAMANAN & SANDI */}
      {modalKeamanan && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-ink/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-soft/40 pb-3">
              <h3 className="font-heading text-lg font-bold flex items-center gap-2 text-[#0d7a87]">
                <KeyRound size={20} /> Keamanan & Kata Sandi Akun
              </h3>
              <button onClick={() => setModalKeamanan(false)} className="rounded-full bg-surface p-1 text-ink/50 hover:bg-soft/40">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-2xl border border-soft/60 bg-surface/50 p-4 space-y-3">
                <b className="font-sub font-bold text-ink flex items-center gap-1.5 text-sm">
                  <Lock size={16} className="text-[#0d7a87]" /> Ubah Kata Sandi Admin
                </b>
                <div>
                  <label className="block font-semibold text-ink/70 mb-1">Kata Sandi Saat Ini *</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formSandi.lama}
                    onChange={(e) => setFormSandi({ ...formSandi, lama: e.target.value })}
                    className={inp}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-ink/70 mb-1">Kata Sandi Baru *</label>
                    <input
                      type="password"
                      placeholder="Min 8 Karakter"
                      value={formSandi.baru}
                      onChange={(e) => setFormSandi({ ...formSandi, baru: e.target.value })}
                      className={inp}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-ink/70 mb-1">Konfirmasi Sandi Baru *</label>
                    <input
                      type="password"
                      placeholder="Ketik Ulang Sandi"
                      value={formSandi.konfirmasi}
                      onChange={(e) => setFormSandi({ ...formSandi, konfirmasi: e.target.value })}
                      className={inp}
                    />
                  </div>
                </div>
                <button onClick={simpanSandiBaru} className={`${pri} w-full text-xs h-9 mt-1`}>
                  Perbarui Kata Sandi
                </button>
              </div>

              <div className="rounded-2xl border border-soft/60 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 place-items-center rounded-xl bg-[#0d7a87]/10 text-[#0d7a87] shrink-0">
                      <Mail size={18} />
                    </div>
                    <div>
                      <b className="font-sub text-sm font-bold block text-ink">Pemulihan Kata Sandi via Email</b>
                      <span className="text-[11px] text-ink/60 block mt-0.5">
                        Target Email: <b className="text-[#0d7a87]">{adminProfile.email}</b>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      flash(`Kode OTP verifikasi dikirim ke ${adminProfile.email}`)
                    }
                    className={`${out} h-8 px-3 text-[11px] shrink-0`}
                  >
                    Kirim OTP
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-soft/60 bg-white p-4 space-y-2">
                <b className="font-sub text-xs font-bold text-ink/70 uppercase tracking-wider block">
                  Sesi Login Perangkat Saat Ini
                </b>
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <div className="flex items-center gap-3">
                    <div className="grid size-8 place-items-center rounded-lg bg-surface text-ink/60">
                      <Laptop size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-ink">{deviceInfo.browser}</p>
                      <p className="text-ink/50">IP Publik: {deviceInfo.ip} · Status: Sesi Aktif</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 font-bold">
                    Aktif
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-soft/40">
              <button onClick={() => setModalKeamanan(false)} className={`${out} h-9 text-xs px-4`}>
                Tutup Keamanan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT PROFIL */}
      {modalEditProfil && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-ink/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-soft/40 pb-3">
              <h3 className="font-heading text-lg font-bold flex items-center gap-2 text-[#0d7a87]">
                <User size={20} /> Edit Profil Staf Admin Ops
              </h3>
              <button onClick={() => setModalEditProfil(false)} className="rounded-full bg-surface p-1 text-ink/50">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-ink/70 mb-1">Nama Lengkap Admin *</label>
                <input
                  type="text"
                  value={tempProfile.nama}
                  onChange={(e) => setTempProfile({ ...tempProfile, nama: e.target.value })}
                  className={inp}
                />
              </div>
              <div>
                <label className="block font-bold text-ink/70 mb-1">Email Staf Operasional *</label>
                <input
                  type="email"
                  value={tempProfile.email}
                  onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                  className={inp}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-soft/40">
              <button onClick={() => setModalEditProfil(false)} className={`${out} flex-1`}>
                Batal
              </button>
              <button
                onClick={() => {
                  setAdminProfile({ ...tempProfile });
                  setModalEditProfil(false);
                  flash("Profil staf diperbarui");
                }}
                className={`${pri} flex-1`}
              >
                Simpan Profil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI DENGAN CATATAN ALASAN ADMIN WAJIB */}
      {confirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-[#0d7a87]/10 text-[#0d7a87]">
                <AlertTriangle size={20} />
              </div>
              <h3 className="font-heading text-lg font-bold">Konfirmasi Tindakan</h3>
            </div>

            <p className="text-sm text-ink/70 mb-4">
              Apakah Anda ({ADMIN_ID}) yakin ingin mengambil eksekusi <b>{confirm.aksi.toLowerCase()}</b>?
            </p>

            <div className="mb-4 space-y-1.5">
              <label className="text-xs font-bold text-ink/70">
                Catatan Alasan Tindakan (Wajib Diisi) *
              </label>
              <textarea
                value={alasanInput}
                onChange={(e) => setAlasanInput(e.target.value)}
                className={`${inp} h-24 py-2.5 text-xs resize-none`}
                placeholder="Tuliskan alasan tindakan admin yang akan ditampilkan ke pelapor & terlapor..."
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-soft/40">
              <button
                onClick={() => {
                  setConfirm(null);
                  setAlasanInput("");
                }}
                className={`${out} flex-1`}
              >
                Batal
              </button>
              <button onClick={eksekusiKonfirmasi} className={`${pri} flex-1`}>
                Simpan & Kirim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}