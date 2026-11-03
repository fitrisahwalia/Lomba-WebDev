import { webhookCallback } from "grammy";
import { Bot } from "grammy";

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || "123456789:ABCdefGHIjklMNOpqrsTUVwxyZ");

// Bot logic dasar (contoh /start)
bot.command("start", async (ctx) => {
  await ctx.reply("Halo! Bot JalaLink sudah aktif dan terhubung!");
});

export const POST = webhookCallback(bot, "std/http", {
  secretToken: "jalalink_menang_LoMba",
});