// dashboard.js
import { getTagBadgesHtml, standardTagDisplayConfig, getFlagIconsHtml } from './utils.js';
import { getSquad, removeFromSquad } from './my-squad.js';
import { getCoachAdvice } from './coach.js';
import { getPlayerData } from './data-service.js';
import { initializeHeader } from './header-nav.js';

// Store references to key elements
document.addEventListener("DOMContentLoaded", () => {
    // Initialize the header with current page highlighted
    initializeHeader('dashboard');
  
    const searchInput = document.querySelector("input[type='text']");
    // Note: search.js handles its own search results container logic now.
    // const searchResultsContainer = document.createElement("div");
    // searchResultsContainer.className = "absolute top-16 left-0 right-0 bg-gray-800 rounded-md z-20 max-h-64 overflow-y-auto shadow-lg border border-gray-600 hidden";
    // document.querySelector(".p-4")?.appendChild(searchResultsContainer);
  
    let allPlayers = [];
  
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

      const featuredTagMap = {
        "🔥 Sleeper": "sleeper",
        "🚑 Injury Risk": "injuryrisk",
        "📈 Trending": "trending",
        "💰 Value Pick": "valuepick",
        "🚀 Starter Forward": "starterforward"
      };
      const tagsToDisplay = Object.keys(featuredTagMap);
      featuredContainer.innerHTML = ""; 
      let playersFoundForAnyTag = false;

      tagsToDisplay.forEach((tagDisplayName) => {
        const tagKey = featuredTagMap[tagDisplayName];
        console.log(`[Dashboard] Searching for featured player with tag key: ${tagKey}`);
        const player = players.find(p => {
            const normalizedPlayerTags = p.tags?.map(t => t.toLowerCase().replace(/[^a-zA-Z0-9]/g, ""));
            return normalizedPlayerTags?.includes(tagKey);
        });
        
        if(player) {
            console.log(`[Dashboard] Found player for ${tagDisplayName}:`, player.name);
            playersFoundForAnyTag = true;
        } else {
            console.log(`[Dashboard] No player found for tag: ${tagDisplayName} (key: ${tagKey})`);
        }

        const el = document.createElement("div");
        el.className = "bg-gray-800 p-3 rounded-xl text-sm shadow-md hover:shadow-lg transition-shadow";
        
        let contentHtml = '';
        if (player) {
          contentHtml = `
            <div class="flex items-center gap-2">
              <img src="${player.headshot || './AeroVista-Logo.png'}" alt="${player.name}" class="w-10 h-10 rounded-full object-cover">
              <div>
                <span class="block font-semibold text-cyan-400">${tagDisplayName}</span>
                <a href="player-page.html?id=${player.playerId}" class="text-white hover:underline">${player.name}</a>
                <span class="text-xs text-gray-400"> (${player.position} - ${player.team})</span>
              </div>
            </div>`;
        } else {
          contentHtml = `
            <div class="flex items-center gap-2">
              <span class="text-2xl">${tagDisplayName.split(' ')[0]}</span> {/* Just the emoji */}
              <div>
                <span class="block font-semibold text-cyan-400">${tagDisplayName.substring(tagDisplayName.indexOf(' ') + 1)}</span>
                <span class="text-gray-500 italic">No player currently highlighted for this tag.</span>
              </div>
            </div>`;
        }
        el.innerHTML = contentHtml;
        featuredContainer.appendChild(el);
      });

      console.log("[Dashboard] Finished processing featured tags. Players found for any tag:", playersFoundForAnyTag);
      console.log("[Dashboard] Featured container children count:", featuredContainer.children.length);

      if (featuredContainer.children.length === 0 && tagsToDisplay.length > 0) {
          // This case means no players were found for ANY tag, and no placeholders were added yet.
          tagsToDisplay.forEach(tagDisplayName => {
              const el = document.createElement("div");
              el.className = "bg-gray-800 p-3 rounded-xl text-sm shadow-md hover:shadow-lg transition-shadow";
              el.innerHTML = `
                <div class="flex items-center gap-2">
                  <span class="text-2xl">${tagDisplayName.split(' ')[0]}</span>
                  <div>
                    <span class="block font-semibold text-cyan-400">${tagDisplayName.substring(tagDisplayName.indexOf(' ') + 1)}</span>
                    <span class="text-gray-500 italic">No player currently highlighted.</span>
                  </div>
                </div>`;
              featuredContainer.appendChild(el);
          });
          console.log("[Dashboard] Added default placeholders as no players were found for any featured tag.");
      } else if (featuredContainer.children.length < tagsToDisplay.length && featuredContainer.children.length > 0) {
        // If some players were found, but not enough to fill all tag categories, fill remaining
        // This case might be covered if the main loop already adds a placeholder if player is not found for a specific tag.
        // The existing logic inside the loop that adds a placeholder when `player` is null for a tag handles this.
      }
      // Ensure grid has enough columns (e.g. up to 4 items total)
      if (featuredContainer.children.length > 0 && featuredContainer.children.length < 4) {
        for (let i = featuredContainer.children.length; i < 4; i++) {
            const placeholderEl = document.createElement("div");
            placeholderEl.className = "bg-gray-800 p-3 rounded-xl text-sm shadow-md flex items-center justify-center text-gray-600 italic";
            placeholderEl.textContent = "More insights soon...";
            featuredContainer.appendChild(placeholderEl);
        }
      }
    }
  
    // Function to display My Squad
    function displayMySquad() {
      const squad = getSquad(); // Using imported function
      const squadContainer = document.getElementById("my-squad-container");

      if (!squadContainer) {
        console.error("My Squad container not found in dashboard.html");
        return;
      }

      if (squad.length === 0) {
        squadContainer.innerHTML = `<div class="bg-gray-800 p-4 rounded-xl text-sm text-gray-400 italic text-center">
                                      You haven't drafted anyone yet.
                                    </div>`;
        return;
      }

      squadContainer.innerHTML = squad.map(player => `
        <div class="flex justify-between items-center p-2 border-b border-gray-700">
          <div>
            <strong class="text-white">${player.name}</strong>
            <span class="text-xs text-gray-400 ml-2">(${player.team || 'N/A'})</span>
          </div>
          <button class="text-red-500 hover:text-red-400 text-xs" onclick="removePlayerFromSquadAndRefresh('${player.playerId}')">Remove</button>
        </div>
      `).join("");
      // Add a class to ensure proper styling if the default placeholder had specific ones
      squadContainer.className = "bg-gray-800 p-4 rounded-xl space-y-2"; // Adjusted class for list display
    }

    // Make removePlayerFromSquadAndRefresh globally accessible for the inline onclick
    window.removePlayerFromSquadAndRefresh = (playerId) => {
      removeFromSquad(playerId); // Using imported function
      displayMySquad(); // Refresh the displayed squad
      updateCoachCommentary(); // Refresh coach commentary after squad changes
    };
  
    // Function to update Coach Commentary
    function updateCoachCommentary() {
      const squad = getSquad(); // Using imported function
      const coachCommentaryContainer = document.querySelector("section:nth-of-type(5) .bg-purple-800"); // Target the coach says div

      if (!coachCommentaryContainer) {
        console.error("Coach commentary container not found");
        return;
      }

      // Get advice from coach.js (using imported function)
      const advice = getCoachAdvice(squad, allPlayers);

      coachCommentaryContainer.textContent = advice;
    }
  
    function populateLeagueLeaders(players) {
      const positionsToLead = {
        "Top QBs": "QB",
        "Top RBs": "RB",
        "Top WRs": "WR"
      };

      const leaderSections = document.querySelectorAll("#league-leaders-container .bg-gray-800");
      if (!leaderSections || leaderSections.length !== Object.keys(positionsToLead).length) {
        console.warn("[Dashboard] League leader section divs not found or mismatch count. Expected 3.");
        // Try a more specific selector if the generic one fails
        const container = document.querySelector("section h2 + div.grid.grid-cols-3"); // Based on HTML structure around League Leaders
        if(container && container.children.length === 3){
            // If this works, proceed with container.children[0], container.children[1], etc.
            // This is a fallback, ideally the querySelectorAll above is more robust.
        } else {
             console.error("[Dashboard] Could not find league leader containers accurately.");
             return;
        }
      }

      let sectionIndex = 0;
      for (const sectionTitle in positionsToLead) {
        const position = positionsToLead[sectionTitle];
        const positionPlayers = players.filter(p => p.position === position && p.fantasy?.pprPoints !== undefined && p.fantasy.pprPoints !== null);
        
        if (positionPlayers.length > 0) {
          positionPlayers.sort((a, b) => (b.fantasy.pprPoints ?? -Infinity) - (a.fantasy.pprPoints ?? -Infinity));
          const leader = positionPlayers[0]; // Top 1 leader

          const sectionDiv = leaderSections[sectionIndex];
          if (sectionDiv) {
            sectionDiv.innerHTML = `
              <div class="text-xs text-cyan-400 font-semibold mb-1">${sectionTitle}</div>
              <a href="player-page.html?id=${leader.playerId}" class="text-white hover:underline text-sm block truncate" title="${leader.name}">${leader.name}</a>
              <div class="text-xs text-gray-400">${(leader.fantasy.pprPoints).toFixed(1)} pts</div>
            `;
          } else {
            console.warn(`[Dashboard] League leader section div not found for ${sectionTitle}`);
          }
        } else {
          const sectionDiv = leaderSections[sectionIndex];
          if (sectionDiv) {
            sectionDiv.innerHTML = `
              <div class="text-xs text-cyan-400 font-semibold mb-1">${sectionTitle}</div>
              <div class="text-gray-500 text-sm italic">N/A</div>
            `;
          }
        }
        sectionIndex++;
      }
    }
  
    // Search behavior (commented out as search.js handles this globally now)
    // searchInput?.addEventListener("input", (e) => { ... });
  });
  