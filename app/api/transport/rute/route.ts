import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tanggal = searchParams.get("tanggal") || new Date().toISOString().split("T")[0];

    const supabase = await createClient();

    const { data: ruteData, error } = await supabase
      .from("rute")
      .select(`
        *,
        asal:titik_kumpul!asal_titik_id ( id, nama, daerah, lat, lng ),
        orders (
          id,
          jumlah_kg,
          status,
          tanggal_kirim,
          listing (
            id,
            foto_url,
            ikan ( nama_baku ),
            nelayan ( nama, daerah )
          )
        )
      `)
      .eq("orders.tanggal_kirim", tanggal);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const result = ruteData.map((rute) => {
      const ordersOnDate = rute.orders || [];
      const totalMuatanKg = ordersOnDate.reduce((acc: number, curr: any) => acc + curr.jumlah_kg, 0);

      return {
        rute_id: rute.id,
        asal_titik: rute.asal,
        kota_tujuan: rute.kota_tujuan,
        kapasitas_kg: rute.kapasitas_kg,
        total_muatan_kg: totalMuatanKg,
        persentase_kapasitas: Math.min(100, Math.round((totalMuatanKg / rute.kapasitas_kg) * 100)),
        daftar_pesanan: ordersOnDate,
      };
    });

    return NextResponse.json({ data: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}