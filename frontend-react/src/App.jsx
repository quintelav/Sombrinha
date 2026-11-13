import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProactiveNotification from './components/ProactiveNotification';
import MapSection from './components/MapSection';
import VoiceAssistant from './components/VoiceAssistant';
import RecycleSection from './components/RecycleSection';
import HeatStudyModal from './components/HeatStudyModal';
import CitizenCardModal from './components/CitizenCardModal';
import { api } from './services/api';
import { Sun, CloudSun, Droplet, Thermometer, AlertTriangle } from 'lucide-react';

export default function App() {
  const [solForte, setSolForte] = useState(false);
  const [isHeatStudyOpen, setIsHeatStudyOpen] = useState(false);
  const [isCitizenCardOpen, setIsCitizenCardOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [focusedPoint, setFocusedPoint] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  // Alterna o modo de alto contraste para o sol forte do meio-dia no Recife
  const toggleSolForte = () => {
    setSolForte((prev) => {
      const next = !prev;
      if (next) {
        document.body.classList.add('sol-forte');
      } else {
        document.body.classList.remove('sol-forte');
      }
      return next;
    });
  };

  // Carrega clima atualizado de Recife (Google Weather ou Open-Meteo live fallback)
  useEffect(() => {
    async function loadWeather() {
      try {
        setLoadingWeather(true);
        const data = await api.getWeather();
        setWeather(data);
      } catch (err) {
        console.error('Falha ao obter clima:', err);
      } finally {
        setLoadingWeather(false);
      }
    }
    loadWeather();
  }, []);

  return (
    <div className="sombrinha-app">
      <Header
        solForte={solForte}
        toggleSolForte={toggleSolForte}
        onOpenHeatStudy={() => setIsHeatStudyOpen(true)}
        onOpenCitizenCard={() => setIsCitizenCardOpen(true)}
      />

      <main className="container-adaptativo">
        {/* Layout Adaptativo: Grid 2 colunas perfeitamente proporcional no PC, fluxo vertical fluido no celular */}
        <div className="layout-adaptativo">
          {/* 1. Radar Proativo & Geofencing */}
          <div className="grid-radar">
            <ProactiveNotification
              weather={weather}
              onLocationDetected={(loc) => setUserLocation(loc)}
              onSelectPoint={(ponto) => setFocusedPoint(ponto)}
            />
          </div>

          {/* 2. Resumo do Clima em Tempo Real */}
          <section className="painel-secao grid-clima" aria-labelledby="weather-heading">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <h2 id="weather-heading" className="painel-titulo" style={{ margin: 0 }}>
                <CloudSun size={24} color="var(--rio-azul)" />
                Monitor Climático Recife em Tempo Real
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--ink-secundario)' }}>
                {weather?.source ? `Fonte: ${weather.source}` : 'Atualização ao vivo'}
              </span>
            </div>

            {loadingWeather ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--ink-secundario)' }}>
                Consultando sensores meteorológicos do Recife...
              </div>
            ) : weather ? (
              <div style={{ marginTop: '14px' }}>
                <div className="grid-sensores">
                  <div className="sensor-box">
                    <Thermometer size={22} color="var(--calor-asfalto)" style={{ margin: '0 auto' }} />
                    <div className="sensor-label">Temperatura</div>
                    <div className="sensor-valor">
                      {weather.temperature_c ?? weather.temperatura ?? 30.5}°C
                    </div>
                  </div>

                  <div className="sensor-box">
                    <Sun size={22} color="var(--sol-alerta)" style={{ margin: '0 auto' }} />
                    <div className="sensor-label">Sensação Térmica</div>
                    <div className="sensor-valor" style={{ color: 'var(--calor-asfalto)' }}>
                      {weather.feels_like_c ?? weather.sensacao_termica ?? 35.8}°C
                    </div>
                  </div>

                  <div className="sensor-box">
                    <Droplet size={22} color="var(--rio-azul)" style={{ margin: '0 auto' }} />
                    <div className="sensor-label">Umidade Relativa</div>
                    <div className="sensor-valor">
                      {weather.relative_humidity_percent ?? weather.umidade ?? 74}%
                    </div>
                  </div>

                  <div className="sensor-box">
                    <AlertTriangle size={22} color="#ea580c" style={{ margin: '0 auto' }} />
                    <div className="sensor-label">Índice UV</div>
                    <div className="sensor-valor">
                      {weather.uv_index ?? weather.indice_uv ?? '10'}
                    </div>
                  </div>
                </div>

                {(weather.condition || weather.recomendacoes) && (
                  <div
                    style={{
                      marginTop: '14px',
                      padding: '12px 16px',
                      background: 'var(--mangue-light)',
                      color: 'var(--mangue-dark)',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      fontWeight: 650
                    }}
                  >
                    💡 <strong>Recomendação de Saúde:</strong> {weather.condition || weather.recomendacoes} — Beba bastante água e busque pontos de sombra.
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '10px', color: 'var(--ink-secundario)' }}>
                Informações do tempo indisponíveis no momento.
              </div>
            )}
          </section>

          {/* 3. Mapa Territorial Interativo de Sombras e Parques */}
          <div className="grid-mapa">
            <MapSection userLocation={userLocation} focusedPoint={focusedPoint} />
          </div>

          {/* 4. Assistente de Voz para Acessibilidade dos Pedestres e Ambulantes */}
          <div className="grid-voz">
            <VoiceAssistant userLocation={userLocation} />
          </div>

          {/* 5. Módulo de Economia Circular (Moeda Verde / Ecopontos) */}
          <div className="grid-reciclagem">
            <RecycleSection />
          </div>
        </div>

        {/* Rodapé do Projeto */}
        <footer style={{ marginTop: '30px', padding: '20px 0', textAlign: 'center', borderTop: '1px solid var(--linha-divisoria)', color: 'var(--ink-secundario)', fontSize: '0.85rem' }}>
          <p>
            <strong>Sombrinha Recife ☂️</strong> — Tecnologia Cívica para Resiliência Climática Urbana.
          </p>
          <p style={{ marginTop: '4px', fontSize: '0.78rem' }}>
            Hackathon Antena na Lama | APONTI Academy & Movimento Pró-Criança | Equipe Sombrinha
          </p>
        </footer>
      </main>

      {/* Modais */}
      <HeatStudyModal
        isOpen={isHeatStudyOpen}
        onClose={() => setIsHeatStudyOpen(false)}
      />

      <CitizenCardModal
        isOpen={isCitizenCardOpen}
        onClose={() => setIsCitizenCardOpen(false)}
      />
    </div>
  );
}
