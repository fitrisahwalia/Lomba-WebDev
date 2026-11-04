import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const daerah = searchParams.get("daerah");
    const ikan = searchParams.get("ikan");

    const supabase = await createClient();

    // Hitung tanggal 2 hari yang lalu agar listing lama disembunyikan
    const duaHariLalu = new Date();
    duaHariLalu.setDate(duaHariLalu.getDate() - 2);
    const tanggalBatas = duaHariLalu.toISOString().split("T")[0];

    let query = supabase
      .from("listing")
      .select(`
        *,
        ikan:ikan_id ( id, nama_baku, nama_ilmiah ),
        nelayan:nelayan_id ( id, nama, daerah, terverifikasi )
      `)
      .eq("status", "aktif")
      .gte("tanggal_tangkap", tanggalBatas) 
      .order("tanggal_tangkap", { ascending: false });

    if (daerah) {
      query = query.eq("nelayan.daerah", daerah);
    }

    const { data: listings, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let filteredData = listings;
    if (ikan && listings) {
      filteredData = listings.filter((item: any) =>
        item.ikan?.nama_baku.toLowerCase().includes(ikan.toLowerCase())
      );
    }

    return NextResponse.json({ data: filteredData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}