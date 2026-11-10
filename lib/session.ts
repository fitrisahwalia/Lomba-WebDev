"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// PERBAIKAN 1: Tambahkan 'kurir' dan 'supir' ke tipe Role
export type Role = "pembeli" | "nelayan" | "transport" | "admintransport" | "admin" | "superadmin" | "kurir" | "supir";
export type Session = { email: string; nama: string; role: Role };
const KEY = "jalalink_session";

// PERBAIKAN 2: Daftarkan rute redirect untuk kurir dan supir
export const HOME: Record<Role, string> = { 
  pembeli: "/katalog", 
  nelayan: "/nelayan", 
  transport: "/transport", 
  admintransport: "/transport/admin_transport", 
  admin: "/admin", 
  superadmin: "/admin",
  kurir: "/transport/kurir", // atau rute khusus kurir/supir kamu
  supir: "/transport/supir"  // atau rute khusus kurir/supir kamu
};

export function getSession(): Session | null {
  try { 
    const s = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY); 
    return s ? (JSON.parse(s) as Session) : null; 
  } catch { 
    return null; 
  }
}

export function setSession(s: Session, remember: boolean) {
  try { 
    (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(s)); 
    (remember ? sessionStorage : localStorage).removeItem(KEY); 
  } catch {}
}

export function clearSession() { 
  try { 
    localStorage.removeItem(KEY); 
    sessionStorage.removeItem(KEY); 
  } catch {} 
}

export function useSession(allowed?: Role[]) {
  const router = useRouter();
  const [session, setS] = useState<Session | null>(null);

  useEffect(() => {
    const cur = getSession();
    setS(cur);
    
    if (allowed && allowed.length > 0) {
      if (!cur) return;
      if (!allowed.includes(cur.role)) {
        router.replace(HOME[cur.role] || "/login");
      }
    }
  }, [allowed, router]);

  const logout = () => { clearSession(); router.push("/login"); };
  return { session, logout };
}