// Logic to load player data by playerId
// player-page.js
import { getCleanExperience, getFormattedHeightWeight, getTagBadgesHtml, standardTagDisplayConfig, getFlagIconsHtml } from './utils.js';
import { getPlayerById } from './data-service.js';
import { addToSquad, getSquad } from './my-squad.js';
import { initializeHeader } from './header-nav.js';

document.addEventListener("DOMContentLoaded", () => {
  // Initialize the consistent header
  initializeHeader('');  // No active nav item since player page is not a main nav item

  const container = document.getElementById("player-card");
  const params = new URLSearchParams(window.location.search);
  const playerId = params.get("id");

  if (!playerId) {
    container.innerHTML = "<p class='text-center text-red-400'>Missing player ID</p>";
  } else {
    // Show loading state
    container.innerHTML = `
      <div class="bg-gray-800 p-6 rounded-xl shadow-lg text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
        <p class="text-cyan-400 text-lg">Loading player details...</p>
      </div>
    `;

    // Use our data service
    getPlayerById(playerId)
      .then(player => {
        if (!player) {
          container.innerHTML = "<p class='text-center text-red-400'>Player not found. <a href='dashboard.html' class='text-cyan-400 hover:underline'>Back to Dashboard</a></p>";
          return;
        }

        const { height, weight } = getFormattedHeightWeight(player);
        const experience = getCleanExperience(player);
        let playerTagsHtml = getTagBadgesHtml(player.tags, standardTagDisplayConfig);
        if (!player.tags || player.tags.length === 0) {
          playerTagsHtml = getTagBadgesHtml(['unscouted'], standardTagDisplayConfig); // Default tag
        }
        const playerFlagsHtml = getFlagIconsHtml(player.flags);
        const aiCommentary = player.aiCommentary || "No specific commentary available for this player yet. Monitor news and camp reports.";

        container.innerHTML = `
          <div class="bg-gray-800 p-6 rounded-xl shadow-lg">
            <div class="flex flex-col md:flex-row gap-6">
              <img src="${player.headshot || './AeroVista-Logo.png'}" alt="Headshot" class="w-32 h-32 rounded-full border-4 border-cyan-400 object-cover" />
              <div>
                <h1 class="text-3xl font-bold text-cyan-400">${player.name}</h1>
                <div class="text-gray-400 text-sm">${player.position} • ${player.team} ${player.number ? `#${player.number}` : ''}</div>
                <div class="mt-2 flex gap-x-2 gap-y-1 flex-wrap">
                  ${playerTagsHtml}
                </div>
                <div class="mt-2 flex gap-x-2 gap-y-1 flex-wrap">
                  ${playerFlagsHtml}
                </div>
              </div>
            </div>

            <div class="mt-6">
              <h2 class="text-lg font-semibold text-white">📝 AI Commentary</h2>
              <div class="bg-gray-750 p-4 rounded-lg mt-1">
                <p class="text-sm text-gray-300 italic">${aiCommentary}</p>
              </div>
            </div>

            <div class="mt-6">
              <h2 class="text-lg font-semibold text-white">📊 Key Stats (2024)</h2>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mt-2">
                <div class="bg-gray-750 p-3 rounded-lg">
                  <div class="text-xl font-bold">${player.stats?.['2024']?.passingYards ?? player.stats?.['2024']?.rushingYards ?? player.stats?.['2024']?.receivingYards ?? '-'}</div>
                  <div class="text-xs text-gray-400">Yards</div>
                </div>
                <div class="bg-gray-750 p-3 rounded-lg">
                  <div class="text-xl font-bold">${player.stats?.['2024']?.touchdowns ?? '-'}</div>
                  <div class="text-xs text-gray-400">TDs</div>
                </div>
                <div class="bg-gray-750 p-3 rounded-lg">
                  <div class="text-xl font-bold">${player.stats?.['2024']?.interceptions ?? '-'}</div>
                  <div class="text-xs text-gray-400">INTs</div>
                </div>
                <div class="bg-gray-750 p-3 rounded-lg">
                  <div class="text-xl font-bold">${player.fantasy?.pprPoints?.toFixed(1) ?? '-'}</div>
                  <div class="text-xs text-gray-400">Fantasy Pts (PPR)</div>
                </div>
              </div>
            </div>

            <!-- Chart for visualization -->
            <div class="mt-6">
              <h2 class="text-lg font-semibold text-white">📈 Performance Trend</h2>
              <div class="bg-gray-750 p-3 rounded-lg mt-2 h-64" id="performance-chart">
                <div class="flex justify-center items-center h-full text-gray-400 text-sm">
                  Loading performance chart...
                </div>
              </div>
            </div>

            <div class="mt-6">
              <h2 class="text-lg font-semibold text-white">🧠 Bio</h2>
              <div class="bg-gray-750 p-4 rounded-lg mt-2">
                <ul class="text-sm text-gray-300 list-none space-y-1">
                  <li><strong>College:</strong> ${player.college || 'N/A'}</li>
                  <li><strong>Height/Weight:</strong> ${height} / ${weight}</li>
                  <li><strong>Age:</strong> ${player.age || 'N/A'}</li>
                  <li><strong>Birthplace:</strong> ${player.birthplace || 'N/A'}</li>
                  <li><strong>Draft Info:</strong> ${player.draftInfo || 'N/A'}</li>
                  <li><strong>Experience:</strong> ${experience}</li>
                </ul>
              </div>
            </div>
            
            <div class="mt-6">
               <h2 class="text-lg font-semibold text-white">📅 Past Seasons</h2>
               <div id="historical-stats-container" class="bg-gray-750 p-4 rounded-lg mt-2 text-sm text-gray-300">
                 <div class="flex justify-center items-center">
                   <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-cyan-500 mr-3"></div>
                   <span>Loading historical stats...</span>
                 </div>
               </div>
            </div>

            <div class="mt-6 flex flex-wrap gap-3">
              <button id="add-to-squad-btn" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm">Add to My Squad</button>
              <button id="compare-players-btn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm">Compare with Player</button>
              <a href="flashcards.html" class="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-xl text-sm">Test Your Knowledge</a>
            </div>
          </div>
        `;
        
        // Populate historical stats
        populateHistoricalStats(player);
        
        // Initialize performance chart
        initializePerformanceChart(player);

        // Add to squad button listener
        initializeAddToSquadButton(player);
        
        // Compare player button
        initializeCompareButton(player);
      })
      .catch(error => {
        console.error("Error loading player data for player page:", error);
        if (container) {
          container.innerHTML = `
            <div class="bg-gray-800 p-6 rounded-xl shadow-lg text-center">
              <div class="text-red-500 text-lg mb-4">Error loading player details</div>
              <div class="text-gray-300 mb-4">${error.message}</div>
              <a href='dashboard.html' class='text-cyan-400 hover:underline'>Back to Dashboard</a>
            </div>
          `;
        }
      });
  }
});

/**
 * Populates the historical stats section
 * @param {Object} player - The player data object
 */
function populateHistoricalStats(player) {
  const historicalStatsContainer = document.getElementById('historical-stats-container');
  if (!historicalStatsContainer) return;
  
  if (player.stats && Object.keys(player.stats).length > 0) {
    let statsHtml = '<div class="overflow-x-auto"><table class="min-w-full divide-y divide-gray-700"><thead class="bg-gray-800"><tr><th class="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase">Year</th><th class="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase">Team</th><th class="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase">Games</th><th class="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase">Stats Summary</th></tr></thead><tbody class="divide-y divide-gray-700">';
    
    // Sort years, most recent first, but after specific seasons like '2024' or 'career'
    const sortedYears = Object.keys(player.stats).sort((a, b) => {
      if (a === 'career') return 1;
      if (b === 'career') return -1;
      if (a === '2024') return -1; // Ensure 2024 is high if present
      if (b === '2024') return 1;
      return parseInt(b) - parseInt(a); // Sort numerically descending for other years
    });

    for (const year of sortedYears) {
      if (year === '2024') continue; // Already displayed in key stats
      const yearStats = player.stats[year];
      let summary = [];
      
      // Add more stats as they become relevant and available
      if(yearStats.passingYards) summary.push(`Pass Yds: ${yearStats.passingYards}`);
      if(yearStats.rushingYards) summary.push(`Rush Yds: ${yearStats.rushingYards}`);
      if(yearStats.receivingYards) summary.push(`Rec Yds: ${yearStats.receivingYards}`);
      if(yearStats.touchdowns) summary.push(`TDs: ${yearStats.touchdowns}`);
      if(yearStats.interceptions) summary.push(`INTs: ${yearStats.interceptions}`);
      if(yearStats.catches) summary.push(`Catches: ${yearStats.catches}`);

      // Alternate row colors for better readability
      const rowClass = sortedYears.indexOf(year) % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700';
      statsHtml += `<tr class="${rowClass}"><td class="px-3 py-2">${year}</td><td class="px-3 py-2">${yearStats.teamRoster || player.team}</td><td class="px-3 py-2">${yearStats.gamesPlayed || '-'}</td><td class="px-3 py-2">${summary.join(', ') || 'N/A'}</td></tr>`;
    }
    
    statsHtml += '</tbody></table></div>';
    historicalStatsContainer.innerHTML = statsHtml;
  } else {
    historicalStatsContainer.innerHTML = "<p class='text-center italic'>No detailed historical season data available.</p>";
  }
}

/**
 * Initializes the performance chart visualization
 * @param {Object} player - The player data object
 */
function initializePerformanceChart(player) {
  const chartContainer = document.getElementById('performance-chart');
  if (!chartContainer) return;
  
  // Check if we have stats to display in a chart
  if (!player.stats || Object.keys(player.stats).length <= 1) {
    chartContainer.innerHTML = "<p class='text-center italic h-full flex items-center justify-center'>Not enough historical data for performance visualization.</p>";
    return;
  }
  
  // For our simple visualization, we'll create a basic bar chart using divs
  // In a real app, you would use a library like Chart.js here
  
  // Get years excluding career and sort chronologically
  const years = Object.keys(player.stats)
    .filter(y => y !== 'career' && y !== 'projected')
    .sort();
  
  if (years.length < 2) {
    chartContainer.innerHTML = "<p class='text-center italic h-full flex items-center justify-center'>Not enough seasons to show performance trend.</p>";
    return;
  }
  
  // Determine the primary stat for this position
  let statType = 'touchdowns';  // Default
  if (player.position === 'QB') {
    statType = 'passingYards';
  } else if (player.position === 'RB') {
    statType = 'rushingYards';
  } else if (player.position === 'WR' || player.position === 'TE') {
    statType = 'receivingYards';
  }
  
  // Extract values for each year
  const values = years.map(year => {
    const yearStats = player.stats[year];
    return {
      year,
      value: yearStats && yearStats[statType] ? yearStats[statType] : 0
    };
  });
  
  // Find the max value for scaling
  const maxValue = Math.max(...values.map(v => v.value));
  
  // Create the HTML for our simple bar chart
  let chartHtml = `
    <p class="text-center mb-2 text-xs text-gray-400">
      ${getStatTypeLabel(statType)} by Year
    </p>
    <div class="flex h-48 items-end justify-around">
  `;
  
  values.forEach(item => {
    const heightPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
    // Choose a color based on the stat value relative to max
    let barColor = 'bg-cyan-600';
    if (heightPercent > 80) barColor = 'bg-green-500';
    else if (heightPercent > 50) barColor = 'bg-cyan-500';
    else if (heightPercent > 20) barColor = 'bg-cyan-600';
    else barColor = 'bg-cyan-700';
    
    chartHtml += `
      <div class="flex flex-col items-center">
        <div class="w-12 ${barColor} rounded-t" style="height: ${heightPercent}%;" title="${item.value} ${getStatTypeLabel(statType)}"></div>
        <div class="text-xs mt-1 font-medium">${item.year}</div>
        <div class="text-xs text-gray-400">${item.value}</div>
      </div>
    `;
  });
  
  chartHtml += '</div>';
  chartContainer.innerHTML = chartHtml;
}

/**
 * Gets a human-readable label for stat types
 * @param {string} statType - The stat type key
 * @returns {string} The human-readable label
 */
function getStatTypeLabel(statType) {
  const labels = {
    passingYards: 'Passing Yards',
    rushingYards: 'Rushing Yards',
    receivingYards: 'Receiving Yards',
    touchdowns: 'Touchdowns',
    interceptions: 'Interceptions',
    catches: 'Receptions'
  };
  return labels[statType] || statType;
}

/**
 * Initializes the Add to Squad button behavior
 * @param {Object} player - The player data object
 */
function initializeAddToSquadButton(player) {
  const addToSquadBtn = document.getElementById("add-to-squad-btn");
  if (!addToSquadBtn) return;
  
  // Check if player is already in squad
  const squad = getSquad();
  const isInSquad = squad.some(p => p.playerId === player.playerId);
  
  if (isInSquad) {
    addToSquadBtn.textContent = "In My Squad";
    addToSquadBtn.classList.remove("bg-green-600", "hover:bg-green-700");
    addToSquadBtn.classList.add("bg-gray-500");
    addToSquadBtn.disabled = true;
  } else {
    addToSquadBtn.addEventListener("click", () => {
      const wasAdded = addToSquad({ 
        playerId: player.playerId, 
        name: player.name, 
        team: player.team,
        position: player.position
      });
      
      if (wasAdded) {
        addToSquadBtn.textContent = "Added to Squad!";
        addToSquadBtn.classList.remove("bg-green-600", "hover:bg-green-700");
        addToSquadBtn.classList.add("bg-cyan-500");
        setTimeout(() => {
          addToSquadBtn.textContent = "In My Squad";
          addToSquadBtn.classList.remove("bg-cyan-500");
          addToSquadBtn.classList.add("bg-gray-500");
          addToSquadBtn.disabled = true;
        }, 1500);
      }
    });
  }
}

/**
 * Initializes the Compare Players button
 * @param {Object} player - The player data object
 */
function initializeCompareButton(player) {
  const compareBtn = document.getElementById('compare-players-btn');
  if (!compareBtn) return;
  
  compareBtn.addEventListener('click', () => {
    // In a more advanced implementation, we would show a modal with player search
    // For now, we'll use a simple prompt
    const otherPlayerId = prompt("Enter the Player ID of the player to compare with:");
    if (otherPlayerId) {
      window.open(`compare.html?a=${player.playerId}&b=${otherPlayerId}`, '_blank');
    }
  });
}
