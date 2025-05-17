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
  const card = flashcards[currentIndex];
  box.innerHTML = `
    <div class="player-card">
      <p>💡 Hint: ${generateHint(card)}</p>
      <button onclick="revealAnswer()">Reveal Answer</button>
    </div>
  `;
}

window.revealAnswer = function () {
  const card = flashcards[currentIndex];
  const box = document.getElementById('flashcard-box');
  box.innerHTML += `<p>✅ It was <strong>${card.name}</strong>!</p>
    <button onclick="nextFlashcard()">Next</button>`;
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
