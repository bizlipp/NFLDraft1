// dashboard.js
import { getTagBadgesHtml, standardTagDisplayConfig, getFlagIconsHtml } from './utils.js';
import { getSquad, removeFromSquad } from './my-squad.js';
import { getCoachAdvice } from './coach.js';
import { getPlayerData } from './data-service.js';
import { initializeHeader } from './header-nav.js';
import { initializeThemeSystem } from './theme-manager.js';

// Make function accessible to onclick handlers
window.removePlayerFromSquadAndRefresh = function(playerId) {
  removeFromSquad(playerId);
  displayMySquad();
  updateCoachCommentary();
}

// Store references to key elements
document.addEventListener("DOMContentLoaded", () => {
    // Initialize the header with current page highlighted
    initializeHeader('dashboard');
  
    // No need to handle search container setup anymore - search.js handles that
  
    let allPlayers = [];
  
    // Theme handling is now done in theme-manager.js through the header
  
    // Load player data using our centralized data service
    getPlayerData()
    .then(playersData => {
      allPlayers = playersData;
      console.log("✅ Loaded", allPlayers.length, "players for dashboard using centralized data service");

      injectFeaturedPlayers(allPlayers);
      displayMySquad();
      updateCoachCommentary();
      populateLeagueLeaders(allPlayers);
    })
    .catch(error => {
      console.error("Error loading player data for dashboard:", error);
      // Display error messages in the UI
      const featuredContainer = document.getElementById("featured-players-container");
      if (featuredContainer) {
        featuredContainer.innerHTML = `<p class="col-span-2 text-red-400 text-center">Error loading featured players data.</p>`;
      }
      const squadContainer = document.getElementById("my-squad-container");
      if (squadContainer) {
        squadContainer.innerHTML = `<p class="text-red-400 text-center">Error loading squad data.</p>`;
      }
      // Potentially update other parts of the UI to reflect the error
    });
  
    // Inject featured player stubs
    function injectFeaturedPlayers(players) {
      const featuredContainer = document.getElementById("featured-players-container");
      if (!featuredContainer) {
        console.error("Featured players container not found!");
        return;
      }
      console.log("[Dashboard] Injecting featured players. Total players available:", players.length);

      // Define featured categories with their corresponding tags and icons/backgrounds
      const featuredCategories = [
        { 
          name: "Sleeper Pick", 
          tagKey: "sleeper", 
          emoji: "🔥", 
          bgColor: "bg-orange-600/20" 
        },
        { 
          name: "Injury Risk", 
          tagKey: "injuryrisk", 
          emoji: "🚑", 
          bgColor: "bg-red-600/20" 
        },
        { 
          name: "Trending Up", 
          tagKey: "trending", 
          emoji: "📈", 
          bgColor: "bg-green-600/20" 
        },
        { 
          name: "Value Pick", 
          tagKey: "valuepick", 
          emoji: "💰", 
          bgColor: "bg-yellow-600/20" 
        }
      ];
      
      featuredContainer.innerHTML = "";
      
      featuredCategories.forEach(category => {
        // Look for players with matching tags (or flags)
        const player = players.find(p => {
          const normalizedPlayerTags = p.tags?.map(t => t.toLowerCase().replace(/[^a-zA-Z0-9]/g, "")) || [];
          const normalizedPlayerFlags = p.flags?.map(f => f.toLowerCase().replace(/[^a-zA-Z0-9]/g, "")) || [];
          return normalizedPlayerTags.includes(category.tagKey) || normalizedPlayerFlags.includes(category.tagKey);
        });
        
        const card = document.createElement("div");
        card.className = "bg-gray-800 p-4 rounded-xl flex items-center gap-3 shadow-lg transition-all hover:shadow-xl";
        
        let cardContent = '';
        if (player) {
          cardContent = `
            <div class="w-14 h-14 flex items-center justify-center ${category.bgColor} rounded-full">
              <span class="text-3xl">${category.emoji}</span>
            </div>
            <div>
              <div class="font-semibold text-cyan-400 mb-1">${category.name}</div>
              <a href="player-page.html?id=${player.playerId}" class="text-gray-300 hover:text-white transition-colors font-medium">${player.name}</a>
              <div class="text-xs text-gray-400 mt-1">${player.position} - ${player.team || 'N/A'}</div>
            </div>
          `;
        } else {
          cardContent = `
            <div class="w-14 h-14 flex items-center justify-center ${category.bgColor} rounded-full">
              <span class="text-3xl">${category.emoji}</span>
            </div>
            <div>
              <div class="font-semibold text-cyan-400 mb-1">${category.name}</div>
              <div class="text-gray-500 italic">No player currently highlighted for this tag.</div>
            </div>
          `;
        }
        
        card.innerHTML = cardContent;
        featuredContainer.appendChild(card);
      });
    }
  
    // Function to display My Squad
    function displayMySquad() {
      const squad = getSquad(); // Using imported function
      const squadContainer = document.getElementById("my-squad-container");
      const emptyMessage = squadContainer?.querySelector(".empty-squad-message");
      const squadGrid = squadContainer?.querySelector(".squad-grid");
      const squadSummary = squadContainer?.querySelector(".squad-summary");
      const positionCountsEl = document.getElementById("squad-position-counts");
      const strengthScoreEl = document.getElementById("squad-strength-score");

      if (!squadContainer) {
        console.error("My Squad container not found in dashboard.html");
        return;
      }

      if (squad.length === 0) {
        if (emptyMessage) emptyMessage.classList.remove("hidden");
        if (squadGrid) squadGrid.classList.add("hidden");
        if (squadSummary) squadSummary.classList.add("hidden");
        return;
      }

      // Show the grid and summary, hide empty message
      if (emptyMessage) emptyMessage.classList.add("hidden");
      if (squadGrid) {
        squadGrid.classList.remove("hidden");
        
        // Populate the grid with player cards
        squadGrid.innerHTML = squad.map(player => `
          <div class="bg-gray-700 rounded-md p-2 flex items-center gap-2">
            <img src="${player.headshot || './AeroVista-Logo.png'}" alt="${player.name}" class="w-8 h-8 rounded-full object-cover border border-gray-600">
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-center">
                <a href="player-page.html?id=${player.playerId}" class="text-white hover:underline text-sm font-medium truncate block">${player.name}</a>
              </div>
              <div class="text-xs text-gray-400 flex items-center justify-between">
                <span>${player.position} · ${player.team || 'N/A'}</span>
                <button onclick="removePlayerFromSquadAndRefresh('${player.playerId}')" class="text-red-400 hover:text-red-300">×</button>
              </div>
            </div>
          </div>
        `).join("");
      }
      
      // Update position counts
      if (squadSummary && positionCountsEl) {
        squadSummary.classList.remove("hidden");
        
        // Count players by position
        const positionCounts = {};
        squad.forEach(player => {
          positionCounts[player.position] = (positionCounts[player.position] || 0) + 1;
        });
        
        // Format position counts string
        const positions = ["QB", "RB", "WR", "TE", "K", "DST"];
        const posCountsStr = positions
          .map(pos => `${pos}: ${positionCounts[pos] || 0}`)
          .join(' | ');
        
        positionCountsEl.textContent = posCountsStr;
        
        // Calculate simple team strength score based on number of positions filled
        const filledPositions = Object.keys(positionCounts).length;
        const maxPositions = positions.length;
        const strengthScore = Math.round((filledPositions / maxPositions) * 100);
        
        if (strengthScoreEl) {
          strengthScoreEl.textContent = `${strengthScore}%`;
        }
      }
    }
  
    // Function to update Coach Commentary
    function updateCoachCommentary() {
      const squad = getSquad(); // Using imported function
      const coachAdviceEl = document.getElementById("coach-advice");

      if (!coachAdviceEl) {
        console.error("Coach advice element not found");
        return;
      }

      // Get advice from coach.js (using imported function)
      const advice = getCoachAdvice(squad, allPlayers);
      coachAdviceEl.textContent = advice;
    }
  
    function populateLeagueLeaders(players) {
      const positionsToLead = {
        "Top QBs": "QB",
        "Top RBs": "RB",
        "Top WRs": "WR"
      };

      const leaderCards = document.querySelectorAll("#league-leaders-container .bg-gray-800");
      if (!leaderCards || leaderCards.length !== Object.keys(positionsToLead).length) {
        console.warn("[Dashboard] League leader cards not found or mismatch count. Expected 3.");
        return;
      }

      let cardIndex = 0;
      for (const sectionTitle in positionsToLead) {
        const position = positionsToLead[sectionTitle];
        const card = leaderCards[cardIndex];
        
        if (!card) {
          console.warn(`[Dashboard] League leader card not found for ${sectionTitle}`);
          cardIndex++;
          continue;
        }
        
        // Find all players of this position and sort by PPR points if available
        const positionPlayers = players.filter(p => p.position === position);
        
        if (positionPlayers.length > 0) {
          // Sort by PPR points (fantasy.pprPoints) if available
          positionPlayers.sort((a, b) => {
            const aPoints = a.fantasy?.pprPoints ?? -Infinity;
            const bPoints = b.fantasy?.pprPoints ?? -Infinity;
            return bPoints - aPoints;
          });
          
          const leader = positionPlayers[0];
          
          // Update player name in the card
          const nameEl = card.querySelector(".player-name");
          if (nameEl) {
            nameEl.innerHTML = `<a href="player-page.html?id=${leader.playerId}" class="hover:underline">${leader.name}</a>`;
          }
          
          // Update stats in the card
          const yardsEl = card.querySelector(".stat-yards");
          const tdsEl = card.querySelector(".stat-tds");
          const pprEl = card.querySelector(".stat-ppr");
          
          if (yardsEl) yardsEl.textContent = leader.fantasy?.yards ?? 'N/A';
          if (tdsEl) tdsEl.textContent = leader.fantasy?.touchdowns ?? 'N/A';
          if (pprEl) pprEl.textContent = leader.fantasy?.pprPoints ? leader.fantasy.pprPoints.toFixed(1) : 'N/A';
        }
        
        cardIndex++;
      }
    }
  
    // Search behavior handled by search.js
  });
  