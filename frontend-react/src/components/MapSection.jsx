import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Compass, Layers, Droplet, TreePine, Flame, Recycle, MapPin } from 'lucide-react';
import { api } from '../services/api';

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

    // 2. Pontos Estratégicos Recomendados para Água Gratuita e Refrigeração (Azul Celeste)
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
            <span style="color: #059669; font-weight: bold;">Status: ${s.status}</span>
          </div>
        `);
        coolingLayer.addLayer(marker);
      });
    }

    // 3. Pontos de Sombra / Ecopontos Verificados
    if (activeFilter === 'TODOS' || activeFilter === 'SHADE') {
      referencePoints.forEach((pt) => {
        const cor = pt.tipo === 'sombra' ? '#059669' : pt.tipo === 'bebedouro' ? '#0284c7' : '#d97706';
        const icone = pt.tipo === 'sombra' ? '🌳' : pt.tipo === 'bebedouro' ? '💧' : '♻️';
        const marker = L.circleMarker([pt.latitude, pt.longitude], {
          radius: 8,
          color: '#ffffff',
          weight: 2,
          fillColor: cor,
          fillOpacity: 0.9
        });
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 13px;">
            <strong>${icone} ${pt.nome}</strong><br>
            <span>${pt.endereco}</span><br>
            <em>${pt.descricao}</em>
          </div>
        `);
        refLayer.addLayer(marker);
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

    // 5. Localização Atual do Usuário (se disponível)
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
    <section className="card-section" aria-label="Mapa Territorial de Frescor">
      <div className="card-title">
        <Compass size={22} color="var(--primary)" />
        <h2>Mapa das Ruas Mais Quentes & Pontos de Água</h2>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
        Identificação estratégica das <strong>ilhas de calor no Centro do Recife</strong> e das localizações prioritárias para instalação de bebedouros públicos e abrigos com refrigeração.
      </p>

      {/* Filtros em Pílulas */}
      <div className="tabs-scroll" role="tablist">
        <button
          type="button"
          className={`tab-pill ${activeFilter === 'TODOS' ? 'active' : ''}`}
          onClick={() => setActiveFilter('TODOS')}
        >
          <Layers size={14} /> Todos os Pontos
        </button>
        <button
          type="button"
          className={`tab-pill ${activeFilter === 'HEAT' ? 'active' : ''}`}
          onClick={() => setActiveFilter('HEAT')}
        >
          <Flame size={14} color="#dc2626" /> Ruas Mais Quentes (5)
        </button>
        <button
          type="button"
          className={`tab-pill ${activeFilter === 'WATER' ? 'active' : ''}`}
          onClick={() => setActiveFilter('WATER')}
        >
          <Droplet size={14} color="#0284c7" /> Pontos de Água Gratuitos (5)
        </button>
        <button
          type="button"
          className={`tab-pill ${activeFilter === 'SHADE' ? 'active' : ''}`}
          onClick={() => setActiveFilter('SHADE')}
        >
          <TreePine size={14} color="#059669" /> Sombras & Ecopontos
        </button>
      </div>

      {/* Elemento do Mapa */}
      <div id="map-container" ref={mapContainerRef} role="region" aria-label="Mapa Interativo"></div>

      {/* Legenda de Cores */}
      <div style={{ marginTop: '12px', display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.82rem' }}>
        <span>🔴 <strong>Vermelho:</strong> Ruas Críticas / Ilhas de Calor</span>
        <span>🔵 <strong>Azul:</strong> Pontos de Água / Refrigeração</span>
        <span>🟢 <strong>Verde:</strong> Árvores & Sombras</span>
        <span>🟡 <strong>Amarelo:</strong> Ecopontos Solidários</span>
        <span>🔵 <strong>Ponto Azul Vivo:</strong> Sua Localização</span>
      </div>
    </section>
  );
}
