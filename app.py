"""Protótipo móvel de mobilização comunitária para pontos de sombra e refresco.

Executar com: python app.py
Em modo local, os relatos ficam em JSON. Com DATABASE_URL, usa PostgreSQL.
"""

from __future__ import annotations

import json
import math
import os
import re
import socket
import threading
import unicodedata
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


HOST = "0.0.0.0"
PORT = int(os.environ.get("PORT", "8000"))
DATA_FILE = Path(__file__).with_name("data") / "relatos.json"
DATA_LOCK = threading.Lock()

NEIGHBORHOODS_BY_RPA = {
    "1": ["Bairro do Recife", "Boa Vista", "Cabanga", "Coelhos", "Ilha do Leite", "Ilha Joana Bezerra", "Paissandu", "Santo Amaro", "Santo Antônio", "São José", "Soledade"],
    "2": ["Água Fria", "Alto Santa Terezinha", "Arruda", "Beberibe", "Bomba do Hemetério", "Cajueiro", "Campina do Barreto", "Campo Grande", "Dois Unidos", "Encruzilhada", "Fundão", "Hipódromo", "Linha do Tiro", "Peixinhos", "Ponto de Parada", "Porto da Madeira", "Rosarinho", "Torreão"],
    "3": ["Aflitos", "Alto do Mandu", "Alto José Bonifácio", "Alto José do Pinho", "Apipucos", "Brejo da Guabiraba", "Brejo de Beberibe", "Casa Amarela", "Casa Forte", "Córrego do Jenipapo", "Derby", "Dois Irmãos", "Espinheiro", "Graças", "Guabiraba", "Jaqueira", "Macaxeira", "Mangabeira", "Monteiro", "Morro da Conceição", "Nova Descoberta", "Parnamirim", "Passarinho", "Pau-Ferro", "Poço da Panela", "Santana", "Sítio dos Pintos", "Tamarineira", "Vasco da Gama"],
    "4": ["Caxangá", "Cidade Universitária", "Cordeiro", "Engenho do Meio", "Ilha do Retiro", "Iputinga", "Madalena", "Prado", "Torre", "Torrões", "Várzea", "Zumbi"],
    "5": ["Afogados", "Areias", "Barro", "Bongi", "Caçote", "Coqueiral", "Curado", "Estância", "Jardim São Paulo", "Jiquiá", "Mangueira", "Mustardinha", "San Martin", "Sancho", "Tejipió", "Totó"],
    "6": ["Boa Viagem", "Brasília Teimosa", "Cohab", "Ibura", "Imbiribeira", "Ipsep", "Jordão", "Pina"],
}
RECIFE_NEIGHBORHOODS = {name for names in NEIGHBORHOODS_BY_RPA.values() for name in names}

REPORT_TYPES = {
    "quente_sem_sombra": {
        "label": "Lugar muito quente ou sem sombra",
        "weight": 1.0,
    },
    "precisa_sombra": {
        "label": "Espaço que poderia receber mais sombra",
        "weight": 0.8,
    },
    "ponto_refresco": {
        "label": "Sugestão de local para ponto de refresco",
        "weight": 0.6,
    },
    "espaco_verde": {
        "label": "Área verde que precisa de cuidado",
        "weight": 0.5,
    },
}


def get_database_url() -> str | None:
    url = os.environ.get("DATABASE_URL")
    if url and url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


def open_database():
    # Importa psycopg somente no modo hospedado; a execução local segue sem dependências.
    import psycopg

    return psycopg.connect(get_database_url())


