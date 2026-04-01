# Blessing Reminder Telegram Bot — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Telegram bot that sends 77 curated spiritual reminders every hour, 24/7, for a configurable duration (default 40 days), deployed on Railway.

**Architecture:** Single Node.js app with node-cron scheduling and node-telegram-bot-api. Messages stored in a JSON file. Configuration via environment variables. One cron job fires hourly, picks a random message (no back-to-back repeats), sends via Telegram, and stops after END_DATE.

**Tech Stack:** Node.js, node-telegram-bot-api, node-cron, Railway

---

## File Structure

```
blessing-reminder-bot/
├── index.js          # Entry point: bot setup, cron job, /start handler
├── messages.json     # Array of 77 curated messages
├── package.json      # Dependencies and start script
├── .env.example      # Template for env vars (committed)
├── .gitignore        # node_modules, .env
└── docs/             # Spec and plan (already exists)
```

---

### Task 1: Initialize Project and Git Repo

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `.env.example`

- [ ] **Step 1: Initialize npm project**

Run:
```bash
cd /c/Users/User/blessing-reminder-bot
npm init -y
```

- [ ] **Step 2: Edit package.json**

Set the start script and metadata:

```json
{
  "name": "blessing-reminder-bot",
  "version": "1.0.0",
  "description": "Telegram bot that sends hourly spiritual reminders for 40 days",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

- [ ] **Step 3: Create .gitignore**

```
node_modules/
.env
```

- [ ] **Step 4: Create .env.example**

```
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_CHAT_ID=your_chat_id
END_DATE=2026-05-11
```

- [ ] **Step 5: Install dependencies**

Run:
```bash
npm install node-telegram-bot-api node-cron
```

- [ ] **Step 6: Initialize git repo and commit**

Run:
```bash
cd /c/Users/User/blessing-reminder-bot
git init
git add package.json package-lock.json .gitignore .env.example docs/
git commit -m "chore: init project with dependencies and docs"
```

---

### Task 2: Create Messages File

**Files:**
- Create: `messages.json`

- [ ] **Step 1: Create messages.json with all 77 messages**

Create `messages.json` as a flat JSON array of 77 strings. The full list:

```json
[
  "That cup of tea you had today — warm, comforting, yours. Have you said Alhamdulillah for it?",
  "Your pillow last night. Soft, waiting for you. Millions sleep on bare ground. Alhamdulillah.",
  "Hot water from your tap — you didn't carry it from a well. That alone is a kingdom's blessing.",
  "The sound of rain, birds outside, the breeze on your face — each one is Allah saying 'I love you.'",
  "You turned on a light switch today. Electricity. Think about that. Alhamdulillah.",
  "Your shoes. They protect your feet. Someone somewhere is walking barefoot on burning roads.",
  "You ate today without wondering if there would be food. That is a blessing most of the world doesn't have.",
  "Your phone buzzed with a message from someone who cares about you. That is a ni'mah. Be grateful.",
  "The clothes on your back — clean, comfortable, yours. Thank Allah for every thread.",
  "You can read. You can understand words. Millions cannot. This is a gift beyond measure.",
  "That moment of silence you had today — no pain, no crisis, just peace. That IS the blessing. Notice it.",
  "Your fridge has food in it. Your home has a door that locks. You are safer than most humans in history.",
  "Someone smiled at you today. Or you smiled at someone. That connection is from Allah.",
  "You woke up with iman. Billions didn't. Your heart knows La ilaha illAllah — what greater blessing exists?",
  "The ability to make wudu with clean water — angels wish they could worship like you do.",
  "Your fingers, your toes, your heartbeat — 100,000 beats today, each one a gift. Have you thanked Him?",
  "A roof when it rains. Shade when it's hot. Warmth when it's cold. You live in constant mercy.",
  "You have a Shaykh. A living connection to the Prophet ﷺ. Most people search their whole lives and don't find this.",
  "The fact that you can still make tawbah — the door is open. That is the greatest blessing of all.",
  "Even your problems are blessings — they bring you closer to Allah. Say Alhamdulillah for the tests too.",
  "Make intention NOW: Ya Rabbi, let Islam reach every corner of the earth — every village, every island, every mountain!",
  "Intend: Ya Rabbi, build a mosque in every human settlement on earth — every town, every city, every hamlet!",
  "With every breath IN, intend to recite the entire Quran. With every breath OUT, thank Allah as many times as every raindrop that has fallen today!",
  "Make intention: Ya Rabbi, let me be the reason someone takes shahada. Let it spread from them to millions!",
  "Intend BIG: Ya Rabbi, give me the strength to feed every hungry person on earth. Every single one!",
  "Make intention now: Let every footstep I take plant a tree in Jannah. Let my Jannah be bigger than this entire dunya!",
  "Intend: Ya Rabbi, let the light of Islam shine in every home, every school, every parliament, every heart on earth!",
  "With every heartbeat, make intention to send salawat on the Prophet ﷺ as many times as there are stars in the sky!",
  "Intend: Ya Rabbi, let me build hospitals, schools, and orphanages across every continent for Your sake!",
  "Make intention: Let every word I speak today carry the weight of a thousand good deeds. Allah can do this!",
  "Intend NOW: Ya Rabbi, forgive every Muslim alive and dead — all of them, every single one!",
  "Make intention to spread kindness so far that it reaches people you will never meet, in lands you will never visit!",
  "Intend: Ya Rabbi, let my dhikr today be heavier on the scales than all the mountains of the earth combined!",
  "Make intention: Let me serve my Shaykh so perfectly that the Prophet ﷺ himself is pleased with me!",
  "Intend BIG: Ya Rabbi, give me the himma to worship You as if every breath is my last — with that urgency, that love!",
  "Make intention: Ya Rabbi, let every penny I earn be sadaqah that flows until the Day of Judgement!",
  "Intend: Let my dua today reach every oppressed person on earth and bring them relief before sunset!",
  "Make intention NOW: Ya Rabbi, make me a wali! Don't let me settle for less than Your highest stations!",
  "Hosh dar dam — every breath is a gift and a dhikr. Don't let a single one pass without awareness.",
  "Rabita — connect your heart to your Shaykh right now. One moment of connection is light upon light.",
  "Stop. Say 'La ilaha illAllah' 10 times. Not from your tongue — from the deepest part of your heart.",
  "Adab, adab, adab. Check yourself — are you carrying yourself like a mureed of Mawlana?",
  "Send salawat on the Prophet ﷺ right now. It is the fastest key to every locked door.",
  "Istighfar — say 'Astaghfirullah' now. Polish your heart. A clean heart receives more light.",
  "The quiet dhikr of the heart is the Naqshbandi way. Say 'Allah, Allah, Allah' silently right now.",
  "Mawlana says: Don't be weak! Weak people make weak intentions. Be strong — Allah loves the strong believer!",
  "Whatever you are worried about — Allah already solved it. You just haven't seen the answer yet. Trust Him.",
  "Be kind to someone this hour. The Prophet ﷺ said even a smile is sadaqah. Who will you smile at?",
  "Death is closer than your shoelace. But don't fear it — prepare for it. Make tawbah now.",
  "You are a mureed on the path of the awliya. Every single hour is a chance to rise. Don't waste this one!",
  "The toothbrush you used this morning — clean teeth, fresh breath. A simple mercy most take for granted.",
  "You walked today without pain in your legs. Someone somewhere is begging Allah for just one more step.",
  "That deep breath you just took — no machine needed, no hospital bed. Just you and Allah's mercy.",
  "Your bed sheets. Washed, soft, waiting for you tonight. A luxury the Prophet ﷺ himself didn't always have.",
  "You have choices for dinner tonight. Not 'will I eat?' but 'what will I eat?' — that is royalty.",
  "Your eyesight — the colours of the sky, the face of someone you love. One blessing you could never repay.",
  "Air conditioning or heating — you control the temperature of your home. Subhanallah, think about that.",
  "Someone cooked for you, or you could cook for yourself. Either way, that is provision from Al-Razzaq.",
  "Your internet connection brought you Islamic knowledge today. Scholars used to walk months for one hadith.",
  "The fact that you feel guilty when you sin — that is your iman alive. Alhamdulillah for a living heart.",
  "You have memories of people who loved you. Even memory itself is a blessing — some have lost even that.",
  "A sunny day. Or a rainy day that waters the earth. Either way, Allah is showing you mercy.",
  "Intend: Ya Rabbi, let every ocean wave that crashes be a dhikr written in my book of deeds!",
  "Make intention NOW: Ya Rabbi, use me to unite the entire Ummah — all 2 billion, one heart!",
  "Intend: Let every leaf that falls from every tree on earth fall saying 'SubhanAllah' on my behalf!",
  "Make intention: Ya Rabbi, let me fund a well in every dry village on earth so no one thirsts again!",
  "Intend BIG: Ya Rabbi, let my children and their children carry Islam to places I cannot even imagine!",
  "Make intention: Let every tear I have ever cried become a river in Jannah flowing with honey and milk!",
  "Intend: Ya Rabbi, give me the courage to stand for truth even if the whole world stands against me!",
  "Make intention NOW: Ya Rabbi, open the hearts of every non-Muslim on earth to the beauty of Islam!",
  "Intend: Let every sajdah I make shake the Arsh with its sincerity. Let the angels say Ameen!",
  "Make intention: Ya Rabbi, let me free every prisoner of oppression, every slave, every suffering soul on earth!",
  "Intend: Let my sadaqah multiply until it has clothed every naked child and sheltered every homeless family!",
  "Make intention: Ya Rabbi, let me meet the Prophet ﷺ at the Hawd and let him recognise me as one of his own!",
  "Khalwat dar anjuman — you're in a crowd right now but your heart can be alone with Allah. Go inward.",
  "Mawlana says: You are not a drop in the ocean — you are the entire ocean in a drop. Know your worth with Allah!",
  "This hour is gone forever. The next hour is a gift. Enter it with dhikr on your tongue and intention in your heart."
]
```

- [ ] **Step 2: Verify message count**

Run:
```bash
node -e "const m = require('./messages.json'); console.log('Message count:', m.length)"
```

Expected: `Message count: 77`

- [ ] **Step 3: Commit**

```bash
git add messages.json
git commit -m "feat: add 77 curated spiritual reminder messages"
```

---

### Task 3: Build the Main App

**Files:**
- Create: `index.js`

- [ ] **Step 1: Create index.js**

```javascript
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const messages = require('./messages.json');

