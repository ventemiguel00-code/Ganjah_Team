import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const playerCard = await readFile(new URL("../src/components/player-card.tsx", import.meta.url), "utf8");
const brandMark = await readFile(new URL("../src/components/brand-mark.tsx", import.meta.url), "utf8");

const silhouettes = [
  "player-forward-silhouette.png",
  "player-midfielder-silhouette.png",
  "player-goalkeeper-silhouette.png",
  "player-defender-silhouette.png",
];

test("las cuatro siluetas aprobadas permanecen disponibles como recursos públicos", async () => {
  await Promise.all(silhouettes.map((file) => access(new URL(`../public/${file}`, import.meta.url))));
  for (const file of silhouettes) assert.match(playerCard, new RegExp(`/${file.replace(".", "\\.")}`));
});

test("las siluetas locales evitan el optimizador de Next.js en producción", () => {
  assert.match(playerCard, /sizes="\(max-width: 430px\) 88px, 120px"\s+unoptimized\s+aria-hidden/s);
});

test("el logotipo de la aplicación autenticada vuelve al panel interno", () => {
  assert.match(brandMark, /<Link href="\/panel" className="brand-mark"/);
  assert.doesNotMatch(brandMark, /<Link href="\/" className="brand-mark"/);
});
