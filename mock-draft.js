// mock-draft.js
import { getFlagIconsHtml } from './utils.js';
import { getPlayerData } from './data-service.js';
import { initializeHeader } from './header-nav.js';

document.addEventListener("DOMContentLoaded", () => {
  // Initialize the header with current page highlighted
  initializeHeader('mockdraft');

  const availablePlayersListEl = document.getElementById("available-players-list");
  const myMockTeamListEl = document.getElementById("my-mock-team-list");
  const loadingPlayersMessageEl = document.getElementById("loading-players-message");
  const emptyMockTeamMessageEl = document.getElementById("empty-mock-team-message");
  const mockTeamCountEl = document.getElementById("mock-team-count");
  const maxTeamSizeEl = document.getElementById("max-team-size");
  const resetMockDraftBtn = document.getElementById("reset-mock-draft");
  const availablePositionFilterEl = document.getElementById("available-position-filter");
  const mockTeamPositionSummaryEl = document.getElementById("mock-team-position-summary");
  const mockDraftPlayerSearchEl = document.getElementById("mock-draft-player-search");
  const draftBoardContainer = document.getElementById("draft-board-container");
  const startAIDraftBtn = document.getElementById("start-ai-draft-btn");
  const draftRoundEl = document.getElementById("draft-round");
  const draftPickEl = document.getElementById("draft-pick");

  const MOCK_DRAFT_TEAM_KEY = "mockDraftTeam";
  const MAX_TEAM_SIZE = 15;
  const NUM_AI_TEAMS = 11; // Standard 12-team league (user + 11 AI teams)
  
  if(maxTeamSizeEl) maxTeamSizeEl.textContent = MAX_TEAM_SIZE;

  let allPlayersData = []; // Raw data from fetch
  let availablePlayersPool = []; // Players not yet drafted, before search/pos filters
  let myMockTeam = [];
  let aiTeams = Array(NUM_AI_TEAMS).fill().map(() => []); // Array of AI team rosters
  let currentDraftRound = 1;
  let currentDraftPick = 1;
  let totalDraftPicks = 0;
  let isAIDraftInProgress = false;
  let draftOrder = []; // Will hold the order of team drafting (0 = user, 1-11 = AI teams)
  let currentAvailablePositionFilter = "ALL";
  let currentMockDraftSearchQuery = "";
  let aiDraftTimer = null;

  function loadMockTeam() {
    const storedTeam = sessionStorage.getItem(MOCK_DRAFT_TEAM_KEY);
    if (storedTeam) myMockTeam = JSON.parse(storedTeam);
  }

  function saveMockTeam() {
    sessionStorage.setItem(MOCK_DRAFT_TEAM_KEY, JSON.stringify(myMockTeam));
  }

  // Use our data service
  getPlayerData()
    .then(playersData => {
      allPlayersData = playersData.map(player => ({
        ...player,
        fantasyPprPoints: (player.fantasy && typeof player.fantasy.pprPoints === 'number') ? player.fantasy.pprPoints : -Infinity,
        headshot: player.headshot || './AeroVista-Logo.png',
        // Add a simple ADP (Average Draft Position) value for AI drafting logic
        adp: (player.fantasy && typeof player.fantasy.pprPoints === 'number') 
            ? (player.fantasy.pprPoints * 0.8) + (Math.random() * 20) // Simple formula giving some randomness
            : 0
      }));
      loadMockTeam();
      initializeDraftState();
      if(loadingPlayersMessageEl) loadingPlayersMessageEl.classList.add("hidden");
    })
    .catch(error => {
      console.error("Error loading player data for mock draft:", error);
      if (loadingPlayersMessageEl) {
        loadingPlayersMessageEl.innerHTML = `
          <div class="text-red-500 p-4 rounded-lg">
            <p class="text-center font-semibold">Error loading player data</p>
            <p class="text-center text-sm">${error.message}</p>
            <button class="mt-2 mx-auto block bg-cyan-600 px-4 py-1 rounded text-white" onclick="location.reload()">Try Again</button>
          </div>
        `;
      }
    });

  function initializeDraftState() {
    // Clear previous draft state
    currentDraftRound = 1;
    currentDraftPick = 1;
    totalDraftPicks = 0;
    isAIDraftInProgress = false;
    aiTeams = Array(NUM_AI_TEAMS).fill().map(() => []); // Reset AI teams
    
    // Create snake draft order (1-12, then 12-1, then 1-12, etc.)
    draftOrder = [];
    const teamsInLeague = NUM_AI_TEAMS + 1; // Including user
    for (let round = 1; round <= MAX_TEAM_SIZE; round++) {
      const roundOrder = Array.from({length: teamsInLeague}, (_, i) => i); // 0 = user, 1-11 = AI teams
      if (round % 2 === 0) roundOrder.reverse(); // Snake draft - reverse order on even rounds
      draftOrder.push(...roundOrder);
    }
    
    // Set available players based on what's already been drafted
    const draftedPlayerIds = new Set(myMockTeam.map(p => p.playerId));
    availablePlayersPool = allPlayersData.filter(p => !draftedPlayerIds.has(p.playerId));
    
    // Update UI
    renderAvailablePlayers();
    renderMyMockTeam();
    updateDraftBoard();
    updateDraftRoundPick();
    
    // Enable the start AI draft button if it exists
    if (startAIDraftBtn) {
      startAIDraftBtn.disabled = false;
      startAIDraftBtn.textContent = "Start AI Draft";
    }
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
      playerDiv.innerHTML = `
        <div class="flex items-center">
          <img src="${player.headshot}" alt="${player.name}" class="w-8 h-8 rounded-full mr-3 object-cover border-2 border-gray-600">
          <div>
            <a href="player-page.html?id=${player.playerId}" target="_blank" class="font-semibold text-white hover:underline">${player.name}</a>
            <span class="text-xs text-gray-400 block">${player.position} - ${player.team || 'N/A'} (PPR: ${player.fantasyPprPoints !== -Infinity ? player.fantasyPprPoints.toFixed(1) : 'N/A'})</span>
          </div>
        </div>
        <button data-player-id="${player.playerId}" class="draft-btn bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm transition-all duration-150 ${isAIDraftInProgress && draftOrder[totalDraftPicks] !== 0 ? 'opacity-50 cursor-not-allowed' : ''}">Draft</button>
      `;
      availablePlayersListEl.appendChild(playerDiv);
    });

    document.querySelectorAll(".draft-btn").forEach(button => {
      button.removeEventListener("click", handleDraftPlayer);
      button.addEventListener("click", handleDraftPlayer);
      // Disable draft buttons during AI picks
      if (isAIDraftInProgress && draftOrder[totalDraftPicks] !== 0) {
        button.disabled = true;
      }
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
    if (button.disabled) return; // Don't proceed if button is disabled
    
    // Check if it's the user's turn to draft
    if (isAIDraftInProgress && draftOrder[totalDraftPicks] !== 0) {
      alert("Wait for your turn to draft!");
      return;
    }
    
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
      totalDraftPicks++;
      
      // Update UI
      renderAvailablePlayers(); 
      renderMyMockTeam();
      updateDraftBoard();
      updateDraftRoundPick();
      
      // If we're in AI draft mode, continue with AI picks
      if (isAIDraftInProgress) {
        continueAIDraft();
      }
    } else {
        console.warn("Attempted to draft player not found in available pool:", playerIdToDraft);
    }
  }
  
  function makeAIDraftPick() {
    if (!isAIDraftInProgress || totalDraftPicks >= draftOrder.length) return;
    
    const aiTeamIndex = draftOrder[totalDraftPicks] - 1; // -1 because 1-based for AI teams
    if (aiTeamIndex < 0) return; // User's turn
    
    const aiTeam = aiTeams[aiTeamIndex];
    let selectedPlayer;
    
    // Team-building logic for AI drafting
    const positionCounts = {
      QB: aiTeam.filter(p => p.position === 'QB').length,
      RB: aiTeam.filter(p => p.position === 'RB').length,
      WR: aiTeam.filter(p => p.position === 'WR').length,
      TE: aiTeam.filter(p => p.position === 'TE').length,
      K: aiTeam.filter(p => p.position === 'K').length,
      DEF: aiTeam.filter(p => p.position === 'DEF').length
    };
    
    // Simple drafting strategy based on team needs and round
    const currentRound = Math.floor(totalDraftPicks / (NUM_AI_TEAMS + 1)) + 1;
    
    // Clone array for manipulation
    let draftPool = [...availablePlayersPool];
    
    // Sort by ADP with some randomness for variety
    draftPool.sort((a, b) => (b.adp + (Math.random() * 5)) - (a.adp + (Math.random() * 5)));
    
    // Early rounds: Take best player available favoring RB/WR
    if (currentRound <= 5) {
      // Prioritize RB and WR in early rounds
      if (positionCounts.RB < 2 || positionCounts.WR < 3) {
        const preferredPool = draftPool.filter(p => p.position === 'RB' || p.position === 'WR');
        if (preferredPool.length > 0) {
          draftPool = preferredPool;
        }
      }
    } 
    // Middle rounds: Fill out skill positions
    else if (currentRound <= 10) {
      // Get a QB if needed
      if (positionCounts.QB === 0) {
        const qbPool = draftPool.filter(p => p.position === 'QB');
        if (qbPool.length > 0) {
          draftPool = qbPool;
        }
      } 
      // Get a TE if needed
      else if (positionCounts.TE === 0) {
        const tePool = draftPool.filter(p => p.position === 'TE');
        if (tePool.length > 0) {
          draftPool = tePool;
        }
      }
    } 
    // Late rounds: Get K and DEF
    else if (currentRound > 10) {
      // Get a K if needed
      if (positionCounts.K === 0) {
        const kPool = draftPool.filter(p => p.position === 'K');
        if (kPool.length > 0) {
          draftPool = kPool;
        }
      } 
      // Get a DEF if needed
      else if (positionCounts.DEF === 0) {
        const defPool = draftPool.filter(p => p.position === 'DEF');
        if (defPool.length > 0) {
          draftPool = defPool;
        }
      }
    }
    
    // Take the top player from our filtered and sorted pool
    selectedPlayer = draftPool[0];
    
    // Make the pick
    if (selectedPlayer) {
      const playerIndex = availablePlayersPool.findIndex(p => p.playerId === selectedPlayer.playerId);
      if (playerIndex > -1) {
        const [draftedPlayer] = availablePlayersPool.splice(playerIndex, 1);
        aiTeams[aiTeamIndex].push(draftedPlayer);
        totalDraftPicks++;
        
        // Update UI
        renderAvailablePlayers();
        updateDraftBoard();
        updateDraftRoundPick();
        
        // Highlight the pick in the draft board
        highlightLatestPick();
      }
    }
  }
  
  function continueAIDraft() {
    // Clear any existing timer
    if (aiDraftTimer) {
      clearTimeout(aiDraftTimer);
      aiDraftTimer = null;
    }
    
    // Check if draft is complete
    if (totalDraftPicks >= draftOrder.length) {
      isAIDraftInProgress = false;
      if (startAIDraftBtn) {
        startAIDraftBtn.disabled = false;
        startAIDraftBtn.textContent = "Reset & Restart Draft";
      }
      alert("Draft complete!");
      return;
    }
    
    // Check if it's user's turn
    if (draftOrder[totalDraftPicks] === 0) {
      // Enable draft buttons for user
      document.querySelectorAll(".draft-btn").forEach(button => {
        button.disabled = false;
      });
      return; // Wait for user to make a pick
    }
    
    // Make AI pick after a short delay
    aiDraftTimer = setTimeout(() => {
      makeAIDraftPick();
      continueAIDraft(); // Continue to next pick
    }, 500); // 500ms delay between AI picks
  }
  
  function updateDraftRoundPick() {
    if (!draftRoundEl || !draftPickEl) return;
    
    const teamsInLeague = NUM_AI_TEAMS + 1;
    currentDraftRound = Math.floor(totalDraftPicks / teamsInLeague) + 1;
    currentDraftPick = (totalDraftPicks % teamsInLeague) + 1;
    
    draftRoundEl.textContent = currentDraftRound;
    draftPickEl.textContent = currentDraftPick;
    
    // Update who's on the clock
    const onClockEl = document.getElementById("on-the-clock");
    if (onClockEl && totalDraftPicks < draftOrder.length) {
      const teamOnClock = draftOrder[totalDraftPicks];
      onClockEl.textContent = teamOnClock === 0 ? "You" : `Team ${teamOnClock}`;
      onClockEl.className = teamOnClock === 0 ? "text-cyan-400 font-bold" : "text-gray-300";
    }
  }
  
  function updateDraftBoard() {
    if (!draftBoardContainer) return;
    
    // Create draft board if it doesn't exist
    if (draftBoardContainer.children.length === 0) {
      let boardHTML = `<div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-600 text-xs">
          <thead class="bg-gray-800">
            <tr>
              <th class="px-2 py-1">Round</th>`;
      
      // Add column for each team
      for (let i = 0; i <= NUM_AI_TEAMS; i++) {
        const teamName = i === 0 ? "Your Team" : `Team ${i}`;
        boardHTML += `<th class="px-2 py-1">${teamName}</th>`;
      }
      
      boardHTML += `</tr>
          </thead>
          <tbody id="draft-board-body" class="divide-y divide-gray-600">`;
      
      // Add row for each round
      for (let round = 1; round <= MAX_TEAM_SIZE; round++) {
        boardHTML += `<tr class="${round % 2 === 0 ? 'bg-gray-750' : 'bg-gray-800'}">
          <td class="px-2 py-1 font-medium">${round}</td>`;
        
        // Add cell for each team in this round
        for (let team = 0; team <= NUM_AI_TEAMS; team++) {
          boardHTML += `<td class="px-2 py-1 draft-cell" id="draft-r${round}-t${team}">-</td>`;
        }
        
        boardHTML += `</tr>`;
      }
      
      boardHTML += `</tbody>
        </table>
      </div>`;
      
      draftBoardContainer.innerHTML = boardHTML;
    }
    
    // Fill in current picks
    // User team
    myMockTeam.forEach((player, index) => {
      const round = Math.floor(index / (NUM_AI_TEAMS + 1)) + 1;
      const cellId = `draft-r${round}-t0`;
      const cell = document.getElementById(cellId);
      if (cell) {
        cell.innerHTML = `<div class="truncate">${player.name} <span class="text-gray-400">${player.position}</span></div>`;
        cell.title = `${player.name} (${player.position} - ${player.team})`;
      }
    });
    
    // AI teams
    aiTeams.forEach((team, teamIndex) => {
      team.forEach((player, playerIndex) => {
        const round = Math.floor(playerIndex / (NUM_AI_TEAMS + 1)) + 1;
        const cellId = `draft-r${round}-t${teamIndex + 1}`;
        const cell = document.getElementById(cellId);
        if (cell) {
          cell.innerHTML = `<div class="truncate">${player.name} <span class="text-gray-400">${player.position}</span></div>`;
          cell.title = `${player.name} (${player.position} - ${player.team})`;
        }
      });
    });
  }
  
  function highlightLatestPick() {
    // Remove any existing highlight
    document.querySelectorAll('.draft-cell').forEach(cell => {
      cell.classList.remove('bg-cyan-900');
    });
    
    // Highlight the latest pick
    if (totalDraftPicks > 0) {
      const pickTeam = draftOrder[totalDraftPicks - 1];
      const round = Math.floor((totalDraftPicks - 1) / (NUM_AI_TEAMS + 1)) + 1;
      const cellId = `draft-r${round}-t${pickTeam}`;
      const cell = document.getElementById(cellId);
      if (cell) {
        cell.classList.add('bg-cyan-900');
      }
    }
  }
  
  // Reset/Start AI Draft Button
  if (startAIDraftBtn) {
    startAIDraftBtn.addEventListener("click", () => {
      // If already in progress, reset the draft
      if (isAIDraftInProgress) {
        // Clear the timer if it exists
        if (aiDraftTimer) {
          clearTimeout(aiDraftTimer);
          aiDraftTimer = null;
        }
        
        // Reset
        myMockTeam = [];
        sessionStorage.removeItem(MOCK_DRAFT_TEAM_KEY);
        initializeDraftState();
        return;
      }
      
      // Start the AI draft
      isAIDraftInProgress = true;
      startAIDraftBtn.disabled = true;
      startAIDraftBtn.textContent = "Draft in Progress...";
      
      // If it's the user's turn, wait for input
      if (draftOrder[totalDraftPicks] === 0) {
        updateDraftRoundPick();
        alert("It's your turn to draft! Select a player.");
      } else {
        continueAIDraft();
      }
    });
  }
  
  if(resetMockDraftBtn) {
    resetMockDraftBtn.addEventListener("click", () => {
      // Clear the timer if it exists
      if (aiDraftTimer) {
        clearTimeout(aiDraftTimer);
        aiDraftTimer = null;
      }
      
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

  if(mockDraftPlayerSearchEl) {
    mockDraftPlayerSearchEl.addEventListener("input", (e) => {
        currentMockDraftSearchQuery = e.target.value;
        renderAvailablePlayers();
    });
  }
}); 