// файл: bot.js
// Установите: npm install telegraf
import { Telegraf } from 'telegraf';

const BOT_TOKEN = process.env.BOT_TOKEN; // установите токен в окружении
if (!BOT_TOKEN) {
  console.error('Укажите BOT_TOKEN в переменных окружения');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

const INTEGRATION_URL = 'https://testgameappstart.onrender.com'; // ваш Web App URL

bot.start((ctx) => {
  const name = ctx.from?.first_name || 'Игрок';
  return ctx.reply(
    `Привет, ${name}! Откроем наше предложение?`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Открыть предложение', web_app: { url: INTEGRATION_URL } }
          ]
        ]
      }
    }
  );
});

bot.launch().then(() => console.log('Bot started'));
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));