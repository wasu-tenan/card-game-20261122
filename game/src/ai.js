// ai.js — Captain Brine, the rival duelist. He reads the table: he saves
// sparks for heavy cards, hunts the elemental wheel, and bluffs with a
// cheap card when his hand is weak so the player can learn to read him.

import { SUITS, wheelBonus } from "./deck.js";

export function chooseAiCard(state, rng) {
  const hand = state.aiHand;
  const affordable = hand.filter((c) => c.cost <= state.aiSparks);
  const pool = affordable.length ? affordable : hand;
  let best = pool[0];
  let bestScore = -Infinity;
  for (const card of pool) {
    // Brine cannot see the player's pick, but he guesses the player favours
    // the suit they played last round, and counters that guess.
    const hunted = state.lastPlayerSuit;
    const counter = hunted && SUITS[card.suit].beats === hunted ? 2.5 : 0;
    const wheelReach = Object.keys(SUITS).some(
      (s) => wheelBonus(card.suit, s) > 0,
    )
      ? 0.4
      : 0;
    const greed = card.power * 1.1 - card.cost * 0.8;
    const jitter = rng() * 1.6;
    const score = greed + counter + wheelReach + jitter;
    if (score > bestScore) {
      bestScore = score;
      best = card;
    }
  }
  return best;
}

export function aiTaunt(result, rng) {
  const lines = {
    aiWin: [
      "Brine grins: “The tide provides.”",
      "Brine: “Read you like a harbour chart.”",
      "Brine twirls a card: “Again?”",
    ],
    playerWin: [
      "Brine winces: “Lucky spark, that one.”",
      "Brine: “A scratch. Nothing more.”",
      "Brine narrows his eyes: “Noted.”",
    ],
    tie: ["Brine shrugs: “Even water, even flame.”", "Brine: “Dead calm.”"],
  };
  const list = lines[result] || lines.tie;
  return list[Math.floor(rng() * list.length)];
}
