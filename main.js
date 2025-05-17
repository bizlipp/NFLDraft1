// ===== MOCK DATA: Replace with real stats later =====
const allPlayers = [
  { id: 1, name: "Patrick Mahomes", team: "KC", position: "QB", rating: 97 },
  { id: 2, name: "Christian McCaffrey", team: "SF", position: "RB", rating: 96 },
  { id: 3, name: "Justin Jefferson", team: "MIN", position: "WR", rating: 95 },
  // Add more players here...
];

// ===== YOUR CUSTOM PLAYER (fill in later) =====
let customPlayer = {
  id: "YOU",
  name: "Timbr the Titan",
  team: "AeroVista",
  position: "QB",
  rating: 99
};

// ===== Your Dream Team =====
let myTeam = [];

// ===== DOM Hooks =====
const playerListEl = document.getElementById("player-list");
const teamListEl = document.getElementById("team-list");

// ===== Render Functions =====
function renderPlayerList() {
  playerListEl.innerHTML = "";
  [...allPlayers, customPlayer].forEach((player) => {
    const el = document.createElement("div");
    el.className = "player-card";
    el.innerHTML = `
      <strong>${player.name}</strong> (${player.position} - ${player.team}) – Rating: ${player.rating}
      <button onclick="addToTeam('${player.id}')">Add</button>
    `;
    playerListEl.appendChild(el);
  });
}

function renderTeamList() {
  teamListEl.innerHTML = "";
  myTeam.forEach((player) => {
    const el = document.createElement("div");
    el.className = "team-card";
    el.innerHTML = `
      <strong>${player.name}</strong> – ${player.position}
      <button onclick="removeFromTeam('${player.id}')">Remove</button>
    `;
    teamListEl.appendChild(el);
  });
}

// ===== Logic =====
function addToTeam(playerId) {
  if (myTeam.length >= 11) {
    alert("Max team size reached!");
    return;
  }
  const player = [...allPlayers, customPlayer].find(p => p.id.toString() === playerId.toString());
  if (myTeam.find(p => p.id === player.id)) return; // avoid duplicates
  myTeam.push(player);
  renderTeamList();
}

function removeFromTeam(playerId) {
  myTeam = myTeam.filter(p => p.id.toString() !== playerId.toString());
  renderTeamList();
}

// ===== Init =====
renderPlayerList();
renderTeamList();
