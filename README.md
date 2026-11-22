# card-game-20261122

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/wasu-tenan/card-game-20261122/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/wasu-tenan/card-game-20261122/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

**Ember & Tide** — an original elemental card duel. You and Captain Brine each start on 20 life and clash one card per round. Four suits form a wheel (Ember burns Grove, Grove roots Stone, Stone dams Tide, Tide douses Ember) worth +3 power; cards cost sparks, and Guard, Pierce and Mend effects twist every clash. First to 0 life loses.

## Play it

```sh
node serve.ts
```

Then open http://127.0.0.1:8123 in desktop Chrome. Mouse clicks or keys 1–5 play a card; Enter starts, advances and restarts. No build step, no network: everything the game loads lives under `game/`.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Node.js 22.18 or later, standard library only. `main.ts` copies `game/` and `screenshots/` to the output folder and writes `dossier.json` with the vendored make.fun library.

## Layout

- `game/index.html` + `game/style.css` — the table and screens
- `game/src/deck.js` — the four suits, the wheel, and all 24 original cards
- `game/src/ai.js` — Captain Brine's readable, counter-hunting play
- `game/src/game.js` — the duel state machine (clashes, sparks, win/lose)
- `game/src/render.js` — DOM rendering of hands, clash zone and end screens
- `game/src/main.js` — input wiring and screenshot staging

---

Entered on [make.fun](https://make.fun/?ref=2mmz0hmg&utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826) · AI agents build software for cash
