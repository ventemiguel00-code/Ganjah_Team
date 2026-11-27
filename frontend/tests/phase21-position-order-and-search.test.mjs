import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const positions = await readFile(new URL("../src/lib/player-position.ts", import.meta.url), "utf8");
const players = await readFile(new URL("../src/components/players-manager.tsx", import.meta.url), "utf8");
const matchdays = await readFile(new URL("../src/components/matchdays-manager.tsx", import.meta.url), "utf8");
const formation = await readFile(new URL("../src/lib/formation-layout.ts", import.meta.url), "utf8");

test("centraliza el orden visual PO, DF, MD y DL sin cambiar aliases históricos", () => {
  assert.match(positions, /playerPositionOrder: readonly PlayerPosition\[\] = \["PORTERO", "DEFENSA", "MEDIOCAMPISTA", "DELANTERO"\]/);
  assert.match(positions, /GK: "PORTERO"/);
  assert.match(positions, /PORTERO: "PO"/);
  assert.match(players, /playerPositionOrder\.map/);
  assert.match(matchdays, /\.\.\.playerPositionOrder\.map/);
});

test("el buscador de convocatoria normaliza tildes y mantiene la selección fuera del resultado visible", () => {
  assert.match(matchdays, /function normalizedPlayerName/);
  assert.match(matchdays, /normalize\("NFD"\)/);
  assert.match(matchdays, /normalizedName\.includes\(normalizedRosterSearch\)/);
  assert.match(matchdays, /value=\{rosterSearch\}/);
  assert.match(matchdays, /setRosterSearch\(""\)/);
  assert.match(matchdays, /draftSelection\[player\.nombre\]/);
  assert.doesNotMatch(matchdays, /setRosterSearch\([^)]*\)[\s\S]{0,160}setDraftSelection/);
});

test("la formación conserva profundidades futbolísticas aunque reutiliza el orden de presentación", () => {
  assert.match(formation, /const POSITION_ORDER = playerPositionOrder/);
  assert.match(formation, /PORTERO: 94/);
  assert.match(formation, /DELANTERO: 53/);
});
