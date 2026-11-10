import { webhookCallback, Bot } from "grammy";
import { handleJualFlow, handlePhotoFlow } from "@/bot/flows/jual";
import { createClient } from "@supabase/supabase-js";

const token = process.env.TELEGRAM_BOT_TOKEN || "";
const bot = new Bot(token);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kewjzlhgrkacyrjlboaa.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_1ygn0KH_eqk53JVTLib-gQ_NfcJyZNm"
);

// Helper function untuk memproses penautan kode (dipakai di /start dan /tautkan)
async function prosesTautkanKode(ctx: any, kode: string) {
  const chatId = ctx.chat?.id;

  if (!kode) {
    await ctx.reply("Format salah. Gunakan perintah: /tautkan KODE_ANDA (Contoh: /tautkan 789123)");
    return;
  }

  // Bersihkan input dari spasi atau huruf JL-
  const cleanCode = kode.trim().replace(/^JL-/i, "");

  // 1. Cari nelayan berdasarkan kode_tautan
  const { data: nelayan, error } = await supabase
    .from("nelayan")
    .select("id, nama")
    .or(`kode_tautan.eq.${cleanCode},kode_tautan.eq.JL-${cleanCode}`)
    .maybeSingle();

  if (error || !nelayan) {
    await ctx.reply("❌ Kode tautan tidak valid, kadaluwarsa, atau sudah digunakan.");
    return;
  }

  // 2. Simpan telegram_chat_id & hapus kode_tautan
  await supabase
    .from("nelayan")
    .update({ 
      telegram_chat_id: String(chatId), 
      terverifikasi: true, 
      kode_tautan: null 
    })
    .eq("id", nelayan.id);

  await ctx.reply(`✅ *Berhasil!* Akun Anda terhubung sebagai nelayan: *${nelayan.nama}*.\n\nKetik /jual untuk mulai memasukkan stok ikan Anda.`, { parse_mode: "Markdown" });
}

// 1. Perintah /start (Mendukung klik langsung tombol dari Web: ?start=181662)[cite: 4, 6]
bot.command("start", async (ctx) => {
  const kodeStart = ctx.match;
  if (kodeStart) {
    // Jika ada parameter kode dari URL web
    await prosesTautkanKode(ctx, kodeStart);
  } else {
    // Jika pengguna membuka bot secara langsung
    await ctx.reply("Halo Pak/Bu Nelayan! Selamat datang di bot JalaLink. Ketik /tautkan <kode> untuk menghubungkan akun Anda, atau /jual untuk mulai berjualan.");
  }
});

// 2. Perintah /tautkan <kode> manual[cite: 6]
bot.command("tautkan", async (ctx) => {
  await prosesTautkanKode(ctx, ctx.match);
});

// 3. Perintah /jual (Hanya untuk nelayan terverifikasi)
bot.command("jual", async (ctx) => {
  const chatId = ctx.chat?.id;

  // Cek apakah akun telegram ini sudah terhubung ke tabel nelayan
  const { data: nelayan } = await supabase
    .from("nelayan")
    .select("id")
    .eq("telegram_chat_id", chatId)
    .single();

  if (!nelayan) {
    await ctx.reply("❌ Akun Telegram Anda belum terhubung. Silakan buat kode tautan di web dan ketik `/tautkan KODE_ANDA` terlebih dahulu.", { parse_mode: "Markdown" });
    return;
  }

  await supabase.from("bot_session").upsert({
    chat_id: chatId,
    step: "MENUNGGU_NAMA_IKAN",
    data: {}
  });

  await ctx.reply("Ikan apa yang mau dijual hari ini? (Contoh: Kembung, Tongkol, Layang)");
});

// Menu Manajemen Stok Habis[cite: 6]
bot.command("stok_habis", async (ctx) => {
  const chatId = ctx.chat?.id;
  const { data: nelayan } = await supabase.from("nelayan").select("id").eq("telegram_chat_id", chatId).single();
  if (!nelayan) return ctx.reply("Akun belum tertaut.");

  await supabase.from("listing").update({ status: "habis" }).eq("nelayan_id", nelayan.id).eq("status", "aktif");
  await ctx.reply("📦 Semua listing aktif Anda telah diubah statusnya menjadi *Habis*.", { parse_mode: "Markdown" });
});

bot.on("message:text", async (ctx) => {
  const chatId = ctx.chat?.id;
  const { data: session } = await supabase.from("bot_session").select("*").eq("chat_id", chatId).single();

  if (!session) {
    await ctx.reply("Ketik /jual terlebih dahulu untuk mulai menjual ikan ya.");
    return;
  }

  await handleJualFlow(ctx, session);
});

bot.on("message:photo", async (ctx) => {
  const chatId = ctx.chat?.id;
  const { data: session } = await supabase.from("bot_session").select("*").eq("chat_id", chatId).single();

  if (!session) return;
  await handlePhotoFlow(ctx, session);
});

bot.on("callback_query:data", async (ctx) => {
  const chatId = ctx.from?.id;
  const callbackData = ctx.callbackQuery.data;

  if (!chatId) return;

  const { data: session } = await supabase.from("bot_session").select("*").eq("chat_id", chatId).single();
  if (!session) return;

  const { data: nelayan } = await supabase.from("nelayan").select("id").eq("telegram_chat_id", chatId).single();
  if (!nelayan) return;

  if (callbackData === "konfirmasi_ya") {
    const d = session.data;
    await supabase.from("listing").insert({
      nelayan_id: nelayan.id,
      ikan_id: d.ikan_id,
      harga_per_kg: d.harga_per_kg,
      stok_kg: d.stok_kg,
      tanggal_tangkap: new Date().toISOString().split('T')[0],
      foto_url: d.foto_url,
      status: "aktif"
    });

    await supabase.from("bot_session").delete().eq("chat_id", chatId);

    await ctx.editMessageCaption({
      caption: "🎉 Listing ikan Anda berhasil disimpan dan langsung tayang di katalog web.",
      parse_mode: "Markdown"
    });
  } else if (callbackData === "konfirmasi_tidak") {
    await supabase.from("bot_session").delete().eq("chat_id", chatId);
    await ctx.editMessageCaption({
      caption: "❌ Dibatalkan. Ketik /jual untuk mengulang dari awal.",
      parse_mode: "Markdown"
    });
  }

  await ctx.answerCallbackQuery();
});

export const POST = webhookCallback(bot, "std/http", {
  secretToken: process.env.TELEGRAM_WEBHOOK_SECRET,
});