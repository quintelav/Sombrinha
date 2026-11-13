import React, { useState, useEffect } from 'react';
import { MessageSquare, Flame, PlusCircle, CheckCircle, Send, MapPin } from 'lucide-react';
import { api, RELATOS_SEMENTES } from '../services/api';

export default function CriticalPointsCommentsSection() {
  const [relatos, setRelatos] = useState(RELATOS_SEMENTES);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [bairro, setBairro] = useState('São José');
  const [referencia, setReferencia] = useState('');
  const [tipo, setTipo] = useState('quente_sem_sombra');
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState('');

  useEffect(() => {
    let montado = true;
    api.getReports().then((res) => {
      if (montado && res && res.length > 0) {
        setRelatos(res);
      }
    });
    return () => { montado = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!referencia.trim() || !comentario.trim()) return;

    setEnviando(true);
    try {
      const novo = {
        location: 'Centro',
        neighborhood: bairro,
        reference: referencia,
        kind: tipo,
        note: comentario,
        latitude: -8.0620,
        longitude: -34.8810
      };

      await api.createReport(novo);

      const relatoSalvo = {
        id: `rel-${Date.now()}`,
        ...novo,
        kind_label: tipo === 'quente_sem_sombra' ? 'Lugar muito quente e sem sombra' :
                    tipo === 'precisa_sombra' ? 'Espaço que precisa de mais sombra' :
                    tipo === 'ponto_refresco' ? 'Sugestão de ponto de refresco' : 'Área verde precisando de cuidado',
        created_at: new Date().toISOString()
      };

      setRelatos((prev) => [relatoSalvo, ...prev]);
      setSucesso('Comentário sobre o ponto crítico publicado com sucesso!');
      setReferencia('');
      setComentario('');
      setMostrarForm(false);
      setTimeout(() => setSucesso(''), 5000);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="painel-secao" aria-labelledby="comments-heading">
      <div className="painel-header">
        <div>
          <h2 id="comments-heading" className="painel-titulo">
            <MessageSquare size={20} color="var(--alerta-calor)" />
            <span>Voz Comunitária: Comentários sobre Pontos Críticos</span>
          </h2>
          <p className="painel-subtitulo">
            Espaço aberto para pedestres, ciclistas e trabalhadores ambulantes relatarem onde o asfalto queima e onde a cidade precisa de sombra.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMostrarForm(!mostrarForm)}
          style={{
            background: mostrarForm ? 'var(--bg-terreno)' : 'var(--alerta-calor)',
            color: mostrarForm ? 'var(--ink-principal)' : '#ffffff',
            border: '1px solid var(--linha-destaque)',
            fontSize: '0.84rem',
            padding: '7px 14px',
            minHeight: '36px',
            borderRadius: '6px'
          }}
        >
          <Flame size={15} />
          <span>{mostrarForm ? 'Fechar Relato' : 'Comentar Ponto Crítico'}</span>
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

      {/* Formulário para Comentar Ponto Crítico */}
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
          <div style={{ fontSize: '0.9rem', fontWeight: 750, color: 'var(--ink-principal)', marginBottom: '8px' }}>
            Comentar Rua ou Local Crítico de Calor:
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
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
                <option value="São José">São José</option>
                <option value="Santo Antônio">Santo Antônio</option>
                <option value="Boa Vista">Boa Vista</option>
                <option value="Santo Amaro">Santo Amaro</option>
                <option value="Recife Antigo">Recife Antigo</option>
                <option value="Afogados">Afogados</option>
                <option value="Madalena">Madalena</option>
                <option value="Casa Amarela">Casa Amarela</option>
                <option value="Boa Viagem">Boa Viagem</option>
                <option value="Outro Bairro">Outro Bairro da Cidade</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-secundario)', display: 'block', marginBottom: '4px' }}>
                Situação Observada *
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
                <option value="quente_sem_sombra">Lugar muito quente e sem sombra</option>
                <option value="precisa_sombra">Espaço que poderia receber mais sombra</option>
                <option value="ponto_refresco">Sugestão de local para ponto de refresco</option>
                <option value="espaco_verde">Área verde que precisa de cuidado</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '10px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-secundario)', display: 'block', marginBottom: '4px' }}>
              Rua ou Ponto de Referência Crítico *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Rua da Palma / Calçadão da Rua Nova / Parada de ônibus na Dantas Barreto"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
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
              Seu Comentário ou Depoimento *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Conte como é passar por esse local no horário de pico do sol (falta de árvores, chão quente, cansaço, etc)..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
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
              style={{ background: 'var(--alerta-calor)', color: '#ffffff', fontSize: '0.84rem' }}
            >
              <Send size={15} />
              <span>{enviando ? 'Publicando...' : 'Publicar Comentário'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Feed de Comentários Comunitários em Grade Proporcional */}
      <div className="grade-subcards-comunitarios">
        {relatos.map((relato, idx) => (
          <div
            key={relato.id || idx}
            className="cartao-feed-item"
            style={{ borderLeft: '3px solid var(--alerta-calor)' }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '0.92rem', color: 'var(--ink-principal)' }}>
                  {relato.reference}
                </strong>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'var(--alerta-calor)',
                  background: 'var(--alerta-calor-light)',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap'
                }}>
                  {relato.neighborhood}
                </span>
              </div>

              <p style={{ marginTop: '8px', fontSize: '0.83rem', color: 'var(--ink-principal)', lineHeight: 1.45 }}>
                "{relato.note}"
              </p>
            </div>

            <div style={{ fontSize: '0.74rem', color: 'var(--ink-suave)', borderTop: '1px solid var(--linha-suave)', paddingTop: '6px', marginTop: '6px' }}>
              Relato comunitário · {relato.created_at ? new Date(relato.created_at).toLocaleDateString('pt-BR') : 'Hoje'}
            </div>
          </div>
        ))}
      </div>

      {/* Banner de Engajamento Cidadão Alinhado ao Rodapé do Painel */}
      <div className="banner-rodape-painel banner-alerta">
        <div style={{ fontSize: '0.78rem', color: 'var(--alerta-calor)', fontWeight: 600 }}>
          🔥 Relatos em tempo real ajudam outros pedestres a desviar do asfalto quente e buscar vias arborizadas.
        </div>
        <button
          type="button"
          onClick={() => setMostrarForm(true)}
          style={{
            background: 'var(--alerta-calor)',
            color: '#ffffff',
            fontSize: '0.76rem',
            padding: '5px 12px',
            minHeight: '30px',
            borderRadius: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          + Relatar Ponto Crítico
        </button>
      </div>
    </section>
  );
}
