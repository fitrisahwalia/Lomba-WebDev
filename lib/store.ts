"use client";
// lib/store.ts — data bersama antar halaman (MODE DEMO: localStorage). Bentuknya sengaja mirip tabel database.
import { useCallback, useEffect, useRef, useState } from "react";

export type SharedOrder = {
  no: string;
  items: { nama: string; qty: number; harga: number; nelayan: string; titik?: string; dijemput?: boolean }[];
  totalIkan: number; totalOngkir: number;
  status: "Menunggu Penjemputan" | "Dijemput" | "Dikirim" | "Selesai";
  pembeli?: string; alamat?: string; masalah?: boolean; bayar?: string; rating?: number; tanggal?: string; itemsSummary?: string;
};

export function useStore<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const k = "jalalink_" + key;
  const [val, setVal] = useState<T>(initial);
  const ref = useRef<T>(initial);
  useEffect(() => {
    const load = () => { try { const s = localStorage.getItem(k); if (s) { ref.current = JSON.parse(s) as T; setVal(ref.current); } } catch {} };
    load();
    window.addEventListener("storage", load); // update dari tab/halaman lain
    return () => window.removeEventListener("storage", load);
  }, [k]);
  const set = useCallback((v: T | ((p: T) => T)) => {
    const next = typeof v === "function" ? (v as (p: T) => T)(ref.current) : v;
    ref.current = next; setVal(next);
    try { localStorage.setItem(k, JSON.stringify(next)); } catch {}
  }, [k]);
  return [val, set];
}

// Chat bersama: pembeli <-> nelayan, dan pembeli <-> "Admin JalaLink" (jadi tiket bantuan di halaman admin)
export type ChatRec = { pembeli: string; lawan: string; msgs: { by: "b" | "l"; text: string }[]; readL: number; blocked?: boolean; closed?: boolean; topik?: string };
export type Chats = Record<string, ChatRec>;
export const chatKey = (pembeli: string, lawan: string) => `${pembeli}|${lawan}`;

// Akses tanpa hook (untuk halaman daftar & login). PRODUKSI: diganti pemanggilan Supabase.
export function readStore<T>(key: string, fallback: T): T { try { const s = localStorage.getItem("jalalink_" + key); return s ? (JSON.parse(s) as T) : fallback; } catch { return fallback; } }
export function writeStore<T>(key: string, v: T) { try { localStorage.setItem("jalalink_" + key, JSON.stringify(v)); } catch {} }