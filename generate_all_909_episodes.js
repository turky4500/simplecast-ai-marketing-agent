import Parser from 'rss-parser';
import fs from 'fs';
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

async function generateAllEpisodesSite() {
  console.log('Fetching ALL 909+ episodes across all 5 Simplecast RSS feeds...');

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

        allProcessedData.push({
          episode: {
            title: item.title,
            showTitle: feed.title,
            link: item.link,
            audioUrl: audioUrl,
            duration: item.itunesDuration || '30:00',
            pubDate: pubDateStr,
            description: cleanDesc
          },
          campaign: {
            googleSeoArticle: {
              title: `${item.title} - ${feed.title}`,
              metaDescription: `استمع لحلقة ${item.title} واقرأ التفاصيل والملخص الشامل من بودكاست ${feed.title}.`,
              contentMarkdown: `### مقدمة الحلقة
تتناول هذه الحلقة من **${feed.title}** بعنون **${item.title}** أفكاراً ورؤى متميزة وإيمانية وفكرية قيمة.

### التفاصيل:
${cleanDesc}`
            },
            highlightsSummary: cleanDesc.substring(0, 140)
          }
        });
      }
    } catch (err) {
      console.error(`Error parsing feed ${url}:`, err.message);
    }
  }

  console.log(`\nGenerating complete website for total ${allProcessedData.length} episodes...`);
  buildSeoWebsite(allProcessedData);
  console.log(`✅ ALL ${allProcessedData.length} EPISODES GENERATED SUCCESSFULLY WITH DIRECT MP3 PLAYERS!`);
}

generateAllEpisodesSite();
