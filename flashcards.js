// flashcards.js
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
  Promise.all([
    fetch("./data/nfl_players_2025_enriched.json").then(res => res.json()),
    fetch("./data/player_profile_updates.json").then(res => res.json()) // If AI commentary/flags are relevant here
  ])
  .then(([playersData, updatesData]) => {
    allPlayers = playersData.map(player => {
      const updates = updatesData[player.playerId];
      return updates ? { ...player, ...updates } : player;
    });
    console.log("✅ Loaded", allPlayers.length, "players for flashcards.");
    loadScore();
    generateNewCard();
  })
  .catch(error => {
    console.error("Error loading player data for flashcards:", error);
    questionTextEl.textContent = "Error loading player data. Please try again later.";
  });

  function generateNewCard() {
    if (allPlayers.length === 0) {
      questionTextEl.textContent = "No player data available.";
      return;
    }

    const randomPlayer = allPlayers[Math.floor(Math.random() * allPlayers.length)];
    const questionTypes = [
      { type: "team", question: `Which team is ${randomPlayer.name} on?`, answer: randomPlayer.team },
      { type: "position", question: `What position does ${randomPlayer.name} play?`, answer: randomPlayer.position },
      // Add more question types, e.g., stats, if available and desired
    ];
    
    // Add a stats question if 2024 stats and TDs are available
    if (randomPlayer.stats && randomPlayer.stats['2024'] && randomPlayer.stats['2024'].touchdowns !== undefined) {
        questionTypes.push({
            type: "tds_2024",
            question: `How many TDs did ${randomPlayer.name} have in 2024?`,
            answer: String(randomPlayer.stats['2024'].touchdowns) // Ensure answer is a string for comparison
        });
    }


    currentFlashcard = questionTypes[Math.floor(Math.random() * questionTypes.length)];

    questionTextEl.textContent = currentFlashcard.question;
    answerInputEl.value = "";
    feedbackTextEl.innerHTML = "&nbsp;";
    correctAnswerTextEl.innerHTML = "&nbsp;";
    submitAnswerBtn.disabled = false;
    answerInputEl.disabled = false;
    answerInputEl.focus();
  }

  function handleSubmitAnswer() {
    if (!currentFlashcard) return;

    const userAnswer = answerInputEl.value.trim();
    score.total++;
    let isCorrect = false;

    // Case-insensitive comparison for text answers, exact for numbers
    if (currentFlashcard.type === "tds_2024") {
        isCorrect = userAnswer === currentFlashcard.answer;
    } else {
        isCorrect = userAnswer.toLowerCase() === currentFlashcard.answer.toLowerCase();
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
    if (event.key === "Enter") {
      handleSubmitAnswer();
    }
  });
  nextCardBtn.addEventListener("click", generateNewCard);

}); 