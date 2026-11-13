import React, { useEffect, useState } from 'react';
import { Sun, Flame, CreditCard } from 'lucide-react';
import { api } from '../services/api';

export default function Header({
  isSolForte,
  solForte,
  onToggleSolForte,
  toggleSolForte,
  onOpenCard,
  onOpenCitizenCard,
  onOpenStudy,
  onOpenHeatStudy
}) {
  const activeSolForte = isSolForte ?? solForte;
  const handleToggle = onToggleSolForte ?? toggleSolForte;
  const handleOpenStudy = onOpenStudy ?? onOpenHeatStudy;
  const handleOpenCard = onOpenCard ?? onOpenCitizenCard;

  const [flaskOnline, setFlaskOnline] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Monitora scroll para auto-esconder o cabeçalho ao descer a página
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 60 && currentScrollY > lastScrollY) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY = currentScrollY > 0 ? currentScrollY : 0;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let montado = true;
    async function testConnection() {
      const ok = await api.checkHealth();
      if (montado) setFlaskOnline(ok);
    }
    testConnection();
    const interval = setInterval(testConnection, 8000);
    return () => {
      montado = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className={`app-header ${hidden ? 'header-hidden' : ''}`}>
      <div className="container header-container-centered">
        {/* LOGO CENTRALIZADO COM A SOMBRINHA DE FREVO & NOME */}
        <div className="brand-lockup-centered">
          <div className="brand-emblem-wrapper" title="Sombrinha — Recife">
            <img
              src="./logo-sombrinha.jpg"
              alt="Logo Sombrinha"
              className="brand-logo-image"
            />
            {/* Sombrinha de Frevo Autêntica sobreposta como selo cultural */}
            <div className="brand-frevo-badge" title="Sombrinha de Frevo de Pernambuco">
              <svg width="20" height="22" viewBox="0 0 100 110" fill="none">
                <path d="M50 15 C34 16 20 28 12 50 C22 53 32 53 40 51 L50 15Z" fill="#16a34a" stroke="#ffffff" strokeWidth="2"/>
                <path d="M50 15 L40 51 C44 52 47 52 50 52 L50 15Z" fill="#dc2626" stroke="#ffffff" strokeWidth="2"/>
                <path d="M50 15 L50 52 C53 52 56 52 60 51 L50 15Z" fill="#facc15" stroke="#ffffff" strokeWidth="2"/>
                <path d="M50 15 L60 51 C68 53 78 53 88 50 C80 28 66 16 50 15Z" fill="#0284c7" stroke="#ffffff" strokeWidth="2"/>
                <circle cx="50" cy="14" r="4" fill="#fef08a" stroke="#78350f" strokeWidth="1.5"/>
                <path d="M50 52 L50 88 C50 96 42 98 38 94 C34 90 36 84 40 84" stroke="#78350f" strokeWidth="6" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          <div className="brand-text-centered">
            <h1 className="brand-title">Sombrinha</h1>
            <span className="brand-slogan">Sombra no caminho, cuidado compartilhado</span>
          </div>

          <div
            className="status-badge"
            title={flaskOnline ? "Conectado ao backend Flask em tempo real" : "Operando em modo de contingência local com dados reais do Recife"}
          >
            <span className={`status-dot ${flaskOnline ? '' : 'offline'}`} />
            <span>{flaskOnline ? 'Flask Conectado' : 'Modo Autônomo'}</span>
          </div>
        </div>

        {/* BOTÕES DE AÇÃO ALINHADOS E CENTRALIZADOS */}
        <div className="header-buttons-centered">
          <button
            type="button"
            className="btn-sol-forte"
            onClick={handleToggle}
            aria-pressed={activeSolForte}
            title="Alternar contraste máximo para leitura sob sol forte"
          >
            <Sun size={19} />
            <span>{activeSolForte ? 'Modo Normal' : 'Modo Sol Forte'}</span>
          </button>

          <button
            type="button"
            style={{ background: '#be123c', color: '#ffffff' }}
            onClick={handleOpenStudy}
            title="Ver estudo das ruas mais quentes do Centro"
          >
            <Flame size={18} />
            <span>Ruas Quentes</span>
          </button>

          <button
            type="button"
            style={{ background: '#0284c7', color: '#ffffff' }}
            onClick={handleOpenCard}
            title="Acessar Cartão Cidadão para pessoas sem smartphone"
          >
            <CreditCard size={18} />
            <span>Cartão Cidadão</span>
          </button>
        </div>
      </div>
    </header>
  );
}
