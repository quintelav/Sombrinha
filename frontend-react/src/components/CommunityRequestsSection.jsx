import React, { useState, useEffect } from 'react';
import { Wrench, PlusCircle, CheckCircle, Clock, MapPin, Send, HelpCircle } from 'lucide-react';
import { api, PEDIDOS_SEMENTES } from '../services/api';

export default function CommunityRequestsSection() {
  const [pedidos, setPedidos] = useState(PEDIDOS_SEMENTES);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tipo, setTipo] = useState('manutencao_bebedouro');
  const [localRef, setLocalRef] = useState('');
  const [bairro, setBairro] = useState('Boa Vista');
  const [solicitante, setSolicitante] = useState('');
  const [descricao, setDescricao] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState('');

  useEffect(() => {
    let montado = true;
    api.getCommunityRequests().then((res) => {
      if (montado && res && res.length > 0) {
        setPedidos(res);
      }
    });
    return () => { montado = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!localRef.trim() || !descricao.trim()) return;

    setEnviando(true);
    try {
      const novo = {
        tipo,
        local_referencia: localRef,
        bairro,
        solicitante: solicitante.trim() || 'Cidadão do Recife',
        descricao
      };

      const res = await api.createCommunityRequest(novo);
      const pedidoSalvo = res.pedido || {
        id: `ped-${Date.now()}`,
        ...novo,
        tipo_label: tipo === 'novo_bebedouro' ? 'Instalação de Novo Bebedouro Público' :
                    tipo === 'manutencao_bebedouro' ? 'Manutenção em Bebedouro' :
                    tipo === 'plantio_arvore' ? 'Plantio de Árvores / Sombra' :
                    tipo === 'marquise_banco' ? 'Marquise / Banco Sombreado' : 'Outra Melhoria',
        status: 'Recebido pela comunidade',
        created_at: new Date().toISOString()
      };

      setPedidos((prev) => [pedidoSalvo, ...prev]);
      setSucesso('Pedido registrado com sucesso! Sua solicitação foi adicionada ao mural comunitário.');
      setLocalRef('');
      setDescricao('');
      setSolicitante('');
      setMostrarForm(false);
      setTimeout(() => setSucesso(''), 5000);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="painel-secao" aria-labelledby="requests-heading">
      <div className="painel-header">
        <div>
          <h2 id="requests-heading" className="painel-titulo">
            <Wrench size={20} color="var(--terracota)" />
            <span>Pedidos & Melhorias em Pontos de Apoio</span>
          </h2>
          <p className="painel-subtitulo">
            Solicite instalação de bebedouros, manutenção em equipamentos públicos ou plantio de árvores no seu bairro.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMostrarForm(!mostrarForm)}
          style={{
            background: mostrarForm ? 'var(--bg-terreno)' : 'var(--terracota)',
            color: mostrarForm ? 'var(--ink-principal)' : '#ffffff',
            border: '1px solid var(--linha-destaque)',
            fontSize: '0.84rem',
            padding: '7px 14px',
            minHeight: '36px',
            borderRadius: '6px'
          }}
        >
          <PlusCircle size={15} />
          <span>{mostrarForm ? 'Fechar Formulário' : 'Fazer Pedido'}</span>
        </button>
      </div>

      {sucesso && (
        <div style={{
          background: 'var(--mangue-light)',
          border: '1px solid #86efac',
          color: '#14532d',
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.86rem',
          fontWeight: 600
        }}>
          <CheckCircle size={18} color="#16a34a" />
          <span>{sucesso}</span>
        </div>
      )}

      {/* Formulário de Novo Pedido */}
      {mostrarForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: 'var(--bg-terreno)',
            border: '1px solid var(--linha-divisoria)',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '18px'
          }}
        >
          <div style={{ fontSize: '0.9rem', fontWeight: 750, color: 'var(--ink-principal)', marginBottom: '10px' }}>
            Registrar Nova Solicitação Comunitária:
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-secundario)', display: 'block', marginBottom: '4px' }}>
                Tipo de Pedido ou Alteração *
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--linha-destaque)',
                  background: '#ffffff',
                  color: 'var(--ink-principal)',
                  fontSize: '0.88rem'
                }}
              >
                <option value="manutencao_bebedouro">Manutenção ou Conserto em Bebedouro</option>
                <option value="novo_bebedouro">Instalação de Novo Bebedouro Público</option>
                <option value="plantio_arvore">Plantio de Árvores / Ampliação de Sombra</option>
                <option value="marquise_banco">Instalação de Marquise ou Banco Sombreado</option>
                <option value="outro">Outra Melhoria Urbana</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-secundario)', display: 'block', marginBottom: '4px' }}>
                Bairro *
              </label>
              <select
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--linha-destaque)',
                  background: '#ffffff',
                  color: 'var(--ink-principal)',
                  fontSize: '0.88rem'
                }}
              >
                <option value="Boa Vista">Boa Vista</option>
                <option value="Santo Antônio">Santo Antônio</option>
                <option value="São José">São José</option>
                <option value="Santo Amaro">Santo Amaro</option>
                <option value="Recife Antigo">Recife Antigo</option>
                <option value="Afogados">Afogados</option>
                <option value="Madalena">Madalena</option>
                <option value="Espinheiro">Espinheiro</option>
                <option value="Casa Amarela">Casa Amarela</option>
                <option value="Boa Viagem">Boa Viagem</option>
                <option value="Outro Bairro">Outro Bairro de Recife / RMR</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '10px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-secundario)', display: 'block', marginBottom: '4px' }}>
              Local de Referência ou Ponto de Ajuda *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Av. Conde da Boa Vista, parada em frente ao banco / Praça Maciel Pinheiro"
              value={localRef}
              onChange={(e) => setLocalRef(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '6px',
                border: '1px solid var(--linha-destaque)',
                background: '#ffffff',
                color: 'var(--ink-principal)',
                fontSize: '0.88rem'
              }}
            />
          </div>

          <div style={{ marginTop: '10px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-secundario)', display: 'block', marginBottom: '4px' }}>
              Seu Nome ou Coletivo (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Maria (Ambulante da Boa Vista) ou Morador Local"
              value={solicitante}
              onChange={(e) => setSolicitante(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '6px',
                border: '1px solid var(--linha-destaque)',
                background: '#ffffff',
                color: 'var(--ink-principal)',
                fontSize: '0.88rem'
              }}
            />
          </div>

          <div style={{ marginTop: '10px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-secundario)', display: 'block', marginBottom: '4px' }}>
              Descrição do Pedido / Problema Observado *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Descreva o que precisa ser consertado, instalado ou melhorado..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '6px',
                border: '1px solid var(--linha-destaque)',
                background: '#ffffff',
                color: 'var(--ink-principal)',
                fontSize: '0.88rem',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setMostrarForm(false)}
              style={{ background: 'transparent', border: '1px solid var(--linha-divisoria)', color: 'var(--ink-secundario)', fontSize: '0.84rem' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              style={{ background: 'var(--terracota)', color: '#ffffff', fontSize: '0.84rem' }}
            >
              <Send size={15} />
              <span>{enviando ? 'Enviando...' : 'Registrar Pedido'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Feed de Pedidos Comunitários Ativos em Grade Proporcional */}
      <div className="grade-subcards-comunitarios">
        {pedidos.map((ped) => (
          <div
            key={ped.id || ped.created_at}
            className="cartao-feed-item"
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                    color: 'var(--terracota)',
                    background: 'var(--terracota-light)',
                    padding: '2px 7px',
                    borderRadius: '4px'
                  }}>
                    {ped.tipo_label || ped.tipo}
                  </span>
                  <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--ink-principal)', marginTop: '4px' }}>
                    {ped.local_referencia}
                  </strong>
                  <div style={{ fontSize: '0.76rem', color: 'var(--ink-secundario)' }}>
                    {ped.bairro} · Por: <strong>{ped.solicitante || 'Cidadão'}</strong>
                  </div>
                </div>

                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--mangue)',
                  background: 'var(--mangue-light)',
                  padding: '2px 7px',
                  borderRadius: '12px',
                  whiteSpace: 'nowrap'
                }}>
                  {ped.status || 'Recebido'}
                </span>
              </div>

              <p style={{ marginTop: '8px', fontSize: '0.83rem', color: 'var(--ink-principal)', lineHeight: 1.45 }}>
                "{ped.descricao}"
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Banner Informativo Comunitário Alinhado ao Rodapé do Painel */}
      <div className="banner-rodape-painel banner-terracota">
        <div style={{ fontSize: '0.78rem', color: 'var(--terracota-dark)', fontWeight: 600 }}>
          💡 Solicitações populares são enviadas semanalmente à Emlurb e aos coletivos de urbanismo tático.
        </div>
        <button
          type="button"
          onClick={() => setMostrarForm(true)}
          style={{
            background: 'var(--terracota)',
            color: '#ffffff',
            fontSize: '0.76rem',
            padding: '5px 12px',
            minHeight: '30px',
            borderRadius: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          + Novo Pedido
        </button>
      </div>
    </section>
  );
}
