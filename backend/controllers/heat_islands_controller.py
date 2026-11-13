"""Controller para pesquisa estratégica de ilhas de calor e geofencing proativo."""

from flask import Blueprint, jsonify, request
from models.heat_islands_model import HeatIslandsModel

heat_islands_blueprint = Blueprint("heat_islands", __name__)


@heat_islands_blueprint.get("/api/heat-islands/study")
def get_study():
    """Retorna o estudo estratégico das ruas mais quentes do Recife e locais ideais para água/refrigeração."""
    study = HeatIslandsModel.get_strategic_study()
    return jsonify({"sucesso": True, "dados": study})


@heat_islands_blueprint.post("/api/heat-islands/proximity")
def check_proximity():
    """Avalia a localização do usuário e gera notificação se estiver no Centro ou a caminho."""
    payload = request.get_json(silent=True) or {}
    lat = payload.get("latitude")
    lon = payload.get("longitude")

    if lat is None or lon is None:
        return jsonify({"erro": "Parâmetros 'latitude' e 'longitude' são obrigatórios."}), 400

    try:
        resultado = HeatIslandsModel.evaluate_user_proximity(float(lat), float(lon))
        return jsonify({"sucesso": True, "dados": resultado})
    except (ValueError, TypeError) as err:
        return jsonify({"erro": f"Coordenadas inválidas: {err}"}), 400
