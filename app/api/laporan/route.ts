import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { percakapan_id, pelapor, alasan } = body;

    if (!percakapan_id || !pelapor || !alasan) {
      return NextResponse.json(
        { error: "Field percakapan_id, pelapor, dan alasan wajib diisi" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: laporanBaru, error } = await supabase
      .from("laporan")
      .insert([
        {
          percakapan_id,
          pelapor,
          alasan,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: laporanBaru, message: "Laporan berhasil dikirim" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}