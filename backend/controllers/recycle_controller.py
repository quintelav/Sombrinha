"""Endpoints for the recycling exchange prototype."""

from flask import Blueprint, jsonify, request

from models.recycle_model import RecycleModel


recycle_blueprint = Blueprint("recycling", __name__)


@recycle_blueprint.get("/api/trades")
def list_trades():
    return jsonify({"sucesso": True, "dados": RecycleModel.list_trades()})


@recycle_blueprint.get("/api/trades/catalog")
def get_catalog():
    return jsonify({"sucesso": True, "dados": RecycleModel.get_catalog()})


@recycle_blueprint.post("/api/trades")
def create_trade():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"erro": "Envie os dados da simulação em JSON."}), 400

    try:
        record = RecycleModel.create_trade(payload)
    except ValueError as error:
        return jsonify({"erro": str(error)}), 400

    return jsonify({
        "sucesso": True,
        "mensagem": "Simulação registrada. Não houve entrega nem resgate de recompensa.",
        "dados": record,
    }), 201
