<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '../lib/api';
  import type { WeatherConditions } from '../lib/types';

  let conditions = $state<WeatherConditions | null>(null);
  let error = $state('');
  let loading = $state(false);

  function formatValue(value: number | null, suffix = ''): string {
    if (value === null || !Number.isFinite(value)) return '—';
    const formatted = Number.isInteger(value) ? String(value) : value.toFixed(1).replace('.', ',');
    return `${formatted}${suffix}`;
  }

  async function load(): Promise<void> {
    loading = true;
    error = '';
    try {
      conditions = await api.getWeather();
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'Dados climáticos indisponíveis.';
    } finally {
      loading = false;
    }
  }

  function updatedAt(value: string | null, zone: string | null): string {
    if (!value) return 'Horário de atualização não informado';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Horário de atualização não informado';
    return `Atualização: ${date.toLocaleString('pt-BR', { timeZone: zone || 'America/Recife' })}`;
  }

  onMount(() => { void load(); });
</script>

<section class="climate-card" aria-labelledby="climate-title">
  <div class="climate-heading">
    <div>
      <p class="eyebrow">Condições no Recife</p>
      <h2 id="climate-title">Clima de referência</h2>
    </div>
    <button class="button button-quiet" type="button" onclick={load} disabled={loading}>
      {loading ? 'Atualizando…' : 'Atualizar'}
    </button>
  </div>

  {#if loading && !conditions}
    <p class="climate-status" role="status">Consultando dados climáticos…</p>
  {:else if error}
    <div class="climate-status" role="status">
      <p>{error}</p>
      <small>Configure <code>GOOGLE_WEATHER_API_KEY</code> no arquivo <code>.env</code> para ativar.</small>
    </div>
  {:else if conditions}
    <p class="climate-condition">{conditions.condition || 'Condição não informada'}</p>
    <div class="weather-grid">
      <div><span>Temperatura</span><strong>{formatValue(conditions.temperature_c, ' °C')}</strong></div>
      <div><span>Sensação</span><strong>{formatValue(conditions.feels_like_c, ' °C')}</strong></div>
      <div><span>Índice de calor</span><strong>{formatValue(conditions.heat_index_c, ' °C')}</strong></div>
      <div><span>Índice UV</span><strong>{formatValue(conditions.uv_index)}</strong></div>
      <div><span>Umidade</span><strong>{formatValue(conditions.relative_humidity_percent, '%')}</strong></div>
      <div><span>Chuva</span><strong>{formatValue(conditions.precipitation_probability_percent, '%')}</strong></div>
    </div>
    <small class="updated-at">{updatedAt(conditions.observed_at, conditions.time_zone)}</small>
  {/if}

  <p class="climate-note">
    Dados para uma coordenada no centro do Recife, não medições por bairro ou alerta oficial.
    Fonte: <a href="https://developers.google.com/maps/documentation/weather" target="_blank" rel="noopener noreferrer">Google Weather API</a>.
    <span>{conditions?.note || 'Os relatos comunitários ajudam a apontar necessidades locais.'}</span>
  </p>
</section>
