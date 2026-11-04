// app/api/order/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { hitungOngkir } from "@/lib/ongkir";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pembeli_id, listing_id, rute_id, jumlah_kg, tanggal_kirim } = body;

    const supabase = await createClient();

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
      return NextResponse.json({ error: "Rute tidak ditemukan" }, { status: 404 });
    }

    const { data: ordersTerkirim } = await supabase
      .from("orders")
      .select("jumlah_kg")
      .eq("rute_id", rute_id)
      .eq("tanggal_kirim", tanggal_kirim)
      .neq("status", "dibatalkan");

    const muatanTerpesan = ordersTerkirim?.reduce((acc, curr) => acc + curr.jumlah_kg, 0) || 0;

    if (muatanTerpesan + jumlah_kg > rute.kapasitas_kg) {
      return NextResponse.json({ error: "Kapasitas muatan rute sudah penuh" }, { status: 400 });
    }

    // 3. Hitung Ongkir Dinamis
    const ongkirPerKg = hitungOngkir({
      biayaRute: rute.biaya_rute,
      muatanTerpesan,
      jumlahPesanan: jumlah_kg,
    });

    // 4. Simpan Order
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

    // 5. Potong Stok Listing
    const sisaStok = listing.stok_kg - jumlah_kg;
    await supabase
      .from("listing")
      .update({
        stok_kg: sisaStok,
        status: sisaStok === 0 ? "habis" : "aktif",
      })
      .eq("id", listing_id);

    return NextResponse.json({ data: newOrder });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}