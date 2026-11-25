import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const home = await readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/app/globals.css", import.meta.url), "utf8");
const login = await readFile(new URL("../src/components/login-form.tsx", import.meta.url), "utf8");
const matchdays = await readFile(new URL("../src/components/matchdays-manager.tsx", import.meta.url), "utf8");

test("el acceso usa una cancha CSS y conserva el logotipo oficial", () => {
  assert.match(home, /ganjah-team-logo-extracted\.png/);
  assert.match(home, /className="welcome-pitch" aria-hidden="true"/);
  assert.match(home, /welcome-pitch-circle/);
  assert.match(styles, /Acceso: cancha nocturna/);
  assert.match(styles, /\.welcome-pitch-circle/);
  assert.match(styles, /@media \(max-width: 430px\)/);
  assert.match(login, /<span>Usuario<\/span>/);
  assert.match(login, /<span>Contraseña<\/span>/);
  assert.match(login, /\{loading \? "Validando…" : "Ingresar"\}/);
});

test("MatchDays indexa jugadores confirmados para evitar búsquedas repetidas", () => {
  assert.match(matchdays, /const playersByName = useMemo/);
  assert.match(matchdays, /new Map\(players\.map/);
  assert.match(matchdays, /playersByName\.get\(entry\.nombre\)/);
});
