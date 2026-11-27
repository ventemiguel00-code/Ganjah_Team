import type {
  Jugador,
  JugadorDePartido,
  JugadorInput,
  JugadorReporte,
  MatchDay,
} from "@/lib/types";
import { hydrateLegacyPlayerSnapshot } from "@/data/legacy-player-snapshot";
import { legacyMatchdays } from "@/data/legacy-matchday-snapshot";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const API_CACHE_TTL_MS = 12_000;
const responseCache = new Map<string, { expiresAt: number; value: unknown }>();
const pendingGetRequests = new Map<string, Promise<unknown>>();
let apiCacheGeneration = 0;

function clone<T>(value: T): T {
  return typeof structuredClone === "function" ? structuredClone(value) : value;
}

function invalidateRelatedCache(path: string) {
  const playerWrite = path.startsWith("/api/jugadores");
  const matchdayWrite = path.startsWith("/api/matchdays");
  if (!playerWrite && !matchdayWrite) return;
  apiCacheGeneration += 1;

  for (const key of new Set([...responseCache.keys(), ...pendingGetRequests.keys()])) {
    if (
      (playerWrite && (key === "/api/jugadores" || key.startsWith("/api/reportes/"))) ||
      (matchdayWrite && (key === "/api/matchdays" || key === "/api/jugadores" || key.startsWith("/api/reportes/")))
    ) {
      responseCache.delete(key);
      pendingGetRequests.delete(key);
    }
  }
}

export function clearApiCache() {
  apiCacheGeneration += 1;
  responseCache.clear();
  pendingGetRequests.clear();
}

function hydratePlayer(player: Jugador): Jugador {
  return process.env.NODE_ENV === "development" ? hydrateLegacyPlayerSnapshot(player) : player;
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method || "GET").toUpperCase();
  const cacheKey = method === "GET" ? path : null;
  if (cacheKey) {
    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return clone(cached.value) as T;
    if (cached) responseCache.delete(cacheKey);
    const pending = pendingGetRequests.get(cacheKey);
    if (pending) return clone(await pending) as T;
  }

  const request = (async () => {
    const response = await fetch(`/api/backend${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 401 && typeof window !== "undefined") {
        window.location.replace("/ingreso?sesion=expirada");
      }
      let message = `La operación falló (${response.status}).`;
      try {
        const body = (await response.json()) as { message?: string; error?: string };
        message = body.message || body.error || message;
      } catch {
        // The backend may return an empty body for 401/403/404 responses.
      }
      throw new ApiError(message, response.status);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  })();

  if (!cacheKey) {
    const result = await request;
    invalidateRelatedCache(path);
    return result;
  }

  const cacheGeneration = apiCacheGeneration;
  pendingGetRequests.set(cacheKey, request);
  try {
    const result = await request;
    if (cacheGeneration === apiCacheGeneration) {
      responseCache.set(cacheKey, { expiresAt: Date.now() + API_CACHE_TTL_MS, value: clone(result) });
    }
    return result;
  } finally {
    if (pendingGetRequests.get(cacheKey) === request) pendingGetRequests.delete(cacheKey);
  }
}

export const api = {
  jugadores: {
    list: async () => {
      const players = await apiRequest<Jugador[]>("/api/jugadores");
      return players.map(hydratePlayer);
    },
    create: async (input: JugadorInput) =>
      hydratePlayer(await apiRequest<Jugador>("/api/jugadores", {
        method: "POST",
        body: JSON.stringify(input),
      })),
    update: async (id: number, input: JugadorInput) =>
      hydratePlayer(await apiRequest<Jugador>(`/api/jugadores/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      })),
    remove: (id: number) =>
      apiRequest<void>(`/api/jugadores/${id}`, { method: "DELETE" }),
  },
  matchdays: {
    list: async () => {
      const matches = await apiRequest<MatchDay[]>("/api/matchdays");
      if (process.env.NODE_ENV !== "development") return matches;
      const persistedDates = new Set(matches.map((match) => match.fechaPartido.slice(0, 16)));
      return [
        ...legacyMatchdays.filter((match) => !persistedDates.has(match.fechaPartido.slice(0, 16))),
        ...matches,
      ];
    },
    create: (jugadores: JugadorDePartido[]) =>
      apiRequest<MatchDay>("/api/matchdays", {
        method: "POST",
        body: JSON.stringify({ jugadores }),
      }),
    updateScore: (id: number, golesLocal: number, golesVisitante: number) =>
      apiRequest<MatchDay>(`/api/matchdays/${id}/marcador`, {
        method: "PUT",
        body: JSON.stringify({ golesLocal, golesVisitante }),
      }),
    updateRoster: (id: number, jugadores: JugadorDePartido[]) =>
      apiRequest<MatchDay>(`/api/matchdays/${id}/jugadores`, {
        method: "PUT",
        body: JSON.stringify({ jugadores }),
      }),
    remove: (id: number) =>
      apiRequest<void>(`/api/matchdays/${id}`, { method: "DELETE" }),
  },
  reportes: {
    monthly: (mes: number, anio: number) =>
      apiRequest<JugadorReporte[]>(
        `/api/reportes/partidos-por-mes?mes=${mes}&anio=${anio}`,
      ),
    absent: (mes: number, anio: number) =>
      apiRequest<string[]>(
        `/api/reportes/ausentes-por-mes?mes=${mes}&anio=${anio}`,
      ),
  },
};

