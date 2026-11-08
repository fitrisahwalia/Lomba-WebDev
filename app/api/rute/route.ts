// app/api/rute/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tanggal = searchParams.get("tanggal");

  const supabase = await createClient();

  const { data: rutes, error } = await supabase
    .from("rute")
    .select(`
      *,
      asal:titik_kumpul!asal_titik_id ( id, nama, daerah )
    `);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const result = await Promise.all(
    rutes.map(async (item) => {
      let query = supabase
        .from("orders")
        .select("jumlah_kg")
        .eq("rute_id", item.id);

      if (tanggal) {
        query = query.eq("tanggal_kirim", tanggal);
      }

      const { data: orders } = await query;
      const muatanTerisi = orders?.reduce((acc, curr) => acc + curr.jumlah_kg, 0) || 0;

      return {
        ...item,
        muatan_terisi_kg: muatanTerisi,
        persentase_muatan: Math.min(100, Math.round((muatanTerisi / item.kapasitas_kg) * 100)),
      };
    })
  );

  return NextResponse.json(result);
}