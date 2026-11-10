"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  Home,
  SlidersHorizontal,
  LifeBuoy,
  ShieldAlert,
  Store,
  MapPin,
  Send,
  Check,
  X,
  Plus,
  Trash2,
  ChevronLeft,
  AlertTriangle,
  Search,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Building2,
  Truck,
  ShieldCheck,
  Eye,
  ExternalLink,
  User,
  LogOut,
  KeyRound,
  Camera,
  Lock,
  Shield,
  RefreshCw,
  Mail,
  Laptop,
} from "lucide-react";

// Inisialisasi Supabase Client (Ubah environment variable sesuai setup kamu)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
);

// Helper Utilities
const rp = (n: number) => "Rp" + n.toLocaleString("id-ID");
const ongkir = (flat: number, kg: number) =>
  kg <= 0 ? 0 : kg <= 1 ? flat : Math.round(flat + (kg - 1) * flat * 0.75);

const inp =
  "h-11 w-full rounded-2xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/10 transition-all";
const pri =
  "h-11 rounded-2xl bg-[#0E7C86] px-5 font-sub text-sm font-semibold text-white shadow-sm hover:bg-[#0E7C86]/90 active:scale-[0.98] transition-all disabled:opacity-40";
const out =
  "h-11 rounded-2xl border border-[#0E7C86] bg-white px-5 font-sub text-sm font-semibold text-[#0E7C86] hover:bg-slate-50 active:scale-[0.98] transition-all";
const card =
  "rounded-3xl bg-slate-50 border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow";

const Pill = ({ children, dark }: { children: React.ReactNode; dark?: boolean }) => (
  <span
    className={`rounded-full px-3 py-1 font-sub text-xs font-semibold ${
      dark ? "bg-slate-900 text-white" : "bg-[#0E7C86] text-white"
    }`}
  >
    {children}
  </span>
);

type Tab = "ringkasan" | "bantuan" | "laporan" | "nelayan" | "tarif" | "master";

type TitikHub = {
  id: number;
  nama: string;
  wilayah: string;
  alamat: string;
  kapasitas: string;
  skPerizinan: string;
  adminCreator: string;
};

type TransportComp = {
  id: number;
  nama: string;
  email: string;
  nib: string;
  telepon: string;
  penanggungJawab: string;
  jumlahArmada: number;
  dokumenLegal: string;
  status: "Menunggu" | "Disetujui" | "Ditolak";
  alasanPenolakan?: string;
  adminVerif?: string;
};

const TITIK0: TitikHub[] = [
  {
    id: 1,
    nama: "TPI Cilacap Hub",
    wilayah: "Kab. Cilacap, Jawa Tengah",
    alamat: "Jl. Pelabuhan Perikanan Samudera No. 12",
    kapasitas: "15 Ton",
    skPerizinan: "SK-DKP-CILACAP-2023.pdf",
    adminCreator: "Admin Utama (ADM-01)",
  },
  {
    id: 2,
    nama: "TPI Pangandaran Hub",
    wilayah: "Kab. Pangandaran, Jawa Barat",
    alamat: "Dusun Cikembulan, Sidamulih",
    kapasitas: "10 Ton",
    skPerizinan: "SK-DKP-PANGANDARAN-2024.pdf",
    adminCreator: "Admin Utama (ADM-01)",
  },
];

const TRANSO: TransportComp[] = [
  {
    id: 1,
    nama: "CV Trans Samudera Cold",
    email: "ops@transsamudera.id",
    nib: "9120008821034",
    telepon: "0813-9988-7766",
    penanggungJawab: "Rian Hidayat",
    jumlahArmada: 6,
    dokumenLegal: "NIB_TRANS_SAMUDERA.pdf",
    status: "Menunggu",
  },
  {
    id: 2,
    nama: "CV Bahari Cold Chain",
    email: "ops@bahari.id",
    nib: "9120004581291",
    telepon: "0812-3456-7890",
    penanggungJawab: "Hendra Wijaya",
    jumlahArmada: 8,
    dokumenLegal: "NIB_CV_BAHARI.pdf",
    status: "Disetujui",
    adminVerif: "Admin Utama (ADM-01)",
  },
];

