"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession, clearSession } from "@/lib/session";
import { createClient } from "@supabase/supabase-js";
import { Home, SlidersHorizontal, LifeBuoy, ShieldAlert, Store, MapPin, Send, Check, X, Plus, Trash2, ChevronLeft, AlertTriangle, Search, FileText, ChevronDown, ChevronUp, AlertCircle, Building2, Truck, ShieldCheck, Eye, ExternalLink, User, LogOut, KeyRound, Camera, Lock, Shield, RefreshCw, Mail, Laptop } from "lucide-react";

// Inisialisasi Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kewjzlhgrkacyrjlboaa.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_1ygn0KH_eqk53JVTLib-gQ_NfcJyZNm";
const supabase = createClient(supabaseUrl, supabaseKey);

const rp = (n: number) => "Rp" + n.toLocaleString("id-ID");
const ongkir = (flat: number, kg: number) => (kg <= 0 ? 0 : kg <= 1 ? flat : Math.round(flat + (kg - 1) * flat * 0.75));
const inp = "h-11 w-full rounded-2xl border border-soft/60 bg-white px-3.5 text-sm text-ink outline-none placeholder:text-soft focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all";
const pri = "h-11 rounded-2xl bg-brand px-5 font-sub text-sm font-semibold text-white shadow-sm hover:bg-brand/90 active:scale-[0.98] transition-all disabled:opacity-40";
const out = "h-11 rounded-2xl border border-brand bg-white px-5 font-sub text-sm font-semibold text-brand hover:bg-surface active:scale-[0.98] transition-all";
const card = "rounded-3xl bg-surface/70 border border-soft/50 p-5 shadow-sm hover:shadow-md transition-shadow";
const Pill = ({ children, dark }: { children: React.ReactNode; dark?: boolean }) => <span className={`rounded-full px-3 py-1 font-sub text-xs font-semibold ${dark ? "bg-ink text-white" : "bg-brand text-white"}`}>{children}</span>;

type Tab = "ringkasan" | "bantuan" | "laporan" | "nelayan" | "tarif" | "master";
type Msg = { me: boolean; text: string };
type Tiket = { id: number; pembeli: string; topik: string; selesai: boolean; msgs: Msg[] };
type FAQ = { id: number; kategori: string; pertanyaan: string; jawaban: string };
type Laporan = { id: number; jenis: string; pelapor: string; terlapor: string; alasan: string; bukti: string[]; selesai: boolean; tindakan?: string; chatLog?: { sender: string; text: string }[]; adminVerif?: string };
type Nel = { id: number; nama: string; daerah: string; titik: string; dok: string; selfie?: string; rek?: string; geotag?: string; status: "Menunggu" | "Aktif" | "Ditolak" | "Dinonaktifkan" | "Banding"; listing: number; keterangan?: string; adminVerif?: string };
type Tarif = { 
  id: number; 
  rute: string; 
  aktif: number; 
  tarifNormalMin: number; 
  tarifNormalMax: number; 
  usulan?: number; 
  pengaju?: string; 
  statusUsulan?: "Menunggu" | "Disetujui" | "Ditolak" | "Banding";
  alasanPenolakan?: string;
  alasanBanding?: string;
  adminVerif?: string;
};
type FotoIkan = { id: number; nelayan: string; ikan: string; foto: string; status: "Menunggu" | "Disetujui" | "Ditolak"; keterangan?: string; adminVerif?: string };

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

