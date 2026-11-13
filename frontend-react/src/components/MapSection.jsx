import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Compass, Layers, Droplet, TreePine, Flame, Recycle, MapPin } from 'lucide-react';
import { api } from '../services/api';

// Ícone Cultural Autêntico: Sombrinha de Frevo de Pernambuco com Ponto de Identificação
const createFrevoUmbrellaIcon = (nome) => {
  const nomeCurto = (nome || 'Sombra')
    .replace(/ *\([^)]*\) */g, '')
    .trim();

  return L.divIcon({
    className: 'custom-frevo-marker',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); pointer-events: auto; cursor: pointer; user-select: none;">
        <!-- Pílula de Identificação do Ponto -->
        <div style="background: #0f3930; color: #ffffff; font-size: 10px; font-weight: 850; padding: 2px 7px; border-radius: 8px; border: 1.5px solid #facc15; box-shadow: 0 2px 6px rgba(0,0,0,0.35); white-space: nowrap; margin-bottom: 2px; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">
          ⛱️ ${nomeCurto}
        </div>

        <!-- Sombrinha de Frevo de Pernambuco (4 Cores Clássicas) -->
        <svg width="38" height="42" viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.4));">
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
        <div style="width: 10px; height: 10px; border-radius: 50%; background: #16a34a; border: 2.5px solid #ffffff; box-shadow: 0 0 0 3px #facc15; margin-top: -3px;"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -58]
  });
};

