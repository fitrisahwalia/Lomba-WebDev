import { Bot, webhookCallback } from "grammy";
import { handleJualFlow, handlePhotoFlow } from "@/bot/flows/jual";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kewjzlhgrkacyrjlboaa.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const token = process.env.TELEGRAM_BOT_TOKEN || "";
const bot = new Bot(token);


async function prosesTautkanKode(ctx: any, kode: string) {
  const chatId = ctx.chat?.id;

  if (!kode) {
    await ctx.reply("Format salah. Gunakan perintah: /tautkan KODE_ANDA (Contoh: /tautkan 123456)");
    return;
  }

  const cleanCode = kode.trim().replace(/^JL-/i, "");

  const { data: nelayan, error } = await supabase
    .from("nelayan")
    .select("id, nama")
    .or(`kode_tautan.eq.${cleanCode},kode_tautan.eq.JL-${cleanCode}`)
    .maybeSingle();

  if (error || !nelayan) {
    await ctx.reply("❌ Kode tautan tidak valid, kadaluwarsa, atau sudah digunakan.");
    return;
  }

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

  await supabase.from("bot_session").upsert({
    chat_id: chatId,
    step: "MENUNGGU_NAMA_IKAN",
    data: {}
  });

  await ctx.reply("Ikan apa yang mau dijual hari ini? (Contoh: Kembung, Tongkol, Layang)");
});

bot.command("stok_habis", async (ctx) => {
  const chatId = ctx.chat?.id;
  const { data: nelayan } = await supabase.from("nelayan").select("id").eq("telegram_chat_id", String(chatId)).maybeSingle();
  if (!nelayan) return ctx.reply("Akun belum tertaut.");

  await supabase.from("listing").update({ status: "habis" }).eq("nelayan_id", nelayan.id);
  await ctx.reply("📦 Semua listing aktif Anda telah diubah statusnya menjadi *Habis*.", { parse_mode: "Markdown" });
});

// Handler untuk pesan berupa TEKS
bot.on("message:text", async (ctx) => {
  const chatId = ctx.chat?.id;
  const { data: session } = await supabase.from("bot_session").select("*").eq("chat_id", chatId).maybeSingle();

  if (!session) {
    await ctx.reply("Ketik /jual terlebih dahulu untuk mulai menjual ikan ya.");
    return;
  }

  await handleJualFlow(ctx, session);
});

// 2. Tambahkan Handler khusus untuk FOTO di sini
bot.on("message:photo", async (ctx) => {
  const chatId = ctx.chat?.id;
  const { data: session } = await supabase.from("bot_session").select("*").eq("chat_id", chatId).maybeSingle();

  if (!session) return;

  await handlePhotoFlow(ctx, session);
});

export async function POST(req: Request) {
  try {
    const handleUpdate = webhookCallback(bot, "std/http");
    return await handleUpdate(req);
  } catch (err: any) {
    console.error("Telegram Webhook Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}