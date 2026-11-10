"use client";
// app/transport/admin/page.tsx — Admin Transport: kelola tim kurir/supir, rute, pesanan, dan keuangan armada.
// Terhubung langsung ke Supabase Database real-time (Data dummy dihapus).
import { useState, useEffect } from "react";
import Image from "next/image";
import { Home, ClipboardList, Users, Wallet, User, MapPin, Check, X, Plus, Copy, AlertTriangle, LogOut, UserPlus, Truck, RefreshCw } from "lucide-react";
import { useSession } from "@/lib/session";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kewjzlhgrkacyrjlboaa.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_1ygn0KH_eqk53JVTLib-gQ_NfcJyZNm"
);

const rp = (n: number) => "Rp" + n.toLocaleString("id-ID");
const PT = "CV Bahari Cold Chain";
const FEE = 10; // % fee platform atas ongkir (ditetapkan super admin JalaLink)
type Tab = "beranda" | "pesanan" | "tim" | "uang" | "akun";
type Anggota = { id: string | number; nama: string; peran: "Supir" | "Kurir"; email: string; kendaraan: string; area: string; aktif: boolean };
type Lamaran = { id: string | number; nama: string; peran: "Supir" | "Kurir"; pengalaman: string; kendaraan: string; area: string; status: "Baru" | "Disetujui" | "Ditolak" };
type Rute = { id: string | number; nama: string; hari: string; jam: string; kap: number; supirId?: string | number };
type Tarif = {
  id: string | number;
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
type OrderItem = { nama: string; qty: number; titik?: string };
type OrderData = { no: string; status: string; totalOngkir: number; pembeli?: string; alamat?: string; masalah?: boolean; items: OrderItem[] };

const inp = "h-11 w-full rounded-xl border border-soft bg-white px-3 text-sm text-ink outline-none placeholder:text-soft focus:border-brand";
const pri = "h-11 rounded-xl bg-brand px-4 font-sub text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-40";
const out = "h-11 rounded-xl border border-brand bg-white px-4 font-sub text-sm font-semibold text-brand hover:bg-surface";
const card = "rounded-2xl bg-surface p-4";
const Pill = ({ children, dark }: { children: React.ReactNode; dark?: boolean }) => <span className={`rounded-full px-2.5 py-1 font-sub text-xs font-semibold text-white ${dark ? "bg-ink" : "bg-brand"}`}>{children}</span>;
const NAV: { k: Tab; label: string; Icon: typeof Home }[] = [
  { k: "beranda", label: "Beranda", Icon: Home }, { k: "pesanan", label: "Pesanan", Icon: ClipboardList }, { k: "tim", label: "Tim", Icon: Users }, { k: "uang", label: "Keuangan", Icon: Wallet }, { k: "akun", label: "Akun", Icon: User },
];

/* ---- sheet buat akun kurir/supir ---- */
function AkunSheet({ prefill, onClose, onCreate }: { prefill: Lamaran | null; onClose: () => void; onCreate: (a: Omit<Anggota, "id" | "aktif">, pw: string) => void }) {
  const [f, setF] = useState({ nama: prefill?.nama ?? "", peran: (prefill?.peran ?? "Kurir") as "Supir" | "Kurir", email: "", kendaraan: prefill?.kendaraan ?? "", area: prefill?.area ?? "" });
  const [res, setRes] = useState<{ email: string; pw: string } | null>(null);
  const ok = f.nama.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim());
  const buat = () => { const pw = Math.random().toString(36).slice(2, 10); onCreate({ ...f, nama: f.nama.trim(), email: f.email.trim() }, pw); setRes({ email: f.email.trim(), pw }); };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full max-w-md space-y-3 overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl">
        <div className="flex items-center justify-between"><h2 className="font-heading text-xl font-bold">{res ? "Akun dibuat" : "Buat Akun Tim"}</h2><button onClick={onClose} className="grid size-10 place-items-center rounded-full border border-soft" aria-label="Tutup"><X size={18} /></button></div>
        {res ? (<>
          <p className="text-sm text-ink/70">Berikan data ini kepada {f.nama}. Kata sandi sementara hanya tampil sekali dan wajib diganti saat login pertama.</p>
          <div className="space-y-1 rounded-2xl bg-surface p-4 text-sm"><p>Email: <b>{res.email}</b></p><p>Kata sandi: <b className="font-mono text-brand">{res.pw}</b></p></div>
          <button onClick={() => navigator.clipboard?.writeText(`Email: ${res.email}\nKata sandi: ${res.pw}`)} className={`${out} flex w-full items-center justify-center gap-2`}><Copy size={16} />Salin</button>
          <button onClick={onClose} className={`${pri} w-full`}>Selesai</button>
        </>) : (<>
          <input value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} placeholder="Nama lengkap" className={inp} />
          <div className="grid grid-cols-2 gap-2">{(["Supir", "Kurir"] as const).map((p) => <button key={p} onClick={() => setF({ ...f, peran: p })} className={`h-11 rounded-xl border-2 font-sub text-sm font-semibold ${f.peran === p ? "border-brand bg-brand/10 text-brand" : "border-soft/50 text-ink"}`}>{p}</button>)}</div>
          <input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="Email login (mis. nama+transport@gmail.com)" className={inp} />
          <input value={f.kendaraan} onChange={(e) => setF({ ...f, kendaraan: e.target.value })} placeholder="Kendaraan / plat" className={inp} />
          <input value={f.area} onChange={(e) => setF({ ...f, area: e.target.value })} placeholder="Rute atau area tugas" className={inp} />
          <button disabled={!ok} onClick={buat} className={`${pri} w-full`}>Buat Akun</button>
        </>)}
      </div>
    </div>
  );
}

