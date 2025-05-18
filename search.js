// search.js - Global player search functionality

// Initialize players array and function to get all search inputs
let players = [];
let searchInputs = [];

// Find all search inputs in the document after it's loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeSearch();
});

// Function to initialize search that can be called from other modules
function initializeSearch() {
  // Get the global search from header
  const globalSearchInput = document.getElementById('global-search-input');
  const globalSearchResults = document.getElementById('global-search-results');
  
  // Get any page-specific search inputs
  const pageSearchInputs = document.querySelectorAll("input[type='text'][placeholder*='search' i], input[type='text'][placeholder*='player' i]");
  
  searchInputs = [];
  
  // Add global search if it exists
  if (globalSearchInput && globalSearchResults) {
    searchInputs.push({
      input: globalSearchInput,
      results: globalSearchResults
    });
    globalSearchInput.parentElement.style.position = 'relative';
  }
  
  // Add any other search inputs if they don't have results containers yet
  pageSearchInputs.forEach(input => {
    // Skip the global search input we already added
    if (input === globalSearchInput) return;
    
    // Create a results container if one doesn't exist
    let resultsContainer = input.nextElementSibling;
    if (!resultsContainer || !resultsContainer.classList.contains('search-results')) {
      resultsContainer = document.createElement('div');
      resultsContainer.className = 'absolute mt-1 w-full bg-gray-800 text-white rounded-md z-20 max-h-72 overflow-y-auto shadow-lg border border-gray-600 hidden search-results';
      input.parentElement.style.position = 'relative';
      input.parentElement.appendChild(resultsContainer);
    }
    
    searchInputs.push({
      input,
      results: resultsContainer
    });
  });
  
  // Load player data if we haven't already
  if (players.length === 0) {
    loadPlayerData();
  }
  
  // Add event listeners to all search inputs
  searchInputs.forEach(({ input, results }) => {
    // Input event for displaying search results
    input.addEventListener('input', (e) => handleSearch(e, input, results));
    
    // Click event on results
    results.addEventListener('click', (event) => {
      const targetElement = event.target.closest("[data-id]");
      if (targetElement) {
        const id = targetElement.getAttribute("data-id");
        window.location.href = `player-page.html?id=${id}`;
        results.classList.add("hidden");
        input.value = ''; // Clear search input after selection
      }
    });
  });
  
  // Global click listener to hide search results when clicking outside
  document.addEventListener('click', function(event) {
    searchInputs.forEach(({ input, results }) => {
      if (!input.contains(event.target) && !results.contains(event.target)) {
        results.classList.add('hidden');
      }
    });
  });
}

// Get the player data from data-service
function loadPlayerData() {
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
      searchInputs.forEach(({ input }) => {
        input.placeholder = "Error loading player data!";
      });
    });
}

// Handle search input
function handleSearch(e, input, resultsContainer) {
  const query = e.target.value.toLowerCase().trim();

  if (!query || players.length === 0) {
    resultsContainer.classList.add("hidden");
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

  // Get the base URL for GitHub Pages compatibility
  const baseUrl = window.location.href.includes('github.io') 
    ? '/NFLDraft1' // GitHub Pages repository name
    : '';

  if (matches.length === 0) {
    resultsContainer.innerHTML = `<div class='p-3 text-sm text-gray-400 text-center'>No players match your search.</div>`;
  } else {
    resultsContainer.innerHTML = matches.map((p) => `
      <a href="player-page.html?id=${p.playerId}" class="block">
        <div class="p-3 hover:bg-gray-700 cursor-pointer text-sm border-b border-gray-700 last:border-b-0 flex items-center gap-3" data-id="${p.playerId}">
          <img src="${p.headshot || './AeroVista-Logo.png'}" alt="${p.name}" class="w-8 h-8 rounded-full object-cover">
          <div>
              <strong>${p.name}</strong> – ${p.position} (${p.team || 'N/A'})
              <div class="text-xs text-gray-400">${p.college || ''}</div>
          </div>
        </div>
      </a>
    `).join("");
  }

  resultsContainer.classList.remove("hidden");
}

// Export function for module use
export { initializeSearch };

// If the header has already initialized, we need to initialize search
if (window.headerSearchInitialized) {
  initializeSearch();
}
