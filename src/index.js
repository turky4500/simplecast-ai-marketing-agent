import { fetchAllPodcastEpisodes } from './rssParser.js';
import { getProcessedEpisodes, markEpisodeAsProcessed } from './stateManager.js';
import { generateMarketingCampaign } from './aiAgent.js';
import { publishCampaign } from './publisher.js';
import { config } from './config.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('====================================================');
  console.log('🤖 Multi-Podcast Simplecast AI Marketing Agent');
  console.log('====================================================');

  if (config.dryRun) {
    console.log('⚡ DRY RUN MODE ACTIVE. No external API posts will be sent.');
  }

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

    if (unprocessedEpisodes.length === 0) {
      console.log('\n🎉 All episodes across all 4 podcast shows have been processed! Everything is caught up.');
      return;
    }

    // 4. Take a batch of unprocessed episodes for this run (e.g. 5 episodes per run)
    const batchToProcess = unprocessedEpisodes.slice(0, config.batchSize);

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

        // Update state file immediately
        markEpisodeAsProcessed(episode.guid);

        console.log(`✅ Finished episode ${i + 1}/${batchToProcess.length}.`);
      } catch (err) {
        console.error(`❌ Failed to process episode "${episode.title}":`, err.message);
      }

      // Respect Gemini API Free Tier rate limits with a small delay between requests
      if (i < batchToProcess.length - 1) {
        console.log(`⏳ Waiting ${config.rateLimitDelayMs / 1000}s before processing next episode...`);
        await sleep(config.rateLimitDelayMs);
      }
    }

    console.log('\n====================================================');
    console.log(`🎉 Batch execution completed! Successfully processed ${batchToProcess.length} episode(s).`);
    console.log(`📌 Remaining backlog: ${unprocessedEpisodes.length - batchToProcess.length} episode(s).`);
    console.log('   The next GitHub Actions run will automatically continue processing the remaining backlog.');
    console.log('====================================================');

  } catch (error) {
    console.error('\n❌ Fatal error in execution pipeline:', error);
    process.exit(1);
  }
}

main();
