# 🏈 FantasyForge Completion Game Plan (May 2025 Sprint)

## 🧩 STAGE 1: Add “🚀 Starter Forward” Tag Support

**Goal**: Extend tag system across all views.

### ✅ Tasks
- [ ] Update `dashboard.js`: Add `"🚀 Starter Forward"` to featured tag list.
- [ ] Update `player-page.js`: Include logic to detect and display `"starterforward"` tag.
- [ ] Update JSON: Add `"starterforward"` tag manually to a few top players in `nfl_players_2025_enriched.json` for testing.

💡 *Optional*: Bright badge style: `bg-yellow-500 text-black` to differentiate.

---

## 🧩 STAGE 2: Implement “My Squad” with `localStorage`

**Goal**: Allow users to draft and store their selected team locally.

### ✅ Tasks
- [ ] `player-page.js`: Add functionality to `"Add to My Squad"` button → push player object or ID to `localStorage["mySquad"]`.
- [ ] `dashboard.js`: On load, retrieve `mySquad` array and display players under “🎮 My Squad”.
- [ ] Create `removePlayer(id)` logic for editing the squad later.

🔒 **Storage Format**:
```js
localStorage.setItem("mySquad", JSON.stringify([{ playerId: 10123, name: "X", team: "BUF" }]));
```

---

## 🧩 STAGE 3: Hook Up Mock Draft + Cheat Sheet Buttons

**Goal**: Create placeholder tools for draft strategy support.

### ✅ Tasks
- [ ] Create `mock-draft.html`: Simulated draft logic with click-to-draft.
- [ ] Create `cheat-sheet.html`: Top players by position, sortable.
- [ ] Link both from `dashboard.html` button clicks.

🔁 *Future*: Add scoring algorithms to enhance mock results.

---

## 🧩 STAGE 4: Coach Mode AI Logic

**Goal**: Smart AI feedback using tags and team patterns.

### ✅ Tasks
- [ ] Update JSON to include `aiCommentary` and `flags` for 3–5 players.
- [ ] Parse flags in `dashboard.js` or `coach.js` to output feedback like:
  > “You’ve stacked too many KC players. Diversify for Week 10 bye.”

🧠 *Optional*: Use a cartoon-style overlay or animated “Coach” element.

---

## 🧩 STAGE 5: Flashcard / Trivia Game

**Goal**: Fun way to learn players and stats.

### ✅ Tasks
- [ ] Create `trivia.html` or `flashcards.html`
- [ ] Load random players and show:
  > Q: “Which team is [Player Name] on?” or “How many TDs in 2024?”
- [ ] Track right/wrong count with simple local scoreboard

---

## ✅ Bonus: Optimization + Visual Polish

- [ ] Show spinner/loading states for data fetches.
- [ ] Use more vibrant Tailwind colors per tag type.
- [ ] Add favicon + meta tags to all `.html` pages.

---

## 🗂 Recommended File Additions

| File               | Purpose                         |
|--------------------|----------------------------------|
| `mock-draft.html`  | Draft simulator UI              |
| `cheat-sheet.html` | Player rankings, filters        |
| `flashcards.html`  | Game view                       |
| `coach.js`         | Optional logic for AI advice    |
| `my-squad.js`      | Shared logic for storing team   |

---

## 🧭 Suggested Sprint Order

|Task | Task |
|-----|------|
|  1 | Stage 1 + StarterForward tag testing |
|  2 | Stage 2 + Squad logic & dashboard integration |
|  3 | Stage 3 + Mock Draft/Cheat Sheet placeholders |
|  4 | Stage 4 + Basic AI Coach integration |
|  5 | Stage 5 + Trivia prototype |
|  6 | Polish & optimize (styling, spinners, badges) |
|  7 | Zip for build, deploy to GitHub Pages |