"""Pesquisa estratégica de ilhas de calor urbano e pontos de alívio térmico no Centro do Recife."""

import math
from typing import Any

# Coordenada central de referência do Centro do Recife (Conde da Boa Vista / Guararapes)
CENTRO_RECIFE_COORDS = {"latitude": -8.0601, "longitude": -34.8876}

# Ruas e corredores com maior retenção térmica identificados na RMR
HOT_CORRIDORS = [
    {
        "id": "hot-1",
        "nome": "Avenida Conde da Boa Vista",
        "bairro": "Boa Vista / Soledade",
        "nivel_calor": "CRITICO",
        "temperatura_superficie_estimada": "44°C - 48°C",
        "motivo": "Corredor estufa: asfalto escuro contínuo, paredões de concreto de edifícios, intenso fluxo de ônibus e tráfego pesado com pouca arborização nativa.",
        "coordenadas": {"latitude": -8.0601, "longitude": -34.8876},
        "solucao_recomendada": "Instalação urgente de bebedouros públicos nas paradas de BRT e totens de nebulização de água (spray refrescante) nas calçadas.",
    },
    {
        "id": "hot-2",
        "nome": "Rua da Palma & Rua da Concórdia",
        "bairro": "São José",
        "nivel_calor": "ALTO",
        "temperatura_superficie_estimada": "42°C - 45°C",
        "motivo": "Ruas estreitas de comércio popular denso, cobertas por lonas plásticas que represam o calor e sem circulação de vento.",
        "coordenadas": {"latitude": -8.0682, "longitude": -34.8789},
        "solucao_recomendada": "Ponto de hidratação no cruzamento com a Rua Nova e marquises reflexivas com sombreamento retrátil.",
    },
    {
        "id": "hot-3",
        "nome": "Avenida Dantas Barreto",
        "bairro": "Santo Antônio / São José",
        "nivel_calor": "CRITICO",
        "temperatura_superficie_estimada": "43°C - 47°C",
        "motivo": "Largo boulevard asfaltado com pouca sombra contínua, onde camelôs e pedestres sofrem com radiação UV direta a pino.",
        "coordenadas": {"latitude": -8.0671, "longitude": -34.8778},
        "solucao_recomendada": "Abrigos solares com água potável gratuita e plantio de mudas em canteiros centrais.",
    },
    {
        "id": "hot-4",
        "nome": "Terminal Integrado Cais de Santa Rita",
        "bairro": "São José",
        "nivel_calor": "ALTO",
        "temperatura_superficie_estimada": "41°C - 44°C",
        "motivo": "Grande extensão de asfalto aberto com circulação de milhares de passageiros diários esperando ônibus sob calor forte.",
        "coordenadas": {"latitude": -8.0712, "longitude": -34.8756},
        "solucao_recomendada": "Bebedouros industriais de alta vazão e ventiladores com névoa d'água nas filas.",
    },
    {
        "id": "hot-5",
        "nome": "Rua Nova e Pátio do Livramento",
        "bairro": "Santo Antônio",
        "nivel_calor": "ALTO",
        "temperatura_superficie_estimada": "40°C - 43°C",
        "motivo": "Via comercial exclusiva de pedestres com pavimentação de paralelepípedo/pedra que armazena calor e ausência de fontes de água pública.",
        "coordenadas": {"latitude": -8.0652, "longitude": -34.8791},
        "solucao_recomendada": "Instalação de bebedouro público acessível na Praça da Independência (Pracinha do Diário).",
    },
]

# Pontos Estratégicos Recomendados para Água Gratuita e Refrigeração
RECOMMENDED_COOLING_STATIONS = [
    {
        "id": "station-1",
        "nome": "Estação de Hidratação Praça da Independência (Pracinha do Diário)",
        "tipo": "bebedouro_refrigeracao",
        "bairro": "Santo Antônio",
        "latitude": -8.0645,
        "longitude": -34.8785,
        "capacidade": "Bebedouro triplo acessível com água gelada + nebulizador térmico",
        "publico_alvo": "Pedestres da Rua Nova, Duque de Caxias e Dantas Barreto",
        "status": "Planejado / Proposta Estratégica",
    },
    {
        "id": "station-2",
        "nome": "Ponto de Alívio Térmico Parada Soledade (Conde da Boa Vista)",
        "tipo": "nebulizador_sombra",
        "bairro": "Soledade",
        "latitude": -8.0592,
        "longitude": -34.8912,
        "capacidade": "Marquise ampliada com microaspersores de água + bebedouro",
        "publico_alvo": "Passageiros de ônibus e trabalhadores da Boa Vista",
        "status": "Planejado / Proposta Estratégica",
    },
    {
        "id": "station-3",
        "nome": "Refúgio Climático Cais de Santa Rita",
        "tipo": "bebedouro_industrial",
        "bairro": "São José",
        "latitude": -8.0710,
        "longitude": -34.8752,
        "capacidade": "Ponto de água gelada de alta capacidade para trabalhadores em trânsito",
        "publico_alvo": "Passageiros e ambulantes do terminal",
        "status": "Planejado / Proposta Estratégica",
    },
    {
        "id": "station-4",
        "nome": "Oásis Urbano Praça Maciel Pinheiro",
        "tipo": "sombra_agua",
        "bairro": "Boa Vista",
        "latitude": -8.0618,
        "longitude": -34.8872,
        "capacidade": "Bebedouro ecológico integrado com sombreamento de árvores centenárias",
        "publico_alvo": "Famílias, idosos e moradores locais",
        "status": "Planejado / Proposta Estratégica",
    },
    {
        "id": "station-5",
        "nome": "Ponto de Hidratação Mercado de Afogados",
        "tipo": "bebedouro_ecoponto",
        "bairro": "Afogados",
        "latitude": -8.0792,
        "longitude": -34.9089,
        "capacidade": "Bebedouro conectado ao Ecoponto de troca por recicláveis",
        "publico_alvo": "Feirantes, catadores de recicláveis e pedestres",
        "status": "Planejado / Proposta Estratégica",
    },
]


