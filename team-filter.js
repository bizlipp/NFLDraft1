// team-filter.js
// Loads team rosters dynamically

const select = document.getElementById("team-select");
const roster = document.getElementById("team-roster");

const teamCodes = [
  "ARI", "ATL", "BAL", "BUF", "CAR", "CHI", "CIN", "CLE", "DAL", "DEN",
  "DET", "GB", "HOU", "IND", "JAX", "KC", "LAC", "LAR", "LV", "MIA",
  "MIN", "NE", "NO", "NYG", "NYJ", "PHI", "PIT", "SEA", "SF", "TB", "TEN", "WAS"
];

teamCodes.forEach(code => {
  const option = document.createElement("option");
  option.value = code;
  option.textContent = code;
  select.appendChild(option);
});

select.addEventListener("change", (e) => {
  const team = e.target.value;
  if (!team) return;

  fetch(`./data/teams/${team}.json`)
    .then(res => res.json())
    .then(players => {
      roster.innerHTML = players.map(p => `
        <div class="bg-gray-800 p-4 rounded-xl shadow hover:bg-gray-700 cursor-pointer" onclick="location.href='player-page.html?id=${p.playerId}'">
          <h3 class="text-lg font-semibold text-cyan-300">${p.name}</h3>
          <p class="text-sm text-gray-400">${p.position} • ${p.college || 'N/A'}</p>
        </div>
      `).join("");
    });
});
