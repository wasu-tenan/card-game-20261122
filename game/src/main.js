// main.js — wires Ember & Tide together: title screen, the duel loop,
// keyboard play (1–5 pick a card, Enter starts / advances), and the
// maker's screenshot staging via ?shot=title|play|win|loss&seed=n.

import { createGame, playRound, nextRound, stageForShot } from "./game.js";
import { renderTable, renderTitle, renderEnd } from "./render.js";

const root = document.getElementById("app");
const status = document.getElementById("status");
const params = new URLSearchParams(location.search);
const seed = Number(params.get("seed") || 7) || 7;
const shot = params.get("shot");

let state = createGame(seed);
let screen = "title"; // title | table | end

function announce(text) {
  if (status) status.textContent = text;
}

function show() {
  if (screen === "title") {
    renderTitle(root, startDuel);
  } else if (screen === "end" || state.phase === "over") {
    screen = "end";
    renderEnd(root, state, restart);
  } else {
    renderTable(root, state, { card: pickCard, next: advance });
  }
  announce(state.log || "Ember and Tide");
}

function startDuel() {
  screen = "table";
  show();
}

function restart() {
  state = createGame(seed + state.round * 13 + 5);
  screen = "table";
  show();
}

function pickCard(cardId) {
  if (screen !== "table") return;
  playRound(state, cardId);
  show();
}

function advance() {
  nextRound(state);
  show();
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    if (screen === "title") startDuel();
    else if (screen === "end") restart();
    else if (state.phase === "reveal") advance();
    return;
  }
  if (screen === "table" && state.phase === "pick") {
    const n = Number(event.key);
    if (n >= 1 && n <= state.playerHand.length) {
      pickCard(state.playerHand[n - 1].id);
    }
  }
});

// Screenshot staging: real positions rendered by the real game code.
if (shot === "play") {
  stageForShot(state, "play");
  screen = "table";
} else if (shot === "win" || shot === "loss") {
  stageForShot(state, shot);
  screen = "end";
}
show();
