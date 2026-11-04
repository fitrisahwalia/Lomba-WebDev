import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const daerah = searchParams.get('daerah');
  const ikan = searchParams.get('ikan');

  const supabase = await createClient();

  // Ambil data listing yang statusnya masih 'aktif'
  let query = supabase
    .from('listing')
    .select(`
      *,
      nelayan ( id, nama, daerah ),
      ikan ( id, nama_baku, nama_ilmiah )
    `)
    .eq('status', 'aktif');

  // Filter berdasarkan daerah nelayan jika ada
  if (daerah) {
    query = query.eq('nelayan.daerah', daerah);
  }

  // Filter berdasarkan nama ikan jika ada
  if (ikan) {
    query = query.ilike('ikan.nama_baku', `%${ikan}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}