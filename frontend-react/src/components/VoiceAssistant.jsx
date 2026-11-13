import React, { useState } from 'react';
import { Mic, Volume2, Sparkles, Send, Loader2 } from 'lucide-react';
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
      simularVoz('Tô na Conde da Boa Vista procurando ponto de água gelada');
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
    <section className="card-section" aria-label="Assistente Acessível por Voz">
      <div className="card-title">
        <Sparkles size={22} color="var(--primary)" />
        <h2>Assistente por Voz & Perguntas Rápidas</h2>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '12px' }}>
        Acessibilidade para quem está caminhando no asfalto quente: fale com o app para encontrar o ponto de água mais próximo.
      </p>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Ex: 'Onde tem água gelada na Boa Vista?' ou 'Tô com sede'"
          style={{
            flex: 1,
            minWidth: '220px',
            padding: '12px 14px',
            borderRadius: '10px',
            border: '2px solid var(--border)',
            background: 'var(--bg-card)',
            color: 'var(--text-main)',
            fontSize: '0.95rem'
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleConsultar()}
        />

        <button
          type="button"
          onClick={alternarMicrofone}
          style={{ background: ouvindo ? '#dc2626' : 'var(--blue)', color: 'white' }}
          aria-label={ouvindo ? 'Ouvindo...' : 'Falar pelo microfone'}
        >
          <Mic size={18} />
          <span>{ouvindo ? 'Ouvindo...' : 'Falar'}</span>
        </button>

        <button
          type="button"
          onClick={() => handleConsultar()}
          disabled={carregando}
          style={{ background: 'var(--primary)', color: 'white' }}
        >
          {carregando ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          <span>Consultar</span>
        </button>
      </div>

      {/* Sugestões rápidas */}
      <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="tab-pill"
          onClick={() => simularVoz('Onde tem água gelada gratuita na Conde da Boa Vista?')}
          style={{ fontSize: '0.82rem', padding: '6px 12px', minHeight: '34px' }}
        >
          💧 "Água na Boa Vista"
        </button>
        <button
          type="button"
          className="tab-pill"
          onClick={() => simularVoz('Tô no Pátio de São José com muito calor')}
          style={{ fontSize: '0.82rem', padding: '6px 12px', minHeight: '34px' }}
        >
          🔥 "Calor em São José"
        </button>
        <button
          type="button"
          className="tab-pill"
          onClick={() => simularVoz('Como trocar garrafa PET por água mineral?')}
          style={{ fontSize: '0.82rem', padding: '6px 12px', minHeight: '34px' }}
        >
          ♻️ "Trocar PET por Água"
        </button>
      </div>

      {resposta && (
        <div
          style={{
            marginTop: '14px',
            padding: '14px',
            borderRadius: '10px',
            background: 'var(--blue-light)',
            border: '2px solid var(--blue)'
          }}
          role="status"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ color: 'var(--blue)', fontSize: '0.98rem' }}>Orientação do Sombrinha:</strong>
            <button
              type="button"
              onClick={() => falarTexto(resposta.resposta_voz)}
              style={{ background: 'var(--blue)', color: 'white', fontSize: '0.8rem', padding: '4px 10px', minHeight: '32px' }}
            >
              <Volume2 size={14} /> Ouvir Novamente
            </button>
          </div>
          <p style={{ marginTop: '6px', fontSize: '0.95rem', fontWeight: 650 }}>
            {resposta.resposta_voz}
          </p>
          {resposta.recomendacao && (
            <p style={{ marginTop: '4px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              💡 <em>{resposta.recomendacao}</em>
            </p>
          )}
        </div>
      )}
    </section>
  );
}