export default function MapSection({
  heatCorridors: propHeatCorridors,
  coolingStations: propCoolingStations,
  referencePoints: propReferencePoints,
  communityReports = [],
  userCoords,
  userLocation,
  focusedPoint = null
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

  // Inicializa o mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current).setView([-8.0601, -34.8819], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    layersRef.current.heatCorridors = L.layerGroup().addTo(map);
    layersRef.current.coolingStations = L.layerGroup().addTo(map);
    layersRef.current.referencePoints = L.layerGroup().addTo(map);
    layersRef.current.communityReports = L.layerGroup().addTo(map);
    layersRef.current.userLocation = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Atualiza as camadas no mapa
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const {
      heatCorridors: heatLayer,
      coolingStations: coolingLayer,
      referencePoints: refLayer,
      communityReports: reportLayer,
      userLocation: userLayer
    } = layersRef.current;

    heatLayer.clearLayers();
    coolingLayer.clearLayers();
    refLayer.clearLayers();
    reportLayer.clearLayers();
    userLayer.clearLayers();

    // 1. Ruas Mais Quentes (Ilhas de Calor - Marcadores vermelhos vibrantes)
    if (activeFilter === 'TODOS' || activeFilter === 'HEAT') {
      heatCorridors.forEach((c) => {
        const marker = L.circleMarker([c.coordenadas.latitude, c.coordenadas.longitude], {
          radius: 12,
          color: '#ffffff',
          weight: 2,
          fillColor: '#dc2626',
          fillOpacity: 0.85
        });
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 13px;">
            <strong style="color: #dc2626;">🔥 ${c.nome}</strong><br>
            <span style="font-size: 11px; font-weight: bold; background: #fee2e2; color: #dc2626; padding: 2px 6px; border-radius: 4px;">Temp Asfalto: ${c.temperatura_superficie_estimada}</span><br>
            <em>${c.motivo}</em><br>
            <div style="margin-top: 6px; font-weight: bold; color: #064e3b;">💧 Solução: ${c.solucao_recomendada}</div>
          </div>
        `);
        heatLayer.addLayer(marker);
      });
    }

    // 2. Pontos Estratégicos de Hidratação e Bebedouros (Azul Celeste)
    if (activeFilter === 'TODOS' || activeFilter === 'WATER') {
      coolingStations.forEach((s) => {
        const marker = L.circleMarker([s.latitude, s.longitude], {
          radius: 11,
          color: '#ffffff',
          weight: 2,
          fillColor: '#0284c7',
          fillOpacity: 0.95
        });
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 13px;">
            <strong style="color: #0284c7;">💧 ${s.nome}</strong><br>
            <strong>Capacidade:</strong> ${s.capacidade}<br>
            <strong>Atendimento:</strong> ${s.publico_alvo} (${s.bairro})<br>
            <span style="color: #059669; font-weight: bold;">Status: ${s.status || 'Ativo'}</span>
          </div>
        `);
        coolingLayer.addLayer(marker);
      });
    }

    // 3. Pontos de Sombra com SOMBRINHAS DE FREVO e Ecopontos
    if (activeFilter === 'TODOS' || activeFilter === 'SHADE') {
      referencePoints.forEach((pt) => {
        if (pt.tipo === 'sombra') {
          // Marcador exclusivo de Sombrinha de Frevo com ponto de identificação
          const marker = L.marker([pt.latitude, pt.longitude], {
            icon: createFrevoUmbrellaIcon(pt.nome)
          });
          marker.bindPopup(`
            <div style="font-family: sans-serif; font-size: 13px; line-height: 1.4;">
              <strong style="color: #0f3930; font-size: 14px;">⛱️ ${pt.nome}</strong><br>
              <span style="font-size: 11px; font-weight: bold; background: #dcfce7; color: #166534; padding: 2px 7px; border-radius: 4px; display: inline-block; margin: 4px 0;">
                Ponto de Sombra Natural
              </span><br>
              <div style="margin: 4px 0;">📍 <strong>Endereço:</strong> ${pt.endereco}</div>
              <em style="color: #4b635c; display: block; margin-top: 4px;">${pt.descricao}</em>
            </div>
          `);
          refLayer.addLayer(marker);
        } else {
          // Outros pontos (bebedouro / ecoponto)
          const cor = pt.tipo === 'bebedouro' ? '#0284c7' : '#d97706';
          const icone = pt.tipo === 'bebedouro' ? '💧' : '♻️';
          const marker = L.circleMarker([pt.latitude, pt.longitude], {
            radius: 9,
            color: '#ffffff',
            weight: 2,
            fillColor: cor,
            fillOpacity: 0.95
          });
          marker.bindPopup(`
            <div style="font-family: sans-serif; font-size: 13px;">
              <strong>${icone} ${pt.nome}</strong><br>
              <span>${pt.endereco}</span><br>
              <em>${pt.descricao}</em>
            </div>
          `);
          refLayer.addLayer(marker);
        }
      });
    }

    // 4. Relatos da Comunidade
    if (activeFilter === 'TODOS' || activeFilter === 'REPORTS') {
      communityReports.forEach((item) => {
        if (item.latitude === null || item.longitude === null) return;
        const color = item.priority >= 70 ? '#b54735' : item.priority >= 40 ? '#d58b21' : '#29785f';
        const marker = L.circleMarker([item.latitude, item.longitude], {
          radius: 7,
          color: '#ffffff',
          weight: 2,
          fillColor: color,
          fillOpacity: 0.8
        });
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 13px;">
            <strong>📌 ${item.location}</strong><br>
            ${item.count} relato(s) • Sinal: ${item.priority}/100<br>
            ${item.main_issue}
          </div>
        `);
        reportLayer.addLayer(marker);
      });
    }

    // 5. Localização Atual do Usuário
    if (activeUserCoords) {
      const lat = activeUserCoords.latitude || activeUserCoords.lat;
      const lon = activeUserCoords.longitude || activeUserCoords.lon;
      if (lat && lon) {
        const userMarker = L.circleMarker([lat, lon], {
          radius: 10,
          color: '#ffffff',
          weight: 3,
          fillColor: '#3b82f6',
          fillOpacity: 1
        });
        userMarker.bindPopup('<strong>📍 Você está aqui</strong>');
        userLayer.addLayer(userMarker);
      }
    }
  }, [heatCorridors, coolingStations, referencePoints, communityReports, activeUserCoords, activeFilter]);

  // Foco no ponto selecionado
  useEffect(() => {
    if (!mapInstanceRef.current || !focusedPoint) return;
    mapInstanceRef.current.setView([focusedPoint.latitude, focusedPoint.longitude], 16, { animate: true });
  }, [focusedPoint]);

  return (
    <section className="painel-secao" aria-label="Mapa Territorial de Frescor">
      <div className="painel-titulo">
        <Compass size={22} color="var(--rio-azul)" />
        <h2>Mapa das Ruas Mais Quentes & Pontos de Água</h2>
      </div>
      <p style={{ color: 'var(--ink-secundario)', fontSize: '0.92rem' }}>
        Identificação estratégica das <strong>ilhas de calor no Centro do Recife</strong> e das localizações prioritárias para instalação de bebedouros públicos e abrigos com refrigeração.
      </p>

      {/* Filtros em Pílulas */}
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
          className={`pilula-filtro ${activeFilter === 'HEAT' ? 'ativa' : ''}`}
          onClick={() => setActiveFilter('HEAT')}
        >
          <Flame size={14} color="#be123c" /> Ruas Mais Quentes (5)
        </button>
        <button
          type="button"
          className={`pilula-filtro ${activeFilter === 'WATER' ? 'ativa' : ''}`}
          onClick={() => setActiveFilter('WATER')}
        >
          <Droplet size={14} color="#0284c7" /> Pontos de Água Gratuitos (5)
        </button>
        <button
          type="button"
          className={`pilula-filtro ${activeFilter === 'SHADE' ? 'ativa' : ''}`}
          onClick={() => setActiveFilter('SHADE')}
        >
          <span>⛱️</span> Sombras
        </button>
      </div>

      {/* Elemento do Mapa */}
      <div id="map-container" ref={mapContainerRef} role="region" aria-label="Mapa Interativo"></div>

      {/* Legenda de Cores Cultural */}
      <div style={{ marginTop: '14px', display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '0.85rem' }}>
        <span>🔴 <strong>Vermelho:</strong> Ruas Críticas / Ilhas de Calor</span>
        <span>🔵 <strong>Azul:</strong> Bebedouros & Água Grátis</span>
        <span>⛱️ <strong>Sombras:</strong> Refúgios Arbóreos e Áreas Verdes</span>
        <span>🟡 <strong>Amarelo:</strong> Ecopontos</span>
        <span>🔵 <strong>Ponto Azul Vivo:</strong> Sua Posição Atual</span>
      </div>
    </section>
  );
}
