import React, { useState } from 'react';
import { Recycle, Award, Droplet, Sun, CheckCircle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export default function RecycleSection() {
  const [garrafas, setGarrafas] = useState(0);
  const [latas, setLatas] = useState(0);
  const [saldo, setSaldo] = useState(15);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  const pontosCalculados = garrafas * 2 + latas * 3;

  const recompensas = [
    { id: 'agua', nome: 'Água Mineral Gelada 500ml', custo: 5, detalhe: 'Disponível nos ecopontos do Centro' },
    { id: 'protetor', nome: 'Sachê Protetor Solar FPS 50', custo: 10, detalhe: 'Proteção para ambulantes e pedestres' },
    { id: 'muda', nome: 'Muda de Árvore Nativa', custo: 20, detalhe: 'Para arborização comunitária' },
    { id: 'sombrinha', nome: 'Sombrinha Térmica com Proteção UV', custo: 40, detalhe: 'Bloqueio de radiação solar direta' }
  ];

  const handleEntregarReciclaveis = async (e) => {
    e.preventDefault();
    if (pontosCalculados <= 0) return;

    setCarregando(true);
    try {
      await api.registrarTroca({
        garrafas,
        latas,
        pontos: pontosCalculados,
        data: new Date().toISOString()
      }).catch(() => null);

      setSaldo((prev) => prev + pontosCalculados);
      setMensagemSucesso(`Entrega registrada: ${garrafas} garrafas e ${latas} latas (+${pontosCalculados} pontos adicionados ao seu saldo).`);
      setGarrafas(0);
      setLatas(0);
      setTimeout(() => setMensagemSucesso(''), 6000);
    } finally {
      setCarregando(false);
    }
  };

  const handleResgatar = (recompensa) => {
    if (saldo < recompensa.custo) {
      alert(`Saldo insuficiente. Você tem ${saldo} pontos e precisa de ${recompensa.custo} pontos.`);
      return;
    }
    setSaldo((prev) => prev - recompensa.custo);
    setMensagemSucesso(`Resgate confirmado: 1x ${recompensa.nome}. Apresente seu comprovante em qualquer ecoponto credenciado.`);
    setTimeout(() => setMensagemSucesso(''), 6000);
  };

  return (
    <section className="painel-secao" aria-labelledby="recycle-heading">
      <div className="painel-header">
        <div>
          <h2 id="recycle-heading" className="painel-titulo">
            <Recycle size={20} color="var(--mangue)" />
            <span>Coleta Seletiva & Ecopontos Comunitários</span>
          </h2>
          <p className="painel-subtitulo">
            Apoio ao Movimento Pró-Criança e cooperativas de catadores. Entregue recicláveis e retire itens de hidratação e proteção solar:
          </p>
        </div>

        <div
          style={{
            background: 'var(--mangue-light)',
            border: '1px solid #c2dbd1',
            borderRadius: '8px',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.86rem',
            color: 'var(--mangue-dark)',
            fontWeight: 700
          }}
        >
          <Award size={18} color="var(--mangue)" />
          <span>Saldo Comunitário: <strong style={{ fontSize: '1.05rem' }}>{saldo}</strong> pts</span>
        </div>
      </div>

      {mensagemSucesso && (
        <div
          style={{
            background: 'var(--mangue-light)',
            border: '1px solid #86efac',
            color: '#14532d',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            fontSize: '0.88rem'
          }}
        >
          <CheckCircle size={18} color="#16a34a" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* Registro de entrega de resíduos */}
      <form
        onSubmit={handleEntregarReciclaveis}
        style={{
          background: 'var(--bg-terreno)',
          border: '1px solid var(--linha-divisoria)',
          borderRadius: '10px',
          padding: '14px',
          marginBottom: '16px'
        }}
      >
        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--ink-principal)', marginBottom: '8px' }}>
          Registrar Entrega de Materiais:
        </div>

        <div className="grid-reciclagem-contadores">
          <div className="contador-item">
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--ink-secundario)', display: 'block', marginBottom: '4px' }}>
              Garrafas PET (+2 pts cada)
            </label>
            <input
              type="number"
              min="0"
              value={garrafas}
              onChange={(e) => setGarrafas(Math.max(0, parseInt(e.target.value) || 0))}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid var(--linha-destaque)',
                fontSize: '1.05rem',
                fontWeight: 750,
                textAlign: 'center',
                background: '#ffffff',
                color: 'var(--ink-principal)'
              }}
            />
          </div>

          <div className="contador-item">
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--ink-secundario)', display: 'block', marginBottom: '4px' }}>
              Latinhas de Alumínio (+3 pts cada)
            </label>
            <input
              type="number"
              min="0"
              value={latas}
              onChange={(e) => setLatas(Math.max(0, parseInt(e.target.value) || 0))}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid var(--linha-destaque)',
                fontSize: '1.05rem',
                fontWeight: 750,
                textAlign: 'center',
                background: '#ffffff',
                color: 'var(--ink-principal)'
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '0.84rem', color: 'var(--ink-secundario)' }}>
            Total a creditar: <strong style={{ color: 'var(--mangue)', fontSize: '0.98rem' }}>+{pontosCalculados} pontos</strong>
          </div>
          <button
            type="submit"
            disabled={pontosCalculados <= 0 || carregando}
            style={{
              background: pontosCalculados > 0 ? 'var(--mangue)' : 'var(--linha-divisoria)',
              color: pontosCalculados > 0 ? '#ffffff' : 'var(--ink-suave)',
              fontSize: '0.85rem',
              padding: '8px 14px',
              minHeight: '38px',
              cursor: pontosCalculados > 0 ? 'pointer' : 'not-allowed'
            }}
          >
            Confirmar Entrega
          </button>
        </div>
      </form>

      {/* Itens para Resgate */}
      <div>
        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--ink-principal)', marginBottom: '8px' }}>
          Itens de Hidratação e Proteção Disponíveis:
        </div>

        <div className="grid-recompensas">
          {recompensas.map((rec) => (
            <div key={rec.id} className="card-recompensa">
              <div>
                <strong style={{ fontSize: '0.88rem', color: 'var(--ink-principal)' }}>{rec.nome}</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--ink-secundario)', marginTop: '2px' }}>
                  {rec.detalhe}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid var(--linha-suave)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 750, color: 'var(--terracota)' }}>
                  {rec.custo} pts
                </span>
                <button
                  type="button"
                  onClick={() => handleResgatar(rec)}
                  disabled={saldo < rec.custo}
                  style={{
                    background: saldo >= rec.custo ? '#ffffff' : 'transparent',
                    border: '1px solid var(--linha-destaque)',
                    color: saldo >= rec.custo ? 'var(--ink-principal)' : 'var(--ink-suave)',
                    fontSize: '0.76rem',
                    padding: '4px 10px',
                    minHeight: '28px',
                    borderRadius: '6px',
                    cursor: saldo >= rec.custo ? 'pointer' : 'not-allowed'
                  }}
                >
                  Resgatar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
