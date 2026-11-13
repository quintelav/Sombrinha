import React, { useState, useEffect } from 'react';
import { X, Flame, Droplet, MapPin, CheckCircle, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

export default function HeatStudyModal({ isOpen, onClose, studyData: propStudyData, onFocusLocation }) {
  const [studyData, setStudyData] = useState(propStudyData || null);

  useEffect(() => {
    if (propStudyData) {
      setStudyData(propStudyData);
    } else if (isOpen && !studyData) {
      api.getHeatIslandsStudy().then((data) => {
        if (data) setStudyData(data);
      }).catch((err) => console.error('Erro ao carregar estudo:', err));
    }
  }, [isOpen, propStudyData]);

  if (!isOpen) return null;

  const corredores = studyData.corredores_criticos_calor || [];
  const estacoes = studyData.pontos_recomendados_alivio || [];

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Estudo Estratégico de Ilhas de Calor">
      <div className="modal-dialog">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={22} color="#dc2626" />
            <span>Ruas Mais Quentes do Centro do Recife</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', color: 'var(--text-main)', padding: '4px' }}
            aria-label="Fechar modal"
          >
            <X size={24} />
          </button>
        </div>

        <p style={{ marginTop: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {studyData.resumo_estrategico}
        </p>

        {/* 1. As 5 Ruas Mais Quentes */}
        <div style={{ marginTop: '16px' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={18} />
            <span>Corredores Térmicos Críticos (Ilhas de Calor)</span>
          </h4>

          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {corredores.map((corredor) => (
              <div key={corredor.id} className="corridor-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <strong style={{ fontSize: '0.98rem' }}>{corredor.nome}</strong>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '2px 8px', borderRadius: '4px' }}>
                    {corredor.temperatura_superficie_estimada}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  📍 {corredor.bairro} • {corredor.motivo}
                </p>
                <div style={{ fontSize: '0.82rem', marginTop: '4px', fontWeight: 600, color: 'var(--primary-dark)' }}>
                  💡 <em>Solução: {corredor.solucao_recomendada}</em>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Pontos Recomendados para Água Gratuita e Refrigeração */}
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Droplet size={18} />
            <span>Locais Estratégicos para Água Gratuita & Refrigeração</span>
          </h4>

          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {estacoes.map((estacao) => (
              <div
                key={estacao.id}
                style={{
                  border: '1px solid #bae6fd',
                  background: '#f0f9ff',
                  borderRadius: '8px',
                  padding: '12px',
                  borderLeft: '4px solid #0284c7'
                }}
              >
                <strong style={{ fontSize: '0.95rem', color: '#0369a1' }}>{estacao.nome}</strong>
                <p style={{ fontSize: '0.84rem', margin: '4px 0', color: 'var(--text-main)' }}>
                  💧 <strong>Capacidade:</strong> {estacao.capacidade}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  👥 Atendimento: {estacao.publico_alvo} ({estacao.bairro})
                </p>
                {onFocusLocation && (
                  <button
                    type="button"
                    onClick={() => {
                      onFocusLocation(estacao);
                      onClose();
                    }}
                    style={{
                      marginTop: '6px',
                      background: '#0284c7',
                      color: 'white',
                      fontSize: '0.8rem',
                      padding: '4px 10px',
                      minHeight: '32px'
                    }}
                  >
                    Ver Ponto no Mapa
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{ width: '100%', marginTop: '20px', background: 'var(--primary)', color: 'white' }}
        >
          Fechar Estudo
        </button>
      </div>
    </div>
  );
}
