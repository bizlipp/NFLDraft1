# 🏈 FantasyForge: Packers vs. Chiefs Edition

FantasyForge is an interactive web application designed for NFL fantasy football enthusiasts. It allows users to browse NFL players, build their dream fantasy team with specific roster rules, compare players side-by-side, and test their player knowledge with a fun flashcard game. This edition is themed around a Green Bay Packers vs. Kansas City Chiefs matchup.

The application runs entirely in the browser, requiring no backend, and saves your fantasy team progress locally.

## ✨ Features

*   **Player Database:** View a list of NFL players, including a special custom player "Timbr the Titan".
*   **Search Functionality:** Quickly find players by name, team, position, or notes.
*   **Dynamic Player Pool:** Filter the player list by position (All, QB, RB, WR, TE, K, DST).
*   **"My Fantasy Team" Builder:**
    *   Add players to your custom team.
    *   Advanced roster management with position limits (1 QB, 2 RBs, 2 WRs, 1 TE, 1 FLEX, 1 K, 1 DST).
    *   Visual feedback on roster status.
*   **Player Comparison:** Select players to compare their stats and details side-by-side in a dedicated section.
*   **Flashcard Game:** Test your NFL player knowledge with hints and answer reveals.
*   **Persistent Team:** Your created fantasy team is automatically saved in your browser's `localStorage` and reloaded on your next visit.
*   **Themed Interface:** A Green Bay Packers vs. Kansas City Chiefs visual theme.

## 🛠️ Tech Stack & Setup

*   **Frontend:** HTML5, CSS3 (Tailwind CSS for styling), JavaScript (ES6 Modules)
*   **Data:** Player and draft information is sourced from local JSON files (`nflPlayers.json`, `collegePlayers.json`, etc.).
*   **No Backend:** The application is fully client-side.

## 🚀 How to Run

1.  **No Installation Needed:** Simply ensure you have all the project files.
2.  **Open in Browser:**
    *   The recommended way is to use a local web server. If you have VS Code, the "Live Server" extension is excellent for this. Right-click on `index.html` and select "Open with Live Server".
    *   Alternatively, you can open the `index.html` file directly in your web browser. However, due to the use of ES6 modules, running it via a local server (`http://` protocol) is more reliable than using the `file:///` protocol.

Once opened, the application should load, and you can start exploring its features!

## 📁 File Structure Overview

```
NFLDraft1/
├── data/                       # Contains all JSON data files
│   ├── collegePlayers.json     # Data for college players
│   ├── draft2025.json          # Mock draft data for 2025
│   ├── nflPlayers.json         # Core NFL player data for the app
│   └── offseasonTrades.json    # Information on offseason trades
├── compare.js                  # Handles player comparison logic and rendering
├── flashcards.js               # Manages the flashcard game functionality
├── index.html                  # Main HTML file for the application structure and layout
├── main.js                     # Core JavaScript file: loads data, manages team, initializes modules
├── search.js                   # Handles player search/filtering logic
└── README.md                   # This file
```

## 🔮 Potential Future Enhancements

*   More detailed player statistics and individual player profile pages.
*   Advanced filtering and sorting options for the player list.
*   Drag-and-drop interface for managing "My Fantasy Team".
*   Integration of more data sources or an actual API.
*   User accounts and cloud-based team saving.
*   More complex scoring and league settings for team building. 