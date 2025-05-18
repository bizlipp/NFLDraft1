// cheat-sheet.js
import { getCleanExperience, getFormattedHeightWeight, getFlagIconsHtml, standardTagDisplayConfig, getTagBadgesHtml } from './utils.js';

document.addEventListener("DOMContentLoaded", () => {
  const positionFilterEl = document.getElementById("position-filter");
  const sortByEl = document.getElementById("sort-by");
  const playerNameSearchEl = document.getElementById("player-name-search");
  const playerTableBodyEl = document.getElementById("player-table-body");
  const playerTableEl = document.getElementById("player-table");
  const loadingMessageEl = document.getElementById("loading-message");
  const compareSelectedBtn = document.getElementById("compare-selected-btn");
  let selectedToCompare = [];

  const PREFERENCES_KEY = "cheatSheetPreferences";
  let allPlayers = [];
  let currentSort = { column: "fantasyPprPoints", ascending: false }; // Default sort
  let currentPositionFilter = "ALL";
  let currentTeamFilter = "ALL"; // Added for team filter
  let currentNameSearch = "";

  function loadPreferences() {
    const prefs = localStorage.getItem(PREFERENCES_KEY);
    if (prefs) {
      const parsedPrefs = JSON.parse(prefs);
      currentSort = parsedPrefs.sort || currentSort;
      currentPositionFilter = parsedPrefs.positionFilter || currentPositionFilter;
      currentNameSearch = parsedPrefs.nameSearch || currentNameSearch;
      currentTeamFilter = parsedPrefs.teamFilter || currentTeamFilter;

      sortByEl.value = currentSort.column;
      positionFilterEl.value = currentPositionFilter;
      playerNameSearchEl.value = currentNameSearch;
      // teamFilterEl will be populated and set after data load
    }
  }

  function savePreferences() {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify({
      sort: currentSort,
      positionFilter: currentPositionFilter,
      nameSearch: currentNameSearch,
      teamFilter: currentTeamFilter
    }));
  }

  fetch("./data/nfl_players_2025_enriched_full_final.json")
    .then(res => res.json())
    .then(playersData => {
      allPlayers = playersData.map(player => {
        const pprPoints = (player.fantasy && typeof player.fantasy.pprPoints === 'number') ? player.fantasy.pprPoints : -Infinity; // Use -Infinity for sorting
        const experience = getCleanExperience(player);
        const { height, weight } = getFormattedHeightWeight(player);
        return { ...player, fantasyPprPoints: pprPoints, experience, height, weight };
      });
      console.log("✅ Loaded", allPlayers.length, "players for cheat sheet from consolidated file.");
      populateTeamFilter();
      loadPreferences();
      renderPlayerTable();
      loadingMessageEl.classList.add("hidden");
      playerTableEl.classList.remove("hidden");
    })
    .catch(error => {
      console.error("Error loading player data for cheat sheet:", error);
      loadingMessageEl.textContent = "Error loading player data. Please try again.";
    });

  function populateTeamFilter() {
    const teamFilterEl = document.getElementById("team-filter");
    if (!teamFilterEl) return;
    const teams = [...new Set(allPlayers.map(p => p.team).filter(Boolean))].sort();
    teams.forEach(team => {
      const option = document.createElement("option");
      option.value = team;
      option.textContent = team;
      teamFilterEl.appendChild(option);
    });
    teamFilterEl.value = currentTeamFilter; // Apply loaded preference
    teamFilterEl.addEventListener("change", (e) => {
        currentTeamFilter = e.target.value;
        renderPlayerTable();
    });
  }
  
  function updateSortIndicators() {
    document.querySelectorAll("#player-table th[data-sort]").forEach(th => {
      const indicator = th.querySelector(".sort-indicator");
      if (!indicator) return;
      if (th.dataset.sort === currentSort.column) {
        indicator.textContent = currentSort.ascending ? ' ↑' : ' ↓';
      } else {
        indicator.textContent = '';
      }
    });
  }
  
  function sortPlayers(players) {
    return [...players].sort((a, b) => {
      let valA = a[currentSort.column];
      let valB = b[currentSort.column];

      // Handle specific sort cases, e.g., name is case-insensitive
      if (typeof valA === 'string' && currentSort.column !== 'fantasyPprPoints') valA = valA.toLowerCase();
      if (typeof valB === 'string' && currentSort.column !== 'fantasyPprPoints') valB = valB.toLowerCase();
      
      // For fantasyPprPoints, we used -Infinity for N/A, so direct comparison works.
      // For other numeric fields, handle undefined/null if necessary, but -Infinity takes care of it for points.
      if (valA === undefined || valA === null || valA === '') valA = currentSort.ascending ? Infinity : -Infinity;
      if (valB === undefined || valB === null || valB === '') valB = currentSort.ascending ? Infinity : -Infinity;

      if (valA < valB) return currentSort.ascending ? -1 : 1;
      if (valA > valB) return currentSort.ascending ? 1 : -1;
      return 0;
    });
  }

  function filterPlayers(players) {
    let filtered = players;
    if (currentPositionFilter !== "ALL") {
      filtered = filtered.filter(p => p.position === currentPositionFilter);
    }
    if (currentTeamFilter !== "ALL") {
      filtered = filtered.filter(p => p.team === currentTeamFilter);
    }
    if (currentNameSearch) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(currentNameSearch.toLowerCase()) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(currentNameSearch.toLowerCase()))) ||
        (p.flags && p.flags.some(f => f.toLowerCase().includes(currentNameSearch.toLowerCase())))
      );
    }
    return filtered;
  }

  function renderPlayerTable() {
    if (!playerTableBodyEl) return;
    playerTableBodyEl.innerHTML = "";
    let processedPlayers = filterPlayers(allPlayers);
    processedPlayers = sortPlayers(processedPlayers);

    processedPlayers.slice(0, 250).forEach((player, index) => { // Show top 250, or adjust
      const row = playerTableBodyEl.insertRow();
      row.className = `hover:bg-gray-600 transition-colors duration-150 ${index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"}`;
      
      // Checkbox for comparison
      const compareCell = row.insertCell();
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-500 rounded focus:ring-cyan-500';
      checkbox.value = player.playerId;
      checkbox.addEventListener('change', handleCompareSelect);
      compareCell.appendChild(checkbox);
      compareCell.className = 'px-2 py-2 align-middle';

      row.insertCell().textContent = index + 1; // Rank
      row.cells[row.cells.length - 1].className = 'px-4 py-2 text-sm text-gray-300 align-middle';
      
      const nameCell = row.insertCell();
      const flagIcons = getFlagIconsHtml(player.flags);
      nameCell.innerHTML = `<a href="player-page.html?id=${player.playerId}" class="text-cyan-400 hover:underline">${player.name}</a> <span class="ml-1">${flagIcons}</span>`;
      nameCell.className = 'px-4 py-2 text-sm text-white align-middle';

      row.insertCell().textContent = player.position || 'N/A';
      row.cells[row.cells.length - 1].className = 'px-4 py-2 text-sm text-gray-300 align-middle';
      row.insertCell().textContent = player.team || 'N/A';
      row.cells[row.cells.length - 1].className = 'px-4 py-2 text-sm text-gray-300 align-middle';
      row.insertCell().textContent = player.fantasyPprPoints !== -Infinity ? player.fantasyPprPoints.toFixed(1) : 'N/A';
      row.cells[row.cells.length - 1].className = 'px-4 py-2 text-sm text-gray-300 align-middle';

      // Add to Squad button
      const actionCell = row.insertCell();
      const squadButton = document.createElement('button');
      squadButton.innerHTML = '+'; // Simple add button
      squadButton.className = 'add-to-squad-cheat-btn text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded';
      squadButton.dataset.playerId = player.playerId;
      squadButton.dataset.playerName = player.name;
      squadButton.dataset.playerTeam = player.team;
      squadButton.dataset.playerPosition = player.position;
      actionCell.appendChild(squadButton);
      actionCell.className = 'px-4 py-2 text-sm align-middle';
    });

    updateAddToSquadButtonStates();
    updateSortIndicators();
    savePreferences();
  }

  function handleCompareSelect(event) {
    const playerId = event.target.value;
    if (event.target.checked) {
      if (selectedToCompare.length < 2 && !selectedToCompare.includes(playerId)) {
        selectedToCompare.push(playerId);
      }
    } else {
      selectedToCompare = selectedToCompare.filter(id => id !== playerId);
    }
    // Uncheck others if more than 2 selected
    if (selectedToCompare.length > 2) {
        const lastSelected = selectedToCompare.pop(); // Keep the last two
        const secondLastSelected = selectedToCompare.pop();
        document.querySelectorAll('#player-table-body input[type="checkbox"]:checked').forEach(cb => {
            if (cb.value !== lastSelected && cb.value !== secondLastSelected) {
                cb.checked = false;
            }
        });
        selectedToCompare = [secondLastSelected, lastSelected];
    }
    updateCompareButtonState();
  }

  function updateCompareButtonState() {
    if (compareSelectedBtn) {
        compareSelectedBtn.disabled = selectedToCompare.length !== 2;
        compareSelectedBtn.textContent = `Compare Selected (${selectedToCompare.length})`;
        if (selectedToCompare.length === 2) {
            compareSelectedBtn.classList.remove('bg-purple-600', 'hover:bg-purple-700');
            compareSelectedBtn.classList.add('bg-cyan-600', 'hover:bg-cyan-700');
        } else {
            compareSelectedBtn.classList.remove('bg-cyan-600', 'hover:bg-cyan-700');
            compareSelectedBtn.classList.add('bg-purple-600', 'hover:bg-purple-700');
        }
    }
  }
  
  if(compareSelectedBtn) {
      compareSelectedBtn.addEventListener('click', () => {
          if (selectedToCompare.length === 2) {
              window.open(`compare.html?a=${selectedToCompare[0]}&b=${selectedToCompare[1]}`, '_blank');
          }
      });
  }

  function updateAddToSquadButtonStates() {
      const squad = getSquad(); // Assuming getSquad is available from my-squad.js
      document.querySelectorAll('.add-to-squad-cheat-btn').forEach(button => {
          const playerId = button.dataset.playerId;
          if (squad.some(p => p.playerId === playerId)) {
              button.textContent = 'In Squad';
              button.disabled = true;
              button.classList.remove('bg-green-600', 'hover:bg-green-700');
              button.classList.add('bg-gray-500');
          } else {
              button.textContent = '+';
              button.disabled = false;
              button.classList.add('bg-green-600', 'hover:bg-green-700');
              button.classList.remove('bg-gray-500');
          }
      });
  }

  // Event delegation for add to squad buttons
  playerTableBodyEl.addEventListener('click', function(event) {
      if (event.target.classList.contains('add-to-squad-cheat-btn')) {
          const button = event.target;
          const playerDetails = {
              playerId: button.dataset.playerId,
              name: button.dataset.playerName,
              team: button.dataset.playerTeam,
              position: button.dataset.playerPosition
          };
          if (typeof addToSquad === 'function') {
              const wasAdded = addToSquad(playerDetails);
              if (wasAdded) {
                  button.textContent = 'In Squad';
                  button.disabled = true;
                  button.classList.remove('bg-green-600', 'hover:bg-green-700');
                  button.classList.add('bg-gray-500');
              } else {
                  // Already in squad or error
                  alert(`${playerDetails.name} is already in your squad or an error occurred.`);
              }
          } else {
              console.error('addToSquad function not found. Ensure my-squad.js is loaded.');
              alert('Squad functionality is not available.');
          }
      }
  });

  playerNameSearchEl.addEventListener("input", (e) => {
    currentNameSearch = e.target.value;
    renderPlayerTable();
  });

  positionFilterEl.addEventListener("change", (e) => {
    currentPositionFilter = e.target.value;
    renderPlayerTable();
  });

  sortByEl.addEventListener("change", (e) => {
    const newSortColumn = e.target.value;
    if (currentSort.column === newSortColumn) {
      currentSort.ascending = !currentSort.ascending;
    } else {
      currentSort.column = newSortColumn;
      // Default sort ascending for text fields, descending for points
      currentSort.ascending = (newSortColumn === 'name' || newSortColumn === 'team' || newSortColumn === 'position');
    }
    renderPlayerTable();
  });

  document.querySelectorAll("#player-table th[data-sort]").forEach(th => {
    th.addEventListener("click", () => {
      const newSortColumn = th.dataset.sort;
      if (newSortColumn === 'rank') return; // Rank is based on current sort, not sortable itself
      if (currentSort.column === newSortColumn) {
        currentSort.ascending = !currentSort.ascending;
      } else {
        currentSort.column = newSortColumn;
        currentSort.ascending = (newSortColumn === 'name' || newSortColumn === 'team' || newSortColumn === 'position');
      }
      sortByEl.value = newSortColumn; // Sync dropdown
      renderPlayerTable();
    });
  });

}); 
// Make sure my-squad.js functions getSquad and addToSquad are available globally or properly imported.
// For example, if my-squad.js uses ES6 modules, cheat-sheet.js needs to import them:
// import { getSquad, addToSquad } from './my-squad.js';

// For example, if my-squad.js uses ES6 modules, cheat-sheet.js needs to import them:
// import { getSquad, addToSquad } from './my-squad.js'; 