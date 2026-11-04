import { Context } from "grammy";
import { createClient } from "@supabase/supabase-js";
import Fuse from "fuse.js";
import { z } from "zod";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kewjzlhgrkacyrjlboaa.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_1ygn0KH_eqk53JVTLib-gQ_NfcJyZNm"
);

const numberSchema = z.number().positive({ message: "Harus berupa angka positif!" });

export async function handleJualFlow(ctx: Context, session: any) {
  const chatId = ctx.chat?.id;
  const text = ctx.msg?.text;

  // Cek apakah nelayan sudah terdaftar & tertaut
  const { data: nelayan } = await supabase
    .from("nelayan")
    .select("id")
    .eq("telegram_chat_id", chatId)
    .single();

  if (!nelayan) {
    await ctx.reply("Akun Telegram kamu belum tertaut sebagai nelayan. Silakan ketik /tautkan <kode> dari admin terlebih dahulu.");
    return;
  }

  switch (session?.step) {
    case "MENUNGGU_NAMA_IKAN":
      const { data: ikanList } = await supabase.from("ikan_alias").select("alias, ikan_id, ikan:ikan_id(nama_baku)");
      const fuse = new Fuse(ikanList || [], { keys: ["alias"], threshold: 0.4 });
      const results = fuse.search(text || "");

      if (results.length === 0) {
        await ctx.reply("Ikan tidak dikenali. Coba ketik nama ikan yang lain (contoh: Kembung, Tongkol):");
        return;
      }

      const matchedIkan = results[0].item;
      await supabase.from("bot_session").upsert({
        chat_id: chatId,
        step: "MENUNGGU_JUMLAH",
        data: { ...session.data, ikan_id: matchedIkan.ikan_id, nama_ikan: (matchedIkan.ikan as any).nama_baku }
      });

      await ctx.reply(`Ketemu: *${(matchedIkan.ikan as any).nama_baku}*.\nAda berapa kg stok yang mau dijual hari ini?`, { parse_mode: "Markdown" });
      break;

    case "MENUNGGU_JUMLAH":
      const stok = parseFloat(text || "");
      if (!numberSchema.safeParse(stok).success) {
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
      if (!numberSchema.safeParse(harga).success) {
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
  }
}

// Fungsi khusus menangani foto (H3)
export async function handlePhotoFlow(ctx: Context, session: any) {
  const chatId = ctx.chat?.id;
  const photo = ctx.msg?.photo;

  if (!photo || session?.step !== "MENUNGGU_FOTO") return;

  try {
    const fileId = photo[photo.length - 1].file_id;
    const file = await ctx.api.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const fileName = `listing_${chatId}_${Date.now()}.jpg`;

    // Upload ke Supabase Storage bucket 'listing-photos'
    const { error: uploadError } = await supabase.storage
      .from("listing-photos")
      .upload(fileName, blob, { contentType: "image/jpeg" });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("listing-photos")
      .getPublicUrl(fileName);

    const fotoUrl = publicUrlData.publicUrl;

    // Simpan foto_url ke bot_session, ubah step ke konfirmasi
    await supabase.from("bot_session").upsert({
      chat_id: chatId,
      step: "MENUNGGU_KONFIRMASI",
      data: { ...session.data, foto_url: fotoUrl }
    });

    const data = session.data;
    const ringkasan = `📋 *Ringkasan Listing Anda:*\n\n🐟 Ikan: ${data.nama_ikan}\n📦 Stok: ${data.stok_kg} kg\n💰 Harga: Rp${data.harga_per_kg} / kg\n\nApakah data di atas sudah benar?`;

    await ctx.replyWithPhoto(fotoUrl, {
      caption: ringkasan,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Benar", callback_data: "konfirmasi_ya" },
            { text: "❌ Ulang", callback_data: "konfirmasi_tidak" }
          ]
        ]
      }
    });

  } catch (err) {
    console.error("Gagal upload foto:", err);
    await ctx.reply("Gagal memproses foto. Silakan kirim ulang foto ikannya ya.");
  }
}