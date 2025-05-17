// ========== search.js ==========
import { displayPlayers } from './main.js';

let searchInputEl;
let currentSearchQuery = '';

export function getCurrentSearchQuery() {
  return currentSearchQuery;
}

export function initSearch(inputId = 'search-input') {
  searchInputEl = document.getElementById(inputId);
  if (!searchInputEl) return;

  searchInputEl.addEventListener('input', () => {
    currentSearchQuery = searchInputEl.value.toLowerCase();
    displayPlayers();
  });
}