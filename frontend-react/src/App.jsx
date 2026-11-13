import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProactiveNotification from './components/ProactiveNotification';
import MapSection from './components/MapSection';
import VoiceAssistant from './components/VoiceAssistant';
import RecycleSection from './components/RecycleSection';
import HeatStudyModal from './components/HeatStudyModal';
import CitizenCardModal from './components/CitizenCardModal';
import { api } from './services/api';
import { Sun, CloudSun, Droplet, Thermometer, AlertTriangle, Wind } from 'lucide-react';

export default function App() {
  const [solForte, setSolForte] = useState(false);
  const [isHeatStudyOpen, setIsHeatStudyOpen] = useState(false);
  const [isCitizenCardOpen, setIsCitizenCardOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
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

      <main className="container">
        {/* Notificação Proativa & Geofencing ao entrar ou se mover em direção ao Centro */}
        <ProactiveNotification onLocationDetected={(loc) => setUserLocation(loc)} />

        {/* Resumo do Clima em Tempo Real */}
        <section className="card-section" aria-labelledby="weather-heading">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h2 id="weather-heading" className="card-title" style={{ margin: 0 }}>
              <CloudSun size={24} color="var(--primary)" />
              Monitor Climático Recife em Tempo Real
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {weather?.source ? `Fonte: ${weather.source}` : 'Atualização ao vivo'}
            </span>
          </div>

          {loadingWeather ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Consultando sensores meteorológicos do Recife...
            </div>
          ) : weather ? (
            <div style={{ marginTop: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <Thermometer size={22} color="var(--danger)" style={{ margin: '0 auto' }} />
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Temperatura</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                    {weather.temperature_c ?? weather.temperatura ?? 31}°C
                  </div>
                </div>

                <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <Sun size={22} color="var(--accent)" style={{ margin: '0 auto' }} />
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Sensação Térmica</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--danger)' }}>
                    {weather.feels_like_c ?? weather.sensacao_termica ?? 36}°C
                  </div>
                </div>

                <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <Droplet size={22} color="var(--blue)" style={{ margin: '0 auto' }} />
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Umidade Relativa</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                    {weather.relative_humidity_percent ?? weather.umidade ?? 72}%
                  </div>
                </div>

                <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <AlertTriangle size={22} color="#ea580c" style={{ margin: '0 auto' }} />
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Índice UV</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                    {weather.uv_index ?? weather.indice_uv ?? '8+'}
                  </div>
                </div>
              </div>

              {(weather.condition || weather.recomendacoes) && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '10px 14px',
                    background: 'var(--primary-light)',
                    color: 'var(--primary-dark)',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 600
                  }}
                >
                  💡 <strong>Condição & Recomendação:</strong> {weather.condition || weather.recomendacoes} — Beba bastante água e busque pontos de sombra.
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '10px', color: 'var(--text-muted)' }}>
              Informações do tempo indisponíveis no momento.
            </div>
          )}
        </section>

        {/* Mapa Interativo de Calor & Pontos de Frescor */}
        <MapSection userLocation={userLocation} />

        {/* Assistente de Voz para Acessibilidade dos Pedestres e Ambulantes */}
        <VoiceAssistant userLocation={userLocation} />

        {/* Módulo de Economia Circular (Moeda Verde / Ecopontos) */}
        <RecycleSection />

        {/* Rodapé do Projeto */}
        <footer style={{ marginTop: '30px', padding: '20px 0', textAlign: 'center', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <p>
            <strong>Sombrinha ☂️</strong> — Tecnologia Cívica para Resiliência Climática Urbana no Recife.
          </p>
          <p style={{ marginTop: '4px', fontSize: '0.78rem' }}>
            Hackathon Antena na Lama | APONTI Academy & Movimento Pró-Criança | Desenvolvido por Madu Barretto & Equipe Sombrinha
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