def initialize_database() -> None:
    if not get_database_url():
        return
    with open_database() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS community_reports (
                id BIGSERIAL PRIMARY KEY,
                location TEXT NOT NULL,
                neighborhood TEXT NOT NULL,
                reference TEXT NOT NULL,
                latitude DOUBLE PRECISION NOT NULL,
                longitude DOUBLE PRECISION NOT NULL,
                kind TEXT NOT NULL,
                note TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL
            )
            """
        )


def load_reports() -> list[dict]:
    if get_database_url():
        with open_database() as connection:
            rows = connection.execute(
                """SELECT location, neighborhood, reference, latitude, longitude,
                          kind, note, created_at
                   FROM community_reports ORDER BY id"""
            ).fetchall()
        columns = (
            "location", "neighborhood", "reference", "latitude", "longitude",
            "kind", "note", "created_at",
        )
        return [dict(zip(columns, row)) for row in rows]

    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not DATA_FILE.exists():
        return []
    try:
        content = json.loads(DATA_FILE.read_text(encoding="utf-8"))
        return content if isinstance(content, list) else []
    except (json.JSONDecodeError, OSError):
        return []


def save_reports(reports: list[dict]) -> None:
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    temp_file = DATA_FILE.with_suffix(".tmp")
    temp_file.write_text(
        json.dumps(reports, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    temp_file.replace(DATA_FILE)


def save_report(report: dict) -> None:
    if get_database_url():
        with open_database() as connection:
            connection.execute(
                """INSERT INTO community_reports
                   (location, neighborhood, reference, latitude, longitude, kind, note, created_at)
                   VALUES (%(location)s, %(neighborhood)s, %(reference)s, %(latitude)s,
                           %(longitude)s, %(kind)s, %(note)s, %(created_at)s)""",
                report,
            )
        return

    reports = load_reports()
    reports.append(report)
    save_reports(reports)


def normalize_location(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = "".join(char for char in value if not unicodedata.combining(char))
    return re.sub(r"\s+", " ", value.strip().casefold())


def neighborhood_options_html() -> str:
    return "\n".join(
        f'<optgroup label="RPA {rpa}">'
        + "".join(f'<option value="{name}">{name}</option>' for name in names)
        + "</optgroup>"
        for rpa, names in NEIGHBORHOODS_BY_RPA.items()
    )


def build_summary(reports: list[dict]) -> list[dict]:
    """Agrupa relatos por local e calcula um sinal comunitário demonstrativo.

    O índice não estima temperatura nem risco oficial. Ele combina quantidade,
    tipo e atualidade dos relatos enviados pelo público.
    """
    now = datetime.now(timezone.utc)
    groups: dict[str, list[dict]] = {}
    for report in reports:
        latitude = report.get("latitude")
        longitude = report.get("longitude")
        if isinstance(latitude, (int, float)) and isinstance(longitude, (int, float)):
            # Células de aproximadamente 100 m para agrupar pontos próximos.
            key = f"geo:{round(latitude, 3)}:{round(longitude, 3)}"
        else:
            key = f"text:{normalize_location(report.get('location', ''))}"
        if key:
            groups.setdefault(key, []).append(report)

    result = []
    for entries in groups.values():
        recent_count = 0
        weighted_need = 0.0
        newest = ""
        for entry in entries:
            kind = REPORT_TYPES.get(entry.get("kind"), {})
            weighted_need += float(kind.get("weight", 0))
            created = entry.get("created_at", "")
            newest = max(newest, created)
            try:
                timestamp = datetime.fromisoformat(created)
                if (now - timestamp).total_seconds() <= 30 * 24 * 3600:
                    recent_count += 1
            except ValueError:
                pass

        # Escala de 0 a 100 para facilitar a leitura no protótipo.
        # Volume satura em cinco relatos; atualidade usa os últimos 30 dias.
        volume_score = min(len(entries) / 5, 1) * 55
        need_score = min(weighted_need / max(len(entries), 1), 1) * 25
        recent_score = min(recent_count / 5, 1) * 20
        priority = round(volume_score + need_score + recent_score)
        labels = [REPORT_TYPES.get(e.get("kind"), {}).get("label", "Relato") for e in entries]
        counts = {label: labels.count(label) for label in dict.fromkeys(labels)}
        main_issue = max(counts, key=counts.get) if counts else "Relatos comunitários"
        located = [
            e for e in entries
            if isinstance(e.get("latitude"), (int, float))
            and isinstance(e.get("longitude"), (int, float))
        ]
        result.append(
            {
                "location": entries[0].get("location", "Local sem nome"),
                "latitude": round(sum(e["latitude"] for e in located) / len(located), 6) if located else None,
                "longitude": round(sum(e["longitude"] for e in located) / len(located), 6) if located else None,
                "count": len(entries),
                "recent_count": recent_count,
                "priority": priority,
                "main_issue": main_issue,
                "newest": newest,
                "suggestion": suggest_action(entries),
            }
        )

    return sorted(result, key=lambda item: (-item["priority"], item["location"].casefold()))


def suggest_action(entries: list[dict]) -> str:
    kinds = {entry.get("kind") for entry in entries}
    if "quente_sem_sombra" in kinds or "precisa_sombra" in kinds:
        return "Avaliar uma ilha de sombra com a comunidade e os responsáveis pelo espaço."
    if "ponto_refresco" in kinds:
        return "Verificar se existe um espaço acessível que possa funcionar como ponto de refresco."
    return "Combinar uma ação comunitária de cuidado da área verde."


def json_response(handler: BaseHTTPRequestHandler, data: object, status: int = 200) -> None:
    body = json.dumps(data, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Cache-Control", "no-store")
    handler.end_headers()
    handler.wfile.write(body)


PAGE = r"""<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#145b4b">
  <title>Bairro que Cuida</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
  <style>
    :root { color-scheme: light; --green:#145b4b; --ink:#17332d; --muted:#55706a; --paper:#f2f7f4; --line:#d8e5df; }
    * { box-sizing:border-box; }
    body { margin:0; background:var(--paper); color:var(--ink); font:16px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif; }
    header { background:var(--green); color:white; padding:24px 18px 28px; }
    .wrap { width:min(100% - 28px, 760px); margin:auto; }
    header h1 { margin:0 0 6px; font-size:1.7rem; }
    header p { margin:0; max-width:600px; color:#e1f2eb; }
    main { padding:18px 0 40px; }
    section, .notice { background:white; border:1px solid var(--line); border-radius:16px; padding:18px; margin-bottom:16px; box-shadow:0 4px 16px #17332d0a; }
    h2 { font-size:1.15rem; margin:0 0 12px; }
    label { display:block; font-weight:650; margin:14px 0 6px; }
    input, select, textarea, button { font:inherit; }
    input, select, textarea { width:100%; border:1px solid #a9beb5; border-radius:10px; padding:12px; background:white; color:var(--ink); }
    textarea { min-height:76px; resize:vertical; }
    .help { color:var(--muted); font-size:.9rem; margin:6px 0 0; }
    button { border:0; border-radius:10px; background:var(--green); color:white; padding:12px 16px; font-weight:700; min-height:46px; cursor:pointer; }
    button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline:3px solid #efbd54; outline-offset:2px; }
    .submit { width:100%; margin-top:16px; }
    .row { display:flex; justify-content:space-between; align-items:center; gap:12px; }
    .count { color:var(--muted); font-size:.9rem; }
    .card { border-top:1px solid var(--line); padding:14px 0 2px; }
    .card:first-of-type { border-top:0; }
    .card h3 { margin:0; font-size:1.05rem; }
    .score { font-size:.83rem; font-weight:750; color:#155c4c; white-space:nowrap; }
    .card p { margin:6px 0; color:var(--muted); }
    .action { color:var(--ink)!important; font-size:.94rem; }
    .empty { color:var(--muted); padding:8px 0; }
    #map { height:340px; width:100%; border-radius:12px; border:1px solid var(--line); z-index:1; }
    .map-help { color:var(--muted); font-size:.9rem; margin:8px 0 0; }
    .notice { font-size:.88rem; color:var(--muted); background:#f9fcfa; }
    #status { min-height:1.3em; color:var(--green); font-weight:650; margin:8px 0 0; }
    footer { text-align:center; color:var(--muted); font-size:.82rem; padding:4px 0 22px; }
    @media (min-width:620px) { header { padding:34px 24px 38px; } main { padding-top:24px; } section { padding:22px; } }
  </style>
</head>
<body>
  <header><div class="wrap"><h1>Bairro que Cuida</h1><p>Ajude a identificar onde faltam sombra, espaços frescos e cuidado com as áreas verdes.</p></div></header>
  <main class="wrap">
    <section aria-labelledby="map-title">
      <h2 id="map-title">Marque o local no mapa</h2>
      <div id="map" aria-label="Mapa interativo do Recife"></div>
      <p id="selected-coords" class="map-help">Toque no mapa para marcar aproximadamente o local da demanda.</p>
      <p class="map-help">Os marcadores mostram relatos comunitários, não medições de temperatura ou risco oficial.</p>
    </section>
    <section aria-labelledby="form-title">
      <h2 id="form-title">Conte sobre um lugar</h2>
      <form id="report-form">
        <input id="latitude" name="latitude" type="hidden">
        <input id="longitude" name="longitude" type="hidden">
        <label for="neighborhood">Bairro</label>
        <select id="neighborhood" name="neighborhood" required>
          <option value="">Selecione um bairro</option>
          {{BAIRROS_RECIFE}}
        </select>
        <label for="reference">Ponto de referência</label>
        <input id="reference" name="reference" maxlength="80" placeholder="Ex.: praça, escola ou parada de ônibus" required>
        <p class="help">Use uma referência pública, sem informar endereço residencial.</p>
        <label for="kind">O que acontece nesse local?</label>
        <select id="kind" name="kind" required>
          <option value="quente_sem_sombra">É muito quente ou falta sombra</option>
          <option value="precisa_sombra">Poderia receber uma ilha de sombra</option>
          <option value="ponto_refresco">Poderia ser um ponto de refresco</option>
          <option value="espaco_verde">Há uma área verde que precisa de cuidado</option>
        </select>
        <label for="note">Mais detalhes (opcional)</label>
        <textarea id="note" name="note" maxlength="240" placeholder="O que ajudaria as pessoas nesse lugar?"></textarea>
        <button class="submit" type="submit">Registrar este local</button>
        <p id="status" role="status" aria-live="polite"></p>
      </form>
    </section>
    <section aria-labelledby="list-title">
      <div class="row"><h2 id="list-title">Locais para cuidar</h2><span id="total" class="count"></span></div>
      <div id="locations"><p class="empty">Ainda não há relatos. Adicione o primeiro local.</p></div>
    </section>
    <div class="notice"><strong>Sobre esta demonstração:</strong> a prioridade é um sinal feito a partir dos relatos enviados aqui. Não é medição de temperatura, previsão de calor ou classificação oficial de risco. As ações sugeridas precisam ser conversadas com a comunidade e com os responsáveis pelo espaço.</div>
  </main>
  <footer class="wrap">Protótipo de teste · Não envie dados pessoais</footer>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <script>
    const form = document.querySelector('#report-form');
    const statusEl = document.querySelector('#status');
    const latitudeInput = document.querySelector('#latitude');
    const longitudeInput = document.querySelector('#longitude');
    const selectedCoords = document.querySelector('#selected-coords');
    const map = L.map('map').setView([-8.0476, -34.8770], 12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    const reportMarkers = L.layerGroup().addTo(map);
    let selectionMarker = null;
    map.on('click', event => {
      const {lat, lng} = event.latlng;
      latitudeInput.value = lat.toFixed(6);
      longitudeInput.value = lng.toFixed(6);
      selectedCoords.textContent = `Ponto marcado: ${lat.toFixed(4)}, ${lng.toFixed(4)}. Ajuste tocando em outro lugar do mapa.`;
      if (selectionMarker) selectionMarker.remove();
      selectionMarker = L.circleMarker([lat, lng], {radius:9, color:'#ffffff', weight:3, fillColor:'#145b4b', fillOpacity:1}).addTo(map);
      selectionMarker.bindPopup('Local selecionado para o novo relato.');
    });
    const kindLabels = {
      quente_sem_sombra: 'Lugar muito quente ou sem sombra',
      precisa_sombra: 'Espaço que poderia receber mais sombra',
      ponto_refresco: 'Sugestão de local para ponto de refresco',
      espaco_verde: 'Área verde que precisa de cuidado'
    };
    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
    }
    async function refresh() {
      const response = await fetch('/api/summary');
      const data = await response.json();
      document.querySelector('#total').textContent = `${data.total_reports} relato${data.total_reports === 1 ? '' : 's'}`;
      reportMarkers.clearLayers();
      data.locations.forEach(item => {
        if (item.latitude === null || item.longitude === null) return;
        const color = item.priority >= 70 ? '#b54735' : item.priority >= 40 ? '#d58b21' : '#29785f';
        const marker = L.circleMarker([item.latitude, item.longitude], {
          radius: 8 + Math.min(item.count, 6), color:'#ffffff', weight:2,
          fillColor:color, fillOpacity:.9
        });
        marker.bindPopup(`<strong>${escapeHtml(item.location)}</strong><br>${item.count} relato${item.count === 1 ? '' : 's'}<br>Sinal comunitário: ${item.priority}/100<br>${escapeHtml(item.main_issue)}`);
        reportMarkers.addLayer(marker);
      });
      const container = document.querySelector('#locations');
      if (!data.locations.length) {
        container.innerHTML = '<p class="empty">Ainda não há relatos. Adicione o primeiro local.</p>';
        return;
      }
      container.innerHTML = data.locations.map(item => `
        <article class="card">
          <div class="row"><h3>${escapeHtml(item.location)}</h3><span class="score">Sinal comunitário: ${item.priority}/100</span></div>
          <p>${item.count} relato${item.count === 1 ? '' : 's'} · principal situação: ${escapeHtml(item.main_issue)}</p>
          <p class="action"><strong>Próximo passo possível:</strong> ${escapeHtml(item.suggestion)}</p>
        </article>`).join('');
    }
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(form).entries());
      if (!payload.latitude || !payload.longitude) {
        statusEl.textContent = 'Marque o local aproximado no mapa antes de registrar.';
        return;
      }
      const button = form.querySelector('button');
      button.disabled = true;
      statusEl.textContent = 'Salvando relato…';
      try {
        const response = await fetch('/api/reports', {
          method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Não foi possível salvar.');
        form.reset();
        latitudeInput.value = '';
        longitudeInput.value = '';
        selectedCoords.textContent = 'Toque no mapa para marcar aproximadamente o local da demanda.';
        if (selectionMarker) { selectionMarker.remove(); selectionMarker = null; }
        statusEl.textContent = 'Relato adicionado. Obrigado por contribuir!';
        await refresh();
      } catch (error) {
        statusEl.textContent = error.message;
      } finally { button.disabled = false; }
    });
    refresh().catch(() => { statusEl.textContent = 'Não foi possível carregar os relatos.'; });
  </script>
</body>
</html>"""


class AppHandler(BaseHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:
        # Keep local development output concise.
        print("%s - %s" % (self.address_string(), format % args))

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if path == "/":
            page = PAGE.replace("{{BAIRROS_RECIFE}}", neighborhood_options_html())
            body = page.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        elif path == "/api/summary":
            with DATA_LOCK:
                reports = load_reports()
            json_response(self, {"total_reports": len(reports), "locations": build_summary(reports)})
        else:
            json_response(self, {"error": "Rota não encontrada."}, 404)

    def do_POST(self) -> None:
        if urlparse(self.path).path != "/api/reports":
            json_response(self, {"error": "Rota não encontrada."}, 404)
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 10_000:
                raise ValueError("Envie um relato válido.")
            payload = json.loads(self.rfile.read(length))
            neighborhood = str(payload.get("neighborhood", "")).strip()
            reference = str(payload.get("reference", "")).strip()
            kind = str(payload.get("kind", ""))
            note = str(payload.get("note", "")).strip()
            try:
                latitude = float(payload.get("latitude"))
                longitude = float(payload.get("longitude"))
            except (TypeError, ValueError):
                raise ValueError("Marque o local aproximado no mapa.")
            if not math.isfinite(latitude) or not math.isfinite(longitude):
                raise ValueError("As coordenadas do local são inválidas.")
            if not -90 <= latitude <= 90 or not -180 <= longitude <= 180:
                raise ValueError("As coordenadas do local são inválidas.")
            if neighborhood not in RECIFE_NEIGHBORHOODS:
                raise ValueError("Selecione um dos bairros do Recife.")
            if not reference or len(reference) > 80:
                raise ValueError("Informe um ponto de referência público (até 80 caracteres).")
            if kind not in REPORT_TYPES:
                raise ValueError("Escolha uma das opções de situação.")
            if len(note) > 240:
                raise ValueError("Os detalhes podem ter até 240 caracteres.")
            report = {
                "location": f"{neighborhood} — {reference}",
                "neighborhood": neighborhood,
                "reference": reference,
                "latitude": latitude,
                "longitude": longitude,
                "kind": kind,
                "note": note,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            with DATA_LOCK:
                save_report(report)
            json_response(self, {"ok": True}, 201)
        except (ValueError, json.JSONDecodeError) as error:
            json_response(self, {"error": str(error)}, 400)


def local_ip() -> str:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
            sock.connect(("192.0.2.1", 80))
            return sock.getsockname()[0]
    except OSError:
        return "IP-DO-COMPUTADOR"


if __name__ == "__main__":
    initialize_database()
    server = ThreadingHTTPServer((HOST, PORT), AppHandler)
    print(f"Aplicação disponível neste computador: http://localhost:{PORT}")
    print(f"Para testar no celular conectado à mesma rede Wi-Fi: http://{local_ip()}:{PORT}")
    print("Pare o servidor com Ctrl+C. Os relatos ficam em data/relatos.json.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
    finally:
        server.server_close()
