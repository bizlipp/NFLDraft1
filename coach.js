/**
 * Analyzes the current squad and returns AI-driven commentary.
 * @param {Array} squad - The user's current squad (from getSquad()).
 * @param {Array} allPlayers - The complete list of all players, including merged profile updates (aiCommentary, flags).
 * @returns {string} Coach's advice.
 */
export function getCoachAdvice(squad, allPlayers) {
  if (!squad || squad.length === 0) {
    return "Draft some players to get personalized advice from the coach!";
  }

  // --- Example 1: Check for too many players from the same team with an upcoming bye week ---
  const teamCounts = {};
  let byeWeekConflictAdvice = "";

  squad.forEach(squadPlayer => {
    const fullPlayerDetails = allPlayers.find(p => p.playerId === squadPlayer.playerId);
    if (fullPlayerDetails && fullPlayerDetails.team) {
      teamCounts[fullPlayerDetails.team] = (teamCounts[fullPlayerDetails.team] || 0) + 1;

      // Check for specific bye week flags
      if (fullPlayerDetails.flags) {
        fullPlayerDetails.flags.forEach(flag => {
          if (flag.startsWith("bye_week_risk_")) { // e.g., "bye_week_risk_KC_W10"
            const parts = flag.split("_");
            const team = parts[3];
            const week = parts[4];
            if (teamCounts[team] >= 2) { // If 2 or more players from this team
              byeWeekConflictAdvice = `Watch out! You have multiple players from ${team} who share a ${week} bye. Consider diversifying.`;
            }
          }
        });
      }
    }
  });
  
  if (byeWeekConflictAdvice) {
    return byeWeekConflictAdvice; // Prioritize bye week conflicts for now
  }

  // --- Example 2: Check for a specific team concentration (e.g., KC players) ---
  const kcPlayersInSquad = squad.filter(squadPlayer => {
    const fullPlayer = allPlayers.find(p => p.playerId === squadPlayer.playerId);
    return fullPlayer && fullPlayer.flags && fullPlayer.flags.includes("kc_player");
  });

  if (kcPlayersInSquad.length >= 2) { // Example threshold
    return "You've stacked quite a few KC players. This could be powerful, but ensure you're covered for their bye week (Week 10)!";
  }
  
  // --- Example 3: Aggregate individual player AI commentary ---
  // For simplicity, let's pick the commentary from the first player in the squad who has one.
  // A more advanced version could cycle through them or pick the "most important".
  for (const squadPlayer of squad) {
    const fullPlayerDetails = allPlayers.find(p => p.playerId === squadPlayer.playerId);
    if (fullPlayerDetails && fullPlayerDetails.aiCommentary) {
      return fullPlayerDetails.aiCommentary; // Return the first piece of specific player advice found
    }
  }

  // Default advice if no specific rules are met
  return "Your squad is looking interesting! Keep an eye on player news and matchups.";
}

// Backward compatibility for non-module scripts
if (typeof window !== 'undefined') {
  window.getCoachAdvice = getCoachAdvice;
} 