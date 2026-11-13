"""Endpoints for the rule-based text assistant and route demo."""

from flask import Blueprint, jsonify, request

from models.ai_model import AIModel


ai_blueprint = Blueprint("assistant", __name__)


@ai_blueprint.post("/api/routes/shade")
def suggest_shade_route():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"erro": "Envie origem e destino em formato JSON."}), 400

    origin = payload.get("origem", "")
    destination = payload.get("destino", "")
    if not isinstance(origin, str) or not isinstance(destination, str):
        return jsonify({"erro": "Origem e destino devem ser textos."}), 400
    if not origin.strip() or not destination.strip():
        return jsonify({"erro": "Informe origem e destino."}), 400
    if len(origin) > 120 or len(destination) > 120:
        return jsonify({"erro": "Origem e destino devem ter até 120 caracteres."}), 400

    result = AIModel.suggest_shade_route(origin.strip(), destination.strip())
    return jsonify({"sucesso": True, "dados": result})


@ai_blueprint.post("/api/ai/voice")
def analyze_voice():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"erro": "Envie o texto em formato JSON."}), 400
    text = payload.get("texto", "")
    if not isinstance(text, str) or not text.strip() or len(text) > 500:
        return jsonify({"erro": "Informe um texto de até 500 caracteres."}), 400

    result = AIModel.analyze_voice_text(text.strip())
    return jsonify({"sucesso": True, "dados": result})
