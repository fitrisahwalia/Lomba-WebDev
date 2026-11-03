import { webhookCallback, Bot } from "grammy";
import { handleJualFlow } from "@/bot/flows/jual";
import { createClient } from "@supabase/supabase-js";

const token = process.env.TELEGRAM_BOT_TOKEN || "";
const bot = new Bot(token);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kewjzlhgrkacyrjlboaa.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_1ygn0KH_eqk53JVTLib-gQ_NfcJyZNm"
);

// Command /start atau /jual awal
bot.command("start", async (ctx) => {
  await ctx.reply("Halo Pak/Bu Nelayan! Selamat datang di bot JalaLink. Ketik /jual untuk mulai menjual ikan hari ini.");
});

bot.command("jual", async (ctx) => {
  const chatId = ctx.chat?.id;
  
  // Inisialisasi atau Reset bot_session ke step awal
  await supabase.from("bot_session").upsert({
    chat_id: chatId,
    step: "MENUNGGU_NAMA_IKAN",
    data: {}
  });

  await ctx.reply("Ikan apa yang mau dijual hari ini? (Contoh: Kembung, Tongkol, Layang)");
});

// Menangkap semua pesan teks biasa dan melemparnya ke alur jual
bot.on("message:text", async (ctx) => {
  const chatId = ctx.chat?.id;

  // Ambil sesi aktif nelayan dari database
  const { data: session } = await supabase
    .from("bot_session")
    .select("*")
    .eq("chat_id", chatId)
    .single();

  if (!session) {
    await ctx.reply("Ketik /jual terlebih dahulu untuk mulai menjual ikan ya.");
    return;
  }

  // Lempar ke file flows/jual.ts
  await handleJualFlow(ctx, session);
});

export const POST = webhookCallback(bot, "std/http", {
  secretToken: process.env.TELEGRAM_WEBHOOK_SECRET,
});