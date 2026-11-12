"""Rotas HTTP e coordenação entre o modelo de relatos e as views."""

from flask import Blueprint, jsonify, request

from models.report_model import ReportModel
from models.adoption_model import AdoptionModel
from views.report_view import render_home


reports_blueprint = Blueprint("reports", __name__)


@reports_blueprint.get("/")
def home():
    return render_home()


@reports_blueprint.get("/api/summary")
def report_summary():
    return jsonify(ReportModel.summary())


@reports_blueprint.get("/api/adoptions")
def adoptions():
    return jsonify({"adoptions": AdoptionModel.all()})


@reports_blueprint.post("/api/adoptions")
def create_adoption():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"error": "Envie os dados da proposta em formato JSON."}), 400
    try:
        AdoptionModel.create(payload)
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    return jsonify({"ok": True, "status": "Proposta recebida"}), 201


@reports_blueprint.post("/api/reports")
def create_report():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"error": "Envie os dados do relato em formato JSON."}), 400
    try:
        ReportModel.create(payload)
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    return jsonify({"ok": True}), 201
