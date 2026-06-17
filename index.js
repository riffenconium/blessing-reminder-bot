require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const blessingFacts = require('./messages.json');
const wisdoms = require('./wisdoms.json');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TEST_MODE = process.env.TEST === 'true';
const END_DATE = process.env.END_DATE
  ? new Date(process.env.END_DATE)
  : new Date('2026-07-27T17:00:00Z'); // 40 days from 2026-06-17, midnight WIB

if (!BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN is required');
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// All times are WIB (UTC+7). Server likely runs UTC.
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

// Returns UTC ms for midnight WIB today
function getWIBMidnightUTC() {
  const nowMs = Date.now();
  const wibMs = nowMs + WIB_OFFSET_MS;
  const wibMidnightMs = Math.floor(wibMs / 86400000) * 86400000;
  return wibMidnightMs - WIB_OFFSET_MS;
}

// Returns N sorted UTC timestamps for random times within [startHourWIB, endHourWIB)
function randomTimesInWindow(startHourWIB, endHourWIB, count) {
  const midnight = getWIBMidnightUTC();
  const startMs = startHourWIB * 3600 * 1000;
  const windowMs = (endHourWIB - startHourWIB) * 3600 * 1000;
  const times = [];
  for (let i = 0; i < count; i++) {
    times.push(midnight + startMs + Math.floor(Math.random() * windowMs));
  }
  return times.sort((a, b) => a - b);
}

function scheduleAt(timeMs, label, fn) {
  const delay = timeMs - Date.now();
  if (delay <= 0) {
    console.log(`[SKIP] ${label} — already past (${new Date(timeMs).toISOString()})`);
    return;
  }
  const inMin = Math.round(delay / 60000);
  console.log(`[SCHED] ${label} → ${new Date(timeMs).toISOString()} (in ${inMin}m)`);
  setTimeout(fn, delay);
}

async function send(text) {
  if (!CHAT_ID) {
    console.log('[SEND skipped] No CHAT_ID set');
    return;
  }
  const now = new Date();
  if (now > END_DATE) {
    console.log(`[SKIP] END_DATE reached — no more messages.`);
    return;
  }
  try {
    await bot.sendMessage(CHAT_ID, text, { parse_mode: 'HTML' });
  } catch (err) {
    console.error(`[SEND ERROR] ${err.message}`);
  }
}

// Check at midnight WIB whether the 40 days are complete
function checkEndDate() {
  if (new Date() > END_DATE) {
    console.log('40 days complete. Sending final message.');
    if (CHAT_ID) {
      bot.sendMessage(
        CHAT_ID,
        `🌿 <b>40 days complete. Alhamdulillah.</b>\n\nYour journey of remembrance is done — but the dhikr never ends. Keep counting your blessings, keep sending salawat, keep asking for madad. The door is always open.\n\nYa Rabbi, accept it from us. Ameen. 🤲`,
        { parse_mode: 'HTML' }
      ).catch(err => console.error('Final message failed:', err.message));
    }
  }
}

// --- Message pickers ---

let lastFactIdx = -1;
function pickFact() {
  let i;
  do { i = Math.floor(Math.random() * blessingFacts.length); }
  while (i === lastFactIdx && blessingFacts.length > 1);
  lastFactIdx = i;
  return blessingFacts[i];
}

let lastWisdomIdx = -1;
function pickWisdom() {
  let i;
  do { i = Math.floor(Math.random() * wisdoms.length); }
  while (i === lastWisdomIdx && wisdoms.length > 1);
  lastWisdomIdx = i;
  return wisdoms[i];
}

const MADAD_MESSAGES = [
  `🤲 <b>Madad ya Mawlana!</b>\n\nAsk for the support of Mawlana Shaykh Nazim now. He is present with those who call on him.\n\nSay 7 times: <i>"Madad ya Mawlana Shaykh Nazim, madad."</i>\nOpen your heart and feel the connection.`,
  `💚 <b>Madad ya Sayyidi!</b>\n\nStop everything. Turn your heart to Mawlana Shaykh Nazim.\nHis spiritual support reaches you wherever you are.\n\n<i>"Ya Mawlana, madad!"</i> — say it now, from the heart.`,
  `🌹 <b>Time for Madad</b>\n\nMawlana Shaykh Nazim is always calling his mureedeen. Respond by calling on him.\n\n<i>"Madad ya Mawlana Shaykh Nazim al-Haqqani"</i>\n\nLet it come from the depths of your heart, not only your tongue.`,
  `☀️ <b>Ask for Madad</b>\n\nThe awliya are oceans of mercy. Dip into that ocean right now.\nAsk Mawlana for his madad, his light, his protection.\n\n<i>"Ya Mawlana, we are weak — support us."</i>`,
  `🌙 <b>Evening Madad</b>\n\nBefore this hour passes, turn to Mawlana Shaykh Nazim.\nHe never turns away a mureed who calls sincerely.\n\n<i>"Madad ya Mawlana, madad ya Sultan al-Awliya."</i>\nLet it rise from your heart.`,
];

let madadIdx = 0;
function nextMadad() {
  const msg = MADAD_MESSAGES[madadIdx % MADAD_MESSAGES.length];
  madadIdx++;
  return msg;
}

// --- Message senders ---

function sendSubhanallah() {
  return send(
    `🌿 <b>SubhanAllah 40 times — right now.</b>\n\n` +
    `Stop. Breathe. Say it slowly 40 times:\n` +
    `<i>"SubhanAllah"</i> — Glory be to Allah.\n\n` +
    `Let each one wash your heart clean. 💚`
  );
}

function sendBismillah() {
  return send(
    `✨ <b>Bismillah 50 times — right now.</b>\n\n` +
    `Say slowly 50 times:\n` +
    `<i>"Bismillah ir-Rahman ir-Rahim"</i>\n\n` +
    `In the Name of Allah, the Most Gracious, the Most Merciful.\n` +
    `Begin this moment with His blessed name.`
  );
}

function sendWisdom() {
  return send(`📖 <b>Wisdom:</b>\n\n${pickWisdom()}`);
}

function sendMadad() {
  return send(nextMadad());
}

function sendSalawat() {
  return send(
    `🌹 <b>Salawat on the Prophet ﷺ — 33 times.</b>\n\n` +
    `Say 33 times:\n` +
    `<i>"Allahumma salli 'ala Muhammad wa 'ala ali Muhammad"</i>\n\n` +
    `Each salawat is light upon light. Fill this evening with it. ☀️`
  );
}

function sendBlessingFact() {
  return send(`💛 ${pickFact()}`);
}

// --- Daily random scheduler ---

function scheduleDailyMessages() {
  const now = new Date();
  console.log(`\n[${now.toISOString()}] Scheduling random messages for today (WIB date)...`);

  // SubhanAllah 40x — 2x/day, random 09:00–18:00 WIB
  randomTimesInWindow(9, 18, 2).forEach((t, i) =>
    scheduleAt(t, `SubhanAllah #${i + 1}`, sendSubhanallah)
  );

  // Bismillah 50x — 2x/day, random 09:00–18:00 WIB
  randomTimesInWindow(9, 18, 2).forEach((t, i) =>
    scheduleAt(t, `Bismillah #${i + 1}`, sendBismillah)
  );

  // Wisdom — 1x/day, random 09:00–18:00 WIB
  randomTimesInWindow(9, 18, 1).forEach(t =>
    scheduleAt(t, 'Wisdom', sendWisdom)
  );

  // Salawat 33x — 3x/day, random 17:00–21:00 WIB
  randomTimesInWindow(17, 21, 3).forEach((t, i) =>
    scheduleAt(t, `Salawat #${i + 1}`, sendSalawat)
  );

  // Blessing bank fact — 1x/day, random 09:00–21:00 WIB
  randomTimesInWindow(9, 21, 1).forEach(t =>
    scheduleAt(t, 'BlessingFact', sendBlessingFact)
  );
}

// Fixed Madad times (WIB → UTC):
// 09:00 WIB = 02:00 UTC
// 13:00 WIB = 06:00 UTC
// 16:30 WIB = 09:30 UTC
// 19:00 WIB = 12:00 UTC
// 20:30 WIB = 13:30 UTC
cron.schedule('0 2 * * *',  sendMadad); // 09:00 WIB
cron.schedule('0 6 * * *',  sendMadad); // 13:00 WIB
cron.schedule('30 9 * * *', sendMadad); // 16:30 WIB
cron.schedule('0 12 * * *', sendMadad); // 19:00 WIB
cron.schedule('30 13 * * *', sendMadad); // 20:30 WIB

// Reschedule random messages at midnight WIB = 17:00 UTC; also check end date
cron.schedule('0 17 * * *', () => {
  checkEndDate();
  scheduleDailyMessages();
});

// /start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `Bismillah! Your chat ID is: <code>${msg.chat.id}</code>\n\nSet this as TELEGRAM_CHAT_ID in your environment.`,
    { parse_mode: 'HTML' }
  );
});

