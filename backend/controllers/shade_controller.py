"""Endpoints for map reference points that still need validation."""

from flask import Blueprint, jsonify, request

from models.shade_points_model import ShadePointsModel


shade_blueprint = Blueprint("shade_points", __name__)


@shade_blueprint.get("/api/reference-points")
def list_reference_points():
    points = ShadePointsModel.list_all(
        kind=request.args.get("tipo"),
        neighborhood=request.args.get("bairro"),
    )
    return jsonify({
        "sucesso": True,
        "total": len(points),
        "dados": points,
        "aviso": "Pontos demonstrativos; confirme existência, acesso e funcionamento antes de se deslocar.",
    })
