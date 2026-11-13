<script lang="ts">
  import { onMount } from 'svelte';
  import ClimateCard from './components/ClimateCard.svelte';
  import CommunityMap from './components/CommunityMap.svelte';
  import { api } from './lib/api';
  import type {
    Adoption,
    Coordinates,
    ReferencePoint,
    ReportSummary,
    VoiceResult,
  } from './lib/types';

  type SelectionMode = 'report' | 'adoption';

  const emptySummary: ReportSummary = { total_reports: 0, locations: [] };
  const reportKinds = [
    { value: 'quente_sem_sombra', label: 'Local muito quente ou sem sombra' },
    { value: 'precisa_sombra', label: 'Espaço que poderia receber uma ilha de sombra' },
    { value: 'ponto_refresco', label: 'Sugestão de local para ponto de apoio' },
    { value: 'espaco_verde', label: 'Área verde que precisa de cuidado' },
  ];

  let summary = $state<ReportSummary>(emptySummary);
  let adoptions = $state<Adoption[]>([]);
  let referencePoints = $state<ReferencePoint[]>([]);
  let neighborhoods = $state<Record<string, string[]>>({});
  let pageError = $state('');
  let loadingData = $state(true);
  let highContrast = $state(false);
  let selectionMode = $state<SelectionMode>('report');
  let reportCoordinates = $state<Coordinates | null>(null);
  let adoptionCoordinates = $state<Coordinates | null>(null);

  let reportNeighborhood = $state('');
  let reportReference = $state('');
  let reportKind = $state(reportKinds[0].value);
  let reportNote = $state('');
  let reportStatus = $state('');
  let savingReport = $state(false);

  let adoptionKind = $state<Adoption['kind']>('refresco');
  let adoptionName = $state('');
  let organization = $state('');
  let adoptionReference = $state('');
  let commitment = $state('');
  let hours = $state('');
  let adoptionStatus = $state('');
  let savingAdoption = $state(false);

  let voiceText = $state('');
  let voiceResult = $state<VoiceResult | null>(null);
  let voiceError = $state('');
  let askingVoice = $state(false);
  let routeOrigin = $state('Praça do Derby');
  let routeDestination = $state('Marco Zero (Recife Antigo)');
  let routeNotice = $state('');
  let checkingRoute = $state(false);
  let tradeItem = $state('garrafa_pet');
  let tradeQuantity = $state(6);
  let tradeMessage = $state('');
  let simulatingTrade = $state(false);
  let citizenDialog: HTMLDialogElement;

  async function refreshData(): Promise<void> {
    loadingData = true;
    pageError = '';
    const [summaryResult, adoptionResult, pointResult, neighborhoodsResult] = await Promise.allSettled([
      api.getSummary(), api.getAdoptions(), api.getReferencePoints(), api.getNeighborhoods(),
    ]);

    if (summaryResult.status === 'fulfilled') summary = summaryResult.value;
    else pageError = 'Não foi possível carregar os relatos. Tente atualizar a página.';

    if (adoptionResult.status === 'fulfilled') adoptions = adoptionResult.value;
    else pageError ||= 'Não foi possível carregar as propostas de cuidado.';

    if (pointResult.status === 'fulfilled') referencePoints = pointResult.value;
    if (neighborhoodsResult.status === 'fulfilled') neighborhoods = neighborhoodsResult.value;
    loadingData = false;
  }

  function onMapPick(coordinates: Coordinates): void {
    if (selectionMode === 'adoption') {
      adoptionCoordinates = coordinates;
      adoptionStatus = '';
    } else {
      reportCoordinates = coordinates;
      reportStatus = '';
    }
  }

  function chooseAdoptionLocation(): void {
    selectionMode = 'adoption';
    adoptionStatus = 'Toque no mapa para marcar o ponto aproximado da proposta.';
    document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function useMyLocation(): void {
    selectionMode = 'report';
    if (!navigator.geolocation) {
      reportStatus = 'Este navegador não disponibiliza a localização. Marque o ponto diretamente no mapa.';
      return;
    }
    reportStatus = 'Obtendo localização…';
    navigator.geolocation.getCurrentPosition(
      (position) => {
        reportCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        reportStatus = 'Localização aproximada obtida. Confirme o ponto no mapa.';
        document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      },
      () => { reportStatus = 'Não foi possível obter a localização. Marque o ponto no mapa.'; },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  }

  async function submitReport(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!reportCoordinates) {
      reportStatus = 'Marque o local aproximado no mapa ou use sua localização.';
      return;
    }
    savingReport = true;
    reportStatus = 'Salvando relato…';
    try {
      await api.createReport({
        neighborhood: reportNeighborhood,
        reference: reportReference,
        kind: reportKind,
        note: reportNote,
        latitude: String(reportCoordinates.latitude),
        longitude: String(reportCoordinates.longitude),
      });
      reportNeighborhood = '';
      reportReference = '';
      reportKind = reportKinds[0].value;
      reportNote = '';
      reportCoordinates = null;
      reportStatus = 'Relato registrado. Obrigado por contribuir!';
      await refreshData();
    } catch (error) {
      reportStatus = error instanceof Error ? error.message : 'Não foi possível salvar o relato.';
    } finally {
      savingReport = false;
    }
  }

  async function submitAdoption(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!adoptionCoordinates) {
      adoptionStatus = 'Marque o local aproximado no mapa antes de enviar.';
      return;
    }
    savingAdoption = true;
    adoptionStatus = 'Enviando proposta…';
    try {
      await api.createAdoption({
        kind: adoptionKind,
        name: adoptionName,
        organization,
        reference: adoptionReference,
        commitment,
        hours,
        latitude: String(adoptionCoordinates.latitude),
        longitude: String(adoptionCoordinates.longitude),
      });
      adoptionKind = 'refresco';
      adoptionName = '';
      organization = '';
      adoptionReference = '';
      commitment = '';
      hours = '';
      adoptionCoordinates = null;
      adoptionStatus = 'Proposta recebida; aparece no mapa aguardando validação.';
      selectionMode = 'report';
      await refreshData();
    } catch (error) {
      adoptionStatus = error instanceof Error ? error.message : 'Não foi possível enviar a proposta.';
    } finally {
      savingAdoption = false;
    }
  }

  function speak(text: string): void {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    window.speechSynthesis.speak(utterance);
  }

  async function askAssistant(text = voiceText): Promise<void> {
    if (!text.trim()) {
      voiceError = 'Escreva ou fale uma pergunta curta.';
      return;
    }
    askingVoice = true;
    voiceError = '';
    try {
      voiceResult = await api.analyzeVoice(text.trim());
      speak(voiceResult.resposta_voz);
    } catch (error) {
      voiceError = error instanceof Error ? error.message : 'Não foi possível consultar o assistente.';
    } finally {
      askingVoice = false;
    }
  }

  interface VoiceResultLike {
    results: ArrayLike<ArrayLike<{ transcript: string }>>;
  }
  interface VoiceRecognition {
    lang: string;
    onresult: ((event: VoiceResultLike) => void) | null;
    onerror: (() => void) | null;
    start: () => void;
  }
  type VoiceRecognitionConstructor = new () => VoiceRecognition;

  function startVoiceInput(): void {
    const browser = window as Window & {
      SpeechRecognition?: VoiceRecognitionConstructor;
      webkitSpeechRecognition?: VoiceRecognitionConstructor;
    };
    const Recognition = browser.SpeechRecognition || browser.webkitSpeechRecognition;
    if (!Recognition) {
      voiceError = 'O reconhecimento de voz não está disponível neste navegador. Você ainda pode digitar.';
      return;
    }
    const recognition = new Recognition();
    recognition.lang = 'pt-BR';
    recognition.onresult = (event) => {
      voiceText = event.results[0]?.[0]?.transcript || '';
      if (voiceText) void askAssistant(voiceText);
    };
    recognition.onerror = () => { voiceError = 'Não foi possível reconhecer a fala. Tente digitar.'; };
    recognition.start();
  }

  async function checkShadeRoute(): Promise<void> {
    checkingRoute = true;
    routeNotice = '';
    try {
      routeNotice = await api.getShadeRouteNotice(routeOrigin, routeDestination);
    } catch (error) {
      routeNotice = error instanceof Error ? error.message : 'Não foi possível consultar o recurso.';
    } finally {
      checkingRoute = false;
    }
  }

  async function simulateTrade(): Promise<void> {
    simulatingTrade = true;
    tradeMessage = '';
    try {
      const result = await api.createTrade({ item_tipo: tradeItem, quantidade: tradeQuantity });
      tradeMessage = `Simulação: ${result.dados.pontos_simulados} pontos ilustrativos. ${result.dados.status}.`;
    } catch (error) {
      tradeMessage = error instanceof Error ? error.message : 'Não foi possível simular a pontuação.';
    } finally {
      simulatingTrade = false;
    }
  }

  onMount(() => { void refreshData(); });
