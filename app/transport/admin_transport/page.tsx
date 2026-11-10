"use client";
// app/transport/admin/page.tsx — Admin Transport: kelola tim kurir/supir, rute, pesanan, dan keuangan armada.
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
const FEE = 10;
type Tab = "beranda" | "pesanan" | "tim" | "uang" | "akun";
type Anggota = { id: string; nama: string; peran: "Supir" | "Kurir"; email: string; kendaraan: string; area: string; aktif: boolean; tempPassword?: string };
type Lamaran = { id: number; nama: string; peran: "Supir" | "Kurir"; pengalaman: string; kendaraan: string; area: string; status: string };
type Rute = { id: number; nama: string; hari: string; kap: number; biaya: number; supirId?: number };
type OrderData = { id: number; jumlahKg: number; ongkirPerKg: number; status: string };

const inp = "h-11 w-full rounded-xl border border-soft bg-white px-3 text-sm text-ink outline-none placeholder:text-soft focus:border-brand";
const pri = "h-11 rounded-xl bg-brand px-4 font-sub text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-40";
const out = "h-11 rounded-xl border border-brand bg-white px-4 font-sub text-sm font-semibold text-brand hover:bg-surface";
const card = "rounded-2xl bg-surface p-4";
const Pill = ({ children, dark }: { children: React.ReactNode; dark?: boolean }) => <span className={`rounded-full px-2.5 py-1 font-sub text-xs font-semibold text-white ${dark ? "bg-ink" : "bg-brand"}`}>{children}</span>;
const NAV: { k: Tab; label: string; Icon: typeof Home }[] = [
  { k: "beranda", label: "Beranda", Icon: Home }, { k: "pesanan", label: "Pesanan", Icon: ClipboardList }, { k: "tim", label: "Tim", Icon: Users }, { k: "uang", label: "Keuangan", Icon: Wallet }, { k: "akun", label: "Akun", Icon: User },
];

function AkunSheet({ prefill, onClose, onCreate }: { prefill: Lamaran | null; onClose: () => void; onCreate: (a: Omit<Anggota, "id" | "aktif">, pw: string) => Promise<boolean> }) {
  const [f, setF] = useState({ nama: prefill?.nama ?? "", peran: (prefill?.peran ?? "Kurir") as "Supir" | "Kurir", email: "", kendaraan: prefill?.kendaraan ?? "", area: prefill?.area ?? "" });
  const [res, setRes] = useState<{ email: string; pw: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const ok = f.nama.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim());

  const buat = async () => {
    if (!ok || submitting) return;
    setSubmitting(true);
    const generatedPw = Math.random().toString(36).slice(2, 10) + "1A!";
    
    const success = await onCreate({ ...f, nama: f.nama.trim(), email: f.email.trim() }, generatedPw);
    if (success) {
      setRes({ email: f.email.trim(), pw: generatedPw });
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full max-w-md space-y-3 overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl">
        <div className="flex items-center justify-between"><h2 className="font-heading text-xl font-bold">{res ? "Akun Dibuat!" : "Buat Akun Tim"}</h2><button onClick={onClose} className="grid size-10 place-items-center rounded-full border border-soft" aria-label="Tutup"><X size={18} /></button></div>
        {res ? (<>
          <p className="text-sm text-ink/70">Salin dan berikan akun ini kepada <b>{f.nama}</b> untuk login sebagai {f.peran}.</p>
          <div className="space-y-2 rounded-2xl bg-surface p-4 text-sm border border-brand/20">
            <p>Email: <b className="font-mono text-ink">{res.email}</b></p>
            <p>Password Login: <b className="font-mono text-brand text-base select-all">{res.pw}</b></p>
            <p>Peran: <b className="font-sub text-ink">{f.peran}</b></p>
          </div>
          <button onClick={() => {
            navigator.clipboard?.writeText(`Email: ${res.email}\nPassword: ${res.pw}`);
            alert("Berhasil disalin!");
          }} className={`${out} flex w-full items-center justify-center gap-2`}><Copy size={16} />Salin Email & Password</button>
          <button onClick={onClose} className={`${pri} w-full`}>Selesai</button>
        </>) : (<>
          <input value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} placeholder="Nama lengkap" className={inp} />
          <div className="grid grid-cols-2 gap-2">{(["Supir", "Kurir"] as const).map((p) => <button key={p} onClick={() => setF({ ...f, peran: p })} className={`h-11 rounded-xl border-2 font-sub text-sm font-semibold ${f.peran === p ? "border-brand bg-brand/10 text-brand" : "border-soft/50 text-ink"}`}>{p}</button>)}</div>
          <input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="Email login (mis. supir@gmail.com)" className={inp} />
          <input value={f.kendaraan} onChange={(e) => setF({ ...f, kendaraan: e.target.value })} placeholder="Kendaraan / plat" className={inp} />
          <input value={f.area} onChange={(e) => setF({ ...f, area: e.target.value })} placeholder="Rute atau area tugas" className={inp} />
          <button disabled={!ok || submitting} onClick={buat} className={`${pri} w-full flex items-center justify-center gap-2`}>
            {submitting && <RefreshCw size={16} className="animate-spin" />}
            {submitting ? "Mendaftarkan Akun..." : "Buat Akun Sekarang"}
          </button>
        </>)}
      </div>
    </div>
  );
}

