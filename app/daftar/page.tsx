"use client";
// app/daftar/page.tsx — pendaftaran. Pembeli langsung aktif; nelayan & mitra transport menunggu persetujuan super admin.
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Fish, Truck, Check, ChevronLeft, Eye, EyeOff, Upload, FileText, X, Clock, Send, Wallet, ShieldCheck, Camera, Users, PackageCheck, Snowflake, Info } from "lucide-react";
import { readStore, writeStore } from "../../lib/store";
import { NEL0, type Nel } from "../../lib/data";

type Peran = "pembeli" | "nelayan" | "transport";
type F = { k: string; label: string; ph?: string; type?: "text" | "email" | "password" | "tel" | "number" | "select" | "area"; opts?: string[]; hint?: string };
type D = { k: string; label: string; hint: string; req: boolean };
type Step = { t: string; kind: "edu" | "form" | "docs" | "review"; fields?: F[]; docs?: D[] };
const DEMO_ALIAS = true; 
const TAG: Record<Peran, string> = { pembeli: "+pembeli", nelayan: "+nelayan", transport: "+admintransport" };
const aliasFor = (v: string, tag: string) => { const [local = "", dom] = v.trim().split("@"); return `${local.split("+")[0] || "emailkamu"}${tag}@${dom || "gmail.com"}`; };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const akun = (nama: string, hp: boolean): F[] => [
  { k: "nama", label: nama, ph: "Nama lengkap" },
  ...(hp ? [{ k: "hp", label: "Nomor HP (hanya dilihat admin)", type: "tel" as const, ph: "08xxxxxxxxxx" }] : []),
  { k: "email", label: "Email", type: "email", ph: "emailkamu@gmail.com" },
  { k: "sandi", label: "Kata sandi", type: "password", hint: "Minimal 8 karakter" },
  { k: "sandi2", label: "Ulangi kata sandi", type: "password" },
];
const CFG: Record<Peran, { judul: string; sub: string; Icon: typeof Fish; steps: Step[]; edu: { Icon: typeof Fish; t: string; d: string }[] }> = {
  pembeli: {
    judul: "Daftar sebagai Pembeli", sub: "Akun langsung aktif setelah mendaftar.", Icon: ShoppingCart, edu: [],
    steps: [
      { t: "Akun", kind: "form", fields: [{ k: "jenis", label: "Jenis pembeli", type: "select", opts: ["Rumah tangga", "Warung makan", "Katering", "Restoran / hotel"] }, ...akun("Nama lengkap / usaha", false)] },
      { t: "Alamat", kind: "form", fields: [{ k: "alamat", label: "Alamat pengiriman", type: "area", ph: "Jalan, nomor, RT/RW" }, { k: "kota", label: "Kecamatan / kota", ph: "Mis. Jatinangor, Sumedang" }] },
      { t: "Selesai", kind: "review" },
    ],
  },
  nelayan: {
    judul: "Daftar sebagai Nelayan", sub: "Pengajuan ditinjau super admin sebelum tokomu dibuka.", Icon: Fish,
    edu: [
      { Icon: Clock, t: "Pre-order next day", d: "Pembeli memesan hari ini untuk tangkapan subuh besok, jadi kamu tahu kebutuhan sebelum melaut dan ikan tidak terbuang." },
      { Icon: Send, t: "Jual lewat Telegram", d: "Setelah disetujui, buat kode tautan di dashboard lalu kirim /tautkan ke bot. Menjual cukup chat: pilih ikan, jumlah, harga, foto, konfirmasi." },
      { Icon: Truck, t: "Antar ke titik kumpul", d: "Truk berpendingin mitra menjemput di titik kumpulmu sesuai jadwal. Kamu tidak perlu mengurus pengiriman ke pembeli." },
      { Icon: Wallet, t: "Pembayaran lewat JalaLink", d: "Pembeli membayar lewat QRIS atau transfer ke JalaLink. Rincian pencairan ke rekeningmu dijelaskan admin saat verifikasi." },
      { Icon: Camera, t: "Aturan main", d: "Pakai foto asli tangkapan hari itu, jaga kesegaran, dan jangan bertransaksi di luar aplikasi. Pelanggaran bisa dilaporkan pembeli dan akun ditinjau." },
      { Icon: ShieldCheck, t: "Verifikasi dokumen", d: "Dokumenmu diperiksa super admin, biasanya beberapa hari kerja. Setelah disetujui, masuk lewat halaman Login untuk membuka dashboard nelayan." },
    ],
    steps: [
      { t: "Kenali JalaLink", kind: "edu" },
      { t: "Akun", kind: "form", fields: akun("Nama lengkap (sesuai KTP)", true) },
      { t: "Toko", kind: "form", fields: [
        { k: "toko", label: "Nama toko / usaha", ph: "Mis. Ikan Segar Pak Wayan" }, { k: "daerah", label: "Kabupaten / kota", ph: "Mis. Cilacap" },
        { k: "titik", label: "Titik kumpul (TPI / dermaga)", ph: "Mis. TPI Cilacap" }, { k: "alamatTitik", label: "Alamat lengkap titik kumpul", type: "area" },
        { k: "tangkapan", label: "Jenis ikan yang biasa ditangkap", ph: "Mis. kakap, tongkol, cumi" },
        { k: "bank", label: "Bank rekening pencairan", type: "select", opts: ["BCA", "BRI", "Mandiri", "BNI", "Lainnya"] }, { k: "noRek", label: "Nomor rekening", type: "number" }, { k: "namaRek", label: "Atas nama rekening", hint: "Harus sama dengan nama di KTP" }] },
      { t: "Dokumen", kind: "docs", docs: [
        { k: "ktp", label: "Foto KTP", hint: "Jelas dan terbaca", req: true }, { k: "selfie", label: "Selfie memegang KTP", hint: "Wajah dan KTP terlihat jelas", req: true },
        { k: "tpi", label: "Foto titik kumpul / TPI", hint: "Aktifkan lokasi (geotag) saat memotret", req: true }, { k: "buku", label: "Foto buku tabungan atau QRIS", hint: "Nama harus sesuai KTP", req: true },
        { k: "surat", label: "Surat keterangan pengepul / izin (jika ada)", hint: "Opsional", req: false }] },
      { t: "Tinjau", kind: "review" },
    ],
  },
  transport: {
    judul: "Daftar sebagai Mitra Transport", sub: "Pengajuan ditinjau super admin sebelum akun admin transport aktif.", Icon: Truck,
    edu: [
      { Icon: Users, t: "Peranmu: admin transport", d: "Kamu mendaftarkan perusahaan, menugaskan armada ke rute, dan membuat akun kurir dan supir untuk timmu." },
      { Icon: PackageCheck, t: "Rute dan tarif", d: "Rute disepakati di awal dan tarif flat per kilogram diajukan lalu disetujui admin JalaLink. Perubahan hanya berlaku untuk pesanan berikutnya." },
      { Icon: Wallet, t: "Fee platform", d: "JalaLink memotong fee dari ongkir. Besarnya ditetapkan super admin dan terlihat di halaman Keuangan." },
      { Icon: Snowflake, t: "Tanggung jawab", d: "Menjaga cold chain, menjemput tepat jadwal, dan menandai pesanan bermasalah jika ikan kurang atau kualitasnya turun." },
      { Icon: Users, t: "Kurir dan supir", d: "Mereka tidak mendaftar sendiri. Mereka melamar kepadamu, lalu kamu membuatkan akun yang sudah disetujui di dashboard." },
      { Icon: ShieldCheck, t: "Verifikasi dokumen", d: "Dokumen usaha dan armadamu diperiksa super admin. Setelah disetujui, masuk lewat halaman Login untuk membuka dashboard admin transport." },
    ],
    steps: [
      { t: "Kenali JalaLink", kind: "edu" },
      { t: "Akun", kind: "form", fields: akun("Nama penanggung jawab", true) },
      { t: "Usaha", kind: "form", fields: [
        { k: "perusahaan", label: "Nama perusahaan / usaha", ph: "Mis. CV Bahari Cold Chain" }, { k: "jenisUsaha", label: "Jenis usaha", type: "select", opts: ["Perusahaan ekspedisi", "Pemilik truk / pickup berpendingin"] },
        { k: "jenisArmada", label: "Jenis armada", type: "select", opts: ["Truk berpendingin", "Pickup berpendingin", "Pickup + cool box"] }, { k: "jmlArmada", label: "Jumlah armada", type: "number" },
        { k: "kapasitas", label: "Kapasitas per armada (kg)", type: "number" }, { k: "rute", label: "Rute yang dilayani", ph: "Mis. Cilacap → Bandung" }, { k: "alamat", label: "Alamat kantor / pool", type: "area" }] },
      { t: "Dokumen", kind: "docs", docs: [
        { k: "nib", label: "NIB / SIUP / izin usaha", hint: "Atau surat keterangan usaha dari desa", req: true }, { k: "ktp", label: "KTP penanggung jawab", hint: "Jelas dan terbaca", req: true },
        { k: "stnk", label: "STNK dan KIR armada", hint: "Gabungkan dalam satu berkas jika banyak", req: true }, { k: "foto", label: "Foto armada berpendingin", hint: "Tampak depan dan boks pendingin", req: true }] },
      { t: "Tinjau", kind: "review" },
    ],
  },
};

