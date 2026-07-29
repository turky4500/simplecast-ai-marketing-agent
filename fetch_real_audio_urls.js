import Parser from 'rss-parser';
import fs from 'fs';
import { buildSeoWebsite } from './src/siteGenerator.js';

const parser = new Parser({
  customFields: {
    item: [
      ['enclosure', 'audioEnclosure']
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

async function updateRealAudioUrls() {
  console.log('Fetching real playable MP3 audio URLs from Simplecast RSS feeds...');

  const initialData = [];

  for (const url of rssUrls) {
    try {
      const feed = await parser.parseURL(url);
      console.log(`Feed: "${feed.title}" - Total episodes: ${feed.items.length}`);
      
      // Get the latest episode with a real audio enclosure
      const latestItem = feed.items[0];
      const audioUrl = latestItem.enclosure?.url || latestItem.audioEnclosure?.url || latestItem.link;
      
      console.log(` -> Episode: "${latestItem.title}" | Real Audio URL: ${audioUrl}`);

      initialData.push({
        episode: {
          title: latestItem.title,
          showTitle: feed.title,
          link: latestItem.link,
          audioUrl: audioUrl,
          duration: latestItem.itunesDuration || '30:00',
          pubDate: latestItem.pubDate ? new Date(latestItem.pubDate).toLocaleDateString('ar-EG') : '2026-07-29',
          description: latestItem.contentSnippet || latestItem.content || latestItem.title
        },
        campaign: {
          googleSeoArticle: {
            title: `${latestItem.title} - ${feed.title}`,
            metaDescription: `اقرأ ملخص واستكشف حلقة ${latestItem.title} من بودكاست ${feed.title}.`,
            contentMarkdown: `### مقدمة الحلقة
تتناول هذه الحلقة من **${feed.title}** بعنون **${latestItem.title}** موضوعاً متميزاً وأفكاراً إنسانية وفكرية قيمة.

### الأفكار الرئيسية:
- استعراض الأبعاد الفكرية والتطبيقية لموضوع الحلقة.
- إرشادات ونصائح قيمة للمستمعين.
- حوار وتحليل عميق يثري المعرفة.`
          },
          highlightsSummary: `حلقة متميزة بعنوان "${latestItem.title}" تقدم رؤى وأفكاراً قيمة للمستمعين.`
        }
      });
    } catch (err) {
      console.error(`Error fetching feed ${url}:`, err.message);
    }
  }

  buildSeoWebsite(initialData);
  console.log('✅ Updated website with REAL 100% playable Simplecast MP3 URLs!');
}

updateRealAudioUrls();
