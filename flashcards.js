// ========== flashcards.js ==========
import { allPlayers } from './main.js'; // Import allPlayers

let flashcards = [];
let currentIndex = 0;

export function initFlashcards() {
  flashcards = shuffle([...allPlayers]);
  currentIndex = 0;
  renderFlashcard();
}

function renderFlashcard() {
  const box = document.getElementById('flashcard-box');
  if (!box || flashcards.length === 0) return;
  const cardData = flashcards[currentIndex];
  box.innerHTML = `
    <div class="player-card text-center p-4"> 
      <p class="mb-2">💡 Hint: ${generateHint(cardData)}</p>
      <button class="action-button" onclick="window.revealAnswer()">Reveal Answer</button>
    </div>
  `;
}

window.revealAnswer = function () {
  const cardData = flashcards[currentIndex];
  const box = document.getElementById('flashcard-box');
  if (!box || !cardData) return; 

  // Replace entire content of flashcard-box with the revealed state card
  box.innerHTML = `
    <div class="player-card text-center p-4">
      <p class="mb-1 text-gray-400 text-sm">💡 Hint: ${generateHint(cardData)}</p> 
      <p class="mt-2 mb-3 text-xl text-yellow-300">✅ It was <strong>${cardData.name}</strong>!</p>
      <button class="action-button" onclick="window.nextFlashcard()">Next Flashcard</button>
    </div>
  `;
};

window.nextFlashcard = function () {
  currentIndex = (currentIndex + 1) % flashcards.length;
  renderFlashcard();
};

function generateHint(player) {
  if (player.fantasyPoints2024 > 400) return 'Top 5 overall fantasy player in 2024';
  if (player.position === 'RB') return 'Running back with over 1,000 yards';
  if (player.position === 'WR') return 'Receiver with 10+ TDs';
  return `Plays for ${player.team}`;
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
