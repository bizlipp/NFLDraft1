import { initSearch, getCurrentSearchQuery } from './search.js';
import { initFlashcards } from './flashcards.js';

// ====== Data Load ======
export let allPlayers = [];
export let customPlayer = {
  id: "YOU",
  name: "Timbr the Titan",
  team: "AeroVista",
  position: "QB",
  rating: 99,
  fantasyPoints2024: 500,
  notes: "Custom-built legend. Unstoppable presence on the digital gridiron."
};

let myTeam = [];

const rosterSettings = {
  QB: 1,
  RB: 2,
  WR: 2,
  TE: 1,
  FLEX: 1,
  K: 1,
  DST: 1,
  TOTAL: 9
};
const flexEligiblePositions = ['RB', 'WR', 'TE'];
let currentPositionFilter = 'All'; // State for position filter

// ====== DOM Elements ======
const playerListEl = document.getElementById("player-list");
const teamListEl = document.getElementById("team-list");

// ====== Utility Functions ======
export function formatPlayerCard(player) {
  return `
    <strong>${player.name}</strong> (${player.position} – ${player.team})<br/>
    ⭐ Rating: ${player.rating || "N/A"} | 🧮 2024 PPR: ${player.fantasyPoints2024 || "?"}
    <br><em>${player.notes || ""}</em>
    <br/>
    <button onclick="window.addToTeam('${player.id}')">Add to Team</button>
    <button onclick="window.addToCompare('${player.id}')">Add to Compare</button> 
  `;
}

function formatTeamCard(player) {
  return `
    <strong>${player.name}</strong> – ${player.position}<br/>
    <button onclick="removeFromTeam('${player.id}')">Remove</button>
  `;
}

// ====== Render Functions ======
// Combined function to render player list based on filters and search
export function displayPlayers() { // Export for search.js to call
  if (!playerListEl) return;
  playerListEl.innerHTML = "";
  
  let playersToDisplay = [...allPlayers, customPlayer];

  // 1. Apply Position Filter
  if (currentPositionFilter !== 'All') {
    playersToDisplay = playersToDisplay.filter(p => p.position === currentPositionFilter);
  }

  // 2. Apply Search Query (from search.js)
  const searchQuery = getCurrentSearchQuery(); // Get query from search.js
  if (searchQuery) {
    playersToDisplay = playersToDisplay.filter(player => {
      return (
        player.name.toLowerCase().includes(searchQuery) ||
        (player.team && player.team.toLowerCase().includes(searchQuery)) ||
        player.position.toLowerCase().includes(searchQuery) ||
        (player.notes && player.notes.toLowerCase().includes(searchQuery)) ||
        (player.fantasyPoints2024 && player.fantasyPoints2024.toString().includes(searchQuery)) ||
        (player.rating && player.rating.toString().includes(searchQuery))
      );
    });
  }

  playersToDisplay.forEach(player => {
    const el = document.createElement("div");
    el.className = "player-card";
    el.innerHTML = formatPlayerCard(player);
    playerListEl.appendChild(el);
  });
}

function renderTeamList() {
  if (!teamListEl) return;
  teamListEl.innerHTML = "";
  myTeam.forEach(player => {
    const el = document.createElement("div");
    el.className = "team-card";
    el.innerHTML = formatTeamCard(player);
    teamListEl.appendChild(el);
  });
}

// ====== Filter Logic ======
window.filterPlayersByPosition = function(position) {
  currentPositionFilter = position;
  // Update active button style
  document.querySelectorAll('#position-filters .pos-filter-btn').forEach(btn => {
    btn.classList.remove('active-filter');
    if (btn.innerText === position) {
      btn.classList.add('active-filter');
    }
  });
  displayPlayers(); // Re-render player list with new filter
};

