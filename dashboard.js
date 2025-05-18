// dashboard.js
import { getTagBadgesHtml, standardTagDisplayConfig, getFlagIconsHtml } from './utils.js'; // Import if needed for other parts, or for consistency

// Store references to key elements
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.querySelector("input[type='text']");
    // Note: search.js handles its own search results container logic now.
    // const searchResultsContainer = document.createElement("div");
    // searchResultsContainer.className = "absolute top-16 left-0 right-0 bg-gray-800 rounded-md z-20 max-h-64 overflow-y-auto shadow-lg border border-gray-600 hidden";
    // document.querySelector(".p-4")?.appendChild(searchResultsContainer);
  
    let allPlayers = [];
    // let playerUpdates = {}; // Removed: No longer needed with the new consolidated data file
  
    // Load player data
    fetch("./data/nfl_players_2025_enriched_full_final.json") // Updated file path
    .then(res => res.json())
    .then(playersData => {
      // playerUpdates = updatesData; // Removed
      allPlayers = playersData; // Data is already merged
      // allPlayers = playersData.map(player => { // Removed mapping logic
      //   const updates = playerUpdates[player.playerId];
      //   if (updates) {
      //     return { ...player, ...updates }; // Merge updates into player object
      //   }
      //   return player;
      // });

      console.log("✅ Loaded", allPlayers.length, "players from the new consolidated data file for dashboard");
      // console.log(allPlayers.find(p => p.playerId === "3917315")); // For testing merge

      injectFeaturedPlayers(allPlayers);
      displayMySquad();
      updateCoachCommentary(); // New function to update coach commentary
    })
    .catch(error => {
      console.error("Error loading player data for dashboard:", error);
      // Display an error message to the user in the UI if appropriate
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
      // Use standardTagDisplayConfig from utils.js if imported and suitable, or define locally
      const featuredTagMap = {
        "🔥 Sleeper": "sleeper",
        "🚑 Injury Risk": "injuryrisk",
        "📈 Trending": "trending",
        "💰 Value Pick": "valuepick",
        "🚀 Starter Forward": "starterforward"
        // Add other tags you want to feature, ensure keys match standardTagDisplayConfig if using it for consistency
      };
      const tagsToDisplay = Object.keys(featuredTagMap);
      featuredContainer.innerHTML = ""; // Clear loading message
  
      tagsToDisplay.forEach((tagDisplayName) => {
        const tagKey = featuredTagMap[tagDisplayName];
        // Find the first player that has this specific tag.
        const player = players.find(p => p.tags?.map(t => t.toLowerCase().replace(/[^a-zA-Z0-9]/g, "")).includes(tagKey));
        
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
      // Ensure grid has enough columns if fewer than 4 tags are found/displayed
      if (tagsToDisplay.length < 4 && featuredContainer.children.length > 0) {
        // Add placeholders if you want to maintain a 2x2 grid appearance
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
      const squad = getSquad(); // From my-squad.js
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
      removeFromSquad(playerId); // from my-squad.js
      displayMySquad(); // Refresh the displayed squad
      updateCoachCommentary(); // Refresh coach commentary after squad changes
    };
  
    // Function to update Coach Commentary
    function updateCoachCommentary() {
      const squad = getSquad(); // Get current squad
      const coachCommentaryContainer = document.querySelector("section:nth-of-type(5) .bg-purple-800"); // Target the coach says div

      if (!coachCommentaryContainer) {
        console.error("Coach commentary container not found");
        return;
      }

      // Get advice from coach.js
      // Ensure allPlayers is accessible here or pass it as an argument if its scope is limited.
      // For this structure, allPlayers is in the outer scope of the DOMContentLoaded listener.
      const advice = getCoachAdvice(squad, allPlayers);

      coachCommentaryContainer.textContent = advice;
    }
  
    // Search behavior
    searchInput?.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      if (!query || allPlayers.length === 0) {
        // searchResultsContainer.classList.add("hidden");
        return;
      }
  
      const matches = allPlayers.filter((p) =>
        p.name.toLowerCase().includes(query) ||
        p.team.toLowerCase().includes(query) ||
        p.position.toLowerCase().includes(query)
      ).slice(0, 10);
  
      // searchResultsContainer.innerHTML = matches.map((p) => `
      //   <div class="p-2 hover:bg-gray-700 cursor-pointer text-sm border-b border-gray-700" data-player-id="${p.playerId}">
      //     <strong>${p.name}</strong> – ${p.position} (${p.team})
      //   </div>
      // `).join("");
  
      // searchResultsContainer.classList.remove("hidden");
  
      // Click handler
      // Array.from(searchResultsContainer.children).forEach(el => {
      //   el.addEventListener("click", () => {
      //     const id = el.getAttribute("data-player-id");
      //     const player = allPlayers.find(p => p.playerId == id);
      //     if (player) {
      //       console.log("➡️ Open Player Page:", player);
      //       window.location.href = `player-page.html?id=${player.playerId}`; // Route to full player view
      //     }
      //     searchResultsContainer.classList.add("hidden");
      //   });
      // });
    });
  });
  