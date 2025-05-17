// ========== compare.js ==========
import { allPlayers, customPlayer } from './main.js'; // Import necessary variables

let selectedPlayers = [];

export function addToCompare(playerId) {
  const player = [...allPlayers, customPlayer].find(p => p.id.toString() === playerId.toString());
  if (!player || selectedPlayers.find(p => p.id === player.id)) return;
  selectedPlayers.push(player);
  renderComparison();
}

export function removeFromCompare(playerId) {
  selectedPlayers = selectedPlayers.filter(p => p.id.toString() !== playerId.toString());
  renderComparison();
}

// Attach to window for inline event handlers
window.addToCompare = addToCompare;
window.removeFromCompare = removeFromCompare;

function renderComparison() {
  const compareEl = document.getElementById('compare-box');
  if (!compareEl) return;
  compareEl.innerHTML = '';

  selectedPlayers.forEach(p => {
    const card = document.createElement('div');
    card.className = 'player-card';
    card.innerHTML = `
      <h3>${p.name}</h3>
      <p>Team: ${p.team} | Pos: ${p.position}</p>
      <p>Rating: ${p.rating}</p>
      <p>Fantasy Points (2024): ${p.fantasyPoints2024}</p>
      <p><em>${p.notes || ''}</em></p>
      <button class="action-button" onclick="window.removeFromCompare('${p.id}')">Remove from Compare</button>
    `;
    compareEl.appendChild(card);
  });
}

