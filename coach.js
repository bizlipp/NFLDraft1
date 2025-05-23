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

  // Get enhanced player details for the squad
  const squadWithDetails = squad.map(player => {
    const fullDetails = allPlayers.find(p => p.playerId === player.playerId) || player;
    return { ...player, ...fullDetails };
  });

  // Check position balance
  const positionCounts = {};
  squadWithDetails.forEach(player => {
    positionCounts[player.position] = (positionCounts[player.position] || 0) + 1;
  });

  // Team concentration analysis
  const teamCounts = {};
  squadWithDetails.forEach(player => {
    if (player.team) {
      teamCounts[player.team] = (teamCounts[player.team] || 0) + 1;
    }
  });

  // Find teams with high concentration
  const teamsWithConcentration = Object.entries(teamCounts)
    .filter(([team, count]) => count >= 3)
    .map(([team]) => team);

  // Age analysis
  const ages = squadWithDetails
    .filter(p => p.current_age_years)
    .map(p => p.current_age_years);
  const averageAge = ages.length > 0 
    ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length)
    : null;

  // Check for rookie presence
  const rookies = squadWithDetails.filter(p => p.experience === 0);
  
  // Check for veteran presence (5+ years)
  const veterans = squadWithDetails.filter(p => p.experience >= 5);
  
  // Check for flags (especially injury risks)
  const injuryRisks = squadWithDetails.filter(p => 
    p.flags && p.flags.some(flag =>
      flag.toLowerCase().includes('injury') ||
      flag.toLowerCase().includes('risk')
    )
  );

  // Check for bye week conflicts
  const byeWeekPlayers = new Map();
  squadWithDetails.forEach(player => {
    if (player.flags) {
      player.flags.forEach(flag => {
        if (flag.startsWith("bye_week_") || flag.includes("_W")) {
          // Extract week number (e.g. "bye_week_risk_ARI_W12" -> "W12")
          const matches = flag.match(/W(\d+)/i);
          if (matches && matches[1]) {
            const week = `Week ${matches[1]}`;
            if (!byeWeekPlayers.has(week)) {
              byeWeekPlayers.set(week, []);
            }
            byeWeekPlayers.get(week).push(player);
          }
        }
      });
    }
  });

  // Find bye weeks with multiple players
  const byeWeekConflicts = [];
  byeWeekPlayers.forEach((players, week) => {
    if (players.length >= 2) {
      byeWeekConflicts.push({
        week,
        count: players.length,
        teams: [...new Set(players.map(p => p.team))].join(', ')
      });
    }
  });

  // Generate advice based on analysis
  let advice = "";

  // Positional balance advice
  if (!positionCounts['QB']) {
    advice = "You should prioritize drafting a quarterback - every team needs a solid QB!";
  } else if (!positionCounts['RB'] || positionCounts['RB'] < 2) {
    advice = "Consider adding more running backs. RBs are crucial for consistent fantasy production.";
  } else if (!positionCounts['WR'] || positionCounts['WR'] < 2) {
    advice = "Look to add more wide receivers to balance your squad.";
  } else if (teamsWithConcentration.length > 0) {
    // Team concentration advice
    advice = `You have ${teamsWithConcentration.length > 1 ? 'several' : 'a'} team stack with ${teamsWithConcentration.join(' and ')}. This can be powerful but risky during bye weeks.`;
  } else if (byeWeekConflicts.length > 0) {
    // Bye week conflict advice
    const conflict = byeWeekConflicts[0]; // Focus on the biggest conflict
    advice = `Watch out! You have ${conflict.count} players on bye during ${conflict.week} (${conflict.teams}). Consider diversifying.`;
  } else if (rookies.length > squad.length / 3) {
    // Rookie-heavy team advice
    advice = "Your team has many rookies. While they have upside, consider adding veterans for stability.";
  } else if (veterans.length > squad.length / 2 && averageAge && averageAge > 29) {
    // Veteran-heavy team advice
    advice = `Your squad's average age is ${averageAge}. While veterans are reliable, consider adding some younger talent with upside.`;
  } else if (injuryRisks.length > 1) {
    // Injury risk advice
    const riskPlayerNames = injuryRisks.map(p => p.name).join(' and ');
    advice = `${riskPlayerNames} ${injuryRisks.length > 1 ? 'are' : 'is'} flagged for injury risk. Consider having solid backups.`;
  } else {
    // Default personalized advice using player aiCommentary if available
    const playerWithAdvice = squadWithDetails.find(p => p.aiCommentary);
    if (playerWithAdvice) {
      advice = playerWithAdvice.aiCommentary;
    } else {
      advice = "You're building a balanced squad! Keep drafting for value and watch for breakout opportunities.";
    }
  }

  return advice;
}

// Backward compatibility for non-module scripts
if (typeof window !== 'undefined') {
  window.getCoachAdvice = getCoachAdvice;
} 