import { Bot, Context } from "grammy";
import { createClient } from "@supabase/supabase-js";
import Fuse from "fuse.js";
import { z } from "zod";

// Inisialisasi Supabase client (pastikan pakai service role key / client yang sesuai)
// Ganti baris createClient yang lama dengan ini sementara:
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kewjzlhgrkacyrjlboaa.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_lYgn0KH_eqk53JVTLib-gQ_NfCjYZNm"
);

// Contoh skema Zod untuk validasi stok & harga
const numberSchema = z.number().positive({ message: "Harus berupa angka positif!" });

export async function handleJualFlow(ctx: Context, session: any) {
  const chatId = ctx.chat?.id;
  const text = ctx.msg?.text;

  // 1. Cek apakah nelayan sudah terdaftar & tertaut
  const { data: nelayan } = await supabase
    .from("nelayan")
    .select("id")
    .eq("telegram_chat_id", chatId)
    .single();

  if (!nelayan) {
    await ctx.reply("Akun Telegram kamu belum tertaut sebagai nelayan. Silakan ketik /tautkan <kode> dari admin terlebih dahulu.");
    return;
  }

  // 2. Logika berdasarkan step di bot_session
  switch (session?.step) {
    case "MENUNGGU_NAMA_IKAN":
      // Ambil data master ikan & alias untuk fuse.js
      const { data: ikanList } = await supabase.from("ikan_alias").select("alias, ikan_id, ikan:ikan_id(nama_baku)");
      
      const fuse = new Fuse(ikanList || [], { keys: ["alias"], threshold: 0.4 });
      const results = fuse.search(text || "");

      if (results.length === 0) {
        await ctx.reply("Ikan tidak dikenali. Coba ketik nama ikan yang lain (contoh: Kembung, Tongkol):");
        return;
      }

      const matchedIkan = results[0].item;

      // Update session ke step berikutnya & simpan ikan_id sementara di jsonb `data`
      await supabase.from("bot_session").upsert({
        chat_id: chatId,
        step: "MENUNGGU_JUMLAH",
        data: { ...session.data, ikan_id: matchedIkan.ikan_id, nama_ikan: (matchedIkan.ikan as any).nama_baku }
      });

      await ctx.reply(`Ketemu: *${(matchedIkan.ikan as any).nama_baku}*.\nAda berapa kg stok yang mau dijual hari ini?`, { parse_mode: "Markdown" });
      break;

    case "MENUNGGU_JUMLAH":
      const stok = parseFloat(text || "");
      const validationStok = numberSchema.safeParse(stok);

      if (!validationStok.success) {
        await ctx.reply("Format angka salah. Masukkan jumlah stok dalam bentuk angka (contoh: 50):");
        return;
      }

      await supabase.from("bot_session").upsert({
        chat_id: chatId,
        step: "MENUNGGU_HARGA",
        data: { ...session.data, stok_kg: stok }
      });

      await ctx.reply("Berapa harga per kg-nya? (Ketik angkanya saja, misal: 30000):");
      break;

    case "MENUNGGU_HARGA":
      const harga = parseFloat(text || "");
      const validationHarga = numberSchema.safeParse(harga);

      if (!validationHarga.success) {
        await ctx.reply("Format harga salah. Masukkan harga dalam bentuk angka (contoh: 30000):");
        return;
      }

      await supabase.from("bot_session").upsert({
        chat_id: chatId,
        step: "MENUNGGU_FOTO",
        data: { ...session.data, harga_per_kg: harga }
      });

      await ctx.reply("Kirimkan foto ikan segar hari ini ya, Pak/Bu, supaya pembeli lebih percaya! 📸");
      break;

    // Untuk step foto dan konfirmasi ✅/❌ bisa dilanjutkan dengan handler callback_query grammY
  }
}