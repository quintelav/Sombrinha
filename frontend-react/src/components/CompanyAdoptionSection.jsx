import React, { useState, useEffect } from 'react';
import { Building2, HeartHandshake, CheckCircle2, MapPin, Send, PlusCircle, ShieldCheck } from 'lucide-react';
import { api, ADOCOES_SEMENTES } from '../services/api';

export default function CompanyAdoptionSection() {
  const [adocoes, setAdocoes] = useState(ADOCOES_SEMENTES);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [empresa, setEmpresa] = useState('');
  const [nomePonto, setNomePonto] = useState('');
  const [referencia, setReferencia] = useState('');
  const [tipoLocal, setTipoLocal] = useState('refresco');
  const [compromisso, setCompromisso] = useState('');
  const [horarios, setHorarios] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState('');

  useEffect(() => {
    let montado = true;
    api.getAdoptions().then((res) => {
      if (montado && res && res.length > 0) {
        setAdocoes(res);
      }
    });
    return () => { montado = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!empresa.trim() || !nomePonto.trim() || !compromisso.trim()) return;

    setEnviando(true);
    try {
      const nova = {
        kind: tipoLocal,
        name: nomePonto,
        organization: empresa,
        reference: referencia || 'Centro do Recife',
        commitment: compromisso,
        hours: horarios || 'Horário comercial',
        latitude: -8.0601,
        longitude: -34.8876
      };

      await api.createAdoption(nova);

      const adocaoSalva = {
        ...nova,
        status: 'Proposta Recebida & Em Avaliação',
        created_at: new Date().toISOString()
      };

      setAdocoes((prev) => [adocaoSalva, ...prev]);
      setSucesso('Proposta de adoção registrada com sucesso! Obrigado pelo compromisso com o clima e o cuidado comunitário do Recife.');
      setEmpresa('');
      setNomePonto('');
      setReferencia('');
      setCompromisso('');
      setHorarios('');
      setMostrarForm(false);
      setTimeout(() => setSucesso(''), 6000);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="painel-secao" aria-labelledby="adoption-heading">
      <div className="painel-header">
        <div>
          <h2 id="adoption-heading" className="painel-titulo">
            <Building2 size={20} color="var(--mangue)" />
            <span>Adoção Cidadã & Parcerias com Empresas</span>
          </h2>
          <p className="painel-subtitulo">
            Comércios, empresas e instituições adotando pontos de apoio para abastecimento de água fresca e criação de refúgios sombreados.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMostrarForm(!mostrarForm)}
          style={{
            background: mostrarForm ? 'var(--bg-terreno)' : 'var(--mangue)',
            color: mostrarForm ? 'var(--ink-principal)' : '#ffffff',
            border: '1px solid var(--linha-destaque)',
            fontSize: '0.84rem',
            padding: '7px 14px',
            minHeight: '36px',
            borderRadius: '6px'
          }}
        >
          <HeartHandshake size={15} />
          <span>{mostrarForm ? 'Fechar Cadastro' : 'Adotar um Ponto'}</span>
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
          <CheckCircle2 size={18} color="#16a34a" />
          <span>{sucesso}</span>
        </div>
      )}

      {/* Formulário de Adoção por Empresas */}
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
            Compromisso de Adoção Empresarial / Comunitária:
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-secundario)', display: 'block', marginBottom: '4px' }}>
                Nome da Empresa ou Estabelecimento *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Farmácia Santo Amaro / Padaria e Café Boa Vista"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
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

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-secundario)', display: 'block', marginBottom: '4px' }}>
                Tipo de Ponto a Adotar *
              </label>
              <select
                value={tipoLocal}
                onChange={(e) => setTipoLocal(e.target.value)}
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
                <option value="refresco">Ponto de Refresco (Bebedouro / Água Gelada)</option>
                <option value="area_verde">Área Verde / Canteiro com Sombra</option>
                <option value="onibus">Ponto de Ônibus / Marquise Protetora</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '10px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-secundario)', display: 'block', marginBottom: '4px' }}>
                Nome do Ponto de Apoio *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Ponto de Refresco da Rua Nova / Canteiro Praça Maciel"
                value={nomePonto}
                onChange={(e) => setNomePonto(e.target.value)}
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

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-secundario)', display: 'block', marginBottom: '4px' }}>
                Endereço / Referência Pública *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Rua da Palma, em frente ao nº 220"
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
          </div>

          <div style={{ marginTop: '10px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-secundario)', display: 'block', marginBottom: '4px' }}>
              Compromisso Assumido pela Empresa *
            </label>
            <textarea
              required
              rows={2}
              placeholder="Ex: Manutenção diária do galão de água mineral gelada gratuita para pedestres e rega das plantas..."
              value={compromisso}
              onChange={(e) => setCompromisso(e.target.value)}
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

          <div style={{ marginTop: '10px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-secundario)', display: 'block', marginBottom: '4px' }}>
              Horários de Acesso Público
            </label>
            <input
              type="text"
              placeholder="Ex: Segunda a sexta das 8h às 18h, sábados até 13h"
              value={horarios}
              onChange={(e) => setHorarios(e.target.value)}
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
              style={{ background: 'var(--mangue)', color: '#ffffff', fontSize: '0.84rem' }}
            >
              <Send size={15} />
              <span>{enviando ? 'Enviando...' : 'Cadastrar Adoção'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Feed de Empresas e Pontos Adotados em Grade Proporcional */}
      <div className="grade-subcards-comunitarios">
        {adocoes.map((item, idx) => (
          <div
            key={item.id || item.name || idx}
            className="cartao-feed-item cartao-empresa-item"
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--mangue)',
                  background: 'var(--mangue-light)',
                  padding: '2px 7px',
                  borderRadius: '4px'
                }}>
                  {item.kind === 'area_verde' ? 'Área Verde' : item.kind === 'onibus' ? 'Ponto de Ônibus' : 'Ponto de Refresco'}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--ink-suave)', fontWeight: 600 }}>
                  {item.status || 'Ponto Adotado'}
                </span>
              </div>

              <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--ink-principal)', marginTop: '6px' }}>
                {item.name}
              </strong>
              <div style={{ fontSize: '0.78rem', color: 'var(--ink-secundario)', marginTop: '2px' }}>
                Parceiro: <strong>{item.organization}</strong>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-suave)' }}>
                {item.reference}
              </div>

              <p style={{ marginTop: '8px', fontSize: '0.82rem', color: 'var(--ink-principal)', lineHeight: 1.45 }}>
                "{item.commitment}"
              </p>
            </div>

            {item.hours && (
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-secundario)', borderTop: '1px solid var(--linha-suave)', paddingTop: '6px', marginTop: '8px' }}>
                Disponibilidade: {item.hours}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Banner Cívico Institucional de Adesão Empresarial */}
      <div className="banner-rodape-painel banner-mangue">
        <div style={{ flex: 1, minWidth: '200px' }}>
          <strong style={{ fontSize: '0.82rem', color: 'var(--mangue-dark)', display: 'block' }}>
            Selo Empresa Amiga do Clima de Recife
          </strong>
          <p style={{ fontSize: '0.76rem', color: 'var(--ink-secundario)', margin: '2px 0 0 0' }}>
            Empresas e comércios locais que mantêm pontos de hidratação ou patrocinam sombras recebem certificação de impacto cívico.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMostrarForm(true)}
          style={{
            background: 'var(--mangue)',
            color: '#ffffff',
            fontSize: '0.78rem',
            padding: '6px 12px',
            minHeight: '32px',
            borderRadius: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          <Building2 size={14} />
          <span>Cadastrar Empresa</span>
        </button>
      </div>
    </section>
  );
}
