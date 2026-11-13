import React, { useState } from 'react';
import { QrCode, X, Printer, ShieldCheck, Droplet, SunMedium, CreditCard } from 'lucide-react';

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 id="card-title" style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={22} color="var(--rio-azul)" />
            Cartão Cidadão Sombrinha
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{ background: 'transparent', padding: '6px', minHeight: 'auto' }}
          >
            <X size={22} />
          </button>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--ink-secundario)', marginBottom: '16px' }}>
          Para quem não tem smartphone ou internet: cartão físico impresso com QR Code para coletar água mineral e acessar pontos de frescor credenciados no Centro do Recife.
        </p>

        {!gerado ? (
          <form onSubmit={handleGerar} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Nome do Cidadão / Ambulante
              </label>
              <input
                type="text"
                placeholder="Ex: Maria José da Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  fontSize: '0.95rem',
                  background: 'var(--bg-main)',
                  color: 'var(--text-main)'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                CPF ou Número de Matrícula Social
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
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  fontSize: '0.95rem',
                  background: 'var(--bg-main)',
                  color: 'var(--text-main)'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                background: 'var(--primary)',
                color: 'white',
                marginTop: '8px',
                width: '100%'
              }}
            >
              <QrCode size={18} />
              Gerar Cartão Cidadão
            </button>
          </form>
        ) : (
          <div>
            {/* Visual do Cartão */}
            <div
              style={{
                border: '3px solid var(--primary)',
                borderRadius: '16px',
                padding: '20px',
                background: 'linear-gradient(135deg, #145b4b 0%, #0d3d32 100%)',
                color: '#ffffff',
                boxShadow: 'var(--shadow-md)',
                marginBottom: '16px',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.6rem' }}>☂️</span>
                  <div>
                    <strong style={{ fontSize: '1.1rem', letterSpacing: '0.5px' }}>SOMBRINHA RECIFE</strong>
                    <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>ÁGUA & FRESCOR PÚBLICO</div>
                  </div>
                </div>
                <span style={{ background: '#22c55e', color: '#064e3b', fontWeight: 800, fontSize: '0.75rem', padding: '3px 8px', borderRadius: '12px' }}>
                  ATIVO
                </span>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div
                  style={{
                    background: '#ffffff',
                    padding: '8px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '100px',
                    minHeight: '100px'
                  }}
                >
                  {/* QR Code SVG simulado */}
                  <svg width="90" height="90" viewBox="0 0 100 100">
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

                <div style={{ flex: 1, fontSize: '0.85rem' }}>
                  <div style={{ opacity: 0.8, fontSize: '0.75rem' }}>TITULAR</div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '6px' }}>{nome}</div>
                  
                  <div style={{ opacity: 0.8, fontSize: '0.75rem' }}>IDENTIFICAÇÃO SOCIAL</div>
                  <div style={{ fontWeight: 600, letterSpacing: '1px' }}>{cpfOuMatricula}</div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                      <Droplet size={14} color="#38bdf8" /> Água Livre
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                      <SunMedium size={14} color="#facc15" /> Pontos de Frescor
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '12px', fontSize: '0.7rem', opacity: 0.75, textAlign: 'center', borderTop: '1px dashed rgba(255,255,255,0.2)', paddingTop: '8px' }}>
                Válido em todos os totens e bebedouros públicos do Centro do Recife
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={handlePrint}
                style={{
                  flex: 1,
                  background: 'var(--primary)',
                  color: 'white'
                }}
              >
                <Printer size={18} />
                Imprimir Cartão
              </button>
              <button
                type="button"
                onClick={() => setGerado(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)'
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