</script>

<div class="app-shell" class:high-contrast={highContrast}>
  <header class="site-header">
    <div class="page-width header-inner">
      <a class="brand" href="#inicio" aria-label="Sombrinha, início">
        <span class="brand-logo-window" aria-hidden="true">
          <img class="brand-logo" src={`${import.meta.env.BASE_URL}assets/sombrinha-logo.png`} alt="" />
        </span>
        <span><strong>Sombrinha</strong><small>Cuidado climático comunitário</small></span>
      </a>
      <div class="header-actions">
        <a class="button button-primary header-cta" href="#report-form">Registrar demanda</a>
        <button class="button button-quiet contrast-toggle" type="button" onclick={() => highContrast = !highContrast} aria-pressed={highContrast}>
          {highContrast ? 'Contraste padrão' : 'Alto contraste'}
        </button>
        <button class="icon-button" type="button" aria-label="Ver cartão comunitário ilustrativo" onclick={() => citizenDialog?.showModal()}>♧</button>
      </div>
    </div>
  </header>

  <main id="inicio" class="page-width main-content">
    <section class="welcome-row" aria-labelledby="welcome-title">
      <div>
        <p class="eyebrow">Mobilização climática comunitária · Recife</p>
        <h1 id="welcome-title">Cuidar do bairro começa por ouvir quem vive nele.</h1>
        <p class="lead">Marque um local que precisa de sombra, apoio ou cuidado. A comunidade pode visualizar as demandas e propor ações.</p>
      </div>
      <a class="button button-primary welcome-cta" href="#map-section">Marcar um local <span aria-hidden="true">↓</span></a>
    </section>

    <ClimateCard />

    {#if pageError}
      <div class="notice notice-error" role="status">{pageError} <button class="text-button" type="button" onclick={refreshData}>Tentar novamente</button></div>
    {/if}

    <section id="map-section" class="panel map-panel" aria-labelledby="map-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">1 · Escolha o ponto</p>
          <h2 id="map-title">Mapa comunitário</h2>
        </div>
        <div class="segmented-control" aria-label="O que deseja marcar no mapa?">
          <button type="button" class:active={selectionMode === 'report'} aria-pressed={selectionMode === 'report'} onclick={() => selectionMode = 'report'}>Demanda</button>
          <button type="button" class:active={selectionMode === 'adoption'} aria-pressed={selectionMode === 'adoption'} onclick={() => selectionMode = 'adoption'}>Proposta</button>
        </div>
      </div>
      <p class="map-instruction" role="status">
        {selectionMode === 'report' ? 'Toque no mapa para marcar uma demanda.' : 'Toque no mapa para marcar o ponto da proposta.'}
        {#if selectionMode === 'report' && reportCoordinates}
          <span> Local marcado: {reportCoordinates.latitude.toFixed(4)}, {reportCoordinates.longitude.toFixed(4)}.</span>
        {:else if selectionMode === 'adoption' && adoptionCoordinates}
          <span> Local marcado: {adoptionCoordinates.latitude.toFixed(4)}, {adoptionCoordinates.longitude.toFixed(4)}.</span>
        {/if}
      </p>
      <CommunityMap
        reports={summary.locations}
        {adoptions}
        referencePoints={referencePoints}
        {selectionMode}
        selectedCoordinates={selectionMode === 'adoption' ? adoptionCoordinates : reportCoordinates}
        onPick={onMapPick}
      />
      <div class="map-legend" aria-label="Legenda do mapa">
        <span><i class="legend-dot demand"></i> Demandas comunitárias</span>
        <span><i class="legend-dot reference"></i> Referências a validar</span>
        <span>💧 🚌 🌿 Propostas de cuidado</span>
      </div>
    </section>

    <div class="form-grid">
      <section class="panel form-panel" aria-labelledby="report-title">
        <div class="section-heading">
          <div><p class="eyebrow">2 · Relato rápido</p><h2 id="report-title">O que precisa de cuidado?</h2></div>
          <span class="step-pill">Morador(a)</span>
        </div>
        <form id="report-form" onsubmit={submitReport}>
          <label for="report-neighborhood">Bairro</label>
          <select id="report-neighborhood" bind:value={reportNeighborhood} required>
            <option value="">Selecione seu bairro</option>
            {#each Object.entries(neighborhoods) as [rpa, names]}
              <optgroup label="RPA {rpa}">
                {#each names as name}<option value={name}>{name}</option>{/each}
              </optgroup>
            {/each}
          </select>

          <label for="report-reference">Referência pública</label>
          <input id="report-reference" bind:value={reportReference} maxlength="80" placeholder="Praça, escola ou parada de ônibus" required />
          <small class="field-hint">Não informe endereço residencial nem dados pessoais.</small>

          <label for="report-kind">Situação</label>
          <select id="report-kind" bind:value={reportKind}>
            {#each reportKinds as item}<option value={item.value}>{item.label}</option>{/each}
          </select>

          <label for="report-note">O que ajudaria neste local? <span>(opcional)</span></label>
          <textarea id="report-note" bind:value={reportNote} maxlength="240" rows="3" placeholder="Conte brevemente o que a comunidade precisa"></textarea>

          <button class="button button-secondary location-button" type="button" onclick={useMyLocation}>Usar minha localização</button>
          <p class="field-hint">Ou marque o ponto diretamente no mapa acima.</p>
          <button class="button button-primary button-full" type="submit" disabled={savingReport}>
            {savingReport ? 'Enviando…' : 'Registrar demanda'}
          </button>
          <p class="form-status" role="status" aria-live="polite">{reportStatus}</p>
        </form>
      </section>

      <section id="adoption-form-panel" class="panel form-panel" aria-labelledby="adoption-title">
        <div class="section-heading">
          <div><p class="eyebrow">3 · Mobilização</p><h2 id="adoption-title">Proponha uma ação de cuidado</h2></div>
          <span class="step-pill">Organização</span>
        </div>
        <p class="section-intro">ONGs, coletivos e instituições podem registrar uma proposta. Ela aparece como recebida até ser validada.</p>
        <form id="adoption-form" onsubmit={submitAdoption}>
          <label for="adoption-kind">Tipo de local</label>
          <select id="adoption-kind" bind:value={adoptionKind}>
            <option value="refresco">Ponto de apoio / água</option>
            <option value="onibus">Ponto de ônibus</option>
            <option value="area_verde">Área verde</option>
          </select>

          <label for="adoption-name">Nome do local</label>
          <input id="adoption-name" bind:value={adoptionName} maxlength="80" placeholder="Ex.: praça ou ponto de ônibus" required />

          <label for="organization">Organização proponente</label>
          <input id="organization" bind:value={organization} maxlength="100" placeholder="Associação, ONG ou instituição" required />

          <label for="adoption-reference">Referência pública</label>
          <input id="adoption-reference" bind:value={adoptionReference} maxlength="80" placeholder="Rua ou equipamento próximo" required />

          <label for="commitment">Ação proposta</label>
          <textarea id="commitment" bind:value={commitment} maxlength="300" rows="3" placeholder="O que a organização propõe fazer?" required></textarea>

          <label for="hours">Dias e horários <span>(opcional)</span></label>
          <input id="hours" bind:value={hours} maxlength="100" placeholder="Ex.: dias úteis, 8h às 17h" />

          <button class="button button-secondary location-button" type="button" onclick={chooseAdoptionLocation}>Marcar ponto no mapa</button>
          {#if adoptionCoordinates}<p class="field-hint">Local marcado no mapa.</p>{/if}
          <button class="button button-primary button-full" type="submit" disabled={savingAdoption}>
            {savingAdoption ? 'Enviando…' : 'Enviar proposta'}
          </button>
          <p class="form-status" role="status" aria-live="polite">{adoptionStatus}</p>
        </form>
      </section>
    </div>

    <section class="panel community-section" aria-labelledby="community-title">
      <div class="section-heading">
        <div><p class="eyebrow">4 · Acompanhe</p><h2 id="community-title">Locais para cuidar</h2></div>
        <span class="count-pill">{summary.total_reports} relato(s)</span>
      </div>
      {#if loadingData && summary.locations.length === 0}
        <p class="empty-state">Carregando os relatos…</p>
      {:else if summary.locations.length === 0}
        <p class="empty-state">Ainda não há relatos. Você pode registrar a primeira demanda.</p>
      {:else}
        <div class="community-list">
          {#each summary.locations as item}
            <article class="community-item">
              <div class="community-item-heading">
                <h3>{item.location}</h3>
                <span class="priority-badge">Sinal demonstrativo {item.priority}/100</span>
              </div>
              <p>{item.count} relato(s) · situação principal: {item.main_issue}</p>
              <p class="next-step"><strong>Possível próximo passo:</strong> {item.suggestion}</p>
            </article>
          {/each}
        </div>
      {/if}
    </section>

    <section class="panel community-section" aria-labelledby="adoption-list-title">
      <div class="section-heading">
        <div><p class="eyebrow">Mobilização em andamento</p><h2 id="adoption-list-title">Propostas comunitárias</h2></div>
        <span class="count-pill">{adoptions.length} proposta(s)</span>
      </div>
      {#if adoptions.length === 0}
        <p class="empty-state">Ainda não há propostas registradas.</p>
      {:else}
        <div class="community-list">
          {#each adoptions as item}
            <article class="community-item">
              <div class="community-item-heading"><h3>{item.name}</h3><span class="status-badge">{item.status}</span></div>
              <p>{item.reference} · {item.organization}</p>
              <p>{item.commitment}{item.hours ? ` · ${item.hours}` : ''}</p>
            </article>
          {/each}
        </div>
      {/if}
    </section>

    <details class="panel prototype-tools">
      <summary>Outras ferramentas de demonstração</summary>
      <div class="tools-grid">
        <section aria-labelledby="assistant-title">
          <h2 id="assistant-title">Assistente por voz e texto</h2>
          <p class="section-intro">Classifica palavras relacionadas a calor, água, sombra e reciclagem. Não é um modelo de IA nem consulta dados ao vivo.</p>
          <div class="inline-controls">
            <input aria-label="Pergunta ao assistente" bind:value={voiceText} maxlength="500" placeholder="Ex.: Estou com calor e preciso de sombra" />
            <button class="button button-secondary" type="button" onclick={startVoiceInput}>Falar</button>
            <button class="button button-primary" type="button" onclick={() => askAssistant()} disabled={askingVoice}>{askingVoice ? 'Consultando…' : 'Consultar'}</button>
          </div>
          {#if voiceError}<p class="form-status" role="status">{voiceError}</p>{/if}
          {#if voiceResult}
            <div class="result-box" aria-live="polite"><strong>{voiceResult.resposta_voz}</strong><p>{voiceResult.recomendacao}</p></div>
          {/if}
        </section>

        <section aria-labelledby="route-title">
          <h2 id="route-title">Rota de sombra</h2>
          <p class="section-intro">O protótipo ainda não calcula trajetos nem mede cobertura de sombra.</p>
          <div class="stacked-controls">
            <label for="route-origin">Origem</label><input id="route-origin" bind:value={routeOrigin} maxlength="120" />
            <label for="route-destination">Destino</label><input id="route-destination" bind:value={routeDestination} maxlength="120" />
            <button class="button button-secondary" type="button" onclick={checkShadeRoute} disabled={checkingRoute}>{checkingRoute ? 'Consultando…' : 'Ver disponibilidade'}</button>
          </div>
          {#if routeNotice}<p class="result-box" role="status">{routeNotice}</p>{/if}
        </section>

        <section aria-labelledby="recycle-title">
          <h2 id="recycle-title">Pontuação de reciclagem</h2>
          <p class="section-intro">Simulação ilustrativa; não há coleta ou resgate de recompensa nesta versão.</p>
          <div class="inline-controls">
            <label class="visually-hidden" for="trade-item">Material</label>
            <select id="trade-item" bind:value={tradeItem}>
              <option value="garrafa_pet">Garrafa PET</option><option value="latinha">Latinha</option><option value="vidro">Vidro</option>
            </select>
            <label class="visually-hidden" for="trade-quantity">Quantidade</label>
            <input id="trade-quantity" type="number" min="1" max="50" bind:value={tradeQuantity} />
            <button class="button button-secondary" type="button" onclick={simulateTrade} disabled={simulatingTrade}>{simulatingTrade ? 'Calculando…' : 'Simular pontos'}</button>
          </div>
          {#if tradeMessage}<p class="form-status" role="status">{tradeMessage}</p>{/if}
        </section>
      </div>
    </details>

    <div class="notice">
      <strong>Sobre esta demonstração:</strong> relatos e pontos de referência precisam de validação comunitária. O Sombrinha não autoriza intervenções, não confirma serviços ou recompensas e não classifica risco oficial. As condições meteorológicas são para uma coordenada de referência, não por bairro.
    </div>
  </main>

  <dialog class="citizen-dialog" bind:this={citizenDialog} aria-labelledby="citizen-title">
    <div class="section-heading"><h2 id="citizen-title">Cartão comunitário ilustrativo</h2><button class="icon-button" type="button" aria-label="Fechar" onclick={() => citizenDialog?.close()}>×</button></div>
    <p>Este exemplo visual não representa uma pessoa real, cartão emitido ou saldo de benefício.</p>
    <div class="citizen-card-graphic"><span>SOMBRINHA · RECIFE</span><strong>Identificação comunitária<br />DEMONSTRAÇÃO</strong><span>Sem dados pessoais ou resgate de benefícios.</span></div>
    <button class="button button-primary button-full" type="button" onclick={() => citizenDialog?.close()}>Fechar</button>
  </dialog>

  <footer class="page-width site-footer">Sombrinha · Cuidado climático e mobilização comunitária</footer>
</div>
