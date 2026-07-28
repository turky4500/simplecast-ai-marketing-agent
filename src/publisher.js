import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { config } from './config.js';

/**
 * Publishes/saves the generated marketing campaign.
 * @param {Object} episode 
 * @param {Object} campaign 
 */
export async function publishCampaign(episode, campaign) {
  console.log(`[Publisher] Processing distribution for [${episode.showTitle}] - "${episode.title}"...`);

  // 1. Save Markdown Campaign Artifact inside show-specific subfolder
  saveCampaignArtifact(episode, campaign);

  // 2. Publish to Telegram (if configured)
  if (config.telegramBotToken && config.telegramChatId) {
    await sendTelegramNotification(episode, campaign);
  }

  // 3. Publish to Buffer API (if configured)
  if (config.bufferAccessToken && config.bufferProfileIds.length > 0) {
    await sendToBuffer(episode, campaign);
  }

  console.log(`[Publisher] Finished output for [${episode.showTitle}] - "${episode.title}".`);
}

/**
 * Saves a local Markdown file per show inside campaigns/ShowName folder.
 */
function saveCampaignArtifact(episode, campaign) {
  const safeShowName = episode.showTitle.replace(/[^a-zA-Z0-01-90600-06FF]/g, '_').trim();
  const dir = path.join('./campaigns', safeShowName);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const safeTitle = episode.title.replace(/[^a-zA-Z0-01-90600-06FF]/g, '_').substring(0, 40);
  const filePath = path.join(dir, `campaign_${safeTitle}_${Date.now()}.md`);

  const mdContent = `
# 🚀 الحملة التسويقية للحلقة: ${episode.title}
**البودكاست**: ${episode.showTitle}  
**رابط الاستماع**: ${episode.link}  
**تاريخ النشر**: ${episode.pubDate}  

---

## 🧵 1. ثريدز لمنصة X (تويتر)
${campaign.twitterThread.map((tweet, i) => `### تغريدة ${i + 1}:\n${tweet}\n`).join('\n')}

---

## 🔍 2. مقال Google SEO لجذب المستمعين من البحث
**عنوان المقال**: ${campaign.googleSeoArticle.title}  
**Meta Description**: ${campaign.googleSeoArticle.metaDescription}  

### نص المقال:
${campaign.googleSeoArticle.contentMarkdown}

---

## 🎬 3. سيناريوهات مقاطع Reels / Shorts (بدون موسيقى ولا مؤثرات)
${campaign.shortVideoScripts.map((script, i) => `
### مقطع ${i + 1}: ${script.clipTitle}
- **وصف المشهد المرئي**: ${script.visualDescription}
- **النص الصوتي المباشر (صوت فقط)**: ${script.voiceoverScript}
- **النص على الشاشة**: ${script.onScreenText}
`).join('\n')}

---

## 💬 4. رسالة التلجرام / النشرة البريدية
${campaign.telegramPost}

---
  `;

  fs.writeFileSync(filePath, mdContent, 'utf8');
  console.log(`[Publisher] Saved campaign Markdown to: ${filePath}`);
}

async function sendTelegramNotification(episode, campaign) {
  if (config.dryRun) {
    console.log('[Publisher] Dry-run enabled. Skipping Telegram API call.');
    return;
  }

  const text = `
🎙️ **[${episode.showTitle}] - حلقة جديدة!**

**العنوان**: ${episode.title}
**الرابط**: ${episode.link}

---
📱 **أبرز تغريدات X**:
${campaign.twitterThread[0]}

---
📢 **رسالة المجتمعات**:
${campaign.telegramPost}
  `;

  try {
    const url = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.telegramChatId,
        text: text,
        parse_mode: 'Markdown'
      })
    });
    const result = await response.json();
    if (result.ok) {
      console.log('[Publisher] Posted to Telegram!');
    }
  } catch (error) {
    console.error('[Publisher] Error posting to Telegram:', error.message);
  }
}

async function sendToBuffer(episode, campaign) {
  if (config.dryRun) return;

  const firstTweet = `[${episode.showTitle}] ${campaign.twitterThread[0]}`;

  for (const profileId of config.bufferProfileIds) {
    try {
      await fetch('https://api.bufferapp.com/1/updates/create.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          access_token: config.bufferAccessToken,
          profile_ids: [profileId.trim()],
          text: firstTweet,
          now: false
        })
      });
    } catch (error) {
      console.error(`[Publisher] Error sending to Buffer profile ${profileId}:`, error.message);
    }
  }
}
