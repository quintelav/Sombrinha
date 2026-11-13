const API_BASE = import.meta.env.VITE_API_URL || '';

async function fetchJson(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[Sombrinha API] Falha em ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // 1. Clima em tempo real (Google Weather API / Open-Meteo)
  getWeather: async () => {
    try {
      const data = await fetchJson('/api/climate/current');
      return data.data || data;
    } catch {
      return {
        temperature_c: 28.5,
        feels_like_c: 33.0,
        heat_index_c: 33.5,
        uv_index: 9,
        condition: 'Calor e sol forte em Recife',
        relative_humidity_percent: 72,
        location: 'Recife, PE (Centro)'
      };
    }
  },

  // 2. Estudo estratégico das ruas mais quentes e pontos recomendados
  getHeatStudy: async () => {
    try {
      const res = await fetchJson('/api/heat-islands/study');
      return res.dados;
    } catch {
      return null;
    }
  },

  // 3. Avaliação de Proximidade e Geofencing no Centro
  checkProximity: async (latitude, longitude) => {
    try {
      const res = await fetchJson('/api/heat-islands/proximity', {
        method: 'POST',
        body: JSON.stringify({ latitude, longitude })
      });
      return res.dados;
    } catch {
      return null;
    }
  },

  // 4. Pontos de Sombra, Bebedouros e Ecopontos
  getReferencePoints: async () => {
    try {
      const res = await fetchJson('/api/reference-points');
      return res.dados || [];
    } catch {
      return [];
    }
  },

  // 5. Relatos comunitários
  getSummary: async () => {
    try {
      return await fetchJson('/api/summary');
    } catch {
      return { locations: [], total_reports: 0 };
    }
  },

  // 6. Propostas de Adoção
  getAdoptions: async () => {
    try {
      const res = await fetchJson('/api/adoptions');
      return res.adoptions || [];
    } catch {
      return [];
    }
  },

  // 7. Reciclagem e Troca Solidária
  createTrade: async (tradeData) => {
    return await fetchJson('/api/trades', {
      method: 'POST',
      body: JSON.stringify(tradeData)
    });
  },

  // 8. Assistente de Voz com IA
  analyzeVoice: async (text) => {
    try {
      const res = await fetchJson('/api/ai/voice', {
        method: 'POST',
        body: JSON.stringify({ texto: text })
      });
      return res.dados;
    } catch {
      return {
        resposta_voz: 'Encontrei pontos de água gelada e sombra próximos na Conde da Boa Vista e no Treze de Maio.',
        recomendacao: 'Beba água com frequência e evite o asfalto quente nas horas de pico.'
      };
    }
  },

  // 9. Rota Térmica na Sombra
  getShadeRoute: async (origem, destino) => {
    try {
      const res = await fetchJson('/api/routes/shade', {
        method: 'POST',
        body: JSON.stringify({ origem, destino })
      });
      return res.dados;
    } catch {
      return null;
    }
  }
};