def _haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calcula a distância em metros entre duas coordenadas geográficas."""
    R = 6371000  # Raio da Terra em metros
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


class HeatIslandsModel:
    """Model para análise territorial de ilhas de calor e geofencing de proximidade."""

    @classmethod
    def get_strategic_study(cls) -> dict[str, Any]:
        return {
            "cidade": "Recife, PE",
            "regiao": "Centro Expandido (Boa Vista, Santo Antônio, São José, Santo Amaro, Afogados)",
            "resumo_estrategico": (
                "Pesquisa territorial de ilhas de calor urbano baseada na concentração de asfalto, "
                "paredões verticais e falta de cobertura vegetal contínua. Aponta os pontos críticos "
                "onde a instalação de bebedouros gratuitos e totens de resfriamento tem maior impacto social."
            ),
            "corredores_criticos_calor": HOT_CORRIDORS,
            "pontos_recomendados_alivio": RECOMMENDED_COOLING_STATIONS,
        }

    @classmethod
    def evaluate_user_proximity(cls, user_lat: float, user_lon: float) -> dict[str, Any]:
        """Avalia se o usuário está no centro ou se aproximando e indica os pontos mais próximos."""
        dist_centro = _haversine_distance_meters(
            user_lat, user_lon,
            CENTRO_RECIFE_COORDS["latitude"], CENTRO_RECIFE_COORDS["longitude"]
        )

        esta_no_centro = dist_centro <= 2500  # Raio de 2.5 km do centro
        se_aproximando = 2500 < dist_centro <= 5000

        # Ordena os pontos de alívio recomendados pela distância real ao usuário
        pontos_ordenados = []
        for station in RECOMMENDED_COOLING_STATIONS:
            dist = _haversine_distance_meters(user_lat, user_lon, station["latitude"], station["longitude"])
            pontos_ordenados.append({
                **station,
                "distancia_metros": round(dist),
                "tempo_a_pe_min": max(1, round(dist / 80)),  # ~80m por minuto caminhando
            })

        pontos_ordenados.sort(key=lambda x: x["distancia_metros"])
        pontos_mais_proximos = pontos_ordenados[:3]

        # Busca parques e pontos de sombra em toda a cidade e RMR
        from models.shade_points_model import ShadePointsModel
        sombras = ShadePointsModel.list_all(kind="sombra")
        sombras_ordenadas = []
        for s in sombras:
            dist = _haversine_distance_meters(user_lat, user_lon, s["latitude"], s["longitude"])
            sombras_ordenadas.append({
                **s,
                "distancia_metros": round(dist),
                "tempo_a_pe_min": max(1, round(dist / 80)),
            })
        sombras_ordenadas.sort(key=lambda x: x["distancia_metros"])
        sombra_mais_proxima = sombras_ordenadas[0] if sombras_ordenadas else None

        if esta_no_centro:
            status_movimento = "NO_CENTRO"
            notificacao = {
                "titulo": "🔥 Você está no Centro do Recife!",
                "mensagem": (
                    f"Identificamos calor intenso na região. O ponto de água gelada e frescor mais próximo "
                    f"é o '{pontos_mais_proximos[0]['nome']}' a {pontos_mais_proximos[0]['distancia_metros']}m (~{pontos_mais_proximos[0]['tempo_a_pe_min']} min a pé)."
                ),
                "tipo_alerta": "URGENTE_CALOR",
            }
        elif se_aproximando:
            status_movimento = "APROXIMANDO_DO_CENTRO"
            notificacao = {
                "titulo": "☀️ Rumo ao Centro do Recife",
                "mensagem": (
                    "Você está a caminho do Centro, onde há alta retenção de calor no asfalto. "
                    "Preparamos uma rota com calçadas sombreadas e bebedouros para sua chegada."
                ),
                "tipo_alerta": "PREVENTIVO",
            }
        else:
            status_movimento = "OUTRA_REGIAO"
            if sombra_mais_proxima and sombra_mais_proxima["distancia_metros"] <= 3000:
                notificacao = {
                    "titulo": f"🌳 Perto de você: {sombra_mais_proxima['nome']}",
                    "mensagem": (
                        f"Refúgio verde e alívio térmico a {sombra_mais_proxima['distancia_metros']}m "
                        f"(~{sombra_mais_proxima['tempo_a_pe_min']} min a pé) em {sombra_mais_proxima.get('bairro', 'seu bairro')}."
                    ),
                    "tipo_alerta": "INFORMATIVO",
                }
            else:
                notificacao = {
                    "titulo": "☂️ Sombrinha Ativo — Região Metropolitana",
                    "mensagem": "Monitore o calor e consulte os parques e pontos de sombra mais próximos do seu bairro.",
                    "tipo_alerta": "INFORMATIVO",
                }

        return {
            "usuario_coordenadas": {"latitude": user_lat, "longitude": user_lon},
            "distancia_ao_centro_metros": round(dist_centro),
            "status_movimento": status_movimento,
            "esta_no_centro": esta_no_centro,
            "notificacao_proativa": notificacao,
            "ponto_mais_proximo": pontos_mais_proximos[0] if pontos_mais_proximos else None,
            "pontos_frescor_proximos": pontos_mais_proximos,
            "sombra_mais_proxima": sombra_mais_proxima,
            "parques_proximos": sombras_ordenadas[:4],
        }
