"use client";
// app/login/page.tsx — satu halaman masuk untuk 5 role: pembeli, nelayan, transport, admin, super admin.
// MODE DEMO: role dibaca dari alias email (plus addressing). PRODUKSI: pakai supabase.auth.signInWithPassword(),
// lalu baca role dari tabel `profiles` — jangan percaya teks email untuk menentukan hak akses.
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Info, Mail, X, Loader2, ShoppingCart, Fish, Truck, ShieldCheck, Crown, Check, Copy, KeyRound, ChevronDown, Lock } from "lucide-react";

type Role = "pembeli" | "nelayan" | "transport" | "admin" | "superadmin";
const ROLES: { k: Role; label: string; tag: string; Icon: typeof Fish; to: string; job: string }[] = [
  { k: "pembeli", label: "Pembeli", tag: "+pembeli", Icon: ShoppingCart, to: "/", job: "Belanja ikan, chat, dan pesan" },
  { k: "nelayan", label: "Nelayan", tag: "+nelayan", Icon: Fish, to: "/nelayan", job: "Pantau stok, chat, tautkan Telegram" },
  { k: "transport", label: "Transport", tag: "+transport", Icon: Truck, to: "/transport", job: "Jemput dan antar pesanan" },
// Admin & Super Admin: satu modul /admin, tapi halaman dan tugas berbeda
  { k: "admin", label: "Admin", tag: "+admin", Icon: ShieldCheck, to: "/admin", job: "Operasional: bantuan, laporan, verifikasi nelayan" },
  { k: "superadmin", label: "Super Admin", tag: "+superadmin", Icon: Crown, to: "/admin/super", job: "Strategis: tarif, bagi hasil, titik, akun admin & transport" },
];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const aliasFor = (v: string, tag: string) => {
  const [local = "", dom] = v.trim().split("@");
  return `${local.split("+")[0] || "emailkamu"}${tag}@${dom || "gmail.com"}`;
};
function detectRole(v: string): Role | null {
  const s = v.trim().toLowerCase();
  if (!s) return null;
  const local = s.split("@")[0];
  const tag = local.includes("+") ? local.split("+")[1] : s.includes("@") ? "" : local; // "+tag" / username / email biasa
  if (tag.includes("superadmin")) return "superadmin";
  if (tag.includes("admin")) return "admin";
  if (tag.includes("transport")) return "transport";
  if (tag.includes("nelayan")) return "nelayan";
  return "pembeli";
}
const inp = "h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-ink outline-none placeholder:text-soft focus:border-brand";

//untuk reset password
function ResetModal({ initial, onClose, onOtp }: { initial: string; onClose: () => void; onOtp: (email: string, otp: string) => void }) {
  const [step, setStep] = useState<"email" | "otp" | "done">("email");
  const [email, setEmail] = useState(initial.includes("@") ? initial : "");
  const [otp, setOtp] = useState(""); const [kode, setKode] = useState(""); const [pw, setPw] = useState("");
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { const h = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [onClose]);

  const kirim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) return setErr("Masukkan email yang valid");
    setErr(""); setBusy(true);
    setTimeout(() => { // PRODUKSI: OTP dibuat & dikirim server (Supabase resetPasswordForEmail / OTP), bukan di browser
      const c = String(Math.floor(100000 + Math.random() * 900000));
      setKode(c); setBusy(false); setStep("otp"); onOtp(email.trim(), c);
    }, 1000);
  };
  const verif = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== kode) return setErr("Kode OTP salah. Cek notifikasi Gmail kamu.");
    if (pw.length < 8) return setErr("Kata sandi baru minimal 8 karakter");
    setErr(""); setStep("done");
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
            <button type="button" onClick={() => { setStep("email"); setOtp(""); setErr(""); }} className="w-full text-center font-sub text-sm font-semibold text-brand">Kirim ulang kode</button>
          </form>
        )}
        {step === "done" && (
          <div className="space-y-4 py-4 text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand text-white"><Check size={32} /></span>
            <p className="font-heading text-lg font-bold text-ink">Kata sandi berhasil diubah</p>
            <p className="text-sm text-ink/70">Silakan masuk dengan kata sandi barumu.</p>
            <button onClick={onClose} className="h-12 w-full rounded-xl bg-brand font-sub text-base font-semibold text-white hover:bg-brand/90">Kembali ke Login</button>
          </div>
        )}
      </div>
    </div>
  );
}

