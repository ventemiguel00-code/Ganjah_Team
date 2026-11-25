import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const home = await readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const panel = await readFile(new URL("../src/app/(dashboard)/panel/page.tsx", import.meta.url), "utf8");
const login = await readFile(new URL("../src/components/login-form.tsx", import.meta.url), "utf8");
const manager = await readFile(new URL("../src/components/matchdays-manager.tsx", import.meta.url), "utf8");

test("mantiene la portada centrada en el logo y etiquetas claras de ingreso", () => {
  for (const removed of ["Fútbol local, gestión real", "La energía del equipo", "Organiza la plantilla", "Acceso privado", "Utiliza tu usuario"]) {
    assert.doesNotMatch(home, new RegExp(removed, "i"));
  }
  assert.doesNotMatch(panel, /La cancha, bajo control|Plantilla, próximos encuentros/i);
  assert.match(home, /ganjah-team-logo-extracted\.png/);
  assert.match(home, /<h1 className="login-title">Ingresar<\/h1>/);
  assert.match(login, /<span>Usuario<\/span>/);
  assert.match(login, /<span>Contraseña<\/span>/);
});

test("separa MatchDays sin perder el flujo ni volver a sortear", () => {
  assert.match(manager, /type MatchdayTab = "generator" \| "records"/);
  assert.match(manager, /role="tablist" aria-label="Secciones de MatchDays"/);
  assert.match(manager, />Generador de equipos</);
  assert.match(manager, />Registro de partidos</);
  assert.match(manager, /activeTab === "generator"/);
  assert.match(manager, /activeTab === "records"/);
  assert.match(manager, /await load\(\);\s*setActiveTab\("records"\)/);
});
