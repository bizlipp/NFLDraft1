// data-service.js

// Cache variable to store the player data after it's fetched
let cachedPlayers = null;
let fetchPromise = null;

/**
 * Gets player data, either from cache or by fetching it
 * @returns {Promise<Array>} Promise that resolves to the player data array
 */
export async function getPlayerData() {
  // If we already have the data cached, return it immediately
  if (cachedPlayers !== null) {
    return cachedPlayers;
  }
  
  // If a fetch is already in progress, return that promise
  if (fetchPromise !== null) {
    return fetchPromise;
  }
  
  // Otherwise, fetch the data
  console.log("Fetching player data from central data service...");
  
  // Get the base URL for GitHub Pages compatibility
  const baseUrl = window.location.href.includes('github.io') 
    ? '/NFLDraft1' // GitHub Pages repository name
    : '';
    
  fetchPromise = fetch(`${baseUrl}/data/nfl_players_2025_enriched_full_final.json`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log(`✅ Loaded ${data.length} players from centralized data service`);
      cachedPlayers = data;
      fetchPromise = null; // Reset the promise
      return data;
    })
    .catch(error => {
      console.error("Error in centralized data fetching:", error);
      fetchPromise = null; // Reset the promise so future attempts can retry
      throw error; // Re-throw so the caller can handle the error
    });
  
  return fetchPromise;
}

/**
 * Gets a specific player by ID
 * @param {string|number} playerId - The player ID to look for
 * @returns {Promise<Object|null>} Promise that resolves to the player object or null if not found
 */
export async function getPlayerById(playerId) {
  const players = await getPlayerData();
  return players.find(player => player.playerId == playerId) || null;
}

/**
 * Gets players filtered by a predicate function
 * @param {Function} filterFn - Function that takes a player and returns true/false
 * @returns {Promise<Array>} Promise that resolves to filtered array of players
 */
export async function getFilteredPlayers(filterFn) {
  const players = await getPlayerData();
  return players.filter(filterFn);
}

/**
 * Refreshes the cached data by forcing a new fetch
 * @returns {Promise<Array>} Promise that resolves to the fresh player data
 */
export async function refreshPlayerData() {
  cachedPlayers = null;
  fetchPromise = null;
  return getPlayerData();
} 