export default function AdminTransportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("ringkasan");
  const [userEmail, setUserEmail] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [adminProfile, setAdminProfile] = useState({
    nama: "Admin Transport",
    email: "admin.transport@jalalink.com",
    role: "Super Admin",
    kode: "ADM-01",
  });

  const [titikList, setTitikList] = useState<TitikHub[]>(TITIK0);
  const [transList, setTransList] = useState<TransportComp[]>(TRANSO);
  const [modalTitik, setModalTitik] = useState(false);
  const [formTitik, setFormTitik] = useState({
    nama: "",
    wilayah: "",
    alamat: "",
    kapasitas: "",
    skPerizinan: "",
  });

  const [viewDokumen, setViewDokumen] = useState<{
    namaFile: string;
    judul: string;
  } | null>(null);
  const [toast, setToast] = useState("");

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // Autentikasi Pengguna
  useEffect(() => {
    async function checkAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) {
          // Jika tidak ada session auth, tetap beri opsi dev / fallback ke login jika perlu
          setUserEmail("Admin Mode");
        } else {
          setUserEmail(session.user.email || "Admin Transport");
        }
      } catch (err) {
        console.error("Auth check Error:", err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleTambahTitik = () => {
    if (!formTitik.nama || !formTitik.wilayah || !formTitik.alamat) {
      flash("Harap isi semua kolom wajib!");
      return;
    }
    const dataBaru: TitikHub = {
      id: Date.now(),
      nama: formTitik.nama.trim(),
      wilayah: formTitik.wilayah.trim(),
      alamat: formTitik.alamat.trim(),
      kapasitas: formTitik.kapasitas.trim() || "10 Ton",
      skPerizinan: formTitik.skPerizinan.trim() || "DOKUMEN_SK_RESMI.pdf",
      adminCreator: adminProfile.nama,
    };
    setTitikList((prev) => [...prev, dataBaru]);
    setFormTitik({ nama: "", wilayah: "", alamat: "", kapasitas: "", skPerizinan: "" });
    setModalTitik(false);
    flash("Titik Hub baru berhasil ditambahkan!");
  };

  const updateStatusTransport = (id: number, status: "Disetujui" | "Ditolak") => {
    setTransList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status, adminVerif: adminProfile.nama } : item
      )
    );
    flash(`Status mitra berhasil diubah menjadi ${status}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex items-center gap-2 font-semibold text-[#0E7C86]">
          <RefreshCw className="animate-spin" size={20} />
          <span>Memuat Dashboard Admin Transport...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-body text-slate-800">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed left-1/2 top-4 z-[60] -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Header Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="JalaLink"
              width={110}
              height={36}
              className="object-contain"
              priority
            />
            <span className="rounded-full bg-[#0E7C86]/10 px-2.5 py-0.5 text-xs font-bold text-[#0E7C86]">
              Admin Transport
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 rounded-full border border-slate-200 p-1.5 hover:bg-slate-100"
            >
              <div className="grid size-8 place-items-center rounded-full bg-[#0E7C86] text-xs font-bold text-white">
                {adminProfile.nama.charAt(0)}
              </div>
              <span className="text-xs font-semibold text-slate-700">{userEmail}</span>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} /> Keluar (Logout)
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sub Navbar Tabs */}
      <div className="border-b border-slate-200 bg-white px-4 py-2">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto">
          <button
            onClick={() => setTab("ringkasan")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              tab === "ringkasan"
                ? "bg-[#0E7C86] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Ringkasan Operasional
          </button>
          <button
            onClick={() => setTab("master")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              tab === "master"
                ? "bg-[#0E7C86] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Verifikasi Mitra Transport
          </button>
          <button
            onClick={() => setTab("tarif")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              tab === "tarif"
                ? "bg-[#0E7C86] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Titik Hub & Cold Storage
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl p-6">
        {tab === "ringkasan" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Dashboard Admin Transport
              </h1>
              <p className="text-xs text-slate-500">
                Pantau antrean armada, logistik cold chain, dan status verifikasi hub TPI.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">
                  Total Titik Hub Terverifikasi
                </p>
                <p className="mt-2 text-3xl font-bold text-[#0E7C86]">
                  {titikList.length}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">
                  Mitra Transport Disetujui
                </p>
                <p className="mt-2 text-3xl font-bold text-emerald-600">
                  {transList.filter((t) => t.status === "Disetujui").length}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">
                  Pendaftaran Menunggu Verifikasi
                </p>
                <p className="mt-2 text-3xl font-bold text-amber-500">
                  {transList.filter((t) => t.status === "Menunggu").length}
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === "master" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              Verifikasi Pendaftaran Perusahaan Transport
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {transList.map((x) => (
                <div
                  key={x.id}
                  className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900">{x.nama}</h3>
                      <p className="text-xs text-slate-500">
                        {x.email} • {x.telepon}
                      </p>
                    </div>
                    <Pill dark={x.status !== "Menunggu"}>{x.status}</Pill>
                  </div>

                  <div className="space-y-1 rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                    <p>
                      <b>NIB:</b> {x.nib}
                    </p>
                    <p>
                      <b>Penanggung Jawab:</b> {x.penanggungJawab}
                    </p>
                    <p>
                      <b>Armada Cold Truck:</b> {x.jumlahArmada} Unit
                    </p>
                  </div>

                  {x.status === "Menunggu" && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => updateStatusTransport(x.id, "Disetujui")}
                        className="flex-1 rounded-xl bg-[#0E7C86] py-2 text-xs font-bold text-white hover:bg-[#0E7C86]/90"
                      >
                        Setujui (Acc)
                      </button>
                      <button
                        onClick={() => updateStatusTransport(x.id, "Ditolak")}
                        className="flex-1 rounded-xl border border-red-200 bg-red-50 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
                      >
                        Tolak
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "tarif" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                Kelola Titik Hub & Cold Storage
              </h2>
              <button
                onClick={() => setModalTitik(true)}
                className="flex items-center gap-1.5 rounded-xl bg-[#0E7C86] px-3.5 py-2 text-xs font-bold text-white"
              >
                <Plus size={16} /> Tambah Titik Hub
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {titikList.map((x) => (
                <div
                  key={x.id}
                  className="space-y-2.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <b className="text-base font-bold text-slate-900">{x.nama}</b>
                      <span className="block text-xs font-semibold text-[#0E7C86]">
                        {x.wilayah}
                      </span>
                    </div>
                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                      Cap: {x.kapasitas}
                    </span>
                  </div>
                  <p className="flex items-start gap-1 text-xs text-slate-600">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-slate-400" />
                    {x.alamat}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal Tambah Titik Hub */}
      {modalTitik && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900">Tambah Titik Hub Resmi</h3>
              <button onClick={() => setModalTitik(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                placeholder="Nama Hub / TPI (Misal: TPI Cilacap Hub)"
                value={formTitik.nama}
                onChange={(e) => setFormTitik({ ...formTitik, nama: e.target.value })}
                className={inp}
              />
              <input
                placeholder="Wilayah / Kabupaten"
                value={formTitik.wilayah}
                onChange={(e) => setFormTitik({ ...formTitik, wilayah: e.target.value })}
                className={inp}
              />
              <textarea
                placeholder="Alamat Lengkap & Koordinat GPS"
                value={formTitik.alamat}
                onChange={(e) => setFormTitik({ ...formTitik, alamat: e.target.value })}
                className={`${inp} h-20 py-2`}
              />
              <input
                placeholder="Kapasitas Storage (Misal: 15 Ton)"
                value={formTitik.kapasitas}
                onChange={(e) =>
                  setFormTitik({ ...formTitik, kapasitas: e.target.value })
                }
                className={inp}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setModalTitik(false)}
                className="flex-1 rounded-xl border py-2 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleTambahTitik}
                className="flex-1 rounded-xl bg-[#0E7C86] py-2 text-xs font-bold text-white"
              >
                Simpan Titik
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}