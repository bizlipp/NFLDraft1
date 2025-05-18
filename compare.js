// compare.js

const container = document.getElementById("compare-grid");
const params = new URLSearchParams(window.location.search);
const a = params.get("a");
const b = params.get("b");

if (!a || !b) {
  container.innerHTML = `<p class='text-red-400'>Missing player IDs in query. Use ?a=12345&b=67890</p>`;
} else {
  fetch("./data/nfl_players_2025_enriched.json")
    .then(res => res.json())
    .then(data => {
      const playerA = data.find(p => p.playerId == a);
      const playerB = data.find(p => p.playerId == b);

      if (!playerA || !playerB) {
        container.innerHTML = `<p class='text-red-400'>One or both players not found</p>`;
        return;
      }

      const players = [playerA, playerB];
      container.innerHTML = players.map(p => `
        <div class="bg-gray-800 p-4 rounded-xl shadow text-center">
          <img src="${p.headshot || './placeholder.png'}" alt="${p.name}" class="w-24 h-24 rounded-full mx-auto mb-2 border-4 border-cyan-500" />
          <h2 class="text-xl font-bold text-cyan-300">${p.name}</h2>
          <div class="text-gray-400 text-sm mb-3">${p.position} • ${p.team}</div>
          <ul class="text-sm text-left text-gray-300 space-y-1">
            <li><strong>College:</strong> ${p.college || '-'}</li>
            <li><strong>Height/Weight:</strong> ${p.height || '-'} / ${p.weight || '-'}</li>
            <li><strong>Fantasy Pts (PPR):</strong> ${p.fantasy?.pprPoints || '-'}</li>
            <li><strong>TDs:</strong> ${p.stats?.['2024']?.touchdowns || '-'}</li>
            <li><strong>Yards:</strong> ${p.stats?.['2024']?.passingYards || p.stats?.['2024']?.receivingYards || '-'}</li>
            <li><strong>INTs:</strong> ${p.stats?.['2024']?.interceptions || '-'}</li>
          </ul>
          <div class="mt-3">
            <a href="player-page.html?id=${p.playerId}" class="inline-block mt-2 text-cyan-400 hover:underline text-sm">View Full Page</a>
          </div>
        </div>
      `).join('');
    });
}