const inp = "h-12 w-full rounded-xl border bg-white px-4 text-sm text-ink outline-none placeholder:text-soft focus:border-brand";
const LABEL: Record<string, string> = {};
Object.values(CFG).forEach((c) => c.steps.forEach((s) => s.fields?.forEach((f) => (LABEL[f.k] = f.label))));

export default function DaftarPage() {
  const [peran, setPeran] = useState<Peran>("pembeli");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, string>>({});
  const [err, setErr] = useState<Record<string, string>>({});
  const [agree, setAgree] = useState(false);
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => { const p = new URLSearchParams(window.location.search).get("peran"); if (p === "pembeli" || p === "nelayan" || p === "transport") setPeran(p); }, []);

  const cfg = CFG[peran], cur = cfg.steps[step], last = step === cfg.steps.length - 1;
  const ganti = (p: Peran) => { setPeran(p); setStep(0); setForm({}); setFiles({}); setErr({}); setAgree(false); setDone(false); };
  const set = (k: string, v: string) => { setForm((f) => ({ ...f, [k]: v })); setErr((e) => ({ ...e, [k]: "" })); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (cur.kind === "edu" && !agree) e._ = "Centang bahwa kamu sudah memahami cara kerja JalaLink.";
    if (cur.kind === "review" && !agree) e._ = "Kamu perlu menyetujui syarat dan kebenaran data.";
    cur.fields?.forEach((f) => {
      const v = (form[f.k] ?? "").trim();
      if (!v) e[f.k] = "Wajib diisi";
      else if (f.type === "email" && !EMAIL_RE.test(v)) e[f.k] = "Format email belum benar";
      else if (f.k === "email" && DEMO_ALIAS && !v.toLowerCase().includes(TAG[peran])) e[f.k] = `Mode demo: pakai alias ${TAG[peran]} agar role terbaca saat login`;
      else if (f.k === "sandi" && v.length < 8) e[f.k] = "Minimal 8 karakter";
      else if (f.k === "sandi2" && v !== form.sandi) e[f.k] = "Kata sandi tidak sama";
      else if (f.type === "number" && !/^\d+$/.test(v)) e[f.k] = "Isi dengan angka";
    });
    cur.docs?.forEach((d) => { if (d.req && !files[d.k]) e[d.k] = "Dokumen wajib diunggah"; });
    setErr(e); return Object.keys(e).length === 0;
  };
  const submit = () => {
    const email = form.email.trim(), now = Date.now();
    const reg = readStore<any[]>("pendaftaran", []);
    if (reg.some((p) => (p.email ?? "").toLowerCase() === email.toLowerCase())) { setErr({ _: "Email ini sudah terdaftar. Silakan masuk." }); return; }
    // PRODUKSI: supabase.auth.signUp + unggah dokumen ke Storage + simpan pengajuan (status: menunggu). Kata sandi TIDAK disimpan di sini.
    writeStore("pendaftaran", [...reg, { id: now, email, nama: form.nama.trim(), peran, status: peran === "pembeli" ? "Disetujui" : "Menunggu", tanggal: new Date().toLocaleDateString("id-ID") }]);
    if (peran === "nelayan") {
      const nel: Nel & { email: string } = { id: now, nama: form.nama.trim(), daerah: form.daerah, titik: form.titik, dok: Object.keys(files).map((k) => files[k]).join(", "), selfie: files.selfie, rek: `${form.bank} ${form.noRek} a.n. ${form.namaRek}`, geotag: files.tpi ? "Foto TPI diunggah (cek geotag)" : "-", status: "Menunggu", listing: 0, email };
      writeStore("nel", [...readStore<Nel[]>("nel", NEL0), nel]);
    }
    if (peran === "transport") writeStore("mitra", [...readStore<any[]>("mitra", []), { id: now, email, nama: form.perusahaan, pic: form.nama.trim(), armada: `${form.jmlArmada}x ${form.jenisArmada}`, rute: form.rute, dok: Object.values(files), status: "Menunggu" }]);
    setDone(true);
  };
  const next = () => { if (validate()) { if (last) submit(); else { setStep(step + 1); setAgree(false); window.scrollTo({ top: 0 }); } } };

  const field = (f: F) => {
    const base = `${inp} ${err[f.k] ? "border-red-500" : "border-soft"}`, v = form[f.k] ?? "";
    return (
      <div key={f.k} className="space-y-1.5">
        <label htmlFor={f.k} className="font-sub text-sm font-semibold">{f.label}</label>
        {f.type === "select" ? <select id={f.k} value={v} onChange={(e) => set(f.k, e.target.value)} className={base}><option value="">Pilih…</option>{f.opts!.map((o) => <option key={o}>{o}</option>)}</select>
          : f.type === "area" ? <textarea id={f.k} value={v} onChange={(e) => set(f.k, e.target.value)} rows={3} placeholder={f.ph} className={`${base} h-auto py-3`} />
          : f.type === "password" ? <div className="relative"><input id={f.k} type={show ? "text" : "password"} value={v} onChange={(e) => set(f.k, e.target.value)} className={`${base} pr-12`} /><button type="button" onClick={() => setShow(!show)} aria-label="Tampilkan kata sandi" className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-ink/60 hover:bg-surface">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          : <input id={f.k} type={f.type === "number" ? "text" : f.type ?? "text"} inputMode={f.type === "number" ? "numeric" : undefined} value={v} onChange={(e) => set(f.k, e.target.value)} placeholder={f.ph} className={base} />}
        {f.k === "email" && DEMO_ALIAS && <p className="flex flex-wrap items-center gap-1 text-xs text-ink/60"><Info size={13} className="text-brand" />Demo: pakai alias <b>{TAG[peran]}</b>.<button type="button" onClick={() => set("email", aliasFor(v, TAG[peran]))} className="font-semibold text-brand underline">Pakai alias</button></p>}
        {f.hint && !err[f.k] && <p className="text-xs text-ink/60">{f.hint}</p>}
        {err[f.k] && <p className="text-xs text-red-600">{err[f.k]}</p>}
      </div>
    );
  };
  const upload = (d: D) => (
    <div key={d.k} className={`rounded-2xl border p-4 ${err[d.k] ? "border-red-500" : "border-soft/50"} bg-white`}>
      <p className="font-sub text-sm font-bold">{d.label} {d.req ? <span className="text-red-600">*</span> : <span className="font-normal text-ink/50">(opsional)</span>}</p>
      <p className="mb-2 text-xs text-ink/60">{d.hint}</p>
      {files[d.k] ? (
        <div className="flex items-center gap-2 rounded-xl bg-surface p-3 text-sm"><FileText size={18} className="shrink-0 text-brand" /><span className="min-w-0 flex-1 truncate">{files[d.k]}</span><button type="button" onClick={() => setFiles((f) => { const n = { ...f }; delete n[d.k]; return n; })} aria-label="Hapus berkas"><X size={16} /></button></div>
      ) : (
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-soft py-4 font-sub text-sm font-semibold text-brand hover:bg-surface"><Upload size={18} />Pilih berkas (JPG, PNG, PDF · maks. 5 MB)
          <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; if (f.size > 5 * 1024 * 1024) { setErr((x) => ({ ...x, [d.k]: "Ukuran maksimal 5 MB" })); return; } setFiles((x) => ({ ...x, [d.k]: f.name })); setErr((x) => ({ ...x, [d.k]: "" })); }} /></label>)}
      {err[d.k] && <p className="mt-1 text-xs text-red-600">{err[d.k]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-surface font-body text-ink">
      <header className="border-b border-soft/40 bg-white"><div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
        <Link href="/" aria-label="Beranda"><Image src="/logo.png" alt="JalaLink" width={110} height={36} className="object-contain" /></Link>
        <p className="text-sm text-ink/70">Sudah punya akun? <Link href="/login" className="font-sub font-semibold text-brand">Masuk</Link></p></div></header>

      <main className="mx-auto max-w-3xl space-y-5 px-4 py-6 pb-12">
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(CFG) as Peran[]).map((p) => { const I = CFG[p].Icon; return <button key={p} onClick={() => ganti(p)} aria-pressed={peran === p} className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-3 font-sub text-xs font-semibold sm:flex-row sm:justify-center sm:gap-2 sm:text-sm ${peran === p ? "border-brand bg-brand/10 text-brand" : "border-transparent bg-white text-ink hover:border-soft"}`}><I size={20} />{p === "pembeli" ? "Pembeli" : p === "nelayan" ? "Nelayan" : "Mitra Transport"}</button>; })}
        </div>

        {done ? (
          <div className="space-y-4 rounded-3xl bg-white p-8 text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand text-white"><Check size={32} /></span>
            <h1 className="font-heading text-2xl font-bold">{peran === "pembeli" ? "Akun berhasil dibuat" : "Pengajuan terkirim"}</h1>
            <p className="mx-auto max-w-md text-sm text-ink/70">{peran === "pembeli" ? "Silakan masuk dengan email dan kata sandimu untuk mulai belanja ikan segar." : "Super admin JalaLink akan memeriksa dokumenmu. Setelah disetujui, masuk lewat halaman Login untuk membuka dashboard. Sebelum itu, login akan menampilkan status pengajuanmu."}</p>
            <Link href="/login?daftar=berhasil" className="inline-flex h-12 items-center rounded-xl bg-brand px-8 font-sub font-semibold text-white hover:bg-brand/90">Ke Halaman Login</Link>
          </div>
        ) : (
          <div className="space-y-5 rounded-3xl bg-white p-5 sm:p-8">
            <div><h1 className="font-heading text-2xl font-bold">{cfg.judul}</h1><p className="font-sub text-sm text-ink/60">{cfg.sub}</p></div>
            <ol className="flex items-center gap-2">{cfg.steps.map((s, i) => <li key={s.t} className="flex flex-1 items-center gap-2"><span className={`grid size-7 shrink-0 place-items-center rounded-full font-sub text-xs font-bold ${i <= step ? "bg-brand text-white" : "bg-surface text-ink/50"}`}>{i < step ? <Check size={14} /> : i + 1}</span><span className={`hidden truncate font-sub text-xs font-semibold sm:block ${i === step ? "text-ink" : "text-ink/50"}`}>{s.t}</span>{i < cfg.steps.length - 1 && <span className={`h-0.5 flex-1 ${i < step ? "bg-brand" : "bg-surface"}`} />}</li>)}</ol>
            <p className="font-sub text-sm font-bold text-brand sm:hidden">Langkah {step + 1}: {cur.t}</p>

            {cur.kind === "edu" && (<div className="space-y-3">
              <p className="text-sm text-ink/70">Sebelum mengisi data, kenali dulu cara kerja JalaLink sebagai {peran === "nelayan" ? "nelayan" : "mitra transport"}.</p>
              <ul className="grid gap-3 sm:grid-cols-2">{cfg.edu.map(({ Icon, t, d }) => <li key={t} className="flex gap-3 rounded-2xl bg-surface p-4"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand text-white"><Icon size={18} /></span><div><p className="font-heading font-bold">{t}</p><p className="text-sm text-ink/70">{d}</p></div></li>)}</ul>
              <label className="flex cursor-pointer items-start gap-2 text-sm"><input type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); setErr({}); }} className="mt-0.5 size-4 accent-[#007AFF]" />Saya sudah membaca dan memahami cara kerja JalaLink.</label>
            </div>)}
            {cur.kind === "form" && <div className="space-y-4">{cur.fields!.map(field)}</div>}
            {cur.kind === "docs" && <div className="space-y-3"><p className="flex gap-2 rounded-xl bg-brand/5 p-3 text-xs text-ink/70"><Info size={14} className="mt-0.5 shrink-0 text-brand" />Dokumen hanya dilihat tim verifikasi JalaLink dan tidak ditampilkan ke pembeli.</p>{cur.docs!.map(upload)}</div>}
            {cur.kind === "review" && (<div className="space-y-4">
              <dl className="divide-y divide-soft/30 rounded-2xl bg-surface px-4 text-sm">{cfg.steps.flatMap((s) => s.fields ?? []).filter((f) => f.type !== "password").map((f) => <div key={f.k} className="flex justify-between gap-4 py-2"><dt className="text-ink/60">{f.label}</dt><dd className="text-right font-semibold">{form[f.k] || "-"}</dd></div>)}
                {Object.keys(files).length > 0 && <div className="py-2"><dt className="text-ink/60">Dokumen</dt>{Object.entries(files).map(([k, n]) => <dd key={k} className="flex items-center gap-1 text-right font-semibold"><FileText size={14} className="text-brand" />{n}</dd>)}</div>}</dl>
              {peran !== "pembeli" && <p className="rounded-xl bg-brand/5 p-3 text-xs text-ink/70">Setelah dikirim, status pengajuanmu <b>Menunggu</b> persetujuan super admin. Kamu belum bisa membuka dashboard sebelum disetujui.</p>}
              <label className="flex cursor-pointer items-start gap-2 text-sm"><input type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); setErr({}); }} className="mt-0.5 size-4 accent-[#007AFF]" />Saya menyetujui Syarat & Ketentuan dan Kebijakan Privasi JalaLink, dan data yang saya kirim adalah benar.</label>
            </div>)}
            {err._ && <p className="text-sm text-red-600">{err._}</p>}

            <div className="flex gap-3 pt-2">
              {step > 0 && <button onClick={() => { setStep(step - 1); setErr({}); setAgree(false); }} className="flex h-12 items-center gap-1 rounded-xl border border-brand px-5 font-sub font-semibold text-brand hover:bg-surface"><ChevronLeft size={18} />Kembali</button>}
              <button onClick={next} className="h-12 flex-1 rounded-xl bg-brand font-sub text-base font-semibold text-white hover:bg-brand/90">{last ? (peran === "pembeli" ? "Buat Akun" : "Kirim Pengajuan") : "Lanjut"}</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}