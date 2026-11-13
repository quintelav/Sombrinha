import React, { useState } from 'react';
import { Recycle, Award, Droplet, Sun, CheckCircle, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function RecycleSection() {
  const [garrafas, setGarrafas] = useState(0);
  const [latas, setLatas] = useState(0);
  const [saldo, setSaldo] = useState(15); // Saldo inicial demonstrativo
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Cada garrafa vale 2 pontos, cada lata vale 3 pontos
  const pontosCalculados = garrafas * 2 + latas * 3;

  const recompensas = [
    { id: 'agua', nome: 'Água Mineral Gelada 500ml', custo: 5, icon: '💧' },
    { id: 'protetor', nome: 'Sachê Protetor Solar FPS 50', custo: 10, icon: '🧴' },
    { id: 'muda', nome: 'Muda Nativa para Plantio Urbano', custo: 20, icon: '🌱' },
    { id: 'sombrinha', nome: 'Sombrinha Térmica com Proteção UV', custo: 40, icon: '☂️' }
  ];

  const handleEntregarReciclaveis = async (e) => {
    e.preventDefault();
    if (pontosCalculados <= 0) return;

    setCarregando(true);
    try {
      // Chama API de trocas no backend se disponível
      await api.registrarTroca({
        garrafas,
        latas,
        pontos: pontosCalculados,
        data: new Date().toISOString()
      }).catch(() => null);

      setSaldo((prev) => prev + pontosCalculados);
      setMensagemSucesso(`Parabéns! Você entregou ${garrafas} garrafas e ${latas} latas, ganhando +${pontosCalculados} Gotas de Frescor!`);
      setGarrafas(0);
      setLatas(0);
      setTimeout(() => setMensagemSucesso(''), 6000);
    } finally {
      setCarregando(false);
    }
  };

  const handleResgatar = (recompensa) => {
    if (saldo < recompensa.custo) {
      alert(`Saldo insuficiente! Você tem ${saldo} Gotas e precisa de ${recompensa.custo}.`);
      return;
    }
    setSaldo((prev) => prev - recompensa.custo);
    setMensagemSucesso(`Resgate confirmado: 1x ${recompensa.nome}! Retire em qualquer Ecoponto credenciado do Centro.`);
    setTimeout(() => setMensagemSucesso(''), 6000);
  };

  return (
    <section className="painel-secao" aria-labelledby="recycle-heading">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
        <div>
          <h2 id="recycle-heading" className="painel-titulo" style={{ margin: 0 }}>
            <Recycle size={22} color="var(--mangue)" />
            Moeda Verde & Reciclagem por Frescor
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--ink-secundario)', marginTop: '4px' }}>
            Troque resíduos plásticos e latas por água mineral gelada, mudas e protetor solar nos ecopontos do Centro.
          </p>
        </div>

        <div
          style={{
            background: 'var(--mangue-light)',
            border: '2px solid var(--mangue)',
            borderRadius: '12px',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 800
          }}
        >
          <Award size={20} color="var(--mangue)" />
          <span>Seu Saldo: <strong style={{ color: 'var(--mangue-dark)', fontSize: '1.15rem' }}>{saldo}</strong> Gotas</span>
        </div>
      </div>

      {mensagemSucesso && (
        <div
          style={{
            background: '#dcfce7',
            border: '2px solid #22c55e',
            color: '#14532d',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          <CheckCircle size={20} color="#16a34a" />
          {mensagemSucesso}
        </div>
      )}

      {/* Formulário de entrega de resíduos */}
      <form
        onSubmit={handleEntregarReciclaveis}
        style={{
          background: 'var(--bg-terreno)',
          border: '1px solid var(--linha-divisoria)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '18px'
        }}
      >
        <div style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={16} color="var(--accent)" />
          Simular Entrega de Recicláveis no Ecoponto:
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              🧴 Garrafas PET (2 pts cada)
            </label>
            <input
              type="number"
              min="0"
              value={garrafas}
              onChange={(e) => setGarrafas(Math.max(0, parseInt(e.target.value) || 0))}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '1rem',
                fontWeight: 700,
                background: 'var(--bg-card)',
                color: 'var(--text-main)'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              🥫 Latinhas Alumínio (3 pts cada)
            </label>
            <input
              type="number"
              min="0"
              value={latas}
              onChange={(e) => setLatas(Math.max(0, parseInt(e.target.value) || 0))}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '1rem',
                fontWeight: 700,
                background: 'var(--bg-card)',
                color: 'var(--text-main)'
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Pontos a receber: <strong style={{ color: 'var(--primary)', fontSize: '1.05rem' }}>+{pontosCalculados} Gotas</strong>
          </div>
          <button
            type="submit"
            disabled={pontosCalculados <= 0 || carregando}
            style={{
              background: pontosCalculados > 0 ? 'var(--primary)' : 'var(--border)',
              color: pontosCalculados > 0 ? 'white' : 'var(--text-muted)',
              cursor: pontosCalculados > 0 ? 'pointer' : 'not-allowed'
            }}
          >
            {carregando ? 'Registrando...' : 'Depositar e Ganhar Gotas'}
          </button>
        </div>
      </form>

      {/* Catálogo de Recompensas */}
      <h3 style={{ fontSize: '1rem', fontWeight: 750, marginBottom: '10px' }}>
        Resgate de Frescor Disponível:
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        {recompensas.map((rec) => {
          const podeResgatar = saldo >= rec.custo;
          return (
            <div
              key={rec.id}
              style={{
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '12px',
                background: 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div>
                <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>{rec.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{rec.nome}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Custo: <strong>{rec.custo} Gotas</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleResgatar(rec)}
                disabled={!podeResgatar}
                style={{
                  marginTop: '10px',
                  background: podeResgatar ? 'var(--blue)' : 'var(--border)',
                  color: podeResgatar ? 'white' : 'var(--text-muted)',
                  cursor: podeResgatar ? 'pointer' : 'not-allowed',
                  fontSize: '0.82rem',
                  padding: '8px 12px',
                  minHeight: '38px'
                }}
              >
                {podeResgatar ? 'Resgatar' : `Faltam ${rec.custo - saldo} pts`}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
