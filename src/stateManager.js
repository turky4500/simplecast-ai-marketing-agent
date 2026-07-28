import fs from 'fs';
import { config } from './config.js';

/**
 * Reads the list of already processed episode GUIDs.
 * @returns {Array<string>} Array of episode GUIDs
 */
export function getProcessedEpisodes() {
  try {
    if (fs.existsSync(config.stateFilePath)) {
      const data = fs.readFileSync(config.stateFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('[State Manager] Warning reading state file, starting fresh:', error.message);
  }
  return [];
}

/**
 * Saves an episode GUID to the state file.
 * @param {string} episodeGuid 
 */
export function markEpisodeAsProcessed(episodeGuid) {
  const processed = getProcessedEpisodes();
  if (!processed.includes(episodeGuid)) {
    processed.push(episodeGuid);
    fs.writeFileSync(config.stateFilePath, JSON.stringify(processed, null, 2), 'utf8');
    console.log(`[State Manager] Episode marked as processed & saved to ${config.stateFilePath}: ${episodeGuid}`);
  }
}
