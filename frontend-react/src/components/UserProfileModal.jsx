import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  MapPin,
  Camera,
  LogOut,
  Edit3,
  Check,
  X,
  ShieldCheck,
  Sparkles,
  Upload,
  Key,
  AlertCircle,
  Clock,
  Trash2
} from 'lucide-react';
import { api } from '../services/api';

const AVATAR_PRESETS = [
  {
    name: 'Alceu Valença',
    sub: 'Voz do Frevo & Carnaval',
    categoria: 'musica',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/09/-2024-06-30-_Alceu_Valen%C3%A7a_no_S%C3%ADtio_Trindade_001_-_Romerito_Pontes_%2853827987723%29_%28cropped%29.jpg/330px--2024-06-30-_Alceu_Valen%C3%A7a_no_S%C3%ADtio_Trindade_001_-_Romerito_Pontes_%2853827987723%29_%28cropped%29.jpg'
  },
  {
    name: 'Ariano Suassuna',
    sub: 'Movimento Armorial & Dramaturgo',
    categoria: 'literatura',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b8/Ariano_Suassuna.jpg/330px-Ariano_Suassuna.jpg'
  },
  {
    name: 'Chico Science',
    sub: 'Manguebeat & Nação Zumbi',
    categoria: 'musica',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d2/Chico_Science_%26_Na%C3%A7%C3%A3o_Zumbi_turn%C3%AA_nos_Estados_Unidos_%28cropped_2%29.jpg/330px-Chico_Science_%26_Na%C3%A7%C3%A3o_Zumbi_turn%C3%AA_nos_Estados_Unidos_%28cropped_2%29.jpg'
  },
  {
    name: 'Clarice Lispector',
    sub: 'Escritora da Boa Vista / Recife',
    categoria: 'literatura',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/%281920-1977%29_Clarice_Lispector_6zxkp_please_credit%28palette.fm%29_%28cropped%29.png'
  },
  {
    name: 'Dominguinhos',
    sub: 'Mestre da Sanfona (Garanhuns, PE)',
    categoria: 'musica',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8e/Dominguinhos_de_Morais.jpg/330px-Dominguinhos_de_Morais.jpg'
  },
  {
    name: 'Lenine',
    sub: 'Cantor & Compositor Recifense',
    categoria: 'musica',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/de/Lenine_2025.jpg/330px-Lenine_2025.jpg'
  },
  {
    name: 'Lia de Itamaracá',
    sub: 'Rainha da Ciranda & Patrimônio Vivo',
    categoria: 'musica',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/79/-2024-01-12-_80_anos_de_Lia_de_Itamarac%C3%A1_-002_Romerito_Pontes_%2853465907075%29.jpg/330px--2024-01-12-_80_anos_de_Lia_de_Itamarac%C3%A1_-002_Romerito_Pontes_%2853465907075%29.jpg'
  },
  {
    name: 'Luiz Gonzaga',
    sub: 'Rei do Baião (Exu, PE)',
    categoria: 'musica',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fd/Luiz_Gonzaga_1988.png/330px-Luiz_Gonzaga_1988.png'
  },
  {
    name: 'Luiz Inácio Lula da Silva',
    sub: 'Presidente do Brasil (Caetés, PE)',
    categoria: 'historia',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Foto_oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28ombros%29_denoise.jpg/330px-Foto_oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28ombros%29_denoise.jpg'
  },
  {
    name: 'Manuel Bandeira',
    sub: 'Poeta de "Evocação do Recife"',
    categoria: 'literatura',
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Manuel_Bandeira.jpg'
  },
  {
    name: 'Naná Vasconcelos',
    sub: 'Mestre do Berimbau e Marco Zero',
    categoria: 'musica',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7a/Nan%C3%A1_Vasconcelos_%28TV_Brasil%29.jpg/330px-Nan%C3%A1_Vasconcelos_%28TV_Brasil%29.jpg'
  },
  {
    name: 'Paulo Freire',
    sub: 'Educador da Casa Amarela',
    categoria: 'historia',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/be/Paulo_Freire_1977.jpg/330px-Paulo_Freire_1977.jpg'
  },
  {
    name: 'Reginaldo Rossi',
    sub: 'O Rei do Brega Recifense',
    categoria: 'musica',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/70/Reginaldo_Rossi_na_pra%C3%A7a_Castro_Alves_%28cropped%29.jpg/330px-Reginaldo_Rossi_na_pra%C3%A7a_Castro_Alves_%28cropped%29.jpg'
  },
  {
    name: 'Sombrinha de Frevo',
    sub: 'Patrimônio & Símbolo do Carnaval ☂️',
    categoria: 'simbolos',
    url: '/logo-sombrinha.jpg',
    fallbackUrl: '/logo-sombrinha.jpg'
  },
  {
    name: 'Tubarão de Boa Viagem',
    sub: 'Símbolo das Águas & Litoral 🦈',
    categoria: 'simbolos',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/White_shark.jpg/330px-White_shark.jpg',
    fallbackUrl: '/tubarao-recife.jpg'
  }
];

