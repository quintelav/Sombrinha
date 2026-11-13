import React, { useState, useEffect } from 'react';
import { AlertCircle, Droplets, MapPin, Navigation, Compass, ChevronRight, X } from 'lucide-react';
import { api } from '../services/api';

export default function ProactiveNotification({ weather, onSelectPoint, onLocationDetected }) {
  const [coords, setCoords] = useState(null);
  const [proximityData, setProximityData] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function evaluateLocation(lat, lon) {
      setCoords({ latitude: lat, longitude: lon });
      if (onLocationDetected) {
        onLocationDetected({ latitude: lat, longitude: lon });
      }

      const data = await api.checkProximity(lat, lon);
      if (data) {
        setProximityData(data);

        // Notificação nativa se o usuário permitiu no celular
        if ('Notification' in window && Notification.permission === 'granted' && data.notificacao_proativa) {
          try {
            new Notification(data.notificacao_proativa.titulo, {
              body: data.notificacao_proativa.mensagem,
              icon: 'https://cdn-icons-png.flaticon.com/512/869/869869.png'
            });
          } catch {
            // Silencia caso o navegador móvel bloqueie notificações sem interação
          }
        }
      }
      setLoading(false);
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          evaluateLocation(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn('Geolocalização não autorizada, aplicando ponto central de Recife:', err.message);
          // Simula localização no corredor da Conde da Boa Vista para demonstração
          evaluateLocation(-8.0601, -34.8876);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      evaluateLocation(-8.0601, -34.8876);
    }
  }, []);

  if (dismissed || !proximityData) return null;

  const maisProximo = proximityData.ponto_mais_proximo || proximityData.pontos_frescor_proximos?.[0];
  const sombraMaisProxima = proximityData.sombra_mais_proxima;
  const notificacao = proximityData.notificacao_proativa;

  const tempoAgua = maisProximo?.tempo_pe_min || maisProximo?.tempo_a_pe_min || 1;
  const tempoSombra = sombraMaisProxima?.tempo_pe_min || sombraMaisProxima?.tempo_a_pe_min || 1;

  return (
    <section className="hero-radar" aria-label="Radar Proativo de Calor e Hidratação">
      <div className="radar-header">
        <div>
          <span className="radar-alerta-tag">
            <AlertCircle size={15} />
            {proximityData.esta_no_centro ? 'ZONA TÉRMICA CRÍTICA' : 'MONITORAMENTO EM ROTA'}
          </span>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 850, marginTop: '8px', lineHeight: 1.25 }}>
            {notificacao?.titulo || 'Radar de Calor & Parques de Sombra'}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          style={{ background: 'transparent', padding: '6px', minHeight: 'auto', color: 'var(--ink-secundario)' }}
          aria-label="Dispensar aviso"
        >
          <X size={20} />
        </button>
      </div>

      <p style={{ fontSize: '0.92rem', color: 'var(--ink-principal)', lineHeight: 1.45 }}>
        {notificacao?.mensagem}
      </p>

      {/* Cartões de Alívio Rápido: Água e Sombra Natural */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
        {maisProximo && (
          <div className="destaque-agua-proxima">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--rio-azul)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Droplets size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--rio-azul)' }}>
                  ÁGUA POTÁVEL MAIS PRÓXIMA
                </div>
                <strong style={{ fontSize: '1rem' }}>{maisProximo.nome}</strong>
                <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>
                  {maisProximo.bairro} • {maisProximo.capacidade}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--rio-azul)' }}>
                  {maisProximo.distancia_metros}m
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--ink-secundario)' }}>
                  ~{tempoAgua} min a pé
                </div>
              </div>

              {onSelectPoint && (
                <button
                  type="button"
                  onClick={() => onSelectPoint(maisProximo)}
                  style={{
                    background: 'var(--rio-azul)',
                    color: '#ffffff',
                    padding: '8px 14px',
                    minHeight: '40px',
                    fontSize: '0.85rem'
                  }}
                >
                  <span>No mapa</span>
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        {sombraMaisProxima && (
          <div className="destaque-agua-proxima" style={{ background: '#f0fdf4', borderColor: '#86efac' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--mangue)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '20px'
                }}
              >
                ⛱️
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--mangue)' }}>
                  PARQUE & SOMBRA MAIS PRÓXIMO
                </div>
                <strong style={{ fontSize: '1rem', color: '#14532d' }}>{sombraMaisProxima.nome}</strong>
                <div style={{ fontSize: '0.82rem', color: '#166534' }}>
                  {sombraMaisProxima.bairro} {sombraMaisProxima.cidade ? `• ${sombraMaisProxima.cidade}` : ''}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--mangue)' }}>
                  {sombraMaisProxima.distancia_metros}m
                </div>
                <div style={{ fontSize: '0.76rem', color: '#166534' }}>
                  ~{tempoSombra} min a pé
                </div>
              </div>

              {onSelectPoint && (
                <button
                  type="button"
                  onClick={() => onSelectPoint(sombraMaisProxima)}
                  style={{
                    background: 'var(--mangue)',
                    color: '#ffffff',
                    padding: '8px 14px',
                    minHeight: '40px',
                    fontSize: '0.85rem'
                  }}
                >
                  <span>Ver sombra</span>
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
