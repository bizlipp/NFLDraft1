// flashcards.js
import { getCleanExperience, getFormattedHeightWeight } from './utils.js'; // Import if needed for other data points

document.addEventListener("DOMContentLoaded", () => {
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

  // Load player data (similar to dashboard.js, merging profile updates)
  fetch("./data/nfl_players_2025_enriched_full_final.json") // Updated file path
  .then(res => res.json())
  .then(playersData => {
    allPlayers = playersData.filter(p => p.name && p.team && p.position); // Ensure basic data for questions
    console.log("✅ Loaded", allPlayers.length, "players for flashcards from consolidated file.");
    loadScore();
    generateNewCard();
  })
  .catch(error => {
    console.error("Error loading player data for flashcards:", error);
    questionTextEl.textContent = "Error loading player data. Please try again later.";
    submitAnswerBtn.disabled = true;
    nextCardBtn.disabled = true;
  });

  function generateNewCard() {
    if (allPlayers.length === 0) {
      questionTextEl.textContent = "No player data available or suitable for questions.";
      submitAnswerBtn.disabled = true;
      return;
    }

    const randomPlayer = allPlayers[Math.floor(Math.random() * allPlayers.length)];
    const questionTypes = [];

    // Basic questions available for most players
    if (randomPlayer.name && randomPlayer.team) {
        questionTypes.push({ type: "team", question: `Which NFL team is ${randomPlayer.name} on? (e.g. KC, ARI)`, answer: randomPlayer.team, inputType: 'text' });
    }
    if (randomPlayer.name && randomPlayer.position) {
        questionTypes.push({ type: "position", question: `What position does ${randomPlayer.name} play? (e.g. QB, WR)`, answer: randomPlayer.position, inputType: 'text' });
    }
    if (randomPlayer.name && randomPlayer.college) {
        questionTypes.push({ type: "college", question: `Which college did ${randomPlayer.name} attend?`, answer: randomPlayer.college, inputType: 'text' });
    }
    if (randomPlayer.name && randomPlayer.birthplace) {
        questionTypes.push({ type: "birthplace", question: `Where was ${randomPlayer.name} born?`, answer: randomPlayer.birthplace, inputType: 'text' });
    }
    if (randomPlayer.name && randomPlayer.age) {
        questionTypes.push({ type: "age", question: `How old is ${randomPlayer.name}?`, answer: String(randomPlayer.age), inputType: 'number' });
    }
    
    // Stats questions (ensure stats for 2024 exist)
    const stats2024 = randomPlayer.stats?.['2024'];
    if (stats2024) {
        if (randomPlayer.name && stats2024.touchdowns !== undefined) {
            questionTypes.push({ type: "tds_2024", question: `How many total TDs did ${randomPlayer.name} score in 2024?`, answer: String(stats2024.touchdowns), inputType: 'number' });
        }
        if (randomPlayer.name && stats2024.passingYards !== undefined) {
            questionTypes.push({ type: "passyds_2024", question: `How many passing yards did ${randomPlayer.name} have in 2024?`, answer: String(stats2024.passingYards), inputType: 'number' });
        }
        if (randomPlayer.name && stats2024.rushingYards !== undefined) {
            questionTypes.push({ type: "rushyds_2024", question: `How many rushing yards did ${randomPlayer.name} have in 2024?`, answer: String(stats2024.rushingYards), inputType: 'number' });
        }
        if (randomPlayer.name && stats2024.receivingYards !== undefined) {
            questionTypes.push({ type: "recyds_2024", question: `How many receiving yards did ${randomPlayer.name} have in 2024?`, answer: String(stats2024.receivingYards), inputType: 'number' });
        }
        if (randomPlayer.name && stats2024.interceptions !== undefined && randomPlayer.position === 'QB') { // Makes sense for QB
            questionTypes.push({ type: "ints_2024", question: `How many interceptions did ${randomPlayer.name} throw in 2024?`, answer: String(stats2024.interceptions), inputType: 'number' });
        }
    }
    // Fantasy points
    if (randomPlayer.name && randomPlayer.fantasy?.pprPoints !== undefined) {
        questionTypes.push({ type: "ppr_2024", question: `How many PPR fantasy points did ${randomPlayer.name} have in 2024 (to one decimal)?`, answer: String(randomPlayer.fantasy.pprPoints.toFixed(1)), inputType: 'number' });
    }

    if (questionTypes.length === 0) {
        // Fallback if no suitable questions could be generated for this player (should be rare with initial filter)
        console.warn("Could not generate any question for player:", randomPlayer);
        generateNewCard(); // Try another player
        return;
    }

    currentFlashcard = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    answerInputEl.type = currentFlashcard.inputType || 'text'; // Set input type

    questionTextEl.textContent = currentFlashcard.question;
    answerInputEl.value = "";
    feedbackTextEl.innerHTML = "&nbsp;";
    correctAnswerTextEl.innerHTML = "&nbsp;";
    submitAnswerBtn.disabled = false;
    answerInputEl.disabled = false;
    answerInputEl.focus();
  }

  function handleSubmitAnswer() {
    if (!currentFlashcard || !currentFlashcard.answer) return;

    const userAnswer = answerInputEl.value.trim();
    score.total++;
    let isCorrect = false;

    // Case-insensitive comparison for text answers, exact for numbers or specific formats
    if (currentFlashcard.inputType === 'number' || currentFlashcard.type === 'ppr_2024') {
        // For PPR, allow for slight variations if needed, or ensure exact match if toFixed(1)
        isCorrect = userAnswer === currentFlashcard.answer; 
    } else {
        isCorrect = userAnswer.toLowerCase() === currentFlashcard.answer.toLowerCase();
    }
    // For team codes, accept full team name if mapped, or just code for now
    if (currentFlashcard.type === 'team' && userAnswer.length > 3) { // User entered full name
        // Potentially map full names to codes if player.team is always a code
        // For now, this will likely fail if answer is just the code. 
        // Better to instruct user to enter code, or have a mapping.
    }

    if (isCorrect) {
      score.correct++;
      feedbackTextEl.textContent = "Correct!";
      feedbackTextEl.className = "text-lg text-green-400";
    } else {
      feedbackTextEl.textContent = "Incorrect!";
      feedbackTextEl.className = "text-lg text-red-400";
      correctAnswerTextEl.textContent = `Correct answer: ${currentFlashcard.answer}`;
    }

    updateScoreDisplay();
    saveScore();
    submitAnswerBtn.disabled = true;
    answerInputEl.disabled = true;
  }

  submitAnswerBtn.addEventListener("click", handleSubmitAnswer);
  answerInputEl.addEventListener("keypress", function(event) {
    if (event.key === "Enter" && !submitAnswerBtn.disabled) {
      handleSubmitAnswer();
    }
  });
  nextCardBtn.addEventListener("click", generateNewCard);

}); 