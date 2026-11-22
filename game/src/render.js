// render.js — draws the felt table, both hands, the clash zone, life and
// spark totals, and the title / victory / defeat screens into the DOM.

import { SUITS, EFFECT_TEXT } from "./deck.js";
import { START_LIFE } from "./game.js";

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
}

export function cardElement(card, opts = {}) {
  const suit = SUITS[card.suit];
  const node = el("button", "card suit-" + card.suit);
  node.type = "button";
  node.dataset.cardId = card.id;
  node.style.setProperty("--suit", suit.color);
  if (opts.faceDown) {
    node.classList.add("face-down");
    node.innerHTML = '<span class="back-mark">E&amp;T</span>';
    node.disabled = true;
    node.setAttribute("aria-label", "Face-down card");
    return node;
  }
  const top = el("span", "card-top");
  top.append(el("span", "card-power", String(card.power)), el("span", "card-glyph", suit.glyph));
  const name = el("span", "card-name", card.name);
  const art = el("span", "card-art", suit.glyph);
  const meta = el("span", "card-meta", `${suit.name} · Cost ${card.cost} spark${card.cost === 1 ? "" : "s"}`);
  node.append(top, art, name, meta);
  if (card.effect) node.append(el("span", "card-effect", EFFECT_TEXT[card.effect]));
  else node.append(el("span", "card-effect plain", "No special effect — pure power."));
  node.setAttribute(
    "aria-label",
    `${card.name}, ${suit.name}, power ${card.power}, cost ${card.cost}`,
  );
  if (opts.disabled) node.disabled = true;
  if (opts.selected) node.classList.add("selected");
  return node;
}

function lifeBar(label, life, sparks) {
  const wrap = el("div", "life-box");
  const pct = Math.max(0, Math.round((life / START_LIFE) * 100));
  wrap.append(el("span", "life-label", `${label} — Life ${life}/${START_LIFE}`));
  const bar = el("span", "life-bar");
  const fill = el("span", "life-fill");
  fill.style.width = pct + "%";
  bar.append(fill);
  wrap.append(bar, el("span", "spark-label", `Sparks ✦ ${sparks}`));
  return wrap;
}

export function renderTable(root, state, onPick) {
  root.innerHTML = "";
  const table = el("section", "table");
  table.id = "table";

  const aiRow = el("div", "row ai-row");
  aiRow.append(el("h2", "row-title", "Captain Brine — Rival Hand"));
  const aiHand = el("div", "hand");
  for (const card of state.aiHand) aiHand.append(cardElement(card, { faceDown: true }));
  if (state.phase !== "pick" && state.aiPick) {
    // During the reveal the AI hand shrinks; its played card sits centre.
  }
  aiRow.append(lifeBar("Brine", state.aiLife, state.aiSparks), aiHand);
  table.append(aiRow);

  const centre = el("div", "clash-zone");
  centre.append(el("p", "round-label", `Round ${state.round} · Deck ${state.deck.length} cards left`));
  const clashCards = el("div", "clash-cards");
  if (state.playerPick) clashCards.append(cardElement(state.aiPick, {}), cardElement(state.playerPick, {}));
  else clashCards.append(el("p", "clash-hint", "Pick a card below to clash →"));
  centre.append(clashCards);
  centre.append(el("p", "log-line", state.log), el("p", "taunt-line", state.taunt));
  if (state.phase === "reveal") {
    const next = el("button", "big-btn", "Next round ▸");
    next.id = "next-round";
    next.addEventListener("click", onPick.next);
    centre.append(next);
  }
  table.append(centre);

  const playerRow = el("div", "row player-row");
  playerRow.append(el("h2", "row-title", "Your Hand — click a card (or press 1–5)"));
  const hand = el("div", "hand player-hand");
  state.playerHand.forEach((card, i) => {
    const node = cardElement(card, { disabled: card.cost > state.playerSparks || state.phase !== "pick" });
    node.append(el("span", "key-hint", String(i + 1)));
    node.addEventListener("click", () => onPick.card(card.id));
    hand.append(node);
  });
  playerRow.append(hand, lifeBar("You", state.playerLife, state.playerSparks));
  table.append(playerRow);
  root.append(table);
}

export function renderTitle(root, onStart) {
  root.innerHTML = "";
  const box = el("section", "screen title-screen");
  box.append(el("p", "kicker", "An original elemental card duel"));
  box.append(el("h1", "game-title", "EMBER & TIDE"));
  box.append(el("p", "tagline", "Out-read Captain Brine in a best-of-clashes duel of flame, leaf, stone and wave."));
  const rules = el("div", "rules-card");
  rules.append(
    el("p", null, "• Both duelists start on 20 life. Each round, play one card to clash."),
    el("p", null, "• The wheel: Ember ▲ burns Grove ●, Grove roots Stone ■, Stone dams Tide ◆, Tide douses Ember. Wheel advantage: +3 power."),
    el("p", null, "• The loser takes the power gap as damage. Guard softens it, Pierce ignores Guard, Mend heals the winner."),
    el("p", null, "• Cards cost sparks; you gain 2 sparks each round (max 5). First to 0 life loses."),
  );
  box.append(rules);
  const start = el("button", "big-btn start-btn", "⚔  Start the duel");
  start.id = "start-duel";
  start.addEventListener("click", onStart);
  box.append(start, el("p", "hint", "Mouse or keys 1–5 to play a card · Enter to begin"));
  root.append(box);
}

export function renderEnd(root, state, onRestart) {
  root.innerHTML = "";
  const won = state.winner === "player";
  const box = el("section", "screen end-screen " + (won ? "win-screen" : "loss-screen"));
  box.append(el("p", "kicker", won ? "Victory" : state.winner === "draw" ? "Dead calm" : "Defeat"));
  box.append(el("h1", "game-title", won ? "YOU WIN! 🏆" : state.winner === "draw" ? "A TIE" : "YOU LOSE"));
  box.append(
    el("p", "tagline",
      won
        ? `After ${state.round} rounds the harbour is yours — Brine's life reached 0 while you stood on ${state.playerLife}.`
        : state.winner === "draw"
          ? "The deck ran dry with life level. The harbour keeps its secret."
          : `After ${state.round} rounds Brine takes the harbour — your life reached 0 while he stood on ${state.aiLife}.`),
  );
  const score = el("div", "final-score");
  score.append(
    el("p", null, `Final score — You: ${state.playerLife} life · Brine: ${state.aiLife} life · Rounds played: ${state.round}`),
    el("p", null, state.log),
  );
  box.append(score);
  const again = el("button", "big-btn start-btn", "↻  Duel again");
  again.id = "duel-again";
  again.addEventListener("click", onRestart);
  box.append(again, el("p", "hint", "Press Enter to play again"));
  root.append(box);
}