/* ---- baris tarif ---- */
function TarifRow({ t, onSave }: { t: Tarif; onSave: (p: Partial<Tarif>) => void }) {
  const [v, setV] = useState(""); const [alasan, setAlasan] = useState("");
  const n = Number(v), diluar = n > 0 && (n < t.tarifNormalMin || n > t.tarifNormalMax);
  return (
    <div className={`${card} space-y-2`}>
      <div className="flex items-start justify-between gap-2"><div><p className="font-sub font-bold">{t.rute}</p><p className="text-sm text-ink/60">Aktif {rp(t.aktif)}/kg · rentang wajar {rp(t.tarifNormalMin)}–{rp(t.tarifNormalMax)}</p></div>
        {t.usulan && <Pill dark={t.statusUsulan === "Ditolak"}>{t.statusUsulan}</Pill>}</div>
      {t.usulan && t.statusUsulan === "Menunggu" && <p className="text-sm text-brand">Usulan {rp(t.usulan)}/kg menunggu persetujuan admin JalaLink.</p>}
      {t.statusUsulan === "Banding" && <p className="text-sm text-brand">Banding diajukan, menunggu keputusan admin JalaLink.</p>}
      {t.statusUsulan === "Ditolak" && (<>
        <p className="text-sm text-ink/70">Usulan {rp(t.usulan ?? 0)} ditolak: {t.alasanPenolakan ?? "tanpa keterangan"}</p>
        <textarea value={alasan} onChange={(e) => setAlasan(e.target.value)} rows={2} placeholder="Alasan banding (mis. biaya BBM naik)" className={`${inp} h-auto py-2`} />
        <button disabled={!alasan.trim()} onClick={() => onSave({ statusUsulan: "Banding", alasanBanding: alasan.trim() })} className={out}>Ajukan Banding</button>
      </>)}
      {(!t.usulan || t.statusUsulan === "Disetujui") && (<>
        <div className="flex gap-2"><input value={v} onChange={(e) => setV(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Usulan tarif baru (Rp/kg)" className={inp} /><button disabled={!n} onClick={() => { onSave({ usulan: n, pengaju: PT, statusUsulan: "Menunggu" }); setV(""); }} className={pri}>Ajukan</button></div>
        {diluar && <p className="flex items-center gap-1 text-xs text-ink/70"><AlertTriangle size={14} className="text-brand" />Di luar rentang wajar, perlu justifikasi saat ditinjau admin JalaLink.</p>}
      </>)}
    </div>
  );
}

export default function AdminTransportPage() {
  const { logout } = useSession(["admintransport"]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [tim, setTim] = useState<Anggota[]>([]);
  const [lam, setLam] = useState<Lamaran[]>([]);
  const [rute, setRute] = useState<Rute[]>([]);
  const [tarif, setTarif] = useState<Tarif[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<Tab>("beranda");
  const [sub, setSub] = useState<"anggota" | "lamaran">("anggota");
  const [sheet, setSheet] = useState<{ prefill: Lamaran | null } | null>(null);
  const [toast, setToast] = useState("");
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };
  const go = (t: Tab) => { setTab(t); window.scrollTo({ top: 0 }); };

  // Fetch data real dari Supabase
  const loadDataReal = async () => {
    setLoading(true);
    try {
      // 1. Fetch Tim (Profiles dengan role supir/kurir)
      const { data: dataTim } = await supabase
        .from("profiles")
        .select("id, nama, role, email, kendaraan, area, aktif")
        .in("role", ["supir", "kurir", "Supir", "Kurir"]);

      if (dataTim) {
        setTim(
          dataTim.map((t) => ({
            id: t.id,
            nama: t.nama || "Tanpa Nama",
            peran: t.role?.toLowerCase() === "supir" ? "Supir" : "Kurir",
            email: t.email || "",
            kendaraan: t.kendaraan || "-",
            area: t.area || "-",
            aktif: t.aktif ?? true,
          }))
        );
      }

      // 2. Fetch Lamaran Kurir/Supir
      const { data: dataLam } = await supabase.from("kurir_lamaran").select("*");
      if (dataLam) {
        setLam(
          dataLam.map((l) => ({
            id: l.id,
            nama: l.nama || "",
            peran: l.peran === "Supir" ? "Supir" : "Kurir",
            pengalaman: l.pengalaman || "",
            kendaraan: l.kendaraan || "",
            area: l.area || "",
            status: l.status || "Baru",
          }))
        );
      }

      // 3. Fetch Rute Pengiriman
      const { data: dataRute } = await supabase.from("rute_pengiriman").select("*");
      if (dataRute) {
        setRute(
          dataRute.map((r) => ({
            id: r.id,
            nama: r.nama || "",
            hari: r.hari || "Kamis",
            jam: r.jam || "08.00",
            kap: r.kapasitas || r.kap || 70,
            supirId: r.supir_id || r.supirId,
          }))
        );
      }

      // 4. Fetch Tarif Rute
      const { data: dataTarif } = await supabase.from("tarif_rute").select("*");
      if (dataTarif) {
        setTarif(
          dataTarif.map((t) => ({
            id: t.id,
            rute: t.rute || "",
            aktif: t.aktif || 0,
            tarifNormalMin: t.tarif_normal_min || t.tarifNormalMin || 0,
            tarifNormalMax: t.tarif_normal_max || t.tarifNormalMax || 0,
            usulan: t.usulan,
            pengaju: t.pengaju,
            statusUsulan: t.status_usulan || t.statusUsulan,
            alasanPenolakan: t.alasan_penolakan || t.alasanPenolakan,
            alasanBanding: t.alasan_banding || t.alasanBanding,
          }))
        );
      }

      // 5. Fetch Pesanan (Orders)
      const { data: dataOrders } = await supabase.from("orders").select("*");
      if (dataOrders) {
        setOrders(
          dataOrders.map((o) => ({
            no: o.no || `JL-${o.id}`,
            status: o.status || "Proses",
            totalOngkir: o.total_ongkir || o.totalOngkir || 0,
            pembeli: o.pembeli || o.nama_pembeli,
            alamat: o.alamat,
            masalah: o.masalah ?? false,
            items: typeof o.items === "string" ? JSON.parse(o.items) : o.items || [],
          }))
        );
      }
    } catch (err) {
      console.error("Gagal memuat data dari Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataReal();
  }, []);

  const nLam = lam.filter((l) => l.status === "Baru").length;
  const aktif = tim.filter((a) => a.aktif);
  const bermasalah = orders.filter((o) => o.masalah);
  const kgRute = (r: Rute) => orders.flatMap((o) => o.items).filter((i) => (i.titik ?? "").replace("TPI ", "") && r.nama.startsWith((i.titik ?? "").replace("TPI ", ""))).reduce((a, i) => a + i.qty, 0);
  const ongkirTotal = orders.reduce((a, o) => a + o.totalOngkir, 0);
  const fee = Math.round((ongkirTotal * FEE) / 100);
  const mine = tarif.filter((t) => rute.some((r) => r.nama === t.rute));
  const nTarif = mine.filter((t) => t.statusUsulan === "Menunggu" || t.statusUsulan === "Banding").length;
  const badge: Partial<Record<Tab, number>> = { tim: nLam };
  const isOn = (k: Tab) => tab === k;

  const buat = async (a: Omit<Anggota, "id" | "aktif">, pw: string) => {
    try {
      // Simpan ke Supabase Database
      const { data: newProfile, error } = await supabase
        .from("profiles")
        .insert([{ nama: a.nama, role: a.peran.toLowerCase(), email: a.email, kendaraan: a.kendaraan, area: a.area, aktif: true }])
        .select()
        .single();

      if (!error && newProfile) {
        setTim((t) => [...t, { ...a, id: newProfile.id, aktif: true }]);
      } else {
        setTim((t) => [...t, { ...a, id: Date.now(), aktif: true }]);
      }

      if (sheet?.prefill) {
        await supabase.from("kurir_lamaran").update({ status: "Disetujui" }).eq("id", sheet.prefill.id);
        setLam((l) => l.map((x) => (x.id === sheet.prefill!.id ? { ...x, status: "Disetujui" } : x)));
      }
      flash("Akun anggota berhasil dibuat di database");
    } catch (err) {
      console.error(err);
    }
    void pw;
  };

  const toggleAktifAnggota = async (a: Anggota) => {
    const nextState = !a.aktif;
    setTim((t) => t.map((x) => (x.id === a.id ? { ...x, aktif: nextState } : x)));
    await supabase.from("profiles").update({ aktif: nextState }).eq("id", a.id);
    flash(nextState ? "Akun diaktifkan" : "Akun dinonaktifkan");
  };

  const tolakLamaran = async (id: string | number) => {
    setLam((x) => x.map((y) => (y.id === id ? { ...y, status: "Ditolak" } : y)));
    await supabase.from("kurir_lamaran").update({ status: "Ditolak" }).eq("id", id);
    flash("Lamaran ditolak");
  };

  const simpanTarifUsulan = async (tId: string | number, p: Partial<Tarif>) => {
    setTarif((ts) => ts.map((x) => (x.id === tId ? { ...x, ...p } : x)));
    await supabase
      .from("tarif_rute")
      .update({
        usulan: p.usulan,
        pengaju: p.pengaju,
        status_usulan: p.statusUsulan,
        alasan_banding: p.alasanBanding,
      })
      .eq("id", tId);
    flash("Pengajuan tarif terkirim");
  };

  const simpanPenugasanSupir = async (ruteId: string | number, supirId?: number) => {
    setRute((rs) => rs.map((x) => (x.id === ruteId ? { ...x, supirId } : x)));
    await supabase.from("rute_pengiriman").update({ supir_id: supirId }).eq("id", ruteId);
    flash("Penugasan disimpan");
  };

  return (
    <div className="min-h-screen bg-white font-body text-ink">
      <header className="sticky top-0 z-30 border-b border-soft/40 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <button onClick={() => go("beranda")} aria-label="Beranda"><Image src="/logo.png" alt="JalaLink" width={110} height={36} className="object-contain" /></button>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map(({ k, label }) => <button key={k} onClick={() => go(k)} className={`flex items-center gap-2 rounded-full px-4 py-2 font-sub text-sm font-semibold transition-colors ${isOn(k) ? "bg-brand text-white" : "text-ink hover:bg-surface"}`}>{label}{(badge[k] ?? 0) > 0 && <span className={`grid size-5 place-items-center rounded-full text-[11px] font-bold ${isOn(k) ? "bg-white text-brand" : "bg-brand text-white"}`}>{badge[k]}</span>}</button>)}
          </nav>
          <div className="flex items-center gap-2"><span className="hidden rounded-full bg-brand px-3 py-1.5 font-sub text-xs font-semibold text-white sm:block">Admin Transport</span><div className="grid size-10 place-items-center rounded-full bg-brand font-sub font-bold text-white">B</div></div>
        </div>
      </header>
      {toast && <div className="fixed left-1/2 top-4 z-[60] -translate-x-1/2 rounded-xl bg-ink px-4 py-3 font-sub text-sm font-medium text-white shadow-lg">{toast}</div>}

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-5 pb-28 md:pb-10">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-4 text-sm text-ink/60">
            <RefreshCw size={16} className="animate-spin text-brand" /> Memuat data database...
          </div>
        )}

        {tab === "beranda" && (<>
          <h1 className="font-heading text-2xl font-bold">Halo, {PT}!</h1>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[["Pesanan masuk", orders.length, "pesanan"], ["Anggota aktif", aktif.length, "tim"], ["Lamaran baru", nLam, "tim"], ["Usulan tarif", nTarif, "uang"]].map(([l, v, k]) => (
              <button key={l as string} onClick={() => go(k as Tab)} className={`${card} text-left hover:shadow-md`}><p className="text-xs text-ink/60">{l}</p><p className="font-heading text-2xl font-bold text-brand">{v}</p></button>
            ))}
          </div>
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold">Perlu perhatian</h2>
            {bermasalah.length + nLam + nTarif === 0 && <p className={`${card} text-sm text-ink/60`}>Semua aman. Tidak ada yang perlu ditindak.</p>}
            {bermasalah.map((o) => <div key={o.no} className={`${card} flex items-center gap-3 text-sm`}><AlertTriangle className="text-brand" size={20} /><span className="flex-1"><b className="font-sub">{o.no}</b> ditandai bermasalah oleh sopir.</span></div>)}
            {nLam > 0 && <button onClick={() => { go("tim"); setSub("lamaran"); }} className={`${card} flex w-full items-center gap-3 text-left text-sm`}><UserPlus className="text-brand" size={20} /><span className="flex-1"><b className="font-sub">{nLam} lamaran</b> kurir/supir menunggu keputusanmu.</span></button>}
            {nTarif > 0 && <button onClick={() => go("uang")} className={`${card} flex w-full items-center gap-3 text-left text-sm`}><Wallet className="text-brand" size={20} /><span className="flex-1"><b className="font-sub">{nTarif} usulan tarif</b> menunggu admin JalaLink.</span></button>}
          </section>
        </>)}

        {tab === "pesanan" && (<>
          <h1 className="font-heading text-2xl font-bold">Rute & Pesanan</h1>
          <div className="grid gap-3 md:grid-cols-2">
            {rute.map((r) => { const kg = kgRute(r); return (
              <div key={r.id} className={`${card} space-y-3`}>
                <div className="flex items-start justify-between"><div><p className="flex items-center gap-1 font-heading text-lg font-bold"><Truck size={18} className="text-brand" />{r.nama}</p><p className="text-sm text-ink/60">{r.hari} · berangkat {r.jam} · kapasitas {r.kap} kg</p></div><Pill>{kg}/{r.kap} kg</Pill></div>
                <div className="h-2.5 overflow-hidden rounded-full bg-soft/30"><div className="h-full bg-brand transition-all" style={{ width: `${Math.min(100, (kg / r.kap) * 100)}%` }} /></div>
                <label className="block text-xs text-ink/60">Supir bertugas
                  <select value={r.supirId ?? ""} onChange={(e) => simpanPenugasanSupir(r.id, e.target.value ? Number(e.target.value) : undefined)} className={`${inp} mt-1`}>
                    <option value="">Belum ditugaskan</option>{aktif.filter((a) => a.peran === "Supir").map((a) => <option key={a.id} value={a.id}>{a.nama} · {a.kendaraan}</option>)}
                  </select></label>
              </div>); })}
          </div>
          <h2 className="font-heading text-lg font-bold">Pesanan masuk</h2>
          {orders.length === 0 ? <p className={`${card} text-sm text-ink/60`}>Belum ada pesanan. Pesanan pembeli akan muncul di sini.</p> : (
            <div className="grid gap-3 md:grid-cols-2">{orders.map((o) => (
              <div key={o.no} className={`${card} space-y-1`}>
                <div className="flex items-center justify-between"><span className="font-sub text-sm font-semibold text-ink/60">{o.no}</span><div className="flex gap-1">{o.masalah && <Pill dark>Bermasalah</Pill>}<Pill dark={o.status === "Selesai"}>{o.status}</Pill></div></div>
                {o.items.map((i, n) => <p key={n} className="font-sub font-bold">{i.qty} kg {i.nama} <span className="font-normal text-ink/60">· {i.titik ?? "-"}</span></p>)}
                <p className="flex items-center gap-1 text-sm text-ink/60"><MapPin size={13} />{o.pembeli ?? "Pembeli"} · {o.alamat ?? "-"}</p>
              </div>))}</div>)}
        </>)}

        {tab === "tim" && (<>
          <div className="flex items-center justify-between gap-2"><h1 className="font-heading text-2xl font-bold">Tim Kurir & Supir</h1><button onClick={() => setSheet({ prefill: null })} className={`${pri} flex items-center gap-2`}><Plus size={16} />Buat Akun</button></div>
          <div className="flex gap-2">{([["anggota", `Anggota (${tim.length})`], ["lamaran", `Lamaran (${nLam})`]] as const).map(([k, l]) => <button key={k} onClick={() => setSub(k)} className={`rounded-full border px-5 py-2 font-sub text-sm font-semibold ${sub === k ? "border-brand bg-brand text-white" : "border-soft bg-white text-ink hover:bg-surface"}`}>{l}</button>)}</div>
          {sub === "anggota" ? (
            <div className="grid gap-3 md:grid-cols-2">
              {tim.length === 0 && <p className={`${card} text-sm text-ink/60`}>Belum ada anggota tim terdaftar di database.</p>}
              {tim.map((a) => (
                <div key={a.id} className={`${card} space-y-2`}>
                  <div className="flex items-center justify-between"><b className="font-heading text-lg">{a.nama}</b><div className="flex gap-1"><Pill>{a.peran}</Pill>{!a.aktif && <Pill dark>Nonaktif</Pill>}</div></div>
                  <p className="text-sm text-ink/70">{a.kendaraan} · {a.area}</p><p className="font-mono text-xs text-ink/60">{a.email}</p>
                  <button onClick={() => toggleAktifAnggota(a)} className={out}>{a.aktif ? "Nonaktifkan" : "Aktifkan lagi"}</button>
                </div>))}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {lam.length === 0 && <p className={`${card} text-sm text-ink/60`}>Belum ada lamaran.</p>}
              {lam.map((l) => (
                <div key={l.id} className={`${card} space-y-2`}>
                  <div className="flex items-center justify-between"><b className="font-heading text-lg">{l.nama}</b><div className="flex gap-1"><Pill>{l.peran}</Pill><Pill dark={l.status !== "Baru"}>{l.status}</Pill></div></div>
                  <p className="text-sm text-ink/70">{l.pengalaman}</p><p className="text-sm text-ink/60">{l.kendaraan} · {l.area}</p>
                  {l.status === "Baru" && <div className="flex gap-2"><button onClick={() => setSheet({ prefill: l })} className={`${pri} flex items-center gap-1`}><Check size={16} />Setujui & buat akun</button><button onClick={() => tolakLamaran(l.id)} className={out}>Tolak</button></div>}
                </div>))}
            </div>)}
        </>)}

        {tab === "uang" && (<>
          <h1 className="font-heading text-2xl font-bold">Keuangan & Tarif</h1>
          <div className="grid grid-cols-3 gap-3">
            {[["Ongkir kotor", rp(ongkirTotal)], [`Fee platform ${FEE}%`, rp(fee)], ["Diterima transport", rp(ongkirTotal - fee)]].map(([l, v]) => <div key={l} className={card}><p className="text-xs text-ink/60">{l}</p><p className="font-heading text-lg font-bold text-brand md:text-2xl">{v}</p></div>)}
          </div>
          <p className="text-xs text-ink/60">Fee platform ditetapkan super admin JalaLink dan dipotong dari ongkir. Nilai ikan menjadi hak nelayan.</p>
          <h2 className="font-heading text-lg font-bold">Tarif rute (flat per kg)</h2>
          <p className="text-sm text-ink/60">Perubahan tarif tidak berlaku langsung: diajukan dulu, lalu disetujui admin JalaLink dan hanya berlaku untuk pesanan berikutnya.</p>
          <div className="grid gap-3 md:grid-cols-2">
            {mine.length === 0 && <p className={`${card} text-sm text-ink/60`}>Belum ada tarif rute di database.</p>}
            {mine.map((t) => <TarifRow key={t.id} t={t} onSave={(p) => simpanTarifUsulan(t.id, p)} />)}
          </div>
        </>)}

        {tab === "akun" && (
          <div className="mx-auto max-w-2xl space-y-4">
            <h1 className="font-heading text-2xl font-bold">Akun Perusahaan</h1>
            <div className="flex items-center gap-4 rounded-2xl bg-surface p-5"><div className="grid size-16 place-items-center rounded-full bg-brand font-heading text-2xl font-bold text-white">B</div><div className="flex-1"><p className="font-heading text-lg font-bold">{PT}</p><p className="text-sm text-ink/60">Mitra transport · ops@bahari.id</p></div><Pill>Disetujui</Pill></div>
            <div className={`${card} space-y-3 text-sm`}>
              {[["Terdaftar sebagai mitra", true], ["Disetujui admin JalaLink", true], ["Tim aktif", aktif.length > 0]].map(([l, ok]) => <p key={l as string} className="flex items-center gap-3"><span className={`grid size-6 place-items-center rounded-full ${ok ? "bg-brand text-white" : "border border-soft"}`}>{ok ? <Check size={14} /> : null}</span>{l as string}</p>)}
            </div>
            <button onClick={logout} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-soft bg-white font-sub font-semibold hover:bg-surface"><LogOut size={18} />Keluar</button>
          </div>
        )}
      </main>

      {sheet && <AkunSheet key={sheet.prefill?.id ?? "baru"} prefill={sheet.prefill} onClose={() => setSheet(null)} onCreate={buat} />}

      <nav className="fixed inset-x-0 bottom-0 z-30 rounded-t-3xl border-t border-soft/30 bg-white px-2 pb-2 pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden">
        <ul className="grid grid-cols-5">
          {NAV.map(({ k, label, Icon }) => { const on = isOn(k), n = badge[k] ?? 0; return (
            <li key={k}><button onClick={() => go(k)} aria-current={on ? "page" : undefined} className="flex w-full flex-col items-center">
              <span className="grid h-10 w-full place-items-center"><span className={`relative grid place-items-center rounded-full transition-all duration-300 ease-out ${on ? "size-14 -translate-y-4 bg-brand text-white shadow-lg ring-4 ring-white" : "size-10 text-ink/50"}`}><Icon size={24} />{n > 0 && !on && <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-brand text-[10px] font-bold text-white ring-2 ring-white">{n}</span>}</span></span>
              <span className={`font-sub text-[11px] font-semibold ${on ? "text-brand" : "text-ink/50"}`}>{label}</span></button></li>); })}
        </ul>
      </nav>
    </div>
  );
}