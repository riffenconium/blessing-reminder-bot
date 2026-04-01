require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const messages = require('./messages.json');

// --- Configuration ---
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const END_DATE = process.env.END_DATE
  ? new Date(process.env.END_DATE)
  : new Date(Date.now() + 40 * 24 * 60 * 60 * 1000);
const TEST_MODE = process.env.TEST === 'true';

if (!BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN is required');
  process.exit(1);
}

// --- Bot Setup ---
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

let lastMessageIndex = -1;
let cronJob = null;

function pickMessage() {
  let index;
  do {
    index = Math.floor(Math.random() * messages.length);
  } while (index === lastMessageIndex && messages.length > 1);
  lastMessageIndex = index;
  return messages[index];
}

async function sendReminder() {
  const now = new Date();
  if (now > END_DATE) {
    console.log(`[${now.toISOString()}] END_DATE reached. Sending final message.`);
    await bot.sendMessage(
      CHAT_ID,
      '40 days complete! Alhamdulillah. Your journey of remembrance continues — with or without this bot, keep counting your blessings and making grand intentions. Ya Rabbi, accept it from us!'
    );
    if (cronJob) cronJob.stop();
    console.log('Cron stopped. Bot will stay alive but no more messages.');
    return;
  }

  const message = pickMessage();
  console.log(`[${now.toISOString()}] Sending: ${message.substring(0, 50)}...`);
  try {
    await bot.sendMessage(CHAT_ID, message);
  } catch (err) {
    console.error(`[${now.toISOString()}] Failed to send:`, err.message);
  }
}

// --- /start command: reply with chat ID ---
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `Bismillah! Your chat ID is: ${chatId}\n\nSet this as TELEGRAM_CHAT_ID in your environment variables.`);
});

// --- Test mode: send one message and exit ---
if (TEST_MODE) {
  console.log('TEST MODE: sending one message and exiting.');
  if (!CHAT_ID) {
    console.error('TELEGRAM_CHAT_ID is required for test mode');
    process.exit(1);
  }
  sendReminder().then(() => {
    console.log('Test message sent. Exiting.');
    process.exit(0);
  });
} else {
  if (!CHAT_ID) {
    console.log('No TELEGRAM_CHAT_ID set. Bot is running — send /start to get your chat ID.');
  }

  cronJob = cron.schedule('0,30 * * * *', () => {
    if (!CHAT_ID) {
      console.log('Skipping: TELEGRAM_CHAT_ID not set.');
      return;
    }
    sendReminder();
  });

  // Bismillah 40x reminder — 6 times daily at 06:00, 08:00, 13:00, 17:00, 19:00, 21:00 WIB (UTC+7)
  const bismillahJob = cron.schedule('0 23,1,6,10,12,14 * * *', () => {
    if (!CHAT_ID) return;
    const now = new Date();
    if (now > END_DATE) return;
    console.log(`[${now.toISOString()}] Sending Bismillah reminder`);
    bot.sendMessage(CHAT_ID, 'Stop what you are doing. Say "Bismillah ir-Rahman ir-Rahim" 40 times. Right now. No rush — let each one settle in your heart.').catch(err => {
      console.error(`[${now.toISOString()}] Failed to send Bismillah reminder:`, err.message);
    });
  });

  console.log('Blessing Reminder Bot started!');
  console.log(`Messages: ${messages.length}`);
  console.log(`End date: ${END_DATE.toISOString()}`);
  console.log(`Chat ID: ${CHAT_ID || '(not set — send /start to bot)'}`);
  console.log('Sending reminders every 30 minutes.');
  console.log('Bismillah 40x reminders at 06:00, 08:00, 13:00, 17:00, 19:00, 21:00 WIB.');
}