//login page
export default function LoginPage() {
  const router = useRouter();
  const [id, setId] = useState(""); const [pw, setPw] = useState("");
  const [show, setShow] = useState(false); const [remember, setRemember] = useState(false);
  const [err, setErr] = useState<{ id?: string; pw?: string }>({});
  const [loading, setLoading] = useState(false); const [ok, setOk] = useState("");
  const [tips, setTips] = useState(true); const [reset, setReset] = useState(false);
  const [notif, setNotif] = useState<{ email: string; otp: string } | null>(null);
  const role = detectRole(id); const info = ROLES.find((r) => r.k === role);

  useEffect(() => { try { const s = localStorage.getItem("jalalink_remember"); if (s) { setId(s); setRemember(true); } } catch {} }, []);
  useEffect(() => { if (!notif) return; const t = setTimeout(() => setNotif(null), 15000); return () => clearTimeout(t); }, [notif]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = id.trim(), er: typeof err = {};
    if (v.includes("@") ? !EMAIL_RE.test(v) : v.length < 3) er.id = v.includes("@") ? "Format email belum benar" : "Email atau username minimal 3 karakter";
    if (pw.length < 6) er.pw = "Kata sandi minimal 6 karakter";
    setErr(er);
    if (er.id || er.pw || !info) return;
    setLoading(true);
    // PRODUKSI: supabase.auth.signInWithPassword({ email, password }) → baca profiles.role → redirect.
    setTimeout(() => {
      try { remember ? localStorage.setItem("jalalink_remember", v) : localStorage.removeItem("jalalink_remember"); } catch {}
      setOk(`Berhasil masuk sebagai ${info.label}. Mengalihkan…`);
      setTimeout(() => router.push(info.to), 700);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-white font-body text-ink lg:grid lg:grid-cols-2">
      {/* panel kiri (desktop) */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand p-12 text-white lg:flex">
        <span className="inline-flex w-fit rounded-2xl bg-white px-4 py-2"><Image src="/logo.png" alt="JalaLink" width={120} height={40} className="object-contain" /></span>
        <div className="relative z-10 space-y-4">
          <h2 className="max-w-md font-heading text-4xl font-bold leading-tight">Ikan segar, langsung dari nelayan lokal.</h2>
          <p className="max-w-md font-sub text-lg text-white/80">Satu akun, satu pintu masuk untuk pembeli, nelayan, transport, dan admin JalaLink.</p>
        </div>
        <svg viewBox="0 0 120 70" className="pointer-events-none absolute -bottom-10 -right-16 w-[28rem] opacity-15" fill="white" aria-hidden><ellipse cx="55" cy="36" rx="40" ry="20" /><path d="M92 36 L116 18 L116 54 Z" /><path d="M40 18 L58 6 L66 20 Z" /></svg>
      </aside>

      <main className="flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-5">
          <Image src="/logo.png" alt="JalaLink" width={120} height={40} className="object-contain lg:hidden" />
          <div>
            <h1 className="font-heading text-2xl font-bold text-ink">Masuk ke JalaLink</h1>
            <p className="font-sub text-sm text-ink/60">Gunakan akun yang sudah terdaftar untuk melanjutkan.</p>
          </div>

          <form onSubmit={submit} className="space-y-4 rounded-3xl bg-surface p-5" noValidate>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 font-sub text-sm font-semibold">
                <label htmlFor="id">Email / Username</label>
                <span className="group relative">
                  <button type="button" aria-label="Info role" className="text-soft hover:text-brand"><Info size={16} /></button>
                  <span role="tooltip" className="pointer-events-none absolute left-1/2 top-6 z-20 hidden w-64 -translate-x-1/2 rounded-xl bg-ink p-3 text-xs font-normal text-white shadow-lg group-focus-within:block group-hover:block">Role ditentukan dari alias email. Contoh: emailkamu+nelayan@gmail.com masuk sebagai Nelayan.</span>
                </span>
              </div>
              <div className="relative"><Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-soft" />
                <input id="id" value={id} onChange={(e) => { setId(e.target.value); setErr((x) => ({ ...x, id: undefined })); }} autoComplete="username" placeholder="emailkamu+nelayan@gmail.com" className={`${inp} ${err.id ? "border-red-500" : "border-soft"}`} />
              </div>
              {err.id && <p className="text-xs text-red-600">{err.id}</p>}
              {info && !err.id && <p className="flex items-center gap-2 font-sub text-xs font-semibold text-brand"><info.Icon size={14} />Akan masuk sebagai {info.label}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pw" className="font-sub text-sm font-semibold">Kata Sandi</label>
              <div className="relative"><Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-soft" />
                <input id="pw" type={show ? "text" : "password"} value={pw} onChange={(e) => { setPw(e.target.value); setErr((x) => ({ ...x, pw: undefined })); }} autoComplete="current-password" placeholder="Masukkan kata sandi" className={`${inp} pr-12 ${err.pw ? "border-red-500" : "border-soft"}`} />
                <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-ink/60 hover:bg-white">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
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
            <button type="button" onClick={() => setTips(!tips)} aria-expanded={tips} className="flex w-full items-center gap-2 p-4 text-left font-sub font-bold text-brand"><KeyRound size={18} />Tips Plus Addressing (untuk penguji / juri)<ChevronDown size={18} className={`ml-auto transition ${tips ? "rotate-180" : ""}`} /></button>
            {tips && (
              <div className="space-y-3 px-4 pb-4 text-sm text-ink/80">
                <p>Cukup satu inbox Gmail. Tambahkan <b>+nama-role</b> sebelum <b>@</b>: Gmail tetap mengirim ke inbox yang sama, sementara JalaLink membaca role-nya.</p>
                <ul className="space-y-2">
                  {ROLES.map((r) => (
                    <li key={r.k} className="flex items-center gap-2 rounded-xl bg-white p-2 pl-3">
                      <r.Icon size={16} className="shrink-0 text-brand" />
                      <div className="min-w-0 flex-1"><p className="font-sub text-xs font-bold">{r.label} <span className="font-normal text-ink/60">· {r.job}</span></p><p className="truncate font-mono text-xs text-ink/70">{aliasFor(id, r.tag)}</p></div>
                      <button type="button" onClick={() => { setId(aliasFor(id, r.tag)); setErr({}); }} className="rounded-full border border-brand px-3 py-1 font-sub text-xs font-semibold text-brand hover:bg-surface">Pakai</button>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-ink/60">Mode demo: kata sandi apa saja (min. 6 karakter) diterima. Kode OTP pemulihan muncul sebagai notifikasi simulasi.</p>
              </div>
            )}
          </section>
        </div>
      </main>

      {reset && <ResetModal initial={id} onClose={() => setReset(false)} onOtp={(email, otp) => setNotif({ email, otp })} />}

      {notif && (
        <div role="status" className="fixed inset-x-4 top-4 z-[60] mx-auto max-w-sm space-y-2 rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-soft/40 sm:left-auto sm:right-4 sm:mx-0">
          <div className="flex items-center gap-2 text-xs text-ink/60">
            <span className="grid size-6 place-items-center rounded-md bg-brand text-white"><Mail size={14} /></span>Gmail · Kotak Masuk · sekarang
            <button onClick={() => setNotif(null)} className="ml-auto text-ink/40 hover:text-ink" aria-label="Tutup notifikasi"><X size={16} /></button>
          </div>
          <p className="font-sub text-sm font-bold text-ink">JalaLink — Kode OTP pemulihan kata sandi</p>
          <p className="text-xs text-ink/70">Gunakan kode berikut untuk mengatur ulang kata sandi akun <b>{notif.email}</b>:</p>
          <p className="rounded-xl bg-surface py-2 text-center font-heading text-2xl font-bold tracking-[0.3em] text-brand">{notif.otp.slice(0, 3)} {notif.otp.slice(3)}</p>
          <p className="text-xs text-ink/60">Berlaku 10 menit. Jangan bagikan kode ini kepada siapa pun, termasuk tim JalaLink.</p>
          <button onClick={() => navigator.clipboard?.writeText(notif.otp)} className="flex items-center gap-1 font-sub text-xs font-semibold text-brand"><Copy size={14} />Salin kode</button>
        </div>
      )}
    </div>
  );
}