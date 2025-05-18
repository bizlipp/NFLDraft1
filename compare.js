// compare.js
import { getCleanExperience, getFormattedHeightWeight, getTagBadgesHtml, standardTagDisplayConfig, getFlagIconsHtml } from './utils.js';
import { getPlayerById } from './data-service.js';

const container = document.getElementById("compare-grid");
const params = new URLSearchParams(window.location.search);
const a = params.get("a");
const b = params.get("b");

if (!a || !b) {
  container.innerHTML = `<p class='text-red-400 text-center'>Missing player IDs. Usage: ?a=PLAYER_ID&b=PLAYER_ID <br><a href='dashboard.html' class='text-cyan-400 hover:underline'>Back to Dashboard</a></p>`;
} else {
  // Loading indicator
  container.innerHTML = `<p class='text-center text-gray-400 col-span-1 md:col-span-2'>Loading player comparison data...</p>`;
  
  // Use Promise.all to fetch both players in parallel
  Promise.all([
    getPlayerById(a),
    getPlayerById(b)
  ])
  .then(([playerA, playerB]) => {
    if (!playerA || !playerB) {
      container.innerHTML = `<p class='text-red-400 text-center col-span-1 md:col-span-2'>One or both players not found. <br><a href='dashboard.html' class='text-cyan-400 hover:underline'>Back to Dashboard</a></p>`;
      return;
    }
    
    // Check if players share a bye week (advanced comparison)
    let sharedByeWeekWarning = '';
    if (playerA.flags && playerB.flags) {
      const playerAByeWeeks = playerA.flags.filter(f => f.includes('bye_week_risk_'));
      const playerBByeWeeks = playerB.flags.filter(f => f.includes('bye_week_risk_'));
      
      if (playerAByeWeeks.length > 0 && playerBByeWeeks.length > 0) {
        // Extract week number
        const aWeek = playerAByeWeeks[0].split('_').pop();
        const bWeek = playerBByeWeeks[0].split('_').pop();
        
        if (aWeek === bWeek) {
          sharedByeWeekWarning = `<div class="col-span-1 md:col-span-2 bg-orange-700 p-3 rounded-xl text-white text-center mb-4">
            ⚠️ Both players share ${aWeek} bye week. Be careful when drafting both.
          </div>`;
        }
      }
    }
    
    container.innerHTML = sharedByeWeekWarning + [playerA, playerB].map(p => {
      const { height, weight } = getFormattedHeightWeight(p);
      const experience = getCleanExperience(p);
      let playerTagsHtml = getTagBadgesHtml(p.tags, standardTagDisplayConfig);
      if (!p.tags || p.tags.length === 0) {
        playerTagsHtml = getTagBadgesHtml(['unscouted'], standardTagDisplayConfig);
      }
      const playerFlagsHtml = getFlagIconsHtml(p.flags);

      return `
      <div class="bg-gray-800 p-4 rounded-xl shadow text-sm">
        <img src="${p.headshot || './AeroVista-Logo.png'}" alt="${p.name}" class="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-cyan-500 object-cover" />
        <h2 class="text-xl font-bold text-cyan-300 text-center">${p.name}</h2>
        <div class="text-gray-400 text-xs text-center mb-1">${p.position} • ${p.team} ${p.number ? `#${p.number}`: ''}</div>
        <div class="mt-2 mb-3 flex gap-x-2 gap-y-1 flex-wrap justify-center">
          ${playerTagsHtml}
        </div>
        <div class="mb-3 flex gap-x-2 gap-y-1 flex-wrap justify-center">
          ${playerFlagsHtml}
        </div>
        <ul class="text-xs text-gray-300 space-y-1 border-t border-gray-700 pt-2">
          <li><strong>Age:</strong> ${p.age || '-'}</li>
          <li><strong>Height/Weight:</strong> ${height} / ${weight}</li>
          <li><strong>College:</strong> ${p.college || '-'}</li>
          <li><strong>Experience:</strong> ${experience}</li>
          <li><strong>Draft Info:</strong> ${p.draftInfo || '-'}</li>
          <li class="mt-1 pt-1 border-t border-gray-600"><strong>Fantasy Pts (PPR '24):</strong> ${p.fantasy?.pprPoints?.toFixed(1) || '-'}</li>
          <li><strong>TDs ('24):</strong> ${p.stats?.['2024']?.touchdowns || '-'}</li>
          <li><strong>Yards ('24):</strong> ${p.stats?.['2024']?.passingYards || p.stats?.['2024']?.rushingYards || p.stats?.['2024']?.receivingYards || '-'}</li>
          <li><strong>INTs ('24):</strong> ${p.stats?.['2024']?.interceptions || '-'}</li>
        </ul>
        <div class="mt-3 text-center">
          <a href="player-page.html?id=${p.playerId}" class="inline-block text-cyan-400 hover:underline text-xs">View Full Player Page</a>
        </div>
      </div>
    `}).join('');
  })
  .catch(error => {
    console.error("Error in player comparison:", error);
    container.innerHTML = `<p class='text-red-400 text-center col-span-1 md:col-span-2'>Error loading comparison data: ${error.message} <br><a href='dashboard.html' class='text-cyan-400 hover:underline'>Back to Dashboard</a></p>`;
  });
}
