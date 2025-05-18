// team-filter.js
// Loads team rosters dynamically

document.addEventListener('DOMContentLoaded', () => {
  const teamSelect = document.getElementById('team-select');
  const teamRoster = document.getElementById('team-roster');

  // Load the player data
  fetch('./data/nfl_players_2025_enriched_full_final.json')
    .then(response => response.json())
    .then(players => {
      // Get unique teams
      const teams = [...new Set(players.filter(p => p.team).map(p => p.team))].sort();
      
      // Populate team select dropdown
      teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        teamSelect.appendChild(option);
      });

      // Function to display players for selected team
      const displayTeamRoster = (team) => {
        const teamPlayers = players.filter(p => p.team === team);
        teamRoster.innerHTML = '';
        
        // Sort by position
        teamPlayers.sort((a, b) => {
          const posOrder = { 'QB': 1, 'RB': 2, 'WR': 3, 'TE': 4, 'K': 5, 'DEF': 6 };
          return (posOrder[a.position] || 99) - (posOrder[b.position] || 99);
        });
        
        teamPlayers.forEach(player => {
          const playerCard = document.createElement('div');
          playerCard.className = 'bg-gray-800 p-4 rounded-lg text-sm';
          
          playerCard.innerHTML = `
            <div class="flex items-center">
              <img src="${player.headshot || './AeroVista-Logo.png'}" alt="${player.name}" 
                   class="w-12 h-12 rounded-full mr-3 object-cover border-2 border-gray-600">
              <div>
                <a href="player-page.html?id=${player.playerId}" class="font-semibold text-white hover:text-cyan-400">${player.name}</a>
                <div class="text-xs text-gray-400">${player.position} ${player.number ? `#${player.number}` : ''}</div>
                <div class="text-xs text-gray-400">${player.college || 'N/A'}</div>
              </div>
            </div>
            <div class="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-300">
              <div>Age: ${player.age || 'N/A'}</div>
              <div>Fantasy Pts (PPR): ${player.fantasy?.pprPoints?.toFixed(1) || 'N/A'}</div>
            </div>
          `;
          
          teamRoster.appendChild(playerCard);
        });
      };
      
      // Display initial team (first in list)
      if (teams.length > 0) {
        displayTeamRoster(teams[0]);
      }
      
      // Handle team selection changes
      teamSelect.addEventListener('change', () => {
        displayTeamRoster(teamSelect.value);
      });
    })
    .catch(error => {
      console.error('Error loading player data:', error);
      teamRoster.innerHTML = `<div class="text-red-500 p-4">Error loading team data: ${error.message}</div>`;
    });
});