// ====== Team Logic ======
window.addToTeam = function (playerId) {
  const playerToAdd = [...allPlayers, customPlayer].find(p => p.id.toString() === playerId.toString());

  if (!playerToAdd) return; // Player not found
  if (myTeam.find(p => p.id === playerToAdd.id)) {
    alert(`${playerToAdd.name} is already on your team.`);
    return;
  }

  if (myTeam.length >= rosterSettings.TOTAL) {
    alert(`Team full! Maximum ${rosterSettings.TOTAL} players allowed.`);
    return;
  }

  const positionCounts = myTeam.reduce((counts, player) => {
    counts[player.position] = (counts[player.position] || 0) + 1;
    return counts;
  }, {});

  const currentPositionCount = positionCounts[playerToAdd.position] || 0;

  // Specific position check (QB, K, DST)
  if (['QB', 'K', 'DST'].includes(playerToAdd.position)) {
    if (currentPositionCount < rosterSettings[playerToAdd.position]) {
      myTeam.push(playerToAdd);
    } else {
      alert(`Cannot add ${playerToAdd.name}. All ${playerToAdd.position} slots are full.`);
      return;
    }
  } else if (flexEligiblePositions.includes(playerToAdd.position)) {
    // RB, WR, TE - check primary slot first, then FLEX
    if (currentPositionCount < rosterSettings[playerToAdd.position]) {
      myTeam.push(playerToAdd);
    } else {
      // Primary slots for this position are full, try FLEX
      const flexPlayersCount = myTeam.filter(p => {
        // Count players in flex-eligible positions whose primary slots are full
        const primarySlotsFull = (positionCounts[p.position] || 0) >= rosterSettings[p.position];
        return flexEligiblePositions.includes(p.position) && primarySlotsFull;
      }).length;
      // This logic is slightly off. A simpler flex count is needed.
      // Simpler: Count total RBs, WRs, TEs. If sum is less than sum of their dedicated slots + FLEX slots.
      const numRBs = positionCounts['RB'] || 0;
      const numWRs = positionCounts['WR'] || 0;
      const numTEs = positionCounts['TE'] || 0;
      const totalFlexEligiblePlayersInTeam = numRBs + numWRs + numTEs;
      const dedicatedFlexEligibleSlots = rosterSettings.RB + rosterSettings.WR + rosterSettings.TE;
      
      // Available flex slots = total dedicated flex-eligible slots + FLEX specific slots - current flex-eligible players
      // This needs to count players who *could* be flex, and how many dedicated slots are used by them.
      let flexSpotsUsed = 0;
      flexEligiblePositions.forEach(pos => {
        const count = positionCounts[pos] || 0;
        if (count > rosterSettings[pos]) {
          flexSpotsUsed += (count - rosterSettings[pos]);
        }
      });

      if (flexSpotsUsed < rosterSettings.FLEX) {
        myTeam.push(playerToAdd); // Add as a FLEX player
      } else {
        alert(`Cannot add ${playerToAdd.name}. All ${playerToAdd.position} and FLEX slots are full.`);
        return;
      }
    }
  } else {
    // For any other positions not defined in rosterSettings (should not happen with current data)
    alert(`Position ${playerToAdd.position} not recognized for roster rules.`);
    return;
  }

  renderTeamList();
  saveTeamToLocalStorage();
};

window.removeFromTeam = function (playerId) {
  myTeam = myTeam.filter(p => p.id.toString() !== playerId.toString());
  renderTeamList();
  saveTeamToLocalStorage();
};

// ====== localStorage Functions ======
function saveTeamToLocalStorage() {
  localStorage.setItem('myFantasyTeam', JSON.stringify(myTeam.map(p => p.id))); // Save only IDs
}

function loadTeamFromLocalStorage() {
  const savedTeamIds = JSON.parse(localStorage.getItem('myFantasyTeam'));
  if (savedTeamIds && Array.isArray(savedTeamIds)) {
    const fullPlayerObjects = [...allPlayers, customPlayer];
    myTeam = savedTeamIds.map(id => fullPlayerObjects.find(p => p.id.toString() === id.toString())).filter(p => p); // Find players by ID and filter out any not found
  }
}

// ====== Fetch Data ======
async function loadPlayers() {
  try {
    const res = await fetch('data/nflPlayers.json');
    const json = await res.json();
    allPlayers = json.nflPlayers.map((p, idx) => ({
      ...p,
      id: idx + 1,
      rating: p.rating || (p.fantasyPoints2024 ? Math.round(p.fantasyPoints2024 / 5) : 70)
    }));
    // renderPlayerList(); // Now called by displayPlayers initially
    displayPlayers(); // Initial render
    renderTeamList();
  } catch (err) {
    console.error("Failed to load NFL players:", err);
    if (playerListEl) playerListEl.innerHTML = "<p class='text-red-400'>Failed to load player data.</p>";
  }
}

// ====== Init ======
window.onload = () => {
  initSearch(); // Initialize search (it will call displayPlayers on input)
  loadPlayers().then(() => {
    loadTeamFromLocalStorage();
    renderTeamList(); // Render loaded team
    // displayPlayers(); // Already called in loadPlayers and after filter change
    initFlashcards();
  });
};
