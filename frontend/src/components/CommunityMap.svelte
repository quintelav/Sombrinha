<script lang="ts">
  import { onMount } from 'svelte';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import type { Adoption, Coordinates, ReferencePoint, ReportSummaryItem } from '../lib/types';

  type SelectionMode = 'report' | 'adoption';

  interface Props {
    reports: ReportSummaryItem[];
    adoptions: Adoption[];
    referencePoints: ReferencePoint[];
    selectionMode: SelectionMode;
    selectedCoordinates: Coordinates | null;
    onPick: (coordinates: Coordinates) => void;
  }

  let { reports, adoptions, referencePoints, selectionMode, selectedCoordinates, onPick }: Props = $props();
  let mapElement: HTMLDivElement;
  let map: L.Map | undefined;
  let reportLayer: L.LayerGroup | undefined;
  let adoptionLayer: L.LayerGroup | undefined;
  let referenceLayer: L.LayerGroup | undefined;
  let selectionLayer: L.LayerGroup | undefined;

  function popupContent(title: string, lines: string[]): HTMLElement {
    const content = document.createElement('div');
    const heading = document.createElement('strong');
    heading.textContent = title;
    content.append(heading);
    for (const line of lines) {
      const paragraph = document.createElement('div');
      paragraph.textContent = line;
      content.append(paragraph);
    }
    return content;
  }

  function redrawMarkers(): void {
    if (!reportLayer || !adoptionLayer || !referenceLayer) return;
    reportLayer.clearLayers();
    adoptionLayer.clearLayers();
    referenceLayer.clearLayers();

    for (const item of reports) {
      if (item.latitude === null || item.longitude === null) continue;
      const color = item.priority >= 70 ? '#b54735' : item.priority >= 40 ? '#d58b21' : '#29785f';
      const marker = L.circleMarker([item.latitude, item.longitude], {
        radius: 8 + Math.min(item.count, 6), color: '#fff', weight: 2, fillColor: color, fillOpacity: 0.92,
      });
      marker.bindPopup(popupContent(item.location, [
        `${item.count} relato(s)`,
        `Sinal comunitário demonstrativo: ${item.priority}/100`,
        item.main_issue,
      ]));
      reportLayer.addLayer(marker);
    }

    for (const item of adoptions) {
      const symbol = item.kind === 'refresco' ? '💧' : item.kind === 'onibus' ? '🚌' : '🌿';
      const icon = L.divIcon({
        className: 'adoption-marker', html: symbol, iconSize: [30, 30], iconAnchor: [15, 15],
      });
      L.marker([item.latitude, item.longitude], { icon })
        .bindPopup(popupContent(item.name, [item.organization, item.commitment, item.status]))
        .addTo(adoptionLayer);
    }

    for (const point of referencePoints) {
      const color = point.tipo === 'sombra' ? '#26805f' : point.tipo === 'bebedouro' ? '#2876a3' : '#b7791f';
      const marker = L.circleMarker([point.latitude, point.longitude], {
        radius: 8, color: '#fff', weight: 2, fillColor: color, fillOpacity: 0.9,
      });
      marker.bindPopup(popupContent(point.nome, [point.endereco, point.descricao, point.status]));
      referenceLayer.addLayer(marker);
    }
  }

  function redrawSelection(): void {
    if (!selectionLayer) return;
    selectionLayer.clearLayers();
    if (!selectedCoordinates) return;
    const fillColor = selectionMode === 'adoption' ? '#2876a3' : '#145b4b';
    L.circleMarker([selectedCoordinates.latitude, selectedCoordinates.longitude], {
      radius: 9, color: '#fff', weight: 3, fillColor, fillOpacity: 1,
    }).addTo(selectionLayer).bindPopup('Local aproximado selecionado.');
    if (map && map.getBounds().contains([selectedCoordinates.latitude, selectedCoordinates.longitude]) === false) {
      map.flyTo([selectedCoordinates.latitude, selectedCoordinates.longitude], Math.max(map.getZoom(), 15), { duration: 0.35 });
    }
  }

  onMount(() => {
    map = L.map(mapElement, { scrollWheelZoom: false }).setView([-8.0583, -34.8819], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    reportLayer = L.layerGroup().addTo(map);
    adoptionLayer = L.layerGroup().addTo(map);
    referenceLayer = L.layerGroup().addTo(map);
    selectionLayer = L.layerGroup().addTo(map);

    map.on('click', (event: L.LeafletMouseEvent) => {
      const coordinates = { latitude: event.latlng.lat, longitude: event.latlng.lng };
      onPick(coordinates);
    });

    const resize = window.setTimeout(() => map?.invalidateSize(), 100);
    redrawMarkers();
    return () => {
      window.clearTimeout(resize);
      map?.remove();
      map = undefined;
    };
  });

  $effect(() => {
    reports;
    adoptions;
    referencePoints;
    selectedCoordinates;
    selectionMode;
    redrawMarkers();
    redrawSelection();
  });
</script>

<div class="map-frame" bind:this={mapElement} aria-label="Mapa interativo do Recife" role="region"></div>
