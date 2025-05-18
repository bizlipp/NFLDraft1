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
    
    // Skip if this AI team is already full
    if (aiTeams[aiTeamIndex].length >= MAX_TEAM_SIZE) {
      totalDraftPicks++;
      updateDraftRoundPick();
      return;
    }
    
    // Skip if there are no available players
    if (availablePlayersPool.length === 0) {
      totalDraftPicks++;
      updateDraftRoundPick();
      return;
    }
    
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
    selectedPlayer = draftPool.length > 0 ? draftPool[0] : null;
    
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
      } else {
        // Somehow player not found in pool, increment counter and move on
        totalDraftPicks++;
        updateDraftRoundPick();
      }
    } else {
      // No suitable player, increment counter and move on
      totalDraftPicks++;
      updateDraftRoundPick();
    }
  }
  
  function continueAIDraft() {
    // Clear any existing timer
    if (aiDraftTimer) {
      clearTimeout(aiDraftTimer);
      aiDraftTimer = null;
    }
    
    // Check if draft is complete - either by total picks or if all teams are full
    const teamsInLeague = NUM_AI_TEAMS + 1;
    const maxPossiblePicks = teamsInLeague * MAX_TEAM_SIZE;
    
    const isUserTeamFull = myMockTeam.length >= MAX_TEAM_SIZE;
    const areAITeamsFull = aiTeams.every(team => team.length >= MAX_TEAM_SIZE);
    
    if (totalDraftPicks >= maxPossiblePicks || (isUserTeamFull && areAITeamsFull)) {
      isAIDraftInProgress = false;
      if (startAIDraftBtn) {
        startAIDraftBtn.disabled = false;
        startAIDraftBtn.textContent = "Reset & Restart Draft";
      }
      showDraftAnalysis();
      return;
    }
    
    // Check if we've reached the end of the draft order array
    if (totalDraftPicks >= draftOrder.length) {
      isAIDraftInProgress = false;
      if (startAIDraftBtn) {
        startAIDraftBtn.disabled = false;
        startAIDraftBtn.textContent = "Reset & Restart Draft";
      }
      showDraftAnalysis();
      return;
    }
    
    // Check if it's the user's turn and their team is already full
    if (draftOrder[totalDraftPicks] === 0 && myMockTeam.length >= MAX_TEAM_SIZE) {
      // Skip user's turn if their team is full
      totalDraftPicks++;
      updateDraftRoundPick();
      continueAIDraft();
      return;
    }
    
    // Check if it's an AI team's turn and that team is already full
    if (draftOrder[totalDraftPicks] > 0) {
      const aiTeamIndex = draftOrder[totalDraftPicks] - 1;
      if (aiTeams[aiTeamIndex].length >= MAX_TEAM_SIZE) {
        // Skip this AI team's turn if their team is full
        totalDraftPicks++;
        updateDraftRoundPick();
        continueAIDraft();
        return;
      }
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
  
  function showDraftAnalysis() {
    // Create the analysis modal container if it doesn't exist
    let analysisModal = document.getElementById('draft-analysis-modal');
    if (!analysisModal) {
      analysisModal = document.createElement('div');
      analysisModal.id = 'draft-analysis-modal';
      analysisModal.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75 p-4';
      document.body.appendChild(analysisModal);
    }
    
    // Analyze all teams (user + AI)
    const allTeams = [myMockTeam, ...aiTeams];
    const teamAnalyses = [];
    
    // Calculate fantasy points for each team
    const teamScores = allTeams.map((team, index) => {
      // Sum PPR points for the team, ignoring kickers and defense
      let pprPointsTotal = team.reduce((sum, player) => {
        if (player.position !== 'K' && player.position !== 'DEF' && typeof player.fantasyPprPoints === 'number') {
          return sum + player.fantasyPprPoints;
        }
        return sum;
      }, 0);
      
      // Count positions
      const positionCounts = {
        QB: team.filter(p => p.position === 'QB').length,
        RB: team.filter(p => p.position === 'RB').length,
        WR: team.filter(p => p.position === 'WR').length,
        TE: team.filter(p => p.position === 'TE').length,
        K: team.filter(p => p.position === 'K').length,
        DEF: team.filter(p => p.position === 'DEF').length
      };
      
      // Top player on the team
      const topPlayer = [...team].sort((a, b) => 
        (b.fantasyPprPoints || 0) - (a.fantasyPprPoints || 0)
      )[0];
      
      return {
        teamIndex: index,
        teamName: index === 0 ? 'Your Team' : `Team ${index}`,
        pprPoints: pprPointsTotal.toFixed(1),
        positionCounts,
        topPlayer: topPlayer ? { 
          name: topPlayer.name, 
          position: topPlayer.position, 
          points: topPlayer.fantasyPprPoints 
        } : null,
        needsQB: positionCounts.QB === 0,
        needsRB: positionCounts.RB < 2,
        needsWR: positionCounts.WR < 2,
        needsTE: positionCounts.TE === 0,
        needsK: positionCounts.K === 0,
        needsDEF: positionCounts.DEF === 0
      };
    });
    
    // Sort by PPR points (highest first)
    teamScores.sort((a, b) => parseFloat(b.pprPoints) - parseFloat(a.pprPoints));
    
    // Find the user's rank
    const userRank = teamScores.findIndex(t => t.teamIndex === 0) + 1;
    
    // Find the best value pick for user's team - a pick that was drafted much later than their projected value
    let bestValuePick = null;
    if (myMockTeam.length > 0) {
      myMockTeam.forEach((player, pickIndex) => {
        if (player.adp && pickIndex > 0) {
          const valueScore = player.adp - pickIndex;
          if (!bestValuePick || valueScore > bestValuePick.valueScore) {
            bestValuePick = {
              player,
              valueScore,
              round: pickIndex + 1 // 1-indexed round
            };
          }
        }
      });
    }
    
    // Generate analysis HTML
    let analysisHTML = `
      <div class="bg-gray-800 rounded-xl shadow-xl max-w-4xl max-h-[90vh] overflow-auto">
        <div class="p-6 border-b border-gray-700">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-white">Draft Analysis</h2>
            <button id="close-analysis" class="text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <!-- User Team Overview -->
          <div class="bg-gradient-to-r from-gray-700 to-gray-800 p-4 rounded-lg mb-6">
            <h3 class="text-xl font-semibold mb-2 text-cyan-300">Your Team Overview</h3>
            <p class="mb-2">Your team ranked <span class="font-bold text-${userRank <= 3 ? 'green' : userRank <= 6 ? 'yellow' : 'red'}-400">#${userRank}</span> out of ${teamScores.length} teams with <span class="font-bold">${teamScores.find(t => t.teamIndex === 0)?.pprPoints}</span> projected PPR points.</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 class="font-semibold text-white mb-2">Position Breakdown:</h4>
                <div class="flex flex-wrap gap-2">
                  ${Object.entries(teamScores.find(t => t.teamIndex === 0)?.positionCounts || {}).map(([pos, count]) => 
                    `<span class="px-2 py-1 rounded bg-gray-600 text-sm">${pos}: ${count}</span>`
                  ).join('')}
                </div>
              </div>
              
              <div>
                <h4 class="font-semibold text-white mb-2">Team Needs:</h4>
                <div class="flex flex-wrap gap-2">
                  ${(() => {
                    const needs = [];
                    const userTeam = teamScores.find(t => t.teamIndex === 0);
                    if (userTeam) {
                      if (userTeam.needsQB) needs.push('<span class="px-2 py-1 rounded bg-red-900 text-red-100 text-sm">QB</span>');
                      if (userTeam.needsRB) needs.push('<span class="px-2 py-1 rounded bg-red-900 text-red-100 text-sm">RB</span>');
                      if (userTeam.needsWR) needs.push('<span class="px-2 py-1 rounded bg-red-900 text-red-100 text-sm">WR</span>');
                      if (userTeam.needsTE) needs.push('<span class="px-2 py-1 rounded bg-red-900 text-red-100 text-sm">TE</span>');
                      if (userTeam.needsK) needs.push('<span class="px-2 py-1 rounded bg-red-900 text-red-100 text-sm">K</span>');
                      if (userTeam.needsDEF) needs.push('<span class="px-2 py-1 rounded bg-red-900 text-red-100 text-sm">DEF</span>');
                    }
                    return needs.length > 0 ? needs.join('') : '<span class="px-2 py-1 rounded bg-green-900 text-green-100 text-sm">Team Complete!</span>';
                  })()}
                </div>
              </div>
            </div>
            
            ${bestValuePick ? 
              `<div class="mt-4">
                <h4 class="font-semibold text-white mb-2">Best Value Pick:</h4>
                <div class="p-3 bg-gray-700 rounded flex items-center">
                  <div class="bg-yellow-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05c-.867 3.14-.3 5.63 1.132 7.49.761.99 1.73 1.79 2.801 2.34 1.025.528 2.176.935 3.341 1.176a1 1 0 00.715-.288c.496-.53.84-1.19 1.086-1.855.247-.67.415-1.386.535-2.11.16-.946.277-1.89.372-2.83.416-4.1-1.285-6.97-2.637-8.22z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-white">${bestValuePick.player.name} (${bestValuePick.player.position})</p>
                    <p class="text-sm text-gray-300">Drafted in round ${bestValuePick.round} - Great value pick!</p>
                  </div>
                </div>
              </div>` 
            : ''}
          </div>
          
          <!-- League Rankings -->
          <div class="mb-6">
            <h3 class="text-xl font-semibold mb-4 text-cyan-300">League Rankings</h3>
            <div class="space-y-3">
              ${teamScores.map((team, index) => `
                <div class="flex items-center p-3 ${team.teamIndex === 0 ? 'bg-gray-700' : 'bg-gray-800'} rounded-lg">
                  <div class="flex-shrink-0 w-8 h-8 rounded-full ${index < 3 ? ['bg-yellow-500', 'bg-gray-300', 'bg-amber-700'][index] : 'bg-gray-600'} flex items-center justify-center mr-3 font-bold">
                    ${index + 1}
                  </div>
                  <div class="flex-1">
                    <p class="font-medium ${team.teamIndex === 0 ? 'text-cyan-300' : 'text-white'}">${team.teamName}</p>
                    <div class="flex text-xs text-gray-400 mt-1">
                      <span class="mr-3">PPR: ${team.pprPoints}</span>
                      <span>QB: ${team.positionCounts.QB}</span>
                      <span class="mx-1">·</span>
                      <span>RB: ${team.positionCounts.RB}</span>
                      <span class="mx-1">·</span>
                      <span>WR: ${team.positionCounts.WR}</span>
                      <span class="mx-1">·</span>
                      <span>TE: ${team.positionCounts.TE}</span>
                    </div>
                  </div>
                  ${team.topPlayer ? 
                    `<div class="text-right">
                      <p class="text-sm font-medium text-gray-300">Best Player</p>
                      <p class="text-xs text-cyan-300">${team.topPlayer.name} (${team.topPlayer.position})</p>
                    </div>` 
                  : ''}
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="mt-6 text-center">
            <button id="close-analysis-btn" class="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition-colors">
              Close Analysis
            </button>
          </div>
        </div>
      </div>
    `;
    
    analysisModal.innerHTML = analysisHTML;
    
    // Add event listeners to close buttons
    document.getElementById('close-analysis').addEventListener('click', () => {
      analysisModal.remove();
    });
    
    document.getElementById('close-analysis-btn').addEventListener('click', () => {
      analysisModal.remove();
    });
    
    // Show an alert that draft is complete
    alert("Draft complete! Showing analysis...");
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
    
    // We don't reset all cells to empty anymore
    // Instead, we'll update only the cells that need updating
    
    // Process user team picks (team 0)
    myMockTeam.forEach((player, index) => {
      if (index >= MAX_TEAM_SIZE) return; // Skip if we somehow have more than max team size
      
      // Find which round this pick belongs to
      const round = index + 1; // User picks go one per round
      
      const cellId = `draft-r${round}-t0`;
      const cell = document.getElementById(cellId);
      if (cell) {
        cell.innerHTML = `<div class="truncate">${player.name} <span class="text-gray-400">${player.position}</span></div>`;
        cell.title = `${player.name} (${player.position} - ${player.team})`;
      }
    });
    
    // Process AI team picks
    aiTeams.forEach((team, teamIndex) => {
      const teamId = teamIndex + 1; // AI teams start at index 1
      
      team.forEach((player, index) => {
        if (index >= MAX_TEAM_SIZE) return; // Skip if we somehow have more than max team size
        
        // Find which round this pick belongs to
        const round = index + 1; // Each AI team gets one pick per round
        
        const cellId = `draft-r${round}-t${teamId}`;
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
    if (totalDraftPicks > 0 && totalDraftPicks <= draftOrder.length) {
      const pickTeam = draftOrder[totalDraftPicks - 1];
      const teamsInLeague = NUM_AI_TEAMS + 1;
      const round = Math.floor((totalDraftPicks - 1) / teamsInLeague) + 1;
      
      // Only highlight if within our max team size
      if (round <= MAX_TEAM_SIZE) {
        const cellId = `draft-r${round}-t${pickTeam}`;
        const cell = document.getElementById(cellId);
        if (cell) {
          cell.classList.add('bg-cyan-900');
        }
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
      aiTeams = Array(NUM_AI_TEAMS).fill().map(() => []); // Reset AI teams as well
      currentMockDraftSearchQuery = ""; // Reset search on draft reset
      if(mockDraftPlayerSearchEl) mockDraftPlayerSearchEl.value = "";
      sessionStorage.removeItem(MOCK_DRAFT_TEAM_KEY);
      
      // Reset draft state completely
      totalDraftPicks = 0;
      currentDraftRound = 1;
      currentDraftPick = 1;
      isAIDraftInProgress = false;
      
      // Fully refresh the UI
      initializeDraftState();
      
      // If start AI draft button exists, reset its state
      if (startAIDraftBtn) {
        startAIDraftBtn.disabled = false;
        startAIDraftBtn.textContent = "Start AI Draft";
      }
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