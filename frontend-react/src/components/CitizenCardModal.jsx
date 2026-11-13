import React, { useState } from 'react';
import { QrCode, X, Printer, Droplet, SunMedium, CreditCard } from 'lucide-react';

export default function CitizenCardModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [cpfOuMatricula, setCpfOuMatricula] = useState('');
  const [nome, setNome] = useState('Cidadão do Recife');
  const [gerado, setGerado] = useState(false);

  const handleGerar = (e) => {
    e.preventDefault();
    if (cpfOuMatricula.trim()) {
      setGerado(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="card-title">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 id="card-title" style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink-principal)' }}>
            <CreditCard size={20} color="var(--capibaribe)" />
            <span>Cartão Cidadão · Acesso a Água e Sombra</span>
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{ background: 'transparent', padding: '6px', minHeight: 'auto', color: 'var(--ink-secundario)' }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--ink-secundario)', marginBottom: '16px', lineHeight: 1.45 }}>
          Inclusão social para pessoas sem smartphone ou pacote de dados: gere um cartão físico para identificação nos bebedouros públicos e pontos de apoio do Centro do Recife.
        </p>

        {!gerado ? (
          <form onSubmit={handleGerar} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '4px', color: 'var(--ink-principal)' }}>
                Nome do Cidadão ou Ambulante
              </label>
              <input
                type="text"
                placeholder="Ex: Maria José da Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--linha-destaque)',
                  fontSize: '0.92rem',
                  background: '#ffffff',
                  color: 'var(--ink-principal)'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '4px', color: 'var(--ink-principal)' }}>
                CPF ou Número de Identificação Social (NIS)
              </label>
              <input
                type="text"
                required
                placeholder="000.000.000-00"
                value={cpfOuMatricula}
                onChange={(e) => setCpfOuMatricula(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--linha-destaque)',
                  fontSize: '0.92rem',
                  background: '#ffffff',
                  color: 'var(--ink-principal)'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                background: 'var(--mangue)',
                color: 'white',
                marginTop: '6px',
                width: '100%'
              }}
            >
              <QrCode size={18} />
              <span>Gerar Cartão de Acesso</span>
            </button>
          </form>
        ) : (
          <div>
            {/* Visual do Cartão Físico */}
            <div
              style={{
                border: '1px solid var(--mangue-dark)',
                borderRadius: '12px',
                padding: '18px',
                background: 'var(--mangue)',
                color: '#ffffff',
                boxShadow: 'var(--sombra-card)',
                marginBottom: '16px',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src="./logo-sombrinha.jpg" alt="" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                  <div>
                    <strong style={{ fontSize: '1rem', letterSpacing: '0.3px' }}>SOMBRINHA RECIFE</strong>
                    <div style={{ fontSize: '0.7rem', color: '#c2dbd1' }}>ACESSO A ÁGUA E ALÍVIO TÉRMICO</div>
                  </div>
                </div>
                <span style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff', fontWeight: 700, fontSize: '0.72rem', padding: '2px 8px', borderRadius: '10px' }}>
                  CADASTRADO
                </span>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div
                  style={{
                    background: '#ffffff',
                    padding: '6px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '88px',
                    minHeight: '88px'
                  }}
                >
                  <svg width="80" height="80" viewBox="0 0 100 100">
                    <rect width="100" height="100" fill="white" />
                    <rect x="5" y="5" width="30" height="30" fill="black" />
                    <rect x="10" y="10" width="20" height="20" fill="white" />
                    <rect x="15" y="15" width="10" height="10" fill="black" />
                    <rect x="65" y="5" width="30" height="30" fill="black" />
                    <rect x="70" y="10" width="20" height="20" fill="white" />
                    <rect x="75" y="15" width="10" height="10" fill="black" />
                    <rect x="5" y="65" width="30" height="30" fill="black" />
                    <rect x="10" y="70" width="20" height="20" fill="white" />
                    <rect x="15" y="75" width="10" height="10" fill="black" />
                    <rect x="45" y="20" width="10" height="10" fill="black" />
                    <rect x="45" y="45" width="15" height="15" fill="black" />
                    <rect x="70" y="50" width="20" height="10" fill="black" />
                    <rect x="50" y="75" width="25" height="10" fill="black" />
                    <rect x="80" y="80" width="10" height="10" fill="black" />
                  </svg>
                </div>

                <div style={{ flex: 1, fontSize: '0.82rem' }}>
                  <div style={{ color: '#c2dbd1', fontSize: '0.72rem' }}>TITULAR</div>
                  <div style={{ fontWeight: 750, fontSize: '0.96rem', marginBottom: '4px' }}>{nome}</div>
                  
                  <div style={{ color: '#c2dbd1', fontSize: '0.72rem' }}>IDENTIFICAÇÃO SOCIAL</div>
                  <div style={{ fontWeight: 600, letterSpacing: '0.5px' }}>{cpfOuMatricula}</div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#e0f2fe' }}>
                      <Droplet size={13} color="#7dd3fc" /> Água Livre
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#fef3c7' }}>
                      <SunMedium size={13} color="#fde047" /> Refúgios Urbanos
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '10px', fontSize: '0.7rem', color: '#d1e3dd', textAlign: 'center', borderTop: '1px dashed rgba(255,255,255,0.2)', paddingTop: '6px' }}>
                Válido em todos os bebedouros públicos e pontos de apoio do Centro do Recife
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={handlePrint}
                style={{
                  flex: 1,
                  background: 'var(--mangue)',
                  color: 'white'
                }}
              >
                <Printer size={17} />
                <span>Imprimir Cartão</span>
              </button>
              <button
                type="button"
                onClick={() => setGerado(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--linha-destaque)',
                  color: 'var(--ink-principal)'
                }}
              >
                Editar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
