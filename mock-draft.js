// mock-draft.js
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

  const MOCK_DRAFT_TEAM_KEY = "mockDraftTeam";
  const MAX_TEAM_SIZE = 15;
  if(maxTeamSizeEl) maxTeamSizeEl.textContent = MAX_TEAM_SIZE;

  let allPlayersData = [];
  let availablePlayers = [];
  let myMockTeam = [];
  let currentAvailablePositionFilter = "ALL";

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
        fantasyPprPoints: (player.fantasy && typeof player.fantasy.pprPoints === 'number') ? player.fantasy.pprPoints : -1,
        headshot: player.headshot || './AeroVista-Logo.png' // Fallback headshot
      }));
      loadMockTeam();
      initializeDraft();
      loadingPlayersMessageEl.classList.add("hidden");
    })
    .catch(error => {
      console.error("Error loading player data:", error);
      if (loadingPlayersMessageEl) loadingPlayersMessageEl.textContent = "Error loading player data.";
    });

  function initializeDraft() {
    const draftedPlayerIds = new Set(myMockTeam.map(p => p.playerId));
    availablePlayers = allPlayersData.filter(p => !draftedPlayerIds.has(p.playerId));
    renderAvailablePlayers();
    renderMyMockTeam();
  }

  function renderAvailablePlayers() {
    if (!availablePlayersListEl) return;
    availablePlayersListEl.innerHTML = "";
    
    let displayList = availablePlayers;
    if (currentAvailablePositionFilter !== "ALL") {
      displayList = displayList.filter(p => p.position === currentAvailablePositionFilter);
    }
    displayList.sort((a, b) => b.fantasyPprPoints - a.fantasyPprPoints); // Sort by PPR points

    if (displayList.length === 0) {
      availablePlayersListEl.innerHTML = '<p class="text-center text-gray-400 p-4">No players match criteria or all drafted.</p>';
      return;
    }

    displayList.slice(0, 150).forEach((player, index) => {
      const playerDiv = document.createElement("div");
      playerDiv.className = "flex justify-between items-center p-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors";
      playerDiv.innerHTML = `
        <div class="flex items-center">
          <img src="${player.headshot}" alt="${player.name}" class="w-8 h-8 rounded-full mr-3 object-cover border-2 border-gray-600">
          <div>
            <span class="font-semibold text-white">${player.name}</span>
            <span class="text-xs text-gray-400 block">${player.position} - ${player.team || 'N/A'} (PPR: ${player.fantasyPprPoints !== -1 ? player.fantasyPprPoints.toFixed(1) : 'N/A'})</span>
          </div>
        </div>
        <button data-player-id="${player.playerId}" class="draft-btn bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm transition-all duration-150">Draft</button>
      `;
      availablePlayersListEl.appendChild(playerDiv);
    });

    document.querySelectorAll(".draft-btn").forEach(button => {
      button.removeEventListener("click", handleDraftPlayer); // Prevent multiple listeners
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
        <span class="font-semibold text-white text-xs">${player.name}</span>
        <span class="text-xs text-gray-400 ml-auto">(${player.position} - ${player.team || 'N/A'})</span>
      `;
      myMockTeamListEl.appendChild(playerDiv);
    });
    // Update position summary
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
    const playerIndex = availablePlayers.findIndex(p => p.playerId == playerIdToDraft);

    if (playerIndex > -1) {
      const [draftedPlayer] = availablePlayers.splice(playerIndex, 1);
      myMockTeam.push(draftedPlayer);
      saveMockTeam();
      renderAvailablePlayers(); // Re-render available list (player removed)
      renderMyMockTeam();     // Re-render mock team list (player added)
      
      button.textContent = "Drafted ✓";
      button.classList.remove("bg-green-600", "hover:bg-green-700");
      button.classList.add("bg-gray-500");
      button.disabled = true;
    }
  }
  
  if(resetMockDraftBtn) {
    resetMockDraftBtn.addEventListener("click", () => {
      myMockTeam = [];
      sessionStorage.removeItem(MOCK_DRAFT_TEAM_KEY);
      initializeDraft(); 
    });
  }
  
  if(availablePositionFilterEl) {
    availablePositionFilterEl.addEventListener("change", (e) => {
      currentAvailablePositionFilter = e.target.value;
      renderAvailablePlayers();
    });
  }

}); 