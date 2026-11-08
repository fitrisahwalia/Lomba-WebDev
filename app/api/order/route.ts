import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { hitungOngkir } from "@/lib/ongkir";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { pembeli_id, listing_id, rute_id, jumlah_kg, tanggal_kirim } = body;

    const supabase = await createClient();

    // ✅ FALLBACK: Jika pembeli_id tidak dikirim dari session, ambil id user login atau buatkan anonim
    if (!pembeli_id) {
      const { data: { user } } = await supabase.auth.getUser();
      pembeli_id = user?.id || null;
    }

    // ✅ FALLBACK RUTE: Jika rute_id tidak dikirim, ambil rute pertama yang tersedia di database
    if (!rute_id) {
      const { data: rutePertama } = await supabase.from("rute").select("id").limit(1).single();
      rute_id = rutePertama?.id || 1;
    }

    if (!tanggal_kirim) {
      tanggal_kirim = new Date().toISOString().split("T")[0];
    }

    // 1. Cek stok listing
    const { data: listing, error: listingError } = await supabase
      .from("listing")
      .select("stok_kg, status")
      .eq("id", listing_id)
      .single();

    if (listingError || !listing || listing.status !== "aktif") {
      return NextResponse.json({ error: "Listing tidak ditemukan atau tidak aktif" }, { status: 404 });
    }

    if (listing.stok_kg < jumlah_kg) {
      return NextResponse.json({ error: "Stok tidak mencukupi" }, { status: 400 });
    }

    // 2. Cek rute & muatan
    const { data: rute, error: ruteError } = await supabase
      .from("rute")
      .select("*")
      .eq("id", rute_id)
      .single();

    if (ruteError || !rute) {
      return NextResponse.json({ error: "Rute pengiriman tidak ditemukan" }, { status: 404 });
    }

    const { data: ordersTerkirim } = await supabase
      .from("orders")
      .select("jumlah_kg")
      .eq("rute_id", rute_id)
      .eq("tanggal_kirim", tanggal_kirim)
      .neq("status", "dibatalkan");

    const muatanTerpesan = ordersTerkirim?.reduce((acc, curr) => acc + curr.jumlah_kg, 0) || 0;

    if (muatanTerpesan + jumlah_kg > (rute.kapasitas_kg || 1000)) {
      return NextResponse.json({ error: "Kapasitas muatan rute sudah penuh" }, { status: 400 });
    }

    // 3. Hitung Ongkir
    const ongkirPerKg = typeof hitungOngkir === "function" 
      ? hitungOngkir({ biayaRute: rute.biaya_rute || 5000, muatanTerpesan, jumlahPesanan: jumlah_kg })
      : 5000;

    // 4. Simpan Order ke Database Supabase
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          pembeli_id,
          listing_id,
          rute_id,
          jumlah_kg,
          tanggal_kirim,
          ongkir_per_kg: ongkirPerKg,
          status: "dipesan",
        },
      ])
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // 5. Potong Stok Listing secara Otomatis
    const sisaStok = listing.stok_kg - jumlah_kg;
    await supabase
      .from("listing")
      .update({
        stok_kg: sisaStok,
        status: sisaStok <= 0 ? "habis" : "aktif",
      })
      .eq("id", listing_id);

    return NextResponse.json({ success: true, data: newOrder });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}