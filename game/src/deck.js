// deck.js — card definitions for Ember & Tide, an original elemental duel.
// Four suits form a wheel: Ember burns Grove, Grove roots Stone,
// Stone dams Tide, Tide douses Ember. Beating the wheel grants +3 power.

export const SUITS = {
  ember: { name: "Ember", glyph: "▲", color: "#e8542f", beats: "grove" },
  grove: { name: "Grove", glyph: "●", color: "#3da35d", beats: "stone" },
  stone: { name: "Stone", glyph: "■", color: "#8a7f6a", beats: "tide" },
  tide: { name: "Tide", glyph: "◆", color: "#2f7fe8", beats: "ember" },
};

export const WHEEL_BONUS = 3;

// Every card: name, suit, power (1-10), cost in sparks (0-3), and an
// optional effect id resolved by game.js when a clash is settled.
const CARD_POOL = [
  { name: "Cinder Imp", suit: "ember", power: 3, cost: 0, effect: null },
  { name: "Flame Herald", suit: "ember", power: 5, cost: 1, effect: null },
  { name: "Pyre Giant", suit: "ember", power: 8, cost: 2, effect: null },
  { name: "Ash Phoenix", suit: "ember", power: 9, cost: 3, effect: "mend" },
  { name: "Spark Sprite", suit: "ember", power: 2, cost: 0, effect: null },
  { name: "Magma Brute", suit: "ember", power: 7, cost: 2, effect: "pierce" },
  { name: "Moss Pup", suit: "grove", power: 3, cost: 0, effect: null },
  { name: "Thorn Knight", suit: "grove", power: 6, cost: 1, effect: null },
  { name: "Elder Treant", suit: "grove", power: 8, cost: 2, effect: "mend" },
  { name: "Bloom Witch", suit: "grove", power: 5, cost: 1, effect: "mend" },
  { name: "Vine Serpent", suit: "grove", power: 7, cost: 2, effect: null },
  { name: "Seedling", suit: "grove", power: 2, cost: 0, effect: null },
  { name: "Pebble Imp", suit: "stone", power: 3, cost: 0, effect: null },
  { name: "Granite Guard", suit: "stone", power: 6, cost: 1, effect: "guard" },
  { name: "Mountain King", suit: "stone", power: 9, cost: 3, effect: "guard" },
  { name: "Quarry Ogre", suit: "stone", power: 7, cost: 2, effect: null },
  { name: "Rubble Rat", suit: "stone", power: 2, cost: 0, effect: null },
  { name: "Cliff Warden", suit: "stone", power: 5, cost: 1, effect: "guard" },
  { name: "Ripple Newt", suit: "tide", power: 3, cost: 0, effect: null },
  { name: "Wave Rider", suit: "tide", power: 5, cost: 1, effect: null },
  { name: "Kraken Heir", suit: "tide", power: 9, cost: 3, effect: "pierce" },
  { name: "Storm Eel", suit: "tide", power: 7, cost: 2, effect: "pierce" },
  { name: "Puddle Frog", suit: "tide", power: 2, cost: 0, effect: null },
  { name: "Coral Sage", suit: "tide", power: 6, cost: 1, effect: "mend" },
];

export const EFFECT_TEXT = {
  mend: "Mend: heal 2 life if you win the clash",
  pierce: "Pierce: ignores Guard when dealing damage",
  guard: "Guard: takes 2 less damage when losing",
};

export function buildDeck(rng) {
  const cards = CARD_POOL.map((c, i) => ({ ...c, id: "card-" + i }));
  // Two copies of the pool make a 48-card shared clash deck.
  const deck = [...cards, ...cards.map((c) => ({ ...c, id: c.id + "b" }))];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function wheelBonus(attackerSuit, defenderSuit) {
  return SUITS[attackerSuit].beats === defenderSuit ? WHEEL_BONUS : 0;
}

export function effectivePower(card, foeCard) {
  return card.power + wheelBonus(card.suit, foeCard.suit);
}
