import React from 'react';
import { Sun, CreditCard, Flame, MapPin } from 'lucide-react';

export default function Header({ isSolForte, solForte, onToggleSolForte, toggleSolForte, onOpenCard, onOpenCitizenCard, onOpenStudy, onOpenHeatStudy, userCoords }) {
  const activeSolForte = isSolForte ?? solForte;
  const handleToggle = onToggleSolForte ?? toggleSolForte;
  const handleOpenStudy = onOpenStudy ?? onOpenHeatStudy;
  const handleOpenCard = onOpenCard ?? onOpenCitizenCard;

  return (
    <header className="app-header">
      <div className="container header-inner">
        <div className="brand-wrapper">
          <span className="brand-icon" role="img" aria-label="Sombrinha">☂️</span>
          <div>
            <h1 className="brand-title">Sombrinha</h1>
            <span className="brand-subtitle">
              Pontos de Frescor & Resiliência Térmica • Recife
            </span>
          </div>
        </div>

        <div className="header-buttons">
          <button
            type="button"
            className="btn-contrast"
            onClick={handleToggle}
            title="Alternar contraste para leitura sob sol forte"
          >
            <Sun size={18} />
            <span>{activeSolForte ? 'Modo Normal' : 'Modo Sol Forte'}</span>
          </button>

          <button
            type="button"
            style={{ background: '#ea580c', color: 'white' }}
            onClick={handleOpenStudy}
            title="Ver estudo das ruas mais quentes do Centro"
          >
            <Flame size={18} />
            <span>Ruas Mais Quentes</span>
          </button>

          <button
            type="button"
            className="btn-blue"
            onClick={handleOpenCard}
            title="Acessar Cartão Cidadão Solidário (Inclusão social)"
          >
            <CreditCard size={18} />
            <span>Cartão Cidadão</span>
          </button>
        </div>
      </div>
    </header>
  );
}
