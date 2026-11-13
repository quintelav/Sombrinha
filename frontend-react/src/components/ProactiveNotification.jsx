import React, { useState, useEffect } from 'react';
import { Droplets, TreePine, ChevronRight, X, Compass } from 'lucide-react';
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
    <section className="alerta-resiliencia" aria-label="Pontos de Alívio Térmico Próximos">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div>
          <span className="alerta-badge-origem">
            <Compass size={13} style={{ display: 'inline-block' }} />
            {proximityData.esta_no_centro ? 'Apoio Térmico · Centro do Recife' : 'Apoio em Rota · Região Metropolitana'}
          </span>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 750, color: 'var(--ink-principal)', marginTop: '4px' }}>
            {notificacao?.titulo || 'Pontos públicos de alívio e descanso'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-secundario)', marginTop: '4px', lineHeight: 1.45 }}>
            {notificacao?.mensagem || 'Encontre bebedouros de água gratuita e parques arborizados no seu caminho.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          style={{ background: 'transparent', padding: '6px', minHeight: 'auto', color: 'var(--ink-suave)' }}
          aria-label="Dispensar aviso"
          title="Dispensar aviso"
        >
          <X size={18} />
        </button>
      </div>

      {/* Cartões Duplos de Alívio: Água e Sombra Natural */}
      <div className="cartoes-duplos-alivio">
        {maisProximo && (
          <div className="cartao-alivio-item">
            <div className="cartao-alivio-topo">
              <div className="cartao-alivio-icone" style={{ background: 'var(--capibaribe-light)', color: 'var(--capibaribe)' }}>
                <Droplets size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--capibaribe)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Bebedouro Público
                </div>
                <strong style={{ fontSize: '0.96rem', color: 'var(--ink-principal)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {maisProximo.nome}
                </strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--ink-secundario)' }}>
                  {maisProximo.bairro} · {maisProximo.capacidade || 'Água potável'}
                </div>
              </div>
            </div>

            <div className="cartao-alivio-lado-direito">
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--capibaribe)' }}>
                  {maisProximo.distancia_metros}m
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--ink-suave)' }}>
                  ~{tempoAgua} min a pé
                </div>
              </div>
              {onSelectPoint && (
                <button
                  type="button"
                  className="btn-alivio-acao"
                  onClick={() => onSelectPoint(maisProximo)}
                >
                  <span>No mapa</span>
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {sombraMaisProxima && (
          <div className="cartao-alivio-item">
            <div className="cartao-alivio-topo">
              <div className="cartao-alivio-icone" style={{ background: 'var(--mangue-light)', color: 'var(--mangue)' }}>
                <TreePine size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--mangue)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Parque & Área Verde
                </div>
                <strong style={{ fontSize: '0.96rem', color: 'var(--ink-principal)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {sombraMaisProxima.nome}
                </strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--ink-secundario)' }}>
                  {sombraMaisProxima.bairro} {sombraMaisProxima.cidade ? `· ${sombraMaisProxima.cidade}` : ''}
                </div>
              </div>
            </div>

            <div className="cartao-alivio-lado-direito">
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--mangue)' }}>
                  {sombraMaisProxima.distancia_metros}m
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--ink-suave)' }}>
                  ~{tempoSombra} min a pé
                </div>
              </div>
              {onSelectPoint && (
                <button
                  type="button"
                  className="btn-alivio-acao"
                  onClick={() => onSelectPoint(sombraMaisProxima)}
                >
                  <span>Ver sombra</span>
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