// --- Configuration ---
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const END_DATE = process.env.END_DATE
  ? new Date(process.env.END_DATE)
  : new Date(Date.now() + 40 * 24 * 60 * 60 * 1000); // default: 40 days from now
const TEST_MODE = process.env.TEST === 'true';

if (!BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN is required');
  process.exit(1);
}

// --- Bot Setup ---
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

let lastMessageIndex = -1;

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
      '40 days complete! Alhamdulillah. Your journey of remembrance continues — with or without this bot, keep counting your blessings and making grand intentions. Ya Rabbi, accept it from us! 🤲'
    );
    cronJob.stop();
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
  // --- Cron: every hour on the hour ---
  if (!CHAT_ID) {
    console.log('No TELEGRAM_CHAT_ID set. Bot is running — send /start to get your chat ID.');
  }

  const cronJob = cron.schedule('0 * * * *', () => {
    if (!CHAT_ID) {
      console.log('Skipping: TELEGRAM_CHAT_ID not set.');
      return;
    }
    sendReminder();
  });

  // Make cronJob accessible to sendReminder for stopping
  global.cronJob = cronJob;

  console.log(`Blessing Reminder Bot started!`);
  console.log(`Messages: ${messages.length}`);
  console.log(`End date: ${END_DATE.toISOString()}`);
  console.log(`Chat ID: ${CHAT_ID || '(not set — send /start to bot)'}`);
  console.log('Sending reminders every hour on the hour.');
}
```

Wait — the `cronJob` variable is referenced inside `sendReminder()` but defined after it. Fix: move the cronJob reference. Here is the corrected version:

```javascript
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

  cronJob = cron.schedule('0 * * * *', () => {
    if (!CHAT_ID) {
      console.log('Skipping: TELEGRAM_CHAT_ID not set.');
      return;
    }
    sendReminder();
  });

  console.log('Blessing Reminder Bot started!');
  console.log(`Messages: ${messages.length}`);
  console.log(`End date: ${END_DATE.toISOString()}`);
  console.log(`Chat ID: ${CHAT_ID || '(not set — send /start to bot)'}`);
  console.log('Sending reminders every hour on the hour.');
}
```

- [ ] **Step 2: Verify syntax**

Run:
```bash
node -c index.js
```

Expected: no output (no syntax errors)

- [ ] **Step 3: Commit**

```bash
git add index.js
git commit -m "feat: main bot with hourly cron and /start command"
```

---

### Task 4: Create GitHub Repo and Push

**Files:** None (git operations only)

- [ ] **Step 1: Create GitHub repo**

Run:
```bash
cd /c/Users/User/blessing-reminder-bot
gh repo create riffenconium/blessing-reminder-bot --public --source=. --remote=origin
```

- [ ] **Step 2: Push to GitHub**

Run:
```bash
git push -u origin main
```

If the branch is called `master`, use:
```bash
git push -u origin master
```

---

### Task 5: Set Up Telegram Bot and Test

**Files:** None (manual + test run)

- [ ] **Step 1: Create bot via @BotFather on Telegram**

Instructions for user:
1. Open Telegram, search for `@BotFather`
2. Send `/newbot`
3. Choose a name (e.g., "Blessing Reminder")
4. Choose a username (e.g., `blessing_reminder_77_bot`)
5. Copy the bot token

- [ ] **Step 2: Create .env file locally**

```bash
echo "TELEGRAM_BOT_TOKEN=<paste_token_here>" > .env
echo "TELEGRAM_CHAT_ID=" >> .env
echo "END_DATE=2026-05-11" >> .env
```

- [ ] **Step 3: Run bot to get chat ID**

Run:
```bash
node index.js
```

Then open Telegram, find the bot, send `/start`. The bot will reply with your chat ID. Copy it.

- [ ] **Step 4: Update .env with chat ID**

Add the chat ID to `.env`:
```
TELEGRAM_CHAT_ID=<your_chat_id>
```

- [ ] **Step 5: Test with TEST mode**

Run:
```bash
TEST=true node index.js
```

Expected: Bot sends one random message to your Telegram, then exits.

---

### Task 6: Deploy to Railway

**Files:** None (Railway configuration)

- [ ] **Step 1: Create Railway project**

Go to https://railway.app or use Railway CLI:
```bash
npx @railway/cli login
npx @railway/cli init
```

- [ ] **Step 2: Set environment variables in Railway**

Via CLI:
```bash
npx @railway/cli variables set TELEGRAM_BOT_TOKEN=<your_token>
npx @railway/cli variables set TELEGRAM_CHAT_ID=<your_chat_id>
npx @railway/cli variables set END_DATE=2026-05-11
```

Or set them in the Railway dashboard under the service's Variables tab.

- [ ] **Step 3: Deploy**

Railway auto-deploys from GitHub. Connect the `riffenconium/blessing-reminder-bot` repo in the Railway dashboard.

Or deploy via CLI:
```bash
npx @railway/cli up
```

- [ ] **Step 4: Verify deployment**

Check Railway logs to confirm:
```
Blessing Reminder Bot started!
Messages: 77
End date: 2026-05-11T00:00:00.000Z
Sending reminders every hour on the hour.
```

Wait for the next hour mark to confirm a message arrives in Telegram.

---

### Task 7: Final Commit and Cleanup

- [ ] **Step 1: Ensure everything is committed**

Run:
```bash
git status
```

If any uncommitted files:
```bash
git add -A
git commit -m "chore: final cleanup"
git push
```
