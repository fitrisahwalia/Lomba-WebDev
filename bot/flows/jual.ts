import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kewjzlhgrkacyrjlboaa.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function handleJualFlow(ctx: any, session: any) {
  const chatId = ctx.chat?.id;
  const text = ctx.message?.text?.trim();

  if (!text) return;

  // STEP 1: MENUNGGU NAMA IKAN
  if (session.step === "MENUNGGU_NAMA_IKAN") {
    // 1. Cari dulu ke tabel ikan secara case-insensitive (.ilike)
    let { data: ikan } = await supabase
      .from("ikan")
      .select("id, nama_baku")
      .ilike("nama_baku", `%${text}%`)
      .maybeSingle();

    // 2. Jika tidak ditemukan di nama_baku, cari di tabel ikan_alias
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

    // 3. Jika masih tidak ketemu sama sekali
    if (!ikan) {
      await ctx.reply(
        `❌ Nama ikan *"${text}"* belum terdaftar di sistem.\n\nContoh ikan yang tersedia: *Tongkol, Kembung, Cumi-cumi, Kakap Merah*. Silakan ketik ulang nama ikannya:`,
        { parse_mode: "Markdown" }
      );
      return;
    }

    // 4. Jika ketemu, update session ke step berikutnya (MENUNGGU_STOK)
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

  // STEP 3: MENUNGGU HARGA PER KG
  if (session.step === "MENUNGGU_HARGA") {
    const harga = parseInt(text.replace(/[^0-9]/g, ""), 10);
    if (isNaN(harga) || harga <= 0) {
      await ctx.reply("❌ Masukkan nominal harga dalam angka yang valid (contoh: 35000).");
      return;
    }

    const d = { ...session.data, harga_per_kg: harga };

    await supabase.from("bot_session").update({
      step: "KONFIRMASI",
      data: d
    }).eq("chat_id", chatId);

    await ctx.reply(
      `📋 *Ringkasan Listing Ikan:*\n\n` +
      `• Jenis Ikan: *${d.nama_ikan}*\n` +
      `• Stok: *${d.stok_kg} kg*\n` +
      `• Harga: *Rp${harga.toLocaleString("id-ID")}/kg*\n\n` +
      `Ketik *YA* untuk konfirmasi dan menayangkan di web catalog, atau ketik /jual untuk mengulang.`,
      { parse_mode: "Markdown" }
    );
    return;
  }

  // STEP 4: KONFIRMASI AKHIR
  if (session.step === "KONFIRMASI") {
    if (text.toUpperCase() === "YA" || text.toUpperCase() === "Y") {
      const d = session.data;
      const { data: nelayan } = await supabase.from("nelayan").select("id").eq("telegram_chat_id", chatId).maybeSingle();

      if (nelayan) {
        await supabase.from("listing").insert({
          nelayan_id: nelayan.id,
          ikan_id: d.ikan_id,
          harga_per_kg: d.harga_per_kg,
          stok_kg: d.stok_kg,
          tanggal_tangkap: new Date().toISOString().split("T")[0],
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