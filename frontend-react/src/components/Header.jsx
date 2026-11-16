import React, { useEffect, useState } from 'react';
import { Sun, Flame, CreditCard, User } from 'lucide-react';

export default function Header({
  isSolForte,
  solForte,
  onToggleSolForte,
  toggleSolForte,
  onOpenCard,
  onOpenCitizenCard,
  onOpenStudy,
  onOpenHeatStudy,
  currentUser,
  onOpenProfile,
  onOpenUserProfile
}) {
  const activeSolForte = isSolForte ?? solForte;
  const handleToggle = onToggleSolForte ?? toggleSolForte;
  const handleOpenStudy = onOpenStudy ?? onOpenHeatStudy;
  const handleOpenCard = onOpenCard ?? onOpenCitizenCard;
  const handleOpenProfile = onOpenProfile ?? onOpenUserProfile;

  const [hidden, setHidden] = useState(false);

  // Monitora scroll para recolher o cabeçalho suavemente ao descer a página
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

  return (
    <header className={`app-header ${hidden ? 'header-hidden' : ''}`}>
      <div className="container header-container-centered">
        {/* Marca Autêntica do Projeto Sombrinha */}
        <div className="brand-lockup">
          <img
            src="./logo-sombrinha.jpg"
            alt="Logo Sombrinha Recife"
            className="brand-logo-img"
          />

          <div className="brand-text">
            <div className="brand-title-wrap">
              <h1 className="brand-title">Sombrinha</h1>
              <span className="brand-tag-cidade" title="Patrimônio Cultural e Cidade de Recife">
                <svg width="13" height="14" viewBox="0 0 100 110" fill="none" style={{ display: 'inline-block' }}>
                  <path d="M50 15 C34 16 20 28 12 50 C22 53 32 53 40 51 L50 15Z" fill="#16a34a"/>
                  <path d="M50 15 L40 51 C44 52 47 52 50 52 L50 15Z" fill="#dc2626"/>
                  <path d="M50 15 L50 52 C53 52 56 52 60 51 L50 15Z" fill="#facc15"/>
                  <path d="M50 15 L60 51 C68 53 78 53 88 50 C80 28 66 16 50 15Z" fill="#0284c7"/>
                  <circle cx="50" cy="14" r="4" fill="#fef08a"/>
                  <path d="M50 52 L50 88 C50 96 42 98 38 94 C34 90 36 84 40 84" stroke="#ffffff" strokeWidth="6" strokeLinecap="round"/>
                </svg>
                <span>Recife</span>
              </span>
            </div>
            <span className="brand-slogan">Sombra no caminho, cuidado compartilhado</span>
          </div>
        </div>

        {/* Botões de Ação Cívica */}
        <div className="header-actions">
          <button
            type="button"
            className="btn-header btn-header-sol-forte"
            onClick={handleToggle}
            aria-pressed={activeSolForte}
            title="Alternar contraste para leitura sob sol forte"
          >
            <Sun size={17} />
            <span>{activeSolForte ? 'Contraste Normal' : 'Modo Sol Forte'}</span>
          </button>

          <button
            type="button"
            className="btn-header"
            onClick={handleOpenStudy}
            title="Ver estudo das ruas mais quentes do Centro do Recife"
          >
            <Flame size={17} />
            <span>Ruas Mais Quentes</span>
          </button>

          <button
            type="button"
            className="btn-header"
            onClick={handleOpenCard}
            title="Acessar Cartão Cidadão para pessoas sem smartphone"
          >
            <CreditCard size={17} />
            <span>Cartão Cidadão</span>
          </button>

          <button
            type="button"
            className={`btn-header btn-header-perfil ${currentUser ? 'btn-header-perfil-logged' : ''}`}
            onClick={handleOpenProfile}
            title={currentUser ? `Conta de ${currentUser.name} (Ver / Editar Perfil)` : 'Entrar ou criar perfil no Sombrinha'}
          >
            {currentUser ? (
              <div className="header-avatar-badge">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="header-avatar-img"
                  />
                ) : (
                  <span className="header-avatar-initials">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                )}
                <span className="header-user-firstname">
                  {currentUser.name ? currentUser.name.split(' ')[0] : 'Perfil'}
                </span>
              </div>
            ) : (
              <>
                <User size={17} />
                <span>Entrar / Perfil</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
