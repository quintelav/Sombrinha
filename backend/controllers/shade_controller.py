"""Endpoints for map reference points that still need validation."""

from flask import Blueprint, jsonify, request

from models.shade_points_model import ShadePointsModel


shade_blueprint = Blueprint("shade_points", __name__)


@shade_blueprint.get("/api/reference-points")
def list_reference_points():
    points = ShadePointsModel.list_all(
        kind=request.args.get("tipo"),
        neighborhood=request.args.get("bairro"),
        region=request.args.get("regiao"),
        city=request.args.get("cidade"),
    )
    return jsonify({
        "sucesso": True,
        "total": len(points),
        "dados": points,
        "aviso": "Pontos de sombra e refúgios arbóreos por todo o Recife e Região Metropolitana.",
    })
