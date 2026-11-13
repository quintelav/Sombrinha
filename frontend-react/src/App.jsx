import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProactiveNotification from './components/ProactiveNotification';
import MapSection from './components/MapSection';
import VoiceAssistant from './components/VoiceAssistant';
import RecycleSection from './components/RecycleSection';
import HeatStudyModal from './components/HeatStudyModal';
import CitizenCardModal from './components/CitizenCardModal';
import { api } from './services/api';
import { CloudSun, Droplet, Thermometer, Sun, Wind, AlertCircle } from 'lucide-react';

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

  const tempAtual = weather?.temperature_c ?? weather?.temperatura ?? 30.5;
  const sensacao = weather?.feels_like_c ?? weather?.sensacao_termica ?? 35.8;
  const umidade = weather?.relative_humidity_percent ?? weather?.umidade ?? 74;
  const uv = weather?.uv_index ?? weather?.indice_uv ?? '10';

  return (
    <div className="sombrinha-app">
      <Header
        solForte={solForte}
        toggleSolForte={toggleSolForte}
        onOpenHeatStudy={() => setIsHeatStudyOpen(true)}
        onOpenCitizenCard={() => setIsCitizenCardOpen(true)}
      />

      <main className="container-adaptativo">
        {/* Layout Adaptativo: 2 colunas equilibradas no PC, coluna única no celular */}
        <div className="layout-adaptativo">
          {/* 1. Alívio Térmico & Pontos Mais Próximos */}
          <div className="grid-radar">
            <ProactiveNotification
              weather={weather}
              onLocationDetected={(loc) => setUserLocation(loc)}
              onSelectPoint={(ponto) => setFocusedPoint(ponto)}
            />
          </div>

          {/* 2. Clima no Recife Hoje (Estilo Editorial e Humano) */}
          <section className="clima-editorial-box grid-clima" aria-labelledby="weather-heading">
            <div className="painel-header">
              <div>
                <h2 id="weather-heading" className="painel-titulo">
                  <CloudSun size={20} color="var(--capibaribe)" />
                  <span>Clima no Recife hoje</span>
                </h2>
                <p className="painel-subtitulo">
                  Condições térmicas e radiação solar na Região Metropolitana
                </p>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--ink-suave)', fontWeight: 600 }}>
                {weather?.source ? `Dados: ${weather.source}` : 'Tempo real'}
              </span>
            </div>

            {loadingWeather ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ink-secundario)' }}>
                Consultando dados meteorológicos do Recife...
              </div>
            ) : (
              <div>
                <div className="clima-destaque-row">
                  <div>
                    <div className="clima-temp-principal">
                      {Math.round(tempAtual)}°C
                    </div>
                    <div style={{ fontSize: '0.92rem', color: 'var(--ink-secundario)', marginTop: '2px' }}>
                      Sensação térmica de <strong>{Math.round(sensacao)}°C</strong> no asfalto
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--terracota)' }}>
                      Calor Equatorial Intenso
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--ink-suave)' }}>
                      Recomenda-se hidratação constante
                    </div>
                  </div>
                </div>

                <div className="clima-detalhes-grid">
                  <div className="clima-metrica-bloco">
                    <div className="clima-metrica-label">Sensação</div>
                    <div className="clima-metrica-valor" style={{ color: 'var(--terracota)' }}>
                      {sensacao}°C
                    </div>
                  </div>

                  <div className="clima-metrica-bloco">
                    <div className="clima-metrica-label">Umidade</div>
                    <div className="clima-metrica-valor">
                      {umidade}%
                    </div>
                  </div>

                  <div className="clima-metrica-bloco">
                    <div className="clima-metrica-label">Índice UV</div>
                    <div className="clima-metrica-valor" style={{ color: Number(uv) >= 8 ? 'var(--alerta-calor)' : 'var(--terracota)' }}>
                      {uv} {Number(uv) >= 8 ? '(Muito Alto)' : ''}
                    </div>
                  </div>
                </div>

                <div className="aviso-saude-card">
                  <strong>Recomendação de Saúde Comunitária:</strong> Radiação solar em níveis críticos entre 10h e 15h. Evite caminhar longos trechos exposto ao sol direto nos corredores de asfalto e aproveite os refúgios arborizados indicados no mapa.
                </div>
              </div>
            )}
          </section>

          {/* 3. Mapa Territorial de Sombras e Parques */}
          <div className="grid-mapa">
            <MapSection userLocation={userLocation} focusedPoint={focusedPoint} />
          </div>

          {/* 4. Orientação Acessível por Voz e Busca Rápida */}
          <div className="grid-voz">
            <VoiceAssistant userLocation={userLocation} />
          </div>

          {/* 5. Coleta Seletiva & Ecopontos Comunitários */}
          <div className="grid-reciclagem">
            <RecycleSection />
          </div>
        </div>

        {/* Rodapé Cívico e Institucional */}
        <footer style={{ marginTop: '36px', padding: '24px 0', textAlign: 'center', borderTop: '1px solid var(--linha-divisoria)', color: 'var(--ink-secundario)', fontSize: '0.84rem' }}>
          <p style={{ fontWeight: 600, color: 'var(--ink-principal)' }}>
            Sombrinha Recife · Tecnologia comunitária para resiliência climática urbana
          </p>
          <p style={{ marginTop: '4px', fontSize: '0.78rem', color: 'var(--ink-suave)' }}>
            Hackathon Antena na Lama · APONTI Academy & Movimento Pró-Criança · Equipe Sombrinha
          </p>
        </footer>
      </main>

      {/* Modais de Diagnóstico e Apoio */}
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
