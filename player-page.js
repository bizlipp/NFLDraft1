// Logic to load player data by playerId
// player-page.js

const container = document.getElementById("player-card");
const params = new URLSearchParams(window.location.search);
const playerId = params.get("id");

if (!playerId) {
  container.innerHTML = "<p class='text-center text-red-400'>Missing player ID</p>";
} else {
  // container already has "Loading player details..." from HTML
  fetch("./data/nfl_players_2025_enriched.json") // Updated JSON file
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(players => {
      const player = players.find(p => p.playerId == playerId);
      if (!player) {
        container.innerHTML = "<p class='text-center text-red-400'>Player not found</p>";
        return;
      }

      // Define tag display properties
      const tagDisplayConfig = {
        "sleeper": { displayName: "🔥 Sleeper", style: "bg-blue-600 text-white" },
        "trending": { displayName: "📈 Trending", style: "bg-green-500 text-white" },
        "injuryrisk": { displayName: "🚑 Injury Risk", style: "bg-red-600 text-white" },
        "valuepick": { displayName: "💰 Value Pick", style: "bg-purple-600 text-white" },
        "starterforward": { displayName: "🚀 Starter Forward", style: "bg-yellow-400 text-gray-900" }
      };

      const playerTagsHtml = (player.tags || [])
        .map(tagKey => {
          const config = tagDisplayConfig[tagKey.toLowerCase().replace(/[^a-zA-Z0-9]/g, "")]; // Normalize key
          if (config) {
            return `<span class="text-xs px-2 py-1 ${config.style} rounded-full">${config.displayName}</span>`;
          }
          return ''; // Or some default rendering for unknown tags
        })
        .filter(Boolean) // Remove any empty strings if a tag wasn't found in config
        .join('');

      container.innerHTML = `
        <div class="bg-gray-800 p-6 rounded-xl shadow-lg">
          <div class="flex flex-col md:flex-row gap-6">
            <img src="${player.headshot || './placeholder.png'}" alt="Headshot" class="w-32 h-32 rounded-full border-4 border-cyan-400" />
            <div>
              <h1 class="text-3xl font-bold text-cyan-400">${player.name}</h1>
              <div class="text-gray-400 text-sm">${player.position} • ${player.team}</div>
              <div class="mt-2 flex gap-2 flex-wrap">
                ${playerTagsHtml}
              </div>
            </div>
          </div>

          <div class="mt-6">
            <h2 class="text-lg font-semibold text-white">📊 Stats</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mt-2">
              <div><div class="text-xl font-bold">${player.stats?.['2024']?.passingYards || '-'}</div><div class="text-xs text-gray-400">Pass Yds</div></div>
              <div><div class="text-xl font-bold">${player.stats?.['2024']?.touchdowns || '-'}</div><div class="text-xs text-gray-400">TDs</div></div>
              <div><div class="text-xl font-bold">${player.stats?.['2024']?.interceptions || '-'}</div><div class="text-xs text-gray-400">INTs</div></div>
              <div><div class="text-xl font-bold">${player.fantasy?.pprPoints || '-'}</div><div class="text-xs text-gray-400">Fantasy Pts</div></div>
            </div>
          </div>

          <div class="mt-6">
            <h2 class="text-lg font-semibold text-white">🧠 Bio</h2>
            <ul class="text-sm text-gray-300 list-disc list-inside">
              <li>College: ${player.college || 'N/A'}</li>
              <li>Height/Weight: ${player.height || '-'} / ${player.weight || '-'}</li>
              <li>Birthplace: ${player.birthplace || '-'}</li>
              <li>Draft Info: ${player.draftInfo || '-'}</li>
              <li>Experience: ${player.experience || '-'}</li>
            </ul>
          </div>

          <div class="mt-6 flex flex-wrap gap-3">
            <button id="add-to-squad-btn" class="bg-green-600 px-4 py-2 rounded-xl">Add to My Squad</button>
            <button class="bg-blue-600 px-4 py-2 rounded-xl">Compare</button>
            <button class="bg-yellow-500 px-4 py-2 rounded-xl">Bookmark</button>
            <button class="bg-purple-700 px-4 py-2 rounded-xl">Ask Coach</button>
          </div>
        </div>
      `;

      // Add to squad button listener
      const addToSquadBtn = document.getElementById("add-to-squad-btn");
      if (addToSquadBtn) {
        addToSquadBtn.addEventListener("click", () => {
          const wasAdded = addToSquad({ 
            playerId: player.playerId, 
            name: player.name, 
            team: player.team 
          });
          if (wasAdded) {
            addToSquadBtn.textContent = "Added to Squad!";
            addToSquadBtn.classList.remove("bg-green-600");
            addToSquadBtn.classList.add("bg-gray-500");
            addToSquadBtn.disabled = true;
          } else {
            // Optionally, indicate player is already in squad
            addToSquadBtn.textContent = "Already in Squad";
            addToSquadBtn.disabled = true; 
            addToSquadBtn.classList.remove("bg-green-600");
            addToSquadBtn.classList.add("bg-gray-500");
          }
        });
      }
    })
    .catch(error => {
      console.error("Error loading player data for player page:", error);
      if (container) {
        container.innerHTML = `<p class='text-center text-red-400'>Error loading player details. ${error.message}</p>`;
      }
    });
}
