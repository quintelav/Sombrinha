"""HTTP endpoints for community adoption proposals."""

from flask import Blueprint, jsonify, request

from models.adoption_model import AdoptionModel


adoptions_blueprint = Blueprint("adoptions", __name__)


@adoptions_blueprint.get("/api/adoptions")
def list_adoptions():
    return jsonify({"adoptions": AdoptionModel.all()})


@adoptions_blueprint.post("/api/adoptions")
def create_adoption():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"error": "Envie os dados da proposta em formato JSON."}), 400

    try:
        AdoptionModel.create(payload)
    except ValueError as error:
        return jsonify({"error": str(error)}), 400

    return jsonify({"ok": True, "status": "Proposta recebida"}), 201
