"""Health endpoint for deployment monitoring."""

from flask import Blueprint, jsonify


health_blueprint = Blueprint("health", __name__)


@health_blueprint.get("/api/health")
def health_check():
    return jsonify({"status": "online", "service": "Sombrinha"})
