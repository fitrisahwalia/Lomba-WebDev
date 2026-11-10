import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kewjzlhgrkacyrjlboaa.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// 1. Handling Alur Teks Percakapan (/jual, nama ikan, stok, harga, konfirmasi)
export async function handleJualFlow(ctx: any, session: any) {
  const chatId = ctx.chat?.id;
  const text = ctx.message?.text?.trim();

  if (!text) return;

  // STEP 1: MENUNGGU NAMA IKAN
  if (session.step === "MENUNGGU_NAMA_IKAN") {
    let { data: ikan } = await supabase
      .from("ikan")
      .select("id, nama_baku")
      .ilike("nama_baku", `%${text}%`)
      .maybeSingle();

    if (!ikan) {
      const { data: aliasData } = await supabase
        .from("ikan_alias")
        .select("ikan_id, ikan(id, nama_baku)")
        .ilike("alias", `%${text}%`)
        .maybeSingle();

      if (aliasData && aliasData.ikan) {
        ikan = Array.isArray(aliasData.ikan) ? aliasData.ikan[0] : aliasData.ikan;
      }
    }

    if (!ikan) {
      await ctx.reply(
        `❌ Nama ikan *"${text}"* belum terdaftar di sistem.\n\nContoh ikan yang tersedia: *Tongkol, Kembung, Cumi-cumi, Kakap Merah*. Silakan ketik ulang nama ikannya:`,
        { parse_mode: "Markdown" }
      );
      return;
    }

    await supabase.from("bot_session").update({
      step: "MENUNGGU_STOK",
      data: {
        ...session.data,
        ikan_id: ikan.id,
        nama_ikan: ikan.nama_baku
      }
    }).eq("chat_id", chatId);

    await ctx.reply(
      `✅ Ikan terdeteksi: *${ikan.nama_baku}*.\n\nBerapa total stok (kg) yang mau dijual hari ini? (Contoh: 15)`,
      { parse_mode: "Markdown" }
    );
    return;
  }

  // STEP 2: MENUNGGU STOK (KG)
  if (session.step === "MENUNGGU_STOK") {
    const stok = parseFloat(text.replace(",", "."));
    if (isNaN(stok) || stok <= 0) {
      await ctx.reply("❌ Masukkan jumlah stok dalam angka yang valid (contoh: 10 atau 25.5).");
      return;
    }

    await supabase.from("bot_session").update({
      step: "MENUNGGU_HARGA",
      data: { ...session.data, stok_kg: stok }
    }).eq("chat_id", chatId);

    await ctx.reply(
      `Stok: *${stok} kg*.\n\nBerapa harga jual per kg (Rp)? (Contoh: 35000)`,
      { parse_mode: "Markdown" }
    );
    return;
  }

  // STEP 3: MENUNGGU HARGA PER KG -> PINDAH KE ALUR FOTO
  if (session.step === "MENUNGGU_HARGA") {
    const harga = parseInt(text.replace(/[^0-9]/g, ""), 10);
    if (isNaN(harga) || harga <= 0) {
      await ctx.reply("❌ Masukkan nominal harga dalam angka yang valid (contoh: 35000).");
      return;
    }

    await supabase.from("bot_session").update({
      step: "MENUNGGU_FOTO",
      data: { ...session.data, harga_per_kg: harga }
    }).eq("chat_id", chatId);

    await ctx.reply(
      `Harga: *Rp${harga.toLocaleString("id-ID")}/kg*.\n\n📸 *Kirimkan foto hasil tangkapan ikan Anda sekarang* (atau ketik *Lewati* jika tidak ada foto):`,
      { parse_mode: "Markdown" }
    );
    return;
  }

  // STEP 3B: JIKA NELAYAN MENGETIK "LEWATI" SAAT MENUNGGU FOTO
  if (session.step === "MENUNGGU_FOTO") {
    if (text.toUpperCase() === "LEWATI" || text.toUpperCase() === "SKIP") {
      const d = { ...session.data, foto_url: null };

      await supabase.from("bot_session").update({
        step: "KONFIRMASI",
        data: d
      }).eq("chat_id", chatId);

      await ctx.reply(
        `📋 *Ringkasan Listing Ikan:*\n\n` +
        `• Jenis Ikan: *${d.nama_ikan}*\n` +
        `• Stok: *${d.stok_kg} kg*\n` +
        `• Harga: *Rp${d.harga_per_kg.toLocaleString("id-ID")}/kg*\n` +
        `• Foto: *(Tidak ada)*\n\n` +
        `Ketik *YA* untuk konfirmasi dan menayangkan di web catalog, atau ketik /jual untuk mengulang.`,
        { parse_mode: "Markdown" }
      );
      return;
    }
  }

  // STEP 4: KONFIRMASI AKHIR
  if (session.step === "KONFIRMASI") {
    if (text.toUpperCase() === "YA" || text.toUpperCase() === "Y") {
      const d = session.data;
      const { data: nelayan } = await supabase.from("nelayan").select("id").eq("telegram_chat_id", String(chatId)).maybeSingle();

      if (nelayan) {
        await supabase.from("listing").insert({
          nelayan_id: nelayan.id,
          ikan_id: d.ikan_id,
          harga_per_kg: d.harga_per_kg,
          stok_kg: d.stok_kg,
          tanggal_tangkap: new Date().toISOString().split("T")[0],
          foto_url: d.foto_url || null,
          status: "aktif"
        });
      }

      await supabase.from("bot_session").delete().eq("chat_id", chatId);

      await ctx.reply("🎉 *Berhasil!* Listing ikan Anda telah ditayangkan di web katalog JalaLink.", { parse_mode: "Markdown" });
    } else {
      await ctx.reply("Ketik *YA* untuk mengonfirmasi, atau ketik /jual untuk mulai dari awal.");
    }
  }
}

// 2. Handling Saat Nelayan Mengirim Gambar/Foto (message:photo)
export async function handlePhotoFlow(ctx: any, session: any) {
  const chatId = ctx.chat?.id;

  if (session.step === "MENUNGGU_FOTO") {
    // Ambil foto kualitas tertinggi yang dikirim di Telegram
    const photos = ctx.message?.photo;
    if (!photos || photos.length === 0) return;

    const fileId = photos[photos.length - 1].file_id;
    const file = await ctx.api.getFile(fileId);
    const fotoUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

    const d = { ...session.data, foto_url: fotoUrl };

    await supabase.from("bot_session").update({
      step: "KONFIRMASI",
      data: d
    }).eq("chat_id", chatId);

    await ctx.reply(
      `📸 Foto berhasil diterima!\n\n` +
      `📋 *Ringkasan Listing Ikan:*\n\n` +
      `• Jenis Ikan: *${d.nama_ikan}*\n` +
      `• Stok: *${d.stok_kg} kg*\n` +
      `• Harga: *Rp${d.harga_per_kg.toLocaleString("id-ID")}/kg*\n` +
      `• Foto: *Sudah Diunggah*\n\n` +
      `Ketik *YA* untuk konfirmasi dan menayangkan di web catalog, atau ketik /jual untuk mengulang.`,
      { parse_mode: "Markdown" }
    );
  }
}