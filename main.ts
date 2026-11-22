// Ember & Tide — hand-in program (Node 22, standard library only).
// The playable game lives in game/ as plain static files; this program
// publishes it: it mirrors game/ and screenshots/ into the output folder
// and asks the vendored make.fun library to write dossier.json from them,
// so the judge's summary always matches the shipped files byte for byte.
// Local run:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-game.ts";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

function publishFolder(name: string): void {
  const from = join(repoRoot, name);
  const to = join(outputDir, name);
  rmSync(to, { recursive: true, force: true });
  mkdirSync(to, { recursive: true });
  if (existsSync(from)) cpSync(from, to, { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
publishFolder("game");
publishFolder("screenshots");

const dossierText = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, "dossier.json"), dossierText);
console.log(`Ember & Tide published to ${outputDir} (dossier ${dossierText.length} bytes)`);