const KAT = ["Pemesanan & Cold Chain", "Pengiriman & Ongkir", "Pembayaran & Keamanan", "Kualitas & Garansi", "Lainnya"];

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("ringkasan");
  
  // State Data dari Database
  const [tiket, setTiket] = useState<Tiket[]>([]);
  const [faq, setFaq] = useState<FAQ[]>([]);
  const [lap, setLap] = useState<Laporan[]>([]);
  const [nel, setNel] = useState<Nel[]>([]);
  const [tarif, setTarif] = useState<Tarif[]>([]);
  const [fotoIkan, setFotoIkan] = useState<FotoIkan[]>([]);
  const [titikList, setTitikList] = useState<TitikHub[]>([]);
  const [transList, setTransList] = useState<TransportComp[]>([]);

  const [sel, setSel] = useState<number | null>(null);
  const [bsub, setBsub] = useState<"chat" | "faq">("chat");
  const [reply, setReply] = useState("");

  const [adminProfile, setAdminProfile] = useState<{
    nama: string;
    email: string;
    role: "Super Admin" | "Admin Operational";
    kode: string;
  }>({
    nama: "Memuat...",
    email: "admin@jalalink.com",
    role: "Admin Operational",
    kode: "ADM-01"
  });

  const isSuperAdmin = adminProfile.role === "Super Admin";
  const { session } = useSession(["admin", "superadmin", "admintransport", "transport"]);

  // 1. Fetch Profile User yang Login dari Database Supabase
  useEffect(() => {
    async function loadAdminProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("nama, role")
            .eq("id", user.id)
            .maybeSingle();

          if (profile) {
            const roleStr = (profile.role || "").toLowerCase();
            const isSuper = roleStr.includes("super");
            setAdminProfile({
              nama: profile.nama || user.email?.split("@")[0] || "Admin Transport",
              email: user.email || "admin@jalalink.com",
              role: isSuper ? "Super Admin" : "Admin Operational",
              kode: isSuper ? "ADM-01" : "TR-01"
            });
            return;
          }
        }
        if (session) {
          const isSuper = (session.role || "").toLowerCase().includes("super");
          setAdminProfile({
            nama: session.nama || "Admin Transport",
            email: session.email || "admin@jalalink.com",
            role: isSuper ? "Super Admin" : "Admin Operational",
            kode: isSuper ? "ADM-01" : "TR-01"
          });
        }
      } catch (err) {
        console.error("Gagal memuat profil admin:", err);
      }
    }
    loadAdminProfile();
  }, [session]);

  // 2. Fetch Seluruh Data Real-time dari Supabase
  useEffect(() => {
    async function loadDatabaseData() {
      try {
        // A. Data Nelayan
        const { data: nelData } = await supabase.from("nelayan").select("*").order("id", { ascending: false });
        if (nelData) {
          setNel(nelData.map((n: any) => ({
            id: n.id,
            nama: n.nama || "Nelayan",
            daerah: n.daerah || "Pelabuhan TPI",
            titik: n.titik || n.daerah || "TPI",
            dok: n.dok || "Dokumen Terverifikasi",
            selfie: n.selfie || "Selfie Valid",
            rek: n.rek || "Rekening Valid",
            geotag: n.geotag || "GPS Terverifikasi",
            status: n.status || (n.terverifikasi ? "Aktif" : "Menunggu"),
            listing: n.listing_count || 0,
            keterangan: n.keterangan,
            adminVerif: n.admin_verif
          })));
        }

        // B. Data Laporan
        const { data: lapData } = await supabase.from("laporan").select("*").order("id", { ascending: false });
        if (lapData) {
          setLap(lapData.map((l: any) => ({
            id: l.id,
            jenis: l.jenis || "Pesanan",
            pelapor: l.pelapor || "Pengguna",
            terlapor: l.terlapor || "Pengguna",
            alasan: l.alasan || "Laporan Pelanggaran",
            bukti: l.bukti || ["bukti-lampiran.jpg"],
            selesai: l.selesai || l.status === "Selesai",
            tindakan: l.tindakan,
            chatLog: l.chat_log,
            adminVerif: l.admin_verif
          })));
        }

        // C. Data Titik Hub
        const { data: titikData } = await supabase.from("titik_kumpul").select("*").order("id", { ascending: false });
        if (titikData) {
          setTitikList(titikData.map((t: any) => ({
            id: t.id,
            nama: t.nama || "Hub Cold Chain",
            wilayah: t.daerah || t.wilayah || "Jawa Barat",
            alamat: t.alamat || "Alamat Hub",
            kapasitas: t.kapasitas || "10 Ton",
            skPerizinan: t.sk_perizinan || "SK-RESMI.pdf",
            adminCreator: t.admin_creator || "Admin Utama (ADM-01)"
          })));
        }

        // D. Data Tarif / Rute
        const { data: ruteData } = await supabase.from("rute").select("*").order("id", { ascending: false });
        if (ruteData) {
          setTarif(ruteData.map((r: any) => ({
            id: r.id,
            rute: `${r.asal || "TPI"} → ${r.kota_tujuan || "Hub"}`,
            aktif: Number(r.biaya_rute) || 8000,
            tarifNormalMin: 6000,
            tarifNormalMax: 12000,
            usulan: r.usulan_tarif ? Number(r.usulan_tarif) : undefined,
            pengaju: r.pengaju,
            statusUsulan: r.status_usulan,
            alasanPenolakan: r.alasan_penolakan,
            alasanBanding: r.alasan_banding,
            adminVerif: r.admin_verif
          })));
        }

        // E. Data Perusahaan Transport
        const { data: transData } = await supabase.from("transport_companies").select("*").order("id", { ascending: false });
        if (transData) {
          setTransList(transData.map((tr: any) => ({
            id: tr.id,
            nama: tr.nama || "Mitra Transport",
            email: tr.email || "mitra@transport.com",
            nib: tr.nib || "9120000000000",
            telepon: tr.telepon || "081234567890",
            penanggungJawab: tr.penanggung_jawab || "Penanggung Jawab",
            jumlahArmada: tr.jumlah_armada || 1,
            dokumenLegal: tr.dokumen_legal || "NIB.pdf",
            status: tr.status || "Menunggu",
            alasanPenolakan: tr.alasan_penolakan,
            adminVerif: tr.admin_verif
          })));
        }

        // F. Data Foto Ikan untuk Validasi
        const { data: listingFoto } = await supabase.from("listing").select("id, foto_url, status, nelayan(nama), ikan(nama_baku)").not("foto_url", "is", null).order("id", { ascending: false });
        if (listingFoto) {
          setFotoIkan(listingFoto.map((lf: any) => ({
            id: lf.id,
            nelayan: lf.nelayan?.nama || "Nelayan",
            ikan: lf.ikan?.nama_baku || "Ikan Segar",
            foto: lf.foto_url || "foto.jpg",
            status: lf.status === "aktif" ? "Disetujui" : "Menunggu"
          })));
        }
      } catch (err) {
        console.error("Gagal sinkronisasi database Supabase:", err);
      }
    }

    loadDatabaseData();
  }, []);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [modalEditProfil, setModalEditProfil] = useState(false);
  const [modalKeamanan, setModalKeamanan] = useState(false);
  const [tempProfile, setTempProfile] = useState({ ...adminProfile });
  
  const [formSandi, setFormSandi] = useState({ lama: "", baru: "", konfirmasi: "" });

  const [deviceInfo, setDeviceInfo] = useState({
    browser: "Memuat browser...",
    ip: "Mendeteksi IP..."
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

      setDeviceInfo(prev => ({
        ...prev,
        browser: `${browserName} di ${osName}`
      }));

      fetch("https://api.ipify.org?format=json")
        .then(res => res.json())
        .then(data => {
          if (data && data.ip) {
            setDeviceInfo(prev => ({ ...prev, ip: data.ip }));
          }
        })
        .catch(() => {
          setDeviceInfo(prev => ({ ...prev, ip: "Terhubung (Lokal)" }));
        });
    }
  }, []);

  const menuRef = useRef<HTMLDivElement>(null);

  const [modalTitik, setModalTitik] = useState(false);
  const [formTitik, setFormTitik] = useState({ nama: "", wilayah: "", alamat: "", kapasitas: "", skPerizinan: "" });

  const [viewDokumen, setViewDokumen] = useState<{ namaFile: string; judul: string } | null>(null);

  const [detailNel, setDetailNel] = useState<number | null>(null);
  const [detailFoto, setDetailFoto] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<{ id: number, type: "nelayan" | "foto" | "laporan" | "tarif" | "hapusTitik" | "transport", aksi: string, targetStatus: string } | null>(null);
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
  const [filterLap, setFilterLap] = useState("Semua");

  const [searchTarif, setSearchTarif] = useState("");
  const [filterTarif, setFilterTarif] = useState("Semua");
  const [filterCompany, setFilterCompany] = useState("Semua Perusahaan");
  const [tampilSemuaTarif, setTampilSemuaTarif] = useState(false);

  const [kunci, setKunci] = useState(true);
  const [sandi, setSandi] = useState("");
  const [p, setP] = useState({ komisi: 3, fee: 10, layanan: 2000 });
  const [tempP, setTempP] = useState({ ...p });
  const [kg, setKg] = useState(10);
  
  const [toast, setToast] = useState("");
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 4000); };
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

  const nTiket = tiket.filter((t) => !t.selesai).length, nLap = lap.filter((l) => !l.selesai).length;
  const nNel = nel.filter((n) => n.status === "Menunggu" || n.status === "Banding").length;
  const nTarif = tarif.filter((t) => t.statusUsulan === "Menunggu" || t.statusUsulan === "Banding").length;
  const nFoto = fotoIkan.filter((f) => f.status === "Menunggu").length;
  const nTransPending = transList.filter((t) => t.status === "Menunggu").length;

  const NAV = [["ringkasan", "Beranda", Home, 0], ["bantuan", "Bantuan", LifeBuoy, nTiket], ["laporan", "Laporan", ShieldAlert, nLap], ["nelayan", "Verifikasi", Store, nNel + nFoto], ["tarif", "Kelola", SlidersHorizontal, nTarif + nTransPending]] as const;
  const isOn = (k: Tab) => (k === "tarif" ? tab === "tarif" || tab === "master" : tab === k);
  
  const go = (k: Tab) => { 
    if ((k === "tarif" || k === "master") && !isSuperAdmin) {
      flash("Akses Terbatas: Fitur Kelola Tarif & Master hanya untuk Super Admin");
      return;
    }
    setTab(k); 
    setSel(null); 
    window.scrollTo({ top: 0 }); 
  };

  const toggleRoleSimulasi = () => {
    const nextRole = adminProfile.role === "Super Admin" ? "Admin Operational" : "Super Admin";
    setAdminProfile(prev => ({
      ...prev,
      role: nextRole,
      nama: nextRole === "Super Admin" ? "Admin Utama" : "Budi (Operational)"
    }));
    if (nextRole === "Admin Operational" && (tab === "tarif" || tab === "master")) {
      setTab("ringkasan");
    }
    flash(`Role beralih ke: ${nextRole}`);
    setUserMenuOpen(false);
  };

  const sub = (
    <div className="flex gap-2 overflow-x-auto">
      {([["tarif", "Tarif & Bagi Hasil"], ["master", "Titik & Transport"]] as const).map(([k, l]) => (
        <button key={k} onClick={() => go(k)} className={`shrink-0 rounded-full border px-5 py-2 font-sub text-sm font-semibold transition-all ${tab === k ? "border-brand bg-brand text-white shadow-sm" : "border-soft bg-white text-ink hover:bg-surface"}`}>
          {l}
          {k === "master" && nTransPending > 0 && <span className="ml-2 rounded-full bg-brand text-white px-2 py-0.5 text-[10px]">{nTransPending} Acc</span>}
        </button>
      ))}
    </div>
  );

  const t = tiket.find((x) => x.id === sel);
  const patchT = (id: number, f: (x: Tiket) => Tiket) => setTiket((ts) => ts.map((x) => (x.id === id ? f(x) : x)));
  const kirim = () => { if (!t || !reply.trim()) return; patchT(t.id, (x) => ({ ...x, msgs: [...x.msgs, { me: true, text: reply.trim() }] })); setReply(""); };
  const jadikanFaq = () => {
    const q = t?.msgs.find((m) => !m.me)?.text, a = [...(t?.msgs ?? [])].reverse().find((m) => m.me)?.text;
    if (!q || !a) return flash("Perlu pertanyaan pembeli dan jawaban admin dulu");
    setFaq((f) => [...f, { id: Date.now(), kategori: KAT[4], pertanyaan: q, jawaban: a }]); flash("Ditambahkan ke FAQ (cek tab FAQ)");
  };
  const setNs = (id: number, status: Nel["status"]) => { setNel((ns) => ns.map((n) => (n.id === id ? { ...n, status } : n))); flash(`Akun nelayan ${status.toLowerCase()}`); };

  const cekSandi = () => {
    if (!isSuperAdmin) {
      flash("Hanya Super Admin yang diizinkan merubah rasio komisi!");
      return;
    }
    if (sandi === "admin123") { setKunci(false); setTempP({ ...p }); flash("Akses dibuka"); }
    else { flash("Kata sandi salah!"); }
    setSandi("");
  };

  const simpanPengaturan = () => { setP({ ...tempP }); setKunci(true); flash("Pengaturan disimpan"); };

  const simpanProfilAdmin = () => {
    if (!tempProfile.nama || !tempProfile.email) {
      flash("Nama dan email tidak boleh kosong!");
      return;
    }
    setAdminProfile({ ...tempProfile });
    setModalEditProfil(false);
    flash("Profil admin berhasil diperbarui");
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
    flash("Kata sandi berhasil diperbarui");
  };

  const kirimEmailPemulihan = () => {
    const otpSimulasi = Math.floor(100000 + Math.random() * 900000);
    flash(`[JalaLink Security] Kode OTP verifikasi kamu adalah: ${otpSimulasi}. Berlaku 5 menit untuk reset sandi.`);
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    flash("Sesi keluar berhasil. Mengarahkan ke halaman login...");
    setTimeout(() => {
      clearSession();
      router.push("/login");
    }, 1200);
  };

  const displayedNel = nel.filter(n => {
    const matchSearch = n.nama.toLowerCase().includes(searchNel.toLowerCase()) || n.titik.toLowerCase().includes(searchNel.toLowerCase());
    const matchFilter = filterNel === "Semua" ? true : filterNel === "Perlu Aksi" ? (n.status === "Menunggu" || n.status === "Banding") : n.status === filterNel;
    return matchSearch && matchFilter;
  });

  const displayedFoto = fotoIkan.filter(f => {
    const matchSearch = f.ikan.toLowerCase().includes(searchFoto.toLowerCase()) || f.nelayan.toLowerCase().includes(searchFoto.toLowerCase());
    const matchFilter = filterFoto === "Semua" ? true : filterFoto === "Menunggu" ? f.status === "Menunggu" : f.status === filterFoto;
    return matchSearch && matchFilter;
  });

  const displayedLap = lap.filter(l => {
    const matchSearch = l.pelapor.toLowerCase().includes(searchLap.toLowerCase()) || l.terlapor.toLowerCase().includes(searchLap.toLowerCase()) || l.alasan.toLowerCase().includes(searchLap.toLowerCase());
    const matchFilter = filterLap === "Semua" ? true : filterLap === "Perlu Tindakan" ? !l.selesai : filterLap === "Selesai" ? l.selesai : l.jenis === filterLap;
    return matchSearch && matchFilter;
  });

  const filteredTarif = tarif.filter(t => {
    const matchSearch = t.rute.toLowerCase().includes(searchTarif.toLowerCase()) || (t.pengaju && t.pengaju.toLowerCase().includes(searchTarif.toLowerCase()));
    const matchFilter = filterTarif === "Semua" ? true : filterTarif === "Ada Usulan" ? (t.statusUsulan === "Menunggu" || t.statusUsulan === "Banding") : filterTarif === "Tanpa Usulan" ? !t.usulan : filterTarif === "Ditolak" ? t.statusUsulan === "Ditolak" : t.statusUsulan === "Disetujui";
    const matchCompany = filterCompany === "Semua Perusahaan" ? true : t.pengaju === filterCompany;
    return matchSearch && matchFilter && matchCompany;
  });

  const displayedTarif = tampilSemuaTarif ? filteredTarif : filteredTarif.slice(0, 3);

  const toggleNel = (id: number) => setSelNel(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleFoto = (id: number) => setSelFoto(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleSemuaNel = () => {
    if (selNel.length > 0) setSelNel([]);
    else setSelNel(displayedNel.filter(n => n.status === "Menunggu" || n.status === "Banding").map(n => n.id));
  };

  const toggleSemuaFoto = () => {
    if (selFoto.length > 0) setSelFoto([]);
    else setSelFoto(displayedFoto.filter(f => f.status === "Menunggu").map(f => f.id));
  };

  const bulkSetujuNel = () => {
    if (!selNel.length) return;
    setNel(ns => ns.map(n => selNel.includes(n.id) ? { ...n, status: "Aktif", adminVerif: ADMIN_ID } : n));
    setSelNel([]);
    flash(`${selNel.length} Akun Nelayan disetujui`);
  };

  const bulkSetujuFoto = () => {
    if (!selFoto.length) return;
    setFotoIkan(fs => fs.map(f => selFoto.includes(f.id) ? { ...f, status: "Disetujui", adminVerif: ADMIN_ID } : f));
    setSelFoto([]);
    flash(`${selFoto.length} Foto disetujui`);
  };

  const eksekusiKonfirmasi = async () => {
    if (!confirm) return;
    const alasan = alasanInput.trim();
    
    if ((confirm.targetStatus === "Ditolak" || confirm.targetStatus === "Dinonaktifkan" || confirm.targetStatus === "Laporan ditolak") && !alasan) {
      flash("Keterangan/Alasan wajib diisi!");
      return;
    }

    if (confirm.type === "nelayan") {
      await supabase.from("nelayan").update({
        status: confirm.targetStatus,
        keterangan: alasan || null,
        admin_verif: ADMIN_ID,
        terverifikasi: confirm.targetStatus === "Aktif"
      }).eq("id", confirm.id);

      setNel(ns => ns.map(n => n.id === confirm.id ? { 
        ...n, 
        status: confirm.targetStatus as Nel["status"], 
        adminVerif: ADMIN_ID, 
        keterangan: (confirm.targetStatus === "Ditolak" || confirm.targetStatus === "Dinonaktifkan") ? alasan : undefined 
      } : n));
      setDetailNel(null);
    } else if (confirm.type === "foto") {
      await supabase.from("listing").update({
        status: confirm.targetStatus === "Disetujui" ? "aktif" : "ditolak"
      }).eq("id", confirm.id);

      setFotoIkan(fs => fs.map(f => f.id === confirm.id ? { 
        ...f, 
        status: confirm.targetStatus as FotoIkan["status"], 
        adminVerif: ADMIN_ID, 
        keterangan: confirm.targetStatus === "Ditolak" ? alasan : undefined 
      } : f));
      setDetailFoto(null);
    } else if (confirm.type === "laporan") {
      await supabase.from("laporan").update({
        selesai: true,
        tindakan: confirm.targetStatus,
        admin_verif: ADMIN_ID
      }).eq("id", confirm.id);

      setLap(ls => ls.map(l => l.id === confirm.id ? {
        ...l,
        selesai: true,
        tindakan: confirm.targetStatus,
        adminVerif: ADMIN_ID
      } : l));
    } else if (confirm.type === "tarif") {
      if (!isSuperAdmin) { flash("Akses ditolak: Hanya Super Admin"); return; }
      
      const targetTarif = tarif.find(t => t.id === confirm.id);
      await supabase.from("rute").update({
        biaya_rute: confirm.targetStatus === "Disetujui" && targetTarif?.usulan ? targetTarif.usulan : targetTarif?.aktif,
        status_usulan: confirm.targetStatus,
        admin_verif: ADMIN_ID,
        alasan_penolakan: confirm.targetStatus === "Ditolak" ? alasan : null
      }).eq("id", confirm.id);

      setTarif(ts => ts.map(t => t.id === confirm.id ? {
        ...t,
        aktif: confirm.targetStatus === "Disetujui" ? t.usulan! : t.aktif,
        statusUsulan: confirm.targetStatus as Tarif["statusUsulan"],
        adminVerif: ADMIN_ID,
        alasanPenolakan: confirm.targetStatus === "Ditolak" ? alasan : undefined
      } : t));
    } else if (confirm.type === "hapusTitik") {
      if (!isSuperAdmin) { flash("Akses ditolak: Hanya Super Admin"); return; }
      await supabase.from("titik_kumpul").delete().eq("id", confirm.id);
      setTitikList(ts => ts.filter(t => t.id !== confirm.id));
    } else if (confirm.type === "transport") {
      if (!isSuperAdmin) { flash("Akses ditolak: Hanya Super Admin"); return; }
      await supabase.from("transport_companies").update({
        status: confirm.targetStatus,
        admin_verif: ADMIN_ID,
        alasan_penolakan: confirm.targetStatus === "Ditolak" ? alasan : null
      }).eq("id", confirm.id);

      setTransList(tr => tr.map(t => t.id === confirm.id ? {
        ...t,
        status: confirm.targetStatus as TransportComp["status"],
        adminVerif: ADMIN_ID,
        alasanPenolakan: confirm.targetStatus === "Ditolak" ? alasan : undefined
      } : t));
    }

    setConfirm(null);
    setAlasanInput("");
    flash(`Aksi berhasil disimpan (${confirm.aksi})`);
  };

  const simpanTitikBaru = async () => {
    if (!formTitik.nama || !formTitik.wilayah || !formTitik.alamat) {
      flash("Nama titik, wilayah, dan alamat wajib diisi!");
      return;
    }

    const { data: inserted, error } = await supabase.from("titik_kumpul").insert({
      nama: formTitik.nama.trim(),
      daerah: formTitik.wilayah.trim(),
      alamat: formTitik.alamat.trim(),
      kapasitas: formTitik.kapasitas.trim() || "10 Ton",
      sk_perizinan: formTitik.skPerizinan.trim() || "DOKUMEN_SK_RESMI.pdf",
      admin_creator: ADMIN_ID
    }).select().single();

    const dataBaru: TitikHub = {
      id: inserted ? inserted.id : Date.now(),
      nama: formTitik.nama.trim(),
      wilayah: formTitik.wilayah.trim(),
      alamat: formTitik.alamat.trim(),
      kapasitas: formTitik.kapasitas.trim() || "10 Ton",
      skPerizinan: formTitik.skPerizinan.trim() || "DOKUMEN_SK_RESMI.pdf",
      adminCreator: ADMIN_ID
    };
    setTitikList(prev => [dataBaru, ...prev]);
    setFormTitik({ nama: "", wilayah: "", alamat: "", kapasitas: "", skPerizinan: "" });
    setModalTitik(false);
    flash("Titik hub resmi berhasil ditambahkan");
  };

  const ikan = 65000 * kg, ong = ongkir(8000, kg), kom = Math.round((ikan * p.komisi) / 100), feeO = Math.round((ong * p.fee) / 100), lay = p.layanan;
  const bayar = ikan + ong + lay, jala = kom + feeO + lay, nelT = ikan - kom, trT = ong - feeO;
  const bar = [["Nelayan", nelT, "bg-brand"], ["Transport", trT, "bg-ink"], ["JalaLink", jala, "bg-soft"]] as const;

  const pendingNelCount = displayedNel.filter(n => n.status === "Menunggu" || n.status === "Banding").length;
  const pendingFotoCount = displayedFoto.filter(f => f.status === "Menunggu").length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-surface/30 to-white font-body text-ink">
      <header className="sticky top-0 z-30 border-b border-soft/40 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <button onClick={() => go("ringkasan")} aria-label="Beranda"><Image src="/logo.png" alt="JalaLink" width={110} height={36} className="object-contain" /></button>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map(([k, l, , n]) => {
              const disabled = (k === "tarif") && !isSuperAdmin;
              return (
                <button 
                  key={k} 
                  onClick={() => go(k)} 
                  className={`flex items-center gap-2 rounded-full px-4 py-2 font-sub text-sm font-semibold transition-all ${
                    isOn(k) ? "bg-brand text-white shadow-sm" : disabled ? "text-ink/30 cursor-not-allowed" : "text-ink hover:bg-surface"
                  }`}
                >
                  {l}
                  {disabled && <Lock size={12} className="text-ink/30" />}
                  {n > 0 && !disabled && <span className={`grid size-5 place-items-center rounded-full text-[11px] font-bold ${isOn(k) ? "bg-white text-brand" : "bg-brand text-white"}`}>{n}</span>}
                </button>
              );
            })}
          </nav>

          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setUserMenuOpen(!userMenuOpen)} 
              className="flex items-center gap-2.5 rounded-full p-1 transition-all hover:bg-surface active:scale-95 border border-transparent hover:border-soft/60"
            >
              <span className={`hidden rounded-full px-3 py-1 font-sub text-xs font-semibold sm:block ${isSuperAdmin ? "bg-brand text-white" : "bg-ink text-white"}`}>
                {adminProfile.nama}
              </span>
              <div className={`grid size-10 place-items-center rounded-full font-sub font-bold text-white shadow-md ring-2 ring-white hover:opacity-95 ${isSuperAdmin ? "bg-brand" : "bg-ink"}`}>
                {adminProfile.nama.charAt(0)}
              </div>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-3xl border border-soft/60 bg-white p-2 shadow-2xl animate-in zoom-in-95 duration-150 z-50">
                <div className="border-b border-soft/40 p-3 text-left">
                  <p className="font-sub text-sm font-bold text-ink">{adminProfile.nama}</p>
                  <p className="text-xs text-ink/60 truncate">{adminProfile.email}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${isSuperAdmin ? "bg-brand/10 text-brand" : "bg-ink/10 text-ink"}`}>
                      {adminProfile.role}
                    </span>
                    <span className="text-[10px] text-ink/40">ID: {adminProfile.kode}</span>
                  </div>
                </div>

                <div className="py-1 space-y-0.5 text-xs font-semibold">
                  <button 
                    onClick={() => { setTempProfile({ ...adminProfile }); setModalEditProfil(true); setUserMenuOpen(false); }} 
                    className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-ink/80 hover:bg-surface hover:text-brand transition-colors text-left"
                  >
                    <User size={16} /> Edit Profil Admin
                  </button>
                  <button 
                    onClick={() => { setModalKeamanan(true); setUserMenuOpen(false); }} 
                    className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-ink/80 hover:bg-surface hover:text-brand transition-colors text-left"
                  >
                    <KeyRound size={16} /> Keamanan & Sandi
                  </button>

                  <button 
                    onClick={toggleRoleSimulasi} 
                    className="flex w-full items-center justify-between rounded-2xl bg-surface px-3 py-2.5 text-[11px] font-bold text-brand hover:bg-brand/10 transition-colors text-left"
                  >
                    <span className="flex items-center gap-2">
                      <RefreshCw size={14} /> Ganti Role (Testing)
                    </span>
                    <span className="text-[10px] text-ink/50">{isSuperAdmin ? "→ Ops" : "→ Super"}</span>
                  </button>
                </div>

                <div className="border-t border-soft/40 pt-1">
                  <button 
                    onClick={handleLogout} 
                    className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut size={16} /> Keluar (Logout)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {toast && <div className="fixed left-1/2 top-4 z-[60] -translate-x-1/2 rounded-2xl bg-ink/95 px-5 py-3 font-sub text-sm font-medium text-white shadow-2xl backdrop-blur-sm animate-in fade-in zoom-in-95">{toast}</div>}

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 pb-28 md:pb-10">

          {tab === "ringkasan" && (<>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h1 className="font-heading text-2xl font-bold">Dashboard Operasional</h1>
                <p className="text-sm text-ink/60">Pantau aktivitas transaksi, laporan, dan antrean verifikasi JalaLink secara real-time.</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-surface border border-soft/60 px-3.5 py-1.5 text-xs">
                <Shield size={14} className={isSuperAdmin ? "text-brand" : "text-ink/60"} />
                <span>Status Hak Akses: <b className="font-sub">{adminProfile.role}</b></span>
              </div>
            </div>

            <div className="space-y-6">
              <section>
                <h2 className="mb-3 font-sub text-xs font-bold uppercase tracking-wider text-ink/50">Antrean Verifikasi & Tindakan</h2>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {([["Tiket bantuan", nTiket, "bantuan"], ["Laporan baru", nLap, "laporan"], ["Antrean verifikasi", nNel + nFoto, "nelayan"], ["Usulan tarif", nTarif, "tarif"]] as const).map(([l, v, k]) => (
                    <button key={l} onClick={() => go(k)} className="group flex flex-col justify-between rounded-3xl border border-soft/60 bg-white p-5 text-left transition-all hover:border-brand hover:shadow-lg">
                      <p className="text-sm font-medium text-ink/70 transition-colors group-hover:text-brand flex items-center justify-between">
                        {l}
                        {k === "tarif" && !isSuperAdmin && <Lock size={14} className="text-ink/40" />}
                      </p>
                      <p className={`mt-3 font-heading text-3xl font-bold transition-colors ${v > 0 ? "text-brand" : "text-ink"}`}>
                        {v}
                      </p>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="mb-3 font-sub text-xs font-bold uppercase tracking-wider text-ink/50">Ikhtisar Performa Bisnis</h2>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {[["Pesanan hari ini", "18"], ["Nilai transaksi", rp(4850000)], ["Pendapatan JalaLink", rp(Math.round(4850000 * 0.045))], ["Rating rata-rata", "4,8"]].map(([l, v]) => (
                    <div key={l} className="flex flex-col justify-between rounded-3xl bg-surface/70 p-5 border border-soft/40">
                      <p className="text-sm font-medium text-ink/60">{l}</p>
                      <p className="mt-3 font-heading text-2xl font-bold text-ink">{v}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </>)}

          {tab === "bantuan" && (<>
             <div className="flex items-center justify-between"><h1 className="font-heading text-2xl font-bold">Bantuan & FAQ</h1>
              <div className="flex gap-2">{([["chat", "Chat pembeli"], ["faq", "Kelola FAQ"]] as const).map(([k, l]) => <button key={k} onClick={() => setBsub(k)} className={`rounded-full border px-4 py-2 font-sub text-sm font-semibold transition-all ${bsub === k ? "border-brand bg-brand text-white shadow-sm" : "border-soft bg-white text-ink"}`}>{l}</button>)}</div></div>
            {bsub === "chat" ? (
              <div className="grid gap-4 md:grid-cols-[300px_1fr]">
                <div className={`space-y-2 ${sel !== null ? "hidden md:block" : ""}`}>
                  {tiket.length === 0 ? (
                    <p className="text-xs text-ink/50 p-4 text-center">Belum ada tiket bantuan dari pembeli.</p>
                  ) : tiket.map((x) => (
                    <button key={x.id} onClick={() => setSel(x.id)} className={`w-full rounded-2xl p-3.5 text-left transition-all ${sel === x.id ? "bg-brand/10 ring-2 ring-brand" : "bg-surface/70 hover:bg-surface"}`}>
                      <div className="flex items-center justify-between"><b className="font-sub">{x.pembeli}</b>{x.selesai ? <Pill dark>Selesai</Pill> : <Pill>Terbuka</Pill>}</div>
                      <p className="truncate text-sm text-ink/60 mt-1">{x.topik}</p>
                    </button>
                  ))}
                </div>
                <div className={`h-[calc(100dvh-10rem)] flex-col overflow-hidden md:h-[70vh] rounded-3xl border border-soft/60 bg-white ${sel === null ? "hidden md:flex" : "flex"}`}>
                  {!t ? <p className="m-auto text-sm text-ink/60">Pilih tiket untuk membalas.</p> : (<>
                    <div className="flex items-center gap-2 border-b border-soft/30 p-3.5 bg-surface/30">
                      <button onClick={() => setSel(null)} className="grid size-9 place-items-center rounded-full bg-brand text-white md:hidden" aria-label="Kembali"><ChevronLeft size={18} /></button>
                      <div className="flex-1"><p className="font-sub font-bold">{t.pembeli}</p><p className="text-xs text-ink/60">{t.topik}</p></div>
                      <button onClick={jadikanFaq} className={out}>Jadikan FAQ</button>
                      <button onClick={() => patchT(t.id, (x) => ({ ...x, selesai: !x.selesai }))} className={pri}>{t.selesai ? "Buka lagi" : "Selesaikan"}</button>
                    </div>
                    <div className="flex-1 space-y-2.5 overflow-y-auto bg-surface/40 p-4">{t.msgs.map((m, i) => <div key={i} className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.me ? "ml-auto rounded-br-sm bg-brand text-white shadow-sm" : "rounded-bl-sm bg-white shadow-sm border border-soft/40"}`}>{m.text}</div>)}</div>
                    <div className="space-y-2 border-t border-soft/30 p-3.5">
                      <select value="" onChange={(e) => setReply(faq.find((f) => f.id === Number(e.target.value))?.jawaban ?? "")} className={inp} aria-label="Sisipkan jawaban FAQ">
                        <option value="">Sisipkan jawaban dari FAQ…</option>{faq.map((f) => <option key={f.id} value={f.id}>{f.pertanyaan}</option>)}
                      </select>
                      <div className="flex gap-2"><input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === "Enter" && kirim()} placeholder="Tulis balasan..." className={inp} /><button onClick={kirim} className={`${pri} px-4`} aria-label="Kirim"><Send size={18} /></button></div>
                    </div>
                  </>)}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-ink/60">Perubahan di sini langsung tampil di Pusat Bantuan pembeli.</p>
                {faq.map((f) => (
                  <div key={f.id} className={`${card} space-y-2`}>
                    <div className="flex gap-2">
                      <select value={f.kategori} onChange={(e) => setFaq((a) => a.map((x) => (x.id === f.id ? { ...x, kategori: e.target.value } : x)))} className={inp}>{KAT.map((k) => <option key={k}>{k}</option>)}</select>
                      <button onClick={() => setFaq((a) => a.filter((x) => x.id !== f.id))} className="grid size-11 shrink-0 place-items-center rounded-2xl border border-soft/60 bg-white text-red-600 hover:bg-red-50" aria-label="Hapus"><Trash2 size={18} /></button>
                    </div>
                    <input value={f.pertanyaan} onChange={(e) => setFaq((a) => a.map((x) => (x.id === f.id ? { ...x, pertanyaan: e.target.value } : x)))} className={inp} placeholder="Pertanyaan" />
                    <textarea value={f.jawaban} rows={3} onChange={(e) => setFaq((a) => a.map((x) => (x.id === f.id ? { ...x, jawaban: e.target.value } : x)))} className={`${inp} h-auto py-2.5`} placeholder="Jawaban" />
                  </div>
                ))}
                <button onClick={() => setFaq((a) => [...a, { id: Date.now(), kategori: KAT[0], pertanyaan: "", jawaban: "" }])} className={`${out} flex items-center gap-2`}><Plus size={16} />Tambah FAQ</button>
              </div>
            )}
          </>)}

          {tab === "laporan" && (<>
            <h1 className="font-heading text-2xl font-bold">Laporan</h1>
            <p className="text-sm text-ink/60">Hanya percakapan/pesanan yang dilaporkan yang muncul di sini, lengkap dengan bukti.</p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 mb-2">
              <div className="relative flex-1 sm:max-w-xs">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
                <input type="text" placeholder="Cari pelapor, terlapor, atau keluhan..." value={searchLap} onChange={e => setSearchLap(e.target.value)} className={`${inp} h-10 pl-9 text-xs`} />
              </div>
              <div className="flex overflow-x-auto gap-2 pb-1 hide-scrollbar items-center">
                {["Semua", "Perlu Tindakan", "Percakapan", "Pesanan", "Selesai"].map(f => (
                   <button key={f} onClick={() => setFilterLap(f)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${filterLap === f ? "bg-brand text-white shadow-sm" : "bg-surface text-ink border border-soft/60 hover:bg-soft/20"}`}>{f}</button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 pt-2 lg:grid-cols-2">
              {displayedLap.length === 0 ? (
                <div className="col-span-full py-8 text-center text-sm text-ink/50">Tidak ada laporan yang sesuai dengan pencarian atau filter.</div>
              ) : displayedLap.map((l) => (
                <div key={l.id} className={`${card} space-y-3`}>
                  <div className="flex items-center justify-between"><Pill>{l.jenis}</Pill>{l.selesai ? <Pill dark>{l.tindakan}</Pill> : <span className="font-sub text-xs font-semibold text-brand">Perlu tindakan</span>}</div>
                  <div><p className="font-sub font-bold">{l.alasan}</p><p className="text-sm text-ink/60">Pelapor: {l.pelapor} · Terlapor: {l.terlapor}</p></div>
                  
                  <div className="flex flex-wrap gap-2">
                    {l.bukti.map((b) => (
                      <button key={b} onClick={() => setPreviewBukti(b)} className="flex items-center gap-1.5 rounded-xl border border-soft bg-white px-3 py-1.5 text-xs font-medium text-brand hover:border-brand hover:bg-brand/5 transition-colors cursor-pointer">
                        <FileText size={14} />
                        {b}
                      </button>
                    ))}
                  </div>
                  
                  {l.chatLog && (
                    <div className="rounded-2xl border border-soft/50 bg-white p-3.5">
                      <button onClick={() => setBukaChat(bukaChat === l.id ? null : l.id)} className="font-sub text-sm font-bold text-brand hover:underline">
                        {bukaChat === l.id ? "Sembunyikan Percakapan" : "Lihat Isi Percakapan yang Dilaporkan"}
                      </button>
                      {bukaChat === l.id && (
                        <div className="mt-3 space-y-2 border-t border-soft/50 pt-3">
                          {l.chatLog.map((chat, idx) => (
                            <div key={idx} className={`flex flex-col ${chat.sender === l.pelapor ? "items-end" : "items-start"}`}>
                              <span className="mb-0.5 text-[10px] text-ink/50">{chat.sender}</span>
                              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${chat.sender === l.pelapor ? "bg-brand/10 text-ink" : "bg-surface border border-soft/40 text-ink"}`}>
                                {chat.text}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {!l.selesai ? (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-soft/30">
                      <button onClick={() => setConfirm({ id: l.id, type: "laporan", aksi: "Peringatkan Terlapor", targetStatus: "Peringatan dikirim" })} className={out}>Peringatkan</button>
                      <button onClick={() => setConfirm({ id: l.id, type: "laporan", aksi: "Blokir Terlapor", targetStatus: "Akun diblokir" })} className={out}>Blokir terlapor</button>
                      {l.jenis === "Pesanan" && <button onClick={() => setConfirm({ id: l.id, type: "laporan", aksi: "Proses Refund Pembeli", targetStatus: "Refund diproses" })} className={pri}>Refund pembeli</button>}
                      <button onClick={() => setConfirm({ id: l.id, type: "laporan", aksi: "Tolak Laporan", targetStatus: "Laporan ditolak" })} className="h-10 px-3 font-sub text-sm font-semibold text-ink/60 hover:text-ink">Tolak</button>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-soft/30 text-xs text-ink/60">
                      {l.adminVerif && <p className="text-brand font-semibold">Diproses oleh: {l.adminVerif}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>)}

          {tab === "nelayan" && (<>
            <section className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <h1 className="font-heading text-2xl font-bold">Akun Nelayan</h1>
                  <p className="text-sm text-ink/60">Kelola persetujuan pendaftaran akun nelayan baru.</p>
                </div>
                {pendingNelCount > 0 && (
                  <div className="flex gap-2">
                    <button onClick={toggleSemuaNel} className={`${out} px-3 text-xs`}>
                      {selNel.length > 0 ? "Batalkan" : "Centang Semua"}
                    </button>
                    {selNel.length > 0 && (
                      <button onClick={bulkSetujuNel} className={`${pri} flex items-center justify-center gap-2 px-3 text-xs`}><Check size={14} /> Setujui ({selNel.length})</button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 mb-2">
                <div className="relative flex-1 sm:max-w-xs">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
                  <input type="text" placeholder="Cari nama atau titik..." value={searchNel} onChange={e => setSearchNel(e.target.value)} className={`${inp} h-10 pl-9 text-xs`} />
                </div>
                <div className="flex overflow-x-auto gap-2 pb-1 hide-scrollbar items-center">
                  {["Semua", "Perlu Aksi", "Banding", "Menunggu", "Aktif", "Ditolak", "Dinonaktifkan"].map(f => (
                     <button key={f} onClick={() => setFilterNel(f)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${filterNel === f ? "bg-brand text-white shadow-sm" : "bg-surface text-ink border border-soft/60 hover:bg-soft/20"}`}>{f}</button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 pt-2 md:grid-cols-2">
                {displayedNel.length === 0 ? (
                   <div className="col-span-full py-8 text-center text-sm text-ink/50">Tidak ada akun yang sesuai dengan pencarian atau filter.</div>
                ) : displayedNel.map((n) => (
                  <div key={n.id} className={`${card} space-y-2`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {(n.status === "Menunggu" || n.status === "Banding") && (
                          <input type="checkbox" checked={selNel.includes(n.id)} onChange={() => toggleNel(n.id)} className="size-4 cursor-pointer accent-brand rounded" />
                        )}
                        <b className="font-heading text-lg">{n.nama}</b>
                      </div>
                      <Pill dark={n.status !== "Menunggu" && n.status !== "Banding"}>{n.status}</Pill>
                    </div>
                    <p className="flex items-center gap-1 text-sm text-ink/70 mb-2"><MapPin size={14} className="text-brand" />{n.titik} · {n.daerah}</p>
                    
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="flex h-auto min-h-[4rem] flex-col items-center justify-center rounded-2xl border border-soft/60 bg-white p-2 text-center">
                        <span className="mb-0.5 text-[10px] font-bold text-ink/50 uppercase">KTP & Selfie</span>
                        <span className="text-[10px] text-ink/80 leading-tight">{n.selfie || n.dok}</span>
                      </div>
                      <div className="flex h-auto min-h-[4rem] flex-col items-center justify-center rounded-2xl border border-soft/60 bg-white p-2 text-center">
                        <span className="mb-0.5 text-[10px] font-bold text-ink/50 uppercase">No Rekening</span>
                        <span className="text-[10px] text-ink/80 leading-tight">{n.rek || "Tidak Ada"}</span>
                      </div>
                      <div className="flex h-auto min-h-[4rem] flex-col items-center justify-center rounded-2xl border border-soft/60 bg-white p-2 text-center">
                        <span className="mb-0.5 text-[10px] font-bold text-ink/50 uppercase">Geotag</span>
                        <span className="text-[10px] text-ink/80 leading-tight">{n.geotag || "Tidak Ada"}</span>
                      </div>
                    </div>

                    {n.status === "Banding" && <div className="mb-3 rounded-2xl bg-surface border border-soft/60 p-3 text-xs text-ink/80"><b>Nelayan ajukan banding: </b>"{n.keterangan}" <br/> Admin dapat meninjau ulang.</div>}
                    
                    <button onClick={() => setDetailNel(n.id)} className={`${out} w-full`}>
                      {n.status === "Menunggu" || n.status === "Banding" ? "Verifikasi Lanjutan" : "Lihat Detail Dokumen"}
                    </button>

                    {n.status !== "Menunggu" && n.status !== "Banding" && (
                      <div className="pt-2 border-t border-soft/40 mt-3 space-y-1">
                        <div className="text-xs text-ink/60">
                          {n.adminVerif && <p className="text-brand font-semibold mb-1">Diproses oleh: {n.adminVerif}</p>}
                          {n.status === "Ditolak" && <p className="text-red-500 font-semibold">Ditolak karena: {n.keterangan}</p>}
                          {n.status === "Dinonaktifkan" && <p className="text-red-500 font-semibold">Dinonaktifkan karena: {n.keterangan}</p>}
                        </div>
                        
                        <div className="pt-2">
                          {n.status === "Aktif" && <button onClick={() => setConfirm({ id: n.id, type: "nelayan", aksi: "Nonaktifkan Akun", targetStatus: "Dinonaktifkan" })} className="w-full h-9 rounded-2xl border border-red-200 bg-white font-sub text-xs font-bold text-red-600 hover:bg-red-50">Nonaktifkan Akun</button>}
                          {n.status === "Dinonaktifkan" && <button onClick={() => setNs(n.id, "Aktif")} className="w-full h-9 rounded-2xl border border-brand bg-white font-sub text-xs font-bold text-brand hover:bg-surface">Aktifkan Kembali</button>}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-8 space-y-2 border-t border-soft/40 pt-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <h1 className="font-heading text-2xl font-bold">Validasi Foto Ikan</h1>
                  <p className="text-sm text-ink/60">Periksa foto tangkapan sebelum memberikan badge Terverifikasi.</p>
                </div>
                {pendingFotoCount > 0 && (
                  <div className="flex gap-2">
                    <button onClick={toggleSemuaFoto} className={`${out} px-3 text-xs`}>
                      {selFoto.length > 0 ? "Batalkan" : "Centang Semua"}
                    </button>
                    {selFoto.length > 0 && (
                      <button onClick={bulkSetujuFoto} className={`${pri} flex items-center justify-center gap-2 px-3 text-xs`}><Check size={14} /> Setujui ({selFoto.length})</button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 mb-2">
                <div className="relative flex-1 sm:max-w-xs">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
                  <input type="text" placeholder="Cari ikan atau nelayan..." value={searchFoto} onChange={e => setSearchFoto(e.target.value)} className={`${inp} h-10 pl-9 text-xs`} />
                </div>
                <div className="flex overflow-x-auto gap-2 pb-1 hide-scrollbar items-center">
                  {["Semua", "Menunggu", "Disetujui", "Ditolak"].map(f => (
                     <button key={f} onClick={() => setFilterFoto(f)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${filterFoto === f ? "bg-brand text-white shadow-sm" : "bg-surface text-ink border border-soft/60 hover:bg-soft/20"}`}>{f}</button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 pt-2 md:grid-cols-2">
                {displayedFoto.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-sm text-ink/50">Tidak ada foto yang sesuai dengan pencarian atau filter.</div>
                ) : displayedFoto.map((f) => (
                  <div key={f.id} className={`${card} flex flex-col justify-between space-y-3`}>
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          {f.status === "Menunggu" && (
                            <input type="checkbox" checked={selFoto.includes(f.id)} onChange={() => toggleFoto(f.id)} className="mt-1 size-4 cursor-pointer accent-brand rounded" />
                          )}
                          <div>
                            <b className="block font-heading text-lg">{f.ikan}</b>
                            <span className="text-sm text-ink/60">{f.nelayan}</span>
                          </div>
                        </div>
                        <Pill dark={f.status !== "Menunggu"}>{f.status}</Pill>
                      </div>

                      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-soft/50 bg-white p-3 mb-2">
                        <div className="grid h-16 w-24 shrink-0 place-items-center rounded-xl bg-surface p-2 text-center text-xs font-bold text-ink/50 break-words">
                          {f.foto}
                        </div>
                        <p className="text-xs text-ink/70">
                          Pastikan foto asli, pencahayaan jelas, dan ikan terlihat segar (mata bening).
                        </p>
                      </div>
                    </div>

                    <button onClick={() => setDetailFoto(f.id)} className={`${out} w-full`}>
                      {f.status === "Menunggu" ? "Validasi Lanjutan" : "Lihat Detail Foto"}
                    </button>

                    {f.status !== "Menunggu" && (
                      <div className="text-xs text-ink/60 space-y-1 pt-2 border-t border-soft/40">
                        {f.adminVerif && <p className="text-brand font-semibold">Diproses oleh: {f.adminVerif}</p>}
                        {f.status === "Ditolak" && <p className="text-red-500">Alasan Tolak: {f.keterangan}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </>)}

          {tab === "tarif" && (<>
            <h1 className="font-heading text-2xl font-bold">Kelola</h1>{sub}
            <section className="space-y-4">
              <div>
                <h2 className="font-heading text-lg font-bold">Tarif rute (flat per kg)</h2>
                <p className="text-sm text-ink/60">Transport mengusulkan perubahan, admin menyetujui, dan tarif baru hanya berlaku untuk pesanan berikutnya.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:max-w-xs">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
                  <input type="text" placeholder="Cari rute atau nama mitra..." value={searchTarif} onChange={e => setSearchTarif(e.target.value)} className={`${inp} h-10 pl-9 text-xs`} />
                </div>

                <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)} className={`${inp} h-10 sm:w-48 text-xs font-semibold`}>
                  <option value="Semua Perusahaan">Semua Perusahaan Trans</option>
                  {transList.map(t => <option key={t.nama} value={t.nama}>{t.nama}</option>)}
                </select>

                <div className="flex overflow-x-auto gap-2 pb-1 hide-scrollbar items-center">
                  {["Semua", "Ada Usulan", "Tanpa Usulan", "Disetujui", "Ditolak"].map(f => (
                     <button key={f} onClick={() => setFilterTarif(f)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${filterTarif === f ? "bg-brand text-white shadow-sm" : "bg-surface text-ink border border-soft/60 hover:bg-soft/20"}`}>{f}</button>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-soft/50 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-soft/40 bg-surface/50 font-sub text-xs font-bold text-ink/60 uppercase tracking-wider">
                        <th className="py-4 px-5">Rute Pengiriman</th>
                        <th className="py-4 px-5">Tarif Aktif</th>
                        <th className="py-4 px-5">Acuan Normal / Pasar</th>
                        <th className="py-4 px-5">Usulan Mitra</th>
                        <th className="py-4 px-5 text-right">Aksi & Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-soft/30">
                      {displayedTarif.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-sm text-ink/50">Tidak ada rute pengiriman yang sesuai.</td>
                        </tr>
                      ) : displayedTarif.map((r) => {
                        const isUnder = r.usulan && r.usulan < r.tarifNormalMin;
                        const isOver = r.usulan && r.usulan > r.tarifNormalMax;

                        return (
                          <tr key={r.id} className="hover:bg-surface/30 transition-colors">
                            <td className="py-4 px-5 font-sub font-bold text-ink">
                              {r.rute}
                            </td>
                            <td className="py-4 px-5 text-ink/70">
                              <div>
                                <b className="text-ink">{rp(r.aktif)}/kg</b>
                                <span className="block text-[11px] text-ink/50">kg berikutnya 75%</span>
                              </div>
                            </td>
                            <td className="py-4 px-5 text-xs font-medium text-ink/70">
                              <span className="rounded-xl bg-surface/80 px-2.5 py-1 border border-soft/40 inline-block font-semibold">
                                {rp(r.tarifNormalMin)} - {rp(r.tarifNormalMax)}/kg
                              </span>
                            </td>
                            <td className="py-4 px-5">
                              {r.usulan ? (
                                <div>
                                  <div className="flex items-center gap-2">
                                    <b className="text-brand text-base">{rp(r.usulan)}/kg</b>

                                    {isOver && (
                                      <div className="relative group inline-block">
                                        <span className="flex items-center gap-1 text-[11px] font-bold text-white bg-brand px-2.5 py-0.5 rounded-full shadow-sm cursor-pointer border border-brand">
                                          <AlertCircle size={12} /> Overprice
                                        </span>
                                        <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 hidden group-hover:block w-52 rounded-2xl bg-ink px-3 py-2 text-[11px] font-medium text-white shadow-xl z-20 text-center">
                                          Harga acuan: {rp(r.tarifNormalMin)} - {rp(r.tarifNormalMax)}/kg
                                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-ink"></div>
                                        </div>
                                      </div>
                                    )}

                                    {isUnder && (
                                      <div className="relative group inline-block">
                                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full cursor-pointer border border-emerald-300">
                                          <AlertCircle size={12} /> Underprice
                                        </span>
                                        <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 hidden group-hover:block w-52 rounded-2xl bg-ink px-3 py-2 text-[11px] font-medium text-white shadow-xl z-20 text-center">
                                          Harga acuan: {rp(r.tarifNormalMin)} - {rp(r.tarifNormalMax)}/kg
                                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-ink"></div>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <span className="block text-[11px] text-ink/60 font-semibold mt-1">{r.pengaju}</span>
                                  
                                  {r.statusUsulan === "Banding" && (
                                    <div className="mt-2.5 max-w-xs rounded-2xl bg-brand/10 p-3 text-[11px] border border-brand/30 text-ink">
                                      <b className="block font-sub font-bold text-brand">Banding Transport:</b> 
                                      <span className="text-ink/80 italic">"{r.alasanBanding}"</span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <Pill dark>Tanpa usulan</Pill>
                              )}
                            </td>
                            <td className="py-4 px-5 text-right">
                              {r.usulan && (r.statusUsulan === "Menunggu" || r.statusUsulan === "Banding") ? (
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => setConfirm({ id: r.id, type: "tarif", aksi: "Setujui Tarif Usulan", targetStatus: "Disetujui" })} className={`${pri} h-9 px-4 text-xs`}>Setujui</button>
                                  <button onClick={() => setConfirm({ id: r.id, type: "tarif", aksi: "Tolak Tarif Usulan", targetStatus: "Ditolak" })} className={`${out} h-9 px-4 text-xs`}>Tolak</button>
                                </div>
                              ) : r.statusUsulan === "Disetujui" ? (
                                <div className="text-xs text-right">
                                  <span className="inline-block rounded-full bg-brand/10 text-brand px-3 py-0.5 font-bold mb-0.5">Disetujui</span>
                                  {r.adminVerif && <p className="text-[10px] text-ink/50">Oleh: {r.adminVerif}</p>}
                                </div>
                              ) : r.statusUsulan === "Ditolak" ? (
                                <div className="text-xs text-right">
                                  <span className="inline-block rounded-full bg-red-100 text-red-600 px-3 py-0.5 font-bold mb-0.5">Ditolak (Bisa Banding)</span>
                                  {r.adminVerif && <p className="text-[10px] text-ink/50">Oleh: {r.adminVerif}</p>}
                                  {r.alasanPenolakan && <p className="text-[10px] text-red-500 italic max-w-xs ml-auto">"{r.alasanPenolakan}"</p>}
                                </div>
                              ) : (
                                <span className="text-xs text-ink/40 font-medium">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredTarif.length > 3 && (
                  <div className="border-t border-soft/40 bg-surface/30 p-2.5 text-center">
                    <button 
                      onClick={() => setTampilSemuaTarif(!tampilSemuaTarif)} 
                      className="inline-flex items-center gap-1.5 font-sub text-xs font-bold text-brand hover:underline"
                    >
                      {tampilSemuaTarif ? (
                        <>Sembunyikan ({filteredTarif.length} Rute) <ChevronUp size={14} /></>
                      ) : (
                        <>Lihat Semua ({filteredTarif.length} Rute) <ChevronDown size={14} /></>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-3 pt-4">
              <h2 className="font-heading text-lg font-bold">Pembagian per pesanan</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className={`${card} space-y-4`}>
                  <div className="flex items-center justify-between border-b border-soft/40 pb-3">
                    <span className="font-sub font-semibold">Skema Potongan</span>
                    <Pill dark={kunci}>{kunci ? "Terkunci" : "Mode Edit"}</Pill>
                  </div>

                  {kunci ? (
                    <div className="rounded-2xl border border-dashed border-soft/60 bg-white p-4 text-center space-y-3">
                      <p className="text-sm text-ink/60">Masukkan kata sandi untuk mengubah persentase komisi dan biaya layanan (Sandi: admin123).</p>
                      <div className="flex gap-2">
                        <input type="password" value={sandi} onChange={(e) => setSandi(e.target.value)} placeholder="Kata Sandi" className={inp} />
                        <button onClick={cekSandi} className={pri}>Buka</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="block text-sm">
                        <span className="mb-1 block font-sub font-semibold">Komisi dari nelayan (%)</span>
                        <input type="number" min="0" value={tempP.komisi} onChange={(e) => setTempP({ ...tempP, komisi: Number(e.target.value) })} className={inp} />
                      </label>
                      <label className="block text-sm">
                        <span className="mb-1 block font-sub font-semibold">Fee dari ongkir/transport (%)</span>
                        <input type="number" min="0" value={tempP.fee} onChange={(e) => setTempP({ ...tempP, fee: Number(e.target.value) })} className={inp} />
                      </label>
                      <label className="block text-sm">
                        <span className="mb-1 block font-sub font-semibold">Biaya layanan pembeli (Rp)</span>
                        <input type="number" min="0" step="500" value={tempP.layanan} onChange={(e) => setTempP({ ...tempP, layanan: Number(e.target.value) })} className={inp} />
                      </label>
                      <div className="flex gap-2 pt-2">
                        <button onClick={() => { setKunci(true); setTempP({ ...p }); }} className={`${out} flex-1`}>Batal</button>
                        <button onClick={simpanPengaturan} className={`${pri} flex-1`}>Simpan</button>
                      </div>
                    </div>
                  )}

                  <label className="block text-sm border-t border-soft/40 pt-4"><span className="flex justify-between font-sub font-semibold mb-2">Simulasi (ikan Rp65.000/kg)<b className="text-brand">{kg} kg</b></span>
                    <input type="number" min={1} value={kg} onChange={(e) => setKg(Number(e.target.value))} className={inp} />
                  </label>
                </div>

                <div className={`${card} space-y-3 text-sm`}>
                  <div className="flex justify-between"><span>Ikan</span><b>{rp(ikan)}</b></div>
                  <div className="flex justify-between"><span>Ongkir</span><b>{rp(ong)}</b></div>
                  <div className="flex justify-between"><span>Biaya layanan</span><b>{rp(lay)}</b></div>
                  <div className="flex justify-between border-t border-soft/40 pt-2"><b className="font-heading">Pembeli bayar</b><b className="font-heading text-lg text-brand">{rp(bayar)}</b></div>
                  <div className="flex h-3 overflow-hidden rounded-full">{bar.map(([l, v, c]) => <div key={l} className={c} style={{ width: `${(v / bayar) * 100}%` }} />)}</div>
                  {bar.map(([l, v, c]) => <div key={l} className="flex items-center justify-between"><span className="flex items-center gap-2"><span className={`size-3 rounded-full ${c}`} />{l} terima</span><b>{rp(v)}</b></div>)}
                  <p className="text-xs text-ink/60">Margin JalaLink {((jala / bayar) * 100).toFixed(1).replace(".", ",")}% dari total bayar (komisi {rp(kom)} + fee ongkir {rp(feeO)} + layanan {rp(lay)}).</p>
                </div>
              </div>
            </section>
          </>)}

          {tab === "master" && (<>
            <h1 className="font-heading text-2xl font-bold">Kelola</h1>{sub}
            <div className="grid gap-6 md:grid-cols-2">
              
              <section className={`${card} space-y-4`}>
                <div className="flex items-center justify-between border-b border-soft/40 pb-3">
                  <div>
                    <h2 className="font-heading text-lg font-bold flex items-center gap-2">
                      <Building2 size={20} className="text-brand" />
                      Titik Kumpul / Hub Resmi
                    </h2>
                    <p className="text-xs text-ink/60">Hub penampungan ikan cold storage terverifikasi SK.</p>
                  </div>
                  <button onClick={() => setModalTitik(true)} className={`${pri} flex items-center gap-1.5 text-xs h-9 px-3.5`}>
                    <Plus size={16} /> Tambah Titik
                  </button>
                </div>

                <div className="space-y-3">
                  {titikList.map((x) => (
                    <div key={x.id} className="rounded-2xl border border-soft/60 bg-white p-4 space-y-2.5 text-sm shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div>
                          <b className="font-sub font-bold text-ink text-base">{x.nama}</b>
                          <span className="block text-xs text-brand font-semibold">{x.wilayah}</span>
                        </div>
                        <button onClick={() => setConfirm({ id: x.id, type: "hapusTitik", aksi: "Hapus Titik Hub", targetStatus: "Dihapus" })} className="text-ink/40 hover:text-red-600 p-1 rounded-lg transition-colors" aria-label="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <p className="text-xs text-ink/70 flex items-start gap-1">
                        <MapPin size={14} className="shrink-0 text-ink/40 mt-0.5" />
                        {x.alamat}
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-soft/30 text-[11px]">
                        <div className="bg-surface/80 p-2.5 rounded-xl border border-soft/30">
                          <span className="text-ink/50 block font-semibold mb-0.5">Kapasitas Cold Storage</span>
                          <b className="text-ink text-xs">{x.kapasitas}</b>
                        </div>

                        <div className="bg-surface/80 p-2.5 rounded-xl border border-soft/30">
                          <span className="text-ink/50 block font-semibold mb-0.5">Dokumen SK / Izin</span>
                          <button 
                            onClick={() => setViewDokumen({ namaFile: x.skPerizinan, judul: `Surat SK Perizinan - ${x.nama}` })} 
                            className="inline-flex items-center gap-1 text-brand font-bold hover:underline cursor-pointer group text-xs text-left"
                          >
                            <FileText size={12} className="shrink-0 group-hover:scale-110 transition-transform" />
                            <span className="truncate max-w-[110px]">{x.skPerizinan}</span>
                            <Eye size={12} className="shrink-0 text-brand/70" />
                          </button>
                        </div>
                      </div>

                      <div className="text-[10px] text-ink/40 pt-1 flex items-center justify-between">
                        <span>Didaftarkan oleh: <b className="text-ink/60">{x.adminCreator}</b></span>
                        <span className="flex items-center gap-1 text-emerald-600 font-bold"><ShieldCheck size={12} /> Terverifikasi</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className={`${card} space-y-4`}>
                <div className="flex items-center justify-between border-b border-soft/40 pb-3">
                  <div>
                    <h2 className="font-heading text-lg font-bold flex items-center gap-2">
                      <Truck size={20} className="text-brand" />
                      Pendaftaran Mitra Transport
                    </h2>
                    <p className="text-xs text-ink/60">Tinjau dan acc pendaftaran perusahaan transport dari portal mitra.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {transList.map((x) => (
                    <div key={x.id} className="rounded-2xl border border-soft/60 bg-white p-4 space-y-2.5 text-sm shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div>
                          <b className="font-sub font-bold text-ink text-base">{x.nama}</b>
                          <span className="block text-xs text-ink/60">{x.email} · {x.telepon}</span>
                        </div>
                        <Pill dark={x.status !== "Menunggu"}>{x.status}</Pill>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                        <div className="bg-surface/80 p-2.5 rounded-xl border border-soft/30">
                          <span className="text-ink/50 block font-semibold mb-0.5">NIB Perusahaan</span>
                          <b className="text-ink text-xs">{x.nib}</b>
                        </div>
                        <div className="bg-surface/80 p-2.5 rounded-xl border border-soft/30">
                          <span className="text-ink/50 block font-semibold mb-0.5">Penanggung Jawab</span>
                          <b className="text-ink text-xs">{x.penanggungJawab}</b>
                        </div>
                        <div className="bg-surface/80 p-2.5 rounded-xl border border-soft/30">
                          <span className="text-ink/50 block font-semibold mb-0.5">Armada Cold Truck</span>
                          <b className="text-brand text-xs">{x.jumlahArmada} Armada</b>
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-xl bg-surface/40 p-2 border border-soft/30 text-xs">
                        <span className="text-ink/60 text-[11px]">Dokumen Legalitas NIB:</span>
                        <button 
                          onClick={() => setViewDokumen({ namaFile: x.dokumenLegal, judul: `Dokumen Legal NIB - ${x.nama}` })} 
                          className="inline-flex items-center gap-1.5 font-bold text-brand hover:underline cursor-pointer"
                        >
                          <FileText size={14} />
                          {x.dokumenLegal}
                          <Eye size={14} className="text-brand/70" />
                        </button>
                      </div>

                      {x.status === "Menunggu" ? (
                        <div className="flex gap-2 pt-2 border-t border-soft/40">
                          <button onClick={() => setConfirm({ id: x.id, type: "transport", aksi: "Tolak Pendaftaran Transport", targetStatus: "Ditolak" })} className={`${out} h-9 flex-1 text-xs border-ink/20 text-ink/70 hover:bg-red-50 hover:text-red-600 hover:border-red-200`}>Tolak</button>
                          <button onClick={() => setConfirm({ id: x.id, type: "transport", aksi: "Setujui Mitra Transport (Acc)", targetStatus: "Disetujui" })} className={`${pri} h-9 flex-1 text-xs`}>Setujui (Acc)</button>
                        </div>
                      ) : (
                        <div className="text-[10px] text-ink/50 pt-1 flex items-center justify-between border-t border-soft/30">
                          {x.adminVerif && <span>Diproses oleh: <b className="text-brand font-semibold">{x.adminVerif}</b></span>}
                          {x.status === "Ditolak" && <span className="text-red-500 font-semibold">Alasan Tolak: "{x.alasanPenolakan}"</span>}
                          {x.status === "Disetujui" && <span className="flex items-center gap-1 text-emerald-600 font-bold ml-auto"><ShieldCheck size={12} /> Akun Aktif & Terverifikasi</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

            </div>
          </>)}
      </main>

      {modalKeamanan && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-ink/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-5">
            <div className="flex items-center justify-between border-b border-soft/40 pb-3">
              <h3 className="font-heading text-lg font-bold flex items-center gap-2 text-brand">
                <KeyRound size={20} /> Keamanan & Kata Sandi Akun
              </h3>
              <button onClick={() => setModalKeamanan(false)} className="rounded-full bg-surface p-1 text-ink/50 hover:bg-soft/40"><X size={18} /></button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-2xl border border-soft/60 bg-surface/50 p-4 space-y-3">
                <b className="font-sub font-bold text-ink flex items-center gap-1.5 text-sm">
                  <Lock size={16} className="text-brand" /> Ubah Kata Sandi Admin
                </b>
                <div>
                  <label className="block font-semibold text-ink/70 mb-1">Kata Sandi Saat Ini *</label>
                  <input type="password" placeholder="••••••••" value={formSandi.lama} onChange={e => setFormSandi({ ...formSandi, lama: e.target.value })} className={inp} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-ink/70 mb-1">Kata Sandi Baru *</label>
                    <input type="password" placeholder="Min 8 Karakter" value={formSandi.baru} onChange={e => setFormSandi({ ...formSandi, baru: e.target.value })} className={inp} />
                  </div>
                  <div>
                    <label className="block font-semibold text-ink/70 mb-1">Konfirmasi Sandi Baru *</label>
                    <input type="password" placeholder="Ketik Ulang Sandi" value={formSandi.konfirmasi} onChange={e => setFormSandi({ ...formSandi, konfirmasi: e.target.value })} className={inp} />
                  </div>
                </div>
                <button onClick={simpanSandiBaru} className={`${pri} w-full text-xs h-9 mt-1`}>Perbarui Kata Sandi</button>
              </div>

              <div className="rounded-2xl border border-soft/60 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 place-items-center rounded-xl bg-brand/10 text-brand shrink-0">
                      <Mail size={18} />
                    </div>
                    <div>
                      <b className="font-sub text-sm font-bold block text-ink">Pemulihan Kata Sandi via Email</b>
                      <span className="text-[11px] text-ink/60 leading-tight block mt-0.5">Target Email: <b className="text-brand">{adminProfile.email}</b></span>
                    </div>
                  </div>
                  <button onClick={kirimEmailPemulihan} className={`${out} h-8 px-3 text-[11px] shrink-0`}>Tes Kirim OTP</button>
                </div>
              </div>

              <div className="rounded-2xl border border-soft/60 bg-white p-4 space-y-2">
                <b className="font-sub text-xs font-bold text-ink/70 uppercase tracking-wider block">Sesi Login Aktif Perangkat Ini</b>
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <div className="flex items-center gap-3">
                    <div className="grid size-8 place-items-center rounded-lg bg-surface text-ink/60">
                      <Laptop size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-ink">{deviceInfo.browser}</p>
                      <p className="text-ink/50">IP Publik: {deviceInfo.ip} · Terhubung Sekarang</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 font-bold">Aktif</span>
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-2 border-t border-soft/40">
              <button onClick={() => setModalKeamanan(false)} className={`${out} h-9 text-xs px-4`}>Tutup Keamanan</button>
            </div>
          </div>
        </div>
      )}

      {modalEditProfil && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-ink/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-soft/40 pb-3">
              <h3 className="font-heading text-lg font-bold flex items-center gap-2 text-brand">
                <User size={20} /> Edit Profil Admin
              </h3>
              <button onClick={() => setModalEditProfil(false)} className="rounded-full bg-surface p-1 text-ink/50 hover:bg-soft/40"><X size={18} /></button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="relative grid size-20 place-items-center rounded-full bg-brand font-heading text-2xl font-bold text-white shadow-lg">
                  {tempProfile.nama.charAt(0)}
                  <button className="absolute bottom-0 right-0 grid size-7 place-items-center rounded-full bg-ink text-white border-2 ring-white shadow-sm hover:scale-105 transition-transform" aria-label="Ubah foto">
                    <Camera size={14} />
                  </button>
                </div>
                <span className="text-[10px] text-ink/50">Klik ikon kamera untuk ganti foto</span>
              </div>

              <div>
                <label className="block font-bold text-ink/70 mb-1">Nama Lengkap Admin *</label>
                <input type="text" value={tempProfile.nama} onChange={e => setTempProfile({ ...tempProfile, nama: e.target.value })} className={inp} />
              </div>

              <div>
                <label className="block font-bold text-ink/70 mb-1">Email Operasional Admin *</label>
                <input type="email" value={tempProfile.email} onChange={e => setTempProfile({ ...tempProfile, email: e.target.value })} className={inp} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-ink/70 mb-1">Peran / Role</label>
                  <input type="text" disabled value={tempProfile.role} className={`${inp} bg-surface cursor-not-allowed`} />
                </div>
                <div>
                  <label className="block font-bold text-ink/70 mb-1">Kode ID Admin</label>
                  <input type="text" disabled value={tempProfile.kode} className={`${inp} bg-surface cursor-not-allowed`} />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-soft/40">
              <button onClick={() => setModalEditProfil(false)} className={`${out} flex-1`}>Batal</button>
              <button onClick={simpanProfilAdmin} className={`${pri} flex-1`}>Simpan Profil</button>
            </div>
          </div>
        </div>
      )}

      {viewDokumen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-soft/40 bg-surface/80 p-4">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-brand" />
                <h3 className="font-heading text-lg font-bold">{viewDokumen.judul}</h3>
              </div>
              <button onClick={() => setViewDokumen(null)} className="rounded-full bg-white p-1.5 text-ink/50 shadow-sm border border-soft/50 hover:bg-surface"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 bg-surface/30">
              <div className="flex items-center justify-between rounded-2xl bg-white p-4 border border-soft/60 shadow-sm">
                <div>
                  <p className="text-xs text-ink/50 font-medium">Nama File Resmi:</p>
                  <b className="text-sm font-sub text-ink">{viewDokumen.namaFile}</b>
                </div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 text-xs font-bold flex items-center gap-1">
                  <ShieldCheck size={14} /> Terverifikasi Digital
                </span>
              </div>

              <div className="rounded-2xl border-2 border-dashed border-soft/80 bg-white p-8 text-center space-y-4 shadow-inner">
                <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand/10 text-brand">
                  <FileText size={36} />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-base text-ink">Dokumen Resmi Kementerian & Dinas terkait</h4>
                  <p className="text-xs text-ink/60 mt-1 max-w-md mx-auto">
                    Berkas ini telah disahkan dengan stempel basah digital & NIB resmi terdaftar di database JalaLink.
                  </p>
                </div>
                
                <div className="pt-2 flex justify-center gap-3">
                  <button onClick={() => flash("Membuka dokumen versi asli di tab baru...")} className="inline-flex items-center gap-1.5 text-xs font-bold text-brand bg-brand/10 hover:bg-brand/20 px-4 py-2 rounded-xl transition-colors">
                    <ExternalLink size={14} /> Buka Tab Baru
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-soft/40 bg-white flex justify-end">
              <button onClick={() => setViewDokumen(null)} className={pri}>Tutup Dokumen</button>
            </div>
          </div>
        </div>
      )}

      {modalTitik && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-soft/40 pb-3">
              <h3 className="font-heading text-lg font-bold flex items-center gap-2 text-brand">
                <Building2 size={20} /> Tambah Titik Hub Resmi
              </h3>
              <button onClick={() => setModalTitik(false)} className="rounded-full bg-surface p-1 text-ink/50 hover:bg-soft/40"><X size={18} /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-ink/70 mb-1">Nama Titik / TPI Hub *</label>
                <input type="text" placeholder="Misal: TPI Pengambengan" value={formTitik.nama} onChange={e => setFormTitik({ ...formTitik, nama: e.target.value })} className={inp} />
              </div>
              <div>
                <label className="block font-bold text-ink/70 mb-1">Wilayah / Kabupaten *</label>
                <input type="text" placeholder="Misal: Kab. Jembrana, Bali" value={formTitik.wilayah} onChange={e => setFormTitik({ ...formTitik, wilayah: e.target.value })} className={inp} />
              </div>
              <div>
                <label className="block font-bold text-ink/70 mb-1">Alamat Lengkap & Koordinat GPS *</label>
                <textarea placeholder="Jl. Pelabuhan Ikan No. 4, Jembrana" value={formTitik.alamat} onChange={e => setFormTitik({ ...formTitik, alamat: e.target.value })} className={`${inp} h-16 py-2.5 resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-ink/70 mb-1">Kapasitas Storage</label>
                  <input type="text" placeholder="Misal: 25 Ton" value={formTitik.kapasitas} onChange={e => setFormTitik({ ...formTitik, kapasitas: e.target.value })} className={inp} />
                </div>
                <div>
                  <label className="block font-bold text-ink/70 mb-1">Upload SK / Izin (.pdf)</label>
                  <input type="text" placeholder="Nama file SK Izin" value={formTitik.skPerizinan} onChange={e => setFormTitik({ ...formTitik, skPerizinan: e.target.value })} className={inp} />
                </div>
              </div>
              <p className="text-[10px] text-ink/50 italic">* Titik baru akan terikat dengan identitas login {ADMIN_ID} untuk audit.</p>
            </div>

            <div className="flex gap-2 pt-2 border-t border-soft/40">
              <button onClick={() => setModalTitik(false)} className={`${out} flex-1`}>Batal</button>
              <button onClick={simpanTitikBaru} className={`${pri} flex-1`}>Simpan Titik</button>
            </div>
          </div>
        </div>
      )}

      {detailNel !== null && nel.find(n => n.id === detailNel) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
          {(() => {
            const d = nel.find(n => n.id === detailNel)!;
            const perluAksi = d.status === "Menunggu" || d.status === "Banding";
            return (
              <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-soft/40 bg-surface/50 p-4">
                  <h3 className="font-heading text-lg font-bold">Detail Dokumen Nelayan</h3>
                  <button onClick={() => setDetailNel(null)} className="rounded-full bg-white p-1 text-ink/50 shadow-sm border border-soft/50"><X size={18} /></button>
                </div>
                <div className="p-5 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-sub text-lg font-bold">{d.nama}</p>
                      <p className="flex items-center gap-1 text-sm text-ink/60 mt-1"><MapPin size={14} className="text-brand" />{d.titik} · {d.daerah}</p>
                    </div>
                    <Pill dark={!perluAksi}>{d.status}</Pill>
                  </div>
                  
                  {d.status === "Banding" && (
                    <div className="rounded-2xl border border-soft bg-surface p-3 text-sm text-ink/80">
                      <strong>Penolakan Sebelumnya:</strong> "{d.keterangan}"
                      <p className="mt-1 text-xs">Nelayan telah melakukan perbaikan. Silakan tinjau kembali.</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-ink/50">Pratinjau Dokumen KTP & Surat</p>
                    <div className="flex h-48 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-soft bg-surface/50 p-4 text-center">
                      <p className="mt-2 text-sm font-semibold text-ink/70 max-w-[80%] break-words">{d.dok}</p>
                    </div>
                  </div>

                  {perluAksi && (
                    <div className="flex gap-3 pt-2 border-t border-soft/40">
                      <button onClick={() => setConfirm({ id: d.id, type: "nelayan", aksi: "Tolak Pendaftaran", targetStatus: "Ditolak" })} className={`${out} flex-1 border-ink/20 text-ink/70 hover:bg-red-50 hover:text-red-600 hover:border-red-200`}>Tolak</button>
                      <button onClick={() => setConfirm({ id: d.id, type: "nelayan", aksi: "Setujui Akun", targetStatus: "Aktif" })} className={`${pri} flex-1`}>Setujui Akun</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {detailFoto !== null && fotoIkan.find(f => f.id === detailFoto) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
           {(() => {
            const f = fotoIkan.find(f => f.id === detailFoto)!;
            const perluAksi = f.status === "Menunggu";
            return (
              <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-soft/40 bg-surface/50 p-4">
                  <h3 className="font-heading text-lg font-bold">Validasi Foto Ikan</h3>
                  <button onClick={() => setDetailFoto(null)} className="rounded-full bg-white p-1 text-ink/50 shadow-sm border border-soft/50"><X size={18} /></button>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-sub text-lg font-bold">{f.ikan}</p>
                      <p className="text-sm text-ink/60">Nelayan: {f.nelayan}</p>
                    </div>
                    <Pill dark={!perluAksi}>{f.status}</Pill>
                  </div>
                  
                  <div className="flex h-48 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-soft bg-surface/50 p-4 text-center">
                    <p className="text-sm font-bold text-ink/40 break-all">{f.foto}</p>
                  </div>
                  <p className="text-xs text-center text-ink/60">Pastikan pencahayaan cukup, ikan terlihat segar, dan tidak menggunakan stok foto palsu.</p>

                  {perluAksi && (
                    <div className="flex gap-3 pt-2 border-t border-soft/40">
                      <button onClick={() => setConfirm({ id: f.id, type: "foto", aksi: "Tolak Foto", targetStatus: "Ditolak" })} className={`${out} flex-1 border-ink/20 text-ink/70 hover:bg-red-50 hover:text-red-600 hover:border-red-200`}>Tolak</button>
                      <button onClick={() => setConfirm({ id: f.id, type: "foto", aksi: "Setujui Foto", targetStatus: "Disetujui" })} className={`${pri} flex-1`}>Setujui Foto</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {previewBukti !== null && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-soft/40 pb-3 mb-4">
              <h3 className="font-heading text-lg font-bold flex items-center gap-2 text-brand">
                <FileText size={18} />
                Pratinjau Bukti File
              </h3>
              <button onClick={() => setPreviewBukti(null)} className="rounded-full bg-surface p-1 text-ink/50 hover:bg-soft/40"><X size={18} /></button>
            </div>
            <div className="flex h-52 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-soft bg-surface p-4 text-center">
              <FileText size={48} className="text-brand/40 mb-2" />
              <p className="font-sub font-bold text-ink/80 text-sm">{previewBukti}</p>
              <p className="text-xs text-ink/50 mt-1">Simulasi pratinjau bukti foto/video dari pelapor.</p>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setPreviewBukti(null)} className={`${pri} h-9 text-xs`}>Tutup Pratinjau</button>
            </div>
          </div>
        </div>
      )}

      {confirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="mb-4 flex items-center gap-3">
              <div className={`grid size-10 place-items-center rounded-full ${(confirm.targetStatus === "Ditolak" || confirm.targetStatus === "Dinonaktifkan" || confirm.targetStatus === "Akun diblokir" || confirm.targetStatus === "Laporan ditolak" || confirm.targetStatus === "Dihapus") ? "bg-red-100 text-red-600" : "bg-brand/10 text-brand"}`}>
                <AlertTriangle size={20} />
              </div>
              <h3 className="font-heading text-lg font-bold">Konfirmasi Aksi</h3>
            </div>
            
            <p className="text-sm text-ink/70 mb-4">
              Apakah Anda yakin ingin <b className={(confirm.targetStatus === "Ditolak" || confirm.targetStatus === "Dinonaktifkan" || confirm.targetStatus === "Akun diblokir" || confirm.targetStatus === "Dihapus") ? "text-red-600" : "text-brand"}>{confirm.aksi.toLowerCase()}</b> ini atas nama <b>{ADMIN_ID}</b>?
            </p>

            {(confirm.targetStatus === "Ditolak" || confirm.targetStatus === "Dinonaktifkan" || confirm.targetStatus === "Laporan ditolak") && (
              <div className="mb-4 space-y-2">
                <label className="text-xs font-bold text-ink/60">Keterangan / Alasan (Wajib)</label>
                <textarea 
                  value={alasanInput} 
                  onChange={(e) => setAlasanInput(e.target.value)} 
                  className={`${inp} h-20 py-2.5 resize-none`} 
                  placeholder={confirm.type === "tarif" ? "Misal: Tarif melebih pasaran normal..." : "Misal: Dokumen NIB tidak terverifikasi..."} 
                />
                <p className="text-[10px] text-ink/50">Catatan ini akan disimpan di sistem untuk riwayat audit.</p>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-soft/40">
              <button onClick={() => { setConfirm(null); setAlasanInput(""); }} className={`${out} flex-1`}>Batal</button>
              <button onClick={eksekusiKonfirmasi} className={`${pri} flex-1 ${(confirm.targetStatus === "Ditolak" || confirm.targetStatus === "Dinonaktifkan" || confirm.targetStatus === "Akun diblokir" || confirm.targetStatus === "Dihapus") ? "bg-red-600 hover:bg-red-700" : ""}`}>
                Ya, Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}

      {!(tab === "bantuan" && sel !== null && bsub === "chat") && (
        <nav className="fixed inset-x-0 bottom-0 z-30 rounded-t-3xl border-t border-soft/30 bg-white px-2 pb-2 pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden">
          <ul className="grid grid-cols-5">
            {NAV.map(([k, l, Icon, n]) => {
              const on = isOn(k);
              const disabled = (k === "tarif") && !isSuperAdmin;
              return (
                <li key={k}>
                  <button onClick={() => go(k)} aria-current={on ? "page" : undefined} className="flex w-full flex-col items-center">
                    <span className="grid h-10 w-full place-items-center">
                      <span className={`relative grid place-items-center rounded-full transition-all duration-300 ease-out ${on ? "size-14 -translate-y-4 bg-brand text-white shadow-lg ring-4 ring-white" : disabled ? "size-10 text-ink/20" : "size-10 text-ink/50"}`}>
                        <Icon size={24} />
                        {n > 0 && !on && !disabled && <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-brand text-[10px] font-bold text-white ring-2 ring-white">{n}</span>}
                      </span>
                    </span>
                    <span className={`font-sub text-[11px] font-semibold transition-colors ${on ? "text-brand" : disabled ? "text-ink/20" : "text-ink/50"}`}>{l}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}//