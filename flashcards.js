// flashcards.js
import { getCleanExperience, getFormattedHeightWeight } from './utils.js';
import { getPlayerData } from './data-service.js';
import { initializeHeader } from './header-nav.js';

document.addEventListener("DOMContentLoaded", () => {
  // Initialize the header with current page highlighted
  initializeHeader('flashcards');
  
  const questionTextEl = document.getElementById("question-text");
  const answerInputEl = document.getElementById("answer-input");
  const submitAnswerBtn = document.getElementById("submit-answer-btn");
  const feedbackTextEl = document.getElementById("feedback-text");
  const correctAnswerTextEl = document.getElementById("correct-answer-text");
  const scoreCorrectEl = document.getElementById("score-correct");
  const scoreTotalEl = document.getElementById("score-total");
  const nextCardBtn = document.getElementById("next-card-btn");

  let allPlayers = [];
  let currentFlashcard = null;
  let score = { correct: 0, total: 0 };
  const FLASHCARD_SCORE_KEY = "flashcardScore";

  // Load score from localStorage
  function loadScore() {
    const storedScore = localStorage.getItem(FLASHCARD_SCORE_KEY);
    if (storedScore) {
      score = JSON.parse(storedScore);
    }
    updateScoreDisplay();
  }

  // Save score to localStorage
  function saveScore() {
    localStorage.setItem(FLASHCARD_SCORE_KEY, JSON.stringify(score));
  }

  function updateScoreDisplay() {
    scoreCorrectEl.textContent = score.correct;
    scoreTotalEl.textContent = score.total;
  }

  // Loading indicator
  questionTextEl.innerHTML = `<div class="flex items-center justify-center">
    <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-cyan-500 mr-3"></div>
    <span>Loading player data...</span>
  </div>`;

  // Load player data
  getPlayerData()
    .then(players => {
      allPlayers = players.filter(p => p.position && p.team && p.name); // Only players with required data
      showNextCard();
    })
    .catch(error => {
      console.error("Error loading player data for flashcards:", error);
      questionTextEl.innerHTML = `<p class="text-red-500">Error loading player data: ${error.message}</p>`;
    });

  // Generate a random flashcard
  function generateFlashcard() {
    if (allPlayers.length === 0) return null;

    const randomPlayer = allPlayers[Math.floor(Math.random() * allPlayers.length)];
    const cardTypes = [
      { type: "position", question: `What position does ${randomPlayer.name} play?`, answer: randomPlayer.position },
      { type: "team", question: `Which team does ${randomPlayer.name} play for?`, answer: randomPlayer.team },
      { type: "playerName", question: `Which player is ${randomPlayer.position} for the ${randomPlayer.team}?`, answer: randomPlayer.name }
    ];

    // Add college question if available
    if (randomPlayer.college) {
      cardTypes.push({ 
        type: "college", 
        question: `Which college did ${randomPlayer.name} attend?`, 
        answer: randomPlayer.college 
      });
    }

    // Select random question type
    const cardType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
    return {
      player: randomPlayer,
      type: cardType.type,
      question: cardType.question,
      answer: cardType.answer
    };
  }

  // Show next card
  function showNextCard() {
    currentFlashcard = generateFlashcard();
    if (!currentFlashcard) {
      questionTextEl.innerHTML = "<p>No player data available for flashcards</p>";
      return;
    }

    questionTextEl.textContent = currentFlashcard.question;
    answerInputEl.value = "";
    feedbackTextEl.textContent = "";
    correctAnswerTextEl.textContent = "";
    answerInputEl.disabled = false;
    submitAnswerBtn.disabled = false;
    nextCardBtn.classList.add("hidden");
    answerInputEl.focus();
  }

  // Check answer
  function checkAnswer() {
    if (!currentFlashcard) return;

    const userAnswer = answerInputEl.value.trim();
    if (!userAnswer) return;

    answerInputEl.disabled = true;
    submitAnswerBtn.disabled = true;
    
    const correctAnswer = currentFlashcard.answer;
    const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
    
    score.total++;
    if (isCorrect) {
      score.correct++;
      feedbackTextEl.textContent = "Correct!";
      feedbackTextEl.className = "text-green-500 font-semibold";
    } else {
      feedbackTextEl.textContent = "Incorrect!";
      feedbackTextEl.className = "text-red-500 font-semibold";
      correctAnswerTextEl.textContent = `The correct answer is: ${correctAnswer}`;
    }
    
    saveScore();
    updateScoreDisplay();
    nextCardBtn.classList.remove("hidden");
  }

  // Event listeners
  if (submitAnswerBtn) {
    submitAnswerBtn.addEventListener("click", checkAnswer);
  }

  if (answerInputEl) {
    answerInputEl.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        checkAnswer();
      }
    });
  }

  if (nextCardBtn) {
    nextCardBtn.addEventListener("click", showNextCard);
  }

  // Initialize
  loadScore();
}); 