import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Compass, Layers, Droplet, TreePine, Flame, Recycle, MapPin, Maximize2, Minimize2, Bus } from 'lucide-react';
import { api } from '../services/api';

// Ícone de Parada de Ônibus / Estação BRT Climatizada com Ar e Proteção Solar
const busAcIcon = L.divIcon({
  className: 'custom-bus-ac-marker',
  html: `
    <div style="width: 32px; height: 32px; border-radius: 50%; background: #0284c7; border: 2.5px solid #ffffff; box-shadow: 0 3px 8px rgba(2, 132, 199, 0.45); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 15px; cursor: pointer; position: relative;">
      🚌
      <span style="position: absolute; top: -3px; right: -3px; width: 15px; height: 15px; border-radius: 50%; background: #06b6d4; border: 1.5px solid #ffffff; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #ffffff;">❄️</span>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -18]
});

// Ícone Cultural Autêntico: Sombrinha de Frevo de Pernambuco (limpo e sem rótulo fixo)
const frevoUmbrellaIcon = L.divIcon({
  className: 'custom-frevo-marker',
  html: `
    <div style="width: 34px; height: 44px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; cursor: pointer; pointer-events: none;">
      <!-- Sombrinha de Frevo de Pernambuco (4 Cores Clássicas) -->
      <svg width="34" height="38" viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35)); pointer-events: none;">
        <!-- Gomo 1: Verde Mangue -->
        <path d="M50 15 C34 16 20 28 12 50 C22 53 32 53 40 51 L50 15Z" fill="#16a34a" stroke="#ffffff" stroke-width="2"/>
        <!-- Gomo 2: Vermelho Frevo -->
        <path d="M50 15 L40 51 C44 52 47 52 50 52 L50 15Z" fill="#dc2626" stroke="#ffffff" stroke-width="2"/>
        <!-- Gomo 3: Amarelo Solar -->
        <path d="M50 15 L50 52 C53 52 56 52 60 51 L50 15Z" fill="#facc15" stroke="#ffffff" stroke-width="2"/>
        <!-- Gomo 4: Azul Capibaribe -->
        <path d="M50 15 L60 51 C68 53 78 53 88 50 C80 28 66 16 50 15Z" fill="#0284c7" stroke="#ffffff" stroke-width="2"/>
        <!-- Ponteira Superior Dourada -->
        <circle cx="50" cy="14" r="4" fill="#fef08a" stroke="#78350f" stroke-width="1.5"/>
        <!-- Haste e Cabo de Madeira encurvado em J -->
        <path d="M50 52 L50 88 C50 96 42 98 38 94 C34 90 36 84 40 84" stroke="#78350f" stroke-width="5" stroke-linecap="round"/>
        <line x1="50" y1="15" x2="50" y2="52" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.9"/>
      </svg>
      <!-- Ponto de Identificação / Pino Geográfico na Base -->
      <div style="width: 8px; height: 8px; border-radius: 50%; background: #16a34a; border: 2px solid #ffffff; box-shadow: 0 0 0 2px #facc15; margin-top: -2px; pointer-events: none;"></div>
    </div>
  `,
  iconSize: [34, 44],
  iconAnchor: [17, 44],
  popupAnchor: [0, -46]
});

// Regiões de Recife e RMR para navegação rápida
export const REGIOES = [
  { id: 'TODAS', label: 'Toda a Região Metropolitana', center: [-8.055, -34.895], zoom: 12 },
  { id: 'Centro', label: 'Centro', center: [-8.062, -34.881], zoom: 14 },
  { id: 'Zona Norte', label: 'Zona Norte', center: [-8.032, -34.915], zoom: 13 },
  { id: 'Zona Sul', label: 'Zona Sul', center: [-8.120, -34.900], zoom: 13 },
  { id: 'Zona Oeste', label: 'Zona Oeste', center: [-8.065, -34.945], zoom: 13 },
  { id: 'Olinda & RMR', label: 'Olinda & RMR', center: [-8.020, -34.860], zoom: 13 },
];

export default function MapSection({
  heatCorridors: propHeatCorridors,
  coolingStations: propCoolingStations,
  referencePoints: propReferencePoints,
  communityReports = [],
  userCoords,
  userLocation,
  focusedPoint = null,
  onRegionSelect = null
}) {
  const [internalHeat, setInternalHeat] = useState([]);
  const [internalCooling, setInternalCooling] = useState([]);
  const [internalRefPoints, setInternalRefPoints] = useState([]);

  useEffect(() => {
    if (!propHeatCorridors || !propCoolingStations) {
      api.getHeatIslandsStudy().then((study) => {
        if (study) {
          if (!propHeatCorridors && study.corredores_criticos_calor) {
            setInternalHeat(study.corredores_criticos_calor);
          }
          if (!propCoolingStations && study.pontos_recomendados_alivio) {
            setInternalCooling(study.pontos_recomendados_alivio);
          }
        }
      }).catch(() => null);
    }

    if (!propReferencePoints) {
      api.getReferencePoints().then((pts) => {
        if (pts) setInternalRefPoints(pts);
      }).catch(() => null);
    }
  }, [propHeatCorridors, propCoolingStations, propReferencePoints]);

  const heatCorridors = propHeatCorridors || internalHeat;
  const coolingStations = propCoolingStations || internalCooling;
  const referencePoints = propReferencePoints || internalRefPoints;
  const activeUserCoords = userCoords || userLocation;

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({
    heatCorridors: null,
    coolingStations: null,
    referencePoints: null,
    communityReports: null,
    userLocation: null
  });

  const [activeFilter, setActiveFilter] = useState('TODOS');
  const [activeRegion, setActiveRegion] = useState('TODAS');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  // Tecla ESC para sair de tela cheia
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Redimensiona o mapa no Leaflet ao entrar/sair de tela cheia
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  const handleSelectRegion = (regId) => {
    setActiveRegion(regId);
    const reg = REGIOES.find((r) => r.id === regId);
    if (reg && mapInstanceRef.current) {
      mapInstanceRef.current.setView(reg.center, reg.zoom);
    }
    if (onRegionSelect && reg) {
      onRegionSelect(reg);
    }
  };

  // 1. Inicializa o mapa com ArcGIS (Esri) World Street Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current).setView([-8.055, -34.895], 12);

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, TomTom'
      }
    ).addTo(map);

    layersRef.current.heatCorridors = L.layerGroup().addTo(map);
    layersRef.current.coolingStations = L.layerGroup().addTo(map);
    layersRef.current.referencePoints = L.layerGroup().addTo(map);
    layersRef.current.communityReports = L.layerGroup().addTo(map);
    layersRef.current.userLocation = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    const handleResize = () => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    };
    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 200);

    return () => {
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Renderiza Pontos Cívicos no Mapa
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const {
      heatCorridors: heatLayer,
      coolingStations: coolLayer,
      referencePoints: refLayer,
      communityReports: commLayer,
      userLocation: userLayer
    } = layersRef.current;

    if (heatLayer) heatLayer.clearLayers();
    if (coolLayer) coolLayer.clearLayers();
    if (refLayer) refLayer.clearLayers();
    if (commLayer) commLayer.clearLayers();
    if (userLayer) userLayer.clearLayers();

    // 2.1 Corredores Críticos de Calor
    if (heatLayer && (activeFilter === 'TODOS' || activeFilter === 'HEAT')) {
      heatCorridors.forEach((corr) => {
        if (!corr.coordenadas_trajeto || corr.coordenadas_trajeto.length === 0) return;
        const polyline = L.polyline(corr.coordenadas_trajeto, {
          color: '#dc2626',
          weight: 6,
          opacity: 0.85,
          dashArray: '8, 8'
        });

        const popup = `
          <div style="font-family: -apple-system, sans-serif; font-size: 13px; min-width: 220px; line-height: 1.4;">
            <strong style="color: #dc2626; font-size: 14px;">🔥 ${corr.nome}</strong><br>
            <div style="margin: 4px 0; color: #475569;">${corr.bairro || 'Recife'} · <em>${corr.nivel_risco || 'Crítico'}</em></div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px; border-radius: 4px; margin: 4px 0;">
              <div><strong>Sensação:</strong> ${corr.sensacao_termica_pico_c || '46'}°C</div>
              <div><strong>Causa:</strong> ${corr.motivo_calor || 'Ausência de arborização'}</div>
            </div>
            <p style="margin: 4px 0 0; font-size: 12px; color: #334155;">${corr.recomendacao_pedestre || 'Procure abrigo imediato.'}</p>
          </div>
        `;
        polyline.bindPopup(popup);
        heatLayer.addLayer(polyline);
      });
    }

    // 2.2 Pontos de Referência Cívicos e Sombrinhas de Frevo
    if (refLayer) {
      referencePoints.forEach((pt) => {
        const isShade = pt.tipo === 'sombra';
        const isWater = pt.tipo === 'bebedouro';
        const isEco = pt.tipo === 'ecoponto';
        const isBusAc = pt.subtipo === 'onibus_ar' || pt.ar_condicionado || pt.climatizado;

        if (activeFilter === 'BUS_AC' && !isBusAc) return;
        if (activeFilter === 'SHADE' && !isShade) return;
        if (activeFilter === 'WATER' && !isWater) return;
        if (activeFilter === 'HEAT' && (isShade || isWater || isEco || isBusAc)) return;

        let marker;
        if (isBusAc) {
          marker = L.marker([pt.latitude, pt.longitude], { icon: busAcIcon });
        } else if (isShade) {
          marker = L.marker([pt.latitude, pt.longitude], { icon: frevoUmbrellaIcon });
        } else {
          const corPino = isWater ? '#0284c7' : '#c2410c';
          const pinoIcon = L.divIcon({
            className: 'custom-pino-marker',
            html: `
              <div style="width: 24px; height: 24px; border-radius: 50%; background: ${corPino}; border: 2px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 11px; font-weight: bold;">
                ${isWater ? '💧' : '♻️'}
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
          marker = L.marker([pt.latitude, pt.longitude], { icon: pinoIcon });
        }

        let popupContent;
        if (isBusAc) {
          popupContent = `
            <div style="font-family: -apple-system, sans-serif; font-size: 13px; min-width: 230px; line-height: 1.4;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-size: 11px; font-weight: 700; background: #e0f2fe; color: #0284c7; padding: 2px 7px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;">
                  🚌 Ponto c/ Ar
                </span>
                <span style="font-size: 11px; font-weight: 700; background: #ecfdf5; color: #059669; padding: 2px 7px; border-radius: 4px; display: inline-flex; align-items: center; gap: 3px;">
                  ❄️ Climatizado
                </span>
              </div>
              <h4 style="margin: 0 0 4px 0; color: #0f172a; font-size: 14px; font-weight: 700;">${pt.nome}</h4>
              <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">
                📍 ${pt.bairro || 'Recife'} ${pt.endereco ? `· ${pt.endereco}` : ''}
              </div>
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #334155; line-height: 1.4;">
                ${pt.descricao || 'Ponto de ônibus com cobertura protetora contra o sol e ar-condicionado.'}
              </p>
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 4px 8px; font-size: 11px; color: #166534; font-weight: 600;">
                ✨ Refúgio térmico urbano com sombra e climatização ativa
              </div>
            </div>
          `;
        } else {
          popupContent = `
            <div style="font-family: -apple-system, sans-serif; font-size: 13px; min-width: 200px; line-height: 1.4;">
              <h4 style="margin: 0 0 4px 0; color: #0f172a; font-size: 14px;">${pt.nome}</h4>
              <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">${pt.bairro || 'Recife'} · ${pt.tipo_rotulo || pt.tipo}</div>
              <p style="margin: 0; font-size: 12px; color: #334155;">${pt.descricao || 'Ponto verificado pela comunidade.'}</p>
            </div>
          `;
        }
        marker.bindPopup(popupContent);
        refLayer.addLayer(marker);
      });
    }

    // 2.3 Posição do Cidadão
    if (userLayer && activeUserCoords && activeUserCoords.latitude) {
      const userMarker = L.circleMarker([activeUserCoords.latitude, activeUserCoords.longitude], {
        radius: 8,
        fillColor: '#0284c7',
        color: '#ffffff',
        weight: 3,
        opacity: 1,
        fillOpacity: 1
      });
      userMarker.bindPopup('<strong>📍 Sua Localização Atual</strong><br>Calculando rotas de sombra e refúgio.');
      userLayer.addLayer(userMarker);
    }
  }, [heatCorridors, coolingStations, referencePoints, communityReports, activeUserCoords, activeFilter, activeRegion]);

  // 3. Centraliza no ponto focado
  useEffect(() => {
    if (!mapInstanceRef.current || !focusedPoint) return;
    mapInstanceRef.current.setView([focusedPoint.latitude, focusedPoint.longitude], 16, { animate: true });
  }, [focusedPoint]);

  const sombrasTotalCount = referencePoints.filter((pt) => pt.tipo === 'sombra').length;
  const busAcCount = referencePoints.filter((pt) => pt.subtipo === 'onibus_ar' || pt.ar_condicionado || pt.climatizado).length;

  return (
    <section className={`painel-secao painel-mapa-principal ${isFullscreen ? 'mapa-em-tela-cheia' : ''}`} aria-label="Mapa Territorial de Sombras e Frescor">
      <div className="painel-header">
        <div>
          <h2 className="painel-titulo">
            <Compass size={20} color="var(--capibaribe)" />
            <span>Mapa de Sombras, Parques & Alívio Térmico</span>
          </h2>
          <p className="painel-subtitulo">
            Cartografia territorial com sombrinhas de frevo nos parques, paradas de ônibus climatizadas, bebedouros e ecopontos no Recife e RMR.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge-tecnologia-mapa">
            <span>Rotas & Apoio</span>
          </span>

          {/* Botão de Tela Cheia */}
          <button
            type="button"
            className={`btn-tela-cheia ${isFullscreen ? 'ativo' : ''}`}
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Sair da tela cheia (ESC)' : 'Expandir mapa em tela cheia'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            <span>{isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}</span>
          </button>
        </div>
      </div>

      {/* Filtros de Camada Cívica */}
      <div className="filtros-mapa" role="tablist">
        <button
          type="button"
          className={`pilula-filtro ${activeFilter === 'TODOS' ? 'ativa' : ''}`}
          onClick={() => setActiveFilter('TODOS')}
        >
          <Layers size={14} /> Todos os Pontos
        </button>
        <button
          type="button"
          className={`pilula-filtro ${activeFilter === 'SHADE' ? 'ativa' : ''}`}
          onClick={() => setActiveFilter('SHADE')}
        >
          <TreePine size={14} color="var(--mangue)" /> Sombras ({sombrasTotalCount})
        </button>
        <button
          type="button"
          className={`pilula-filtro ${activeFilter === 'BUS_AC' ? 'ativa' : ''}`}
          onClick={() => setActiveFilter('BUS_AC')}
        >
          <Bus size={14} color="var(--capibaribe)" /> Paradas c/ Ar ({busAcCount})
        </button>
        <button
          type="button"
          className={`pilula-filtro ${activeFilter === 'HEAT' ? 'ativa' : ''}`}
          onClick={() => setActiveFilter('HEAT')}
        >
          <Flame size={14} color="var(--alerta-calor)" /> Ruas Críticas (5)
        </button>
        <button
          type="button"
          className={`pilula-filtro ${activeFilter === 'WATER' ? 'ativa' : ''}`}
          onClick={() => setActiveFilter('WATER')}
        >
          <Droplet size={14} color="var(--capibaribe)" /> Bebedouros (5)
        </button>
      </div>

      {/* Navegação por Região */}
      <div style={{ marginTop: '8px', marginBottom: '4px' }}>
        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--ink-suave)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
          Explorar por Região:
        </div>
        <div className="filtros-mapa" role="tablist" style={{ paddingBottom: '4px' }}>
          {REGIOES.map((reg) => (
            <button
              key={reg.id}
              type="button"
              className={`pilula-filtro ${activeRegion === reg.id ? 'ativa' : ''}`}
              onClick={() => handleSelectRegion(reg.id)}
              style={{ fontSize: '0.8rem', padding: '5px 12px', minHeight: '32px' }}
            >
              {reg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Elemento do Mapa ArcGIS Street */}
      <div id="map-street-container" className="mapa-canvas-principal" ref={mapContainerRef} role="region" aria-label="Mapa Territorial Interativo"></div>

      {/* Legenda do Mapa */}
      <div className="legenda-mapa">
        <span className="legenda-item">
          <span className="legenda-ponto" style={{ background: '#059669' }}></span>
          <span><strong>Sombras:</strong> Parques e Refúgios Naturais</span>
        </span>
        <span className="legenda-item">
          <span className="legenda-ponto" style={{ background: '#0284c7' }}></span>
          <span><strong>Paradas c/ Ar (🚌❄️):</strong> Abrigos Climatizados & BRT</span>
        </span>
        <span className="legenda-item">
          <span className="legenda-ponto" style={{ background: '#dc2626' }}></span>
          <span><strong>Vermelho:</strong> Ruas Críticas de Calor</span>
        </span>
        <span className="legenda-item">
          <span className="legenda-ponto" style={{ background: '#0284c7' }}></span>
          <span><strong>Azul:</strong> Bebedouros Públicos</span>
        </span>
        <span className="legenda-item">
          <span className="legenda-ponto" style={{ background: '#c2410c' }}></span>
          <span><strong>Âmbar:</strong> Ecopontos</span>
        </span>
      </div>
    </section>
  );
}
