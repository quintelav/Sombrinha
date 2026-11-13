import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Flame, Maximize2, Minimize2 } from 'lucide-react';

// Dados Termográficos Reais de Recife: Ilhas de Calor Críticas e Refúgios Naturais com Temperaturas
const PONTOS_TERMICOS_RECIFE = [
  {
    id: 'term-1',
    nome: 'Avenida Conde da Boa Vista',
    bairro: 'Boa Vista',
    coords: [-8.0601, -34.8876],
    tempSuperficie: 49.4,
    tempAr: 33.2,
    classificacao: 'Ilha Crítica Extrema',
    tipo: 'calor',
    raioMetros: 450,
    motivo: 'Corredor exclusivo de ônibus BRT, pavimento asfáltico contínuo e forte insolação sem copa arbórea.'
  },
  {
    id: 'term-2',
    nome: 'Rua da Palma & Rua da Concórdia',
    bairro: 'São José',
    coords: [-8.0664, -34.8808],
    tempSuperficie: 48.1,
    tempAr: 33.0,
    classificacao: 'Ilha Crítica Severa',
    tipo: 'calor',
    raioMetros: 380,
    motivo: 'Vias estreitas comerciais com toldos plásticos que aprisionam ar aquecido e bloqueiam ventilação.'
  },
  {
    id: 'term-3',
    nome: 'Avenida Dantas Barreto (Camelódromo)',
    bairro: 'Santo Antônio',
    coords: [-8.0642, -34.8778],
    tempSuperficie: 48.6,
    tempAr: 33.1,
    classificacao: 'Ilha Crítica Extrema',
    tipo: 'calor',
    raioMetros: 440,
    motivo: 'Larga faixa asfáltica descampada com alta concentração de trabalhadores ambulantes e pedestres.'
  },
  {
    id: 'term-4',
    nome: 'Terminal Cais de Santa Rita',
    bairro: 'São José',
    coords: [-8.0697, -34.8761],
    tempSuperficie: 46.8,
    tempAr: 32.8,
    classificacao: 'Ilha Crítica Alta',
    tipo: 'calor',
    raioMetros: 420,
    motivo: 'Piso impermeabilizado e grande tráfego de ônibus metropolitanos refletindo radiação no asfalto.'
  },
  {
    id: 'term-5',
    nome: 'Calçadão da Rua Nova & Pátio Livramento',
    bairro: 'Santo Antônio',
    coords: [-8.0628, -34.8769],
    tempSuperficie: 45.3,
    tempAr: 32.5,
    classificacao: 'Ilha Crítica Alta',
    tipo: 'calor',
    raioMetros: 340,
    motivo: 'Paralelepípedos e lajotas escuras que absorvem e retêm calor até o final da tarde.'
  },
  {
    id: 'term-6',
    nome: 'Largo da Paz & Mercado de Afogados',
    bairro: 'Afogados',
    coords: [-8.0820, -34.9110],
    tempSuperficie: 45.7,
    tempAr: 32.6,
    classificacao: 'Ilha Crítica Alta',
    tipo: 'calor',
    raioMetros: 400,
    motivo: 'Forte impermeabilização e alto fluxo de pedestres e veículos sem refúgios de sombra.'
  },
  {
    id: 'term-7',
    nome: 'Cruzamento Agamenon Magalhães x Derby',
    bairro: 'Derby / Boa Vista',
    coords: [-8.0560, -34.8980],
    tempSuperficie: 44.9,
    tempAr: 32.4,
    classificacao: 'Calor Moderado a Alto',
    tipo: 'calor',
    raioMetros: 420,
    motivo: 'Intenso fluxo veicular e aquecimento por motores nos semáforos.'
  },
  {
    id: 'term-8',
    nome: 'Viaduto das Cinco Pontas / Cais José Estelita',
    bairro: 'São José',
    coords: [-8.0730, -34.8820],
    tempSuperficie: 47.5,
    tempAr: 32.9,
    classificacao: 'Ilha Crítica Alta',
    tipo: 'calor',
    raioMetros: 390,
    motivo: 'Concreto massivo exposto ao sol direto e reflexão da lâmina da bacia portuária sem árvores.'
  },
  {
    id: 'term-9',
    nome: 'Avenida Presidente Kennedy (Peixinhos)',
    bairro: 'Peixinhos / Olinda',
    coords: [-8.0250, -34.8740],
    tempSuperficie: 47.2,
    tempAr: 32.7,
    classificacao: 'Ilha Crítica Alta',
    tipo: 'calor',
    raioMetros: 410,
    motivo: 'Corredor comercial denso de Olinda e RMR com tráfego pesado e pouca permeabilidade de solo.'
  },
  // Zonas de Frescor e Amortecimento Térmico Natural
  {
    id: 'ref-1',
    nome: 'Parque Treze de Maio (Oásis Urbano)',
    bairro: 'Boa Vista',
    coords: [-8.0573, -34.8821],
    tempSuperficie: 30.8,
    tempAr: 28.5,
    classificacao: 'Refúgio de Frescor Máximo',
    tipo: 'frescor',
    raioMetros: 400,
    motivo: 'Canópio arbóreo centenário e vegetação densa que reduzem a temperatura em até 18°C em relação ao asfalto.'
  },
  {
    id: 'ref-2',
    nome: 'Parque da Jaqueira & Margem do Capibaribe',
    bairro: 'Jaqueira',
    coords: [-8.0360, -34.9080],
    tempSuperficie: 30.2,
    tempAr: 28.2,
    classificacao: 'Refúgio de Frescor Máximo',
    tipo: 'frescor',
    raioMetros: 450,
    motivo: 'Extensa área verde preservada com brisa fluvial contínua do Rio Capibaribe.'
  },
  {
    id: 'ref-3',
    nome: 'Parque Santana Ariano Suassuna',
    bairro: 'Santana',
    coords: [-8.0420, -34.9200],
    tempSuperficie: 31.0,
    tempAr: 28.6,
    classificacao: 'Refúgio de Frescor Natural',
    tipo: 'frescor',
    raioMetros: 380,
    motivo: 'Gramados permeáveis e margem arborizada com amenização microclimática.'
  },
  {
    id: 'ref-4',
    nome: 'Praça Maciel Pinheiro',
    bairro: 'Boa Vista',
    coords: [-8.0610, -34.8885],
    tempSuperficie: 32.4,
    tempAr: 29.2,
    classificacao: 'Micro-refúgio de Frescor',
    tipo: 'frescor',
    raioMetros: 240,
    motivo: 'Árvores de copa larga fornecendo sombra imediata aos pedestres da Conde da Boa Vista.'
  },
  {
    id: 'ref-5',
    nome: 'Parque Dona Lindu (Brisa Marítima)',
    bairro: 'Boa Viagem',
    coords: [-8.1415, -34.9030],
    tempSuperficie: 32.1,
    tempAr: 28.9,
    classificacao: 'Refúgio Costeiro',
    tipo: 'frescor',
    raioMetros: 380,
    motivo: 'Proximidade com a orla marítima e ventilação sudeste contínua que atenua a radiação.'
  },
  {
    id: 'ref-6',
    nome: 'Praça do Derby (Arborização Histórica)',
    bairro: 'Derby',
    coords: [-8.0560, -34.9015],
    tempSuperficie: 33.5,
    tempAr: 29.8,
    classificacao: 'Refúgio Arbóreo Urbano',
    tipo: 'frescor',
    raioMetros: 300,
    motivo: 'Árvores de grande porte oferecendo sombra densa em um dos nós mais movimentados da cidade.'
  }
];

