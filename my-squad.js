// my-squad.js

const MY_SQUAD_KEY = "mySquad";

/**
 * Retrieves the current squad from localStorage.
 * @returns {Array} The array of players in the squad, or an empty array.
 */
function getSquad() {
  const squadJson = localStorage.getItem(MY_SQUAD_KEY);
  try {
    return squadJson ? JSON.parse(squadJson) : [];
  } catch (error) {
    console.error("Error parsing My Squad from localStorage:", error);
    return []; // Return empty array on error
  }
}

/**
 * Saves the squad to localStorage.
 * @param {Array} squad - The squad array to save.
 */
function saveSquad(squad) {
  localStorage.setItem(MY_SQUAD_KEY, JSON.stringify(squad));
}

/**
 * Adds a player to the squad.
 * @param {Object} playerDetails - Object containing playerId, name, and team.
 * @returns {boolean} True if the player was added, false if they were already in the squad.
 */
function addToSquad(playerDetails) {
  const squad = getSquad();
  const existingPlayer = squad.find(p => p.playerId === playerDetails.playerId);

  if (existingPlayer) {
    console.log(`${playerDetails.name} is already in My Squad.`);
    return false; // Player already in squad
  }

  squad.push({
    playerId: playerDetails.playerId,
    name: playerDetails.name,
    team: playerDetails.team
    // Add any other essential details you want to store
  });
  saveSquad(squad);
  console.log(`Added ${playerDetails.name} to My Squad.`);
  return true; // Player added
}

/**
 * Removes a player from the squad by their ID.
 * @param {string | number} playerId - The ID of the player to remove.
 */
function removeFromSquad(playerId) {
  let squad = getSquad();
  const initialSquadLength = squad.length;
  squad = squad.filter(p => p.playerId !== playerId);

  if (squad.length < initialSquadLength) {
    saveSquad(squad);
    console.log(`Player with ID ${playerId} removed from My Squad.`);
    return true;
  }
  console.log(`Player with ID ${playerId} not found in My Squad.`);
  return false;
} 