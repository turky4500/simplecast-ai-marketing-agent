import fs from 'fs';
import path from 'path';
import { fetchAllPodcastEpisodes } from './rssParser.js';
import { getProcessedEpisodes, markEpisodeAsProcessed } from './stateManager.js';
import { generateMarketingCampaign } from './aiAgent.js';
import { publishCampaign } from './publisher.js';
import { buildSeoWebsite } from './siteGenerator.js';
import { config } from './config.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('====================================================');
  console.log('🤖 Multi-Podcast Simplecast AI Marketing Agent & SEO Site Engine');
  console.log('====================================================');

  if (config.dryRun) {
    console.log('⚡ DRY RUN MODE ACTIVE. No external API posts will be sent.');
  }

  const memoryProcessedData = [];

  try {
    // 1. Fetch episodes across all configured podcast RSS feeds
    const allEpisodes = await fetchAllPodcastEpisodes();
    if (!allEpisodes || allEpisodes.length === 0) {
      console.log('[Main] No episodes found across configured podcast RSS feeds. Exiting.');
      return;
    }

    // 2. Read already processed episode GUIDs
    const processedGuids = getProcessedEpisodes();

    // 3. Find unprocessed episodes
    const unprocessedEpisodes = allEpisodes.filter(ep => !processedGuids.includes(ep.guid));

    console.log(`\n📊 Status Summary:`);
    console.log(`   - Total Podcast Shows: ${config.rssUrls.length}`);
    console.log(`   - Total Podcast Episodes: ${allEpisodes.length}`);
    console.log(`   - Already Marketed Episodes: ${processedGuids.length}`);
    console.log(`   - Remaining Backlog Episodes: ${unprocessedEpisodes.length}`);

    // 4. Take a batch of unprocessed episodes for this run
    const batchToProcess = unprocessedEpisodes.slice(0, config.batchSize);

    if (batchToProcess.length > 0) {
      console.log(`\n🚀 Starting batch processing of ${batchToProcess.length} episode(s) (Batch Size: ${config.batchSize})...\n`);

      for (let i = 0; i < batchToProcess.length; i++) {
        const episode = batchToProcess[i];
        console.log(`----------------------------------------------------`);
        console.log(`[Item ${i + 1}/${batchToProcess.length}] Podcast: "${episode.showTitle}" | Episode: "${episode.title}"`);
        console.log(`----------------------------------------------------`);

        try {
          // Generate AI Campaign
          const campaign = await generateMarketingCampaign(episode);

          // Publish / Save Artifact
          await publishCampaign(episode, campaign);

          // Add to memory list for website generator
          memoryProcessedData.push({ episode, campaign });

          // Update state file immediately
          markEpisodeAsProcessed(episode.guid);

          console.log(`✅ Finished episode ${i + 1}/${batchToProcess.length}.`);
        } catch (err) {
          console.error(`❌ Failed to process episode "${episode.title}":`, err.message);
        }

        // Respect rate limits with delay between items
        if (i < batchToProcess.length - 1) {
          console.log(`⏳ Waiting ${config.rateLimitDelayMs / 1000}s before processing next episode...`);
          await sleep(config.rateLimitDelayMs);
        }
      }
    }

    // Load any existing campaigns from ./campaigns to populate site fully
    const existingCampaigns = loadExistingCampaigns();
    const combinedData = [...memoryProcessedData, ...existingCampaigns];

    // Build/Update GitHub Pages SEO Website
    buildSeoWebsite(combinedData);

    console.log('\n====================================================');
    console.log(`🎉 Execution completed! Successfully processed batch & updated SEO Website.`);
    console.log('====================================================');

  } catch (error) {
    console.error('\n❌ Fatal error in execution pipeline:', error);
    process.exit(1);
  }
}

function loadExistingCampaigns() {
  const list = [];
  const campaignsDir = './campaigns';
  if (!fs.existsSync(campaignsDir)) return list;

  try {
    const showFolders = fs.readdirSync(campaignsDir);
    for (const folder of showFolders) {
      const folderPath = path.join(campaignsDir, folder);
      if (fs.statSync(folderPath).isDirectory()) {
        const files = fs.readdirSync(folderPath);
        for (const file of files) {
          if (file.endsWith('.md')) {
            const content = fs.readFileSync(path.join(folderPath, file), 'utf8');
            const titleMatch = content.match(/الحملة التسويقية للحلقة:\s*(.*)/);
            const title = titleMatch ? titleMatch[1].trim() : file.replace('.md', '');
            const showTitle = folder.replace(/_/g, ' ');
            
            list.push({
              episode: {
                title: title,
                showTitle: showTitle,
                link: 'https://simplecast.com',
                pubDate: 'المستمر',
                description: title
              },
              campaign: {
                googleSeoArticle: {
                  title: title,
                  contentMarkdown: content
                },
                highlightsSummary: title
              }
            });
          }
        }
      }
    }
  } catch (e) {
    console.warn('Warning loading existing campaigns:', e.message);
  }
  return list;
}

main();
