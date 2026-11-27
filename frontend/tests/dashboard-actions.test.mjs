import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dashboard = readFileSync(new URL("../src/components/dashboard-overview.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

test("el panel sustituye las métricas por los accesos principales", () => {
  assert.match(dashboard, /const quickActions/);
  assert.match(dashboard, /href: "\/jugadores"/);
  assert.match(dashboard, /href: "\/matchdays"/);
  assert.match(dashboard, /href: "\/estadisticas"/);
  assert.match(dashboard, /dashboard-actions/);
  assert.doesNotMatch(dashboard, /<Metric/);
});

test("los accesos principales conservan responsive y foco visible", () => {
  assert.match(styles, /\.dashboard-actions/);
  assert.match(styles, /\.dashboard-action:hover, \.dashboard-action:focus-visible/);
  assert.match(styles, /@media \(max-width: 760px\) \{\s*\.dashboard-actions \{ grid-template-columns: 1fr; \}/);
});
