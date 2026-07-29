import dotenv from 'dotenv';
dotenv.config();

// Parse RSS URLs (supports comma-separated list of multiple podcast feeds)
const getRssUrls = () => {
  const rawUrls = process.env.SIMPLECAST_RSS_URLS || process.env.SIMPLECAST_RSS_URL || '';
  return rawUrls
    .split(',')
    .map(url => url.trim())
    .filter(url => url.length > 0);
};

export const config = {
  // Array of Simplecast RSS Feed URLs (Supports 1 or multiple shows)
  rssUrls: getRssUrls(),

  // Gemini API Key
  geminiApiKey: process.env.GEMINI_API_KEY || '',

  // Maximum episodes to process per run (batch size)
  batchSize: parseInt(process.env.BATCH_SIZE || '3', 10),

  // Delay in milliseconds between processing episodes to respect 5 RPM limit (13 seconds)
  rateLimitDelayMs: parseInt(process.env.RATE_LIMIT_DELAY_MS || '13000', 10),

  // Buffer API Access Token (Optional)
  bufferAccessToken: process.env.BUFFER_ACCESS_TOKEN || '',
  bufferProfileIds: process.env.BUFFER_PROFILE_IDS ? process.env.BUFFER_PROFILE_IDS.split(',') : [],

  // Telegram Bot Token & Chat ID (Optional)
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',

  // Dry run mode
  dryRun: process.env.DRY_RUN === 'true' || process.argv.includes('--dry-run'),

  // State tracker path
  stateFilePath: './processed_episodes.json'
};