export default function AdminTransportPage() {
  const { logout } = useSession(["admintransport"]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [tim, setTim] = useState<Anggota[]>([]);
  const [lam, setLam] = useState<Lamaran[]>([]);
  const [rute, setRute] = useState<Rute[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<Tab>("beranda");
  const [sub, setSub] = useState<"anggota" | "lamaran">("anggota");
  const [sheet, setSheet] = useState<{ prefill: Lamaran | null } | null>(null);
  const [toast, setToast] = useState("");
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };
  const go = (t: Tab) => { setTab(t); window.scrollTo({ top: 0 }); };

  const loadDataReal = async () => {
    setLoading(true);
    try {
      const { data: dataTim, error: errTim } = await supabase
        .from("profiles")
        .select("id, nama, role, email, area, kendaraan, aktif")
        .in("role", ["supir", "kurir"]);

      if (errTim) console.error("Error fetch profiles:", errTim);

      if (dataTim) {
        setTim(
          dataTim.map((t) => ({
            id: t.id,
            nama: t.nama,
            peran: t.role === "supir" ? "Supir" : "Kurir",
            email: t.email || "-",
            kendaraan: t.kendaraan || "-",
            area: t.area || "-",
            aktif: t.aktif ?? true,
          }))
        );
      }

      const { data: dataLam } = await supabase.from("lamaran_transport").select("*");
      if (dataLam) {
        setLam(
          dataLam.map((l) => ({
            id: l.id,
            nama: l.nama,
            peran: l.peran === "Supir" ? "Supir" : "Kurir",
            pengalaman: l.pengalaman || "-",
            kendaraan: l.kendaraan || "-",
            area: l.area || "-",
            status: l.status || "Baru",
          }))
        );
      }

      const { data: dataRute } = await supabase.from("rute").select("*");
      if (dataRute) {
        setRute(
          dataRute.map((r) => ({
            id: r.id,
            nama: r.kota_tujuan,
            hari: r.hari_berangkat,
            kap: Number(r.kapasitas_kg),
            biaya: Number(r.biaya_rute),
            supirId: r.supir_id,
          }))
        );
      }

      const { data: dataOrders } = await supabase.from("orders").select("id, jumlah_kg, ongkir_per_kg, status_pengiriman");
      if (dataOrders) {
        setOrders(
          dataOrders.map((o) => ({
            id: o.id,
            jumlahKg: Number(o.jumlah_kg),
            ongkirPerKg: Number(o.ongkir_per_kg),
            status: o.status_pengiriman,
          }))
        );
      }
    } catch (err) {
      console.error("Gagal memuat data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataReal();
  }, []);

  const nLam = lam.filter((l) => l.status === "Baru").length;
  const aktif = tim.filter((a) => a.aktif);
  const ongkirTotal = orders.reduce((a, o) => a + o.jumlahKg * o.ongkirPerKg, 0);
  const fee = Math.round((ongkirTotal * FEE) / 100);
  const badge: Partial<Record<Tab, number>> = { tim: nLam };
  const isOn = (k: Tab) => tab === k;

  const buat = async (a: Omit<Anggota, "id" | "aktif">, pw: string): Promise<boolean> => {
    try {
      // Menetapkan nilai role huruf kecil persis sesuai CHECK constraint ('supir' / 'kurir')
      const targetRole = a.peran.toLowerCase() === "supir" ? "supir" : "kurir";

      // 1. Daftarkan Auth ke Supabase dengan metadata role terikat
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: a.email,
        password: pw,
        options: {
          data: {
            nama: a.nama,
            role: targetRole,
          },
        },
      });

      if (authError) {
        console.error("Error Auth SignUp:", authError);
        flash(`Gagal Auth: ${authError.message}`);
        return false;
      }

      const newUserId = authData.user?.id;
      if (!newUserId) {
        flash("Gagal mendapatkan User ID.");
        return false;
      }

      // 2. Paksa simpan/update role 'supir' / 'kurir' ke tabel 'profiles'
      const { error: profileError } = await supabase.from("profiles").upsert(
        [
          {
            id: newUserId,
            nama: a.nama,
            role: targetRole,
            email: a.email,
            area: a.area,
            kendaraan: a.kendaraan,
            aktif: true,
          },
        ],
        { onConflict: "id" }
      );

      if (profileError) {
        console.error("Error Upsert Profiles:", profileError);
        flash(`Gagal simpan profil: ${profileError.message}`);
        return false;
      }

      setTim((t) => [...t.filter((x) => x.id !== newUserId), { ...a, id: newUserId, aktif: true, tempPassword: pw }]);

      if (sheet?.prefill) {
        await supabase.from("lamaran_transport").update({ status: "Disetujui" }).eq("id", sheet.prefill.id);
        setLam((l) => l.map((x) => (x.id === sheet.prefill!.id ? { ...x, status: "Disetujui" } : x)));
      }

      flash(`Akun ${a.peran} berhasil dibuat & siap login!`);
      return true;
    } catch (err) {
      console.error(err);
      flash("Terjadi kesalahan jaringan.");
      return false;
    }
  };

  const toggleAktifAnggota = async (a: Anggota) => {
    const nextState = !a.aktif;
    setTim((t) => t.map((x) => (x.id === a.id ? { ...x, aktif: nextState } : x)));
    await supabase.from("profiles").update({ aktif: nextState }).eq("id", a.id);
    flash(nextState ? "Akun diaktifkan" : "Akun dinonaktifkan");
  };

  const tolakLamaran = async (id: number) => {
    setLam((x) => x.map((y) => (y.id === id ? { ...y, status: "Ditolak" } : y)));
    await supabase.from("lamaran_transport").update({ status: "Ditolak" }).eq("id", id);
    flash("Lamaran ditolak");
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
            {[["Pesanan masuk", orders.length, "pesanan"], ["Anggota aktif", aktif.length, "tim"], ["Lamaran baru", nLam, "tim"]].map(([l, v, k]) => (
              <button key={l as string} onClick={() => go(k as Tab)} className={`${card} text-left hover:shadow-md`}><p className="text-xs text-ink/60">{l}</p><p className="font-heading text-2xl font-bold text-brand">{v}</p></button>
            ))}
          </div>
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold">Perlu perhatian</h2>
            {nLam === 0 ? <p className={`${card} text-sm text-ink/60`}>Semua aman. Tidak ada lamaran baru.</p> : (
              <button onClick={() => { go("tim"); setSub("lamaran"); }} className={`${card} flex w-full items-center gap-3 text-left text-sm`}><UserPlus className="text-brand" size={20} /><span className="flex-1"><b className="font-sub">{nLam} lamaran</b> kurir/supir menunggu keputusanmu.</span></button>
            )}
          </section>
        </>)}

        {tab === "pesanan" && (<>
          <h1 className="font-heading text-2xl font-bold">Rute & Pesanan</h1>
          <div className="grid gap-3 md:grid-cols-2">
            {rute.map((r) => (
              <div key={r.id} className={`${card} space-y-3`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="flex items-center gap-1 font-heading text-lg font-bold"><Truck size={18} className="text-brand" />Ke {r.nama}</p>
                    <p className="text-sm text-ink/60">Hari: {r.hari} · Kapasitas {r.kap} kg · Biaya {rp(r.biaya)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <h2 className="font-heading text-lg font-bold">Pesanan masuk</h2>
          {orders.length === 0 ? <p className={`${card} text-sm text-ink/60`}>Belum ada pesanan terdaftar di database.</p> : (
            <div className="grid gap-3 md:grid-cols-2">
              {orders.map((o) => (
                <div key={o.id} className={`${card} space-y-1`}>
                  <div className="flex items-center justify-between"><span className="font-sub text-sm font-semibold text-ink/60">Order #{o.id}</span><Pill>{o.status}</Pill></div>
                  <p className="font-sub font-bold">{o.jumlahKg} kg · Ongkir/kg: {rp(o.ongkirPerKg)}</p>
                </div>
              ))}
            </div>
          )}
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
                  <p className="text-sm text-ink/70">Kendaraan: {a.kendaraan} · Area: {a.area}</p>
                  <p className="font-mono text-xs text-ink/60">{a.email}</p>
                  {a.tempPassword && <p className="text-xs text-brand font-mono font-bold bg-brand/10 p-2 rounded-lg">Password login: {a.tempPassword}</p>}
                  <button onClick={() => toggleAktifAnggota(a)} className={out}>{a.aktif ? "Nonaktifkan" : "Aktifkan lagi"}</button>
                </div>))}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {lam.length === 0 && <p className={`${card} text-sm text-ink/60`}>Belum ada lamaran.</p>}
              {lam.map((l) => (
                <div key={l.id} className={`${card} space-y-2`}>
                  <div className="flex items-center justify-between"><b className="font-heading text-lg">{l.nama}</b><div className="flex gap-1"><Pill>{l.peran}</Pill><Pill dark={l.status !== "Baru"}>{l.status}</Pill></div></div>
                  <p className="text-sm text-ink/70">Pengalaman: {l.pengalaman}</p>
                  <p className="text-sm text-ink/60">Kendaraan: {l.kendaraan} · Area: {l.area}</p>
                  {l.status === "Baru" && <div className="flex gap-2"><button onClick={() => setSheet({ prefill: l })} className={`${pri} flex items-center gap-1`}><Check size={16} />Setujui & buat akun</button><button onClick={() => tolakLamaran(l.id)} className={out}>Tolak</button></div>}
                </div>))}
            </div>)}
        </>)}

        {tab === "uang" && (<>
          <h1 className="font-heading text-2xl font-bold">Keuangan</h1>
          <div className="grid grid-cols-3 gap-3">
            {[["Ongkir kotor", rp(ongkirTotal)], [`Fee platform ${FEE}%`, rp(fee)], ["Diterima transport", rp(ongkirTotal - fee)]].map(([l, v]) => <div key={l} className={card}><p className="text-xs text-ink/60">{l}</p><p className="font-heading text-lg font-bold text-brand md:text-2xl">{v}</p></div>)}
          </div>
        </>)}

        {tab === "akun" && (
          <div className="mx-auto max-w-2xl space-y-4">
            <h1 className="font-heading text-2xl font-bold">Akun Perusahaan</h1>
            <div className="flex items-center gap-4 rounded-2xl bg-surface p-5"><div className="grid size-16 place-items-center rounded-full bg-brand font-heading text-2xl font-bold text-white">B</div><div className="flex-1"><p className="font-heading text-lg font-bold">{PT}</p><p className="text-sm text-ink/60">Mitra transport · ops@bahari.id</p></div><Pill>Disetujui</Pill></div>
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