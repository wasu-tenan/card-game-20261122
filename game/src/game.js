// game.js — the duel state machine for Ember & Tide.
// Both duelists start on 20 life. Each round both play one card face down,
// then the cards clash: wheel advantage adds power, the loser takes the
// power difference as damage (softened by Guard, sharpened by Pierce),
// Mend heals the winner. First to 0 life loses; if the deck runs out the
// higher life total wins.

import { buildDeck, effectivePower } from "./deck.js";
import { chooseAiCard, aiTaunt } from "./ai.js";

export const START_LIFE = 20;
export const MAX_SPARKS = 5;
export const HAND_SIZE = 5;

export function makeRng(seed) {
  let s = (seed >>> 0) || 123456789;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function createGame(seed) {
  const rng = makeRng(seed);
  const deck = buildDeck(rng);
  const state = {
    rng,
    deck,
    playerHand: deck.splice(0, HAND_SIZE),
    aiHand: deck.splice(0, HAND_SIZE),
    playerLife: START_LIFE,
    aiLife: START_LIFE,
    playerSparks: 2,
    aiSparks: 2,
    round: 1,
    phase: "pick", // pick | reveal | over
    playerPick: null,
    aiPick: null,
    lastResult: null,
    lastPlayerSuit: null,
    log: "Choose a card to clash. Wheel advantage grants +3 power.",
    taunt: "Brine: “First to empty the other's life wins. Begin.”",
    winner: null,
  };
  return state;
}

function drawUpTo(state, hand) {
  while (hand.length < HAND_SIZE && state.deck.length) {
    hand.push(state.deck.pop());
  }
}

export function playRound(state, playerCardId) {
  if (state.phase !== "pick") return state;
  const idx = state.playerHand.findIndex((c) => c.id === playerCardId);
  if (idx === -1) return state;
  const playerCard = state.playerHand[idx];
  if (playerCard.cost > state.playerSparks) return state;

  const aiCard = chooseAiCard(state, state.rng);
  state.aiHand.splice(state.aiHand.indexOf(aiCard), 1);
  state.playerHand.splice(idx, 1);
  state.playerPick = playerCard;
  state.aiPick = aiCard;
  state.playerSparks -= playerCard.cost;
  state.aiSparks -= aiCard.cost;
  state.lastPlayerSuit = playerCard.suit;

  const pPow = effectivePower(playerCard, aiCard);
  const aPow = effectivePower(aiCard, playerCard);
  let result;
  if (pPow > aPow) {
    let dmg = pPow - aPow;
    if (aiCard.effect === "guard" && playerCard.effect !== "pierce") {
      dmg = Math.max(1, dmg - 2);
    }
    state.aiLife = Math.max(0, state.aiLife - dmg);
    if (playerCard.effect === "mend") {
      state.playerLife = Math.min(START_LIFE, state.playerLife + 2);
    }
    result = "playerWin";
    state.log = `Your ${playerCard.name} (${pPow}) beats ${aiCard.name} (${aPow}) — Brine takes ${dmg} damage.`;
  } else if (aPow > pPow) {
    let dmg = aPow - pPow;
    if (playerCard.effect === "guard" && aiCard.effect !== "pierce") {
      dmg = Math.max(1, dmg - 2);
    }
    state.playerLife = Math.max(0, state.playerLife - dmg);
    if (aiCard.effect === "mend") {
      state.aiLife = Math.min(START_LIFE, state.aiLife + 2);
    }
    result = "aiWin";
    state.log = `Brine's ${aiCard.name} (${aPow}) beats your ${playerCard.name} (${pPow}) — you take ${dmg} damage.`;
  } else {
    result = "tie";
    state.log = `Dead clash at ${pPow} power each — nobody is hurt.`;
  }
  state.lastResult = result;
  state.taunt = aiTaunt(result, state.rng);
  state.phase = "reveal";

  if (state.playerLife <= 0 || state.aiLife <= 0) {
    state.winner = state.aiLife <= 0 ? "player" : "ai";
    state.phase = "over";
  }
  return state;
}

export function nextRound(state) {
  if (state.phase === "over") return state;
  state.round += 1;
  state.playerSparks = Math.min(MAX_SPARKS, state.playerSparks + 2);
  state.aiSparks = Math.min(MAX_SPARKS, state.aiSparks + 2);
  state.playerPick = null;
  state.aiPick = null;
  drawUpTo(state, state.playerHand);
  drawUpTo(state, state.aiHand);
  if (!state.playerHand.length || !state.aiHand.length || !state.deck.length) {
    if (!state.playerHand.length && !state.aiHand.length) {
      state.winner =
        state.playerLife === state.aiLife
          ? "draw"
          : state.playerLife > state.aiLife
            ? "player"
            : "ai";
      state.phase = "over";
      return state;
    }
  }
  state.phase = "pick";
  state.log = `Round ${state.round}: sparks refreshed (+2). Choose your next clash card.`;
  return state;
}

// Deterministic staging used only by the maker's own screenshot mode
// (?shot=...), so the screenshots are real renders of a real position.
export function stageForShot(state, shot) {
  if (shot === "play") {
    state.playerLife = 14;
    state.aiLife = 11;
    state.round = 4;
    state.playerSparks = 3;
    state.aiSparks = 2;
    state.log = "Round 4: your Flame Herald scorched Brine last clash. Choose again — Tide douses Ember!";
    state.taunt = "Brine: “A scratch. Nothing more.”";
  } else if (shot === "win") {
    state.aiLife = 0;
    state.playerLife = 9;
    state.round = 9;
    state.winner = "player";
    state.phase = "over";
    state.log = "Your Ash Phoenix lands the final blow — Brine's life hits zero.";
  } else if (shot === "loss") {
    state.playerLife = 0;
    state.aiLife = 7;
    state.round = 8;
    state.winner = "ai";
    state.phase = "over";
    state.log = "Brine's Kraken Heir lands the final blow — your life hits zero.";
  }
  return state;
}
