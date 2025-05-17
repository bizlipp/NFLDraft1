import { initSearch } from './search.js';
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
    <button onclick="addToTeam('${player.id}')">Add</button>
  `;
}

function formatTeamCard(player) {
  return `
    <strong>${player.name}</strong> – ${player.position}<br/>
    <button onclick="removeFromTeam('${player.id}')">Remove</button>
  `;
}

// ====== Render Functions ======
function renderPlayerList() {
  if (!playerListEl) return;
  playerListEl.innerHTML = "";
  const combinedPlayers = [...allPlayers, customPlayer];

  combinedPlayers.forEach(player => {
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

// ====== Team Logic ======
window.addToTeam = function (playerId) {
  if (myTeam.length >= 11) {
    alert("Max team size reached!");
    return;
  }
  const player = [...allPlayers, customPlayer].find(p => p.id.toString() === playerId.toString());
  if (!player || myTeam.find(p => p.id === player.id)) return;
  myTeam.push(player);
  renderTeamList();
};

window.removeFromTeam = function (playerId) {
  myTeam = myTeam.filter(p => p.id.toString() !== playerId.toString());
  renderTeamList();
};

// ====== Fetch Data ======
async function loadPlayers() {
  try {
    const res = await fetch('data/nflPlayers.json');
    const json = await res.json();

    // Assign IDs if not already set
    allPlayers = json.nflPlayers.map((p, idx) => ({
      ...p,
      id: idx + 1,
      rating: p.rating || (p.fantasyPoints2024 ? Math.round(p.fantasyPoints2024 / 5) : 70) // quick fallback
    }));

    renderPlayerList();
    renderTeamList();
  } catch (err) {
    console.error("Failed to load NFL players:", err);
    playerListEl.innerHTML = "<p class='text-red-400'>Failed to load player data.</p>";
  }
}

// ====== Init ======
window.onload = () => {
  loadPlayers().then(() => {
    initSearch('search-input');
    initFlashcards();
  });
};
