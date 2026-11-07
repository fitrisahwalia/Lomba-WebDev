import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Generate 6 digit angka acak
    const kodeBaru = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Ambil 1 data nelayan yang belum terverifikasi
    const { data: listNelayan } = await supabase
      .from("nelayan")
      .select("id")
      .eq("terverifikasi", false)
      .limit(1);

    let nelayanId: number | string;

    if (listNelayan && listNelayan.length > 0) {
      nelayanId = listNelayan[0].id;
      const { error: updateError } = await supabase
        .from("nelayan")
        .update({ kode_tautan: kodeBaru })
        .eq("id", nelayanId);

      if (updateError) throw updateError;
    } else {
      // Fallback jika database nelayan masih kosong
      const { data: nelayanBaru, error: insertError } = await supabase
        .from("nelayan")
        .insert([
          {
            nama: "Pak Wayan",
            daerah: "Cilacap",
            kode_tautan: kodeBaru,
            terverifikasi: false,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      nelayanId = nelayanBaru.id;
    }

    return NextResponse.json({ kode: kodeBaru, nelayan_id: nelayanId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal mengolah database" }, { status: 500 });
  }
}