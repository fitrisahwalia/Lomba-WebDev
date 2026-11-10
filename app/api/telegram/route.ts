import { Bot, webhookCallback } from "grammy";
import { createClient } from "@supabase/supabase-js";

// Menggunakan Service Role Key / Fallback Anon Key untuk akses database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kewjzlhgrkacyrjlboaa.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_1ygn0KH_eqk53JVTLib-gQ_NfcJyZNm";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const token = process.env.TELEGRAM_BOT_TOKEN || "";
const bot = new Bot(token);

// Helper function untuk memproses penautan kode[cite: 6]
async function prosesTautkanKode(ctx: any, kode: string) {
  const chatId = ctx.chat?.id;

  if (!kode) {
    await ctx.reply("Format salah. Gunakan perintah: /tautkan KODE_ANDA (Contoh: /tautkan JL-1234)");
    return;
  }

  const cleanCode = kode.trim();

  // 1. Cari nelayan berdasarkan kode tautan[cite: 6]
  const { data: nelayan, error } = await supabase
    .from("nelayan")
    .select("id, nama")
    .eq("kode_tautan", cleanCode)
    .maybeSingle();

  if (error || !nelayan) {
    await ctx.reply("❌ Kode tautan tidak valid, kadaluwarsa, atau sudah digunakan.");
    return;
  }

  // 2. Simpan telegram_chat_id & hapus kode_tautan[cite: 6]
  await supabase
    .from("nelayan")
    .update({ telegram_chat_id: String(chatId), terverifikasi: true, kode_tautan: null })
    .eq("id", nelayan.id);

  await ctx.reply(`✅ *Berhasil!* Akun Anda terhubung sebagai nelayan: *${nelayan.nama}*.\n\nKetik /jual untuk mulai memasukkan stok ikan Anda.`, { parse_mode: "Markdown" });
}

// Handler Perintah Bot Telegram
bot.command("start", async (ctx) => {
  const kodeStart = ctx.match;
  if (kodeStart) {
    await prosesTautkanKode(ctx, kodeStart);
  } else {
    await ctx.reply("Halo Pak/Bu Nelayan! Selamat datang di bot JalaLink. Ketik /tautkan <kode> untuk menghubungkan akun Anda, atau /jual untuk mulai berjualan.");
  }
});

bot.command("tautkan", async (ctx) => {
  await prosesTautkanKode(ctx, ctx.match);
});

bot.command("jual", async (ctx) => {
  const chatId = ctx.chat?.id;

  const { data: nelayan } = await supabase
    .from("nelayan")
    .select("id, nama")
    .eq("telegram_chat_id", String(chatId))
    .maybeSingle();

  if (!nelayan) {
    await ctx.reply("❌ Akun Telegram Anda belum terhubung. Silakan buat kode tautan di web dan ketik `/tautkan KODE_ANDA` terlebih dahulu.", { parse_mode: "Markdown" });
    return;
  }

  await ctx.reply(`Halo *${nelayan.nama}*! Ikan apa yang mau dijual hari ini? (Balas dengan contoh: *Kakap Merah 10kg Rp65000*)`, { parse_mode: "Markdown" });
});

bot.command("stok_habis", async (ctx) => {
  const chatId = ctx.chat?.id;
  const { data: nelayan } = await supabase.from("nelayan").select("id").eq("telegram_chat_id", String(chatId)).maybeSingle();
  if (!nelayan) return ctx.reply("Akun belum tertaut.");

  await supabase.from("listing").update({ status: "habis" }).eq("nelayan_id", nelayan.id);
  await ctx.reply("📦 Semua listing aktif Anda telah diubah statusnya menjadi *Habis*.", { parse_mode: "Markdown" });
});

bot.on("message:text", async (ctx) => {
  const text = ctx.message.text;
  if (!text.startsWith("/")) {
    await ctx.reply("Pesan diterima! Untuk menginput stok ikan baru, silakan gunakan perintah /jual.");
  }
});

// HARMONISASI DENGAN APP ROUTER NEXT.JS & VERCEL
export async function POST(req: Request) {
  try {
    const handleUpdate = webhookCallback(bot, "std/http");
    return await handleUpdate(req);
  } catch (err: any) {
    console.error("Telegram Webhook Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}