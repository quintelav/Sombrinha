import React, { useState } from 'react';
import { Mic, Volume2, Send, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function VoiceAssistant({ onVoiceResponse, userLocation }) {
  const [texto, setTexto] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [resposta, setResposta] = useState(null);
  const [ouvindo, setOuvindo] = useState(false);

  const falarTexto = (frase) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(frase);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleConsultar = async (queryTexto) => {
    const q = queryTexto || texto;
    if (!q.trim()) return;

    setCarregando(true);
    try {
      const res = await api.analyzeVoice(q);
      setResposta(res);
      if (res?.resposta_voz) {
        falarTexto(res.resposta_voz);
      }
      if (onVoiceResponse) {
        onVoiceResponse(res);
      }
    } finally {
      setCarregando(false);
    }
  };

  const simularVoz = (frase) => {
    setTexto(frase);
    handleConsultar(frase);
  };

  const alternarMicrofone = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      simularVoz('Onde tem bebedouro público na Conde da Boa Vista?');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setOuvindo(true);
      recognition.onend = () => setOuvindo(false);
      recognition.onerror = () => {
        setOuvindo(false);
        simularVoz('Onde tem água gelada gratuita perto da Rua Nova?');
      };
      recognition.onresult = (event) => {
        const transcr = event.results[0][0].transcript;
        setTexto(transcr);
        handleConsultar(transcr);
      };

      recognition.start();
    } catch {
      simularVoz('Onde tem bebedouro público no Centro?');
    }
  };

  return (
    <section className="painel-secao banner-busca-voz" aria-label="Orientação Acessível por Voz">
      <div className="busca-voz-topo">
        <div className="busca-voz-info">
          <h2 className="painel-titulo">
            <Mic size={20} color="var(--capibaribe)" />
            <span>Orientação por Voz & Busca Rápida</span>
          </h2>
          <p className="painel-subtitulo">
            Acessibilidade para quem está caminhando nas ruas. Fale ou digite sua dúvida:
          </p>
        </div>

        <div className="campo-busca-voz">
          <input
            type="text"
            className="input-voz-texto"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Ex: Onde tem água na Boa Vista? ou Sombra perto do Pátio"
            onKeyDown={(e) => e.key === 'Enter' && handleConsultar()}
          />

          <button
            type="button"
            onClick={alternarMicrofone}
            className={`btn-voz-mic ${ouvindo ? 'ouvindo' : ''}`}
            aria-label={ouvindo ? 'Ouvindo...' : 'Falar pelo microfone'}
            title="Falar pelo microfone"
          >
            <Mic size={17} />
            <span>{ouvindo ? 'Ouvindo...' : 'Falar'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleConsultar()}
            disabled={carregando}
            className="btn-voz-enviar"
            title="Consultar pergunta"
          >
            {carregando ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
            <span>Buscar</span>
          </button>
        </div>
      </div>

      {/* Sugestões de perguntas frequentes alinhadas */}
      <div className="chips-perguntas-rapidas" style={{ marginTop: '12px' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--ink-suave)', fontWeight: 600, alignSelf: 'center', marginRight: '4px' }}>
          Consultas rápidas:
        </span>
        <button
          type="button"
          className="chip-pergunta"
          onClick={() => simularVoz('Onde tem água gelada na Conde da Boa Vista?')}
        >
          Água na Boa Vista
        </button>
        <button
          type="button"
          className="chip-pergunta"
          onClick={() => simularVoz('Onde encontrar sombra perto do Pátio de São José?')}
        >
          Sombra em São José
        </button>
        <button
          type="button"
          className="chip-pergunta"
          onClick={() => simularVoz('Parques arborizados com sombra no Centro')}
        >
          Parques no Centro
        </button>
        <button
          type="button"
          className="chip-pergunta"
          onClick={() => simularVoz('Como trocar garrafa PET por água mineral nos ecopontos?')}
        >
          Troca de recicláveis
        </button>
      </div>

      {resposta && (
        <div className="resposta-voz-container" role="status" style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--mangue)', textTransform: 'uppercase' }}>
              Resposta do Sombrinha
            </span>
            <button
              type="button"
              onClick={() => falarTexto(resposta.resposta_voz)}
              style={{ background: '#ffffff', color: 'var(--ink-principal)', border: '1px solid var(--linha-destaque)', fontSize: '0.78rem', padding: '4px 10px', minHeight: '30px' }}
            >
              <Volume2 size={13} /> Ouvir Áudio
            </button>
          </div>
          <p style={{ marginTop: '8px', fontSize: '0.94rem', fontWeight: 600, color: 'var(--ink-principal)', lineHeight: 1.45 }}>
            {resposta.resposta_voz}
          </p>
          {resposta.recomendacao && (
            <p style={{ marginTop: '6px', fontSize: '0.84rem', color: 'var(--ink-secundario)' }}>
              Orientações de apoio: {resposta.recomendacao}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
