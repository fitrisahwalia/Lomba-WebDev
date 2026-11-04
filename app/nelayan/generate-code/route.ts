import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Generate 6 digit angka acak
    const kodeBaru = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Misal kita update kode tautan untuk nelayan yang sedang login 
    // (Atau buat nelayan dummy/default jika belum ada sistem auth session)
    const { data: nelayan, error } = await supabase
      .from("nelayan")
      .update({ kode_tautan: kodeBaru })
      .eq("terverifikasi", false) // Atau sesuaikan dengan ID nelayan aktif
      .select()
      .limit(1)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ kode: kodeBaru, nelayan_id: nelayan.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}