function CulturalAvatarSelector({ selectedUrl, onSelect }) {
  const [activeCategory, setActiveCategory] = useState('todas');

  const filtered = activeCategory === 'todas'
    ? AVATAR_PRESETS
    : AVATAR_PRESETS.filter(p => p.categoria === activeCategory);

  return (
    <div className="avatar-presets-wrap">
      <div className="avatar-presets-header">
        <div className="avatar-presets-label">
          <Sparkles size={14} color="var(--mangue)" />
          <span>Ícones & Símbolos de Pernambuco (A-Z):</span>
        </div>
        <div className="avatar-category-pills">
          <button
            type="button"
            className={`category-pill ${activeCategory === 'todas' ? 'active' : ''}`}
            onClick={() => setActiveCategory('todas')}
          >
            Todas ({AVATAR_PRESETS.length})
          </button>
          <button
            type="button"
            className={`category-pill ${activeCategory === 'musica' ? 'active' : ''}`}
            onClick={() => setActiveCategory('musica')}
          >
            Música
          </button>
          <button
            type="button"
            className={`category-pill ${activeCategory === 'literatura' ? 'active' : ''}`}
            onClick={() => setActiveCategory('literatura')}
          >
            Literatura
          </button>
          <button
            type="button"
            className={`category-pill ${activeCategory === 'historia' ? 'active' : ''}`}
            onClick={() => setActiveCategory('historia')}
          >
            Liderança
          </button>
          <button
            type="button"
            className={`category-pill ${activeCategory === 'simbolos' ? 'active' : ''}`}
            onClick={() => setActiveCategory('simbolos')}
          >
            Símbolos 🦈
          </button>
        </div>
      </div>

      <div className="avatar-presets-grid">
        {filtered.map((preset, idx) => {
          const isSelected = selectedUrl === preset.url;
          return (
            <button
              type="button"
              key={idx}
              className={`preset-cultural-card ${isSelected ? 'active' : ''}`}
              onClick={() => onSelect(preset.url)}
              title={`${preset.name} — ${preset.sub}`}
            >
              <div className="preset-cultural-avatar-frame">
                <img
                  src={preset.url}
                  alt={preset.name}
                  loading="lazy"
                  onError={(e) => {
                    if (preset.fallbackUrl) {
                      e.currentTarget.src = preset.fallbackUrl;
                    }
                  }}
                />
              </div>
              <div className="preset-cultural-info">
                <span className="preset-cultural-name">{preset.name}</span>
                <span className="preset-cultural-sub">{preset.sub}</span>
              </div>
              {isSelected && (
                <div className="preset-cultural-check">
                  <Check size={16} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const BAIRROS_RECIFE = [
  'Boa Vista',
  'São José',
  'Santo Antônio',
  'Santo Amaro',
  'Bairro do Recife',
  'Soledade',
  'Graças',
  'Espinheiro',
  'Aflitos',
  'Casa Amarela',
  'Casa Forte',
  'Jaqueira',
  'Madalena',
  'Torre',
  'Cordeiro',
  'Várzea',
  'Afogados',
  'Boa Viagem',
  'Pina',
  'Brasília Teimosa',
  'Outro Bairro do Recife'
];

export default function UserProfileModal({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onUpdateUser,
  onLogout
}) {
  if (!isOpen) return null;

  // Abas quando deslogado: 'login' | 'register'
  const [authTab, setAuthTab] = useState('login');

  // Modo quando logado: 'view' | 'edit'
  const [profileMode, setProfileMode] = useState('view');

  // Formulário de Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Formulário de Registro
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAvatar, setRegAvatar] = useState('');
  const [regBio, setRegBio] = useState('');
  const [regBairro, setRegBairro] = useState('Boa Vista');

  // Formulário de Edição
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editBairro, setEditBairro] = useState('Boa Vista');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Confirmação de Logout
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  // Estados de feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fileInputRef = useRef(null);

  // Sincroniza campos de edição ao abrir ou ao mudar de usuário
  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name || '');
      setEditEmail(currentUser.email || '');
      setEditAvatar(currentUser.avatar || '');
      setEditBio(currentUser.bio || '');
      setEditBairro(currentUser.bairro || 'Boa Vista');
      setProfileMode('view');
      setConfirmingLogout(false);
    } else {
      setProfileMode('view');
    }
    setErrorMsg('');
    setSuccessMsg('');
  }, [currentUser, isOpen]);

  // Utilitário para comprimir e redimensionar foto do usuário via Canvas
  const processImageFile = (file, callback) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor, selecione um arquivo de imagem válido (PNG, JPEG ou WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        callback(compressedBase64);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await api.login({ email: loginEmail, password: loginPassword });
      if (res && res.user) {
        onLoginSuccess(res.user);
        setSuccessMsg(res.mensagem || 'Login realizado com sucesso!');
        setTimeout(() => {
          setSuccessMsg('');
        }, 2000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Falha ao autenticar. Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await api.register({
        name: regName,
        email: regEmail,
        password: regPassword,
        avatar: regAvatar,
        bio: regBio,
        bairro: regBairro
      });
      if (res && res.user) {
        onLoginSuccess(res.user);
        setSuccessMsg(res.mensagem || 'Conta criada com sucesso!');
        setTimeout(() => {
          setSuccessMsg('');
        }, 2000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao criar conta. Verifique os dados informados.');
    } finally {
      setLoading(false);
    }
  };

  const handleMariaLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await api.login({ email: 'maria.barreto@sombrinha.recife.br', password: 'recife123' });
      if (res && res.user) {
        onLoginSuccess(res.user);
        setSuccessMsg('Conectado como Maria Barreto (Desenvolvedora)');
      }
    } catch (err) {
      setErrorMsg('Falha ao entrar com a conta da desenvolvedora.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await api.login({ email: 'charles@sombrinha.recife.br', password: 'recife123' });
      if (res && res.user) {
        onLoginSuccess(res.user);
        setSuccessMsg('Conectado como Charles Magno (Conta Demonstrativa)');
      }
    } catch (err) {
      setErrorMsg('Falha ao entrar com a conta demo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const payload = {
        name: editName,
        email: editEmail,
        avatar: editAvatar,
        bio: editBio,
        bairro: editBairro
      };

      if (showPasswordChange && newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      const res = await api.updateProfile(payload);
      if (res && res.user) {
        onUpdateUser(res.user);
        setSuccessMsg('Perfil atualizado com sucesso!');
        setShowPasswordChange(false);
        setCurrentPassword('');
        setNewPassword('');
        setTimeout(() => {
          setProfileMode('view');
          setSuccessMsg('');
        }, 1500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteLogout = async () => {
    setLoading(true);
    try {
      await api.logout();
      onLogout();
      setConfirmingLogout(false);
      setAuthTab('login');
      setSuccessMsg('Você saiu da sua conta.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'S';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-profile-title"
    >
      <div
        className="modal-dialog user-profile-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px' }}
      >
        {/* Cabeçalho do Modal */}
        <div className="user-profile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="user-profile-badge-icon">
              <User size={20} color="var(--mangue)" />
            </div>
            <div>
              <h2 id="user-profile-title" style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: 'var(--ink-principal)' }}>
                {currentUser
                  ? (profileMode === 'edit' ? 'Editar Perfil Cidadão' : 'Perfil da Conta')
                  : 'Conta Sombrinha'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--ink-secundario)', margin: '2px 0 0 0' }}>
                {currentUser
                  ? (profileMode === 'edit' ? 'Altere seus dados, foto e preferências locais' : 'Sua identidade comunitária no Recife')
                  : 'Acesse para registrar relatos com sua identificação'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              color: 'var(--ink-secundario)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Mensagens de feedback */}
        {errorMsg && (
          <div className="profile-alert profile-alert-error" role="alert">
            <AlertCircle size={17} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="profile-alert profile-alert-success" role="alert">
            <Check size={17} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* =========================================================================
            CASO 1: USUÁRIO NÃO ESTÁ LOGADO (LOGIN / CADASTRO)
            ========================================================================= */}
        {!currentUser && (
          <div className="auth-container">
            {/* Seletor de Abas: Entrar vs Criar Conta */}
            <div className="auth-tab-group">
              <button
                type="button"
                className={`auth-tab-btn ${authTab === 'login' ? 'active' : ''}`}
                onClick={() => { setAuthTab('login'); setErrorMsg(''); }}
              >
                Entrar na Conta
              </button>
              <button
                type="button"
                className={`auth-tab-btn ${authTab === 'register' ? 'active' : ''}`}
                onClick={() => { setAuthTab('register'); setErrorMsg(''); }}
              >
                Criar Nova Conta
              </button>
            </div>

            {/* ABA 1: LOGIN */}
            {authTab === 'login' && (
              <form onSubmit={handleLogin} className="profile-form">
                <div className="form-group">
                  <label>E-mail</label>
                  <div className="input-with-icon">
                    <Mail size={16} className="field-icon" />
                    <input
                      type="email"
                      required
                      placeholder="ex: seuemail@recife.pe.gov.br"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Senha</label>
                  <div className="input-with-icon">
                    <Key size={16} className="field-icon" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary-cívico"
                  style={{ width: '100%', marginTop: '6px' }}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>

                <div className="auth-demo-divider">
                  <span>ou acesso rápido</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleMariaLogin}
                    disabled={loading}
                    className="btn-demo-account"
                    style={{
                      border: '1.5px solid var(--pe-azul)',
                      background: '#f0f7ff',
                      color: 'var(--pe-azul)',
                      fontWeight: 700
                    }}
                    title="Entrar como Maria Barreto (Desenvolvedora do Sombrinha)"
                  >
                    <Sparkles size={16} color="var(--pe-azul)" />
                    <span>Acessar como Maria Barreto (Desenvolvedora)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    disabled={loading}
                    className="btn-demo-account"
                    title="Entrar com a conta pré-configurada de Charles Magno"
                  >
                    <Sparkles size={16} color="var(--mangue)" />
                    <span>Acessar como Charles Magno (Validador Demo)</span>
                  </button>
                </div>
              </form>
            )}

            {/* ABA 2: CRIAR CONTA */}
            {authTab === 'register' && (
              <form onSubmit={handleRegister} className="profile-form">
                <div className="form-group">
                  <label>Nome Completo</label>
                  <div className="input-with-icon">
                    <User size={16} className="field-icon" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Maria José da Silva"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>E-mail</label>
                  <div className="input-with-icon">
                    <Mail size={16} className="field-icon" />
                    <input
                      type="email"
                      required
                      placeholder="seuemail@exemplo.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Senha de Acesso (mínimo 6 caracteres)</label>
                  <div className="input-with-icon">
                    <Key size={16} className="field-icon" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Bairro do Recife onde mora ou atua</label>
                  <select
                    value={regBairro}
                    onChange={(e) => setRegBairro(e.target.value)}
                    className="select-custom"
                  >
                    {BAIRROS_RECIFE.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* Foto de Perfil */}
                <div className="form-group">
                  <label>Foto de Perfil</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '4px' }}>
                    <div className="avatar-preview-box">
                      {regAvatar ? (
                        <img src={regAvatar} alt="Prévia da Foto" className="avatar-img-circle" />
                      ) : (
                        <span className="avatar-initials-circle">
                          {getInitials(regName || 'S')}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            processImageFile(file, (base64) => setRegAvatar(base64));
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn-upload-avatar"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera size={15} />
                        <span>{regAvatar ? 'Substituir Foto' : 'Carregar Foto'}</span>
                      </button>
                      {regAvatar && (
                        <button
                          type="button"
                          className="btn-clear-photo"
                          onClick={() => setRegAvatar('')}
                        >
                          <Trash2 size={13} />
                          <span>Remover</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Seletor Sincronizado e Alinhado de Ícones Culturais de Pernambuco */}
                  <CulturalAvatarSelector
                    selectedUrl={regAvatar}
                    onSelect={(url) => setRegAvatar(url)}
                  />
                </div>

                <div className="form-group">
                  <label>Breve Descrição / Papel Comunitário (Opcional)</label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Usuária do BRT Conde da Boa Vista, ciclista e defensora de arborização."
                    value={regBio}
                    onChange={(e) => setRegBio(e.target.value)}
                    className="textarea-custom"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary-cívico"
                  style={{ width: '100%', marginTop: '6px' }}
                >
                  {loading ? 'Criando Conta...' : 'Cadastrar e Conectar'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* =========================================================================
            CASO 2: USUÁRIO ESTÁ LOGADO
            ========================================================================= */}
        {currentUser && (
          <div>
            {/* SUB-MODO: VISUALIZAÇÃO DO PERFIL */}
            {profileMode === 'view' && (
              <div className="profile-view-container">
                {/* Cartão de Perfil */}
                <div className="profile-identity-card">
                  <div className="profile-avatar-wrapper">
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="profile-large-avatar"
                      />
                    ) : (
                      <div className="profile-large-initials">
                        {getInitials(currentUser.name)}
                      </div>
                    )}
                    <span className="profile-status-dot" title="Conta Conectada" />
                  </div>

                  <div className="profile-identity-details">
                    <h3 className="profile-identity-name">{currentUser.name}</h3>
                    <div className="profile-identity-row">
                      <Mail size={14} color="var(--ink-suave)" />
                      <span>{currentUser.email}</span>
                    </div>
                    {currentUser.bairro && (
                      <div className="profile-identity-row">
                        <MapPin size={14} color="var(--terracota)" />
                        <span style={{ fontWeight: 600 }}>{currentUser.bairro}, Recife</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio / Apresentação comunitária */}
                {currentUser.bio && (
                  <div className="profile-bio-box">
                    <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--ink-principal)', lineHeight: 1.5 }}>
                      "{currentUser.bio}"
                    </p>
                  </div>
                )}

                {/* Badges / Selos Cívicos */}
                <div className="profile-badges-row">
                  <div className="profile-badge-pill">
                    <ShieldCheck size={14} color="var(--mangue)" />
                    <span>Cidadão Verificado</span>
                  </div>
                  <div className="profile-badge-pill">
                    <Clock size={14} color="var(--capibaribe)" />
                    <span>Membro da Rede Sombrinha</span>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="profile-actions-stack">
                  <button
                    type="button"
                    className="btn-edit-profile"
                    onClick={() => setProfileMode('edit')}
                  >
                    <Edit3 size={17} />
                    <span>Editar Perfil & Foto</span>
                  </button>

                  {!confirmingLogout ? (
                    <button
                      type="button"
                      className="btn-logout-trigger"
                      onClick={() => setConfirmingLogout(true)}
                    >
                      <LogOut size={16} />
                      <span>Sair da Conta</span>
                    </button>
                  ) : (
                    <div className="logout-confirm-box">
                      <p style={{ margin: 0, fontSize: '0.84rem', fontWeight: 600, color: 'var(--alerta-calor)' }}>
                        Deseja realmente encerrar a sessão?
                      </p>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button
                          type="button"
                          className="btn-logout-confirm"
                          onClick={handleExecuteLogout}
                          disabled={loading}
                        >
                          {loading ? 'Saindo...' : 'Sim, Sair da Conta'}
                        </button>
                        <button
                          type="button"
                          className="btn-logout-cancel"
                          onClick={() => setConfirmingLogout(false)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB-MODO: EDIÇÃO DO PERFIL */}
            {profileMode === 'edit' && (
              <form onSubmit={handleSaveProfile} className="profile-form">
                {/* Alteração da Foto de Perfil */}
                <div className="form-group" style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <div className="profile-avatar-wrapper" style={{ margin: '0 auto 10px auto' }}>
                    {editAvatar ? (
                      <img src={editAvatar} alt="Prévia" className="profile-large-avatar" />
                    ) : (
                      <div className="profile-large-initials">
                        {getInitials(editName || currentUser.name)}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          processImageFile(file, (base64) => setEditAvatar(base64));
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn-upload-avatar"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera size={15} />
                      <span>{editAvatar ? 'Alterar Foto' : 'Carregar Foto'}</span>
                    </button>

                    {editAvatar && (
                      <button
                        type="button"
                        className="btn-clear-photo"
                        onClick={() => setEditAvatar('')}
                      >
                        <Trash2 size={13} />
                        <span>Remover</span>
                      </button>
                    )}
                  </div>

                  {/* Seletor Sincronizado e Alinhado de Ícones Culturais de Pernambuco */}
                  <CulturalAvatarSelector
                    selectedUrl={editAvatar}
                    onSelect={(url) => setEditAvatar(url)}
                  />
                </div>

                <div className="form-group">
                  <label>Nome Completo</label>
                  <div className="input-with-icon">
                    <User size={16} className="field-icon" />
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>E-mail</label>
                  <div className="input-with-icon">
                    <Mail size={16} className="field-icon" />
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Bairro do Recife</label>
                  <select
                    value={editBairro}
                    onChange={(e) => setEditBairro(e.target.value)}
                    className="select-custom"
                  >
                    {BAIRROS_RECIFE.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Bio / Descrição Comunitária</label>
                  <textarea
                    rows={2}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Conte sobre sua atuação ou bairro..."
                    className="textarea-custom"
                  />
                </div>

                {/* Alterar Senha (Opcional) */}
                <div style={{ marginTop: '8px', borderTop: '1px solid var(--linha-suave)', paddingTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--mangue)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 0'
                    }}
                  >
                    <Key size={14} />
                    <span>{showPasswordChange ? 'Cancelar Alteração de Senha' : 'Deseja alterar sua senha?'}</span>
                  </button>

                  {showPasswordChange && (
                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div className="form-group">
                        <label>Senha Atual</label>
                        <input
                          type="password"
                          placeholder="Sua senha atual"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="input-custom"
                        />
                      </div>
                      <div className="form-group">
                        <label>Nova Senha (mínimo 6 caracteres)</label>
                        <input
                          type="password"
                          minLength={6}
                          placeholder="Nova senha segura"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="input-custom"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Botões Salvar / Cancelar */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary-cívico"
                    style={{ flex: 1 }}
                  >
                    {loading ? 'Salvando...' : 'Salvar Perfil'}
                  </button>
                  <button
                    type="button"
                    className="btn-cancelar-edicao"
                    onClick={() => {
                      setProfileMode('view');
                      setErrorMsg('');
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
