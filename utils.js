// utils.js

/**
 * Gets a cleaned experience string for a player.
 * Prioritizes experience_years, then experience_years_alt, then experience.
 * @param {Object} player - The player object.
 * @returns {string} The experience string or 'N/A'.
 */
export function getCleanExperience(player) {
  if (!player) return 'N/A';
  return player.experience_years ?? player.experience_years_alt ?? player.experience ?? 'N/A';
}

/**
 * Gets formatted height and weight strings for a player.
 * Uses physical_height_str and physical_weight_lbs.
 * @param {Object} player - The player object.
 * @returns {{height: string, weight: string}} Object with height and weight strings.
 */
export function getFormattedHeightWeight(player) {
  if (!player) return { height: '-', weight: '-' };
  const height = player.physical_height_str || '-';
  const weight = player.physical_weight_lbs ? `${player.physical_weight_lbs} lbs` : '-';
  return { height, weight };
}

/**
 * Generates HTML for player tags based on a configuration.
 * @param {Array<string>} playerTags - Array of tag keys from the player object.
 * @param {Object} tagDisplayConfig - Configuration object mapping tag keys to display names and styles.
 * @returns {string} HTML string of tag badges.
 */
export function getTagBadgesHtml(playerTags, tagDisplayConfig) {
  if (!playerTags || playerTags.length === 0 || !tagDisplayConfig) {
    return ''; // Or a default like '<span class="text-xs px-2 py-1 bg-gray-500 text-white rounded-full">Unscouted</span>'
  }

  return playerTags
    .map(tagKey => {
      // Normalize the tagKey from player data (e.g., "injuryrisk", "starterforward")
      // to match keys in tagDisplayConfig (e.g., "injuryrisk", "starterforward")
      const normalizedTagKey = tagKey.toLowerCase().replace(/[^a-zA-Z0-9]/g, "");
      const config = tagDisplayConfig[normalizedTagKey];
      if (config) {
        return `<span class="text-xs px-2 py-1 ${config.style} rounded-full">${config.displayName}</span>`;
      }
      // Fallback for tags in player data but not in config (optional)
      // return `<span class="text-xs px-2 py-1 bg-gray-400 text-white rounded-full">${tagKey}</span>`;
      return ''; 
    })
    .filter(Boolean)
    .join('');
}

/**
 * Defines the standard tag display configuration.
 * This can be imported and used by different modules.
 */
export const standardTagDisplayConfig = {
  "sleeper": { displayName: "🔥 Sleeper", style: "bg-blue-600 text-white" },
  "trending": { displayName: "📈 Trending", style: "bg-green-500 text-white" },
  "injuryrisk": { displayName: "🚑 Injury Risk", style: "bg-red-600 text-white" },
  "valuepick": { displayName: "💰 Value Pick", style: "bg-purple-600 text-white" },
  "starterforward": { displayName: "🚀 Starter Forward", style: "bg-yellow-400 text-gray-900" },
  "bye_week_risk": { displayName: "🗓️ Bye Week Risk", style: "bg-orange-500 text-white" }, // Generic bye risk
  "injury_prone": { displayName: "🩹 Injury Prone", style: "bg-red-700 text-white"},
  "unscouted": { displayName: "❔ Unscouted", style: "bg-gray-500 text-white" }
  // Add more specific bye week risk handling if needed, or parse it separately from flags
};

/**
 * Generates HTML for player flags.
 * @param {Array<string>} playerFlags - Array of flag strings from the player object.
 * @returns {string} HTML string of flag icons/badges.
 */
export function getFlagIconsHtml(playerFlags) {
    if (!playerFlags || playerFlags.length === 0) {
        return '';
    }

    let html = '';
    playerFlags.forEach(flag => {
        const lowerFlag = flag.toLowerCase();
        if (lowerFlag.includes('bye_week_risk')) {
            // Extract team and week if possible, e.g., "bye_week_risk_KC_W10"
            const parts = flag.split('_');
            const week = parts.length > 3 ? parts.pop() : 'W?'; // Get last part as week
            // const team = parts.length > 3 ? parts.pop() : ''; // if team is also needed
            html += `<span title="Bye Week ${week.toUpperCase()}" class="player-flag-icon text-xs px-1.5 py-0.5 bg-orange-500 text-white rounded-full mr-1">🗓️ ${week.toUpperCase()}</span>`;
        } else if (lowerFlag.includes('injury_prone')) {
            html += `<span title="Injury Prone" class="player-flag-icon text-xs px-1.5 py-0.5 bg-red-700 text-white rounded-full mr-1">🩹</span>`;
        } else if (lowerFlag.includes('suspension_risk')) {
            html += `<span title="Suspension Risk" class="player-flag-icon text-xs px-1.5 py-0.5 bg-yellow-600 text-white rounded-full mr-1">⚖️</span>`;
        }
        // Add more flag conditions here
    });
    return html;
} 