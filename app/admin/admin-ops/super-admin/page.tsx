"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User,
  LogOut,
  KeyRound,
  AlertTriangle,
  Eye,
  Laptop,
  Mail,
  MapPin,
  Lock,
  X,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Inisialisasi Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kewjzlhgrkacyrjlboaa.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_1ygn0KH_eqk53JVTLib-gQ_NfcJyZNm"
);

const rp = (n: number) => "Rp" + n.toLocaleString("id-ID");
const ongkir = (flat: number, kg: number) =>
  kg <= 0 ? 0 : kg <= 1 ? flat : Math.round(flat + (kg - 1) * flat * 0.75);

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
    className={`rounded-full px-3 py-1 font-sub text-xs font-semibold leading-none ${
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

type Tab = "ringkasan" | "tarif" | "transport" | "tpi";

type TarifRute = {
  id: number | string;
  rute: string;
  aktif: number;
  tarifNormalMin: number;
  tarifNormalMax: number;
  usulan?: number;
  pengaju?: string;
  statusUsulan?: "Menunggu" | "Disetujui" | "Ditolak" | "Banding";
  alasanPenolakan?: string;
  alasanBanding?: string;
};

type MitraKerjasama = {
  id: number | string;
  namaPT: string;
  penanggungJawab: string;
  armadaCount: number;
  jenisTransport: "Cold Truck Refrigerator" | "Air Cargo Cold Chain" | "Motorized Cool Box";
  dokumenUsia: string;
  suratIzinUsaha: string;
  sertifikatColdStorage: string;
  polisAsuransi: string;
  status: "Menunggu Peninjauan" | "Aktif Terjalin" | "Ditolak";
  keterangan?: string;
};

type TPIData = {
  id: number | string;
  namaTPI: string;
  wilayah: string;
  kapasitasHarian: string;
  nelayanTerdaftar: number;
  statusHub: "Utama" | "Pengumpan";
};

// Data fallback jika Supabase belum ada isinya
const TARIF0: TarifRute[] = [
  { id: 1, rute: "Cilacap → Bandung", aktif: 8000, tarifNormalMin: 7500, tarifNormalMax: 9000 },
  { id: 2, rute: "Pangandaran → Bandung", aktif: 8000, tarifNormalMin: 7500, tarifNormalMax: 9500, usulan: 12000, pengaju: "CV Bahari Cold Chain", statusUsulan: "Menunggu" },
  { id: 3, rute: "Indramayu → Jakarta", aktif: 10000, tarifNormalMin: 9500, tarifNormalMax: 11000, usulan: 6000, pengaju: "PT Cold Logistic", statusUsulan: "Menunggu" },
  { id: 4, rute: "Pelabuhan Ratu → Bogor", aktif: 8500, tarifNormalMin: 8000, tarifNormalMax: 9500, usulan: 9000, pengaju: "CV Express Bahari", statusUsulan: "Banding", alasanPenolakan: "Tarif dinilai terlalu tinggi tanpa justifikasi armada.", alasanBanding: "Ada kenaikan tol operasional baru sebesar 15%." },
];

const DUMMY_MITRA: MitraKerjasama[] = [
  {
    id: 1,
    namaPT: "PT Samudera Logistik Cold",
    penanggungJawab: "Bambang Sukojo",
    armadaCount: 18,
    jenisTransport: "Cold Truck Refrigerator",
    dokumenUsia: "NIB_8120019201.pdf",
    suratIzinUsaha: "SIUPAL_Transport_Laut_2025.pdf",
    sertifikatColdStorage: "Sertifikat_HACCP_ColdChain.pdf",
    polisAsuransi: "Polis_Asuransi_Kargo_2026.pdf",
    status: "Menunggu Peninjauan",
  },
  {
    id: 2,
    namaPT: "CV Bahari Transit Ekspres",
    penanggungJawab: "Hendra Wijaya",
    armadaCount: 12,
    jenisTransport: "Motorized Cool Box",
    dokumenUsia: "NIB_9120839102.pdf",
    suratIzinUsaha: "Izin_Operasional_Dinas_Perhitungan.pdf",
    sertifikatColdStorage: "Sertifikat_Suhu_Pengangkut.pdf",
    polisAsuransi: "Asuransi_Barang_Transit.pdf",
    status: "Menunggu Peninjauan",
  },
  {
    id: 3,
    namaPT: "PT Nusantara Cargo Cold",
    penanggungJawab: "Siti Rahmawati",
    armadaCount: 8,
    jenisTransport: "Air Cargo Cold Chain",
    dokumenUsia: "NIB_1029381029.pdf",
    suratIzinUsaha: "SIU_Kargo_Udara.pdf",
    sertifikatColdStorage: "IATA_Temperature_Control.pdf",
    polisAsuransi: "Asuransi_Penerbangan_Kargo.pdf",
    status: "Aktif Terjalin",
  },
];

const DUMMY_TPI: TPIData[] = [
  { id: 1, namaTPI: "TPI Pelabuhan Perikanan Samudera Cilacap", wilayah: "Cilacap, Jawa Tengah", kapasitasHarian: "15 Ton / Hari", nelayanTerdaftar: 142, statusHub: "Utama" },
  { id: 2, namaTPI: "TPI Pangandaran Timur", wilayah: "Pangandaran, Jawa Barat", kapasitasHarian: "8 Ton / Hari", nelayanTerdaftar: 86, statusHub: "Utama" },
  { id: 3, namaTPI: "TPI Karangampel Indramayu", wilayah: "Indramayu, Jawa Barat", kapasitasHarian: "12 Ton / Hari", nelayanTerdaftar: 110, statusHub: "Utama" },
  { id: 4, namaTPI: "TPI Muara Baru Jakarta", wilayah: "Jakarta Utara, DKI Jakarta", kapasitasHarian: "30 Ton / Hari", nelayanTerdaftar: 230, statusHub: "Utama" },
  { id: 5, namaTPI: "TPI Pelabuhan Ratu", wilayah: "Sukabumi, Jawa Barat", kapasitasHarian: "10 Ton / Hari", nelayanTerdaftar: 95, statusHub: "Pengumpan" },
  { id: 6, namaTPI: "TPI Bancar Tuban", wilayah: "Tuban, Jawa Timur", kapasitasHarian: "14 Ton / Hari", nelayanTerdaftar: 118, statusHub: "Pengumpan" },
];

export default function SuperAdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("tarif");

  const [tarif, setTarif] = useState<TarifRute[]>(TARIF0);
  const [mitraList, setMitraList] = useState<MitraKerjasama[]>(DUMMY_MITRA);
  const [tpiList, setTpiList] = useState<TPIData[]>(DUMMY_TPI);

  // KATA SANDI PROTEKSI BUKA KUNCI EDIT MARGIN
  const [kunci, setKunci] = useState(true);
  const [sandiPass, setSandiPass] = useState("");
  const [p, setP] = useState({ komisi: 3, fee: 10, layanan: 2000 });
  const [tempP, setTempP] = useState({ ...p });
  const [kgSimulasi, setKgSimulasi] = useState(10);

  const [superAdminProfile, setSuperAdminProfile] = useState({
    nama: "Surya Wijaya",
    email: "surya.owner@jalalink.id",
    role: "Super Admin",
    kode: "SUPER-ADM-01",
  });

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [modalEditProfil, setModalEditProfil] = useState(false);
  const [modalKeamanan, setModalKeamanan] = useState(false);
  const [tempProfile, setTempProfile] = useState({ ...superAdminProfile });
  const [formSandi, setFormSandi] = useState({ lama: "", baru: "", konfirmasi: "" });

  const [deviceInfo, setDeviceInfo] = useState({
    browser: "Mendeteksi browser...",
    ip: "Mendeteksi IP...",
  });

  const menuRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState("");

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 4000);
  };

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

  // --- INTEGRASI LIVE FETCH DARI SUPABASE DATABASE ---
  useEffect(() => {
    async function fetchSuperAdminLive() {
      try {
        // 1. Fetch Data Rute dari API Supabase (/api/rute)
        const resRute = await fetch("/api/rute");
        const dataRute = await resRute.json();
        const listRute = Array.isArray(dataRute) ? dataRute : (dataRute?.data || []);

        if (listRute.length > 0) {
          const liveTarif = listRute.map((r: any) => ({
            id: r.id,
            rute: `${r.asal?.nama || "TPI"} → ${r.kota_tujuan}`,
            aktif: r.biaya_rute || 8000,
            tarifNormalMin: Math.max(5000, (r.biaya_rute || 8000) - 1000),
            tarifNormalMax: (r.biaya_rute || 8000) + 2000,
          }));
          setTarif(liveTarif);
        }

        // 2. Fetch Profiles Mitra Transport dari Tabel Supabase
        const { data: profilesTransport } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "admintransport");

        if (profilesTransport && profilesTransport.length > 0) {
          const liveMitra = profilesTransport.map((p: any, idx: number) => ({
            id: p.id || idx + 1,
            namaPT: p.nama || "CV Mitra Transport",
            penanggungJawab: p.nama || "Penanggung Jawab",
            armadaCount: 5,
            jenisTransport: "Cold Truck Refrigerator" as const,
            dokumenUsia: "NIB_Verified.pdf",
            suratIzinUsaha: "SIUP_Valid.pdf",
            sertifikatColdStorage: "ColdStorage_Cert.pdf",
            polisAsuransi: "Asuransi_Kargo.pdf",
            status: (p.status || "Aktif Terjalin") as any,
          }));
          setMitraList(liveMitra);
        }
      } catch (err) {
        console.error("Gagal mengambil data dari Supabase:", err);
      }
    }

    fetchSuperAdminLive();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [detailMitra, setDetailMitra] = useState<number | string | null>(null);
  const [confirmMitra, setConfirmMitra] = useState<{
    id: number | string;
    aksi: string;
    targetStatus: "Aktif Terjalin" | "Ditolak";
  } | null>(null);
  const [alasanKerjasama, setAlasanKerjasama] = useState("");

  const cekSandiProteksi = () => {
    if (sandiPass === "admin123") {
      setKunci(false);
      setTempP({ ...p });
      flash("Akses pengaturan margin terbuka");
    } else {
      flash("Kata sandi salah! Gunakan sandi: admin123");
    }
    setSandiPass("");
  };

  const simpanPengaturanKomisi = () => {
    setP({ ...tempP });
    setKunci(true);
    flash("Pengaturan margin disimpan");
  };

  const eksekusiMitra = async () => {
    if (!confirmMitra) return;
    const catatan = alasanKerjasama.trim();
    if (!catatan) {
      flash("Catatan peninjauan dokumen kerjasama wajib diisi!");
      return;
    }

    // Update status ke tabel profiles di Supabase
    try {
      await supabase
        .from("profiles")
        .update({ status: confirmMitra.targetStatus })
        .eq("id", confirmMitra.id);
    } catch (e) {
      console.warn("Peringatan update Supabase:", e);
    }

    // Update state tampilan lokal
    setMitraList((prev) =>
      prev.map((m) =>
        m.id === confirmMitra.id
          ? { ...m, status: confirmMitra.targetStatus, keterangan: catatan }
          : m
      )
    );

    setConfirmMitra(null);
    setDetailMitra(null);
    setAlasanKerjasama("");
    flash(`Status Kerjasama Mitra Diperbarui: ${confirmMitra.targetStatus}`);
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

  const ikanTotal = 65000 * kgSimulasi;
  const ongkirTotal = ongkir(8000, kgSimulasi);
  const komisiPlatform = Math.round((ikanTotal * p.komisi) / 100);
  const feeTransport = Math.round((ongkirTotal * p.fee) / 100);
  const biayaLayanan = p.layanan;

  const totalPembeliBayar = ikanTotal + ongkirTotal + biayaLayanan;
  const pendapatanJalaLink = komisiPlatform + feeTransport + biayaLayanan;
  const nelayanTerima = ikanTotal - komisiPlatform;
  const transportTerima = ongkirTotal - feeTransport;

  const barSimulasi = [
    ["Nelayan", nelayanTerima, "bg-[#0d7a87]"],
    ["Transport", transportTerima, "bg-ink"],
    ["JalaLink", pendapatanJalaLink, "bg-[#0d7a87]/40"],
  ] as const;

  const NAV = [
    ["ringkasan", "Beranda"],
    ["tarif", "Tarif & Margin"],
    ["transport", "Mitra Transport"],
    ["tpi", "Direktori TPI"],
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-surface/30 to-white font-body text-ink">
      <header className="sticky top-0 z-30 border-b border-soft/40 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="JalaLink" width={110} height={36} className="object-contain" />
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map(([k, l]) => (
              <button
                key={k}
                onClick={() => setTab(k as Tab)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 font-sub text-sm font-semibold transition-all ${
                  tab === k ? "bg-[#0d7a87] text-white shadow-sm" : "text-ink hover:bg-surface"
                }`}
              >
                <span>{l}</span>
              </button>
            ))}
          </nav>

          <div className="relative flex items-center" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1 transition-transform active:scale-95 cursor-pointer"
            >
              <span className="rounded-full bg-[#0d7a87] px-4 py-1.5 font-sub text-sm font-bold text-white shadow-sm">
                {superAdminProfile.role}
              </span>
              <div className="grid size-10 place-items-center rounded-full bg-[#0d7a87] font-sub text-base font-bold text-white shadow-md">
                {superAdminProfile.nama.charAt(0).toUpperCase()}
              </div>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-3xl border border-soft/60 bg-white p-2 shadow-2xl z-50">
                <div className="border-b border-soft/40 p-3">
                  <p className="font-sub text-sm font-bold text-ink">{superAdminProfile.nama}</p>
                  <p className="text-xs text-ink/60 truncate">{superAdminProfile.email}</p>
                  <span className="mt-1 inline-block rounded bg-ink/10 px-2 py-0.5 text-[10px] font-bold text-ink">
                    ID: {superAdminProfile.kode}
                  </span>
                </div>
                <div className="py-1 text-xs font-semibold">
                  <button
                    onClick={() => {
                      setTempProfile({ ...superAdminProfile });
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
              <h1 className="font-heading text-2xl font-bold">Dashboard Executive Super Admin</h1>
              <p className="text-sm text-ink/60">
                Pusat kendali penetapan tarif rute, skema potongan margin, dan persetujuan mitra ekspedisi.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                ["Total Rute Aktif", tarif.length],
                ["Estimasi Transaksi", rp(4850000)],
                ["Margin JalaLink", rp(Math.round(4850000 * 0.045))],
                ["Mitra Transport Pending", mitraList.filter((m) => m.status === "Menunggu Peninjauan").length],
              ].map(([l, v]) => (
                <div key={l as string} className="rounded-3xl bg-surface/70 p-5 border border-soft/40">
                  <p className="text-sm font-medium text-ink/60">{l}</p>
                  <p className="mt-3 font-heading text-2xl font-bold text-[#0d7a87]">{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB TARIF DAN MARGIN */}
        {tab === "tarif" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-heading text-2xl font-bold">Pengaturan Tarif Rute & Bagi Hasil</h1>
              <p className="text-sm text-ink/60">
                Transport mengusulkan tarif baru, Super Admin memberikan persetujuan akhir.
              </p>
            </div>

            {/* TABEL TARIF RUTE */}
            <div className="overflow-hidden rounded-3xl border border-soft/50 bg-white shadow-sm">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-surface/50 font-sub text-xs font-bold text-ink/60 uppercase">
                    <th className="py-4 px-5">Rute Pengiriman</th>
                    <th className="py-4 px-5">Tarif Aktif</th>
                    <th className="py-4 px-5">Acuan Normal</th>
                    <th className="py-4 px-5">Usulan Mitra</th>
                    <th className="py-4 px-5 text-right">Aksi Super Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soft/30">
                  {tarif.map((r) => (
                    <tr key={r.id}>
                      <td className="py-4 px-5 font-bold">{r.rute}</td>
                      <td className="py-4 px-5">{rp(r.aktif)}/kg</td>
                      <td className="py-4 px-5">
                        {rp(r.tarifNormalMin)} - {rp(r.tarifNormalMax)}
                      </td>
                      <td className="py-4 px-5">
                        {r.usulan ? (
                          <b>
                            {rp(r.usulan)}/kg ({r.pengaju})
                          </b>
                        ) : (
                          "Tanpa usulan"
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        {r.usulan && (r.statusUsulan === "Menunggu" || r.statusUsulan === "Banding") ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setTarif((ts) =>
                                  ts.map((t) =>
                                    t.id === r.id ? { ...t, aktif: r.usulan!, statusUsulan: "Disetujui" } : t
                                  )
                                );
                                flash("Usulan tarif disetujui");
                              }}
                              className={`${pri} h-9 px-3 text-xs`}
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() => {
                                setTarif((ts) =>
                                  ts.map((t) => (t.id === r.id ? { ...t, statusUsulan: "Ditolak" } : t))
                                );
                                flash("Usulan tarif ditolak");
                              }}
                              className={`${out} h-9 px-3 text-xs`}
                            >
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-ink/50">{r.statusUsulan || "Aktif"}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 md:grid-cols-2 pt-2">
              {/* KARTU PENGATURAN SKEMA MARGIN (UI RAPI & DIKSI KONSISTEN "KATA SANDI") */}
              <div className={`${card} bg-white space-y-4`}>
                <div className="flex items-center justify-between border-b border-soft/40 pb-3 gap-2">
                  <b className="font-heading text-base text-ink">Skema Potongan Margin Platform</b>
                  <Pill dark={kunci}>{kunci ? "Terkunci" : "Terbuka"}</Pill>
                </div>

                {kunci ? (
                  <div className="rounded-2xl border border-dashed border-soft/80 bg-surface/50 p-6 text-center space-y-4">
                    <div className="grid size-12 place-items-center rounded-2xl bg-[#0d7a87]/10 text-[#0d7a87] mx-auto">
                      <Lock size={24} />
                    </div>
                    <p className="text-xs text-ink/70 max-w-xs mx-auto">
                      Masukkan kata sandi Super Admin untuk membuka pengaturan margin (Sandi: <b>admin123</b>).
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        value={sandiPass}
                        onChange={(e) => setSandiPass(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && cekSandiProteksi()}
                        placeholder="Ketik kata sandi..."
                        className={inp}
                      />
                      <button onClick={cekSandiProteksi} className={`${pri} shrink-0 px-6`}>
                        Buka
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-ink/70 mb-1">
                        Komisi Nelayan (%) *
                      </label>
                      <input
                        type="number"
                        value={tempP.komisi}
                        onChange={(e) => setTempP({ ...tempP, komisi: Number(e.target.value) })}
                        className={inp}
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-ink/70 mb-1">Fee Transport (%) *</label>
                      <input
                        type="number"
                        value={tempP.fee}
                        onChange={(e) => setTempP({ ...tempP, fee: Number(e.target.value) })}
                        className={inp}
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-ink/70 mb-1">
                        Biaya Layanan (Rp) *
                      </label>
                      <input
                        type="number"
                        value={tempP.layanan}
                        onChange={(e) => setTempP({ ...tempP, layanan: Number(e.target.value) })}
                        className={inp}
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => setKunci(true)} className={`${out} flex-1 text-xs`}>
                        Batal & Kunci
                      </button>
                      <button onClick={simpanPengaturanKomisi} className={`${pri} flex-1 text-xs`}>
                        Simpan Skema
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SIMULASI KALKULATOR HASIL MARGIN */}
              <div className={`${card} bg-white space-y-3 text-sm`}>
                <div className="flex justify-between items-center border-b border-soft/40 pb-2">
                  <b className="font-heading text-base">Simulasi Margin Bagi Hasil</b>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-ink/60">Berat:</span>
                    <input
                      type="number"
                      value={kgSimulasi}
                      onChange={(e) => setKgSimulasi(Number(e.target.value))}
                      className="w-14 rounded-lg border border-soft px-2 py-0.5 text-xs text-center font-bold"
                    />
                    <span className="text-ink/60">kg</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Harga Tangkapan Ikan</span>
                    <b>{rp(ikanTotal)}</b>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimasi Ongkir Transport</span>
                    <b>{rp(ongkirTotal)}</b>
                  </div>
                  <div className="flex justify-between">
                    <span>Biaya Layanan Platform</span>
                    <b>{rp(biayaLayanan)}</b>
                  </div>
                </div>

                <div className="flex justify-between border-t border-soft/40 pt-2 text-ink">
                  <b className="font-sub">Total Pembeli Bayar:</b>
                  <b className="font-heading text-base text-[#0d7a87]">{rp(totalPembeliBayar)}</b>
                </div>

                <div className="flex h-3 overflow-hidden rounded-full bg-surface">
                  {barSimulasi.map(([l, v, c]) => (
                    <div
                      key={l}
                      className={c}
                      style={{ width: `${(v / (totalPembeliBayar || 1)) * 100}%` }}
                    />
                  ))}
                </div>

                <div className="space-y-1 text-[11px] pt-1">
                  {barSimulasi.map(([l, v]) => (
                    <div key={l} className="flex justify-between">
                      <span>{l} Menerima Bersih</span>
                      <b>{rp(v)}</b>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION MITRA TRANSPORTASI */}
        {tab === "transport" && (
          <div className="space-y-4">
            <div>
              <h1 className="font-heading text-2xl font-bold">Verifikasi Kerjasama Transportasi</h1>
              <p className="text-sm text-ink/60">
                Pemeriksaan berkas legalitas operasional dan armada cold storage calon mitra ekspedisi.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {mitraList.map((m) => (
                <div key={m.id} className={`${card} bg-white space-y-3`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <b className="font-heading text-lg block">{m.namaPT}</b>
                      <span className="text-xs text-ink/60">PJ Usaha: {m.penanggungJawab}</span>
                    </div>
                    <Pill dark={m.status !== "Menunggu Peninjauan"}>{m.status}</Pill>
                  </div>

                  <div className="rounded-2xl bg-surface/70 p-3 border border-soft/60 text-xs space-y-1">
                    <p>
                      Kualifikasi Armada: <b>{m.jenisTransport}</b> ({m.armadaCount} Unit)
                    </p>
                    <p className="text-ink/60">
                      Surat Izin Operasional: <b>{m.suratIzinUsaha}</b>
                    </p>
                  </div>

                  {m.keterangan && (
                    <p className="text-xs italic text-ink/70 border-l-2 border-[#0d7a87] pl-2">
                      Catatan Peninjauan: &quot;{m.keterangan}&quot;
                    </p>
                  )}

                  <button
                    onClick={() => setDetailMitra(m.id)}
                    className={`${pri} w-full text-xs h-10 flex items-center justify-center gap-2`}
                  >
                    <Eye size={16} /> Periksa Dokumen Kerjasama & Legalitas
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION DIREKTORI TPI */}
        {tab === "tpi" && (
          <div className="space-y-4">
            <div>
              <h1 className="font-heading text-2xl font-bold">Direktori TPI (Tempat Pelelangan Ikan)</h1>
              <p className="text-sm text-ink/60">
                Integrasi wilayah TPI pesisir yang terhubung dalam ekosistem pasokan JalaLink.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {tpiList.map((t) => (
                <div key={t.id} className={`${card} bg-white space-y-2`}>
                  <div className="flex justify-between items-start">
                    <b className="font-heading text-base text-ink block">{t.namaTPI}</b>
                    <Pill dark={t.statusHub === "Pengumpan"}>{t.statusHub}</Pill>
                  </div>
                  <p className="text-xs text-ink/70 flex items-center gap-1">
                    <MapPin size={14} className="text-[#0d7a87]" /> {t.wilayah}
                  </p>
                  <div className="border-t border-soft/40 pt-2 text-xs space-y-1 text-ink/80">
                    <p>
                      Kapasitas Tangkapan: <b>{t.kapasitasHarian}</b>
                    </p>
                    <p>
                      Nelayan Terdaftar: <b>{t.nelayanTerdaftar} Akun</b>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL PERIKSA DOKUMEN LEGALITAS KERJASAMA MITRA */}
      {detailMitra !== null && mitraList.find((m) => m.id === detailMitra) && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/75 p-4 backdrop-blur-sm">
          {(() => {
            const m = mitraList.find((x) => x.id === detailMitra)!;
            const perluAksi = m.status === "Menunggu Peninjauan";
            return (
              <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-soft/40 bg-surface/50 p-4">
                  <h3 className="font-heading text-lg font-bold">Pemeriksaan Berkas Kerjasama Usaha</h3>
                  <button
                    onClick={() => setDetailMitra(null)}
                    className="rounded-full bg-white p-1 text-ink/50 shadow-sm border border-soft/50"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-sub text-lg font-bold">{m.namaPT}</p>
                      <p className="text-xs text-ink/60">
                        PJ: {m.penanggungJawab} · {m.jenisTransport}
                      </p>
                    </div>
                    <Pill dark={!perluAksi}>{m.status}</Pill>
                  </div>

                  <div className="space-y-2 rounded-2xl bg-surface/60 p-4 border border-soft/60 text-xs">
                    <b className="font-bold text-[#0d7a87] uppercase text-[11px] block">
                      Berkas Legalitas Terlampir:
                    </b>
                    <div className="space-y-2 pt-1">
                      {[
                        ["Surat Nomor Induk Berusaha (NIB)", m.dokumenUsia],
                        ["Izin Operasional Ekspedisi", m.suratIzinUsaha],
                        ["Sertifikasi Cold Storage & HACCP", m.sertifikatColdStorage],
                        ["Polis Asuransi Kerusakan Barang", m.polisAsuransi],
                      ].map(([label, file]) => (
                        <div
                          key={label as string}
                          className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-soft/50"
                        >
                          <div>
                            <p className="font-bold text-ink">{label}</p>
                            <span className="text-[11px] text-ink/50">{file}</span>
                          </div>
                          <span className="text-[11px] font-semibold text-[#0d7a87] underline cursor-pointer">
                            Tinjau Berkas
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {perluAksi && (
                    <div className="flex gap-3 pt-3 border-t border-soft/40">
                      <button
                        onClick={() =>
                          setConfirmMitra({
                            id: m.id,
                            aksi: "Tolak Kerjasama Transportasi",
                            targetStatus: "Ditolak",
                          })
                        }
                        className={`${out} flex-1 border-red-300 text-red-600 hover:bg-red-50`}
                      >
                        Tolak Kerjasama
                      </button>
                      <button
                        onClick={() =>
                          setConfirmMitra({
                            id: m.id,
                            aksi: "Setujui Kerjasama Transportasi",
                            targetStatus: "Aktif Terjalin",
                          })
                        }
                        className={`${pri} flex-1`}
                      >
                        Setujui Kerjasama
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* MODAL KONFIRMASI DENGAN CATATAN PENINJAUAN */}
      {confirmMitra && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-[#0d7a87]/10 text-[#0d7a87]">
                <AlertTriangle size={20} />
              </div>
              <h3 className="font-heading text-lg font-bold">Konfirmasi Keputusan</h3>
            </div>

            <p className="text-sm text-ink/70 mb-4">
              Apakah Anda yakin ingin <b>{confirmMitra.aksi.toLowerCase()}</b>?
            </p>

            <div className="mb-4 space-y-1.5">
              <label className="text-xs font-bold text-ink/70">Catatan Peninjauan Berkas *</label>
              <textarea
                value={alasanKerjasama}
                onChange={(e) => setAlasanKerjasama(e.target.value)}
                className={`${inp} h-20 py-2.5 text-xs resize-none`}
                placeholder="Tuliskan alasan pertimbangan persetujuan/penolakan..."
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-soft/40">
              <button
                onClick={() => {
                  setConfirmMitra(null);
                  setAlasanKerjasama("");
                }}
                className={`${out} flex-1`}
              >
                Batal
              </button>
              <button onClick={eksekusiMitra} className={`${pri} flex-1`}>
                Simpan Keputusan
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
              <button
                onClick={() => setModalKeamanan(false)}
                className="rounded-full bg-surface p-1 text-ink/50 hover:bg-soft/40"
              >
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
                      <b className="font-sub text-sm font-bold block text-ink">
                        Pemulihan Kata Sandi via Email
                      </b>
                      <span className="text-[11px] text-ink/60 block mt-0.5">
                        Target Email: <b className="text-[#0d7a87]">{superAdminProfile.email}</b>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => flash(`Kode OTP verifikasi dikirim ke ${superAdminProfile.email}`)}
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
                <User size={20} /> Edit Profil Super Admin
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
                <label className="block font-bold text-ink/70 mb-1">Email Staf Super Admin *</label>
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
                  setSuperAdminProfile({ ...tempProfile });
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
    </div>
  );
}