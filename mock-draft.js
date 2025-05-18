// mock-draft.js
import { getFlagIconsHtml } from './utils.js'; // For potential future use if flags are added to display

document.addEventListener("DOMContentLoaded", () => {
  const availablePlayersListEl = document.getElementById("available-players-list");
  const myMockTeamListEl = document.getElementById("my-mock-team-list");
  const loadingPlayersMessageEl = document.getElementById("loading-players-message");
  const emptyMockTeamMessageEl = document.getElementById("empty-mock-team-message");
  const mockTeamCountEl = document.getElementById("mock-team-count");
  const maxTeamSizeEl = document.getElementById("max-team-size");
  const resetMockDraftBtn = document.getElementById("reset-mock-draft");
  const availablePositionFilterEl = document.getElementById("available-position-filter");
  const mockTeamPositionSummaryEl = document.getElementById("mock-team-position-summary");
  const mockDraftPlayerSearchEl = document.getElementById("mock-draft-player-search"); // Added search input

  const MOCK_DRAFT_TEAM_KEY = "mockDraftTeam";
  const MAX_TEAM_SIZE = 15;
  if(maxTeamSizeEl) maxTeamSizeEl.textContent = MAX_TEAM_SIZE;

  let allPlayersData = []; // Raw data from fetch
  let availablePlayersPool = []; // Players not yet drafted, before search/pos filters
  let myMockTeam = [];
  let currentAvailablePositionFilter = "ALL";
  let currentMockDraftSearchQuery = ""; // Added for search

  function loadMockTeam() {
    const storedTeam = sessionStorage.getItem(MOCK_DRAFT_TEAM_KEY);
    if (storedTeam) myMockTeam = JSON.parse(storedTeam);
  }

  function saveMockTeam() {
    sessionStorage.setItem(MOCK_DRAFT_TEAM_KEY, JSON.stringify(myMockTeam));
  }

  fetch("./data/nfl_players_2025_enriched_full_final.json")
    .then(res => res.json())
    .then(playersData => {
      allPlayersData = playersData.map(player => ({
        ...player,
        fantasyPprPoints: (player.fantasy && typeof player.fantasy.pprPoints === 'number') ? player.fantasy.pprPoints : -Infinity,
        headshot: player.headshot || './AeroVista-Logo.png' 
      }));
      loadMockTeam();
      initializeDraftState();
      if(loadingPlayersMessageEl) loadingPlayersMessageEl.classList.add("hidden");
    })
    .catch(error => {
      console.error("Error loading player data for mock draft:", error);
      if (loadingPlayersMessageEl) loadingPlayersMessageEl.textContent = "Error loading player data.";
    });

  function initializeDraftState() {
    const draftedPlayerIds = new Set(myMockTeam.map(p => p.playerId));
    availablePlayersPool = allPlayersData.filter(p => !draftedPlayerIds.has(p.playerId));
    renderAvailablePlayers();
    renderMyMockTeam();
  }

  function renderAvailablePlayers() {
    if (!availablePlayersListEl) return;
    availablePlayersListEl.innerHTML = "";
    
    let displayList = [...availablePlayersPool]; // Start with all non-drafted players

    // Apply position filter
    if (currentAvailablePositionFilter !== "ALL") {
      displayList = displayList.filter(p => p.position === currentAvailablePositionFilter);
    }

    // Apply search query filter
    if (currentMockDraftSearchQuery) {
      const query = currentMockDraftSearchQuery.toLowerCase();
      displayList = displayList.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.team?.toLowerCase().includes(query) ||
        p.college?.toLowerCase().includes(query)
        // Add more fields to search if desired (e.g. p.playerId.includes(query))
      );
    }

    // Sort by PPR points (descending)
    displayList.sort((a, b) => (b.fantasyPprPoints ?? -Infinity) - (a.fantasyPprPoints ?? -Infinity)); 

    if (displayList.length === 0) {
      availablePlayersListEl.innerHTML = '<p class="text-center text-gray-400 p-4">No players match criteria or all relevant players drafted.</p>';
      return;
    }

    displayList.slice(0, 150).forEach((player) => {
      const playerDiv = document.createElement("div");
      playerDiv.className = "flex justify-between items-center p-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors";
      // Consider adding a link to player-page.html here or an expand icon
      playerDiv.innerHTML = `
        <div class="flex items-center">
          <img src="${player.headshot}" alt="${player.name}" class="w-8 h-8 rounded-full mr-3 object-cover border-2 border-gray-600">
          <div>
            <a href="player-page.html?id=${player.playerId}" target="_blank" class="font-semibold text-white hover:underline">${player.name}</a>
            <span class="text-xs text-gray-400 block">${player.position} - ${player.team || 'N/A'} (PPR: ${player.fantasyPprPoints !== -Infinity ? player.fantasyPprPoints.toFixed(1) : 'N/A'})</span>
          </div>
        </div>
        <button data-player-id="${player.playerId}" class="draft-btn bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm transition-all duration-150">Draft</button>
      `;
      availablePlayersListEl.appendChild(playerDiv);
    });

    document.querySelectorAll(".draft-btn").forEach(button => {
      button.removeEventListener("click", handleDraftPlayer);
      button.addEventListener("click", handleDraftPlayer);
    });
  }

  function renderMyMockTeam() {
    if (!myMockTeamListEl || !mockTeamCountEl || !mockTeamPositionSummaryEl) return;
    myMockTeamListEl.innerHTML = "";
    mockTeamCountEl.textContent = myMockTeam.length;

    if (myMockTeam.length === 0) {
      if(emptyMockTeamMessageEl) emptyMockTeamMessageEl.classList.remove("hidden");
      mockTeamPositionSummaryEl.innerHTML = "";
      return;
    }
    if(emptyMockTeamMessageEl) emptyMockTeamMessageEl.classList.add("hidden");

    const positionCounts = {};
    myMockTeam.forEach(player => {
      positionCounts[player.position] = (positionCounts[player.position] || 0) + 1;
      const playerDiv = document.createElement("div");
      playerDiv.className = "flex items-center p-1.5 bg-gray-700 rounded-md text-sm";
      playerDiv.innerHTML = `
        <img src="${player.headshot}" alt="${player.name}" class="w-6 h-6 rounded-full mr-2 object-cover border border-gray-600">
        <a href="player-page.html?id=${player.playerId}" target="_blank" class="font-semibold text-white text-xs hover:underline">${player.name}</a>
        <span class="text-xs text-gray-400 ml-auto">(${player.position} - ${player.team || 'N/A'})</span>
      `;
      myMockTeamListEl.appendChild(playerDiv);
    });
    mockTeamPositionSummaryEl.innerHTML = Object.entries(positionCounts)
        .map(([pos, count]) => `<span class="mr-2">${pos}: ${count}</span>`).join('');
  }

  function handleDraftPlayer(event) {
    const button = event.target;
    if (myMockTeam.length >= MAX_TEAM_SIZE) {
      alert(`Your mock team is full (${MAX_TEAM_SIZE} players)!`);
      return;
    }
    const playerIdToDraft = button.dataset.playerId;
    const playerIndexInPool = availablePlayersPool.findIndex(p => p.playerId == playerIdToDraft);

    if (playerIndexInPool > -1) {
      const [draftedPlayer] = availablePlayersPool.splice(playerIndexInPool, 1);
      myMockTeam.push(draftedPlayer);
      saveMockTeam();
      renderAvailablePlayers(); 
      renderMyMockTeam();     
      
      // No need to change button text/state as it will be removed from available list
    } else {
        console.warn("Attempted to draft player not found in available pool:", playerIdToDraft);
    }
  }
  
  if(resetMockDraftBtn) {
    resetMockDraftBtn.addEventListener("click", () => {
      myMockTeam = [];
      currentMockDraftSearchQuery = ""; // Reset search on draft reset
      if(mockDraftPlayerSearchEl) mockDraftPlayerSearchEl.value = "";
      sessionStorage.removeItem(MOCK_DRAFT_TEAM_KEY);
      initializeDraftState(); 
    });
  }
  
  if(availablePositionFilterEl) {
    availablePositionFilterEl.addEventListener("change", (e) => {
      currentAvailablePositionFilter = e.target.value;
      renderAvailablePlayers();
    });
  }

  if(mockDraftPlayerSearchEl) { // Added event listener for search
    mockDraftPlayerSearchEl.addEventListener("input", (e) => {
        currentMockDraftSearchQuery = e.target.value;
        renderAvailablePlayers(); // Re-render with search query applied
    });
  }

}); 