// --- Start ---

if (TEST_MODE) {
  console.log('TEST MODE: sending one of each message type then exiting.');
  if (!CHAT_ID) {
    console.error('TELEGRAM_CHAT_ID required for test mode');
    process.exit(1);
  }
  (async () => {
    await sendSubhanallah();
    await sendBismillah();
    await sendWisdom();
    await sendMadad();
    await sendSalawat();
    await sendBlessingFact();
    console.log('Test done. Exiting.');
    process.exit(0);
  })();
} else {
  if (!CHAT_ID) {
    console.log('No TELEGRAM_CHAT_ID set. Send /start to the bot to get your chat ID.');
  }
  scheduleDailyMessages();
  console.log('\nBlessing Reminder Bot started!');
  console.log(`Blessing bank: ${blessingFacts.length} messages | Wisdoms: ${wisdoms.length}`);
  console.log(`End date: ${END_DATE.toISOString()} (40 days)`);
  console.log('Schedule:');
  console.log('  SubhanAllah 40x  — 2x/day, random 09:00–18:00 WIB');
  console.log('  Bismillah 50x    — 2x/day, random 09:00–18:00 WIB');
  console.log('  Wisdom           — 1x/day, random 09:00–18:00 WIB');
  console.log('  Madad Mawlana    — 5x/day fixed: 09:00, 13:00, 16:30, 19:00, 20:30 WIB');
  console.log('  Salawat 33x      — 3x/day, random 17:00–21:00 WIB');
  console.log('  Blessing fact    — 1x/day, random 09:00–21:00 WIB');
}
