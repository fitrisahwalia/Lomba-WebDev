"use client";
// lib/session.ts — sesi login bersama untuk semua halaman (MODE DEMO: disimpan di browser).
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type Role = "pembeli" | "nelayan" | "transport" | "admintransport" | "admin" | "superadmin";
export type Session = { email: string; nama: string; role: Role };
const KEY = "jalalink_session";
export const HOME: Record<Role, string> = { pembeli: "/katalog", nelayan: "/nelayan", transport: "/transport", admintransport: "/transport/admin", admin: "/admin", superadmin: "/admin" };

export function getSession(): Session | null {
  try { const s = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY); return s ? (JSON.parse(s) as Session) : null; } catch { return null; }
}
export function setSession(s: Session, remember: boolean) {
  try { (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(s)); (remember ? sessionStorage : localStorage).removeItem(KEY); } catch {}
}
export function clearSession() { try { localStorage.removeItem(KEY); sessionStorage.removeItem(KEY); } catch {} }

// allowed: daftar role yang boleh membuka halaman ini. Tanpa argumen = halaman publik (mis. katalog pembeli).
export function useSession(allowed?: Role[]) {
  const router = useRouter();
  const [session, setS] = useState<Session | null>(null);
  useEffect(() => {
    const cur = getSession();
    setS(cur);
    if (allowed && (!cur || !allowed.includes(cur.role))) router.replace(cur ? HOME[cur.role] : "/login");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const logout = () => { clearSession(); router.push("/login"); };
  return { session, logout };
}