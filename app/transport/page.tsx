"use client";
// app/transport/page.tsx — satu halaman internal transport (admin transport + sopir, tanpa dibedakan).
// Akses hanya role "transport": jaga lewat middleware + RLS, bukan cuma UI.
import { useState } from "react";
import { Truck, MapPin, Check, AlertTriangle, PackageCheck, Wallet, ArrowRight } from "lucide-react";

import Image from "next/image";

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image 
        src="/logo.png" 
        alt="JalaLink Logo" 
        width={110} 
        height={36} 
        className="object-contain"
      />
    </div>
  );
}

function Button({ children, className = "", ...props }: any) {
  return (
    <button className={`inline-flex items-center justify-center font-sub font-semibold transition active:scale-95 disabled:pointer-events-none ${className}`} {...props}>
      {children}
    </button>
  );
}

function Input({ className = "", ...props }: any) {
  return (
    <input className={`w-full outline-none transition ${className}`} {...props} />
  );
}

function Badge({ children, className = "", ...props }: any) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`} {...props}>
      {children}
    </span>
  );
}
const rp = (n: number) => "Rp" + n.toLocaleString("id-ID");
const KAP = 70;
type Status = "Menunggu Penjemputan" | "Dijemput" | "Dikirim";
type Ord = { id: string; ikan: string; kg: number; nelayan: string; titik: string; pembeli: string; alamat: string; ongkir: number; status: Status; masalah?: boolean };

const RUTE = { nama: "Cilacap → Bandung", hari: "Kamis, 5 November", kendaraan: "Truk berpendingin D 8123 XY", titik: [{ nama: "TPI Cilacap", jam: "06.00" }, { nama: "TPI Pangandaran", jam: "08.30" }] };
const RAW: [string, string, number, string, string, string, string, number][] = [
  ["JL-1001", "Kakap Merah", 10, "Pak Wayan", "TPI Cilacap", "Ushi", "Jl. Melati No. 12, Bandung", 103000],
  ["JL-1002", "Cumi-cumi", 8, "Pak Udin", "TPI Cilacap", "Warung Bu Tini", "Jl. Cihampelas No. 40, Bandung", 84000],
  ["JL-1003", "Kerapu Macan", 6, "Pak Wayan", "TPI Cilacap", "Resto Laut Biru", "Jl. Braga No. 9, Bandung", 62000],
  ["JL-1004", "Tongkol Segar", 12, "Pak Darmo", "TPI Pangandaran", "Katering Sari Rasa", "Jl. Setiabudi No. 77, Bandung", 124000],
  ["JL-1005", "Tuna Sirip Kuning", 5, "Pak Darmo", "TPI Pangandaran", "Ushi", "Jl. Melati No. 12, Bandung", 52000],
  ["JL-1006", "Kakap Merah", 4, "Pak Wayan", "TPI Cilacap", "RM Padang Sederhana", "Jl. Asia Afrika No. 3, Bandung", 41000],
];
const INIT: Ord[] = RAW.map(([id, ikan, kg, nelayan, titik, pembeli, alamat, ongkir]) => ({ id, ikan, kg, nelayan, titik, pembeli, alamat, ongkir, status: "Menunggu Penjemputan" }));

export default function TransportPage() {
  const [orders, setOrders] = useState(INIT);
  const [tab, setTab] = useState<"jemput" | "antar">("jemput");
  const upd = (where: (o: Ord) => boolean, f: (o: Ord) => Ord) => setOrders((os) => os.map((o) => (where(o) ? f(o) : o)));

  const kg = orders.reduce((a, o) => a + o.kg, 0);
  const dijemput = orders.filter((o) => o.status !== "Menunggu Penjemputan").length;
  const terkirim = orders.filter((o) => o.status === "Dikirim").length;
  const stat = [
    { l: "Muatan", v: `${kg}/${KAP} kg`, Icon: Truck },
    { l: "Dijemput", v: `${dijemput}/${orders.length}`, Icon: PackageCheck },
    { l: "Terkirim", v: `${terkirim}/${orders.length}`, Icon: Check },
    { l: "Ongkir terkumpul", v: rp(orders.reduce((a, o) => a + o.ongkir, 0)), Icon: Wallet },
  ];
  const btn = "h-12 w-full rounded-xl bg-brand font-sub text-base font-semibold text-white hover:bg-brand/90 disabled:bg-soft/40 disabled:text-ink/50";

  return (
    <div className="min-h-screen bg-white font-body text-ink">
      <header className="sticky top-0 z-30 border-b border-soft/40 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Logo />
          <div className="flex items-center gap-2"><Badge className="bg-brand font-sub text-white">Transport</Badge><div className="grid size-10 place-items-center rounded-full bg-brand font-sub font-bold text-white">T</div></div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-5 pb-12">
        <section className="rounded-3xl bg-surface p-5">
          <p className="font-sub text-sm font-semibold text-brand">{RUTE.hari} · {RUTE.kendaraan}</p>
          <h1 className="font-heading text-2xl font-bold text-ink md:text-3xl">Rute {RUTE.nama}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 font-sub text-sm font-semibold text-ink">
            {RUTE.titik.map((t) => <span key={t.nama} className="flex items-center gap-2"><span className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5"><MapPin size={14} className="text-brand" />{t.nama} · {t.jam}</span><ArrowRight size={16} className="text-soft" /></span>)}
            <span className="rounded-full bg-brand px-3 py-1.5 text-white">Bandung</span>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stat.map(({ l, v, Icon }) => (
            <div key={l} className="rounded-2xl bg-surface p-4"><Icon size={20} className="mb-2 text-brand" /><p className="text-xs text-ink/60">{l}</p><p className="font-heading text-lg font-bold text-ink">{v}</p></div>
          ))}
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-soft/30"><div className="h-full bg-brand transition-all" style={{ width: `${Math.min(100, (kg / KAP) * 100)}%` }} /></div>

        <div className="flex gap-2">
          {([["jemput", "Penjemputan"], ["antar", "Pengantaran"]] as const).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} className={`rounded-full border px-5 py-2 font-sub text-sm font-semibold ${tab === k ? "border-brand bg-brand text-white" : "border-soft bg-white text-ink hover:bg-surface"}`}>{label}</button>
          ))}
        </div>

        {tab === "jemput" ? (
          <div className="grid gap-4 md:grid-cols-2">
            {RUTE.titik.map((t) => {
              const list = orders.filter((o) => o.titik === t.nama);
              const done = list.every((o) => o.status !== "Menunggu Penjemputan");
              return (
                <section key={t.nama} className="space-y-3 rounded-2xl bg-surface p-4">
                  <div className="flex items-start justify-between">
                    <div><h2 className="flex items-center gap-1 font-heading text-lg font-bold text-ink"><MapPin size={18} className="text-brand" />{t.nama}</h2><p className="text-sm text-ink/60">Jemput {t.jam} · {list.length} pesanan · {list.reduce((a, o) => a + o.kg, 0)} kg</p></div>
                    {done && <Badge className="bg-ink font-sub text-white">Selesai</Badge>}
                  </div>
                  {list.map((o) => (
                    <div key={o.id} className="flex items-center justify-between gap-2 rounded-xl bg-white p-3">
                      <div className="min-w-0"><p className="truncate font-sub font-bold text-ink">{o.kg} kg {o.ikan}</p><p className="text-xs text-ink/60">{o.nelayan} · {o.id}</p></div>
                      <div className="flex shrink-0 items-center gap-2">
                        {o.masalah && <Badge className="bg-red-600 font-sub text-white">Bermasalah</Badge>}
                        <button onClick={() => upd((x) => x.id === o.id, (x) => ({ ...x, masalah: !x.masalah }))} className="flex items-center gap-1 rounded-full border border-soft px-3 py-1.5 font-sub text-xs font-semibold text-ink hover:bg-surface"><AlertTriangle size={14} />{o.masalah ? "Batal" : "Ada masalah"}</button>
                      </div>
                    </div>
                  ))}
                  <Button disabled={done} onClick={() => upd((o) => o.titik === t.nama, (o) => ({ ...o, status: "Dijemput" }))} className={btn}>{done ? "Sudah dijemput" : "Konfirmasi Dijemput"}</Button>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {orders.map((o) => (
              <div key={o.id} className="space-y-3 rounded-2xl bg-surface p-4">
                <div className="flex items-center justify-between"><span className="font-sub text-sm font-semibold text-ink/60">{o.id}</span><Badge className={`font-sub text-white ${o.status === "Dikirim" ? "bg-ink" : "bg-brand"}`}>{o.status}</Badge></div>
                <div><p className="font-sub text-lg font-bold text-ink">{o.kg} kg {o.ikan}</p><p className="text-sm text-ink/70">{o.pembeli}</p><p className="flex items-center gap-1 text-sm text-ink/60"><MapPin size={13} />{o.alamat}</p></div>
                <Button disabled={o.status !== "Dijemput"} onClick={() => upd((x) => x.id === o.id, (x) => ({ ...x, status: "Dikirim" }))} className={btn}>{o.status === "Menunggu Penjemputan" ? "Belum dijemput" : o.status === "Dikirim" ? "Sudah dikirim" : "Konfirmasi Dikirim"}</Button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-ink/60">Berat sesuai pesanan dan tidak ditimbang ulang. Jika ikan kurang atau kualitasnya bermasalah, tekan “Ada masalah”. Pembeli menekan “Diterima” di halamannya setelah barang sampai.</p>
      </main>
    </div>
  );
}