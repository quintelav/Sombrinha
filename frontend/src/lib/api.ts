import type {
  Adoption,
  ApiErrorBody,
  ReferencePoint,
  ReportSummary,
  TradeResult,
  VoiceResult,
  WeatherConditions,
} from './types';

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    throw new Error('Não foi possível conectar ao Sombrinha. Verifique sua internet e tente novamente.');
  }

  const body = await response.json().catch(() => ({} as ApiErrorBody));
  if (!response.ok) {
    const message = (body as ApiErrorBody).error ?? (body as ApiErrorBody).erro;
    throw new Error(message || `O servidor respondeu com erro (${response.status}).`);
  }
  return body as T;
}

export const api = {
  getSummary: () => requestJson<ReportSummary>('/api/summary'),
  getAdoptions: async () => {
    const result = await requestJson<{ adoptions: Adoption[] }>('/api/adoptions');
    return result.adoptions;
  },
  getReferencePoints: async () => {
    const result = await requestJson<{ dados: ReferencePoint[] }>('/api/reference-points');
    return result.dados;
  },
  getNeighborhoods: async () => {
    const result = await requestJson<{ bairros_por_rpa: Record<string, string[]> }>('/api/neighborhoods');
    return result.bairros_por_rpa;
  },
  getWeather: async () => {
    const result = await requestJson<{ status: string; data: WeatherConditions }>('/api/climate/current', {
      cache: 'no-store',
    });
    return result.data;
  },
  createReport: (payload: Record<string, string>) =>
    requestJson<{ ok: boolean }>('/api/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  createAdoption: (payload: Record<string, string>) =>
    requestJson<{ ok: boolean; status: string }>('/api/adoptions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  createTrade: (payload: { item_tipo: string; quantidade: number }) =>
    requestJson<{ dados: TradeResult }>('/api/trades', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  analyzeVoice: async (text: string) => {
    const result = await requestJson<{ dados: VoiceResult }>('/api/ai/voice', {
      method: 'POST',
      body: JSON.stringify({ texto: text }),
    });
    return result.dados;
  },
  getShadeRouteNotice: async (origin: string, destination: string) => {
    const result = await requestJson<{ dados: { aviso: string } }>('/api/routes/shade', {
      method: 'POST',
      body: JSON.stringify({ origem: origin, destino: destination }),
    });
    return result.dados.aviso;
  },
};
