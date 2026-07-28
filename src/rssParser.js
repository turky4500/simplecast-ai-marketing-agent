import Parser from 'rss-parser';
import { config } from './config.js';

const parser = new Parser({
  customFields: {
    item: [
      ['itunes:summary', 'itunesSummary'],
      ['itunes:explicit', 'itunesExplicit'],
      ['itunes:duration', 'itunesDuration'],
      ['itunes:image', 'itunesImage'],
      ['enclosure', 'audioEnclosure']
    ]
  }
});

/**
 * Fetches and parses episodes from ALL configured Simplecast RSS feeds.
 * @returns {Promise<Array>} Array of parsed episode objects across all podcasts
 */
export async function fetchAllPodcastEpisodes() {
  if (!config.rssUrls || config.rssUrls.length === 0) {
    throw new Error('No podcast RSS URLs configured. Please set SIMPLECAST_RSS_URLS in environment variables.');
  }

  console.log(`[RSS Parser] Processing ${config.rssUrls.length} podcast show(s)...`);
  
  const allEpisodes = [];

  for (const rssUrl of config.rssUrls) {
    try {
      console.log(`[RSS Parser] Fetching feed: ${rssUrl}`);
      const feed = await parser.parseURL(rssUrl);
      console.log(`[RSS Parser] Show: "${feed.title}" - Total episodes found: ${feed.items.length}`);

      const parsedItems = feed.items.map((item, index) => {
        const audioUrl = item.enclosure?.url || item.audioEnclosure?.url || '';
        return {
          guid: item.guid || item.id || item.link || `${feed.title}_${index}`,
          title: item.title,
          pubDate: item.pubDate,
          link: item.link,
          description: item.contentSnippet || item.content || item.itunesSummary || item.description || '',
          audioUrl: audioUrl,
          duration: item.itunesDuration || 'N/A',
          showTitle: feed.title || 'Podcast Show',
          showLink: feed.link || ''
        };
      });

      allEpisodes.push(...parsedItems);
    } catch (error) {
      console.error(`[RSS Parser] Error fetching feed (${rssUrl}):`, error.message);
    }
  }

  console.log(`[RSS Parser] Total combined episodes across all shows: ${allEpisodes.length}`);
  return allEpisodes;
}
