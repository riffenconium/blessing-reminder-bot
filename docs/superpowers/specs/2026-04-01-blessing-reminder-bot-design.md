# Blessing Reminder Telegram Bot — Design Spec

## Overview

A Telegram bot that sends hourly spiritual reminders — counting blessings, making grand intentions, Naqshbandi adab — 24/7 for a configurable duration (default 40 days). Deployed on Railway.

## Stack

- **Runtime:** Node.js
- **Telegram:** `node-telegram-bot-api`
- **Scheduling:** `node-cron`
- **Hosting:** Railway (auto-deploy on push)
- **Timezone:** Asia/Singapore (UTC+8)

## Architecture

Single-file app with minimal dependencies:

```
blessing-reminder-bot/
├── index.js          # Main app: cron job + bot setup
├── messages.json     # 77 curated messages
├── config.js         # Configuration (end date, timezone)
├── package.json
├── .env              # TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
└── .gitignore
```

## How It Works

1. On startup, the app initializes the Telegram bot and starts a cron job that fires every hour on the hour.
2. Each tick:
   - Check if current date (SGT) is past `END_DATE`. If yes, send a final completion message and stop the cron job.
   - Otherwise, pick a random message from `messages.json` (no back-to-back repeats).
   - Send it to the configured `TELEGRAM_CHAT_ID`.
3. On first message to the bot (`/start`), it replies with the chat ID so the user can easily configure it.

## Configuration

Environment variables (set in Railway dashboard):

| Variable | Description | Example |
|----------|-------------|---------|
| `TELEGRAM_BOT_TOKEN` | From @BotFather | `123456:ABC-DEF...` |
| `TELEGRAM_CHAT_ID` | Your personal chat ID | `987654321` |
| `END_DATE` | ISO date string, when to stop sending | `2026-05-11` |

`END_DATE` defaults to 40 days from first deploy if not set. Easily changeable in Railway dashboard to extend or shorten.

## Messages

77 curated messages across 5 categories:
- **Small blessings / Shukr** (20) — everyday gratitude: tea, pillow, eyesight, clean water, shoes, air conditioning
- **Grand intentions / Himma** (18) — Mawlana-style: spread Islam to all corners, build mosques in every settlement, every breath recite Quran, every breath out thank Allah as many as raindrops
- **Naqshbandi adab & principles** (8) — hosh dar dam, rabita, khalwat dar anjuman, adab
- **Dhikr & remembrance** (6) — la ilaha illAllah, salawat, istighfar
- **Tawakkul & general reminders** (4) — trust, kindness, tawbah
- **Additional blessings** (12) — toothbrush, bed sheets, eyesight, internet, memory
- **Additional grand intentions** (12) — oceans of dhikr, unite the Ummah, rivers in Jannah
- **Additional Naqshbandi** (3) — khalwat dar anjuman, Mawlana quote, hour reminder

Selection: Random with no back-to-back repeat (track last sent index).

## Setup Steps (One-Time)

1. Create bot via Telegram @BotFather → get token
2. Message the bot → use `/start` to get chat ID
3. Set env vars in Railway
4. Deploy

## Completion Behavior

When `END_DATE` is reached, the bot sends:
> "40 days complete! Alhamdulillah. Your journey of remembrance continues — with or without this bot, keep counting your blessings and making grand intentions. Ya Rabbi, accept it from us!"

Then the cron job stops. The app stays running (Railway) so it can be restarted with a new end date.

## Error Handling

- If Telegram API fails, log the error and continue — next hour will retry naturally.
- If `END_DATE` is not set, default to 40 days from current date.

## Testing

- Run locally with `node index.js` to verify bot sends a message immediately on startup (test mode).
- Pass `TEST=true` env var to send one message immediately and exit.

## Cost

- Telegram Bot API: Free
- Railway: Free tier (sufficient for a single cron-based app)
- Total: $0
