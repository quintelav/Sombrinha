"""Controller HTTP para pedidos e alterações em pontos de ajuda comunitários."""

from flask import Blueprint, jsonify, request
from models.request_model import RequestModel, TIPOS_PEDIDO

requests_blueprint = Blueprint("requests", __name__)


@requests_blueprint.get("/api/community-requests")
def list_requests():
    return jsonify({
        "sucesso": True,
        "tipos_disponiveis": TIPOS_PEDIDO,
        "total": len(RequestModel.all()),
        "pedidos": RequestModel.all(),
    })


@requests_blueprint.post("/api/community-requests")
def create_request():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"erro": "Envie os dados do pedido em formato JSON."}), 400

    try:
        criado = RequestModel.create(payload)
    except ValueError as error:
        return jsonify({"erro": str(error)}), 400

    return jsonify({
        "sucesso": True,
        "mensagem": "Pedido comunitário registrado com sucesso!",
        "pedido": criado,
    }), 201
