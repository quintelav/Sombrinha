export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ReportSummaryItem {
  location: string;
  latitude: number | null;
  longitude: number | null;
  count: number;
  recent_count: number;
  priority: number;
  main_issue: string;
  newest: string;
  suggestion: string;
}

export interface ReportSummary {
  total_reports: number;
  locations: ReportSummaryItem[];
}

export interface Adoption {
  kind: 'refresco' | 'onibus' | 'area_verde';
  name: string;
  organization: string;
  reference: string;
  latitude: number;
  longitude: number;
  commitment: string;
  hours: string;
  status: string;
  created_at: string;
}

export interface ReferencePoint extends Coordinates {
  id: string;
  nome: string;
  tipo: string;
  bairro: string;
  endereco: string;
  descricao: string;
  status: string;
}

export interface WeatherConditions {
  location: string;
  temperature_c: number | null;
  feels_like_c: number | null;
  heat_index_c: number | null;
  condition: string | null;
  relative_humidity_percent: number | null;
  uv_index: number | null;
  precipitation_probability_percent: number | null;
  observed_at: string | null;
  time_zone: string | null;
  source: string;
  note: string;
}

export interface VoiceResult {
  categoria: string;
  resposta_voz: string;
  recomendacao: string;
  modelo: string;
}

export interface TradeResult {
  pontos_simulados: number;
  recompensa_sugerida: string | null;
  status: string;
  impacto_estimado: string;
}

export interface ApiErrorBody {
  error?: string;
  erro?: string;
}
