// Logic to load player data by playerId
// player-page.js
import { getCleanExperience, getFormattedHeightWeight, getTagBadgesHtml, standardTagDisplayConfig, getFlagIconsHtml } from './utils.js';

const container = document.getElementById("player-card");
const params = new URLSearchParams(window.location.search);
const playerId = params.get("id");

if (!playerId) {
  container.innerHTML = "<p class='text-center text-red-400'>Missing player ID</p>";
} else {
  fetch("./data/nfl_players_2025_enriched_full_final.json")
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(players => {
      const player = players.find(p => p.playerId == playerId);
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
          <div class="flex justify-between items-start mb-2">
            <a href="dashboard.html" class="text-sm text-cyan-400 hover:text-cyan-300">&larr; Back to Dashboard</a>
          </div>
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
            <p class="text-sm text-gray-300 italic mt-1">${aiCommentary}</p>
          </div>

          <div class="mt-6">
            <h2 class="text-lg font-semibold text-white">📊 Key Stats (2024)</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mt-2">
              <div><div class="text-xl font-bold">${player.stats?.['2024']?.passingYards ?? player.stats?.['2024']?.rushingYards ?? player.stats?.['2024']?.receivingYards ?? '-'}</div><div class="text-xs text-gray-400">Yards</div></div>
              <div><div class="text-xl font-bold">${player.stats?.['2024']?.touchdowns ?? '-'}</div><div class="text-xs text-gray-400">TDs</div></div>
              <div><div class="text-xl font-bold">${player.stats?.['2024']?.interceptions ?? '-'}</div><div class="text-xs text-gray-400">INTs</div></div>
              <div><div class="text-xl font-bold">${player.fantasy?.pprPoints?.toFixed(1) ?? '-'}</div><div class="text-xs text-gray-400">Fantasy Pts (PPR)</div></div>
            </div>
          </div>

          <div class="mt-6">
            <h2 class="text-lg font-semibold text-white">🧠 Bio</h2>
            <ul class="text-sm text-gray-300 list-none space-y-1 mt-2">
              <li><strong>College:</strong> ${player.college || 'N/A'}</li>
              <li><strong>Height/Weight:</strong> ${height} / ${weight}</li>
              <li><strong>Age:</strong> ${player.age || 'N/A'}</li>
              <li><strong>Birthplace:</strong> ${player.birthplace || 'N/A'}</li>
              <li><strong>Draft Info:</strong> ${player.draftInfo || 'N/A'}</li>
              <li><strong>Experience:</strong> ${experience}</li>
            </ul>
          </div>
          
          <div class="mt-6">
             <h2 class="text-lg font-semibold text-white">📅 Past Seasons</h2>
             <div id="historical-stats-container" class="text-sm text-gray-300 mt-2">
               Loading historical stats...
             </div>
          </div>

          <div class="mt-6 flex flex-wrap gap-3">
            <button id="add-to-squad-btn" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm">Add to My Squad</button>
            <button id="compare-player-btn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm">Compare Player</button>
            <a href="#" class="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-xl text-sm">Ask Coach (Stub)</a>
          </div>
        </div>
      `;
      
      // Populate historical stats
      const historicalStatsContainer = document.getElementById('historical-stats-container');
      if (player.stats && Object.keys(player.stats).length > 0) {
          let statsHtml = '<div class="overflow-x-auto"><table class="min-w-full divide-y divide-gray-700"><thead><tr><th class="px-2 py-1 text-left text-xs">Year</th><th class="px-2 py-1 text-left text-xs">Team</th><th class="px-2 py-1 text-left text-xs">Games</th><th class="px-2 py-1 text-left text-xs">Stats Summary</th></tr></thead><tbody class="divide-y divide-gray-600">';
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

              statsHtml += `<tr><td class="px-2 py-1">${year}</td><td class="px-2 py-1">${yearStats.teamRoster || player.team}</td><td class="px-2 py-1">${yearStats.gamesPlayed || '-'}</td><td class="px-2 py-1">${summary.join(', ') || 'N/A'}</td></tr>`;
          }
          statsHtml += '</tbody></table></div>';
          historicalStatsContainer.innerHTML = statsHtml;
      } else {
          historicalStatsContainer.innerHTML = "<p>No detailed historical season data available.</p>";
      }

      // Add to squad button listener
      const addToSquadBtn = document.getElementById("add-to-squad-btn");
      if (addToSquadBtn) {
        // Check initial squad status
        const squad = getSquad ? getSquad() : []; // Assuming getSquad is available globally or imported
        const isAlreadyInSquad = squad.some(p => p.playerId === player.playerId);
        if (isAlreadyInSquad) {
            addToSquadBtn.textContent = "In My Squad";
            addToSquadBtn.classList.remove("bg-green-600", "hover:bg-green-700");
            addToSquadBtn.classList.add("bg-gray-500");
            addToSquadBtn.disabled = true;
        }

        addToSquadBtn.addEventListener("click", () => {
          if (typeof addToSquad !== 'function') {
            console.error('addToSquad function is not defined. Make sure my-squad.js is loaded correctly.');
            alert('Error: Squad functionality not available.');
            return;
          }
          const wasAdded = addToSquad({ 
            playerId: player.playerId, 
            name: player.name, 
            team: player.team,
            position: player.position // Store position for My Squad display
          });
          if (wasAdded) {
            addToSquadBtn.textContent = "Added to Squad!";
            addToSquadBtn.classList.remove("bg-green-600", "hover:bg-green-700");
            addToSquadBtn.classList.add("bg-gray-500");
            addToSquadBtn.disabled = true;
          } else {
            // If already in squad, it might have been handled by initial check
            // but can re-disable just in case.
            addToSquadBtn.textContent = "In My Squad";
            addToSquadBtn.disabled = true; 
            addToSquadBtn.classList.remove("bg-green-600", "hover:bg-green-700");
            addToSquadBtn.classList.add("bg-gray-500");
          }
        });
      }
      // Compare player button
      const compareBtn = document.getElementById('compare-player-btn');
      if(compareBtn) {
          compareBtn.addEventListener('click', () => {
              // For now, prompt user for the second player ID. 
              // Ideally, this would integrate with a player selection modal or the cheat sheet.
              const otherPlayerId = prompt("Enter the Player ID of the second player to compare with:");
              if(otherPlayerId) {
                  window.location.href = `compare.html?a=${player.playerId}&b=${otherPlayerId}`;
              }
          });
      }
    })
    .catch(error => {
      console.error("Error loading player data for player page:", error);
      if (container) {
        container.innerHTML = `<p class='text-center text-red-400'>Error loading player details. ${error.message} <a href='dashboard.html' class='text-cyan-400 hover:underline'>Back to Dashboard</a></p>`;
      }
    });
}
// Make sure my-squad.js functions are available if not using modules for them
// For example, ensure getSquad and addToSquad are globally available or properly imported.
// If my-squad.js uses ES6 exports, player-page.js needs to import them:
// import { getSquad, addToSquad } from './my-squad.js';

// This script assumes my-squad.js is loaded via <script> tag and functions are global,
// or that it's also an ES6 module and functions are imported.
// If my-squad.js is updated to ES6 module, ensure player-page.html includes it as type="module"
// and that player-page.js has: import { getSquad, addToSquad } from './my-squad.js';
