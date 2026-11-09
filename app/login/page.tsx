"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  Eye,
  EyeOff,
  Mail,
  X,
  Loader2,
  ShoppingCart,
  Fish,
  Truck,
  ShieldCheck,
  Crown,
  Check,
  KeyRound,
  ChevronDown,
  Lock,
  Compass,
} from "lucide-react";

type Role = "pembeli" | "nelayan" | "kurir" | "supir" | "admintransport" | "adminops" | "superadmin";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ROLES: { k: Role; label: string; tag: string; Icon: typeof Fish; job: string }[] = [
  { k: "pembeli", label: "Pembeli", tag: "+pembeli", Icon: ShoppingCart, job: "Belanja ikan, chat, dan pesan" },
  { k: "nelayan", label: "Nelayan", tag: "+nelayan", Icon: Fish, job: "Pantau stok, chat, tautkan Telegram" },
  { k: "kurir", label: "Kurir", tag: "+kurir", Icon: Truck, job: "Pengiriman barang lokal" },
  { k: "supir", label: "Supir", tag: "+supir", Icon: Truck, job: "Pengangkutan antar armada" },
  { k: "admintransport", label: "Admin Transport", tag: "+admintransport", Icon: Compass, job: "Kelola rute dan titik kumpul" },
  { k: "adminops", label: "Admin Ops", tag: "+adminops", Icon: ShieldCheck, job: "Operasional harian & verifikasi" },
  { k: "superadmin", label: "Super Admin", tag: "+superadmin", Icon: Crown, job: "Manajemen penuh sistem & tarif" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const aliasFor = (v: string, tag: string) => {
  const [local = "", dom] = v.trim().split("@");
  return `${local.split("+")[0] || "emailkamu"}${tag}@${dom || "gmail.com"}`;
};

const inp = "h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-ink outline-none placeholder:text-soft focus:border-brand";

function ResetModal({ initial, onClose, onOtp }: { initial: string; onClose: () => void; onOtp: (email: string, otp: string) => void }) {
  const [step, setStep] = useState<"email" | "otp" | "done">("email");
  const [email, setEmail] = useState(initial.includes("@") ? initial : "");
  const [otp, setOtp] = useState("");
  const [kode, setKode] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const kirim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) return setErr("Masukkan email yang valid");
    setErr("");
    setBusy(true);
    setTimeout(() => {
      const c = String(Math.floor(100000 + Math.random() * 900000));
      setKode(c);
      setBusy(false);
      setStep("otp");
      onOtp(email.trim(), c);
    }, 1000);
  };

  const verif = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== kode) return setErr("Kode OTP salah.");
    if (pw.length < 8) return setErr("Kata sandi baru minimal 8 karakter");
    setErr("");
    setStep("done");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Reset kata sandi" onClick={(e) => e.stopPropagation()} className="w-full max-w-md space-y-4 rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-ink">Pulihkan Kata Sandi</h2>
          <button onClick={onClose} className="grid size-10 place-items-center rounded-full border border-soft text-ink" aria-label="Tutup"><X size={18} /></button>
        </div>
        {step === "email" && (
          <form onSubmit={kirim} className="space-y-4">
            <p className="text-sm text-ink/70">Masukkan email akunmu. Kami akan mengirim kode OTP 6 digit untuk mengatur ulang kata sandi.</p>
            <div className="relative"><Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-soft" /><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="emailkamu+nelayan@gmail.com" className={`${inp} border-soft`} autoFocus /></div>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand font-sub text-base font-semibold text-white hover:bg-brand/90 disabled:opacity-60">{busy ? <><Loader2 size={18} className="animate-spin" />Mengirim…</> : "Kirim Kode OTP Pemulihan"}</button>
          </form>
        )}
        {step === "otp" && (
          <form onSubmit={verif} className="space-y-4">
            <p className="text-sm text-ink/70">Kode dikirim ke <b className="text-ink">{email}</b>. Masukkan kode OTP dan kata sandi baru.</p>
            <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="______" className="h-14 w-full rounded-xl border border-soft text-center font-heading text-2xl font-bold tracking-[0.5em] text-ink outline-none focus:border-brand" autoFocus />
            <div className="relative"><Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-soft" /><input value={pw} onChange={(e) => setPw(e.target.value)} type="password" placeholder="Kata sandi baru (min. 8 karakter)" className={`${inp} border-soft`} /></div>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button className="h-12 w-full rounded-xl bg-brand font-sub text-base font-semibold text-white hover:bg-brand/90">Simpan Kata Sandi Baru</button>
          </form>
        )}
        {step === "done" && (
          <div className="space-y-4 py-4 text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand text-white"><Check size={32} /></span>
            <p className="font-heading text-lg font-bold text-ink">Kata sandi berhasil diubah</p>
            <button onClick={onClose} className="h-12 w-full rounded-xl bg-brand font-sub text-base font-semibold text-white hover:bg-brand/90">Kembali ke Login</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const [err, setErr] = useState<{ id?: string; pw?: string; auth?: string }>({});
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [tips, setTips] = useState(true);
  const [reset, setReset] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem("jalalink_remember");
      if (s) {
        setId(s);
        setRemember(true);
      }
    } catch {}
  }, []);

  const redirectByRole = (targetRole: string) => {
    let targetPath = "/buyer"; // Default ke buyer jika role tidak cocok

    switch (targetRole) {
      case "superadmin":
        targetPath = "/admin/admin-ops/super-admin";
        break;
      case "adminops":
      case "admin":
        targetPath = "/admin/admin-ops";
        break;
      case "admintransport":
      case "kurir":
      case "supir":
        targetPath = "/transport";
        break;
      case "nelayan":
        targetPath = "/nelayan";
        break;
      case "pembeli":
        targetPath = "/buyer";
        break;
      default:
        targetPath = "/buyer";
        break;
    }

    // Gunakan window.location.href agar halaman dipaksa pindah & reload penuh
    window.location.href = targetPath;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = id.trim();
    let er: typeof err = {};

    if (!EMAIL_RE.test(v)) er.id = "Masukkan email yang valid";
    if (pw.length < 6) er.pw = "Kata sandi minimal 6 karakter";

    setErr(er);
    if (er.id || er.pw) return;

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: v,
        password: pw,
      });

      if (authError || !authData.user) {
        setErr({ auth: authError?.message || "Email atau kata sandi salah." });
        setLoading(false); // Matikan putaran tombol
        return;
      }

      // Ambil data profile role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .maybeSingle();

      const dbRole = profile?.role?.toLowerCase() || "pembeli";

      setOk("Berhasil masuk. Mengalihkan ke portal...");
      
      // Langsung redirect
      redirectByRole(dbRole);

    } catch (error: any) {
      console.error(error);
      setErr({ auth: "Gagal memproses login. Silakan coba lagi." });
      setLoading(false); // Matikan putaran tombol
    }
  };
  
  return (
    <div className="min-h-screen bg-white font-body text-ink lg:grid lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand p-12 text-white lg:flex">
        <span className="inline-flex w-fit rounded-2xl bg-white px-4 py-2"><Image src="/logo.png" alt="JalaLink" width={120} height={40} className="object-contain" /></span>
        <div className="relative z-10 space-y-4">
          <h2 className="max-w-md font-heading text-4xl font-bold leading-tight">Ikan segar, langsung dari nelayan lokal.</h2>
          <p className="max-w-md font-sub text-lg text-white/80">Satu akun, satu pintu masuk untuk 7 peran di platform JalaLink.</p>
        </div>
      </aside>

      <main className="flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-5">
          <Image src="/logo.png" alt="JalaLink" width={120} height={40} className="object-contain lg:hidden" />
          <div>
            <h1 className="font-heading text-2xl font-bold text-ink">Masuk ke JalaLink</h1>
            <p className="font-sub text-sm text-ink/60">Gunakan akun terdaftar untuk menuju portal sesuai peran Anda.</p>
          </div>

          <form onSubmit={submit} className="space-y-4 rounded-3xl bg-surface p-5" noValidate>
            {err.auth && <p className="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200">{err.auth}</p>}

            <div className="space-y-1.5">
              <label htmlFor="id" className="font-sub text-sm font-semibold">Email</label>
              <div className="relative"><Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-soft" />
                <input id="id" value={id} onChange={(e) => { setId(e.target.value); setErr((x) => ({ ...x, id: undefined, auth: undefined })); }} autoComplete="username" placeholder="emailkamu+nelayan@gmail.com" className={`${inp} ${err.id ? "border-red-500" : "border-soft"}`} />
              </div>
              {err.id && <p className="text-xs text-red-600">{err.id}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pw" className="font-sub text-sm font-semibold">Kata Sandi</label>
              <div className="relative"><Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-soft" />
                <input id="pw" type={show ? "text" : "password"} value={pw} onChange={(e) => { setPw(e.target.value); setErr((x) => ({ ...x, pw: undefined, auth: undefined })); }} autoComplete="current-password" placeholder="Masukkan kata sandi" className={`${inp} pr-12 ${err.pw ? "border-red-500" : "border-soft"}`} />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-ink/60 hover:bg-white">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
              {err.pw && <p className="text-xs text-red-600">{err.pw}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 font-sub text-sm"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-4 accent-[#007AFF]" />Ingat Saya</label>
              <button type="button" onClick={() => setReset(true)} className="font-sub text-sm font-semibold text-brand hover:underline">Lupa Kata Sandi?</button>
            </div>

            <button disabled={loading || !!ok} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand font-sub text-base font-semibold text-white hover:bg-brand/90 disabled:opacity-70">
              {loading ? <><Loader2 size={18} className="animate-spin" />Memproses…</> : "Masuk Ke Akun"}
            </button>
            {ok && <p className="flex items-center gap-2 rounded-xl bg-white p-3 font-sub text-sm font-semibold text-brand"><Check size={16} />{ok}</p>}
          </form>

          <section className="rounded-2xl border border-brand/30 bg-brand/5">
            <button type="button" onClick={() => setTips(!tips)} className="flex w-full items-center gap-2 p-4 text-left font-sub font-bold text-brand"><KeyRound size={18} />Tips Testing 7 Role<ChevronDown size={18} className={`ml-auto transition ${tips ? "rotate-180" : ""}`} /></button>
            {tips && (
              <div className="space-y-3 px-4 pb-4 text-sm text-ink/80">
                <p className="text-xs">Uji 7 role menggunakan alias email di bawah:</p>
                <ul className="space-y-2">
                  {ROLES.map((r) => (
                    <li key={r.k} className="flex items-center gap-2 rounded-xl bg-white p-2 pl-3">
                      <r.Icon size={16} className="shrink-0 text-brand" />
                      <div className="min-w-0 flex-1"><p className="font-sub text-xs font-bold">{r.label} <span className="font-normal text-ink/60">· {r.job}</span></p></div>
                      <button type="button" onClick={() => { setId(aliasFor(id, r.tag)); setErr({}); }} className="rounded-full border border-brand px-3 py-1 font-sub text-xs font-semibold text-brand hover:bg-surface">Pakai</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      </main>

      {reset && <ResetModal initial={id} onClose={() => setReset(false)} onOtp={(email, otp) => console.log(email, otp)} />}
    </div>
  );
}