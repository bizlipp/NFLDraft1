// ========== search.js ==========
import { allPlayers, customPlayer, formatPlayerCard } from './main.js';

let searchInputEl;

export function initSearch(inputId = 'search-input') {
  searchInputEl = document.getElementById(inputId);
  if (!searchInputEl) return;

  searchInputEl.addEventListener('input', () => {
    const query = searchInputEl.value.toLowerCase();
    const filtered = [...allPlayers, customPlayer].filter(player => {
      return (
        player.name.toLowerCase().includes(query) ||
        player.team.toLowerCase().includes(query) ||
        player.position.toLowerCase().includes(query) ||
        (player.notes && player.notes.toLowerCase().includes(query)) ||
        (player.fantasyPoints2024 && player.fantasyPoints2024.toString().includes(query))
      );
    });

    renderSearchResults(filtered);
  });
}

function renderSearchResults(players) {
  const playerListEl = document.getElementById("player-list");
  if (!playerListEl) return;
  playerListEl.innerHTML = '';
  players.forEach(player => {
    const el = document.createElement('div');
    el.className = 'player-card';
    el.innerHTML = formatPlayerCard(player);
    playerListEl.appendChild(el);
  });
}