import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProactiveNotification from './components/ProactiveNotification';
import MapSection from './components/MapSection';
import ThermalMapSection from './components/ThermalMapSection';
import VoiceAssistant from './components/VoiceAssistant';
import RecycleSection from './components/RecycleSection';
import CommunityRequestsSection from './components/CommunityRequestsSection';
import CompanyAdoptionSection from './components/CompanyAdoptionSection';
import CriticalPointsCommentsSection from './components/CriticalPointsCommentsSection';
import HeatStudyModal from './components/HeatStudyModal';
import CitizenCardModal from './components/CitizenCardModal';
import UserProfileModal from './components/UserProfileModal';
import { api } from './services/api';
import { CloudSun, Droplet, Thermometer, Sun, Wind, AlertCircle } from 'lucide-react';

export default function App() {
  const [solForte, setSolForte] = useState(false);
  const [isHeatStudyOpen, setIsHeatStudyOpen] = useState(false);
  const [isCitizenCardOpen, setIsCitizenCardOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => api.getStoredUser());
  const [userLocation, setUserLocation] = useState(null);
  const [focusedPoint, setFocusedPoint] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
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

  // Carrega dados atualizados do usuário autenticado se houver token ativo
  useEffect(() => {
    async function loadProfile() {
      try {
        const user = await api.getProfile();
        if (user) {
          setCurrentUser(user);
        }
      } catch (err) {
        console.warn('Sessão local não autenticada:', err);
      }
    }
    loadProfile();
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
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <main className="container-adaptativo">
        {/* 1. Grade Superior: Alívio Térmico & Clima à Esquerda; Mapa à Direita */}
        <div className="layout-principal-topo">
          <div className="coluna-alivio-clima">
            <ProactiveNotification
              weather={weather}
              onLocationDetected={(loc) => setUserLocation(loc)}
              onSelectPoint={(ponto) => setFocusedPoint(ponto)}
            />

            <section className="clima-editorial-box" aria-labelledby="weather-heading">
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

            {/* Mapa Térmico com Temperaturas posicionado diretamente abaixo do Clima */}
            <ThermalMapSection region={selectedRegion} />
          </div>

          <div className="coluna-mapa">
            <MapSection
              userLocation={userLocation}
              focusedPoint={focusedPoint}
              onRegionSelect={(reg) => setSelectedRegion(reg)}
            />
          </div>
        </div>

        {/* 2. Barra Acessível de Orientação por Voz e Busca Rápida (Largura Total 100%) */}
        <VoiceAssistant userLocation={userLocation} />

        {/* 3. Par Comunitário 1: Pedidos de Melhorias & Comentários de Ruas Críticas */}
        <div className="grid-duplo-comunitario">
          <CommunityRequestsSection currentUser={currentUser} />
          <CriticalPointsCommentsSection />
        </div>

        {/* 4. Par Comunitário 2: Adoção Cidadã por Empresas & Coleta Seletiva / Ecopontos */}
        <div className="grid-duplo-comunitario">
          <CompanyAdoptionSection />
          <RecycleSection />
        </div>

      </main>

      {/* Rodapé Cívico e Institucional com as Cores de Pernambuco */}
      <footer className="app-footer">
        <div className="container-adaptativo" style={{ textAlign: 'center', padding: '28px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '20px' }}>☀️</span>
            <p style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '0.2px', color: '#ffffff' }}>
              Sombrinha Recife · Tecnologia comunitária para resiliência climática urbana
            </p>
            <span style={{ fontSize: '20px' }}>☂️</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', margin: '10px 0', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(250, 204, 21, 0.2)',
              border: '1.5px solid #facc15',
              color: '#fef08a',
              padding: '5px 16px',
              borderRadius: '20px',
              fontSize: '0.86rem',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}>
              👩‍💻 Desenvolvido por <strong>Maria Barreto</strong> & Equipe Sombrinha
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              padding: '5px 14px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 600
            }}>
              🏆 Hackathon Antena na Lama 2026 · APONTI Academy & Movimento Pró-Criança
            </span>
          </div>

          <p style={{ fontSize: '0.8rem', color: '#bfdbfe', marginTop: '6px' }}>
            Recife, Pernambuco · Inovação Cívica e Monitoramento Termográfico em Software Aberto
          </p>
        </div>
      </footer>

      {/* Modais de Diagnóstico, Perfil Cidadão e Apoio */}
      <HeatStudyModal
        isOpen={isHeatStudyOpen}
        onClose={() => setIsHeatStudyOpen(false)}
      />

      <CitizenCardModal
        isOpen={isCitizenCardOpen}
        onClose={() => setIsCitizenCardOpen(false)}
        currentUser={currentUser}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
        onUpdateUser={(user) => {
          setCurrentUser(user);
        }}
        onLogout={() => {
          setCurrentUser(null);
        }}
      />
    </div>
  );
}