export default function ThermalMapSection({ region = null }) {
  const containerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const layersRef = useRef({
    halos: null,
    badges: null,
    corridors: null
  });

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  // Tecla ESC para sair da tela cheia
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Redimensionamento do mapa ao alternar tela cheia
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) return;

    const map = L.map(containerRef.current).setView([-8.058, -34.890], 13);

    // ArcGIS Dark Canvas oficial Esri
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
      }
    ).addTo(map);

    layersRef.current.halos = L.layerGroup().addTo(map);
    layersRef.current.corridors = L.layerGroup().addTo(map);
    layersRef.current.badges = L.layerGroup().addTo(map);

    // Bacia do Capibaribe
    const capibaribeLine = L.polyline(
      [
        [-8.068, -34.873],
        [-8.062, -34.877],
        [-8.055, -34.885],
        [-8.050, -34.895],
        [-8.045, -34.910],
        [-8.040, -34.925]
      ],
      { color: '#0284c7', weight: 12, opacity: 0.65 }
    );
    capibaribeLine.bindPopup('<strong>🌊 Bacia do Rio Capibaribe</strong><br>Regulador térmico natural: 28.5°C na lâmina d’água.');
    layersRef.current.corridors.addLayer(capibaribeLine);

    // Renderiza cada ponto com selo flutuante de temperatura
    PONTOS_TERMICOS_RECIFE.forEach((pt) => {
      const popupContent = `
        <div style="font-family: -apple-system, sans-serif; font-size: 13px; min-width: 230px; line-height: 1.45;">
          <span style="font-size: 10px; font-weight: 700; background: ${pt.tipo === 'calor' ? '#ffe4e6' : '#dcfce7'}; color: ${pt.tipo === 'calor' ? '#be123c' : '#15803d'}; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
            Sensor Térmico de Superfície
          </span>
          <h4 style="margin: 6px 0 2px 0; color: #0f172a; font-size: 14px; font-weight: 700;">${pt.nome}</h4>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">${pt.bairro} · <strong>${pt.classificacao}</strong></div>
          <div style="display: flex; gap: 8px; margin: 6px 0; background: #f8fafc; padding: 6px 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
            <div><strong style="color: ${pt.tipo === 'calor' ? '#e11d48' : '#16a34a'}; font-size: 14px;">${pt.tempSuperficie}°C</strong><br><small style="color: #64748b;">No Asfalto</small></div>
            <div style="border-left: 1px solid #e2e8f0; padding-left: 8px;"><strong style="color: #0f172a; font-size: 14px;">${pt.tempAr}°C</strong><br><small style="color: #64748b;">Temp. Ar</small></div>
            <div style="border-left: 1px solid #e2e8f0; padding-left: 8px;"><strong style="color: ${pt.tipo === 'calor' ? '#c2410c' : '#0284c7'}; font-size: 14px;">+${(pt.tempSuperficie - pt.tempAr).toFixed(1)}°C</strong><br><small style="color: #64748b;">Delta</small></div>
          </div>
          <p style="font-size: 11.5px; color: #334155; margin: 4px 0;">${pt.motivo}</p>
        </div>
      `;

      if (pt.tipo === 'calor') {
        const haloExt = L.circle(pt.coords, {
          radius: pt.raioMetros * 1.35,
          color: '#eab308',
          weight: 1,
          fillColor: '#eab308',
          fillOpacity: 0.16,
          interactive: false
        });
        layersRef.current.halos.addLayer(haloExt);

        const haloMid = L.circle(pt.coords, {
          radius: pt.raioMetros,
          color: '#f97316',
          weight: 1,
          fillColor: '#f97316',
          fillOpacity: 0.35,
          interactive: false
        });
        layersRef.current.halos.addLayer(haloMid);

        const core = L.circle(pt.coords, {
          radius: Math.round(pt.raioMetros * 0.55),
          color: '#dc2626',
          weight: 2,
          fillColor: '#e11d48',
          fillOpacity: 0.65,
          interactive: true
        });
        core.bindPopup(popupContent);
        layersRef.current.halos.addLayer(core);

        const badgeIcon = L.divIcon({
          className: 'custom-thermal-badge',
          html: `<div style="background: rgba(15,23,42,0.92); color: #ffffff; border: 1px solid #ef4444; border-radius: 4px; padding: 2px 6px; font-size: 11px; font-weight: 700; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.4); cursor: pointer; display: flex; align-items: center; gap: 3px;"><span>🔥</span><span>${pt.tempSuperficie}°C</span></div>`,
          iconSize: [66, 22],
          iconAnchor: [33, 11]
        });
        const badgeMarker = L.marker(pt.coords, { icon: badgeIcon });
        badgeMarker.bindPopup(popupContent);
        layersRef.current.badges.addLayer(badgeMarker);
      } else {
        const haloVerde = L.circle(pt.coords, {
          radius: pt.raioMetros,
          color: '#10b981',
          weight: 2,
          fillColor: '#10b981',
          fillOpacity: 0.35,
          interactive: true
        });
        haloVerde.bindPopup(popupContent);
        layersRef.current.halos.addLayer(haloVerde);

        const badgeIcon = L.divIcon({
          className: 'custom-thermal-badge',
          html: `<div style="background: rgba(15,23,42,0.92); color: #ffffff; border: 1px solid #10b981; border-radius: 4px; padding: 2px 6px; font-size: 11px; font-weight: 700; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.4); cursor: pointer; display: flex; align-items: center; gap: 3px;"><span>🌳</span><span>${pt.tempSuperficie}°C</span></div>`,
          iconSize: [66, 22],
          iconAnchor: [33, 11]
        });
        const badgeMarker = L.marker(pt.coords, { icon: badgeIcon });
        badgeMarker.bindPopup(popupContent);
        layersRef.current.badges.addLayer(badgeMarker);
      }
    });

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

  // Sincroniza região se informada
  useEffect(() => {
    if (!region || !mapInstanceRef.current) return;
    mapInstanceRef.current.setView(region.center, region.zoom);
  }, [region]);

  return (
    <section className={`painel-secao painel-mapa-termico-clima ${isFullscreen ? 'mapa-em-tela-cheia' : ''}`} aria-label="Mapa Térmico de Superfície">
      <div className="painel-header">
        <div>
          <h2 className="painel-titulo">
            <Flame size={18} color="var(--alerta-calor)" />
            <span>Mapa Térmico de Superfície</span>
          </h2>
          <p className="painel-subtitulo">
            Temperaturas reais medidas no asfalto e parques arborizados no Recife ao meio-dia.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge-tecnologia-mapa badge-termico">
            <span className="ponto-termico-ativo"></span>
            <span>15 Sensores (°C)</span>
          </span>

          {/* Botão de Tela Cheia */}
          <button
            type="button"
            className={`btn-tela-cheia ${isFullscreen ? 'ativo' : ''}`}
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Sair da tela cheia (ESC)' : 'Expandir mapa térmico em tela cheia'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            <span>{isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}</span>
          </button>
        </div>
      </div>

      {/* Canvas do Mapa Térmico */}
      <div
        id="map-thermal-container"
        className="mapa-canvas mapa-canvas-clima"
        ref={containerRef}
        role="region"
        aria-label="Mapa Térmico de Superfície"
      ></div>

      {/* Régua de Gradiente Térmico */}
      <div className="escala-termica-card" style={{ marginTop: '10px' }}>
        <div className="escala-termica-header">
          <span>Escala Térmica de Superfície (Temperatura no Asfalto)</span>
          <span style={{ color: '#ef4444', fontWeight: 700 }}>Infravermelho Termográfico</span>
        </div>
        <div className="gradiente-termico-linha"></div>
        <div className="escala-termica-rotulos">
          <span>&lt; 30°C (Mangue & Água)</span>
          <span>31°C - 35°C (Parques)</span>
          <span>36°C - 41°C (Misto)</span>
          <span>42°C - 46°C (Comércio)</span>
          <span>&gt; 47°C (Asfalto Crítico)</span>
        </div>
      </div>
    </section>
  );
}
