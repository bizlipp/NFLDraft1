// search.js (correct version for FantasyForge)

const input = document.querySelector("input[type='text']");
const resultsContainer = document.createElement("div");
resultsContainer.className = "absolute top-full mt-1 left-0 right-0 bg-gray-800 text-white rounded-md z-20 max-h-64 overflow-y-auto shadow-lg border border-gray-600 hidden";
document.querySelector(".p-4")?.appendChild(resultsContainer);

let players = [];

fetch("./data/nfl_players_2025_enriched.json")
  .then((res) => res.json())
  .then((data) => {
    players = data;
    console.log("🔍 Player data loaded:", players.length);
  });

input.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();

  if (!query || players.length === 0) {
    resultsContainer.classList.add("hidden");
    return;
  }

  const matches = players.filter((p) => {
    return (
      p.name.toLowerCase().includes(query) ||
      p.team.toLowerCase().includes(query) ||
      p.position.toLowerCase().includes(query) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(query)))
    );
  }).slice(0, 10);

  if (matches.length === 0) {
    resultsContainer.innerHTML = `<div class='p-2 text-sm text-gray-400'>No matches found</div>`;
  } else {
    resultsContainer.innerHTML = matches.map((p) => `
      <div class="p-2 hover:bg-gray-700 cursor-pointer text-sm border-b border-gray-700" data-id="${p.playerId}">
        <strong>${p.name}</strong> – ${p.position} (${p.team})
      </div>
    `).join("");
  }

  resultsContainer.classList.remove("hidden");

  resultsContainer.querySelectorAll("[data-id]").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-id");
      window.location.href = `player-page.html?id=${id}`;
    });
  });
});
