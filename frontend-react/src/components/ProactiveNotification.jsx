import React, { useState, useEffect } from 'react';
import { AlertTriangle, Navigation, Droplets, MapPin, X, ChevronRight } from 'lucide-react';
import { api } from '../services/api';

export default function ProactiveNotification({ weather, onSelectPoint, onLocationDetected }) {
  const [coords, setCoords] = useState(null);
  const [proximityData, setProximityData] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [geoError, setGeoError] = useState(null);

  useEffect(() => {
    // 1. Solicita a localização do usuário ao entrar
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ latitude, longitude });
          if (onLocationDetected) {
            onLocationDetected({ latitude, longitude });
          }

          // 2. Avalia proximidade com o Centro do Recife
          const data = await api.checkProximity(latitude, longitude);
          if (data) {
            setProximityData(data);

            // 3. Notificação nativa se permitido
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(data.notificacao_proativa.titulo, {
                body: data.notificacao_proativa.mensagem,
                icon: 'https://cdn-icons-png.flaticon.com/512/869/869869.png'
              });
            } else if ('Notification' in window && Notification.permission !== 'denied') {
              Notification.requestPermission();
            }
          }
        },
        (err) => {
          console.warn('Geolocalização não autorizada ou indisponível:', err.message);
          setGeoError(err.message);
          // Fallback: simula localização central no Derby para fins de demonstração
          api.checkProximity(-8.0567, -34.8998).then(setProximityData);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  if (dismissed || !proximityData) return null;

  const notif = proximityData.notificacao_proativa;
  const maisProximo = proximityData.pontos_frescor_proximos?.[0];

  return (
    <aside className="proactive-alert" role="alert" aria-live="assertive">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={26} aria-hidden="true" />
          <strong style={{ fontSize: '1.15rem' }}>{notif.titulo}</strong>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          style={{ background: 'transparent', color: 'white', padding: '4px', minHeight: 'auto' }}
          aria-label="Dispensar alerta"
        >
          <X size={20} />
        </button>
      </div>

      <p style={{ marginTop: '8px', fontSize: '0.95rem', lineHeight: 1.45 }}>
        {notif.mensagem}
      </p>

      {/* Condições meteorológicas ao vivo no Centro */}
      {weather && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap', fontSize: '0.85rem' }}>
          <span style={{ background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: '20px' }}>
            🌡️ Temp: {weather.temperature_c}°C (Sensação {weather.feels_like_c}°C)
          </span>
          <span style={{ background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: '20px' }}>
            ☀️ Índice UV: {weather.uv_index || 11} (Extremo)
          </span>
          <span style={{ background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: '20px' }}>
            💧 Umidade: {weather.relative_humidity_percent || 70}%
          </span>
        </div>
      )}

      {/* Ponto de Água Mais Próximo */}
      {maisProximo && (
        <div
          style={{
            marginTop: '12px',
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '10px',
            padding: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>💧 PONTO DE ÁGUA MAIS PRÓXIMO:</div>
            <strong style={{ fontSize: '1rem' }}>{maisProximo.nome}</strong>
            <div style={{ fontSize: '0.85rem' }}>
              📍 {maisProximo.bairro} • ~{maisProximo.distancia_metros} metros (~{maisProximo.tempo_a_pe_min} min a pé)
            </div>
          </div>
          {onSelectPoint && (
            <button
              type="button"
              onClick={() => onSelectPoint(maisProximo)}
              style={{ background: 'white', color: '#dc2626', fontSize: '0.85rem', padding: '6px 12px', minHeight: '36px' }}
            >
              Ver no Mapa <ChevronRight size={16} />
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
