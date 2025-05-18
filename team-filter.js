// team-filter.js
// Loads team rosters dynamically

const select = document.getElementById("team-select");
const roster = document.getElementById("team-roster");

const teamCodes = [
  "ARI", "ATL", "BAL", "BUF", "CAR", "CHI", "CIN", "CLE", "DAL", "DEN",
  "DET", "GB", "HOU", "IND", "JAX", "KC", "LAC", "LAR", "LV", "MIA",
  "MIN", "NE", "NO", "NYG", "NYJ", "PHI", "PIT", "SEA", "SF", "TB", "TEN", "WAS"
];

let allPlayers = []; // To store all players from the single JSON file

// Fetch all players once
fetch("./data/nfl_players_2025_enriched_full_final.json")
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then(playersData => {
    allPlayers = playersData;
    console.log("✅ Loaded", allPlayers.length, "players for team filtering.");
    // Optionally, populate the dropdown and trigger a change event for the initially selected team if needed
    // Or ensure the first team in teamCodes gets displayed by default if select.value is pre-set or first option
    if (select.value) { // If a team is already selected (e.g. first option)
        renderTeamRoster(select.value);
    }
  })
  .catch(error => {
    console.error("Error loading player data for team filter:", error);
    roster.innerHTML = "<p class='text-red-400'>Error loading player data. Please try again.</p>";
  });

teamCodes.forEach(code => {
  const option = document.createElement("option");
  option.value = code;
  option.textContent = code;
  select.appendChild(option);
});

function renderTeamRoster(team) {
  if (!allPlayers.length) {
    roster.innerHTML = "<p class='text-gray-400'>Player data is still loading or failed to load.</p>";
    return;
  }
  const teamPlayers = allPlayers.filter(p => p.team === team);
  if (teamPlayers.length === 0) {
    roster.innerHTML = `<p class='text-gray-400'>No players found for ${team} in the dataset.</p>`;
    return;
  }
  roster.innerHTML = teamPlayers.map(p => `
    <div class="bg-gray-800 p-4 rounded-xl shadow hover:bg-gray-700 cursor-pointer" onclick="location.href='player-page.html?id=${p.playerId}'">
      <h3 class="text-lg font-semibold text-cyan-300">${p.name}</h3>
      <p class="text-sm text-gray-400">${p.position} • ${p.college || 'N/A'}</p>
    </div>
  `).join("");
}

select.addEventListener("change", (e) => {
  const team = e.target.value;
  if (!team) return;
  renderTeamRoster(team);
});

// Initial load for the default selected team (if any)
// This might be redundant if the fetch().then() handles the initial render based on select.value
// Ensure a team is selected by default or handle the case where no team is initially selected
if (select.options.length > 0 && !select.value) {
  select.value = select.options[0].value; // Select the first team by default
}
// Call renderTeamRoster if allPlayers is already populated and a team is selected
// This ensures that if data loads fast, the initial view is populated.
// The fetch().then() block also calls this, covering cases where data loads after initial script exec.
if (allPlayers.length > 0 && select.value) {
    renderTeamRoster(select.value);
}
