// search.js (correct version for FantasyForge)

const input = document.querySelector("input[type='text']"); // This targets the search bar in dashboard.html
const searchResultsContainer = document.createElement("div");
// Ensure positioning relative to the search bar's parent if not already handled by CSS
searchResultsContainer.className = "absolute mt-1 w-full bg-gray-800 text-white rounded-md z-20 max-h-72 overflow-y-auto shadow-lg border border-gray-600 hidden";

// Attempt to append to the same container as the input for better layout control
if (input && input.parentElement) {
    input.parentElement.style.position = 'relative'; // Needed for absolute positioning of results
    input.parentElement.appendChild(searchResultsContainer);
} else {
    // Fallback if the specific DOM structure isn't found - this might not position ideally
    document.querySelector(".p-4")?.appendChild(searchResultsContainer);
}

let players = [];

// Get the base URL for GitHub Pages compatibility
const baseUrl = window.location.href.includes('github.io') 
  ? '/NFLDraft1' // GitHub Pages repository name
  : '';

fetch(`${baseUrl}/data/nfl_players_2025_enriched_full_final.json`)
  .then((res) => res.json())
  .then((data) => {
    players = data;
    console.log("🔍 Player data loaded for search:", players.length);
  })
  .catch(error => {
    console.error("Error loading player data for search:", error);
    if (input) input.placeholder = "Error loading player data!";
  });

input?.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase().trim();

  if (!query || players.length === 0) {
    searchResultsContainer.classList.add("hidden");
    return;
  }

  const matches = players.filter((p) => {
    const nameMatch = p.name.toLowerCase().includes(query);
    const teamMatch = p.team?.toLowerCase().includes(query);
    const positionMatch = p.position?.toLowerCase().includes(query);
    const collegeMatch = p.college?.toLowerCase().includes(query);
    const commentaryMatch = p.aiCommentary?.toLowerCase().includes(query);
    const tagMatch = p.tags && p.tags.some(t => t.toLowerCase().includes(query));
    const flagMatch = p.flags && p.flags.some(f => f.toLowerCase().includes(query));

    return nameMatch || teamMatch || positionMatch || collegeMatch || commentaryMatch || tagMatch || flagMatch;
  }).slice(0, 15); // Show up to 15 matches

  if (matches.length === 0) {
    searchResultsContainer.innerHTML = `<div class='p-3 text-sm text-gray-400 text-center'>No players match your search.</div>`;
  } else {
    searchResultsContainer.innerHTML = matches.map((p) => `
      <div class="p-3 hover:bg-gray-700 cursor-pointer text-sm border-b border-gray-700 last:border-b-0 flex items-center gap-3" data-id="${p.playerId}">
        <img src="${p.headshot || (baseUrl + '/AeroVista-Logo.png')}" alt="${p.name}" class="w-8 h-8 rounded-full object-cover">
        <div>
            <strong>${p.name}</strong> – ${p.position} (${p.team || 'N/A'})
            <div class="text-xs text-gray-400">${p.college || ''}</div>
        </div>
      </div>
    `).join("");
  }

  searchResultsContainer.classList.remove("hidden");
});

// Global click listener to hide search results when clicking outside
document.addEventListener('click', function(event) {
    if (input && !input.contains(event.target) && !searchResultsContainer.contains(event.target)) {
        searchResultsContainer.classList.add('hidden');
    }
});

// Event delegation for clicking on a search result
searchResultsContainer.addEventListener("click", (event) => {
    const targetElement = event.target.closest("[data-id]"); // Find the parent with data-id
    if (targetElement) {
        const id = targetElement.getAttribute("data-id");
        window.location.href = `${baseUrl}/player-page.html?id=${id}`;
        searchResultsContainer.classList.add("hidden");
        if(input) input.value = ''; // Clear search input after selection
    }
});
