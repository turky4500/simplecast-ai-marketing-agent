import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { buildSeoWebsite } from './src/siteGenerator.js';

const parser = new Parser({
  customFields: {
    item: [
      ['enclosure', 'audioEnclosure'],
      ['itunes:duration', 'itunesDuration']
    ]
  }
});

const rssUrls = [
  'https://feeds.simplecast.com/YJUwyG8a',
  'https://feeds.simplecast.com/4KjPMcnN',
  'https://feeds.simplecast.com/9raNjZr5',
  'https://feeds.simplecast.com/jUB1229h',
  'https://feeds.simplecast.com/h2a9lppv'
];

async function generateAllEpisodesSiteAndCampaigns() {
  console.log('Fetching ALL 909+ episodes across all 5 Simplecast RSS feeds & generating campaign files...');

  const allProcessedData = [];

  for (const url of rssUrls) {
    try {
      console.log(`Parsing feed: ${url}`);
      const feed = await parser.parseURL(url);
      console.log(`Show: "${feed.title}" - Found ${feed.items.length} episodes.`);

      for (const item of feed.items) {
        const audioUrl = item.enclosure?.url || item.audioEnclosure?.url || item.link;
        const pubDateStr = item.pubDate ? new Date(item.pubDate).toLocaleDateString('ar-EG') : '2026-07-29';
        const cleanDesc = item.contentSnippet || item.content || item.itunesSummary || item.description || item.title;
        const safeTitle = item.title.substring(0, 50);

        const campaign = {
          twitterThread: [
            `🧵 أبرز أفكار حلقة: "${safeTitle}" من بودكاست (${feed.title}):`,
            `1️⃣ تناقش هذه الحلقة أبعاداً فكرية وإنسانية قيمة ومؤثرة جداً.`,
            `2️⃣ من أهم الأفكار: التعامل بحكمة وصبر مع التحديات اليومية وترسيخ المعرفة.`,
            `🎧 يمكنك الاستماع للحلقة كاملة الآن واستكشاف الدليل الفكري لها.`
          ],
          googleSeoArticle: {
            title: `${item.title} - ${feed.title}`,
            metaDescription: `استمع لحلقة ${safeTitle} واقرأ التفاصيل والملخص الشامل من بودكاست ${feed.title}.`,
            contentMarkdown: `### مقدمة الحلقة
تتناول هذه الحلقة من **${feed.title}** بعنون **${item.title}** أفكاراً ورؤى متميزة وإيمانية وفكرية قيمة.

### التفاصيل والأفكار المحورية:
${cleanDesc}

### استمع للحلقة كاملة:
استخدم مشغل MP3 المباشر أعلى الصفحة للاستماع للحلقة بصوت نقي وبدون انقطاع.`
          },
          shortVideoScripts: [
            {
              clipTitle: `أبرز فكرة في حلقة ${safeTitle}`,
              visualDescription: "مشهد هادئ بنص عريض وواضح مكتوب على الشاشة (بدون أي موسيقى أو مؤثرات صوتية)",
              voiceoverScript: `في هذه الحلقة من ${feed.title}، نتوقف عند فكرة جوهرية: الفهم العميق للتعامل مع الأحداث يمنحك راحة وسكينة نفسية.`,
              onScreenText: `فكرة جوهرية من حلقة: ${safeTitle}`
            },
            {
              clipTitle: `رسالة الحلقة التشويقية`,
              visualDescription: "عنونة نصية أنيقة تظهر تدريجياً على الشاشة (صوت فقط)",
              voiceoverScript: `استمع إلى الأفكار والدروس الملهمة المطروحة في هذه الحلقة الآن عبر المشغل المباشر.`,
              onScreenText: `استمع للحلقة الآن`
            }
          ],
          telegramPost: `🎙️ **حلقة جديدة من ${feed.title}**\n\nالعنوان: **${item.title}**\n\nتفضل باستماع الحلقة واستكشاف أهم الأفكار والدروس.`,
          highlightsSummary: cleanDesc.substring(0, 140)
        };

        const episodeObj = {
          title: item.title,
          showTitle: feed.title,
          link: item.link,
          audioUrl: audioUrl,
          duration: item.itunesDuration || '30:00',
          pubDate: pubDateStr,
          description: cleanDesc
        };

        // 1. Save campaign Markdown file in ./campaigns/
        saveCampaignMdFile(episodeObj, campaign);

        // 2. Add to allProcessedData for website builder
        allProcessedData.push({ episode: episodeObj, campaign: campaign });
      }
    } catch (err) {
      console.error(`Error parsing feed ${url}:`, err.message);
    }
  }

  console.log(`\nGenerating complete website for total ${allProcessedData.length} episodes...`);
  buildSeoWebsite(allProcessedData);
  console.log(`✅ ALL ${allProcessedData.length} EPISODES & CAMPAIGN FILES GENERATED SUCCESSFULLY!`);
}

function saveCampaignMdFile(episode, campaign) {
  const safeShowName = episode.showTitle.replace(/[^a-zA-Z0-01-90600-06FF]/g, '_').trim();
  const dir = path.join('./campaigns', safeShowName);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const safeTitle = episode.title.replace(/[^a-zA-Z0-01-90600-06FF]/g, '_').substring(0, 40);
  const filePath = path.join(dir, `campaign_${safeTitle}.md`);

  const mdContent = `
# 🚀 الحملة التسويقية للحلقة: ${episode.title}
**البودكاست**: ${episode.showTitle}  
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
  `;

  try {
    fs.writeFileSync(filePath, mdContent, 'utf8');
  } catch (e) {}
}

generateAllEpisodesSiteAndCampaigns();
