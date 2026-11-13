import React, { useState, useEffect } from 'react';
import { X, Flame, Droplet, ShieldAlert, MapPin } from 'lucide-react';
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

  const corredores = studyData?.corredores_criticos_calor || [];
  const estacoes = studyData?.pontos_recomendados_alivio || [];

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Diagnóstico de Ilhas de Calor">
      <div className="modal-dialog">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink-principal)' }}>
            <Flame size={20} color="var(--alerta-calor)" />
            <span>Diagnóstico de Ilhas de Calor · Centro do Recife</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', color: 'var(--ink-secundario)', padding: '4px', minHeight: 'auto' }}
            aria-label="Fechar diagnóstico"
          >
            <X size={22} />
          </button>
        </div>

        <p style={{ marginTop: '8px', fontSize: '0.88rem', color: 'var(--ink-secundario)', lineHeight: 1.5 }}>
          {studyData?.resumo_estrategico || 'Carregando dados territoriais do Centro do Recife...'}
        </p>

        {/* 1. As 5 Ruas Mais Quentes */}
        <div style={{ marginTop: '18px' }}>
          <h4 style={{ fontSize: '0.98rem', fontWeight: 750, color: 'var(--alerta-calor)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={16} />
            <span>Corredores Térmicos Críticos (Asfalto Sem Árvores)</span>
          </h4>

          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {corredores.map((corredor) => (
              <div key={corredor.id} className="corridor-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--ink-principal)' }}>{corredor.nome}</strong>
                  <span style={{ fontSize: '0.74rem', fontWeight: 750, color: '#991b1b', background: '#fee2e2', padding: '2px 8px', borderRadius: '4px' }}>
                    {corredor.temperatura_superficie_estimada}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--ink-secundario)', marginTop: '4px' }}>
                  {corredor.bairro} · {corredor.motivo}
                </p>
                <div style={{ fontSize: '0.8rem', marginTop: '4px', fontWeight: 600, color: 'var(--mangue)' }}>
                  Intervenção prioritária: {corredor.solucao_recomendada}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Pontos Recomendados para Água Gratuita e Refrigeração */}
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ fontSize: '0.98rem', fontWeight: 750, color: 'var(--capibaribe)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Droplet size={16} />
            <span>Bebedouros e Pontos Prioritários para Alívio</span>
          </h4>

          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {estacoes.map((estacao) => (
              <div
                key={estacao.id}
                style={{
                  border: '1px solid var(--linha-divisoria)',
                  background: 'var(--bg-terreno)',
                  borderRadius: '8px',
                  padding: '12px',
                  borderLeft: '3px solid var(--capibaribe)'
                }}
              >
                <strong style={{ fontSize: '0.92rem', color: 'var(--ink-principal)' }}>{estacao.nome}</strong>
                <p style={{ fontSize: '0.82rem', margin: '4px 0', color: 'var(--ink-secundario)' }}>
                  Capacidade: {estacao.capacidade}
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--ink-suave)' }}>
                  Público atendido: {estacao.publico_alvo} ({estacao.bairro})
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
                      background: 'var(--capibaribe)',
                      color: 'white',
                      fontSize: '0.78rem',
                      padding: '4px 10px',
                      minHeight: '28px'
                    }}
                  >
                    Ver Ponto no Mapa
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
